import { describe, expect, it } from "vitest";
import { scatterPlotDefinition } from "./definition";
import { planScatter, type ScatterSnapshot } from "./scatterPlan";
import { fitInputKey, planFitMarks, planScatterFits } from "./fitPlan";
import {
  fitLinear,
  fitLoess,
  fitEquation,
  fitPolynomial,
  formatCoefficient,
  formatPolynomial,
  LOESS_VERTICES,
  type LinearFit,
} from "./regression";
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

/** Offsets whose X values double precision stores exactly. */
const u = [-2, -1, 0, 1, 2];
const held = [-1.5, -0.5, 0.5, 1.5];
const line = (x: number) => 1.234567 + 0.234567 * x;
const quad = (x: number) => 1.234567 + 0.234567 * x + 0.034567 * x * x;
// Residuals [1, −4, 6, −4, 1] / 10000 are orthogonal to 1, u, u².
const noisyQuad = [0.903801, 1.034167, 1.235167, 1.503301, 1.842069];

/** Evaluates equation text as a reader would, from its displayed digits. */
function evaluateEquation(text: string) {
  const powers: Record<string, string> = { "²": "**2", "³": "**3" };
  const expression = text
    .replace(/^y = /, "")
    .replaceAll("−", "-")
    .replaceAll(",", "")
    .replace(/[²³]/g, (digit) => powers[digit]!)
    .replace(/(\d)(x|\()/g, "$1*$2");
  return new Function("x", `return ${expression}`) as (x: number) => number;
}

/** Residual standard error from the fit's own predictions. */
function directResidualSe(
  fit: { predict: (x: number) => number },
  xs: number[],
  ys: number[],
  parameters: number
) {
  const sse = xs.reduce((sum, x, i) => sum + (ys[i]! - fit.predict(x)) ** 2, 0);
  return Math.sqrt(sse / (xs.length - parameters));
}

describe("fits far from X = 0", () => {
  it("predicts an exact line on timestamps near 2³⁰ and reports matching residuals", () => {
    const xs = u.map((x) => 2 ** 30 + x * 2 ** -20);
    const fit = fitLinear(xs, u.map(line));
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    for (const x of [...u, ...held])
      expect(fit.predict(2 ** 30 + x * 2 ** -20)).toBeCloseTo(line(x), 12);
    expect(fit.residualSe).toBeCloseTo(
      directResidualSe(fit, xs, u.map(line), 2),
      12
    );
    expect(fit.r2).toBeCloseTo(1, 12);
    expect(fit.r).toBeCloseTo(1, 12);
    const equation = evaluateEquation(fitEquation(fit)!);
    for (const x of [...u, ...held])
      expect(Math.abs(equation(2 ** 30 + x * 2 ** -20) - line(x))).toBeLessThan(
        0.01
      );
  });

  it("keeps residual SE, slope SE, and correlation consistent on a noisy line", () => {
    const xs = [1, 2, 3, 4, 5, 6].map((x) => 1e9 + x);
    const ys = [2.1, 3.9, 6.2, 7.8, 10.1, 12.2];
    const fit = fitLinear(xs, ys);
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    const se = directResidualSe(fit, xs, ys, 2);
    expect(fit.residualSe).toBeCloseTo(se, 12);
    // Σ(x − x̄)² of 1..6 is 17.5.
    expect(fit.slopeSe).toBeCloseTo(se / Math.sqrt(17.5), 12);
    const my = ys.reduce((a, b) => a + b) / ys.length;
    const sst = ys.reduce((sum, y) => sum + (y - my) ** 2, 0);
    expect(fit.r2).toBeCloseTo(1 - (se ** 2 * 4) / sst, 12);
    expect(fit.r! ** 2).toBeCloseTo(fit.r2!, 12);
  });

  it("states a translated quadratic so its displayed digits reproduce the curve", () => {
    const xs = u.map((x) => 1e9 + x);
    const fit = fitPolynomial(xs, noisyQuad, 2);
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    for (const x of [...u, ...held])
      expect(fit.predict(1e9 + x)).toBeCloseTo(quad(x), 12);
    expect(fit.predict(1e9 + 0.5)).toBeCloseTo(1.36049225, 12);
    expect(fit.residualSe).toBeCloseTo(
      directResidualSe(fit, xs, noisyQuad, 3),
      15
    );
    const text = fitEquation(fit)!;
    expect(text).toBe(
      "y = 0.0346(x − 1,000,000,000)² + 0.235(x − 1,000,000,000) + 1.23"
    );
    const equation = evaluateEquation(text);
    for (const x of [...u, ...held])
      expect(Math.abs(equation(1e9 + x) - quad(x))).toBeLessThan(0.01);
  });

  it("states the same curve in metres around a metre center", () => {
    const xs = u.map((x) => (1e9 + x) / 1000);
    const fit = fitPolynomial(xs, noisyQuad, 2);
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    const equation = evaluateEquation(fitEquation(fit)!);
    for (const x of [...u, ...held])
      expect(Math.abs(equation((1e9 + x) / 1000) - quad(x))).toBeLessThan(0.01);
  });

  it("keeps the plain form when X sits near zero", () => {
    const fit = fitPolynomial(u, noisyQuad, 2);
    expect(fit.ok && fitEquation(fit)).toBe("y = 0.0346x² + 0.235x + 1.23");
    const line = fitLinear([1e9, 1e9 + 1, 1e9 + 2], [5, 7, 9]);
    expect(line.ok && fitEquation(line)).toBe("y = 2x − 1,999,999,995");
  });

  it("keeps repeated-X and minimum-row fits available", () => {
    const repeated = [-2, -1, 0, 1, 2, 0, 1];
    expect(fitPolynomial(repeated, repeated.map(quad), 2).ok).toBe(true);
    for (let degree = 2; degree <= 6; degree++) {
      const xs = Array.from({ length: degree + 1 }, (_, i) => i - degree / 2);
      const fit = fitPolynomial(xs, xs.map(quad), degree);
      expect(fit.ok).toBe(true);
      if (fit.ok) expect(fit.residualSe).toBeUndefined();
    }
    expect(
      fitPolynomial(
        [-1, 0, 1].map((x) => 2 ** 54 + x),
        [1, 2, 3],
        2
      ).ok
    ).toBe(false);
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
    expect((a!.outcome as LinearFit).slope).toBeCloseTo(1);
    expect((b!.outcome as LinearFit).slope).toBeCloseTo(-2);
    expect((b!.outcome as LinearFit).intercept).toBeCloseTo(10);
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
        (fit) => (fit.outcome as LinearFit).slope
      )
    ).toEqual(
      planScatterFits(settings, snapshot, plan)!.fits.map(
        (fit) => (fit.outcome as LinearFit).slope
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
    expect((b.outcome as LinearFit).slope).toBeCloseTo(-2);
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

describe("polynomial least squares", () => {
  it("recovers an exact quadratic and its coefficients in powers of x", () => {
    const xs = [-2, -1, 0, 1, 2, 3, 100];
    const fit = fitPolynomial(
      xs,
      xs.map((x) => 3 - 0.5 * x + 2 * x * x),
      2
    );
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    expect(fit.coefficients[0]).toBeCloseTo(3, 6);
    expect(fit.coefficients[1]).toBeCloseTo(-0.5, 6);
    expect(fit.coefficients[2]).toBeCloseTo(2, 6);
    expect(fit.r2).toBeCloseTo(1, 9);
    expect(fit.predict(10)).toBeCloseTo(198, 6);
  });

  it("matches the normal-equation solution for noisy cubic data", () => {
    const xs = [0, 1, 2, 3, 4, 5, 6, 7];
    const ys = [1, 3, 2, 5, 4, 8, 13, 21];
    const fit = fitPolynomial(xs, ys, 3);
    // Reference: exact rational solution of the normal equations.
    expect(
      fit.ok && fit.coefficients.map((c: number) => Number(c.toFixed(4)))
    ).toEqual([1.1061, 2.0476, -0.7868, 0.1288]);
  });

  it("needs more distinct X values than the degree", () => {
    expect(fitPolynomial([1, 1, 2, 2], [1, 2, 3, 4], 2, "Dose")).toMatchObject({
      ok: false,
      reason:
        "A degree 2 polynomial needs at least 3 distinct Dose values. This group has 2.",
    });
  });
});

describe("LOESS", () => {
  it("reproduces a line exactly, since each local fit is linear", () => {
    const xs = Array.from({ length: 30 }, (_, i) => i);
    const fit = fitLoess(
      xs,
      xs.map((x) => 4 - 2 * x),
      0.5
    );
    expect(fit.ok).toBe(true);
    if (!fit.ok) return;
    expect(fit.neighbors).toBe(15);
    expect(fit.predict(12.5)).toBeCloseTo(-21, 9);
    expect(fit.rmse).toBeCloseTo(0, 9);
  });

  it("follows a curve that a line misses and handles repeated X", () => {
    const xs = Array.from({ length: 60 }, (_, i) => (i % 30) / 3);
    const ys = xs.map((x) => Math.sin(x));
    const loess = fitLoess(xs, ys, 0.3);
    const line = fitLinear(xs, ys);
    expect(loess.ok && line.ok && loess.r2! > line.r2! + 0.5).toBe(true);
    // An independent brute-force local fit: sort every row by distance.
    const reference = (x0: number) => {
      const k = Math.ceil(0.3 * xs.length);
      const near = xs
        .map((x, i) => ({ x, y: ys[i]!, d: Math.abs(x - x0) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, k);
      const h = near[k - 1]!.d;
      const w = near.map(({ d }) => (d < h ? (1 - (d / h) ** 3) ** 3 : 0));
      const sw = w.reduce((a, b) => a + b, 0);
      const mx = near.reduce((a, p, i) => a + w[i]! * p.x, 0) / sw;
      const my = near.reduce((a, p, i) => a + w[i]! * p.y, 0) / sw;
      const sxy = near.reduce(
        (a, p, i) => a + w[i]! * (p.x - mx) * (p.y - my),
        0
      );
      const sxx = near.reduce((a, p, i) => a + w[i]! * (p.x - mx) ** 2, 0);
      return my + (sxy / sxx) * (x0 - mx);
    };
    for (const x0 of [0.4, 1.5, 4.2, 7.77, 9.5])
      expect(loess.ok && loess.predict(x0)).toBeCloseTo(reference(x0), 9);
  });

  it("explains too few rows", () => {
    expect(fitLoess([1, 2, 3], [1, 2, 3], 0.75)).toMatchObject({ ok: false });
  });
});

describe("LOESS on large groups", () => {
  it("matches exact local fits at its vertices and interpolates between them", () => {
    const xs = Array.from(
      { length: 2000 },
      (_, i) => ((i * 7919) % 2000) / 100
    );
    const ys = xs.map((x, i) => Math.sin(x) + 0.1 * x + ((i % 7) - 3) / 10);
    const fit = fitLoess(xs, ys, 0.2);
    expect(fit.ok && fit.interpolated).toBe(true);
    if (!fit.ok) return;
    const [min, max] = fit.xRange;
    const step = (max - min) / LOESS_VERTICES;
    // Brute force at three vertices: the 400 nearest rows, tricube weights.
    for (const vertex of [10, 95, 180]) {
      const x0 = min + step * vertex;
      const near = xs
        .map((x, i) => ({ x, y: ys[i]!, d: Math.abs(x - x0) }))
        .sort((a, b) => a.d - b.d)
        .slice(0, 400);
      const h = near[399]!.d;
      const w = near.map(({ d }) => (d < h ? (1 - (d / h) ** 3) ** 3 : 0));
      const sw = w.reduce((a, b) => a + b, 0);
      const mx = near.reduce((a, p, i) => a + w[i]! * p.x, 0) / sw;
      const my = near.reduce((a, p, i) => a + w[i]! * p.y, 0) / sw;
      const sxy = near.reduce(
        (a, p, i) => a + w[i]! * (p.x - mx) * (p.y - my),
        0
      );
      const sxx = near.reduce((a, p, i) => a + w[i]! * (p.x - mx) ** 2, 0);
      expect(fit.predict(x0)).toBeCloseTo(my + (sxy / sxx) * (x0 - mx), 6);
    }
    const between = min + step * 10.5;
    expect(fit.predict(between)).toBeCloseTo(
      (fit.predict(min + step * 10) + fit.predict(min + step * 11)) / 2,
      9
    );
  });
});
