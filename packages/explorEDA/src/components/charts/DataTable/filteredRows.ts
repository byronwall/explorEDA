import { LiveItem } from "@/hooks/CrossfilterWrapper";
import { IdType } from "@/providers/DataLayerProvider";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { DataTableSettings } from "./definition";

export type DataTableRow = { __ID: IdType; [key: string]: datum };

export function getFilteredRows(
  data: DataTableRow[],
  liveItems: LiveItem | undefined,
  settings: DataTableSettings
): DataTableRow[] {
  const ids = new Set(
    liveItems?.items.filter((item) => item.value > 0).map((item) => item.key)
  );
  const rows = data.filter((row) => ids.has(row.__ID));
  const search = settings.globalSearch.toLowerCase();

  const filtered = rows.filter((row) => {
    if (
      search &&
      !Object.entries(row).some(
        ([field, value]) =>
          field !== "__ID" &&
          value !== null &&
          value !== undefined &&
          String(value).toLowerCase().includes(search)
      )
    ) {
      return false;
    }

    return settings.filters.every((filter) =>
      applyFilter(row[filter.field], filter)
    );
  });
  if (settings.sortBy) {
    const field = settings.sortBy;
    filtered.sort((a, b) => {
      const comparison = compareValues(a[field], b[field]);
      return settings.sortDirection === "desc" ? -comparison : comparison;
    });
  }
  return filtered;
}

// Helper function to check if a value is numeric
function isNumeric(value: datum): boolean {
  if (typeof value === "number") {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  return !isNaN(Number(value)) && !isNaN(parseFloat(value));
}

// Helper function to compare values with natural sort
function compareValues(a: datum, b: datum): number {
  if (a == null && b == null) return 0;
  // Handle null/undefined values
  if (a === null || a === undefined) {
    return 1;
  }
  if (b === null || b === undefined) {
    return -1;
  }
  if (a === b) {
    return 0;
  }

  // Convert to strings for comparison if not numeric
  const aStr = String(a);
  const bStr = String(b);

  // If both values are numeric, compare as numbers
  if (isNumeric(a) && isNumeric(b)) {
    return Number(a) - Number(b);
  }

  // For strings, use localeCompare for natural sort
  return aStr.localeCompare(bStr, undefined, { numeric: true });
}
