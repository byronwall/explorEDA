/**
 * Refresh: reads one database source again and replaces its snapshot. The
 * project text says what to read; the server supplies secrets and limits.
 * A failed read leaves the last snapshot in place.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  compileProjectText,
  type ConnectionDefinition,
  type DatabaseSource,
} from "../../lib/dsl/project";
import { HIDDEN_PROJECT_FILE, PROJECT_FILE } from "../../lib/project/folder";
import {
  DEFAULT_BYTE_LIMIT,
  DEFAULT_ROW_LIMIT,
  SNAPSHOT_FOLDER,
  snapshotInfo,
  snapshotPath,
  type SnapshotInfo,
} from "../../lib/project/snapshots";
import { postgresDriver } from "./drivers/postgres";
import { sqliteDriver } from "./drivers/sqlite";
import { readSnapshot } from "./read";
import {
  SourceReadError,
  type DatabaseDriver,
  type DatabaseSession,
  type ReadLimits,
  type TableInfo,
} from "./types";

/** How long a read may take by default: one minute. */
export const DEFAULT_READ_TIMEOUT = 60_000;

export const DRIVERS: Record<string, DatabaseDriver> = {
  sqlite: sqliteDriver,
  postgres: postgresDriver,
};

export interface SourceOptions {
  /** The project folder. */
  root: string;
  drivers?: Record<string, DatabaseDriver>;
  /** A connection's secret, from wherever this server keeps them. */
  secret?: (connection: ConnectionDefinition) => Promise<string | undefined>;
  limits?: Partial<ReadLimits>;
  signal?: AbortSignal;
}

/** The project's text, from whichever file holds it. */
async function projectText(root: string) {
  for (const file of [PROJECT_FILE, HIDDEN_PROJECT_FILE]) {
    try {
      return await fs.readFile(path.join(root, file), "utf8");
    } catch {
      // Try the next place a project keeps its text.
    }
  }
  return undefined;
}

async function projectDatabases(root: string) {
  const text = await projectText(root);
  if (text === undefined) {
    throw new SourceReadError(
      "unknown-source",
      "This folder has no project text yet."
    );
  }
  return compileProjectText(text);
}

async function openConnection(
  connection: ConnectionDefinition,
  options: SourceOptions
): Promise<{ session: DatabaseSession; driver: DatabaseDriver }> {
  const drivers = options.drivers ?? DRIVERS;
  const driver = drivers[connection.driver];
  if (!driver) {
    throw new SourceReadError(
      "unknown-driver",
      `${connection.id} uses driver=${connection.driver}, which explorEDA doesn't read.`,
      `Use ${Object.keys(drivers).join(", ")}.`
    );
  }
  const secret = await options.secret?.(connection);
  try {
    const session = await driver.connect({
      ...connection,
      root: options.root,
      ...(secret === undefined ? {} : { secret }),
    });
    return { session, driver };
  } catch (error) {
    if (error instanceof SourceReadError) {
      error.connection = connection.id;
    }
    throw error;
  }
}

function findConnection(
  connections: ConnectionDefinition[],
  id: string
): ConnectionDefinition {
  const connection = connections.find((item) => item.id === id);
  if (!connection) {
    throw new SourceReadError(
      "unknown-source",
      `No connection is named ${id}.`,
      "Add it to the project text."
    );
  }
  return connection;
}

/** Writes a file whole: a reader sees the old file or the new one. */
async function writeWhole(file: string, text: string) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(temporary, text);
  await fs.rename(temporary, file);
}

const reading = new Map<string, Promise<SnapshotInfo>>();

/**
 * Reads a source again and writes its snapshot. Two refreshes of one
 * source at once share a read.
 */
export function refreshSource(
  sourceId: string,
  options: SourceOptions
): Promise<SnapshotInfo> {
  const key = `${path.resolve(options.root)}\0${sourceId}`;
  const current = reading.get(key);
  if (current) {
    return current;
  }
  const read = readAndWrite(sourceId, options).finally(() =>
    reading.delete(key)
  );
  reading.set(key, read);
  return read;
}

async function readAndWrite(
  sourceId: string,
  options: SourceOptions
): Promise<SnapshotInfo> {
  const { connections, databases } = await projectDatabases(options.root);
  const database: DatabaseSource | undefined = databases[sourceId];
  if (!database) {
    throw new SourceReadError(
      "unknown-source",
      `${sourceId} isn't a database source in this project.`
    );
  }
  const connection = findConnection(connections, database.connection);
  const { session, driver } = await openConnection(connection, options);
  try {
    const snapshot = await readSnapshot(
      session,
      {
        sourceId,
        connection: connection.id,
        driver: driver.name,
        ...(database.table === undefined ? {} : { table: database.table }),
        ...(database.sql === undefined ? {} : { sql: database.sql }),
      },
      {
        rows: database.limit ?? options.limits?.rows ?? DEFAULT_ROW_LIMIT,
        bytes: options.limits?.bytes ?? DEFAULT_BYTE_LIMIT,
        timeout: options.limits?.timeout ?? DEFAULT_READ_TIMEOUT,
      },
      options.signal
    );
    const folder = path.join(options.root, SNAPSHOT_FOLDER);
    await fs.mkdir(folder, { recursive: true });
    // Snapshots are copies of database rows; they stay out of Git.
    await fs
      .writeFile(path.join(folder, ".gitignore"), "*\n", { flag: "wx" })
      .catch(() => {});
    await writeWhole(
      path.join(options.root, snapshotPath(sourceId)),
      JSON.stringify(snapshot)
    );
    return snapshotInfo(snapshot);
  } finally {
    await session.close();
  }
}

/** A connection the project declares, by ID. */
export async function projectConnection(
  connectionId: string,
  root: string
): Promise<ConnectionDefinition> {
  const { connections } = await projectDatabases(root);
  return findConnection(connections, connectionId);
}

/** Connects with a secret and lets go, to check it before keeping it. */
export async function checkSecret(
  connection: ConnectionDefinition,
  secret: string,
  options: SourceOptions
) {
  const { session } = await openConnection(connection, {
    ...options,
    secret: async () => secret,
  });
  await session.close();
}

/** The tables and views a connection can read. */
export async function listTables(
  connectionId: string,
  options: SourceOptions
): Promise<TableInfo[]> {
  const { connections } = await projectDatabases(options.root);
  const { session } = await openConnection(
    findConnection(connections, connectionId),
    options
  );
  try {
    return await session.listTables();
  } finally {
    await session.close();
  }
}
