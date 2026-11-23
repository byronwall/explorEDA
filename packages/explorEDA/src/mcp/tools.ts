/**
 * Tools an outside agent calls to build analyses in a project folder:
 * check text, list fields, read the grammar, write a file, and report a
 * problem with these tools. Each takes the project's files and returns
 * plain JSON. The `/mcp` route and `exploreda-dsl` both call them.
 */
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  chartSettingReference,
  compositionReference,
  describeDslSource,
  DSL_CHART_KEYWORDS,
  DSL_REFERENCE,
  type DslDiagnostic,
} from "@/lib/dsl";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import {
  isAbsolutePath,
  normalizeProjectPath,
  ProjectFileError,
  type ProjectFiles,
} from "@/lib/project/files";
import { readProjectFolder, type ProjectFolder } from "@/lib/project/folder";
import { isNotebookPath } from "@/lib/notebook";
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
  return {
    path,
    complete: built && !problems.some((item) => item.path === path),
    views,
    charts,
    problems,
  };
}

/**
 * Builds `text` as the file at `path` against the project's data, as the
 * app would, and writes nothing.
 */
export async function check(
  files: ProjectFiles,
  input: { path?: string; text: string }
): Promise<CheckResult> {
  registerAllCharts();
  const path = analysisPath(input.path ?? "check.eda");
  return resultFor(
    await readProjectFolder(withText(files, path, input.text)),
    path
  );
}

/** Saves the analysis, then returns what `check` returns for it. */
export async function writeEda(
  files: ProjectFiles,
  input: { path: string; text: string }
): Promise<CheckResult & { saved: string }> {
  const path = analysisPath(input.path);
  const result = await check(files, { path, text: input.text });
  await files.write(path, input.text);
  return { saved: path, ...result };
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
      `Use one of: ${project.queries.map((item) => item.id).join(", ")}.`
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
        return {
          ...base,
          rows: rows.length,
          fields: describeDslSource(rows),
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

/** The words that start a chart, for `reference`. */
function chartTypes() {
  return Object.keys(DSL_CHART_KEYWORDS);
}

/**
 * The grammar: with no topic, dashboard text; "project" and "notebook" for
 * those files; "composition" for its parts; or a chart type's settings.
 */
export function reference(input: { topic?: string } = {}): { text: string } {
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
      `Use project, notebook, composition, or a chart type: ${chartTypes().join(", ")}.`
    );
  }
  return {
    text: `Settings for ${topic}:\n${lines.map((line) => `  ${line}`).join("\n")}`,
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
