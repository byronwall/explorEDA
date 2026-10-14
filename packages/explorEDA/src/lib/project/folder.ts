/**
 * Reads a project folder: the project text, every analysis file, and the
 * data their sources name. A folder holds `exploreda.eda` at its root, or
 * `.exploreda/project.eda` when the project keeps its text out of sight.
 * Every other `.eda` file is an analysis. Source paths are relative to the
 * folder; an absolute path reads a file outside it.
 */
import type {
  AnalysisProject,
  AnalysisQuery,
  AnalysisSourceRow,
  SourceDefinition,
} from "@/types/AnalysisProject";
import { sourceFromRows } from "@/lib/analysis/sources";
import type { DslDiagnostic } from "@/lib/dsl";
import {
  compileProjectText,
  labelFromId,
  type ConnectionDefinition,
  type DatabaseSource,
} from "@/lib/dsl/project";
import { readAnalysisText, type AnalysisTextResult } from "./analysisText";
import { isAbsolutePath, ProjectFileError, type ProjectFiles } from "./files";
import { isDataFile, parseTable } from "./tables";
import { parseSnapshot, snapshotPath, type SnapshotInfo } from "./snapshots";

export const PROJECT_FILE = "exploreda.eda";
export const HIDDEN_PROJECT_FILE = ".exploreda/project.eda";

export type ProjectLayout = "visible" | "hidden" | "none";

/** A problem with the line it sits on, in the file it belongs to. */
export interface ProjectProblem extends DslDiagnostic {
  path: string;
}

export interface FolderAnalysis {
  path: string;
  text: string;
  result: AnalysisTextResult;
}

export interface ProjectFolder {
  layout: ProjectLayout;
  /** The project text's path; undefined until the first save writes one. */
  projectPath?: string;
  project: AnalysisProject;
  /** Source ID to the path its declaration names. */
  paths: Record<string, string>;
  /** The project's database connections, without their secrets. */
  connections: ConnectionDefinition[];
  /** Source ID to the database it reads. */
  databases: Record<string, DatabaseSource>;
  /** Each database source's last read, by source ID. */
  snapshots: Record<string, SnapshotInfo>;
  tables: Record<string, AnalysisSourceRow[]>;
  /** Sources whose fields, or key, came from their data. */
  inferredSources: string[];
  /**
   * Each inferred source as its text declares it, before its data filled
   * it in, so a save that changes nothing about it writes it the same way.
   */
  declaredSources: Record<string, SourceDefinition>;
  /** Sources an analysis file declares, by source ID, with that file. */
  localSources: Record<string, string>;
  /** Queries made to read one source each; project text doesn't list them. */
  implicitQueries: string[];
  /** Sources whose file or snapshot is missing or unreadable. */
  missingSources: string[];
  /** Sources read from outside the folder, so the project isn't portable. */
  outsideSources: string[];
  /** Every data file in the folder, used by a source or not. */
  dataFiles: string[];
  analyses: FolderAnalysis[];
  problems: ProjectProblem[];
}

function problem(
  path: string,
  message: string,
  extra: Partial<DslDiagnostic> = {}
): ProjectProblem {
  return {
    path,
    severity: "error",
    effect: "rows-missing",
    message,
    line: 1,
    column: 1,
    length: 1,
    ...extra,
  };
}

/** The analysis's name from its file: `sales/by-region.eda` → "by-region". */
export function analysisNameFromPath(path: string) {
  return path
    .split("/")
    .at(-1)!
    .replace(/\.eda$/i, "");
}

/** The project's layout and text path, from the files that exist. */
export function projectLayout(paths: readonly string[]): {
  layout: ProjectLayout;
  projectPath?: string;
} {
  if (paths.includes(PROJECT_FILE)) {
    return { layout: "visible", projectPath: PROJECT_FILE };
  }
  if (paths.includes(HIDDEN_PROJECT_FILE)) {
    return { layout: "hidden", projectPath: HIDDEN_PROJECT_FILE };
  }
  return { layout: "none" };
}

