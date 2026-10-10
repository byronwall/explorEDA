import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type PathMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type PathNode,
  type TextNode,
} from "./resolveComposition";
import { rankRows, type CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Three economies over two years; Bo overtakes Ada, and Cy has no 2001 value.
const rows: Record<string, datum>[] = [
  { Country: "Ada", Year: 2000, GDP: 30 },
  { Country: "Bo", Year: 2000, GDP: 20 },
  { Country: "Cy", Year: 2000, GDP: 10 },
  { Country: "Ada", Year: 2001, GDP: 25 },
  { Country: "Bo", Year: 2001, GDP: 40 },
  { Country: "Cy", Year: 2001, GDP: null },
];
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const bump: PathMark = {
  type: "path",
  id: "mark-1",
  name: "Rank",
  xScaleId: "n-1",
  yScaleId: "n-2",
  orderField: "Year",
  stroke: "#000",
  strokeWidth: 1,
  seriesField: "Country",
  rank: "desc",
  labels: "end",
  labelValue: true,
};
function chart(patch: Partial<PathMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Years",
    x: 0,
    y: 0,
    frame: { width: 200, height: 300 },
    label: { show: false, width: 0, fontSize: 10 },
    axis: true,
    marks: [
      { ...bump, ...patch },
      {
        type: "point",
        id: "mark-2",
        name: "Points",
        xScaleId: "n-1",
        yScaleId: "n-2",
        radius: 2,
        fill: "#000",
        labelEvery: 0,
        rank: "desc",
      },
    ],
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
        name: "Year",
        field: "Year",
        domain: "shared",
        zero: false,
        nice: false,
      },
      {
        id: "n-2",
        kind: "numeric",
        name: "GDP",
        field: "GDP",
        domain: "shared",
        zero: false,
        nice: false,
      },
    ],
    elements: [unit],
  };
}
const scene = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds));

describe("rankRows", () => {
  it("ranks rows at each x by the y field, skipping unreadable values", () => {
    const d = data();
    const ranks = rankRows(all, d.column("Year"), d.column("GDP"), "desc");
    expect(ranks).toEqual({ 0: 1, 1: 2, 2: 3, 3: 2, 4: 1 });
    const ascending = rankRows(all, d.column("Year"), d.column("GDP"), "asc");
    expect(ascending[2]).toBe(1);
  });
});

describe("ranked marks", () => {
  it("plots ranks with one at the top and ticks the ranks", () => {
    const definition = chart();
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = scene(definition);
    const paths = resolved.nodes.filter(
      (node): node is PathNode => node.type === "path"
    );
    const ada = paths.find((node) => node.path.series === "Ada")!;
    const bo = paths.find((node) => node.path.series === "Bo")!;
    // Three ranks across 300 px: rank 1 sits a half step from the top.
    expect(ada.segments[0]![0]!.y).toBeCloseTo(50);
    expect(ada.segments[0]![1]!.y).toBeCloseTo(150);
    expect(bo.segments[0]![1]!.y).toBeCloseTo(50);
    // Cy keeps only its 2000 rank; its 2001 row is skipped.
    const cy = paths.find((node) => node.path.series === "Cy")!;
    expect(cy.segments[0]).toHaveLength(1);
    expect(cy.path.skipped).toHaveLength(1);
    const ticks = resolved.nodes
      .filter(
        (node): node is TextNode =>
          node.type === "text" && node.key.includes(":axis:y:")
      )
      .map((node) => node.lines[0]!.text);
    expect(ticks).toEqual(["1", "2", "3"]);
    // The end label carries the rank, not the GDP.
    const label = resolved.nodes.find(
      (node): node is TextNode =>
        node.type === "text" && node.key.endsWith("mark-1:Bo:label:end")
    )!;
    expect(label.lines[0]!.text).toBe("1  Bo");
  });

  it("re-ranks from the live rows and reads ranks on points", () => {
    const resolved = scene(chart(), [1, 2, 4]);
    const bo = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" && node.path.series === "Bo"
    )!;
    // Without Ada, Bo is first in both years across a two-rank axis.
    expect(bo.segments[0]![0]!.y).toBeCloseTo(75);
    expect(bo.segments[0]![1]!.y).toBeCloseTo(75);
    const points = scene(chart()).nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && Boolean(node.glyph)
    );
    const first = points.find((node) => node.glyph!.rowIds[0] === 0)!;
    expect(first.glyph!.point!.y).toBe(1);
    expect(first.glyph!.point!.yField).toContain("rank by largest GDP");
  });

  it("falls back to values when the y scale is missing", () => {
    const definition = chart({ yScaleId: undefined });
    const resolved = scene(definition);
    const ada = resolved.nodes.find(
      (node): node is PathNode =>
        node.type === "path" && node.path.series === "Ada"
    )!;
    // A dot row: both points on the middle line.
    expect(ada.segments[0]![0]!.y).toBeCloseTo(150);
  });
});
