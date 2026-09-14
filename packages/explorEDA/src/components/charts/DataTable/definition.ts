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
  pageSize: number;
  currentPage: number;
  sortBy?: string;
  sortDirection: "asc" | "desc";
  filters: Filter[];
  globalSearch: string;
  tableHeight: number;
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
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
    columns: [],
    pageSize: 25,
    currentPage: 1,
    sortDirection: "asc",
    filters: [],
    globalSearch: "",
    tableHeight: 400,
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

    // Create filter functions for each active filter
    const filterFunctions = settings.filters.map((filter) => {
      const column = settings.columns.find((col) => col.field === filter.field);
      if (!column) {
        return () => true;
      }

      const dataHash = fieldGetter(column.field);

      return (d: IdType) => {
        const value = dataHash[d];
        if (value === undefined) {
          return false;
        }

        if (filter.type === "text") {
          const text = String(value).toLowerCase();
          const search = filter.value.toLowerCase();
          return filter.operator === "contains"
            ? text.includes(search)
            : filter.operator === "equals"
              ? text === search
              : filter.operator === "startsWith"
                ? text.startsWith(search)
                : text.endsWith(search);
        }

        return applyFilter(value, filter);
      };
    });

    // Combine all filter functions with AND logic
    return (d: IdType) => filterFunctions.every((fn) => fn(d));
  },
};
