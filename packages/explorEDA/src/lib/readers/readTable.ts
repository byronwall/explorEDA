import { readDelimited } from "./delimited";
import { tableFormatList, tableFormatOf } from "./formats";
import { readJson, readJsonLines } from "./json";
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

function decode(text: string, format: TableFormat) {
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
  const table = decode(text, format);
  return {
    ...table,
    fieldTypes: Object.fromEntries(
      table.fields.map((field) => [field.id, field.type ?? "unknown"])
    ),
  };
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
  const text = await blobText(file);
  throwIfAborted(options.signal);
  return { name: baseName(file.name), format, ...readText(text, format) };
}
