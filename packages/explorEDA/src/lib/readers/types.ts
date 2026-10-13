import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

/** A file format that `readTableFile` reads. */
export type TableFormat = "csv" | "tsv" | "json" | "jsonl" | "xlsx" | "parquet";

/** A workbook sheet that holds a table. */
export interface WorkbookSheet {
  name: string;
  /** Data rows below the header row. */
  rows: number;
  /** The widest row's filled cells. */
  columns: number;
}

/** One table read from a file: every row, and each field's declared type. */
export interface TableFile {
  /**
   * A name for the table, as a source or view name: the file name without
   * its extension, or the sheet's name when a workbook holds several.
   */
  name: string;
  format: TableFormat;
  rows: AnalysisSourceRow[];
  /**
   * Every field in column order, with the type the file states or its values
   * show. Pass the types to `ExplorEda`'s `fieldTypes`, or the fields to
   * `addSourceFromRows` and `singleTableProject`.
   */
  fields: FieldDefinition[];
  /** Each field's type by name, as `ExplorEda`'s `fieldTypes` takes them. */
  fieldTypes: Record<string, DeclaredFieldType>;
  /** Changes made while reading, such as a renamed duplicate header. */
  notes: string[];
  /** For a workbook, the sheet that was read. */
  sheet?: string;
  /**
   * For a workbook, every sheet with a table, in workbook order. When there
   * are several, read another with `readTableFile(file, { sheet })`.
   */
  sheets?: WorkbookSheet[];
}

export interface ReadTableOptions {
  /** Read as this format instead of the one the file name suggests. */
  format?: TableFormat;
  /** For a workbook, the sheet to read. The sheet with the largest table otherwise. */
  sheet?: string;
  /** Stops the read; it rejects with the signal's reason. */
  signal?: AbortSignal;
}

/** A file that could not be read as a table, with where the problem is. */
export class TableReadError extends Error {
  /** The 1-based data row, not counting a header row. */
  readonly row?: number;

  constructor(message: string, options: { row?: number } = {}) {
    super(message);
    this.name = "TableReadError";
    this.row = options.row;
  }
}
