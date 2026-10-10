import type {
  AnalysisEvaluation,
  AnalysisField,
  AnalysisProject,
  AnalysisQuery,
  AnalysisSourceRow,
  AnalysisStep,
  FieldDefinition,
  RelationshipDefinition,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { parseExpression } from "@/lib/calculations/parser/semantics";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import {
  fieldName as queryFieldName,
  stepDetail,
  stepTitle,
} from "@/components/project/queryEditing";
import {
  settingsFieldUsage,
  type FieldUsePlace,
  type SettingsFieldUsage,
} from "@/components/project/settingsCompatibility";
import {
  detectColumnType,
  type DataType,
} from "@/components/SummaryTable/utils/dataTypeDetection";

/**
 * Everything the schema diagram draws: cards with rows, and lines between
 * rows. The diagram reads only this shape, never a project or a store, so a
 * project and a single table draw the same way.
 */
export interface SchemaGraph {
  nodes: SchemaNode[];
  edges: SchemaEdge[];
}

export type SchemaNodeKind = "table" | "query" | "view";

export interface SchemaNode {
  id: string;
  kind: SchemaNodeKind;
  title: string;
  /** A short mark beside the title, such as a source's glyph. */
  glyph?: string;
  /** A fact under the title, such as the row count. */
  detail?: string;
  /** The project source a table card draws. */
  sourceId?: string;
  /** The query a query card draws, or that a view card reads. */
  queryId?: string;
  /** The saved view a view card draws. */
  viewId?: string;
  rows: SchemaRow[];
}

export interface SchemaRow {
  id: string;
  /**
   * A field (the default), a query step, a chart or section heading in a
   * view, or one place a view reads a field.
   */
  kind?: "field" | "step" | "heading" | "use";
  label: string;
  /** A short fact at the end of the row, such as how a view uses a field. */
  detail?: string;
  /** ƒ for a calculation, Σ for a summary. */
  mark?: "ƒ" | "Σ";
  /** What a step row does. */
  step?: AnalysisStep["kind"];
  /** The chart a view's use row sits under. */
  chartId?: string;
  /** A reference the diagram could not resolve, or a failed calculation. */
  status?: "missing" | "error";
  /** The underlying field name, when the label is a display name. */
  field?: string;
  dataType?: DataType;
  /** The table's entity key. */
  key?: boolean;
  /** A calculated field, with the expression that makes it. */
  calculation?: { expression: string; error?: string };
}

export interface SchemaEndpoint {
  nodeId: string;
  rowId: string;
}

export interface SchemaEdge {
  id: string;
  /**
   * A relationship between tables; a calculation's input; lineage from a
   * table to a query step; or usage of a field by a view.
   */
  kind: "relationship" | "calculation" | "lineage" | "usage";
  from: SchemaEndpoint;
  to: SchemaEndpoint;
  label?: string;
  cardinality?: RelationshipDefinition["cardinality"];
  /** The project relationship a relationship line draws. */
  relationshipId?: string;
}

const DECLARED_TYPES: Record<
  NonNullable<FieldDefinition["type"]>,
  DataType | undefined
> = {
  number: "numeric",
  string: "categorical",
  boolean: "boolean",
  date: "datetime",
  unknown: undefined,
};

/** Enough rows to tell a column's type without reading a large table. */
const TYPE_SAMPLE = 500;

function sampledType(
  rows: readonly AnalysisSourceRow[] | undefined,
  field: string
): DataType | undefined {
  if (!rows?.length) return undefined;
  const column: Record<number, AnalysisSourceRow[string]> = {};
  const count = Math.min(rows.length, TYPE_SAMPLE);
  for (let index = 0; index < count; index += 1) {
    column[index] = rows[index]![field];
  }
  return detectColumnType(column);
}

export const rowCountLabel = (count: number) =>
  `${count.toLocaleString("en-US")} ${count === 1 ? "row" : "rows"}`;

export const tableNodeId = (sourceId: string) => `table:${sourceId}`;
export const fieldRowId = (fieldId: string) => `field:${fieldId}`;
/** A line can end at a card's header rather than one of its rows. */
export const HEADER_ROW = "header";

/** A saved view whose charts the diagram traces back to its query. */
export interface SchemaViewInput {
  id: string;
  name: string;
  queryId: string;
  settings?: SavedDataStructure;
}

/**
 * The tables of a project, their fields, and the relationships among them;
 * then each query's steps and calculated fields; then each view's use of
 * fields, traced back to where the fields come from.
 */
export function projectSchemaGraph(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]> = {},
  views: SchemaViewInput[] = []
): SchemaGraph {
  const nodes: SchemaNode[] = project.sources.map((source) => {
    const rows = tables[source.id];
    return {
      id: tableNodeId(source.id),
      kind: "table",
      title: source.name,
      glyph: source.glyph,
      detail: rows ? rowCountLabel(rows.length) : undefined,
      sourceId: source.id,
      rows: source.fields.map((field) => ({
        id: fieldRowId(field.id),
        label: field.name,
        field: field.id,
        dataType:
          (field.type && DECLARED_TYPES[field.type]) ??
          sampledType(rows, field.id),
        key: field.id === source.entityKey || undefined,
      })),
    };
  });

  const known = new Set(
    project.sources.flatMap((source) =>
      source.fields.map((field) => `${source.id}\u0000${field.id}`)
    )
  );
  const edges: SchemaEdge[] = project.relationships
    .filter(
      (relationship) =>
        known.has(
          `${relationship.from.sourceId}\u0000${relationship.from.fieldId}`
        ) &&
        known.has(`${relationship.to.sourceId}\u0000${relationship.to.fieldId}`)
    )
    .map((relationship) => ({
      id: `relationship:${relationship.id}`,
      kind: "relationship",
      from: {
        nodeId: tableNodeId(relationship.from.sourceId),
        rowId: fieldRowId(relationship.from.fieldId),
      },
      to: {
        nodeId: tableNodeId(relationship.to.sourceId),
        rowId: fieldRowId(relationship.to.fieldId),
      },
      label: relationship.name,
      cardinality: relationship.cardinality,
      relationshipId: relationship.id,
    }));

  const queries = project.queries.map((query) => queryLineage(project, query));
  for (const lineage of queries) {
    nodes.push(lineage.node);
    edges.push(...lineage.edges);
  }
  const byQuery = new Map(queries.map((lineage) => [lineage.queryId, lineage]));
  for (const view of views) {
    const lineage = byQuery.get(view.queryId);
    const query = project.queries.find((item) => item.id === view.queryId);
    const viewNode = usageNode({
      id: `view:${view.id}`,
      title: view.name.trim() || query?.name || "View",
      glyph: query?.glyph,
      detail: query ? undefined : "Missing query",
      usage: settingsFieldUsage(view.settings),
      label: (field) => lineage?.labels.get(field) ?? undefined,
      origin: (field) => lineage?.outputs.get(field),
    });
    viewNode.node.queryId = view.queryId;
    viewNode.node.viewId = view.id;
    nodes.push(viewNode.node);
    edges.push(...viewNode.edges);
  }
  return { nodes, edges };
}

