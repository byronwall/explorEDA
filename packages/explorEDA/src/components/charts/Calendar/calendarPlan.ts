import type { AggregateContributor } from "@/lib/aggregates";
import { DAY_MS, rollupByDay, utcDay } from "@/lib/dailyRollup";
import type { datum } from "@/types/ChartTypes";
import type { DateRangeFilter } from "@/types/FilterTypes";
import { interpolateBlues, interpolateRdBu } from "d3-scale-chromatic";
import type { CalendarSettings } from "./definition";

export interface CalendarSnapshot {
  revision: string;
  /** Every source row ID. Years come from them so the year list holds while filtering. */
  allIds: number[];
  /** Rows after other charts' filters. */
  liveIds: number[];
  dateData: Record<number, datum>;
  measureData: Record<number, datum>;
}

/** Empty: no source rows that day. Invalid: rows, but none with a valid measure. */
export type CalendarDayState = "value" | "empty" | "invalid";

export interface CalendarDay {
  id: string;
  /** `YYYY-MM-DD` in UTC. */
  day: string;
  /** UTC midnight; the day covers [start, start + 1 day). */
  start: number;
  label: string;
  dayOfMonth: number;
  state: CalendarDayState;
  value: number | undefined;
  valueText: string;
  rowCount: number;
  contributors: AggregateContributor[];
  /** Grid position: week column and weekday row in year view, or row and column in month view. */
  column: number;
  row: number;
  x: number;
  y: number;
  size: number;
  height: number;
  fill: string;
  textFill: string;
  selected: boolean | undefined;
}

export interface CalendarPlan {
  revision: string;
  view: "year" | "month";
  year: number;
  years: number[];
  /** Month on show in month view, 0 to 11. */
  month: number;
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  days: CalendarDay[];
  monthLabels: { label: string; x: number }[];
  weekdayLabels: { label: string; position: number }[];
  /** Columns in the grid, used for keyboard movement. */
  columns: number;
  metricLabel: string;
  fieldLabel: string;
  scale: {
    kind: "sequential" | "diverging";
    domain: [number, number];
    population: string;
  };
  hasEmpty: boolean;
  hasInvalid: boolean;
  /** Rows the chart leaves out: unreadable dates, and dates in other years. */
  omitted: { invalidDates: number; otherYears: number };
  selection?: { min?: string; max?: string };
  scopeNote: string;
}

export interface CalendarPlanInput {
  settings: CalendarSettings;
  width: number;
  height: number;
  snapshot: CalendarSnapshot;
  /** Month to show when the chart is too narrow for a whole year. */
  month?: number;
  getFieldLabel: (field: string) => string;
  formatFieldValue?: (field: string, value: datum) => string;
}

export const HEADER_HEIGHT = 30;
const MONTH_LABEL_HEIGHT = 16;
/** Smallest year-view cell that still takes a pointer comfortably. */
const MIN_YEAR_CELL = 9;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const dateLabel = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
  month: "short",
  day: "numeric",
  year: "numeric",
});

