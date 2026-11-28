/**
 * Tools an outside agent calls to build analyses in a project folder:
 * check text, list fields, read the grammar, write a file, and report a
 * problem with these tools. Each takes the project's files and returns
 * plain JSON. The `/mcp` route and `exploreda-dsl` both call them.
 */
import { createHash } from "node:crypto";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  chartSettingReference,
  compositionReference,
  describeDslSource,
  DSL_CHART_KEYWORDS,
  DSL_REFERENCE,
  formatDsl,
  type DslDiagnostic,
} from "@/lib/dsl";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { COMMON_WORDS } from "@/lib/dsl/schema";
import { AGGREGATIONS, isAggregation, reduceNumbers } from "@/lib/aggregates";
import {
  isAbsolutePath,
  normalizeProjectPath,
  ProjectFileError,
  type ProjectFiles,
} from "@/lib/project/files";
import {
  HIDDEN_PROJECT_FILE,
  PROJECT_FILE,
  projectLayout,
  readProjectFolder,
  type ProjectFolder,
} from "@/lib/project/folder";
import { proposeLinks, withoutLocalSources } from "@/lib/project/linkProposals";
import { formatNotebook, isNotebookPath } from "@/lib/notebook";
import { NOTEBOOK_REFERENCE, PROJECT_REFERENCE } from "@/cli/reference";

/** A problem as an agent reads it: where, how bad, what, and the fix. */
export interface ToolProblem {
  path: string;
  line: number;
  column: number;
  severity: DslDiagnostic["severity"];
  message: string;
  fix?: string;
}

export interface CheckResult {
  path: string;
  /** True when every chart built and the file has no problems. */
  complete: boolean;
  views: Array<{ name: string; query: string; charts: number }>;
  charts: number;
  /** This file's problems, then the project text's. */
  problems: ToolProblem[];
  /** What builds but reads poorly to a person, such as repeated titles. */
  notes?: string[];
}

/** A tool's refusal: the reason and what to send instead. */
export class ToolError extends Error {
  constructor(
    message: string,
    readonly fix?: string
  ) {
    super(message);
    this.name = "ToolError";
  }
}

function toProblem(item: DslDiagnostic & { path: string }): ToolProblem {
  return {
    path: item.path,
    line: item.line,
    column: item.column,
    severity: item.severity,
    message: item.message,
    ...(item.suggestion ? { fix: item.suggestion } : {}),
  };
}

/** The analysis path to check or write, or a ToolError saying why not. */
function analysisPath(path: string) {
  const normalized = isAbsolutePath(path)
    ? undefined
    : normalizeProjectPath(path);
  if (!normalized) {
    throw new ToolError(
      `${path} is outside the project folder.`,
      "Give a path inside the folder, such as returns.eda."
    );
  }
  if (!/\.eda(\.md)?$/i.test(normalized)) {
    throw new ToolError(
      `${path} isn't an analysis.`,
      "Name it <name>.eda for a dashboard or <name>.eda.md for a notebook."
    );
  }
  if (
    normalized.startsWith(".exploreda/") &&
    normalized !== ".exploreda/project.eda"
  ) {
    throw new ToolError(
      `${path} is in .exploreda/, which holds the app's own records.`,
      "Write the analysis at the folder's top, such as returns.eda."
    );
  }
  return normalized;
}

/** `files` with `text` in place of the file at `path`, read-only. */
function withText(
  files: ProjectFiles,
  path: string,
  text: string
): ProjectFiles {
  const refuse = async () => {
    throw new ProjectFileError("refused", path, "check writes nothing.");
  };
  return {
    list: async () => {
      const listed = await files.list();
      return listed.includes(path) ? listed : [...listed, path].sort();
    },
    read: (item) => (item === path ? Promise.resolve(text) : files.read(item)),
    write: refuse,
    remove: refuse,
  };
}

