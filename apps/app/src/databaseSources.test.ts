import { describe, expect, it } from "vitest";
import { memoryProjectFiles, readProjectFolder, snapshotPath } from "exploreda";
import { querySources, visibleProblems, waitingFor } from "./databaseSources";

const project = `project @p

connection @db driver=sqlite path=app.db

source @orders key=id db=db table=orders

source @customers key=id db=db table=customers

relate @order-customer orders.customerId -> customers.id

query @lines glyph=L {
  source orders
  lookup customer via=order-customer
}
`;

const snapshot = (sourceId: string, fields: string[], rows: unknown[][]) =>
  JSON.stringify({
    format: "exploreda-snapshot",
    version: 1,
    sourceId,
    connection: "db",
    driver: "sqlite",
    readAt: "2026-10-13T00:00:00.000Z",
    rowCount: rows.length,
    fields: fields.map((id) => ({ id, type: "string" })),
    notes: [],
    rows,
  });

describe("database sources an analysis needs", () => {
  it("follows lookups to the sources they reach", async () => {
    const folder = await readProjectFolder(
      memoryProjectFiles({ "exploreda.eda": project })
    );
    expect(querySources(folder.project, "lines").sort()).toEqual([
      "customers",
      "orders",
    ]);
    expect(waitingFor(folder, folder.project, "lines").sort()).toEqual([
      "customers",
      "orders",
    ]);
  });

  it("hides problems that only unread data causes", async () => {
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "exploreda.eda": project,
        "lines.eda":
          "eda query=lines\ndashboard Lines\n\nview Overview {\n  table orders.id\n}\n",
        [snapshotPath("orders")]: snapshot(
          "orders",
          ["id", "customerId"],
          [["o1", "c1"]]
        ),
      })
    );
    expect(waitingFor(folder, folder.project, "lines")).toEqual(["customers"]);
    expect(folder.problems.length).toBeGreaterThan(0);
    expect(visibleProblems(folder, folder.project)).toEqual([]);
  });
});

describe("short read times", () => {
  it("fits a read time into a meta line", async () => {
    const { shortAgo } = await import("./DatabaseSourceViews");
    expect(shortAgo("just now")).toBe("just now");
    expect(shortAgo("1 hour ago")).toBe("1h ago");
    expect(shortAgo("12 minutes ago")).toBe("12m ago");
    expect(shortAgo("3 days ago")).toBe("3d ago");
  });
});
