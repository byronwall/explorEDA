import { describe, expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { fitInputKey, planFitMarks, planScatterFits } from "./fitPlan";
import { fitLinear, formatCoefficient, formatPolynomial } from "./regression";
import type { datum } from "@/types/ChartTypes";

describe("linear least squares", () => {
  it("recovers a known line and its measures", () => {
    // y = 2x + 1 with residuals +1, −1, −1, +1.
    const fit = fitLinear([0, 1, 2, 3], [2, 2, 4, 8]);
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    expect(fit.slope).toBeCloseTo(2);
    expect(fit.intercept).toBeCloseTo(1);
    // SST = 24, SSE = 4.
    expect(fit.r2).toBeCloseTo(1 - 4 / 24);
    expect(fit.residualSe).toBeCloseTo(Math.sqrt(4 / 2));
    expect(fit.slopeSe).toBeCloseTo(Math.sqrt(2) / Math.sqrt(5));
  });

  it("keeps precision with large offsets", () => {
    const xs = [1e9, 1e9 + 1, 1e9 + 2];
    const fit = fitLinear(xs, [5, 7, 9]);
    expect(fit.ok && fit.slope).toBeCloseTo(2, 6);
    expect(fit.ok && fit.r2).toBeCloseTo(1, 6);
  });

  it("explains insufficient and singular inputs", () => {
    expect(fitLinear([1], [1])).toMatchObject({
      ok: false,
      reason: expect.stringContaining("at least 2 rows"),
    });
    expect(fitLinear([3, 3, 3], [1, 2, 3], "Dose")).toMatchObject({
      ok: false,
      reason: "Every Dose value is 3, so the slope is undefined.",
    });
  });

  it("reports an undefined R² for constant Y", () => {
    const fit = fitLinear([1, 2, 3], [4, 4, 4]);
    expect(fit.ok && fit.slope).toBe(0);
    expect(fit.ok && fit.r2).toBeUndefined();
  });
});

describe("equation text", () => {
  it("formats coefficients and signs", () => {
    expect(formatPolynomial([1, 2])).toBe("y = 2x + 1");
    expect(formatPolynomial([-5781.4, 49.69])).toBe("y = 49.7x − 5,781");
    expect(formatPolynomial([3, -0.5, 2.1])).toBe("y = 2.1x² − 0.5x + 3");
    expect(formatCoefficient(0.000123)).toBe("1.23e-4");
  });
});

/** Two groups (a, b) in one facet, as the scatter data layer supplies them. */
function fixture(chartIds?: number[]) {
  // Group a: y = x. Group b: y = 10 − 2x. Row 8 has no X.
  const rows: [datum, datum, string][] = [
    [0, 0, "a"],
    [1, 1, "a"],
    [2, 2, "a"],
    [3, 3, "a"],
    [0, 10, "b"],
    [1, 8, "b"],
    [2, 6, "b"],
    [3, 4, "b"],
    [null, 5, "b"],
  ];
  const ids = rows.map((_, index) => index);
  const settings = scatterPlotDefinition.createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  });
  Object.assign(settings, {
    xField: "x",
    yField: "y",
    colorField: "g",
    colorScaleId: "groups",
    regression: { method: "linear" },
  });
  const column = (index: number) =>
    Object.fromEntries(rows.map((row, id) => [id, row[index]!]));
  const snapshot: ScatterSnapshot = {
    revision: "1:1",
    allIds: ids,
    chartIds: chartIds ?? ids,
    filteredIds: chartIds ?? ids,
    xData: column(0),
    yData: column(1),
    colorData: column(2),
    fieldSettings: {},
    colorScale: {
      id: "groups",
      name: "g",
      type: "categorical",
      palette: ["#111111", "#222222"],
      mapping: new Map([
        ["a", "#111111"],
        ["b", "#222222"],
      ]),
    },
  };
  return { settings, snapshot };
}

