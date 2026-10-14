import path from "node:path";
import { readFileSync } from "node:fs";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { readProjectFolder } from "@/lib/project";
import { nodeProjectFiles } from "@/node/projectFiles";
import { readNotebookText } from "./readNotebook";

beforeAll(() => registerAllCharts());

/** The notebooks the README and docs show build without a problem. */
it("builds the notebook examples in the README and docs", async () => {
  const root = path.resolve(__dirname, "../../../");
  const folder = await readProjectFolder(
    nodeProjectFiles(path.join(root, "examples/forecast"))
  );
  const docs = readFileSync(
    path.join(root, "../../apps/demo/src/docs/pages/notebooks.mdx"),
    "utf8"
  );
  const readme = readFileSync(path.join(root, "README.md"), "utf8");
  const examples = [docs, readme].map(
    (text) => /````markdown\n([\s\S]*?)\n````/.exec(text)![1]!
  );
  for (const example of examples) {
    const result = readNotebookText(example, {
      project: folder.project,
      tables: folder.tables,
    });
    expect(result.diagnostics).toEqual([]);
    expect(result.charts.length).toBeGreaterThan(0);
  }
});
