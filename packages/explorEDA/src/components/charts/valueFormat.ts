import type { AggregateResultRow } from "@/lib/aggregates";
import { finiteNumber } from "@/lib/valueParsing";

/** How a chart's values read: as a percent of 1, or as plain numbers. */
export type ValueFormat = "percent" | "plain";

/** Measure display settings that row and bar charts share. */
export interface ValueDisplaySettings {
  /** Each bar as its share of the total of all bars. Counts and sums only. */
  share?: boolean;
  /** Axis ticks and value labels as percents or plain numbers; unset picks one. */
  valueFormat?: ValueFormat;
  /** Decimal places for plain numbers; unset shows 3 significant digits. */
  valueDecimals?: number;
}

/**
 * Whether a rate reads as a percent: both sides count things (whole numbers)
 * and no group passes 1, such as completions per attempt.
 */
export function rateIsFraction(rows: readonly AggregateResultRow[]) {
  let valued = false;
  for (const row of rows) {
    if (row.value === undefined) continue;
    if (row.value < 0 || row.value > 1) return false;
    valued = true;
    for (const item of row.contributors) {
      if (!item.included) continue;
      const top = finiteNumber(item.input);
      const bottom = finiteNumber(item.denominator);
      if (!Number.isInteger(top) || !Number.isInteger(bottom)) return false;
    }
  }
  return valued;
}

/** The format a chart uses: its setting, or percent for shares and fractions. */
export function resolveValueFormat(
  settings: ValueDisplaySettings,
  fraction = false
): ValueFormat | undefined {
  return (
    settings.valueFormat ?? (settings.share || fraction ? "percent" : undefined)
  );
}

const percentTick = new Intl.NumberFormat("en-US", {
  style: "percent",
  maximumFractionDigits: 1,
});
const percentLabel = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

/** Three significant digits, so 0.685 and 0.694 read apart. */
export function significant(value: number) {
  return value.toLocaleString("en-US", { maximumSignificantDigits: 3 });
}

/**
 * Tick and label text for a format. Percent labels keep one decimal; plain
 * numbers take the chart's decimals or 3 significant digits.
 */
export function valueFormatters(
  format: ValueFormat,
  decimals?: number
): { tick: (value: number) => string; label: (value: number) => string } {
  if (format === "percent") {
    return {
      tick: (value) => percentTick.format(value),
      label: (value) => percentLabel.format(value),
    };
  }
  if (decimals !== undefined) {
    const fixed = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return {
      tick: (value) => fixed.format(value),
      label: (value) => fixed.format(value),
    };
  }
  return {
    tick: (value) =>
      value.toLocaleString("en-US", { maximumFractionDigits: 3 }),
    label: significant,
  };
}

/** Each value as its share of the sum of all of them. */
export function shareOf<T extends { value: number | undefined }>(
  items: readonly T[]
): T[] {
  const total = items.reduce((sum, item) => sum + (item.value ?? 0), 0);
  return items.map((item) => ({
    ...item,
    value:
      item.value === undefined || total === 0 ? undefined : item.value / total,
  }));
}
