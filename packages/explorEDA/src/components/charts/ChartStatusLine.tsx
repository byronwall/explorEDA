/** Room a chart keeps under its X axis title for a status line. */
export const STATUS_LINE_HEIGHT = 18;

/**
 * Charts at least this wide show usage hints in the status line. Facets never
 * do, since every small multiple would repeat the same hint.
 */
export const STATUS_HINT_MIN_WIDTH = 520;

/**
 * One muted line under a chart's axis: the selection and notes about rows
 * left out. A usage hint joins the line only while the pointer or focus is on
 * the chart, so the chart surface stays quiet otherwise.
 */
export function ChartStatusLine({
  parts,
  hint,
  left,
  right,
  bottom = 2,
}: {
  parts: (string | false | null | undefined)[];
  hint?: string | false | null;
  left: number;
  right: number;
  bottom?: number;
}) {
  const text = parts.filter(Boolean).join(" · ");
  if (!text && !hint) {
    return null;
  }
  return (
    <div
      className="eda-chart-status pointer-events-none absolute truncate text-xs text-muted-foreground"
      style={{ left, right, bottom }}
      role="status"
    >
      {text}
      {hint && (
        <span className="eda-chart-hint">
          {text ? " · " : ""}
          {hint}
        </span>
      )}
    </div>
  );
}
