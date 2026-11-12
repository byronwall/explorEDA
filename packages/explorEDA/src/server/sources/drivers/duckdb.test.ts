import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { runSourceContract } from "../contract";
import { writeContractDuckdb } from "../fixtures/duckdbContract";
import { SourceReadError } from "../types";
import { duckdbDriver } from "./duckdb";
import { DuckDBInstance } from "@duckdb/node-api";

let root = "";

beforeAll(async () => {
  root = await mkdtemp(path.join(tmpdir(), "exploreda-duckdb-"));
  await writeContractDuckdb(path.join(root, "contract.duckdb"));
  await writeFile(path.join(root, "secret.csv"), "token\nhunter2\n");
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

const connection = (settings: Record<string, string>) => ({
  id: "lake",
  driver: "duckdb",
  settings,
  root,
});

runSourceContract("DuckDB", async () => ({
  driver: duckdbDriver,
  connection: connection({ path: "contract.duckdb" }),
}));

describe("DuckDB files", () => {
  it("lists one-column foreign keys", async () => {
    const instance = await DuckDBInstance.create(
      path.join(root, "keys.duckdb")
    );
    const setup = await instance.connect();
    await setup.run(`
      create table item (i_id integer primary key);
      create table pair (a integer, b integer, primary key (a, b));
      create table sale (
        s_item integer references item (i_id),
        a integer, b integer,
        foreign key (a, b) references pair (a, b)
      );
    `);
    setup.closeSync();
    instance.closeSync();
    const session = await duckdbDriver.connect(
      connection({ path: "keys.duckdb" })
    );
    try {
      expect(await session.foreignKeys()).toEqual([
        {
          table: "sale",
          column: "s_item",
          refTable: "item",
          refColumn: "i_id",
        },
      ]);
    } finally {
      await session.close();
    }
  });

  it("can't read other files through a query", async () => {
    const session = await duckdbDriver.connect(
      connection({ path: "contract.duckdb" })
    );
    try {
      const error = await session
        .read(
          {
            sourceId: "peek",
            sql: `select * from read_csv('${path.join(root, "secret.csv")}')`,
          },
          new AbortController().signal
        )
        .catch((reason: unknown) => reason);
      expect(error).toBeInstanceOf(SourceReadError);
    } finally {
      await session.close();
    }
  });

  it("keeps a project's file inside it on a shared server", async () => {
    const error = await duckdbDriver
      .connect({
        ...connection({ path: "../elsewhere.duckdb" }),
        confined: true,
      })
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).message).toBe(
      "lake reads ../elsewhere.duckdb, outside this project."
    );
  });
});
