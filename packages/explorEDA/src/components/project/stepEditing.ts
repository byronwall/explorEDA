import type {
  AggregateStep,
  AnalysisFilterOperator,
  AnalysisField,
  AnalysisProject,
  AnalysisQuery,
  AnalysisScalar,
  AnalysisStep,
  AnalysisView,
  CalculateStep,
  ExpandStep,
  FilterStep,
  LookupStep,
  RelationshipDefinition,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import {
  copyQuery,
  fieldName,
  newId,
  relationshipDirection,
  replaceQuery,
} from "./queryEditing";
import { settingsFieldUsage } from "./settingsCompatibility";

/**
 * Query step rules shared by the Query panel and the schema diagram, so a
 * step added, changed, or removed in either place behaves the same way.
 */

export type FollowMode = "lookup" | "aggregate" | "expand";
export type FollowMeasure = "count" | "sum" | "average";

export const FOLLOW_MODE_LABELS: Record<FollowMode, string> = {
  lookup: "Add fields · same rows",
  aggregate: "Summarize related rows · same rows",
  expand: "One row per related record · new view",
};

export const FOLLOW_MODE_HELP: Record<FollowMode, string> = {
  lookup:
    "Adds the related record's fields to each row. Rows stay the same. Only for links with at most one related record per row.",
  aggregate:
    "Counts, sums, or averages the related records for each row. Rows stay the same.",
  expand:
    "Makes one row per related record in a new view, so the row meaning changes. This view keeps its rows.",
};

export const OPERATOR_LABELS: Record<AnalysisFilterOperator, string> = {
  eq: "is",
  neq: "is not",
  gt: "greater than",
  gte: "at least",
  lt: "less than",
  lte: "at most",
  "is-null": "is empty",
  "is-not-null": "is not empty",
};

/** Defined but empty tables give every step's fields without reading rows. */
function emptyTables(project: AnalysisProject) {
  return Object.fromEntries(project.sources.map((source) => [source.id, []]));
}

/** Each step's fields, by step ID, or why the query cannot run. */
export function queryFields(project: AnalysisProject, queryId: string) {
  try {
    const evaluation = evaluateAnalysisQuery(
      project,
      emptyTables(project),
      queryId
    );
    return {
      stages: new Map(
        evaluation.stages.map((stage) => [stage.stepId, stage.fields])
      ),
      output: evaluation.fields,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : String(error),
      stages: new Map<string, AnalysisField[]>(),
      output: [] as AnalysisField[],
    };
  }
}

/** The fields a step reads: those of the step before it. */
export function stepInputFields(
  project: AnalysisProject,
  query: AnalysisQuery,
  step: AnalysisStep
) {
  if (step.kind === "source") return [];
  return queryFields(project, query.id).stages.get(step.inputStepId) ?? [];
}

/** Relationships the given rows can follow, and from which end. */
export function usableRelationships(
  project: AnalysisProject,
  fields: AnalysisField[]
) {
  return project.relationships.flatMap((relationship) => {
    const direction = relationshipDirection(relationship, fields);
    return direction ? [{ relationship, direction }] : [];
  });
}

/** Appends steps after the query's output and makes the last one the output. */
export function appendSteps(
  project: AnalysisProject,
  query: AnalysisQuery,
  steps: AnalysisStep[]
): AnalysisProject {
  return replaceQuery(project, {
    ...query,
    steps: [...query.steps, ...steps],
    outputStepId: steps.at(-1)?.id ?? query.outputStepId,
  });
}

export function replaceStep(
  project: AnalysisProject,
  query: AnalysisQuery,
  step: AnalysisStep
): AnalysisProject {
  return replaceQuery(project, {
    ...query,
    steps: query.steps.map((item) => (item.id === step.id ? step : item)),
  });
}

export type FollowResult =
  | { kind: "replace"; project: AnalysisProject }
  | {
      kind: "open";
      view: AnalysisView;
      name: string;
      project: AnalysisProject;
    };

/**
 * Follow a relationship from a query's output: add the related fields, add a
 * summary of related rows, or open a new view with one row per related record.
 */
export function followRelationship({
  project,
  query,
  relationship,
  mode,
  measure = "count",
  measureFieldId,
}: {
  project: AnalysisProject;
  query: AnalysisQuery;
  relationship: RelationshipDefinition;
  mode: FollowMode;
  measure?: FollowMeasure;
  measureFieldId?: string;
}): FollowResult | { kind: "blocked"; reason: string } {
  const fields = queryFields(project, query.id);
  const outputFields = fields.stages.get(query.outputStepId) ?? fields.output;
  const direction = relationshipDirection(relationship, outputFields);
  if (!direction) {
    return {
      kind: "blocked",
      reason: "These rows have no field this relationship matches.",
    };
  }
  const target: SourceDefinition | undefined = project.sources.find(
    (source) => source.id === direction.targetSourceId
  );
  if (!target)
    return { kind: "blocked", reason: "The related table is missing." };
  if (mode === "lookup" && !direction.single) {
    return {
      kind: "blocked",
      reason: `Each row can match several ${target.name} records. Summarize them, or expand to one row per record.`,
    };
  }
  const sumField =
    measureFieldId ||
    target.fields.find((field) => field.type === "number")?.id ||
    "";
  if (mode === "aggregate" && measure !== "count" && !sumField) {
    return {
      kind: "blocked",
      reason: `${target.name} has no number field to summarize.`,
    };
  }

  // Projected fields are prefixed with an alias; keep it unique in this frame.
  const base = target.id.replace(/[^a-zA-Z0-9_]/g, "_");
  const aliases = new Set(fields.output.map((field) => field.id.split(".")[0]));
  let alias = base;
  for (let n = 2; aliases.has(alias); n += 1) alias = `${base}${n}`;
  const follow = {
    relationshipId: relationship.id,
    as: alias,
    inputFieldId: direction.inputField.id,
  };

  if (mode === "lookup") {
    const step: LookupStep = {
      id: newId("lookup"),
      kind: "lookup",
      inputStepId: query.outputStepId,
      ...follow,
    };
    return { kind: "replace", project: appendSteps(project, query, [step]) };
  }

  if (mode === "aggregate") {
    // Group by every current field so each current row stays one row.
    const expand: ExpandStep = {
      id: newId("expand"),
      kind: "expand",
      inputStepId: query.outputStepId,
      keepUnmatched: true,
      ...follow,
    };
    const fieldId = measure === "count" ? target.entityKey : sumField;
    const fieldName =
      target.fields.find((field) => field.id === fieldId)?.name ?? fieldId;
    const summary: AggregateStep = {
      id: newId("aggregate"),
      kind: "aggregate",
      inputStepId: expand.id,
      groupBy: outputFields.map((field) => field.id),
      measures: [
        {
          id: newId(`${alias}-${measure}`),
          label:
            measure === "count"
              ? `${target.name} count`
              : `${measure === "sum" ? "Total" : "Average"} ${fieldName}`,
          operation: measure,
          fieldId: `${alias}.${fieldId}`,
        },
      ],
    };
    return {
      kind: "replace",
      project: appendSteps(project, query, [expand, summary]),
    };
  }

  // Expanding changes the row meaning, so it gets its own query and view.
  const copy = copyQuery(query, project);
  const expand: ExpandStep = {
    id: newId("expand"),
    kind: "expand",
    inputStepId: copy.outputStepId,
    ...follow,
  };
  const expanded: AnalysisQuery = {
    ...copy,
    name: `${query.name} with ${target.name}`,
    frameLabel: target.name,
    steps: [...copy.steps, expand],
    outputStepId: expand.id,
  };
  return {
    kind: "open",
    view: { id: newId("view"), name: expanded.name, queryId: expanded.id },
    name: expanded.name,
    project: { ...project, queries: [...project.queries, expanded] },
  };
}

/** Why an expression cannot become a calculation over the given fields. */
export function expressionProblem(expression: string, fields: AnalysisField[]) {
  try {
    const known = new Set(fields.map((field) => field.id));
    const unknown = parseExpression(expression).dependencies.filter(
      (field) => !known.has(field)
    );
    return unknown.length ? `Unknown fields: ${unknown.join(", ")}` : undefined;
  } catch (error) {
    return error instanceof Error ? error.message : String(error);
  }
}

/** A calculation after the query's output, with a field ID unique in the query. */
export function calculateStep(
  query: AnalysisQuery,
  fields: AnalysisField[],
  label: string,
  expression: string
): CalculateStep {
  const base =
    label
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_") || "calc";
  const ids = new Set(fields.map((field) => field.id));
  let fieldId = base;
  for (let n = 2; ids.has(fieldId); n += 1) fieldId = `${base}_${n}`;
  return {
    id: newId("calculate"),
    kind: "calculate",
    inputStepId: query.outputStepId,
    fieldId,
    label: label.trim() || fieldId,
    expression,
  };
}

/** A filter after the query's output. */
export function filterStep(
  query: AnalysisQuery,
  fieldId: string,
  operator: AnalysisFilterOperator,
  value?: AnalysisScalar
): FilterStep {
  return {
    id: newId("filter"),
    kind: "filter",
    inputStepId: query.outputStepId,
    fieldId,
    operator,
    ...(operator === "is-null" || operator === "is-not-null" ? {} : { value }),
  };
}

/** Reads typed text as a number when the field is numeric. */
export function filterValue(text: string, field: AnalysisField | undefined) {
  if (field?.type === "number") {
    const number = Number(text);
    return Number.isFinite(number) && text.trim() !== "" ? number : text;
  }
  if (field?.type === "boolean") {
    if (text === "true") return true;
    if (text === "false") return false;
  }
  return text;
}

export interface StepRemoval {
  /** The project without the step, or undefined when it cannot be removed. */
  project?: AnalysisProject;
  /** Why the step cannot be removed. */
  blocked?: string;
  /** Fields the query stops producing, by name. */
  lostFields: string[];
  /** Views that read a field the query stops producing, with those fields by name. */
  brokenViews: { id: string; name: string; fields: string[] }[];
}

/**
 * Removes a step and joins the steps around it. Reports the fields the query
 * stops producing and the views that read them, so the user can decide.
 */
export function removeStep(
  project: AnalysisProject,
  query: AnalysisQuery,
  stepId: string,
  views: {
    id: string;
    name: string;
    queryId: string;
    settings?: SavedDataStructure;
  }[] = []
): StepRemoval {
  const step = query.steps.find((item) => item.id === stepId);
  const none = { lostFields: [], brokenViews: [] };
  if (!step) return { ...none, blocked: "This step is gone." };
  if (step.kind === "source") {
    return {
      ...none,
      blocked: "A query starts by reading a table; remove the query instead.",
    };
  }
  const steps = query.steps
    .filter((item) => item.id !== stepId)
    .map((item) =>
      item.kind !== "source" && item.inputStepId === stepId
        ? { ...item, inputStepId: step.inputStepId }
        : item
    );
  const next = replaceQuery(project, {
    ...query,
    steps,
    outputStepId:
      query.outputStepId === stepId ? step.inputStepId : query.outputStepId,
  });
  const before = queryFields(project, query.id);
  const after = queryFields(next, query.id);
  if (after.error) {
    return { ...none, blocked: `Later steps need this one: ${after.error}` };
  }
  const kept = new Set(after.output.map((field) => field.id));
  const lost = new Set(
    before.output.map((field) => field.id).filter((field) => !kept.has(field))
  );
  const name = (id: string) => fieldName(project, before.output, id);
  const lostFields = [...lost].map(name);
  const brokenViews = views
    .filter((view) => view.queryId === query.id)
    .map((view) => ({
      id: view.id,
      name: view.name,
      fields: [
        ...new Set(
          settingsFieldUsage(view.settings)
            .uses.map((use) => use.field)
            .filter((field) => lost.has(field))
        ),
      ].map(name),
    }))
    .filter((view) => view.fields.length);
  return { project: next, lostFields, brokenViews };
}
