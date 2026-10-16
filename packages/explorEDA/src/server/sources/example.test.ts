// @vitest-environment node
import { cp, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerAllCharts } from "../../charts/registerAllCharts";
import { readProjectFolder } from "../../lib/project/folder";
import { nodeProjectFiles } from "../../node/projectFiles";
import { refreshSource } from "./refresh";

let root = "";

beforeAll(async () => {
  registerAllCharts();
  root = await mkdtemp(path.join(tmpdir(), "exploreda-example-"));
  await cp(path.resolve(__dirname, "../../../examples/database"), root, {
    recursive: true,
  });
});

afterAll(async () => {
  await rm(root, { recursive: true, force: true });
});

describe("the database example", () => {
  it("opens with every source waiting for its first read", async () => {
    const folder = await readProjectFolder(nodeProjectFiles(root));
    expect(folder.missingSources.sort()).toEqual([
      "customers",
      "orders",
      "returns",
    ]);
    expect(
      folder.problems
        .filter((problem) => problem.path === "exploreda.eda")
        .map((problem) => [problem.severity, problem.message])
    ).toEqual([
      ["warning", "orders hasn't been read from its database yet."],
      ["warning", "customers hasn't been read from its database yet."],
      ["warning", "returns hasn't been read from its database yet."],
    ]);
  });

  it("charts every analysis after its sources are read", async () => {
    for (const source of ["orders", "customers", "returns"]) {
      await refreshSource(source, { root });
    }
    const folder = await readProjectFolder(nodeProjectFiles(root));
    expect(folder.problems).toEqual([]);
    expect(folder.tables.orders).toHaveLength(80);
    expect(folder.tables.returns!.length).toBeGreaterThan(5);
    const returns = folder.project.sources.find(
      (item) => item.id === "returns"
    )!;
    expect(
      Object.fromEntries(returns.fields.map((field) => [field.id, field.type]))
    ).toMatchObject({
      refunded: "boolean",
      returnedAt: "date",
      amount: "number",
    });
    expect(
      folder.analyses.map((analysis) => analysis.result.diagnostics)
    ).toEqual([[], []]);
  });
});
