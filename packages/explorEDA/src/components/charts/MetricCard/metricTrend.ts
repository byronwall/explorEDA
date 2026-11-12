import { summarizeGroup, type AggregateInputRow } from "@/lib/aggregates";
import { DAY_MS, utcPeriod, type TimeInterval } from "@/lib/dailyRollup";
import type { datum } from "@/types/ChartTypes";
import type { MetricCardSettings } from "./definition";

export interface MetricTrendPoint {
  start: number;
  value: number | undefined;
}

export interface MetricTrend {
  interval: TimeInterval;
  /** The card's live rows, one point per period. */
  live: MetricTrendPoint[];
  /** Every row, when filters narrow the card. */
  all?: MetricTrendPoint[];
}

/** Months for a span over four months, weeks over three weeks, else days. */
export function trendInterval(span: number): TimeInterval {
  if (span > 120 * DAY_MS) return "month";
  if (span > 21 * DAY_MS) return "week";
  return "day";
}

/**
 * The card's metric per period of `trendField`. Periods come from every
 * row, so filtering never shrinks the time span, as in the line chart.
 */
export function planMetricTrend(
  settings: Pick<
    MetricCardSettings,
    "aggregation" | "measureField" | "entityField"
  >,
  dates: Record<number, datum>,
  measureData: Record<number, datum>,
  entityData: Record<number, datum> | undefined,
  liveIds: number[],
  allIds: number[]
): MetricTrend | undefined {
  const day = (id: number) => utcPeriod(dates[id], "day");
  let min = Infinity;
  let max = -Infinity;
  for (const id of allIds) {
    const period = day(id);
    if (!period) continue;
    min = Math.min(min, period.start);
    max = Math.max(max, period.start);
  }
  if (!Number.isFinite(min)) return undefined;
  const interval = trendInterval(max - min);
  const starts: number[] = [];
  for (let cursor = min; cursor <= max && starts.length < 400; ) {
    const period = utcPeriod(cursor, interval)!;
    starts.push(period.start);
    cursor = period.end;
  }
  if (starts.length < 2) return undefined;

  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const series = (ids: number[]): MetricTrendPoint[] => {
    const groups = new Map<number, AggregateInputRow[]>();
    for (const id of ids) {
      const period = utcPeriod(dates[id], interval);
      if (!period) continue;
      const row: AggregateInputRow = { __ID: id };
      if (measureField) row[measureField] = measureData[id];
      if (settings.entityField)
        row[settings.entityField] = entityData?.[id] ?? null;
      const group = groups.get(period.start);
      if (group) group.push(row);
      else groups.set(period.start, [row]);
    }
    // A period with no rows counts and sums to zero; other metrics leave a gap.
    const additive =
      settings.aggregation === "count" || settings.aggregation === "sum";
    return starts.map((start) => {
      const rows = groups.get(start);
      if (!rows) return { start, value: additive ? 0 : undefined };
      return {
        start,
        value: summarizeGroup(rows, {
          aggregation: settings.aggregation,
          measureField,
          entityField: settings.entityField,
        }).value,
      };
    });
  };

  const filtered = liveIds.length < allIds.length;
  return {
    interval,
    live: series(liveIds),
    all: filtered ? series(allIds) : undefined,
  };
}
