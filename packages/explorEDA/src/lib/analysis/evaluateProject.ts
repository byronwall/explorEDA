import { Calculator } from "@/lib/calculations/engine/Calculator";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { numericExclusionReason } from "@/lib/numeric";
import type {
  AnalysisDiagnostic,
  AnalysisEvaluation,
  AnalysisField,
  AnalysisProject,
  AnalysisQuery,
  AnalysisResultRow,
  AnalysisScalar,
  AnalysisSourceReference,
  AnalysisSourceRow,
  AnalysisStage,
  AnalysisStep,
  AggregateStep,
  CalculateStep,
  FilterStep,
  LookupStep,
  RelationshipDefinition,
  SourceStep,
} from "@/types/AnalysisProject";

type Frame = { rows: AnalysisResultRow[]; fields: AnalysisField[] };

const stable = (value: AnalysisScalar) => `${typeof value}:${String(value)}`;
const rowKey = (sourceId: string, key: AnalysisScalar, index: number) =>
  key == null ? `${sourceId}:row:${index}` : `${sourceId}:${stable(key)}`;

function sourceFrame(
  step: SourceStep,
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  diagnostics: AnalysisDiagnostic[]
): Frame {
  const source = project.sources.find((item) => item.id === step.sourceId);
  const table = tables[step.sourceId];
  if (!source || !table) {
    diagnostics.push({ code: "missing-source", message: `Source ${step.sourceId} is unavailable`, stepId: step.id, sourceId: step.sourceId });
    return { rows: [], fields: [] };
  }
  const refs = sourceReferences(source, table, step.id, diagnostics);
  const rows = table.map((data, index) => {
    const values = Object.fromEntries(source.fields.map((field) => [`${source.id}.${field.id}`, data[field.id]]));
    const ref = refs[index]!;
    return { key: ref.rowKey, values, data: values, sourceRows: [ref], contributors: [ref] };
  });
  return { rows, fields: source.fields.map((field) => ({ id: `${source.id}.${field.id}`, name: field.name, type: field.type, origin: { sourceId: source.id, fieldId: field.id } })) };
}

function sourceReferences(source: AnalysisProject["sources"][number], table: readonly AnalysisSourceRow[], stepId?: string, diagnostics?: AnalysisDiagnostic[]) {
  const counts = new Map<string, number>();
  const keys = table.map((row) => row[source.entityKey]);
  for (const key of keys) {
    if (key == null || !(typeof key === "string" || typeof key === "number" || typeof key === "boolean")) continue;
    const token = stable(key);
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }
  return keys.map((entityKey, index) => {
    const valid = entityKey != null && (typeof entityKey === "string" || typeof entityKey === "number" || typeof entityKey === "boolean");
    const duplicate = valid && counts.get(stable(entityKey))! > 1;
    if (!valid) diagnostics?.push({ code: "missing-key", message: `Missing entity key ${source.entityKey}`, stepId, sourceId: source.id, rowKey: `${source.id}:row:${index}`, fieldId: source.entityKey });
    if (duplicate) diagnostics?.push({ code: "duplicate-key", message: `Duplicate entity key ${String(entityKey)}`, stepId, sourceId: source.id, rowKey: `${source.id}:row:${index}`, fieldId: source.entityKey, value: entityKey });
    return { sourceId: source.id, rowKey: valid && !duplicate ? rowKey(source.id, entityKey, index) : `${source.id}:row:${index}`, entityKey: valid && !duplicate ? entityKey : undefined } satisfies AnalysisSourceReference;
  });
}

