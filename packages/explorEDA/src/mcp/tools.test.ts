import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { memoryProjectFiles } from "@/lib/project/files";
import {
  check,
  deleteEda,
  describe as describeFiles,
  fields,
  readEda,
  reference,
  renameEda,
  submitFeedback,
  writeEda,
} from "./tools";
import { handleMcpMessage } from "./server";

const SHOP = path.resolve(__dirname, "../../examples/shop");

/** The shop example's files, in memory. */
function shop() {
  const files: Record<string, string> = {};
  const walk = (folder: string) => {
    for (const name of readdirSync(folder)) {
      const full = path.join(folder, name);
      if (statSync(full).isDirectory()) walk(full);
      else
        files[path.relative(SHOP, full).split(path.sep).join("/")] =
          readFileSync(full, "utf8");
    }
  };
  walk(SHOP);
  return memoryProjectFiles(files);
}

describe("MCP tools", () => {
  it("lists a query's fields as an analysis names them", async () => {
    const result = await fields(shop(), { query: "order-lines" });
    const names = result.queries[0]!.fields.map((field) => field.name);
    expect(names).toContain("orders.amount");
    expect(names).toContain("customer.region");
    expect(result.queries[0]!.rows).toBeGreaterThan(0);
  });

  it("checks text without saving, and reports a problem with its fix", async () => {
    const files = shop();
    const result = await check(files, {
      path: "returns.eda",
      text: "eda query=order-lines\nview Orders {\n  hist orders.amont\n}\n",
    });
    expect(result.complete).toBe(false);
    const problem = result.problems.find((item) => item.line === 3);
    expect(problem).toMatchObject({ path: "returns.eda", severity: "error" });
    expect(problem?.fix).toBeTruthy();
    expect(files.snapshot()["returns.eda"]).toBeUndefined();
  });

  it("saves an analysis and returns its built views", async () => {
    const files = shop();
    const result = await writeEda(files, {
      path: "returns.eda",
      text: "eda query=order-lines\nview Orders {\n  hist orders.amount\n  row orders.channel\n}\n",
    });
    expect(result).toMatchObject({
      saved: "returns.eda",
      complete: true,
      views: [{ name: "Orders", query: "order-lines", charts: 2 }],
      problems: [],
    });
    expect(files.snapshot()["returns.eda"]).toContain("hist orders.amount");
  });

  it("refuses a path outside the folder or not an analysis", async () => {
    await expect(
      writeEda(shop(), { path: "../x.eda", text: "" })
    ).rejects.toThrow(/outside the project/);
    await expect(
      writeEda(shop(), { path: "data/orders.csv", text: "" })
    ).rejects.toThrow(/isn't an analysis/);
  });

  it("names the chart types when a topic is unknown", () => {
    expect(reference({ topic: "hist" }).text).toBe(
      reference({ topic: "bar" }).text.replace("bar", "hist")
    );
    expect(() => reference({ topic: "pie-ish" })).toThrow(
      expect.objectContaining({ fix: expect.stringContaining("scatter") })
    );
  });

  it("saves feedback as one Markdown file under .exploreda/feedback", async () => {
    const files = shop();
    const { saved } = await submitFeedback(
      files,
      {
        kind: "confusing",
        summary: "No fix for a misspelled field",
        tool: "check",
        happened: "check said unknown field",
        proposedFix: "Suggest the nearest field name.",
      },
      new Date("2026-11-22T10:20:30Z")
    );
    expect(saved).toBe(
      ".exploreda/feedback/2026-11-22-10-20-30-no-fix-for-a-misspelled-field.md"
    );
    expect(files.snapshot()[saved]).toContain("## Proposed fix");
  });

  it("answers tools/call with the result, and a refusal as a tool error", async () => {
    const context = { files: shop(), version: "test" };
    const ok = (await handleMcpMessage(
      {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "reference", arguments: { topic: "project" } },
      },
      context
    )) as { result: { structuredContent: { text: string } } };
    expect(ok.result.structuredContent.text).toMatch(/^Project text/);
    const refused = (await handleMcpMessage(
      {
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: { name: "write_eda", arguments: { path: "x.csv", text: "" } },
      },
      context
    )) as { result: { isError: boolean; content: Array<{ text: string }> } };
    expect(refused.result.isError).toBe(true);
    expect(refused.result.content[0]!.text).toMatch(/fix: Name it/);
  });

  it("answers a failure it didn't expect as this call's tool error", async () => {
    const broken = {
      ...shop(),
      list: () => Promise.reject(new Error("disk gone")),
    };
    const reply = (await handleMcpMessage(
      {
        jsonrpc: "2.0",
        id: 7,
        method: "tools/call",
        params: { name: "fields", arguments: {} },
      },
      { files: broken, version: "test" }
    )) as {
      id: number;
      result: { isError: boolean; content: Array<{ text: string }> };
    };
    expect(reply.id).toBe(7);
    expect(reply.result).toMatchObject({ isError: true });
    expect(reply.result.content[0]!.text).toBe("disk gone");
  });

  it("refuses a write over an edit made since the read, and keeps the edit", async () => {
    const files = shop();
    await expect(
      writeEda(files, { path: "orders.eda", text: "eda query=order-lines\n" })
    ).rejects.toThrow(/needs the version/);
    const { version } = await readEda(files, { path: "orders.eda" });
    files.editOutside(
      "orders.eda",
      "eda query=order-lines\nrow orders.channel\n"
    );
    await expect(
      writeEda(files, {
        path: "orders.eda",
        text: "eda query=order-lines\n",
        version,
      })
    ).rejects.toThrow(/changed since you read it/);
    expect(files.snapshot()["orders.eda"]).toContain("row orders.channel");
    const fresh = await readEda(files, { path: "orders.eda" });
    const saved = await writeEda(files, {
      path: "orders.eda",
      text: `${fresh.text}hist orders.amount\n`,
      version: fresh.version,
    });
    expect(saved).toMatchObject({ saved: "orders.eda", complete: true });
  });

  it("writes a hidden project's first text in .exploreda, then charts it", async () => {
    const files = memoryProjectFiles({
      "data/sales.csv": "id,region,revenue\nA,East,3\nB,West,5\n",
    });
    const project = await writeEda(
      files,
      {
        path: "exploreda.eda",
        text: "source @sales key=id path=data/sales.csv\n",
      },
      { hidden: true }
    );
    expect(project.saved).toBe(".exploreda/project.eda");
    const analysis = await writeEda(files, {
      path: "sales.eda",
      text: "eda query=sales\nrow sales.region\n",
    });
    expect(analysis).toMatchObject({ complete: true, charts: 1 });
    expect(await readEda(files, { path: "exploreda.eda" })).toMatchObject({
      path: ".exploreda/project.eda",
    });
  });

  it("renames and deletes with the read version, never the project text", async () => {
    const files = shop();
    const { version } = await readEda(files, { path: "orders.eda" });
    await renameEda(files, {
      from: "orders.eda",
      to: "sales/orders.eda",
      version,
    });
    expect(Object.keys(files.snapshot())).toContain("sales/orders.eda");
    await expect(
      deleteEda(files, { path: "exploreda.eda", version })
    ).rejects.toThrow(/can't be deleted/);
    await deleteEda(files, { path: "sales/orders.eda", version });
    expect(files.snapshot()["sales/orders.eda"]).toBeUndefined();
  });

  it("describes each view's rows and charts", async () => {
    const { analyses } = await describeFiles(shop(), { path: "orders.eda" });
    expect(analyses[0]!.views[0]).toMatchObject({
      query: "order-lines",
      rows: 80,
    });
    expect(analyses[0]!.charts.length).toBeGreaterThan(0);
  });

  it("gives a fix for each problem the cold agent couldn't fix", async () => {
    const problems = async (body: string) =>
      (
        await check(shop(), {
          path: "x.eda",
          text: `eda query=order-lines\n${body}\n`,
        })
      ).problems;
    expect(await problems("hist @h orders.amount spec.upper=100")).toEqual([]);
    const [bins] = await problems(
      "hist @h orders.amount bins.mode=width bins.width=100"
    );
    expect(bins?.fix).toMatch(/needs bins.width, bins.origin, bins.first/);
    const [pivot] = await problems(
      "pivot @p rows=orders.channel {\n  value count\n}"
    );
    expect(pivot?.fix).toMatch(/value count\(orders.orderId\)/);
    const [calc] = await problems(
      'calc big = ["order.amount"] > 100\nview A {\n  row orders.channel\n}'
    );
    expect(calc).toMatchObject({ line: 2 });
    expect(calc?.fix).toMatch(/Did you mean orders.amount\?/);
  });

  it("explains why a shared line fails when views chart two queries", async () => {
    const { problems } = await check(shop(), {
      path: "mix.eda",
      text: "eda query=item-lines\ngroup @byCategory sum(items.revenue) by=product.category\nview Items {\n  row product.category group=byCategory\n}\nview Orders query=order-lines {\n  row orders.channel\n}\n",
    });
    expect(problems[0]?.fix).toMatch(/reach every view/);
  });
});
