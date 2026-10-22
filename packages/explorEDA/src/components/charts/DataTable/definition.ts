import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { Filter } from "@/types/FilterTypes";
import { DataTable } from "./DataTable";
import { DataTableSettingsPanel } from "./DataTableSettingsPanel";

export interface DataTableSettings extends BaseChartSettings {
  type: "data-table";
  columns: Array<{
    id: string;
    field: string;
    width?: number;
  }>;

  sortBy?: string;
  sortDirection: "asc" | "desc";
  filters: Filter[];
  globalSearch: string;
  /** Draws each field's distribution under its column name. On unless false. */
  showDistributions?: boolean;
}

export const dataTableDefinition: ChartDefinition<DataTableSettings> = {
  type: "data-table",
  name: "Data Table",
  description: "Interactive data table with sorting and filtering",
  icon: Table,

  component: DataTable,
  settingsPanel: DataTableSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "data-table",
    title: "Data Table",
    layout,
    columns: [],

    sortDirection: "asc",
    filters: [],
    globalSearch: "",
    showDistributions: true,
  }),

  validateSettings: (settings) => {
    return settings.columns.length > 0;
  },

  getFilterFunction: (
    settings: DataTableSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    // If no filters are active, return true
    if (settings.filters.length === 0) {
      return () => true;
    }

    // A hidden column keeps filtering, as it does in the table's own rows.
    const filterFunctions = settings.filters.map((filter) => {
      const dataHash = fieldGetter(filter.field);

      return (d: IdType) => {
        const value = dataHash[d];
        return applyFilter(value, filter);
      };
    });

    // Combine all filter functions with AND logic
    return (d: IdType) => filterFunctions.every((fn) => fn(d));
  },
};
