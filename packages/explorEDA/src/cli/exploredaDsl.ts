/* eslint-disable no-console -- a command-line tool prints its results */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  chartSettingReference,
  compileViews,
  compositionReference,
  describeDslSource,
  formatDsl,
  DSL_REFERENCE,
  formatDslDiagnostics,
} from "@/lib/dsl";
import type { GeometryAsset } from "@/lib/geometryAssets";
import type { datum } from "@/types/ChartTypes";
import { parseCsv } from "@/lib/project/tables";
import { readProjectFolder } from "@/lib/project/folder";
import {
  compileNotebook,
  formatNotebook,
  isNotebookPath,
} from "@/lib/notebook";
import { nodeProjectFiles } from "@/node/projectFiles";

const USAGE = `Usage:
  exploreda-dsl check <dashboard.eda> --data <rows.csv|rows.json> [--json]
  exploreda-dsl check <notebook.eda.md> [--data <rows.csv|rows.json>] [--json]
  exploreda-dsl fields --data <rows.csv|rows.json>
  exploreda-dsl fmt <dashboard.eda|notebook.eda.md> [--write]
  exploreda-dsl project <folder> [--json]
  exploreda-dsl reference [chart-type]

check   builds the dashboard (every view) and lists each problem with a fix.
        A notebook without --data reads its project's data.
        Exits 0 when complete, 1 when partial, 2 when nothing builds.
fields  lists the fields, types, and example values to write against.
project loads a project folder (exploreda.eda, its data, every analysis
        .eda file, and every .eda.md notebook) and builds each against the
        data it names.
        Exits 0 when complete, 1 when partial, 2 when nothing builds.
fmt     indents by brace depth and tidies spacing; --write saves the file.
        In a notebook it formats only the eda blocks.
reference  prints the grammar, or every setting a chart type takes.`;

/** Rows, plus map shapes when the file is a saved explorEDA analysis. */
function readSource(path: string): {
  rows: Array<Record<string, datum>>;
  geometryAssets?: GeometryAsset[];
} {
  const text = readFileSync(path, "utf8");
  if (!path.endsWith(".json")) {
    return { rows: parseCsv(text) as Array<Record<string, datum>> };
  }
  const json = JSON.parse(text);
  return Array.isArray(json)
    ? { rows: json }
    : { rows: json.data, geometryAssets: json.settings?.geometryAssets };
}

async function checkProject(folder: string, json: boolean) {
  registerAllCharts();
  const result = await readProjectFolder(nodeProjectFiles(folder));
  if (json) {
    console.log(JSON.stringify({ ...result, tables: undefined }, null, 2));
  } else {
    const { project } = result;
    console.log(
      result.projectPath
        ? `${result.projectPath}: ${project.sources.length} sources, ${project.relationships.length} relationships, ${project.queries.length - result.implicitQueries.length} queries`
        : `no project text yet; ${result.dataFiles.length} data files`
    );
    for (const source of project.sources) {
      const rows = result.tables[source.id]?.length ?? 0;
      const notes = [
        ...(result.missingSources.includes(source.id) ? ["missing"] : []),
        ...(result.outsideSources.includes(source.id)
          ? ["outside the folder"]
          : []),
        ...(result.inferredSources.includes(source.id)
          ? ["fields from data"]
          : []),
      ];
      console.log(
        `  source ${source.id}: ${rows} rows${notes.length ? ` (${notes.join(", ")})` : ""}`
      );
    }
    for (const analysis of result.analyses) {
      console.log(`${analysis.path}: ${analysis.result.views.length} views`);
      for (const view of analysis.result.views) {
        const charts = view.settings.charts.length;
        console.log(`  ${view.name} (${view.queryId}): ${charts} charts`);
      }
    }
    for (const notebook of result.notebooks) {
      const { blocks } = notebook.result;
      const charts = blocks.reduce(
        (sum, block) => sum + block.charts.length,
        0
      );
      console.log(
        `${notebook.path}: notebook, ${blocks.length} blocks, ${charts} charts (${notebook.result.queryId})`
      );
    }
    for (const item of result.problems) {
      console.log(
        [
          `${item.path}:${item.line}:${item.column}: ${item.severity}: ${item.message}`,
          ...(item.suggestion ? [`  fix: ${item.suggestion}`] : []),
        ].join("\n")
      );
    }
    const views = result.analyses.reduce(
      (sum, analysis) => sum + analysis.result.views.length,
      0
    );
    const notebooks = result.notebooks.length
      ? `, ${result.notebooks.length} notebook${result.notebooks.length === 1 ? "" : "s"}`
      : "";
    console.log(
      result.problems.length
        ? `partial: ${result.problems.length} problem${result.problems.length === 1 ? "" : "s"}`
        : `ok: ${result.analyses.length} analyses, ${views} views${notebooks}, every declaration applied`
    );
  }
  const charts =
    result.analyses.reduce(
      (sum, analysis) => sum + analysis.result.charts.length,
      0
    ) +
    result.notebooks.reduce(
      (sum, notebook) => sum + notebook.result.charts.length,
      0
    );
  return result.problems.length ? (charts ? 1 : 2) : 0;
}

