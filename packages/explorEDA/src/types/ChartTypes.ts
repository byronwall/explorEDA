import { IdType } from "@/providers/DataLayerProvider";
import { Filter } from "./FilterTypes";

import { BarChartSettings } from "@/components/charts/BarChart/definition";
import { DataTableSettings } from "@/components/charts/DataTable/definition";
import { MarkdownSettings } from "@/components/charts/Markdown/definition";
import { PivotTableSettings } from "@/components/charts/PivotTable/definition";
import { ScatterPlotSettings } from "@/components/charts/ScatterPlot/definition";
import { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";
import { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";
import { BoxPlotSettings } from "@/components/charts/BoxPlot/definition";
import { LineChartSettings } from "@/components/charts/LineChart/definition";
import type { ColorLegendSettings } from "@/components/charts/ColorLegend/definition";

export interface ChartLayout {
  x: number;
  y: number;
  w: number;
  h: number;
}

// Base facet settings interface
export interface BaseFacetSettings {
  enabled: boolean;
  type: "grid" | "wrap";
}

// Grid facet settings
export interface GridFacetSettings extends BaseFacetSettings {
  type: "grid";
  rowVariable: string;
  columnVariable: string;
}

// Wrap facet settings
export interface WrapFacetSettings extends BaseFacetSettings {
  type: "wrap";
  rowVariable: string;
  columnCount: number;
}

// Discriminated union for facet settings
export type FacetSettings = GridFacetSettings | WrapFacetSettings;

export interface AxisSettings {
  title?: string;
  scaleType?: "linear" | "log" | "time" | "band";
  grid?: boolean;
  min?: number;
  max?: number;
}

export interface MarginSettings {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface BaseChartSettings {
  id: string;
  title: string;
  type: string;
  field: string;
  layout: ChartLayout;
  colorScaleId: string | undefined;
  colorField: string | undefined;
  facet: FacetSettings;
  xAxis: AxisSettings;
  yAxis: AxisSettings;
  margin: MarginSettings;
  filters: Filter[];

  // Label settings
  xAxisLabel: string;
  yAxisLabel: string;
  xGridLines: number;
  yGridLines: number;
}

export interface RowChartSettings extends BaseChartSettings {
  type: "row";
  minRowHeight: number;
  maxRowHeight: number;
}

export type ChartSettings =
  | RowChartSettings
  | BarChartSettings
  | ScatterPlotSettings
  | PivotTableSettings
  | ThreeDScatterSettings
  | SummaryTableSettings
  | DataTableSettings
  | MarkdownSettings
  | BoxPlotSettings
  | LineChartSettings
  | ColorLegendSettings;

export type ChartType = ChartSettings["type"];
export type ScatterChartSettings = ScatterPlotSettings;

export interface ChartSettingsPanelProps<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  settings: TSettings;
  onSettingsChange: (settings: TSettings) => void;
}

export interface BaseChartProps<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  settings: TSettings;
  width: number;
  height: number;
  facetIds?: IdType[];
}

export type datum = string | number | boolean | undefined;
export interface ChartDefinition<
  TSettings extends BaseChartSettings = BaseChartSettings,
> {
  // Metadata
  type: TSettings["type"];
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;

  // Component References
  component: React.ComponentType<BaseChartProps<TSettings>>;
  settingsPanel: React.ComponentType<ChartSettingsPanelProps<TSettings>>;

  // Settings Management
  createDefaultSettings: (layout: ChartLayout, field?: string) => TSettings;
  validateSettings: (settings: TSettings) => boolean;

  getFilterFunction: (
    settings: TSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => (d: IdType) => boolean;
}
