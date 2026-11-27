import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, expect, it } from "vitest";
import { registerAllCharts } from "@/charts/registerAllCharts";
import { memoryProjectFiles, readProjectFolder } from "@/lib/project";
import { sourceUsage } from "./sourceUsage";

const SHOP = join(__dirname, "../../../examples/shop");

beforeAll(() => registerAllCharts());

it("lists the views that read each source through their queries' lookups", async () => {
  const files: Record<string, string> = {};
  for (const name of ["exploreda.eda", "orders.eda", "products.eda"]) {
    files[name] = readFileSync(join(SHOP, name), "utf8");
  }
  for (const name of readdirSync(join(SHOP, "data"))) {
    files[`data/${name}`] = readFileSync(join(SHOP, "data", name), "utf8");
  }
  const folder = await readProjectFolder(memoryProjectFiles(files));
  const views = folder.analyses.flatMap((analysis) =>
    analysis.result.views.map((view, index) => ({
      id: `${analysis.path}#${index}`,
      name: view.name,
      queryId: view.queryId,
      settings: view.settings,
    }))
  );
  const usage = sourceUsage(folder.project, folder.tables, views);
  // Overview charts orders and their customers' regions; "Aster in spring"
  // filters by a customer but charts only order fields.
  expect(usage.get("orders")).toEqual(["orders.eda#0", "orders.eda#1"]);
  expect(usage.get("customers")).toEqual(["orders.eda#0"]);
  // Products reads items and their products, not the orders they link to.
  expect(usage.get("items")).toEqual(["products.eda#0"]);
  expect(usage.get("products")).toEqual(["products.eda#0"]);
});
