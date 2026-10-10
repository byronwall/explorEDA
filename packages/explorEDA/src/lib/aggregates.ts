import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { numericExclusionReason, parseNumber } from "@/lib/valueParsing";

export type AggregateAggregation = "count" | "sum" | "average";

export interface AggregateSpec {
  id: string;
  name: string;
  groupField: string;
  measureField?: string;
  /** Counts each value once, and uses one measure value per value. */
  entityField?: string;
  aggregation: AggregateAggregation;
}

/** Tooltip for the "Once per" control on grouped summaries and metric cards. */
export const ONCE_PER_HELP =
  "Count or measure each value of this ID field once, such as one order among its item rows. Rows without an ID are left out. If one ID has different values, the result is unavailable. Leave empty to use every row.";

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
  entityKey?: datum;
}

export interface AggregateResultRow {
  id: string;
  groupValue: datum;
  groupLabel: string;
  value: number | undefined;
  rowCount: number;
  contributors: AggregateContributor[];
  identityIssues?: {
    entityKey?: datum;
    reason: "missing-id" | "conflicting-values";
  }[];
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
      inputs.push({ value: parseNumber(value), index });
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

/**
 * Reduces one group of source rows and records why any row was left out.
 * With an entity field, each entity counts once and contributes one measure
 * value. Rows without an ID are left out; an entity whose rows disagree on
 * the measure makes the value unavailable instead of picking one of them.
 */
export function summarizeGroup(
  group: AggregateInputRow[],
  spec: Pick<AggregateSpec, "aggregation" | "measureField" | "entityField">,
  rawInputs: Record<number, datum> = {},
  exclusionReasons: Record<number, string> = {}
): Pick<
  AggregateResultRow,
  "value" | "rowCount" | "contributors" | "identityIssues"
> {
  const measureOf = (row: AggregateInputRow) =>
    spec.measureField ? row[spec.measureField] : undefined;
  const entityField = spec.entityField;
  const contributor = (
    row: AggregateInputRow,
    included: boolean,
    exclusionReason?: string
  ): AggregateContributor => ({
    sourceId: row.__ID,
    input: measureOf(row),
    rawInput: rawInputs[row.__ID],
    included,
    exclusionReason: included
      ? undefined
      : (exclusionReasons[row.__ID] ?? exclusionReason),
    ...(entityField ? { entityKey: row[entityField] } : {}),
  });

  // Each unit is one row, or every row of one entity.
  const units: AggregateInputRow[][] = [];
  const contributors: AggregateContributor[] = [];
  const identityIssues: NonNullable<AggregateResultRow["identityIssues"]> = [];
  if (!entityField) {
    group.forEach((row) => units.push([row]));
  } else {
    const entities = new Map<string, AggregateInputRow[]>();
    for (const row of group) {
      const entityKey = row[entityField];
      if (entityKey === undefined || entityKey === null) {
        identityIssues.push({ reason: "missing-id" });
        contributors.push(contributor(row, false, "Missing ID"));
        continue;
      }
      const key = categoryKey(entityKey);
      const rows = entities.get(key);
      if (rows) rows.push(row);
      else entities.set(key, [row]);
    }
    for (const rows of entities.values()) {
      const first = measureOf(rows[0]!);
      if (rows.every((row) => Object.is(measureOf(row), first))) {
        units.push(rows);
        continue;
      }
      identityIssues.push({
        entityKey: rows[0]![entityField],
        reason: "conflicting-values",
      });
      contributors.push(
        ...rows.map((row) =>
          contributor(row, false, "Values differ for this ID")
        )
      );
    }
  }

  const result = aggregateValues(
    spec.aggregation,
    units.map((rows) => measureOf(rows[0]!))
  );
  const exclusionByIndex = new Map(
    result.exclusions.map((exclusion) => [exclusion.index, exclusion.reason])
  );
  units.forEach((rows, index) => {
    const included = result.included.has(index);
    rows.forEach((row, position) =>
      contributors.push(
        included && position > 0
          ? contributor(row, false, "Repeats an ID already counted")
          : contributor(row, included, exclusionByIndex.get(index))
      )
    );
  });
  const conflicted = identityIssues.some(
    (issue) => issue.reason === "conflicting-values"
  );
  return {
    value: conflicted ? undefined : result.value,
    rowCount: units.length,
    contributors,
    ...(identityIssues.length ? { identityIssues } : {}),
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

  const resultRows = Array.from(groups, ([key, group]) => ({
    id: `${spec.id}:${key}`,
    groupValue: categoryValue(group[0]?.[spec.groupField]),
    groupLabel: categoryLabel(categoryValue(group[0]?.[spec.groupField])),
    ...summarizeGroup(group, spec, rawInputs, exclusionReasons),
  })) satisfies AggregateResultRow[];

  return { spec, rows: resultRows, sourceRowCount: rows.length };
}
