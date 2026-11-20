import { chartRegistry } from "@/charts/registry";
import type { ChartType } from "@/types/ChartTypes";
import { typeLoading } from "./typeLoading";

/**
 * Each chart type's definition as its own chunk. A page that draws a bar
 * chart loads the bar chart's code, and nothing for the other types.
 */
const LOADERS: Record<ChartType, () => Promise<{ type: ChartType }>> = {
  map: () =>
    import("@/components/charts/Map/definition").then(
      (module) => module.mapDefinition
    ),
  bar: () =>
    import("@/components/charts/BarChart/definition").then(
      (module) => module.barChartDefinition
    ),
  boxplot: () =>
    import("@/components/charts/BoxPlot/definition").then(
      (module) => module.boxPlotDefinition
    ),
  calendar: () =>
    import("@/components/charts/Calendar/definition").then(
      (module) => module.calendarDefinition
    ),
  "color-legend": () =>
    import("@/components/charts/ColorLegend/definition").then(
      (module) => module.colorLegendDefinition
    ),
  composition: () =>
    import("@/components/charts/Composition/definition").then(
      (module) => module.compositionDefinition
    ),
  "data-table": () =>
    import("@/components/charts/DataTable/definition").then(
      (module) => module.dataTableDefinition
    ),
  hierarchy: () =>
    import("@/components/charts/Hierarchy/definition").then(
      (module) => module.hierarchyDefinition
    ),
  heatmap: () =>
    import("@/components/charts/Heatmap/definition").then(
      (module) => module.heatmapDefinition
    ),
  ecdf: () =>
    import("@/components/charts/Ecdf/definition").then(
      (module) => module.ecdfDefinition
    ),
  line: () =>
    import("@/components/charts/LineChart/definition").then(
      (module) => module.lineChartDefinition
    ),
  "parallel-coordinates": () =>
    import("@/components/charts/ParallelCoordinates/definition").then(
      (module) => module.parallelCoordinatesDefinition
    ),
  markdown: () =>
    import("@/components/charts/Markdown/definition").then(
      (module) => module.markdownDefinition
    ),
  "metric-card": () =>
    import("@/components/charts/MetricCard/definition").then(
      (module) => module.metricCardDefinition
    ),
  pivot: () =>
    import("@/components/charts/PivotTable/definition").then(
      (module) => module.pivotTableDefinition
    ),
  row: () =>
    import("@/components/charts/RowChart/definition").then(
      (module) => module.rowChartDefinition
    ),
  sankey: () =>
    import("@/components/charts/Sankey/definition").then(
      (module) => module.sankeyDefinition
    ),
  "scatter-matrix": () =>
    import("@/components/charts/ScatterMatrix/definition").then(
      (module) => module.scatterMatrixDefinition
    ),
  scatter: () =>
    import("@/components/charts/ScatterPlot/definition").then(
      (module) => module.scatterPlotDefinition
    ),
  summary: () =>
    import("@/components/charts/SummaryTable/definition").then(
      (module) => module.summaryTableDefinition
    ),
  "3d-scatter": () =>
    import("@/components/charts/ThreeDScatter/definition").then(
      (module) => module.threeDScatterDefinition
    ),
  waterfall: () =>
    import("@/components/charts/Waterfall/definition").then(
      (module) => module.waterfallDefinition
    ),
  donut: () =>
    import("@/components/charts/Donut/definition").then(
      (module) => module.donutDefinition
    ),
  funnel: () =>
    import("@/components/charts/Funnel/definition").then(
      (module) => module.funnelDefinition
    ),
  retention: () =>
    import("@/components/charts/Retention/definition").then(
      (module) => module.retentionDefinition
    ),
  timeline: () =>
    import("@/components/charts/Timeline/definition").then(
      (module) => module.timelineDefinition
    ),
  "joint-missingness": () =>
    import("@/components/charts/JointMissingness/definition").then(
      (module) => module.jointMissingnessDefinition
    ),
};

const pending = new Map<ChartType, Promise<void>>();

function load(type: ChartType) {
  if (chartRegistry.has(type)) return Promise.resolve();
  let promise = pending.get(type);
  if (!promise) {
    const loader = LOADERS[type];
    promise = loader
      ? loader().then((definition) => {
          chartRegistry.register(definition as never);
        })
      : Promise.reject(new Error(`"${type}" isn't a chart type.`));
    pending.set(type, promise);
  }
  return promise;
}

let all: Promise<void> | undefined;

/** Turns on loading by type; `exploreda/chart` calls this once. */
export function loadTypesOnDemand() {
  typeLoading.load = load;
  typeLoading.loadAll = () =>
    (all ??= Promise.all((Object.keys(LOADERS) as ChartType[]).map(load)).then(
      () => undefined
    ));
}