/** Defined but empty tables give each step's fields and origins, fast. */
function emptyTables(project: AnalysisProject) {
  return Object.fromEntries(project.sources.map((source) => [source.id, []]));
}

const stepRowId = (stepId: string) => `step:${stepId}`;
const measureRowId = (stepId: string, measureId: string) =>
  `measure:${stepId}:${measureId}`;

interface QueryLineage {
  queryId: string;
  node: SchemaNode;
  edges: SchemaEdge[];
  /** Where each output field comes from, for the views that read it. */
  outputs: Map<string, SchemaEndpoint>;
  labels: Map<string, string>;
}

/** A query's steps as rows, with lines from the tables and fields they read. */
function queryLineage(
  project: AnalysisProject,
  query: AnalysisQuery
): QueryLineage {
  const nodeId = `query:${query.id}`;
  const rows: SchemaRow[] = [];
  const edges: SchemaEdge[] = [];
  const outputs = new Map<string, SchemaEndpoint>();
  const labels = new Map<string, string>();
  let evaluation: AnalysisEvaluation | undefined;
  let problem: string | undefined;
  try {
    evaluation = evaluateAnalysisQuery(project, emptyTables(project), query.id);
  } catch (error) {
    problem = error instanceof Error ? error.message : String(error);
  }
  const stages = new Map(
    (evaluation?.stages ?? []).map((stage) => [stage.stepId, stage])
  );
  const stepsById = new Map(query.steps.map((step) => [step.id, step]));

  /** The row a field comes from: a table's field, or this query's step. */
  const originOf = (field: AnalysisField): SchemaEndpoint | undefined => {
    if ("sourceId" in field.origin) {
      return {
        nodeId: tableNodeId(field.origin.sourceId),
        rowId: fieldRowId(field.origin.fieldId),
      };
    }
    const step = stepsById.get(field.origin.stepId);
    if (!step) return undefined;
    if (step.kind === "aggregate") {
      const measure = step.measures.find((item) => item.id === field.id);
      return {
        nodeId,
        rowId: measure ? measureRowId(step.id, measure.id) : stepRowId(step.id),
      };
    }
    return { nodeId, rowId: stepRowId(step.id) };
  };
  const inputFields = (stepId: string) => {
    const step = stepsById.get(stepId);
    return step && step.kind !== "source"
      ? (stages.get(step.inputStepId)?.fields ?? [])
      : [];
  };
  let edgeCount = 0;
  const link = (
    kind: SchemaEdge["kind"],
    from: SchemaEndpoint | undefined,
    rowId: string
  ) => {
    if (!from) return;
    edges.push({
      id: `${kind}:${nodeId}:${(edgeCount += 1)}`,
      kind,
      from,
      to: { nodeId, rowId },
    });
  };
  const inputEdge = (stepId: string, fieldId: string, rowId: string) => {
    const field = inputFields(stepId).find((item) => item.id === fieldId);
    link("calculation", field && originOf(field), rowId);
    return Boolean(field);
  };

  for (const step of query.steps) {
    const rowId = stepRowId(step.id);
    const detail = stepDetail(step, project, inputFields(step.id)) ?? undefined;
    switch (step.kind) {
      case "source":
        rows.push({
          id: rowId,
          kind: "step",
          step: step.kind,
          label: stepTitle(step, project),
        });
        link(
          "lineage",
          { nodeId: tableNodeId(step.sourceId), rowId: HEADER_ROW },
          rowId
        );
        break;
      case "lookup":
      case "expand": {
        rows.push({
          id: rowId,
          kind: "step",
          step: step.kind,
          label: stepTitle(step, project),
          detail: step.as,
        });
        const added = stages
          .get(step.id)
          ?.fields.find((field) => field.id.startsWith(`${step.as}.`));
        if (added && "sourceId" in added.origin) {
          link(
            "lineage",
            { nodeId: tableNodeId(added.origin.sourceId), rowId: HEADER_ROW },
            rowId
          );
        }
        break;
      }
      case "calculate": {
        let error: string | undefined;
        let dependencies: string[] = [];
        try {
          dependencies = parseDependencies(step.expression);
        } catch (caught) {
          error = caught instanceof Error ? caught.message : String(caught);
        }
        const missing = dependencies.filter(
          (field) => !inputEdge(step.id, field, rowId)
        );
        rows.push({
          id: rowId,
          kind: "field",
          step: step.kind,
          label: step.label,
          field: step.fieldId,
          mark: "ƒ",
          calculation: {
            expression: step.expression,
            error:
              error ??
              (missing.length
                ? `Unknown fields: ${missing.join(", ")}`
                : undefined),
          },
          status: error || missing.length ? "error" : undefined,
        });
        break;
      }
      case "filter":
        // The condition says more than "Keep matching rows" does.
        rows.push({
          id: rowId,
          kind: "step",
          step: step.kind,
          label: detail ? `Keep ${detail}` : stepTitle(step, project),
        });
        inputEdge(step.id, step.fieldId, rowId);
        break;
      case "aggregate":
        rows.push({
          id: rowId,
          kind: "step",
          step: step.kind,
          label: stepTitle(step, project),
          detail,
        });
        step.groupBy.forEach((field) => inputEdge(step.id, field, rowId));
        for (const measure of step.measures) {
          const measureRow = measureRowId(step.id, measure.id);
          rows.push({
            id: measureRow,
            kind: "field",
            label: measure.label,
            field: measure.id,
            mark: "Σ",
            detail: measure.operation,
          });
          if (measure.fieldId) inputEdge(step.id, measure.fieldId, measureRow);
        }
        break;
    }
  }

  for (const field of evaluation?.fields ?? []) {
    const origin = originOf(field);
    if (origin) outputs.set(field.id, origin);
    labels.set(field.id, queryFieldName(project, evaluation!.fields, field.id));
  }

  return {
    queryId: query.id,
    node: {
      id: nodeId,
      kind: "query",
      title: query.name,
      glyph: query.glyph,
      detail: problem ? "Cannot run" : undefined,
      queryId: query.id,
      rows,
    },
    edges,
    outputs,
    labels,
  };
}

