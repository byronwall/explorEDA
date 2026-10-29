import { pairCorrelation, type PairCorrelation } from "@/lib/pairCorrelation";
import type { MatrixPairOrder } from "./definition";

/** A continuous field's value for each live row, NaN when it has none. */
export interface DiscoveryField {
  field: string;
  label: string;
  /** Position in the matrix's field order. */
  index: number;
  value: ArrayLike<number>;
}

/** One unique pair of continuous fields, with both coefficients. */
export interface DiscoveryPair extends PairCorrelation {
  /** The two field keys, sorted, as JSON: the same however fields move. */
  id: string;
  /** The earlier field in matrix order, then the later one. */
  a: DiscoveryField;
  b: DiscoveryField;
}

/** The matrix shows up to 10 fields, so at most 45 pairs. */
export function planDiscoveryPairs(fields: DiscoveryField[]): DiscoveryPair[] {
  const pairs: DiscoveryPair[] = [];
  for (let i = 0; i < fields.length; i++) {
    for (let j = i + 1; j < fields.length; j++) {
      const a = fields[i]!;
      const b = fields[j]!;
      pairs.push({
        id: JSON.stringify([a.field, b.field].sort()),
        a,
        b,
        ...pairCorrelation(a.value, b.value, ["pearson", "spearman"]),
      });
    }
  }
  return pairs;
}

/** The value a metric order sorts by, or undefined when it has none. */
function metric(pair: DiscoveryPair, order: MatrixPairOrder) {
  const r = pair.pearson?.value;
  const rho = pair.spearman?.value;
  if (order === "pearson") return r === undefined ? undefined : Math.abs(r);
  if (order === "spearman")
    return rho === undefined ? undefined : Math.abs(rho);
  return r === undefined || rho === undefined ? undefined : Math.abs(rho - r);
}

const byId = (a: DiscoveryPair, b: DiscoveryPair) =>
  a.id < b.id ? -1 : a.id > b.id ? 1 : 0;

/**
 * Field order keeps the matrix's order. A metric order puts the largest
 * first and pairs without a value last; equal values fall back to the ID.
 */
export function sortDiscoveryPairs(
  pairs: DiscoveryPair[],
  order: MatrixPairOrder
): DiscoveryPair[] {
  if (order === "fields") {
    return [...pairs].sort(
      (x, y) => x.a.index - y.a.index || x.b.index - y.b.index
    );
  }
  return [...pairs].sort((x, y) => {
    const mx = metric(x, order);
    const my = metric(y, order);
    if (mx === undefined || my === undefined) {
      return mx === my ? byId(x, y) : mx === undefined ? 1 : -1;
    }
    return my - mx || byId(x, y);
  });
}
