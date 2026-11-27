import { SMALL_SAMPLE, isAdditiveSpec } from "@/lib/aggregates";
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
  /** The value across all rows: it draws the context bar. */
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
  /** The categories the chart draws, in rank order: `visible`, then `other`. */
  categories: RowCategory[];
  visible: RowCategory[];
  other: RowCategory[];
  /** Categories left out because no row passes the other charts' filters. */
  empty: RowCategory[];
}

/**
 * Ranks rows by the value they draw, after other charts filter, and leaves out
 * categories with no matching rows. Without it, every category keeps its
 * all-rows order.
 */
export interface FollowFilters {
  /**
   * This chart's selected values when other filters last changed: each keeps
   * its row, even with no rows. Holding them since then means a click on this
   * chart never moves a row.
   */
  selected: datum[];
}

export interface RowSummaryPlan extends RowPlan {
  /** Other's value, pooled from its members' rows. */
  otherSummary?: { current: number | undefined; total: number | undefined };
}

/**
 * Largest first; categories without a value follow every valued one. A rate
 * or average over fewer than SMALL_SAMPLE rows follows every larger group,
 * so Top N shows groups with enough rows to trust and tiny ones fold away.
 * When following filters, a selected category stays out of Other if it can.
 */
function rank(
  categories: RowCategory[],
  maxRows: number,
  follow: FollowFilters | undefined,
  /** A category's filtered value. */
  filtered: (item: RowCategory) => number | undefined
): RowPlan {
  // A set, since a click on Other can select thousands of values.
  const chosen = new Set(follow?.selected.map((value) => value ?? null));
  const selected = (item: RowCategory) => chosen.has(item.value ?? null);
  const matches = (item: RowCategory) =>
    !follow || item.sourceIds.length > 0 || selected(item);
  const band = (item: RowCategory) => {
    // A selected category with no rows follows every category with rows.
    if (follow && !item.sourceIds.length) return 2;
    const n = (follow ? item.live : item.all)?.sampleSize;
    return n !== undefined && n < SMALL_SAMPLE ? 1 : 0;
  };
  const value = (item: RowCategory) =>
    (follow ? filtered(item) : item.total) ?? Number.NEGATIVE_INFINITY;
  const total = (item: RowCategory) => item.total ?? Number.NEGATIVE_INFINITY;
  // Two missing values subtract to NaN, which falls through to the next key.
  const sorted = categories
    .filter(matches)
    .sort(
      (a, b) =>
        band(a) - band(b) || value(b) - value(a) || total(b) - total(a) || 0
    );
  const empty = categories.filter((item) => !matches(item));
  if (sorted.length <= maxRows)
    return { categories: sorted, visible: sorted, other: [], empty };
  const slots = maxRows - 1;
  // Selected rows take their slots first, unless they outnumber them, or all
  // of Other is selected, as after a click on it: that selection stays there.
  const pinned = sorted.slice(slots).every(selected)
    ? []
    : sorted.filter(selected);
  const keep = new Set(pinned.length <= slots ? pinned : []);
  for (const item of sorted) {
    if (keep.size >= slots) break;
    keep.add(item);
  }
  const visible = sorted.filter((item) => keep.has(item));
  const other = sorted.filter((item) => !keep.has(item));
  return { categories: [...visible, ...other], visible, other, empty };
}

export function planRowCategories(
  column: Record<number, datum>,
  liveIds: number[],
  maxRows: number,
  /** The rows the chart can draw, when its own filter narrows them. */
  population?: number[],
  follow?: FollowFilters
): RowPlan {
  const categories = new Map<string, RowCategory & { total: number }>();
  (population
    ? population.map((id) => column[id])
    : Object.values(column)
  ).forEach((input) => {
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
  return rank(
    [...categories.values()],
    maxRows,
    follow,
    (item) => item.sourceIds.length
  );
}

/**
 * Ranks a grouped summary's categories and draws the filtered value over the
 * value across all rows. See `FollowFilters` for the order.
 */
export function planRowSummary(
  live: AggregateResult,
  all: AggregateResult,
  maxRows: number,
  follow?: FollowFilters
): RowSummaryPlan {
  const liveRows = new Map(
    live.rows.map((row) => [categoryKey(row.groupValue), row])
  );
  // A sum or count of no rows is zero; an average, max, or min of none has
  // no value.
  const empty = isAdditiveSpec(all.spec) ? 0 : undefined;
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
  const plan = rank(categories, maxRows, follow, (item) => item.current);
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
