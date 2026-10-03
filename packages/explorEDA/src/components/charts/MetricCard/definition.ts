import type { AggregateAggregation } from "@/lib/aggregates";
import { applyFilter } from "@/hooks/applyFilter";
import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartNoAxesColumn } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { MetricCardSettingsPanel } from "./MetricCardSettingsPanel";

export interface MetricCardSettings extends BaseChartSettings {
  type: "metric-card";
  aggregation: AggregateAggregation;
  measureField?: string;
}

export const metricCardDefinition: ChartDefinition<MetricCardSettings> = {
  type: "metric-card",
  name: "Metric Card",
  description: "Show one count, sum, or average for the matching rows",
  icon: ChartNoAxesColumn,
  component: MetricCard,
  settingsPanel: MetricCardSettingsPanel,
  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "metric-card",
    title: "",
    field: "",
    aggregation: "count",
    layout,
    margin: { top: 8, right: 16, bottom: 8, left: 8 },
    filters: [],
  }),
  validateSettings: (settings) =>
    settings.aggregation === "count" || Boolean(settings.measureField),
  getFilterFunction: (settings, fieldGetter) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
