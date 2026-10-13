import { memoryProjectFiles, readProjectFolder } from "exploreda";
import { describe, expect, it } from "vitest";
import {
  chartDataFile,
  createAnalysis,
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
    // It opens on a summary of the fields and the rows.
    expect(
      folder.analyses[0]!.result.views[0]!.settings.charts.map(
        (chart) => chart.type
      )
    ).toEqual(["summary", "data-table"]);
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
});
