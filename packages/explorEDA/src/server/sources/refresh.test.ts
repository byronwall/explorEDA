import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { memoryProjectFiles } from "../../lib/project/files";
import { readProjectFolder } from "../../lib/project/folder";
import { parseSnapshot, snapshotPath } from "../../lib/project/snapshots";
import { fakeDriver } from "./fake";
import { writeContractSqlite } from "./fixtures/sqliteContract";
import {
  cancelRead,
  listTables,
  readsInProgress,
  refreshSource,
} from "./refresh";
import { SourceReadError } from "./types";

let root = "";

beforeEach(async () => {
  root = await mkdtemp(path.join(tmpdir(), "exploreda-refresh-"));
});

afterEach(async () => {
  await rm(root, { recursive: true, force: true });
});

const PROJECT = `project @shop

connection @app driver=sqlite path=app.db

source @items db=app table=contract_items

source @first db=app sql="select id, name from contract_items where id = 1"

source @many db=app table=contract_many limit=10
`;

async function failure(promise: Promise<unknown>) {
  const error = await promise.then(
    () => undefined,
    (reason: unknown) => reason
  );
  expect(error).toBeInstanceOf(SourceReadError);
  return error as SourceReadError;
}

describe("refreshing a database source", () => {
  beforeEach(async () => {
    await writeContractSqlite(path.join(root, "app.db"));
    await writeFile(path.join(root, "exploreda.eda"), PROJECT);
  });

  it("writes a snapshot the folder reader loads", async () => {
    const info = await refreshSource("items", { root });
    expect(info).toMatchObject({
      sourceId: "items",
      connection: "app",
      driver: "sqlite",
      rowCount: 4,
    });
    const text = await readFile(path.join(root, snapshotPath("items")), "utf8");
    expect(parseSnapshot(text).rows[0]).toMatchObject({ id: 1, name: "Ada" });
    expect(
      await readFile(path.join(root, ".exploreda/snapshots/.gitignore"), "utf8")
    ).toBe("*\n");

    await refreshSource("first", { root });
    const files = memoryProjectFiles({
      "exploreda.eda": PROJECT,
      [snapshotPath("items")]: text,
      [snapshotPath("first")]: await readFile(
        path.join(root, snapshotPath("first")),
        "utf8"
      ),
    });
    const folder = await readProjectFolder(files);
    expect(folder.tables.items).toHaveLength(4);
    expect(folder.tables.first).toEqual([{ id: 1, name: "Ada" }]);
    expect(folder.snapshots.items?.rowCount).toBe(4);
    const items = folder.project.sources.find(
      (source) => source.id === "items"
    )!;
    expect(items.entityKey).toBe("id");
    expect(
      Object.fromEntries(items.fields.map((field) => [field.id, field.type]))
    ).toMatchObject({ id: "number", active: "boolean", created: "date" });
    expect(folder.missingSources).toEqual(["many"]);
    expect(folder.problems.map((problem) => problem.message)).toContain(
      "many hasn't been read from its database yet."
    );
  });

  it("warns when a source's text changed since its read", async () => {
    await refreshSource("first", { root });
    const text = await readFile(path.join(root, snapshotPath("first")), "utf8");
    const load = (project: string, snapshot = text) =>
      readProjectFolder(
        memoryProjectFiles({
          "exploreda.eda": project,
          [snapshotPath("first")]: snapshot,
        })
      );
    expect((await load(PROJECT)).staleSources).toEqual([]);

    const changed = await load(PROJECT.replace("id = 1", "id = 2"));
    expect(changed.staleSources).toEqual(["first"]);
    expect(changed.tables.first).toEqual([{ id: 1, name: "Ada" }]);
    expect(changed.problems).toContainEqual(
      expect.objectContaining({
        subject: "first",
        severity: "warning",
        message: "first changed since it was read.",
      })
    );

    // A snapshot written before reads were recorded isn't called stale.
    const { read: _read, ...older } = JSON.parse(text);
    const unknown = await load(
      PROJECT.replace("id = 1", "id = 2"),
      JSON.stringify(older)
    );
    expect(unknown.staleSources).toEqual([]);
  });

  it("keeps the last snapshot when a read fails", async () => {
    await refreshSource("items", { root });
    const before = await readFile(
      path.join(root, snapshotPath("items")),
      "utf8"
    );
    const error = await failure(
      refreshSource("items", { root, limits: { rows: 2 } })
    );
    expect(error.code).toBe("too-many-rows");
    expect(await readFile(path.join(root, snapshotPath("items")), "utf8")).toBe(
      before
    );
  });

  it("reads sql=@file from the folder and goes stale when the file changes", async () => {
    const project = PROJECT.replace(
      'sql="select id, name from contract_items where id = 1"',
      "sql=@queries/first.sql"
    );
    const sql = "select id, name\nfrom contract_items\nwhere id = 1\n";
    await writeFile(path.join(root, "exploreda.eda"), project);
    await mkdir(path.join(root, "queries"));
    await writeFile(path.join(root, "queries/first.sql"), sql);
    const info = await refreshSource("first", { root });
    expect(info.rowCount).toBe(1);
    const snapshot = await readFile(
      path.join(root, snapshotPath("first")),
      "utf8"
    );
    const load = (file: string) =>
      readProjectFolder(
        memoryProjectFiles({
          "exploreda.eda": project,
          "queries/first.sql": file,
          [snapshotPath("first")]: snapshot,
        })
      );
    expect((await load(sql)).staleSources).toEqual([]);
    expect((await load(sql.replace("id = 1", "id = 2"))).staleSources).toEqual([
      "first",
    ]);

    await rm(path.join(root, "queries/first.sql"));
    const error = await failure(refreshSource("first", { root }));
    expect(error.message).toBe(
      "first reads its SQL from queries/first.sql, which doesn't exist."
    );
  });

  it("takes a source's own limit over the default", async () => {
    const error = await failure(refreshSource("many", { root }));
    expect(error.message).toBe("many has more than 10 rows.");
  });

  it("names a source that isn't a database source", async () => {
    const error = await failure(refreshSource("orders", { root }));
    expect(error.code).toBe("unknown-source");
  });

  it("lists a connection's tables", async () => {
    const tables = await listTables("app", { root });
    expect(tables.map((table) => table.name)).toEqual([
      "contract_blob",
      "contract_events",
      "contract_items",
      "contract_large",
      "contract_many",
    ]);
  });
});