function resultFor(read: ProjectFolder, path: string): CheckResult {
  const problems = read.problems
    .filter((item) => item.path === path)
    .concat(
      read.projectPath && read.projectPath !== path
        ? read.problems.filter((item) => item.path === read.projectPath)
        : []
    )
    .map(toProblem);
  const analysis = read.analyses.find((item) => item.path === path);
  const notebook = read.notebooks.find((item) => item.path === path);
  const views =
    analysis?.result.views.map((view) => ({
      name: view.name,
      query: view.queryId,
      charts: view.settings.charts.length,
    })) ?? [];
  const charts =
    analysis?.result.charts.length ?? notebook?.result.charts.length ?? 0;
  const built = analysis?.result.complete ?? notebook?.result.complete ?? true;
  // A person reads titles; the same one twice says nothing.
  const notes = (analysis?.result.views ?? []).flatMap((view) => {
    const seen = new Map<string, number>();
    for (const chart of view.settings.charts) {
      const title = chart.title?.trim() || "(no title)";
      seen.set(title, (seen.get(title) ?? 0) + 1);
    }
    return [...seen]
      .filter(([, count]) => count > 1)
      .map(
        ([title, count]) =>
          `${count} charts in view ${view.name} are titled ${JSON.stringify(title)}; give each a title= that says what it shows.`
      );
  });
  if (analysis && !analysis.result.charts.length) {
    notes.push("This file draws no charts yet.");
  }
  return {
    ...(notes.length ? { notes } : {}),
    path,
    complete: built && !problems.some((item) => item.path === path),
    views,
    charts,
    problems,
  };
}

/** The project text's paths: the app's, at the top or hidden. */
const PROJECT_TEXTS = new Set([PROJECT_FILE, HIDDEN_PROJECT_FILE]);

/**
 * The file a path names. Either project text path names the project's
 * text: the existing one, or for a first save, the place the server keeps
 * a new project's text (`.exploreda/` with `--hidden`).
 */
async function target(files: ProjectFiles, path: string, hidden?: boolean) {
  const normalized = analysisPath(path);
  if (!PROJECT_TEXTS.has(normalized)) {
    return normalized;
  }
  const { projectPath } = projectLayout(await files.list());
  return projectPath ?? (hidden ? HIDDEN_PROJECT_FILE : PROJECT_FILE);
}

/** Where to send an agent that names a query the project lacks. */
function queryFix(queries: Array<{ id: string }>) {
  return queries.length
    ? `Use one of: ${queries.map((item) => item.id).join(", ")}.`
    : "The project has no queries yet. Add data with add_data; each source becomes a query of its name.";
}

/** The parameters a query needs and wasn't given, from its evaluation. */
function unboundParameters(diagnostics: Array<{ message: string }>) {
  return [
    ...new Set(
      diagnostics.flatMap(
        (item) => /^Parameter (\S+) is not bound/.exec(item.message)?.[1] ?? []
      )
    ),
  ];
}

/** A short hash of a file's text; a write must send the one it read. */
export function versionOf(text: string) {
  return createHash("sha1").update(text).digest("hex").slice(0, 12);
}

/** The file's text, or undefined when there is none. */
async function readIfThere(files: ProjectFiles, path: string) {
  try {
    return await files.read(path);
  } catch (error) {
    // By code, not class: the command's file adapter is in another bundle.
    if ((error as { code?: string }).code === "missing") {
      return undefined;
    }
    throw error;
  }
}

/**
 * Refuses a change to an existing file unless `version` is the one its
 * text has now, so an edit made since the agent's read is never lost.
 */
function guard(
  path: string,
  current: string,
  version: string | undefined,
  action: "write" | "rename" | "delete" = "write"
) {
  if (version === versionOf(current)) {
    return;
  }
  const verb = { write: "Changing", rename: "Renaming", delete: "Deleting" }[
    action
  ];
  throw new ToolError(
    version
      ? `${path} changed since you read it; its version is now ${versionOf(current)}.`
      : `${verb} ${path} needs the version read_eda gave, because it exists.`,
    action === "write"
      ? `Call read_eda on ${path}, merge your change into its text, and send its version.`
      : `Call read_eda on ${path} and send its version.`
  );
}

export interface ToolOptions {
  /** `--hidden`: a new project keeps its text in `.exploreda/`. */
  hidden?: boolean;
}

/**
 * Builds `text` as the file at `path` against the project's data, as the
 * app would, and writes nothing.
 */
export async function check(
  files: ProjectFiles,
  input: { path?: string; text: string },
  options: ToolOptions = {}
): Promise<CheckResult> {
  registerAllCharts();
  const path = await target(files, input.path ?? "check.eda", options.hidden);
  return resultFor(
    await readProjectFolder(withText(files, path, input.text)),
    path
  );
}