function parseDependencies(expression: string) {
  return parseExpression(expression).dependencies;
}

const PLACE_HEADINGS: Record<
  Exclude<FieldUsePlace["kind"], "chart">,
  string
> = {
  rows: "Rows",
  aggregate: "Summaries",
  calculation: "Calculations",
};

/**
 * A card for one view: each chart, then Rows and summaries, with a row for
 * each field it reads and a line from where that field comes from. A view's
 * own calculated fields are rows too, fed by the fields they read.
 */
function usageNode({
  id,
  title,
  glyph,
  detail,
  usage,
  label,
  origin,
}: {
  id: string;
  title: string;
  glyph?: string;
  detail?: string;
  usage: SettingsFieldUsage;
  label: (field: string) => string | undefined;
  origin: (field: string) => SchemaEndpoint | undefined;
}): { node: SchemaNode; edges: SchemaEdge[] } {
  const rows: SchemaRow[] = [];
  const edges: SchemaEdge[] = [];
  const calculations = new Map(
    usage.calculations.map((calculation) => [calculation.name, calculation])
  );
  const sourceOf = (field: string): SchemaEndpoint | undefined =>
    calculations.has(field)
      ? { nodeId: id, rowId: `calc:${field}` }
      : origin(field);
  const name = (field: string) => label(field) ?? field;

  // Group uses by where they are, then by field, so one row names every
  // role a field plays in a chart.
  const groups = new Map<
    string,
    { heading: string; chartId?: string; fields: Map<string, string[]> }
  >();
  for (const use of usage.uses) {
    if (use.place.kind === "calculation") continue;
    const key =
      use.place.kind === "chart"
        ? `chart:${use.place.chartId}`
        : use.place.kind;
    const heading =
      use.place.kind === "chart"
        ? use.place.title
        : PLACE_HEADINGS[use.place.kind];
    const group = groups.get(key) ?? {
      heading,
      chartId: use.place.kind === "chart" ? use.place.chartId : undefined,
      fields: new Map(),
    };
    groups.set(key, group);
    const roles = group.fields.get(use.field) ?? [];
    if (!roles.includes(use.place.role)) roles.push(use.place.role);
    group.fields.set(use.field, roles);
  }

  let edgeCount = 0;
  const link = (
    kind: SchemaEdge["kind"],
    from: SchemaEndpoint | undefined,
    rowId: string
  ) => {
    if (!from) return;
    edges.push({
      id: `${kind}:${id}:${(edgeCount += 1)}`,
      kind,
      from,
      to: { nodeId: id, rowId },
    });
  };

  for (const [key, group] of groups) {
    rows.push({ id: `${key}:heading`, kind: "heading", label: group.heading });
    for (const [field, roles] of group.fields) {
      const rowId = `use:${key}:${field}`;
      const from = sourceOf(field);
      rows.push({
        id: rowId,
        kind: "use",
        label: name(field),
        field,
        chartId: group.chartId,
        detail: roles.join(", "),
        status: from ? undefined : "missing",
      });
      link("usage", from, rowId);
    }
  }
  if (calculations.size) {
    rows.push({
      id: "calculations:heading",
      kind: "heading",
      label: "Calculations",
    });
    for (const calculation of calculations.values()) {
      const rowId = `calc:${calculation.name}`;
      const missing = calculation.dependencies.filter(
        (field) => !sourceOf(field)
      );
      rows.push({
        id: rowId,
        kind: "field",
        label: name(calculation.name),
        field: calculation.name,
        mark: "ƒ",
        calculation: {
          expression: calculation.expression,
          error:
            calculation.error ??
            (missing.length
              ? `Unknown fields: ${missing.join(", ")}`
              : undefined),
        },
        status: calculation.error || missing.length ? "error" : undefined,
      });
      for (const field of new Set(calculation.dependencies)) {
        link("calculation", sourceOf(field), rowId);
      }
    }
  }
  return {
    node: { id, kind: "view", title, glyph, detail, rows },
    edges,
  };
}

