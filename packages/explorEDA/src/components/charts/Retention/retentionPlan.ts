import { categoryKey, categoryValue } from "@/lib/categories";
import { isMissingValue, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";

const DAY = 86_400_000;

export type RetentionPeriod = "day" | "week" | "month";

export interface RetentionInput {
  /** The event rows to count. */
  ids: readonly number[];
  /** Every row the chart can draw; the last time in them ends the grid. */
  allIds: readonly number[];
  entity: Record<number, datum>;
  time: Record<number, datum>;
  /** The event field, when entry or activity is limited to some events. */
  event?: Record<number, datum>;
  /** The event that enters an entity into its cohort; unset is its first event. */
  entryEvent?: datum;
  /** Events that count as active; empty counts every event. */
  activityEvents?: readonly datum[];
  period: RetentionPeriod;
  /** Elapsed periods shown, from period 0. */
  periods: number;
}

export interface RetentionCell {
  id: string;
  period: number;
  /** Entities with a qualifying event in this elapsed period. */
  active: number;
  /** active ÷ the cohort's size. */
  rate: number;
  /** False once the period lies past the data's last time. */
  observed: boolean;
  /** The data ends partway through this period. */
  partial: boolean;
  /** Entity values active here, in first-seen order. */
  entities: datum[];
  /** The events that made each entity active, one per entity. */
  rows: number[];
}

export interface RetentionCohort {
  key: string;
  /** Start of the cohort's period, UTC. */
  start: number;
  /** Entities that entered in this period. */
  size: number;
  /** The entry event of each entity. */
  entryRows: number[];
  cells: RetentionCell[];
}

export interface RetentionSummaryCell {
  period: number;
  active: number;
  /** Entities in cohorts that reached this period. */
  size: number;
  rate: number;
}

export interface RetentionPlan {
  cohorts: RetentionCohort[];
  /** Every cohort together, over the cohorts each period has reached. */
  summary: RetentionSummaryCell[];
  /** Start of the last period with data, UTC. */
  lastTime?: number;
  entities: number;
  excluded: { reason: string; count: number }[];
}

/** The start of the UTC period holding a time; weeks start on Monday. */
export function periodStart(time: number, period: RetentionPeriod) {
  const date = new Date(Math.floor(time / DAY) * DAY);
  if (period === "month") date.setUTCDate(1);
  if (period === "week") {
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  }
  return date.getTime();
}

export function periodEnd(start: number, period: RetentionPeriod) {
  const date = new Date(start);
  if (period === "month") date.setUTCMonth(date.getUTCMonth() + 1);
  else date.setUTCDate(date.getUTCDate() + (period === "week" ? 7 : 1));
  return date.getTime();
}

/** Whole periods from one period start to another. */
function periodsBetween(from: number, to: number, period: RetentionPeriod) {
  if (period === "month") {
    const a = new Date(from);
    const b = new Date(to);
    return (
      (b.getUTCFullYear() - a.getUTCFullYear()) * 12 +
      b.getUTCMonth() -
      a.getUTCMonth()
    );
  }
  return Math.round((to - from) / (period === "week" ? 7 * DAY : DAY));
}

/** Adds whole periods to a period start. */
function addPeriods(start: number, count: number, period: RetentionPeriod) {
  const date = new Date(start);
  if (period === "month") date.setUTCMonth(date.getUTCMonth() + count);
  else date.setUTCDate(date.getUTCDate() + count * (period === "week" ? 7 : 1));
  return date.getTime();
}

/**
 * Cohorts by the period each entity entered, and the share of each cohort
 * active in each elapsed period after. Periods are calendar periods in UTC,
 * so period 1 is the next calendar week or month, not seven days later. A
 * period past the data's last time has no value; the period the data ends
 * in is marked partial.
 */
export function planRetention(input: RetentionInput): RetentionPlan {
  const keyOf = (value: datum) => categoryKey(categoryValue(value));
  const entryKey =
    input.entryEvent === undefined ? undefined : keyOf(input.entryEvent);
  const activity = new Set((input.activityEvents ?? []).map(keyOf));
  const eventKey = (id: number) =>
    input.event ? keyOf(input.event[id]) : undefined;

  let lastTime: number | undefined;
  for (const id of input.allIds) {
    const time = timestampOf(input.time[id]);
    if (time !== undefined && (lastTime === undefined || time > lastTime))
      lastTime = time;
  }

  let missingEntity = 0;
  let missingTime = 0;
  const byEntity = new Map<
    string,
    { value: datum; rows: { id: number; time: number }[] }
  >();
  for (const id of input.ids) {
    const entity = input.entity[id];
    if (isMissingValue(entity)) {
      missingEntity += 1;
      continue;
    }
    const time = timestampOf(input.time[id]);
    if (time === undefined) {
      missingTime += 1;
      continue;
    }
    const key = keyOf(entity);
    const item = byEntity.get(key);
    if (item) item.rows.push({ id, time });
    else byEntity.set(key, { value: entity, rows: [{ id, time }] });
  }

  const lastPeriod =
    lastTime === undefined ? undefined : periodStart(lastTime, input.period);
  const cohorts = new Map<number, RetentionCohort>();
  let noEntry = 0;
  for (const { value, rows } of byEntity.values()) {
    rows.sort((a, b) => a.time - b.time || a.id - b.id);
    const entry = rows.find(
      (row) => entryKey === undefined || eventKey(row.id) === entryKey
    );
    if (!entry) {
      noEntry += 1;
      continue;
    }
    const start = periodStart(entry.time, input.period);
    let cohort = cohorts.get(start);
    if (!cohort) {
      cohort = {
        key: new Date(start).toISOString().slice(0, 10),
        start,
        size: 0,
        entryRows: [],
        cells: Array.from({ length: input.periods }, (_, period) => {
          const begins = addPeriods(start, period, input.period);
          const observed = lastPeriod !== undefined && begins <= lastPeriod;
          return {
            id: `${new Date(start).toISOString().slice(0, 10)}:${period}`,
            period,
            active: 0,
            rate: 0,
            observed,
            partial:
              observed &&
              lastTime !== undefined &&
              periodEnd(begins, input.period) >
                Math.floor(lastTime / DAY) * DAY + DAY,
            entities: [],
            rows: [],
          };
        }),
      };
      cohorts.set(start, cohort);
    }
    cohort.size += 1;
    cohort.entryRows.push(entry.id);
    // Each elapsed period counts the entity once, at its first event there.
    const seen = new Set<number>();
    for (const row of rows) {
      if (row.time < entry.time) continue;
      if (activity.size > 0 && !activity.has(eventKey(row.id) ?? "")) continue;
      const period = periodsBetween(
        start,
        periodStart(row.time, input.period),
        input.period
      );
      if (period >= input.periods || seen.has(period)) continue;
      seen.add(period);
      const cell = cohort.cells[period]!;
      cell.active += 1;
      cell.entities.push(value);
      cell.rows.push(row.id);
    }
  }

  const sorted = [...cohorts.values()].sort((a, b) => a.start - b.start);
  for (const cohort of sorted) {
    for (const cell of cohort.cells) {
      cell.rate = cell.observed && cohort.size ? cell.active / cohort.size : 0;
    }
  }
  const summary = Array.from({ length: input.periods }, (_, period) => {
    let active = 0;
    let size = 0;
    for (const cohort of sorted) {
      const cell = cohort.cells[period]!;
      if (!cell.observed) continue;
      active += cell.active;
      size += cohort.size;
    }
    return { period, active, size, rate: size ? active / size : 0 };
  });
  const excluded = [
    { reason: "rows with no entity", count: missingEntity },
    { reason: "rows with no readable time", count: missingTime },
  ].filter((item) => item.count > 0);
  return {
    cohorts: sorted,
    summary,
    lastTime,
    entities: byEntity.size - noEntry,
    excluded: noEntry
      ? [
          ...excluded,
          {
            reason: "without the entry event",
            count: noEntry,
          },
        ]
      : excluded,
  };
}
