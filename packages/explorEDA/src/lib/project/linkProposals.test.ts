import { describe, expect, it } from "vitest";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import { proposeLinks } from "./linkProposals";

/** A project of tables, each with the fields its first row has. */
function setup(tables: Record<string, AnalysisSourceRow[]>) {
  const project: AnalysisProject = {
    sources: Object.entries(tables).map(([id, rows]) => ({
      id,
      name: id,
      glyph: "",
      entityKey: "",
      fields: Object.keys(rows[0]!).map((field) => ({
        id: field,
        name: field,
      })),
    })),
    relationships: [],
    queries: [],
  } as unknown as AnalysisProject;
  const databases = Object.fromEntries(
    Object.keys(tables).map((id) => [id, { connection: "db", table: id }])
  );
  return { project, tables, databases };
}

const range = (count: number) => Array.from({ length: count }, (_, i) => i);

/** File sources, each keyed on its first field, and their links. */
function fileLinks(tables: Record<string, AnalysisSourceRow[]>) {
  const { project } = setup(tables);
  for (const source of project.sources) {
    source.entityKey = source.fields[0]!.id;
  }
  return proposeLinks({ project, tables }).map(
    (link) =>
      `${link.from.sourceId}.${link.from.fieldId} -> ${link.to.sourceId}.${link.to.fieldId} ${link.matched}/${link.total}`
  );
}

