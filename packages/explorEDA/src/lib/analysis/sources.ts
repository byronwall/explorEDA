import type {
  AnalysisProject,
  AnalysisQuery,
  AnalysisSourceRow,
  AnalysisView,
  FieldDefinition,
  SourceDefinition,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { evaluateAnalysisQuery } from "./evaluateProject";
import { encodeAnalysisRowKeys } from "@/components/project/analysisRowKeys";

const TYPE_SAMPLE = 500;
const ROW_NUMBER = "row_number";

const DETECTED: Record<
  ReturnType<typeof detectColumnType>,
  FieldDefinition["type"]
> = {
  numeric: "number",
  categorical: "string",
  datetime: "date",
  boolean: "boolean",
};

/** A source ID from a name, unique among the project's sources. */
function sourceId(name: string, taken: Set<string>) {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/\.[a-z0-9]+$/, "")
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "source";
  let id = base;
  for (let n = 2; taken.has(id); n += 1) id = `${base}_${n}`;
  return id;
}

function fieldIds(rows: readonly AnalysisSourceRow[]) {
  const ids = new Set<string>();
  for (const row of rows.slice(0, TYPE_SAMPLE)) {
    Object.keys(row).forEach((key) => key !== "__ID" && ids.add(key));
  }
  return [...ids];
}

function isUnique(rows: readonly AnalysisSourceRow[], field: string) {
  const seen = new Set<unknown>();
  for (const row of rows) {
    const value = row[field];
    if (value == null || value === "" || seen.has(value)) return false;
    seen.add(value);
  }
  return rows.length > 0;
}

/**
 * A source definition for a table of rows: one field per column with a
 * detected type, and a key. The key is an ID-like column (such as `id`,
 * `order_id`, or `code`) or a text column with a distinct value in every row;
 * a number that only happens to be distinct, such as a measure, is not. With
 * no such column, a row number is added to the rows.
 */
export function sourceFromRows(
  id: string,
  name: string,
  rows: readonly AnalysisSourceRow[]
): { source: SourceDefinition; rows: AnalysisSourceRow[] } {
  const ids = fieldIds(rows);
  const fields: FieldDefinition[] = ids.map((field) => {
    const column: Record<number, AnalysisSourceRow[string]> = {};
    rows.slice(0, TYPE_SAMPLE).forEach((row, index) => {
      column[index] = row[field];
    });
    return { id: field, name: field, type: DETECTED[detectColumnType(column)] };
  });
  const idLike = (field: string) => /(^|[^a-z])(id|key|code)$/i.test(field);
  const typeOf = new Map(fields.map((field) => [field.id, field.type]));
  const key =
    ids.find((field) => idLike(field) && isUnique(rows, field)) ??
    ids.find(
      (field) => typeOf.get(field) === "string" && isUnique(rows, field)
    );
  if (key) {
    return {
      source: {
        id,
        name,
        glyph: name.trim()[0]?.toUpperCase() ?? "S",
        entityKey: key,
        fields,
      },
      rows: [...rows],
    };
  }
  let rowField = ROW_NUMBER;
  for (let n = 2; ids.includes(rowField); n += 1)
    rowField = `${ROW_NUMBER}_${n}`;
  return {
    source: {
      id,
      name,
      glyph: name.trim()[0]?.toUpperCase() ?? "S",
      entityKey: rowField,
      fields: [{ id: rowField, name: "Row number", type: "number" }, ...fields],
    },
    rows: rows.map((row, index) => ({ [rowField]: index + 1, ...row })),
  };
}

/** Adds a table of rows to a project as a new source. */
export function addSourceFromRows(
  project: AnalysisProject,
  tables: Record<string, readonly AnalysisSourceRow[]>,
  name: string,
  rows: readonly AnalysisSourceRow[]
) {
  const id = sourceId(
    name,
    new Set(project.sources.map((source) => source.id))
  );
  const added = sourceFromRows(id, name, rows);
  return {
    sourceId: id,
    project: { ...project, sources: [...project.sources, added.source] },
    tables: { ...tables, [id]: added.rows },
  };
}

const FIELD_KEY = /(^field$|Field$|Variable$)/;

/**
 * Renames field references in saved settings: chart and Rows settings that
 * name a field, field settings, and fields in calculation expressions.
 * Titles and other text stay as they are.
 */
export function renameSettingsFields(
  settings: SavedDataStructure,
  rename: (field: string) => string | undefined
): SavedDataStructure {
  const visit = (value: unknown, key?: string): unknown => {
    if (Array.isArray(value)) return value.map((item) => visit(item, key));
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([childKey, child]) => [
          childKey,
          visit(child, childKey),
        ])
      );
    }
    if (typeof value === "string" && key && FIELD_KEY.test(key)) {
      return rename(value) ?? value;
    }
    return value;
  };
  const renamed = visit({
    ...settings,
    calculations: [],
    fieldSettings: {},
  }) as SavedDataStructure;
  return {
    ...renamed,
    calculations: settings.calculations.map((calculation) => ({
      ...calculation,
      expression: calculation.expression.replace(
        /\[\s*(["'])((?:\\.|(?!\1).)*)\1\s*\]/g,
        (match, quote: string, field: string) => {
          const next = rename(field);
          return next ? `[${quote}${next}${quote}]` : match;
        }
      ),
    })),
    fieldSettings: settings.fieldSettings
      ? Object.fromEntries(
          Object.entries(settings.fieldSettings).map(([field, value]) => [
            rename(field) ?? field,
            value,
          ])
        )
      : settings.fieldSettings,
  };
}

/**
 * Turns a single-table workspace into a project with one source, one query
 * that reads it, and a view with the workspace's charts. Field references
 * and row selections in the saved settings move to the project's names, so
 * the charts, filters, and layout come back the same.
 */
export function singleTableProject({
  name,
  sourceName = "Data",
  rows,
  settings,
}: {
  /** The query and view's name, such as the workspace's tab. */
  name: string;
  /** The table's name. Field names in the views read "Data Hours". */
  sourceName?: string;
  rows: readonly AnalysisSourceRow[];
  settings?: SavedDataStructure;
}): {
  project: AnalysisProject;
  tables: Record<string, AnalysisSourceRow[]>;
  view: AnalysisView;
} {
  const id = sourceId(sourceName, new Set());
  const added = sourceFromRows(id, sourceName, rows);
  const queryId = `${id}-rows`;
  const stepId = `${queryId}-read`;
  const query: AnalysisQuery = {
    id: queryId,
    name,
    glyph: added.source.glyph,
    frameLabel: sourceName,
    steps: [{ id: stepId, kind: "source", sourceId: id }],
    outputStepId: stepId,
  };
  const project: AnalysisProject = {
    id: `${id}-project`,
    version: 1,
    sources: [added.source],
    relationships: [],
    queries: [query],
  };
  const tables = { [id]: added.rows };
  const view: AnalysisView = { id: `${id}-view`, name, queryId };
  if (!settings) return { project, tables, view };

  const sourceFields = new Set(added.source.fields.map((field) => field.id));
  const renamed = renameSettingsFields(settings, (field) =>
    sourceFields.has(field) ? `${id}.${field}` : undefined
  );
  // Selections saved by row position become the project's row keys. Rows
  // keep their order, so position N is still row N.
  const evaluation = evaluateAnalysisQuery(project, tables, queryId);
  const keysById = new Map(
    evaluation.rows.map((row, index) => [index, row.key])
  );
  return {
    project,
    tables,
    view: { ...view, settings: encodeAnalysisRowKeys(renamed, keysById) },
  };
}
