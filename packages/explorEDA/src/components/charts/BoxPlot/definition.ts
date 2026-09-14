import { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { BoxPlot } from "./BoxPlot";
import { BoxPlotSettingsPanel } from "./BoxPlotSettingsPanel";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { applyFilter } from "@/hooks/applyFilter";
import { BoxPlotIcon } from "./BoxPlotIcon";

export interface BoxPlotStyleSettings {
  boxFill: string;
  boxStroke: string;
  boxStrokeWidth: number;
  medianStroke: string;
  medianStrokeWidth: number;
  whiskerStroke: string;
  whiskerStrokeWidth: number;
  outlierSize: number;
  outlierStroke: string;
  outlierFill: string;
}

export interface BoxPlotSettings extends BaseChartSettings {
  type: "boxplot";
  whiskerType: "tukey" | "minmax" | "stdDev";
  showOutliers: boolean;
  violinOverlay: boolean;
  beeSwarmOverlay: boolean;
  styles: BoxPlotStyleSettings;
  filters: Filter[];
  sortBy: "median" | "label";
  violinBandwidth: number;
  autoBandwidth: boolean;
}

export const boxPlotDefinition: ChartDefinition<BoxPlotSettings> = {
  type: "boxplot",
  name: "Box Plot",
  description: "Display distribution of values with quartiles and outliers",
  icon: BoxPlotIcon,

  component: BoxPlot,
  settingsPanel: BoxPlotSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    type: "boxplot",
    title: "Box Plot",
    layout,
    whiskerType: "tukey",
    showOutliers: true,
    violinOverlay: false,
    beeSwarmOverlay: false,
    sortBy: "label",
    violinBandwidth: 0.3,
    autoBandwidth: true,
    styles: {
      boxFill: "hsl(217.2 91.2% 59.8%)",
      boxStroke: "black",
      boxStrokeWidth: 1,
      medianStroke: "white",
      medianStrokeWidth: 2,
      whiskerStroke: "black",
      whiskerStrokeWidth: 1,
      outlierSize: 3,
      outlierStroke: "black",
      outlierFill: "none",
    },
    filters: [],
    xAxis: DEFAULT_CHART_SETTINGS.xAxis,
    yAxis: DEFAULT_CHART_SETTINGS.yAxis,
    margin: DEFAULT_CHART_SETTINGS.margin,
    facet: DEFAULT_CHART_SETTINGS.facet,
    colorScaleId: undefined,
    colorField: undefined,
    xAxisLabel: "",
    yAxisLabel: "",
    xGridLines: 5,
    yGridLines: 5,
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (settings, fieldGetter) => {
    if (!settings.colorField) {
      return () => true;
    }

    const dataHash = fieldGetter(settings.colorField);

    const filter = settings.filters.find(
      (f): f is Filter => f.field === settings.colorField
    );

    return (d) => {
      const value = dataHash[d];

      if (filter) {
        if (!applyFilter(value, filter)) {
          return false;
        }
      }

      return true;
    };
  },
};