function relationshipSide(
  relationship: RelationshipDefinition,
  fields: AnalysisField[],
  inputFieldId?: string
) {
  const fromId = `${relationship.from.sourceId}.${relationship.from.fieldId}`;
  const toId = `${relationship.to.sourceId}.${relationship.to.fieldId}`;
  const selected = inputFieldId ? fields.find((field) => field.id === inputFieldId) : undefined;
  const inputField = selected ?? fields.find((field) => field.id === fromId) ?? fields.find((field) => field.id === toId);
  const origin = inputField?.origin;
  const isFrom = (!!origin && "sourceId" in origin && origin.sourceId === relationship.from.sourceId && origin.fieldId === relationship.from.fieldId) || inputField?.id === fromId;
  const isTo = (!!origin && "sourceId" in origin && origin.sourceId === relationship.to.sourceId && origin.fieldId === relationship.to.fieldId) || inputField?.id === toId;
  if (isFrom) return { inputId: inputField!.id, targetSourceId: relationship.to.sourceId, targetFieldId: relationship.to.fieldId };
  if (isTo) return { inputId: inputField!.id, targetSourceId: relationship.from.sourceId, targetFieldId: relationship.from.fieldId };
  throw new Error(`Relationship ${relationship.id} has no matching input field in this frame`);
}

function lookupFrame(
  step: Pick<LookupStep, "id" | "relationshipId" | "inputFieldId" | "as">,
  input: Frame,
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  diagnostics: AnalysisDiagnostic[]
): Frame {
  const relationship = project.relationships.find((item) => item.id === step.relationshipId);
  if (!relationship) throw new Error(`Unknown relationship ${step.relationshipId}`);
  const side = relationshipSide(relationship, input.fields, step.inputFieldId);
  const source = project.sources.find((item) => item.id === side.targetSourceId);
  const table = tables[side.targetSourceId];
  if (!source || !table) {
    diagnostics.push({ code: "missing-source", message: `Source ${side.targetSourceId} is unavailable`, stepId: step.id, sourceId: side.targetSourceId });
    const missingFields = source?.fields.map((field) => ({ id: `${step.as}.${field.id}`, name: field.name, type: field.type, origin: { sourceId: side.targetSourceId, fieldId: field.id } as const })) ?? [];
    return { rows: input.rows.map((row) => {
      const values = { ...row.values, ...Object.fromEntries(missingFields.map((field) => [field.id, undefined])) };
      return { ...row, values, data: values };
    }), fields: [...input.fields, ...missingFields] };
  }
  const index = new Map<AnalysisScalar, AnalysisSourceRow[]>();
  const referenceByRow = new Map<AnalysisSourceRow, AnalysisSourceReference>();
  const targetRefs = sourceReferences(source, table, step.id, diagnostics);
  table.forEach((target, rowIndex) => referenceByRow.set(target, targetRefs[rowIndex]!));
  for (const [targetIndex, target] of table.entries()) {
    const key = target[side.targetFieldId];
    if (key == null || Number.isNaN(key)) {
      diagnostics.push({ code: "missing-key", message: `Missing relationship key ${side.targetFieldId}`, stepId: step.id, sourceId: source.id, rowKey: `${source.id}:row:${targetIndex}`, fieldId: side.targetFieldId });
      continue;
    }
    const matches = index.get(key);
    if (matches) matches.push(target);
    else index.set(key, [target]);
  }
  const rows = input.rows.map((row) => {
    const key = row.values[side.inputId];
    const matches = key == null || Number.isNaN(key) ? [] : (index.get(key) ?? []);
    const selected = matches.length === 1 ? matches[0] : undefined;
    if (matches.length > 1) diagnostics.push({ code: "ambiguous-lookup", message: `Lookup matched ${matches.length} rows`, stepId: step.id, rowKey: row.key, fieldId: side.inputId, value: key });
    else if (matches.length === 0) diagnostics.push({ code: "missing-lookup", message: "Lookup found no matching row", stepId: step.id, rowKey: row.key, fieldId: side.inputId, value: key });
    const values = { ...row.values };
    for (const field of source.fields) values[`${step.as}.${field.id}`] = selected?.[field.id];
    const refs = matches.map((match) => referenceByRow.get(match)!);
    return { ...row, values, data: values, sourceRows: selected ? [...row.sourceRows, refs[0]!] : row.sourceRows, contributors: refs.length ? [...row.contributors, ...refs] : row.contributors };
  });
  return { rows, fields: [...input.fields, ...source.fields.map((field) => ({ id: `${step.as}.${field.id}`, name: field.name, type: field.type, origin: { sourceId: source.id, fieldId: field.id } }))] };
}

