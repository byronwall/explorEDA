import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { LayoutDashboard } from "lucide-react";
import { HierarchyChart } from "./HierarchyChart";
import { HierarchySettingsPanel } from "./HierarchySettingsPanel";

export interface HierarchySettings extends BaseChartSettings {
  type: "hierarchy";
  /** Ordered category fields, outermost first. Each row is one path. */
  levels: string[];
  aggregation: "count" | "sum";
  /** Required for sum. Negative and missing values are left out. */
  measureField?: string;
  /** Omit rows with a missing level, or show missing as its own node. */
  missingLevels: "omit" | "show";
  /** Children shown per parent; the rest join one Other node. Default 8. */
  maxChildren?: number;
  /** Color by first-level branch (default), by level, or one color. */
  colorBy?: "branch" | "level" | "none";
  /** How the hierarchy is drawn. */
  arrangement: "treemap" | "icicle";
  /**
   * The zoomed branch: values along `levels`, outermost first. Absent or
   * empty shows the whole. Stored like a filter's values, so it survives a
   * reload and stays readable in dashboard text.
   */
  focus?: datum[];
}

export const MIN_HIERARCHY_LEVELS = 1;
export const MAX_HIERARCHY_LEVELS = 3;

export const hierarchyDefinition: ChartDefinition<HierarchySettings> = {
  type: "hierarchy",
  name: "Hierarchy",
  description: "Show how a total divides through nested category fields",
  icon: LayoutDashboard,

  component: HierarchyChart,
  settingsPanel: HierarchySettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "hierarchy",
    title: "Hierarchy",
    field: field ?? "",
    levels: field ? [field] : [],
    aggregation: "count",
    missingLevels: "omit",
    maxChildren: 8,
    colorBy: "branch",
    arrangement: "treemap",
    layout,
    margin: { top: 4, right: 4, bottom: 4, left: 4 },
    filters: [],
  }),

  validateSettings: (settings) =>
    settings.levels.length >= MIN_HIERARCHY_LEVELS &&
    settings.levels.length <= MAX_HIERARCHY_LEVELS &&
    settings.levels.every(Boolean) &&
    new Set(settings.levels).size === settings.levels.length &&
    (settings.aggregation === "count" || Boolean(settings.measureField)),

  getFilterFunction: (
    settings: HierarchySettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A node is one value filter on each level down to its own.
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id: IdType) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
