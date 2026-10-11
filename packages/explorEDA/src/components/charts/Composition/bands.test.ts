import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type BandMark,
  type CompositionDefinition,
  type GuideElement,
  type NumericScale,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type AreaNode,
  type LineNode,
  type RectNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Five quarters out of order: two of history with no bounds, three projected.
// The 2026 row has its bounds swapped; the 2025.5 row has no upper bound.
const rows: Record<string, datum>[] = [
  { Year: 2025.5, Central: 2.1, Low: 1.5, High: null },
  { Year: 2024.75, Central: 1.9, Low: null, High: null },
  { Year: 2026, Central: 2.4, Low: 3.4, High: 1.4 },
  { Year: 2025.25, Central: 2.0, Low: 1.6, High: 2.4 },
  { Year: 2024.5, Central: 2.3, Low: null, High: null },
  { Year: 2025, Central: 2.2, Low: 1.9, High: 2.5 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});

const scale = (
  id: string,
  field: string,
  patch: Partial<NumericScale> = {}
): NumericScale => ({
  id,
  kind: "numeric",
  name: field,
  field,
  domain: "shared",
  zero: false,
  nice: false,
  ...patch,
});
const band: BandMark = {
  type: "band",
  id: "mark-1",
  name: "80% band",
  xScaleId: "x",
  yScaleId: "y",
  orderField: "Year",
  lowerField: "Low",
  upperField: "High",
  fill: "#1f4e8c",
  opacity: 0.2,
};
function fan(
  patch: Partial<UnitElement> = {},
  scales = [scale("x", "Year"), scale("y", "Central")]
) {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Fan",
    x: 50,
    y: 50,
    frame: { width: 400, height: 200 },
    label: { show: false, width: 0, fontSize: 12 },
    axis: false,
    marks: [
      band,
      {
        type: "path",
        id: "mark-2",
        name: "Central",
        xScaleId: "x",
        yScaleId: "y",
        orderField: "Year",
        stroke: "#000",
        strokeWidth: 1.5,
      },
    ],
    repeat: {
      arrangement: "rows",
      columns: 1,
      gap: 6,
      order: "label",
      limit: 24,
    },
    ...patch,
  };
  const definition: CompositionDefinition = {
    ...createEmptyComposition(),
    scales,
    elements: [unit],
  };
  return definition;
}
const scene = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds));
const areas = (definition: CompositionDefinition) =>
  scene(definition).nodes.filter(
    (node): node is AreaNode => node.type === "area"
  );

describe("band marks", () => {
  it("fills between the bounds in year order, swaps crossed bounds, and breaks at a missing one", () => {
    const definition = fan();
    expect(isCompositionDefinition(definition)).toBe(true);
    const [area] = areas(definition);
    // 2024.5 and 2024.75 have no bounds, 2025.5 lacks its upper bound.
    expect(area!.band.skipped).toEqual([4, 1, 0]);
    expect(area!.band.segments).toBe(2);
    expect(
      area!.segments.map((run) => run.map((vertex) => vertex.rowId))
    ).toEqual([[5, 3], [2]]);
    for (const vertex of area!.segments.flat())
      expect(vertex.y1).toBeLessThanOrEqual(vertex.y0);
    expect(area!.fillOpacity).toBe(0.2);
  });

  it("spans the y scale over the bounds, not only the central field", () => {
    const definition = fan();
    const frame = scene(definition).elements[0]!.instances![0]!.frame;
    const [area] = areas(definition);
    // The highest bound (3.4) sits at the top edge; the central values alone
    // would have put it above the frame.
    const top = Math.min(...area!.segments.flat().map((vertex) => vertex.y1));
    expect(top).toBeCloseTo(frame.y);
    const bottom = Math.max(
      ...area!.segments.flat().map((vertex) => vertex.y0)
    );
    expect(bottom).toBeCloseTo(frame.y + frame.height);
  });

  it("clips to the frame under fixed limits and keeps the central path aligned", () => {
    const fixed = fan({}, [
      scale("x", "Year", { min: 2025, max: 2026 }),
      scale("y", "Central"),
    ]);
    const [area] = areas(fixed);
    expect(area!.clip).toBeDefined();
    const path = scene(fixed).nodes.find((node) => node.type === "path");
    expect(path?.type === "path" && path.clip).toEqual(area!.clip);
  });
});

describe("guides on x–y units", () => {
  const guide = (patch: Partial<GuideElement>): GuideElement => ({
    id: "guide-1",
    kind: "guide",
    name: "Guide",
    x: 0,
    y: 0,
    unitId: "unit-1",
    value: { kind: "constant", value: "2" },
    label: "Target",
    color: "#a00",
    ...patch,
  });
  const withGuide = (patch: Partial<GuideElement>) => {
    const base = fan();
    return { ...base, elements: [...base.elements, guide(patch)] };
  };

  it("draws a horizontal rule at a numeric y and shades above it", () => {
    const definition = withGuide({ axis: "y", shade: "after" });
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const frame = resolved.elements[0]!.instances![0]!.frame;
    const rule = resolved.nodes.find(
      (node): node is LineNode =>
        node.type === "line" && node.elementId === "guide-1"
    )!;
    expect(rule.y1).toBe(rule.y2);
    expect(rule.y1).toBeGreaterThan(frame.y);
    expect(rule.y1).toBeLessThan(frame.y + frame.height);
    const shade = resolved.nodes.find(
      (node): node is RectNode =>
        node.type === "rect" && node.elementId === "guide-1"
    )!;
    expect(shade.y).toBe(frame.y);
    expect(shade.height).toBeCloseTo(rule.y1 - frame.y);
    expect(shade.opacity).toBeLessThan(0.2);
  });

  it("shades after a vertical rule at a numeric x, to the frame's right edge", () => {
    const definition = withGuide({
      value: { kind: "constant", value: "2025" },
      shade: "after",
    });
    const resolved = scene(definition);
    const frame = resolved.elements[0]!.instances![0]!.frame;
    const rule = resolved.nodes.find(
      (node): node is LineNode =>
        node.type === "line" && node.elementId === "guide-1"
    )!;
    const shade = resolved.nodes.find(
      (node): node is RectNode =>
        node.type === "rect" && node.elementId === "guide-1"
    )!;
    expect(rule.x1).toBe(rule.x2);
    expect(shade.x).toBeCloseTo(rule.x1);
    expect(shade.x + shade.width).toBeCloseTo(frame.x + frame.width);
    expect(shade.height).toBe(frame.height);
  });

  it("reports a y value outside the scale instead of drawing it", () => {
    const definition = withGuide({
      axis: "y",
      value: { kind: "constant", value: "9" },
    });
    const element = scene(definition).elements.find(
      (item) => item.id === "guide-1"
    )!;
    expect(element.anchor?.missing).toContain("y scale");
  });
});

describe("band validation", () => {
  it("rejects a band without bound fields or with no opacity", () => {
    const definition = fan();
    const unit = definition.elements[0] as UnitElement;
    const broken = (patch: Partial<BandMark>) => ({
      ...definition,
      elements: [{ ...unit, marks: [{ ...band, ...patch }, unit.marks[1]!] }],
    });
    expect(isCompositionDefinition(broken({ opacity: 0 }))).toBe(false);
    expect(
      isCompositionDefinition(
        broken({ lowerField: undefined as unknown as string })
      )
    ).toBe(false);
  });
});
