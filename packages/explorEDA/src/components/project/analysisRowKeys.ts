import type { SavedDataStructure } from "@/types/SavedDataStructure";
import type { datum } from "@/types/FilterTypes";
import { mapRowIdFilters, rowIdFilters } from "@/lib/rowIdFilters";

const unresolvedPrefix = "__unresolved-analysis-row-key__:";

function mapIdFilters(
  settings: SavedDataStructure,
  mapValue: (value: datum) => datum
): SavedDataStructure {
  return mapRowIdFilters(settings, (filter) => ({
    ...filter,
    values: filter.values.map(mapValue),
  }));
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
  return rowIdFilters(settings)
    .flatMap((filter) => filter.values)
    .filter(
      (value): value is string =>
        typeof value === "string" && value.startsWith(unresolvedPrefix)
    );
}
