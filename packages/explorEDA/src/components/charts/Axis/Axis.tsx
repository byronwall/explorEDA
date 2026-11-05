import { withoutNegativeZero } from "@/lib/fieldSettings";

/**
 * A tick without a field format. `reference`, such as the axis end, picks
 * one notation for the whole axis, so 8,000 and 10K never share one.
 */
export function formatTick(value: string | number, reference?: number) {
  if (typeof value === "string") return value;
  const largest = Math.max(
    Math.abs(value),
    Number.isFinite(reference) ? Math.abs(reference!) : 0
  );
  return withoutNegativeZero(
    new Intl.NumberFormat("en-US", {
      notation: largest >= 10000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) < 1 ? 3 : 2,
    }).format(value)
  );
}
