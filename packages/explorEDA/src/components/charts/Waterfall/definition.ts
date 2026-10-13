import { ChartColumnStacked } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import type { ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Waterfall } from "./Waterfall";
import { WaterfallSettingsPanel } from "./WaterfallSettingsPanel";
import type { WaterfallSettings } from "./waterfallTypes";

export type { WaterfallSettings, WaterfallState } from "./waterfallTypes";

export const waterfallDefinition: ChartDefinition<WaterfallSettings> = {
  type: "waterfall",
  name: "Waterfall",
  description:
    "Bridge one total to another, such as plan to actual, one step per category",
  icon: ChartColumnStacked,
  component: Waterfall,
  settingsPanel: WaterfallSettingsPanel,
  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "waterfall",
    title: "",
    field: field ?? "",
    layout,
    filters: [],
    mode: "bridge",
    aggregation: "sum",
    states: [
      { label: "Start", filters: [] },
      { label: "End", filters: [] },
    ],
  }),
  validateSettings: (settings) =>
    Boolean(settings.field) && settings.states.length === 2,
  getFilterFunction: (settings, fieldGetter) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
