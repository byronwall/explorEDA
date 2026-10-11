import { finiteNumber, timestampOf } from "@/lib/valueParsing";
import type { datum } from "@/types/ChartTypes";

export const MISSING = "Missing";

export interface OrderedRow {
  id: number;
  /** The order value: a number, or a date as its timestamp. Missing when unreadable. */
  order?: number;
  /** The order value as text, for labels and `at` anchors. */
  label: string;
}

// Order values label points and match `at` anchors, so a year stays "2008".
const orderFormat = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
  useGrouping: false,
});

const collator = new Intl.Collator("en", { numeric: true });

/**
 * The rows in the order of a field, ties by row order. Numbers and dates
 * order by value; a text field, such as a party or a stage, orders by its
 * labels. Rows without an order value come last, flagged, so paths can skip
 * them. Without a field, rows keep their own order.
 */
export function orderedRows(
  ids: number[],
  column: Record<number, datum> | undefined
): OrderedRow[] {
  if (!column) return ids.map((id) => ({ id, label: String(id) }));
  const rows = ids.map((id) => {
    const raw = column[id];
    const order = finiteNumber(raw) ?? timestampOf(raw);
    const text = typeof raw === "string" && raw.trim() ? raw.trim() : undefined;
    return {
      id,
      order,
      text: order === undefined ? text : undefined,
      label:
        order === undefined
          ? (text ?? MISSING)
          : (text ?? orderFormat.format(order)),
    };
  });
  // Text labels take ranks when no row has a number or date to order by.
  if (rows.every((row) => row.order === undefined)) {
    const labels = [
      ...new Set(rows.flatMap((row) => (row.text ? [row.text] : []))),
    ].sort(collator.compare);
    const rank = new Map(labels.map((label, index) => [label, index]));
    for (const row of rows) if (row.text) row.order = rank.get(row.text);
  }
  rows.sort((a, b) => {
    if (a.order === undefined) return b.order === undefined ? a.id - b.id : 1;
    if (b.order === undefined) return -1;
    return a.order - b.order || a.id - b.id;
  });
  return rows.map(({ id, order, label }) => ({ id, order, label }));
}