export function textOn(fill: string) {
  const [r = 255, g = 255, b = 255] = (fill.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55 ? "#ffffff" : "#1f2937";
}

export function planCalendar({
  settings,
  width,
  height,
  snapshot,
  month: requestedMonth,
  getFieldLabel,
  formatFieldValue,
}: CalendarPlanInput): CalendarPlan {
  const measureField =
    settings.aggregation === "count" ? undefined : settings.measureField;
  const yearSet = new Set<number>();
  for (const id of snapshot.allIds) {
    const parsed = utcDay(snapshot.dateData[id]);
    if (parsed) {yearSet.add(new Date(parsed.start).getUTCFullYear());}
  }
  const years = [...yearSet].sort((a, b) => a - b);
  const year =
    settings.year !== undefined && yearSet.has(settings.year)
      ? settings.year
      : (years.at(-1) ?? new Date().getUTCFullYear());

  const rollup = rollupByDay(snapshot.liveIds, snapshot.dateData, snapshot.measureData, {
    dateField: settings.field,
    aggregation: settings.aggregation,
    measureField,
  });
  let otherYears = 0;
  for (const bucket of rollup.days.values()) {
    if (new Date(bucket.start).getUTCFullYear() !== year) {otherYears += bucket.rowCount;}
  }

  const yearStart = Date.UTC(year, 0, 1);
  const dayCount = (Date.UTC(year + 1, 0, 1) - yearStart) / DAY_MS;
  const weekStartDay = settings.weekStart === "sunday" ? 0 : 1;
  const weekdayRow = (start: number) => (new Date(start).getUTCDay() - weekStartDay + 7) % 7;
  const firstOffset = weekdayRow(yearStart);
  const weekCount = Math.ceil((dayCount + firstOffset) / 7);

  // Fit a year if cells stay usable; otherwise show one month.
  const left = settings.margin.left + 34;
  const right = settings.margin.right;
  const yearTop = settings.margin.top + HEADER_HEIGHT + MONTH_LABEL_HEIGHT;
  const bottom = settings.margin.bottom + 16;
  // Cells may widen up to 1.8 times their height so a year fills wide panels.
  const yearCellHeight = Math.min((height - yearTop - bottom) / 7, 22);
  const yearCellWidth = Math.min((width - left - right) / weekCount, yearCellHeight * 1.8);
  const view: CalendarPlan["view"] =
    Math.min(yearCellWidth, yearCellHeight) >= MIN_YEAR_CELL ? "year" : "month";

  const allDays = Array.from({ length: dayCount }, (_, index) => yearStart + index * DAY_MS);
  const latestWithRows = [...rollup.days.values()]
    .filter((bucket) => new Date(bucket.start).getUTCFullYear() === year)
    .reduce((latest, bucket) => Math.max(latest, bucket.start), yearStart);
  const month =
    requestedMonth !== undefined && requestedMonth >= 0 && requestedMonth < 12
      ? requestedMonth
      : new Date(latestWithRows).getUTCMonth();

  let shown: number[];
  let columns: number;
  let cellWidth: number;
  let cellHeight: number;
  let top: number;
  const place: (start: number, index: number) => { column: number; row: number } =
    view === "year"
      ? (start, index) => ({
          column: Math.floor((index + firstOffset) / 7),
          row: weekdayRow(start),
        })
      : (start) => {
          const first = Date.UTC(year, month, 1);
          const offset = weekdayRow(first);
          const position = (start - first) / DAY_MS + offset;
          return { column: position % 7, row: Math.floor(position / 7) };
        };
  if (view === "year") {
    shown = allDays;
    columns = weekCount;
    cellWidth = yearCellWidth;
    cellHeight = yearCellHeight;
    top = yearTop;
  } else {
    shown = allDays.filter((start) => new Date(start).getUTCMonth() === month);
    const first = Date.UTC(year, month, 1);
    const rows = Math.ceil((weekdayRow(first) + shown.length) / 7);
    columns = 7;
    top = settings.margin.top + HEADER_HEIGHT + MONTH_LABEL_HEIGHT;
    cellWidth = Math.max(8, (width - settings.margin.left - right) / 7);
    cellHeight = Math.max(8, Math.min(cellWidth, (height - top - bottom) / rows));
  }
  const marginLeft = view === "year" ? left : settings.margin.left;

  const buckets = allDays.map((start) => rollup.days.get(new Date(start).toISOString().slice(0, 10)));
  const values = buckets.flatMap((bucket) =>
    bucket && typeof bucket.value === "number" && Number.isFinite(bucket.value) ? [bucket.value] : []
  );
  const low = values.length ? Math.min(...values) : 0;
  const high = values.length ? Math.max(...values) : 0;
  const diverging = low < 0 && high > 0;
  const span = Math.max(Math.abs(low), Math.abs(high)) || 1;
  const colorFor = (value: number) =>
    diverging
      ? interpolateRdBu(0.5 + value / (2 * span))
      : interpolateBlues(0.12 + (high === low ? 0.6 : (value - low) / (high - low)) * 0.8);
  const format = (value: number) =>
    measureField && formatFieldValue
      ? formatFieldValue(measureField, value)
      : value.toLocaleString("en-US", { maximumFractionDigits: 3 });

  const filter = settings.filters.find(
    (item): item is DateRangeFilter =>
      item.type === "date-range" && item.field === settings.field
  );
  const inFilter = (day: string) =>
    (!filter?.min || day >= filter.min.slice(0, 10)) &&
    (!filter?.max || day <= filter.max.slice(0, 10));

  const days: CalendarDay[] = shown.map((start) => {
    const index = (start - yearStart) / DAY_MS;
    const bucket = buckets[index];
    const day = new Date(start).toISOString().slice(0, 10);
    const state: CalendarDayState = !bucket
      ? "empty"
      : typeof bucket.value === "number" && Number.isFinite(bucket.value)
        ? "value"
        : "invalid";
    const fill = state === "value" ? colorFor(bucket!.value!) : "transparent";
    const { column, row } = place(start, index);
    return {
      id: `day:${day}`,
      day,
      start,
      label: dateLabel.format(start),
      dayOfMonth: new Date(start).getUTCDate(),
      state,
      value: bucket?.value,
      valueText:
        state === "value" ? format(bucket!.value!) : state === "empty" ? "No rows" : "No valid values",
      rowCount: bucket?.rowCount ?? 0,
      contributors: bucket?.contributors ?? [],
      column,
      row,
      x: column * cellWidth,
      y: row * cellHeight,
      size: cellWidth,
      height: cellHeight,
      fill,
      textFill: state === "value" ? textOn(fill) : "currentColor",
      selected: filter ? inFilter(day) : undefined,
    };
  });

  const monthLabels =
    view === "year"
      ? MONTHS.map((label, index) => ({
          label,
          x: place(Date.UTC(year, index, 1), (Date.UTC(year, index, 1) - yearStart) / DAY_MS).column * cellWidth,
        }))
      : [];
  const weekdayOrder = Array.from({ length: 7 }, (_, row) => WEEKDAYS[(row + weekStartDay) % 7]!);
  const weekdayLabels =
    view === "year"
      ? weekdayOrder
          .map((label, row) => ({ label, position: row * cellHeight + cellHeight / 2 }))
          .filter((_, row) => cellHeight >= 13 || row % 2 === 1)
      : weekdayOrder.map((label, column) => ({ label, position: column * cellWidth + cellWidth / 2 }));

  return {
    revision: snapshot.revision,
    view,
    year,
    years,
    month,
    width,
    height,
    margin: { top, right, bottom, left: marginLeft },
    days,
    monthLabels,
    weekdayLabels,
    columns,
    metricLabel:
      settings.aggregation === "count"
        ? "Row count"
        : `${settings.aggregation === "sum" ? "Sum" : "Average"} of ${getFieldLabel(measureField ?? "")}`,
    fieldLabel: getFieldLabel(settings.field),
    scale: {
      kind: diverging ? "diverging" : "sequential",
      domain: [low, high],
      population: `days in ${year} after other chart filters`,
    },
    hasEmpty: days.some((day) => day.state === "empty"),
    hasInvalid: days.some((day) => day.state === "invalid"),
    omitted: { invalidDates: rollup.invalidDateIds.length, otherYears },
    selection: filter ? { min: filter.min, max: filter.max } : undefined,
    scopeNote: "Days in UTC. Rows after other chart filters; this chart's selected day is outlined",
  };
}

/** The filter change that selects one day, or clears it when that day is already selected. */
export function toggleDayFilter(settings: CalendarSettings, plan: CalendarPlan, day: CalendarDay) {
  const rest = settings.filters.filter(
    (item) => item.type !== "date-range" || item.field !== settings.field
  );
  const current = plan.selection;
  if (current?.min === day.day && current?.max === day.day) {return rest;}
  return [...rest, { type: "date-range" as const, field: settings.field, min: day.day, max: day.day }];
}
