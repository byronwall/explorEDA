/**
 * Reads a notebook in a project: its rows come from the query an
 * `eda query=` line names, as an analysis file's do, or the project's first.
 */
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import type { DslDiagnostic } from "@/lib/dsl";
import { parseDocument } from "@/lib/dsl/parse";
import type {
  AnalysisProject,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import type { datum } from "@/types/ChartTypes";
import { compileNotebook, type NotebookCompileResult } from "./compileNotebook";
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

export interface NotebookReadResult extends NotebookCompileResult {
  queryId: string;
  /** The rows every block charts; write-back needs them too. */
  rows: Array<Record<string, datum>>;
}

/** The query the notebook's `eda query=` line names, and where it says so. */
function namedQuery(text: string) {
  for (const block of parseNotebook(text).blocks) {
    const eda = parseDocument(block.text).declarations.find(
      (item) => item.keyword === "eda"
    );
    const pair = eda?.pairs.find((item) => item.key === "query");
    if (pair) {
      return {
        queryId: pair.value.items[0]?.text ?? "",
        line: pair.span.line + block.startLine - 1,
        column: pair.span.column,
      };
    }
  }
  return undefined;
}

export function readNotebookText(
  text: string,
  context: NotebookContext
): NotebookReadResult {
  const { project, tables } = context;
  const named = namedQuery(text);
  const queryId =
    named?.queryId ?? context.defaultQueryId ?? project.queries[0]?.id ?? "";
  const problems: DslDiagnostic[] = [];
  let rows: Array<Record<string, datum>> = [];
  const query = project.queries.find((item) => item.id === queryId);
  if (!query) {
    problems.push({
      severity: "error",
      effect: "rows-missing",
      message: queryId
        ? `No query is named ${queryId}.`
        : "The project has no query for this notebook to chart.",
      line: named?.line ?? 1,
      column: named?.column ?? 1,
      length: 4,
      suggestion: project.queries.length
        ? `Use query=${project.queries.map((item) => item.id).join(", query=")}.`
        : "Add a source with path= so the notebook has rows.",
    });
  } else {
    try {
      rows = evaluateAnalysisQuery(project, tables, query.id, {}).rows.map(
        (row) => row.data
      );
    } catch (error) {
      problems.push({
        severity: "error",
        effect: "rows-missing",
        message: `${query.id} can't run: ${error instanceof Error ? error.message : String(error)}`,
        line: named?.line ?? 1,
        column: 1,
        length: 4,
      });
    }
  }
  const compiled = compileNotebook(text, {
    rows,
    name: context.name,
    lastValid: context.lastValid,
  });
  const diagnostics = [...problems, ...compiled.diagnostics];
  return {
    ...compiled,
    diagnostics,
    complete: diagnostics.length === 0,
    queryId,
    rows,
  };
}
