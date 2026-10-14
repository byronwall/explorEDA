/**
 * Reads a project folder: the project text, every analysis file, and the
 * data their sources name. A folder holds `exploreda.eda` at its root, or
 * `.exploreda/project.eda` when the project keeps its text out of sight.
 * Every other `.eda` file is an analysis, and every `.eda.md` file is a
 * notebook. Source paths are relative to the
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
import { compileProjectText, labelFromId } from "@/lib/dsl/project";
import {
  isNotebookPath,
  notebookNameFromPath,
  readNotebookText,
  type NotebookReadResult,
} from "@/lib/notebook";
import { readAnalysisText, type AnalysisTextResult } from "./analysisText";
import { isAbsolutePath, ProjectFileError, type ProjectFiles } from "./files";
import { isDataFile, parseTable } from "./tables";

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

export interface FolderNotebook {
  path: string;
  text: string;
  result: NotebookReadResult;
}

export interface ProjectFolder {
  layout: ProjectLayout;
  /** The project text's path; undefined until the first save writes one. */
  projectPath?: string;
  project: AnalysisProject;
  /** Source ID to the path its declaration names. */
  paths: Record<string, string>;
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
  /** Sources whose file is missing or unreadable. */
  missingSources: string[];
  /** Sources read from outside the folder, so the project isn't portable. */
  outsideSources: string[];
  /** Every data file in the folder, used by a source or not. */
  dataFiles: string[];
  analyses: FolderAnalysis[];
  notebooks: FolderNotebook[];
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
  if (projectPath) {
    const compiled = compileProjectText(await files.read(projectPath));
    project = compiled.project;
    Object.assign(paths, compiled.paths);
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
  const declaredIn = (sourceId: string) =>
    localSources[sourceId] ?? projectPath ?? PROJECT_FILE;
  for (const [index, source] of project.sources.entries()) {
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

  const notebooks: FolderNotebook[] = [];
  for (const path of listed.filter(isNotebookPath)) {
    const text = await files.read(path);
    const result = readNotebookText(text, {
      project,
      tables,
      name: notebookNameFromPath(path),
    });
    problems.push(...withPath(path, result.diagnostics));
    notebooks.push({ path, text, result });
  }

  return {
    layout,
    ...(projectPath ? { projectPath } : {}),
    project,
    paths,
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
    notebooks,
    problems,
  };
}
