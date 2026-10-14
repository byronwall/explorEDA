/**
 * The port between explorEDA and a database. A driver opens a session for a
 * connection; a session lists what it holds and reads one source's rows.
 * Everything above it (limits, types, the snapshot file) is the same for
 * every database, so each driver says only how its database answers.
 */
import type { Column } from "../../lib/readers/typedColumns";
import type { ConnectionDefinition } from "../../lib/dsl/project";

export type SourceReadErrorCode =
  /** The database can't be reached, or its settings are wrong. */
  | "connection"
  /** The connection needs a password, or refused the one it was given. */
  | "secret"
  /** The table or query doesn't exist, or the database refused it. */
  | "query"
  /** The read would write, which explorEDA never does. */
  | "write"
  | "too-many-rows"
  | "too-large"
  | "timeout"
  | "cancelled"
  /** A column holds values explorEDA can't keep, such as binary data. */
  | "unsupported-type"
  /** The source or its connection isn't in the project. */
  | "unknown-source"
  | "unknown-driver";

/** Why a read failed, in words the author can act on. */
export class SourceReadError extends Error {
  /** The connection the error belongs to, when there is one. */
  connection?: string;

  constructor(
    readonly code: SourceReadErrorCode,
    message: string,
    readonly suggestion?: string
  ) {
    super(message);
    this.name = "SourceReadError";
  }
}

/** A connection with its secret, as a driver receives it. */
export interface ResolvedConnection extends ConnectionDefinition {
  /** The password or other secret; never written to the project. */
  secret?: string;
  /** The project folder, which relative file paths start from. */
  root: string;
  /** True on a shared server: file paths must stay inside the project. */
  confined?: boolean;
}

/** A table or view a connection can read. */
export interface TableInfo {
  /** The name a `table=` setting takes, with its schema when it needs one. */
  name: string;
  schema?: string;
  kind: "table" | "view";
}

export interface ReadRequest {
  /** The explorEDA source the rows are for, for messages. */
  sourceId: string;
  table?: string;
  sql?: string;
  /** How long the database may spend, in milliseconds, where it can enforce it. */
  timeout?: number;
}

/**
 * Rows a read is returning. `batches` yields rows as arrays in column
 * order. After the last batch, `columns` turns each column's values into a
 * typed column, since a database without strict types can only say what a
 * column holds once it has seen it. It may rewrite the values in place into
 * the form its kind takes, such as decimal text into unscaled integers.
 */
export interface ReadCursor {
  names: string[];
  /** The database's name for each column's type, where it has one. */
  databaseTypes: (string | undefined)[];
  batches: AsyncIterable<unknown[][]>;
  columns(values: unknown[][]): Column[];
}

export interface DatabaseSession {
  listTables(): Promise<TableInfo[]>;
  read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor>;
  /** Releases the connection; called after every read, failed or not. */
  close(): Promise<void>;
}

export interface DatabaseDriver {
  name: string;
  /** Words for a person: "SQLite", "PostgreSQL". */
  label: string;
  connect(connection: ResolvedConnection): Promise<DatabaseSession>;
}

export interface ReadLimits {
  rows: number;
  bytes: number;
  /** How long a read may take, in milliseconds. */
  timeout: number;
}