function expandedFrame(
  step: Pick<LookupStep, "id" | "relationshipId" | "inputFieldId" | "as"> & { keepUnmatched?: boolean },
  input: Frame,
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  diagnostics: AnalysisDiagnostic[]
): Frame {
  const relationship = project.relationships.find((item) => item.id === step.relationshipId);
  if (!relationship) throw new Error(`Unknown relationship ${step.relationshipId}`);
  const side = relationshipSide(relationship, input.fields, step.inputFieldId);
  const source = project.sources.find((item) => item.id === side.targetSourceId);
  const table = tables[side.targetSourceId];
  if (!source || !table) throw new Error(`Source ${side.targetSourceId} is unavailable`);
  const index = new Map<AnalysisScalar, AnalysisSourceRow[]>();
  const targetRefs = sourceReferences(source, table, step.id, diagnostics);
  const referenceByRow = new Map<AnalysisSourceRow, AnalysisSourceReference>();
  table.forEach((target, rowIndex) => referenceByRow.set(target, targetRefs[rowIndex]!));
  table.forEach((target, targetIndex) => {
    const key = target[side.targetFieldId];
    if (key == null || Number.isNaN(key)) {
      diagnostics.push({ code: "missing-key", message: `Missing relationship key ${side.targetFieldId}`, stepId: step.id, sourceId: source.id, rowKey: `${source.id}:row:${targetIndex}`, fieldId: side.targetFieldId });
      return;
    }
    const matches = index.get(key);
    if (matches) matches.push(target);
    else index.set(key, [target]);
  });
  const rows = input.rows.flatMap((row) => {
    const key = row.values[side.inputId];
    const matches = key == null || Number.isNaN(key) ? [] : (index.get(key) ?? []);
    if (matches.length === 0) {
      diagnostics.push({ code: "missing-lookup", message: "Expansion found no matching row", stepId: step.id, rowKey: row.key, fieldId: side.inputId, value: key });
      if (step.keepUnmatched) {
        const values = { ...row.values, ...Object.fromEntries(source.fields.map((field) => [`${step.as}.${field.id}`, undefined])) };
        return [{ ...row, key: `${step.id}:unmatched:${row.key}`, values, data: values }];
      }
      return [];
    }
    return matches.map((target) => {
      const values = { ...row.values };
      for (const field of source.fields) values[`${step.as}.${field.id}`] = target[field.id];
      const ref = referenceByRow.get(target)!;
      return { ...row, key: `${step.id}:${row.key}:${ref.rowKey}`, values, data: values, sourceRows: [...row.sourceRows, ref], contributors: [...row.contributors, ref] };
    });
  });
  return { rows, fields: [...input.fields, ...source.fields.map((field) => ({ id: `${step.as}.${field.id}`, name: field.name, type: field.type, origin: { sourceId: source.id, fieldId: field.id } }))] };
}

function calculateFrame(step: CalculateStep, input: Frame, diagnostics: AnalysisDiagnostic[]): Frame {
  const expression = parseExpression(step.expression);
  const rows = input.rows.map((row) => {
    const result = new Calculator({ data: [row.values], variables: new Map(Object.entries(row.values)) }).evaluate(expression);
    if (!result.success) diagnostics.push({ code: "calculation-error", message: result.error ?? "Calculation failed", stepId: step.id, rowKey: row.key, fieldId: step.fieldId });
    const calculated = result.value instanceof Date ? result.value.toISOString() : result.value;
    const values = { ...row.values, [step.fieldId]: result.success ? calculated : undefined };
    return { ...row, values, data: values };
  });
  return { rows, fields: [...input.fields.filter((field) => field.id !== step.fieldId), { id: step.fieldId, name: step.label, origin: { stepId: step.id } }] };
}

