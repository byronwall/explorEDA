import { barChartDefinition } from "@/components/charts/BarChart/definition";
import { boxPlotDefinition } from "@/components/charts/BoxPlot/definition";
import { colorLegendDefinition } from "@/components/charts/ColorLegend/definition";
import { dataTableDefinition } from "@/components/charts/DataTable/definition";
import { lineChartDefinition } from "@/components/charts/LineChart/definition";
import { markdownDefinition } from "@/components/charts/Markdown/definition";
import { pivotTableDefinition } from "@/components/charts/PivotTable/definition";
import { rowChartDefinition } from "@/components/charts/RowChart/definition";
import { scatterPlotDefinition } from "@/components/charts/ScatterPlot/definition";
import { summaryTableDefinition } from "@/components/charts/SummaryTable/definition";
import { threeDScatterDefinition } from "@/components/charts/ThreeDScatter/definition";
import { chartRegistry } from "./registry";

export function registerAllCharts() {
  chartRegistry.register(rowChartDefinition);
  chartRegistry.register(barChartDefinition);
  chartRegistry.register(scatterPlotDefinition);
  chartRegistry.register(threeDScatterDefinition);
  chartRegistry.register(pivotTableDefinition);
  chartRegistry.register(dataTableDefinition);
  chartRegistry.register(summaryTableDefinition);
  chartRegistry.register(markdownDefinition);
  chartRegistry.register(boxPlotDefinition);
  chartRegistry.register(colorLegendDefinition);
  chartRegistry.register(lineChartDefinition);
}
