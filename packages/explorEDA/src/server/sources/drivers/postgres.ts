/**
 * PostgreSQL, through `pg`. Each read runs in its own read-only,
 * repeatable-read transaction, so every row comes from one moment of the
 * database and nothing can be written. Rows come through a cursor in
 * batches, so a read that passes its limit stops without fetching the rest.
 *
 * Values arrive as the text PostgreSQL sends, apart from booleans, small
 * integers, floats, and JSON. Text keeps every digit of a bigint or
 * numeric, and dates keep the day they name in any time zone.
 */
import pg from "pg";
import Cursor from "pg-cursor";
import type { Column, Kind } from "../../../lib/readers/typedColumns";
import { secretVariable } from "../../../node/secrets";
import { refuseBinary } from "../columnKinds";
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

/** Type OIDs from PostgreSQL's catalog. */
const OID = {
  bool: 16,
  bytea: 17,
  int8: 20,
  int2: 21,
  int4: 23,
  oid: 26,
  json: 114,
  float4: 700,
  float8: 701,
  date: 1082,
  time: 1083,
  timestamp: 1114,
  timestamptz: 1184,
  numeric: 1700,
  jsonb: 3802,
} as const;

const { types } = pg;

/** Parsers that keep PostgreSQL's text for everything that could lose detail. */
const parsers = {
  getTypeParser(oid: number, format?: string) {
    switch (oid) {
      case OID.bool:
      case OID.int2:
      case OID.int4:
      case OID.oid:
      case OID.float4:
      case OID.float8:
      case OID.json:
      case OID.jsonb:
      case OID.bytea:
        return types.getTypeParser(oid, format as "text");
      default:
        return (value: string) => value;
    }
  },
} as pg.CustomTypesConfig;

function kindOf(oid: number): Kind {
  switch (oid) {
    case OID.bool:
      return "boolean";
    case OID.int2:
    case OID.int4:
    case OID.int8:
    case OID.oid:
      return "integer";
    case OID.numeric:
      return "decimal";
    case OID.float4:
    case OID.float8:
      return "float";
    case OID.date:
    case OID.timestamp:
    case OID.timestamptz:
      return "timestamp";
    case OID.json:
    case OID.jsonb:
      return "json";
    default:
      return "text";
  }
}

/** `2024-01-02 03:04:05+00` as ISO text: `2024-01-02T03:04:05Z`. */
function isoTimestamp(value: string) {
  return value
    .replace(" ", "T")
    .replace(/\+00(:00)?$/, "Z")
    .replace(/([+-]\d{2})$/, "$1:00");
}

/**
 * A numeric column as unscaled integers and one scale, the form
 * `convertColumn` takes. Undefined when a value isn't a finite number.
 */
function decimalColumn(values: unknown[]) {
  let scale = 0;
  for (const value of values) {
    if (typeof value !== "string") continue;
    if (!/^-?\d+(\.\d+)?$/.test(value)) return undefined;
    scale = Math.max(scale, value.split(".")[1]?.length ?? 0);
  }
  for (let index = 0; index < values.length; index++) {
    const value = values[index];
    if (typeof value !== "string") continue;
    const [whole, fraction = ""] = value.split(".");
    values[index] = BigInt(`${whole}${fraction.padEnd(scale, "0")}`);
  }
  return scale;
}

function failure(error: unknown, what: string, id: string): SourceReadError {
  if (error instanceof SourceReadError) return error;
  const code = (error as { code?: string }).code;
  const message = error instanceof Error ? error.message : String(error);
  switch (code) {
    case "25006":
      return new SourceReadError(
        "write",
        `${what} would change the database, and explorEDA only reads.`,
        "Use a select statement."
      );
    case "57014":
      return new SourceReadError(
        "timeout",
        `${what} took longer than the database allowed: ${message}.`,
        "Read fewer rows or columns with sql=."
      );
    case "28P01":
    case "28000":
      return new SourceReadError(
        "secret",
        `${id} refused its password: ${message}.`,
        "Enter it again."
      );
    case "3D000":
    case "ECONNREFUSED":
    case "ENOTFOUND":
    case "ETIMEDOUT":
    case "EHOSTUNREACH":
      return new SourceReadError(
        "connection",
        `${id} can't reach its database: ${message}.`,
        "Check host=, port=, and database=, and that the database is running."
      );
    default:
      return new SourceReadError(
        "query",
        `${what} failed: ${message}.`,
        "Check the table name or the SQL."
      );
  }
}

class PostgresSession implements DatabaseSession {
  constructor(
    private readonly client: pg.Client,
    private readonly id: string
  ) {}

  private types?: Map<number, string>;

  /** Every type's name by OID, such as `numeric` or `character varying`. */
  private async typeNames() {
    if (!this.types) {
      const { rows } = await this.client.query<{ oid: number; name: string }>(
        "select oid::int as oid, format_type(oid, null) as name from pg_type"
      );
      this.types = new Map(rows.map((row) => [row.oid, row.name]));
    }
    return this.types;
  }

  async listTables(): Promise<TableInfo[]> {
    const { rows } = await this.client.query<{
      table_schema: string;
      table_name: string;
      table_type: string;
    }>(
      `select table_schema, table_name, table_type
         from information_schema.tables
        where table_schema not in ('pg_catalog', 'information_schema')
        order by table_schema = 'public' desc, table_schema, table_name`
    );
    return rows.map((row) => ({
      name:
        row.table_schema === "public"
          ? row.table_name
          : `${row.table_schema}.${row.table_name}`,
      schema: row.table_schema,
      kind: row.table_type === "VIEW" ? "view" : "table",
    }));
  }

