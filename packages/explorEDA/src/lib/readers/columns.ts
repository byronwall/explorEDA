import { detectColumnType } from "@/components/SummaryTable/utils/dataTypeDetection";
import { DECLARED_DATA_TYPES } from "@/lib/declaredFieldTypes";
import { isMissingValue, parseBoolean } from "@/lib/valueParsing";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";
import type { datum } from "@/types/ChartTypes";

const FIELD_TYPE_OF = Object.fromEntries(
  Object.entries(DECLARED_DATA_TYPES).map(([field, data]) => [data, field])
) as Record<
  (typeof DECLARED_DATA_TYPES)[keyof typeof DECLARED_DATA_TYPES],
  Exclude<FieldDefinition["type"], "unknown" | undefined>
>;

// The workspace gives each row its own __ID, so a source field can't use it.
const RESERVED = new Set(["__ID"]);

/**
 * Unique, non-empty field names for a header row. A blank header becomes
 * "Column 3", and a repeat becomes "name_2". Each change is noted.
 */
export function fieldNamesFromHeader(
  header: readonly string[],
  notes: string[]
): string[] {
  const taken = new Set<string>();
  return header.map((raw, index) => {
    const trimmed = raw.trim();
    let base = trimmed || `Column ${index + 1}`;
    if (RESERVED.has(base)) base = `${base}_source`;
    let name = base;
    for (let n = 2; taken.has(name); n += 1) name = `${base}_${n}`;
    if (!trimmed) {
      notes.push(
        `Column ${index + 1} has no header, so it is named "${name}".`
      );
    } else if (name !== trimmed) {
      notes.push(`Renamed header "${trimmed}" to "${name}".`);
    }
    taken.add(name);
    return name;
  });
}

/** A cell as a reader found it: text, or a value the file already typed. */
export type Cell = string | number | boolean | null;

/**
 * Rows and field types for cells. Each column's type comes from every value
 * in it, by the same rule the workspace uses, so a reload reads the same
 * types. Number and boolean columns convert; text and date columns keep text,
 * so a number in a text column becomes its digits. Blank cells are missing.
 */
export function typeTextColumns(
  names: readonly string[],
  cells: ReadonlyArray<ReadonlyArray<Cell>>
): { rows: AnalysisSourceRow[]; fields: FieldDefinition[] } {
  const types = names.map((_, column) => {
    const values: datum[] = cells.map((row) => row[column] ?? null);
    return FIELD_TYPE_OF[detectColumnType(values)];
  });
  const rows = cells.map((row) => {
    const out: AnalysisSourceRow = {};
    names.forEach((name, column) => {
      const value = row[column] ?? null;
      if (value === null || isMissingValue(value)) {
        out[name] = null;
      } else if (types[column] === "number") {
        out[name] =
          typeof value === "number" ? value : Number(String(value).trim());
      } else if (types[column] === "boolean") {
        out[name] = parseBoolean(value) ?? null;
      } else {
        out[name] = typeof value === "string" ? value : String(value);
      }
    });
    return out;
  });
  return {
    rows,
    fields: names.map((name, column) => ({
      id: name,
      name,
      type: types[column],
    })),
  };
}

/**
 * Field types for rows whose values already have types, such as parsed
 * JSON. Fields are listed in order of first appearance across every row.
 */
export function typeValueColumns(
  rows: readonly AnalysisSourceRow[]
): FieldDefinition[] {
  const names = new Set<string>();
  for (const row of rows) for (const key in row) names.add(key);
  return [...names].map((name) => ({
    id: name,
    name,
    type: FIELD_TYPE_OF[detectColumnType(rows.map((row) => row[name]))],
  }));
}
