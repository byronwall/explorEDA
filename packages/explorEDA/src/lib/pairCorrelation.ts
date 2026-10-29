/**
 * Correlation of two continuous fields over the rows that have both values.
 * Pearson reads the measurements; Spearman is Pearson on their average ranks,
 * ranked again within each pair and group so missing values never shift them.
 */

export type CorrelationMethod = "pearson" | "spearman";

export type CorrelationStatus =
  | "ok"
  | "insufficient-pairs"
  | "constant-x"
  | "constant-y"
  | "constant-both"
  | "numerical-failure";

/** Disjoint counts of the rows a pair reads. They sum to the rows read. */
export interface PairCounts {
  paired: number;
  /** Rows with Y but no X. */
  missingX: number;
  /** Rows with X but no Y. */
  missingY: number;
  missingBoth: number;
}

export interface CorrelationResult {
  method: CorrelationMethod;
  status: CorrelationStatus;
  /** Set only when the status is ok. */
  value?: number;
  n: number;
}

/** A correlation needs this many pairs. */
export const MIN_CORRELATION_PAIRS = 3;

/** NaN and infinities have no place in a pair. */
const isNumber = Number.isFinite;

/**
 * The rows where both values are numbers, with counts of the rest. `rows`
 * limits it to some row indices, such as one color group.
 */
export function collectPairs(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  rows?: ArrayLike<number>
) {
  const count = rows ? rows.length : xs.length;
  const index: number[] = [];
  const counts: PairCounts = {
    paired: 0,
    missingX: 0,
    missingY: 0,
    missingBoth: 0,
  };
  for (let k = 0; k < count; k++) {
    const i = rows ? rows[k]! : k;
    const hasX = isNumber(xs[i]!);
    const hasY = isNumber(ys[i]!);
    if (hasX && hasY) {
      index.push(i);
    } else if (hasX) {
      counts.missingY++;
    } else if (hasY) {
      counts.missingX++;
    } else {
      counts.missingBoth++;
    }
  }
  counts.paired = index.length;
  return {
    x: Float64Array.from(index, (i) => xs[i]!),
    y: Float64Array.from(index, (i) => ys[i]!),
    index: Int32Array.from(index),
    counts,
  };
}

/** Ranks from 1, with tied values sharing the average of their ranks. */
export function averageRanks(values: ArrayLike<number>) {
  const n = values.length;
  const order = Int32Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => values[a]! - values[b]!
  );
  const ranks = new Float64Array(n);
  let start = 0;
  while (start < n) {
    let end = start + 1;
    // -0 and 0 compare equal, so signed zeros tie.
    while (end < n && values[order[end]!] === values[order[start]!]) {
      end++;
    }
    const rank = (start + 1 + end) / 2;
    for (let k = start; k < end; k++) {
      ranks[order[k]!] = rank;
    }
    start = end;
  }
  return ranks;
}

function isConstant(values: ArrayLike<number>) {
  for (let i = 1; i < values.length; i++) {
    if (values[i] !== values[0]) {
      return false;
    }
  }
  return true;
}

/** Deviations from the mean, scaled so the largest is 1. */
function scaledDeviations(values: ArrayLike<number>) {
  let mean = 0;
  for (let i = 0; i < values.length; i++) {
    mean += (values[i]! - mean) / (i + 1);
  }
  const out = new Float64Array(values.length);
  let largest = 0;
  for (let i = 0; i < values.length; i++) {
    out[i] = values[i]! - mean;
    largest = Math.max(largest, Math.abs(out[i]!));
  }
  for (let i = 0; i < out.length; i++) {
    out[i] = out[i]! / largest;
  }
  return out;
}

/** Pearson r of paired values that are neither constant nor too few. */
function centeredCorrelation(xs: ArrayLike<number>, ys: ArrayLike<number>) {
  const dx = scaledDeviations(xs);
  const dy = scaledDeviations(ys);
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < dx.length; i++) {
    sxy += dx[i]! * dy[i]!;
    sxx += dx[i]! * dx[i]!;
    syy += dy[i]! * dy[i]!;
  }
  const r = sxy / Math.sqrt(sxx * syy);
  if (!Number.isFinite(r) || Math.abs(r) > 1 + 1e-12) {
    return undefined;
  }
  return Math.max(-1, Math.min(1, r));
}

/** One method's correlation of values that are already paired. */
export function correlate(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  method: CorrelationMethod
): CorrelationResult {
  const n = xs.length;
  if (n < MIN_CORRELATION_PAIRS) {
    return { method, status: "insufficient-pairs", n };
  }
  const constantX = isConstant(xs);
  const constantY = isConstant(ys);
  if (constantX || constantY) {
    const status =
      constantX && constantY
        ? "constant-both"
        : constantX
          ? "constant-x"
          : "constant-y";
    return { method, status, n };
  }
  const value =
    method === "spearman"
      ? centeredCorrelation(averageRanks(xs), averageRanks(ys))
      : centeredCorrelation(xs, ys);
  return value === undefined
    ? { method, status: "numerical-failure", n }
    : { method, status: "ok", value, n };
}

/** A pair's counts and its correlation by each method asked for. */
export interface PairCorrelation {
  counts: PairCounts;
  pearson?: CorrelationResult;
  spearman?: CorrelationResult;
}

/** Pairs rows, then correlates them by each method. */
export function pairCorrelation(
  xs: ArrayLike<number>,
  ys: ArrayLike<number>,
  methods: readonly CorrelationMethod[],
  rows?: ArrayLike<number>
): PairCorrelation {
  const pairs = collectPairs(xs, ys, rows);
  const out: PairCorrelation = { counts: pairs.counts };
  for (const method of methods) {
    out[method] = correlate(pairs.x, pairs.y, method);
  }
  return out;
}

const UNAVAILABLE: Record<Exclude<CorrelationStatus, "ok">, string> = {
  "insufficient-pairs": `fewer than ${MIN_CORRELATION_PAIRS} rows have both values`,
  "constant-x": "the across field has one value",
  "constant-y": "the up field has one value",
  "constant-both": "both fields have one value",
  "numerical-failure": "the values are too large or small to compute",
};

/** Why a correlation has no value, or undefined when it has one. */
export function unavailableReason(result: CorrelationResult) {
  return result.status === "ok" ? undefined : UNAVAILABLE[result.status];
}
