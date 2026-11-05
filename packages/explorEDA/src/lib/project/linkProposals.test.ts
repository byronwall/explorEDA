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
});
