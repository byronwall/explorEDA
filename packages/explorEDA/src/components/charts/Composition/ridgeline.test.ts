import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import {
  createEmptyComposition,
  type CompositionDefinition,
  type DensityMark,
  type UnitElement,
} from "./compositionTypes";
import { estimateTextWidth } from "./measureText";
import { resolveComposition, type AreaNode } from "./resolveComposition";
import type { CompositionData } from "./resolveUnit";
import { isCompositionDefinition } from "./validateComposition";

// Two months of daily temperatures: January cold and tight, July warm and
// spread out; one day without a reading.
const rows: Record<string, datum>[] = [];
for (let day = 0; day < 20; day += 1) {
  rows.push({ Month: "January", Order: 1, Temp: 20 + (day % 5) });
  rows.push({ Month: "July", Order: 7, Temp: 60 + (day % 10) * 3 });
}
rows.push({ Month: "July", Order: 7, Temp: null });
const all = rows.map((_, id) => id);
const data = (liveIds = all): CompositionData => ({
  allIds: all,
  liveIds,
  column: (field) =>
    Object.fromEntries(rows.map((row, id) => [id, row[field]])),
});
const density: DensityMark = {
  type: "density",
  id: "mark-1",
  name: "Temperatures",
  xScaleId: "n-1",
  height: "shared",
  fill: "#999",
  opacity: 0.8,
  stroke: "#000",
};
function ridges(
  patch: Partial<DensityMark> = {},
  gap = -20
): CompositionDefinition {
  const unit: UnitElement = {
    id: "unit-1",
    kind: "unit",
    name: "Months",
    x: 0,
    y: 0,
    frame: { width: 300, height: 60 },
    label: { show: true, width: 80, fontSize: 10 },
    axis: true,
    marks: [{ ...density, ...patch }],
    repeat: {
      field: "Month",
      arrangement: "rows",
      columns: 1,
      gap,
      order: "value",
      orderCalcId: "calc-1",
      limit: 12,
    },
  };
  return {
    ...createEmptyComposition(),
    scales: [
      {
        id: "n-1",
        kind: "numeric",
        name: "Temp",
        field: "Temp",
        domain: "shared",
        zero: false,
        nice: true,
      },
    ],
    calculations: [
      {
        id: "calc-1",
        name: "Order",
        aggregation: "max",
        field: "Order",
        population: "repeat",
        filters: "ignore",
      },
    ],
    elements: [unit],
  };
}
// In calendar order; the drawn order runs bottom first so upper ridges sit in front.
const areas = (definition: CompositionDefinition, liveIds?: number[]) =>
  resolveComposition(definition, estimateTextWidth, data(liveIds))
    .nodes.filter((node): node is AreaNode => node.type === "area")
    .sort(
      (a, b) =>
        (a.instanceKey === "January" ? -1 : 1) -
        (b.instanceKey === "January" ? -1 : 1)
    );

describe("density marks", () => {
  it("draws one curve per repeat on a shared grid, from the baseline, outlined", () => {
    const definition = ridges();
    expect(isCompositionDefinition(definition)).toBe(true);
    const drawn = areas(definition);
    expect(drawn.map((node) => node.instanceKey)).toEqual(["January", "July"]);
    const january = drawn[0]!;
    expect(january.segments[0]).toHaveLength(96);
    expect(january.stroke).toBe("#000");
    const instance = resolveComposition(definition, estimateTextWidth, data())
      .elements[0]!.instances![0]!;
    for (const vertex of january.segments[0]!) {
      expect(vertex.y0).toBeCloseTo(instance.frame.y + instance.frame.height);
      expect(vertex.y1).toBeLessThanOrEqual(vertex.y0 + 1e-9);
    }
    // The curve leaves out the day without a reading.
    expect(drawn[1]!.band.rowIds).toHaveLength(20);
  });

  it("shares one height so the tighter month peaks higher, or fits each repeat", () => {
    const shared = areas(ridges());
    const peakHeight = (node: AreaNode) =>
      Math.max(...node.segments[0]!.map((vertex) => vertex.y0 - vertex.y1));
    // January's readings cluster, so its density peaks at the frame's full height.
    expect(peakHeight(shared[0]!)).toBeCloseTo(60);
    expect(peakHeight(shared[1]!)).toBeLessThan(60);
    const fitted = areas(ridges({ height: "instance" }));
    expect(peakHeight(fitted[1]!)).toBeCloseTo(60);
  });

  it("overlaps rows through a negative gap and keeps calendar order", () => {
    const resolved = resolveComposition(ridges(), estimateTextWidth, data());
    const instances = resolved.elements[0]!.instances!;
    expect(instances.map((item) => item.key)).toEqual(["January", "July"]);
    expect(instances[1]!.layoutOrigin.y).toBe(60 - 20);
    // The lower ridge draws first, so the upper one sits in front.
    const drawnOrder = resolved.nodes
      .filter((node): node is AreaNode => node.type === "area")
      .map((node) => node.instanceKey);
    expect(drawnOrder).toEqual(["July", "January"]);
    // No y ticks for a density, only the shared temperature axis under the last row.
    const yTicks = resolved.nodes.filter(
      (node) => node.type === "text" && node.key.includes(":axis:y:")
    );
    expect(yTicks).toHaveLength(0);
    const xTicks = resolved.nodes.filter(
      (node) => node.type === "text" && node.key.includes(":axis:x:")
    );
    expect(xTicks.length).toBeGreaterThan(0);
  });

  it("takes an explicit bandwidth and recomputes from filtered rows", () => {
    const wide = areas(ridges({ bandwidth: 30 }));
    const narrow = areas(ridges({ bandwidth: 1 }));
    const spread = (node: AreaNode) =>
      node.segments[0]!.filter((vertex) => vertex.y0 - vertex.y1 > 1).length;
    expect(spread(wide[0]!)).toBeGreaterThan(spread(narrow[0]!));
    expect(wide[0]!.band.upperField).toContain("bandwidth 30");
    // Filtering July down to one day leaves it a single narrow bump.
    const julyOnly = rows.findIndex((row) => row.Month === "July");
    const filtered = areas(ridges(), [
      ...all.filter((id) => rows[id]!.Month === "January"),
      julyOnly,
    ]);
    expect(filtered[1]!.band.rowIds).toEqual([julyOnly]);
  });
});