/** Fills in a source's fields and key from its rows, where text left them out. */
function inferSource(
  source: SourceDefinition,
  rows: AnalysisSourceRow[]
): { source: SourceDefinition; rows: AnalysisSourceRow[] } | undefined {
  if (source.fields.length && source.entityKey) {
    return undefined;
  }
  const inferred = sourceFromRows(source.id, source.name, rows);
  const fields = source.fields.length
    ? source.fields
    : inferred.source.fields.map((field) => ({
        ...field,
        name: labelFromId(field.id),
      }));
  return {
    source: {
      ...source,
      entityKey: source.entityKey || inferred.source.entityKey,
      fields,
    },
    rows: source.entityKey ? rows : inferred.rows,
  };
}

/** A database source's snapshot, or why there isn't one to use. */
async function readSnapshot(
  files: ProjectFiles,
  sourceId: string
): Promise<
  | ReturnType<typeof parseSnapshot>
  | { problem: string; suggestion: string; unread?: boolean }
> {
  let text: string;
  try {
    text = await files.read(snapshotPath(sourceId));
  } catch (error) {
    if (error instanceof ProjectFileError && error.code === "missing") {
      return {
        problem: `${sourceId} hasn't been read from its database yet.`,
        suggestion: "Refresh it to read its rows.",
        unread: true,
      };
    }
    throw error;
  }
  try {
    return parseSnapshot(text);
  } catch (error) {
    return {
      problem: `${sourceId}'s snapshot can't be read: ${error instanceof Error ? error.message : String(error)}`,
      suggestion: "Refresh it to read its rows again.",
    };
  }
}

/**
 * A database source with the types its snapshot read, for fields its text
 * declares without one. Text that lists no fields takes the snapshot's.
 */
function withSnapshotTypes(
  source: SourceDefinition,
  info: SnapshotInfo
): SourceDefinition {
  const types = new Map(info.fields.map((field) => [field.id, field.type]));
  if (!source.fields.length) {
    return {
      ...source,
      fields: info.fields.map((field) => ({
        id: field.id,
        name: labelFromId(field.id),
        type: field.type,
      })),
    };
  }
  return {
    ...source,
    fields: source.fields.map((field) =>
      field.type || !types.has(field.id)
        ? field
        : { ...field, type: types.get(field.id) }
    ),
  };
}

