import type {
  AxisSettings,
  ChartSettings,
  ChartStyleOverrides,
} from "@/types/ChartTypes";

/** The theme value a property overrides, for showing beside the override. */
export type ThemeValueKey =
  | "headlineSize"
  | "headlineWeight"
  | "subtitleSize"
  | "tickSize"
  | "labelSize";

/** One chart property that differs from the workspace theme on purpose. */
export interface StyleOverride {
  /** Stable key, such as `style.titleSize` or `xAxis.tickFontSize`. */
  key: string;
  label: string;
  value: number;
  unit: "px" | "weight";
  themeKey: ThemeValueKey;
  /** The settings change that returns this property to the theme. */
  reset: Partial<ChartSettings>;
}

const STYLE_PROPERTIES: {
  key: keyof ChartStyleOverrides;
  label: string;
  unit: StyleOverride["unit"];
  themeKey: ThemeValueKey;
}[] = [
  {
    key: "titleSize",
    label: "Title size",
    unit: "px",
    themeKey: "headlineSize",
  },
  {
    key: "titleWeight",
    label: "Title weight",
    unit: "weight",
    themeKey: "headlineWeight",
  },
  {
    key: "subtitleSize",
    label: "Subtitle size",
    unit: "px",
    themeKey: "subtitleSize",
  },
];

const AXIS_PROPERTIES: {
  key: "tickFontSize" | "labelFontSize";
  label: string;
  themeKey: ThemeValueKey;
}[] = [
  { key: "tickFontSize", label: "tick text", themeKey: "tickSize" },
  { key: "labelFontSize", label: "axis label", themeKey: "labelSize" },
];

/** Lists the theme overrides of one chart. */
export function chartStyleOverrides(chart: ChartSettings): StyleOverride[] {
  const overrides: StyleOverride[] = [];
  const style = chart.style ?? {};
  for (const property of STYLE_PROPERTIES) {
    const value = style[property.key];
    if (value === undefined) continue;
    const rest = { ...style };
    delete rest[property.key];
    overrides.push({
      key: `style.${property.key}`,
      label: property.label,
      value,
      unit: property.unit,
      themeKey: property.themeKey,
      reset: { style: Object.keys(rest).length ? rest : undefined },
    });
  }
  for (const axis of ["xAxis", "yAxis"] as const) {
    const settings: AxisSettings = chart[axis] ?? {};
    for (const property of AXIS_PROPERTIES) {
      const value = settings[property.key];
      if (value === undefined) continue;
      overrides.push({
        key: `${axis}.${property.key}`,
        label: `${axis === "xAxis" ? "X" : "Y"} ${property.label}`,
        value,
        unit: "px",
        themeKey: property.themeKey,
        reset: { [axis]: { ...settings, [property.key]: undefined } },
      });
    }
  }
  return overrides;
}

/** Charts that override the theme, in workspace order, with what they change. */
export function listStyleOverrides(charts: ChartSettings[]) {
  return charts
    .map((chart) => ({ chart, overrides: chartStyleOverrides(chart) }))
    .filter((entry) => entry.overrides.length > 0);
}

/** The settings change that returns every overridden property to the theme. */
export function resetChartStyle(chart: ChartSettings): Partial<ChartSettings> {
  return chartStyleOverrides(chart).reduce<Partial<ChartSettings>>(
    (patch, override) => {
      // Axis resets build on earlier axis resets in the same patch.
      const [scope, key] = override.key.split(".") as [string, string];
      if (scope === "style") return { ...patch, style: undefined };
      const axis = scope as "xAxis" | "yAxis";
      return {
        ...patch,
        [axis]: { ...(patch[axis] ?? chart[axis]), [key]: undefined },
      };
    },
    {}
  );
}
