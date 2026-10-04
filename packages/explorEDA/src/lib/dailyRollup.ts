import {
  summarizeGroup,
  type AggregateAggregation,
  type AggregateContributor,
  type AggregateInputRow,
} from "@/lib/aggregates";
import { dateTimestamp } from "@/lib/dateTime";
import type { datum } from "@/types/ChartTypes";

export const DAY_MS = 86_400_000;
export type TimeInterval = "day" | "week" | "month";
export type WeekStart = "monday" | "sunday";

export interface DailyRollupSpec {
  dateField: string;
  aggregation: AggregateAggregation;
  measureField?: string;
}

export interface DailyBucket {
  day: string;
  start: number;
  value: number | undefined;
  rowCount: number;
  contributors: AggregateContributor[];
}

export interface TimeBucket extends DailyBucket {
  /** Exclusive upper boundary in UTC. */
  end: number;
}

export interface DailyRollup {
  days: Map<string, DailyBucket>;
  invalidDateIds: number[];
  years: number[];
}

/** The UTC day of a date value, or undefined for an unreadable date. */
export function utcDay(
  value: datum
): { day: string; start: number } | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const timestamp = dateTimestamp(value);
  if (!Number.isFinite(timestamp)) return undefined;
  const start = Math.floor(timestamp / DAY_MS) * DAY_MS;
  return { day: new Date(start).toISOString().slice(0, 10), start };
}

/** Calendar boundaries, including month length and the chosen week start. */
export function utcPeriod(
  value: datum,
  interval: TimeInterval,
  weekStart: WeekStart = "monday"
) {
  const day = utcDay(value);
  if (!day) return undefined;
  const date = new Date(day.start);
  if (interval === "month") date.setUTCDate(1);
  if (interval === "week") {
    date.setUTCDate(
      date.getUTCDate() -
        ((date.getUTCDay() - (weekStart === "sunday" ? 0 : 1) + 7) % 7)
    );
  }
  const start = date.getTime();
  if (interval === "month") date.setUTCMonth(date.getUTCMonth() + 1);
  else date.setUTCDate(date.getUTCDate() + (interval === "week" ? 7 : 1));
  return {
    day: new Date(start).toISOString().slice(0, 10),
    start,
    end: date.getTime(),
  };
}

export function rollupByPeriod(
  ids: number[],
  dateData: Record<number, datum>,
  measureData: Record<number, datum>,
  spec: DailyRollupSpec & { interval: TimeInterval; weekStart?: WeekStart },
  rawInputs: Record<number, datum> = {},
  exclusionReasons: Record<number, string> = {}
) {
  const groups = new Map<
    number,
    {
      period: NonNullable<ReturnType<typeof utcPeriod>>;
      rows: AggregateInputRow[];
    }
  >();
  const invalidDateIds: number[] = [];
  const measureField =
    spec.aggregation === "count" ? undefined : spec.measureField;
  for (const id of ids) {
    const period = utcPeriod(dateData[id], spec.interval, spec.weekStart);
    if (!period) {
      invalidDateIds.push(id);
      continue;
    }
    const row: AggregateInputRow = { __ID: id };
    if (measureField) row[measureField] = measureData[id];
    const group = groups.get(period.start);
    if (group) group.rows.push(row);
    else groups.set(period.start, { period, rows: [row] });
  }
  const buckets: TimeBucket[] = [...groups.values()]
    .sort((a, b) => a.period.start - b.period.start)
    .map(({ period, rows }) => ({
      ...period,
      ...summarizeGroup(
        rows,
        { aggregation: spec.aggregation, measureField },
        rawInputs,
        exclusionReasons
      ),
    }));
  return { buckets, invalidDateIds };
}

/** Calendar heatmaps and daily lines use the same reducer and boundaries. */
export function rollupByDay(
  ids: number[],
  dates: Record<number, datum>,
  measures: Record<number, datum>,
  spec: DailyRollupSpec
): DailyRollup {
  const { buckets, invalidDateIds } = rollupByPeriod(ids, dates, measures, {
    ...spec,
    interval: "day",
  });
  return {
    days: new Map(buckets.map((bucket) => [bucket.day, bucket])),
    invalidDateIds,
    years: [
      ...new Set(
        buckets.map((bucket) => new Date(bucket.start).getUTCFullYear())
      ),
    ].sort((a, b) => a - b),
  };
}
