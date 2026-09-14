import { LiveItem } from "@/hooks/CrossfilterWrapper";
import { IdType } from "@/providers/DataLayerProvider";
import { isTextFilter } from "@/types/FilterTypes";
import type { DataTableSettings } from "./definition";

export type DataTableRow = { __ID: IdType; [key: string]: any };

export function getFilteredRows(
  data: DataTableRow[],
  liveItems: LiveItem | undefined,
  settings: DataTableSettings
): DataTableRow[] {
  const rows = (liveItems?.items ?? [])
    .filter((item) => item.value > 0)
    .map((item) => data.find((row) => row.__ID === item.key))
    .filter((row): row is DataTableRow => row !== undefined);
  const search = settings.globalSearch.toLowerCase();
  const textFilters = settings.filters.filter(isTextFilter);

  return rows.filter((row) => {
    if (
      search &&
      !Object.values(row).some(
        (value) =>
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(search)
      )
    ) {
      return false;
    }

    return textFilters.every((filter) => {
      const value = row[filter.field];
      if (value === null || value === undefined) return false;
      const text = String(value).toLowerCase();
      const filterValue = filter.value.toLowerCase();
      return filter.operator === "contains"
        ? text.includes(filterValue)
        : filter.operator === "equals"
          ? text === filterValue
          : filter.operator === "startsWith"
            ? text.startsWith(filterValue)
            : text.endsWith(filterValue);
    });
  });
}
