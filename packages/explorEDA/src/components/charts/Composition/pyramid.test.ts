import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  isXyMark,
  markHasCategories,
  type BarMark,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type RectNode,
  type TextNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two age groups, two sexes, two censuses; one group has no women in 1900.
const rows: Record<string, datum>[] = [
  { Year: 1900, Group: "Young", Sex: "Male", People: 40 },
  { Year: 1900, Group: "Young", Sex: "Female", People: 30 },
  { Year: 1900, Group: "Old", Sex: "Male", People: 10 },
  { Year: 2000, Group: "Young", Sex: "Male", People: 50 },
  { Year: 2000, Group: "Young", Sex: "Female", People: 60 },
  { Year: 2000, Group: "Old", Sex: "Male", People: 80 },
  { Year: 2000, Group: "Old", Sex: "Female", People: 100 },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const bars: BarMark = {
  type: "bar",
  id: "mark-1",
  name: "People",
  aggregation: "sum",
  measureField: "People",
  categoryField: "Sex",
  mirror: "Male",
  order: "label",
  colors: ["#f00", "#00f"],
  inset: 0,
  labelMinWidth: 10,
};
function pyramid(
  patch: Partial<BarMark> = {},
  unitPatch: Partial<UnitElement> = {}
): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Groups",
    x: 0,
    y: 0,
    frame: { width: 200, height: 20 },
    label: { show: true, width: 40, fontSize: 10 },
    axis: true,
    marks: [{ ...bars, ...patch }],
    repeat: {
      field: "Group",
      arrangement: "rows",
      columns: 1,
      gap: 0,
      order: "label",
      limit: 10,
    },
    ...unitPatch,
  };
  return { ...createEmptyComposition(), elements: [unit] };
}
const scene = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds));
const rects = (definition: CompositionDefinition, liveIds?: number[]) =>
  scene(definition, liveIds).nodes.filter(
    (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
  );

describe("bar marks", () => {
  it("draws one bar per category from a shared baseline, the mirrored one leftward", () => {
    const definition = pyramid();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = rects(definition);
    const bar = (group: string, sex: string) =>
      drawn.find(
        (node) => node.instanceKey === group && node.glyph!.bin.key === sex
      )!;
    // The longest bar is Old Female at 100, so the axis runs −100 to 100
    // across 200 px: 1 px per person, baseline at x 140 (after the label).
    expect(bar("Old", "Female").x).toBeCloseTo(140);
    expect(bar("Old", "Female").width).toBeCloseTo(100);
    expect(bar("Old", "Male").x).toBeCloseTo(140 - 90);
    expect(bar("Old", "Male").width).toBeCloseTo(90);
    expect(bar("Old", "Male").glyph!.value).toBe(-90);
    expect(bar("Old", "Male").glyph!.bar!.mirrored).toBe(true);
    expect(bar("Young", "Female").glyph!.rowIds).toEqual([1, 4]);
    expect(bar("Old", "Female").fill).toBe("#f00");
    // The mirrored bar takes the row's full height; the rest share it.
    expect(bar("Old", "Male").height).toBe(20);
    expect(bar("Old", "Female").height).toBe(20);
  });

  it("labels bar ends in compact form and ticks the axis unsigned", () => {
    const resolved = scene(pyramid({ max: 1_000_000 }));
    const texts = resolved.nodes.filter(
      (node): node is TextNode => node.type === "text"
    );
    const ticks = texts
      .filter((node) => node.key.includes(":axis:x:"))
      .map((node) => node.lines[0]!.text);
    expect(ticks).toContain("1M");
    expect(ticks).not.toContain("-1M");
    // A fixed axis makes every bar shorter than the label threshold.
    expect(
      texts.filter(
        (node) => node.key.includes(":mark-1:") && node.key.endsWith(":label")
      )
    ).toHaveLength(0);
    const labels = scene(pyramid())
      .nodes.filter(
        (node): node is TextNode =>
          node.type === "text" &&
          node.key.includes(":mark-1:") &&
          node.key.endsWith(":label")
      )
      .map((node) => node.lines[0]!.text);
    expect(labels).toContain("100");
  });

  it("shares the height among unmirrored categories and follows filters", () => {
    const sideBySide = rects(pyramid({ mirror: undefined }));
    const old = sideBySide.filter((node) => node.instanceKey === "Old");
    expect(old.map((node) => node.height)).toEqual([10, 10]);
    expect(old.every((node) => node.x >= 40)).toBe(true);
    // Filtering to 1900 leaves Old with one bar and shrinks the axis.
    const filtered = rects(pyramid(), [0, 1, 2]);
    expect(filtered.filter((node) => node.instanceKey === "Old")).toHaveLength(
      1
    );
    const young = filtered.find(
      (node) => node.instanceKey === "Young" && node.glyph!.bin.key === "Male"
    )!;
    expect(young.width).toBeGreaterThan(90);
    // A window on the unit does the same without a filter.
    const windowed = rects(
      pyramid({}, { window: { field: "Year", min: "1900", max: "1900" } })
    );
    expect(windowed).toHaveLength(3);
  });

  it("draws one bar per repeat without a category and counts rows", () => {
    const drawn = rects(
      pyramid({
        categoryField: undefined,
        mirror: undefined,
        aggregation: "count",
      })
    );
    expect(drawn).toHaveLength(2);
    expect(drawn.find((node) => node.instanceKey === "Old")!.glyph!.value).toBe(
      3
    );
    expect(drawn[0]!.glyph!.bin.label).toBe(drawn[0]!.instanceKey);
  });
});

describe("mark capabilities", () => {
  it("tell x–y marks and category-colored marks apart", () => {
    expect(isXyMark(bars)).toBe(false);
    expect(markHasCategories(bars)).toBe(true);
    expect(markHasCategories({ ...bars, categoryField: undefined })).toBe(
      false
    );
    expect(
      isXyMark({
        type: "path",
        id: "p",
        name: "p",
        xScaleId: "x",
        orderField: "o",
        stroke: "#000",
        strokeWidth: 1,
      })
    ).toBe(true);
  });
});
