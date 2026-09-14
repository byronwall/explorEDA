import { getChartDefinition } from "@/charts/registry";
import { ThreeDScatterSettings } from "@/components/charts/ThreeDScatter/types";
import {
  AxisSettings,
  BaseChartSettings,
  ChartSettings,
  MarginSettings,
  RowChartSettings,
  WrapFacetSettings,
} from "@/types/ChartTypes";
import { Vector3 } from "three";
import { Filter } from "@/types/FilterTypes";
import { DataTableSettings } from "@/components/charts/DataTable/definition";
import { PivotTableSettings } from "@/components/charts/PivotTable/definition";
import { ScatterPlotSettings } from "@/components/charts/ScatterPlot/definition";
import { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";

export const DEFAULT_AXIS_SETTINGS: AxisSettings = {
  scaleType: "linear",
  grid: false,
  min: 0,
  max: 100,
};

export const DEFAULT_MARGIN_SETTINGS: MarginSettings = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20,
};

export const DEFAULT_FACET_SETTINGS: WrapFacetSettings = {
  enabled: false,
  type: "wrap",
  rowVariable: "",
  columnCount: 2,
};

export const DEFAULT_CHART_SETTINGS: Omit<BaseChartSettings, "id"> = {
  title: "",
  type: "row",
  field: "",
  layout: { x: 0, y: 0, w: 12, h: 7 },
  xAxis: DEFAULT_AXIS_SETTINGS,
  yAxis: DEFAULT_AXIS_SETTINGS,
  margin: DEFAULT_MARGIN_SETTINGS,
  facet: DEFAULT_FACET_SETTINGS,
  colorScaleId: undefined,
  colorField: undefined,
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 5,
  filters: [] as Filter[],
};

export const DEFAULT_PIVOT_SETTINGS: Omit<PivotTableSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "pivot",
  rowFields: [],
  columnField: "",
  valueFields: [],
};

export const DEFAULT_ROW_SETTINGS: Omit<RowChartSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "row",
  minRowHeight: 30,
  maxRowHeight: 50,
  filters: [],
};

export const DEFAULT_SCATTER_SETTINGS: Omit<ScatterPlotSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "scatter",
  xField: "",
  yField: "",
  filters: [],
};

export const DEFAULT_3D_SCATTER_SETTINGS: Omit<ThreeDScatterSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "3d-scatter",
  xField: "",
  yField: "",
  zField: "",
  colorField: undefined,
  sizeField: undefined,
  cameraPosition: new Vector3(10, 10, 10),
  cameraTarget: new Vector3(0, 0, 0),
  pointSize: 0.1,
  pointOpacity: 0.8,
  showGrid: true,
  showAxes: true,
  xAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
  yAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
  zAxis: { ...DEFAULT_AXIS_SETTINGS, zoomLevel: 1 },
};

export const DEFAULT_SUMMARY_SETTINGS: Omit<SummaryTableSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "summary",
  title: "Data Summary",
  layout: { x: 0, y: 0, w: 12, h: 8 },
};

export const DEFAULT_DATA_TABLE_SETTINGS: Omit<DataTableSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "data-table",
  columns: [],
  pageSize: 10,
  currentPage: 1,
  sortDirection: "asc",
  filters: [] as Filter[],
  globalSearch: "",
  tableHeight: 600,
};

export function mergeWithDefaultSettings<T extends ChartSettings>(
  settings: T
): T {
  const def = getChartDefinition(settings.type);
  const defaults = def.createDefaultSettings(settings.layout, settings.field);
  return {
    ...defaults,
    ...settings,
    xAxis: { ...DEFAULT_AXIS_SETTINGS, ...settings.xAxis },
    yAxis: { ...DEFAULT_AXIS_SETTINGS, ...settings.yAxis },
    margin: { ...DEFAULT_MARGIN_SETTINGS, ...settings.margin },
    facet: { ...DEFAULT_FACET_SETTINGS, ...settings.facet },
  } as T;
}
