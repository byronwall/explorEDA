/**
 * An analysis file: dashboard text whose views chart a project's queries.
 * `eda query=` names the file's query; a view line can name its own and
 * give parameter values, as in
 * `view "Aster in January" query=customer-instance bind.customerId=C1`.
 */
import type {
  AnalysisProject,
  AnalysisScalar,
  AnalysisSourceRow,
} from "@/types/AnalysisProject";
import type { SavedDataStructure } from "@/types/SavedDataStructure";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import {
  compileViews,
  exportViews,
  type DslChartResult,
  type DslDiagnostic,
} from "@/lib/dsl";
import { viewHeaders } from "@/lib/dsl/compile";
import { parseDocument, type DslDeclaration } from "@/lib/dsl/parse";
import { encodeScalar } from "@/lib/dsl/paths";

const BIND = "bind.";

export interface AnalysisTextView {
  name: string;
  queryId: string;
  bindings?: Record<string, AnalysisScalar>;
  settings: SavedDataStructure;
}

export interface AnalysisTextResult {
  name: string;
  views: AnalysisTextView[];
  diagnostics: DslDiagnostic[];
  charts: DslChartResult[];
  skippedCharts: DslChartResult[];
  complete: boolean;
}

export interface AnalysisTextContext {
  project: AnalysisProject;
  tables: Record<string, readonly AnalysisSourceRow[]>;
  /** The query when the text names none. Defaults to the project's first. */
  defaultQueryId?: string;
  /** The name when the text has no `dashboard` line, such as the file's. */
  name?: string;
}

function pairText(declaration: DslDeclaration | undefined, key: string) {
  const pair = declaration?.pairs.find((item) => item.key === key);
  return pair?.value.items.map((item) => item.text).join(",");
}

function bindValue(item: { text: string; quoted: boolean }): AnalysisScalar {
  if (item.quoted) {
    return item.text;
  }
  if (item.text === "null") {
    return null;
  }
  if (item.text === "true" || item.text === "false") {
    return item.text === "true";
  }
  const number = Number(item.text);
  return item.text.trim() !== "" && Number.isFinite(number)
    ? number
    : item.text;
}

function bindingsOf(header: DslDeclaration | undefined) {
  const pairs = header?.pairs.filter((pair) => pair.key.startsWith(BIND));
  if (!pairs?.length) {
    return undefined;
  }
  return Object.fromEntries(
    pairs.map((pair) => [
      pair.key.slice(BIND.length),
      bindValue(pair.value.items[0] ?? { text: "", quoted: false }),
    ])
  );
}

/** The query and parameter values each view of the text reads. */
export function analysisViewQueries(
  text: string,
  defaultQueryId?: string
): Array<{ queryId?: string; bindings?: Record<string, AnalysisScalar> }> {
  const { declarations } = parseDocument(text);
  const fileQuery =
    pairText(
      declarations.find((item) => item.keyword === "eda"),
      "query"
    ) ?? defaultQueryId;
  const headers = viewHeaders(declarations);
  return (headers.length ? headers : [undefined]).map((header) => {
    const bindings = bindingsOf(header);
    return {
      queryId: pairText(header, "query") ?? fileQuery,
      ...(bindings ? { bindings } : {}),
    };
  });
}

/** Builds every view of an analysis from its own query's rows. */
export function readAnalysisText(
  text: string,
  context: AnalysisTextContext
): AnalysisTextResult {
  const { project, tables } = context;
  const fallback = context.defaultQueryId ?? project.queries[0]?.id;
  const targets = analysisViewQueries(text, fallback);
  const headers = viewHeaders(parseDocument(text).declarations);
  const problems: DslDiagnostic[] = [];
  const rowsFor = targets.map((target, index) => {
    const line = headers[index]?.span.line ?? 1;
    const query = project.queries.find((item) => item.id === target.queryId);
    if (!query) {
      problems.push({
        severity: "error",
        effect: "rows-missing",
        message: target.queryId
          ? `No query is named ${target.queryId}.`
          : "The project has no query for this analysis to chart.",
        line,
        column: 1,
        length: 4,
        suggestion: project.queries.length
          ? `Use query=${project.queries.map((item) => item.id).join(", query=")}.`
          : "Add a source with path= so the analysis has rows.",
      });
      return [];
    }
    try {
      return evaluateAnalysisQuery(
        project,
        tables,
        query.id,
        target.bindings ?? {}
      ).rows.map((row) => row.data);
    } catch (error) {
      problems.push({
        severity: "error",
        effect: "rows-missing",
        message: `${query.id} can't run: ${error instanceof Error ? error.message : String(error)}`,
        line,
        column: 1,
        length: 4,
      });
      return [];
    }
  });
  const result = compileViews(
    text,
    { rows: rowsFor[0] ?? [], name: context.name },
    (index) => ({ rows: rowsFor[index] ?? [], name: context.name })
  );
  const diagnostics = [...problems, ...result.diagnostics];
  return {
    name: result.name,
    views: result.views.map((view, index) => ({
      name: view.name,
      queryId: targets[index]?.queryId ?? "",
      ...(targets[index]?.bindings
        ? { bindings: targets[index]!.bindings }
        : {}),
      settings: view.settings,
    })),
    diagnostics,
    charts: result.charts,
    skippedCharts: result.skippedCharts,
    complete: diagnostics.length === 0,
  };
}

function bindTokens(bindings: Record<string, AnalysisScalar> | undefined) {
  return Object.entries(bindings ?? {})
    .filter(([, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${BIND}${key}=${encodeScalar(value as string | number | boolean | null)}`
    );
}

/**
 * Writes an analysis's views as text that `readAnalysisText` reads back.
 * The first view's query is named once, on an `eda` line; a view that
 * charts another names its own.
 */
export function exportAnalysisText(
  views: AnalysisTextView[],
  context: AnalysisTextContext
): { text: string; omitted: string[] } {
  const first = views[0];
  if (!first) {
    return { text: "", omitted: [] };
  }
  const rows = (() => {
    try {
      return evaluateAnalysisQuery(
        context.project,
        context.tables,
        first.queryId,
        first.bindings ?? {}
      ).rows.map((row) => row.data);
    } catch {
      return [];
    }
  })();
  const exported = exportViews(
    views.map((view) => ({ name: view.name, settings: view.settings })),
    { rows, name: context.name }
  );
  // The first view's query is the file's; other views name their own.
  const shared = first.queryId;
  let index = 0;
  const lines = exported.text.split("\n").map((line) => {
    const match = /^view (.+) \{$/.exec(line);
    if (!match) {
      return line;
    }
    const view = views[index++];
    const tokens = [
      ...(view && view.queryId !== shared ? [`query=${view.queryId}`] : []),
      ...bindTokens(view?.bindings),
    ];
    return tokens.length ? `view ${match[1]} ${tokens.join(" ")} {` : line;
  });
  return {
    text: `eda query=${shared}\n${lines.join("\n")}`,
    omitted: exported.omitted,
  };
}
