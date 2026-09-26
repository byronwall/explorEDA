import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { numericExclusionReason } from "@/lib/numeric";

export type AggregateAggregation = "count" | "sum" | "average";

export interface AggregateSpec {
  id: string;
  name: string;
  groupField: string;
  measureField?: string;
  aggregation: AggregateAggregation;
}

export interface AggregateInputRow {
  __ID: number;
  [field: string]: datum;
}

export interface AggregateContributor {
  sourceId: number;
  input: datum;
  rawInput?: datum;
  included: boolean;
  exclusionReason?: string;
}

export interface AggregateResultRow {
  id: string;
  groupValue: datum;
  groupLabel: string;
  value: number | undefined;
  rowCount: number;
  contributors: AggregateContributor[];
}

export interface AggregateResult {
  spec: AggregateSpec;
  rows: AggregateResultRow[];
  sourceRowCount: number;
}

export function displayAggregateValue(value: datum): string {
  if (value === undefined) {
    return "undefined";
  }
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return JSON.stringify(value);
  }
  return String(value);
}

export interface NumericInput {
  value: number;
  index: number;
}

export interface NumericExclusion {
  index: number;
  reason: string;
}

export function numericInputs(values: datum[]): {
  inputs: NumericInput[];
  exclusions: NumericExclusion[];
} {
  const inputs: NumericInput[] = [];
  const exclusions: NumericExclusion[] = [];
  values.forEach((value, index) => {
    const reason = numericExclusionReason(value);
    if (reason) {
      exclusions.push({ index, reason });
    } else {
      inputs.push({ value: Number(value), index });
    }
  });
  return { inputs, exclusions };
}

function aggregateValues(
  aggregation: AggregateAggregation,
  values: datum[]
): {
  value: number | undefined;
  included: Set<number>;
  exclusions: NumericExclusion[];
} {
  if (aggregation === "count") {
    return {
      value: values.length,
      included: new Set(values.map((_, index) => index)),
      exclusions: [],
    };
  }

  const { inputs, exclusions } = numericInputs(values);
  if (inputs.length === 0) {
    return { value: undefined, included: new Set(), exclusions };
  }

  const total = inputs.reduce((sum, input) => sum + input.value, 0);
  return {
    value: aggregation === "sum" ? total : total / inputs.length,
    included: new Set(inputs.map((input) => input.index)),
    exclusions,
  };
}

export function calculateGroupedAggregate(
  rows: AggregateInputRow[],
  spec: AggregateSpec,
  rawInputs: Record<number, datum> = {},
  exclusionReasons: Record<number, string> = {}
): AggregateResult {
  if (spec.aggregation !== "count" && !spec.measureField) {
    throw new Error(`${spec.aggregation} requires a measure field`);
  }

  const groups = new Map<string, AggregateInputRow[]>();
  rows.forEach((row) => {
    const value = categoryValue(row[spec.groupField]);
    const key = categoryKey(value);
    const group = groups.get(key);
    if (group) {
      group.push(row);
    } else {
      groups.set(key, [row]);
    }
  });

  const resultRows = Array.from(groups, ([key, group]) => {
    const values = group.map((row) =>
      spec.measureField ? row[spec.measureField] : undefined
    );
    const result = aggregateValues(spec.aggregation, values);
    const exclusionByIndex = new Map(
      result.exclusions.map((exclusion) => [exclusion.index, exclusion.reason])
    );
    return {
      id: `${spec.id}:${key}`,
      groupValue: categoryValue(group[0]?.[spec.groupField]),
      groupLabel: categoryLabel(categoryValue(group[0]?.[spec.groupField])),
      value: result.value,
      rowCount: group.length,
      contributors: group.map((row, index) => ({
        sourceId: row.__ID,
        input: values[index],
        rawInput: rawInputs[row.__ID],
        included: result.included.has(index),
        exclusionReason: result.included.has(index)
          ? undefined
          : (exclusionReasons[row.__ID] ?? exclusionByIndex.get(index)),
      })),
    } satisfies AggregateResultRow;
  });

  return { spec, rows: resultRows, sourceRowCount: rows.length };
}
