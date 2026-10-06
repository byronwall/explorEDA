import { categoryKey, categoryLabel, categoryValue } from "@/lib/categories";
import type { datum } from "@/types/ChartTypes";
import { numericExclusionReason } from "@/lib/numeric";

export type AggregateAggregation = "count" | "sum" | "average";

export interface AggregateSpec {
  id: string;
  name: string;
  groupField: string;
  measureField?: string;
  /** Count distinct entities or reduce one measure value per entity. */
  entityField?: string;
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

/** Reduces one group of source rows and records why any row was left out. */
export function summarizeGroup(
  group: AggregateInputRow[],
  spec: Pick<AggregateSpec, "aggregation" | "measureField" | "entityField">,
  rawInputs: Record<number, datum> = {},
  exclusionReasons: Record<number, string> = {},
  conflictingGroupEntities: Set<string> = new Set()
): Pick<
  AggregateResultRow,
  "value" | "rowCount" | "contributors" | "identityIssues"
> {
  const measureValues = (row: AggregateInputRow) =>
    spec.measureField ? row[spec.measureField] : undefined;
  if (!spec.entityField) {
    const values = group.map(measureValues);
    const result = aggregateValues(spec.aggregation, values);
    const exclusionByIndex = new Map(
      result.exclusions.map((exclusion) => [exclusion.index, exclusion.reason])
    );
    return {
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
    };
  }

  const entities = new Map<string, AggregateInputRow[]>();
  const identityIssues: NonNullable<AggregateResultRow["identityIssues"]> = [];
  const contributors: AggregateContributor[] = [];
  for (const row of group) {
    const entityKey = row[spec.entityField!];
    if (entityKey === undefined || entityKey === null) {
      identityIssues.push({ reason: "missing-id" });
      contributors.push({
        sourceId: row.__ID,
        input: measureValues(row),
        rawInput: rawInputs[row.__ID],
        included: false,
        exclusionReason: "Missing entity ID",
      });
      continue;
    }
    const key = categoryKey(entityKey);
    const rows = entities.get(key);
    if (rows) rows.push(row);
    else entities.set(key, [row]);
  }

  const values: datum[] = [];
  const entityContributors: AggregateContributor[][] = [];
  for (const [entityKey, rows] of entities) {
    if (conflictingGroupEntities.has(entityKey)) {
      identityIssues.push({
        entityKey: rows[0]![spec.entityField!],
        reason: "conflicting-values",
      });
      contributors.push(
        ...rows.map((row) => ({
          sourceId: row.__ID,
          input: measureValues(row),
          rawInput: rawInputs[row.__ID],
          included: false,
          exclusionReason: "Conflicting group values for entity",
          entityKey: row[spec.entityField!],
        }))
      );
      continue;
    }
    const first = measureValues(rows[0]!);
    const agrees = rows.every((row) => Object.is(measureValues(row), first));
    if (!agrees) {
      identityIssues.push({
        entityKey: rows[0]![spec.entityField],
        reason: "conflicting-values",
      });
      contributors.push(
        ...rows.map((row) => ({
          sourceId: row.__ID,
          input: measureValues(row),
          rawInput: rawInputs[row.__ID],
          included: false,
          exclusionReason: "Conflicting values for entity",
          entityKey: row[spec.entityField!],
        }))
      );
      continue;
    }
    values.push(first);
    const entity = rows.map((row, index) => ({
      sourceId: row.__ID,
      input: measureValues(row),
      rawInput: rawInputs[row.__ID],
      included: index === 0,
      exclusionReason: index === 0 ? undefined : "Repeated entity",
      entityKey: row[spec.entityField!],
    }));
    entityContributors.push(entity);
  }

  const result = aggregateValues(spec.aggregation, values);
  const exclusionByIndex = new Map(
    result.exclusions.map((exclusion) => [exclusion.index, exclusion.reason])
  );
  entityContributors.forEach((items, index) => {
    const included = result.included.has(index);
    contributors.push(
      ...items.map((item) => ({
        ...item,
        included: included && item.included,
        exclusionReason: included
          ? item.exclusionReason
          : (exclusionReasons[item.sourceId] ?? exclusionByIndex.get(index)),
      }))
    );
  });
  return {
    value: identityIssues.length > 0 ? undefined : result.value,
    rowCount: entities.size,
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
  const entityGroups = new Map<string, Set<string>>();
  if (spec.entityField) {
    for (const row of rows) {
      const entity = row[spec.entityField];
      if (entity === undefined || entity === null) continue;
      const entityKey = categoryKey(entity);
      const groupKey = categoryKey(row[spec.groupField]);
      const assignedGroups = entityGroups.get(entityKey) ?? new Set<string>();
      assignedGroups.add(groupKey);
      entityGroups.set(entityKey, assignedGroups);
    }
  }
  const conflictingGroupEntities = new Set(
    [...entityGroups]
      .filter(([, assignedGroups]) => assignedGroups.size > 1)
      .map(([key]) => key)
  );
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
    ...summarizeGroup(
      group,
      spec,
      rawInputs,
      exclusionReasons,
      conflictingGroupEntities
    ),
  })) satisfies AggregateResultRow[];

  return { spec, rows: resultRows, sourceRowCount: rows.length };
}
