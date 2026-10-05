import type { Covariance } from "./types";

/** Covariance PCA in the displayed field units (not standardized correlation PCA).
 * Its direction and explained variance change when units change. */
export function principalAxes(model: Covariance): { values: [number, number]; angle: number; fraction: [number, number] } | null {
  if (!model.covariance) return null;
  const [[xx, xy], [, yy]] = model.covariance;
  const size = Math.max(xx, yy, Math.abs(xy));
  if (!(size > 0 && Number.isFinite(size))) return null;
  const a = xx / size, b = xy / size, c = yy / size;
  const large = (a + c) / 2 + Math.hypot((a - c) / 2, b);
  const small = Math.max(0, (a * c - b * b) / large);
  const values: [number, number] = [large * size, small * size];
  return { values, angle: .5 * Math.atan2(2 * b, a - c), fraction: [large / (large + small), small / (large + small)] };
}
export interface HistogramBin { lower: number; upper: number; count: number }
/** Equal-width bins; half-open except the final bin, which includes its maximum.
 * Domains are full-source prepared-data domains, shared across groups/filters. */
export function histogram(values: number[], domain: [number, number], count: number): HistogramBin[] {
  if (!Number.isInteger(count) || count < 1 || !(domain[1] > domain[0]) || !domain.every(Number.isFinite)) return [];
  const bins = Array.from({ length: count }, (_, i) => ({ lower: domain[0] + i * (domain[1] - domain[0]) / count, upper: domain[0] + (i + 1) * (domain[1] - domain[0]) / count, count: 0 }));
  for (const v of values) {
    if (!Number.isFinite(v) || v < domain[0] || v > domain[1]) continue;
    const index = Math.min(count - 1, Math.floor((v - domain[0]) / (domain[1] - domain[0]) * count));
    bins[index]!.count++;
  }
  return bins;
}
