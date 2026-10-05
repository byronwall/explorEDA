import { describe, expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { pairedStats, planPairedSummary } from "./pairedSummary";
import type { datum } from "@/types/ChartTypes";
import { marginalBinFilters, planMarginals } from "./marginalPlan";

function setup(x: (number | null)[], y: (number | null)[], groups?: string[]) {
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  Object.assign(settings, { xField: "x", yField: "y", summary: true });
  if (groups) Object.assign(settings, { colorField: "g", colorScaleId: "s" });
  const ids = x.map((_, i) => i);
  const col = (values: datum[]): Record<number, datum> =>
    Object.fromEntries(values.map((v, i) => [i, v]));
  const snapshot: ScatterSnapshot = {
    revision: "1:1",
    allIds: ids,
    chartIds: ids,
    filteredIds: ids,
    xData: col(x),
    yData: col(y),
    colorData: col(groups ?? []),
    fieldSettings: {},
    colorScale: groups
      ? {
          id: "s",
          name: "g",
          type: "categorical",
          palette: ["#111111", "#222222"],
          mapping: new Map([
            ["a", "#111111"],
            ["b", "#222222"],
          ]),
        }
      : undefined,
  };
  return { settings, snapshot };
}

describe("paired summaries", () => {
  it("uses n − 1 for spread and covariance and reports exclusions", () => {
    const stats = pairedStats(
      { id: "all", label: "All", color: "", ids: [0, 1, 2, 3, 4] },
      setup([1, 2, 3, 4, null], [2, 4, 5, 9, 1]).snapshot,
      "pooled"
    );
    expect(stats.pairs).toBe(4);
    expect(stats.missingX).toBe(1);
    expect(stats.meanX).toBe(2.5);
    expect(stats.meanY).toBe(5);
    // var X = 5/3; var Y = 26/3; cov = 11/3.
    expect(stats.covariance![0][0]).toBeCloseTo(5 / 3);
    expect(stats.covariance![1][1]).toBeCloseTo(26 / 3);
    expect(stats.covariance![0][1]).toBeCloseTo(11 / 3);
    expect(stats.r).toBeCloseTo(11 / Math.sqrt(5 * 26));
  });

  it("explains an undefined correlation for a constant field", () => {
    const stats = pairedStats(
      { id: "all", label: "All", color: "", ids: [0, 1, 2] },
      setup([1, 1, 1], [1, 2, 3]).snapshot,
      "pooled"
    );
    expect(stats.r).toBeUndefined();
    expect(stats.note).toMatch(/constant/);
  });

  it("summarizes pooled rows and each color group", () => {
    const { settings, snapshot } = setup(
      [0, 1, 2, 0, 1, 2],
      [0, 1, 2, 2, 1, 0],
      ["a", "a", "a", "b", "b", "b"]
    );
    const plan = planScatter(settings, snapshot, 400, 300);
    const summary = planPairedSummary(settings, snapshot, plan)!;
    expect(summary.pooled!.pairs).toBe(6);
    expect(summary.pooled!.r).toBeCloseTo(0);
    expect(summary.groups.map((group) => [group.label, group.r])).toEqual([
      ["a", 1],
      ["b", -1],
    ]);
  });
});

describe("marginal histograms", () => {
  it("conserves plotted points and splits the chart's own selection", () => {
    const x = [0, 1, 2, 3, 4, 5, 6, 7, 8, 10];
    const { settings, snapshot } = setup(
      x,
      x.map((v) => v * 2)
    );
    settings.marginals = { bins: 5 };
    settings.filters = [{ type: "range", field: "x", min: 0, max: 3 }];
    const plan = planScatter(settings, snapshot, 400, 300);
    const marginals = planMarginals(settings, plan)!;
    for (const axis of ["x", "y"] as const) {
      const bins = marginals.bins.filter((bin) => bin.axis === axis);
      expect(bins.reduce((sum, bin) => sum + bin.sourceIds.length, 0)).toBe(10);
      expect(bins.reduce((sum, bin) => sum + bin.selected, 0)).toBe(4);
    }
    expect(marginals.split).toBe(true);
    // Bands sit outside the plot: above it and to its right.
    const top = marginals.bins.find((bin) => bin.axis === "x")!;
    expect(top.y + top.height).toBeLessThanOrEqual(0);
    const right = marginals.bins.find((bin) => bin.axis === "y")!;
    expect(right.x).toBeGreaterThan(plan.plotWidth);
  });

  it("toggles a range filter on the bin's field", () => {
    const { settings, snapshot } = setup([0, 1, 2, 3], [0, 1, 2, 3]);
    settings.marginals = { bins: 5 };
    const plan = planScatter(settings, snapshot, 400, 300);
    const bin = planMarginals(settings, plan)!.bins[0]!;
    const filters = marginalBinFilters(settings, bin);
    expect(filters).toEqual([
      { type: "range", field: "x", min: bin.bounds[0], max: bin.bounds[1] },
    ]);
    expect(marginalBinFilters({ ...settings, filters }, bin)).toEqual([]);
  });
});
