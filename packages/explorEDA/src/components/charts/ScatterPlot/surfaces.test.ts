import { describe, expect, it } from "vitest";
import type { datum } from "@/types/ChartTypes";
import { scatterPlotDefinition } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { hexBinFilters, planHexbins } from "./hexPlan";
import { planContours } from "./contourPlan";

/** A seeded two-cluster cloud, so results are repeatable. */
function cloud(n: number) {
  let seed = 7;
  const random = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const normal = () =>
    Math.sqrt(-2 * Math.log(random())) * Math.cos(2 * Math.PI * random());
  const x: datum[] = [];
  const y: datum[] = [];
  for (let i = 0; i < n; i++) {
    const center = i % 2 ? 10 : 0;
    x.push(center + normal());
    y.push(center + normal());
  }
  return { x, y };
}

function setup(
  x: datum[],
  y: datum[],
  display: "hexbin" | "contour",
  chartIds?: number[]
) {
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  Object.assign(settings, { xField: "x", yField: "y", display });
  const ids = x.map((_, i) => i);
  const col = (values: datum[]): Record<number, datum> =>
    Object.fromEntries(values.map((value, i) => [i, value]));
  const snapshot: ScatterSnapshot = {
    revision: "1:1",
    allIds: ids,
    chartIds: chartIds ?? ids,
    filteredIds: chartIds ?? ids,
    xData: col(x),
    yData: col(y),
    colorData: {},
    fieldSettings: {},
  };
  return { settings, snapshot };
}

describe("hexagonal bins", () => {
  it("counts every plotted row once and keeps membership across panel sizes", () => {
    const { x, y } = cloud(2000);
    const { settings, snapshot } = setup(x, y, "hexbin");
    const small = planHexbins(
      settings,
      snapshot,
      planScatter(settings, snapshot, 300, 240)
    )!;
    const large = planHexbins(
      settings,
      snapshot,
      planScatter(settings, snapshot, 900, 500)
    )!;
    expect(small.bins.reduce((sum, bin) => sum + bin.rowIds.length, 0)).toBe(
      2000
    );
    const members = (plan: typeof small) =>
      Object.fromEntries(
        plan.bins.map((bin) => [bin.id, bin.sourceIds.join(",")])
      );
    expect(members(large)).toEqual(members(small));
    expect(small.max).toBe(small.sourceMax);
  });

  it("finds the hexagon under a pixel and selects its exact rows", () => {
    const { x, y } = cloud(400);
    const { settings, snapshot } = setup(x, y, "hexbin");
    const plan = planScatter(settings, snapshot, 400, 300);
    const hex = planHexbins(settings, snapshot, plan)!;
    const bin = hex.bins[3]!;
    expect(hex.hexAt(bin.cx, bin.cy)).toBe(bin);
    const point = plan.points.find(
      (item) => item.sourceId === bin.sourceIds[0]
    )!;
    expect(hex.hexAt(point.x, point.y)).toBe(bin);
    const filters = hexBinFilters(settings, bin);
    expect(filters).toEqual([
      { type: "value", field: "__ID", values: bin.sourceIds },
    ]);
    expect(hexBinFilters({ ...settings, filters }, bin)).toEqual([]);
  });

  it("counts only rows that pass the other filters", () => {
    const { x, y } = cloud(400);
    const { settings, snapshot } = setup(x, y, "hexbin", [0, 1, 2, 3]);
    const hex = planHexbins(
      settings,
      snapshot,
      planScatter(settings, snapshot, 400, 300)
    )!;
    expect(hex.counted).toBe(4);
    expect(hex.sourceMax).toBeGreaterThan(4);
  });
});

describe("smoothed density", () => {
  it("draws nested levels whose row coverage shrinks as the threshold rises", () => {
    const { x, y } = cloud(1000);
    const { settings, snapshot } = setup(x, y, "contour");
    settings.contour = { levels: 5 };
    const contour = planContours(
      settings,
      planScatter(settings, snapshot, 400, 300)
    )!;
    expect(contour.levels).toHaveLength(5);
    const thresholds = contour.levels.map((level) => level.threshold);
    const coverage = contour.levels.map((level) => level.coverage);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
    expect([...coverage].sort((a, b) => b - a)).toEqual(coverage);
    expect(contour.levels.every((level) => level.path.startsWith("M"))).toBe(
      true
    );
    expect(contour.peak).toBeGreaterThan(0);
  });

  it("integrates to the row count, in rows per X unit × Y unit", () => {
    const { x, y } = cloud(1000);
    const { settings, snapshot } = setup(x, y, "contour");
    const plan = planScatter(settings, snapshot, 400, 300);
    const contour = planContours(settings, plan)!;
    // Riemann sum of the density over the plot, sampled through pixels.
    const [x0, x1] = plan.xScale.domain as [number, number];
    const [y0, y1] = plan.yScale.domain as [number, number];
    const steps = 120;
    let total = 0;
    for (let i = 0; i < steps; i++)
      for (let j = 0; j < steps; j++) {
        const value = contour.densityAt(
          ((i + 0.5) / steps) * plan.plotWidth,
          ((j + 0.5) / steps) * plan.plotHeight
        )!;
        expect(value).toBeGreaterThanOrEqual(0);
        total += value;
      }
    total *= ((x1 - x0) * (y1 - y0)) / steps ** 2;
    expect(total).toBeGreaterThan(950);
    expect(total).toBeLessThan(1050);
  });

  it("scales Scott's bandwidth and explains a constant field", () => {
    const { x, y } = cloud(500);
    const { settings, snapshot } = setup(x, y, "contour");
    const base = planContours(
      settings,
      planScatter(settings, snapshot, 400, 300)
    )!;
    settings.contour = { bandwidth: 2 };
    const wide = planContours(
      settings,
      planScatter(settings, snapshot, 400, 300)
    )!;
    expect(wide.bandwidth[0]).toBeCloseTo(base.bandwidth[0] * 2);
    expect(wide.peak).toBeLessThan(base.peak);
    const flat = setup(
      x,
      x.map(() => 3),
      "contour"
    );
    expect(
      planContours(
        flat.settings,
        planScatter(flat.settings, flat.snapshot, 400, 300)
      )!.notice
    ).toMatch(/no spread/);
  });
});
