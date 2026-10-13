import { Donut as DonutIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import type { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Donut } from "./Donut";
import { DonutSettingsPanel } from "./DonutSettingsPanel";
import type { DonutAggregation } from "./donutPlan";

export interface DonutSettings extends BaseChartSettings {
  type: "donut";
  /** `field` holds the categories; each gets a slice of the filtered whole. */
  aggregation: DonutAggregation;
  measureField?: string;
  /** Named slices before the rest pool into Other. Unset shows six. */
  topN?: number;
}

export const donutDefinition: ChartDefinition<DonutSettings> = {
  type: "donut",
  name: "Donut",
  description: "Show how a small whole divides among a few categories",
  icon: DonutIcon,
  component: Donut,
  settingsPanel: DonutSettingsPanel,
  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "donut",
    title: "",
    field: field ?? "",
    layout,
    filters: [],
    aggregation: "count",
  }),
  validateSettings: (settings) =>
    Boolean(settings.field) &&
    (settings.aggregation === "count" || Boolean(settings.measureField)),
  getFilterFunction: (settings, fieldGetter) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
