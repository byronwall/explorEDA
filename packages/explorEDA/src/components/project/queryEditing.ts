import type {
  AnalysisField,
  AnalysisFilterOperator,
  AnalysisProject,
  AnalysisQuery,
  AnalysisResultRow,
  AnalysisStep,
  AnalysisView,
  RelationshipDefinition,
} from "@/types/AnalysisProject";
import { nextQueryGlyph } from "@/lib/queryGlyph";

export function newId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

export function replaceQuery(
  project: AnalysisProject,
  query: AnalysisQuery
): AnalysisProject {
  return {
    ...project,
    queries: project.queries.map((item) =>
      item.id === query.id ? query : item
    ),
  };
}

const OPERATOR_TEXT: Record<AnalysisFilterOperator, string> = {
  eq: "is",
  neq: "is not",
  gt: ">",
  gte: "≥",
  lt: "<",
  lte: "≤",
  "is-null": "is empty",
  "is-not-null": "is not empty",
};

/** A field's display name, with its source when that helps tell it apart. */
export function fieldName(
  project: AnalysisProject,
  fields: AnalysisField[],
  id: string
) {
  const field = fields.find((item) => item.id === id);
  if (!field) return id;
  if (!("sourceId" in field.origin)) return field.name;
  const { sourceId } = field.origin;
  const source = project.sources.find((item) => item.id === sourceId);
  return source ? `${source.name} ${field.name}` : field.name;
}

export function stepTitle(step: AnalysisStep, project: AnalysisProject) {
  const sourceName = (id: string) =>
    project.sources.find((source) => source.id === id)?.name ?? id;
  const link = (id: string) =>
    project.relationships.find((item) => item.id === id)?.name ??
    "a removed relationship";
  switch (step.kind) {
    case "source":
      return `Read ${sourceName(step.sourceId)}`;
    case "lookup":
      return `Add fields through ${link(step.relationshipId)}`;
    case "expand":
      return `Expand rows through ${link(step.relationshipId)}`;
    case "calculate":
      return `Calculate ${step.label}`;
    case "filter":
      return "Keep matching rows";
    case "aggregate":
      return "Group and summarize";
  }
}

/** One plain line for what a step does, using field and parameter names. */
export function stepDetail(
  step: AnalysisStep,
  project: AnalysisProject,
  inputFields: AnalysisField[]
) {
  const name = (id: string) => fieldName(project, inputFields, id);
  switch (step.kind) {
    case "source":
    case "lookup":
    case "expand":
      return undefined;
    case "calculate":
      return step.expression;
    case "filter": {
      const parameter = project.parameters?.find(
        (item) => item.id === step.parameterId
      );
      const value = parameter
        ? `input “${parameter.name}”`
        : JSON.stringify(step.value);
      return step.operator === "is-null" || step.operator === "is-not-null"
        ? `${name(step.fieldId)} ${OPERATOR_TEXT[step.operator]}`
        : `${name(step.fieldId)} ${OPERATOR_TEXT[step.operator]} ${value}`;
    }
    case "aggregate": {
      const groups = step.groupBy.length
        ? `by ${step.groupBy.map(name).join(", ")}`
        : "into one row";
      const measures = step.measures.map((measure) =>
        measure.entityFieldId
          ? `${measure.label} (once per ${name(measure.entityFieldId)})`
          : measure.label
      );
      return `${measures.join(", ")} ${groups}`;
    }
  }
}

/** A short label for a result row: its own entity key, or its position. */
export function rowLabel(row: AnalysisResultRow, index: number) {
  const key = row.sourceRows[0]?.entityKey;
  return key == null ? `#${index + 1}` : String(key);
}

/** The steps a query needs to produce one of its stages. */
export function queryForStage(
  query: AnalysisQuery,
  stepId: string,
  project: AnalysisProject
): AnalysisQuery {
  const steps = new Map(query.steps.map((step) => [step.id, step]));
  const used = new Set<string>();
  const visit = (id: string) => {
    const step = steps.get(id);
    if (!step || used.has(id)) return;
    used.add(id);
    if (step.kind !== "source") visit(step.inputStepId);
  };
  visit(stepId);
  const step = steps.get(stepId);
  return {
    ...query,
    id: newId(`${query.id}-stage`),
    name: `${query.name}: ${step ? stepTitle(step, project) : "step"}`,
    glyph: nextQueryGlyph(project.queries),
    steps: query.steps.filter((item) => used.has(item.id)),
    outputStepId: stepId,
  };
}

/** An independent copy with fresh step IDs, so editing it leaves the original. */
export function copyQuery(query: AnalysisQuery, project: AnalysisProject) {
  const stepIds = new Map(
    query.steps.map((step) => [step.id, newId(`${step.id}-copy`)])
  );
  return {
    ...query,
    id: newId(`${query.id}-copy`),
    name: `Copy of ${query.name}`,
    glyph: nextQueryGlyph(project.queries),
    steps: query.steps.map((step) => ({
      ...step,
      id: stepIds.get(step.id)!,
      ...(step.kind === "source"
        ? {}
        : { inputStepId: stepIds.get(step.inputStepId)! }),
    })),
    outputStepId: stepIds.get(query.outputStepId)!,
  } satisfies AnalysisQuery;
}

/** A project with one more query that reads a source, and a view of it. */
export function sourceView(project: AnalysisProject, sourceId: string) {
  const source = project.sources.find((item) => item.id === sourceId);
  const name = source?.name ?? sourceId;
  const queryId = newId(`source-${sourceId}`);
  const stepId = `${queryId}-read`;
  const query: AnalysisQuery = {
    id: queryId,
    name,
    glyph: nextQueryGlyph(project.queries),
    frameLabel: name,
    steps: [{ id: stepId, kind: "source", sourceId }],
    outputStepId: stepId,
  };
  const view: AnalysisView = { id: newId("view"), name, queryId };
  return {
    project: { ...project, queries: [...project.queries, query] },
    view,
  };
}

/**
 * Which end of a relationship the current rows can follow from, and whether
 * following it keeps one row per current row.
 */
export function relationshipDirection(
  relationship: RelationshipDefinition,
  fields: AnalysisField[]
) {
  const matches = (sourceId: string, fieldId: string) =>
    fields.find(
      (field) =>
        field.id === `${sourceId}.${fieldId}` ||
        ("sourceId" in field.origin &&
          field.origin.sourceId === sourceId &&
          field.origin.fieldId === fieldId)
    );
  const fromField = matches(
    relationship.from.sourceId,
    relationship.from.fieldId
  );
  const toField = fromField
    ? undefined
    : matches(relationship.to.sourceId, relationship.to.fieldId);
  const inputField = fromField ?? toField;
  if (!inputField) return undefined;
  const side = fromField ? "from" : "to";
  const target = fromField ? relationship.to : relationship.from;
  const { cardinality } = relationship;
  return {
    inputField,
    targetSourceId: target.sourceId,
    targetFieldId: target.fieldId,
    side,
    /** At most one related row per current row. */
    single:
      cardinality === "one-to-one" ||
      (cardinality === "many-to-one" && side === "from") ||
      (cardinality === "one-to-many" && side === "to"),
  } as const;
}
