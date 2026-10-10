import { finiteNumber, isMissingValue } from "@/lib/valueParsing";
import { datum } from "@/types/ChartTypes";
import { DataType } from "./dataTypeDetection";

export interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
  /** Equal-width bin counts from min to max, for inline distributions. */
  bins?: number[];
}

export const DISTRIBUTION_BINS = 24;

export function binValues(
  sorted: number[] | Float64Array,
  min: number,
  max: number,
  binCount = DISTRIBUTION_BINS
) {
  if (sorted.length === 0 || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }
  if (min === max) return [sorted.length];
  // Give small integer ranges one bin per value instead of sparse spikes.
  if (max - min + 1 < binCount && sorted.every(Number.isInteger)) {
    binCount = max - min + 1;
    const bins = new Array<number>(binCount).fill(0);
    for (const value of sorted) bins[value - min] += 1;
    return bins;
  }
  const bins = new Array<number>(binCount).fill(0);
  const width = (max - min) / binCount;
  for (const value of sorted) {
    if (!Number.isFinite(value)) continue;
    const index = Math.min(binCount - 1, Math.floor((value - min) / width));
    bins[index] += 1;
  }
  return bins;
}

export interface CategoryStatistics {
  topValues: Array<{ value: datum; count: number }>;
  distribution: Array<{ value: datum; count: number }>;
}

export interface ColumnStatistics {
  dataType: DataType;
  totalCount: number;
  uniqueCount: number;
  nullCount: number;
  /** Present values a numeric field cannot measure, such as Infinity. */
  excludedCount?: number;
  statistics?: NumericStatistics;
  categories?: CategoryStatistics;
}

export function calculateColumnStatistics(
  columnData: { [key: number]: datum },
  dataType: DataType
): ColumnStatistics {
  return calculateValueStatistics(Object.values(columnData), dataType);
}

/**
 * Statistics for a list of values. Filtered profiles call this on every
 * filter change, so it reads the values in one pass and sorts a typed array.
 */
export function calculateValueStatistics(
  values: readonly datum[],
  dataType: DataType
): ColumnStatistics {
  const totalCount = values.length;

  if (dataType === "numeric") {
    // Numeric fields share the eligibility rule used by charts and aggregates.
    const uniqueValues = new Set<datum>();
    const numbers = new Float64Array(totalCount);
    let numberCount = 0;
    let missingCount = 0;
    let sum = 0;
    for (const value of values) {
      if (value != null) uniqueValues.add(value);
      if (typeof value === "number") {
        // Most numeric values are already numbers; skip the general checks.
        if (!Number.isFinite(value)) continue;
        numbers[numberCount] = value;
        numberCount += 1;
        sum += value;
        continue;
      }
      if (isMissingValue(value)) {
        missingCount += 1;
        continue;
      }
      const number = finiteNumber(value);
      if (number === undefined) continue;
      numbers[numberCount] = number;
      numberCount += 1;
      sum += number;
    }
    const numericBase = {
      dataType,
      totalCount,
      uniqueCount: uniqueValues.size,
      nullCount: missingCount,
      excludedCount: totalCount - missingCount - numberCount,
    };

    if (numberCount === 0) {
      return numericBase;
    }

    const measured = numbers.subarray(0, numberCount);
    const mean = sum / numberCount;
    let squaredDiffs = 0;
    for (const value of measured) squaredDiffs += Math.pow(value - mean, 2);
    const stdDev = Math.sqrt(squaredDiffs / numberCount);
    // The mean and spread are read, so sort in place. A typed array sorts
    // numerically without a comparator.
    const sorted = measured.sort();
    const min = sorted[0]!;
    const max = sorted[numberCount - 1]!;
    const lower = sorted[Math.floor((numberCount - 1) / 2)]!;
    const upper = sorted[Math.floor(numberCount / 2)]!;

    return {
      ...numericBase,
      statistics: {
        min,
        max,
        mean,
        median: (lower + upper) / 2,
        stdDev,
        bins: binValues(sorted, min, max),
      },
    };
  }

  // For non-numeric types, calculate category statistics
  let nullCount = 0;
  const counts = new Map<datum, number>();
  for (const value of values) {
    if (value == null) {
      nullCount += 1;
      continue;
    }
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const distribution = [...counts].map(([value, count]) => ({
    value,
    count,
  }));
  const topValues = [...distribution]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    dataType,
    totalCount,
    uniqueCount: counts.size,
    nullCount,
    categories: {
      topValues,
      distribution,
    },
  };
}
