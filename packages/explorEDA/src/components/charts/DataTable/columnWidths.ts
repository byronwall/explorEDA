/** Narrowest default column: room for a name and a readable distribution. */
export const MIN_COLUMN_WIDTH = 88;
/** Widest default column. Longer names and values truncate. */
export const MAX_COLUMN_WIDTH = 220;
/** Rows read when sizing a column to its values. */
export const WIDTH_SAMPLE_ROWS = 200;

/**
 * The default width of a column that fits its content: the header's type
 * icon, name, and sort mark, or its widest sampled value, whichever is wider.
 * The result stays between the minimum and maximum widths.
 */
export function fitColumnWidth(label: string, values: readonly string[] = []) {
  // 12px name text with the type icon, sort mark, and cell padding.
  const header = label.length * 7 + 42;
  // 12px tabular cell text with cell padding.
  const widest = values.reduce((max, value) => Math.max(max, value.length), 0);
  const content = widest ? Math.ceil(widest * 6.6) + 20 : 0;
  return Math.min(
    MAX_COLUMN_WIDTH,
    Math.max(MIN_COLUMN_WIDTH, header, content)
  );
}