  /** `schema.table` as SQL, unless a table's own name holds the dot. */
  private async tableSql(table: string) {
    const quote = (name: string) => this.client.escapeIdentifier(name);
    const exact = await this.client.query(
      "select 1 from information_schema.tables where table_name = $1",
      [table]
    );
    if (exact.rowCount || !table.includes(".")) {
      return quote(table);
    }
    const dot = table.indexOf(".");
    return `${quote(table.slice(0, dot))}.${quote(table.slice(dot + 1))}`;
  }

  async read(request: ReadRequest, signal: AbortSignal): Promise<ReadCursor> {
    const what = request.table ?? "The query";
    const client = this.client;
    const id = this.id;
    try {
      await client.query(
        "begin transaction isolation level repeatable read read only"
      );
      await client.query("set local timezone = 'UTC'");
      if (request.timeout) {
        await client.query(
          `set local statement_timeout = ${Math.max(1, Math.round(request.timeout))}`
        );
      }
    } catch (error) {
      throw failure(error, what, id);
    }
    // The client runs one query at a time, and an open cursor holds it until
    // it closes, so anything else this read needs is asked for first.
    const typeNames = await this.typeNames().catch((error: unknown) => {
      throw failure(error, what, id);
    });
    const sql =
      request.table !== undefined
        ? `select * from ${await this.tableSql(request.table)}`
        : request.sql!.trim().replace(/;\s*$/, "");
    const cursor = client.query(
      new Cursor<unknown[]>(sql, [], { rowMode: "array", types: parsers })
    );
    const readBatch = () =>
      new Promise<{ rows: unknown[][]; fields: pg.FieldDef[] }>(
        (resolve, reject) => {
          cursor.read(BATCH, (error, rows, result) => {
            if (error) reject(failure(error, what, id));
            else resolve({ rows, fields: result.fields });
          });
        }
      );
    // The first batch says what the columns are.
    const first = await readBatch().catch(async (error: unknown) => {
      await cursor.close().catch(() => {});
      await client.query("rollback").catch(() => {});
      throw error;
    });
    if (!first.fields.length) {
      await cursor.close().catch(() => {});
      await client.query("rollback").catch(() => {});
      throw new SourceReadError(
        "write",
        "sql= must be a select that returns rows.",
        'Write it as sql="select id, region from customers".'
      );
    }
    const fields = first.fields;
    async function* batches() {
      try {
        let batch = first.rows;
        while (batch.length && !signal.aborted) {
          yield batch;
          if (batch.length < BATCH) break;
          batch = (await readBatch()).rows;
        }
      } finally {
        await cursor.close().catch(() => {});
        await client.query("rollback").catch(() => {});
      }
    }
    return {
      names: fields.map((field) => field.name),
      databaseTypes: fields.map((field) => typeNames.get(field.dataTypeID)),
      batches: batches(),
      columns: (values) =>
        values.map((columnValues, index): Column => {
          const field = fields[index]!;
          const name = field.name;
          refuseBinary(request.sourceId, name, columnValues);
          if (field.dataTypeID === OID.bytea) {
            refuseBinary(request.sourceId, name, [new Uint8Array()]);
          }
          let kind = kindOf(field.dataTypeID);
          let scale = 0;
          if (kind === "decimal") {
            const found = decimalColumn(columnValues);
            if (found === undefined) kind = "text";
            else scale = found;
          }
          if (
            field.dataTypeID === OID.timestamp ||
            field.dataTypeID === OID.timestamptz
          ) {
            for (let row = 0; row < columnValues.length; row++) {
              const value = columnValues[row];
              if (typeof value === "string")
                columnValues[row] = isoTimestamp(value);
            }
          }
          return { name, kind, scale, utc: true };
        }),
    };
  }

  async close() {
    await this.client.end().catch(() => {});
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

export const postgresDriver: DatabaseDriver = {
  name: "postgres",
  label: "PostgreSQL",
  async connect(connection: ResolvedConnection) {
    const { host, port, database, user, ssl } = connection.settings;
    if (!host || !database) {
      throw new SourceReadError(
        "connection",
        `${connection.id} needs host= and database=.`,
        `Write it as connection @${connection.id} driver=postgres host=db.internal database=sales user=reader.`
      );
    }
    const client = new pg.Client({
      host,
      port: port ? Number(port) : 5432,
      database,
      ...(user ? { user } : {}),
      ...(connection.secret === undefined
        ? {}
        : { password: connection.secret }),
      ssl: sslOption(ssl),
      connectionTimeoutMillis: 15_000,
      application_name: "explorEDA",
    });
    // A dropped connection is reported by the read that needed it.
    client.on("error", () => {});
    try {
      await client.connect();
    } catch (error) {
      await client.end().catch(() => {});
      const message = error instanceof Error ? error.message : String(error);
      if (/password must be a string|no password|SASL/i.test(message)) {
        throw new SourceReadError(
          "secret",
          `${connection.id} needs a password.`,
          `Enter it here, or set ${secretVariable(connection)} before starting explorEDA.`
        );
      }
      throw failure(error, "Connecting", connection.id);
    }
    return new PostgresSession(client, connection.id);
  },
};