describe("scatter fits", () => {
  it("fits each color group separately and reports exclusions", () => {
    const { settings, snapshot } = fixture();
    const plan = planScatter(settings, snapshot, 400, 300);
    const fits = planScatterFits(settings, snapshot, plan)!;
    expect(fits.fits.map((fit) => fit.label)).toEqual(["a", "b"]);
    const [a, b] = fits.fits;
    expect(a!.outcome.ok && a!.outcome.slope).toBeCloseTo(1);
    expect(b!.outcome.ok && b!.outcome.slope).toBeCloseTo(-2);
    expect(b!.outcome.ok && b!.outcome.intercept).toBeCloseTo(10);
    expect(b!.eligible).toBe(5);
    expect(b!.missingX).toBe(1);
    expect(b!.color).toBe("#222222");
    expect(planFitMarks(fits, plan)).toHaveLength(2);
  });

  it("adds an overall fit only when asked", () => {
    const { settings, snapshot } = fixture();
    settings.regression = { method: "linear", overall: true };
    const plan = planScatter(settings, snapshot, 400, 300);
    const fits = planScatterFits(settings, snapshot, plan)!;
    expect(fits.fits[0]).toMatchObject({
      id: "fit:overall",
      label: "All groups",
    });
    expect(fits.fits[0]!.outcome.n).toBe(8);
  });

  it("keeps coefficients when this chart brushes and refits after other filters", () => {
    const { settings, snapshot } = fixture();
    const plan = planScatter(settings, snapshot, 400, 300);
    const key = fitInputKey(settings, snapshot, plan);
    // Own brush: filters on this chart, a new live-items nonce, same eligible rows.
    const brushed = {
      ...settings,
      filters: [{ type: "range" as const, field: "x", min: 0, max: 1 }],
    };
    const brushedSnapshot = {
      ...snapshot,
      revision: "1:2",
      filteredIds: [0, 1, 4, 5],
    };
    const brushedPlan = planScatter(brushed, brushedSnapshot, 400, 300);
    expect(fitInputKey(brushed, brushedSnapshot, brushedPlan)).toBe(key);
    expect(
      planScatterFits(brushed, brushedSnapshot, brushedPlan)!.fits.map(
        (fit) => fit.outcome.ok && fit.outcome.slope
      )
    ).toEqual(
      planScatterFits(settings, snapshot, plan)!.fits.map(
        (fit) => fit.outcome.ok && fit.outcome.slope
      )
    );
    // Another chart removes group b's last two rows.
    const external = fixture([0, 1, 2, 3, 4, 5]);
    const externalPlan = planScatter(
      external.settings,
      external.snapshot,
      400,
      300
    );
    expect(
      fitInputKey(external.settings, external.snapshot, externalPlan)
    ).not.toBe(key);
    const b = planScatterFits(
      external.settings,
      external.snapshot,
      externalPlan
    )!.fits[1]!;
    expect(b.outcome.n).toBe(2);
    expect(b.outcome.ok && b.outcome.slope).toBeCloseTo(-2);
  });

  it("restricts fits to the facet's rows", () => {
    const { settings, snapshot } = fixture();
    const facetSnapshot = { ...snapshot, facetIds: [0, 1, 4] };
    settings.facet = {
      enabled: true,
      type: "wrap",
      rowVariable: "g",
      columnCount: 2,
    };
    const plan = planScatter(settings, facetSnapshot, 400, 300);
    const fits = planScatterFits(settings, facetSnapshot, plan)!;
    expect(fits.fits[0]!.outcome.n).toBe(2);
    expect(fits.fits[1]).toMatchObject({
      outcome: {
        ok: false,
        reason: expect.stringContaining("This group has 1"),
      },
    });
  });

  it("explains a categorical axis instead of fitting", () => {
    const { settings, snapshot } = fixture();
    settings.xField = "g";
    const plan = planScatter(
      settings,
      { ...snapshot, xData: snapshot.colorData },
      400,
      300
    );
    expect(
      planScatterFits(
        settings,
        { ...snapshot, xData: snapshot.colorData },
        plan
      )!.notice
    ).toMatch(/categorical/);
  });
});