describe("refresh with a fake database", () => {
  const project = `project @p

connection @db driver=fake

source @orders db=db table=orders
`;

  beforeEach(async () => {
    await writeFile(path.join(root, "exploreda.eda"), project);
  });

  const orders = {
    columns: [{ name: "id", type: "integer" }, { name: "total" }],
    rows: [
      [1, 9.5],
      [2, 3],
      [3, 4.25],
    ],
  };

  it("shares one read between refreshes that overlap", async () => {
    const { driver, state } = fakeDriver({
      tables: { orders },
      stallMs: 20,
    });
    const options = { root, drivers: { fake: driver } };
    const [a, b] = await Promise.all([
      refreshSource("orders", options),
      refreshSource("orders", options),
    ]);
    expect(a).toBe(b);
    expect(state.connects).toBe(1);
    expect(state.open).toBe(0);
  });

  it("closes the connection when a read fails partway", async () => {
    const { driver, state } = fakeDriver({
      tables: { orders },
      failAfter: {
        rows: 2,
        error: new SourceReadError("query", "Lost the connection."),
      },
    });
    const error = await failure(
      refreshSource("orders", { root, drivers: { fake: driver } })
    );
    expect(error.message).toBe("Lost the connection.");
    expect(state.open).toBe(0);
  });

  it("reports a published snapshot when the connection fails to close", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { driver, state } = fakeDriver({
      tables: { orders },
      failClose: new Error("close failed"),
    });
    const info = await refreshSource("orders", {
      root,
      drivers: { fake: driver },
    });
    expect(info.rowCount).toBe(3);
    const text = await readFile(
      path.join(root, snapshotPath("orders")),
      "utf8"
    );
    expect(parseSnapshot(text).rows).toHaveLength(3);
    expect(state.open).toBe(0);
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it("keeps the read error when the connection also fails to close", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { driver } = fakeDriver({
      tables: { orders },
      failAfter: {
        rows: 2,
        error: new SourceReadError("query", "Lost the connection."),
      },
      failClose: new Error("close failed"),
    });
    const error = await failure(
      refreshSource("orders", { root, drivers: { fake: driver } })
    );
    expect(error.message).toBe("Lost the connection.");
    warn.mockRestore();
  });

  it("gives up when a read takes too long", async () => {
    const { driver, state } = fakeDriver({ tables: { orders }, stallMs: 50 });
    const error = await failure(
      refreshSource("orders", {
        root,
        drivers: { fake: driver },
        limits: { timeout: 10 },
      })
    );
    expect(error.code).toBe("timeout");
    expect(state.open).toBe(0);
  });

  it("passes the connection's secret to the driver", async () => {
    const seen: (string | undefined)[] = [];
    const { driver } = fakeDriver({ tables: { orders } });
    const connect = driver.connect.bind(driver);
    driver.connect = async (connection) => {
      seen.push(connection.secret);
      return connect(connection);
    };
    await refreshSource("orders", {
      root,
      drivers: { fake: driver },
      secret: async () => "s3cret",
    });
    expect(seen).toEqual(["s3cret"]);
    expect(
      await readFile(path.join(root, "exploreda.eda"), "utf8")
    ).not.toMatch(/s3cret/);
  });

  it("counts rows while it reads, and stops when cancelled", async () => {
    const many = {
      ...orders,
      rows: Array.from({ length: 100 }, (_, index) => [index, 1]),
    };
    const { driver, state } = fakeDriver({
      tables: { orders: many },
      batchSize: 10,
      stallMs: 20,
    });
    const read = failure(
      refreshSource("orders", { root, drivers: { fake: driver } })
    );
    await vi.waitFor(() =>
      expect(readsInProgress(root)[0]?.rows).toBeGreaterThan(0)
    );
    expect(readsInProgress(root)[0]?.sourceId).toBe("orders");
    expect(cancelRead(root, "orders")).toBe(true);
    const error = await read;
    expect(error.code).toBe("cancelled");
    expect(error.message).toBe("Reading orders stopped.");
    expect(readsInProgress(root)).toEqual([]);
    expect(cancelRead(root, "orders")).toBe(false);
    expect(state.open).toBe(0);
  });

  it("names a driver it doesn't know", async () => {
    const error = await failure(refreshSource("orders", { root }));
    expect(error.code).toBe("unknown-driver");
    expect(error.message).toBe(
      "db uses driver=fake, which explorEDA doesn't read."
    );
  });
});
