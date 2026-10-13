import type { ChartSettings } from "@/types/ChartTypes";

/** A chart setting that binds one field and can change in place. */
export type ChartRole = "color";

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
};

/**
 * Whether the chart shows its roles as editable labels. Scatter plots do,
 * except as a density display, which has no color.
 */
export function hasRoleLabels(settings: ChartSettings) {
  return settings.type === "scatter" && settings.display !== "density";
}
