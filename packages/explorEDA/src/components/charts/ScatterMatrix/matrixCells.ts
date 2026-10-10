/** Quartiles and Tukey whiskers of one group of values. */
export interface MatrixBoxStats {
  q1: number;
  median: number;
  q3: number;
  /** Smallest and largest values within 1.5 IQR of the box. */
  low: number;
  high: number;
  count: number;
}

/** One category's values in a box plot cell, sorted once per layout. */
export interface MatrixBoxGroup {
  band: number;
  /** Live row indices in value order. */
  order: Int32Array;
  /** Values in the same order. */
  values: Float64Array;
  stats: MatrixBoxStats;
}

/** Counts for each pair of bands in a cell of two category fields. */
export interface MatrixPairs {
  /** Bands along the column field, then the row field. */
  columns: number;
  rows: number;
  /** For each live row, column band × rows + row band, or -1. */
  index: Int32Array;
  total: Int32Array;
  /** Rows in each column band that have a row band. */
  columnTotal: Int32Array;
  /** The largest pair count, for sizing tiles. */
  max: number;
}

function quantile(sorted: ArrayLike<number>, n: number, q: number) {
  const position = (n - 1) * q;
  const base = Math.floor(position);
  const rest = position - base;
  const value = sorted[base]!;
  return base + 1 < n ? value + rest * (sorted[base + 1]! - value) : value;
}

/** Box statistics from values already in ascending order. */
export function sortedBoxStats(
  sorted: ArrayLike<number>,
  n = sorted.length
): MatrixBoxStats | undefined {
  if (!n) {
    return undefined;
  }
  const q1 = quantile(sorted, n, 0.25);
  const median = quantile(sorted, n, 0.5);
  const q3 = quantile(sorted, n, 0.75);
  const iqr = q3 - q1;
  let low = sorted[0]!;
  let high = sorted[n - 1]!;
  for (let i = 0; i < n; i++) {
    if (sorted[i]! >= q1 - 1.5 * iqr) {
      low = sorted[i]!;
      break;
    }
  }
  for (let i = n - 1; i >= 0; i--) {
    if (sorted[i]! <= q3 + 1.5 * iqr) {
      high = sorted[i]!;
      break;
    }
  }
  return { q1, median, q3, low, high, count: n };
}

/** Groups a continuous field's values by the bands of a category field. */
export function planBoxGroups(
  bands: Int32Array,
  values: Float64Array,
  bandCount: number
): MatrixBoxGroup[] {
  const members: number[][] = Array.from({ length: bandCount }, () => []);
  for (let i = 0; i < bands.length; i++) {
    const band = bands[i]!;
    if (band >= 0 && values[i] === values[i]) {
      members[band]!.push(i);
    }
  }
  return members.flatMap((rows, band) => {
    if (!rows.length) {
      return [];
    }
    rows.sort((a, b) => values[a]! - values[b]!);
    const order = Int32Array.from(rows);
    const sorted = Float64Array.from(rows, (row) => values[row]!);
    return [{ band, order, values: sorted, stats: sortedBoxStats(sorted)! }];
  });
}

/** Box statistics of the selected rows in a group, without sorting again. */
export function selectedBoxStats(group: MatrixBoxGroup, selected: Uint8Array) {
  const values = new Float64Array(group.order.length);
  let n = 0;
  for (let i = 0; i < group.order.length; i++) {
    if (selected[group.order[i]!]) {
      values[n++] = group.values[i]!;
    }
  }
  return sortedBoxStats(values, n);
}

export function planPairs(
  columnBands: Int32Array,
  rowBands: Int32Array,
  columns: number,
  rows: number
): MatrixPairs {
  const index = new Int32Array(columnBands.length).fill(-1);
  const total = new Int32Array(columns * rows);
  const columnTotal = new Int32Array(columns);
  for (let i = 0; i < columnBands.length; i++) {
    const column = columnBands[i]!;
    const row = rowBands[i]!;
    if (column < 0 || row < 0) {
      continue;
    }
    const pair = column * rows + row;
    index[i] = pair;
    total[pair]!++;
    columnTotal[column]!++;
  }
  return {
    columns,
    rows,
    index,
    total,
    columnTotal,
    max: Math.max(1, ...total),
  };
}

