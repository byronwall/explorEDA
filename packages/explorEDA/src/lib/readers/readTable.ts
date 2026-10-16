import { readDelimited } from "./delimited";
import { BINARY_FORMATS, tableFormatList, tableFormatOf } from "./formats";
import { readJson, readJsonLines } from "./json";
import { readArrow } from "./arrow";
import { readParquet } from "./parquet";
import { readXlsx } from "./xlsx";
import {
  TableReadError,
  type ReadTableOptions,
  type TableFile,
  type TableFormat,
} from "./types";

/** A file name without its extension, as a source or view name. */
function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || fileName || "Data";
}

/** A blob's text. FileReader covers environments without `Blob.text()`. */
function blobText(blob: Blob): Promise<string> {
  if (typeof blob.text === "function") return blob.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () =>
      reject(reader.error ?? new TableReadError("The file could not be read."));
    reader.readAsText(blob);
  });
}

/** A blob's bytes. FileReader covers environments without `Blob.arrayBuffer()`. */
function blobBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === "function") return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () =>
      reject(reader.error ?? new TableReadError("The file could not be read."));
    reader.readAsArrayBuffer(blob);
  });
}

function withFieldTypes<T extends { fields: TableFile["fields"] }>(table: T) {
  return {
    ...table,
    fieldTypes: Object.fromEntries(
      table.fields.map((field) => [field.id, field.type ?? "unknown"])
    ),
  };
}

function throwIfAborted(signal: AbortSignal | undefined) {
  if (signal?.aborted) {
    throw (
      signal.reason ?? new DOMException("The read was cancelled.", "AbortError")
    );
  }
}

function formatFor(fileName: string, options: ReadTableOptions): TableFormat {
  const format = options.format ?? tableFormatOf(fileName);
  if (!format) {
    throw new TableReadError(
      `${fileName || "This file"} is not a format explorEDA reads. Choose a ${tableFormatList()} file.`
    );
  }
  return format;
}

type TextFormat = Exclude<TableFormat, "xlsx" | "parquet" | "arrow">;

function decode(text: string, format: TextFormat) {
  switch (format) {
    case "csv":
      return readDelimited(text, "auto");
    case "tsv":
      return readDelimited(text, "\t");
    case "json":
      return readJson(text);
    case "jsonl":
      return readJsonLines(text);
  }
}

function readText(text: string, format: TableFormat) {
  if (BINARY_FORMATS.has(format)) {
    throw new TableReadError(
      `${format.toUpperCase()} files are binary. Read them with readTableFile.`
    );
  }
  return withFieldTypes(decode(text, format as TextFormat));
}

/**
 * Reads text as a table, such as a fetched file. `name` names the table and,
 * without `format`, picks the format by its extension; CSV is the default.
 */
export function readTableText(
  text: string,
  options: ReadTableOptions & { name?: string } = {}
): TableFile {
  const fileName = options.name ?? "";
  const format = options.format ?? tableFormatOf(fileName) ?? "csv";
  return { name: baseName(fileName), format, ...readText(text, format) };
}

/**
 * Reads a local file as one table: every row, and each field's type. The
 * format comes from the file's extension unless `options.format` names one.
 * Rejects with a `TableReadError` that says what is wrong and where.
 */
export async function readTableFile(
  file: Blob & { name: string },
  options: ReadTableOptions = {}
): Promise<TableFile> {
  const format = formatFor(file.name, options);
  throwIfAborted(options.signal);
  if (format === "xlsx") {
    const bytes = await blobBytes(file);
    throwIfAborted(options.signal);
    const table = await readXlsx(bytes, options.sheet);
    throwIfAborted(options.signal);
    // A sheet names its table when the workbook holds several.
    const name = table.sheets.length > 1 ? table.sheet : baseName(file.name);
    return { name, format, ...withFieldTypes(table) };
  }
  if (format === "parquet" || format === "arrow") {
    const bytes = await blobBytes(file);
    throwIfAborted(options.signal);
    const table = await (format === "parquet" ? readParquet : readArrow)(bytes);
    throwIfAborted(options.signal);
    return { name: baseName(file.name), format, ...withFieldTypes(table) };
  }
  const text = await blobText(file);
  throwIfAborted(options.signal);
  return { name: baseName(file.name), format, ...readText(text, format) };
}
