/**
 * Least-squares fits for scatter regression. Every function takes paired,
 * finite values and returns either a fit or the reason none exists, so a chart
 * never substitutes another method or invents a number.
 */

export type RegressionMethod = "linear" | "polynomial" | "loess";

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

export interface PolynomialFit extends FitMeasures {
  ok: true;
  method: "polynomial";
  degree: number;
  /** Coefficients in ascending powers of x. */
  coefficients: number[];
  adjustedR2?: number;
  xRange: [number, number];
  predict: (x: number) => number;
}

/**
 * A local fit has no global equation or slope. It reports how closely the
 * smooth follows the points and how many neighbors shape each local line.
 */
export interface LoessFit extends FitMeasures {
  ok: true;
  method: "loess";
  span: number;
  /** Rows in each local fit. */
  neighbors: number;
  /** Root mean square of the residuals. */
  rmse: number;
  /** The curve interpolates exact local fits at evenly spaced X vertices. */
  interpolated: boolean;
  xRange: [number, number];
  predict: (x: number) => number;
}

export type RegressionFit = LinearFit | PolynomialFit | LoessFit;

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

function distinctCount(xs: ArrayLike<number>, limit: number) {
  const seen = new Set<number>();
  for (let i = 0; i < xs.length && seen.size < limit; i++) seen.add(xs[i]!);
  return seen.size;
}

function binomial(n: number, k: number) {
  let value = 1;
  for (let i = 1; i <= k; i++) value = (value * (n - k + i)) / i;
  return value;
}

/** Least squares by Householder QR; returns undefined for a rank-deficient design. */
function solveLeastSquares(design: number[][], ys: ArrayLike<number>) {
  const rows = design.length;
  const cols = design[0]!.length;
  const a = design.map((row) => row.slice());
  const b = Array.from(ys);
  for (let k = 0; k < cols; k++) {
    let norm = 0;
    for (let i = k; i < rows; i++) norm += a[i]![k]! ** 2;
    norm = Math.sqrt(norm);
    if (norm === 0) return undefined;
    const alpha = a[k]![k]! > 0 ? -norm : norm;
    const v = new Array<number>(rows).fill(0);
    for (let i = k; i < rows; i++) v[i] = a[i]![k]!;
    v[k]! -= alpha;
    let vv = 0;
    for (let i = k; i < rows; i++) vv += v[i]! ** 2;
    if (vv === 0) continue;
    for (let j = k; j < cols; j++) {
      let dot = 0;
      for (let i = k; i < rows; i++) dot += v[i]! * a[i]![j]!;
      const factor = (2 * dot) / vv;
      for (let i = k; i < rows; i++) a[i]![j]! -= factor * v[i]!;
    }
    let dot = 0;
    for (let i = k; i < rows; i++) dot += v[i]! * b[i]!;
    const factor = (2 * dot) / vv;
    for (let i = k; i < rows; i++) b[i]! -= factor * v[i]!;
  }
  // A tiny pivot relative to the largest means the columns are nearly dependent.
  const largest = Math.max(
    ...a.slice(0, cols).map((row, i) => Math.abs(row[i]!))
  );
  const solution = new Array<number>(cols).fill(0);
  for (let k = cols - 1; k >= 0; k--) {
    const pivot = a[k]![k]!;
    if (Math.abs(pivot) <= largest * 1e-10) return undefined;
    let sum = b[k]!;
    for (let j = k + 1; j < cols; j++) sum -= a[k]![j]! * solution[j]!;
    solution[k] = sum / pivot;
  }
  return solution;
}

/**
 * Polynomial least squares on standardized X, so higher powers stay well
 * conditioned. The reported equation converts back to powers of X.
 */
