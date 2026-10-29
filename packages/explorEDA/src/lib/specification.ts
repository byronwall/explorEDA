import { finiteNumber } from "@/lib/valueParsing";
import type { datum, SpecRegion } from "@/types/FilterTypes";

/** Inclusive specification limits. Either side may be absent. */
export interface SpecLimits {
  lower?: number;
  upper?: number;
}

export type SpecStatus = "below" | "within" | "above";

export const SPEC_REGIONS: readonly SpecRegion[] = [
  "below",
  "within",
  "above",
  "outside",
];

/**
 * Where a value sits against the limits. Limits include equality: below is
 * x < lower and above is x > upper. Missing and non-numeric values have no
 * status.
 */
export function specStatus(
  value: datum,
  limits: SpecLimits
): SpecStatus | undefined {
  const number = finiteNumber(value);
  if (number === undefined) return undefined;
  if (limits.lower !== undefined && number < limits.lower) return "below";
  if (limits.upper !== undefined && number > limits.upper) return "above";
  return "within";
}

/** Whether a value lies in a region. Outside joins both tails. */
export function inSpecRegion(
  value: datum,
  region: SpecRegion,
  limits: SpecLimits | undefined
) {
  const status = specStatus(value, limits ?? {});
  if (!status) return false;
  return region === "outside" ? status !== "within" : status === region;
}

/** The limits a chart's histogram saves, if any. */
export function chartSpec(chart: object): SpecLimits | undefined {
  return (chart as { histogram?: { spec?: SpecLimits } }).histogram?.spec;
}

/** Why limits are unusable: non-finite, or lower above upper. */
export function specProblem(limits: SpecLimits) {
  const { lower, upper } = limits;
  if (
    (lower !== undefined && !Number.isFinite(lower)) ||
    (upper !== undefined && !Number.isFinite(upper))
  )
    return "Limits must be finite numbers.";
  if (lower !== undefined && upper !== undefined && lower > upper)
    return "The lower limit is above the upper limit.";
  return undefined;
}
