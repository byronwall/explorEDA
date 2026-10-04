import { Map as MapIcon } from "lucide-react";
import { applyFilter } from "@/hooks/applyFilter";
import type { BaseChartSettings, ChartDefinition } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { PointMap } from "./PointMap";
import { MapSettingsPanel } from "./MapSettingsPanel";

export interface MapView {
  /** Geographic degrees, longitude first. Zoom is relative to the world view. */
  center: [number, number];
  zoom: number;
}
export interface MapSettings extends BaseChartSettings {
  type: "map";
  mode: "point";
  latitudeField: string;
  longitudeField: string;
  labelField?: string;
  sizeField?: string;
  pointRadius: number;
  pointOpacity: number;
  projection: "equal-earth" | "equirectangular";
  view?: MapView;
}
export const mapDefinition: ChartDefinition<MapSettings> = {
  type: "map",
  name: "Map",
  description: "Locate records by latitude and longitude",
  icon: MapIcon,
  component: PointMap,
  settingsPanel: MapSettingsPanel,
  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "map",
    mode: "point",
    title: "",
    field: "",
    latitudeField: "",
    longitudeField: "",
    pointRadius: 6,
    pointOpacity: 0.8,
    projection: "equal-earth",
    layout,
    filters: [],
  }),
  validateSettings: (settings) =>
    Boolean(settings.latitudeField && settings.longitudeField),
  getFilterFunction: (settings, getColumn) => {
    const filters = settings.filters.map((filter) => ({
      filter,
      values: getColumn(filter.field),
    }));
    return (id) =>
      filters.every(({ filter, values }) => applyFilter(values[id], filter));
  },
};
