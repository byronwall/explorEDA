import { datum } from "@/types/FilterTypes";
import { PivotCell, PivotHeader, PivotRow, PivotTableData } from "../types";
import { PivotTableSettings } from "../definition";

type AggregationFunction = (values: any[]) => number | string | undefined;

function numericValues(values: any[]): number[] {
  return values.flatMap((value) => {
    if (
      value === undefined ||
      value === null ||
      value === "" ||
      (typeof value === "string" && value.trim() === "") ||
      typeof value === "boolean"
    ) {
      return [];
    }

    const number = Number(value);
    return Number.isFinite(number) ? [number] : [];
  });
}

function aggregate(name: string, values: any[]): number | string | undefined {
  return aggregationFunctions[name]?.(values);
}

const aggregationFunctions: Record<string, AggregationFunction> = {
  sum: (values) => {
    const numbers = numericValues(values);
    return numbers.length
      ? numbers.reduce((sum, value) => sum + value, 0)
      : undefined;
  },
  count: (values) => values.length,
  avg: (values) => {
    const numbers = numericValues(values);
    return numbers.length
      ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length
      : undefined;
  },
  min: (values) => {
    const numbers = numericValues(values);
    return numbers.length ? Math.min(...numbers) : undefined;
  },
  max: (values) => {
    const numbers = numericValues(values);
    return numbers.length ? Math.max(...numbers) : undefined;
  },
  median: (values) => {
    const sorted = numericValues(values).sort((a, b) => a - b);
    if (sorted.length === 0) {
      return undefined;
    }
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2
      ? sorted[mid]!
      : (sorted[mid - 1]! + sorted[mid]!) / 2;
  },
  mode: (values) => {
    const counts = new Map<number | string, number>();
    values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
    let maxCount = 0;
    let mode: number | string | undefined;
    counts.forEach((count, value) => {
      if (count > maxCount) {
        maxCount = count;
        mode = value;
      }
    });
    return mode;
  },
  stddev: (values) => {
    const numbers = numericValues(values);
    if (numbers.length === 0) {
      return undefined;
    }
    const avg = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const squareDiffs = numbers.map((v) => {
      const diff = v - avg;
      return diff * diff;
    });
    return Math.sqrt(
      squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length
    );
  },
  variance: (values) => {
    const numbers = numericValues(values);
    if (numbers.length === 0) {
      return undefined;
    }
    const avg = numbers.reduce((sum, value) => sum + value, 0) / numbers.length;
    const squareDiffs = numbers.map((v) => {
      const diff = v - avg;
      return diff * diff;
    });
    return (
      squareDiffs.reduce((sum, value) => sum + value, 0) / squareDiffs.length
    );
  },
  countUnique: (values) => new Set(values).size,
  singleValue: (values) => {
    const uniqueValues = new Set(values);
    if (uniqueValues.size !== 1) {
      throw new Error("Multiple values found when single value expected");
    }
    return values[0];
  },
};

function generateHeaders(data: any[], field: string): PivotHeader[] {
  if (!field) {
    return [];
  }

  // Get unique values for the column field
  const uniqueValues = new Set(data.map((d) => d[field]));
  const values = Array.from(uniqueValues).sort();

  return values.map((value) => ({
    label: String(value),
    field,
    value,
    children: [],
    span: 1,
    depth: 0,
  }));
}

function generateCells(
  rowData: any[],
  columnHeaders: PivotHeader[],
  valueFields: PivotTableSettings["valueFields"]
): PivotCell[] {
  const cells: PivotCell[] = [];

  // If there are no columns defined, create a single cell for the total
  if (columnHeaders.length === 0) {
    for (const valueField of valueFields) {
      const values = rowData.map((d) => d[valueField.field]);
      const value = aggregate(valueField.aggregation, values);

      cells.push({
        key: {
          columnField: "total",
          columnValue: "total" as datum,
          valueField: valueField.field,
        },
        value,
        rawValue: value,
      });
    }
    return cells;
  }

  // Generate cells for each column header
  for (const header of columnHeaders) {
    const columnData = rowData.filter((d) => d[header.field] === header.value);

    for (const valueField of valueFields) {
      const values = columnData.map((d) => d[valueField.field]);
      const value = aggregate(valueField.aggregation, values);

      cells.push({
        key: {
          columnField: header.field,
          columnValue: header.value,
          valueField: valueField.field,
        },
        value,
        rawValue: value,
      });
    }
  }

  return cells;
}

function generateRows(
  data: any[],
  rowFields: string[],
  columnField: string,
  valueFields: PivotTableSettings["valueFields"]
): PivotRow[] {
  const rows: PivotRow[] = [];
  const columnHeaders = generateHeaders(data, columnField);

  // Pre-compute row groups for better performance
  const rowGroups = new Map<string, any[]>();
  data.forEach((item) => {
    // Include the value type so strings and numbers remain separate groups.
    const keyString = JSON.stringify(
      rowFields.map((field) => {
        const value = item[field];
        return [typeof value, value];
      })
    );
    if (!rowGroups.has(keyString)) {
      rowGroups.set(keyString, []);
    }
    rowGroups.get(keyString)!.push(item);
  });

  // Generate rows
  rowGroups.forEach((groupData) => {
    // Create properly typed keys and headers
    const keys = rowFields.map((field) => {
      const value = groupData[0][field];
      return {
        field,
        value,
      };
    });

    const headers = keys.map((key, index) => ({
      label: String(key.value),
      field: key.field,
      value: key.value,
      span: 1,
      depth: index,
    }));

    const cells = generateCells(groupData, columnHeaders, valueFields);

    rows.push({
      keys,
      headers,
      cells,
    });
  });

  return rows;
}

export function calculatePivotData(
  data: any[],
  settings: PivotTableSettings
): PivotTableData {
  const headers = generateHeaders(data, settings.columnField);
  const rows = generateRows(
    data,
    settings.rowFields,
    settings.columnField,
    settings.valueFields
  );

  return {
    headers,
    rows,
  };
}
