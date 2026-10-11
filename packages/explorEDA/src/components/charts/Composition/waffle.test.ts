import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type UnitElement,
  type WaffleMark,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import { markCategories, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two classes: Ada has 3 who died and 2 who survived, Bo 1 and 4; one row
// without a fate.
const rows: Record<string, datum>[] = [
  { Class: "Ada", Fate: "Died" },
  { Class: "Ada", Fate: "Died" },
  { Class: "Ada", Fate: "Died" },
  { Class: "Ada", Fate: "Survived" },
  { Class: "Ada", Fate: "Survived" },
  { Class: "Bo", Fate: "Died" },
  { Class: "Bo", Fate: "Survived" },
  { Class: "Bo", Fate: "Survived" },
  { Class: "Bo", Fate: "Survived" },
  { Class: "Bo", Fate: "Survived" },
  { Class: "Bo", Fate: null },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const waffle: WaffleMark = {
  type: "waffle",
  id: "mark-1",
  name: "People",
  categoryField: "Fate",
  each: 1,
  normalize: false,
  columns: 2,
  gap: 2,
  from: "bottom",
  order: "label",
  colors: ["#f00", "#00f"],
};
function grid(patch: Partial<WaffleMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Classes",
    x: 0,
    y: 0,
    frame: { width: 22, height: 100 },
    label: { show: false, width: 0, fontSize: 10 },
    axis: false,
    marks: [{ ...waffle, ...patch }],
    repeat: {
      field: "Class",
      arrangement: "columns",
      columns: 2,
      gap: 10,
      order: "label",
      limit: 10,
    },
  };
  return { ...createEmptyComposition(), elements: [unit] };
}
const cells = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds)).nodes.filter(
    (node): node is RectNode => node.type === "rect" && Boolean(node.glyph)
  );

describe("waffle marks", () => {
  it("draws one cell per row, category after category, from the chosen corner", () => {
    const definition = grid();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = cells(definition);
    const ada = drawn.filter((node) => node.instanceKey === "Ada");
    expect(ada).toHaveLength(5);
    // Two columns of 10px cells with a 2px gap; Died fills the bottom row first.
    expect(ada[0]!.width).toBe(10);
    expect(ada[0]!.y).toBe(90);
    expect(ada[1]!.x).toBe(12);
    expect(ada[2]!.y).toBe(78);
    expect(ada.map((node) => node.fill)).toEqual([
      "#f00",
      "#f00",
      "#f00",
      "#00f",
      "#00f",
    ]);
    expect(ada[3]!.glyph!.rowIds).toEqual([3]);
    expect(ada[3]!.glyph!.waffle).toMatchObject({
      cell: 1,
      cells: 2,
      count: 2,
      total: 5,
      each: 1,
    });
    // The row without a fate draws no cell.
    expect(drawn.filter((node) => node.instanceKey === "Bo")).toHaveLength(5);
    expect(cells(grid({ from: "top" }))[0]!.y).toBe(0);
  });

  it("groups rows into cells, or draws a hundred shares by largest remainder", () => {
    const grouped = cells(grid({ each: 2 }));
    const ada = grouped.filter((node) => node.instanceKey === "Ada");
    // 3 died → 2 cells, 2 survived → 1 cell; each cell lists its rows.
    expect(ada).toHaveLength(3);
    expect(ada[0]!.glyph!.rowIds).toEqual([0]);
    expect(ada[1]!.glyph!.rowIds).toEqual([1, 2]);
    const shares = cells(grid({ normalize: true, columns: 10 }));
    const bo = shares.filter((node) => node.instanceKey === "Bo");
    expect(bo).toHaveLength(100);
    expect(bo.filter((node) => node.fill === "#f00")).toHaveLength(20);
    expect(bo[0]!.glyph!.waffle!.normalize).toBe(true);
  });

  it("keeps the category order and colors across repeats and filters", () => {
    const definition = grid({ order: "total" });
    const unit = definition.elements[0] as UnitElement;
    // Survived has 6 rows to Died's 4, so it comes first and takes red.
    expect(markCategories(unit.marks[0]!, data())).toEqual([
      { key: "Survived", color: "#f00" },
      { key: "Died", color: "#00f" },
    ]);
    const filtered = cells(definition, [0, 1, 3]);
    const ada = filtered.filter((node) => node.instanceKey === "Ada");
    expect(ada).toHaveLength(3);
    expect(ada[0]!.fill).toBe("#f00");
    expect(ada[0]!.glyph!.rowIds).toEqual([3]);
    expect(filtered.filter((node) => node.instanceKey === "Bo")).toHaveLength(
      0
    );
  });

  it("rejects a waffle without columns", () => {
    expect(isCompositionDefinition(grid({ columns: 0 }))).toBe(false);
  });
});
