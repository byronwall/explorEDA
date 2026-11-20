/**
 * Standalone charts: one explorEDA chart from rows and a config, without
 * the workspace. Importing this entry registers every chart type; import
 * `exploreda/chart-core` instead to register only the types a page draws.
 */
import { registerAllCharts } from "@/charts/registerAllCharts";

registerAllCharts();

export * from "./core";
