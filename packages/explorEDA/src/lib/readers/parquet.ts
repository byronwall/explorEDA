import type { FileMetaData, SchemaElement, SchemaTree } from "hyparquet";
import { TableReadError } from "./types";
import { fieldNamesFromHeader } from "./columns";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

type Kind =
  | "integer"
  | "float"
  | "decimal"
  | "boolean"
  | "date"
  | "timestamp"
  | "time"
  | "text"
  | "json";

interface Column {
  name: string;
  kind: Kind;
  /** Decimal scale; time unit digits (3, 6, or 9). */
  scale: number;
  /** Timestamps without a zone show wall-clock time. */
  utc: boolean;
}

const decoder = new TextDecoder();
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

/** ISO text for an epoch count, keeping every digit the unit stores. */
export function isoFromEpoch(value: bigint, digits: number, utc: boolean) {
  const perSecond = 10n ** BigInt(digits);
  let seconds = value / perSecond;
  let fraction = value % perSecond;
  if (fraction < 0n) {
    seconds -= 1n;
    fraction += perSecond;
  }
  const whole = new Date(Number(seconds) * 1000).toISOString().slice(0, 19);
  const part =
    fraction === 0n
      ? ""
      : `.${fraction.toString().padStart(digits, "0").replace(/0+$/, "")}`;
  return `${whole}${part}${utc ? "Z" : ""}`;
}

/** The exact decimal text for an unscaled integer and its scale. */
export function decimalText(unscaled: bigint, scale: number): string {
  const negative = unscaled < 0n;
  const digits = (negative ? -unscaled : unscaled)
    .toString()
    .padStart(scale + 1, "0");
  const whole = scale > 0 ? digits.slice(0, -scale) : digits;
  const fraction = scale > 0 ? `.${digits.slice(-scale)}` : "";
  return `${negative ? "-" : ""}${whole}${fraction}`;
}

/** A two's-complement big-endian integer. */
function bytesToBigInt(bytes: Uint8Array): bigint {
  let value = 0n;
  for (const byte of bytes) value = value * 256n + BigInt(byte);
  const bits = BigInt(bytes.length * 8);
  return bytes.length > 0 && value >= 1n << (bits - 1n)
    ? value - (1n << bits)
    : value;
}

const toBigInt = (value: unknown): bigint =>
  typeof value === "bigint"
    ? value
    : value instanceof Uint8Array
      ? bytesToBigInt(value)
      : BigInt(value as number);

const jsonText = (value: unknown) =>
  JSON.stringify(value, (_key, item: unknown) =>
    typeof item === "bigint"
      ? Number.isSafeInteger(Number(item))
        ? Number(item)
        : item.toString()
      : item instanceof Uint8Array
        ? decoder.decode(item)
        : item instanceof Date
          ? item.toISOString()
          : item
  );

function timeText(value: unknown, digits: number) {
  const count = toBigInt(value);
  return isoFromEpoch(count, digits, false).slice(11);
}

/** Significant digits in an integer's text, ignoring sign and leading zeros. */
const significant = (text: string) =>
  text.replace(/^-/, "").replace(".", "").replace(/^0+/, "").length;

/**
 * Converts one column's decoded values. Numbers that a JavaScript number
 * holds exactly stay numbers; when any value in an integer or decimal column
 * would round, the whole column keeps exact text instead.
 */
function convertColumn(column: Column, values: unknown[]) {
  const out: (string | number | boolean | null)[] = new Array(values.length);
  let type: FieldDefinition["type"] = "string";
  switch (column.kind) {
    case "integer": {
      const ints = values.map((value) =>
        value === null || value === undefined ? null : toBigInt(value)
      );
      const exact = ints.every(
        (value) => value === null || Number.isSafeInteger(Number(value))
      );
      ints.forEach((value, index) => {
        out[index] =
          value === null ? null : exact ? Number(value) : value.toString();
      });
      type = exact ? "number" : "string";
      break;
    }
    case "decimal": {
      const texts = values.map((value) =>
        value === null || value === undefined
          ? null
          : decimalText(toBigInt(value), column.scale)
      );
      const exact = texts.every(
        (text) => text === null || significant(text) <= 15
      );
      texts.forEach((text, index) => {
        out[index] = text === null ? null : exact ? Number(text) : text;
      });
      type = exact ? "number" : "string";
      break;
    }
    case "float":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : Number(value);
      });
      type = "number";
      break;
    case "boolean":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : Boolean(value);
      });
      type = "boolean";
      break;
    case "timestamp":
      values.forEach((value, index) => {
        out[index] =
          typeof value === "string"
            ? column.utc
              ? value
              : value.replace(/Z$/, "")
            : null;
      });
      type = "date";
      break;
    case "date":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : new Date(Number(value) * 86400000).toISOString().slice(0, 10);
      });
      type = "date";
      break;
    case "time":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : timeText(value, column.scale);
      });
      break;
    case "json":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined ? null : jsonText(value);
      });
      break;
    case "text":
      values.forEach((value, index) => {
        out[index] =
          value === null || value === undefined
            ? null
            : value instanceof Uint8Array
              ? decoder.decode(value)
              : String(value);
      });
      break;
  }
  return { values: out, type };
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
