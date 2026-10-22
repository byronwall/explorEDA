import { utcDay } from "@/lib/dailyRollup";
import type { datum } from "@/types/ChartTypes";
import { categoryText } from "./categoryText";
import type { AnnotationKeyValue, RecordAttachment } from "./types";

/**
 * A grid cell's values from a category callout, one per field that places
 * the cell: `Mon,3`, or `"New York",Mon` when a value holds a comma.
 */
export function cellCategory(value: string): string[] {
  const items: string[] = [];
  let current = "";
  let inQuote = false;
  for (let index = 0; index < value.length; index++) {
    const char = value[index]!;
    if (inQuote && char === "\\") {
      current += value[++index] ?? "";
    } else if (char === '"') {
      inQuote = !inQuote;
    } else if (!inQuote && char === ",") {
      items.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  items.push(current.trim());
  return items;
}

/**
 * A record callout's key values in the order of the fields that place a
 * cell, or undefined when its key fields are not exactly those fields.
 */
export function cellKey(
  attach: RecordAttachment,
  fields: string[]
): AnnotationKeyValue[] | undefined {
  if (
    attach.keyFields.length !== fields.length ||
    attach.key.length !== fields.length
  )
    return undefined;
  const key = fields.map((field) => {
    const at = attach.keyFields.indexOf(field);
    return at < 0 ? undefined : attach.key[at];
  });
  return key.some((value) => value === undefined)
    ? undefined
    : (key as AnnotationKeyValue[]);
}

/** Whether a stored value names a category, by its value or its label. */
export function sameCategory(
  stored: AnnotationKeyValue,
  value: datum,
  label: string
) {
  const text = String(stored).trim();
  return text === categoryText(value) || text === label;
}

/** The UTC day, as `YYYY-MM-DD`, a stored date names. */
export function dayOf(stored: AnnotationKeyValue) {
  const text = typeof stored === "string" ? stored.trim() : stored;
  // A whole number in text is a timestamp, as a date column stores it.
  const value =
    typeof text === "string" && /^-?\d{9,}$/.test(text) ? Number(text) : text;
  return utcDay(value)?.day;
}

/**
 * The category text that names a cell: a calendar's ISO day, or a heatmap's
 * row and column values joined by a comma, quoted where a value has one.
 */
export function cellText(values: datum[], date: boolean) {
  if (date) return values[0] == null ? undefined : utcDay(values[0])?.day;
  return values
    .map((value) => {
      const text = categoryText(value);
      return /[,"]/.test(text) ? JSON.stringify(text) : text;
    })
    .join(",");
}