/** Selected rows in each pair of bands. */
export function selectedPairs(pairs: MatrixPairs, selected: Uint8Array) {
  const counts = new Int32Array(pairs.total.length);
  for (let i = 0; i < pairs.index.length; i++) {
    const pair = pairs.index[i]!;
    if (pair >= 0 && selected[i]) {
      counts[pair]!++;
    }
  }
  return counts;
}

/** Bins a density is estimated on before smoothing. */
export const DENSITY_BINS = 128;

/**
 * A kernel density estimate on fixed bins, scaled to counts so a subset's
 * curve sits inside the whole curve and its area shows the subset's share.
 */
export interface MatrixDensity {
  /** Offset of each bin's center along the cell. */
  centers: Float64Array;
  /** Each live row's bin, or -1. */
  binIndex: Int32Array;
  /** Gaussian weights from -radius to +radius bins, summing to one. */
  kernel: Float64Array;
  /** Smoothed rows per bin across every live row. */
  total: Float64Array;
  /** The largest value of `total`, for scaling. */
  max: number;
}

/**
 * Bins every live row's value between `low` and `high`, then smooths with a
 * Gaussian whose width follows Scott's rule. Binning first keeps the cost to
 * one pass over the rows, which matters at 100,000 rows per field.
 */
export function planDensity(
  values: Float64Array,
  low: number,
  high: number,
  toOffset: (value: number) => number
): MatrixDensity | undefined {
  const span = high - low;
  if (!(span > 0)) {
    return undefined;
  }
  const width = span / DENSITY_BINS;
  const binIndex = new Int32Array(values.length).fill(-1);
  const counts = new Float64Array(DENSITY_BINS);
  let n = 0;
  let sum = 0;
  let squares = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i]!;
    if (value !== value) {
      continue;
    }
    const bin = Math.min(
      DENSITY_BINS - 1,
      Math.max(0, Math.floor((value - low) / width))
    );
    binIndex[i] = bin;
    counts[bin]!++;
    n++;
    sum += value;
    squares += value * value;
  }
  if (n < 2) {
    return undefined;
  }
  const mean = sum / n;
  const sd = Math.sqrt(Math.max(0, squares / n - mean * mean));
  const bandwidth = sd > 0 ? 1.06 * sd * Math.pow(n, -0.2) : span / 20;
  const sigma = Math.max(0.5, bandwidth / width);
  const radius = Math.min(DENSITY_BINS, Math.ceil(3 * sigma));
  const kernel = new Float64Array(radius * 2 + 1);
  let weight = 0;
  for (let k = -radius; k <= radius; k++) {
    const value = Math.exp(-0.5 * (k / sigma) ** 2);
    kernel[k + radius] = value;
    weight += value;
  }
  for (let k = 0; k < kernel.length; k++) {
    kernel[k]! /= weight;
  }
  const centers = Float64Array.from({ length: DENSITY_BINS }, (_, bin) =>
    toOffset(low + (bin + 0.5) * width)
  );
  const total = smoothCounts(counts, kernel);
  return { centers, binIndex, kernel, total, max: Math.max(...total) };
}

export function smoothCounts(counts: Float64Array, kernel: Float64Array) {
  const radius = (kernel.length - 1) / 2;
  const out = new Float64Array(counts.length);
  for (let bin = 0; bin < counts.length; bin++) {
    const count = counts[bin]!;
    if (!count) {
      continue;
    }
    for (let k = -radius; k <= radius; k++) {
      const target = bin + k;
      if (target >= 0 && target < out.length) {
        out[target]! += count * kernel[k + radius]!;
      }
    }
  }
  return out;
}

/**
 * Smoothed counts of the selected rows, and of the selected rows in each
 * color group, in one pass over the rows.
 */
export function selectedDensities(
  density: MatrixDensity,
  selected: Uint8Array,
  groups?: { index: Int32Array; count: number }
) {
  const counts = new Float64Array(DENSITY_BINS);
  const byGroup = groups
    ? Array.from({ length: groups.count }, () => new Float64Array(DENSITY_BINS))
    : undefined;
  const bins = density.binIndex;
  for (let i = 0; i < bins.length; i++) {
    const bin = bins[i]!;
    if (bin < 0 || !selected[i]) {
      continue;
    }
    counts[bin]!++;
    if (byGroup) {
      const group = groups!.index[i]!;
      if (group >= 0) {
        byGroup[group]![bin]!++;
      }
    }
  }
  return {
    selected: smoothCounts(counts, density.kernel),
    groups: byGroup?.map((group) => smoothCounts(group, density.kernel)),
  };
}
