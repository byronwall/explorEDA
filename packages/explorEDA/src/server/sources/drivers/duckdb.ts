/**
 * DuckDB files, through `@duckdb/node-api`. DuckDB's native library is 70
 * to 110 MB, so explorEDA doesn't install it: a project that reads DuckDB
 * installs the package once, and the driver finds it beside explorEDA or
 * in the project folder.
 *
 * The file opens read-only with external access off, so a query can't
 * write, attach another database, or read files beside it. Only `select`
 * statements run. Rows come in DuckDB's own chunks.
 */
import { createRequire } from "node:module";
import { promises as fs } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type * as Duck from "@duckdb/node-api";
import type { Column, Kind } from "../../../lib/readers/typedColumns";
import { decimalColumn, isoTimestamp, refuseBinary } from "../columnKinds";
import {
  SourceReadError,
  type DatabaseDriver,
  type DatabaseSession,
  type ReadCursor,
  type ReadRequest,
  type ResolvedConnection,
  type TableInfo,
} from "../types";

type DuckModule = typeof Duck;

const PACKAGE = "@duckdb/node-api";

/** The DuckDB package: beside explorEDA, or installed in the project. */
async function loadDuckdb(root: string): Promise<DuckModule> {
  try {
    return (await import(PACKAGE)) as DuckModule;
  } catch {
    // Not beside explorEDA; look in the project.
  }
  try {
    const found = createRequire(path.join(root, "package.json")).resolve(
      PACKAGE
    );
    return (await import(pathToFileURL(found).href)) as DuckModule;
  } catch {
    throw new SourceReadError(
      "connection",
      "Reading DuckDB files needs DuckDB's Node package, which explorEDA doesn't install for everyone.",
      `Run npm install ${PACKAGE} in the project folder (70 to 110 MB), then read again.`
    );
  }
}

function kindOf(duck: DuckModule, typeId: number): Kind {
  const id = duck.DuckDBTypeId;
  switch (typeId) {
    case id.BOOLEAN:
      return "boolean";
    case id.TINYINT:
    case id.SMALLINT:
    case id.INTEGER:
    case id.BIGINT:
    case id.UTINYINT:
    case id.USMALLINT:
    case id.UINTEGER:
    case id.UBIGINT:
    case id.HUGEINT:
    case id.UHUGEINT:
      return "integer";
    case id.FLOAT:
    case id.DOUBLE:
      return "float";
    case id.DECIMAL:
      return "decimal";
    case id.DATE:
    case id.TIMESTAMP:
    case id.TIMESTAMP_S:
    case id.TIMESTAMP_MS:
    case id.TIMESTAMP_NS:
    case id.TIMESTAMP_TZ:
      return "timestamp";
    case id.LIST:
    case id.STRUCT:
    case id.MAP:
    case id.ARRAY:
    case id.UNION:
      return "json";
    default:
      return "text";
  }
}

function failure(error: unknown, what: string): SourceReadError {
  if (error instanceof SourceReadError) return error;
  const message = error instanceof Error ? error.message : String(error);
  if (/read-only|read only/i.test(message)) {
    return new SourceReadError(
      "write",
      `${what} would change the database, and explorEDA only reads.`,
      "Use a select statement."
    );
  }
  if (/interrupt/i.test(message)) {
    return new SourceReadError("cancelled", `${what} stopped.`);
  }
  return new SourceReadError(
    "query",
    `${what} failed: ${message}.`,
    "Check the table name or the SQL."
  );
}

class DuckdbSession implements DatabaseSession {
  constructor(
    private readonly duck: DuckModule,
    private readonly instance: Duck.DuckDBInstance,
    private readonly connection: Duck.DuckDBConnection
  ) {}

  async listTables(): Promise<TableInfo[]> {
    const reader = await this.connection.runAndReadAll(
      `select table_schema, table_name, table_type
         from information_schema.tables
        where table_catalog = current_database()
        order by table_schema = 'main' desc, table_schema, table_name`
    );
    return reader.getRowObjectsJson().map((row) => ({
      name:
        row.table_schema === "main"
          ? String(row.table_name)
          : `${String(row.table_schema)}.${String(row.table_name)}`,
      schema: String(row.table_schema),
      kind: row.table_type === "VIEW" ? "view" : "table",
    }));
  }

