import {
  isDateText,
  isMissingValue,
  isNumericValue,
  parseBoolean,
} from "@/lib/valueParsing";
import { datum } from "@/types/ChartTypes";

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
  if (nonNullValues.every((v) => parseBoolean(v) !== undefined)) {
    return "boolean";
  }

  // Numbers, or text that converts without change. "0012" and integers past
  // 2^53 stay text, so identifiers keep their digits.
  if (nonNullValues.every(isNumericValue)) {
    return "numeric";
  }

  // Check if all values are valid dates
  if (
    nonNullValues.every(
      (value) => typeof value === "string" && isDateText(value)
    )
  ) {
    return "datetime";
  }

  // Default to categorical if no other type matches
  return "categorical";
}