/** The file's text and its version, for `write_eda`. */
export async function readEda(
  files: ProjectFiles,
  input: { path: string },
  options: ToolOptions = {}
): Promise<{ path: string; text: string; version: string }> {
  const path = await target(files, input.path, options.hidden);
  const text = await readIfThere(files, path);
  if (text === undefined) {
    throw new ToolError(
      `${path} doesn't exist.`,
      "Call project for the folder's analyses, or write_eda to create it."
    );
  }
  return { path, text, version: versionOf(text) };
}

/**
 * Saves the analysis, then returns what `check` returns for it. A new file
 * needs no version; an existing one needs the version `read_eda` gave.
 */
export async function writeEda(
  files: ProjectFiles,
  input: { path: string; text: string; version?: string },
  options: ToolOptions = {}
): Promise<CheckResult & { saved: string; version: string }> {
  const path = await target(files, input.path, options.hidden);
  const current = await readIfThere(files, path);
  if (current !== undefined) {
    guard(path, current, input.version);
  }
  const result = await check(files, { path, text: input.text }, options);
  await files.write(path, input.text);
  return { saved: path, version: versionOf(input.text), ...result };
}

/** Moves an analysis to a new path that is free. */
export async function renameEda(
  files: ProjectFiles,
  input: { from: string; to: string; version?: string }
): Promise<{ renamed: string; to: string; version: string }> {
  const from = analysisPath(input.from);
  const to = analysisPath(input.to);
  if (PROJECT_TEXTS.has(from) || PROJECT_TEXTS.has(to)) {
    throw new ToolError(
      "The project text keeps its path.",
      "Rename analyses and notebooks only."
    );
  }
  if (isNotebookPath(from) !== isNotebookPath(to)) {
    throw new ToolError(
      `${from} and ${to} are different kinds of file.`,
      "Keep .eda for an analysis and .eda.md for a notebook."
    );
  }
  const text = await readIfThere(files, from);
  if (text === undefined) {
    throw new ToolError(`${from} doesn't exist.`);
  }
  guard(from, text, input.version, "rename");
  if ((await readIfThere(files, to)) !== undefined) {
    throw new ToolError(
      `${to} already exists.`,
      "Pick a free path, or delete that file first."
    );
  }
  await files.write(to, text);
  await files.remove(from);
  return { renamed: from, to, version: versionOf(text) };
}

/** Deletes an analysis or notebook; never the project text. */
export async function deleteEda(
  files: ProjectFiles,
  input: { path: string; version?: string }
): Promise<{ deleted: string }> {
  const path = analysisPath(input.path);
  if (PROJECT_TEXTS.has(path)) {
    throw new ToolError(
      "The project text can't be deleted here.",
      "Delete analyses and notebooks only."
    );
  }
  const text = await readIfThere(files, path);
  if (text === undefined) {
    throw new ToolError(`${path} doesn't exist.`);
  }
  guard(path, text, input.version, "delete");
  await files.remove(path);
  return { deleted: path };
}

/** Indents and tidies text as `exploreda-dsl fmt` does; saves nothing. */
export async function format(
  files: ProjectFiles,
  input: { path?: string; text?: string }
): Promise<{ text: string }> {
  const path = input.path ? analysisPath(input.path) : undefined;
  const text =
    input.text ?? (path ? (await readEda(files, { path })).text : undefined);
  if (text === undefined) {
    throw new ToolError("Send text, or the path of a file to format.");
  }
  return {
    text: path && isNotebookPath(path) ? formatNotebook(text) : formatDsl(text),
  };
}

export interface ProjectSummary {
  layout: ProjectFolder["layout"];
  projectPath?: string;
  sources: Array<{
    id: string;
    from: string;
    rows: number;
    notes?: string[];
  }>;
  queries: Array<{ id: string; name: string }>;
  analyses: Array<{
    path: string;
    views: number;
    charts: number;
    problems: number;
  }>;
  notebooks: Array<{ path: string; charts: number; problems: number }>;
  /** Data files in the folder, used by a source or not. */
  dataFiles: string[];
  /** Data files no source reads yet, and what to do about them. */
  unsourced?: string[];
  /** Links the data suggests that the project text doesn't declare. */
  suggestedLinks?: SuggestedLink[];
  next?: string;
  problems: number;
}

