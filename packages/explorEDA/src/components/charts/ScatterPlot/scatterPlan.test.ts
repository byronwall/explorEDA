import { describe, expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { paddedDomain, planScatter } from "./scatterPlan";

function planFor(
  x: number[],
  y: number[],
  scaleType: "linear" | "symlog" = "linear"
) {
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  settings.xField = "x";
  settings.yField = "y";
  settings.xAxis = { ...settings.xAxis, scaleType };
  settings.yAxis = { ...settings.yAxis, scaleType };
  const ids = x.map((_, index) => index);
  return planScatter(
    settings,
    {
      revision: "test",
      allIds: ids,
      chartIds: ids,
      filteredIds: ids,
      xData: Object.fromEntries(x.map((value, index) => [index, value])),
      yData: Object.fromEntries(y.map((value, index) => [index, value])),
      colorData: {},
      fieldSettings: {},
    },
    400,
    300
  );
}

function expectPointsInside(plan: ReturnType<typeof planFor>) {
  for (const point of plan.points) {
    expect(point.x - point.radius).toBeGreaterThanOrEqual(0);
    expect(point.x + point.radius).toBeLessThanOrEqual(plan.plotWidth);
    expect(point.y - point.radius).toBeGreaterThanOrEqual(0);
    expect(point.y + point.radius).toBeLessThanOrEqual(plan.plotHeight);
  }
}

describe("scatter domain", () => {
  it("pads linear extents by 10% on each side", () => {
    expect(paddedDomain([0, 10], "linear")).toEqual([-1, 11]);
  });

  it("gives a constant field a visible span", () => {
    expect(paddedDomain([5, 5], "linear")).toEqual([4.5, 5.5]);
  });

  it("pads symlog extents below the minimum as well as above the maximum", () => {
    const [low, high] = paddedDomain([0, 1000], "symlog");
    expect(low).toBeLessThan(0);
    expect(high).toBeGreaterThan(1000);
  });

  it("keeps edge points fully inside the plot on linear and symlog axes", () => {
    expectPointsInside(planFor([0, 5, 10], [0, 50, 100]));
    expectPointsInside(planFor([0, 50, 5000], [0, 3, 100000], "symlog"));
    expectPointsInside(planFor([7, 7], [3, 3]));
  });
});
