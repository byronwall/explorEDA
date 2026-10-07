import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { Filter, datum } from "@/types/FilterTypes";

const unresolvedPrefix = "__unresolved-analysis-row-key__:";

function mapIdFilters(
  settings: SavedDataStructure,
  mapValue: (value: datum) => datum
): SavedDataStructure {
  const mapFilters = (filters: Filter[]) =>
    filters.map((filter) =>
      filter.type === "value" && filter.field === "__ID"
        ? { ...filter, values: filter.values.map(mapValue) }
        : filter
    );
  return {
    ...settings,
    charts: settings.charts.map((chart) => ({
      ...chart,
      filters: mapFilters(chart.filters),
    })),
    rowsSettings: settings.rowsSettings
      ? {
          ...settings.rowsSettings,
          filters: mapFilters(settings.rowsSettings.filters),
        }
      : undefined,
  };
}

export function encodeAnalysisRowKeys(
  settings: SavedDataStructure,
  keysById: Map<number, string>
) {
  return mapIdFilters(settings, (value) => {
    if (typeof value !== "number") return value;
    return keysById.get(value) ?? `${unresolvedPrefix}${value}`;
  });
}

export function decodeAnalysisRowKeys(
  settings: SavedDataStructure,
  idsByKey: Map<string, number>
) {
  return mapIdFilters(settings, (value) => {
    if (typeof value !== "string") return value;
    if (value.startsWith(unresolvedPrefix)) return value;
    return idsByKey.get(value) ?? `${unresolvedPrefix}${value}`;
  });
}

export function unresolvedAnalysisRowKeys(settings?: SavedDataStructure) {
  if (!settings) return [];
  const values = [
    ...settings.charts.flatMap((chart) => chart.filters),
    ...(settings.rowsSettings?.filters ?? []),
  ].flatMap((filter) =>
    filter.type === "value" && filter.field === "__ID" ? filter.values : []
  );
  return values.filter(
    (value): value is string =>
      typeof value === "string" && value.startsWith(unresolvedPrefix)
  );
}
