import { isMissingValue } from "@/lib/numeric";
import type { datum } from "@/types/ChartTypes";

/**
 * Marks a missing cell with a small monospace "null", centered in its column,
 * so an empty value never reads as a zero, a dash, or a blank string.
 */
export function NullValue() {
  return (
    <span className="eda-null">
      <span aria-hidden="true">null</span>
      <span className="sr-only">Missing</span>
    </span>
  );
}

/** A table cell's content: the formatted value, or the null placeholder. */
export function cellValue(
  value: datum,
  format: (value: datum) => string
): React.ReactNode {
  return isMissingValue(value) ? <NullValue /> : format(value);
}
