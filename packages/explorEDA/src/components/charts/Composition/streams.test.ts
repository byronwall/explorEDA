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
import { streamOffsets, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two industries over three months; the total grows from 4 to 8 to 6.
const rows: Record<string, datum>[] = [
  { Industry: "Ada", Month: "2000-01-01", Count: 1 },
  { Industry: "Bo", Month: "2000-01-01", Count: 3 },
  { Industry: "Ada", Month: "2000-02-01", Count: 4 },
  { Industry: "Bo", Month: "2000-02-01", Count: 4 },
  { Industry: "Ada", Month: "2000-03-01", Count: 2 },
  { Industry: "Bo", Month: "2000-03-01", Count: 4 },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const stack: StackMark = {
  type: "stack",
  id: "mark-1",
  name: "Unemployed",
  categoryField: "Industry",
  aggregation: "sum",
  measureField: "Count",
  normalize: false,
  order: "label",
  colors: ["#f00", "#00f"],
  labelMinHeight: 1000,
  inset: 0,
  xScaleId: "n-1",
};
function stream(patch: Partial<StackMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Months",
    x: 0,
    y: 0,
    frame: { width: 200, height: 100 },
    label: { show: false, width: 0, fontSize: 10 },
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
const column = (x: number, counts: Record<string, number>) => ({
  x,
  total: Object.values(counts).reduce((sum, value) => sum + value, 0),
  counts: new Map(
    Object.entries(counts).map(([key, count]) => [key, { count, rowIds: [] }])
  ),
});
const categories = [
  { key: "Ada", index: 0, total: 7 },
  { key: "Bo", index: 1, total: 11 },
];

describe("stream baselines", () => {
  it("stacks on zero by default, across dated months", () => {
    const definition = stream();
    expect(isCompositionDefinition(definition)).toBe(true);
    const [ada, bo] = layers(definition);
    // Three months, Ada at the bottom: its lower edge is the frame's bottom.
    expect(ada!.segments[0]).toHaveLength(3);
    for (const vertex of ada!.segments[0]!) expect(vertex.y0).toBeCloseTo(100);
    // The tallest month (8) reaches the top; Bo's upper edge is at y 0 there.
    expect(bo!.segments[0]![1]!.y1).toBeCloseTo(0);
    expect(ada!.curve).toBeUndefined();
  });

  it("centers each column on the frame's middle", () => {
    const [ada, bo] = layers(stream({ baseline: "center" }));
    // Month one totals 4 of a possible 8: it spans the middle half.
    expect(ada!.segments[0]![0]!.y0).toBeCloseTo(75);
    expect(bo!.segments[0]![0]!.y1).toBeCloseTo(25);
    // The tallest month still fills the frame.
    expect(ada!.segments[0]![1]!.y0).toBeCloseTo(100);
    expect(bo!.segments[0]![1]!.y1).toBeCloseTo(0);
  });

  it("wiggles the baseline so the lowest point rests on zero and the stream fits", () => {
    const offsets = streamOffsets(
      [
        column(0, { Ada: 1, Bo: 3 }),
        column(1, { Ada: 4, Bo: 4 }),
        column(2, { Ada: 2, Bo: 4 }),
      ],
      categories
    );
    expect(Math.min(...offsets)).toBe(0);
    expect(offsets).toHaveLength(3);
    // The baseline falls as the total grows, so the stream spreads both ways.
    expect(offsets[1]).toBeLessThan(offsets[0]!);
    const drawn = layers(stream({ baseline: "wiggle", curve: "smooth" }));
    const ys = drawn.flatMap((node) =>
      node.segments[0]!.flatMap((vertex) => [vertex.y0, vertex.y1])
    );
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(-1e-6);
    expect(Math.max(...ys)).toBeLessThanOrEqual(100 + 1e-6);
    expect(Math.min(...ys)).toBeCloseTo(0);
    expect(drawn[0]!.curve).toBe("smooth");
  });

  it("keeps normalized stacks on zero whatever the baseline says", () => {
    const [ada] = layers(stream({ baseline: "wiggle", normalize: true }));
    for (const vertex of ada!.segments[0]!) expect(vertex.y0).toBeCloseTo(100);
  });
});
