import type { datum } from "@/types/ChartTypes";

/**
 * One numeric eligibility rule for every numeric view.
 *
 * Missing values (null, undefined, and blank or whitespace-only strings) are
 * not measurements. Booleans are not numbers. Numbers and numeric strings
 * that are not finite (NaN, Infinity, -Infinity) belong to a numeric field
 * but are excluded from measurements, bins, extents, and aggregates.
 */
export function isMissingValue(value: datum): boolean {
  return (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  );
}

/** True when a present value reads as a number, finite or not. */
export function isNumberLike(value: datum): boolean {
  if (typeof value === "number") return true;
  if (typeof value !== "string" || value.trim() === "") return false;
  return value.trim() === "NaN" || !Number.isNaN(Number(value));
}

export type NumericExclusionReason =
  | "Missing value"
  | "Blank value"
  | "Boolean values are not numeric"
  | "Not a finite number";

export function numericExclusionReason(
  value: datum
): NumericExclusionReason | undefined {
  if (value === undefined || value === null || value === "") {
    return "Missing value";
  }
  if (typeof value === "boolean") return "Boolean values are not numeric";
  if (typeof value === "string" && value.trim() === "") return "Blank value";
  return Number.isFinite(Number(value)) ? undefined : "Not a finite number";
}

/** The finite measurement for a value, or undefined when it is ineligible. */
export function finiteNumber(value: datum): number | undefined {
  if (numericExclusionReason(value) !== undefined) return undefined;
  return Number(value);
}

/** Finite measurements from a list of values, in input order. */
export function finiteNumbers(values: Iterable<datum>): number[] {
  const numbers: number[] = [];
  for (const value of values) {
    const number = finiteNumber(value);
    if (number !== undefined) numbers.push(number);
  }
  return numbers;
}
