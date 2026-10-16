// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { runSourceContract } from "../contract";
import {
  POSTGRES_URL,
  postgresSettings,
  writeContractPostgres,
} from "../fixtures/postgresContract";
import { SourceReadError } from "../types";
import { postgresDriver } from "./postgres";

// These run against a real PostgreSQL: start one with
// docker/test-databases.yaml and set EXPLOREDA_TEST_POSTGRES, as CI does.
const run = POSTGRES_URL ? describe : describe.skip;

run("PostgreSQL", () => {
  const { settings, secret } = postgresSettings(
    POSTGRES_URL ?? "postgres://u:p@localhost/db"
  );
  const connection = {
    id: "warehouse",
    driver: "postgres",
    settings,
    secret,
    root: process.cwd(),
  };

  beforeAll(async () => {
    await writeContractPostgres(POSTGRES_URL!);
  });

  runSourceContract("PostgreSQL", async () => ({
    driver: postgresDriver,
    connection,
  }));

  it("asks for a password it doesn't have", async () => {
    const { secret: _secret, ...withoutSecret } = connection;
    const error = await postgresDriver
      .connect(withoutSecret)
      .catch((reason: unknown) => reason);
    expect(error).toBeInstanceOf(SourceReadError);
    expect((error as SourceReadError).code).toBe("secret");
  });

  it("says when the password is wrong", async () => {
    const error = await postgresDriver
      .connect({ ...connection, secret: "wrong" })
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("secret");
    expect((error as SourceReadError).message).toMatch(
      /^warehouse refused its password/
    );
  });

  it("says when the database can't be reached", async () => {
    const error = await postgresDriver
      .connect({
        ...connection,
        settings: { ...settings, port: "1" },
      })
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("connection");
  });

  it("stops a query that runs past its time", async () => {
    const session = await postgresDriver.connect(connection);
    try {
      const cursor = await session
        .read(
          { sourceId: "slow", sql: "select pg_sleep(2), 1 as n", timeout: 100 },
          new AbortController().signal
        )
        .catch((reason: unknown) => reason);
      expect((cursor as SourceReadError).code).toBe("timeout");
    } finally {
      await session.close();
    }
  });

  it("keeps timestamps with a zone in UTC", async () => {
    const session = await postgresDriver.connect(connection);
    try {
      const cursor = await session.read(
        {
          sourceId: "zoned",
          sql: "select timestamptz '2024-01-02 03:04:05+02' as at",
        },
        new AbortController().signal
      );
      const values: unknown[][] = [[]];
      for await (const batch of cursor.batches) {
        for (const row of batch) values[0]!.push(row[0]);
      }
      cursor.columns(values);
      expect(values[0]).toEqual(["2024-01-02T01:04:05Z"]);
    } finally {
      await session.close();
    }
  });
});
