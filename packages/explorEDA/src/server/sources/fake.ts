/**
 * A database in memory, for tests. It answers like a real driver and can
 * fail on purpose: at connect, at read, partway through the rows, by
 * stalling, or at close. It counts open sessions, so a test can see each one close.
 */
import { columnFromValues, refuseBinary } from "./columnKinds";
import {
  SourceReadError,
  type DatabaseDriver,
  type DatabaseSession,
  type ReadRequest,
  type TableInfo,
} from "./types";

export interface FakeTable {
  columns: { name: string; type?: string }[];
  rows: unknown[][];
  kind?: "table" | "view";
}

export interface FakeDatabase {
  tables: Record<string, FakeTable>;
  /** Fails `connect` with this error. */
  failConnect?: SourceReadError;
  /** Throws this after yielding this many rows. */
  failAfter?: { rows: number; error: Error };
  /** Waits this long before each batch, in milliseconds. */
  stallMs?: number;
  /** Answers sql= with a table's rows, keyed by the exact SQL. */
  queries?: Record<string, FakeTable>;
  batchSize?: number;
  /** Throws this from `close`, after counting the session closed. */
  failClose?: Error;
}

export function fakeDriver(database: FakeDatabase) {
  const state = { open: 0, connects: 0, reads: [] as ReadRequest[] };
  const driver: DatabaseDriver = {
    name: "fake",
    label: "Fake",
    async connect() {
      if (database.failConnect) {
        throw database.failConnect;
      }
      state.connects += 1;
      state.open += 1;
      let closed = false;
      const session: DatabaseSession = {
        async listTables(): Promise<TableInfo[]> {
          return Object.entries(database.tables).map(([name, table]) => ({
            name,
            kind: table.kind ?? "table",
          }));
        },
        async read(request, signal) {
          state.reads.push(request);
          const table =
            request.table !== undefined
              ? database.tables[request.table]
              : database.queries?.[request.sql!];
          if (!table) {
            throw new SourceReadError(
              "query",
              `${request.table ?? "The query"} failed: no such table.`
            );
          }
          const size = database.batchSize ?? 2;
          async function* batches() {
            let sent = 0;
            for (let start = 0; start < table!.rows.length; start += size) {
              if (database.stallMs) {
                await new Promise((resolve) =>
                  setTimeout(resolve, database.stallMs)
                );
              }
              if (signal.aborted) {
                return;
              }
              const batch = table!.rows.slice(start, start + size);
              if (
                database.failAfter &&
                sent + batch.length > database.failAfter.rows
              ) {
                throw database.failAfter.error;
              }
              sent += batch.length;
              yield batch;
            }
          }
          return {
            names: table.columns.map((column) => column.name),
            databaseTypes: table.columns.map((column) => column.type),
            batches: batches(),
            columns: (values) =>
              values.map((columnValues, index) => {
                const column = table.columns[index]!;
                refuseBinary(request.sourceId, column.name, columnValues);
                return columnFromValues(column.name, columnValues, column.type);
              }),
          };
        },
        async close() {
          if (!closed) {
            closed = true;
            state.open -= 1;
          }
          if (database.failClose) {
            throw database.failClose;
          }
        },
      };
      return session;
    },
  };
  return { driver, state };
}
