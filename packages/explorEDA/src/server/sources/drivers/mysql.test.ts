// @vitest-environment node
import { beforeAll, describe, expect, it } from "vitest";
import { runSourceContract } from "../contract";
import { postgresSettings } from "../fixtures/postgresContract";
import { MYSQL_URL, writeContractMysql } from "../fixtures/mysqlContract";
import { SourceReadError } from "../types";
import { mysqlDriver } from "./mysql";

// These run against a real MySQL: start one with
// docker/test-databases.yaml and set EXPLOREDA_TEST_MYSQL, as CI does.
const run = MYSQL_URL ? describe : describe.skip;

run("MySQL", () => {
  const { settings, secret } = postgresSettings(
    MYSQL_URL ?? "mysql://u:p@localhost/db"
  );
  const connection = {
    id: "shop",
    driver: "mysql",
    settings,
    secret,
    root: process.cwd(),
  };

  beforeAll(async () => {
    await writeContractMysql(MYSQL_URL!);
  });

  runSourceContract("MySQL", async () => ({ driver: mysqlDriver, connection }));

  it("asks for a password it doesn't have", async () => {
    const { secret: _secret, ...withoutSecret } = connection;
    const error = await mysqlDriver
      .connect(withoutSecret)
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("secret");
    expect((error as SourceReadError).message).toBe("shop needs a password.");
  });

  it("says when the password is wrong", async () => {
    const error = await mysqlDriver
      .connect({ ...connection, secret: "wrong" })
      .catch((reason: unknown) => reason);
    expect((error as SourceReadError).code).toBe("secret");
  });

  it("stops a query that runs past its time", async () => {
    const session = await mysqlDriver.connect(connection);
    try {
      const cursor = await session.read(
        {
          sourceId: "slow",
          sql: "select sleep(2) as s from contract_many",
          timeout: 200,
        },
        new AbortController().signal
      );
      const error = await (async () => {
        for await (const _batch of cursor.batches) {
          // Reading until the server stops it.
        }
      })().then(
        () => undefined,
        (reason: unknown) => reason
      );
      // MySQL ends a select past max_execution_time with an error, or with
      // the rows it had, depending on the version; either way it stops.
      if (error) expect((error as SourceReadError).code).toBe("timeout");
    } finally {
      await session.close();
    }
  }, 20_000);
});
