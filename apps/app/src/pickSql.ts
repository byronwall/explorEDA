/**
 * The query Add database writes when the user picks some of a table's
 * columns, and optionally which rows: `select "a", "b" from "plays" where …`.
 * Plain lowercase names stay bare; others are quoted the way each database
 * quotes them, so a column named `desc` or `Play Type` reads as written.
 */
import { DEFAULT_BYTE_LIMIT } from "exploreda";

const QUOTES: Record<string, [string, string]> = {
  mysql: ["`", "`"],
  sqlserver: ["[", "]"],
};

/** Words some database reserves, which a name must be quoted to use. */
const RESERVED = new Set(
  `add all alter and any as asc between by case cast check column constraint
create cross current current_date current_time current_timestamp current_user
database default delete desc distinct do drop else end except exists false
fetch for foreign from full grant group having if in index inner insert
intersect interval into is join key left like limit natural not null offset
on or order outer over partition primary range rank references right row
rows select session_user set some table then to top true union unique update
user using values view when where window with`.split(/\s+/)
);

/** A name as the query writes it: bare when that's safe, quoted otherwise. */
export function quoteName(driver: string, name: string) {
  // Lowercase only: PostgreSQL folds bare names to lowercase.
  if (/^[a-z_][a-z0-9_]*$/.test(name) && !RESERVED.has(name)) {
    return name;
  }
  const [open, close] = QUOTES[driver] ?? ['"', '"'];
  return `${open}${name.replaceAll(close, close + close)}${close}`;
}

/** A table name as the drivers read it: `schema.table` splits at the dot. */
function tableName(driver: string, table: string) {
  const dot = table.indexOf(".");
  return dot < 0
    ? quoteName(driver, table)
    : `${quoteName(driver, table.slice(0, dot))}.${quoteName(driver, table.slice(dot + 1))}`;
}

export function pickSql(
  driver: string,
  table: string,
  columns: string[],
  where = ""
) {
  const filter = where.trim().replace(/^where\s+/i, "");
  return [
    `select ${columns.map((column) => quoteName(driver, column)).join(", ")}`,
    `from ${tableName(driver, table)}`,
    ...(filter ? [`where ${filter}`] : []),
  ].join(" ");
}

/** A query longer than this goes in its own file, read with `sql=@`. */
export const LONG_SQL = 400;

/** A file for a source's query, beside the project text. */
export const sqlFileFor = (sourceId: string) => `queries/${sourceId}.sql`;

/**
 * Whether reading every row and column would likely pass the bytes a read
 * keeps. A snapshot keeps about ten bytes for a number, so this guesses low
 * for text columns, which are larger.
 */
export function likelyTooLarge(rows: number, columns: number) {
  return rows * columns * 10 > DEFAULT_BYTE_LIMIT;
}

/** A table this wide is easier to read a few columns at a time. */
export const WIDE_TABLE = 40;
