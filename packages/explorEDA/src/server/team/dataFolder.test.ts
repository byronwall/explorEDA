// @vitest-environment node
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { projectRole } from "./accounts";
import {
  DATA_VERSION,
  DataFolderError,
  MARKER_FILE,
  openDataFolder,
  STORE_FILE,
} from "./dataFolder";
import {
  latestSchema,
  MIGRATIONS,
  SCHEMA_VERSION,
  storeVersion,
} from "./sqliteStore";

const FIXTURE = path.join(__dirname, "fixtures/data-v1");

/** A copy of the 0.1.0 data folder to open. */
function oldFolder() {
  const dir = mkdtempSync(path.join(tmpdir(), "exploreda-data-"));
  cpSync(FIXTURE, dir, { recursive: true });
  return dir;
}

const now = () => new Date("2026-11-01T12:00:00.000Z");

describe("opening a data folder", () => {
  it("opens the 0.1.0 folder with every account, project, and member", async () => {
    const dir = oldFolder();
    const { store, upgrade } = await openDataFolder(dir, { version: "test" });
    expect(SCHEMA_VERSION).toBe(latestSchema(MIGRATIONS));
    expect(upgrade).toBe(undefined);
    const ana = await store.checkPassword("ana@example.com", "exploreda-dev");
    expect(ana).toMatchObject({ admin: true, kind: "author" });
    expect((await store.projects()).map((project) => project.id)).toEqual([
      "empty",
      "shop",
    ]);
    const vic = (await store.accountByEmail("vic@example.com"))!;
    expect(await projectRole(store, vic, "shop")).toBe("viewer");
    expect(existsSync(path.join(dir, "backups"))).toBe(false);
    expect(
      readFileSync(path.join(dir, "projects/shop/data/uploaded.csv"), "utf8")
    ).toContain("West,22");
  });

  it("starts a new folder with a marker and no backup", async () => {
    const dir = mkdtempSync(path.join(tmpdir(), "exploreda-data-"));
    await openDataFolder(dir, { version: "9.9.9", now });
    expect(
      JSON.parse(readFileSync(path.join(dir, MARKER_FILE), "utf8"))
    ).toEqual({
      dataVersion: DATA_VERSION,
      schema: SCHEMA_VERSION,
      server: "9.9.9",
      updatedAt: "2026-11-01T12:00:00.000Z",
    });
    expect(existsSync(path.join(dir, "backups"))).toBe(false);
  });

  it("backs up the store before a migration and keeps everything", async () => {
    const dir = oldFolder();
    const migrations = {
      ...MIGRATIONS,
      [SCHEMA_VERSION + 1]: "ALTER TABLE accounts ADD COLUMN locale TEXT;",
    };
    const { store, upgrade } = await openDataFolder(dir, {
      version: "test",
      migrations,
      now,
    });
    expect(upgrade).toEqual({
      from: SCHEMA_VERSION,
      to: SCHEMA_VERSION + 1,
      backup: path.join(dir, "backups/2026-11-01T12-00-00-000Z"),
    });
    expect(await storeVersion(path.join(upgrade!.backup, STORE_FILE))).toBe(
      SCHEMA_VERSION
    );
    expect(await storeVersion(path.join(dir, STORE_FILE))).toBe(
      SCHEMA_VERSION + 1
    );
    expect(
      await store.checkPassword("vic@example.com", "exploreda-dev")
    ).toBeTruthy();
  });

  it("stops without changing anything when a migration fails", async () => {
    const dir = oldFolder();
    const migrations = {
      ...MIGRATIONS,
      [SCHEMA_VERSION + 1]:
        "ALTER TABLE accounts ADD COLUMN locale TEXT; ALTER TABLE missing ADD COLUMN x TEXT;",
    };
    await expect(
      openDataFolder(dir, { version: "test", migrations, now })
    ).rejects.toThrow(/nothing was changed/);
    expect(await storeVersion(path.join(dir, STORE_FILE))).toBe(SCHEMA_VERSION);
    const columns = new DatabaseSync(path.join(dir, STORE_FILE), {
      readOnly: true,
    })
      .prepare("PRAGMA table_info(accounts)")
      .all()
      .map((column) => (column as { name: string }).name);
    expect(columns).not.toContain("locale");
    // The current version still opens it as before.
    const { store } = await openDataFolder(dir, { version: "test" });
    expect(await store.accountByEmail("ana@example.com")).toBeTruthy();
    expect(readdirSync(path.join(dir, "backups"))).toHaveLength(1);
  });

  it("refuses a folder written by a newer version", async () => {
    const newerStore = oldFolder();
    const db = new DatabaseSync(path.join(newerStore, STORE_FILE));
    db.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 5}`);
    db.close();
    await expect(
      openDataFolder(newerStore, { version: "test" })
    ).rejects.toBeInstanceOf(DataFolderError);

    const newerLayout = oldFolder();
    writeFileSync(
      path.join(newerLayout, MARKER_FILE),
      JSON.stringify({ dataVersion: DATA_VERSION + 1, server: "2.0.0" })
    );
    await expect(
      openDataFolder(newerLayout, { version: "test" })
    ).rejects.toThrow(/written by explorEDA 2.0.0/);
  });
});
