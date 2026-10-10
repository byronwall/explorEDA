import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type StackMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type AreaNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Counts by age for two causes. Age 1 has no rows at all, so the area
// must break there; at age 3 only Cancer has rows.
const rows: Record<string, datum>[] = [
  { Age: 0, Cause: "Accidents", Count: 3 },
  { Age: 0, Cause: "Cancer", Count: 1 },
  { Age: 2, Cause: "Accidents", Count: 1 },
  { Age: 2, Cause: "Cancer", Count: 3 },
  { Age: 3, Cause: "Cancer", Count: 5 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const stack: StackMark = {
  type: "stack",
  id: "mark-1",
  name: "Causes",
  categoryField: "Cause",
  aggregation: "sum",
  measureField: "Count",
  normalize: true,
  order: "total",
  colors: ["#aaaaaa", "#bbbbbb"],
  labelMinHeight: 10,
  inset: 0,
  xScaleId: "n-1",
};
function byAge(patch: Partial<StackMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Ages",
    x: 0,
    y: 0,
    frame: { width: 300, height: 100 },
    label: { show: false, width: 0, fontSize: 12 },
    axis: true,
    marks: [{ ...stack, ...patch }],
    repeat: {
      arrangement: "rows",
      columns: 1,
      gap: 0,
      order: "label",
      limit: 1,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Age",
        field: "Age",
        domain: "shared",
        zero: false,
        nice: false,
      },
    ],
    elements: [unit],
  };
}
const areas = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds)).nodes.filter(
    (node): node is AreaNode => node.type === "area"
  );

describe("stacks across x", () => {
  it("draws one area per category with shares at each x, stacking in total order", () => {
    const definition = byAge();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = areas(definition);
    // Cancer totals 9 and accidents 4, so cancer sits at the bottom.
    expect(drawn.map((node) => node.band.stack!.category)).toEqual([
      "Cancer",
      "Accidents",
    ]);
    const cancer = drawn[0]!.band.stack!;
    expect(cancer.points).toEqual([
      { x: 0, count: 1, total: 4, share: 0.25 },
      { x: 2, count: 3, total: 4, share: 0.75 },
      { x: 3, count: 5, total: 5, share: 1 },
    ]);
    const accidents = drawn[1]!.band.stack!;
    expect(accidents.points.map((point) => point.share)).toEqual([0.75, 0.25]);
    // The shares at each x sum to the frame: cancer's top is accidents' bottom.
    const frame = resolveComposition(definition, estimateTextWidth, data())
      .elements[0]!.instances![0]!.frame;
    const cancerAt0 = drawn[0]!.segments[0]![0]!;
    const accidentsAt0 = drawn[1]!.segments[0]![0]!;
    expect(cancerAt0.y0).toBeCloseTo(frame.y + frame.height);
    expect(cancerAt0.y1).toBeCloseTo(accidentsAt0.y0);
    expect(accidentsAt0.y1).toBeCloseTo(frame.y);
  });

  it("keeps one run across a gap-free range and reports the categories in each denominator", () => {
    const [cancer] = areas(byAge());
    // Ages 0, 2, 3 have rows; there is no age-1 column, so the run is continuous.
    expect(cancer!.segments).toHaveLength(1);
    expect(cancer!.band.stack!.categories).toEqual(["Cancer", "Accidents"]);
    expect(cancer!.band.rowIds).toEqual([1, 3, 4]);
  });

  it("breaks the area where filtering leaves an x with no rows", () => {
    // Remove every age-2 row: the areas break between ages 0 and 3.
    const [cancer] = areas(byAge(), [0, 1, 4]);
    expect(cancer!.segments.length).toBeGreaterThanOrEqual(1);
    expect(cancer!.band.stack!.points.map((point) => point.x)).toEqual([0, 3]);
    expect(cancer!.band.stack!.points[0]!.share).toBe(0.25);
  });

  it("scales by total when not normalized, against the largest x total", () => {
    const drawn = areas(byAge({ normalize: false }));
    const frame = resolveComposition(
      byAge({ normalize: false }),
      estimateTextWidth,
      data()
    ).elements[0]!.instances![0]!.frame;
    // Age 3 totals 5, the largest, so cancer's top there is the frame top.
    const cancerAt3 = drawn[0]!.segments[0]![2]!;
    expect(cancerAt3.y1).toBeCloseTo(frame.y);
    // Age 0 totals 4: the stack reaches 80% of the frame.
    const accidentsAt0 = drawn[1]!.segments[0]![0]!;
    expect(accidentsAt0.y1).toBeCloseTo(frame.y + frame.height * 0.2);
  });

  it("labels a category where its band is thickest", () => {
    const scene = resolveComposition(byAge(), estimateTextWidth, data());
    const labels = scene.nodes.filter(
      (node) =>
        node.type === "text" &&
        node.key.includes(":mark-1:") &&
        node.key.endsWith(":label")
    );
    expect(
      labels.map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
    ).toEqual(["Cancer", "Accidents"]);
    // Accidents is thickest at age 0, so its label hangs inward from the left edge.
    const frame = scene.elements[0]!.instances![0]!.frame;
    const accidents = labels[1]!;
    expect(accidents.type === "text" && accidents.x).toBeCloseTo(frame.x + 4);
    expect(accidents.type === "text" && accidents.anchor).toBe("start");
  });
});
