import { typeValueColumns } from "./columns";
import { TableReadError } from "./types";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

type Scalar = string | number | boolean | null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function flatten(
  value: Record<string, unknown>,
  prefix: string,
  out: AnalysisSourceRow
): AnalysisSourceRow {
  for (const [key, item] of Object.entries(value)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(item)) {
      item.forEach((entry, index) => {
        if (isRecord(entry)) flatten(entry, `${name}[${index}]`, out);
        else out[`${name}[${index}]`] = entry as Scalar;
      });
    } else if (isRecord(item)) {
      flatten(item, name, out);
    } else {
      out[name] = item as Scalar;
    }
  }
  return out;
}

/**
 * Reads a JSON object or array of objects. Nested objects become dotted
 * fields, and array items become indexed fields, one row per object.
 */
export function readJson(text: string): {
  rows: AnalysisSourceRow[];
  fields: FieldDefinition[];
  notes: string[];
} {
  let value: unknown;
  try {
    value = JSON.parse(text.replace(/^﻿/, ""));
  } catch (error) {
    throw new TableReadError(
      `The file is not valid JSON (${error instanceof Error ? error.message : String(error)}).`
    );
  }
  const items = Array.isArray(value) ? value : [value];
  const bad = items.findIndex((item) => !isRecord(item));
  if (bad !== -1) {
    throw new TableReadError(
      Array.isArray(value)
        ? `Item ${bad + 1} is not an object. JSON must hold an object or an array of objects.`
        : "JSON must hold an object or an array of objects.",
      Array.isArray(value) ? { row: bad + 1 } : {}
    );
  }
  const notes: string[] = [];
  const rows = (items as Record<string, unknown>[]).map((item) => {
    const row = flatten(item, "", {});
    if ("__ID" in row) {
      row.__ID_source = row.__ID;
      delete row.__ID;
    }
    return row;
  });
  if (rows.some((row) => "__ID_source" in row)) {
    notes.push('Renamed field "__ID" to "__ID_source".');
  }
  return { rows, fields: typeValueColumns(rows), notes };
}
