import { datum } from "@/types/ChartTypes";
import { DataType } from "./dataTypeDetection";

interface NumericStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  stdDev: number;
}

interface CategoryStatistics {
  topValues: Array<{ value: string; count: number }>;
  distribution: Record<string, number>;
}

interface ColumnStatistics {
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
  const uniqueValues = new Set(values);
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
      },
    };
  } else {
    // For non-numeric types, calculate category statistics
    const distribution: Record<string, number> = {};
    values.forEach((v) => {
      const key = String(v);
      distribution[key] = (distribution[key] || 0) + 1;
    });

    const topValues = Object.entries(distribution)
      .map(([value, count]) => ({ value, count }))
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
