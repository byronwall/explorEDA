import { dateTimestamp } from "@/lib/dateTime";
import { isMissingValue, isNumberLike } from "@/lib/numeric";
import { datum } from "@/types/ChartTypes";

const TIME_PART = String.raw`(?:[T ]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?: ?[AaPp][Mm])?(?: ?(?:Z|[+-]\d{2}:?\d{2}|UTC|GMT))?)?`;
// 2025-01-10, 2025-01-10T08:00:00Z, 1/15/2025, 2025/01/15, 15.01.2025
const NUMERIC_DATE = new RegExp(
  String.raw`^(?:\d{4}[-/.]\d{1,2}[-/.]\d{1,2}|\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4})${TIME_PART}$`
);
const MONTH_NAME =
  /\b(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|june?|july?|aug(?:ust)?|sept?(?:ember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)\b/i;

// Date.parse alone accepts labels such as "Depot 2" in V8, so a value must
// also look like a date: a numeric date form or a month name with a number.
export function isDateLike(value: datum): boolean {
  if (typeof value !== "string") {
    return false;
  }
  const text = value.trim();
  const shaped =
    NUMERIC_DATE.test(text) || (MONTH_NAME.test(text) && /\d/.test(text));
  return shaped && !isNaN(dateTimestamp(text));
}

export type DataType = "numeric" | "categorical" | "datetime" | "boolean";

export function detectColumnType(columnData: {
  [key: number]: datum;
}): DataType {
  // Convert object to array for easier processing
  const values = Object.values(columnData);

  // Skip missing values (null, undefined, blank strings) for type detection
  const nonNullValues = values.filter((v) => !isMissingValue(v));
  if (nonNullValues.length === 0) {
    return "categorical";
  }

  // Check if all values are boolean
  const booleanValues = new Set(["true", "false", true, false]);
  if (nonNullValues.every((v) => booleanValues.has(v as string | boolean))) {
    return "boolean";
  }

  // Check if all values are numbers or can be converted to numbers
  if (nonNullValues.every(isNumberLike)) {
    return "numeric";
  }

  // Check if all values are valid dates
  if (nonNullValues.every(isDateLike)) {
    return "datetime";
  }

  // Default to categorical if no other type matches
  return "categorical";
}
