import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ScatterChart } from "lucide-react";

import { ScatterPlotSettingsPanel } from "./ScatterPlotSettingsPanel";
import { ScatterPlot } from "./ScatterPlot";
import { IdType } from "@/providers/DataLayerProvider";
import { applyFilter } from "@/hooks/applyFilter";
import { Filter } from "@/types/FilterTypes";

/**
 * One fit method per chart. Every facet shares these settings and fits its own
 * rows, one fit per color group.
 */
export interface ScatterRegressionSettings {
  method: "linear" | "polynomial" | "loess";
  /** Polynomial degree, 2 to 6. */
  degree?: number;
  /** LOESS share of rows in each local fit, 0.2 to 1. */
  span?: number;
  /** Adds one fit through every group in each facet. */
  overall?: boolean;
}

/**
 * Joins points in order into paths. Absent when the chart draws none. A path
 * breaks wherever an in-order row is not drawn, so a filtered-out or invalid
 * observation never becomes a straight jump.
 */
export interface ScatterConnectSettings {
  /** Orders each path; absent keeps source row order. */
  orderField?: string;
  /** One path per value of this field; absent draws one path. */
  groupField?: string;
  /** Names each path at its last point, or at both ends. */
  labels?: "end" | "both";
}

export interface ScatterPlotSettings extends BaseChartSettings {
  type: "scatter";
  /** Density is rectangular bins; contour is smoothed 2D density. */
  display?: "points" | "density" | "hexbin" | "contour";
  hexbin?: { columns?: number; colorMax?: number; showPoints?: boolean };
  contour?: {
    /** Multiplies Scott's rule bandwidth, 0.25 to 4. */
    bandwidth?: number;
    levels?: number;
    fill?: boolean;
    lines?: boolean;
    showPoints?: boolean;
  };
  density?: { xBins?: number; yBins?: number; colorMax?: number };
  pointSize?: number;
  pointOpacity?: number;
  sizeField?: string;
  maxBubbleRadius?: number;
  /** Absent when the chart draws no fit. */
  regression?: ScatterRegressionSettings;
  /** Shows the paired summary line: correlation and pair count. */
  summary?: boolean;
  connect?: ScatterConnectSettings;
  /** X and Y histograms beside the plot; absent when off. */
  marginals?: { bins?: number };
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
