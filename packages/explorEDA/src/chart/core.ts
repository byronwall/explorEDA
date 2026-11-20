/**
 * Standalone charts without any chart type registered. Register the types a
 * page draws, so the bundle carries only those:
 *
 *   import { Chart, registerCharts } from "exploreda/chart-core";
 *   import { barChartDefinition } from "exploreda/charts/bar";
 *   registerCharts(barChartDefinition);
 *
 * `exploreda/chart` is this entry with each type loaded on demand.
 */
import { chartRegistry } from "@/charts/registry";
import type { ChartDefinition, ChartSettings } from "@/types/ChartTypes";

/** Makes these chart types drawable. Registering a type twice is harmless. */
export function registerCharts<T extends ChartSettings[]>(
  // One definition per type, each typed by its own settings.
  ...definitions: { [K in keyof T]: ChartDefinition<T[K]> }
) {
  for (const definition of definitions) chartRegistry.register(definition);
}

export { Chart, type ChartProps } from "./Chart";
export { ChartSettings, type ChartSettingsProps } from "./ChartSettings";
export type { ChartConfig } from "./config";
export { CHART_IMPORTS } from "./imports";
export type { DatumObject } from "@/providers/DataLayerProvider";
export type { ChartDefinition, ChartType } from "@/types/ChartTypes";
