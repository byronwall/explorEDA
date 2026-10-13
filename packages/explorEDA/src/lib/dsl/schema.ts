/**
 * The text vocabulary for chart settings. Every saved setting has exactly
 * one spelling in dashboard text: its word here when it has one, otherwise
 * its saved path. Compile reads both; export and the reference write only
 * the word, so agents and people converge on one form.
 */
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
};

/** Words for one chart type, beside the common ones. */
export const TYPE_WORDS: Readonly<
  Partial<Record<ChartType, Readonly<Record<string, SettingWord>>>>
> = {
  bar: {
    bins: { path: "binCount", help: "Number of bins for a numeric field" },
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

/**
 * The settings a chart type takes, as text: its words first, then the saved
 * keys that have no shorter word. Generated, so it can't drift.
 */
export function chartSettingReference(type: string): string[] {
  const keys = CHART_SETTING_KEYS[type as ChartType];
  if (!keys) {
    return [];
  }
  const covered = coveredKeys(type);
  return [
    ...Object.entries(settingWords(type)).map(
      ([word, entry]) =>
        `${word}=${entry.values ? entry.values.join("|") : ""}  ${entry.help}`
    ),
    ...keys.filter((key) => !covered.has(key) && !HEAD_KEYS.has(key)),
  ];
}
