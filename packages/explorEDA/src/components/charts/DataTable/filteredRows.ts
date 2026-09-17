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

    return settings.filters.every((filter) =>
      applyFilter(row[filter.field], filter)
    );
  });
}