/** A relate line the data suggests, with how many rows it matches. */
export interface SuggestedLink {
  relate: string;
  /** Rows of the from table whose value finds a row of the other. */
  matched: number;
  /** Rows of the from table with a value. */
  total: number;
}

/** How an agent adds suggested links: they go in the project text. */
export const LINKS_NEXT =
  "Add each suggestedLinks relate line to the project text (read_eda, then write_eda) unless it is wrong for this data; queries look up across tables only through declared links.";

/**
 * Links between file or database tables that key names and values
 * suggest, as relate lines. With `source`, only links that touch it.
 */
export function suggestedLinks(
  read: ProjectFolder,
  source?: string
): SuggestedLink[] {
  const taken = new Set(read.project.relationships.map((item) => item.id));
  return proposeLinks({
    project: withoutLocalSources(read.project, read.localSources),
    tables: read.tables,
    databases: read.databases,
  })
    .map(({ from, to, matched, total }) => {
      // IDs come before the filter, so project and add_data agree.
      const base = `${from.sourceId}-${to.sourceId}`;
      let id = base;
      for (let n = 1; taken.has(id); n++)
        id = n === 1 ? `${base}-${from.fieldId}` : `${base}-${n}`;
      taken.add(id);
      return {
        from: from.sourceId,
        to: to.sourceId,
        relate: `relate @${id} ${from.sourceId}.${from.fieldId} -> ${to.sourceId}.${to.fieldId}`,
        matched,
        total,
      };
    })
    .filter((link) => !source || link.from === source || link.to === source)
    .map(({ relate, matched, total }) => ({ relate, matched, total }));
}

/** The folder at a glance: its project text, sources, queries, and files. */
export async function project(files: ProjectFiles): Promise<ProjectSummary> {
  registerAllCharts();
  const read = await readProjectFolder(files);
  const count = (path: string) =>
    read.problems.filter((item) => item.path === path).length;
  const sourced = new Set(Object.values(read.paths));
  const unsourced = read.dataFiles.filter((file) => !sourced.has(file));
  const links = suggestedLinks(read);
  const next = [
    ...(unsourced.length
      ? [
          `${unsourced.length === 1 ? "This data file has" : "These data files have"} no source yet. Call add_data with only its path to chart it.`,
        ]
      : []),
    ...(links.length ? [LINKS_NEXT] : []),
  ].join(" ");
  return {
    layout: read.layout,
    ...(read.projectPath ? { projectPath: read.projectPath } : {}),
    sources: read.project.sources.map((source) => {
      const notes = [
        ...(read.missingSources.includes(source.id)
          ? [read.databases[source.id] ? "not read" : "missing"]
          : []),
        ...(read.staleSources.includes(source.id)
          ? ["changed since read"]
          : []),
        ...(read.outsideSources.includes(source.id)
          ? ["outside the folder"]
          : []),
      ];
      const database = read.databases[source.id];
      return {
        id: source.id,
        from: database
          ? `${database.connection}: ${database.table ?? "sql"}`
          : (read.paths[source.id] ?? ""),
        rows: read.tables[source.id]?.length ?? 0,
        ...(notes.length ? { notes } : {}),
      };
    }),
    queries: read.project.queries.map((query) => ({
      id: query.id,
      name: query.name,
    })),
    analyses: read.analyses.map((analysis) => ({
      path: analysis.path,
      views: analysis.result.views.length,
      charts: analysis.result.charts.length,
      problems: count(analysis.path),
    })),
    notebooks: read.notebooks.map((notebook) => ({
      path: notebook.path,
      charts: notebook.result.charts.length,
      problems: count(notebook.path),
    })),
    dataFiles: read.dataFiles,
    ...(unsourced.length ? { unsourced } : {}),
    ...(links.length ? { suggestedLinks: links } : {}),
    ...(next ? { next } : {}),
    problems: read.problems.length,
  };
}

export interface DescribedChart {
  name: string;
  word: string;
  line: number;
  title?: string;
}

/**
 * Every view's charts and row count, and every problem, for one file or
 * the whole folder. It reports what built; it doesn't draw.
 */
