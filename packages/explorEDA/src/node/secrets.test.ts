// @vitest-environment node
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  fileSecretStore,
  memorySecretStore,
  resolveSecret,
  secretKey,
  secretVariable,
} from "./secrets";

const warehouse = {
  id: "warehouse",
  driver: "postgres",
  settings: {
    host: "db.internal",
    port: "5433",
    database: "sales",
    user: "reader",
  },
};

let directory = "";

beforeEach(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "exploreda-secrets-"));
});

afterEach(async () => {
  await rm(directory, { recursive: true, force: true });
});

describe("connection secrets", () => {
  it("files a secret under the server it unlocks", () => {
    expect(secretKey(warehouse)).toBe(
      "postgres://reader@db.internal:5433/sales"
    );
    expect(secretKey({ ...warehouse, id: "other-name" })).toBe(
      secretKey(warehouse)
    );
  });

  it("names an environment variable for each connection", () => {
    expect(secretVariable(warehouse)).toBe("EXPLOREDA_WAREHOUSE_PASSWORD");
    expect(secretVariable({ ...warehouse, id: "sales-db" })).toBe(
      "EXPLOREDA_SALES_DB_PASSWORD"
    );
  });

  it("keeps secrets in a file only this user can read", async () => {
    const store = fileSecretStore(directory);
    await store.set(warehouse, "test-secret");
    expect(await store.get(warehouse)).toBe("test-secret");
    const file = path.join(directory, "secrets.json");
    if (process.platform !== "win32") {
      expect((await stat(file)).mode & 0o777).toBe(0o600);
    }
    expect(JSON.parse(await readFile(file, "utf8"))).toEqual({
      "postgres://reader@db.internal:5433/sales": "test-secret",
    });
    await store.remove(warehouse);
    expect(await store.get(warehouse)).toBeUndefined();
  });

  it("takes the environment over the store", async () => {
    const store = memorySecretStore();
    await store.set(warehouse, "stored");
    expect(await resolveSecret(store, {})(warehouse)).toBe("stored");
    expect(
      await resolveSecret(store, { EXPLOREDA_WAREHOUSE_PASSWORD: "from-env" })(
        warehouse
      )
    ).toBe("from-env");
  });
});