export function fitPolynomial(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  degree: number,
  xLabel = "X"
): PolynomialFit | UnavailableFit {
  const n = xs.length;
  const unavailable = (reason: string): UnavailableFit => ({
    ok: false,
    method: "polynomial",
    n,
    reason,
  });
  const terms = degree + 1;
  if (n < terms)
    return unavailable(
      `A degree ${degree} polynomial needs at least ${terms} rows with numeric X and Y. This group has ${n}.`
    );
  const distinct = distinctCount(xs, terms);
  if (distinct < terms)
    return unavailable(
      `A degree ${degree} polynomial needs at least ${terms} distinct ${xLabel} values. This group has ${distinct}.`
    );
  const mx = mean(xs);
  let ss = 0;
  for (let i = 0; i < n; i++) ss += (xs[i]! - mx) ** 2;
  const sx = Math.sqrt(ss / n);
  const design: number[][] = [];
  for (let i = 0; i < n; i++) {
    const t = (xs[i]! - mx) / sx;
    const row = [1];
    for (let k = 1; k < terms; k++) row.push(row[k - 1]! * t);
    design.push(row);
  }
  const standardized = solveLeastSquares(design, ys);
  if (!standardized)
    return unavailable(
      `The ${xLabel} values cannot separate ${terms} polynomial terms. Choose a lower degree.`
    );
  const predict = (x: number) => {
    const t = (x - mx) / sx;
    let value = 0;
    for (let k = terms - 1; k >= 0; k--) value = value * t + standardized[k]!;
    return value;
  };
  // y = Σ b_k ((x − m) / s)^k, expanded into powers of x.
  const coefficients = new Array<number>(terms).fill(0);
  for (let k = 0; k < terms; k++) {
    const scale = standardized[k]! / sx ** k;
    for (let j = 0; j <= k; j++)
      coefficients[j]! += scale * binomial(k, j) * (-mx) ** (k - j);
  }
  const my = mean(ys);
  let sse = 0;
  let sst = 0;
  for (let i = 0; i < n; i++) {
    sse += (ys[i]! - predict(xs[i]!)) ** 2;
    sst += (ys[i]! - my) ** 2;
  }
  const r2 = sst > 0 ? Math.min(1, Math.max(0, 1 - sse / sst)) : undefined;
  return {
    ok: true,
    method: "polynomial",
    degree,
    n,
    coefficients,
    r2,
    adjustedR2:
      r2 !== undefined && n > terms
        ? 1 - ((1 - r2) * (n - 1)) / (n - terms)
        : undefined,
    residualSe: n > terms ? Math.sqrt(sse / (n - terms)) : undefined,
    xRange: extent(xs),
    predict,
  };
}

/** Smaller groups give unstable local lines, so LOESS says so instead. */
export const LOESS_MIN_ROWS = 8;
export const LOESS_MIN_NEIGHBORS = 5;
/** Groups up to this size get an exact local fit at every row. */
export const LOESS_EXACT_ROWS = 500;
/** Intervals between exact local fits for larger groups. */
export const LOESS_VERTICES = 200;

/**
 * Locally weighted linear regression (LOESS, degree 1, no robustness
 * iterations). Each estimate fits a line to the nearest span × n rows,
 * weighted by the tricube of their distance.
 */