export async function describe(
  files: ProjectFiles,
  input: { path?: string } = {}
) {
  registerAllCharts();
  const read = await readProjectFolder(files);
  const only = input.path ? analysisPath(input.path) : undefined;
  const rowsOf = (queryId: string, bindings?: Record<string, never>) => {
    try {
      return evaluateAnalysisQuery(read.project, read.tables, queryId, bindings)
        .rows.length;
    } catch {
      return 0;
    }
  };
  const charted = (
    results: Array<{
      line: number;
      subject: string;
      type: string;
      id?: string;
    }>,
    titles: Map<string, string>
  ): DescribedChart[] =>
    results.map((chart) => ({
      name: chart.subject,
      // The word the text starts the chart with, as hist, not bar.
      word: chart.subject.split(" ")[0]!,
      line: chart.line,
      ...(chart.id && titles.get(chart.id)
        ? { title: titles.get(chart.id) }
        : {}),
    }));
  const problemsOf = (path: string) =>
    read.problems.filter((item) => item.path === path).map(toProblem);
  const analyses = read.analyses
    .filter((analysis) => !only || analysis.path === only)
    .map((analysis) => {
      const titles = new Map(
        analysis.result.views.flatMap((view) =>
          view.settings.charts.map((chart) => [chart.id, chart.title] as const)
        )
      );
      return {
        path: analysis.path,
        complete: analysis.result.complete && !problemsOf(analysis.path).length,
        views: analysis.result.views.map((view) => ({
          name: view.name,
          query: view.queryId,
          rows: rowsOf(view.queryId, view.bindings as Record<string, never>),
          charts: view.settings.charts.map((chart) => chart.title),
        })),
        charts: charted(analysis.result.charts, titles),
        skipped: charted(analysis.result.skippedCharts, titles),
        problems: problemsOf(analysis.path),
      };
    });
  const notebooks = read.notebooks
    .filter((notebook) => !only || notebook.path === only)
    .map((notebook) => ({
      path: notebook.path,
      complete: notebook.result.complete && !problemsOf(notebook.path).length,
      query: notebook.result.queryId,
      rows: notebook.result.rows.length,
      blocks: notebook.result.blocks.length,
      charts: charted(notebook.result.charts, new Map()),
      problems: problemsOf(notebook.path),
    }));
  if (only && !analyses.length && !notebooks.length) {
    throw new ToolError(
      `${only} isn't an analysis or notebook in this folder.`,
      "Call project for the folder's files."
    );
  }
  return {
    analyses,
    notebooks,
    ...(only
      ? {}
      : {
          projectProblems: read.projectPath ? problemsOf(read.projectPath) : [],
        }),
  };
}

export interface FieldsResult {
  queries: Array<{
    query: string;
    name: string;
    rows: number;
    fields: ReturnType<typeof describeDslSource>;
    note?: string;
  }>;
  howToUse: string;
}

/**
 * Each query's fields, with types and example values, named as an analysis
 * writes them. `query` limits the list to one query.
 */
export async function fields(
  files: ProjectFiles,
  input: { query?: string } = {}
): Promise<FieldsResult> {
  const read = await readProjectFolder(files);
  const { project } = read;
  const queries = input.query
    ? project.queries.filter((item) => item.id === input.query)
    : project.queries;
  if (input.query && !queries.length) {
    throw new ToolError(
      `No query is named ${input.query}.`,
      queryFix(project.queries)
    );
  }
  return {
    queries: queries.map((query) => {
      const base = { query: query.id, name: query.name };
      try {
        const evaluation = evaluateAnalysisQuery(
          project,
          read.tables,
          query.id
        );
        const rows = evaluation.rows.map((row) => row.data);
        const unbound = unboundParameters(evaluation.diagnostics);
        return {
          ...base,
          rows: rows.length,
          fields: describeDslSource(rows),
          ...(unbound.length
            ? {
                note: `Needs values for ${unbound.join(", ")}, so it has no rows here. A view gives them, as view "One" query=${query.id} ${unbound.map((id) => `bind.${id}=…`).join(" ")}.`,
              }
            : {}),
        };
      } catch (error) {
        return {
          ...base,
          rows: 0,
          fields: [],
          note: error instanceof Error ? error.message.split("\n")[0] : "",
        };
      }
    }),
    howToUse:
      "Start an analysis with `eda query=<query>` and name fields as listed, such as orders.amount. Alias one for a short name: amount:num=orders.amount.",
  };
}

