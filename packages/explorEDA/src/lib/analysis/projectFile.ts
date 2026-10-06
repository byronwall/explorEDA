import type { AnalysisProject, AnalysisSourceRow, AnalysisView } from "@/types/AnalysisProject";
import { parseExpression } from "@/lib/calculations/parser/semantics";

export interface AnalysisProjectFile {
  format: "exploreda-project";
  version: 1;
  project: AnalysisProject;
  tables: Record<string, AnalysisSourceRow[]>;
  views: AnalysisView[];
  activeViewId: string;
}

export type AnalysisProjectFileInput = Omit<AnalysisProjectFile, "activeViewId"> & { activeViewId?: string };

const specialKey = "__exploreda_value__";
const isRecord = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date);

function encode(value: unknown): unknown {
  if (value instanceof Date) return { [specialKey]: "date", value: value.toISOString() };
  if (value === undefined) return { [specialKey]: "undefined" };
  if (typeof value === "number" && !Number.isFinite(value)) return { [specialKey]: String(value) };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") {
    const entries = Object.entries(value);
    const record = value as Record<string, unknown>;
    const collision = entries.some(([key]) => key === specialKey) &&
      (entries.length === 1 || entries.length === 2 && (
        record[specialKey] === "date" && typeof record.value === "string" ||
        record[specialKey] === "escaped-object" && record.value !== null && typeof record.value === "object"
      ));
    const encoded = Object.fromEntries(entries.map(([key, item]) => [key, encode(item)]));
    return collision ? { [specialKey]: "escaped-object", value: encoded } : encoded;
  }
  return value;
}

function decode(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const entries = Object.entries(record);
    if (entries.length === 2 && record[specialKey] === "escaped-object" && record.value && typeof record.value === "object") {
      return Object.fromEntries(Object.entries(record.value).map(([key, item]) => [key, decode(item)]));
    }
    if (entries.length === 2 && record[specialKey] === "date" && typeof record.value === "string") return new Date(record.value);
    if (entries.length === 1 && entries[0]?.[0] === specialKey) {
      if (entries[0]?.[1] === "undefined") return undefined;
      if (entries[0]?.[1] === "NaN") return NaN;
      if (entries[0]?.[1] === "Infinity") return Infinity;
      if (entries[0]?.[1] === "-Infinity") return -Infinity;
    }
    return Object.fromEntries(entries.map(([key, item]) => [key, decode(item)]));
  }
  return value;
}

export function analysisViewClosure(file: AnalysisProjectFile, viewId: string): AnalysisProjectFile {
  const view = file.views.find((item) => item.id === viewId);
  if (!view) throw new Error(`Unknown view ${viewId}`);
  const query = file.project.queries.find((item) => item.id === view.queryId);
  if (!query) throw new Error(`Unknown query ${view.queryId}`);
  const steps = new Map(query.steps.map((step) => [step.id, step]));
  const included = new Set<string>();
  const sources = new Set<string>();
  const relationships = new Set<string>();
  const parameters = new Set<string>();
  const visit = (id: string) => {
    if (included.has(id)) return;
    const step = steps.get(id);
    if (!step) throw new Error(`Unknown step ${id}`);
    included.add(id);
    if (step.kind === "source") sources.add(step.sourceId);
    else visit(step.inputStepId);
    if (step.kind === "lookup" || step.kind === "expand") relationships.add(step.relationshipId);
    if (step.kind === "filter" && step.parameterId) parameters.add(step.parameterId);
  };
  visit(query.outputStepId);
  const relationshipDefs = file.project.relationships.filter((item) => relationships.has(item.id));
  relationshipDefs.forEach((item) => { sources.add(item.from.sourceId); sources.add(item.to.sourceId); });
  const project: AnalysisProject = {
    ...file.project,
    sources: file.project.sources.filter((source) => sources.has(source.id)),
    relationships: relationshipDefs,
    queries: [{ ...query, steps: query.steps.filter((step) => included.has(step.id)) }],
    parameters: file.project.parameters?.filter((parameter) => parameters.has(parameter.id)),
  };
  return { format: file.format, version: file.version, project, tables: Object.fromEntries(Object.entries(file.tables).filter(([id]) => sources.has(id))), views: [view], activeViewId: view.id };
}

export const selectAnalysisProjectView = analysisViewClosure;

