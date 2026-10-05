import type { Bin, DensityGrid, Display, PixelPair, Value } from "./types";
import { finiteNumber, symlog, symexp } from "./statistics";

export function paddedDomain(values: Iterable<Value>, display: Display): [number, number] {
  let min = Infinity, max = -Infinity;
  for (const raw of values) { const n = finiteNumber(raw); if (n !== undefined) { min = Math.min(min, n); max = Math.max(max, n); } }
  if (min === Infinity) { min = 0; max = 1; }
  const to = display === "symlog" ? symlog : (v: number) => v;
  const from = display === "symlog" ? symexp : (v: number) => v;
  const lo = to(min), hi = to(max), pad = hi > lo ? (hi - lo) * .1 : .5;
  const result: [number, number] = [from(lo - pad), from(hi + pad)];
  // Extremely large domains cannot be rendered reliably; callers explain this.
  return result;
}
export function scale(domain: [number, number], range: [number, number], display: Display) {
  const to = display === "symlog" ? symlog : (v: number) => v;
  const from = display === "symlog" ? symexp : (v: number) => v;
  const a = to(domain[0]), d = to(domain[1]) - a, span = range[1] - range[0];
  return {
    at: (v: number) => range[0] + (to(v) - a) / d * span,
    invert: (pixel: number) => from(a + (pixel - range[0]) / span * d),
    ticks: (n = 5) => Array.from({ length: n + 1 }, (_, i) => from(a + d * i / n)),
  };
}

/** Pointy-top axial lattice. Origin (0,0); nearest center; exact ties prefer
 * smaller q then smaller r. The local 5×5 search is conservative and finite. */
export function hexCell(x: number, y: number, radius: number): { q: number; r: number; x: number; y: number } {
  if (![x, y, radius].every(Number.isFinite) || radius <= 0) throw new RangeError("Finite coordinates and positive radius are required.");
  const rf = 2 * y / (3 * radius), qf = x / (Math.sqrt(3) * radius) - rf / 2;
  let best = { q: 0, r: 0, x: 0, y: 0 }, bestD = Infinity;
  for (let q = Math.floor(qf) - 1; q <= Math.floor(qf) + 2; ++q) {
    for (let r = Math.floor(rf) - 1; r <= Math.floor(rf) + 2; ++r) {
      const cx = radius * Math.sqrt(3) * (q + r / 2), cy = radius * 1.5 * r;
      const d = (cx - x) ** 2 + (cy - y) ** 2;
      if (d < bestD) { best = { q, r, x: cx, y: cy }; bestD = d; }
    }
  }
  return best;
}
export function hexbins(points: Pick<PixelPair, "id" | "px" | "py">[], radius: number): Bin[] {
  const bins = new Map<string, Bin>();
  for (const p of points) {
    const cell = hexCell(p.px, p.py, radius), key = `${cell.q},${cell.r}`;
    let bin = bins.get(key);
    if (!bin) { bin = { key, ...cell, ids: [], count: 0 }; bins.set(key, bin); }
    bin.ids.push(p.id); ++bin.count;
  }
  return [...bins.values()].sort((a, b) => a.q - b.q || a.r - b.r);
}
export function hexVertices(x: number, y: number, radius: number): [number, number][] {
  return Array.from({ length: 6 }, (_, i) => { const angle = Math.PI / 6 + i * Math.PI / 3; return [x + radius * Math.cos(angle), y + radius * Math.sin(angle)]; });
}

/** Approximate Gaussian KDE count intensity, in rows / plot-pixel².
 * Bilinear point deposition on cell=4 grid, separable Gaussian convolution.
 * Kernel truncates at ±4 bandwidths and is discretely normalized.
 * Padding preserves tails instead of renormalizing at the viewport edge.
 * Complexity O(n + gridSize*bandwidth/cell), not O(n*gridSize).
 */
