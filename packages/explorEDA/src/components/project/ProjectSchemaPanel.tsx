import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Link2, Network, Plus, X } from "lucide-react";
import type {
  AnalysisProject,
  AnalysisSourceRow,
  AnalysisView,
  RelationshipDefinition,
  SourceDefinition,
} from "@/types/AnalysisProject";
import { buildFieldProfiles } from "@/lib/fieldProfiles";
import { sourceView } from "./queryEditing";
import { FieldMetadata } from "@/components/FieldMetadata";
import { Button } from "@/components/ui/button";
import { ActionTooltip } from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Tables = Record<string, readonly AnalysisSourceRow[]>;

function sourceLabel(project: AnalysisProject, id: string) {
  return project.sources.find((source) => source.id === id)?.name ?? id;
}

function fieldLabel(source: SourceDefinition, id: string) {
  return source.fields.find((field) => field.id === id)?.name ?? id;
}

function countMatches(
  fromRows: readonly AnalysisSourceRow[],
  fromField: string,
  toRows: readonly AnalysisSourceRow[],
  toField: string
) {
  const counts = new Map<unknown, number>();
  for (const row of toRows) {
    const key = row[toField];
    if (key != null) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  let matched = 0;
  let unmatched = 0;
  let ambiguous = 0;
  let expanded = 0;
  for (const row of fromRows) {
    const key = row[fromField];
    const count = key == null ? 0 : (counts.get(key) ?? 0);
    if (!count) unmatched += 1;
    else {
      matched += 1;
      if (count > 1) ambiguous += 1;
      expanded += Math.max(0, count - 1);
    }
  }
  return { matched, unmatched, ambiguous, expanded };
}

export function ProjectSchemaPanel({
  project,
  queryId,
  tables,
  readOnly,
  onProjectChange,
  onOpenView,
  onOpenDiagram,
}: {
  project: AnalysisProject;
  queryId: string;
  tables: Tables;
  readOnly: boolean;
  onProjectChange: (project: AnalysisProject) => void;
  onOpenView?: (
    view: AnalysisView,
    name: string,
    project?: AnalysisProject
  ) => void;
  /** Show the tables and relationships as a diagram. */
  onOpenDiagram?: () => void;
}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [fromField, setFromField] = useState("");
  const [toField, setToField] = useState("");
  const [cardinality, setCardinality] =
    useState<RelationshipDefinition["cardinality"]>("many-to-one");
  const [proposal, setProposal] = useState<RelationshipDefinition>();
  const [editingId, setEditingId] = useState<string>();
  const [pendingRemove, setPendingRemove] = useState<string>();
  const [error, setError] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingId) {
      editorRef.current?.scrollIntoView?.({ block: "nearest" });
      editorRef.current?.focus();
    }
  }, [editingId]);

  // Profiling every table is the panel's slowest work; tables rarely change.
  const profiles = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(tables).map(([id, rows]) => [
          id,
          buildFieldProfiles([...rows]),
        ])
      ),
    [tables]
  );
  const selectedFrom = project.sources.find((source) => source.id === from);
  const selectedTo = project.sources.find((source) => source.id === to);
  const query = project.queries.find((item) => item.id === queryId);
  const sourceSteps = new Map<string, string[]>();
  const relationshipSteps = new Map<string, string[]>();
  for (const step of query?.steps ?? []) {
    if (step.kind === "source")
      sourceSteps.set(step.sourceId, [
        ...(sourceSteps.get(step.sourceId) ?? []),
        step.id,
      ]);
    if (step.kind === "lookup" || step.kind === "expand")
      relationshipSteps.set(step.relationshipId, [
        ...(relationshipSteps.get(step.relationshipId) ?? []),
        step.id,
      ]);
  }

  function propose(
    sourceId: string,
    fieldId: string,
    targetId: string,
    targetFieldId: string
  ) {
    if (sourceId === targetId || !fieldId || !targetFieldId) return;
    setFrom(sourceId);
    setFromField(fieldId);
    setTo(targetId);
    setToField(targetFieldId);
    setError("");
    const existing = project.relationships.find(
      (relationship) => relationship.id === editingId
    );
    setProposal({
      id:
        existing?.id ??
        `rel-${sourceId}-${fieldId}-${targetId}-${targetFieldId}`,
      name:
        existing?.name ??
        `${sourceLabel(project, sourceId)} to ${sourceLabel(project, targetId)}`,
      from: { sourceId, fieldId },
      to: { sourceId: targetId, fieldId: targetFieldId },
      cardinality,
    });
  }

  function confirmProposal() {
    if (!proposal) return;
    if (editingId) {
      onProjectChange({
        ...project,
        relationships: project.relationships.map((relationship) =>
          relationship.id === editingId ? proposal : relationship
        ),
      });
      setEditingId(undefined);
      setProposal(undefined);
      return;
    }
    const conflict = project.relationships.some(
      (relationship) => relationship.id === proposal.id
    );
    if (conflict) {
      setError("This relationship already exists.");
      return;
    }
    onProjectChange({
      ...project,
      relationships: [...project.relationships, proposal],
    });
    setProposal(undefined);
    setEditingId(undefined);
  }

  function editRelationship(relationship: RelationshipDefinition) {
    setEditingId(relationship.id);
    setFrom(relationship.from.sourceId);
    setFromField(relationship.from.fieldId);
    setTo(relationship.to.sourceId);
    setToField(relationship.to.fieldId);
    setCardinality(relationship.cardinality);
    setProposal(undefined);
    setError("");
  }

  function cancelEdit() {
    setProposal(undefined);
    setEditingId(undefined);
    setError("");
  }

  function removeRelationship(relationship: RelationshipDefinition) {
    onProjectChange({
      ...project,
      relationships: project.relationships.filter(
        (item) => item.id !== relationship.id
      ),
    });
    setPendingRemove(undefined);
  }

  const fromRows = tables[from] ?? [];
  const toRows = tables[to] ?? [];
  const matchCounts = proposal
    ? countMatches(fromRows, proposal.from.fieldId, toRows, proposal.to.fieldId)
    : undefined;

  return (
    <div className="space-y-5 p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-medium">Sources and fields</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Drag a field onto another to propose a relationship.
          </p>
        </div>
        {onOpenDiagram && (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            tooltip="Show every table, field, and relationship as a diagram"
            onClick={onOpenDiagram}
          >
            <Network aria-hidden="true" />
            Open diagram
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {project.sources.map((source) => {
          const profile = profiles[source.id] ?? [];
          return (
            <section
              key={source.id}
              className="rounded-md border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-medium">
                  <span className="mr-2" aria-hidden="true">
                    {source.glyph}
                  </span>
                  {source.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {(tables[source.id] ?? []).length.toLocaleString()} rows
                  </span>
                  {onOpenView && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const next = sourceView(project, source.id);
                        onOpenView(next.view, next.view.name, next.project);
                      }}
                    >
                      Open as view
                    </Button>
                  )}
                </div>
              </div>
              {sourceSteps.has(source.id) && (
                <p className="mt-1 text-xs text-primary">
                  Read by this view’s query
                </p>
              )}
              <ul className="mt-3 space-y-1">
                {source.fields.map((field) => (
                  <li key={field.id}>
                    <button
                      type="button"
                      draggable={!readOnly}
                      disabled={readOnly}
                      className="w-full rounded-sm px-1 py-1 text-left hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
                      onDragStart={(event) => {
                        event.dataTransfer.setData(
                          "application/x-explor-eda-field",
                          JSON.stringify({
                            sourceId: source.id,
                            fieldId: field.id,
                          })
                        );
                        event.dataTransfer.effectAllowed = "link";
                      }}
                      onDragOver={(event) => {
                        if (!readOnly) event.preventDefault();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        const raw = event.dataTransfer.getData(
                          "application/x-explor-eda-field"
                        );
                        try {
                          const start = JSON.parse(raw) as {
                            sourceId: string;
                            fieldId: string;
                          };
                          propose(
                            start.sourceId,
                            start.fieldId,
                            source.id,
                            field.id
                          );
                        } catch {
                          /* Ignore non-field drops. */
                        }
                      }}
                      aria-label={`${source.name}, ${field.name}; drag onto another field to propose a relationship`}
                    >
                      <FieldMetadata
                        label={field.name}
                        profile={profile.find((item) => item.name === field.id)}
                        compact
                      />
                      {field.id === source.entityKey && (
                        <span className="ml-2 text-[10px] text-muted-foreground">
                          key
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="space-y-3 border-t border-border pt-4">
        <div>
          <h3 className="font-medium">Relationships</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Match source keys before using a related table.
          </p>
        </div>
        {project.relationships.length === 0 && (
          <p className="rounded-md border border-border p-3 text-xs text-muted-foreground">
            No relationships defined.
          </p>
        )}
        <ul className="space-y-2">
          {project.relationships.map((relationship) => {
            const source = project.sources.find(
              (item) => item.id === relationship.from.sourceId
            );
            const target = project.sources.find(
              (item) => item.id === relationship.to.sourceId
            );
            const sourceField = source?.fields.find(
              (field) => field.id === relationship.from.fieldId
            );
            const targetField = target?.fields.find(
              (field) => field.id === relationship.to.fieldId
            );
            const affected = project.queries.filter((query) =>
              query.steps.some(
                (step) =>
                  (step.kind === "lookup" || step.kind === "expand") &&
                  step.relationshipId === relationship.id
              )
            );
            return (
              <li
                key={relationship.id}
                className="rounded-md border border-border p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <Link2
                        className="mr-1 inline size-3.5"
                        aria-hidden="true"
                      />
                      {relationship.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {source?.name ?? relationship.from.sourceId}.
                      {sourceField?.name ?? relationship.from.fieldId} →{" "}
                      {target?.name ?? relationship.to.sourceId}.
                      {targetField?.name ?? relationship.to.fieldId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {relationship.cardinality.replaceAll("-", " ")} ·{" "}
                      {affected.length}{" "}
                      {affected.length === 1 ? "query" : "queries"}
                    </p>
                    {relationshipSteps.has(relationship.id) && (
                      <p className="mt-1 text-xs text-primary">
                        Followed by this view’s query
                      </p>
                    )}
                  </div>
                  {!readOnly && (
                    <div className="flex shrink-0 items-center gap-1">
                      <ActionTooltip
                        content={`Edit relationship ${relationship.name}`}
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`Edit relationship ${relationship.name}`}
                          onClick={() => editRelationship(relationship)}
                        >
                          Edit
                        </Button>
                      </ActionTooltip>
                      <ActionTooltip
                        content={
                          affected.length
                            ? `Remove link; ${affected.length} query references stay for repair`
                            : "Remove relationship"
                        }
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove relationship ${relationship.name}`}
                          onClick={() => setPendingRemove(relationship.id)}
                        >
                          <X />
                        </Button>
                      </ActionTooltip>
                    </div>
                  )}
                </div>
                {pendingRemove === relationship.id && (
                  <div className="mt-3 space-y-2 rounded-md border border-warning p-3">
                    <p>
                      {affected.length
                        ? `${affected.length} affected ${affected.length === 1 ? "query stays" : "queries stay"} in the project with an unresolved relationship.`
                        : "This relationship will be removed."}
                    </p>
                    {affected.length > 0 && (
                      <ul className="list-inside list-disc text-xs text-muted-foreground">
                        {affected.map((query) => (
                          <li key={query.id}>
                            {query.glyph} {query.name}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeRelationship(relationship)}
                      >
                        Remove relationship
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setPendingRemove(undefined)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        {!readOnly && (
          <div
            ref={editorRef}
            tabIndex={-1}
            role="region"
            aria-label={
              editingId ? "Edit relationship" : "Propose a relationship"
            }
            className="space-y-3 rounded-md border border-border p-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="flex items-center justify-between gap-2">
              <h4 className="font-medium">
                {editingId ? "Edit relationship" : "Propose a relationship"}
              </h4>
              <span className="text-xs text-muted-foreground">
                {editingId
                  ? `Used by ${project.queries.filter((item) => item.steps.some((step) => (step.kind === "lookup" || step.kind === "expand") && step.relationshipId === editingId)).length} queries`
                  : "Or drag one field onto another"}
              </span>
              {editingId && !proposal && (
                <Button size="sm" variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
              )}
            </div>
            <label className="block space-y-1 text-xs">
              <span>From source and field</span>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={from}
                  onValueChange={(value) => {
                    setFrom(value);
                    setFromField("");
                    setProposal(undefined);
                    setError("");
                  }}
                >
                  <SelectTrigger aria-label="From source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.sources.map((source) => (
                      <SelectItem value={source.id} key={source.id}>
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={fromField}
                  onValueChange={(value) => {
                    setFromField(value);
                    setProposal(undefined);
                    setError("");
                  }}
                  disabled={!selectedFrom}
                >
                  <SelectTrigger aria-label="From field">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedFrom?.fields.map((field) => (
                      <SelectItem value={field.id} key={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </label>
            <label className="block space-y-1 text-xs">
              <span>Matches source and field</span>
              <div className="grid grid-cols-2 gap-2">
                <Select
                  value={to}
                  onValueChange={(value) => {
                    setTo(value);
                    setToField("");
                    setProposal(undefined);
                    setError("");
                  }}
                >
                  <SelectTrigger aria-label="Matches source">
                    <SelectValue placeholder="Source" />
                  </SelectTrigger>
                  <SelectContent>
                    {project.sources
                      .filter((source) => source.id !== from)
                      .map((source) => (
                        <SelectItem value={source.id} key={source.id}>
                          {source.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Select
                  value={toField}
                  onValueChange={(value) => {
                    setToField(value);
                    setProposal(undefined);
                    setError("");
                  }}
                  disabled={!selectedTo}
                >
                  <SelectTrigger aria-label="Matches field">
                    <SelectValue placeholder="Field" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedTo?.fields.map((field) => (
                      <SelectItem value={field.id} key={field.id}>
                        {field.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </label>
            <label className="block space-y-1 text-xs">
              <span>Cardinality</span>
              <Select
                value={cardinality}
                onValueChange={(value) => {
                  const next = value as RelationshipDefinition["cardinality"];
                  setCardinality(next);
                  setProposal((current) =>
                    current ? { ...current, cardinality: next } : current
                  );
                }}
              >
                <SelectTrigger aria-label="Relationship cardinality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="many-to-one">Many to one</SelectItem>
                  <SelectItem value="one-to-one">One to one</SelectItem>
                  <SelectItem value="one-to-many">One to many</SelectItem>
                  <SelectItem value="many-to-many">Many to many</SelectItem>
                </SelectContent>
              </Select>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => propose(from, fromField, to, toField)}
                disabled={!from || !to || !fromField || !toField || from === to}
              >
                <Plus /> Preview link
              </Button>
            </div>
            {proposal && matchCounts && (
              <div className="space-y-2 rounded-md bg-muted/50 p-3">
                <p className="font-medium">
                  {sourceLabel(project, from)}.
                  {fieldLabel(selectedFrom!, fromField)} →{" "}
                  {sourceLabel(project, to)}.{fieldLabel(selectedTo!, toField)}
                </p>
                <dl className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-muted-foreground">Matched rows</dt>
                    <dd>{matchCounts.matched}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Unmatched rows</dt>
                    <dd>{matchCounts.unmatched}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Ambiguous keys</dt>
                    <dd>{matchCounts.ambiguous}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">
                      Extra expanded rows
                    </dt>
                    <dd>{matchCounts.expanded}</dd>
                  </div>
                </dl>
                {matchCounts.ambiguous > 0 && (
                  <p className="text-xs text-destructive">
                    Some rows match more than one record. Choose One to many or
                    Many to many to apply this link, then summarize or expand
                    the matches in a query.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={confirmProposal}
                    disabled={
                      matchCounts.ambiguous > 0 &&
                      (cardinality === "many-to-one" ||
                        cardinality === "one-to-one")
                    }
                  >
                    <Check /> Apply relationship
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    Cancel
                  </Button>
                </div>
                {error && (
                  <p role="alert" className="text-xs text-destructive">
                    {error}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