describe("proposeLinks", () => {
  it("matches warehouse key names whose values overlap", () => {
    const input = setup({
      store_sales: range(40).map((i) => ({
        ss_item_sk: i % 10,
        ss_store_sk: i % 3,
        ss_sold_date_sk: 100 + (i % 5),
        // Half of these find a promotion: too few for a link.
        ss_promo_sk: i % 2 ? i : 1000 + i,
        ss_quantity: i,
      })),
      item: range(10).map((i) => ({ i_item_sk: i, i_category: `c${i % 2}` })),
      store: range(3).map((i) => ({ s_store_sk: i, s_state: "TN" })),
      date_dim: range(5).map((i) => ({ d_date_sk: 100 + i, d_year: 2001 })),
      promotion: range(40).map((i) => ({ p_promo_sk: i })),
    });
    const links = proposeLinks(input).map((link) => [
      `${link.from.sourceId}.${link.from.fieldId}`,
      `${link.to.sourceId}.${link.to.fieldId}`,
      link.cardinality,
      link.reason,
      `${link.matched}/${link.total}`,
    ]);
    expect(links).toEqual([
      [
        "store_sales.ss_item_sk",
        "item.i_item_sk",
        "many-to-one",
        "name",
        "40/40",
      ],
      [
        "store_sales.ss_store_sk",
        "store.s_store_sk",
        "many-to-one",
        "name",
        "40/40",
      ],
      [
        "store_sales.ss_sold_date_sk",
        "date_dim.d_date_sk",
        "many-to-one",
        "name",
        "40/40",
      ],
    ]);
  });

  it("links a field named for another table to that table's id", () => {
    const input = setup({
      orders: [
        { id: 1, customerId: 7 },
        { id: 2, customerId: 8 },
      ],
      customers: [
        { id: 7, name: "Ada" },
        { id: 8, name: "Lin" },
      ],
    });
    expect(proposeLinks(input)).toMatchObject([
      {
        from: { sourceId: "orders", fieldId: "customerId" },
        to: { sourceId: "customers", fieldId: "id" },
      },
    ]);
  });

  it("needs a nearly unique key on the other side", () => {
    const input = setup({
      plays: range(20).map((i) => ({ game_id: i % 4 })),
      // Two rows per game: no row of games is one game.
      games: range(8).map((i) => ({ game_id: i % 4, week: i })),
    });
    expect(proposeLinks(input)).toEqual([]);
  });

  it("takes declared foreign keys whatever their names", () => {
    const input = setup({
      orders: [
        { id: 1, buyer: 7 },
        { id: 2, buyer: 9 },
      ],
      people: [{ id: 7 }, { id: 8 }],
    });
    expect(
      proposeLinks({
        ...input,
        foreignKeys: {
          db: [
            {
              table: "orders",
              column: "buyer",
              refTable: "people",
              refColumn: "id",
            },
          ],
        },
      })
    ).toMatchObject([
      {
        from: { sourceId: "orders", fieldId: "buyer" },
        to: { sourceId: "people", fieldId: "id" },
        reason: "foreign-key",
        matched: 1,
        total: 2,
      },
    ]);
  });

  it("skips links that exist and tables from other connections", () => {
    const input = setup({
      sales: [{ item_id: 1 }, { item_id: 2 }],
      items: [{ item_id: 1 }, { item_id: 2 }],
    });
    expect(
      proposeLinks({
        ...input,
        databases: {
          sales: { connection: "a", table: "sales" },
          items: { connection: "b", table: "items" },
        },
      })
    ).toEqual([]);
    input.project.relationships.push({
      id: "r",
      name: "r",
      from: { sourceId: "items", fieldId: "item_id" },
      to: { sourceId: "sales", fieldId: "item_id" },
      cardinality: "one-to-one",
    });
    expect(proposeLinks(input)).toEqual([]);
  });

  it("links file sources by key name, skipping links through a parent", () => {
    // CI exports: a job copies its run's key, a step copies both, and a
    // sample of runs holds every run a job names.
    expect(
      fileLinks({
        runs: range(30).map((i) => ({ run_id: `r${i}`, repo: "a" })),
        jobs: range(60).map((i) => ({ job_id: `j${i}`, run_id: `r${i % 10}` })),
        steps: range(120).map((i) => ({
          step_id: `s${i}`,
          job_id: `j${i % 60}`,
          run_id: `r${i % 10}`,
        })),
        sample: range(10).map((i) => ({ run_id: `r${i}`, wall_s: i })),
      })
    ).toEqual([
      "jobs.run_id -> runs.run_id 60/60",
      "steps.job_id -> jobs.job_id 120/120",
      "sample.run_id -> runs.run_id 10/10",
    ]);
  });

  it("keeps a direct link whose values differ from the parent's", () => {
    // A shipment's customer is the recipient, not the order's buyer.
    expect(
      fileLinks({
        customers: range(10).map((i) => ({ customer_id: `c${i}` })),
        orders: range(20).map((i) => ({
          order_id: `o${i}`,
          shipment_id: `s${i}`,
          customer_id: `c${i % 10}`,
        })),
        shipments: range(20).map((i) => ({
          shipment_id: `s${i}`,
          customer_id: `c${(i + 3) % 10}`,
        })),
      })
    ).toEqual([
      "orders.shipment_id -> shipments.shipment_id 20/20",
      "orders.customer_id -> customers.customer_id 20/20",
      "shipments.customer_id -> customers.customer_id 20/20",
    ]);
  });

  it("skips row numbers two files share, and fields project text can't name", () => {
    expect(
      fileLinks({
        builds: range(3).map((i) => ({ event_id: i + 1, ok: true })),
        emails: range(3).map((i) => ({ mail_id: i, event_id: i + 1 })),
        jobs: [{ "job id": "j1", "run id": "r1" }],
        runs: [{ "run id": "r1" }],
      })
    ).toEqual([]);
    // Unless a file's name says what the numbers count.
    expect(
      fileLinks({
        events: range(3).map((i) => ({ event_id: i + 1 })),
        emails: range(3).map((i) => ({ mail_id: i, event_id: i + 1 })),
      })
    ).toEqual(["emails.event_id -> events.event_id 3/3"]);
  });

  it("keeps a direct link that reaches rows the parent path misses", () => {
    expect(
      fileLinks({
        runs: range(10).map((i) => ({ run_id: `r${i}` })),
        jobs: range(10).map((i) => ({ job_id: `j${i}`, run_id: `r${i}` })),
        // The last step lost its job but still names its run.
        steps: range(10).map((i) => ({
          step_id: `s${i}`,
          job_id: i < 9 ? `j${i}` : "",
          run_id: `r${i}`,
        })),
      })
    ).toEqual([
      "jobs.run_id -> runs.run_id 10/10",
      "steps.job_id -> jobs.job_id 9/9",
      "steps.run_id -> runs.run_id 10/10",
    ]);
  });

  it("links dotted field names", () => {
    expect(
      fileLinks({
        runs: range(5).map((i) => ({ "ci.run_id": `r${i}` })),
        jobs: range(5).map((i) => ({ job_id: `j${i}`, "ci.run_id": `r${i}` })),
      })
    ).toEqual(["jobs.ci.run_id -> runs.ci.run_id 5/5"]);
  });

  it("counts a value that names two rows as unmatched", () => {
    const runs = range(100).map((i) => ({ run_id: `r${i}` }));
    runs.push({ run_id: "r0" });
    expect(
      fileLinks({
        runs,
        jobs: range(20).map((i) => ({
          job_id: `j${i}`,
          run_id: i < 2 ? "r0" : `r${i}`,
        })),
      })
    ).toEqual(["jobs.run_id -> runs.run_id 18/20"]);
  });
});
