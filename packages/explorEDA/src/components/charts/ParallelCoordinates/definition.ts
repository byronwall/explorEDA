import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartNoAxesColumn } from "lucide-react";
import { ParallelCoordinates } from "./ParallelCoordinates";
import { ParallelCoordinatesSettingsPanel } from "./ParallelCoordinatesSettingsPanel";

export interface ParallelAxisSettings {
  field: string;
  /** Draws high values at the bottom. Display only; selections keep their bounds. */
  inverted: boolean;
}

export interface ParallelCoordinatesSettings extends BaseChartSettings {
  type: "parallel-coordinates";
  /** Axes in display order, left to right. */
  axes: ParallelAxisSettings[];
  lineOpacity: number;
  lineWidth: number;
}

export const MIN_PARALLEL_AXES = 2;
export const MAX_PARALLEL_AXES = 12;

export const parallelCoordinatesDefinition: ChartDefinition<ParallelCoordinatesSettings> =
  {
    type: "parallel-coordinates",
    name: "Parallel Coordinates",
    description: "Follow each row across several fields as one line",
    icon: ChartNoAxesColumn,

    component: ParallelCoordinates,
    settingsPanel: ParallelCoordinatesSettingsPanel,

    createDefaultSettings: (layout, field) => ({
      ...DEFAULT_CHART_SETTINGS,
      id: crypto.randomUUID(),
      type: "parallel-coordinates",
      title: "Parallel Coordinates",
      field: field ?? "",
      axes: field ? [{ field, inverted: false }] : [],
      lineOpacity: 0.45,
      lineWidth: 1.25,
      layout,
      margin: { top: 8, right: 8, bottom: 8, left: 8 },
      filters: [],
    }),

    validateSettings: (settings) =>
      settings.axes.length >= MIN_PARALLEL_AXES &&
      settings.axes.every((axis) => Boolean(axis.field)),

    getFilterFunction: (
      settings: ParallelCoordinatesSettings,
      fieldGetter: (name: string) => Record<IdType, datum>
    ) => {
      // Axis brushes and legend picks intersect: a row must pass every one.
      const filters = settings.filters.map((filter) => ({
        filter,
        values: fieldGetter(filter.field),
      }));
      return (id: IdType) =>
        filters.every(({ filter, values }) => applyFilter(values[id], filter));
    },
  };
