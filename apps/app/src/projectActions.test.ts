import {
  memoryProjectFiles,
  projectFileText,
  readProjectFolder,
  type AnalysisProject,
} from "exploreda";
import { describe, expect, it } from "vitest";
import {
  chartDataFile,
  addDatabaseSources,
  createAnalysis,
  openView,
  removeSource,
  renameAnalysis,
} from "./projectActions";

const SALES = "order_id,region,revenue\nA1,West,10\nA2,East,20\n";

describe("project actions", () => {
  it("charts a data file in a folder with no project yet", async () => {
    const files = memoryProjectFiles({ "data/sales.csv": SALES });
    const path = await chartDataFile(files, await readProjectFolder(files), {
      dataPath: "data/sales.csv",
      projectName: "Shop",
      layout: "visible",
    });
    expect(path).toBe("sales.eda");
    expect(files.snapshot()["exploreda.eda"]).toBe(
      "project @shop\n\nsource @sales path=data/sales.csv\n"
    );
    const folder = await readProjectFolder(files);
    expect(folder.problems).toEqual([]);
    expect(folder.analyses[0]!.result.views[0]!.queryId).toBe("sales");
    expect(folder.analyses[0]!.result.name).toBe("Sales");
    // It opens on a summary of the fields.
    expect(
      folder.analyses[0]!.result.views[0]!.settings.charts.map(
        (chart) => chart.type
      )
    ).toEqual(["summary"]);
  });

  it("keeps a hidden project's text in .exploreda", async () => {
    const files = memoryProjectFiles({ "sales.csv": SALES });
    await chartDataFile(files, await readProjectFolder(files), {
      dataPath: "sales.csv",
      projectName: "shop",
      layout: "hidden",
    });
    expect(Object.keys(files.snapshot()).sort()).toEqual([
      ".exploreda/project.eda",
      "sales.csv",
      "sales.eda",
    ]);
  });

  it("creates and renames an analysis", async () => {
    const files = memoryProjectFiles({ "sales.csv": SALES });
    await chartDataFile(files, await readProjectFolder(files), {
      dataPath: "sales.csv",
      projectName: "shop",
      layout: "visible",
    });
    const created = await createAnalysis(
      files,
      await readProjectFolder(files),
      {
        name: "Regional mix",
        queryId: "sales",
      }
    );
    expect(created).toBe("regional-mix.eda");
    const renamed = await renameAnalysis(
      files,
      await readProjectFolder(files),
      {
        path: created,
        name: "West vs East",
      }
    );
    expect(renamed).toBe("west-vs-east.eda");
    expect(files.snapshot()["regional-mix.eda"]).toBeUndefined();
    const folder = await readProjectFolder(files);
    expect(
      folder.analyses.find((analysis) => analysis.path === renamed)!.result.name
    ).toBe("West vs East");
  });

  it("removes an unread database source and its untouched analysis", async () => {
    const project =
      "project @shop\n\nconnection @app driver=sqlite path=app.db\n";
    const files = memoryProjectFiles({
      "exploreda.eda": project,
      "kept.eda": 'eda query=plays\ndashboard "Mine"\n',
    });
    await addDatabaseSources(files, await readProjectFolder(files), {
      sources: [
        { sourceId: "plays", database: { connection: "app", table: "plays" } },
      ],
      main: "plays",
      projectName: "shop",
      layout: "visible",
    });
    await removeSource(files, await readProjectFolder(files), "plays");
    expect(files.snapshot()).toEqual({
      "exploreda.eda": project,
      "kept.eda": 'eda query=plays\ndashboard "Mine"\n',
    });
  });

  it("adds several tables with one analysis, of the main table", async () => {
    const files = memoryProjectFiles({
      "exploreda.eda":
        "project @shop\n\nconnection @app driver=sqlite path=app.db\n",
    });
    const path = await addDatabaseSources(
      files,
      await readProjectFolder(files),
      {
        sources: [
          { sourceId: "item", database: { connection: "app", table: "item" } },
          {
            sourceId: "sales",
            database: { connection: "app", table: "sales", limit: 200000 },
          },
        ],
        main: "sales",
        projectName: "shop",
        layout: "visible",
      }
    );
    expect(path).toBe("sales.eda");
    const text = files.snapshot()["exploreda.eda"]!;
    expect(text).toContain("source @item db=app table=item");
    expect(text).toContain("source @sales db=app table=sales limit=200000");
    expect(Object.keys(files.snapshot()).sort()).toEqual([
      "exploreda.eda",
      "sales.eda",
    ]);
  });

  describe("joins added from the app", () => {
    const tables = {
      "exploreda.eda": [
        "project @retail",
        "",
        "source @sales path=sales.csv",
        "",
        "source @item path=item.csv",
        "",
        'relate @sales-item sales.item_sk -> item.i_item_sk "Sales to Item"',
        "",
      ].join("\n"),
      "sales.csv": "ticket,item_sk,price\n1,10,5\n2,11,7\n3,10,2\n",
      "item.csv": "i_item_sk,category\n10,Music\n11,Sports\n",
      "sales.eda": 'eda query=sales\ndashboard "Sales"\n',
    };
    /** The project with a lookup of Item on a query that reads Sales. */
    const withLookup = (
      project: AnalysisProject,
      queryId: string
    ): AnalysisProject => ({
      ...project,
      queries: project.queries.map((query) =>
        query.id === queryId
          ? {
              ...query,
              steps: [
                ...query.steps,
                {
                  id: "item",
                  kind: "lookup",
                  inputStepId: query.outputStepId,
                  relationshipId: "sales-item",
                  as: "item",
                  inputFieldId: "sales.item_sk",
                },
              ],
              outputStepId: "item",
            }
          : query
      ),
    });

    it("writes a lookup on a table's own query as a query block", async () => {
      const files = memoryProjectFiles(tables);
      const folder = await readProjectFolder(files);
      const text = projectFileText(folder, withLookup(folder.project, "sales"));
      expect(text).toMatch(
        /\nquery @sales glyph=\S+ \{\n {2}source sales\n {2}lookup item via=sales-item on=sales\.item_sk\n\}/
      );
      await files.write("exploreda.eda", text);
      const next = await readProjectFolder(files);
      expect(next.problems).toEqual([]);
      // The analysis that read the table now has Item's fields.
      expect(
        next.project.queries
          .find((query) => query.id === "sales")!
          .steps.map((step) => step.kind)
      ).toEqual(["source", "lookup"]);
    });

    it("opens a new query's view as its own analysis", async () => {
      const files = memoryProjectFiles(tables);
      const folder = await readProjectFolder(files);
      const query = {
        id: "sales-2",
        name: "Sales with Item",
        glyph: "◇",
        frameLabel: "Sales",
        steps: [{ id: "sales", kind: "source" as const, sourceId: "sales" }],
        outputStepId: "sales",
      };
      const project = withLookup(
        { ...folder.project, queries: [...folder.project.queries, query] },
        "sales-2"
      );
      const path = await openView(files, folder, {
        view: { id: "v", name: "Sales with Item", queryId: "sales-2" },
        name: "Sales with Item",
        project,
        layout: "visible",
      });
      expect(path).toBe("sales-with-item.eda");
      expect(files.snapshot()[path]).toMatch(/^eda query=sales-2\n/);
      const next = await readProjectFolder(files);
      expect(next.problems).toEqual([]);
      expect(next.analyses.map((item) => item.result.name)).toContain(
        "Sales with Item"
      );
      expect(files.snapshot()["exploreda.eda"]).toContain(
        'query @sales-2 "Sales with Item" glyph=◇ frame=Sales {\n  source sales\n  lookup item via=sales-item on=sales.item_sk\n}'
      );
    });
  });
});