export function serializeAnalysisProject(file: AnalysisProjectFile): string {
  const normalized = { format: file.format, version: file.version, project: file.project, tables: file.tables, views: file.views, activeViewId: file.activeViewId ?? file.views[0]?.id ?? "" };
  validateAnalysisProjectFile(normalized);
  return JSON.stringify(encode(normalized), null, 2);
}

export function stringifyAnalysisProject(file: AnalysisProjectFileInput): string {
  return serializeAnalysisProject({ format: file.format, version: file.version, project: file.project, tables: file.tables, views: file.views, activeViewId: file.activeViewId ?? file.views[0]?.id ?? "" });
}

export function parseAnalysisProjectFile(text: string): AnalysisProjectFile {
  const value = decode(JSON.parse(text)) as AnalysisProjectFile;
  validateAnalysisProjectFile(value);
  return { format: value.format, version: value.version, project: value.project, tables: value.tables, views: value.views, activeViewId: value.activeViewId };
}

export const parseAnalysisProject = parseAnalysisProjectFile;

export function stringifyAnalysisState(value: unknown): string {
  return JSON.stringify(encode(value));
}

export function parseAnalysisState<T = unknown>(value: string): T {
  return decode(JSON.parse(value)) as T;
}

export function validateAnalysisProjectFile(value: AnalysisProjectFile): void {
  if (!value || value.format !== "exploreda-project" || value.version !== 1 || value.project?.version !== 1) throw new Error("Unsupported project file");
  if (!isRecord(value.tables) || !Array.isArray(value.project.sources) || !Array.isArray(value.project.relationships) || !Array.isArray(value.project.queries) || !Array.isArray(value.views)) throw new Error("Project file tables, definitions, and views must be objects or arrays");
  if (typeof value.project.id !== "string" || !value.project.id) throw new Error("Project id is required");
  const unique = (items: { id: string }[], kind: string) => {
    if (!Array.isArray(items)) throw new Error(`Project ${kind} definitions must be an array`);
    const ids = new Set<string>();
    for (const item of items) {
      if (!isRecord(item) || typeof item.id !== "string" || !item.id || ids.has(item.id)) throw new Error(`Duplicate or empty ${kind} id: ${isRecord(item) ? String(item.id) : ""}`);
      ids.add(item.id);
    }
    return ids;
  };
  const sourceIds = unique(value.project.sources, "source");
  const relationshipIds = unique(value.project.relationships, "relationship");
  unique(value.project.queries, "query");
  unique(value.views, "view");
  unique(value.project.parameters ?? [], "parameter");
  for (const tableId of Object.keys(value.tables)) if (!sourceIds.has(tableId)) throw new Error(`Table ${tableId} has no source definition`);
  if (!value.views.some((view) => view.id === value.activeViewId)) throw new Error(`Unknown active view ${value.activeViewId}`);
  for (const source of value.project.sources) {
    if (typeof source.name !== "string" || typeof source.glyph !== "string" || typeof source.entityKey !== "string" || !Array.isArray(source.fields)) throw new Error(`Source ${source.id} has invalid metadata`);
    const fields = unique(source.fields, `field in ${source.id}`);
    if (!fields.has(source.entityKey)) throw new Error(`Source ${source.id} has an unknown entity key`);
    for (const field of source.fields) {
      if (typeof field.name !== "string" || field.type !== undefined && !["string", "number", "boolean", "date", "unknown"].includes(field.type)) throw new Error(`Source ${source.id} has invalid field metadata`);
    }
    const table = value.tables[source.id];
    if (table !== undefined && !Array.isArray(table)) throw new Error(`Table ${source.id} must be an array`);
    for (const [rowIndex, row] of (table ?? []).entries()) {
      if (!isRecord(row)) throw new Error(`Source ${source.id} row ${rowIndex} must be an object`);
      for (const [key, item] of Object.entries(row)) {
        if (item !== null && !["undefined", "string", "number", "boolean"].includes(typeof item)) throw new Error(`Source ${source.id} has a non-scalar value in ${key}`);
        if (!fields.has(key)) throw new Error(`Source ${source.id} row has undeclared field ${key}`);
      }
    }
  }
  for (const relation of value.project.relationships) {
    if (typeof relation.name !== "string" || !["many-to-one", "one-to-one", "one-to-many", "many-to-many"].includes(relation.cardinality)) throw new Error(`Relationship ${relation.id} has invalid metadata`);
    if (!isRecord(relation.from) || !isRecord(relation.to) || typeof relation.from.sourceId !== "string" || typeof relation.from.fieldId !== "string" || typeof relation.to.sourceId !== "string" || typeof relation.to.fieldId !== "string") throw new Error(`Relationship ${relation.id} has invalid endpoints`);
    if (!sourceIds.has(relation.from.sourceId) || !sourceIds.has(relation.to.sourceId)) throw new Error(`Relationship ${relation.id} references a missing source`);
    for (const endpoint of [relation.from, relation.to]) {
      const source = value.project.sources.find((item) => item.id === endpoint.sourceId)!;
      if (!source.fields.some((field) => field.id === endpoint.fieldId)) throw new Error(`Relationship ${relation.id} references a missing field`);
    }
  }
  for (const query of value.project.queries) {
    if (typeof query.name !== "string" || typeof query.glyph !== "string" || typeof query.frameLabel !== "string" || !Array.isArray(query.steps)) throw new Error(`Query ${query.id} has invalid metadata`);
    const ids = unique(query.steps, `step in ${query.id}`);
    if (!ids.has(query.outputStepId)) throw new Error(`Query ${query.id} references a missing output step`);
    const steps = new Map(query.steps.map((step) => [step.id, step]));
    const visiting = new Set<string>();
    const visited = new Set<string>();
    const visit = (id: string) => {
      if (visiting.has(id)) throw new Error(`Query ${query.id} contains a cycle`);
      if (visited.has(id)) return;
      const step = steps.get(id);
      if (!step) throw new Error(`Query ${query.id} references a missing step`);
      visiting.add(id);
      if (step.kind !== "source") visit(step.inputStepId);
      visiting.delete(id);
      visited.add(id);
    };
    visit(query.outputStepId);
    for (const step of query.steps) visit(step.id);
    const frames = new Map<string, Map<string, { sourceId?: string; fieldId?: string }>>();
    const fieldsAt = (id: string) => {
      const cached = frames.get(id);
      if (cached) return cached;
      const step = steps.get(id)!;
      if (!step || !["source", "lookup", "expand", "calculate", "filter", "aggregate"].includes(step.kind)) throw new Error(`Step ${id} has an unsupported operation`);
      const fields = new Map<string, { sourceId?: string; fieldId?: string }>();
      if (step.kind === "source") {
        const source = value.project.sources.find((item) => item.id === step.sourceId)!;
        if (!source) throw new Error(`Step ${step.id} references a missing source`);
        source.fields.forEach((field) => fields.set(`${source.id}.${field.id}`, { sourceId: source.id, fieldId: field.id }));
      } else {
        const input = fieldsAt(step.inputStepId);
        input.forEach((origin, fieldId) => fields.set(fieldId, origin));
        if (step.kind === "lookup" || step.kind === "expand") {
          const relationship = value.project.relationships.find((item) => item.id === step.relationshipId)!;
          const matches = (fieldId: string, endpoint: { sourceId: string; fieldId: string }) => {
            const origin = input.get(fieldId);
            return origin?.sourceId === endpoint.sourceId && origin.fieldId === endpoint.fieldId;
          };
          const fromId = `${relationship.from.sourceId}.${relationship.from.fieldId}`;
          const toId = `${relationship.to.sourceId}.${relationship.to.fieldId}`;
          const inputId = step.inputFieldId;
          const isFrom = inputId ? matches(inputId, relationship.from) : input.has(fromId) ? matches(fromId, relationship.from) : matches(toId, relationship.from);
          const isTo = inputId ? matches(inputId, relationship.to) : input.has(toId) ? matches(toId, relationship.to) : matches(fromId, relationship.to);
          if (!isFrom && !isTo) throw new Error(`Step ${step.id} has no relationship input field`);
          const targetId = isFrom ? relationship.to.sourceId : relationship.from.sourceId;
          const target = value.project.sources.find((item) => item.id === targetId)!;
          for (const field of target.fields) {
            const projectedId = `${step.as}.${field.id}`;
            if (fields.has(projectedId)) throw new Error(`Step ${step.id} projects a duplicate field id: ${projectedId}`);
            fields.set(projectedId, { sourceId: targetId, fieldId: field.id });
          }
        } else if (step.kind === "calculate") {
          if (typeof step.fieldId !== "string" || typeof step.label !== "string" || typeof step.expression !== "string") throw new Error(`Calculation ${step.id} has invalid fields`);
          const expression = parseExpression(step.expression);
          for (const field of expression.dependencies) if (!input.has(field)) throw new Error(`Calculation ${step.id} references missing field ${field}`);
          if (fields.has(step.fieldId)) throw new Error(`Calculation ${step.id} replaces existing field ${step.fieldId}`);
          fields.set(step.fieldId, {});
        } else if (step.kind === "filter") {
          if (!["eq", "neq", "gt", "gte", "lt", "lte", "is-null", "is-not-null"].includes(step.operator)) throw new Error(`Filter ${step.id} has an unsupported operator`);
          if (!input.has(step.fieldId)) throw new Error(`Filter ${step.id} references missing field ${step.fieldId}`);
          if (step.parameterId && (!value.project.parameters?.some((parameter) => parameter.id === step.parameterId) || step.value !== undefined)) throw new Error(`Filter ${step.id} has an invalid parameter reference`);
        } else {
          if (!Array.isArray(step.groupBy) || !Array.isArray(step.measures)) throw new Error(`Aggregate ${step.id} has invalid fields`);
          if (new Set(step.groupBy).size !== step.groupBy.length) throw new Error(`Aggregate ${step.id} repeats a group field`);
          for (const field of [...step.groupBy, ...step.measures.flatMap((measure) => [measure.fieldId, measure.entityFieldId].filter((item): item is string => !!item))]) {
            if (!input.has(field)) throw new Error(`Aggregate ${step.id} references missing field ${field}`);
          }
          for (const measure of step.measures) {
            if (typeof measure.id !== "string" || typeof measure.label !== "string" || !["count", "sum", "average"].includes(measure.operation) || measure.operation !== "count" && !measure.fieldId) throw new Error(`Aggregate ${step.id} has an unsupported measure`);
          }
          const grouped = new Map<string, { sourceId?: string; fieldId?: string }>();
          step.groupBy.forEach((field) => grouped.set(field, input.get(field)!));
          for (const measure of step.measures) {
            if (grouped.has(measure.id)) throw new Error(`Aggregate ${step.id} duplicates output field ${measure.id}`);
            grouped.set(measure.id, {});
          }
          frames.set(id, grouped);
          return grouped;
        }
      }
      frames.set(id, fields);
      return fields;
    };
    for (const step of query.steps) fieldsAt(step.id);
    for (const step of query.steps) {
      if (!isRecord(step) || !["source", "lookup", "expand", "calculate", "filter", "aggregate"].includes(step.kind)) throw new Error(`Step ${isRecord(step) ? String(step.id) : ""} has an unsupported operation`);
      if (step.kind !== "source" && !ids.has(step.inputStepId)) throw new Error(`Step ${step.id} references a missing input`);
      if (step.kind === "source" && !sourceIds.has(step.sourceId)) throw new Error(`Step ${step.id} references a missing source`);
      if ((step.kind === "lookup" || step.kind === "expand") && !relationshipIds.has(step.relationshipId)) throw new Error(`Step ${step.id} references a missing relationship`);
    }
  }
  for (const parameter of value.project.parameters ?? []) {
    if (typeof parameter.name !== "string" || !["string", "number", "boolean", "date"].includes(parameter.type) || parameter.required !== undefined && typeof parameter.required !== "boolean") throw new Error(`Parameter ${parameter.id} has invalid metadata`);
  }
  for (const view of value.views) {
    if (typeof view.name !== "string" || typeof view.queryId !== "string" || view.bindings !== undefined && !isRecord(view.bindings)) throw new Error(`View ${view.id} has invalid metadata`);
    if (!value.project.queries.some((query) => query.id === view.queryId)) throw new Error(`View ${view.id} references a missing query`);
    for (const [parameterId, binding] of Object.entries(view.bindings ?? {})) {
      const parameter = value.project.parameters?.find((item) => item.id === parameterId);
      if (!parameter) throw new Error(`View ${view.id} references a missing parameter`);
      const valid = parameter.type === "date" ? typeof binding === "string" && Number.isFinite(Date.parse(binding)) : parameter.type === "number" ? typeof binding === "number" && Number.isFinite(binding) : typeof binding === parameter.type;
      if (!valid) throw new Error(`View ${view.id} has an invalid binding for ${parameterId}`);
    }
  }
}
