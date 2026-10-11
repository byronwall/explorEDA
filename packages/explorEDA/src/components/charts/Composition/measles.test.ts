import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type StripMark,
  type UnitElement,
  type ValueScale,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import { valueColor, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two states over three years. Ada reports every year; Bo did not report in
// 1929 (an explicit null) and has no record at all for 1930.
const rows: Record<string, datum>[] = [
  { State: "Ada", Year: 1928, Rate: 100, Order: 1 },
  { State: "Ada", Year: 1929, Rate: 10, Order: 1 },
  { State: "Ada", Year: 1930, Rate: 1000, Order: 1 },
  { State: "Bo", Year: 1928, Rate: 500, Order: 0 },
  { State: "Bo", Year: 1929, Rate: null, Order: 0 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});

const ramp: ValueScale = {
  id: "value-1",
  kind: "value",
  name: "Rate",
  domain: "shared",
  transform: "linear",
  colors: ["#000000", "#ff0000", "#00ff00"],
  stops: [0, 0.1, 1],
};
const squares: StripMark = {
  type: "strip",
  id: "mark-1",
  name: "Cells",
  shape: "rect",
  positionScaleId: "x-1",
  valueScaleId: "value-1",
  aggregation: "average",
  measureField: "Rate",
  encoding: "color",
  fill: "#000",
  inset: 1,
  missing: "#eeeeee",
};
function strips(patch: Partial<StripMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "States",
    x: 0,
    y: 0,
    frame: { width: 300, height: 10 },
    label: { show: true, width: 40, fontSize: 10 },
    axis: false,
    marks: [{ ...squares, ...patch }],
    repeat: {
      field: "State",
      arrangement: "rows",
      columns: 1,
      gap: 2,
      order: "value",
      orderCalcId: "calc-1",
      limit: 60,
    },
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
      ramp,
    ],
    calculations: [
      {
        id: "calc-1",
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
const cells = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data()).nodes.filter(
    (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
  );

describe("multistop value ramps", () => {
  it("maps shares through placed stops exactly", () => {
    expect(valueColor(ramp, 0)).toBe("rgb(0, 0, 0)");
    expect(valueColor(ramp, 0.1)).toBe("rgb(255, 0, 0)");
    expect(valueColor(ramp, 0.55)).toBe("rgb(127, 128, 0)");
    expect(valueColor(ramp, 1)).toBe("rgb(0, 255, 0)");
    // Without stops the colors spread evenly, and the floor lifts the
    // lowest value off the paper so it stays visible.
    const plain: ValueScale = { ...ramp, stops: undefined };
    expect(valueColor(plain, 1)).toBe("rgb(0, 255, 0)");
    expect(valueColor(plain, 0)).not.toBe("rgb(0, 0, 0)");
    expect(valueColor({ ...plain, colors: ["#000000", "#ffffff"] }, 0.5)).toBe(
      "rgb(140, 140, 140)"
    );
  });

  it("validates stops as one position per color between 0 and 1", () => {
    expect(isCompositionDefinition(strips())).toBe(true);
    const bad = (patch: Partial<ValueScale>) => ({
      ...strips(),
      scales: [strips().scales[0]!, { ...ramp, ...patch }],
    });
    expect(isCompositionDefinition(bad({ stops: [0, 1] }))).toBe(false);
    expect(isCompositionDefinition(bad({ stops: [0, 0.5, 2] }))).toBe(false);
    expect(isCompositionDefinition(bad({ colors: ["#000"] }))).toBe(false);
  });
});

describe("missing cells", () => {
  it("draws a not-reported cell in the missing color and leaves no-record bins blank", () => {
    const drawn = cells(strips());
    const bo = drawn.filter((node) => node.instanceKey === "Bo");
    // 1928 reported, 1929 null, 1930 absent: two cells, not three.
    expect(bo.map((node) => node.glyph!.bin.label)).toEqual(["1928", "1929"]);
    const missing = bo.find((node) => node.glyph!.bin.label === "1929")!;
    expect(missing.glyph!.missing).toBe(true);
    expect(missing.fill).toBe("#eeeeee");
    expect(missing.glyph!.rowIds).toEqual([4]);
    // A missing cell fills its bin like a reported one.
    expect(missing.height).toBe(10);
  });

  it("stays blank without a missing color and never joins the value domain", () => {
    const blank = cells(strips({ missing: undefined }));
    expect(blank.filter((node) => node.instanceKey === "Bo")).toHaveLength(1);
    // Ada's 1,000 is the shared maximum; Bo's 500 maps halfway along the stops.
    const ada = cells(strips()).filter((node) => node.instanceKey === "Ada");
    expect(ada.find((node) => node.glyph!.bin.label === "1930")!.fill).toBe(
      "rgb(0, 255, 0)"
    );
    const bo1928 = cells(strips()).find(
      (node) => node.instanceKey === "Bo" && node.glyph!.bin.label === "1928"
    )!;
    expect(bo1928.fill).toBe(valueColor(ramp, 0.5));
  });

  it("orders rows by a prepared rank through the repeat's value order", () => {
    const instances = resolveComposition(strips(), estimateTextWidth, data())
      .elements[0]!.instances!;
    expect(instances.map((item) => item.key)).toEqual(["Bo", "Ada"]);
  });
});