function filterFrame(step: FilterStep, input: Frame, bindings: Record<string, AnalysisScalar>, diagnostics: AnalysisDiagnostic[], blockedParameters: Set<string>): Frame {
  const value = step.parameterId ? bindings[step.parameterId] : step.value;
  if (step.parameterId && (value === undefined || blockedParameters.has(step.parameterId))) {
    diagnostics.push({ code: "missing-parameter", message: `Parameter ${step.parameterId} is not bound`, stepId: step.id, fieldId: step.fieldId });
    return { rows: [], fields: input.fields };
  }
  const rows = input.rows.filter((row) => {
    const left = row.values[step.fieldId];
    switch (step.operator) {
      case "eq": return left === value && left != null;
      case "neq": return left !== value;
      case "gt": return (typeof left === "number" && typeof value === "number" || typeof left === "string" && typeof value === "string") && left > value;
      case "gte": return (typeof left === "number" && typeof value === "number" || typeof left === "string" && typeof value === "string") && left >= value;
      case "lt": return (typeof left === "number" && typeof value === "number" || typeof left === "string" && typeof value === "string") && left < value;
      case "lte": return (typeof left === "number" && typeof value === "number" || typeof left === "string" && typeof value === "string") && left <= value;
      case "is-null": return left == null;
      case "is-not-null": return left != null;
    }
  });
  return { rows, fields: input.fields };
}

function aggregateFrame(step: AggregateStep, input: Frame, diagnostics: AnalysisDiagnostic[]): Frame {
  const groups = new Map<string, AnalysisResultRow[]>();
  for (const row of input.rows) {
    const key = JSON.stringify(step.groupBy.map((field) => [typeof row.values[field], row.values[field]]));
    const group = groups.get(key);
    if (group) group.push(row);
    else groups.set(key, [row]);
  }
  if (step.groupBy.length === 0 && groups.size === 0) groups.set("[]", []);
  const fields: AnalysisField[] = step.groupBy.map((id) => input.fields.find((field) => field.id === id) ?? { id, name: id, origin: { stepId: step.id } });
  for (const measure of step.measures) fields.push({ id: measure.id, name: measure.label, origin: { stepId: step.id } });
  const rows = Array.from(groups, ([key, group]) => {
    const values: Record<string, AnalysisScalar> = {};
    for (const id of step.groupBy) values[id] = group[0]?.values[id];
    const measureContributors: NonNullable<AnalysisResultRow["measureContributors"]> = {};
    for (const measure of step.measures) {
      let candidates = group;
      let conflictingEntity = false;
      if (measure.entityFieldId) {
        const entityField = input.fields.find((field) => field.id === measure.entityFieldId);
        const entitySourceId = entityField?.origin && "sourceId" in entityField.origin ? entityField.origin.sourceId : undefined;
        const byEntity = new Map<string, AnalysisResultRow[]>();
        for (const row of group) {
          const entity = row.values[measure.entityFieldId];
          const entityRef = entitySourceId ? row.sourceRows.find((ref) => ref.sourceId === entitySourceId) : undefined;
          const identity = entityRef ? `${entityRef.sourceId}:${entityRef.rowKey}` : entity == null ? `row:${row.key}` : stable(entity);
          const rows = byEntity.get(identity);
          if (rows) rows.push(row);
          else byEntity.set(identity, [row]);
        }
        candidates = [];
        for (const [identity, entityRows] of byEntity) {
          const distinctValues = new Set(entityRows.map((row) => stable(row.values[measure.fieldId ?? ""])));
          if (distinctValues.size > 1) {
            conflictingEntity = true;
            diagnostics.push({ code: "conflicting-entity-measure", message: `Entity ${identity} has conflicting values for ${measure.label}`, stepId: step.id, fieldId: measure.fieldId });
            continue;
          }
          candidates.push(entityRows[0]!);
        }
      }
      const measureRows = measure.operation === "count" && !measure.fieldId
        ? candidates
        : candidates.filter((row) => measure.fieldId && row.values[measure.fieldId] != null);
      if (measure.operation === "count") values[measure.id] = measureRows.length;
      else {
        const numeric = measureRows.map((row) => ({ row, value: row.values[measure.fieldId!] })).filter(({ value }) => !numericExclusionReason(value));
        if (!numeric.length || conflictingEntity) values[measure.id] = undefined;
        else {
          const total = numeric.reduce<number>((sum, item) => sum + Number(item.value), 0);
          values[measure.id] = measure.operation === "sum" ? total : total / numeric.length;
        }
        measureContributors[measure.id] = candidates.map((row) => {
          const value = row.values[measure.fieldId!];
          const reason = numericExclusionReason(value);
          return { rowKey: row.key, input: value, sourceRows: row.sourceRows, included: !reason, exclusionReason: reason };
        });
      }
    }
    const refs = uniqueRefs(group.flatMap((row) => row.contributors));
    return { key: `${step.id}:${key}`, values, data: values, sourceRows: uniqueRefs(group.flatMap((row) => row.sourceRows)), contributors: refs, measureContributors };
  });
  return { rows, fields };
}

