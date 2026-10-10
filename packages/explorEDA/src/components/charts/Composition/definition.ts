import { applyFilter } from "@/hooks/applyFilter";
import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { LayoutTemplate } from "lucide-react";
import { CompositionChart } from "./CompositionChart";
import { CompositionInspector } from "./CompositionInspector";
import {
  createEmptyComposition,
  type CompositionDefinition,
} from "./compositionTypes";

export interface CompositionSettings extends BaseChartSettings {
  type: "composition";
  composition: CompositionDefinition;
}

export const compositionDefinition: ChartDefinition<CompositionSettings> = {
  type: "composition",
  name: "Composition",
  description:
    "Build a report graphic from text, repeated chart units, and guides",
  icon: LayoutTemplate,
  component: CompositionChart,
  settingsPanel: CompositionInspector,
  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "composition",
    title: "Composition",
    field: "",
    layout,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    filters: [],
    composition: createEmptyComposition(),
  }),
  validateSettings: (settings) => Boolean(settings.composition),
  getFilterFunction: (settings, fieldGetter) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
