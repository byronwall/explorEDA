import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph } from "@/lib/schema/schemaGraph";
import { compactViews } from "@/lib/schema/schemaCompact";
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
