import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type NumericScale,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type CircleNode } from "./resolveComposition";
import {
  numericDomain,
  numericPixel,
  type CompositionData,
} from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Four economies spanning two orders of magnitude in income.
const rows: Record<string, datum>[] = [
  {
    Country: "Ada",
    Region: "North",
    Income: 1000,
    Life: 60,
    People: 1_000_000,
  },
  {
    Country: "Bo",
    Region: "South",
    Income: 10000,
    Life: 72,
    People: 4_000_000,
  },
  {
    Country: "Cy",
    Region: "South",
    Income: 100000,
    Life: 83,
    People: 16_000_000,
  },
  { Country: "Di", Region: "North", Income: 0, Life: 55, People: null },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const income: NumericScale = {
  id: "n-1",
  kind: "numeric",
  name: "Income",
  field: "Income",
  domain: "shared",
  zero: false,
  nice: false,
  transform: "log",
};
const points: PointMark = {
  type: "point",
  id: "mark-1",
  name: "Economies",
  xScaleId: "n-1",
  yScaleId: "n-2",
  radius: 20,
  fill: "#000000",
  labelField: "Country",
  labelEvery: 1,
  labelValues: "Bo, cy",
  sizeField: "People",
  colorField: "Region",
};
function scatter(): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Economies",
    x: 0,
    y: 0,
    frame: { width: 400, height: 200 },
    label: { show: false, width: 0, fontSize: 12 },
    axis: true,
    marks: [points],
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
      income,
      {
        id: "n-2",
        kind: "numeric",
        name: "Life",
        field: "Life",
        domain: "shared",
        zero: false,
        nice: true,
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition) =>
  resolveComposition(definition, estimateTextWidth, data());

describe("log numeric scales", () => {
  it("spaces decades evenly and pins values at or below zero to the low end", () => {
    const axis = {
      scale: income,
      domain: [1000, 100000] as [number, number],
      range: [0, 400] as [number, number],
    };
    expect(numericPixel(axis, 1000)).toBe(0);
    expect(numericPixel(axis, 10000)).toBeCloseTo(200);
    expect(numericPixel(axis, 100000)).toBeCloseTo(400);
    expect(numericPixel(axis, 0)).toBe(0);
    // A domain that would start at zero lifts to one before log spacing.
    expect(numericDomain(income, { 0: 0, 1: 500 }, [0, 1])[0]).toBe(1);
    expect(
      numericDomain({ ...income, nice: true }, { 0: 30, 1: 500 }, [0, 1])
    ).toEqual([10, 1000]);
    expect(isCompositionDefinition(scatter())).toBe(true);
  });

  it("labels decade ticks", () => {
    const resolved = scene(scatter());
    const ticks = resolved.nodes.filter(
      (node) => node.type === "text" && node.key.includes(":axis:x:")
    );
    const texts = ticks.map((node) =>
      node.type === "text" ? node.lines[0]!.text : ""
    );
    expect(texts).toContain("1,000");
    expect(texts).toContain("10,000");
    expect(texts).toContain("100,000");
  });
});

describe("point sizes and listed labels", () => {
  it("scales each point's area by a field, up to the mark's radius", () => {
    const circles = scene(scatter()).nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && Boolean(node.glyph)
    );
    const radius = (country: string) =>
      circles.find(
        (node) =>
          node.glyph!.rowIds[0] ===
          rows.findIndex((row) => row.Country === country)
      )!.r;
    expect(radius("Cy")).toBe(20);
    expect(radius("Bo")).toBeCloseTo(10);
    expect(radius("Ada")).toBeCloseTo(5);
    // A missing size draws the smallest visible point rather than nothing.
    expect(radius("Di")).toBe(1);
  });

  it("labels only the listed values, case-insensitively, and colors by region", () => {
    const resolved = scene(scatter());
    const labels = resolved.nodes.filter(
      (node) =>
        node.type === "text" &&
        node.key.includes(":mark-1:") &&
        node.key.endsWith(":label")
    );
    expect(
      labels
        .map((node) => (node.type === "text" ? node.lines[0]!.text : ""))
        .sort()
    ).toEqual(["Bo", "Cy"]);
    const circles = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && Boolean(node.glyph)
    );
    const fills = new Set(circles.map((node) => node.fill));
    expect(fills.size).toBe(2);
  });
});
