// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { runSourceContract } from "../contract";
import { readSnapshot } from "../read";
import {
  SQLSERVER_URL,
  sqlServerSettings,
  writeContractSqlServer,
} from "../fixtures/sqlserverContract";
import { SourceReadError } from "../types";
import { sqlServerDriver } from "./sqlserver";

// These run against a real SQL Server: start one with
// docker/test-databases.yaml and set EXPLOREDA_TEST_SQLSERVER, as CI does.
const run = SQLSERVER_URL ? describe : describe.skip;

run("SQL Server", () => {
  const { settings, secret } = sqlServerSettings(
    SQLSERVER_URL ?? "sqlserver://u:p@localhost/master"
  );
  const connection = {
    id: "erp",
    driver: "sqlserver",
    settings,
    secret,
    root: process.cwd(),
  };

  beforeAll(async () => {
    await writeContractSqlServer(SQLSERVER_URL!);
  }, 60_000);

  runSourceContract("SQL Server", async () => ({
    driver: sqlServerDriver,
    connection,
  }));

  it("asks for a password it doesn't have", async () => {
    const { secret: _secret, ...withoutSecret } = connection;
    const error = await sqlServerDriver
      .connect(withoutSecret)
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("secret");
  });

  it("says when the password is wrong", async () => {
    const error = await sqlServerDriver
      .connect({ ...connection, secret: "wrong" })
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("secret");
  });

  it("rolls back whatever a read does", async () => {
    const session = await sqlServerDriver.connect(connection);
    try {
      const cursor = await session.read(
        {
          sourceId: "sneaky",
          sql: "select n from contract_many; delete from contract_many",
        },
        new AbortController().signal
      );
      for await (const _batch of cursor.batches) {
        // Read every row.
      }
      const count = await session.read(
        { sourceId: "count", sql: "select count(*) as n from contract_many" },
        new AbortController().signal
      );
      const rows: unknown[][] = [];
      for await (const batch of count.batches) rows.push(...batch);
      expect(rows).toEqual([[25]]);
    } finally {
      await session.close();
    }
  });

  it("keeps every digit of a decimal too precise for a number", async () => {
    const session = await sqlServerDriver.connect(connection);
    try {
      const snapshot = await readSnapshot(
        session,
        {
          sourceId: "precise",
          connection: "erp",
          driver: "sqlserver",
          table: "contract_precise",
        },
        { rows: 10, bytes: 10_000, timeout: 10_000 }
      );
      expect(snapshot.rows.map((row) => row[0])).toEqual([
        "12345678901234567.89",
        "-0.01",
      ]);
      expect(snapshot.fields[0]).toMatchObject({
        type: "string",
        databaseType: "decimal(19,2)",
      });
    } finally {
      await session.close();
    }
  });
});
