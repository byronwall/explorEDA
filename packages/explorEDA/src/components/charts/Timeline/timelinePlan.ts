import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import { isMissingValue, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";

const HOUR = 3_600_000;

/** A time as the timeline shows it, in UTC. */
export function timelineTime(time: number) {
  return new Date(time).toLocaleString("en-US", {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function timelineDuration(ms: number) {
  const hours = ms / HOUR;
  if (hours < 1) return `${Math.round(ms / 60_000)} min`;
  if (hours < 48)
    return `${hours.toLocaleString("en-US", { maximumFractionDigits: 1 })} h`;
  return `${(hours / 24).toLocaleString("en-US", { maximumFractionDigits: 1 })} days`;
}

export interface TimelineInput {
  /** Rows to draw: those that pass the other charts' filters. */
  ids: readonly number[];
  /** Every row; lanes and the time range come from them, so both hold while filtering. */
  allIds: readonly number[];
  lane: Record<number, datum>;
  start: Record<number, datum>;
  end: Record<number, datum>;
}

export interface TimelineInterval {
  id: number;
  laneKey: string;
  start: number;
  /** The end as drawn: an open end reaches the end of the time range. */
  end: number;
  /** The row has no end yet. */
  open: boolean;
}

export interface TimelineLane {
  key: string;
  value: datum;
  label: string;
}

export interface TimelinePlan {
  lanes: TimelineLane[];
  intervals: TimelineInterval[];
  /** Earliest start to latest start or end, over every row. */
  domain: [number, number] | undefined;
  /** Drawn rows left out, by reason. */
  excluded: { reason: string; count: number }[];
}

/** A time window in milliseconds, both ends included. */
export interface TimelineWindow {
  min: number;
  max: number;
}

/**
 * Whether an interval shares any time with a window. Touching counts, so a
 * booking that ends as the window starts is kept. An open end has not ended.
 */
export function overlapsWindow(
  start: number,
  end: number | undefined,
  window: TimelineWindow
) {
  return start <= window.max && (end === undefined || end >= window.min);
}

interface Read {
  laneKey: string;
  lane: datum;
  start: number;
  end: number | undefined;
}

function readRow(input: TimelineInput, id: number): Read | string {
  const lane = input.lane[id];
  if (isMissingValue(lane)) return "rows with no lane value";
  const start = timestampOf(input.start[id]);
  if (start === undefined) return "rows with no readable start";
  const rawEnd = input.end[id];
  const end = isMissingValue(rawEnd) ? undefined : timestampOf(rawEnd);
  if (!isMissingValue(rawEnd) && end === undefined)
    return "rows with an unreadable end";
  if (end !== undefined && end < start)
    return "rows that end before they start";
  return { laneKey: categoryKey(categoryValue(lane)), lane, start, end };
}

/**
 * Lanes and intervals for a timeline. Lanes sort by label, as numbers
 * where they are numbers, over every row. Rows with no end are open: they
 * draw to the end of the time range and overlap any later window.
 */
export function planTimeline(input: TimelineInput): TimelinePlan {
  const lanes = new Map<string, TimelineLane>();
  let low = Infinity;
  let high = -Infinity;
  for (const id of input.allIds) {
    const row = readRow(input, id);
    if (typeof row === "string") continue;
    if (!lanes.has(row.laneKey))
      lanes.set(row.laneKey, {
        key: row.laneKey,
        value: row.lane,
        label: categoryLabel(categoryValue(row.lane)),
      });
    low = Math.min(low, row.start);
    high = Math.max(high, row.end ?? row.start);
  }
  const domain: [number, number] | undefined =
    low <= high ? [low, Math.max(high, low + 1)] : undefined;
  const reasons = new Map<string, number>();
  const intervals: TimelineInterval[] = [];
  for (const id of input.ids) {
    const row = readRow(input, id);
    if (typeof row === "string") {
      reasons.set(row, (reasons.get(row) ?? 0) + 1);
      continue;
    }
    intervals.push({
      id,
      laneKey: row.laneKey,
      start: row.start,
      end: row.end ?? domain![1],
      open: row.end === undefined,
    });
  }
  return {
    lanes: [...lanes.values()].sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true })
    ),
    intervals,
    domain,
    excluded: [...reasons].map(([reason, count]) => ({ reason, count })),
  };
}
