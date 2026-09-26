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

const DISTRIBUTION_BINS = 24;

export function binValues(
  sorted: number[],
  min: number,
  max: number,
  binCount = DISTRIBUTION_BINS
) {
  if (sorted.length === 0 || !Number.isFinite(min) || !Number.isFinite(max)) {
    return [];
  }
  if (min === max) return [sorted.length];
  // Give small integer ranges one bin per value instead of sparse spikes.
  if (max - min < binCount && sorted.every(Number.isInteger)) {
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
  statistics?: NumericStatistics;
  categories?: CategoryStatistics;
}

export function calculateColumnStatistics(
  columnData: { [key: number]: datum },
  dataType: DataType
): ColumnStatistics {
  const values = Object.values(columnData);
  const totalCount = values.length;
  const nullCount = values.filter((v) => v == null).length;
  const nonNullValues = values.filter((v) => v != null);
  const uniqueValues = new Set(nonNullValues);
  const uniqueCount = uniqueValues.size;

  if (dataType === "numeric") {
    const numericValues = values
      .filter((v) => v != null)
      .map((v) => Number(v))
      .filter((v) => !isNaN(v));

    if (numericValues.length === 0) {
      return {
        dataType,
        totalCount,
        uniqueCount,
        nullCount,
      };
    }

    const sorted = [...numericValues].sort((a, b) => a - b);
    const min = sorted.at(0);
    const max = sorted.at(-1);
    if (min === undefined || max === undefined) {
      return {
        dataType,
        totalCount,
        uniqueCount,
        nullCount,
      };
    }
    const sum = numericValues.reduce((a, b) => a + b, 0);
    const mean = sum / numericValues.length;
    const lower = sorted[Math.floor((sorted.length - 1) / 2)];
    const upper = sorted[Math.floor(sorted.length / 2)];
    if (lower === undefined || upper === undefined) {
      return {
        dataType,
        totalCount,
        uniqueCount,
        nullCount,
      };
    }
    const median = (lower + upper) / 2;
    const squaredDiffs = numericValues.map((v) => Math.pow(v - mean, 2));
    const variance =
      squaredDiffs.reduce((a, b) => a + b, 0) / numericValues.length;
    const stdDev = Math.sqrt(variance);

    return {
      dataType,
      totalCount,
      uniqueCount,
      nullCount,
      statistics: {
        min,
        max,
        mean,
        median,
        stdDev,
        bins: binValues(sorted, min, max),
      },
    };
  } else {
    // For non-numeric types, calculate category statistics
    const counts = new Map<datum, number>();
    nonNullValues.forEach((value) =>
      counts.set(value, (counts.get(value) ?? 0) + 1)
    );
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
      uniqueCount,
      nullCount,
      categories: {
        topValues,
        distribution,
      },
    };
  }
}
