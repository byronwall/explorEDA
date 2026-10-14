/**
 * Microsoft SQL Server and Azure SQL, through `mssql`. SQL Server has no
 * read-only transaction, so a read is checked and contained instead:
 * SQL Server describes the query first, and one that returns no rows is
 * refused before it runs; the read itself runs in a transaction that is
 * always rolled back, so nothing it does can stay. Give explorEDA a user
 * that can only read, too. Rows stream from the server in batches.
 */
import type { Readable } from "node:stream";
import sql from "mssql";
import type { Column, Kind } from "../../../lib/readers/typedColumns";
import { secretVariable } from "../../../node/secrets";
import { decimalColumn, refuseBinary } from "../columnKinds";
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

/** A column as SQL Server describes it before the query runs. */
interface Described {
  name: string;
  /** Such as `decimal(18,4)` or `nvarchar(100)`. */
  system_type_name: string;
  precision: number;
}

/** The type's name without its size: `decimal(18,4)` → `decimal`. */
const baseType = (column: Described) =>
  column.system_type_name.replace(/\(.*$/, "").toLowerCase();

const BINARY = new Set([
  "binary",
  "varbinary",
  "image",
  "timestamp",
  "rowversion",
]);
const DECIMAL = new Set(["decimal", "numeric", "money", "smallmoney"]);

function kindOf(type: string): Kind {
  switch (type) {
    case "bit":
      return "boolean";
    case "tinyint":
    case "smallint":
    case "int":
    case "bigint":
      return "integer";
    case "float":
    case "real":
      return "float";
    case "date":
    case "datetime":
    case "datetime2":
    case "smalldatetime":
    case "datetimeoffset":
      return "timestamp";
    default:
      return DECIMAL.has(type) ? "decimal" : "text";
  }
}

/** ISO text for a date SQL Server sent, read as UTC wall-clock time. */
function isoText(value: Date, type: string) {
  const iso = value.toISOString().replace(/\.000Z$/, "Z");
  if (type === "date") return iso.slice(0, 10);
  if (type === "datetimeoffset") return iso;
  return iso.replace(/Z$/, "");
}

function failure(error: unknown, what: string, id: string): SourceReadError {
  if (error instanceof SourceReadError) return error;
  const { code, number } = error as { code?: string; number?: number };
  const original = (error as { originalError?: { message?: string } })
    .originalError?.message;
  const message =
    original ?? (error instanceof Error ? error.message : String(error));
  if (code === "ELOGIN" || number === 18456) {
    return new SourceReadError(
      "secret",
      `${id} refused its password: ${message}.`,
      "Enter it again."
    );
  }
  if (
    code === "ESOCKET" ||
    code === "ETIMEOUT" ||
    code === "EINSTLOOKUP" ||
    number === 4060
  ) {
    return new SourceReadError(
      "connection",
      `${id} can't reach its database: ${message}.`,
      "Check host=, port=, and database=, and that the database is running."
    );
  }
  return new SourceReadError(
    "query",
    `${what} failed: ${message}.`,
    "Check the table name or the SQL."
  );
}

class SqlServerSession implements DatabaseSession {
  constructor(
    private readonly pool: sql.ConnectionPool,
    private readonly id: string
  ) {}

  async listTables(): Promise<TableInfo[]> {
    const result = await this.pool.request().query<{
      TABLE_SCHEMA: string;
      TABLE_NAME: string;
      TABLE_TYPE: string;
    }>(
      `select TABLE_SCHEMA, TABLE_NAME, TABLE_TYPE
         from INFORMATION_SCHEMA.TABLES
        order by case when TABLE_SCHEMA = 'dbo' then 0 else 1 end, TABLE_SCHEMA, TABLE_NAME`
    );
    return result.recordset.map((row) => ({
      name:
        row.TABLE_SCHEMA === "dbo"
          ? row.TABLE_NAME
          : `${row.TABLE_SCHEMA}.${row.TABLE_NAME}`,
      schema: row.TABLE_SCHEMA,
      kind: row.TABLE_TYPE === "VIEW" ? "view" : "table",
    }));
  }

  private async describe(text: string): Promise<Described[]> {
    const result = await this.pool
      .request()
      .input("tsql", sql.NVarChar(sql.MAX), text)
      .query<
        Described & { is_hidden: boolean }
      >("exec sp_describe_first_result_set @tsql = @tsql");
    return result.recordset.filter((column) => !column.is_hidden);
  }

  async read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor> {
    const what = request.table ?? "The query";
    const id = this.id;
    const quote = (name: string) => `[${name.replace(/]/g, "]]")}]`;
    let text: string;
    let described: Described[];
    try {
      if (request.table !== undefined) {
        const exact = await this.pool
          .request()
          .input("name", sql.NVarChar, request.table)
          .query(
            "select 1 as found from INFORMATION_SCHEMA.TABLES where TABLE_NAME = @name"
          );
        const dot = request.table.indexOf(".");
        const table =
          exact.recordset.length || dot < 0
            ? quote(request.table)
            : `${quote(request.table.slice(0, dot))}.${quote(request.table.slice(dot + 1))}`;
        described = await this.describe(`select * from ${table}`);
        // Decimals too precise for a JavaScript number come as text, which
        // keeps every digit.
        text = `select ${described
          .map((column) =>
            DECIMAL.has(baseType(column)) && column.precision > 15
              ? `cast(${quote(column.name)} as varchar(64)) as ${quote(column.name)}`
              : quote(column.name)
          )
          .join(", ")} from ${table}`;
      } else {
        text = request.sql!.trim().replace(/;\s*$/, "");
        described = await this.describe(text);
      }
    } catch (error) {
      throw failure(error, what, id);
    }
    if (!described.length) {
      throw new SourceReadError(
        "write",
        "sql= must be a select that returns rows.",
        'Write it as sql="select id, region from customers".'
      );
    }
    const transaction = new sql.Transaction(this.pool);
    await transaction.begin(sql.ISOLATION_LEVEL.READ_COMMITTED);
    const query = new sql.Request(transaction);
    query.arrayRowMode = true;
    const stream = query.toReadableStream({ highWaterMark: BATCH }) as Readable;
    // The request reports its own errors; iterating the stream rethrows them.
    stream.on("error", () => {});
    query.query(text).catch(() => {});
    const stop = () => query.cancel();
    signal.addEventListener("abort", stop, { once: true });
    async function* batches() {
      let batch: unknown[][] = [];
      try {
        for await (const row of stream) {
          batch.push(row as unknown[]);
          if (batch.length === BATCH) {
            yield batch;
            batch = [];
          }
          if (signal.aborted) return;
        }
        if (batch.length) yield batch;
      } catch (error) {
        throw failure(error, what, id);
      } finally {
        signal.removeEventListener("abort", stop);
        stream.destroy();
        // Whatever the read did, none of it stays.
        await transaction.rollback().catch(() => {});
      }
    }
    return {
      names: described.map((column) => column.name),
      databaseTypes: described.map((column) => column.system_type_name),
      batches: batches(),
      columns: (values) =>
        values.map((columnValues, index): Column => {
          const column = described[index]!;
          const type = baseType(column);
          if (BINARY.has(type)) {
            refuseBinary(request.sourceId, column.name, [new Uint8Array()]);
          }
          refuseBinary(request.sourceId, column.name, columnValues);
          let kind = kindOf(type);
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
          for (let row = 0; row < columnValues.length; row++) {
            const value = columnValues[row];
            if (value instanceof Date) {
              columnValues[row] =
                type === "time"
                  ? value
                      .toISOString()
                      .slice(11, 23)
                      .replace(/\.000$/, "")
                  : isoText(value, type);
            }
          }
          return { name: column.name, kind, scale, utc: true };
        }),
    };
  }

  async close() {
    await this.pool.close().catch(() => {});
  }
}

/** `ssl=require` (the default) encrypts; `verify-full` checks the certificate. */
function encryption(setting: string | undefined) {
  switch (setting) {
    case undefined:
    case "require":
      return { encrypt: true, trustServerCertificate: true };
    case "verify-full":
      return { encrypt: true, trustServerCertificate: false };
    case "disable":
      return { encrypt: false, trustServerCertificate: true };
    default:
      throw new SourceReadError(
        "connection",
        `ssl=${setting} isn't a setting explorEDA knows.`,
        "Use ssl=require, ssl=verify-full, or ssl=disable."
      );
  }
}

export const sqlServerDriver: DatabaseDriver = {
  name: "sqlserver",
  label: "SQL Server",
  async connect(connection: ResolvedConnection) {
    const { host, port, database, user, ssl } = connection.settings;
    if (!host || !database) {
      throw new SourceReadError(
        "connection",
        `${connection.id} needs host= and database=.`,
        `Write it as connection @${connection.id} driver=sqlserver host=db.internal database=sales user=reader.`
      );
    }
    if (user && connection.secret === undefined) {
      throw new SourceReadError(
        "secret",
        `${connection.id} needs a password.`,
        `Enter it here, or set ${secretVariable(connection)} before starting explorEDA.`
      );
    }
    const pool = new sql.ConnectionPool({
      server: host,
      port: port ? Number(port) : 1433,
      database,
      ...(user ? { user } : {}),
      ...(connection.secret === undefined
        ? {}
        : { password: connection.secret }),
      options: { ...encryption(ssl), useUTC: true, appName: "explorEDA" },
      pool: { max: 1, min: 0 },
      connectionTimeout: 15_000,
      // A read's time is kept by explorEDA, which cancels it when it's up.
      requestTimeout: 0,
    });
    // A dropped connection is reported by the read that needed it.
    pool.on("error", () => {});
    try {
      await pool.connect();
    } catch (error) {
      await pool.close().catch(() => {});
      throw failure(error, "Connecting", connection.id);
    }
    return new SqlServerSession(pool, connection.id);
  },
};
