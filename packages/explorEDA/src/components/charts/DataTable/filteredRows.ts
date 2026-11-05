import { isMissingValue, parseNumber, timestampOf } from "@/lib/valueParsing";
import { LiveItem } from "@/hooks/CrossfilterWrapper";
import { IdType } from "@/providers/DataLayerProvider";
import { applyFilter } from "@/hooks/applyFilter";
import type { datum } from "@/types/ChartTypes";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import type { FieldProfile } from "@/lib/fieldProfiles";
import type { DataTableSettings } from "./definition";

export type DataTableRow = { __ID: IdType; [key: string]: datum };

/** The declared type of each field, so a date column sorts by time. */
export type TableFieldTypes = Readonly<Record<string, DataType | undefined>>;

export function tableFieldTypes(
  profiles: readonly FieldProfile[] | undefined
): TableFieldTypes {
  return Object.fromEntries(
    (profiles ?? []).map((profile) => [profile.name, profile.dataType])
  );
}

export function getFilteredRows(
  data: DataTableRow[],
  liveItems: LiveItem | undefined,
  settings: DataTableSettings,
  fieldTypes?: TableFieldTypes
): DataTableRow[] {
  const ids = new Set(
    liveItems?.items.filter((item) => item.value > 0).map((item) => item.key)
  );
  const rows = data.filter((row) => ids.has(row.__ID));
  const search = settings.globalSearch.toLowerCase();

  const filtered = rows.filter((row) => {
    if (search && !rowMatchesSearch(row, search)) {
      return false;
    }

    return settings.filters.every((filter) =>
      applyFilter(row[filter.field], filter)
    );
  });
  if (settings.sortBy) {
    const field = settings.sortBy;
    const dates = fieldTypes?.[field] === "datetime";
    filtered.sort((a, b) => {
      // Missing values stay last whichever way the column sorts.
      const aMissing = isMissingValue(a[field]);
      const bMissing = isMissingValue(b[field]);
      if (aMissing || bMissing) return Number(aMissing) - Number(bMissing);
      const comparison = compareValues(a[field], b[field], dates);
      return settings.sortDirection === "desc" ? -comparison : comparison;
    });
  }
  return filtered;
}

/**
 * Whether any of a row's values, hidden and calculated fields included,
 * contains the search text. `search` is already lowercase.
 */
export function rowMatchesSearch(row: DataTableRow, search: string) {
  return Object.entries(row).some(
    ([field, value]) =>
      field !== "__ID" &&
      value !== null &&
      value !== undefined &&
      String(value).toLowerCase().includes(search)
  );
}

/**
 * Orders two present values: dates by time when the column is a datetime
 * (text that is not a date follows the dates), numbers by size, and text in
 * natural order ("2" before "10").
 */
function compareValues(a: datum, b: datum, dates = false): number {
  if (a === b) {
    return 0;
  }
  if (dates) {
    const aTime = timestampOf(a);
    const bTime = timestampOf(b);
    if (aTime !== undefined && bTime !== undefined) {
      if (aTime !== bTime) return aTime - bTime;
    } else if (aTime !== undefined || bTime !== undefined) {
      return Number(aTime === undefined) - Number(bTime === undefined);
    }
  }

  // Convert to strings for comparison if not numeric
  const aStr = String(a);
  const bStr = String(b);

  // If both values are numeric, compare as numbers
  const aNumber = parseNumber(a);
  const bNumber = parseNumber(b);
  if (!Number.isNaN(aNumber) && !Number.isNaN(bNumber)) {
    return aNumber - bNumber;
  }

  // For strings, use localeCompare for natural sort
  return aStr.localeCompare(bStr, undefined, { numeric: true });
}
