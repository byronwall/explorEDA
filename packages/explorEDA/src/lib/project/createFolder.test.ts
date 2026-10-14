import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { compileProjectText } from "@/lib/dsl/project";
import {
  addConnectionText,
  addDatabaseSourceText,
  addSourceText,
  analysisPathFor,
  newAnalysisText,
  sourceIdForFile,
  sourceIdForTable,
} from "./createFolder";
import { memoryProjectFiles } from "./files";
import { readProjectFolder } from "./folder";

beforeAll(() => {
  registerAllCharts();
});

describe("creating project files", () => {
  it("names sources and analyses safely and uniquely", () => {
    expect(sourceIdForFile("data/Sales 2024.csv", [])).toBe("sales-2024");
    expect(sourceIdForFile("sales.csv", ["sales"])).toBe("sales-2");
    expect(
      analysisPathFor("Revenue by region", ["Revenue-by-region.eda"])
    ).toBe("revenue-by-region-2.eda");
    expect(analysisPathFor("   ", [])).toBe("analysis.eda");
  });

  it("starts project text, then adds to it without touching the rest", () => {
    const first = addSourceText(undefined, {
      projectId: "My Folder",
      sourceId: "sales",
      path: "data/sales.csv",
    });
    expect(first).toBe(
      "project @my-folder\n\nsource @sales path=data/sales.csv\n"
    );
    const handWritten =
      "project @p\n\n# kept as written\nsource @a key=id path=a.csv";
    expect(
      addSourceText(handWritten, {
        projectId: "p",
        sourceId: "b",
        path: "b data.csv",
      })
    ).toBe(`${handWritten}\n\nsource @b path="b data.csv"\n`);
  });

  it("turns a folder of data into a project with two new files", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": "order_id,region,revenue\nA1,West,10\nA2,East,20\n",
    });
    const before = await readProjectFolder(files);
    expect(before.layout).toBe("none");
    expect(before.dataFiles).toEqual(["data/sales.csv"]);

    await files.write(
      "exploreda.eda",
      addSourceText(undefined, {
        projectId: "shop",
        sourceId: "sales",
        path: "data/sales.csv",
      })
    );
    await files.write("sales.eda", newAnalysisText("sales", "sales.eda"));
    const after = await readProjectFolder(files);
    expect(after.problems).toEqual([]);
    expect(after.implicitQueries).toEqual(["sales"]);
    expect(after.analyses[0]!.result.views[0]!.queryId).toBe("sales");
    expect(Object.keys(files.snapshot()).sort()).toEqual([
      "data/sales.csv",
      "exploreda.eda",
      "sales.eda",
    ]);
  });
});

describe("adding database sources", () => {
  const connection = {
    id: "warehouse",
    driver: "postgres",
    settings: { host: "db.internal", database: "sales", user: "", port: "" },
  };

  it("adds a connection after the project line, then after the others", () => {
    const first = addConnectionText("project @shop\n\nsource @a path=a.csv\n", {
      projectId: "shop",
      connection,
    });
    expect(first).toBe(
      "project @shop\n\nconnection @warehouse driver=postgres host=db.internal database=sales\n\nsource @a path=a.csv\n"
    );
    const second = addConnectionText(first, {
      projectId: "shop",
      connection: {
        id: "app",
        driver: "sqlite",
        settings: { path: "data/app.db" },
      },
    });
    expect(second).toContain(
      "connection @warehouse driver=postgres host=db.internal database=sales\nconnection @app driver=sqlite path=data/app.db\n"
    );
    expect(compileProjectText(second).diagnostics).toEqual([]);
  });

  it("starts the project text when there is none", () => {
    expect(
      addConnectionText(undefined, { projectId: "My Shop", connection })
    ).toBe(
      "project @my-shop\n\nconnection @warehouse driver=postgres host=db.internal database=sales\n"
    );
  });

  it("adds a table source and a query source that read back", () => {
    let text = addConnectionText(undefined, { projectId: "shop", connection });
    text = addDatabaseSourceText(text, {
      projectId: "shop",
      sourceId: "orders",
      database: { connection: "warehouse", table: "public.orders" },
    });
    text = addDatabaseSourceText(text, {
      projectId: "shop",
      sourceId: "big",
      database: { connection: "warehouse", sql: 'select "id"\nfrom orders' },
    });
    const { databases, diagnostics } = compileProjectText(text);
    expect(diagnostics).toEqual([]);
    expect(databases).toEqual({
      orders: { connection: "warehouse", table: "public.orders" },
      big: { connection: "warehouse", sql: 'select "id"\nfrom orders' },
    });
  });

  it("makes a source ID from a table name", () => {
    expect(sourceIdForTable("public.Order Lines", [])).toBe("order-lines");
    expect(sourceIdForTable("orders", ["orders"])).toBe("orders-2");
  });
});
