/**
 * Opening a team server's data folder, old or new. A newer explorEDA may
 * need to change what an older one wrote. Before it changes anything, it
 * copies what it will change into `backups/<time>/`. If a change fails,
 * the server stops and the folder stays as it was. A folder written by a
 * newer explorEDA is never opened by an older one.
 */
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import type { AccountStore } from "./accounts";
import {
  copyStore,
  latestSchema,
  MIGRATIONS,
  sqliteAccountStore,
  storeVersion,
  type Migrations,
} from "./sqliteStore";

/** The data folder's layout version, for changes outside the store. */
export const DATA_VERSION = 1;
export const STORE_FILE = "exploreda.db";
/** Says which explorEDA last wrote the folder, and its layout version. */
export const MARKER_FILE = "exploreda-data.json";

interface Marker {
  dataVersion: number;
  schema: number;
  server: string;
  updatedAt: string;
}

export interface OpenedDataFolder {
  store: AccountStore;
  /** Set when the store was migrated: the versions and the backup's folder. */
  upgrade?: { from: number; to: number; backup: string };
}

export class DataFolderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DataFolderError";
  }
}

const stamp = (now: Date) => now.toISOString().replace(/[:.]/g, "-");

async function readMarker(dataDir: string) {
  try {
    return JSON.parse(
      await fs.readFile(path.join(dataDir, MARKER_FILE), "utf8")
    ) as Partial<Marker>;
  } catch {
    return undefined;
  }
}

export async function openDataFolder(
  dataDir: string,
  {
    version,
    migrations = MIGRATIONS,
    now = () => new Date(),
  }: {
    /** This explorEDA's version, recorded in the marker. */
    version: string;
    migrations?: Migrations;
    now?: () => Date;
  }
): Promise<OpenedDataFolder> {
  await fs.mkdir(path.join(dataDir, "projects"), { recursive: true });
  const target = latestSchema(migrations);
  const marker = await readMarker(dataDir);
  if ((marker?.dataVersion ?? 0) > DATA_VERSION) {
    throw new DataFolderError(
      `This data folder was written by explorEDA ${marker?.server ?? "(a newer version)"}, which is newer than ${version}. Run that version or a later one.`
    );
  }

  const file = path.join(dataDir, STORE_FILE);
  const current = existsSync(file) ? await storeVersion(file) : 0;
  if (current > target) {
    throw new DataFolderError(
      `The account store was written by a newer explorEDA (schema ${current}); this one reads up to ${target}. Run the newer version.`
    );
  }
  let upgrade: OpenedDataFolder["upgrade"];
  if (current > 0 && current < target) {
    const backup = path.join(dataDir, "backups", stamp(now()));
    await fs.mkdir(backup, { recursive: true });
    await copyStore(file, path.join(backup, STORE_FILE));
    upgrade = { from: current, to: target, backup };
  }

  let store: AccountStore;
  try {
    store = await sqliteAccountStore(file, { migrations });
  } catch (error) {
    throw new DataFolderError(
      `Couldn't upgrade the account store from schema ${current} to ${target}, so nothing was changed: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  const next: Marker = {
    dataVersion: DATA_VERSION,
    schema: target,
    server: version,
    updatedAt: now().toISOString(),
  };
  if (
    marker?.dataVersion !== next.dataVersion ||
    marker?.schema !== next.schema ||
    marker?.server !== next.server
  ) {
    const markerPath = path.join(dataDir, MARKER_FILE);
    await fs.writeFile(
      `${markerPath}.tmp`,
      `${JSON.stringify(next, null, 2)}\n`
    );
    await fs.rename(`${markerPath}.tmp`, markerPath);
  }
  return { store, ...(upgrade ? { upgrade } : {}) };
}
