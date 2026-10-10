import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRight,
  KeyRound,
  Link2,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { typeLabels } from "@/components/FieldMetadata";
import type {
  FieldDefinition,
  RelationshipDefinition,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type {
  SchemaEndpoint,
  SchemaGraph,
  SchemaNode,
  SchemaRow,
} from "@/lib/schema/schemaGraph";
import type { DataType } from "@/components/SummaryTable/utils/dataTypeDetection";
import {
  addRelationship,
  blockedByAmbiguity,
  CARDINALITY_LABELS,
  countMatches,
  fieldName,
  proposalProblem,
  proposeRelationship,
  queriesUsingRelationship,
  removeRelationship,
  replaceRelationship,
  sourceName,
  type Cardinality,
  type FieldRef,
} from "@/components/project/relationshipEditing";
import type {
  SchemaEditing,
  SchemaProjectEditing,
  SchemaSelection,
} from "./schemaEditing";
import { CommitInput, Field } from "./InspectorControls";
import { traceField } from "@/lib/schema/schemaTrace";

/** Lets a use of a field jump to the chart in this workspace that reads it. */
export interface SchemaChartLinks {
  /** The card that draws this workspace's charts. */
  nodeId: string;
  onShowChart: (chartId: string) => void;
}
import { AddStep, NewQueryFromTable, StepEditor } from "./SchemaStepEditors";

/** The step, and for a summary the measure, a query card's row draws. */
function stepRowIds(rowId: string) {
  const step = /^step:(.+)$/.exec(rowId);
  if (step) return { stepId: step[1]! };
  const measure = /^measure:([^:]+):(.+)$/.exec(rowId);
  if (measure) return { stepId: measure[1]!, measureId: measure[2]! };
  return undefined;
}

const DECLARED_TYPE_LABELS: Record<
  NonNullable<FieldDefinition["type"]>,
  string
> = {
  string: "Text",
  number: "Number",
  date: "Date",
  boolean: "Boolean",
  unknown: "Unknown",
};

function endpointRef(
  graph: SchemaGraph,
  endpoint: SchemaEndpoint
): FieldRef | undefined {
  const node = graph.nodes.find((item) => item.id === endpoint.nodeId);
  const row = node?.rows.find((item) => item.id === endpoint.rowId);
  if (!node?.sourceId || !row?.field) return undefined;
  return { sourceId: node.sourceId, fieldId: row.field };
}

function updateSource(
  editing: SchemaProjectEditing,
  sourceId: string,
  update: (source: SourceDefinition) => SourceDefinition
) {
  editing.onChange({
    ...editing.project,
    sources: editing.project.sources.map((source) =>
      source.id === sourceId ? update(source) : source
    ),
  });
}

/**
 * A compact, nonmodal panel beside the selected card, line, or field. It
 * shows the selection's facts and, where the workspace allows, edits them
 * through the same rules as the Schema panel and field settings.
 */
export function SchemaInspector({
  graph,
  selection,
  editing,
  style,
  charts,
  onToggleView,
  onSelect,
  onClose,
}: {
  graph: SchemaGraph;
  selection: SchemaSelection;
  editing?: SchemaEditing;
  style?: CSSProperties;
  /** This workspace's charts: the card that draws them, and how to show one. */
  charts?: SchemaChartLinks;
  /** Fold or unfold another view's card. */
  onToggleView?: (nodeId: string) => void;
  onSelect: (selection: SchemaSelection | undefined) => void;
  onClose: () => void;
}) {
  const node =
    selection.kind === "table" || selection.kind === "field"
      ? graph.nodes.find((item) => item.id === selection.nodeId)
      : undefined;
  const row =
    selection.kind === "field"
      ? node?.rows.find((item) => item.id === selection.rowId)
      : undefined;

  let title = "";
  let body: React.ReactNode = null;
  if (selection.kind === "table" && node) {
    title = node.title;
    body = (
      <TableBody
        node={node}
        editing={editing}
        onSelect={onSelect}
        onToggleView={onToggleView}
      />
    );
  } else if (selection.kind === "field" && node && row) {
    title = row.label;
    body = (
      <FieldBody
        graph={graph}
        node={node}
        row={row}
        editing={editing}
        charts={charts}
        onSelect={onSelect}
      />
    );
  } else if (selection.kind === "relationship") {
    title = "Relationship";
    body = (
      <RelationshipBody
        edgeId={selection.edgeId}
        graph={graph}
        editing={editing?.project}
        onSelect={onSelect}
      />
    );
  } else if (selection.kind === "proposal") {
    title = "New relationship";
    body = (
      <ProposalBody
        graph={graph}
        from={selection.from}
        to={selection.to}
        editing={editing?.project}
        onSelect={onSelect}
      />
    );
  }
  if (!body) return null;

  return (
    <div
      className="eda-schema-inspector"
      role="dialog"
      aria-modal="false"
      tabIndex={-1}
      aria-label={title}
      style={style}
      data-inplace-editor=""
      onPointerDown={(event) => event.stopPropagation()}
      onWheel={(event) => event.stopPropagation()}
    >
      <div className="eda-schema-inspector-header">
        <h3>{title}</h3>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Close the details"
          tooltip="Close the details (Esc)"
          onClick={onClose}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      <div className="eda-schema-inspector-body">{body}</div>
    </div>
  );
}

function TableBody({
  node,
  editing,
  onSelect,
  onToggleView,
}: {
  node: SchemaNode;
  editing?: SchemaEditing;
  onSelect: (selection: SchemaSelection) => void;
  onToggleView?: (nodeId: string) => void;
}) {
  const project = editing?.project;
  const source = project?.project.sources.find(
    (item) => item.id === node.sourceId
  );
  const count = (kind: string, one: string, many: string) => {
    const total = node.rows.filter(
      (row) => (row.kind ?? "field") === kind
    ).length;
    return total ? `${total} ${total === 1 ? one : many}` : undefined;
  };
  const calculated = node.rows.filter((row) => row.calculation).length;
  return (
    <>
      <p className="eda-schema-inspector-facts">
        {[
          node.detail,
          node.kind === "query" ? count("step", "step", "steps") : undefined,
          node.kind === "view"
            ? node.folded
              ? count("use", "chart", "charts")
              : count("use", "field read", "fields read")
            : count("field", "field", "fields"),
          calculated ? `${calculated} calculated` : undefined,
        ]
          .filter(Boolean)
          .join(" · ")}
      </p>
      {project && source && (
        <Field label="Key field">
          <Select
            value={source.entityKey}
            onValueChange={(entityKey) =>
              updateSource(project, source.id, (item) => ({
                ...item,
                entityKey,
              }))
            }
          >
            <SelectTrigger aria-label={`Key field of ${source.name}`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {source.fields.map((field) => (
                <SelectItem key={field.id} value={field.id}>
                  {field.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}
      <p className="eda-schema-inspector-hint">
        {project && source
          ? "Drag a field onto a field of another table to relate them."
          : node.kind === "view"
            ? "Select a field to see where it comes from."
            : node.kind === "query"
              ? "Select a step or calculated field to see its details."
              : editing?.fields
                ? "Select a field to change its label, unit, or type."
                : "Select a field to see its details."}
      </p>
      {node.kind === "view" && !node.current && onToggleView && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          tooltip={
            node.folded
              ? "List every field this view reads, with a line to each"
              : "Fold this view to one row per chart"
          }
          onClick={() => onToggleView(node.id)}
        >
          {node.folded ? "Show every field" : "Show charts only"}
        </Button>
      )}
      {project && node.kind === "query" && node.queryId && (
        <AddStep editing={project} queryId={node.queryId} />
      )}
      {project && source && (
        <NewQueryFromTable editing={project} sourceId={source.id} />
      )}
      {editing?.calculations?.nodeId === node.id && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          tooltip="Add a calculated field from an expression over these fields"
          onClick={(event) =>
            editing.calculations!.open(undefined, event.currentTarget)
          }
        >
          <Plus aria-hidden="true" />
          Add calculation
        </Button>
      )}
      {node.kind === "table" && node.rows[0] && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() =>
            onSelect({
              kind: "field",
              nodeId: node.id,
              rowId: node.rows[0]!.id,
            })
          }
        >
          Select the first field
        </Button>
      )}
    </>
  );
}

function FieldBody({
  graph,
  node,
  row,
  editing,
  charts,
  onSelect,
}: {
  graph: SchemaGraph;
  node: SchemaNode;
  row: SchemaRow;
  editing?: SchemaEditing;
  charts?: SchemaChartLinks;
  onSelect: (selection: SchemaSelection) => void;
}) {
  const typeLabel = row.dataType ? typeLabels[row.dataType] : undefined;
  const links = graph.edges.filter(
    (edge) =>
      edge.kind === "relationship" &&
      [edge.from, edge.to].some(
        (end) => end.nodeId === node.id && end.rowId === row.id
      )
  );
  const project = editing?.project;
  const source = project?.project.sources.find(
    (item) => item.id === node.sourceId
  );
  const definition = source?.fields.find((field) => field.id === row.field);

  return (
    <>
      <p className="eda-schema-inspector-facts">
        {(row.kind === "use"
          ? [node.title, row.detail ? `as ${row.detail}` : undefined]
          : row.kind === "step"
            ? [node.title, row.detail]
            : [
                node.title,
                typeLabel,
                row.mark === "Σ" ? row.detail : undefined,
                row.key ? "key" : undefined,
              ]
        )
          .filter(Boolean)
          .join(" · ")}
      </p>
      {row.status === "missing" && (
        <p className="eda-schema-inspector-error">
          This view reads a field its query no longer has.
        </p>
      )}
      {row.calculation &&
        !(row.step === "calculate" && project && node.queryId) && (
          <div className="eda-schema-inspector-code">
            <span>Calculated as</span>
            <code>{row.calculation.expression}</code>
          </div>
        )}
      {row.calculation?.error && (
        <p className="eda-schema-inspector-error">{row.calculation.error}</p>
      )}
      {row.calculation &&
        row.field &&
        editing?.calculations?.nodeId === node.id && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={(event) =>
              editing.calculations!.open(row.field, event.currentTarget)
            }
          >
            <Pencil aria-hidden="true" />
            Edit calculation
          </Button>
        )}
      {project &&
        node.kind === "query" &&
        node.queryId &&
        stepRowIds(row.id) && (
          <StepEditor
            editing={project}
            queryId={node.queryId}
            {...stepRowIds(row.id)!}
          />
        )}
      {project && source && definition && (
        <ProjectFieldEditor
          project={project}
          source={source}
          field={definition}
        />
      )}
      {!project && editing?.fields && row.field && (
        <WorkspaceFieldEditor
          field={row.field}
          editing={editing.fields}
          inferred={row.dataType}
        />
      )}
      <Lineage
        graph={graph}
        field={{ nodeId: node.id, rowId: row.id }}
        charts={charts}
        onSelect={onSelect}
      />
      {links.length > 0 && (
        <div className="eda-schema-inspector-section">
          <span>Relationships</span>
          <ul>
            {links.map((edge) => {
              const other = edge.from.nodeId === node.id ? edge.to : edge.from;
              const otherNode = graph.nodes.find(
                (item) => item.id === other.nodeId
              );
              const otherRow = otherNode?.rows.find(
                (item) => item.id === other.rowId
              );
              return (
                <li key={edge.id}>
                  <button
                    type="button"
                    className="eda-schema-inspector-link"
                    onClick={() =>
                      onSelect({ kind: "relationship", edgeId: edge.id })
                    }
                  >
                    <Link2 aria-hidden="true" />
                    {otherNode?.title}.{otherRow?.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {project && source && definition && (
        <RelateTo
          graph={graph}
          from={{ nodeId: node.id, rowId: row.id }}
          onSelect={onSelect}
        />
      )}
    </>
  );
}

function ProjectFieldEditor({
  project,
  source,
  field,
}: {
  project: SchemaProjectEditing;
  source: SourceDefinition;
  field: FieldDefinition;
}) {
  const updateField = (update: Partial<FieldDefinition>) =>
    updateSource(project, source.id, (item) => ({
      ...item,
      fields: item.fields.map((candidate) =>
        candidate.id === field.id ? { ...candidate, ...update } : candidate
      ),
    }));
  const isKey = source.entityKey === field.id;
  return (
    <>
      <Field label="Name">
        <CommitInput
          label={`Name of ${field.name}`}
          value={field.name}
          placeholder={field.id}
          onCommit={(name) => updateField({ name: name.trim() || field.id })}
        />
      </Field>
      <Field label="Type">
        <Select
          value={field.type ?? "unknown"}
          onValueChange={(type) =>
            updateField({ type: type as FieldDefinition["type"] })
          }
        >
          <SelectTrigger aria-label={`Type of ${field.name}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(DECLARED_TYPE_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isKey}
        tooltip={
          isKey
            ? `${field.name} identifies each ${source.name} record`
            : `Identify each ${source.name} record by ${field.name}`
        }
        onClick={() =>
          updateSource(project, source.id, (item) => ({
            ...item,
            entityKey: field.id,
          }))
        }
      >
        <KeyRound aria-hidden="true" />
        {isKey ? "Key field" : "Use as key"}
      </Button>
    </>
  );
}

const WORKSPACE_TYPES: DataType[] = [
  "numeric",
  "categorical",
  "datetime",
  "boolean",
];

function WorkspaceFieldEditor({
  field,
  editing,
  inferred,
}: {
  field: string;
  editing: NonNullable<SchemaEditing["fields"]>;
  inferred?: DataType;
}) {
  const settings = editing.settings(field);
  const [error, setError] = useState("");
  const update = (updates: Parameters<typeof editing.update>[1]) => {
    try {
      editing.update(field, updates);
      setError("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };
  return (
    <>
      <Field label="Label">
        <CommitInput
          label={`Label of ${field}`}
          value={settings.label ?? ""}
          placeholder={field}
          onCommit={(label) => update({ label: label.trim() || undefined })}
        />
      </Field>
      <Field label="Unit">
        <CommitInput
          label={`Unit of ${field}`}
          value={settings.unit ?? ""}
          placeholder="None"
          onCommit={(unit) => update({ unit: unit.trim() || undefined })}
        />
      </Field>
      <Field label="Type">
        <Select
          value={settings.type ?? "auto"}
          onValueChange={(type) =>
            update({ type: type === "auto" ? undefined : (type as DataType) })
          }
        >
          <SelectTrigger aria-label={`Type of ${field}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">
              Detected{inferred ? ` (${typeLabels[inferred]})` : ""}
            </SelectItem>
            {WORKSPACE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {typeLabels[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>
      {error && <p className="eda-schema-inspector-error">{error}</p>}
    </>
  );
}

/** The keyboard and touch path for relating fields: pick the other field. */
function RelateTo({
  graph,
  from,
  onSelect,
}: {
  graph: SchemaGraph;
  from: SchemaEndpoint;
  onSelect: (selection: SchemaSelection) => void;
}) {
  const [tableId, setTableId] = useState("");
  const tables = graph.nodes.filter(
    (node) => node.kind === "table" && node.id !== from.nodeId && node.sourceId
  );
  const table = tables.find((node) => node.id === tableId);
  if (!tables.length) return null;
  return (
    <div className="eda-schema-inspector-section">
      <span>Relate to</span>
      <div className="eda-schema-inspector-pair">
        <Select value={tableId} onValueChange={setTableId}>
          <SelectTrigger aria-label="Table to relate to">
            <SelectValue placeholder="Table" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((node) => (
              <SelectItem key={node.id} value={node.id}>
                {node.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value=""
          disabled={!table}
          onValueChange={(rowId) =>
            table &&
            onSelect({
              kind: "proposal",
              from,
              to: { nodeId: table.id, rowId },
            })
          }
        >
          <SelectTrigger aria-label="Field to relate to">
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {table?.rows.map((row) => (
              <SelectItem key={row.id} value={row.id}>
                {row.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function MatchFacts({
  project,
  from,
  to,
}: {
  project: SchemaProjectEditing;
  from: FieldRef;
  to: FieldRef;
}) {
  const counts = useMemo(
    () =>
      countMatches(
        project.tables[from.sourceId] ?? [],
        from.fieldId,
        project.tables[to.sourceId] ?? [],
        to.fieldId
      ),
    [project.tables, from.sourceId, from.fieldId, to.sourceId, to.fieldId]
  );
  return (
    <dl className="eda-schema-inspector-counts">
      <div>
        <dt>Matched</dt>
        <dd>{counts.matched.toLocaleString("en-US")}</dd>
      </div>
      <div>
        <dt>Unmatched</dt>
        <dd>{counts.unmatched.toLocaleString("en-US")}</dd>
      </div>
      <div>
        <dt>Ambiguous</dt>
        <dd data-warning={counts.ambiguous > 0 || undefined}>
          {counts.ambiguous.toLocaleString("en-US")}
        </dd>
      </div>
    </dl>
  );
}

function LinkLine({
  project,
  from,
  to,
}: {
  project: SchemaProjectEditing;
  from: FieldRef;
  to: FieldRef;
}) {
  return (
    <p className="eda-schema-inspector-pairline">
      <span>
        {sourceName(project.project, from.sourceId)}.
        {fieldName(project.project, from)}
      </span>
      <ArrowRight aria-label="matches" />
      <span>
        {sourceName(project.project, to.sourceId)}.
        {fieldName(project.project, to)}
      </span>
    </p>
  );
}

function CardinalitySelect({
  value,
  onChange,
}: {
  value: Cardinality;
  onChange: (value: Cardinality) => void;
}) {
  return (
    <Field label="Cardinality">
      <Select
        value={value}
        onValueChange={(next) => onChange(next as Cardinality)}
      >
        <SelectTrigger aria-label="Relationship cardinality">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(CARDINALITY_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </Field>
  );
}

const AMBIGUOUS_TEXT =
  "Some rows match more than one record. Choose One to many or Many to many, then summarize or expand the matches in a query.";

function RelationshipBody({
  edgeId,
  graph,
  editing,
  onSelect,
}: {
  edgeId: string;
  graph: SchemaGraph;
  editing?: SchemaProjectEditing;
  onSelect: (selection: SchemaSelection | undefined) => void;
}) {
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const edge = graph.edges.find((item) => item.id === edgeId);
  const relationship = editing?.project.relationships.find(
    (item) => item.id === edge?.relationshipId
  );
  if (!edge) return null;
  if (!editing || !relationship) {
    const from = graph.nodes.find((node) => node.id === edge.from.nodeId);
    const to = graph.nodes.find((node) => node.id === edge.to.nodeId);
    return (
      <p className="eda-schema-inspector-facts">
        {edge.label} · {from?.title} → {to?.title} ·{" "}
        {CARDINALITY_LABELS[edge.cardinality ?? "many-to-one"]}
      </p>
    );
  }
  const affected = queriesUsingRelationship(editing.project, relationship.id);
  const setCardinality = (cardinality: Cardinality) => {
    const counts = countMatches(
      editing.tables[relationship.from.sourceId] ?? [],
      relationship.from.fieldId,
      editing.tables[relationship.to.sourceId] ?? [],
      relationship.to.fieldId
    );
    if (blockedByAmbiguity(counts, cardinality)) {
      setBlocked(true);
      return;
    }
    setBlocked(false);
    editing.onChange(
      replaceRelationship(editing.project, relationship.id, {
        ...relationship,
        cardinality,
      } satisfies RelationshipDefinition)
    );
  };
  return (
    <>
      <p className="eda-schema-inspector-facts">{relationship.name}</p>
      <LinkLine
        project={editing}
        from={relationship.from}
        to={relationship.to}
      />
      <MatchFacts
        project={editing}
        from={relationship.from}
        to={relationship.to}
      />
      <CardinalitySelect
        value={relationship.cardinality}
        onChange={setCardinality}
      />
      {blocked && (
        <p className="eda-schema-inspector-error">{AMBIGUOUS_TEXT}</p>
      )}
      <p className="eda-schema-inspector-hint">
        {affected.length
          ? `Followed by ${affected.map((query) => query.name).join(", ")}`
          : "No query follows this relationship yet."}
      </p>
      {confirmRemove ? (
        <div
          className="eda-schema-inspector-confirm"
          role="group"
          aria-label="Remove relationship"
        >
          <p>
            {affected.length
              ? `${affected.length === 1 ? "1 query keeps" : `${affected.length} queries keep`} a step that follows it, left for repair in the Query panel.`
              : "Nothing follows this relationship."}
          </p>
          <div className="eda-schema-inspector-actions">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={() => {
                editing.onChange(
                  removeRelationship(editing.project, relationship.id)
                );
                onSelect(undefined);
              }}
            >
              Remove
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setConfirmRemove(false)}
            >
              Keep it
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setConfirmRemove(true)}
        >
          <Trash2 aria-hidden="true" />
          Remove relationship
        </Button>
      )}
    </>
  );
}

function ProposalBody({
  graph,
  from,
  to,
  editing,
  onSelect,
}: {
  graph: SchemaGraph;
  from: SchemaEndpoint;
  to: SchemaEndpoint;
  editing?: SchemaProjectEditing;
  onSelect: (selection: SchemaSelection | undefined) => void;
}) {
  const fromRef = endpointRef(graph, from);
  const toRef = endpointRef(graph, to);
  const counts = useMemo(
    () =>
      editing && fromRef && toRef
        ? countMatches(
            editing.tables[fromRef.sourceId] ?? [],
            fromRef.fieldId,
            editing.tables[toRef.sourceId] ?? [],
            toRef.fieldId
          )
        : undefined,
    [
      editing,
      fromRef?.sourceId,
      fromRef?.fieldId,
      toRef?.sourceId,
      toRef?.fieldId,
    ]
  );
  const [cardinality, setCardinality] = useState<Cardinality>(
    counts?.ambiguous ? "one-to-many" : "many-to-one"
  );
  if (!editing || !fromRef || !toRef) return null;
  const problem = proposalProblem(editing.project, fromRef, toRef);
  const blocked = blockedByAmbiguity(counts, cardinality);
  return (
    <>
      <LinkLine project={editing} from={fromRef} to={toRef} />
      <MatchFacts project={editing} from={fromRef} to={toRef} />
      <CardinalitySelect value={cardinality} onChange={setCardinality} />
      {problem && <p className="eda-schema-inspector-error">{problem}</p>}
      {!problem && blocked && (
        <p className="eda-schema-inspector-error">{AMBIGUOUS_TEXT}</p>
      )}
      <div className="eda-schema-inspector-actions">
        <Button
          type="button"
          size="sm"
          disabled={Boolean(problem) || blocked}
          onClick={() => {
            const relationship = proposeRelationship(
              editing.project,
              fromRef,
              toRef,
              cardinality
            );
            editing.onChange(addRelationship(editing.project, relationship));
            onSelect({
              kind: "relationship",
              edgeId: `relationship:${relationship.id}`,
            });
          }}
        >
          <Link2 aria-hidden="true" />
          Create relationship
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => onSelect({ kind: "field", ...from })}
        >
          Cancel
        </Button>
      </div>
    </>
  );
}

/** The chart or section heading a view row sits under. */
function headingOf(node: SchemaNode, rowId: string) {
  const index = node.rows.findIndex((row) => row.id === rowId);
  for (let at = index - 1; at >= 0; at -= 1) {
    if (node.rows[at]!.kind === "heading") return node.rows[at]!.label;
  }
  return undefined;
}

/**
 * Where a field comes from and what reads it, through calculations and into
 * each view. Each entry selects that row; a chart in this workspace can be
 * shown directly.
 */
function Lineage({
  graph,
  field,
  charts,
  onSelect,
}: {
  graph: SchemaGraph;
  field: SchemaEndpoint;
  charts?: SchemaChartLinks;
  onSelect: (selection: SchemaSelection) => void;
}) {
  const trace = useMemo(() => traceField(graph, field), [graph, field]);
  const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
  const describe = (end: SchemaEndpoint) => {
    const node = nodes.get(end.nodeId);
    const row = node?.rows.find((item) => item.id === end.rowId);
    return node && row ? { node, row } : undefined;
  };
  const sources = trace.upstream
    .map(describe)
    .filter(
      (item): item is NonNullable<typeof item> =>
        Boolean(item) && item!.node.kind === "table"
    );
  const uses = trace.downstream
    .map(describe)
    .filter(
      (item): item is NonNullable<typeof item> =>
        Boolean(item) &&
        (item!.row.kind === "use" || item!.row.mark !== undefined)
    );
  const self = describe(field);
  const hasViews = graph.nodes.some((node) => node.kind === "view");
  const reachesView = uses.some((item) => item.row.kind === "use");
  const select = (item: { node: SchemaNode; row: SchemaRow }) =>
    onSelect({ kind: "field", nodeId: item.node.id, rowId: item.row.id });

  return (
    <>
      {self?.node.kind !== "table" && sources.length > 0 && (
        <div className="eda-schema-inspector-section">
          <span>Comes from</span>
          <ul>
            {sources.map((item) => (
              <li key={`${item.node.id}/${item.row.id}`}>
                <button
                  type="button"
                  className="eda-schema-inspector-link"
                  onClick={() => select(item)}
                >
                  {item.node.title}.{item.row.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {uses.length > 0 && (
        <div className="eda-schema-inspector-section">
          <span>Used by</span>
          <ul>
            {uses.map((item) => {
              const heading =
                item.row.kind === "use"
                  ? headingOf(item.node, item.row.id)
                  : undefined;
              const chartId =
                charts?.nodeId === item.node.id ? item.row.chartId : undefined;
              const text =
                item.row.kind === "use"
                  ? item.node.folded
                    ? [item.node.title, item.row.label]
                    : [item.node.title, heading, item.row.detail]
                        .filter(Boolean)
                        .join(" · ")
                  : `${item.row.mark} ${item.row.label} in ${item.node.title}`;
              return (
                <li
                  key={`${item.node.id}/${item.row.id}`}
                  className="eda-schema-inspector-use"
                >
                  <button
                    type="button"
                    className="eda-schema-inspector-link"
                    onClick={() => select(item)}
                  >
                    {text}
                  </button>
                  {chartId && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={`Show ${heading ?? "the chart"}`}
                      tooltip="Close the diagram and show this chart"
                      onClick={() => charts!.onShowChart(chartId)}
                    >
                      Show
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {hasViews &&
        self?.row.kind !== "use" &&
        self?.node.kind !== "view" &&
        !reachesView && (
          <p className="eda-schema-inspector-hint">Not used by any view.</p>
        )}
    </>
  );
}
