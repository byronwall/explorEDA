import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { ChartBarBig } from "lucide-react";
import { BarChart } from "./BarChart";
import { BarChartSettingsPanel } from "./BarChartSettingsPanel";

export interface BarChartSettings extends BaseChartSettings {
  type: "bar";
  binCount?: number;
  forceString?: boolean;
  aggregateId?: string;
  filters: Filter[];
}

export const barChartDefinition: ChartDefinition<BarChartSettings> = {
  type: "bar",
  name: "Bar Chart",
  description: "Display data as vertical bars",
  icon: ChartBarBig,

  component: BarChart,
  settingsPanel: BarChartSettingsPanel,

  createDefaultSettings: (layout, field) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    field: field ?? "",
    binCount: 10,
    type: "bar",
    title: "Bar Chart",
    layout,
    margin: { top: 20, right: 20, bottom: 30, left: 60 },
    filters: [],
  }),

  validateSettings: (settings) => {
    return !!settings.field;
  },

  getFilterFunction: (
    settings: BarChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const filter = settings.aggregateId
      ? [...settings.filters]
          .reverse()
          .find(
            (f): f is Filter => f.type === "range" || f.type === "date-range"
          )
      : settings.filters.find((f): f is Filter => f.field === settings.field);
    const dataHash = fieldGetter(filter?.field ?? settings.field);

    return (d: IdType) => {
      const value = dataHash[d];

      if (filter) {
        if (!applyFilter(value, filter)) {
          return false;
        }
      }

      return true;
    };
  },
};
