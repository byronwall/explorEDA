import { describe, expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import {
  brushFilters,
  bubbleSamples,
  paddedDomain,
  planScatter,
} from "./scatterPlan";
import type { datum } from "@/types/ChartTypes";
import type { ScaleBand } from "d3-scale";
import { buildScale, describeScale } from "../Axis/axisPlan";
import { numericScale } from "../Axis/numericScale";

function planFor(
  x: datum[],
  y: datum[],
  scaleType: "linear" | "symlog" = "linear",
  filters: ScatterFilters = []
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
  settings.filters = filters;
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

type ScatterFilters = ReturnType<
  typeof scatterPlotDefinition.createDefaultSettings
>["filters"];

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

describe("categorical scatter axes", () => {
  const x = ["b", "a", "b", null, "a", "c"];
  const y = [1, 2, 3, 4, 5, 6];

  it("gives a text field one band per category, missing last", () => {
    const plan = planFor(x, y);
    expect(plan.xScale.type).toBe("band");
    expect(plan.xScale.domain).toEqual(["a", "b", "c", "(missing)"]);
    expect(plan.yScale.type).toBe("linear");
    expect(plan.points).toHaveLength(6);
    expect(plan.exclusions).toEqual([]);
  });

  it("jitters points inside their band, the same way every time", () => {
    const plan = planFor(x, y);
    const again = planFor(x, y);
    expect(plan.points.map((point) => point.x)).toEqual(
      again.points.map((point) => point.x)
    );
    const scale = buildScale(plan.xScale) as ScaleBand<string>;
    for (const point of plan.points) {
      const start = scale(
        point.xValue == null ? "(missing)" : String(point.xValue)
      )!;
      expect(point.x).toBeGreaterThanOrEqual(start);
      expect(point.x).toBeLessThanOrEqual(start + scale.bandwidth());
    }
    const bColumn = plan.points.filter((point) => point.xValue === "b");
    expect(bColumn[0]!.x).not.toBe(bColumn[1]!.x);
  });

  it("labels band ticks with category values", () => {
    const plan = planFor(x, y);
    const labels = plan.axes.x.guides
      .filter((guide) => guide.role === "tick")
      .map((guide) => guide.label?.fullText);
    expect(labels).toEqual(["a", "b", "c", "(missing)"]);
  });

  it("keeps the title on a band Y axis", () => {
    const plan = planFor(y, x);
    expect(plan.yScale.type).toBe("band");
    expect(plan.axes.y.guides.some((guide) => guide.role === "label")).toBe(
      true
    );
  });

  it("brushes bands into a category filter and restores the brush from it", () => {
    const plan = planFor(x, y);
    const scale = buildScale(plan.xScale) as ScaleBand<string>;
    const center = (label: string) => scale(label)! + scale.bandwidth() / 2;
    const [xFilter, yFilter] = brushFilters(plan, [
      [center("a"), 0],
      [center("b"), plan.plotHeight],
    ]);
    expect(xFilter).toEqual({ type: "value", field: "x", values: ["a", "b"] });
    expect(yFilter).toMatchObject({ type: "range", field: "y" });

    const filtered = planFor(x, y, "linear", [xFilter!, yFilter!]);
    const gap = scale.step() - scale.bandwidth();
    expect(filtered.brushExtent?.[0][0]).toBeCloseTo(scale("a")! - gap / 2);
    expect(filtered.brushExtent?.[1][0]).toBeCloseTo(
      scale("b")! + scale.step() - gap / 2
    );
    expect(
      filtered.points
        .filter((point) => point.passesOwnFilter)
        .map((point) => point.xValue)
        .sort()
    ).toEqual(["a", "a", "b", "b"]);
    const [again] = brushFilters(filtered, filtered.brushExtent!);
    expect(again).toEqual(xFilter);
  });
});

describe("empty scatter", () => {
  it("explains a field with no values", () => {
    const plan = planFor([1, 2, 3], [null, null, null]);
    expect(plan.points).toHaveLength(0);
    expect(plan.emptyMessage).toBe("y has no values.");
    // Gaps in the other field do not hide the real cause.
    expect(planFor([1, null], [null, null]).emptyMessage).toBe(
      "y has no values."
    );
  });

  it("explains rows that never share numeric values", () => {
    const plan = planFor([1, null], [null, 2]);
    expect(plan.emptyMessage).toBe(
      "No row has a plottable value for both x and y."
    );
  });

  it("stays quiet when points draw", () => {
    expect(planFor([1, 2], [3, 4]).emptyMessage).toBeUndefined();
  });
});

describe("points past an axis bound", () => {
  function bounded(
    limits: { min?: number; max?: number },
    filtered?: number[]
  ) {
    const settings = scatterPlotDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.xField = "x";
    settings.yField = "y";
    settings.xAxis = { ...settings.xAxis, limits };
    const x = [1, 2, 3, 4, 5, 6, 7, 8];
    const ids = x.map((_, index) => index);
    return planScatter(
      settings,
      {
        revision: "test",
        allIds: ids,
        chartIds: filtered ?? ids,
        filteredIds: filtered ?? ids,
        xData: Object.fromEntries(x.map((value, index) => [index, value])),
        yData: Object.fromEntries(x.map((value, index) => [index, value])),
        colorData: {},
        fieldSettings: {},
      },
      400,
      300
    );
  }

  it("counts drawn points past each bound on the axis plan", () => {
    const plan = bounded({ min: 2.5, max: 6 });
    expect(plan.axes.x.hidden?.low).toMatchObject({ count: 2, at: 2.5 });
    expect(plan.axes.x.hidden?.high).toMatchObject({ count: 2, at: 6 });
    expect(plan.axes.y.hidden).toBeUndefined();
    // Bounds only change the view: every point is still planned.
    expect(plan.points).toHaveLength(8);
  });

  it("reports nothing when a bound hides no point", () => {
    expect(bounded({ max: 20 }).axes.x.hidden).toBeUndefined();
    expect(bounded({}).axes.x.hidden).toBeUndefined();
  });

  it("counts only the rows other charts leave in, on a domain that stays put", () => {
    const all = bounded({ max: 6 });
    const some = bounded({ max: 6 }, [0, 1, 6]);
    expect(some.axes.x.hidden?.high?.count).toBe(1);
    expect(some.axes.x.scale.domain).toEqual(all.axes.x.scale.domain);
  });
});

describe("log scatter axes", () => {
  function logPlan(x: datum[]) {
    const settings = scatterPlotDefinition.createDefaultSettings({
      x: 0,
      y: 0,
      w: 4,
      h: 4,
    });
    settings.xField = "x";
    settings.yField = "y";
    settings.xAxis = { ...settings.xAxis, scaleType: "log" };
    const ids = x.map((_, index) => index);
    return planScatter(
      settings,
      {
        revision: "test",
        allIds: ids,
        chartIds: ids,
        filteredIds: ids,
        xData: Object.fromEntries(x.map((value, index) => [index, value])),
        yData: Object.fromEntries(x.map((_, index) => [index, index + 1])),
        colorData: {},
        fieldSettings: {},
      },
      400,
      300
    );
  }

  it("spans only values above zero and leaves the rest out, counted", () => {
    const plan = logPlan([-5, 0, 1, 10, 1000]);
    expect(plan.xScale.type).toBe("log");
    expect(plan.xScale.domain[0]).toBeGreaterThan(0);
    expect(plan.points).toHaveLength(3);
    expect(plan.exclusions.map((item) => item.reason)).toEqual([
      "nonpositive-x",
      "nonpositive-x",
    ]);
    expect(plan.axes.x.hidden?.nonpositive).toEqual({
      count: 2,
      unit: ["row", "rows"],
    });
    expect(plan.axes.x.labelText).toMatch(/ · log$/);
  });

  it("labels decades rather than every step", () => {
    const plan = logPlan([1, 10, 100, 1000, 10000, 100000]);
    expect(plan.axes.x.ticks.candidates.length).toBeLessThanOrEqual(8);
  });

  it("explains a chart whose values are all at or below zero", () => {
    expect(logPlan([0, -1]).emptyMessage).toMatch(
      /log scale needs values above zero/
    );
  });

  it("keeps a saved log linear where a chart does not allow it", () => {
    const scale = numericScale({ scaleType: "log" });
    expect(describeScale(scale, "log").type).toBe("linear");
    expect(describeScale(numericScale({ scaleType: "log" }, true)).type).toBe(
      "log"
    );
  });
});

describe("bubbleSamples", () => {
  it("names round sizes under a quarter, a half, and the largest", () => {
    expect(bubbleSamples(11964.716899999998)).toEqual([2000, 5000, 10000]);
    expect(bubbleSamples(1438.069596)).toEqual([200, 500, 1000]);
    expect(bubbleSamples(0)).toEqual([0]);
  });
});
