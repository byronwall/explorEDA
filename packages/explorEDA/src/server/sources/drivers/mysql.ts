/**
 * MySQL and MariaDB, through `mysql2`. Each read runs in a read-only
 * transaction with a consistent snapshot, so nothing can be written and
 * every row comes from one moment. Rows stream from the server, so a read
 * that passes its limit stops without fetching the rest.
 *
 * Big integers, decimals, and dates arrive as the text MySQL sends, so no
 * digit or day is lost to a JavaScript number or the server's time zone.
 */
import type { Readable } from "node:stream";
import mysql from "mysql2";
import type { Column, Kind } from "../../../lib/readers/typedColumns";
import { secretVariable } from "../../../node/secrets";
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

const BATCH = 1000;

/** Column type codes from MySQL's protocol. */
const TYPE = mysql.Types as unknown as Record<string, number>;

interface FieldInfo {
  name: string;
  columnType: number;
  columnLength: number;
  /** 63 is binary; anything else is a text character set. */
  characterSet: number;
}

function kindOf(field: FieldInfo): Kind {
  switch (field.columnType) {
    case TYPE.TINY:
      return field.columnLength === 1 ? "boolean" : "integer";
    case TYPE.SHORT:
    case TYPE.LONG:
    case TYPE.INT24:
    case TYPE.LONGLONG:
    case TYPE.YEAR:
      return "integer";
    case TYPE.DECIMAL:
    case TYPE.NEWDECIMAL:
      return "decimal";
    case TYPE.FLOAT:
    case TYPE.DOUBLE:
      return "float";
    case TYPE.DATE:
    case TYPE.DATETIME:
    case TYPE.TIMESTAMP:
      return "timestamp";
    case TYPE.JSON:
      return "json";
    default:
      return "text";
  }
}

const isBinary = (field: FieldInfo) =>
  field.characterSet === 63 &&
  [
    TYPE.BLOB,
    TYPE.TINY_BLOB,
    TYPE.MEDIUM_BLOB,
    TYPE.LONG_BLOB,
    TYPE.VAR_STRING,
    TYPE.STRING,
    TYPE.BIT,
  ].includes(field.columnType);

