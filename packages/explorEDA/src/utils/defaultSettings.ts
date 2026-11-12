import { getChartDefinition } from "@/charts/registry";
import {
  AxisSettings,
  BaseChartSettings,
  ChartSettings,
  MarginSettings,
  RowChartSettings,
  WrapFacetSettings,
} from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { DataTableSettings } from "@/components/charts/DataTable/definition";
import { PivotTableSettings } from "@/components/charts/PivotTable/definition";
import { ScatterPlotSettings } from "@/components/charts/ScatterPlot/definition";
import { SummaryTableSettings } from "@/components/charts/SummaryTable/definition";

/**
 * Every new chart spreads these defaults, so its axes, margin, facet, layout,
 * and filters start as these same objects. They are frozen so that code which
 * changes one in place fails at once instead of changing every chart. Copy
 * a part before changing it: `{ ...chart.xAxis, grid: true }`.
 */
function frozen<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.values(value).forEach(frozen);
    Object.freeze(value);
  }
  return value;
}

export const DEFAULT_AXIS_SETTINGS: AxisSettings = frozen({
  scaleType: "linear",
  grid: false,
  min: 0,
  max: 100,
});

/** A Y axis draws grid lines; an X axis doesn't. */
export const DEFAULT_Y_AXIS_SETTINGS: AxisSettings = frozen({
  ...DEFAULT_AXIS_SETTINGS,
  grid: true,
});

/** Room for tick labels and an axis title on the left and bottom. */
export const DEFAULT_MARGIN_SETTINGS: MarginSettings = frozen({
  top: 16,
  right: 24,
  bottom: 44,
  left: 62,
});

export const DEFAULT_FACET_SETTINGS: WrapFacetSettings = frozen({
  enabled: false,
  type: "wrap",
  rowVariable: "",
  columnCount: 2,
});

export const DEFAULT_CHART_SETTINGS: Omit<BaseChartSettings, "id"> = frozen({
  title: "",
  type: "row",
  field: "",
  layout: { x: 0, y: 0, w: 12, h: 7 },
  xAxis: DEFAULT_AXIS_SETTINGS,
  yAxis: DEFAULT_Y_AXIS_SETTINGS,
  margin: DEFAULT_MARGIN_SETTINGS,
  facet: DEFAULT_FACET_SETTINGS,
  colorScaleId: undefined,
  colorField: undefined,
  xAxisLabel: "",
  yAxisLabel: "",
  xGridLines: 5,
  yGridLines: 4,
  filters: [] as Filter[],
});

export const DEFAULT_PIVOT_SETTINGS: Omit<PivotTableSettings, "id"> = frozen({
  ...DEFAULT_CHART_SETTINGS,
  type: "pivot",
  rowFields: [],
  columnField: "",
  valueFields: [],
});

export const DEFAULT_ROW_SETTINGS: Omit<RowChartSettings, "id"> = frozen({
  ...DEFAULT_CHART_SETTINGS,
  type: "row",
  // Rows run across, so the count axis is horizontal and carries the grid.
  xAxis: DEFAULT_Y_AXIS_SETTINGS,
  yAxis: DEFAULT_AXIS_SETTINGS,
  minRowHeight: 22,
  maxRowHeight: 36,
  filters: [],
});

export const DEFAULT_SCATTER_SETTINGS: Omit<ScatterPlotSettings, "id"> = frozen(
  {
    ...DEFAULT_CHART_SETTINGS,
    type: "scatter",
    xField: "",
    yField: "",
    filters: [],
  }
);

export const DEFAULT_SUMMARY_SETTINGS: Omit<SummaryTableSettings, "id"> =
  frozen({
    ...DEFAULT_CHART_SETTINGS,
    type: "summary",
    title: "Data Summary",
    layout: { x: 0, y: 0, w: 12, h: 8 },
  });

export const DEFAULT_DATA_TABLE_SETTINGS: Omit<DataTableSettings, "id"> =
  frozen({
    ...DEFAULT_CHART_SETTINGS,
    type: "data-table",
    columns: [],

    sortDirection: "asc",
    filters: [] as Filter[],
    globalSearch: "",
  });

export function mergeWithDefaultSettings<T extends ChartSettings>(
  settings: T
): T {
  const def = getChartDefinition(settings.type);
  const defaults = def.createDefaultSettings(settings.layout, settings.field);
  return {
    ...defaults,
    ...settings,
    xAxis: { ...DEFAULT_AXIS_SETTINGS, ...defaults.xAxis, ...settings.xAxis },
    yAxis: { ...DEFAULT_AXIS_SETTINGS, ...defaults.yAxis, ...settings.yAxis },
    margin: {
      ...DEFAULT_MARGIN_SETTINGS,
      ...defaults.margin,
      ...settings.margin,
    },
    facet: { ...DEFAULT_FACET_SETTINGS, ...defaults.facet, ...settings.facet },
  } as T;
}
