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

it("lists the views that read each source through their queries' lookups", async () => {
  const usage = await usageOf(await shopFiles());
  // Overview charts orders and their customers' regions; "Aster in spring"
  // filters by a customer but charts only order fields.
  expect(usage.get("orders")).toEqual(["orders.eda#0", "orders.eda#1"]);
  expect(usage.get("customers")).toEqual(["orders.eda#0"]);
  // Products reads items and their products, not the orders they link to.
  expect(usage.get("items")).toEqual(["products.eda#0"]);
  expect(usage.get("products")).toEqual(["products.eda#0"]);
});

it("follows a calculation to its own inputs, not its query's other lookups", async () => {
  const files = await shopFiles();
  files["exploreda.eda"] = files["exploreda.eda"]!.replace(
    "  lookup product via=item-product\n",
    '  lookup product via=item-product\n  calc doubled "Doubled" = ["items.quantity"] * 2\n'
  );
  files["doubled.eda"] =
    'eda query=item-lines\ndashboard "Doubled"\nhist doubled title=Doubled\n';
  const usage = await usageOf(files);
  expect(usage.get("items")).toContain("doubled.eda#0");
  for (const other of ["orders", "products", "customers"]) {
    expect(usage.get(other) ?? []).not.toContain("doubled.eda#0");
  }
});

it("counts a Summary Table as reading every source of its query", async () => {
  const files = await shopFiles();
  files["fields.eda"] =
    'eda query=order-lines\ndashboard "Fields"\nsummary @fields title=Fields\n';
  const usage = await usageOf(files);
  expect(usage.get("orders")).toContain("fields.eda#0");
  expect(usage.get("customers")).toContain("fields.eda#0");
  expect(usage.get("items") ?? []).not.toContain("fields.eda#0");
});
