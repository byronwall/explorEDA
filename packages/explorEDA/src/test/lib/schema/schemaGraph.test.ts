import { describe, expect, it } from "vitest";
import { createShopFixture } from "@/test/fixtures/shopProject";
import { projectSchemaGraph, tableSchemaGraph } from "@/lib/schema/schemaGraph";
import {
  fitScale,
  layoutSchemaGraph,
  routeSchemaEdge,
} from "@/lib/schema/schemaLayout";
import type { SchemaGraph } from "@/lib/schema/schemaGraph";

/** Unrelated tables of many fields, which one column per depth stacks. */
function manyTables(count: number): SchemaGraph {
  return {
    nodes: Array.from({ length: count }, (_, index) => ({
      id: `table:${index}`,
      kind: "table" as const,
      title: `Table ${index}`,
      rows: Array.from({ length: 8 }, (_, row) => ({
        id: `field:${row}`,
        label: `Field ${row}`,
      })),
    })),
    edges: [],
  };
}

describe("projectSchemaGraph", () => {
  it("draws each source as a table and each relationship field to field", () => {
    const { project, sources: tables } = createShopFixture();
    const graph = projectSchemaGraph(project, tables);

    expect(graph.nodes.map((node) => node.title)).toEqual([
      "Customers",
      "Orders",
      "Items",
      "Products",
    ]);
    const orders = graph.nodes.find((node) => node.id === "table:orders")!;
    expect(orders.detail).toBe("5 rows");
    expect(orders.rows.find((row) => row.key)?.field).toBe("orderId");
    expect(orders.rows.find((row) => row.field === "amount")?.dataType).toBe(
      "numeric"
    );

    const relationship = graph.edges.find(
      (edge) => edge.from.nodeId === "table:orders"
    )!;
    expect(relationship).toMatchObject({
      kind: "relationship",
      cardinality: "many-to-one",
      from: { nodeId: "table:orders", rowId: "field:customerId" },
      to: { nodeId: "table:customers", rowId: "field:customerId" },
    });
  });

  it("skips a relationship whose field no longer exists", () => {
    const { project } = createShopFixture();
    const graph = projectSchemaGraph({
      ...project,
      relationships: [
        {
          ...project.relationships[0]!,
          from: { sourceId: "orders", fieldId: "gone" },
        },
      ],
    });
    expect(graph.edges).toEqual([]);
  });

  it("reads an undeclared type from the rows", () => {
    const { project, sources: tables } = createShopFixture();
    const undeclared = project.sources.map((source) => ({
      ...source,
      fields: source.fields.map(({ type: _type, ...field }) => field),
    }));
    const graph = projectSchemaGraph(
      { ...project, sources: undeclared },
      tables
    );
    const items = graph.nodes.find((node) => node.id === "table:items")!;
    expect(items.rows.find((row) => row.field === "revenue")?.dataType).toBe(
      "numeric"
    );
  });
});

describe("tableSchemaGraph", () => {
  it("lists calculated fields last with lines from their inputs", () => {
    const graph = tableSchemaGraph({
      title: "Data",
      rowCount: 2,
      fields: [
        { name: "price", label: "Price", dataType: "numeric" },
        { name: "total", label: "Total", dataType: "numeric" },
        { name: "qty", label: "Quantity", dataType: "numeric" },
      ],
      calculations: [
        {
          name: "total",
          expression: "[price] * [qty]",
          dependencies: ["price", "qty", "missing"],
        },
      ],
    });
    const [table] = graph.nodes;
    expect(table!.rows.map((row) => row.label)).toEqual([
      "Price",
      "Quantity",
      "Total",
    ]);
    expect(table!.rows[2]!.calculation?.expression).toBe("[price] * [qty]");
    expect(graph.edges.map((edge) => edge.from.rowId)).toEqual([
      "field:price",
      "field:qty",
    ]);
  });
});

describe("layoutSchemaGraph", () => {
  it("puts detail tables left of the tables they look up", () => {
    const { project, sources: tables } = createShopFixture();
    const graph = projectSchemaGraph(project, tables);
    const { boxes } = layoutSchemaGraph(graph);

    expect(boxes["table:items"]!.x).toBeLessThan(boxes["table:orders"]!.x);
    expect(boxes["table:orders"]!.x).toBeLessThan(boxes["table:customers"]!.x);
    expect(boxes["table:products"]!.x).toBe(boxes["table:orders"]!.x);
  });

  it("is deterministic and never overlaps cards", () => {
    const { project, sources: tables } = createShopFixture();
    const graph = projectSchemaGraph(project, tables);
    const first = layoutSchemaGraph(graph);
    expect(layoutSchemaGraph(graph)).toEqual(first);

    const boxes = Object.values(first.boxes);
    for (const a of boxes) {
      for (const b of boxes) {
        if (a === b) continue;
        const apart =
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y;
        expect(apart).toBe(true);
      }
    }
    for (const box of boxes) {
      expect(box.x + box.width).toBeLessThanOrEqual(first.width);
      expect(box.y + box.height).toBeLessThanOrEqual(first.height);
    }
  });

  it("wraps cards into columns that match a wide viewport", () => {
    const graph = manyTables(6);
    const viewport = { width: 1400, height: 700 };
    const stacked = layoutSchemaGraph(graph);
    const fitted = layoutSchemaGraph(graph, viewport);

    expect(new Set(Object.values(stacked.boxes).map((box) => box.x)).size).toBe(
      1
    );
    expect(fitScale(fitted, viewport)).toBeGreaterThan(
      fitScale(stacked, viewport)
    );
    expect(fitScale(fitted, viewport)).toBe(1);
    // Cards still read top to bottom, then left to right.
    const order = Object.entries(fitted.boxes)
      .sort(([, a], [, b]) => a.x - b.x || a.y - b.y)
      .map(([id]) => id);
    expect(order).toEqual(graph.nodes.map((node) => node.id));
  });

  it("keeps one column per depth when it already fits", () => {
    const { project, sources: tables } = createShopFixture();
    const graph = projectSchemaGraph(project, tables);
    expect(layoutSchemaGraph(graph, { width: 1400, height: 900 })).toEqual(
      layoutSchemaGraph(graph)
    );
  });

  it("survives a relationship cycle", () => {
    const { project } = createShopFixture();
    const graph = projectSchemaGraph({
      ...project,
      relationships: [
        ...project.relationships,
        {
          id: "loop",
          name: "Loop",
          from: { sourceId: "customers", fieldId: "customerId" },
          to: { sourceId: "items", fieldId: "itemId" },
          cardinality: "many-to-one",
        },
      ],
    });
    expect(Object.keys(layoutSchemaGraph(graph).boxes)).toHaveLength(4);
  });

  it("routes lines between the rows they join", () => {
    const { project, sources: tables } = createShopFixture();
    const graph = projectSchemaGraph(project, tables);
    const layout = layoutSchemaGraph(graph);
    const edge = graph.edges.find(
      (item) => item.from.nodeId === "table:items"
    )!;
    const path = routeSchemaEdge(graph, layout, edge)!;
    const items = layout.boxes["table:items"]!;
    expect(path.start.x).toBe(items.x + items.width);
    expect(path.start.side).toBe(1);
    expect(path.end.side).toBe(-1);
  });
});
