/**
 * What a connection holds, without reading any table's rows: its tables
 * with row counts where counting is quick, a table's columns and types,
 * and its foreign keys. `exploreda schema` and the app's Add database
 * both ask through here.
 */
import type {
  DatabaseDriver,
  DatabaseSession,
  ForeignKey,
  TableInfo,
} from "./types";

/** Drivers that read a local file, where counting every table is quick. */
const FILE_DRIVERS = new Set(["sqlite", "duckdb"]);

const quote = (name: string) => `"${name.replace(/"/g, '""')}"`;

/** `select count(*)` for a table in a SQLite or DuckDB file. */
function countSql(table: TableInfo) {
  const prefix = table.schema ? `${table.schema}.` : "";
  const name =
    prefix && table.name.startsWith(prefix)
      ? `${quote(table.schema!)}.${quote(table.name.slice(prefix.length))}`
      : quote(table.name);
  return `select count(*) from ${name}`;
}

/** The first value a query returns. */
async function firstValue(session: DatabaseSession, sql: string) {
  const cursor = await session.read(
    { sourceId: "schema", sql },
    new AbortController().signal
  );
  let value: unknown;
  for await (const batch of cursor.batches) {
    value = batch[0]?.[0];
  }
  return value;
}

/** A connection's tables, with row counts for local database files. */
export async function tablesWithRows(
  session: DatabaseSession,
  driver: DatabaseDriver
): Promise<TableInfo[]> {
  const tables = await session.listTables();
  if (!FILE_DRIVERS.has(driver.name)) {
    return tables;
  }
  const counted: TableInfo[] = [];
  for (const table of tables) {
    const value = await firstValue(session, countSql(table)).catch(
      () => undefined
    );
    const rows = Number(value);
    counted.push(
      value === undefined || !Number.isFinite(rows) ? table : { ...table, rows }
    );
  }
  return counted;
}

export interface ColumnInfo {
  name: string;
  /** The database's name for the type, or empty when it has none. */
  type: string;
}

/** A table's column names and database types, without reading its rows. */
export async function tableColumns(
  session: DatabaseSession,
  table: string
): Promise<ColumnInfo[]> {
  const cursor = await session.read(
    { sourceId: table, table },
    new AbortController().signal
  );
  // Leaving after the first batch lets the driver close its cursor.
  for await (const _batch of cursor.batches) {
    break;
  }
  return cursor.names.map((name, index) => ({
    name,
    type: cursor.databaseTypes[index] ?? "",
  }));
}

/**
 * Keys a driver read one column per row, without those that span several
 * columns: a relationship joins on one field.
 */
export function singleColumnKeys(
  rows: (ForeignKey & { constraint: string })[]
): ForeignKey[] {
  const sizes = new Map<string, number>();
  for (const row of rows) {
    sizes.set(row.constraint, (sizes.get(row.constraint) ?? 0) + 1);
  }
  return rows
    .filter((row) => sizes.get(row.constraint) === 1)
    .map(({ table, column, refTable, refColumn }) => ({
      table,
      column,
      refTable,
      refColumn,
    }));
}
