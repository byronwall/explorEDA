import type {
  AnalysisProject,
  AnalysisSourceRow,
  FieldDefinition,
  RelationshipDefinition,
} from "@/types/AnalysisProject";
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
  rows: SchemaRow[];
}

export interface SchemaRow {
  id: string;
  label: string;
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
  kind: "relationship" | "calculation";
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

/** The tables of a project, their fields, and the relationships among them. */
export function projectSchemaGraph(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]> = {}
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

  return { nodes, edges };
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
}: {
  title: string;
  rowCount?: number;
  fields: TableSchemaField[];
  calculations: TableSchemaCalculation[];
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
  return {
    nodes: [
      {
        id: nodeId,
        kind: "table",
        title,
        detail: rowCount === undefined ? undefined : rowCountLabel(rowCount),
        rows,
      },
    ],
    edges,
  };
}
