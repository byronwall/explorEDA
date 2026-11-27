import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { memoryProjectFiles, readProjectFolder } from "@/lib/project";
import { sourceUsage } from "./sourceUsage";

const SHOP = join(__dirname, "../../../examples/shop");

beforeAll(() => registerAllCharts());

async function shopFiles() {
  const files: Record<string, string> = {};
  for (const name of ["exploreda.eda", "orders.eda", "products.eda"]) {
    files[name] = readFileSync(join(SHOP, name), "utf8");
  }
  for (const name of readdirSync(join(SHOP, "data"))) {
    files[`data/${name}`] = readFileSync(join(SHOP, "data", name), "utf8");
  }
  return files;
}

async function usageOf(files: Record<string, string>) {
  const folder = await readProjectFolder(memoryProjectFiles(files));
  expect(folder.problems).toEqual([]);
  const views = folder.analyses.flatMap((analysis) =>
    analysis.result.views.map((view, index) => ({
      id: `${analysis.path}#${index}`,
      name: view.name,
      queryId: view.queryId,
      settings: view.settings,
    }))
  );
  return sourceUsage(folder.project, folder.tables, views);
}

it("lists the views that read each source their queries read", async () => {
  const usage = await usageOf(await shopFiles());
  // Overview's query reads orders and looks up their customers; "Aster in
  // spring" reads orders alone. Products' query reads items and looks up
  // their orders, products, and the orders' customers.
  expect(usage.get("orders")).toEqual([
    "orders.eda#0",
    "orders.eda#1",
    "products.eda#0",
  ]);
  expect(usage.get("customers")).toEqual(["orders.eda#0", "products.eda#0"]);
  expect(usage.get("items")).toEqual(["products.eda#0"]);
  expect(usage.get("products")).toEqual(["products.eda#0"]);
});

it("counts a view that names no field, such as a row count", async () => {
  const files = await shopFiles();
  files["count.eda"] =
    'eda query=order-lines\ndashboard "Count"\nmetric @count count title=Orders\n';
  const usage = await usageOf(files);
  expect(usage.get("orders")).toContain("count.eda#0");
  expect(usage.get("customers")).toContain("count.eda#0");
  expect(usage.get("items") ?? []).not.toContain("count.eda#0");
});

it("counts a source appended to another", async () => {
  const files = await shopFiles();
  files["data/more-orders.csv"] =
    "orderId,customerId,channel,orderedAt,amount\nO900,C01,Mail,2025-03-01,99\n";
  files["exploreda.eda"] +=
    '\nsource @more-orders path=data/more-orders.csv\n\nquery @all-orders "All orders" glyph=◇ {\n  source orders\n  append more-orders field=origin\n}\n';
  files["all.eda"] =
    'eda query=all-orders\ndashboard "All"\nrow orders.channel title=Channel\n';
  const usage = await usageOf(files);
  expect(usage.get("orders")).toContain("all.eda#0");
  expect(usage.get("more-orders")).toContain("all.eda#0");
});