function failure(error: unknown, what: string, id: string): SourceReadError {
  if (error instanceof SourceReadError) return error;
  const { code, errno } = error as { code?: string; errno?: number };
  const message = error instanceof Error ? error.message : String(error);
  if (errno === 1792 || code === "ER_CANT_EXECUTE_IN_READ_ONLY_TRANSACTION") {
    return new SourceReadError(
      "write",
      `${what} would change the database, and explorEDA only reads.`,
      "Use a select statement."
    );
  }
  if (errno === 3024) {
    return new SourceReadError(
      "timeout",
      `${what} took longer than the database allowed.`,
      "Read fewer rows or columns with sql=."
    );
  }
  if (errno === 1045) {
    return new SourceReadError(
      "secret",
      /using password: NO/.test(message)
        ? `${id} needs a password.`
        : `${id} refused its password: ${message}.`,
      "Enter it again."
    );
  }
  if (
    errno === 1049 ||
    ["ECONNREFUSED", "ENOTFOUND", "ETIMEDOUT", "EHOSTUNREACH"].includes(
      code ?? ""
    )
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

class MysqlSession implements DatabaseSession {
  constructor(
    private readonly connection: mysql.Connection,
    private readonly id: string
  ) {}

  private query<T>(sql: string, values: unknown[] = []) {
    return this.connection.promise().query(sql, values) as Promise<
      [T, unknown]
    >;
  }

  async listTables(): Promise<TableInfo[]> {
    const [rows] = await this.query<
      { TABLE_NAME: string; TABLE_TYPE: string }[]
    >(
      `select table_name as TABLE_NAME, table_type as TABLE_TYPE
         from information_schema.tables
        where table_schema = database()
        order by table_name`
    );
    return rows.map((row) => ({
      name: row.TABLE_NAME,
      kind: row.TABLE_TYPE === "VIEW" ? "view" : "table",
    }));
  }

  async read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor> {
    const what = request.table ?? "The query";
    const id = this.id;
    const connection = this.connection;
    const quote = (name: string) => `\`${name.replace(/`/g, "``")}\``;
    try {
      await this.query("set session time_zone = '+00:00'");
      if (request.timeout) {
        await this.query("set session max_execution_time = ?", [
          Math.max(1, Math.round(request.timeout)),
        ]);
      }
      await this.query("start transaction with consistent snapshot, read only");
    } catch (error) {
      throw failure(error, what, id);
    }
    let table = "";
    if (request.table !== undefined) {
      const [exact] = await this.query<unknown[]>(
        "select 1 from information_schema.tables where table_schema = database() and table_name = ?",
        [request.table]
      );
      const dot = request.table.indexOf(".");
      table =
        exact.length || dot < 0
          ? quote(request.table)
          : `${quote(request.table.slice(0, dot))}.${quote(request.table.slice(dot + 1))}`;
    }
    const sql =
      request.table !== undefined
        ? `select * from ${table}`
        : request.sql!.trim().replace(/;\s*$/, "");
    const query = connection.query({ sql, rowsAsArray: true });
    // A cancelled read drops the connection, which stops the query.
    const stop = () => connection.destroy();
    signal.addEventListener("abort", stop, { once: true });
    const stream = query.stream({ highWaterMark: BATCH }) as Readable;
    // The query reports its own errors; iterating the stream rethrows them.
    stream.on("error", () => {});
    const fields = await new Promise<FieldInfo[]>((resolve, reject) => {
      query.once("fields", (found: FieldInfo[]) => resolve(found ?? []));
      query.once("error", (error: unknown) => reject(failure(error, what, id)));
      query.once("end", () => resolve([]));
    }).catch(async (error: unknown) => {
      signal.removeEventListener("abort", stop);
      await this.query("rollback").catch(() => {});
      throw error;
    });
    if (!fields.length) {
      signal.removeEventListener("abort", stop);
      await this.query("rollback").catch(() => {});
      throw new SourceReadError(
        "write",
        "sql= must be a select that returns rows.",
        'Write it as sql="select id, region from customers".'
      );
    }
    const rollback = () => this.query("rollback").catch(() => {});
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
        if (!signal.aborted) await rollback();
      }
    }
    return {
      names: fields.map((field) => field.name),
      databaseTypes: fields.map(
        (field) =>
          Object.keys(TYPE)
            .find((name) => TYPE[name] === field.columnType)
            ?.toLowerCase() ?? undefined
      ),
      batches: batches(),
      columns: (values) =>
        values.map((columnValues, index): Column => {
          const field = fields[index]!;
          if (isBinary(field)) {
            refuseBinary(request.sourceId, field.name, [new Uint8Array()]);
          }
          refuseBinary(request.sourceId, field.name, columnValues);
          let kind = kindOf(field);
          let scale = 0;
          if (kind === "decimal") {
            const found = decimalColumn(columnValues);
            if (found === undefined) kind = "text";
            else scale = found;
          }
          if (kind === "boolean") {
            for (let row = 0; row < columnValues.length; row++) {
              const value = columnValues[row];
              if (value !== null && value !== undefined) {
                columnValues[row] = Number(value) !== 0;
              }
            }
          }
          if (
            field.columnType === TYPE.DATETIME ||
            field.columnType === TYPE.TIMESTAMP
          ) {
            // TIMESTAMP is stored in UTC, which this session reads it in.
            const zoned = field.columnType === TYPE.TIMESTAMP;
            for (let row = 0; row < columnValues.length; row++) {
              const value = columnValues[row];
              if (typeof value === "string") {
                columnValues[row] = isoTimestamp(value) + (zoned ? "Z" : "");
              }
            }
          }
          return { name: field.name, kind, scale, utc: true };
        }),
    };
  }

  async close() {
    await this.connection
      .promise()
      .end()
      .catch(() => this.connection.destroy());
  }
}

/** `ssl=require` encrypts; `ssl=verify-full` also checks the certificate. */
function sslOption(setting: string | undefined) {
  switch (setting) {
    case undefined:
    case "disable":
      return undefined;
    case "require":
      return { rejectUnauthorized: false };
    case "verify-full":
      return { rejectUnauthorized: true };
    default:
      throw new SourceReadError(
        "connection",
        `ssl=${setting} isn't a setting explorEDA knows.`,
        "Use ssl=require, ssl=verify-full, or ssl=disable."
      );
  }
}

export const mysqlDriver: DatabaseDriver = {
  name: "mysql",
  label: "MySQL",
  async connect(connection: ResolvedConnection) {
    const { host, port, database, user, ssl } = connection.settings;
    if (!host || !database) {
      throw new SourceReadError(
        "connection",
        `${connection.id} needs host= and database=.`,
        `Write it as connection @${connection.id} driver=mysql host=db.internal database=sales user=reader.`
      );
    }
    const client = mysql.createConnection({
      host,
      port: port ? Number(port) : 3306,
      database,
      ...(user ? { user } : {}),
      ...(connection.secret === undefined
        ? {}
        : { password: connection.secret }),
      ...(sslOption(ssl) ? { ssl: sslOption(ssl) } : {}),
      connectTimeout: 15_000,
      // Text keeps every digit and the day a date names.
      supportBigNumbers: true,
      bigNumberStrings: true,
      decimalNumbers: false,
      dateStrings: true,
      multipleStatements: false,
    });
    // A dropped connection is reported by the read that needed it.
    client.on("error", () => {});
    try {
      await client.promise().connect();
    } catch (error) {
      client.destroy();
      const found = failure(error, "Connecting", connection.id);
      if (found.code === "secret" && connection.secret === undefined) {
        throw new SourceReadError(
          "secret",
          `${connection.id} needs a password.`,
          `Enter it here, or set ${secretVariable(connection)} before starting explorEDA.`
        );
      }
      throw found;
    }
    return new MysqlSession(client, connection.id);
  },
};
