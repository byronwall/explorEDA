import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateAggregation } from "@/lib/aggregates";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { CalendarDays } from "lucide-react";
import { CalendarHeatmap } from "./CalendarHeatmap";
import { CalendarSettingsPanel } from "./CalendarSettingsPanel";

export interface CalendarSettings extends BaseChartSettings {
  type: "calendar";
  /** `field` holds the date field. */
  aggregation: AggregateAggregation;
  measureField?: string;
  weekStart: "sunday" | "monday";
  /** The year on show. Without one, the chart shows the latest year with dates. */
  year?: number;
}

export const calendarDefinition: ChartDefinition<CalendarSettings> = {
  type: "calendar",
  name: "Calendar Heatmap",
  description: "Show a count or measure for each day of a year",
  icon: CalendarDays,

  component: CalendarHeatmap,
  settingsPanel: CalendarSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "calendar",
    title: "Calendar Heatmap",
    field: field ?? "",
    aggregation: "count",
    weekStart: "monday",
    layout,
    margin: { top: 8, right: 16, bottom: 8, left: 8 },
    filters: [],
  }),

  validateSettings: (settings) =>
    Boolean(settings.field) &&
    (settings.aggregation === "count" || Boolean(settings.measureField)),

  getFilterFunction: (
    settings: CalendarSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A selected day is a date range on the date field from that day to itself.
    const filter = settings.filters.find(
      (item) => item.type === "date-range" && item.field === settings.field
    );
    const data = fieldGetter(settings.field);
    return (d: IdType) => !filter || applyFilter(data[d], filter);
  },
};
