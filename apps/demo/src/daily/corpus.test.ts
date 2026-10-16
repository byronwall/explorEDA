import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compileViews, readNotebookText } from "exploreda";
import { compileProjectText, evaluateAnalysisQuery } from "exploreda/analysis";
import { readTableText } from "exploreda/readers";
import { articleLinks } from "./corpus";
import catalog from "../../public/daily-viz/catalog.json";

const root = path.resolve(__dirname, "../../public/daily-viz");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");

async function context(projectPath: string) {
  const compiled = compileProjectText(read(projectPath));
  expect(compiled.diagnostics).toEqual([]);
  const tables = Object.fromEntries(
    await Promise.all(
      Object.entries(compiled.paths).map(async ([id, file]) => [
        id,
        (await readTableText(read(path.join(path.dirname(projectPath), file))))
          .rows,
      ])
    )
  );
  return { project: compiled.project, tables };
}

const contexts = new Map<string, ReturnType<typeof context>>();
function project(file: string) {
  if (!contexts.has(file)) contexts.set(file, context(file));
  return contexts.get(file)!;
}

describe("daily visualization corpus", () => {
  it("keeps evidence links inside the source folder", () => {
    expect(
      articleLinks(
        "[Evidence](../../evidence/test.json) [Source](https://example.org/data)",
        "projects/co2/story.eda.md"
      )
    ).toBe(
      "[Evidence](/daily-viz/evidence/test.json) [Source](https://example.org/data)"
    );
  });
  it("contains the promised distinct pieces and valid release order", () => {
    expect(new Set(catalog.map((item) => item.id)).size).toBe(75);
    expect(catalog.filter((item) => item.kind === "notebook")).toHaveLength(40);
    expect(catalog.filter((item) => item.kind === "composition")).toHaveLength(
      25
    );
    expect(catalog.filter((item) => item.kind === "dashboard")).toHaveLength(
      10
    );
    expect(
      catalog.map((item) => item.release_order).sort((a, b) => a - b)
    ).toEqual(Array.from({ length: 75 }, (_, i) => i + 1));
  });
  it.each(catalog)(
    "$id compiles with all local rows and no dropped charts",
    async (entry) => {
      const ctx = await project(entry.project_path);
      const text = read(entry.entry_path);
      if (entry.kind === "notebook") {
        const result = readNotebookText(text, ctx);
        expect(result.diagnostics).toEqual([]);
        expect(result.skippedCharts).toEqual([]);
        expect(result.settings.charts).toHaveLength(5);
      } else {
        const rows = evaluateAnalysisQuery(
          ctx.project,
          ctx.tables,
          entry.query_id
        ).rows.map((row) => row.data);
        expect(rows.length).toBeGreaterThan(0);
        const result = compileViews(text, { rows });
        expect(result.diagnostics).toEqual([]);
        expect(result.skippedCharts).toEqual([]);
        expect(result.views[0]!.settings.charts).toHaveLength(
          entry.kind === "composition" ? 1 : 8
        );
      }
    }
  );
});
