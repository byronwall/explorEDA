import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { memorySecretStore } from "../node/secrets";
import { fakeDriver } from "../server/sources/fake";
import { SourceReadError } from "../server/sources/types";
import { readCommand, type DatabaseCommandOptions } from "./databaseCommands";

let root = "";

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "exploreda-read-"));
  await writeFile(
    path.join(root, "exploreda.eda"),
    `project @p

connection @db driver=fake
connection @wh driver=postgres host=db.internal database=sales user=reader

source @orders db=db table=orders
source @missing db=db table=gone
source @sales db=wh table=sales
`
  );
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

async function run(args: string[], drivers: DatabaseCommandOptions["drivers"]) {
  const lines: string[] = [];
  const code = await readCommand([root, ...args], {
    drivers,
    secrets: memorySecretStore(),
    env: {},
    log: (line) => lines.push(line),
  });
  return { code, output: lines.join("\n") };
}

describe("exploreda read", () => {
  const { driver } = fakeDriver({
    tables: { orders: { columns: [{ name: "id" }], rows: [[1], [2]] } },
  });
  const passwordless = fakeDriver({
    tables: {},
    failConnect: new SourceReadError("secret", "wh needs a password."),
  }).driver;

  it("reads the sources named and exits 0", async () => {
    const { code, output } = await run(["orders"], { fake: driver });
    expect(code).toBe(0);
    expect(output).toMatch(/^orders {2}2 rows, 1 columns, /);
  });

  it("exits 1 when any read fails, and names how to give a password", async () => {
    const { code, output } = await run([], {
      fake: driver,
      postgres: passwordless,
    });
    expect(code).toBe(1);
    expect(output).toContain("missing  failed:");
    expect(output).toContain("sales    failed: wh needs a password.");
    expect(output).toContain(
      "fix: Set EXPLOREDA_WH_PASSWORD, or save the password in the app"
    );
    expect(output).toContain("2 of 3 sources failed to read.");
  });
});
