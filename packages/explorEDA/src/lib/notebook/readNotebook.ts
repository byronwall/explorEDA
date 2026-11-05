/**
 * Reads a notebook in a project. Its rows come from the query the first
 * `eda query=` line names, as an analysis file's do, or the project's first.
 * A block that names another query charts that query's rows, with the other
 * blocks that name it.
 */
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import type { DslDiagnostic } from "@/lib/dsl";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import type { datum } from "@/types/ChartTypes";
import {
  blockQueries,
  compileNotebook,
  type NotebookCompileResult,
} from "./compileNotebook";
import { parseNotebook } from "./parseNotebook";

export interface NotebookContext {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** The query when the notebook names none. Defaults to the project's first. */
  defaultQueryId?: string;
  /** The notebook's name, such as its file's. */
  name?: string;
  /** Each block's last valid text; see compileNotebook. */
  lastValid?: Record<number, string>;
}

type Rows = Array<Record<string, datum>>;

export interface NotebookReadResult extends NotebookCompileResult {
  queryId: string;
  /** The rows the notebook's own blocks chart; write-back needs them too. */
  rows: Rows;
  /** Rows of each other query a block names, by query ID. */
  queryRows: Record<string, Rows>;
}

export function readNotebookText(
  text: string,
  context: NotebookContext
): NotebookReadResult {
  const { project, tables } = context;
  const named = blockQueries(parseNotebook(text));
  const first = named.find(Boolean);
  const queryId =
    first?.id ?? context.defaultQueryId ?? project.queries[0]?.id ?? "";
  const problems: DslDiagnostic[] = [];
  const known = project.queries.map((item) => item.id);
  const rowsOf = (id: string, at?: { line: number; column: number }) => {
    const query = project.queries.find((item) => item.id === id);
    if (!query) {
      problems.push({
        severity: "error",
        effect: "rows-missing",
        message: id
          ? `No query is named ${id}.`
          : "The project has no query for this notebook to chart.",
        line: at?.line ?? 1,
        column: at?.column ?? 1,
        length: 4,
        suggestion: known.length
          ? `Name one of the project's queries: ${known.join(", ")}.`
          : "Add a source with path= so the notebook has rows.",
      });
      return undefined;
    }
    try {
      return evaluateAnalysisQuery(project, tables, query.id, {}).rows.map(
        (row) => row.data
      );
    } catch (error) {
      problems.push({
        severity: "error",
        effect: "rows-missing",
        message: `${query.id} can't run: ${error instanceof Error ? error.message : String(error)}`,
        line: at?.line ?? 1,
        column: 1,
        length: 4,
      });
      return [];
    }
  };
  const rows = rowsOf(queryId, first) ?? [];
  const queryRows: Record<string, Rows> = {};
  for (const query of named) {
    if (!query || query.id === queryId || query.id in queryRows) continue;
    const found = rowsOf(query.id, query);
    if (found) queryRows[query.id] = found;
  }
  const groups = Object.keys(queryRows);
  const options = { name: context.name, lastValid: context.lastValid, groups };
  const main = compileNotebook(text, { ...options, rows });
  // Each other query's blocks compile apart, against that query's rows.
  const others = groups.map((group) =>
    compileNotebook(text, { ...options, rows: queryRows[group]!, group })
  );
  const all = [main, ...others];
  const blocks = main.blocks.map((block, index) => {
    const group = main.groups[index];
    return group ? others[groups.indexOf(group)]!.blocks[index]! : block;
  });
  const diagnostics = [
    ...problems,
    ...all.flatMap((item) => item.diagnostics),
  ].sort((a, b) => a.line - b.line || a.column - b.column);
  return {
    ...main,
    blocks,
    diagnostics,
    charts: all.flatMap((item) => item.charts),
    skippedCharts: all.flatMap((item) => item.skippedCharts),
    complete: diagnostics.length === 0,
    queryId,
    rows,
    queryRows,
  };
}
