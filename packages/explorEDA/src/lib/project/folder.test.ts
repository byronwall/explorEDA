import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { evaluateAnalysisQuery } from "@/lib/analysis/evaluateProject";
import { exportAnalysisText, readAnalysisText } from "./analysisText";
import { memoryProjectFiles, normalizeProjectPath } from "./files";
import { readProjectFolder } from "./folder";
import { parseCsv } from "./tables";

const exampleDir = path.resolve(__dirname, "../../../examples/shop");

/** The bundled example folder, as files in memory. */
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

describe("readProjectFolder", () => {
  it("loads the example project and builds every view", async () => {
    const folder = await readProjectFolder(memoryProjectFiles(exampleFiles()));
    expect(folder.problems).toEqual([]);
    expect(folder.layout).toBe("visible");
    expect(folder.project.sources.map((source) => source.id)).toEqual([
      "customers",
      "orders",
      "items",
      "products",
    ]);
    expect(folder.tables.orders).toHaveLength(80);
    expect(folder.analyses.map((analysis) => analysis.path)).toEqual([
      "orders.eda",
      "products.eda",
    ]);
    const [overview, spring] = folder.analyses[0]!.result.views;
    expect(overview).toMatchObject({
      name: "Overview",
      queryId: "order-lines",
    });
    expect(spring).toMatchObject({
      name: "Aster in spring",
      queryId: "customer-orders",
      bindings: { customer: "C01", from: "2025-03-01", until: "2025-05-31" },
    });
    const rows = evaluateAnalysisQuery(
      folder.project,
      folder.tables,
      spring!.queryId,
      spring!.bindings
    ).rows;
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.every((row) => row.data["orders.customerId"] === "C01")).toBe(
      true
    );
  });

  it("keeps loading the other sources when a data file is missing", async () => {
    const files = exampleFiles();
    delete files["data/products.csv"];
    const folder = await readProjectFolder(memoryProjectFiles(files));
    expect(folder.missingSources).toEqual(["products"]);
    expect(folder.tables.orders).toHaveLength(80);
    expect(folder.problems[0]).toMatchObject({
      path: "exploreda.eda",
      message: "products reads data/products.csv, which doesn't exist.",
    });
  });

  it("reads project text kept in .exploreda", async () => {
    const files = exampleFiles();
    files[".exploreda/project.eda"] = files["exploreda.eda"]!;
    delete files["exploreda.eda"];
    const folder = await readProjectFolder(memoryProjectFiles(files));
    expect(folder.layout).toBe("hidden");
    expect(folder.projectPath).toBe(".exploreda/project.eda");
    expect(folder.problems).toEqual([]);
  });

  it("lets an analysis bring its own file, with fields and key from the data", async () => {
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "sales.csv": "order_id,region,revenue\nA1,West,10\nA2,East,20\n",
        "sales.eda": `source @sales path=sales.csv
row sales.region title="By region"
`,
      })
    );
    expect(folder.problems).toEqual([]);
    expect(folder.layout).toBe("none");
    expect(folder.localSources).toEqual({ sales: "sales.eda" });
    expect(folder.implicitQueries).toEqual(["sales"]);
    expect(folder.inferredSources).toEqual(["sales"]);
    expect(folder.project.sources[0]).toMatchObject({
      entityKey: "order_id",
      fields: [
        { id: "order_id", name: "Order ID", type: "string" },
        { id: "region", name: "Region", type: "string" },
        { id: "revenue", name: "Revenue", type: "number" },
      ],
    });
    expect(folder.analyses[0]!.result.views[0]!.queryId).toBe("sales");
  });

  it("reads absolute paths and marks them as outside the folder", async () => {
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "/shared/sales.csv": "id,revenue\nA,1\n",
        "sales.eda":
          "source @sales key=id path=/shared/sales.csv\nhist revenue\n",
      })
    );
    expect(folder.outsideSources).toEqual(["sales"]);
    expect(folder.tables.sales).toHaveLength(1);
    expect(folder.dataFiles).toEqual([]);
  });

  it("doesn't list the app's own records in .exploreda as data", async () => {
    const folder = await readProjectFolder(
      memoryProjectFiles({
        "data/sales.csv": "id\n1\n",
        ".exploreda/fetched.json": "{}",
      })
    );
    expect(folder.dataFiles).toEqual(["data/sales.csv"]);
  });

  it("prefers the project's source when an analysis names the same one", async () => {
    const files = exampleFiles();
    files["extra.eda"] = `source @orders path=elsewhere.csv
eda query=order-lines
hist orders.amount
`;
    const folder = await readProjectFolder(memoryProjectFiles(files));
    expect(folder.paths.orders).toBe("data/orders.csv");
    expect(folder.problems).toEqual([]);
  });

  it("names a query the project doesn't have", async () => {
    const files = exampleFiles();
    files["broken.eda"] = "eda query=nope\nhist orders.amount\n";
    const folder = await readProjectFolder(memoryProjectFiles(files));
    expect(folder.problems[0]).toMatchObject({
      path: "broken.eda",
      message: "No query is named nope.",
    });
  });
});

describe("analysis text", () => {
  it("writes each view's query and inputs back the way it read them", async () => {
    const folder = await readProjectFolder(memoryProjectFiles(exampleFiles()));
    const analysis = folder.analyses[0]!;
    const context = {
      project: folder.project,
      tables: folder.tables,
      name: "orders",
    };
    const { text } = exportAnalysisText(analysis.result.views, context);
    expect(text).toContain("eda query=order-lines");
    expect(text).toContain(
      'view "Aster in spring" query=customer-orders bind.customer=C01 bind.from=2025-03-01 bind.until=2025-05-31 {'
    );
    const again = readAnalysisText(text, context);
    expect(again.diagnostics).toEqual([]);
    expect(
      again.views.map(({ name, queryId, bindings }) => ({
        name,
        queryId,
        bindings,
      }))
    ).toEqual(
      analysis.result.views.map(({ name, queryId, bindings }) => ({
        name,
        queryId,
        bindings,
      }))
    );
    // Unnamed charts get new IDs on each read, so compare the text.
    expect(exportAnalysisText(again.views, context).text).toBe(text);
  });
});

describe("project files", () => {
  it("keeps paths inside the folder", () => {
    expect(normalizeProjectPath("data\\orders.csv")).toBe("data/orders.csv");
    expect(normalizeProjectPath("./a/../b.csv")).toBe("b.csv");
    expect(normalizeProjectPath("../outside.csv")).toBeUndefined();
  });

  it("refuses writes outside the folder", async () => {
    const files = memoryProjectFiles();
    await expect(files.write("../escape.eda", "x")).rejects.toMatchObject({
      code: "refused",
    });
    await expect(files.write("/tmp/escape.eda", "x")).rejects.toMatchObject({
      code: "refused",
    });
  });

  it("parses CSV cells into values", () => {
    expect(parseCsv('﻿a,b,c\n1,"x, y",\ntrue,2025-01-01,0\n')).toEqual([
      { a: 1, b: "x, y", c: null },
      { a: true, b: "2025-01-01", c: 0 },
    ]);
  });
});
