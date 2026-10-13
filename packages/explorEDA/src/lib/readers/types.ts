import type { DeclaredFieldType } from "@/lib/declaredFieldTypes";
import type {
  AnalysisSourceRow,
  FieldDefinition,
} from "@/types/AnalysisProject";

/** A file format that `readTableFile` reads. */
export type TableFormat = "csv" | "tsv" | "json";

/** One table read from a file: every row, and each field's declared type. */
export interface TableFile {
  /** The file name without its extension, as a source or view name. */
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
}

export interface ReadTableOptions {
  /** Read as this format instead of the one the file name suggests. */
  format?: TableFormat;
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
