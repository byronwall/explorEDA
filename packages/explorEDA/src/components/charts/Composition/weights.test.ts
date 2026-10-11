import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type RectNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Three classes of 1, 2, and 3 passengers; the third class all died.
const rows: Record<string, datum>[] = [
  { Class: "A", Fate: "Lived" },
  { Class: "B", Fate: "Lived" },
  { Class: "B", Fate: "Died" },
  { Class: "C", Fate: "Died" },
  { Class: "C", Fate: "Died" },
  { Class: "C", Fate: "Died" },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
function mosaic(
  arrangement: "rows" | "columns" = "columns",
  weightCalcId: string | null = "calc-1"
): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Classes",
    x: 0,
    y: 0,
    frame: { width: 100, height: 60 },
    label: { show: false, width: 0, fontSize: 10 },
    axis: false,
    marks: [
      {
        type: "stack",
        id: "mark-1",
        name: "Fate",
        categoryField: "Fate",
        aggregation: "count",
        normalize: true,
        order: "label",
        colors: ["#f00", "#00f"],
        labelMinHeight: 1000,
        inset: 0,
      },
    ],
    repeat: {
      field: "Class",
      arrangement,
      columns: 1,
      gap: 10,
      order: "label",
      limit: 10,
      weightCalcId: weightCalcId ?? undefined,
    },
  };
  return {
    ...createEmptyComposition(),
    calculations: [
      {
        id: "calc-1",
        name: "Passengers",
        aggregation: "count",
        population: "repeat",
        filters: "follow",
      },
    ],
    elements: [unit],
  };
}

describe("weighted repeats", () => {
  it("sizes columns by a calculation while keeping the unit's total width", () => {
    const definition = mosaic();
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = resolveComposition(definition, estimateTextWidth, data());
    const instances = resolved.elements[0]!.instances!;
    // Three columns of 100 would span 300; weights 1, 2, 3 split it 50, 100, 150.
    expect(instances.map((item) => item.frame.width)).toEqual([50, 100, 150]);
    expect(instances.map((item) => item.frame.x)).toEqual([0, 60, 170]);
    expect(instances.every((item) => item.frame.height === 60)).toBe(true);
    expect(resolved.elements[0]!.bounds.width).toBe(320);
    // The stack fills each column's own width.
    const died = resolved.nodes.find(
      (node): node is RectNode =>
        node.type === "rect" && node.key === "unit-1:C:mark-1:Died"
    )!;
    expect(died.x).toBe(170);
    expect(died.width).toBe(150);
  });

  it("sizes rows by height and follows the filters", () => {
    const resolved = resolveComposition(
      mosaic("rows"),
      estimateTextWidth,
      data()
    );
    const instances = resolved.elements[0]!.instances!;
    expect(instances.map((item) => item.frame.height)).toEqual([30, 60, 90]);
    expect(instances.map((item) => item.frame.y)).toEqual([0, 40, 110]);
    // Filtering C down to one passenger evens the weights.
    const filtered = resolveComposition(
      mosaic("rows"),
      estimateTextWidth,
      data([0, 1, 2, 3])
    );
    expect(
      filtered.elements[0]!.instances!.map((item) => item.frame.height)
    ).toEqual([45, 90, 45]);
  });

  it("keeps one size without a weight", () => {
    const resolved = resolveComposition(
      mosaic("columns", null),
      estimateTextWidth,
      data()
    );
    expect(
      resolved.elements[0]!.instances!.map((item) => item.frame.width)
    ).toEqual([100, 100, 100]);
  });
});
