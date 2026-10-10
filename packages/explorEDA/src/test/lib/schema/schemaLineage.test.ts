import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import {
  HEADER_ROW,
  projectSchemaGraph,
  tableSchemaGraph,
} from "@/lib/schema/schemaGraph";
import { settingsFieldUsage } from "@/components/project/settingsCompatibility";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

/** Saved settings with one bar chart and Rows columns. */
function settings(
  overrides: Partial<SavedDataStructure> = {}
): SavedDataStructure {
  return {
    charts: [
      {
        id: "bar",
        type: "bar",
        title: "Amount by customer",
        field: "customer.name",
        filters: [{ field: "orders.amount" }],
      },
    ] as unknown as SavedDataStructure["charts"],
    calculations: [],
    gridSettings: {} as SavedDataStructure["gridSettings"],
    metadata: {} as SavedDataStructure["metadata"],
    colorScales: [],
    rowsSettings: {
      columns: [{ field: "orders.orderId" }],
      filters: [],
    } as unknown as SavedDataStructure["rowsSettings"],
    ...overrides,
  };
}

describe("settingsFieldUsage", () => {
  it("names each place a field is read", () => {
    const usage = settingsFieldUsage(
      settings({
        calculations: [
          { resultColumnName: "double", expression: '["orders.amount"] * 2' },
          { resultColumnName: "broken", expression: "((" },
        ],
      })
    );
    expect(usage.uses).toEqual(
      expect.arrayContaining([
        {
          field: "customer.name",
          place: {
            kind: "chart",
            chartId: "bar",
            title: "Amount by customer",
            role: "field",
          },
        },
        {
          field: "orders.amount",
          place: {
            kind: "chart",
            chartId: "bar",
            title: "Amount by customer",
            role: "filter",
          },
        },
        { field: "orders.orderId", place: { kind: "rows", role: "column" } },
        {
          field: "orders.amount",
          place: { kind: "calculation", name: "double" },
        },
      ])
    );
    expect(
      usage.calculations.find((item) => item.name === "broken")?.error
    ).toBeTruthy();
  });
});

describe("project lineage", () => {
  const { project, sources } = createShopFixture();

  it("traces a looked-up field in a view back to its table", () => {
    const graph = projectSchemaGraph(project, sources, [
      {
        id: "v",
        name: "By customer",
        queryId: "orders-by-customer",
        settings: settings(),
      },
    ]);
    const view = graph.nodes.find((node) => node.id === "view:v")!;
    const name = view.rows.find((row) => row.field === "customer.name")!;
    expect(name.label).toBe("Customers Name");
    const usage = graph.edges.find(
      (edge) => edge.kind === "usage" && edge.to.rowId === name.id
    )!;
    expect(usage.from).toEqual({
      nodeId: "table:customers",
      rowId: "field:name",
    });
  });

  it("draws a query's steps and lines from the tables they read", () => {
    const graph = projectSchemaGraph(project, sources);
    const query = graph.nodes.find(
      (node) => node.id === "query:orders-by-customer"
    )!;
    expect(query.rows.map((row) => row.step)).toEqual(["source", "lookup"]);
    const lineage = graph.edges.filter(
      (edge) => edge.kind === "lineage" && edge.to.nodeId === query.id
    );
    expect(lineage.map((edge) => edge.from)).toEqual([
      { nodeId: "table:orders", rowId: HEADER_ROW },
      { nodeId: "table:customers", rowId: HEADER_ROW },
    ]);
  });

  it("feeds a calculated step from the fields it reads", () => {
    const graph = projectSchemaGraph(project, sources);
    const query = graph.nodes.find(
      (node) => node.id === "query:product-revenue"
    )!;
    const calc = query.rows.find((row) => row.mark === "ƒ")!;
    expect(calc.label).toBe("Net revenue");
    expect(
      graph.edges.find(
        (edge) => edge.to.nodeId === query.id && edge.to.rowId === calc.id
      )?.from
    ).toEqual({ nodeId: "table:items", rowId: "field:revenue" });
    expect(query.rows.some((row) => row.mark === "Σ")).toBe(true);
  });

  it("marks a broken calculation without guessing its inputs", () => {
    const broken = structuredClone(project);
    const step = broken.queries
      .find((query) => query.id === "product-revenue")!
      .steps.find((item) => item.kind === "calculate")!;
    if (step.kind === "calculate") step.expression = "((";
    const graph = projectSchemaGraph(broken, sources);
    const query = graph.nodes.find(
      (node) => node.id === "query:product-revenue"
    )!;
    const calc = query.rows.find((row) => row.mark === "ƒ")!;
    expect(calc.status).toBe("error");
    expect(graph.edges.some((edge) => edge.to.rowId === calc.id)).toBe(false);
  });

  it("marks a view field its query does not have", () => {
    const graph = projectSchemaGraph(project, sources, [
      {
        id: "v",
        name: "Stale",
        queryId: "orders-by-customer",
        settings: settings({
          rowsSettings: {
            columns: [{ field: "gone" }],
            filters: [],
          } as unknown as SavedDataStructure["rowsSettings"],
        }),
      },
    ]);
    const view = graph.nodes.find((node) => node.id === "view:v")!;
    expect(view.rows.find((row) => row.field === "gone")?.status).toBe(
      "missing"
    );
  });
});

describe("single-table usage", () => {
  it("adds a card for the workspace's charts, fed by the table's rows", () => {
    const graph = tableSchemaGraph({
      title: "Data",
      fields: [
        { name: "customer.name", label: "Name" },
        { name: "orders.amount", label: "Amount" },
      ],
      calculations: [],
      settings: settings(),
    });
    const view = graph.nodes.find((node) => node.kind === "view")!;
    expect(view.title).toBe("This workspace");
    expect(
      graph.edges
        .filter((edge) => edge.kind === "usage")
        .map((edge) => edge.from.rowId)
    ).toEqual(
      expect.arrayContaining(["field:customer.name", "field:orders.amount"])
    );
  });
});
