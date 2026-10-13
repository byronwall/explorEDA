import type { ChartSettings } from "@/types/ChartTypes";

/** A chart setting that binds one field and can change in place. */
export type ChartRole = "color" | "x" | "y";

interface RoleSpec {
  /** The short name on the role button, such as "Color". */
  label: string;
  field: (settings: ChartSettings) => string | undefined;
  /** What a change touches, shown above the field list. */
  scope: (settings: ChartSettings) => string;
  /** Whether the role can be empty, offered as "None". */
  optional: boolean;
}

export const CHART_ROLES: Record<ChartRole, RoleSpec> = {
  color: {
    label: "Color",
    field: (settings) => settings.colorField || undefined,
    scope: (settings) =>
      settings.facet?.enabled
        ? "This chart · all points · all facets"
        : "This chart · all points",
    optional: true,
  },
  x: {
    label: "X",
    field: (settings) => axisField(settings, "x"),
    scope: () => "This chart · X axis",
    optional: false,
  },
  y: {
    label: "Y",
    field: (settings) => axisField(settings, "y"),
    scope: () => "This chart · Y axis",
    optional: false,
  },
};

function axisField(settings: ChartSettings, axis: "x" | "y") {
  const key = axis === "x" ? "xField" : "yField";
  return key in settings
    ? (settings as Record<typeof key, string>)[key] || undefined
    : undefined;
}

/**
 * The settings that bind `field` to an axis role. A new field starts from
 * the data: the old field's range, scale type, and title would mislabel it.
 * Grid and type sizes stay.
 */
export function axisRoleUpdates(
  settings: ChartSettings,
  axis: "x" | "y",
  field: string
): Partial<ChartSettings> {
  const current = settings[`${axis}Axis`];
  const {
    limits: _limits,
    scaleType: _scaleType,
    title: _title,
    ...kept
  } = current ?? {};
  return {
    [`${axis}Field`]: field,
    [`${axis}Axis`]: kept,
    [`${axis}AxisLabel`]: "",
  } as Partial<ChartSettings>;
}

/**
 * Whether the chart shows its roles as editable labels. Scatter plots do,
 * except as a density display, which has no color.
 */
export function hasRoleLabels(settings: ChartSettings) {
  return settings.type === "scatter" && settings.display !== "density";
}
