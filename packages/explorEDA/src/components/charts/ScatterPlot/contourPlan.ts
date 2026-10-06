import { contours } from "d3-contour";
import { buildScale } from "../Axis/axisPlan";
import type { ScatterPlotSettings } from "./definition";
import type { ScatterPlan } from "./scatterPlan";

export const DEFAULT_CONTOUR_LEVELS = 6;
export const DEFAULT_BANDWIDTH_SCALE = 1;
/** Grid cells per axis for the density estimate. */
export const KDE_GRID = 96;

export interface ContourLevel {
  id: string;
  index: number;
  /** Density threshold in estimated rows per X unit × Y unit. */
  threshold: number;
  /** Share of the counted rows whose estimated density reaches the threshold. */
  coverage: number;
  /** SVG path in plot pixels for the region at or above the threshold. */
  path: string;
  fill: string;
}

export interface ContourPlan {
  levels: ContourLevel[];
  rows: number;
  /** Gaussian kernel standard deviations in data units. */
  bandwidth: [number, number];
  scale: number;
  peak: number;
  fill: boolean;
  lines: boolean;
  notice?: string;
  /** Estimated rows per X unit × Y unit at a plot position. */
  densityAt: (px: number, py: number) => number | undefined;
}

/**
 * Opaque, theme-aware bands: each level mixes a little more foreground into
 * the background, so nested regions read as steps rather than stacking into a
 * dark blur. Neutral tones stay apart from categorical group colors.
 */
export const contourFill = (index: number, count: number, strong = true) => {
  const top = strong ? 36 : 28;
  const share = 5 + ((top - 5) * (index + 1)) / count;
  return `color-mix(in oklab, var(--foreground) ${share.toFixed(1)}%, var(--background))`;
};

function sd(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.sqrt(
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) /
      (values.length - 1)
  );
}

/** Convolves each row, then each column, of a grid with a Gaussian kernel. */
function blur(
  grid: Float64Array,
  size: number,
  sigma: [number, number]
): Float64Array {
  const kernel = (s: number) => {
    const radius = Math.max(1, Math.ceil(4 * s));
    const weights = Array.from({ length: 2 * radius + 1 }, (_, i) =>
      Math.exp(-0.5 * ((i - radius) / s) ** 2)
    );
    const total = weights.reduce((sum, weight) => sum + weight, 0);
    return { radius, weights: weights.map((weight) => weight / total) };
  };
  const pass = (input: Float64Array, s: number, horizontal: boolean) => {
    const { radius, weights } = kernel(s);
    const output = new Float64Array(input.length);
    for (let j = 0; j < size; j++)
      for (let i = 0; i < size; i++) {
        let sum = 0;
        for (let k = -radius; k <= radius; k++) {
          const a = horizontal ? i + k : i;
          const b = horizontal ? j : j + k;
          if (a < 0 || a >= size || b < 0 || b >= size) continue;
          sum += input[b * size + a]! * weights[k + radius]!;
        }
        output[j * size + i] = sum;
      }
    return output;
  };
  return pass(pass(grid, sigma[0], true), sigma[1], false);
}

/**
 * A Gaussian kernel density estimate of the plotted pairs. Each axis uses
 * Scott's bandwidth, σ·n^(−1/6), times the chart's bandwidth scale. Rows are
 * linearly binned onto a grid over the axis domains before smoothing.
 */
