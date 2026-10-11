import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type HorizonMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type AreaNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two stocks over four months: Ada doubles then halves, Bo drifts down.
const rows: Record<string, datum>[] = [
  { Stock: "Ada", Month: 1, Price: 10 },
  { Stock: "Ada", Month: 2, Price: 20 },
  { Stock: "Ada", Month: 3, Price: 30 },
  { Stock: "Ada", Month: 4, Price: 5 },
  { Stock: "Bo", Month: 1, Price: 100 },
  { Stock: "Bo", Month: 2, Price: 90 },
  { Stock: "Bo", Month: 3, Price: 80 },
  { Stock: "Bo", Month: 4, Price: null },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const horizon: HorizonMark = {
  type: "horizon",
  id: "mark-1",
  name: "Growth",
  xScaleId: "n-1",
  field: "Price",
  orderField: "Month",
  baseline: "first",
  relative: true,
  bands: 2,
  domain: "shared",
  positive: "#0000ff",
  negative: "#ff0000",
};
function chart(patch: Partial<HorizonMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Stocks",
    x: 0,
    y: 0,
    frame: { width: 300, height: 40 },
    label: { show: true, width: 40, fontSize: 10 },
    axis: true,
    marks: [{ ...horizon, ...patch }],
    repeat: {
      field: "Stock",
      arrangement: "rows",
      columns: 1,
      gap: 0,
      order: "label",
      limit: 10,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Month",
        field: "Month",
        domain: "shared",
        zero: false,
        nice: false,
      },
    ],
    elements: [unit],
  };
}
const layers = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data()).nodes.filter(
    (node): node is AreaNode => node.type === "area"
  );
const height = (node: AreaNode, index: number) =>
  node.segments[0]![index]!.y0 - node.segments[0]![index]!.y1;

describe("horizon marks", () => {
  it("cuts growth from the first value into bands that stack at full height", () => {
    const definition = chart();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = layers(definition);
    const ada = drawn.filter((node) => node.instanceKey === "Ada");
    // Ada: +100%, +200%, −50%. The shared peak is 200%, so each band is 100%.
    expect(ada.map((node) => node.key.split(":").slice(-2).join(":"))).toEqual([
      "up:0",
      "up:1",
      "down:0",
    ]);
    const [up0, up1, down0] = ada;
    // Month 2 fills the first band; month 3 fills both.
    expect(height(up0!, 1)).toBeCloseTo(40);
    expect(height(up1!, 1)).toBeCloseTo(0);
    expect(height(up0!, 2)).toBeCloseTo(40);
    expect(height(up1!, 2)).toBeCloseTo(40);
    // Month 4 is −50%: half of the first negative band, nothing above.
    expect(height(down0!, 3)).toBeCloseTo(20);
    expect(height(up0!, 3)).toBeCloseTo(0);
    expect(up1!.fill).not.toBe(up0!.fill);
    expect(down0!.band.upperField).toContain("below the baseline, band 1 of 2");
    // Bo only falls, and its missing month is skipped.
    const bo = drawn.filter((node) => node.instanceKey === "Bo");
    expect(bo.map((node) => node.key.endsWith("down:0"))).toEqual([true]);
    expect(bo[0]!.band.skipped).toEqual([7]);
  });

  it("fits each repeat to its own swing when the range is per unit", () => {
    const drawn = layers(chart({ domain: "instance" }));
    const bo = drawn.filter((node) => node.instanceKey === "Bo");
    // Bo's largest swing is −20%, which now fills both bands at month 3.
    expect(bo).toHaveLength(2);
    expect(height(bo[1]!, 2)).toBeCloseTo(40);
  });

  it("reads differences from zero or from the mean when asked", () => {
    const zero = layers(chart({ baseline: "zero", relative: false, bands: 1 }));
    const ada = zero.find((node) => node.instanceKey === "Ada")!;
    // Prices are all positive; the peak is Bo's 100, so Ada's 30 is 30%.
    expect(height(ada, 2)).toBeCloseTo(12);
    const mean = layers(chart({ baseline: "mean", relative: false, bands: 1 }));
    expect(mean.some((node) => node.key.endsWith("down:0"))).toBe(true);
  });
});
