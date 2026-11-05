import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AddDatabase, type AddDatabaseActions } from "./AddDatabase";
import { RefreshError } from "./httpFiles";

function actions(overrides: Partial<AddDatabaseActions> = {}) {
  return {
    listTables: vi.fn(async () => [
      { name: "orders", kind: "table" as const },
      { name: "order_totals", kind: "view" as const },
      { name: "customers", kind: "table" as const },
    ]),
    addConnection: vi.fn(async () => {}),
    addSource: vi.fn(async () => {}),
    databaseFiles: vi.fn(async () => ["data/shop.db"]),
    ...overrides,
  } satisfies AddDatabaseActions;
}

const shop = {
  id: "shop",
  driver: "sqlite",
  settings: { path: "data/shop.db" },
};

describe("AddDatabase", () => {
  it("leaves the password to an admin when this person can't enter one", () => {
    render(
      <AddDatabase
        connections={[]}
        sourceIds={[]}
        actions={actions()}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Kind"), {
      target: { value: "postgres" },
    });
    expect(screen.queryByLabelText("Password")).toBeNull();
    expect(screen.getByText(/An admin enters the password/)).toBeTruthy();
  });

  it("starts with a new connection when the project has none", async () => {
    const act = actions();
    render(
      <AddDatabase
        connections={[]}
        sourceIds={[]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("File"), {
      target: { value: "data/shop.db" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add connection" }));
    expect(act.addConnection).toHaveBeenCalledWith(
      { id: "app", driver: "sqlite", settings: { path: "data/shop.db" } },
      undefined
    );
    await waitFor(() => expect(act.databaseFiles).toHaveBeenCalled());
  });

  it("keeps a PostgreSQL password apart from its settings", () => {
    const act = actions({ saveSecret: vi.fn(async () => {}) });
    render(
      <AddDatabase
        connections={[]}
        sourceIds={[]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Kind"), {
      target: { value: "postgres" },
    });
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Sales DB" },
    });
    for (const [label, value] of [
      ["Host", "db.internal"],
      ["Database", "sales"],
      ["User", "reader"],
      ["Password", "test-only"],
    ]) {
      fireEvent.change(screen.getByLabelText(label!), { target: { value } });
    }
    fireEvent.click(screen.getByRole("button", { name: "Add connection" }));
    expect(act.addConnection).toHaveBeenCalledWith(
      {
        id: "sales-db",
        driver: "postgres",
        settings: { host: "db.internal", database: "sales", user: "reader" },
      },
      "test-only"
    );
  });

  it("offers each kind of database", () => {
    render(
      <AddDatabase
        connections={[]}
        sourceIds={[]}
        actions={actions()}
        onClose={vi.fn()}
      />
    );
    expect(
      [...(screen.getByLabelText("Kind") as HTMLSelectElement).options].map(
        (item) => item.textContent
      )
    ).toEqual([
      "SQLite file",
      "PostgreSQL",
      "MySQL",
      "SQL Server",
      "DuckDB file",
    ]);
    fireEvent.change(screen.getByLabelText("Kind"), {
      target: { value: "sqlserver" },
    });
    expect(screen.getByLabelText("Port").getAttribute("placeholder")).toBe(
      "1433"
    );
  });

  it("adds a table under a name made from it", async () => {
    const act = actions();
    render(
      <AddDatabase
        connections={[shop]}
        sourceIds={["orders"]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(await screen.findByLabelText("Find a table in shop"), {
      target: { value: "ord" },
    });
    expect(
      screen.queryByRole("checkbox", { name: "customers, table" })
    ).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "orders, table" }));
    expect(
      screen.getByLabelText("Source name").getAttribute("placeholder")
    ).toBe("orders-2");
    fireEvent.click(screen.getByRole("button", { name: "Add and read" }));
    await waitFor(() =>
      expect(act.addSource).toHaveBeenCalledWith("orders-2", {
        connection: "shop",
        table: "orders",
      })
    );
  });

  it("adds several tables and opens the largest", async () => {
    const act = actions({
      listTables: vi.fn(async () => [
        { name: "item", kind: "table" as const, rows: 18000 },
        { name: "store_sales", kind: "table" as const, rows: 28694 },
        { name: "inventory", kind: "table" as const, rows: 188400 },
      ]),
      addSources: vi.fn(async () => {}),
      tableColumns: vi.fn(async () => [{ name: "i_item_sk", type: "INTEGER" }]),
    });
    render(
      <AddDatabase
        connections={[shop]}
        sourceIds={[]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(
      await screen.findByRole("checkbox", { name: "item, table, 18,000 rows" })
    );
    // Checking a table shows its columns.
    await screen.findByText("i_item_sk");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "store_sales, table, 28,694 rows" })
    );
    expect(
      (
        screen.getByLabelText(
          "Which table is one row of your analysis?"
        ) as HTMLSelectElement
      ).value
    ).toBe("store_sales");
    // A table over the read limit says so, with the fix.
    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "inventory, table, 188,400 rows, over the read limit",
      })
    );
    fireEvent.click(
      screen.getByRole("button", { name: /Read up to 200,000 rows/ })
    );
    fireEvent.change(
      screen.getByLabelText("Which table is one row of your analysis?"),
      { target: { value: "store_sales" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Add 3 tables and read" })
    );
    await waitFor(() =>
      expect(act.addSources).toHaveBeenCalledWith(
        [
          { sourceId: "item", database: { connection: "shop", table: "item" } },
          {
            sourceId: "store-sales",
            database: { connection: "shop", table: "store_sales" },
          },
          {
            sourceId: "inventory",
            database: { connection: "shop", table: "inventory", limit: 200000 },
          },
        ],
        "store-sales"
      )
    );
  });

  it("adds a query", async () => {
    const act = actions();
    render(
      <AddDatabase
        connections={[shop]}
        sourceIds={[]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.click(screen.getByRole("radio", { name: "A query" }));
    fireEvent.change(screen.getByLabelText("SQL"), {
      target: { value: "select * from orders where amount > 100" },
    });
    fireEvent.change(screen.getByLabelText("Source name"), {
      target: { value: "Big Orders" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Add and read" }));
    await waitFor(() =>
      expect(act.addSource).toHaveBeenCalledWith("big-orders", {
        connection: "shop",
        sql: "select * from orders where amount > 100",
      })
    );
  });

  it("asks for a password when listing tables needs one", async () => {
    const saveSecret = vi.fn(async () => {});
    let calls = 0;
    const act = actions({
      saveSecret,
      listTables: vi.fn(async () => {
        calls += 1;
        if (calls === 1) {
          throw new RefreshError(
            "shop needs a password.",
            undefined,
            "secret",
            "shop"
          );
        }
        return [{ name: "orders", kind: "table" as const }];
      }),
    });
    render(
      <AddDatabase
        connections={[shop]}
        sourceIds={[]}
        actions={act}
        onClose={vi.fn()}
      />
    );
    fireEvent.change(await screen.findByLabelText("Password for shop"), {
      target: { value: "test-only" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save and read" }));
    await screen.findByRole("checkbox", { name: "orders, table" });
    expect(saveSecret).toHaveBeenCalledWith("shop", "test-only");
  });
});
