import { compileViews, readNotebookText } from "exploreda";
import { compileProjectText, evaluateAnalysisQuery } from "exploreda/analysis";
import type { DeclaredFieldType } from "exploreda/readers";
import { parseTable } from "../demos/analyses/loadAnalysis";
import { corpusLinks, CORPUS_URL } from "../../dailyLinks.mjs";
import { evaluateFinding, type DailyFinding } from "./findings";

export type DailyKind = "notebook" | "composition" | "dashboard";

/** One piece as authored in `public/daily-viz/catalog.json`. */
export interface DailyCatalogEntry {
  id: string;
  slug: string;
  kind: DailyKind;
  title: string;
  question: string;
  summary: string;
  /** Folder under `projects/`, holding `exploreda.eda` and its data. */
  family: string;
  /** The piece's file in that folder. */
  entry: string;
  /** Design note or investigation guide for a composition or dashboard. */
  companion?: string;
  query: string;
  industry: string;
  analysis: string;
  /** The day the piece appears, `YYYY-MM-DD`; later days stay hidden. */
  published: string;
  /** Parts of a deep dive, read in order. */
  series?: { id: string; title: string; part: number };
  findings: DailyFinding[];
}

/** A catalogue entry plus what `dailyCorpus.mjs` derives from its files. */
export interface DailyEntry extends DailyCatalogEntry {
  entryPath: string;
  projectPath: string;
  companionPath?: string;
  charts: string[];
  marks: string[];
  features: string[];
  related: string[];
}

export interface DailyDataset {
  id: string;
  title: string;
  publisher: string;
  url: string;
  license: string;
  license_url: string;
  version: string;
  notes: string;
}

export interface DailyIndex {
  entries: DailyEntry[];
  datasets: DailyDataset[];
  tables: Record<string, { id: string; path: string; rows: number }[]>;
}

export const kindLabels: Record<DailyKind, string> = {
  notebook: "Notebook",
  composition: "Composition",
  dashboard: "Dashboard",
};
export const dailyPath = (entry: { slug: string }) => `/daily/${entry.slug}`;

/** Today in the reader's own time zone, as `YYYY-MM-DD`. */
export const todayKey = () => new Date().toLocaleDateString("en-CA");

/** Pieces whose day has come, newest first. */
export function publishedEntries(entries: DailyEntry[], today = todayKey()) {
  return entries
    .filter((entry) => entry.published <= today)
    .sort((a, b) => b.published.localeCompare(a.published));
}

/** "Oct 16" or "Oct 16, 2026" when the year differs from this one. */
export function formatDay(day: string, withYear = false) {
  return new Date(`${day}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(withYear && { year: "numeric" }),
  });
}

/** The chart word in dashboard text for a native chart type, such as `table`. */
export const chartWordOf: Record<string, string[]> = {
  bar: ["hist", "bar"],
  "data-table": ["table"],
  "metric-card": ["metric"],
  "parallel-coordinates": ["parallel"],
};
export const assetPath = (file: string) => `${CORPUS_URL}/${file}`;

/**
 * A lookup with no matching row is a fact about the data, such as a flight
 * with no weather hour, not a reason to refuse the page.
 */
export function queryProblems<T extends { code?: string }>(diagnostics: T[]) {
  return diagnostics.filter((item) => item.code !== "missing-lookup");
}

async function read(file: string, signal?: AbortSignal) {
  const response = await fetch(assetPath(file), { signal });
  if (!response.ok)
    throw new Error(`Could not load ${file} (${response.status}).`);
  return response.text();
}

/** Reads the same project, local data, and text the folder viewer opens. */
export async function loadDailyEntry(entry: DailyEntry, signal?: AbortSignal) {
  const [text, projectText] = await Promise.all([
    read(entry.entryPath, signal),
    read(entry.projectPath, signal),
  ]);
  const compiled = compileProjectText(projectText);
  if (compiled.diagnostics.length)
    throw new Error(compiled.diagnostics[0]!.message);
  const folder = `projects/${entry.family}/`;
  const tables = Object.fromEntries(
    await Promise.all(
      Object.entries(compiled.paths).map(async ([id, file]) => [
        id,
        await parseTable(await read(folder + file, signal)),
      ])
    )
  );
  const queryRows = (id: string) => {
    const query = evaluateAnalysisQuery(compiled.project, tables, id);
    const problem = queryProblems(query.diagnostics)[0];
    if (problem) throw new Error(problem.message);
    return query;
  };
  const query = queryRows(entry.query);
  const rows = query.rows.map((row) => row.data);
  const fieldTypes: Record<string, DeclaredFieldType> = {};
  for (const field of query.fields) {
    if (field.type && field.type !== "unknown")
      fieldTypes[field.id] = field.type;
  }
  const result =
    entry.kind === "notebook"
      ? readNotebookText(text, { project: compiled.project, tables })
      : compileViews(text, { rows });
  if (result.diagnostics.length)
    throw new Error(result.diagnostics[0]!.message);
  const companion = entry.companionPath
    ? await read(entry.companionPath, signal)
    : "";
  const findings = entry.findings.map((finding) =>
    evaluateFinding(
      finding,
      finding.query && finding.query !== entry.query
        ? queryRows(finding.query).rows.map((row) => row.data)
        : rows
    )
  );
  return {
    text: corpusLinks(text, entry.entryPath),
    rows,
    fieldTypes,
    findings,
    companion: entry.companionPath
      ? corpusLinks(companion, entry.companionPath).replace(/^# .+\n/, "")
      : "",
    settings: "views" in result ? result.views[0]!.settings : result.settings,
  };
}
