import { compileDocument } from "@/lib/dsl/compile";
import { normalizeChart } from "@/lib/dsl/normalize";
import type { DatumObject } from "@/providers/DataLayerProvider";
import type { ChartLayout, ChartSettings } from "@/types/ChartTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

/** Settings a standalone chart manages itself. */
type Managed = "type" | "id" | "layout" | "filters";

/** Every member optional at any depth, except inside lists. */
type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;

/**
 * One chart's settings: its `type`, plus any saved settings of that type.
 * A setting left out takes the type's default, as in a new workspace chart,
 * at any depth: `time: { interval: "week" }` keeps the other time settings.
 */
export type ChartConfig = ChartSettings extends infer S
  ? S extends ChartSettings
    ? { type: S["type"] } & DeepPartial<Omit<S, Managed>>
    : never
  : never;

/** A layout the grid never reads; a standalone chart sizes itself. */
const LAYOUT: ChartLayout = { x: 0, y: 0, w: 12, h: 8 };

/** The chart a config describes, with every setting filled from defaults. */
export function toChartSettings(config: ChartConfig, id: string) {
  return normalizeChart({
    ...config,
    id,
    layout: LAYOUT,
    filters: [],
  } as unknown as ChartSettings);
}

/** Workspace settings that hold one chart. */
export function toSavedData(
  config: ChartConfig,
  id: string
): SavedDataStructure {
  return {
    charts: [toChartSettings(config, id)],
    calculations: [],
    gridSettings: {
      columnCount: 12,
      rowHeight: 40,
      containerPadding: 0,
      showBackgroundMarkers: false,
    },
    metadata: {
      name: "Chart",
      version: 1,
      createdAt: "1970-01-01T00:00:00.000Z",
      modifiedAt: "1970-01-01T00:00:00.000Z",
    },
    colorScales: [],
  };
}

/** JSON with object keys sorted, so equal settings give equal text. */
export function sortedText(value: unknown) {
  return JSON.stringify(value, (_key, item: unknown) =>
    isRecord(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        )
      : item
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** The members of `value` that differ from `base`, at any depth. */
function changes(
  value: Record<string, unknown>,
  base: Record<string, unknown>
) {
  const out: Record<string, unknown> = {};
  for (const [key, item] of Object.entries(value)) {
    const prior = base[key];
    if (item === undefined || sortedText(item) === sortedText(prior)) continue;
    if (isRecord(item) && isRecord(prior)) {
      const inner = changes(item, prior);
      if (Object.keys(inner).length) out[key] = inner;
    } else {
      out[key] = item;
    }
  }
  return out;
}

/**
 * The shortest config that draws `chart`: its type, its main field, and
 * only the settings that differ from that type's defaults. `Chart` reports
 * edits in this form, so a host stores a few keys, not every setting.
 */
export function shortConfig(chart: ChartSettings): ChartConfig {
  const {
    id,
    layout: _layout,
    filters: _filters,
    colorScaleId: _scale,
    ...rest
  } = chart as ChartSettings & { colorScaleId?: string };
  const head = {
    type: chart.type,
    ...(chart.field ? { field: chart.field } : {}),
  };
  const base = toChartSettings(head as ChartConfig, id);
  return {
    ...head,
    ...changes(rest, base as unknown as Record<string, unknown>),
  } as ChartConfig;
}

/** A chart's settings as a config: without the settings `Chart` manages. */
export function toChartConfig(chart: ChartSettings): ChartConfig {
  const { id: _id, layout: _layout, filters: _filters, ...config } = chart;
  return config as ChartConfig;
}

/**
 * Workspace settings from one chart's Dashboard text, such as
 * `scatter x=Price y=Rating color=Region`. The settings keep what the chart
 * needs besides itself: a grouped summary, a calculation, or a color scale.
 */
export function textToSavedData(
  text: string,
  rows: DatumObject[],
  id: string
): { savedData: SavedDataStructure; error?: string } {
  const result = compileDocument(text, {
    rows,
    now: () => new Date(0),
  });
  const chart = result.settings.charts[0];
  if (!chart) {
    const problem = result.diagnostics.find((d) => d.severity === "error");
    return {
      savedData: { ...result.settings, charts: [] },
      error: problem
        ? `${problem.message}${problem.suggestion ? ` ${problem.suggestion}` : ""}`
        : "The text has no chart.",
    };
  }
  return { savedData: { ...result.settings, charts: [{ ...chart, id }] } };
}
