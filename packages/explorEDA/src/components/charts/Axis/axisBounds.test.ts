import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileDocument } from "@/lib/dsl/compile";
import { exportDocument } from "@/lib/dsl/export";
import { validateSavedData } from "@/utils/saveDataUtils";
import { planScatterAxis } from "../ScatterPlot/scatterAxis";
import { boundedDomain, boundsInverted, hasAxisBounds } from "./axisBounds";

beforeAll(() => registerAllCharts());

describe("boundedDomain", () => {
  it("draws the automatic domain until a limit is set", () => {
    expect(boundedDomain([0, 10])).toEqual([0, 10]);
    expect(boundedDomain([0, 10], {})).toEqual([0, 10]);
    // The legacy placeholder in every saved chart is never read.
    expect(boundedDomain([0, 10], { min: 0, max: 100 })).toEqual([0, 10]);
    expect(hasAxisBounds({ min: 0, max: 100 })).toBe(false);
  });

  it("replaces only the sides that are set", () => {
    expect(boundedDomain([0, 10], { limits: { min: 2 } })).toEqual([2, 10]);
    expect(boundedDomain([0, 10], { limits: { max: 4 } })).toEqual([0, 4]);
    expect(boundedDomain([0, 10], { limits: { min: 2, max: 4 } })).toEqual([
      2, 4,
    ]);
  });

  it("keeps the data's span beside a limit that passes the other side", () => {
    expect(boundedDomain([0, 10], { limits: { min: 20 } })).toEqual([20, 30]);
    expect(boundedDomain([0, 10], { limits: { max: -5 } })).toEqual([-15, -5]);
  });

  it("ignores inverted limits, which the settings never apply", () => {
    const axis = { limits: { min: 5, max: 5 } };
    expect(boundsInverted(axis)).toBe(true);
    expect(boundedDomain([0, 10], axis)).toEqual([0, 10]);
  });
});

describe("scatter axis limits", () => {
  const ids = [0, 1, 2, 3];
  const data = { 0: 1, 1: 2, 2: 3, 3: 100 };

  it("zooms the axis without dropping a row", () => {
    const axis = planScatterAxis({
      ids,
      data,
      axis: { limits: { min: 0, max: 4 } },
      range: [0, 400],
    });
    expect(axis.kind).toBe("numeric");
    if (axis.kind !== "numeric") return;
    expect(axis.domain).toEqual([0, 4]);
    // The data bounds still describe every row, the outlier included.
    expect(axis.bounds).toEqual([1, 100]);
    expect(axis.scale(2)).toBe(200);
    // The outlier lands outside the plot, where the clip hides it.
    expect(axis.scale(100)).toBeGreaterThan(400);
  });
});

describe("saving and text", () => {
  const rows = [
    { Revenue: 10, Margin: 2 },
    { Revenue: 20, Margin: 5 },
  ];

  it("reads x.min and x.max from dashboard text and writes them back", () => {
    const { settings } = compileDocument(
      'scatter x=Revenue y=Margin x.min=5 x.max=15 y.max=4 title="Zoomed"',
      { rows }
    );
    const chart = settings.charts[0]!;
    expect(chart.xAxis.limits).toEqual({ min: 5, max: 15 });
    expect(chart.yAxis.limits).toEqual({ max: 4 });

    const { text } = exportDocument(settings, { rows });
    const rebuilt = compileDocument(text, { rows }).settings.charts[0]!;
    expect(rebuilt.xAxis.limits).toEqual({ min: 5, max: 15 });
    expect(rebuilt.yAxis.limits).toEqual({ max: 4 });
  });

  it("accepts saved limits and rejects ones that are not numbers", () => {
    const { settings } = compileDocument("scatter x=Revenue y=Margin", {
      rows,
    });
    const withLimits = structuredClone(settings);
    withLimits.charts[0]!.xAxis.limits = { min: 1 };
    expect(validateSavedData(withLimits)).toBe(true);
    const broken = structuredClone(settings);
    (broken.charts[0]!.xAxis as Record<string, unknown>).limits = {
      min: "1",
    };
    expect(validateSavedData(broken)).toBe(false);
  });
});
