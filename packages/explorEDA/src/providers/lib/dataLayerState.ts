import { datum } from "@/types/ChartTypes";

export type IdType = number;
export type DataRow = Record<string, datum>;
export type DataRowWithId<T extends DataRow> = T & { __ID: IdType };

export function initializeData<T extends DataRow>(data: T[]) {
  const dataWithIds = data.map((row, index) => ({
    ...row,
    __ID: index,
  })) as DataRowWithId<T>[];

  const emptyColumn = dataWithIds.reduce(
    (acc, row) => {
      acc[row.__ID] = undefined;
      return acc;
    },
    {} as Record<IdType, datum>
  );

  return { dataWithIds, emptyColumn };
}

export function invalidateCalculationCache<T>(
  cache: Record<string, T | undefined>,
  columns: Iterable<string>
) {
  const nextCache = { ...cache };
  for (const column of columns) {
    delete nextCache[column];
  }
  return nextCache;
}