export interface TableSchemaField {
  name: string;
  label: string;
  dataType?: DataType;
}

export interface TableSchemaCalculation {
  name: string;
  expression: string;
  dependencies: string[];
}

/**
 * One table: a single-table workspace's fields, with its calculated fields
 * last and lines from each calculation's inputs.
 */
export function tableSchemaGraph({
  title,
  rowCount,
  fields,
  calculations,
  settings,
}: {
  title: string;
  rowCount?: number;
  fields: TableSchemaField[];
  calculations: TableSchemaCalculation[];
  /** The workspace's charts, Rows, and summaries, to show what uses each field. */
  settings?: SavedDataStructure;
}): SchemaGraph {
  const nodeId = "table:data";
  const calculated = new Map(
    calculations.map((calculation) => [calculation.name, calculation])
  );
  const sourceFields = fields.filter((field) => !calculated.has(field.name));
  const byName = new Map(fields.map((field) => [field.name, field]));
  const rows: SchemaRow[] = [
    ...sourceFields.map((field) => ({
      id: fieldRowId(field.name),
      label: field.label,
      field: field.name,
      dataType: field.dataType,
    })),
    ...calculations.map((calculation) => {
      const field = byName.get(calculation.name);
      return {
        id: fieldRowId(calculation.name),
        label: field?.label ?? calculation.name,
        field: calculation.name,
        dataType: field?.dataType,
        calculation: { expression: calculation.expression },
      };
    }),
  ];
  const rowIds = new Set(rows.map((row) => row.id));
  const edges: SchemaEdge[] = calculations.flatMap((calculation) =>
    [...new Set(calculation.dependencies)]
      .filter(
        (input) => input !== calculation.name && rowIds.has(fieldRowId(input))
      )
      .map((input) => ({
        id: `calculation:${calculation.name}:${input}`,
        kind: "calculation" as const,
        from: { nodeId, rowId: fieldRowId(input) },
        to: { nodeId, rowId: fieldRowId(calculation.name) },
      }))
  );
  const nodes: SchemaNode[] = [
    {
      id: nodeId,
      kind: "table",
      title,
      detail: rowCount === undefined ? undefined : rowCountLabel(rowCount),
      rows,
    },
  ];
  const usage = settingsFieldUsage(settings);
  if (usage.uses.some((use) => use.place.kind !== "calculation")) {
    // The table card already lists the calculated fields.
    const view = usageNode({
      id: "view:workspace",
      title: "This workspace",
      usage: { uses: usage.uses, calculations: [] },
      label: (field) => byName.get(field)?.label,
      origin: (field) =>
        rowIds.has(fieldRowId(field))
          ? { nodeId, rowId: fieldRowId(field) }
          : undefined,
    });
    nodes.push(view.node);
    edges.push(...view.edges);
  }
  return { nodes, edges };
}
