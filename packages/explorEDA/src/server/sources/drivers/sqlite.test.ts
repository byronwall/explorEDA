import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runSourceContract } from "../contract";
import { writeContractSqlite } from "../fixtures/sqliteContract";
import { SourceReadError } from "../types";
import { sqliteDriver } from "./sqlite";

let root = "";

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "exploreda-sqlite-"));
  await writeContractSqlite(path.join(root, "contract.db"));
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

const connection = (settings: Record<string, string>) => ({
  id: "app",
  driver: "sqlite",
  settings,
  root,
});

runSourceContract("SQLite", async () => ({
  driver: sqliteDriver,
  connection: connection({ path: "contract.db" }),
}));

describe("SQLite connections", () => {
  it("names a file that doesn't exist", async () => {
    const error = await sqliteDriver
      .connect(connection({ path: "missing.db" }))
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(SourceReadError);
    expect((error as SourceReadError).message).toBe(
      "app reads missing.db, which doesn't exist."
    );
  });

  it("asks for a path", async () => {
    const error = await sqliteDriver
      .connect(connection({}))
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("connection");
  });

  it("reads a table in a named schema", async () => {
    const session = await sqliteDriver.connect(
      connection({ path: "contract.db" })
    );
    try {
      const cursor = await session.read(
        { sourceId: "s", table: "main.contract_events" },
        new AbortController().signal
      );
      let rows = 0;
      for await (const batch of cursor.batches) {
        rows += batch.length;
      }
      expect(rows).toBe(3);
    } finally {
      await session.close();
    }
  });
});
