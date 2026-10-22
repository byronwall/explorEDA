import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { memoryProjectFiles } from "../../lib/project/files";
import { readProjectFolder } from "../../lib/project/folder";
import { parseSnapshot, snapshotPath } from "../../lib/project/snapshots";
import { fakeDriver } from "./fake";
import { writeContractSqlite } from "./fixtures/sqliteContract";
import { listTables, refreshSource } from "./refresh";
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

  it("names a driver it doesn't know", async () => {
    const error = await failure(refreshSource("orders", { root }));
    expect(error.code).toBe("unknown-driver");
    expect(error.message).toBe(
      "db uses driver=fake, which explorEDA doesn't read."
    );
  });
});
