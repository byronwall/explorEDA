import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type PointMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import {
  resolveComposition,
  type CircleNode,
  type TextNode,
} from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { swarmOffsets } from "./swarm";
import { isCompositionDefinition } from "./validateComposition";

describe("swarmOffsets", () => {
  it("leaves spaced points on the line and stacks crowded ones outward", () => {
    expect(swarmOffsets([0, 20, 40], [4, 4, 4], 50)).toEqual([0, 0, 0]);
    const crowded = swarmOffsets([10, 10, 10, 11], [4, 4, 4, 4], 50);
    // The first stays; the next two go above and below; the fourth clears all.
    expect(crowded[0]).toBe(0);
    expect(Math.abs(crowded[1]!)).toBeCloseTo(8);
    expect(crowded[2]).toBeCloseTo(-crowded[1]!);
    expect(Math.abs(crowded[3]!)).toBeGreaterThan(8);
    for (let i = 0; i < 4; i += 1)
      for (let j = i + 1; j < 4; j += 1) {
        const dx = [10, 10, 10, 11][i]! - [10, 10, 10, 11][j]!;
        const dy = crowded[i]! - crowded[j]!;
        expect(Math.hypot(dx, dy)).toBeGreaterThanOrEqual(8 - 1e-6);
      }
  });

  it("clamps to the limit when the swarm cannot fit", () => {
    const tight = swarmOffsets([5, 5, 5, 5, 5], [4, 4, 4, 4, 4], 10);
    expect(Math.max(...tight.map(Math.abs))).toBe(10);
  });
});

// Six economies in two regions; four share one value.
const rows: Record<string, datum>[] = [
  { Region: "North", Name: "Ada", Tonnes: 5 },
  { Region: "North", Name: "Bo", Tonnes: 5 },
  { Region: "North", Name: "Cy", Tonnes: 5 },
  { Region: "North", Name: "Di", Tonnes: 5 },
  { Region: "South", Name: "Ed", Tonnes: 1 },
  { Region: "South", Name: "Fy", Tonnes: 9 },
];
const all = rows.map((_, id) => id);
const data = (): CompositionData => ({
  allIds: all,
  liveIds: all,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const dots: PointMark = {
  type: "point",
  id: "mark-1",
  name: "Economies",
  xScaleId: "n-1",
  radius: 5,
  fill: "#000",
  labelField: "Name",
  labelEvery: 1,
  spread: "swarm",
};
function strip(patch: Partial<PointMark> = {}): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Regions",
    x: 0,
    y: 0,
    frame: { width: 200, height: 40 },
    label: { show: true, width: 40, fontSize: 10 },
    axis: true,
    marks: [{ ...dots, ...patch }],
    repeat: {
      field: "Region",
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
        name: "Tonnes",
        field: "Tonnes",
        domain: "shared",
        zero: true,
        nice: false,
      },
    ],
    elements: [unit],
  };
}

describe("swarmed dot rows", () => {
  it("spreads overlapping dots off the middle line and moves their labels", () => {
    const definition = strip();
    expect(isCompositionDefinition(definition)).toBe(true);
    const resolved = resolveComposition(definition, estimateTextWidth, data());
    const north = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && node.instanceKey === "North"
    );
    const ys = north.map((node) => node.cy);
    // Four dots at one x: one on the line, the rest spread within the frame.
    expect(ys.filter((y) => Math.abs(y - 20) < 1e-6)).toHaveLength(1);
    expect(new Set(ys.map((y) => Math.round(y))).size).toBe(4);
    for (const y of ys) expect(y).toBeGreaterThanOrEqual(5);
    for (const y of ys) expect(y).toBeLessThanOrEqual(35);
    const labels = resolved.nodes.filter(
      (node): node is TextNode =>
        node.type === "text" &&
        node.key.includes(":mark-1:") &&
        node.key.endsWith(":label")
    );
    const label = labels.find((node) => node.lines[0]!.text === "Bo")!;
    const bo = north.find((node) => node.glyph!.rowIds[0] === 1)!;
    expect(label.lines[0]!.y).toBeCloseTo(bo.cy - 5 - 1);
    // Spaced dots stay on the line.
    const south = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && node.instanceKey === "South"
    );
    expect(south.every((node) => Math.abs(node.cy - 60) < 1e-6)).toBe(true);
  });

  it("leaves dots on the line without the spread", () => {
    const resolved = resolveComposition(
      strip({ spread: undefined }),
      estimateTextWidth,
      data()
    );
    const north = resolved.nodes.filter(
      (node): node is CircleNode =>
        node.type === "circle" && node.instanceKey === "North"
    );
    expect(north.every((node) => Math.abs(node.cy - 20) < 1e-6)).toBe(true);
  });
});
