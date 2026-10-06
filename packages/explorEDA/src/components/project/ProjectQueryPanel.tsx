import { useEffect, useState } from "react";
import { ExternalLink, Play, Rows3 } from "lucide-react";
import type {
  AnalysisEvaluation,
  AnalysisProject,
  AnalysisQuery,
  AnalysisResultRow,
  AnalysisScalar,
  AnalysisSourceRow,
  RelationshipDefinition,
  AnalysisStep,
  AnalysisView,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActionTooltip } from "@/components/ui/tooltip";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import { FieldMetadata } from "@/components/FieldMetadata";
import { incompatibleSettingsFields } from "./settingsCompatibility";
import { matchingSourceRows, resolveSourceRow } from "./sourceRowIdentity";
import { validParameterValues } from "./parameterBindings";
import { QueryRendererEvidence } from "./QueryRendererEvidence";
import type {
  QueryChartFilterScope,
  QueryFlowTraceHandoff,
} from "../AnalysisChartContext";

type Tables = Record<string, readonly AnalysisSourceRow[]>;

function stageLabel(step: AnalysisStep, project: AnalysisProject) {
  switch (step.kind) {
    case "source":
      return `Read ${project.sources.find((source) => source.id === step.sourceId)?.name ?? step.sourceId}`;
    case "lookup":
      return `Add ${step.as}`;
    case "expand":
      return `Expand ${step.as}`;
    case "calculate":
      return step.label;
    case "filter":
      return `Filter ${step.fieldId}`;
    case "aggregate":
      return "Group and summarize";
  }
}

function stageDescription(step: AnalysisStep, project: AnalysisProject) {
  switch (step.kind) {
    case "source":
      return `Source · ${project.sources.find((source) => source.id === step.sourceId)?.name ?? step.sourceId}`;
    case "lookup":
    case "expand": {
      const link = project.relationships.find(
        (item) => item.id === step.relationshipId
      );
      return `${step.kind === "lookup" ? "Lookup" : "Expand"} · ${link?.name ?? "Unresolved relationship"}`;
    }
    case "calculate":
      return `Calculate · ${step.expression}`;
    case "filter":
      return `Condition · ${step.fieldId} ${step.operator} ${step.parameterId ? `parameter ${step.parameterId}` : String(step.value ?? "")}`;
    case "aggregate":
      return `Aggregate · ${step.groupBy.length} group fields, ${step.measures.length} measures`;
  }
}

function nextGlyph(project: AnalysisProject, fallback: string) {
  const glyphs = ["◆", "◇", "●", "▦", "◈", "⬡", "▣", "◉"];
  const used = new Set(project.queries.map((item) => item.glyph));
  return glyphs.find((glyph) => !used.has(glyph)) ?? fallback;
}

function queryForStage(
  query: AnalysisQuery,
  stepId: string,
  project: AnalysisProject
): AnalysisQuery {
  const steps = new Map(query.steps.map((step) => [step.id, step]));
  const used = new Set<string>();
  const visit = (id: string) => {
    if (used.has(id)) return;
    const step = steps.get(id);
    if (!step) return;
    used.add(id);
    if (step.kind !== "source") visit(step.inputStepId);
  };
  visit(stepId);
  return {
    ...query,
    id: newId(`${query.id}-stage`),
    name: `${query.name} · ${steps.get(stepId)?.kind ?? "step"}`,
    glyph: nextGlyph(project, query.glyph),
    steps: query.steps.filter((step) => used.has(step.id)),
    outputStepId: stepId,
  };
}

