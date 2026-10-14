import { typeValueColumns } from "./columns";
import { TableReadError } from "./types";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

type Decoded = {
  rows: AnalysisSourceRow[];
  fields: FieldDefinition[];
  notes: string[];
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const LONG_DIGITS = /\d{16}/;
const NUMBER_TOKEN = /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y;

/**
 * Wraps integer literals that a JavaScript number would round in quotes, so
 * JSON.parse keeps their digits as text. Text inside strings is untouched.
 * Works the same in every browser, unlike reviver source access.
 */
export function quoteUnsafeIntegers(text: string): string {
  if (!LONG_DIGITS.test(text)) return text;
  let out = "";
  let start = 0;
  let index = 0;
  while (index < text.length) {
    const char = text[index]!;
    if (char === '"') {
      index += 1;
      while (index < text.length && text[index] !== '"') {
        index += text[index] === "\\" ? 2 : 1;
      }
      index += 1;
    } else if (char === "-" || (char >= "0" && char <= "9")) {
      NUMBER_TOKEN.lastIndex = index;
      const token = NUMBER_TOKEN.exec(text)?.[0] ?? char;
      if (/^-?\d+$/.test(token) && !Number.isSafeInteger(Number(token))) {
        out += `${text.slice(start, index)}"${token}"`;
        start = index + token.length;
      }
      index += token.length;
    } else {
      index += 1;
    }
  }
  return out + text.slice(start);
}

function parse(text: string, where: string): unknown {
  try {
    return JSON.parse(quoteUnsafeIntegers(text));
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new TableReadError(`${where} is not valid JSON (${reason}).`);
  }
}

/**
 * One row per record. Nested objects become dotted fields, such as
 * `address.city`; arrays keep their items together as JSON text in one
 * field, so a record never spreads across rows or numbered columns.
 */
function flatten(
  value: Record<string, unknown>,
  prefix: string,
  out: AnalysisSourceRow
): AnalysisSourceRow {
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(item)) {
      out[name] = JSON.stringify(item);
    } else if (isRecord(item)) {
      flatten(item, name, out);
    } else {
      out[name] = item as string | number | boolean | null;
    }
  }
  return out;
}

/** Rows with every field present, missing values as null, and fields typed. */
function table(records: Record<string, unknown>[], notes: string[]): Decoded {
  const rows = records.map((record) => {
    const row = flatten(record, "", {});
    if ("__ID" in row) {
      row.__ID_source = row.__ID;
      delete row.__ID;
    }
    return row;
  });
  if (rows.some((row) => "__ID_source" in row)) {
    notes.push('Renamed field "__ID" to "__ID_source".');
  }
  const fields = typeValueColumns(rows);
  for (const row of rows) {
    for (const field of fields) if (!(field.id in row)) row[field.id] = null;
  }
  return { rows, fields, notes };
}

/**
 * The records in a JSON value: an array of objects, one object, or an object
 * whose only array of objects holds the records, such as `{ "data": [...] }`.
 */
function records(value: unknown, notes: string[]) {
  if (isRecord(value)) {
    const lists = Object.entries(value).filter(
      ([, item]) =>
        Array.isArray(item) && item.length > 0 && item.every(isRecord)
    );
    if (lists.length === 1) {
      const [key, list] = lists[0]! as [string, Record<string, unknown>[]];
      notes.push(`Read the ${list.length} records in "${key}".`);
      return list;
    }
    return [value];
  }
  if (!Array.isArray(value)) {
    throw new TableReadError(
      "JSON must hold an object or an array of objects."
    );
  }
  const bad = value.findIndex((item) => !isRecord(item));
  if (bad !== -1) {
    throw new TableReadError(
      `Item ${bad + 1} is not an object. JSON must hold an object or an array of objects.`,
      { row: bad + 1 }
    );
  }
  return value as Record<string, unknown>[];
}

/** Reads a JSON object or array of objects as a table. */
export function readJson(text: string): Decoded {
  const notes: string[] = [];
  const value = parse(text.replace(/^﻿/, ""), "The file");
  return table(records(value, notes), notes);
}

/**
 * Reads JSON Lines (NDJSON): one JSON object per line. Blank lines are
 * skipped. An error names the line it is on.
 */
export function readJsonLines(text: string): Decoded {
  const items: Record<string, unknown>[] = [];
  const lines = text.replace(/^﻿/, "").split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trim() === "") return;
    const value = parse(line, `Line ${index + 1}`);
    if (!isRecord(value)) {
      throw new TableReadError(
        `Line ${index + 1} is not an object. Each line must hold one JSON object.`,
        { row: items.length + 1 }
      );
    }
    items.push(value);
  });
  if (items.length === 0) {
    throw new TableReadError("The file has no records.");
  }
  return table(items, []);
}