/** Reads a whole project folder through any file adapter. */
export async function readProjectFolder(
  files: ProjectFiles
): Promise<ProjectFolder> {
  const listed = await files.list();
  const { layout, projectPath } = projectLayout(listed);
  const problems: ProjectProblem[] = [];
  const withPath = (path: string, items: DslDiagnostic[]) =>
    items.map((item) => ({ ...item, path }));

  let project: AnalysisProject = {
    id: "",
    version: 1,
    sources: [],
    relationships: [],
    queries: [],
  };
  const paths: Record<string, string> = {};
  let connections: ConnectionDefinition[] = [];
  let databases: Record<string, DatabaseSource> = {};
  if (projectPath) {
    const compiled = compileProjectText(await files.read(projectPath));
    project = compiled.project;
    Object.assign(paths, compiled.paths);
    connections = compiled.connections;
    databases = compiled.databases;
    problems.push(...withPath(projectPath, compiled.diagnostics));
  }

  // Analyses may bring their own sources; the project's win on a clash.
  const analysisPaths = listed.filter(
    (path) => path.toLowerCase().endsWith(".eda") && path !== projectPath
  );
  const texts = new Map<string, string>();
  const localSources: Record<string, string> = {};
  const implicitQueries: string[] = [];
  const defaultQuery = new Map<string, string>();
  for (const path of analysisPaths) {
    const text = await files.read(path);
    texts.set(path, text);
    const local = compileProjectText(text, { fragment: true });
    problems.push(...withPath(path, local.diagnostics));
    for (const source of local.project.sources) {
      if (project.sources.some((item) => item.id === source.id)) {
        if (localSources[source.id] && localSources[source.id] !== path) {
          problems.push(
            problem(
              path,
              `${localSources[source.id]} already declares ${source.id}, so this file reads that one.`,
              {
                severity: "warning",
                effect: "setting-ignored",
              }
            )
          );
        }
        defaultQuery.set(path, defaultQuery.get(path) ?? source.id);
        continue;
      }
      project.sources.push(source);
      paths[source.id] = local.paths[source.id]!;
      localSources[source.id] = path;
      defaultQuery.set(path, defaultQuery.get(path) ?? source.id);
    }
  }

  // Every source can be charted on its own: one with no query of its name
  // gets a query that reads it, which project text never needs to spell out.
  for (const source of project.sources) {
    if (!project.queries.some((query) => query.id === source.id)) {
      const query: AnalysisQuery = {
        id: source.id,
        name: source.name,
        glyph: source.glyph,
        frameLabel: source.id,
        steps: [{ id: source.id, kind: "source", sourceId: source.id }],
        outputStepId: source.id,
      };
      project.queries.push(query);
      implicitQueries.push(query.id);
    }
  }

  const tables: Record<string, AnalysisSourceRow[]> = {};
  const inferredSources: string[] = [];
  const declaredSources: Record<string, SourceDefinition> = {};
  const missingSources: string[] = [];
  const outsideSources: string[] = [];
  const snapshots: Record<string, SnapshotInfo> = {};
  const declaredIn = (sourceId: string) =>
    localSources[sourceId] ?? projectPath ?? PROJECT_FILE;
  for (const [index, source] of project.sources.entries()) {
    const database = databases[source.id];
    if (database) {
      const read = await readSnapshot(files, source.id);
      if ("problem" in read) {
        missingSources.push(source.id);
        tables[source.id] = [];
        problems.push(
          problem(declaredIn(source.id), read.problem, {
            subject: source.id,
            suggestion: read.suggestion,
            ...(read.unread ? { severity: "warning" as const } : {}),
          })
        );
        continue;
      }
      snapshots[source.id] = read.info;
      const typed = withSnapshotTypes(source, read.info);
      const inferred = inferSource(typed, read.rows);
      const loaded = inferred?.source ?? typed;
      if (loaded !== source) {
        // A save writes the source as its text declared it.
        declaredSources[source.id] = source;
        inferredSources.push(source.id);
      }
      project.sources[index] = loaded;
      tables[source.id] = inferred?.rows ?? read.rows;
      continue;
    }
    const path = paths[source.id];
    if (path === undefined) {
      tables[source.id] = [];
      continue;
    }
    if (isAbsolutePath(path)) {
      outsideSources.push(source.id);
    }
    let rows: AnalysisSourceRow[];
    try {
      rows = parseTable(path, await files.read(path));
    } catch (error) {
      missingSources.push(source.id);
      tables[source.id] = [];
      problems.push(
        problem(
          declaredIn(source.id),
          error instanceof ProjectFileError && error.code === "missing"
            ? `${source.id} reads ${path}, which doesn't exist.`
            : `${source.id} can't read ${path}: ${error instanceof Error ? error.message : String(error)}`,
          {
            subject: source.id,
            suggestion:
              "Fix path= or restore the file; the other sources still load.",
          }
        )
      );
      continue;
    }
    const inferred = inferSource(source, rows);
    if (inferred) {
      declaredSources[source.id] = source;
      project.sources[index] = inferred.source;
      rows = inferred.rows;
      inferredSources.push(source.id);
    }
    tables[source.id] = rows;
  }
  for (const source of project.sources) {
    if (!source.entityKey && !missingSources.includes(source.id)) {
      problems.push(
        problem(declaredIn(source.id), `${source.id} has no key=.`, {
          subject: source.id,
          suggestion:
            "Name the field that identifies each row, as key=orderId.",
        })
      );
    }
  }

  const analyses: FolderAnalysis[] = analysisPaths.map((path) => {
    const text = texts.get(path)!;
    const result = readAnalysisText(text, {
      project,
      tables,
      defaultQueryId: defaultQuery.get(path),
      name: analysisNameFromPath(path),
    });
    problems.push(...withPath(path, result.diagnostics));
    return { path, text, result };
  });

  return {
    layout,
    ...(projectPath ? { projectPath } : {}),
    project,
    paths,
    connections,
    databases,
    snapshots,
    tables,
    inferredSources,
    declaredSources,
    localSources,
    implicitQueries,
    missingSources,
    outsideSources,
    // `.exploreda/` holds the app's own records, never data.
    dataFiles: listed.filter(
      (path) => isDataFile(path) && !path.startsWith(".exploreda/")
    ),
    analyses,
    problems,
  };
}
