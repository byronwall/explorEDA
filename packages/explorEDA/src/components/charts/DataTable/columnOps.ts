import type { DataTableSettings } from "./definition";

type Column = DataTableSettings["columns"][number];

/** Columns for the picked fields, keeping each kept column's id and width. */
export function pickColumns(columns: Column[], fields: string[]): Column[] {
  return fields.map(
    (field) =>
      columns.find((column) => column.field === field) ?? { id: field, field }
  );
}

/**
 * Moves a column so it sits before the column now at `index`. An index equal
 * to the column count moves it to the end.
 */
export function moveColumn(
  columns: Column[],
  id: string,
  index: number
): Column[] {
  const from = columns.findIndex((column) => column.id === id);
  if (from < 0) return columns;
  const to = Math.max(0, Math.min(columns.length, index));
  // Dropping on either side of itself leaves the order alone.
  if (to === from || to === from + 1) return columns;
  const next = columns.filter((column) => column.id !== id);
  next.splice(to > from ? to - 1 : to, 0, columns[from]!);
  return next;
}

/** Removes a column. The last column stays, so the table keeps a header. */
export function hideColumn(columns: Column[], id: string): Column[] {
  return columns.length > 1
    ? columns.filter((column) => column.id !== id)
    : columns;
}
