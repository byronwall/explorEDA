import type { TableFormat } from "./types";

export interface TableFormatInfo {
  format: TableFormat;
  /** A short name for the format, such as "TSV". */
  label: string;
  extensions: readonly string[];
  mimeTypes: readonly string[];
  /** Read from bytes, not text; `readTableText` can't read it. */
  binary?: boolean;
}

/** Every format `readTableFile` reads, in the order to list them. */
export const TABLE_FORMATS: readonly TableFormatInfo[] = [
  {
    format: "csv",
    label: "CSV",
    extensions: [".csv", ".txt"],
    mimeTypes: ["text/csv"],
  },
  {
    format: "tsv",
    label: "TSV",
    extensions: [".tsv", ".tab"],
    mimeTypes: ["text/tab-separated-values"],
  },
  {
    format: "json",
    label: "JSON",
    extensions: [".json"],
    mimeTypes: ["application/json"],
  },
  {
    format: "jsonl",
    label: "JSON Lines",
    extensions: [".jsonl", ".ndjson"],
    mimeTypes: ["application/jsonl", "application/x-ndjson"],
  },
  {
    format: "xlsx",
    label: "Excel",
    binary: true,
    extensions: [".xlsx"],
    mimeTypes: [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
  },
  {
    format: "parquet",
    label: "Parquet",
    binary: true,
    extensions: [".parquet"],
    mimeTypes: ["application/vnd.apache.parquet"],
  },
  {
    format: "arrow",
    label: "Arrow",
    binary: true,
    extensions: [".arrow", ".arrows", ".feather", ".ipc"],
    mimeTypes: [
      "application/vnd.apache.arrow.file",
      "application/vnd.apache.arrow.stream",
    ],
  },
];

/** Formats read from bytes rather than text. */
export const BINARY_FORMATS: ReadonlySet<TableFormat> = new Set(
  TABLE_FORMATS.filter((info) => info.binary).map((info) => info.format)
);

/** The format a file name's extension names, or undefined. */
export function tableFormatOf(fileName: string): TableFormat | undefined {
  const name = fileName.toLowerCase();
  return TABLE_FORMATS.find((info) =>
    info.extensions.some((extension) => name.endsWith(extension))
  )?.format;
}

/** A file input's `accept` value for every readable format. */
export function tableFileAccept(): string {
  return TABLE_FORMATS.flatMap((info) => [
    ...info.extensions,
    ...info.mimeTypes,
  ]).join(",");
}

/** Readable formats as a MIME type to extensions map, as file pickers take. */
export function tableFileTypes(): Record<string, string[]> {
  return Object.fromEntries(
    TABLE_FORMATS.map((info) => [info.mimeTypes[0]!, [...info.extensions]])
  );
}

/** Readable format names for a sentence, such as "CSV, TSV, or JSON". */
export function tableFormatList(conjunction = "or"): string {
  const labels = TABLE_FORMATS.map((info) => info.label);
  if (labels.length < 3) return labels.join(` ${conjunction} `);
  return `${labels.slice(0, -1).join(", ")}, ${conjunction} ${labels.at(-1)}`;
}
