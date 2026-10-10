import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Four states on a small tile map; Guam has no address.
const rows: Record<string, datum>[] = [
  { State: "Washington", Tile: "0,0", Week: 1, Rate: 5 },
  { State: "Washington", Tile: "0,0", Week: 2, Rate: 7 },
  { State: "Maine", Tile: "0,3", Week: 1, Rate: 2 },
  { State: "Texas", Tile: "2,1", Week: 1, Rate: 9 },
  { State: "Florida", Tile: "2,3", Week: 1, Rate: 8 },
  { State: "Guam", Tile: null, Week: 1, Rate: 1 },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
function tiles(): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "States",
    x: 10,
    y: 20,
    frame: { width: 50, height: 30 },
    label: { show: true, width: 0, fontSize: 10 },
    axis: false,
    marks: [
      {
        type: "path",
        id: "mark-1",
        name: "Cases",
        xScaleId: "n-1",
        yScaleId: "n-2",
        orderField: "Week",
        stroke: "#000",
        strokeWidth: 1,
      },
    ],
    repeat: {
      field: "State",
      arrangement: "tiles",
      tileField: "Tile",
      columns: 4,
      gap: 4,
      order: "label",
      limit: 60,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Week",
        field: "Week",
        domain: "shared",
        zero: false,
        nice: false,
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "Rate",
        field: "Rate",
        domain: "shared",
        zero: true,
        nice: false,
      },
    ],
    elements: [unit],
  };
}

describe("tile-addressed repeats", () => {
  it("places each repeat at the cell its field names, counted from the top left", () => {
    const definition = tiles();
    expect(isCompositionDefinition(definition)).toBe(true);
    const instances = resolveComposition(definition, estimateTextWidth, data())
      .elements[0]!.instances!;
    const at = (key: string) =>
      instances.find((item) => item.key === key)!.layoutOrigin;
    const labelHeight = Math.round(10 * 1.6);
    const cellHeight = labelHeight + 30;
    expect(at("Washington")).toEqual({ x: 10, y: 20 });
    expect(at("Maine")).toEqual({ x: 10 + 3 * 54, y: 20 });
    expect(at("Texas")).toEqual({ x: 10 + 54, y: 20 + 2 * (cellHeight + 4) });
    expect(at("Florida")).toEqual({
      x: 10 + 3 * 54,
      y: 20 + 2 * (cellHeight + 4),
    });
    // The gap between Maine and Texas rows stays empty: no repeat at row 1.
    expect(
      instances.filter((item) => item.layoutOrigin.y === 20 + cellHeight + 4)
    ).toHaveLength(0);
  });

  it("queues repeats without an address under the grid instead of dropping them", () => {
    const instances = resolveComposition(tiles(), estimateTextWidth, data())
      .elements[0]!.instances!;
    const guam = instances.find((item) => item.key === "Guam")!;
    const labelHeight = Math.round(10 * 1.6);
    expect(guam.layoutOrigin).toEqual({
      x: 10,
      y: 20 + 3 * (labelHeight + 30 + 4),
    });
    expect(instances).toHaveLength(5);
  });

  it("falls back to a plain grid without a cell field", () => {
    const definition = tiles();
    const unit = definition.elements[0] as UnitElement;
    const plain = {
      ...definition,
      elements: [{ ...unit, repeat: { ...unit.repeat, tileField: undefined } }],
    };
    const instances = resolveComposition(plain, estimateTextWidth, data())
      .elements[0]!.instances!;
    // Label order, four to a row: Florida, Guam, Maine, Texas, then Washington.
    expect(instances.map((item) => item.key)).toEqual([
      "Florida",
      "Guam",
      "Maine",
      "Texas",
      "Washington",
    ]);
    expect(instances[4]!.layoutOrigin.x).toBe(10);
    expect(instances[4]!.layoutOrigin.y).toBeGreaterThan(20);
  });
});
