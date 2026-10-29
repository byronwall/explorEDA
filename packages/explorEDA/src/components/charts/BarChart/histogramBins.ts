/**
 * Authored histogram edges: `origin + index × width`, built from the shortest
 * decimal text of each number so 0.1 + 2 × 0.1 lands on 0.3, not
 * 0.30000000000000004. Each edge converts to a number once. Membership then
 * compares measurements with those edges exactly, never with a tolerance.
 */

/** The most bins an authored width can draw. */
export const MAX_BINS = 512;

export interface WidthBinning {
  mode: "width";
  width: number;
  origin: number;
  firstIndex: number;
  lastIndex: number;
}

/** `n × 10^e`, read from the number's shortest round-trip text. */
interface Decimal {
  n: bigint;
  e: number;
}

function decimal(value: number): Decimal {
  const [mantissa, power] = String(value).toLowerCase().split("e");
  const negative = mantissa!.startsWith("-");
  const [whole, fraction = ""] = mantissa!.replace("-", "").split(".");
  const digits = BigInt(whole! + fraction);
  return {
    n: negative ? -digits : digits,
    e: (power ? Number(power) : 0) - fraction.length,
  };
}

/** Scales decimals to one exponent, so their integers compare and add. */
function align(...values: Decimal[]): bigint[] {
  const e = Math.min(...values.map((value) => value.e));
  return values.map((value) => value.n * 10n ** BigInt(value.e - e));
}

/** The exact edge `origin + index × width`, converted to a number once. */
export function edgeAt(origin: number, width: number, index: number) {
  const o = decimal(origin);
  const w = decimal(width);
  const [on, wn] = align(o, w);
  const e = Math.min(o.e, w.e);
  return Number(`${on! + wn! * BigInt(index)}e${e}`);
}

function floorDiv(a: bigint, b: bigint) {
  const q = a / b;
  return a % b !== 0n && a < 0n !== b < 0n ? q - 1n : q;
}

/** The grid index at or below a value: floor((value − origin) / width). */
function floorIndex(value: number, origin: number, width: number) {
  const [x, o, w] = align(decimal(value), decimal(origin), decimal(width));
  return Number(floorDiv(x! - o!, w!));
}

/** The grid index at or above a value. */
function ceilIndex(value: number, origin: number, width: number) {
  const [x, o, w] = align(decimal(value), decimal(origin), decimal(width));
  return -Number(floorDiv(o! - x!, w!)) || 0;
}

/** Why a width and origin can't make bins, or undefined when they can. */
export function widthProblem(width: number, origin: number) {
  if (!Number.isFinite(width) || width <= 0) return "Width must be above 0.";
  if (!Number.isFinite(origin)) return "Origin must be a finite number.";
  return undefined;
}

export type EdgeResult = { edges: number[] } | { problem: string };

/** Every edge of an authored grid, or why the grid can't be drawn. */
export function widthEdges(binning: WidthBinning): EdgeResult {
  const { width, origin, firstIndex, lastIndex } = binning;
  const problem = widthProblem(width, origin);
  if (problem) return { problem };
  if (!Number.isSafeInteger(firstIndex) || !Number.isSafeInteger(lastIndex))
    return { problem: "Bin positions must be whole numbers." };
  const count = lastIndex - firstIndex;
  if (count < 1) return { problem: "The range needs at least one bin." };
  if (count > MAX_BINS)
    return {
      problem: `${count.toLocaleString()} bins is more than ${MAX_BINS}. Use a wider width or a shorter range.`,
    };
  const edges: number[] = [];
  for (let index = firstIndex; index <= lastIndex; index++) {
    const edge = edgeAt(origin, width, index);
    if (!Number.isFinite(edge))
      return { problem: "An edge is too large to draw." };
    if (edges.length && edge <= edges.at(-1)!)
      return {
        problem: "Edges collapse at this magnitude. Use a wider width.",
      };
    edges.push(edge);
  }
  return { edges };
}

/**
 * The smallest grid range that covers every value, at least one bin wide.
 * Converted end edges are checked against the extremes, so rounding to a
 * number can never leave the lowest or highest value outside.
 */
export function fitIndices(
  values: readonly number[],
  width: number,
  origin: number
): { firstIndex: number; lastIndex: number } {
  if (!values.length) return { firstIndex: 0, lastIndex: 1 };
  let low = values[0]!;
  let high = values[0]!;
  for (const value of values) {
    if (value < low) low = value;
    if (value > high) high = value;
  }
  let firstIndex = floorIndex(low, origin, width);
  let lastIndex = Math.max(firstIndex + 1, ceilIndex(high, origin, width));
  while (edgeAt(origin, width, firstIndex) > low) firstIndex--;
  while (edgeAt(origin, width, lastIndex) < high) lastIndex++;
  return { firstIndex, lastIndex };
}

/** The grid index of the edge nearest a typed value, rounding outward. */
export function indexAtOrBelow(value: number, origin: number, width: number) {
  return floorIndex(value, origin, width);
}

export function indexAtOrAbove(value: number, origin: number, width: number) {
  return ceilIndex(value, origin, width);
}

/**
 * Where a value falls: a bin index, or a coverage tail. Each bin keeps its
 * lower edge; only the last keeps its upper edge too.
 */
export function locate(
  edges: readonly number[],
  value: number
): number | "below" | "above" {
  if (value < edges[0]!) return "below";
  if (value > edges.at(-1)!) return "above";
  let low = 0;
  let high = edges.length - 2;
  while (low < high) {
    const middle = (low + high + 1) >> 1;
    if (edges[middle]! <= value) low = middle;
    else high = middle - 1;
  }
  return low;
}
