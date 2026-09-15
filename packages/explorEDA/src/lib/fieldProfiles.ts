import { datum } from "@/types/ChartTypes";
import {
  DataType,
  detectColumnType,
} from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  calculateColumnStatistics,
  ColumnStatistics,
} from "@/components/SummaryTable/utils/statisticsCalculator";

export type NumericStatistics = NonNullable<ColumnStatistics["statistics"]>;
export type CategoryStatistics = NonNullable<ColumnStatistics["categories"]>;

export interface FieldProfile extends ColumnStatistics {
  name: string;
  dataType: DataType;
}

export function buildFieldProfile(
  name: string,
  columnData: Record<number, datum>
): FieldProfile {
  return {
    name,
    ...calculateColumnStatistics(columnData, detectColumnType(columnData)),
  };
}

export function emptyFieldProfile(profile: FieldProfile): FieldProfile {
  return {
    name: profile.name,
    dataType: profile.dataType,
    totalCount: 0,
    uniqueCount: 0,
    nullCount: 0,
    statistics: undefined,
    categories: profile.categories
      ? { topValues: [], distribution: {} }
      : undefined,
  };
}

export function buildFieldProfiles(
  rows: Array<Record<string, datum>>
): FieldProfile[] {
  const fields = new Set<string>();
  for (const row of rows) {
    Object.keys(row)
      .filter((field) => field !== "__ID")
      .forEach((field) => fields.add(field));
  }

  return Array.from(fields, (name) => {
    const columnData: Record<number, datum> = {};
    rows.forEach((row, index) => {
      columnData[index] = row[name];
    });

    return buildFieldProfile(name, columnData);
  });
}