  async read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor> {
    const duck = this.duck;
    const connection = this.connection;
    const what = request.table ?? "The query";
    const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;
    let result: Duck.DuckDBResult;
    try {
      let text: string;
      if (request.table !== undefined) {
        const exact = await connection.runAndReadAll(
          "select 1 from information_schema.tables where table_name = $name",
          { name: request.table }
        );
        const dot = request.table.indexOf(".");
        text = `select * from ${
          exact.currentRowCount || dot < 0
            ? quote(request.table)
            : `${quote(request.table.slice(0, dot))}.${quote(request.table.slice(dot + 1))}`
        }`;
      } else {
        text = request.sql!.trim().replace(/;\s*$/, "");
      }
      const prepared = await connection.prepare(text);
      if (prepared.statementType !== duck.StatementType.SELECT) {
        throw new SourceReadError(
          "write",
          "sql= must be a select that returns rows.",
          'Write it as sql="select id, region from customers".'
        );
      }
      result = await prepared.stream();
    } catch (error) {
      throw failure(error, what);
    }
    const stop = () => connection.interrupt();
    signal.addEventListener("abort", stop, { once: true });
    const names = result.columnNames();
    const types = result.columnTypes();
    async function* batches() {
      try {
        for (;;) {
          if (signal.aborted) return;
          let chunk: Duck.DuckDBDataChunk | null;
          try {
            chunk = await result.fetchChunk();
          } catch (error) {
            throw failure(error, what);
          }
          if (!chunk || chunk.rowCount === 0) return;
          const columns = chunk.convertColumns(duck.JsonDuckDBValueConverter);
          const rows: unknown[][] = new Array(chunk.rowCount);
          for (let row = 0; row < chunk.rowCount; row++) {
            rows[row] = columns.map((column) => column[row] ?? null);
          }
          yield rows;
        }
      } finally {
        signal.removeEventListener("abort", stop);
      }
    }
    return {
      names,
      databaseTypes: types.map((type) => String(type)),
      batches: batches(),
      columns: (values) =>
        values.map((columnValues, index): Column => {
          const typeId = types[index]!.typeId;
          const name = names[index]!;
          if (
            typeId === duck.DuckDBTypeId.BLOB ||
            typeId === duck.DuckDBTypeId.BIT
          ) {
            refuseBinary(request.sourceId, name, [new Uint8Array()]);
          }
          let kind = kindOf(duck, typeId);
          let scale = 0;
          if (kind === "decimal") {
            if (columnValues.some((value) => typeof value === "number")) {
              kind = "float";
            } else {
              const found = decimalColumn(columnValues);
              if (found === undefined) kind = "text";
              else scale = found;
            }
          }
          if (kind === "timestamp" && typeId !== duck.DuckDBTypeId.DATE) {
            for (let row = 0; row < columnValues.length; row++) {
              const value = columnValues[row];
              if (typeof value === "string") {
                columnValues[row] = isoTimestamp(value);
              }
            }
          }
          return { name, kind, scale, utc: true };
        }),
    };
  }

  async close() {
    this.connection.closeSync();
    this.instance.closeSync();
  }
}

export const duckdbDriver: DatabaseDriver = {
  name: "duckdb",
  label: "DuckDB",
  async connect(connection: ResolvedConnection) {
    const file = connection.settings.path;
    if (!file) {
      throw new SourceReadError(
        "connection",
        `${connection.id} needs the database file's path.`,
        `Write it as connection @${connection.id} driver=duckdb path=data/warehouse.duckdb.`
      );
    }
    const full = path.resolve(connection.root, file);
    const inside = path.relative(connection.root, full);
    if (
      connection.confined &&
      (inside.startsWith("..") || path.isAbsolute(inside))
    ) {
      throw new SourceReadError(
        "connection",
        `${connection.id} reads ${file}, outside this project.`,
        "Upload the database file to the project, and point path= at it."
      );
    }
    const stat = await fs.stat(full).catch(() => undefined);
    if (!stat?.isFile()) {
      throw new SourceReadError(
        "connection",
        `${connection.id} reads ${file}, which doesn't exist.`,
        "Fix path= or restore the file."
      );
    }
    const duck = await loadDuckdb(connection.root);
    try {
      const instance = await duck.DuckDBInstance.create(full, {
        access_mode: "READ_ONLY",
        enable_external_access: "false",
      });
      const session = await instance.connect();
      await session.run("set TimeZone = 'UTC'");
      return new DuckdbSession(duck, instance, session);
    } catch (error) {
      throw new SourceReadError(
        "connection",
        `${file} can't be opened as a DuckDB database: ${error instanceof Error ? error.message : String(error)}.`,
        "Point path= at a .duckdb file."
      );
    }
  },
};
