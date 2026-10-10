import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type LegendElement,
  type StripMark,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import { valueColorSigned, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two states, three elections. Ada leans one way, Bo the other, and Bo's
// 1984 margin is the largest magnitude.
const rows: Record<string, datum>[] = [
  { State: "Ada", Year: 1976, Margin: 10 },
  { State: "Ada", Year: 1980, Margin: 5 },
  { State: "Ada", Year: 1984, Margin: -2 },
  { State: "Bo", Year: 1976, Margin: -8 },
  { State: "Bo", Year: 1980, Margin: -12 },
  { State: "Bo", Year: 1984, Margin: -20 },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const margin: ValueScale = {
  id: "value-1",
  kind: "value",
  name: "Margin",
  domain: "shared",
  transform: "linear",
  colors: ["#ff0000", "#0000ff"],
  center: "#eeeeee",
};
const cells: StripMark = {
  type: "strip",
  id: "mark-1",
  name: "Cells",
  shape: "rect",
  positionScaleId: "x-1",
  valueScaleId: "value-1",
  aggregation: "average",
  measureField: "Margin",
  encoding: "color",
  fill: "#000",
  inset: 1,
};
function strips(legend?: Partial<LegendElement>): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "States",
    x: 0,
    y: 40,
    frame: { width: 300, height: 10 },
    label: { show: true, width: 60, fontSize: 10 },
    axis: false,
    marks: [cells],
    repeat: {
      field: "State",
      arrangement: "rows",
      columns: 1,
      gap: 2,
      order: "label",
      limit: 60,
    },
  };
  const key: LegendElement = {
    id: "legend-1",
    kind: "legend",
    name: "Key",
    x: 0,
    y: 16,
    unitId: "unit-1",
    markId: "mark-1",
    scaleId: "value-1",
    direction: "row",
    fontSize: 10,
    color: "#000",
    ...legend,
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "x-1",
        kind: "position",
        name: "Year",
        field: "Year",
        domain: "shared",
      },
      margin,
    ],
    elements: [unit, key],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());

describe("signed strips", () => {
  it("colors cells by sign through a diverging scale, scaled to the largest magnitude", () => {
    const definition = strips();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = scene(definition).nodes.filter(
      (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
    );
    const fill = (state: string, year: string) =>
      drawn.find(
        (node) => node.instanceKey === state && node.glyph!.bin.key === year
      )!.fill;
    // Bo's −20 takes the full low color; Ada's +10 sits halfway toward the high color.
    expect(fill("Bo", "1984")).toBe("rgb(255, 0, 0)");
    expect(fill("Ada", "1976")).toBe(valueColorSigned(margin, 10, 20));
    expect(fill("Ada", "1976")).not.toBe(fill("Ada", "1984"));
    // A small negative margin is close to the center color, not the low end.
    expect(fill("Ada", "1984")).toBe(valueColorSigned(margin, -2, 20));
  });

  it("keeps magnitude mapping for one-way scales", () => {
    const definition = strips();
    const oneWay = {
      ...definition,
      scales: [definition.scales[0]!, { ...margin, center: undefined }],
    };
    const drawn = scene(oneWay).nodes.filter(
      (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
    );
    // Without a center, |−20| maps to the top of the ramp.
    const bo = drawn.find(
      (node) => node.instanceKey === "Bo" && node.glyph!.bin.key === "1984"
    )!;
    expect(bo.fill).toBe("rgb(0, 0, 255)");
  });
});

describe("ramp legends", () => {
  it("draws a diverging ramp from minus the largest magnitude to plus, labeled at zero", () => {
    const resolved = scene(strips());
    const swatches = resolved.nodes.filter(
      (node): node is RectNode =>
        node.type === "rect" && node.elementId === "legend-1"
    );
    expect(swatches).toHaveLength(9);
    expect(swatches[0]!.fill).toBe("rgb(255, 0, 0)");
    expect(swatches[4]!.fill).toBe("rgb(238, 238, 238)");
    expect(swatches[8]!.fill).toBe("rgb(0, 0, 255)");
    const labels = resolved.nodes
      .filter((node) => node.type === "text" && node.elementId === "legend-1")
      .map((node) => (node.type === "text" ? node.lines[0]!.text : ""));
    expect(labels).toEqual(["Margin", "−20", "+20", "0"]);
    const element = resolved.elements.find((item) => item.id === "legend-1")!;
    expect(element.bounds.height).toBeGreaterThan(20);
  });

  it("draws a one-way ramp from the lowest drawn value to the highest", () => {
    const definition = strips();
    const oneWay = {
      ...definition,
      scales: [definition.scales[0]!, { ...margin, center: undefined }],
    };
    const resolved = scene(oneWay);
    const swatches = resolved.nodes.filter(
      (node): node is RectNode =>
        node.type === "rect" && node.elementId === "legend-1"
    );
    expect(swatches).toHaveLength(7);
    const labels = resolved.nodes
      .filter((node) => node.type === "text" && node.elementId === "legend-1")
      .map((node) => (node.type === "text" ? node.lines[0]!.text : ""));
    expect(labels).toEqual(["Margin", "-20", "20"]);
  });
});
