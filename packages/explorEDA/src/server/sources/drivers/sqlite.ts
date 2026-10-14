/**
 * SQLite files, through Node's built-in `node:sqlite`. The file opens
 * read-only, so a query that would change it fails. SQLite runs on the
 * server's thread; rows come in batches with a pause between them, so the
 * server keeps answering while a large table reads.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { setImmediate as nextTurn } from "node:timers/promises";
import type { DatabaseSync, StatementSync } from "node:sqlite";
import { loadSqlite } from "../../team/sqliteStore";
import { columnFromValues, refuseBinary } from "../columnKinds";
import {
  SourceReadError,
  type DatabaseDriver,
  type DatabaseSession,
  type ReadCursor,
  type ReadRequest,
  type ResolvedConnection,
  type TableInfo,
} from "../types";

const BATCH = 1000;

/** Statement methods newer than the Node types this package builds with. */
interface StatementColumns {
  columns?(): { name: string; type: string | null }[];
  setReturnArrays?(enabled: boolean): void;
}

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

function failure(error: unknown, what: string): SourceReadError {
  const message = error instanceof Error ? error.message : String(error);
  if (/readonly|read-only/i.test(message)) {
    return new SourceReadError(
      "write",
      `${what} would change the database, and explorEDA only reads.`,
      "Use a select statement."
    );
  }
  return new SourceReadError(
    "query",
    `${what} failed: ${message}.`,
    "Check the table name or the SQL."
  );
}

class SqliteSession implements DatabaseSession {
  private closed = false;

  constructor(private readonly db: DatabaseSync) {}

  async listTables(): Promise<TableInfo[]> {
    const rows = this.db
      .prepare(
        "select name, type from sqlite_schema where type in ('table', 'view') and name not like 'sqlite_%' order by name"
      )
      .all() as { name: string; type: "table" | "view" }[];
    return rows.map((row) => ({ name: row.name, kind: row.type }));
  }

  /** `schema.table` as SQL, unless a table's own name holds the dot. */
  private tableSql(table: string) {
    const exact = this.db
      .prepare("select 1 from sqlite_schema where name = ?")
      .get(table);
    if (exact || !table.includes(".")) {
      return quote(table);
    }
    const dot = table.indexOf(".");
    return `${quote(table.slice(0, dot))}.${quote(table.slice(dot + 1))}`;
  }

  async read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor> {
    const what = request.table ?? "The query";
    let statement: StatementSync;
    try {
      statement = this.db.prepare(
        request.table !== undefined
          ? `select * from ${this.tableSql(request.table)}`
          : request.sql!.trim().replace(/;\s*$/, "")
      );
    } catch (error) {
      throw failure(error, what);
    }
    const newer = statement as StatementSync & StatementColumns;
    if (!newer.columns) {
      throw new SourceReadError(
        "connection",
        `Reading SQLite files needs Node 22.16 or later; this is Node ${process.versions.node}.`
      );
    }
    const columns = newer.columns();
    if (!columns.length) {
      throw new SourceReadError(
        "write",
        "sql= must be a select that returns rows.",
        'Write it as sql="select id, region from customers".'
      );
    }
    statement.setReadBigInts(true);
    // Arrays keep two columns of the same name apart.
    newer.setReturnArrays?.(true);
    const names = columns.map((column) => column.name);
    const asArray = (row: unknown): unknown[] =>
      Array.isArray(row)
        ? row
        : names.map((name) => (row as Record<string, unknown>)[name]);
    const databaseTypes = columns.map((column) => column.type ?? undefined);
    async function* batches() {
      let rows: IterableIterator<unknown>;
      try {
        rows = statement.iterate() as IterableIterator<unknown>;
      } catch (error) {
        throw failure(error, what);
      }
      try {
        let batch: unknown[][] = [];
        while (!signal.aborted) {
          let next: IteratorResult<unknown>;
          try {
            next = rows.next();
          } catch (error) {
            throw failure(error, what);
          }
          if (next.done) {
            break;
          }
          batch.push(asArray(next.value));
          if (batch.length === BATCH) {
            yield batch;
            batch = [];
            await nextTurn();
          }
        }
        if (batch.length) {
          yield batch;
        }
      } finally {
        rows.return?.();
      }
    }
    return {
      names,
      databaseTypes,
      batches: batches(),
      columns: (values) =>
        values.map((columnValues, index) => {
          refuseBinary(request.sourceId, names[index]!, columnValues);
          return columnFromValues(
            names[index]!,
            columnValues,
            databaseTypes[index]
          );
        }),
    };
  }

  async close() {
    if (!this.closed) {
      this.closed = true;
      this.db.close();
    }
  }
}

export const sqliteDriver: DatabaseDriver = {
  name: "sqlite",
  label: "SQLite",
  async connect(connection: ResolvedConnection) {
    const file = connection.settings.path;
    if (!file) {
      throw new SourceReadError(
        "connection",
        `${connection.id} needs the database file's path.`,
        `Write it as connection @${connection.id} driver=sqlite path=data/app.db.`
      );
    }
    const full = path.resolve(connection.root, file);
    const stat = await fs.stat(full).catch(() => undefined);
    if (!stat?.isFile()) {
      throw new SourceReadError(
        "connection",
        `${connection.id} reads ${file}, which doesn't exist.`,
        "Fix path= or restore the file."
      );
    }
    const { DatabaseSync } = await loadSqlite("Reading SQLite files");
    let db: DatabaseSync;
    try {
      db = new DatabaseSync(full, { readOnly: true });
      db.prepare("select count(*) from sqlite_schema").get();
    } catch (error) {
      throw new SourceReadError(
        "connection",
        `${file} isn't a SQLite database: ${error instanceof Error ? error.message : String(error)}.`,
        "Point path= at a .db or .sqlite file."
      );
    }
    return new SqliteSession(db);
  },
};