/** The nearest folder at or above `from` that holds project text. */
function projectFolderOf(from: string): string | undefined {
  let folder = from;
  for (;;) {
    if (
      existsSync(join(folder, "exploreda.eda")) ||
      existsSync(join(folder, ".exploreda", "project.eda"))
    ) {
      return folder;
    }
    const parent = dirname(folder);
    if (parent === folder) {
      return undefined;
    }
    folder = parent;
  }
}

/** Checks a notebook against rows, or against its project's data. */
async function checkNotebook(
  path: string,
  dataPath: string | undefined,
  json: boolean
) {
  registerAllCharts();
  let result;
  if (dataPath) {
    const { rows, geometryAssets } = readSource(dataPath);
    result = compileNotebook(readFileSync(path, "utf8"), {
      rows,
      geometryAssets,
    });
  } else {
    const folder = projectFolderOf(dirname(path)) ?? dirname(path);
    const read = await readProjectFolder(nodeProjectFiles(folder));
    const inFolder = relative(folder, path).split("\\").join("/");
    const notebook = read.notebooks.find((item) => item.path === inFolder);
    if (!notebook) {
      console.error(
        `${path} is not a notebook in a project folder; pass --data.`
      );
      return 64;
    }
    result = notebook.result;
  }
  if (json) {
    console.log(
      JSON.stringify(
        {
          diagnostics: result.diagnostics,
          blocks: result.blocks,
          charts: result.charts,
          skippedCharts: result.skippedCharts,
          complete: result.complete,
        },
        null,
        2
      )
    );
  } else {
    console.log(formatDslDiagnostics(result, path));
  }
  return result.complete ? 0 : result.charts.length ? 1 : 2;
}

function main(args: string[]): number | Promise<number> {
  const [command, ...rest] = args;
  const option = (name: string) => {
    const at = rest.indexOf(name);
    return at >= 0 ? rest[at + 1] : undefined;
  };
  const dataPath = option("--data");
  if (command === "fmt") {
    const file = rest.find((item) => !item.startsWith("--"));
    if (!file) {
      console.error(USAGE);
      return 64;
    }
    const text = readFileSync(file, "utf8");
    const formatted = isNotebookPath(file)
      ? formatNotebook(text)
      : formatDsl(text);
    if (rest.includes("--write")) {
      writeFileSync(file, formatted);
    } else {
      process.stdout.write(formatted);
    }
    return 0;
  }
  if (command === "project") {
    const folder = rest.find((item) => !item.startsWith("--")) ?? ".";
    return checkProject(folder, rest.includes("--json"));
  }
  if (command === "reference") {
    const type = rest[0];
    if (!type) {
      console.log(DSL_REFERENCE);
      return 0;
    }
    registerAllCharts();
    if (type === "composition") {
      console.log(
        `Composition parts and their settings:\n${compositionReference().join("\n")}`
      );
      return 0;
    }
    const lines = chartSettingReference(type);
    if (!lines.length) {
      console.error(`${type} is not a chart type.`);
      return 64;
    }
    console.log(
      `Settings for ${type}:\n${lines.map((line) => `  ${line}`).join("\n")}`
    );
    return 0;
  }
  const notebookPath =
    command === "check"
      ? rest.find(
          (item, index) =>
            isNotebookPath(item) && !rest[index - 1]?.startsWith("--")
        )
      : undefined;
  if (notebookPath) {
    return checkNotebook(notebookPath, dataPath, rest.includes("--json"));
  }
  if ((command !== "check" && command !== "fields") || !dataPath) {
    console.error(USAGE);
    return 64;
  }
  const { rows, geometryAssets } = readSource(dataPath);
  if (command === "fields") {
    for (const field of describeDslSource(rows)) {
      console.log(
        `${field.name}\t${field.type}\t${field.missing} missing\t${field.sample}`
      );
    }
    return 0;
  }
  const docPath = rest.find(
    (item, index) =>
      !item.startsWith("--") && !rest[index - 1]?.startsWith("--")
  );
  if (!docPath) {
    console.error(USAGE);
    return 64;
  }
  registerAllCharts();
  const result = compileViews(readFileSync(docPath, "utf8"), {
    rows,
    geometryAssets,
  });
  if (rest.includes("--json")) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(formatDslDiagnostics(result, docPath));
  }
  return result.complete ? 0 : result.charts.length ? 1 : 2;
}

void Promise.resolve(main(process.argv.slice(2))).then((code) => {
  process.exitCode = code;
});
