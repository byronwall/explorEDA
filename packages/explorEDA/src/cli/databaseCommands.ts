/**
 * `exploreda read` and `exploreda schema`: database work from the terminal.
 * `read` writes the same snapshots the app's Refresh writes, with the same
 * secrets and limits; `schema` shows what a connection holds.
 */
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import type { ConnectionDefinition } from "../lib/dsl/project";
import {
  fileSecretStore,
  resolveSecret,
  secretVariable,
  type SecretStore,
} from "../node/secrets";
import {
  projectDatabases,
  refreshSource,
  withConnection,
} from "../server/sources/refresh";
import { tableColumns, tablesWithRows } from "../server/sources/schema";
import { SourceReadError, type DatabaseDriver } from "../server/sources/types";

export const READ_USAGE = `Usage: exploreda read [folder] [source...]

Reads database sources into the snapshots the app charts, as Refresh does
in the app. With no sources named, reads every database source. Prints one
line per source and exits 1 when any read fails.

A server database's password comes from EXPLOREDA_<CONNECTION>_PASSWORD,
with the connection's name in capitals, or from one saved in the app.`;

export const SCHEMA_USAGE = `Usage: exploreda schema [folder] [connection] [table...]

Lists a connection's tables and views, with row counts for SQLite and
DuckDB files. Name tables to list their columns and database types.
With no connection named, lists every connection's tables.`;

export interface DatabaseCommandOptions {
  secrets?: SecretStore;
  env?: NodeJS.ProcessEnv;
  drivers?: Record<string, DatabaseDriver>;
  log?: (line: string) => void;
}

/** `[folder] [name...]`: the first word is the folder when it is one. */
function folderAndNames(
  args: string[],
  usage: string
): { folder: string; names: string[] } | string {
  if (args.includes("-h") || args.includes("--help")) {
    return usage;
  }
  const unknown = args.find((arg) => arg.startsWith("-"));
  if (unknown) {
    return `Unknown option ${unknown}.\n\n${usage}`;
  }
  const first = args[0];
  if (first && existsSync(first) && statSync(first).isDirectory()) {
    return { folder: path.resolve(first), names: args.slice(1) };
  }
  return { folder: path.resolve("."), names: args };
}

const count = (value: number) => value.toLocaleString("en-US");

const message = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

/** Reads database sources into snapshots; 0 when every read worked. */
export async function readCommand(
  args: string[],
  options: DatabaseCommandOptions = {}
): Promise<number> {
  const log = options.log ?? console.log;
  const parsed = folderAndNames(args, READ_USAGE);
  if (typeof parsed === "string") {
    log(parsed);
    return parsed === READ_USAGE ? 0 : 64;
  }
  const { folder } = parsed;
  let project: Awaited<ReturnType<typeof projectDatabases>>;
  try {
    project = await projectDatabases(folder);
  } catch (error) {
    log(`${folder}: ${message(error)}`);
    return 66;
  }
  const ids = parsed.names.length
    ? parsed.names
    : Object.keys(project.databases);
  if (!ids.length) {
    log(
      `${folder} has no database sources. Add one, as source @orders db=app table=orders.`
    );
    return 1;
  }
  const secret = resolveSecret(
    options.secrets ?? fileSecretStore(),
    options.env ?? process.env
  );
  const width = Math.max(...ids.map((id) => id.length));
  let failed = 0;
  for (const id of ids) {
    const started = Date.now();
    try {
      const info = await refreshSource(id, {
        root: folder,
        secret,
        ...(options.drivers ? { drivers: options.drivers } : {}),
      });
      const seconds = ((Date.now() - started) / 1000).toFixed(1);
      log(
        `${id.padEnd(width)}  ${count(info.rowCount)} rows, ${info.fields.length} columns, ${seconds}s`
      );
      for (const note of info.notes) {
        log(`${" ".repeat(width)}  note: ${note}`);
      }
    } catch (error) {
      failed += 1;
      log(`${id.padEnd(width)}  failed: ${message(error)}`);
      const fix = fixFor(error, id, project);
      if (fix) {
        log(`${" ".repeat(width)}  fix: ${fix}`);
      }
    }
  }
  if (ids.length > 1 || failed) {
    log(
      failed
        ? `${failed} of ${ids.length} sources failed to read.`
        : `Read ${ids.length} sources.`
    );
  }
  return failed ? 1 : 0;
}