function uniqueRefs(refs: AnalysisSourceReference[]) {
  const unique = new Map(refs.map((ref) => [`${ref.sourceId}:${ref.rowKey}`, ref]));
  return [...unique.values()];
}

function canonical(value: unknown): string {
  if (value instanceof Date) return JSON.stringify(value.toISOString());
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value) ?? "undefined";
}

function fingerprint(value: unknown): string {
  const input = canonical(value);
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  for (let index = 0; index < input.length; index++) {
    const code = input.charCodeAt(index);
    first = Math.imul(first ^ code, 0x01000193);
    second = Math.imul(second ^ code, 0x85ebca6b);
  }
  return `${(first >>> 0).toString(36)}${(second >>> 0).toString(36)}`;
}

function validateQuery(project: AnalysisProject, query: AnalysisQuery) {
  const ids = new Set<string>();
  const steps = new Map(query.steps.map((step) => [step.id, step]));
  for (const step of query.steps) {
    if (!step.id || ids.has(step.id)) throw new Error(`Duplicate or empty step id: ${step.id}`);
    ids.add(step.id);
  }
  if (!steps.has(query.outputStepId)) throw new Error(`Unknown output step ${query.outputStepId}`);
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (id: string): AnalysisStep => {
    const step = steps.get(id);
    if (!step) throw new Error(`Unknown input step ${id}`);
    if (visiting.has(id)) throw new Error(`Query contains a cycle at ${id}`);
    if (visited.has(id)) return step;
    visiting.add(id);
    if (step.kind !== "source") visit(step.inputStepId);
    visiting.delete(id);
    visited.add(id);
    return step;
  };
  visit(query.outputStepId);
  for (const step of query.steps) if (step.kind === "source" && !project.sources.some((source) => source.id === step.sourceId)) throw new Error(`Unknown source ${step.sourceId}`);
  return { steps, visit };
}

