import type { FileMetaData, SchemaElement, SchemaTree } from "hyparquet";
import { TableReadError } from "./types";
import { fieldNamesFromHeader } from "./columns";
import {
  convertColumn,
  isoFromEpoch,
  type Column,
  type Kind,
} from "./typedColumns";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

const UNIT_DIGITS = { MILLIS: 3, MICROS: 6, NANOS: 9 } as const;

function unitDigits(element: SchemaElement): number {
  const logical = element.logical_type;
  if (logical && "unit" in logical && logical.unit) {
    return UNIT_DIGITS[logical.unit as keyof typeof UNIT_DIGITS] ?? 3;
  }
  const converted = element.converted_type ?? "";
  return converted.endsWith("MICROS") ? 6 : 3;
}

/** What a top-level column holds, from its schema. */
function classify(
  tree: SchemaTree,
  decimals: Map<SchemaElement, number>
): Column {
  const element = tree.element;
  const logical = element.logical_type?.type;
  const converted = element.converted_type;
  const column = (kind: Kind, scale = 0, utc = true): Column => ({
    name: element.name,
    kind,
    scale,
    utc,
  });
  if (tree.children.length > 0) return column("json");
  if (decimals.has(element)) return column("decimal", decimals.get(element)!);
  if (logical === "TIMESTAMP" || converted?.startsWith("TIMESTAMP")) {
    const adjusted =
      element.logical_type && "isAdjustedToUTC" in element.logical_type
        ? element.logical_type.isAdjustedToUTC !== false
        : true;
    return column("timestamp", unitDigits(element), adjusted);
  }
  if (element.type === "INT96") return column("timestamp", 9);
  if (logical === "DATE" || converted === "DATE") return column("date");
  if (logical === "TIME" || converted?.startsWith("TIME_")) {
    return column("time", unitDigits(element));
  }
  if (
    logical === "JSON" ||
    converted === "JSON" ||
    logical === "GEOMETRY" ||
    logical === "GEOGRAPHY"
  ) {
    return column("json");
  }
  if (element.type === "BOOLEAN") return column("boolean");
  if (
    logical === "FLOAT16" ||
    element.type === "FLOAT" ||
    element.type === "DOUBLE"
  ) {
    return column("float");
  }
  if (element.type === "INT32" || element.type === "INT64") {
    return column("integer");
  }
  return column("text");
}

/**
 * Reads a single Parquet file. Each column's type comes from the file's
 * schema. Timestamps keep their stored precision as ISO text, decimals keep
 * their exact digits, and integers past 2^53 stay text. Lists, maps, and
 * structs become JSON text in one field. Snappy, gzip, zstd, Brotli, and LZ4
 * pages are read.
 */
export async function readParquet(bytes: ArrayBuffer): Promise<{
  rows: AnalysisSourceRow[];
  fields: FieldDefinition[];
  notes: string[];
}> {
  const [
    { parquetMetadata, parquetReadObjects, parquetSchema },
    { compressors },
  ] = await Promise.all([import("hyparquet"), import("hyparquet-compressors")]);
  let metadata: FileMetaData;
  try {
    metadata = parquetMetadata(bytes);
  } catch (error) {
    throw new TableReadError(
      `The file is not a readable Parquet file (${error instanceof Error ? error.message : String(error)}).`
    );
  }
  // Decimals are read as their unscaled integers, then given exact digits.
  // The reader's own conversion would round them to numbers.
  const decimals = new Map<SchemaElement, number>();
  for (const element of metadata.schema) {
    if (
      element.converted_type === "DECIMAL" ||
      element.logical_type?.type === "DECIMAL"
    ) {
      decimals.set(element, element.scale ?? 0);
      element.converted_type = undefined;
      element.logical_type = undefined;
    }
  }
  const tree = parquetSchema(metadata);
  const columns = tree.children.map((child) => classify(child, decimals));
  let objects: Record<string, unknown>[];
  try {
    objects = (await parquetReadObjects({
      file: bytes,
      metadata,
      compressors,
      utf8: false,
      parsers: {
        timestampFromMilliseconds: (value: bigint) =>
          isoFromEpoch(value, 3, true),
        timestampFromMicroseconds: (value: bigint) =>
          isoFromEpoch(value, 6, true),
        timestampFromNanoseconds: (value: bigint) =>
          isoFromEpoch(value, 9, true),
        dateFromDays: (days: number) => days,
      },
    })) as Record<string, unknown>[];
  } catch (error) {
    throw new TableReadError(
      `The Parquet file could not be read (${error instanceof Error ? error.message : String(error)}).`
    );
  }
  const notes: string[] = [];
  const names = fieldNamesFromHeader(
    columns.map((column) => column.name),
    notes
  );
  const rows: AnalysisSourceRow[] = objects.map(() => ({}));
  const fields = columns.map((column, index) => {
    const name = names[index]!;
    const { values, type } = convertColumn(
      column,
      objects.map((object) => object[column.name])
    );
    values.forEach((value, row) => {
      rows[row]![name] = value;
    });
    return { id: name, name, type };
  });
  return { rows, fields, notes };
}
