import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import {
  poolAggregateRows,
  type AggregateResult,
  type AggregateResultRow,
} from "@/lib/aggregates";
import type { datum } from "@/types/ChartTypes";

export interface RowCategory {
  key: string;
  value: datum;
  label: string;
  /** The value across all rows: it orders the rows and draws the context bar. */
  total: number | undefined;
  /** Rows that pass the other charts' filters. */
  sourceIds: number[];
  /** A summary's value over those rows; counts use `sourceIds.length`. */
  current?: number | undefined;
  /** The summary's rows behind `current` and `total`, for pooling and tracing. */
  live?: AggregateResultRow;
  all?: AggregateResultRow;
}

export interface RowPlan {
  categories: RowCategory[];
  visible: RowCategory[];
  other: RowCategory[];
}

export interface RowSummaryPlan extends RowPlan {
  /** Other's value, pooled from its members' rows. */
  otherSummary?: { current: number | undefined; total: number | undefined };
}

/** Largest first; categories without a value follow every valued one. */
function rank(categories: RowCategory[], maxRows: number): RowPlan {
  const sorted = [...categories].sort(
    (a, b) =>
      (b.total ?? Number.NEGATIVE_INFINITY) -
      (a.total ?? Number.NEGATIVE_INFINITY)
  );
  const other = sorted.length > maxRows ? sorted.slice(maxRows - 1) : [];
  return {
    categories: sorted,
    visible: other.length ? sorted.slice(0, maxRows - 1) : sorted,
    other,
  };
}

export function planRowCategories(
  column: Record<number, datum>,
  liveIds: number[],
  maxRows: number
): RowPlan {
  const categories = new Map<string, RowCategory & { total: number }>();
  Object.values(column).forEach((input) => {
    const value = categoryValue(input);
    const key = categoryKey(value);
    const category = categories.get(key) ?? {
      key,
      value,
      label: categoryLabel(value),
      total: 0,
      sourceIds: [],
    };
    category.total++;
    categories.set(key, category);
  });
  liveIds.forEach((id) =>
    categories.get(categoryKey(column[id]))?.sourceIds.push(id)
  );
  return rank([...categories.values()], maxRows);
}

/**
 * Ranks a grouped summary's categories by their value across all rows, so
 * the order holds while other charts filter, and draws the filtered value.
 */
export function planRowSummary(
  live: AggregateResult,
  all: AggregateResult,
  maxRows: number
): RowSummaryPlan {
  const liveRows = new Map(
    live.rows.map((row) => [categoryKey(row.groupValue), row])
  );
  // A sum or count of no rows is zero; an average of none has no value.
  const empty = all.spec.aggregation === "average" ? undefined : 0;
  const categories = all.rows.map((row): RowCategory => {
    const key = categoryKey(row.groupValue);
    const current = liveRows.get(key);
    return {
      key,
      value: row.groupValue,
      label: row.groupLabel,
      total: row.value,
      current: current ? current.value : empty,
      sourceIds: current?.contributors.map((item) => item.sourceId) ?? [],
      live: current,
      all: row,
    };
  });
  const plan = rank(categories, maxRows);
  if (!plan.other.length) return plan;
  const pool = (rows: (AggregateResultRow | undefined)[]) => {
    const present = rows.filter(
      (row): row is AggregateResultRow => row !== undefined
    );
    return present.length ? poolAggregateRows(present, all.spec).value : empty;
  };
  return {
    ...plan,
    otherSummary: {
      current: pool(plan.other.map((item) => item.live)),
      total: pool(plan.other.map((item) => item.all)),
    },
  };
}
