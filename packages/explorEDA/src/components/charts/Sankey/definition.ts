import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Waypoints } from "lucide-react";
import { SankeyChart } from "./SankeyChart";
import { SankeySettingsPanel } from "./SankeySettingsPanel";

export interface SankeySettings extends BaseChartSettings {
  type: "sankey";
  /** Ordered category fields. Each row is one path through them. */
  stages: string[];
  aggregation: "count" | "sum";
  /** Required for sum. Negative and missing values are left out. */
  measureField?: string;
  /** Omit rows with a missing stage, or show missing as its own node. */
  missingStages: "omit" | "show";
  /** Values per stage, ranked by rows; the rest join a named Other node. */
  maxNodesPerStage: number;
  nodeOrder: "value" | "label";
  /** Color flows by their first-stage value, by each link's source, or one color. */
  flowColor: "first" | "source" | "none";
}

export const MIN_SANKEY_STAGES = 2;
export const MAX_SANKEY_STAGES = 6;

export const sankeyDefinition: ChartDefinition<SankeySettings> = {
  type: "sankey",
  name: "Sankey",
  description: "Show how rows flow through ordered category fields",
  icon: Waypoints,

  component: SankeyChart,
  settingsPanel: SankeySettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "sankey",
    title: "Sankey",
    field: field ?? "",
    stages: field ? [field] : [],
    aggregation: "count",
    missingStages: "omit",
    maxNodesPerStage: 8,
    nodeOrder: "value",
    flowColor: "first",
    layout,
    margin: { top: 8, right: 12, bottom: 8, left: 12 },
    filters: [],
  }),

  validateSettings: (settings) =>
    settings.stages.length >= MIN_SANKEY_STAGES &&
    settings.stages.every(Boolean) &&
    new Set(settings.stages).size === settings.stages.length &&
    (settings.aggregation === "count" || Boolean(settings.measureField)),

  getFilterFunction: (
    settings: SankeySettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A node is one value filter; a link is one on each of its two stages.
    const filters = settings.filters.map((filter) => ({
      filter,
      values: fieldGetter(filter.field),
    }));
    return (id: IdType) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
