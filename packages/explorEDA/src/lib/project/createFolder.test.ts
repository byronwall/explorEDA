import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import {
  addSourceText,
  analysisPathFor,
  newAnalysisText,
  sourceIdForFile,
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