export function planContours(
  settings: ScatterPlotSettings,
  plan: ScatterPlan
): ContourPlan | undefined {
  if (settings.display !== "contour") return undefined;
  const options = settings.contour ?? {};
  const scale = options.bandwidth ?? DEFAULT_BANDWIDTH_SCALE;
  const count = options.levels ?? DEFAULT_CONTOUR_LEVELS;
  const empty: ContourPlan = {
    levels: [],
    rows: plan.points.length,
    bandwidth: [0, 0],
    scale,
    peak: 0,
    fill: options.fill !== false,
    lines: options.lines !== false,
    densityAt: () => undefined,
  };
  if (plan.xScale.type === "band" || plan.yScale.type === "band")
    return {
      ...empty,
      notice: "Choose numeric X and Y fields for smoothed density.",
    };
  const xs = plan.points.map((point) => Number(point.xValue));
  const ys = plan.points.map((point) => Number(point.yValue));
  const n = xs.length;
  if (n < 3)
    return {
      ...empty,
      notice: `Smoothed density needs at least 3 rows with numeric X and Y. This view has ${n}.`,
    };
  const factor = n ** (-1 / 6) * scale;
  const bandwidth: [number, number] = [sd(xs) * factor, sd(ys) * factor];
  if (!(bandwidth[0] > 0) || !(bandwidth[1] > 0))
    return {
      ...empty,
      notice: `${bandwidth[0] > 0 ? plan.yDisplay : plan.xDisplay} has no spread here, so its density has no width.`,
    };
  const [xMin, xMax] = plan.xScale.domain as [number, number];
  const [yMin, yMax] = plan.yScale.domain as [number, number];
  const size = KDE_GRID;
  const stepX = (xMax - xMin) / (size - 1);
  const stepY = (yMax - yMin) / (size - 1);
  // Linear binning: each row splits its weight among the 4 nearest grid points.
  const grid = new Float64Array(size * size);
  for (let i = 0; i < n; i++) {
    const gx = (xs[i]! - xMin) / stepX;
    const gy = (ys[i]! - yMin) / stepY;
    const ix = Math.max(0, Math.min(size - 2, Math.floor(gx)));
    const iy = Math.max(0, Math.min(size - 2, Math.floor(gy)));
    const fx = Math.max(0, Math.min(1, gx - ix));
    const fy = Math.max(0, Math.min(1, gy - iy));
    grid[iy * size + ix]! += (1 - fx) * (1 - fy);
    grid[iy * size + ix + 1]! += fx * (1 - fy);
    grid[(iy + 1) * size + ix]! += (1 - fx) * fy;
    grid[(iy + 1) * size + ix + 1]! += fx * fy;
  }
  const smooth = blur(grid, size, [bandwidth[0] / stepX, bandwidth[1] / stepY]);
  // Smoothed counts per grid cell become rows per X unit × Y unit.
  const area = stepX * stepY;
  const density = smooth.map((value) => value / area);
  let peak = 0;
  for (const value of density) peak = Math.max(peak, value);
  const thresholds = Array.from(
    { length: count },
    (_, i) => (peak * (i + 1)) / (count + 1)
  );
  const xScale = buildScale(plan.xScale) as (value: number) => number;
  const yScale = buildScale(plan.yScale) as (value: number) => number;
  // Grid point i sits at d3-contour coordinate i + 0.5.
  const toPixel = ([gx, gy]: number[]) =>
    `${xScale(xMin + (gx! - 0.5) * stepX).toFixed(1)},${yScale(
      yMin + (gy! - 0.5) * stepY
    ).toFixed(1)}`;
  const densityAtValue = (x: number, y: number) => {
    const gx = (x - xMin) / stepX;
    const gy = (y - yMin) / stepY;
    if (gx < 0 || gy < 0 || gx > size - 1 || gy > size - 1) return 0;
    const ix = Math.min(size - 2, Math.floor(gx));
    const iy = Math.min(size - 2, Math.floor(gy));
    const fx = gx - ix;
    const fy = gy - iy;
    return (
      density[iy * size + ix]! * (1 - fx) * (1 - fy) +
      density[iy * size + ix + 1]! * fx * (1 - fy) +
      density[(iy + 1) * size + ix]! * (1 - fx) * fy +
      density[(iy + 1) * size + ix + 1]! * fx * fy
    );
  };
  const rowDensity = xs.map((x, i) => densityAtValue(x, ys[i]!));
  const levels = contours()
    .size([size, size])
    .thresholds(thresholds)(Array.from(density))
    .map((shape, index) => ({
      id: `contour:${index}`,
      index,
      threshold: shape.value,
      coverage: rowDensity.filter((value) => value >= shape.value).length / n,
      path: shape.coordinates
        .map((polygon) =>
          polygon.map((ring) => `M${ring.map(toPixel).join("L")}Z`).join("")
        )
        .join(""),
      fill: contourFill(index, count, options.showPoints === false),
    }));
  const invertX = (
    buildScale(plan.xScale) as unknown as { invert: (px: number) => number }
  ).invert;
  const invertY = (
    buildScale(plan.yScale) as unknown as { invert: (px: number) => number }
  ).invert;
  return {
    ...empty,
    levels,
    bandwidth,
    peak,
    densityAt: (px, py) => densityAtValue(invertX(px), invertY(py)),
  };
}

export interface ContourTrace {
  kind: "contour-level";
  id: string;
  revision: string;
  level: ContourLevel;
  contour: ContourPlan;
  xLabel: string;
  yLabel: string;
}
