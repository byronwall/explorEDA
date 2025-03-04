import {
  AxisSettings,
  WrapFacetSettings,
  ChartSettings,
  PivotTableSettings,
  RowChartSettings,
  BarChartSettings,
  ScatterChartSettings,
  MarginSettings,
  BaseChartSettings,
} from "@/types/ChartTypes";

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
};

export const DEFAULT_PIVOT_SETTINGS: Omit<PivotTableSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "pivot",
  rowFields: [],
  columnFields: [],
  valueFields: [],
  showTotals: { row: false, column: false, grand: false },
};

export const DEFAULT_ROW_SETTINGS: Omit<RowChartSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "row",
  minRowHeight: 30,
  maxRowHeight: 50,
  filterValues: { values: [] },
};

export const DEFAULT_BAR_SETTINGS: Omit<BarChartSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "bar",
  binCount: 10,
  forceString: false,
  filterValues: { values: [] },
  filterRange: null,
};

export const DEFAULT_SCATTER_SETTINGS: Omit<ScatterChartSettings, "id"> = {
  ...DEFAULT_CHART_SETTINGS,
  type: "scatter",
  xField: "",
  yField: "",
  xFilterRange: null,
  yFilterRange: null,
};

export function getDefaultSettingsForType(
  type: ChartSettings["type"]
): Omit<ChartSettings, "id"> {
  switch (type) {
    case "pivot":
      return DEFAULT_PIVOT_SETTINGS;
    case "row":
      return DEFAULT_ROW_SETTINGS;
    case "bar":
      return DEFAULT_BAR_SETTINGS;
    case "scatter":
      return DEFAULT_SCATTER_SETTINGS;
    default:
      return DEFAULT_CHART_SETTINGS;
  }
}

export function mergeWithDefaultSettings<T extends ChartSettings>(
  settings: T
): T {
  const defaults = getDefaultSettingsForType(settings.type);
  return {
    ...defaults,
    ...settings,
    xAxis: { ...DEFAULT_AXIS_SETTINGS, ...settings.xAxis },
    yAxis: { ...DEFAULT_AXIS_SETTINGS, ...settings.yAxis },
    margin: { ...DEFAULT_MARGIN_SETTINGS, ...settings.margin },
    facet: { ...DEFAULT_FACET_SETTINGS, ...settings.facet },
  } as T;
}
