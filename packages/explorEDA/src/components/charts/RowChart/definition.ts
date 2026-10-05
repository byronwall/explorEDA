import { ChartBarBig } from "lucide-react";

import { RowChart } from "@/components/charts/RowChart/RowChart";
import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import {
  ChartDefinition,
  ChartLayout,
  RowChartSettings,
  datum,
} from "@/types/ChartTypes";
import { Filter } from "@/types/FilterTypes";
import { DEFAULT_ROW_SETTINGS } from "@/utils/defaultSettings";
import { RowChartSettingsPanel } from "./RowChartSettingsPanel";

export const rowChartDefinition: ChartDefinition<RowChartSettings> = {
  type: "row",
  name: "Row Chart",
  description: "A horizontal bar chart showing values by category",
  icon: ChartBarBig,

  component: RowChart,
  settingsPanel: RowChartSettingsPanel,

  createDefaultSettings: (layout: ChartLayout, field?: string) => ({
    ...DEFAULT_ROW_SETTINGS,
    id: crypto.randomUUID(),
    layout,
    field: field ?? "",
    filters: [],
  }),

  validateSettings: (settings) => {
    return Boolean(settings.field);
  },

  getFilterFunction: (
    settings: RowChartSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const dataHash = fieldGetter(settings.field);
    const valueFilter = settings.filters.find(
      (f): f is Filter => f.type === "value" && f.field === settings.field
    );

    return (d: IdType) => {
      if (!valueFilter) {
        return true;
      }

      const value = dataHash[d];
      return applyFilter(value, valueFilter);
    };
  },
};
