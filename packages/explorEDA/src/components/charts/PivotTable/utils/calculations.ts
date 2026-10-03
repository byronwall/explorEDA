import {
  categoryEqual,
  categoryKey,
  categoryLabel,
  categoryValue,
} from "@/lib/categories";
import { datum } from "@/types/FilterTypes";
import {
  PivotCell,
  PivotContributor,
  PivotHeader,
  PivotNumericExclusion,
  PivotRow,
  PivotSourceId,
  PivotTableData,
  RowKey,
} from "../types";
import { PivotTableSettings } from "../definition";
import { numericInputs } from "@/lib/aggregates";

export type PivotInputRow = Record<string, datum> & {
  __ID?: PivotSourceId;
};

type AggregateResult = {
  value: datum;
  includedIndexes: Set<number>;
  numericExclusions: Array<{ index: number; reason: string }>;
};

const numericAggregations = new Set([
  "sum",
  "avg",
  "min",
  "max",
  "median",
  "stddev",
  "variance",
]);

function aggregate(name: string, values: datum[]): AggregateResult {
  const includedIndexes = new Set<number>();
  const numeric = numericAggregations.has(name)
    ? numericInputs(values)
    : { inputs: [], exclusions: [] };
  numeric.inputs.forEach(({ index }) => includedIndexes.add(index));

  if (name === "count") {
    values.forEach((_, index) => includedIndexes.add(index));
    return { value: values.length, includedIndexes, numericExclusions: [] };
  }
  if (name === "countUnique") {
    values.forEach((_, index) => includedIndexes.add(index));
    return {
      value: new Set(values).size,
      includedIndexes,
      numericExclusions: [],
    };
  }
  if (name === "mode") {
    values.forEach((_, index) => includedIndexes.add(index));
    const counts = new Map<string | number | boolean | null, number>();
    values.forEach((value) => {
      const key = value ?? null;
      counts.set(key, (counts.get(key) || 0) + 1);
    });
    let maxCount = 0;
    let value: datum = undefined;
    counts.forEach((count, candidate) => {
      if (count > maxCount) {
        maxCount = count;
        value = candidate === null ? undefined : candidate;
      }
    });
    return { value, includedIndexes, numericExclusions: [] };
  }
  if (name === "singleValue") {
    if (values.length === 0) {
      return { value: undefined, includedIndexes, numericExclusions: [] };
    }
    const uniqueValues = new Set(values.map((value) => categoryKey(value)));
    if (uniqueValues.size !== 1) {
      throw new Error("Multiple values found when single value expected");
    }
    values.forEach((_, index) => includedIndexes.add(index));
    return { value: values[0], includedIndexes, numericExclusions: [] };
  }
  if (!numericAggregations.has(name)) {
    throw new Error(`Unsupported aggregation: ${name}`);
  }

  const numbers = numeric.inputs.map(({ value }) => value);
  if (numbers.length === 0) {
    return {
      value: undefined,
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }
  if (name === "sum") {
    return {
      value: numbers.reduce((sum, value) => sum + value, 0),
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }
  if (name === "avg") {
    return {
      value: numbers.reduce((sum, value) => sum + value, 0) / numbers.length,
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }
  if (name === "min") {
    return {
      value: Math.min(...numbers),
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }
  if (name === "max") {
    return {
      value: Math.max(...numbers),
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }
  if (name === "median") {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return {
      value:
        sorted.length % 2 ? sorted[mid] : (sorted[mid - 1]! + sorted[mid]!) / 2,
      includedIndexes,
      numericExclusions: numeric.exclusions,
    };
  }

  const average =
    numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
  const squareDiffs = numbers.map((value) => (value - average) ** 2);
  const variance =
    squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length;
  return {
    value: name === "stddev" ? Math.sqrt(variance) : variance,
    includedIndexes,
    numericExclusions: numeric.exclusions,
  };
}

/**
 * Orders grouping values so a pivot reads like a sorted report: numbers by
 * size, text in natural order ("2" before "10"), and missing values last.
 */
export function compareCategories(left: datum, right: datum): number {
  const leftMissing = left == null || left === "";
  const rightMissing = right == null || right === "";
  if (leftMissing || rightMissing) {
    return Number(leftMissing) - Number(rightMissing);
  }
  if (
    typeof left === "number" &&
    typeof right === "number" &&
    !Number.isNaN(left) &&
    !Number.isNaN(right)
  ) {
    return left - right;
  }
  const byLabel = String(left).localeCompare(String(right), undefined, {
    numeric: true,
  });
  if (byLabel !== 0) return byLabel;
  // The same label in two types, such as 1 and "1", stays two groups, with
  // the number first.
  const byType =
    Number(typeof left !== "number") - Number(typeof right !== "number");
  return byType || categoryKey(left).localeCompare(categoryKey(right));
}

function generateHeaders(data: PivotInputRow[], field: string): PivotHeader[] {
  if (!field) {
    return [];
  }
  const uniqueValues = new Map<string, datum>();
  data.forEach((row) => {
    const value = categoryValue(row[field]);
    const key = categoryKey(value);
    if (!uniqueValues.has(key)) {
      uniqueValues.set(key, value);
    }
  });
  return Array.from(uniqueValues.values())
    .sort(compareCategories)
    .map((value) => ({
      label: categoryLabel(value),
      field,
      value,
      children: [],
      span: 1,
      depth: 0,
    }));
}

function makeContributors(
  rows: PivotInputRow[],
  groupingKeys: RowKey[],
  valueField: string,
  result: AggregateResult
): {
  contributors: PivotContributor[];
  numericExclusions: PivotNumericExclusion[];
} {
  const exclusionByIndex = new Map(
    result.numericExclusions.map((exclusion) => [
      exclusion.index,
      exclusion.reason,
    ])
  );
  const contributors = rows.map((row, index) => ({
    sourceId: row.__ID,
    groupingKeys,
    input: row[valueField],
    included: result.includedIndexes.has(index),
    exclusionReason: exclusionByIndex.get(index),
  }));
  return {
    contributors,
    numericExclusions: result.numericExclusions.map(({ index, reason }) => ({
      sourceId: rows[index]?.__ID,
      value: rows[index]?.[valueField],
      reason,
    })),
  };
}

function generateCell(
  rows: PivotInputRow[],
  groupingKeys: RowKey[],
  columnField: string,
  columnValue: datum,
  isTotal: boolean,
  valueField: PivotTableSettings["valueFields"][number]
): PivotCell {
  const values = rows.map((row) => row[valueField.field]);
  let result: AggregateResult;
  let error: string | undefined;
  try {
    result = aggregate(valueField.aggregation, values);
  } catch (caught) {
    result = {
      value: undefined,
      includedIndexes: new Set(),
      numericExclusions: [],
    };
    error = caught instanceof Error ? caught.message : "Aggregation failed";
  }
  const { contributors, numericExclusions } = makeContributors(
    rows,
    groupingKeys,
    valueField.field,
    result
  );
  const status = error
    ? "error"
    : rows.length === 0
      ? "empty"
      : result.numericExclusions.length > 0 && result.includedIndexes.size === 0
        ? "invalid"
        : "ok";
  return {
    key: {
      columnField,
      columnValue,
      valueField: valueField.field,
      isTotal,
    },
    value: result.value,
    rawValue: result.value,
    aggregation: valueField.aggregation,
    status,
    error,
    contributors,
    numericExclusions,
  };
}

function generateCells(
  rowData: PivotInputRow[],
  columnHeaders: PivotHeader[],
  rowKeys: RowKey[],
  hasColumnField: boolean,
  valueFields: PivotTableSettings["valueFields"]
): PivotCell[] {
  const cells: PivotCell[] = [];
  const headers = hasColumnField
    ? columnHeaders
    : [{ field: "total", value: "total" as datum }];
  headers.forEach((header) => {
    const columnData = hasColumnField
      ? rowData.filter((row) =>
          categoryEqual(categoryValue(row[header.field]), header.value)
        )
      : rowData;
    const groupingKeys = !hasColumnField
      ? rowKeys
      : [...rowKeys, { field: header.field, value: header.value }];
    valueFields.forEach((valueField) => {
      cells.push(
        generateCell(
          columnData,
          groupingKeys,
          hasColumnField ? header.field : "total",
          header.value,
          !hasColumnField,
          valueField
        )
      );
    });
  });
  return cells;
}

function generateRows(
  data: PivotInputRow[],
  rowFields: string[],
  columnField: string,
  valueFields: PivotTableSettings["valueFields"],
  withTotals: boolean
): PivotRow[] {
  const rows: PivotRow[] = [];
  const columnHeaders = generateHeaders(data, columnField);
  const rowGroups = new Map<string, PivotInputRow[]>();
  data.forEach((item) => {
    const keyString = JSON.stringify(
      rowFields.map((field) => categoryKey(categoryValue(item[field])))
    );
    if (!rowGroups.has(keyString)) {
      rowGroups.set(keyString, []);
    }
    rowGroups.get(keyString)!.push(item);
  });
  rowGroups.forEach((groupData) => {
    const keys = rowFields.map((field) => ({
      field,
      value: categoryValue(groupData[0]![field]),
    }));
    const headers = keys.map((key, index) => ({
      label: categoryLabel(key.value),
      field: key.field,
      value: key.value,
      span: 1,
      depth: index,
    }));
    rows.push({
      keys,
      headers,
      cells: generateCells(
        groupData,
        columnHeaders,
        keys,
        Boolean(columnField),
        valueFields
      ),
      total:
        withTotals && columnField && columnHeaders.length > 1
          ? generateCells(groupData, [], keys, false, valueFields)
          : undefined,
    });
  });
  // Rows group by their first field, then the next, so outer values cluster.
  return rows.sort((left, right) => {
    for (let index = 0; index < left.keys.length; index += 1) {
      const order = compareCategories(
        left.keys[index]!.value,
        right.keys[index]!.value
      );
      if (order !== 0) return order;
    }
    return 0;
  });
}

/**
 * Totals recompute each aggregate over the rows they cover, so a median or an
 * average total is the real one, not a sum of the cells above it. A single
 * value has no meaningful total.
 */
function canTotal(valueFields: PivotTableSettings["valueFields"]) {
  return (
    valueFields.length > 0 &&
    valueFields.every((field) => field.aggregation !== "singleValue")
  );
}

export function calculatePivotData(
  data: PivotInputRow[],
  settings: PivotTableSettings
): PivotTableData {
  const headers = generateHeaders(data, settings.columnField);
  const withTotals =
    settings.showTotals !== false && canTotal(settings.valueFields);
  const rows = generateRows(
    data,
    settings.rowFields,
    settings.columnField,
    settings.valueFields,
    withTotals
  );
  // One row already is its own total.
  const totals =
    withTotals && rows.length > 1
      ? {
          cells: generateCells(
            data,
            headers,
            [],
            Boolean(settings.columnField),
            settings.valueFields
          ),
          total:
            settings.columnField && headers.length > 1
              ? generateCells(data, [], [], false, settings.valueFields)
              : undefined,
        }
      : undefined;
  return { headers, rows, totals };
}

/**
 * Which units an aggregate carries. Counts count rows, so they never take the
 * measure's currency or unit. Variance is in squared units.
 */
export function aggregationUnits(
  aggregation: string
): "measure" | "count" | "none" {
  if (aggregation === "count" || aggregation === "countUnique") {
    return "count";
  }
  return aggregation === "variance" ? "none" : "measure";
}