/** A failed read's fix, with terminal words for a missing password. */
function fixFor(
  error: unknown,
  sourceId: string,
  project: Awaited<ReturnType<typeof projectDatabases>>
) {
  if (!(error instanceof SourceReadError)) {
    return undefined;
  }
  if (error.code === "secret") {
    const connection = project.connections.find(
      (item) =>
        item.id ===
        (error.connection ?? project.databases[sourceId]?.connection)
    );
    return connection
      ? `Set ${secretVariable(connection)}, or save the password in the app: run exploreda in this folder and read ${sourceId} there.`
      : error.suggestion;
  }
  if (error.code === "unknown-source" && !error.suggestion) {
    return `Name one of ${Object.keys(project.databases).join(", ")}.`;
  }
  return error.suggestion;
}

async function printSchema(
  connection: ConnectionDefinition,
  tables: string[],
  folder: string,
  secret: (connection: ConnectionDefinition) => Promise<string | undefined>,
  options: DatabaseCommandOptions,
  log: (line: string) => void
) {
  await withConnection(
    connection.id,
    {
      root: folder,
      secret,
      ...(options.drivers ? { drivers: options.drivers } : {}),
    },
    async (session, driver) => {
      if (tables.length) {
        for (const table of tables) {
          const columns = await tableColumns(session, table);
          log(table);
          const width = Math.max(
            ...columns.map((column) => column.name.length)
          );
          for (const column of columns) {
            log(`  ${column.name.padEnd(width)}  ${column.type}`.trimEnd());
          }
        }
        return;
      }
      const listed = await tablesWithRows(session, driver);
      log(`${connection.id} (${driver.label}): ${listed.length} tables`);
      const width = Math.max(0, ...listed.map((table) => table.name.length));
      for (const table of listed) {
        const rows =
          table.rows === undefined ? "" : `  ${count(table.rows)} rows`;
        log(
          `  ${table.name.padEnd(width)}  ${table.kind.padEnd(5)}${rows}`.trimEnd()
        );
      }
    }
  );
}

/** Lists a connection's tables, or the columns of the tables named. */
export async function schemaCommand(
  args: string[],
  options: DatabaseCommandOptions = {}
): Promise<number> {
  const log = options.log ?? console.log;
  const parsed = folderAndNames(args, SCHEMA_USAGE);
  if (typeof parsed === "string") {
    log(parsed);
    return parsed === SCHEMA_USAGE ? 0 : 64;
  }
  const { folder } = parsed;
  let project: Awaited<ReturnType<typeof projectDatabases>>;
  try {
    project = await projectDatabases(folder);
  } catch (error) {
    log(`${folder}: ${message(error)}`);
    return 66;
  }
  const [connectionId, ...tables] = parsed.names;
  const connections = connectionId
    ? project.connections.filter((item) => item.id === connectionId)
    : project.connections;
  if (!connections.length) {
    log(
      connectionId
        ? `No connection is named ${connectionId}. The project has ${project.connections.map((item) => item.id).join(", ") || "none"}.`
        : `${folder} has no connections. Add one, as connection @app driver=sqlite path=data/app.db.`
    );
    return 1;
  }
  const secret = resolveSecret(
    options.secrets ?? fileSecretStore(),
    options.env ?? process.env
  );
  let failed = 0;
  for (const connection of connections) {
    try {
      await printSchema(connection, tables, folder, secret, options, log);
    } catch (error) {
      failed += 1;
      log(`${connection.id}: ${message(error)}`);
      if (error instanceof SourceReadError && error.code === "secret") {
        log(
          `  fix: Set ${secretVariable(connection)}, or save the password in the app.`
        );
      } else if (error instanceof SourceReadError && error.suggestion) {
        log(`  fix: ${error.suggestion}`);
      }
    }
  }
  return failed ? 1 : 0;
}