export function evaluateAnalysisQuery(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  queryId: string,
  bindings: Record<string, AnalysisScalar> = {}
): AnalysisEvaluation {
  const query = project.queries.find((item) => item.id === queryId);
  if (!query) throw new Error(`Unknown query ${queryId}`);
  const { steps, visit } = validateQuery(project, query);
  const diagnostics: AnalysisDiagnostic[] = [];
  const blockedParameters = new Set<string>();
  for (const step of query.steps) {
    if (step.kind !== "filter" || !step.parameterId) continue;
    const parameter = project.parameters?.find((item) => item.id === step.parameterId);
    if (!parameter) {
      blockedParameters.add(step.parameterId);
      diagnostics.push({ code: "invalid-query", message: `Unknown parameter ${step.parameterId}`, stepId: step.id, fieldId: step.fieldId });
      continue;
    }
    const value = bindings[step.parameterId];
    if (value === undefined) continue;
    const valid = parameter.type === "date"
      ? typeof value === "string" && Number.isFinite(Date.parse(value))
      : parameter.type === "number" ? typeof value === "number" && Number.isFinite(value)
        : typeof value === parameter.type;
    if (!valid) {
      blockedParameters.add(parameter.id);
      diagnostics.push({ code: "invalid-query", message: `Parameter ${parameter.name} has an invalid value`, stepId: step.id, fieldId: step.fieldId, value });
    }
  }
  const cache = new Map<string, Frame>();
  const stagesById = new Map<string, AnalysisStage>();
  const evaluate = (id: string): Frame => {
    const cached = cache.get(id);
    if (cached) return cached;
    const step = visit(id);
    const input = step.kind === "source" ? undefined : evaluate(step.inputStepId);
    let result: Frame;
    switch (step.kind) {
      case "source": result = sourceFrame(step, project, tables, diagnostics); break;
      case "lookup": result = lookupFrame(step, input!, project, tables, diagnostics); break;
      case "expand": result = expandedFrame(step, input!, project, tables, diagnostics); break;
      case "calculate": result = calculateFrame(step, input!, diagnostics); break;
      case "filter": result = filterFrame(step, input!, bindings, diagnostics, blockedParameters); break;
      case "aggregate": result = aggregateFrame(step, input!, diagnostics); break;
    }
    const inputCount = input?.rows.length ?? result.rows.length;
    const previousUnit = step.kind === "source" ? step.sourceId : stagesById.get(step.inputStepId)?.rowUnit ?? "rows";
    const rowUnit = step.kind === "expand" ? step.as : step.kind === "aggregate" ? (step.groupBy.join(", ") || "summary") : previousUnit;
    const condition = step.kind === "filter" ? `${step.fieldId} ${step.operator} ${step.parameterId ? `$${step.parameterId}` : JSON.stringify(step.value)}` : step.kind === "calculate" ? `${step.fieldId} = ${step.expression}` : undefined;
    const aggregateExclusions = result.rows.reduce((count, row) => count + Object.values(row.measureContributors ?? {}).flat().filter((item) => !item.included).length, 0);
    const excludedCount = step.kind === "filter" ? Math.max(0, inputCount - result.rows.length) : step.kind === "aggregate" ? aggregateExclusions : 0;
    stagesById.set(id, { stepId: id, kind: step.kind, inputCount, outputCount: result.rows.length, excludedCount, rowUnit, condition, fields: result.fields, rows: result.rows });
    cache.set(id, result);
    return result;
  };
  const output = evaluate(query.outputStepId);
  const stages = query.steps.map((step) => stagesById.get(step.id)).filter((stage): stage is AnalysisStage => !!stage);
  const stepIds = new Set(stages.map((stage) => stage.stepId));
  const sourceIds = new Set(query.steps.filter((step) => stepIds.has(step.id) && step.kind === "source").map((step) => step.kind === "source" ? step.sourceId : ""));
  const relationshipIds = new Set(query.steps.filter((step) => stepIds.has(step.id) && (step.kind === "lookup" || step.kind === "expand")).map((step) => step.kind === "lookup" || step.kind === "expand" ? step.relationshipId : ""));
  project.relationships.filter((item) => relationshipIds.has(item.id)).forEach((item) => { sourceIds.add(item.from.sourceId); sourceIds.add(item.to.sourceId); });
  const parameterIds = query.steps.filter((step) => step.kind === "filter" && step.parameterId).map((step) => step.kind === "filter" ? step.parameterId : undefined);
  const revision = `${project.id}:${query.id}:${fingerprint({ query, relationships: project.relationships.filter((item) => relationshipIds.has(item.id)), sources: project.sources.filter((source) => sourceIds.has(source.id)).map((source) => [source, tables[source.id]]), parameters: project.parameters?.filter((parameter) => parameterIds.includes(parameter.id)), bindings })}`;
  return { queryId, revision, fields: output.fields, rows: output.rows, stages, diagnostics, counts: { source: stages[0]?.inputCount ?? 0, output: output.rows.length, available: output.rows.length, excluded: stages.at(-1)?.excludedCount ?? 0 } };
}
