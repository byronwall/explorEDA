import { ChartGantt as TimelineIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import { dateBound, isMissingValue } from "@/lib/valueParsing";
import type { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import type { DateRangeFilter, Filter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Timeline } from "./Timeline";
import { TimelineSettingsPanel } from "./TimelineSettingsPanel";
import type { TimelineWindow } from "./timelinePlan";

export interface TimelineSettings extends BaseChartSettings {
  type: "timeline";
  /** `field` names each row's lane, such as a room or a person. */
  startField: string;
  /** Blank ends are open: the row has not ended. */
  endField: string;
}

const isDateRange = (
  filter: Filter,
  field: string
): filter is DateRangeFilter =>
  filter.type === "date-range" && filter.field === field;

/**
 * A brushed window, saved as two filters that together mean overlap: the
 * start is at or before the window's end, and the end is at or after its
 * start.
 */
export function timelineWindow(
  settings: TimelineSettings
): TimelineWindow | undefined {
  const starts = settings.filters.find(
    (filter): filter is DateRangeFilter =>
      isDateRange(filter, settings.startField) &&
      filter.max !== undefined &&
      filter.min === undefined
  );
  const ends = settings.filters.find(
    (filter): filter is DateRangeFilter =>
      isDateRange(filter, settings.endField) &&
      filter.min !== undefined &&
      filter.max === undefined
  );
  if (!starts?.max || !ends?.min) return undefined;
  const min = dateBound(ends.min);
  const max = dateBound(starts.max, true);
  return Number.isFinite(min) && Number.isFinite(max)
    ? { min, max }
    : undefined;
}

/** Replaces the chart's window filters; keeps any other filter. */
export function withTimelineWindow(
  settings: TimelineSettings,
  window: TimelineWindow | undefined
): Filter[] {
  const rest = settings.filters.filter(
    (filter) =>
      !isDateRange(filter, settings.startField) &&
      !isDateRange(filter, settings.endField)
  );
  if (!window) return rest;
  // Seconds, as data files write times, read best in filter chips.
  const iso = (time: number) =>
    new Date(time).toISOString().replace(".000Z", "Z");
  return [
    ...rest,
    { type: "date-range", field: settings.startField, max: iso(window.max) },
    { type: "date-range", field: settings.endField, min: iso(window.min) },
  ];
}

export const timelineDefinition: ChartDefinition<TimelineSettings> = {
  type: "timeline",
  name: "Timeline",
  description: "Lay out start-to-end intervals in lanes over time",
  icon: TimelineIcon,
  component: Timeline,
  settingsPanel: TimelineSettingsPanel,
  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "timeline",
    title: "",
    field: field ?? "",
    startField: "",
    endField: "",
    layout,
    filters: [],
  }),
  validateSettings: (settings) =>
    Boolean(settings.field && settings.startField && settings.endField),
  getFilterFunction: (settings, fieldGetter) => {
    const starts = fieldGetter(settings.startField);
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
      // An open end has not ended, so it is after any window's start.
      open:
        filter.field === settings.endField &&
        filter.type === "date-range" &&
        filter.max === undefined,
    }));
    return (id) =>
      filters.every(
        ({ filter, values, open }) =>
          applyFilter(values[id], filter) ||
          (open && isMissingValue(values[id]) && !isMissingValue(starts[id]))
      );
  },
};
