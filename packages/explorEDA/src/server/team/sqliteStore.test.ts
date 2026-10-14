// @vitest-environment node
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { accountStoreContract } from "@/test/accountStoreContract";
import {
  migrate,
  SCHEMA_VERSION,
  sqliteAccountStore,
  storeVersion,
} from "./sqliteStore";

const tempFile = () =>
  path.join(mkdtempSync(path.join(tmpdir(), "exploreda-store-")), "store.db");

describe("SQLite account store", () => {
  accountStoreContract(() => sqliteAccountStore(tempFile()));

  it("keeps accounts, sessions, and members when it opens again", async () => {
    const file = tempFile();
    const first = await sqliteAccountStore(file);
    const ana = await first.createAccount({
      email: "ana@example.com",
      name: "Ana",
      kind: "author",
      admin: true,
      password: "correct horse",
    });
    await first.createProject({ id: "shop", name: "Shop" });
    await first.setMember("shop", { accountId: ana.id, role: "author" });
    const secret = await first.createSession(ana.id);

    const second = await sqliteAccountStore(file);
    expect((await second.sessionAccount(secret))?.email).toBe(
      "ana@example.com"
    );
    expect(await second.members("shop")).toEqual([
      { accountId: ana.id, role: "author" },
    ]);
    expect(await storeVersion(file)).toBe(SCHEMA_VERSION);
  });

  it("refuses a store written by a newer version", () => {
    const db = new DatabaseSync(":memory:");
    db.exec(`PRAGMA user_version = ${SCHEMA_VERSION + 1}`);
    expect(() => migrate(db)).toThrow(/newer explorEDA/);
  });
});
