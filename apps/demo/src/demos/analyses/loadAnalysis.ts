import { compileViews, type AnalysisSourceRow } from "exploreda";
import { evaluateAnalysisQuery } from "exploreda/analysis";
import { parseCsvData } from "@/csvParser";
import type { ExampleView } from "../exampleViews";
import type { ExampleAnalysis } from "./types";

export type AnalysisTables = Record<string, readonly AnalysisSourceRow[]>;

/**
 * Parses one source table. The CSV parser turns full ISO timestamps into
 * Date objects; tables keep them as text, like every other date.
 */
export async function parseTable(text: string) {
  const rows = (await parseCsvData(text)) as AnalysisSourceRow[];
  for (const row of rows) {
    for (const [key, value] of Object.entries(row)) {
      if ((value as unknown) instanceof Date) {
        row[key] = (value as unknown as Date).toISOString();
      }
    }
  }
  return rows;
}

/** Fetches and parses every source table of an analysis. */
export async function loadAnalysisTables(
  analysis: ExampleAnalysis,
  signal?: AbortSignal
): Promise<AnalysisTables> {
  const entries = await Promise.all(
    Object.entries(analysis.tableFiles).map(async ([sourceId, url]) => {
      const response = await fetch(url, { signal });
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
      }
      return [sourceId, await parseTable(await response.text())] as const;
    })
  );
  return Object.fromEntries(entries);
}

export function analysisQueryId(analysis: ExampleAnalysis) {
  return analysis.queryId ?? analysis.project.queries[0]!.id;
}

/** Rows of the query's first source that the text is checked against. */
const SAMPLE_ROWS = 2000;

/**
 * Builds the analysis tabs from its dashboard text. The text is checked
 * against the query's result for the first rows of its base table; the
 * workspace then evaluates the whole query. Pass `sample: false` to check
 * every row.
 */
export function buildAnalysisViews(
  analysis: ExampleAnalysis,
  tables: AnalysisTables,
  { sample = true }: { sample?: boolean } = {}
) {
  const queryId = analysisQueryId(analysis);
  const query = analysis.project.queries.find((item) => item.id === queryId);
  const base = query?.steps.find((step) => step.kind === "source");
  const checked =
    sample && base?.kind === "source" && tables[base.sourceId]
      ? {
          ...tables,
          [base.sourceId]: tables[base.sourceId]!.slice(0, SAMPLE_ROWS),
        }
      : tables;
  const rows = evaluateAnalysisQuery(
    analysis.project,
    checked,
    queryId
  ).rows.map((row) => row.data);
  const result = compileViews(analysis.text, { rows });
  const [main, ...rest] = result.views;
  const views: ExampleView[] = rest.map((view) => ({
    name: view.name,
    queryId,
    savedData: view.settings,
  }));
  return {
    name: main!.name,
    savedData: main!.settings,
    views,
    diagnostics: result.diagnostics,
    skippedCharts: result.skippedCharts,
  };
}

/** Builds a single-table example's tabs from its dashboard text. */
export function buildTextViews(text: string, rows: Record<string, unknown>[]) {
  const result = compileViews(text, { rows: rows as AnalysisSourceRow[] });
  const [main, ...rest] = result.views;
  return {
    name: main!.name,
    savedData: main!.settings,
    views: rest.map((view) => ({ name: view.name, savedData: view.settings })),
    diagnostics: result.diagnostics,
    skippedCharts: result.skippedCharts,
  };
}

/**
 * Loads an analysis example's tables and builds its tabs. The result opens
 * like any project example.
 */
export async function resolveAnalysisExample<
  T extends {
    analysis?: ExampleAnalysis;
    title: string;
  },
>(example: T, signal?: AbortSignal) {
  if (!example.analysis) {
    return example;
  }
  const tables = await loadAnalysisTables(example.analysis, signal);
  const built = buildAnalysisViews(example.analysis, tables);
  return {
    ...example,
    project: example.analysis.project,
    tables,
    savedData: built.savedData,
    views: built.views,
    viewName: built.name,
  };
}