function newId(prefix: string) {
  return `${prefix}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
}

function copyQuery(query: AnalysisQuery, project: AnalysisProject) {
  const id = newId(`${query.id}-copy`);
  const stepIds = new Map(
    query.steps.map((step) => [step.id, newId(`${step.id}-copy`)])
  );
  const glyph = nextGlyph(project, query.glyph);
  return {
    ...query,
    id,
    name: `Copy of ${query.name}`,
    glyph,
    steps: query.steps.map((step) => ({
      ...step,
      id: stepIds.get(step.id)!,
      ...(step.kind === "source"
        ? {}
        : { inputStepId: stepIds.get(step.inputStepId)! }),
    })),
    outputStepId: stepIds.get(query.outputStepId)!,
  };
}

function relationshipDirection(
  relationship: RelationshipDefinition,
  fields: AnalysisEvaluation["fields"]
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
  const toField = matches(relationship.to.sourceId, relationship.to.fieldId);
  if (fromField)
    return {
      inputField: fromField,
      targetSourceId: relationship.to.sourceId,
      targetFieldId: relationship.to.fieldId,
      side: "from" as const,
    };
  if (toField)
    return {
      inputField: toField,
      targetSourceId: relationship.from.sourceId,
      targetFieldId: relationship.from.fieldId,
      side: "to" as const,
    };
  return undefined;
}

function relatedRows(
  project: AnalysisProject,
  tables: Tables,
  row: AnalysisResultRow
): {
  refs: Array<AnalysisResultRow["sourceRows"][number]>;
  issues: string[];
} {
  const issues = new Set<string>();
  const refs = new Map<
    string,
    {
      sourceId: string;
      rowKey: string;
      entityKey?: AnalysisScalar;
      depth: number;
    }
  >();
  const queue: Array<{
    sourceId: string;
    rowKey: string;
    entityKey?: AnalysisScalar;
    depth: number;
  }> = [];
  for (const ref of row.contributors.length
    ? row.contributors
    : row.sourceRows) {
    const item = { ...ref, depth: 0 };
    refs.set(`${item.sourceId}:${item.rowKey}`, item);
    queue.push(item);
  }
  while (queue.length) {
    const current = queue.shift()!;
    if (current.depth >= 2) continue;
    const source = project.sources.find((item) => item.id === current.sourceId);
    if (!source) {
      issues.add(`Source ${current.sourceId} is unavailable.`);
      continue;
    }
    const resolution = resolveSourceRow(
      source,
      tables[current.sourceId] ?? [],
      current
    );
    const values = resolution.row;
    if (resolution.issue) {
      issues.add(
        `${source.name} has an ${resolution.issue} source-row reference.`
      );
    }
    if (!values) continue;
    for (const relationship of project.relationships) {
      const forward = relationship.from.sourceId === source.id;
      const reverse = relationship.to.sourceId === source.id;
      if (!forward && !reverse) continue;
      const expandsChildren =
        (relationship.cardinality === "one-to-many" && forward) ||
        (relationship.cardinality === "many-to-one" && reverse);
      if (!expandsChildren) continue;
      const inputField = forward
        ? relationship.from.fieldId
        : relationship.to.fieldId;
      const targetSourceId = forward
        ? relationship.to.sourceId
        : relationship.from.sourceId;
      const targetField = forward
        ? relationship.to.fieldId
        : relationship.from.fieldId;
      const key = values[inputField];
      if (key == null) continue;
      const target = project.sources.find((item) => item.id === targetSourceId);
      if (!target) continue;
      const matched = matchingSourceRows(
        target,
        tables[targetSourceId] ?? [],
        targetField,
        key
      );
      for (const { ref, issue } of matched) {
        if (issue) {
          issues.add(
            `${target.name} has ${issue === "duplicate-key" ? "duplicate" : "missing"} entity keys among related rows.`
          );
        }
        const rowKey = ref.rowKey;
        const identity = `${targetSourceId}:${rowKey}`;
        if (refs.has(identity)) continue;
        const item = {
          sourceId: targetSourceId,
          rowKey,
          entityKey: ref.entityKey,
          depth: current.depth + 1,
        };
        refs.set(identity, item);
        queue.push(item);
      }
    }
  }
  return { refs: [...refs.values()], issues: [...issues] };
}

export function ProjectQueryPanel({
  project,
  view,
  tables,
  evaluation,
  incompatibleFields,
  unresolvedRowKeys = 0,
  queryRevision,
  traceHandoff,
  traceRevisions,
  resultRowsById,
  chartFilterScopes,
  queryPresets,
  readOnly,
  onChange,
  onOpenView,
}: {
  project: AnalysisProject;
  view: AnalysisView;
  tables: Tables;
  evaluation: AnalysisEvaluation;
  incompatibleFields: string[];
  unresolvedRowKeys?: number;
  queryRevision: string;
  traceHandoff?: QueryFlowTraceHandoff;
  traceRevisions: Record<string, string>;
  resultRowsById: Record<number, AnalysisResultRow>;
  chartFilterScopes: QueryChartFilterScope[];
  queryPresets?: Record<string, SavedDataStructure>;
  readOnly: boolean;
  onChange: (project: AnalysisProject, view: AnalysisView) => void;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
}) {
  const query = project.queries.find((item) => item.id === view.queryId);
  const [draftBindings, setDraftBindings] = useState<
    Record<string, AnalysisScalar>
  >(view.bindings ?? {});
  const [showAllRows, setShowAllRows] = useState(false);
  const [relationshipId, setRelationshipId] = useState("");
  const [relationshipMode, setRelationshipMode] = useState<
    "lookup" | "aggregate" | "expand"
  >("lookup");
  const [aggregateOperation, setAggregateOperation] = useState<
    "count" | "sum" | "average"
  >("count");
  const [aggregateFieldId, setAggregateFieldId] = useState("");
  const [replacementIds, setReplacementIds] = useState<Record<string, string>>(
    {}
  );
  const missingStepId =
    view.inspection?.stepId &&
    !evaluation.stages.some((stage) => stage.stepId === view.inspection?.stepId)
      ? view.inspection.stepId
      : undefined;
  const currentStage = missingStepId
    ? undefined
    : view.inspection?.stepId
      ? evaluation.stages.find(
          (stage) => stage.stepId === view.inspection?.stepId
        )
      : evaluation.stages.at(-1);
  const flowSteps =
    view.inspection?.mode === "full"
      ? evaluation.stages.length
        ? evaluation.stages
            .map((stage) =>
              query?.steps.find((step) => step.id === stage.stepId)
            )
            .filter((step): step is AnalysisStep => !!step)
        : (query?.steps ?? [])
      : missingStepId
        ? []
        : (query?.steps.filter(
            (step) =>
              step.id === currentStage?.stepId || step.id === query.outputStepId
          ) ?? []);
  const selectedRow = currentStage?.rows.find(
    (row) => row.key === view.inspection?.rowKey
  );
  const stageFields = currentStage?.fields ?? evaluation.fields;
  const stageProfiles = buildFieldProfiles(
    currentStage?.rows.map((row) => row.values) ?? [],
    Object.fromEntries(
      stageFields.flatMap((field) =>
        field.type
          ? [
              [
                field.id,
                field.type === "number"
                  ? "numeric"
                  : field.type === "date"
                    ? "datetime"
                    : field.type === "boolean"
                      ? "boolean"
                      : "categorical",
              ],
            ]
          : []
      )
    ),
    stageFields.map((field) => field.id)
  );
  const usableRelationships = project.relationships.flatMap((relationship) => {
    const direction = relationshipDirection(
      relationship,
      currentStage?.fields ?? evaluation.fields
    );
    return direction ? [{ relationship, direction }] : [];
  });
  const selectedRelationship =
    usableRelationships.find(
      (item) => item.relationship.id === relationshipId
    ) ?? usableRelationships[0];
  const selectedRelationshipLookupAllowed =
    selectedRelationship &&
    (selectedRelationship.relationship.cardinality === "one-to-one" ||
      (selectedRelationship.relationship.cardinality === "many-to-one" &&
        selectedRelationship.direction.side === "from") ||
      (selectedRelationship.relationship.cardinality === "one-to-many" &&
        selectedRelationship.direction.side === "to"));
  const usedParameterIds = new Set(
    query?.steps.flatMap((step) =>
      step.kind === "filter" && step.parameterId ? [step.parameterId] : []
    ) ?? []
  );
  const hasParameters = (project.parameters ?? []).some((parameter) =>
    usedParameterIds.has(parameter.id)
  );

  useEffect(
    () => setDraftBindings(view.bindings ?? {}),
    [view.id, view.bindings]
  );

  function changeView(next: AnalysisView) {
    onChange(project, next);
  }
  function selectQuery(queryId: string) {
    changeView({
      ...view,
      queryId,
      inspection: { mode: view.inspection?.mode ?? "summary" },
      selectedRowKeys: [],
    });
  }
  function selectStep(stepId: string) {
    changeView({
      ...view,
      inspection: { ...view.inspection, stepId, rowKey: undefined },
    });
  }
  function showOutputStep() {
    if (query) selectStep(query.outputStepId);
  }
  function repairStep(stepId: string) {
    const relationshipId = replacementIds[stepId];
    if (!query || !relationshipId) return;
    const nextQuery = {
      ...query,
      steps: query.steps.map((step) =>
        step.id === stepId && (step.kind === "lookup" || step.kind === "expand")
          ? { ...step, relationshipId }
          : step
      ),
    };
    onChange(
      {
        ...project,
        queries: project.queries.map((item) =>
          item.id === query.id ? nextQuery : item
        ),
      },
      view
    );
  }
  function selectRow(rowKey: string | undefined) {
    changeView({
      ...view,
      inspection: { ...view.inspection, stepId: currentStage?.stepId, rowKey },
      selectedRowKeys: rowKey ? [rowKey] : [],
    });
  }
  function updateBinding(parameterId: string, value: AnalysisScalar) {
    const next = { ...draftBindings, [parameterId]: value };
    setDraftBindings(next);
    if (validParameterValues(project, next, usedParameterIds))
      changeView({ ...view, bindings: next });
  }
  function applyPreset() {
    const preset = queryPresets?.[view.queryId];
    if (preset) changeView({ ...view, settings: preset });
  }
  function openStage(stepId: string) {
    if (!query || !onOpenView) return;
    const nextQuery = queryForStage(query, stepId, project);
    const nextProject = {
      ...project,
      queries: [...project.queries, nextQuery],
    };
    const stageName = `${query.name} · ${query.steps.find((step) => step.id === stepId)?.kind ?? "step"}`;
    const nextView: AnalysisView = {
      id: `${view.id}-${nextQuery.id}`,
      name: stageName,
      queryId: nextQuery.id,
      bindings: view.bindings,
      settings: queryPresets?.[nextQuery.id] ?? view.settings,
    };
    onOpenView(nextView, stageName, nextProject);
  }

  function openCopy() {
    if (!query || !onOpenView) return;
    const nextQuery = copyQuery(query, project);
    const nextProject = {
      ...project,
      queries: [...project.queries, nextQuery],
    };
    const nextView: AnalysisView = {
      id: newId(`${view.id}-copy`),
      name: nextQuery.name,
      queryId: nextQuery.id,
      bindings: view.bindings,
      settings: view.settings,
    };
    onOpenView(nextView, nextView.name, nextProject);
  }

  function useRelationship() {
    if (!query || !selectedRelationship || readOnly) return;
    const { relationship, direction } = selectedRelationship;
    const target = project.sources.find(
      (source) => source.id === direction.targetSourceId
    );
    if (!target) return;
    const aggregateField =
      aggregateOperation === "count"
        ? target.entityKey
        : aggregateFieldId ||
          target.fields.find((field) => field.type === "number")?.id;
    if (relationshipMode === "aggregate" && !aggregateField) return;
    const baseAlias = target.id.replace(/[^a-zA-Z0-9_]/g, "_");
    const aliases = new Set(
      evaluation.fields
        .map((field) => field.id.split(".", 1)[0])
        .filter(Boolean)
    );
    let alias = baseAlias;
    for (let suffix = 2; aliases.has(alias); suffix += 1)
      alias = `${baseAlias}${suffix}`;
    const lookupAllowed =
      relationship.cardinality === "one-to-one" ||
      (relationship.cardinality === "many-to-one" &&
        direction.side === "from") ||
      (relationship.cardinality === "one-to-many" && direction.side === "to");
    const lookupId = newId("lookup");
    const expansionId = newId("expand");
    const lookupStep = {
      id: lookupId,
      kind: "lookup" as const,
      inputStepId: query.outputStepId,
      relationshipId: relationship.id,
      as: alias,
      inputFieldId: direction.inputField.id,
    };
    if (relationshipMode === "lookup") {
      if (!lookupAllowed) return;
      const nextQuery = {
        ...query,
        steps: [...query.steps, lookupStep],
        outputStepId: lookupId,
        frameLabel: query.frameLabel,
      };
      onChange(
        {
          ...project,
          queries: project.queries.map((item) =>
            item.id === query.id ? nextQuery : item
          ),
        },
        view
      );
      return;
    }
    const expansion = {
      id: expansionId,
      kind: "expand" as const,
      inputStepId: query.outputStepId,
      relationshipId: relationship.id,
      as: alias,
      inputFieldId: direction.inputField.id,
      ...(relationshipMode === "aggregate" ? { keepUnmatched: true } : {}),
    };
    if (relationshipMode === "aggregate") {
      const aggregateId = newId("aggregate");
      const groupBy = (
        evaluation.stages.find((stage) => stage.stepId === query.outputStepId)
          ?.fields ?? evaluation.fields
      ).map((field) => field.id);
      const measureId = newId(`${alias}-count`);
      const aggregateStep = {
        id: aggregateId,
        kind: "aggregate" as const,
        inputStepId: expansionId,
        groupBy,
        measures: [
          {
            id: measureId,
            label:
              aggregateOperation === "count"
                ? `Related ${target.name} rows`
                : `${aggregateOperation === "average" ? "Average" : "Sum"} ${target.fields.find((field) => field.id === aggregateField)?.name ?? aggregateField}`,
            operation: aggregateOperation,
            fieldId: `${alias}.${aggregateField}`,
          },
        ],
      };
      const nextQuery = {
        ...query,
        steps: [...query.steps, expansion, aggregateStep],
        outputStepId: aggregateId,
      };
      onChange(
        {
          ...project,
          queries: project.queries.map((item) =>
            item.id === query.id ? nextQuery : item
          ),
        },
        view
      );
      return;
    }
    if (!onOpenView) return;
    const expandedQuery = copyQuery(query, project);
    const mappedOutputStepId = expandedQuery.outputStepId;
    const expandedId = newId("expanded");
    const expandedStep = {
      id: expandedId,
      kind: "expand" as const,
      inputStepId: mappedOutputStepId,
      relationshipId: relationship.id,
      as: alias,
      inputFieldId: direction.inputField.id,
    };
    const nextQuery = {
      ...expandedQuery,
      name: `${query.name} with ${target.name}`,
      frameLabel: `${query.frameLabel} with ${target.name}`,
      steps: [...expandedQuery.steps, expandedStep],
      outputStepId: expandedId,
    };
    const nextProject = {
      ...project,
      queries: [...project.queries, nextQuery],
    };
    const nextView: AnalysisView = {
      id: newId(`${view.id}-expanded`),
      name: nextQuery.name,
      queryId: nextQuery.id,
      bindings: view.bindings,
    };
    onOpenView(nextView, nextView.name, nextProject);
  }

  function copyCurrentQuery() {
    if (!query || !onOpenView || readOnly) return;
    openCopy();
  }

  if (!query) {
    return (
      <div className="p-4 text-sm">
        <p className="font-medium">This view points to a missing query.</p>
        <p className="mt-1 text-muted-foreground">
          Choose another query to repair the view.
        </p>
        <QueryPicker
          project={project}
          value={view.queryId}
          onChange={selectQuery}
          disabled={readOnly}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 p-3 text-sm">
      <section className="space-y-2">
        <h3 className="font-medium">Query</h3>
        <QueryPicker
          project={project}
          value={view.queryId}
          onChange={selectQuery}
          disabled={readOnly}
        />
        <div className="flex items-center gap-2 rounded-md border border-border p-3">
          <span className="text-lg" aria-hidden="true">
            {query.glyph}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{query.name}</p>
            <p className="text-xs text-muted-foreground">
              {query.frameLabel} · {evaluation.counts.output.toLocaleString()}{" "}
              rows
            </p>
          </div>
        </div>
        {onOpenView && !readOnly && (
          <Button size="sm" variant="outline" onClick={copyCurrentQuery}>
            Copy query to a new view
          </Button>
        )}
        {incompatibleFields.length > 0 && (
          <div className="rounded-md border border-warning p-3">
            <p className="font-medium">
              Some saved settings do not match this frame.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Missing fields: {incompatibleFields.join(", ")}
            </p>
            {queryPresets?.[view.queryId] && !readOnly && (
              <Button className="mt-2" size="sm" onClick={applyPreset}>
                Apply compatible query settings
              </Button>
            )}
          </div>
        )}
      </section>

      {usableRelationships.length > 0 && (
        <section className="space-y-3 border-t border-border pt-4">
          <h3 className="font-medium">Use a relationship</h3>
          <p className="text-xs text-muted-foreground">
            Choose how related rows affect this query’s frame.
          </p>
          <label className="block space-y-1 text-xs">
            <span>Relationship</span>
            <Select
              value={selectedRelationship?.relationship.id ?? ""}
              onValueChange={setRelationshipId}
            >
              <SelectTrigger aria-label="Relationship to add">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {usableRelationships.map(({ relationship }) => (
                  <SelectItem key={relationship.id} value={relationship.id}>
                    {relationship.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
          <label className="block space-y-1 text-xs">
            <span>Effect</span>
            <Select
              value={relationshipMode}
              onValueChange={(value) =>
                setRelationshipMode(value as typeof relationshipMode)
              }
            >
              <SelectTrigger aria-label="How the relationship affects rows">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="lookup">
                  Add matching fields · keep current rows
                </SelectItem>
                <SelectItem value="aggregate">
                  Count related rows · keep current grain
                </SelectItem>
                <SelectItem value="expand">
                  Expand rows · open a new view
                </SelectItem>
              </SelectContent>
            </Select>
          </label>
          {relationshipMode === "aggregate" && selectedRelationship && (
            <>
              <label className="block space-y-1 text-xs">
                <span>Measure</span>
                <Select
                  value={aggregateOperation}
                  onValueChange={(value) =>
                    setAggregateOperation(value as typeof aggregateOperation)
                  }
                >
                  <SelectTrigger aria-label="Related row measure">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="count">Count related rows</SelectItem>
                    <SelectItem value="sum">Sum a numeric field</SelectItem>
                    <SelectItem value="average">
                      Average a numeric field
                    </SelectItem>
                  </SelectContent>
                </Select>
              </label>
              {aggregateOperation !== "count" && (
                <label className="block space-y-1 text-xs">
                  <span>Numeric field</span>
                  <Select
                    value={
                      aggregateFieldId ||
                      (selectedRelationship.direction.targetSourceId &&
                        project.sources
                          .find(
                            (source) =>
                              source.id ===
                              selectedRelationship.direction.targetSourceId
                          )
                          ?.fields.find((field) => field.type === "number")
                          ?.id) ||
                      ""
                    }
                    onValueChange={setAggregateFieldId}
                  >
                    <SelectTrigger aria-label="Numeric field to aggregate">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {project.sources
                        .find(
                          (source) =>
                            source.id ===
                            selectedRelationship.direction.targetSourceId
                        )
                        ?.fields.filter((field) => field.type === "number")
                        .map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </label>
              )}
            </>
          )}
          {selectedRelationship &&
            !selectedRelationshipLookupAllowed &&
            relationshipMode === "lookup" && (
              <p className="text-xs text-warning">
                This relationship can match multiple rows in that direction.
                Choose a count or expanded frame.
              </p>
            )}
          <Button
            size="sm"
            disabled={
              readOnly ||
              !selectedRelationship ||
              (relationshipMode === "lookup" &&
                !selectedRelationshipLookupAllowed) ||
              (relationshipMode === "expand" && !onOpenView)
            }
            onClick={useRelationship}
          >
            {relationshipMode === "lookup"
              ? "Add matching fields"
              : relationshipMode === "aggregate"
                ? "Add related count"
                : "Open expanded frame"}
          </Button>
        </section>
      )}

      {hasParameters && (
        <Parameters
          project={project}
          tables={tables}
          parameterIds={usedParameterIds}
          bindings={draftBindings}
          appliedBindings={view.bindings ?? {}}
          onChange={updateBinding}
          readOnly={readOnly}
        />
      )}

      <QueryRendererEvidence
        handoff={traceHandoff}
        queryRevision={queryRevision}
        traceRevisions={traceRevisions}
        rowsById={resultRowsById}
        chartFilterScopes={chartFilterScopes}
      />

      <section className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-medium">Query flow</h3>
          <div
            className="flex rounded-md border border-border p-0.5"
            role="group"
            aria-label="Query flow detail"
          >
            {(["summary", "full"] as const).map((mode) => (
              <ActionTooltip
                key={mode}
                content={
                  mode === "summary"
                    ? "Show the selected query step and its result"
                    : "Show every step, condition, and row count in this query"
                }
              >
                <button
                  type="button"
                  aria-pressed={(view.inspection?.mode ?? "summary") === mode}
                  className="rounded px-2 py-1 text-xs capitalize hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() =>
                    changeView({
                      ...view,
                      inspection: { ...view.inspection, mode },
                    })
                  }
                >
                  {mode}
                </button>
              </ActionTooltip>
            ))}
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Result: {evaluation.counts.available.toLocaleString()} available ·{" "}
          {evaluation.counts.excluded.toLocaleString()} excluded
        </p>
        {missingStepId && (
          <div
            role="status"
            className="space-y-2 rounded-md border border-warning p-3"
          >
            <p>
              Saved query step {missingStepId} is unavailable in this result.
            </p>
            <Button size="sm" variant="outline" onClick={showOutputStep}>
              Show query output
            </Button>
          </div>
        )}
        <ol className="space-y-2">
          {flowSteps.map((step) => {
            const stage = evaluation.stages.find(
              (item) => item.stepId === step.id
            );
            const active = currentStage?.stepId === step.id;
            const unresolved =
              (step.kind === "lookup" || step.kind === "expand") &&
              !project.relationships.some(
                (relationship) => relationship.id === step.relationshipId
              );
            const inputFields =
              step.kind === "source"
                ? []
                : (evaluation.stages.find(
                    (item) => item.stepId === step.inputStepId
                  )?.fields ?? []);
            const replacements = unresolved
              ? project.relationships.flatMap((relationship) => {
                  const direction = relationshipDirection(
                    relationship,
                    inputFields
                  );
                  return direction &&
                    (!step.inputFieldId ||
                      direction.inputField.id === step.inputFieldId)
                    ? [{ relationship, direction }]
                    : [];
                })
              : [];
            return (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => selectStep(step.id)}
                  aria-current={active ? "step" : undefined}
                  className={`w-full rounded-md border p-3 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "border-ring bg-muted/50" : "border-border"}`}
                >
                  <div className="flex items-start gap-2">
                    <span className="font-mono text-xs text-muted-foreground">
                      {step.kind}
                    </span>
                    <span className="min-w-0 flex-1 font-medium">
                      {stageLabel(step, project)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stage?.outputCount.toLocaleString() ?? "—"}
                    </span>
                  </div>
                  {(view.inspection?.mode === "full" || active) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stage?.condition ?? stageDescription(step, project)}
                      {stage &&
                        ` · ${stage.rowUnit} · ${stage.inputCount.toLocaleString()} in → ${stage.outputCount.toLocaleString()} out${stage.excludedCount ? ` · ${stage.excludedCount.toLocaleString()} excluded` : ""}`}
                    </p>
                  )}
                  {unresolved && (
                    <p role="alert" className="mt-1 text-xs text-destructive">
                      The relationship was removed. Choose a replacement
                      relationship to restore this step.
                    </p>
                  )}
                </button>
                {unresolved && !readOnly && (
                  <div className="mt-2 space-y-2 rounded-md border border-warning p-3">
                    <p className="text-xs">
                      Choose a relationship with the same input field.
                    </p>
                    {replacements.length ? (
                      <>
                        <Select
                          value={replacementIds[step.id] ?? ""}
                          onValueChange={(value) =>
                            setReplacementIds((current) => ({
                              ...current,
                              [step.id]: value,
                            }))
                          }
                        >
                          <SelectTrigger
                            aria-label={`Replacement relationship for ${step.id}`}
                          >
                            <SelectValue placeholder="Choose relationship" />
                          </SelectTrigger>
                          <SelectContent>
                            {replacements.map(({ relationship }) => (
                              <SelectItem
                                key={relationship.id}
                                value={relationship.id}
                              >
                                {relationship.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          onClick={() => repairStep(step.id)}
                          disabled={!replacementIds[step.id]}
                        >
                          Repair query step
                        </Button>
                      </>
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        No defined relationship matches this step’s input field.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {unresolvedRowKeys > 0 && (
          <p
            role="status"
            className="rounded-md border border-warning p-3 text-xs"
          >
            {unresolvedRowKeys} saved row selection{" "}
            {unresolvedRowKeys === 1 ? "key is" : "keys are"} unavailable in
            this result. Those filters remain active.
          </p>
        )}
        {evaluation.diagnostics.length > 0 && (
          <ul className="space-y-1 rounded-md border border-warning p-3 text-xs">
            {evaluation.diagnostics.slice(0, 5).map((item, index) => (
              <li key={`${item.code}-${item.stepId}-${item.rowKey}-${index}`}>
                {item.message}
              </li>
            ))}
          </ul>
        )}
        {onOpenView && currentStage && !readOnly && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => openStage(currentStage.stepId)}
          >
            <ExternalLink /> Open this result in a new view
          </Button>
        )}
      </section>

      <section className="space-y-2 border-t border-border pt-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="font-medium">Result rows</h3>
            <p className="text-xs text-muted-foreground">
              {currentStage?.rows.length.toLocaleString() ?? 0} rows at this
              step
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllRows((value) => !value)}
            aria-pressed={showAllRows}
          >
            <Rows3 />
            {showAllRows ? "Show first 20" : "Show first 50"}
          </Button>
        </div>
        {(currentStage?.rows.length ?? 0) > (showAllRows ? 50 : 20) && (
          <p className="text-xs text-muted-foreground">
            Showing {showAllRows ? "50" : "20"} of{" "}
            {currentStage?.rows.length.toLocaleString()} rows.
          </p>
        )}
        <div className="overflow-x-auto rounded-md border border-border">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th scope="col" className="px-2 py-2 text-left">
                  Row
                </th>
                {stageFields.map((field) => (
                  <th
                    scope="col"
                    key={field.id}
                    className={`max-w-36 px-2 py-2 ${field.type === "number" ? "text-right" : "text-left"}`}
                  >
                    <FieldMetadata
                      label={field.name}
                      profile={stageProfiles.find(
                        (profile) => profile.name === field.id
                      )}
                      compact
                    />
                    <span className="block truncate font-normal text-muted-foreground">
                      {"sourceId" in field.origin
                        ? `from ${field.origin.sourceId}`
                        : `step ${field.origin.stepId}`}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(currentStage?.rows ?? [])
                .filter(
                  (row) =>
                    showAllRows ||
                    !view.inspection?.rowKey ||
                    row.key === view.inspection.rowKey
                )
                .slice(0, showAllRows ? 50 : 20)
                .map((row) => (
                  <tr
                    key={row.key}
                    className={`border-b border-border hover:bg-muted/50 ${view.inspection?.rowKey === row.key ? "bg-muted" : ""}`}
                  >
                    <th
                      scope="row"
                      className="max-w-28 truncate px-2 py-2 text-left font-mono font-normal"
                    >
                      <button
                        type="button"
                        className="max-w-full truncate underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        aria-pressed={view.inspection?.rowKey === row.key}
                        onClick={() =>
                          selectRow(
                            view.inspection?.rowKey === row.key
                              ? undefined
                              : row.key
                          )
                        }
                      >
                        {row.key}
                      </button>
                    </th>
                    {stageFields.map((field) => (
                      <td
                        key={field.id}
                        className={`max-w-36 truncate px-2 py-2 ${field.type === "number" ? "text-right tabular-nums" : "text-left"}`}
                      >
                        {row.values[field.id] == null ? (
                          <span className="block text-center font-mono text-muted-foreground">
                            null
                          </span>
                        ) : (
                          String(row.values[field.id])
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {selectedRow && (
          <RelatedRows
            project={project}
            tables={tables}
            row={selectedRow}
            readOnly={readOnly}
            onOpenView={onOpenView}
            view={view}
          />
        )}
      </section>
    </div>
  );
}

function QueryPicker({
  project,
  value,
  onChange,
  disabled,
}: {
  project: AnalysisProject;
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
}) {
  return (
    <Select value={value} onValueChange={onChange} disabled={disabled}>
      <SelectTrigger aria-label="Selected query">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {project.queries.map((query) => (
          <SelectItem key={query.id} value={query.id}>
            {query.glyph} {query.name} · {query.frameLabel}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function Parameters({
  project,
  tables,
  parameterIds,
  bindings,
  appliedBindings,
  onChange,
  readOnly,
}: {
  project: AnalysisProject;
  tables: Tables;
  parameterIds: Set<string>;
  bindings: Record<string, AnalysisScalar>;
  appliedBindings: Record<string, AnalysisScalar>;
  onChange: (id: string, value: AnalysisScalar) => void;
  readOnly: boolean;
}) {
  const customerSource = project.sources.find((source) =>
    /customer/i.test(source.name)
  );
  return (
    <section className="space-y-2 border-t border-border pt-4">
      <h3 className="font-medium">Inputs</h3>
      <p
        className="text-xs text-muted-foreground"
        aria-label="Applied query inputs"
      >
        Applied:{" "}
        {(project.parameters ?? [])
          .filter((parameter) => parameterIds.has(parameter.id))
          .map(
            (parameter) =>
              `${parameter.name}: ${appliedBindings[parameter.id] ?? "not set"}`
          )
          .join(" · ")}
      </p>
      {(project.parameters ?? [])
        .filter((parameter) => parameterIds.has(parameter.id))
        .map((parameter) => {
          const value = bindings[parameter.id];
          const customerParameter =
            /customer/i.test(`${parameter.id} ${parameter.name}`) &&
            customerSource;
          const customerRows = customerSource
            ? (tables[customerSource.id] ?? [])
            : [];
          const displayField = customerSource?.fields.find(
            (field) =>
              /name/i.test(field.name) && field.id !== customerSource.entityKey
          )?.id;
          const inputType =
            parameter.type === "date"
              ? "date"
              : parameter.type === "number"
                ? "number"
                : undefined;
          return (
            <label className="block space-y-1 text-xs" key={parameter.id}>
              <span>
                {parameter.name}
                {parameter.required ? " · required" : ""}
              </span>
              {customerParameter ? (
                <select
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                  value={
                    value == null ? "" : `${typeof value}:${String(value)}`
                  }
                  disabled={readOnly}
                  onChange={(event) => {
                    const row = customerRows.find((item) => {
                      const id = item[customerSource!.entityKey];
                      return (
                        id != null &&
                        `${typeof id}:${String(id)}` === event.target.value
                      );
                    });
                    onChange(parameter.id, row?.[customerSource!.entityKey]);
                  }}
                  aria-label={parameter.name}
                >
                  <option value="">Choose a customer</option>
                  {customerRows.map((row, index) => {
                    const id = row[customerSource!.entityKey];
                    return id == null ? null : (
                      <option
                        key={`${typeof id}:${String(id)}:${index}`}
                        value={`${typeof id}:${String(id)}`}
                      >
                        {displayField && row[displayField] != null
                          ? `${String(row[displayField])} · `
                          : ""}
                        {String(id)}
                      </option>
                    );
                  })}
                </select>
              ) : (
                <Input
                  type={inputType ?? "text"}
                  value={value == null ? "" : String(value)}
                  disabled={readOnly}
                  onChange={(event) =>
                    onChange(
                      parameter.id,
                      parameter.type === "number"
                        ? event.target.value === ""
                          ? undefined
                          : Number(event.target.value)
                        : event.target.value || undefined
                    )
                  }
                  aria-label={parameter.name}
                />
              )}
            </label>
          );
        })}
      {!validParameterValues(project, bindings, parameterIds) && (
        <p role="status" className="text-xs text-warning">
          These inputs are incomplete or invalid. The last valid result remains
          applied.
        </p>
      )}
    </section>
  );
}

function RelatedRows({
  project,
  tables,
  row,
  readOnly,
  onOpenView,
  view,
}: {
  project: AnalysisProject;
  tables: Tables;
  row: AnalysisResultRow;
  readOnly: boolean;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
  view: AnalysisView;
}) {
  const related = relatedRows(project, tables, row);
  if (!related.refs.length)
    return (
      <div className="space-y-2 rounded-md border border-border p-3 text-xs text-muted-foreground">
        <p>This result has no related source rows.</p>
        {related.issues.map((issue) => (
          <p key={issue} role="status">
            {issue}
          </p>
        ))}
      </div>
    );
  const groups = project.sources.flatMap((source) => {
    const items = related.refs.filter((ref) => ref.sourceId === source.id);
    const resolved = items.map((ref) =>
      resolveSourceRow(source, tables[source.id] ?? [], ref)
    );
    return items.length
      ? [
          {
            source,
            items,
            rows: resolved.flatMap((item) => (item.row ? [item.row] : [])),
            unresolved: resolved.filter((item) => !item.row).length,
          },
        ]
      : [];
  });

  function openSource(sourceId: string, sourceName: string, glyph: string) {
    if (!onOpenView) return;
    const queryId = newId(`${view.queryId}-source`);
    const stepId = newId(`${queryId}-read`);
    const query: AnalysisQuery = {
      id: queryId,
      name: sourceName,
      glyph,
      frameLabel: sourceName,
      steps: [{ id: stepId, kind: "source", sourceId }],
      outputStepId: stepId,
    };
    const nextProject = { ...project, queries: [...project.queries, query] };
    const nextView: AnalysisView = {
      id: newId(`${view.id}-source`),
      name: sourceName,
      queryId,
    };
    onOpenView(nextView, sourceName, nextProject);
  }

  return (
    <section className="space-y-2 rounded-md border border-border p-3">
      <h4 className="font-medium">Related source tables</h4>
      <p className="text-xs text-muted-foreground">
        Rows follow configured relationships from the selected result.
      </p>
      {related.issues.map((issue) => (
        <p key={issue} role="status" className="text-xs text-warning">
          {issue}
        </p>
      ))}
      <ul className="space-y-3">
        {groups.map(({ source, items, rows, unresolved }) => {
          const fields = source.fields;
          const profiles = buildFieldProfiles(rows);
          return (
            <li key={source.id} className="rounded-md border border-border p-2">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h5 className="font-medium">
                  {source.glyph} {source.name} · {items.length.toLocaleString()}{" "}
                  related
                </h5>
                {onOpenView && !readOnly && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      openSource(source.id, source.name, source.glyph)
                    }
                  >
                    <Play />
                    Open source view
                  </Button>
                )}
              </div>
              {unresolved > 0 && (
                <p role="status" className="mb-2 text-xs text-warning">
                  {unresolved.toLocaleString()} of{" "}
                  {items.length.toLocaleString()} related rows have an
                  unresolved source reference.
                </p>
              )}
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {fields.map((field) => (
                        <th
                          key={field.id}
                          scope="col"
                          className={`px-2 py-2 font-normal ${field.type === "number" ? "text-right" : "text-left"}`}
                        >
                          {source.entityKey === field.id && (
                            <span className="mr-1 text-muted-foreground">
                              key
                            </span>
                          )}
                          <FieldMetadata
                            label={field.name}
                            profile={profiles.find(
                              (profile) => profile.name === field.id
                            )}
                            compact
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.slice(0, 20).map((sourceRow, index) => (
                      <tr
                        key={`${source.id}-${index}`}
                        className="border-b border-border"
                      >
                        {fields.map((field) => (
                          <td
                            key={field.id}
                            className={`max-w-40 truncate px-2 py-2 ${field.type === "number" ? "text-right tabular-nums" : "text-left"}`}
                          >
                            {sourceRow[field.id] == null ? (
                              <span className="block text-center font-mono text-muted-foreground">
                                null
                              </span>
                            ) : (
                              String(sourceRow[field.id])
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 20 && (
                <p className="mt-1 text-xs text-muted-foreground">
                  First 20 of {rows.length.toLocaleString()} related rows.
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
