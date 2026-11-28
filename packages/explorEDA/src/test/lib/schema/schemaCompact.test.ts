import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph, tableSchemaGraph } from "@/lib/schema/schemaGraph";
import {
  compactViews,
  condenseProject,
  UNUSED_LIST,
} from "@/lib/schema/schemaCompact";
import { sourceUsage } from "@/lib/schema/sourceUsage";
import { traceField } from "@/lib/schema/schemaTrace";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

const { project, sources } = createShopFixture();
const settings = {
  charts: [
    {
      id: "bar",
      type: "bar",
      title: "By customer",
      field: "customer.name",
      filters: [{ field: "orders.amount" }],
    },
  ],
  calculations: [],
} as unknown as SavedDataStructure;
const graph = projectSchemaGraph(project, sources, [
  {
    id: "now",
    name: "Now",
    queryId: "orders-by-customer",
    settings,
    current: true,
  },
  { id: "other", name: "Other", queryId: "orders-by-customer", settings },
]);

describe("compactViews", () => {
  it("folds other views to one row per chart and keeps the current one", () => {
    const compact = compactViews(graph, new Set());
    const other = compact.nodes.find((node) => node.id === "view:other")!;
    expect(other.folded).toBe(true);
    expect(other.rows).toEqual([
      expect.objectContaining({ label: "By customer", detail: "2 fields" }),
    ]);
    const now = compact.nodes.find((node) => node.id === "view:now")!;
    expect(now.folded).toBeUndefined();
    expect(now.rows.length).toBeGreaterThan(1);
  });

  it("keeps lineage into a folded view", () => {
    const compact = compactViews(graph, new Set());
    const trace = traceField(compact, {
      nodeId: "table:customers",
      rowId: "field:name",
    });
    expect(trace.downstream).toContainEqual({
      nodeId: "view:other",
      rowId: "chart:bar:heading",
    });
  });

  it("unfolds a view the user opens", () => {
    const compact = compactViews(graph, new Set(["view:other"]));
    expect(
      compact.nodes.find((node) => node.id === "view:other")!.folded
    ).toBeUndefined();
  });
});

describe("condenseProject", () => {
  // A CI-shaped project: one more query that only reads a table, as agents
  // write them, and one view on the orders-and-customers query.
  const withRead = {
    ...project,
    queries: [
      ...project.queries,
      {
        id: "products-read",
        name: "products",
        glyph: "◆",
        frameLabel: "products",
        steps: [{ id: "read", kind: "source" as const, sourceId: "products" }],
        outputStepId: "read",
      },
    ],
  };
  const views = [
    { id: "now", name: "Now", queryId: "orders-by-customer", settings },
  ];
  const condensed = (open: Set<string> = new Set(), list = views) =>
    condenseProject(
      compactViews(projectSchemaGraph(withRead, sources, list), new Set(), {
        foldCurrent: true,
      }),
      open
    );

  it("folds tables no view reads into one list and drops read-only queries", () => {
    const graph = condensed();
    const ids = graph.nodes.map((node) => node.id);
    expect(ids).toContain("table:orders");
    expect(ids).toContain("table:customers");
    expect(ids).not.toContain("table:items");
    expect(ids).not.toContain("query:products-read");
    // A query with a lookup keeps its card.
    expect(ids).toContain("query:orders-by-customer");
    const list = graph.nodes.find((node) => node.id === UNUSED_LIST)!;
    expect(list.rows.map((row) => row.id)).toEqual([
      "table:items",
      "table:products",
    ]);
  });

  it("marks the fields a view reads and names its readers", () => {
    const graph = condensed();
    const customers = graph.nodes.find(
      (node) => node.id === "table:customers"
    )!;
    expect(customers.readers).toEqual(["Now"]);
    expect(customers.rows.find((row) => row.id === "field:name")!.used).toBe(
      true
    );
    expect(
      customers.rows.find((row) => row.id === "field:joinedAt")!.used
    ).toBeUndefined();
    expect(graph.edges).toContainEqual(
      expect.objectContaining({
        kind: "reads",
        from: { nodeId: "table:customers", rowId: "header" },
        to: { nodeId: "view:now", rowId: "header" },
      })
    );
  });

  it("agrees with sourceUsage on who reads each table", () => {
    const graph = condensed();
    const usage = sourceUsage(withRead, sources, views);
    for (const node of graph.nodes.filter((item) => item.kind === "table")) {
      expect(usage.get(node.sourceId!)?.length ?? 0).toBe(
        node.readers?.length ?? 0
      );
    }
  });

  it("draws an opened table as its own card and moves its lines to the list", () => {
    const open = condensed(new Set(["table:items"]));
    expect(open.nodes.find((node) => node.id === "table:items")!.unused).toBe(
      true
    );
    const folded = condensed();
    // The orders–items relationship now lands on items' row in the list.
    expect(
      folded.edges.some(
        (edge) =>
          edge.kind === "relationship" &&
          edge.to.nodeId === UNUSED_LIST &&
          edge.to.rowId === "table:items"
      ) ||
        folded.edges.some(
          (edge) =>
            edge.kind === "relationship" &&
            edge.from.nodeId === UNUSED_LIST &&
            edge.from.rowId === "table:items"
        )
    ).toBe(true);
  });

  it("folds nothing when there are no views", () => {
    const graph = condensed(new Set(), []);
    expect(graph.nodes.some((node) => node.id === UNUSED_LIST)).toBe(false);
    expect(graph.nodes.some((node) => node.id === "table:items")).toBe(true);
  });
});

