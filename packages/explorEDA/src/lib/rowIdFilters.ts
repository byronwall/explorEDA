import type { Filter, ValueFilter } from "@/types/FilterTypes";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

/** A filter that picks rows by position (`__ID`), such as a brushed selection. */
export function isRowIdFilter(filter: Filter): filter is ValueFilter {
  return filter.type === "value" && filter.field === "__ID";
}

/**
 * Rewrites every row-position filter the settings hold: chart, chart-local,
 * Rows, and workspace. Return `undefined` to drop a filter.
 */
export function mapRowIdFilters(
  settings: SavedDataStructure,
  map: (filter: ValueFilter) => ValueFilter | undefined
): SavedDataStructure {
  const mapFilters = (filters: Filter[]): Filter[] =>
    filters.flatMap((filter): Filter[] => {
      if (!isRowIdFilter(filter)) return [filter];
      const next = map(filter);
      return next ? [next] : [];
    });
  return {
    ...settings,
    charts: settings.charts.map((chart) => ({
      ...chart,
      filters: mapFilters(chart.filters),
      ...(chart.localFilters
        ? { localFilters: mapFilters(chart.localFilters) }
        : {}),
    })),
    rowsSettings: settings.rowsSettings
      ? {
          ...settings.rowsSettings,
          filters: mapFilters(settings.rowsSettings.filters),
        }
      : undefined,
    ...(settings.workspaceFilters
      ? { workspaceFilters: mapFilters(settings.workspaceFilters) }
      : {}),
  };
}

/** Every row-position filter the settings hold, in any owner. */
export function rowIdFilters(settings: SavedDataStructure): ValueFilter[] {
  return [
    ...settings.charts.flatMap((chart) => [
      ...chart.filters,
      ...(chart.localFilters ?? []),
    ]),
    ...(settings.rowsSettings?.filters ?? []),
    ...(settings.workspaceFilters ?? []),
  ].filter(isRowIdFilter);
}
