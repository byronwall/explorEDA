import {
  calculateGroupedAggregate,
  poolAggregateRows,
  type AggregateInputRow,
  type AggregateResultRow,
} from "@/lib/aggregates";
import { categoryKey, categoryLabel } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";

export type DonutAggregation = "count" | "sum";

/** The slices a donut shows when no Top N is set. */
export const DEFAULT_DONUT_SLICES = 6;

export interface DonutSlice {
  /** The category key, or `__other` for the pooled smaller categories. */
  key: string;
  value: datum;
  label: string;
  amount: number;
  /** The slice's part of the whole, from 0 to 1. */
  share: number;
  /** The reduction behind the slice, with its contributing rows. */
  row: Pick<AggregateResultRow, "value" | "rowCount" | "contributors">;
  /** The categories Other pools, largest first. */
  members?: { value: datum; label: string; amount: number }[];
}

export interface DonutPlan {
  slices: DonutSlice[];
  total: number;
  /** Set instead of slices when the values cannot form a whole. */
  message?: string;
}

export interface DonutInput {
  /** Rows that pass the other charts' filters: the whole. */
  ids: readonly number[];
  category: Record<number, datum>;
  aggregation: DonutAggregation;
  /** Measure values by row ID; omitted for a count. */
  measure?: Record<number, datum>;
  rawInputs?: Record<number, datum>;
  exclusionReasons?: Record<number, string>;
  /** Named slices before the rest pool into Other. */
  topN?: number;
}

const GROUP = "category";
const MEASURE = "measure";

/**
 * Shares of a whole: the filtered rows, reduced by category with the shared
 * grouped aggregate. The largest categories get their own slices and the
 * rest pool into Other, which reduces their rows again. A negative part or
 * a zero total has no meaningful share, so the plan says why instead.
 */
export function planDonut(input: DonutInput): DonutPlan {
  const spec = {
    id: "donut",
    name: "Share",
    groupField: GROUP,
    measureField: input.measure ? MEASURE : undefined,
    aggregation: input.aggregation,
  };
  const rows: AggregateInputRow[] = input.ids.map((id) => ({
    __ID: id,
    [GROUP]: input.category[id],
    ...(input.measure ? { [MEASURE]: input.measure[id] } : {}),
  }));
  if (!rows.length) return { slices: [], total: 0 };
  const groups = calculateGroupedAggregate(
    rows,
    spec,
    input.rawInputs,
    input.exclusionReasons
  ).rows;
  const negative = groups.find((group) => (group.value ?? 0) < 0);
  if (negative) {
    return {
      slices: [],
      total: 0,
      message: `${negative.groupLabel} is negative, so the values don't form a whole. Use a measure with no negative values.`,
    };
  }
  const total = groups.reduce((sum, group) => sum + (group.value ?? 0), 0);
  if (!(total > 0)) {
    return {
      slices: [],
      total: 0,
      message: "The values sum to zero, so there are no shares to show.",
    };
  }
  const ranked = [...groups].sort((a, b) => (b.value ?? 0) - (a.value ?? 0));
  const limit = Math.max(1, input.topN ?? DEFAULT_DONUT_SLICES);
  const named = ranked.slice(0, limit);
  const rest = ranked.slice(limit);
  const slices: DonutSlice[] = named.map((group) => ({
    key: categoryKey(group.groupValue),
    value: group.groupValue,
    label: categoryLabel(group.groupValue),
    amount: group.value ?? 0,
    share: (group.value ?? 0) / total,
    row: group,
  }));
  if (rest.length) {
    const pooled = poolAggregateRows(rest, spec);
    const amount = rest.reduce((sum, group) => sum + (group.value ?? 0), 0);
    slices.push({
      key: "__other",
      value: undefined,
      label: "Other",
      amount,
      share: amount / total,
      row: { ...pooled, value: amount },
      members: rest.map((group) => ({
        value: group.groupValue,
        label: categoryLabel(group.groupValue),
        amount: group.value ?? 0,
      })),
    });
  }
  return { slices, total };
}
