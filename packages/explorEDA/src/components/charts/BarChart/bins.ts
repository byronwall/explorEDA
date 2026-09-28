export function numericBins(all: number[], values: number[], count: number) {
  const low = Math.min(...all);
  const high = Math.max(...all);
  if (!Number.isFinite(low) || !Number.isFinite(high)) return [];
  const requested = Math.max(2, Math.min(100, Math.round(count)));
  // Integer data gets whole-number bins centered on the integers, so a bar
  // never straddles a gap between two possible values.
  const integer = all.every(Number.isInteger);
  let min: number;
  let size: number;
  let step: number;
  if (integer) {
    const span = high - low + 1;
    step = Math.ceil(span / requested);
    size = Math.ceil(span / step);
    min = low - 0.5;
  } else {
    min = low === high ? low - 0.5 : low;
    const max = low === high ? high + 0.5 : high;
    size = requested;
    step = (max - min) / size;
  }
  const max = min + size * step;
  const bins = Array.from({ length: size }, (_, i) => {
    const start = min + i * step;
    const end = i === size - 1 ? max : min + (i + 1) * step;
    const label = !integer
      ? `[${start}, ${end}${i === size - 1 ? "]" : ")"}`
      : step === 1
        ? `${start + 0.5}`
        : `${start + 0.5}–${end - 0.5}`;
    return { label, start, end, value: 0, isNumeric: true as const };
  });
  for (const value of values) {
    if (!Number.isFinite(value) || value < min || value > max) continue;
    bins[Math.min(size - 1, Math.floor((value - min) / step))]!.value++;
  }
  return bins;
}

/** Tolerance for comparing a bound to a bin edge after float arithmetic. */
function edgeTolerance(edges: number[]) {
  const span = Math.abs(edges.at(-1)! - edges[0]!) || 1;
  return span * 1e-9;
}

/** True when a bin lies entirely within a range. */
export function binInRange(
  bin: { start: number; end: number },
  range: { min?: number; max?: number },
  edges: number[]
) {
  const tolerance = edges.length > 1 ? edgeTolerance(edges) : 0;
  return (
    (range.min === undefined || bin.start >= range.min - tolerance) &&
    (range.max === undefined || bin.end <= range.max + tolerance)
  );
}

/**
 * Moves each bound of a range to its nearest bin edge, so a filter never
 * splits a bar. A range narrower than one bin covers the bin under its middle.
 */
export function snapRangeToBins(
  edges: number[],
  range: { min?: number; max?: number }
): { min?: number; max?: number } {
  if (edges.length < 2) return range;
  // A bound halfway between two edges moves outward, so the filter keeps
  // every value it already covered.
  const nearest = (value: number, outward: 1 | -1) =>
    edges.reduce((best, edge) => {
      const gap = Math.abs(edge - value) - Math.abs(best - value);
      return gap < 0 || (gap === 0 && (edge - best) * outward > 0)
        ? edge
        : best;
    });
  let min = range.min === undefined ? undefined : nearest(range.min, -1);
  let max = range.max === undefined ? undefined : nearest(range.max, 1);
  if (min !== undefined && max !== undefined && max <= min) {
    const middle = (range.min! + range.max!) / 2;
    const above = edges.findIndex((edge) => edge > middle);
    const bin =
      above === -1
        ? edges.length - 2
        : Math.min(edges.length - 2, Math.max(0, above - 1));
    min = edges[bin]!;
    max = edges[bin + 1]!;
  }
  return { min, max };
}

/** True when two ranges have the same bounds within bin-edge tolerance. */
export function sameRange(
  a: { min?: number; max?: number },
  b: { min?: number; max?: number },
  edges: number[]
) {
  const tolerance = edges.length > 1 ? edgeTolerance(edges) : 0;
  const same = (x?: number, y?: number) =>
    x === undefined || y === undefined ? x === y : Math.abs(x - y) <= tolerance;
  return same(a.min, b.min) && same(a.max, b.max);
}
