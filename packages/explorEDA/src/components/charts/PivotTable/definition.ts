import { BaseChartSettings, ChartDefinition, datum } from "@/types/ChartTypes";
import { ValueFilter } from "@/types/FilterTypes";
import { DEFAULT_CHART_SETTINGS } from "@/utils/defaultSettings";
import { Table } from "lucide-react";

import { applyFilter } from "@/hooks/applyFilter";
import { IdType } from "@/providers/DataLayerProvider";
import { PivotTable } from "./PivotTable";
import { PivotTableSettingsPanel } from "./PivotTableSettingsPanel";

export interface PivotTableSettings extends BaseChartSettings {
  type: "pivot";
  rowFields: string[];
  columnField: string;
  valueFields: Array<{
    field: string;
    aggregation:
      | "sum"
      | "count"
      | "avg"
      | "min"
      | "max"
      | "median"
      | "mode"
      | "stddev"
      | "variance"
      | "countUnique"
      | "singleValue";
    label?: string;
  }>;
}

const VALID_AGGREGATIONS: ReadonlySet<
  PivotTableSettings["valueFields"][number]["aggregation"]
> = new Set([
  "sum",
  "count",
  "avg",
  "min",
  "max",
  "median",
  "mode",
  "stddev",
  "variance",
  "countUnique",
  "singleValue",
]);

export const pivotTableDefinition: ChartDefinition<PivotTableSettings> = {
  type: "pivot",
  name: "Pivot Table",
  description: "Interactive pivot table for data analysis",
  icon: Table,

  component: PivotTable,
  settingsPanel: PivotTableSettingsPanel,

  createDefaultSettings: (layout) => ({
    ...DEFAULT_CHART_SETTINGS,
    id: crypto.randomUUID(),
    type: "pivot",
    title: "Pivot Table",
    layout,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    rowFields: [],
    columnField: "",
    valueFields: [],
    filters: [],
  }),

  validateSettings: (settings) => {
    const rowFields =
      Array.isArray(settings.rowFields) &&
      settings.rowFields.every(
        (field) => typeof field === "string" && field.trim().length > 0
      );
    const columnField =
      typeof settings.columnField === "string" &&
      (settings.columnField === "" || settings.columnField.trim().length > 0);
    const valueFields =
      Array.isArray(settings.valueFields) &&
      settings.valueFields.length > 0 &&
      settings.valueFields.every(
        (valueField) =>
          typeof valueField.field === "string" &&
          valueField.field.trim().length > 0 &&
          VALID_AGGREGATIONS.has(valueField.aggregation)
      );

    return (
      rowFields &&
      columnField &&
      valueFields &&
      new Set(settings.rowFields).size === settings.rowFields.length &&
      (!settings.columnField ||
        !settings.rowFields.includes(settings.columnField))
    );
  },

  getFilterFunction: (
    settings: PivotTableSettings,
    fieldGetter: (name: string) => Record<IdType, datum>
  ) => {
    const fields = [...settings.rowFields, settings.columnField];
    const filters = settings.filters.filter(
      (filter): filter is ValueFilter =>
        filter.type === "value" && fields.includes(filter.field)
    );
    const activeFields = [...new Set(filters.map((filter) => filter.field))];
    const groups = activeFields.map((field) => ({
      data: fieldGetter(field),
      filters: filters.filter((filter) => filter.field === field),
    }));
    // Alternatives within one field; intersection across different fields.
    return (id) =>
      groups.every((group) =>
        group.filters.some((filter) => applyFilter(group.data[id], filter))
      );
  },
};
