import {
  summarizeGroup,
  type AggregateAggregation,
  type AggregateContributor,
  type AggregateInputRow,
} from "@/lib/aggregates";
import { dateTimestamp } from "@/lib/dateTime";
import type { datum } from "@/types/ChartTypes";

export const DAY_MS = 86_400_000;

export interface DailyRollupSpec {
  dateField: string;
  aggregation: AggregateAggregation;
  measureField?: string;
}

/** One UTC day: rows whose date falls in [start, start + 1 day). */
export interface DailyBucket {
  /** `YYYY-MM-DD` in UTC. */
  day: string;
  start: number;
  value: number | undefined;
  rowCount: number;
  contributors: AggregateContributor[];
}

export interface DailyRollup {
  days: Map<string, DailyBucket>;
  /** Source rows whose date is missing or cannot be read. */
  invalidDateIds: number[];
  /** Years with at least one valid date, oldest first. */
  years: number[];
}

/** The UTC day of a date value, or undefined when it is not a readable date. */
export function utcDay(value: datum): { day: string; start: number } | undefined {
  if (typeof value !== "string" || !value.trim()) {return undefined;}
  const timestamp = dateTimestamp(value);
  if (!Number.isFinite(timestamp)) {return undefined;}
  const start = Math.floor(timestamp / DAY_MS) * DAY_MS;
  return { day: new Date(start).toISOString().slice(0, 10), start };
}

/**
 * Groups rows by the UTC day of their date and reduces each day with the
 * grouped-summary rules, so a day keeps its contributors and exclusions.
 */
export function rollupByDay(
  ids: number[],
  dateData: Record<number, datum>,
  measureData: Record<number, datum>,
  spec: DailyRollupSpec
): DailyRollup {
  const groups = new Map<string, { start: number; rows: AggregateInputRow[] }>();
  const invalidDateIds: number[] = [];
  const years = new Set<number>();
  const measureField =
    spec.aggregation === "count" ? undefined : spec.measureField;
  for (const id of ids) {
    const parsed = utcDay(dateData[id]);
    if (!parsed) {
      invalidDateIds.push(id);
      continue;
    }
    years.add(new Date(parsed.start).getUTCFullYear());
    const row: AggregateInputRow = { __ID: id };
    if (measureField) {row[measureField] = measureData[id];}
    const group = groups.get(parsed.day);
    if (group) {group.rows.push(row);}
    else {groups.set(parsed.day, { start: parsed.start, rows: [row] });}
  }
  const days = new Map<string, DailyBucket>();
  for (const [day, group] of groups) {
    days.set(day, {
      day,
      start: group.start,
      ...summarizeGroup(group.rows, {
        aggregation: spec.aggregation,
        measureField,
      }),
    });
  }
  return {
    days,
    invalidDateIds,
    years: [...years].sort((a, b) => a - b),
  };
}