const COMPARE = {
  "=": (a: unknown, b: unknown) => String(a) === String(b),
  "!=": (a: unknown, b: unknown) => String(a) !== String(b),
  ">": (a: unknown, b: unknown) => Number(a) > Number(b),
  ">=": (a: unknown, b: unknown) => Number(a) >= Number(b),
  "<": (a: unknown, b: unknown) => Number(a) < Number(b),
  "<=": (a: unknown, b: unknown) => Number(a) <= Number(b),
} as const;

export interface SummarizeInput {
  query: string;
  /** A field to group by; omit for one total. */
  by?: string;
  /** The field to measure; omit to count rows. */
  measure?: string;
  aggregation?: string;
  /** Keep rows where this holds, as "orders.amount > 100". */
  where?: string;
  limit?: number;
}

/**
 * A query's rows grouped and measured, largest first: the numbers a chart
 * of them would show, for prose and for checking a chart's intent.
 */
export async function summarize(files: ProjectFiles, input: SummarizeInput) {
  const read = await readProjectFolder(files);
  if (!read.project.queries.some((item) => item.id === input.query)) {
    throw new ToolError(
      `No query is named ${input.query}.`,
      queryFix(read.project.queries)
    );
  }
  const aggregation = input.aggregation ?? (input.measure ? "sum" : "count");
  if (
    !isAggregation(aggregation) ||
    (aggregation !== "count" && !input.measure)
  ) {
    throw new ToolError(
      `aggregation ${aggregation} needs ${isAggregation(aggregation) ? "a measure field" : "to be one of " + AGGREGATIONS.join(", ")}.`,
      'Send measure="orders.amount" with sum, average, max, or min; count needs none.'
    );
  }
  const evaluation = evaluateAnalysisQuery(
    read.project,
    read.tables,
    input.query
  );
  const unbound = unboundParameters(evaluation.diagnostics);
  if (unbound.length) {
    throw new ToolError(
      `${input.query} needs values for ${unbound.join(", ")}, so it has no rows to summarize.`,
      "Summarize the query it filters instead, with where= for the values you mean."
    );
  }
  let rows = evaluation.rows.map((row) => row.data);
  const fieldsOf = Object.keys(rows[0] ?? {});
  for (const field of [input.by, input.measure]) {
    if (field && rows.length && !fieldsOf.includes(field)) {
      throw new ToolError(
        `${field} is not a field of ${input.query}.`,
        `Fields: ${fieldsOf.join(", ")}.`
      );
    }
  }
  if (input.where) {
    const match = /^\s*(\S+)\s*(!=|>=|<=|=|>|<)\s*(.+?)\s*$/.exec(input.where);
    if (!match || !fieldsOf.includes(match[1]!)) {
      throw new ToolError(
        `where ${input.where} isn't field op value with a field of ${input.query}.`,
        'Write it as "orders.amount > 100" or "orders.channel = Web".'
      );
    }
    const [, field, op, raw] = match;
    // Agents quote text values either way.
    const value = raw!.replace(/^(["'])(.*)\1$/, "$2");
    rows = rows.filter((row) =>
      COMPARE[op as keyof typeof COMPARE](row[field!], value)
    );
  }
  if (
    input.measure &&
    aggregation !== "count" &&
    rows.length &&
    !rows.some(
      (row) =>
        Number.isFinite(Number(row[input.measure!])) &&
        row[input.measure!] !== "" &&
        row[input.measure!] != null
    )
  ) {
    throw new ToolError(
      `${input.measure} has no numbers, so ${aggregation} can't measure it.`,
      `Group by it instead (by="${input.measure}"), or measure a number field.`
    );
  }
  const groups = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = input.by ? String(row[input.by] ?? "(missing)") : "all rows";
    groups.set(key, [...(groups.get(key) ?? []), row]);
  }
  const measured = [...groups].map(([key, members]) => {
    const numbers = input.measure
      ? members
          .map((row) => Number(row[input.measure!]))
          .filter((number) => Number.isFinite(number))
      : [];
    const value =
      aggregation === "count"
        ? members.length
        : reduceNumbers(aggregation, numbers);
    return {
      [input.by ?? "group"]: key,
      value: value === undefined ? null : Math.round(value * 1000) / 1000,
      rows: members.length,
    };
  });
  measured.sort((a, b) => (b.value ?? -Infinity) - (a.value ?? -Infinity));
  const limit = Math.max(1, Math.round(input.limit ?? 20));
  return {
    query: input.query,
    measured: input.measure ? `${aggregation}(${input.measure})` : "count",
    ...(input.where ? { where: input.where } : {}),
    rows: rows.length,
    groups: measured.slice(0, limit),
    ...(measured.length > limit ? { more: measured.length - limit } : {}),
  };
}

/** The words that start a chart, for `reference`. */
function chartTypes() {
  return Object.keys(DSL_CHART_KEYWORDS);
}

/**
 * The grammar: with no topic, dashboard text; "project" and "notebook" for
 * those files; "composition" for its parts; or a chart type's settings.
 */
export function reference(input: { topic?: string; brief?: boolean } = {}): {
  text: string;
} {
  const { topic } = input;
  if (!topic) {
    return {
      text: `${DSL_REFERENCE}\n\nChart types: ${chartTypes().join(", ")}. Call reference with one as topic for its settings.`,
    };
  }
  if (topic === "project") {
    return { text: PROJECT_REFERENCE };
  }
  if (topic === "notebook") {
    return { text: NOTEBOOK_REFERENCE };
  }
  if (topic === "axes") {
    return {
      text: `Settings every chart takes:\n${Object.entries(COMMON_WORDS)
        .map(
          ([word, entry]) =>
            `  ${word}=${entry.values?.join("|") ?? ""}  ${entry.help}`
        )
        .join("\n")}`,
    };
  }
  registerAllCharts();
  if (topic === "composition") {
    return {
      text: `Composition parts and their settings:\n${compositionReference().join("\n")}`,
    };
  }
  // A chart word, as hist, or the type it makes, as bar.
  const lines = chartSettingReference(DSL_CHART_KEYWORDS[topic] ?? topic);
  if (!lines.length) {
    throw new ToolError(
      `${topic} is not a chart type or topic.`,
      `Use project, notebook, composition, axes, or a chart word: ${chartTypes().join(", ")}.`
    );
  }
  // Brief: this chart's own settings first; the ones every chart takes
  // (axes, color scale) as one line of names.
  const common = Object.keys(COMMON_WORDS);
  const shared = (line: string) =>
    common.some((word) => line.startsWith(`${word}=`));
  const shown = input.brief ? lines.filter((line) => !shared(line)) : lines;
  return {
    text: `Settings for ${topic}:\n${shown.map((line) => `  ${line}`).join("\n")}${
      input.brief
        ? `\n  Every chart also takes ${common.map((word) => `${word}=`).join(" ")} (reference topic=axes).`
        : ""
    }`,
  };
}

export const FEEDBACK_FOLDER = ".exploreda/feedback";

const FEEDBACK_KINDS = ["bug", "confusing", "missing"] as const;

export interface FeedbackInput {
  kind: (typeof FEEDBACK_KINDS)[number];
  summary: string;
  tool?: string;
  happened: string;
  proposedFix: string;
}

/**
 * Saves the agent's report on these tools as one Markdown file under
 * `.exploreda/feedback/`, where the project's owner reads it.
 */
export async function submitFeedback(
  files: ProjectFiles,
  input: FeedbackInput,
  now = new Date()
): Promise<{ saved: string }> {
  if (!FEEDBACK_KINDS.includes(input.kind)) {
    throw new ToolError(
      `kind ${input.kind} isn't one of ${FEEDBACK_KINDS.join(", ")}.`
    );
  }
  for (const key of ["summary", "happened", "proposedFix"] as const) {
    if (!input[key]?.trim()) {
      throw new ToolError(`${key} is empty.`);
    }
  }
  const stamp = now.toISOString().slice(0, 19).replace(/[T:]/g, "-");
  const slug =
    input.summary
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 48) || "report";
  const path = `${FEEDBACK_FOLDER}/${stamp}-${slug}.md`;
  await files.write(
    path,
    [
      `# ${input.summary.trim()}`,
      "",
      `- Kind: ${input.kind}`,
      `- Tool: ${input.tool ? `\`${input.tool}\`` : "none named"}`,
      `- Sent: ${now.toISOString()}`,
      "",
      "## What happened",
      "",
      input.happened.trim(),
      "",
      "## Proposed fix",
      "",
      input.proposedFix.trim(),
      "",
    ].join("\n")
  );
  return { saved: path };
}

export { FEEDBACK_KINDS };
