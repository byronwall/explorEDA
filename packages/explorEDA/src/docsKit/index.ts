/**
 * Pieces the explorEDA docs site reads from the library. This entry is built
 * beside the package's own entries, so it shares their modules, but it is not
 * exported or published: `package.json` leaves it out of `exports` and
 * `files`. Nothing here is public API.
 */
import { registerAllCharts } from "@/charts/registerAllCharts";
import { getChartDefinition } from "@/charts/registry";
import { CHART_SETTING_KEYS } from "@/lib/dsl/settingKeys";
import type { ChartType } from "@/types/ChartTypes";

export { CHART_SETTING_KEYS };
export { settingWords } from "@/lib/dsl/schema";

export type SettingReference = {
  /** The saved setting, which is also its Dashboard text path. */
  key: string;
  /** Its value in a new chart of this type, or undefined when unset. */
  defaultValue: unknown;
};

/** Every saved setting of a chart type, with its value in a new chart. */
export function chartSettingsReference(type: string): SettingReference[] {
  const keys = CHART_SETTING_KEYS[type as ChartType];
  if (!keys) {
    return [];
  }
  registerAllCharts();
  const defaults = getChartDefinition(type as ChartType).createDefaultSettings({
    x: 0,
    y: 0,
    w: 4,
    h: 4,
  }) as unknown as Record<string, unknown>;
  return keys.map((key) => ({ key, defaultValue: defaults[key] }));
}

/** The chart types the library registers. */
export function chartTypes(): string[] {
  return Object.keys(CHART_SETTING_KEYS);
}

export { ChartSettingsSurface } from "./ChartSettingsSurface";
