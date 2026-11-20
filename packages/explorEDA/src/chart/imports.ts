import type { ChartType } from "@/types/ChartTypes";

/**
 * Where each chart type's definition lives in the package: the
 * `exploreda/charts/<entry>` path and its export name. `exploreda/chart-core`
 * draws only the types a host registers from these.
 */
export const CHART_IMPORTS: Record<ChartType, { entry: string; name: string }> =
  {
    bar: { entry: "bar", name: "barChartDefinition" },
    row: { entry: "row", name: "rowChartDefinition" },
    scatter: { entry: "scatter", name: "scatterPlotDefinition" },
    "3d-scatter": { entry: "three-d-scatter", name: "threeDScatterDefinition" },
    line: { entry: "line", name: "lineChartDefinition" },
    boxplot: { entry: "box-plot", name: "boxPlotDefinition" },
    ecdf: { entry: "ecdf", name: "ecdfDefinition" },
    heatmap: { entry: "heatmap", name: "heatmapDefinition" },
    calendar: { entry: "calendar", name: "calendarDefinition" },
    hierarchy: { entry: "hierarchy", name: "hierarchyDefinition" },
    donut: { entry: "donut", name: "donutDefinition" },
    sankey: { entry: "sankey", name: "sankeyDefinition" },
    funnel: { entry: "funnel", name: "funnelDefinition" },
    retention: { entry: "retention", name: "retentionDefinition" },
    timeline: { entry: "timeline", name: "timelineDefinition" },
    waterfall: { entry: "waterfall", name: "waterfallDefinition" },
    map: { entry: "map", name: "mapDefinition" },
    "parallel-coordinates": {
      entry: "parallel-coordinates",
      name: "parallelCoordinatesDefinition",
    },
    "scatter-matrix": {
      entry: "scatter-matrix",
      name: "scatterMatrixDefinition",
    },
    "joint-missingness": {
      entry: "joint-missingness",
      name: "jointMissingnessDefinition",
    },
    pivot: { entry: "pivot-table", name: "pivotTableDefinition" },
    "data-table": { entry: "data-table", name: "dataTableDefinition" },
    summary: { entry: "summary-table", name: "summaryTableDefinition" },
    "metric-card": { entry: "metric-card", name: "metricCardDefinition" },
    markdown: { entry: "markdown", name: "markdownDefinition" },
    "color-legend": { entry: "color-legend", name: "colorLegendDefinition" },
    composition: { entry: "composition", name: "compositionDefinition" },
  };

/** The two lines a host adds to draw `type` with `exploreda/chart-core`. */
export function registerHint(type: string) {
  const known = CHART_IMPORTS[type as ChartType];
  return known
    ? `import { ${known.name} } from "exploreda/charts/${known.entry}";\nregisterCharts(${known.name});`
    : undefined;
}
