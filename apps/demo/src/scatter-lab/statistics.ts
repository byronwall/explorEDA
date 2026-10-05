import type { Covariance, Pair, Prepared, Row, Space, Value } from "./types";

/** Matches packages/explorEDA/src/lib/numeric.ts at 94bfe0b. */
export function finiteNumber(value: Value): number | undefined {
  if (value == null || typeof value === "boolean" || (typeof value === "string" && value.trim() === "")) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}
export const symlog = (v: number): number => Math.sign(v) * Math.log1p(Math.abs(v));
export const symexp = (v: number): number => Math.sign(v) * Math.expm1(Math.abs(v));
export const toAnalysis = (v: number, space: Space): number => space === "data" ? v : symlog(v);
export const fromAnalysis = (v: number, space: Space): number => space === "data" ? v : symexp(v);
export const category = (v: Value): string => v == null || (typeof v === "string" && !v.trim()) ? "(missing)" : String(v);

export function prepare(rows: Row[], xField: string, yField: string, groupField: string, space: Space = "data"): Prepared {
  const pairs: Pair[] = [], excluded: Prepared["excluded"] = [];
  for (const row of rows) {
    const x = finiteNumber(row[xField]), y = finiteNumber(row[yField]);
    if (x === undefined || y === undefined) {
      excluded.push({ id: row.sourceId, reason: `${x === undefined ? xField : yField}: no finite numeric measurement` });
    } else pairs.push({ id: row.sourceId, row, x: toAnalysis(x, space), y: toAnalysis(y, space), group: category(row[groupField]) });
  }
  return { pairs, excluded, total: rows.length };
}

/** Compensated summation; offsets are removed before calculating the mean. */
function sum(values: Iterable<number>): number {
  let s = 0, c = 0;
  for (const v of values) {
    const t = s + v;
    c += Math.abs(s) >= Math.abs(v) ? (s - t) + v : (v - t) + s;
    s = t;
  }
  return s + c;
}
export function covariance(pairs: Pick<Pair, "x" | "y">[]): Covariance {
  const n = pairs.length;
  if (!n) return { n, mean: null, covariance: null, sd: null, correlation: null, available: false, reason: "No eligible X/Y pairs." };
  const ox = pairs[0]!.x, oy = pairs[0]!.y;
  const mx = ox + sum(pairs.map(p => p.x - ox)) / n;
  const my = oy + sum(pairs.map(p => p.y - oy)) / n;
  const mean: [number, number] = [mx, my];
  if (n < 2) return { n, mean, covariance: null, sd: null, correlation: null, available: false, reason: "At least two eligible pairs are needed for sample covariance." };
  const xx = sum(pairs.map(p => (p.x - mx) ** 2)) / (n - 1);
  const yy = sum(pairs.map(p => (p.y - my) ** 2)) / (n - 1);
  const xy = sum(pairs.map(p => (p.x - mx) * (p.y - my))) / (n - 1);
  if (![mx, my, xx, yy, xy].every(Number.isFinite)) return { n, mean: null, covariance: null, sd: null, correlation: null, available: false, reason: "Numeric range exceeds finite sample-moment arithmetic." };
  const matrix: Covariance["covariance"] = [[xx, xy], [xy, yy]];
  const sd: [number, number] = [Math.sqrt(Math.max(0, xx)), Math.sqrt(Math.max(0, yy))];
  if (!(xx > 0 && yy > 0)) return { n, mean, covariance: matrix, sd, correlation: null, available: false, reason: "Zero variance: a two-dimensional distance metric is undefined." };
  const r = Math.max(-1, Math.min(1, (xy / sd[0]) / sd[1]));
  // Relative eigenvalue ratio in standardized coordinates is (1-|r|)/(1+|r|).
  // This deliberately rejects nearly collinear inputs; it is invariant to units.
  const conditionRatio = (1 - Math.abs(r)) / (1 + Math.abs(r));
  if (conditionRatio <= 1e-10) return { n, mean, covariance: matrix, sd, correlation: r, available: false, reason: "Collinear or nearly collinear pairs: standardized eigenvalue ratio ≤ 1e−10. No ridge or pseudoinverse is used." };
  return { n, mean, covariance: matrix, sd, correlation: r, available: true };
}

export function distanceSquared(point: { x: number; y: number }, model: Covariance): number | null {
  if (!model.available || !model.mean || !model.sd || model.correlation === null) return null;
  const a = (point.x - model.mean[0]) / model.sd[0];
  const b = (point.y - model.mean[1]) / model.sd[1];
  const r = model.correlation;
  // Cholesky solve avoids cancellation in a² - 2rab + b².
  const value = a * a + ((b - r * a) / Math.sqrt((1 - r) * (1 + r))) ** 2;
  return Number.isFinite(value) ? value : null;
}

export function dataThreshold(coverage: number): number {
  if (!(coverage > 0 && coverage < 1)) throw new RangeError("Coverage must be strictly between zero and one.");
  return -2 * Math.log1p(-coverage);
}
/** F(2, nu) inverse CDF, derived from CDF=1-(nu/(nu+2x))^(nu/2).
 * Independently checked against scipy.stats.f.ppf; see reference.json. */
export function f2Quantile(coverage: number, nu: number): number {
  if (!(nu > 0 && coverage > 0 && coverage < 1)) throw new RangeError("Positive degrees of freedom and 0 < coverage < 1 are required.");
  return (nu / 2) * Math.expm1(-2 * Math.log1p(-coverage) / nu);
}
export function meanThreshold(n: number, coverage: number): number | null {
  if (!Number.isInteger(n) || n <= 2) return null;
  const q = (2 * (n - 1) / (n - 2)) * f2Quantile(coverage, n - 2) / n;
  return Number.isFinite(q) ? q : null;
}
/** A sampled data-space quadratic contour; transform each vertex for display. */
export function ellipseBoundary(model: Covariance, threshold: number, steps = 180): [number, number][] {
  if (!model.available || !model.mean || !model.sd || model.correlation === null || !(threshold >= 0 && Number.isFinite(threshold))) return [];
  const [mx, my] = model.mean, [sx, sy] = model.sd, r = model.correlation;
  const q = Math.sqrt(threshold), residual = Math.sqrt((1 - r) * (1 + r));
  const points: [number, number][] = [];
  for (let i = 0; i <= steps; ++i) {
    const a = 2 * Math.PI * i / steps, c = Math.cos(a), s = Math.sin(a);
    const point: [number, number] = [mx + q * sx * c, my + q * sy * (r * c + residual * s)];
    if (!point.every(Number.isFinite)) return [];
    points.push(point);
  }
  return points;
}
