import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
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
  getFilterFunction: (settings, fieldGetter) => {
    const filters = settings.filters.filter(
      (filter): filter is ValueFilter =>
        filter.type === "value" && settings.fields.includes(filter.field)
    );
    const groups = [...new Set(filters.map((filter) => filter.field))].map(
      (field) => ({
        data: fieldGetter(field),
        values: new Set(
          filters
            .filter((filter) => filter.field === field)
            .flatMap((filter) => filter.values.map(String))
        ),
      })
    );
    return (id) =>
      groups.every(({ data, values }) => values.has(String(data[id])));
  },
};
