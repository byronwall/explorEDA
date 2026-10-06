/* eslint-disable no-console -- a command-line tool prints its results */
import { readFileSync } from "node:fs";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  compileDocument,
  describeDslSource,
  DSL_REFERENCE,
  formatDslDiagnostics,
} from "@/lib/dsl";
import type { GeometryAsset } from "@/lib/geometryAssets";
import type { datum } from "@/types/ChartTypes";

const USAGE = `Usage:
  exploreda-dsl check <dashboard.eda> --data <rows.csv|rows.json> [--json]
  exploreda-dsl fields --data <rows.csv|rows.json>
  exploreda-dsl reference

check   builds the dashboard and lists every problem with a fix.
        Exits 0 when complete, 1 when partial, 2 when nothing builds.
fields  lists the fields, types, and example values to write against.`;

/** Reads a CSV cell the way the app's file import does. */
function typed(text: string): datum {
  if (text === "") {
    return null;
  }
  if (text === "true" || text === "false") {
    return text === "true";
  }
  const number = Number(text);
  return text.trim() !== "" && Number.isFinite(number) ? number : text;
}

function parseCsv(text: string): Array<Record<string, datum>> {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index]!;
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        cell += '"';
        index++;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") {
        index++;
      }
      row.push(cell);
      records.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    records.push([...row, cell]);
  }
  const [header = [], ...body] = records.filter((item) => item.some(Boolean));
  return body.map((values) =>
    Object.fromEntries(
      header.map((name, index) => [name, typed(values[index] ?? "")])
    )
  );
}

/** Rows, plus map shapes when the file is a saved explorEDA analysis. */
function readSource(path: string): {
  rows: Array<Record<string, datum>>;
  geometryAssets?: GeometryAsset[];
} {
  const text = readFileSync(path, "utf8");
  if (!path.endsWith(".json")) {
    return { rows: parseCsv(text) };
  }
  const json = JSON.parse(text);
  return Array.isArray(json)
    ? { rows: json }
    : { rows: json.data, geometryAssets: json.settings?.geometryAssets };
}

function main(args: string[]) {
  const [command, ...rest] = args;
  const option = (name: string) => {
    const at = rest.indexOf(name);
    return at >= 0 ? rest[at + 1] : undefined;
  };
  const dataPath = option("--data");
  if (command === "reference") {
    console.log(DSL_REFERENCE);
    return 0;
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
  const result = compileDocument(readFileSync(docPath, "utf8"), {
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

process.exitCode = main(process.argv.slice(2));