export function fitLoess(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  span: number,
  xLabel = "X"
): LoessFit | UnavailableFit {
  const n = xs.length;
  const unavailable = (reason: string): UnavailableFit => ({
    ok: false,
    method: "loess",
    n,
    reason,
  });
  if (n < LOESS_MIN_ROWS)
    return unavailable(
      `LOESS needs at least ${LOESS_MIN_ROWS} rows with numeric X and Y. This group has ${n}.`
    );
  const distinct = distinctCount(xs, 3);
  if (distinct < 3)
    return unavailable(
      `LOESS needs at least 3 distinct ${xLabel} values. This group has ${distinct}.`
    );
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => xs[a]! - xs[b]!
  );
  const sx = Float64Array.from(order, (i) => xs[i]!);
  const sy = Float64Array.from(order, (i) => ys[i]!);
  // Fewer than 5 neighbors leaves a local line on 3 or 4 weighted rows, which swings wildly.
  const k = Math.min(n, Math.max(LOESS_MIN_NEIGHBORS, Math.ceil(span * n)));
  const lowerBound = (x: number) => {
    let lo = 0;
    let hi = n;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (sx[mid]! < x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const local = (x0: number, start: number) => {
    let lo = Math.max(0, Math.min(n - k, start));
    // Slide to the k nearest rows.
    while (lo > 0 && x0 - sx[lo - 1]! < sx[lo + k - 1]! - x0) lo--;
    while (lo + k < n && sx[lo + k]! - x0 < x0 - sx[lo]!) lo++;
    const h = Math.max(x0 - sx[lo]!, sx[lo + k - 1]! - x0);
    let sw = 0;
    let swx = 0;
    let swy = 0;
    let swxx = 0;
    let swxy = 0;
    for (let i = lo; i < lo + k; i++) {
      const d = h > 0 ? Math.abs(sx[i]! - x0) / h : 0;
      const t = d >= 1 ? 0 : 1 - d * d * d;
      const w = t * t * t;
      const dx = sx[i]! - x0;
      sw += w;
      swx += w * dx;
      swy += w * sy[i]!;
      swxx += w * dx * dx;
      swxy += w * dx * sy[i]!;
    }
    if (sw === 0) {
      // Every neighbor sits exactly at the bandwidth edge; average them.
      let sum = 0;
      for (let i = lo; i < lo + k; i++) sum += sy[i]!;
      return { value: sum / k, lo };
    }
    const varX = swxx - (swx * swx) / sw;
    // Centered at x0, the local line's intercept is its estimate.
    const value =
      varX > 1e-12 * swxx
        ? (swy - ((swxy - (swx * swy) / sw) / varX) * swx) / sw
        : swy / sw;
    return { value, lo };
  };
  // Large groups fit exactly at evenly spaced vertices and interpolate between
  // them, as R's loess does by default, so cost grows with rows × span only.
  const interpolated = n > LOESS_EXACT_ROWS;
  let predict = (x: number) => local(x, lowerBound(x) - (k >> 1)).value;
  if (interpolated) {
    const x0 = sx[0]!;
    const step = (sx[n - 1]! - x0) / LOESS_VERTICES;
    const values: number[] = [];
    let start = 0;
    for (let i = 0; i <= LOESS_VERTICES; i++) {
      const result = local(x0 + step * i, start);
      start = result.lo;
      values.push(result.value);
    }
    predict = (x) => {
      const position = Math.max(0, Math.min(LOESS_VERTICES, (x - x0) / step));
      const i = Math.min(LOESS_VERTICES - 1, Math.floor(position));
      const f = position - i;
      return values[i]! * (1 - f) + values[i + 1]! * f;
    };
  }
  let sse = 0;
  let sst = 0;
  let lo = 0;
  const my = mean(sy);
  for (let i = 0; i < n; i++) {
    let value: number;
    if (interpolated) value = predict(sx[i]!);
    else {
      const result = local(sx[i]!, lo);
      lo = result.lo;
      value = result.value;
    }
    sse += (sy[i]! - value) ** 2;
    sst += (sy[i]! - my) ** 2;
  }
  return {
    ok: true,
    method: "loess",
    span,
    neighbors: k,
    interpolated,
    n,
    r2: sst > 0 ? Math.min(1, Math.max(0, 1 - sse / sst)) : undefined,
    rmse: Math.sqrt(sse / n),
    xRange: [sx[0]!, sx[n - 1]!],
    predict,
  };
}

export const DEFAULT_DEGREE = 2;
export const DEFAULT_SPAN = 0.75;

/** Fits one group with the chosen method. */
export function fitRegression(
  method: RegressionMethod,
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  options: { xLabel?: string; degree?: number; span?: number } = {}
): FitOutcome {
  switch (method) {
    case "linear":
      return fitLinear(xs, ys, options.xLabel);
    case "polynomial":
      return fitPolynomial(
        xs,
        ys,
        options.degree ?? DEFAULT_DEGREE,
        options.xLabel
      );
    case "loess":
      return fitLoess(xs, ys, options.span ?? DEFAULT_SPAN, options.xLabel);
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

/** The equation a fit can honestly state; LOESS has none. */
export function fitEquation(fit: RegressionFit) {
  return fit.method === "loess"
    ? undefined
    : formatPolynomial(fit.coefficients);
}

export const formatR2 = (value: number | undefined) =>
  value === undefined ? "undefined" : value.toFixed(value >= 0.995 ? 3 : 2);
