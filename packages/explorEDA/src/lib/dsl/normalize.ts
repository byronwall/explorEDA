import { chartRegistry, getChartDefinition } from "@/charts/registry";
import type { ChartType } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

type SavedChart = SavedDataStructure["charts"][number];

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/**
 * Fills what `value` leaves out from `base`: missing members of plain
 * objects, at any depth. Lists and set values are kept as they are.
 */
function fill(base: unknown, value: unknown): unknown {
  if (value === undefined) {
    return base;
  }
  if (!isRecord(base) || !isRecord(value)) {
    return value;
  }
  const out: Record<string, unknown> = { ...base };
  for (const [key, item] of Object.entries(value)) {
    out[key] = fill(base[key], item);
  }
  return out;
}

/**
 * A saved chart with every setting its type defines, taking the type's
 * default wherever the chart leaves one out. A chart saved with a partial
 * axis, such as `xAxis: { grid: true }`, draws the same as its normalized
 * form, so text describes the normalized chart and stays short.
 */
export function normalizeChart<T extends SavedChart>(chart: T): T {
  if (!chartRegistry.has(chart.type as ChartType)) {
    return chart;
  }
  const defaults = getChartDefinition(
    chart.type as ChartType
  ).createDefaultSettings(chart.layout, chart.field || undefined);
  return { ...(fill(defaults, chart) as T), id: chart.id };
}

/** A saved dashboard with every chart normalized. */
export function normalizeDashboard(
  settings: SavedDataStructure
): SavedDataStructure {
  return {
    ...settings,
    charts: settings.charts.map((chart) => normalizeChart(chart)),
  };
}
