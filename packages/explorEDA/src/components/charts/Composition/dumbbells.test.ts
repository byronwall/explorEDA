import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { evaluateCalc } from "./calculations";
import {
  createEmptyComposition,
  createLegendElement,
  STACK_COLORS,
  type CompositionDefinition,
  type PathMark,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type PathNode,
  type RectNode,
} from "./resolveComposition";
import { markCategories, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two topics, two parties, one share each.
const rows: Record<string, datum>[] = [
  { Topic: "Pets", Order: 2, Party: "Dem", Share: 5 },
  { Topic: "Pets", Order: 2, Party: "Rep", Share: 2 },
  { Topic: "Faith", Order: 1, Party: "Dem", Share: 8 },
  { Topic: "Faith", Order: 1, Party: "Rep", Share: 22 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const connector: PathMark = {
  type: "path",
  id: "mark-1",
  name: "Gap",
  xScaleId: "n-1",
  orderField: "Party",
  stroke: "#bbbbbb",
  strokeWidth: 3,
};
const dots: PointMark = {
  type: "point",
  id: "mark-2",
  name: "Parties",
  xScaleId: "n-1",
  orderField: "Party",
  radius: 6,
  fill: "#000000",
  labelField: "Share",
  labelEvery: 1,
  colorField: "Party",
  colors: ["#436685", "#bf2f24"],
};
function dumbbells(): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Topics",
    x: 0,
    y: 0,
    frame: { width: 300, height: 24 },
    label: { show: true, width: 160, fontSize: 12, valueCalcId: "calc-1" },
    axis: false,
    marks: [connector, dots],
    repeat: {
      field: "Topic",
      arrangement: "rows",
      columns: 1,
      gap: 8,
      order: "value",
      orderCalcId: "calc-2",
      limit: 10,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Share",
        field: "Share",
        domain: "shared",
        zero: true,
        nice: false,
      },
    ],
    calculations: [
      {
        id: "calc-1",
        name: "Gap",
        aggregation: "difference",
        field: "Share",
        orderField: "Party",
        population: "repeat",
        filters: "follow",
      },
      {
        id: "calc-2",
        name: "Order",
        aggregation: "max",
        field: "Order",
        population: "repeat",
        filters: "ignore",
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());

describe("dot rows", () => {
  it("places points and the connector on the frame's middle line without a y scale", () => {
    const definition = dumbbells();
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const faith = resolved.elements[0]!.instances!.find(
      (item) => item.key === "Faith"
    )!;
    const middle = faith.frame.y + faith.frame.height / 2;
    const points = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" &&
        node.instanceKey === "Faith" &&
        Boolean(node.glyph)
    );
    expect(points).toHaveLength(2);
    for (const point of points) expect(point.cy).toBeCloseTo(middle);
    const path = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" && node.instanceKey === "Faith"
    )!;
    expect(path.segments[0]!.map((vertex) => vertex.y)).toEqual([
      middle,
      middle,
    ]);
    // Dem (8) sits left of Rep (22) on the shared 0–22 share scale.
    expect(points[0]!.cx).toBeLessThan(points[1]!.cx);
    expect(points[1]!.cx).toBeCloseTo(faith.frame.x + faith.frame.width);
    // The glyph's value is the x share, so hover and anchors read it.
    expect(points.map((point) => point.glyph!.value)).toEqual([8, 22]);
  });

  it("colors points by a category field in label order and lists the categories for a legend", () => {
    const resolved = scene(dumbbells());
    const points = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && Boolean(node.glyph?.point?.category)
    );
    const byParty = new Map(
      points.map((node) => [node.glyph!.point!.category, node.fill])
    );
    expect(byParty.get("Dem")).toBe("#436685");
    expect(byParty.get("Rep")).toBe("#bf2f24");
    expect(markCategories(dots, data())).toEqual([
      { key: "Dem", color: "#436685" },
      { key: "Rep", color: "#bf2f24" },
    ]);
    // Without a palette the shared categorical colors apply.
    expect(
      markCategories({ ...dots, colors: undefined }, data())[1]!.color
    ).toBe(STACK_COLORS[1]);
  });

  it("computes the signed difference from the first party to the last, shown beside the row", () => {
    const definition = dumbbells();
    const calc = definition.calculations[0]!;
    const faith = { key: "Faith", allIds: [2, 3], liveIds: [2, 3] };
    expect(evaluateCalc(calc, data(), faith)).toMatchObject({
      value: 14,
      text: "+14",
    });
    const pets = { key: "Pets", allIds: [0, 1], liveIds: [0, 1] };
    expect(evaluateCalc(calc, data(), pets).text).toBe("-3");
    const values = scene(definition).nodes.filter(
      (node) => node.type === "text" && node.key.endsWith(":value")
    );
    // Rows order by the prepared editorial order: Faith first.
    expect(
      values.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["+14", "-3"]);
  });

  it("draws a legend with one swatch and label per category of the chosen mark", () => {
    const base = dumbbells();
    const unit = base.elements[0] as UnitElement;
    const legend = createLegendElement(base, unit);
    expect(legend.markId).toBe("mark-2");
    const definition = { ...base, elements: [unit, legend] };
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const swatches = resolved.nodes.filter(
      (node): node is RectNode =>
        node.type === "rect" && node.elementId === legend.id
    );
    expect(swatches.map((node) => node.fill)).toEqual(["#436685", "#bf2f24"]);
    const labels = resolved.nodes.filter(
      (node) => node.type === "text" && node.elementId === legend.id
    );
    expect(
      labels.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["Dem", "Rep"]);
    // A row legend lays entries left to right.
    expect(swatches[1]!.x).toBeGreaterThan(swatches[0]!.x);
    expect(swatches[1]!.y).toBe(swatches[0]!.y);
    const element = resolved.elements.find((item) => item.id === legend.id)!;
    expect(element.bounds.width).toBeGreaterThan(
      swatches[1]!.x - swatches[0]!.x
    );
  });
});