export function density(points: Pick<PixelPair, "px" | "py">[], width: number, height: number, bandwidth: number, cell = 4): DensityGrid {
  if (!(width > 0 && height > 0 && bandwidth >= cell && bandwidth <= 100 && cell >= 1) || ![width, height, bandwidth, cell].every(Number.isFinite)) throw new RangeError("Density requires positive dimensions and cell ≤ bandwidth ≤ 100 pixels.");
  const radius = Math.ceil(4 * bandwidth / cell), pad = (radius + 2) * cell;
  const nx = Math.ceil((width + 2 * pad) / cell) + 1, ny = Math.ceil((height + 2 * pad) / cell) + 1;
  if (nx * ny > 2e6) throw new RangeError("Density grid exceeds the lab's two-million-cell limit.");
  const a = new Float64Array(nx * ny), b = new Float64Array(nx * ny), result = new Float64Array(nx * ny);
  for (const p of points) {
    if (!Number.isFinite(p.px) || !Number.isFinite(p.py) || p.px < 0 || p.px > width || p.py < 0 || p.py > height) throw new RangeError("KDE inputs must be finite and inside the declared common plot domain.");
    const gx = (p.px + pad) / cell, gy = (p.py + pad) / cell, ix = Math.floor(gx), iy = Math.floor(gy), tx = gx - ix, ty = gy - iy;
    a[iy * nx + ix]! += (1 - tx) * (1 - ty);
    a[iy * nx + ix + 1]! += tx * (1 - ty);
    a[(iy + 1) * nx + ix]! += (1 - tx) * ty;
    a[(iy + 1) * nx + ix + 1]! += tx * ty;
  }
  const kernel = Array.from({ length: 2 * radius + 1 }, (_, i) => Math.exp(-.5 * ((i - radius) * cell / bandwidth) ** 2));
  const total = kernel.reduce((s, v) => s + v, 0);
  for (let i = 0; i < kernel.length; ++i) kernel[i]! /= total;
  for (let y = 0; y < ny; ++y) for (let x = 0; x < nx; ++x) {
    let v = 0; for (let k = -radius; k <= radius; ++k) if (x + k >= 0 && x + k < nx) v += a[y * nx + x + k]! * kernel[k + radius]!;
    b[y * nx + x] = v;
  }
  let maximum = 0, integral = 0;
  for (let y = 0; y < ny; ++y) for (let x = 0; x < nx; ++x) {
    let v = 0; for (let k = -radius; k <= radius; ++k) if (y + k >= 0 && y + k < ny) v += b[(y + k) * nx + x]! * kernel[k + radius]!;
    const intensity = v / (cell * cell); result[y * nx + x] = intensity; integral += v; maximum = Math.max(maximum, intensity);
  }
  return { values: result, nx, ny, cell, pad, width, height, maximum, integral, n: points.length, bandwidth };
}
export type Segment = [[number, number], [number, number]];
/** Marching triangles with a fixed NW–SE diagonal removes saddle ambiguity. */
export function contourSegments(grid: DensityGrid, threshold: number): Segment[] {
  if (!(threshold > 0 && Number.isFinite(threshold))) return [];
  const { nx, ny, values, pad, cell } = grid, lines: Segment[] = [];
  const vertex = (x: number, y: number): [number, number, number] => [x * cell - pad, y * cell - pad, values[y * nx + x]!];
  const triangle = (v: [number, number, number][]) => {
    const crossings: [number, number][] = [];
    for (let i = 0; i < 3; ++i) {
      const a = v[i]!, b = v[(i + 1) % 3]!;
      if ((a[2] >= threshold) === (b[2] >= threshold)) continue;
      const t = (threshold - a[2]) / (b[2] - a[2]);
      crossings.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
    if (crossings.length === 2) lines.push([crossings[0]!, crossings[1]!]);
  };
  for (let y = 0; y < ny - 1; ++y) for (let x = 0; x < nx - 1; ++x) {
    if (x * cell < pad - cell || x * cell > pad + grid.width || y * cell < pad - cell || y * cell > pad + grid.height) continue;
    const a = vertex(x, y), b = vertex(x + 1, y), c = vertex(x + 1, y + 1), d = vertex(x, y + 1);
    triangle([a, b, c]); triangle([a, c, d]);
  }
  return lines;
}
