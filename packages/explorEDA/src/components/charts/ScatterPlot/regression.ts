/**
 * Least-squares fits for scatter regression. Every function takes paired,
 * finite values and returns either a fit or the reason none exists, so a chart
 * never substitutes another method or invents a number.
 */

export type RegressionMethod = "linear";

export interface FitMeasures {
  /** Rows that entered the fit. */
  n: number;
  /** Share of Y variance the fit explains; undefined when Y is constant. */
  r2?: number;
  /** Residual standard error: √(SSE / (n − parameters)). */
  residualSe?: number;
}

export interface LinearFit extends FitMeasures {
  ok: true;
  method: "linear";
  slope: number;
  intercept: number;
  /** Pearson correlation of the fitted pairs. */
  r?: number;
  slopeSe?: number;
  /** Coefficients in ascending powers of x: [intercept, slope]. */
  coefficients: number[];
  xRange: [number, number];
  predict: (x: number) => number;
}

export type RegressionFit = LinearFit;

export interface UnavailableFit {
  ok: false;
  method: RegressionMethod;
  n: number;
  reason: string;
}

export type FitOutcome = RegressionFit | UnavailableFit;

function extent(xs: ArrayLike<number>): [number, number] {
  let min = Infinity;
  let max = -Infinity;
  for (let i = 0; i < xs.length; i++) {
    const x = xs[i]!;
    if (x < min) min = x;
    if (x > max) max = x;
  }
  return [min, max];
}

function mean(values: ArrayLike<number>) {
  let sum = 0;
  for (let i = 0; i < values.length; i++) sum += values[i]!;
  return sum / values.length;
}

/** Ordinary least squares on centered sums, so large offsets keep precision. */
export function fitLinear(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  xLabel = "X"
): LinearFit | UnavailableFit {
  const n = xs.length;
  if (n < 2)
    return {
      ok: false,
      method: "linear",
      n,
      reason: `A line needs at least 2 rows with numeric X and Y. This group has ${n}.`,
    };
  const xRange = extent(xs);
  if (xRange[0] === xRange[1])
    return {
      ok: false,
      method: "linear",
      n,
      reason: `Every ${xLabel} value is ${xRange[0]}, so the slope is undefined.`,
    };
  const mx = mean(xs);
  const my = mean(ys);
  let sxx = 0;
  let sxy = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i]! - mx;
    const dy = ys[i]! - my;
    sxx += dx * dx;
    sxy += dx * dy;
    syy += dy * dy;
  }
  const slope = sxy / sxx;
  const intercept = my - slope * mx;
  const sse = Math.max(0, syy - slope * sxy);
  const residualSe = n > 2 ? Math.sqrt(sse / (n - 2)) : undefined;
  return {
    ok: true,
    method: "linear",
    n,
    slope,
    intercept,
    coefficients: [intercept, slope],
    r2: syy > 0 ? Math.min(1, Math.max(0, 1 - sse / syy)) : undefined,
    r: syy > 0 ? sxy / Math.sqrt(sxx * syy) : undefined,
    residualSe,
    slopeSe: residualSe === undefined ? undefined : residualSe / Math.sqrt(sxx),
    xRange,
    predict: (x) => intercept + slope * x,
  };
}

/** Fits one group with the chosen method. */
export function fitRegression(
  method: RegressionMethod,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  options: { xLabel?: string } = {}
): FitOutcome {
  switch (method) {
    case "linear":
      return fitLinear(xs, ys, options.xLabel);
  }
}

const MINUS = "−";

/** A coefficient with about three significant digits and no exponent noise. */
export function formatCoefficient(value: number) {
  const abs = Math.abs(value);
  if (abs === 0) return "0";
  if (abs >= 1000)
    return Math.round(value).toLocaleString("en-US").replace("-", MINUS);
  if (abs < 0.001) {
    const [mantissa, exponent] = value.toExponential(2).split("e");
    return `${Number(mantissa)}e${exponent}`.replace(/^-/, MINUS);
  }
  return String(Number(value.toPrecision(3))).replace("-", MINUS);
}

const SUPERSCRIPT = "⁰¹²³⁴⁵⁶⁷⁸⁹";
const power = (exponent: number) =>
  exponent === 1
    ? "x"
    : `x${String(exponent)
        .split("")
        .map((digit) => SUPERSCRIPT[Number(digit)])
        .join("")}`;

/** "y = 2.1x² − 0.5x + 3", highest power first, from ascending coefficients. */
export function formatPolynomial(coefficients: number[]) {
  const terms: string[] = [];
  for (let i = coefficients.length - 1; i >= 0; i--) {
    const value = coefficients[i]!;
    if (value === 0 && coefficients.length > 1) continue;
    const magnitude = formatCoefficient(Math.abs(value));
    const body =
      i === 0 ? magnitude : `${magnitude === "1" ? "" : magnitude}${power(i)}`;
    terms.push(
      terms.length === 0
        ? `${value < 0 ? MINUS : ""}${body}`
        : `${value < 0 ? MINUS : "+"} ${body}`
    );
  }
  return `y = ${terms.join(" ") || "0"}`;
}

/** The equation a fit can honestly state. */
export function fitEquation(fit: RegressionFit) {
  return formatPolynomial(fit.coefficients);
}

export const formatR2 = (value: number | undefined) =>
  value === undefined ? "undefined" : value.toFixed(value >= 0.995 ? 3 : 2);
