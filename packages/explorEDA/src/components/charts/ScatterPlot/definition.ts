import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChart } from "lucide-react";

import { ScatterPlotSettingsPanel } from "./ScatterPlotSettingsPanel";
import { ScatterPlot } from "./ScatterPlot";
import { IdType } from "@/providers/DataLayerProvider";
import { applyFilter } from "@/hooks/applyFilter";
import { Filter } from "@/types/FilterTypes";

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  pointSize?: number;
  pointOpacity?: number;
  xField: string;
  yField: string;
  filters: Filter[];
}

export const scatterPlotDefinition: ChartDefinition<ScatterPlotSettings> = {
  type: "scatter",
  name: "Scatter Plot",
  description: "Display data as points in a 2D space",
  icon: ScatterChart,

  component: ScatterPlot,
  settingsPanel: ScatterPlotSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "scatter",
    title: "Scatter Plot",
    layout,
    margin: { top: 20, right: 20, bottom: 20, left: 20 },
    xField: "__ID",
    yField: field ?? "",
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.xField && !!settings.yField;
  },

  getFilterFunction: (
    settings: ScatterPlotSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id: IdType) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
