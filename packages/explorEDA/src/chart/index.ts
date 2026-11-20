/**
 * Standalone charts: one explorEDA chart from rows and a config, without
 * the workspace. Importing this entry registers every chart type.
 */
import { registerAllCharts } from "@/charts/registerAllCharts";

registerAllCharts();

export { Chart, type ChartProps } from "./Chart";
export type { ChartConfig } from "./config";
export type { DatumObject } from "@/providers/DataLayerProvider";
export type { ChartType } from "@/types/ChartTypes";
