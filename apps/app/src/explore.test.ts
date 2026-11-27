import { memoryProjectFiles, readProjectFolder } from "exploreda";
import { describe, expect, it } from "vitest";
import { exploreView, savedName } from "./explore";
import { openView } from "./projectActions";

const SALES = "order_id,region,revenue\nA1,West,10\nA2,East,20\nA3,West,5\n";

describe("exploring a source", () => {
  it("opens the field summary beside every row, and saves what was filtered", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": SALES,
      "exploreda.eda": "project @shop\n\nsource @sales path=data/sales.csv\n",
    });
    const folder = await readProjectFolder(files);
    const view = exploreView(folder.project, folder.tables, "sales")!;
    expect(view.queryId).toBe("sales");
    const [summary, rows] = view.settings!.charts;
    expect(summary!.type).toBe("summary");
    expect(rows!.type).toBe("data-table");
    // A table with no field list shows every field.
    expect(
      (rows as { columns: Array<{ field: string }> }).columns.map(
        (column) => column.field
      )
    ).toEqual(["sales.order_id", "sales.region", "sales.revenue"]);

    // A value clicked in the summary is a filter on the summary chart.
    const filtered = {
      ...view.settings!,
      charts: view.settings!.charts.map((chart) =>
        chart.type === "summary"
          ? {
              ...chart,
              filters: [
                {
                  type: "value" as const,
                  field: "sales.region",
                  values: ["West"],
                },
              ],
            }
          : chart
      ),
    };
    const path = await openView(files, folder, {
      view: { ...view, settings: filtered },
      name: "Sales",
      layout: "visible",
    });
    expect(path).toBe("sales.eda");
    const saved = await readProjectFolder(files);
    expect(saved.problems).toEqual([]);
    const [reopened] = saved.analyses.find((item) => item.path === path)!.result
      .views;
    expect(reopened!.queryId).toBe("sales");
    expect(reopened!.settings.charts.map((chart) => chart.type)).toEqual([
      "summary",
      "data-table",
    ]);
    expect(reopened!.settings.charts[0]!.filters).toEqual(
      filtered.charts[0]!.filters
    );
  });

  it("has nothing to open for a source the project doesn't have", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": SALES,
      "exploreda.eda": "project @shop\n\nsource @sales path=data/sales.csv\n",
    });
    const folder = await readProjectFolder(files);
    expect(
      exploreView(folder.project, folder.tables, "orders")
    ).toBeUndefined();
  });
});

describe("naming a saved source", () => {
  it("takes the source's name, or the next free number", () => {
    expect(savedName("Orders", ["Products"])).toBe("Orders");
    expect(savedName("Orders", ["Orders", "Orders 2"])).toBe("Orders 3");
  });
});

describe("edge cases of exploring", () => {
  const PROJECT =
    "project @shop\n\n# Sales from the till.\nsource @sales path=data/sales.csv {\n  field order_id string\n  field region string\n}\n";

  it("lists an empty source's declared fields in its rows table", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": "order_id,region\n",
      "exploreda.eda": PROJECT,
    });
    const folder = await readProjectFolder(files);
    const view = exploreView(folder.project, folder.tables, "sales")!;
    const rows = view.settings!.charts.find(
      (chart) => chart.type === "data-table"
    ) as { columns: Array<{ field: string }> } | undefined;
    expect(rows?.columns.map((column) => column.field)).toEqual([
      "sales.order_id",
      "sales.region",
    ]);
  });

  it("saves only the new analysis, leaving hand-written project text be", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": SALES,
      "exploreda.eda": PROJECT,
    });
    const folder = await readProjectFolder(files);
    const view = exploreView(folder.project, folder.tables, "sales")!;
    await openView(files, folder, {
      view,
      name: "Sales",
      context: folder.project,
      layout: "visible",
    });
    expect(files.snapshot()["exploreda.eda"]).toBe(PROJECT);
    expect(files.snapshot()["sales.eda"]).toMatch(/^eda query=sales\n/);
  });
});
