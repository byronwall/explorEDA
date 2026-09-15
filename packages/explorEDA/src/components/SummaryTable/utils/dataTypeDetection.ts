import { datum } from "@/types/ChartTypes";

export type DataType = "numeric" | "categorical" | "datetime" | "boolean";

export function detectColumnType(columnData: {
  [key: number]: datum;
}): DataType {
  // Convert object to array for easier processing
  const values = Object.values(columnData);

  // Skip null/undefined values for type detection
  const nonNullValues = values.filter((v) => v != null);
  if (nonNullValues.length === 0) {
    return "categorical";
  }

  // Check if all values are boolean
  const booleanValues = new Set(["true", "false", true, false]);
  if (nonNullValues.every((v) => booleanValues.has(v as string | boolean))) {
    return "boolean";
  }

  // Check if all values are numbers or can be converted to numbers
  if (
    nonNullValues.every(
      (v) => v !== "" && (typeof v === "number" || !isNaN(Number(v)))
    )
  ) {
    return "numeric";
  }

  // Check if all values are valid dates
  if (nonNullValues.every((v) => !isNaN(Date.parse(String(v))))) {
    return "datetime";
  }

  // Default to categorical if no other type matches
  return "categorical";
}
