import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { memoryProjectFiles } from "@/lib/project/files";
import { check, fields, reference, submitFeedback, writeEda } from "./tools";
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
});
