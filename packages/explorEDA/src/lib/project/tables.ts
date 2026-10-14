/**
 * Reads a data file's text into rows. CSV cells become numbers, booleans,
 * or null where they read as one; everything else, dates included, stays
 * text. JSON is an array of records, or a saved analysis with `data`.
 */
import type { datum } from "@/types/ChartTypes";
import type { AnalysisSourceRow } from "@/types/AnalysisProject";

/** File extensions a project reads as data. */
export const DATA_EXTENSIONS = [".csv", ".json"] as const;

export function isDataFile(path: string) {
  const lower = path.toLowerCase();
  return DATA_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** File extensions of databases a `driver=sqlite` connection reads. */
export const DATABASE_EXTENSIONS = [".db", ".sqlite", ".sqlite3"] as const;

export function isDatabaseFile(path: string) {
  const lower = path.toLowerCase();
  return DATABASE_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

/** Reads a CSV cell the way the app's file import does. */
export function typedCell(text: string): datum {
  if (text === "") {
    return null;
  }
  if (text === "true" || text === "false") {
    return text === "true";
  }
  const number = Number(text);
  return text.trim() !== "" && Number.isFinite(number) ? number : text;
}

export function parseCsv(text: string): AnalysisSourceRow[] {
  const records: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  // A byte-order mark is not part of the first column's name.
  const body = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text;
  for (let index = 0; index < body.length; index++) {
    const char = body[index]!;
    if (quoted) {
      if (char === '"' && body[index + 1] === '"') {
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
      if (char === "\r" && body[index + 1] === "\n") {
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
  const [header = [], ...rest] = records.filter((item) => item.some(Boolean));
  return rest.map((values) =>
    Object.fromEntries(
      header.map((name, index) => [name, typedCell(values[index] ?? "")])
    )
  );
}

/** Rows from a JSON array, or from a saved analysis's `data`. */
export function parseJsonRows(text: string): AnalysisSourceRow[] {
  const json = JSON.parse(text) as unknown;
  if (Array.isArray(json)) {
    return json as AnalysisSourceRow[];
  }
  const data = (json as { data?: unknown } | null)?.data;
  if (Array.isArray(data)) {
    return data as AnalysisSourceRow[];
  }
  throw new Error("The JSON holds no array of rows.");
}

/** Rows from a data file, chosen by its extension. */
export function parseTable(path: string, text: string): AnalysisSourceRow[] {
  return path.toLowerCase().endsWith(".json")
    ? parseJsonRows(text)
    : parseCsv(text);
}
