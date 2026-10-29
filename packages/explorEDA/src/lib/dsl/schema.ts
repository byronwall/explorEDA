/**
 * The text vocabulary for chart settings. Every saved setting has exactly
 * one spelling in dashboard text: its word here when it has one, otherwise
 * its saved path. Compile reads both; export and the reference write only
 * the word, so agents and people converge on one form.
 */
import { chartRegistry, getChartDefinition } from "@/charts/registry";
import { CHART_SETTING_KEYS } from "./settingKeys";
import type { ChartType } from "@/types/ChartTypes";

export interface SettingWord {
  /** The saved path the word writes, such as `xAxis.scaleType`. */
  path: string;
  /** One line for the reference. */
  help: string;
  /** Allowed values, when the setting takes a fixed set. */
  values?: readonly string[];
}

const AXIS_SCALES = ["linear", "log", "symlog", "time", "band"] as const;

function axisWords(axis: "x" | "y") {
  const name = `${axis}Axis`;
  const upper = axis.toUpperCase();
  return {
    [`${axis}.title`]: {
      path: `${axis}AxisLabel`,
      help: `${upper} axis title; blank uses the field's label`,
    },
    [`${axis}.scale`]: {
      path: `${name}.scaleType`,
      help: `${upper} axis scale`,
      values: AXIS_SCALES,
    },
    [`${axis}.min`]: {
      path: `${name}.limits.min`,
      help: `Lowest value the ${upper} axis shows; rows below stay counted`,
    },
    [`${axis}.max`]: {
      path: `${name}.limits.max`,
      help: `Highest value the ${upper} axis shows`,
    },
    [`${axis}.grid`]: {
      path: `${name}.grid`,
      help: `Grid lines across the plot from ${upper} axis ticks`,
    },
    [`${axis}.ticks`]: {
      path: `${axis}GridLines`,
      help: `About how many ${upper} axis ticks to show`,
    },
  } satisfies Record<string, SettingWord>;
}

/** Words every chart type takes. */
export const COMMON_WORDS: Readonly<Record<string, SettingWord>> = {
  ...axisWords("x"),
  ...axisWords("y"),
  colorScale: {
    path: "colorScaleId",
    help: "Color scale for the color field, by its @name",
  },
};

/** Words for one chart type, beside the common ones. */
export const TYPE_WORDS: Readonly<
  Partial<Record<ChartType, Readonly<Record<string, SettingWord>>>>
> = {
  bar: {
    bins: { path: "binCount", help: "Number of bins for a numeric field" },
    "bins.mode": {
      path: "histogram.binning.mode",
      help: "auto counts bins; width repeats a saved grid of equal bins",
      values: ["auto", "width"],
    },
    "bins.width": {
      path: "histogram.binning.width",
      help: "Width of each authored bin",
    },
    "bins.origin": {
      path: "histogram.binning.origin",
      help: "A value the bin edges line up with",
    },
    "bins.first": {
      path: "histogram.binning.firstIndex",
      help: "First edge, as origin + first × width",
    },
    "bins.last": {
      path: "histogram.binning.lastIndex",
      help: "Last edge, as origin + last × width",
    },
    "spec.lower": {
      path: "histogram.spec.lower",
      help: "Lower specification limit; a value equal to it passes",
    },
    "spec.upper": {
      path: "histogram.spec.upper",
      help: "Upper specification limit; a value equal to it passes",
    },
    group: { path: "aggregateId", help: "Grouped summary to show" },
  },
  line: {
    x: { path: "xField", help: "Field on the X axis: a date or a number" },
    y: { path: "seriesField", help: "Fields drawn as lines, one line each" },
  },
  pivot: {
    rows: { path: "rowFields", help: "Fields whose values make the rows" },
    columns: { path: "columnField", help: "Field whose values make columns" },
  },
  row: {
    group: { path: "aggregateId", help: "Grouped summary to rank by" },
  },
  scatter: {
    opacity: { path: "pointOpacity", help: "Point opacity, from 0 to 1" },
    "size.max": {
      path: "maxBubbleRadius",
      help: "Largest bubble radius in pixels when size= names a field",
    },
  },
};

/** Every word a chart type takes, keyed by word. */
export function settingWords(type: string): Record<string, SettingWord> {
  return {
    ...COMMON_WORDS,
    ...(TYPE_WORDS[type as ChartType] ?? {}),
  };
}

/** The word that writes a saved path on a chart type, if one does. */
export function wordForPath(type: string, path: string): string | undefined {
  for (const [word, entry] of Object.entries(settingWords(type))) {
    if (entry.path === path) {
      return word;
    }
  }
  return undefined;
}

/** Saved keys a word covers, so the reference doesn't list them twice. */
function coveredKeys(type: string) {
  return new Set(
    Object.values(settingWords(type))
      .map((entry) => entry.path)
      .filter((path) => !path.includes("."))
  );
}

/** Keys dashboard text writes on its own, outside the setting list. */
const HEAD_KEYS = new Set(["layout", "filters", "localFilters", "colorField"]);

/** Nested settings that start empty, so their keys aren't in a new chart. */
const NESTED_HINTS: Record<string, string[]> = {
  time: [
    "time.interval=day|week|month|year",
    "time.aggregation=count|sum|average",
    "time.measureField=<field>",
    "time.splitField=<field>  one line per value",
    "time.display=line|area|stacked-area",
    "time.missingPeriods=gap|zero",
    "time.weekStart=monday|sunday",
  ],
  style: ["style.titleSize=", "style.titleWeight=", "style.subtitleSize="],
  facet: [
    "facet.enabled=true|false",
    "facet.type=wrap|grid",
    "facet.rowVariable=<field>",
    "facet.columnVariable=<field>  grid only",
    "facet.columnCount=  wrap only",
  ],
};

/** A nested setting's keys, read from the chart type's own new chart. */
function nestedKeys(key: string, value: unknown, prefix = key): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [`${prefix}=`];
  }
  return Object.entries(value as Record<string, unknown>).flatMap(
    ([name, item]) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? nestedKeys(name, item, `${prefix}.${name}`)
        : [
            `${prefix}.${name}=${item === undefined ? "" : JSON.stringify(item).replace(/^"|"$/g, "")}`,
          ]
  );
}

/**
 * The settings a chart type takes, as text: its words first, then the saved
 * keys that have no shorter word, with a nested setting's keys spelled out.
 * Generated, so it can't drift.
 */
export function chartSettingReference(type: string): string[] {
  const keys = CHART_SETTING_KEYS[type as ChartType];
  if (!keys) {
    return [];
  }
  const covered = coveredKeys(type);
  const defaults = chartRegistry.has(type as ChartType)
    ? (getChartDefinition(type as ChartType).createDefaultSettings({
        x: 0,
        y: 0,
        w: 6,
        h: 4,
      }) as unknown as Record<string, unknown>)
    : {};
  return [
    ...Object.entries(settingWords(type)).map(
      ([word, entry]) =>
        `${word}=${entry.values ? entry.values.join("|") : ""}  ${entry.help}`
    ),
    ...keys
      .filter((key) => !covered.has(key) && !HEAD_KEYS.has(key))
      .flatMap(
        (key) =>
          NESTED_HINTS[key] ??
          (key.endsWith("Axis") || key === "annotations"
            ? [`${key}=`]
            : nestedKeys(key, defaults[key]))
      ),
  ];
}