describe("condenseProject edge cases", () => {
  it("never folds the only table of a workspace", () => {
    const graph = tableSchemaGraph({
      title: "Data",
      fields: [{ name: "amount", label: "Amount" }],
      calculations: [],
      settings: {
        charts: [
          { id: "c", type: "bar", title: "C", field: "amount", filters: [] },
        ],
        calculations: [],
      } as unknown as SavedDataStructure,
    });
    const drawn = condenseProject(graph, new Set());
    expect(drawn.nodes.some((node) => node.id === UNUSED_LIST)).toBe(false);
  });

  it("marks an appended table's fields used when a view reads the field they fill", () => {
    const appended = {
      ...project,
      queries: [
        {
          id: "all-amounts",
          name: "All amounts",
          glyph: "◆",
          frameLabel: "All amounts",
          steps: [
            { id: "s", kind: "source" as const, sourceId: "orders" },
            {
              id: "a",
              kind: "append" as const,
              inputStepId: "s",
              sourceId: "items",
              field: "source",
              match: { amount: "revenue" },
            },
          ],
          outputStepId: "a",
        },
      ],
    };
    const chart = {
      charts: [
        {
          id: "c",
          type: "bar",
          title: "C",
          field: "orders.amount",
          filters: [],
        },
      ],
      calculations: [],
    } as unknown as SavedDataStructure;
    const drawn = condenseProject(
      projectSchemaGraph(appended, sources, [
        { id: "v", name: "V", queryId: "all-amounts", settings: chart },
      ]),
      new Set()
    );
    const items = drawn.nodes.find((node) => node.id === "table:items")!;
    expect(items.rows.find((row) => row.id === "field:revenue")!.used).toBe(
      true
    );
  });

  it("keeps each folded view's line when two views share a chart id", () => {
    const compact = compactViews(graph, new Set(), { foldCurrent: true });
    const into = (viewId: string) =>
      compact.edges.some(
        (edge) =>
          edge.kind === "usage" &&
          edge.to.nodeId === viewId &&
          edge.from.rowId === "field:name"
      );
    expect(into("view:now")).toBe(true);
    expect(into("view:other")).toBe(true);
  });
});

describe("append provenance", () => {
  it("marks an appended field used when a view reads it through a calculation", () => {
    const appended = {
      ...project,
      queries: [
        {
          id: "doubled",
          name: "Doubled",
          glyph: "◆",
          frameLabel: "Doubled",
          steps: [
            { id: "s", kind: "source" as const, sourceId: "orders" },
            {
              id: "a",
              kind: "append" as const,
              inputStepId: "s",
              sourceId: "items",
              field: "source",
              match: { amount: "revenue" },
            },
            {
              id: "c",
              kind: "calculate" as const,
              inputStepId: "a",
              fieldId: "double",
              label: "Double",
              expression: '["orders.amount"] * 2',
            },
          ],
          outputStepId: "c",
        },
      ],
    };
    const chart = {
      charts: [
        { id: "c", type: "bar", title: "C", field: "double", filters: [] },
      ],
      calculations: [],
    } as unknown as SavedDataStructure;
    const drawn = condenseProject(
      projectSchemaGraph(appended, sources, [
        { id: "v", name: "V", queryId: "doubled", settings: chart },
      ]),
      new Set()
    );
    const items = drawn.nodes.find((node) => node.id === "table:items")!;
    expect(items.rows.find((row) => row.id === "field:revenue")!.used).toBe(
      true
    );
  });
});
