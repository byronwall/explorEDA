import { applyFilter } from "@/hooks/applyFilter";
import type { AggregateAggregation } from "@/lib/aggregates";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Grid3x3 } from "lucide-react";
import { Heatmap } from "./Heatmap";
import { HeatmapSettingsPanel } from "./HeatmapSettingsPanel";

export interface HeatmapSettings extends BaseChartSettings {
  type: "heatmap";
  /** Rows group by `field`; columns group by this field. */
  columnField: string;
  aggregation: AggregateAggregation;
  measureField?: string;
  /** Most categories shown on each axis, ranked by row count. */
  maxCategories: number;
  sortBy: "count" | "label";
  showValues: boolean;
}

export const heatmapDefinition: ChartDefinition<HeatmapSettings> = {
  type: "heatmap",
  name: "Heatmap",
  description: "Compare a count or measure across two categories",
  icon: Grid3x3,

  component: Heatmap,
  settingsPanel: HeatmapSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "heatmap",
    title: "Heatmap",
    field: field ?? "",
    columnField: "",
    aggregation: "count",
    maxCategories: 20,
    sortBy: "count",
    showValues: true,
    layout,
    margin: { top: 8, right: 16, bottom: 8, left: 8 },
    filters: [],
  }),

  validateSettings: (settings) =>
    Boolean(settings.field && settings.columnField) &&
    settings.field !== settings.columnField &&
    (settings.aggregation === "count" || Boolean(settings.measureField)),

  getFilterFunction: (
    settings: HeatmapSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // A selected cell is one value on the row field and one on the column field.
    const active = settings.filters
      .filter(
        (filter) =>
          filter.type === "value" &&
          (filter.field === settings.field ||
            filter.field === settings.columnField)
      )
      .map((filter) => ({ filter, data: fieldGetter(filter.field) }));
    return (d: IdType) =>
      active.every(({ filter, data }) => applyFilter(data[d], filter));
  },
};
