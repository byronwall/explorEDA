/** Room a chart keeps under its X axis title for a status line. */
export const STATUS_LINE_HEIGHT = 18;

/**
 * Charts at least this wide show usage hints in the status line. Facets never
 * do, since every small multiple would repeat the same hint.
 */
export const STATUS_HINT_MIN_WIDTH = 520;

/**
 * One muted line under a chart's axis: the selection, notes about rows left
 * out, and a usage hint when nothing is selected.
 */
export function ChartStatusLine({
  parts,
  left,
  right,
}: {
  parts: (string | false | null | undefined)[];
  left: number;
  right: number;
}) {
  const text = parts.filter(Boolean).join(" · ");
  if (!text) {
    return null;
  }
  return (
    <div
      className="eda-chart-status pointer-events-none absolute truncate text-xs text-muted-foreground"
      style={{ left, right, bottom: 2 }}
    >
      {text}
    </div>
  );
}
