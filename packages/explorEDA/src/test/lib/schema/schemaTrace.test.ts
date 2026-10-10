import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph } from "@/lib/schema/schemaGraph";
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
      filters: [],
    },
  ],
  calculations: [
    { resultColumnName: "shout", expression: 'upper(["customer.name"])' },
  ],
} as unknown as SavedDataStructure;
const graph = projectSchemaGraph(project, sources, [
  { id: "v", name: "By customer", queryId: "orders-by-customer", settings },
]);

describe("traceField", () => {
  it("follows a table field forward into the view and its calculations", () => {
    const trace = traceField(graph, {
      nodeId: "table:customers",
      rowId: "field:name",
    });
    const reached = trace.downstream.map((end) => `${end.nodeId} ${end.rowId}`);
    expect(reached).toContain("view:v use:chart:bar:customer.name");
    expect(reached).toContain("view:v calc:shout");
    expect(trace.upstream).toEqual([]);
  });

  it("follows a view's calculation back to the table field", () => {
    const trace = traceField(graph, { nodeId: "view:v", rowId: "calc:shout" });
    expect(trace.upstream).toContainEqual({
      nodeId: "table:customers",
      rowId: "field:name",
    });
  });

  it("follows a query calculation back through its inputs", () => {
    const query = graph.nodes.find(
      (node) => node.id === "query:product-revenue"
    )!;
    const summary = query.rows.find((row) => row.mark === "Σ")!;
    const trace = traceField(graph, { nodeId: query.id, rowId: summary.id });
    expect(trace.upstream).toContainEqual({
      nodeId: "table:items",
      rowId: "field:revenue",
    });
  });

  it("shows relationships on a key field without walking through them", () => {
    const trace = traceField(graph, {
      nodeId: "table:orders",
      rowId: "field:customerId",
    });
    expect([...trace.edges]).toContain("relationship:order-customer");
    expect(
      trace.downstream.some((end) => end.nodeId === "table:customers")
    ).toBe(false);
  });
});
