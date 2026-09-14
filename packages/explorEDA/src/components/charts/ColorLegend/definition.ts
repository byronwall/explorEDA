import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { Palette } from "lucide-react";
import { ColorLegendChart } from "./ColorLegendChart";
import { ColorLegendSettingsPanel } from "./ColorLegendSettingsPanel";

export interface ColorLegendSettings extends BaseChartSettings {
  type: "color-legend";
  fields: string[];
  numericalBreakpoints: number;
  wrap: boolean;
}

export const colorLegendDefinition: ChartDefinition<ColorLegendSettings> = {
  type: "color-legend",
  name: "Color Legend",
  description: "Display and manage color scales used in visualizations",
  icon: Palette,
  component: ColorLegendChart,
  settingsPanel: ColorLegendSettingsPanel,

  createDefaultSettings: (layout) => ({
    id: crypto.randomUUID(),
    type: "color-legend",
    title: "Color Legend",
    field: "",
    layout,
    colorScaleId: undefined,
    colorField: undefined,
    facet: {
      enabled: false,
      type: "grid",
      rowVariable: "",
      columnVariable: "",
    },
    xAxis: {},
    yAxis: {},
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    filters: [],
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 0,
    yGridLines: 0,
    fields: [],
    numericalBreakpoints: 5,
    wrap: false,
  }),

  validateSettings: () => true,
  getFilterFunction: () => () => true,
};
