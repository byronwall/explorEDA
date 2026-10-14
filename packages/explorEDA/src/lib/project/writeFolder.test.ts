import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { memoryProjectFiles } from "./files";
import { readProjectFolder } from "./folder";
import { analysisFileText, projectFileText } from "./writeFolder";

const exampleDir = path.resolve(__dirname, "../../../examples/shop");

function exampleFiles(): Record<string, string> {
  const files: Record<string, string> = {};
  const walk = (directory: string, prefix: string) => {
    for (const name of readdirSync(directory)) {
      const full = path.join(directory, name);
      const relative = prefix ? `${prefix}/${name}` : name;
      if (statSync(full).isDirectory()) {
        walk(full, relative);
      } else {
        files[relative] = readFileSync(full, "utf8");
      }
    }
  };
  walk(exampleDir, "");
  return files;
}

beforeAll(() => {
  registerAllCharts();
});

describe("writing a project folder", () => {
  it("writes every file of the example back unchanged", async () => {
    const files = exampleFiles();
    const folder = await readProjectFolder(memoryProjectFiles(files));
    expect(projectFileText(folder, folder.project)).toBe(
      files["exploreda.eda"]
    );
    for (const analysis of folder.analyses) {
      expect(
        analysisFileText(
          folder,
          analysis.path,
          analysis.result.views,
          folder.project,
          analysis.result.name
        )
      ).toBe(files[analysis.path]);
    }
  });

  it("changes one line when one chart's title changes", async () => {
    const files = exampleFiles();
    const folder = await readProjectFolder(memoryProjectFiles(files));
    const analysis = folder.analyses[0]!;
    const [overview, ...rest] = analysis.result.views;
    const charts = overview!.settings.charts.map((chart) =>
      chart.title === "Orders by region"
        ? { ...chart, title: "Orders per region" }
        : chart
    );
    const text = analysisFileText(
      folder,
      analysis.path,
      [{ ...overview!, settings: { ...overview!.settings, charts } }, ...rest],
      folder.project,
      analysis.result.name
    );
    const before = files[analysis.path]!.split("\n");
    const changed = text
      .split("\n")
      .filter((line, index) => line !== before[index]);
    expect(changed).toEqual([
      '  row customer.region title="Orders per region"',
    ]);
  });

  it("keeps an analysis's own source in the short form it was written in", async () => {
    const text = `source @sales path=sales.csv
row sales.region title="By region"
`;
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "sales.csv": "order_id,region\nA1,West\n",
        "sales.eda": text,
      })
    );
    const analysis = folder.analyses[0]!;
    const written = analysisFileText(
      folder,
      analysis.path,
      analysis.result.views,
      folder.project,
      analysis.result.name
    );
    expect(written.startsWith("source @sales path=sales.csv\n\n")).toBe(true);
    expect(written).not.toContain("field ");
    const again = await readProjectFolder(
      memoryProjectFiles({
        "sales.csv": "order_id,region\nA1,West\n",
        "sales.eda": written,
      })
    );
    expect(again.problems).toEqual([]);
  });
});
