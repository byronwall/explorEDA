import { mapRowIdFilters, rowIdFilters } from "@/lib/rowIdFilters";
import type { SavedDataStructure } from "@/types/SavedDataStructure";

type Row = Record<string, unknown>;

/** A row's values in a fixed field order, so equal records compare equal. */
function rowContent(row: Row) {
  return JSON.stringify(
    Object.keys(row)
      .filter((field) => field !== "__ID")
      .sort()
      .map((field) => [field, row[field]])
  );
}

/**
 * Saved settings pick rows by position. When the same settings meet new rows,
 * moves each picked position to the one new row with the same values, so a
 * selection keeps its records when rows are reordered or added. A filter with
 * a record that is gone, changed, or repeated is dropped: no position can
 * stand for it, and keeping the old one would pick a different record.
 */
export function carryRowSelections(
  settings: SavedDataStructure,
  savedRows: readonly Row[],
  nextRows: readonly Row[]
): SavedDataStructure {
  const positions = rowIdFilters(settings).flatMap((filter) =>
    filter.values.filter((value): value is number => typeof value === "number")
  );
  if (!positions.length) return settings;
  const unchanged = positions.every((position) => {
    const before = savedRows[position];
    const after = nextRows[position];
    return before && after && rowContent(before) === rowContent(after);
  });
  if (unchanged) return settings;

  const byContent = new Map<string, number[]>();
  nextRows.forEach((row, index) => {
    const content = rowContent(row);
    const found = byContent.get(content);
    if (found) found.push(index);
    else byContent.set(content, [index]);
  });
  const moved = (position: number) => {
    const before = savedRows[position];
    const matches = before ? byContent.get(rowContent(before)) : undefined;
    return matches?.length === 1 ? matches[0] : undefined;
  };
  return mapRowIdFilters(settings, (filter) => {
    const values = filter.values.map((value) =>
      typeof value === "number" ? moved(value) : value
    );
    return values.some((value) => value === undefined)
      ? undefined
      : { ...filter, values: values as typeof filter.values };
  });
}
