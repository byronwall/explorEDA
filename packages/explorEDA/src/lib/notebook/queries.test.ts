/**
 * A notebook whose blocks name different queries: each block charts its
 * own query's rows, and definitions reach only blocks of the same query.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { memoryProjectFiles, readProjectFolder } from "@/lib/project";
import { compileNotebook } from "./compileNotebook";
import { writeBackChart } from "./writeBack";

const PROJECT = `project @shop
source @orders key=id path=orders.csv
source @regions key=region path=regions.csv
`;

const NOTEBOOK = [
  "# Two queries",
  "",
  "```eda",
  "eda query=orders",
  "amount:num=orders.amount",
  "hist amount @amounts",
  "```",
  "",
  "```eda",
  "eda query=regions",
  'calc staff2 = ["regions.staff"] * 2',
  "row regions.region @regions",
  "```",
  "",
  "```eda",
  "metric sum(amount) @total",
  "```",
].join("\n");

async function read(notebook: string) {
  const folder = await readProjectFolder(
    memoryProjectFiles({
      "exploreda.eda": PROJECT,
      "orders.csv": "id,amount,region\n1,10,East\n2,20,West\n3,30,East\n",
      "regions.csv": "region,staff\nEast,4\nWest,2\n",
      "two.eda.md": notebook,
    })
  );
  return folder.notebooks[0]!.result;
}

beforeAll(() => {
  registerAllCharts();
});

describe("a notebook with several queries", () => {
  it("charts each block from the query it names", async () => {
    const result = await read(NOTEBOOK);
    expect(result.diagnostics).toEqual([]);
    expect(result.queryId).toBe("orders");
    expect(result.rows).toHaveLength(3);
    expect(Object.keys(result.queryRows)).toEqual(["regions"]);
    expect(result.queryRows.regions).toHaveLength(2);
    // A block without eda query= keeps the notebook's first query.
    expect(result.groups).toEqual(["", "regions", ""]);
    expect(result.blocks.map((block) => block.charts.map((c) => c.id))).toEqual(
      [["amounts"], ["regions"], ["total"]]
    );
    expect(result.blocks[1]!.calculations).toEqual(["staff2"]);
    // The notebook's settings hold its own query's charts.
    expect(result.settings.charts.map((chart) => chart.id)).toEqual([
      "amounts",
      "total",
    ]);
  });

  it("keeps definitions to blocks of the same query", async () => {
    const result = await read(
      NOTEBOOK.replace("row regions.region @regions", "row amount @regions")
    );
    expect(result.diagnostics.map((item) => item.line)).toEqual([12]);
    expect(result.diagnostics[0]!.message).toMatch(/amount/);
  });

  it("names the project's queries when a block names an unknown one", async () => {
    const result = await read(NOTEBOOK.replace("query=regions", "query=nope"));
    const problem = result.diagnostics.find((item) =>
      item.message.includes("nope")
    )!;
    expect(problem.line).toBe(10);
    expect(problem.suggestion).toBe(
      "Name one of the project's queries: orders, regions."
    );
  });

  it("writes an edit to another query's chart into its block", async () => {
    const result = await read(NOTEBOOK);
    // Write-back compiles the same group the chart came from.
    const options = {
      rows: result.queryRows.regions!,
      groups: ["regions"],
      group: "regions",
    };
    const group = compileNotebook(NOTEBOOK, options);
    const chart = structuredClone(group.settings.charts[0]!);
    chart.title = "Staff by region";
    const outcome = writeBackChart(NOTEBOOK, group, chart, options);
    expect(outcome.text.split("\n")[11]).toBe(
      'row regions.region @regions title="Staff by region"'
    );
  });

  it("builds the docs example", async () => {
    const docs = readFileSync(
      path.resolve(
        __dirname,
        "../../../../../apps/demo/src/docs/pages/notebooks.mdx"
      ),
      "utf8"
    );
    const section = docs.slice(docs.indexOf("## Chart several queries"));
    const example = /````markdown\n([\s\S]*?)\n````/.exec(section)![1]!;
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "exploreda.eda": `project @retail
source @returns key=id path=returns.csv
source @cat_rate key=category path=rates.csv
query @return-lines glyph=◆ {
  source returns
}
`,
        "returns.csv": "id,reason,category\n1,Broken,Shoes\n2,Late,Home\n",
        "rates.csv": "category,return_rate\nShoes,0.05\nHome,0.04\n",
        "returns.eda.md": example,
      })
    );
    const { result } = folder.notebooks[0]!;
    expect(result.diagnostics).toEqual([]);
    expect(result.charts.map((chart) => chart.id)).toEqual([
      "by-reason",
      "rates",
    ]);
  });
});
