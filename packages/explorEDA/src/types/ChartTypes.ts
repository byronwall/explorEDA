import type { MapSettings } from "@/components/charts/Map/definition";
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
import type { SankeySettings } from "@/components/charts/Sankey/definition";
import type { ParallelCoordinatesSettings } from "@/components/charts/ParallelCoordinates/definition";
import type { ScatterMatrixSettings } from "@/components/charts/ScatterMatrix/definition";
import type { CalendarSettings } from "@/components/charts/Calendar/definition";
import type { HeatmapSettings } from "@/components/charts/Heatmap/definition";
import type { EcdfSettings } from "@/components/charts/Ecdf/definition";
import type { MetricCardSettings } from "@/components/charts/MetricCard/definition";
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
  /** Ordered facet IDs to display. Undefined shows all; [] shows none. */
  visibleFacetIds?: string[];
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
  scaleType?: "linear" | "log" | "time" | "band" | "symlog";
  tickFontSize?: 8 | 10 | 12;
  labelFontSize?: 10 | 12 | 14;
  grid?: boolean;
  /**
   * The range the axis shows, in data units. A blank side follows the data.
   * Limits only change the view: marks outside are clipped, never filtered.
   */
  limits?: AxisLimits;
  /** @deprecated A placeholder that charts never read. Use `limits`. */
  min?: number;
  /** @deprecated A placeholder that charts never read. Use `limits`. */
  max?: number;
}

export interface AxisLimits {
  min?: number;
  max?: number;
}

/** Chart text that differs from the workspace theme on purpose. */
export interface ChartStyleOverrides {
  /** Title size in px. */
  titleSize?: number;
  titleWeight?: number;
  /** Subtitle size in px. */
  subtitleSize?: number;
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
  /** Line under the title that says what the chart shows. */
  subtitle?: string;
  /** Source or note line under the plot. */
  note?: string;
  /** Title and subtitle type that overrides the theme. */
  style?: ChartStyleOverrides;
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
  /**
   * Restricts the rows this chart draws. Unlike `filters`, these never filter
   * other charts, and other charts never clear them.
   */
  localFilters?: Filter[];

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
  | SankeySettings
  | ParallelCoordinatesSettings
  | ScatterMatrixSettings
  | CalendarSettings
  | HeatmapSettings
  | EcdfSettings
  | MapSettings
  | MetricCardSettings
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
  toolbarTarget?: HTMLElement | null;
  /** Draft previews can edit settings without changing a saved chart. */
  onSettingsChange?: (settings: Partial<TSettings>) => void;
}

export type datum = string | number | boolean | null | undefined;
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
