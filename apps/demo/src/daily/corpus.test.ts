import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { compileViews, DSL_CHART_KEYWORDS, readNotebookText } from "exploreda";
import { compileProjectText, evaluateAnalysisQuery } from "exploreda/analysis";
import { readTableText } from "exploreda/readers";
import { buildIndex, CHART_WORDS, describeText } from "../../dailyCorpus.mjs";
import { corpusLinks } from "../../dailyLinks.mjs";
import catalog from "../../public/daily-viz/catalog.json";
import datasets from "../../public/daily-viz/datasets.json";
import type { DailyCatalogEntry, DailyIndex } from "./corpus";
import { evaluateFinding, formatValue } from "./findings";

const root = path.resolve(__dirname, "../../public/daily-viz");
const read = (file: string) => readFileSync(path.join(root, file), "utf8");
const entries = catalog as DailyCatalogEntry[];

async function context(family: string) {
  const projectPath = `projects/${family}/exploreda.eda`;
  const compiled = compileProjectText(read(projectPath));
  expect(compiled.diagnostics).toEqual([]);
  const tables = Object.fromEntries(
    Object.entries(compiled.paths).map(([id, file]) => [
      id,
      readTableText(read(`projects/${family}/${file}`)).rows,
    ])
  );
  const rows = (query: string) =>
    evaluateAnalysisQuery(compiled.project, tables, query).rows.map(
      (row) => row.data
    );
  return { project: compiled.project, tables, rows };
}

const contexts = new Map<string, ReturnType<typeof context>>();
function project(family: string) {
  if (!contexts.has(family)) contexts.set(family, context(family));
  return contexts.get(family)!;
}

describe("daily visualization corpus", () => {
  let index: DailyIndex;
  beforeAll(async () => {
    index = (await buildIndex(root)) as DailyIndex;
  });

  it("rewrites relative links to site URLs", () => {
    expect(
      corpusLinks(
        "[Fields](fields.json) [Source](https://example.org/data)",
        "projects/co2/story.eda.md"
      )
    ).toBe(
      "[Fields](/daily-viz/projects/co2/fields.json) [Source](https://example.org/data)"
    );
  });

  it("formats findings the way the original calculations did", () => {
    expect(formatValue(-1242.94, ",.1f")).toBe("-1,242.9");
    expect(formatValue(122, ".0f")).toBe("122");
    expect(formatValue(0.911243, ".3f")).toBe("0.911");
    expect(formatValue(15.625, ".2f")).toBe("15.62");
    expect(formatValue(15.635, ".2f")).toBe("15.63");
  });

  it("gives every piece a unique id and slug, and a dataset record", () => {
    expect(new Set(entries.map((entry) => entry.id)).size).toBe(entries.length);
    expect(new Set(entries.map((entry) => entry.slug)).size).toBe(
      entries.length
    );
    const ids = new Set(datasets.map((dataset) => dataset.id));
    for (const entry of entries) expect(ids).toContain(entry.family);
  });

  it("knows every chart word the text language has", () => {
    const words = Object.keys(DSL_CHART_KEYWORDS).filter(
      (word) => word !== "histogram"
    );
    expect([...CHART_WORDS].sort()).toEqual(words.sort());
  });

  it("derives chart types, related pieces, and table sizes", () => {
    const signed = index.entries.find(
      (entry) => entry.id === "nb-ercot-signed-error"
    )!;
    expect(signed.charts).toEqual(
      expect.arrayContaining(["line", "hist", "ecdf", "table"])
    );
    expect(signed.related.length).toBeGreaterThan(0);
    expect(index.tables.ercot!.find((table) => table.id === "r")!.rows).toBe(
      1417
    );
    expect(
      describeText(
        'composition @c {\n  unit U {\n    waffle W x=a\n  }\n  legend "L"\n}'
      )
    ).toEqual({
      charts: ["composition"],
      marks: ["waffle"],
      features: ["legend"],
    });
  });

  it.each(entries)(
    "$id compiles with all local rows and no dropped charts",
    async (entry) => {
      const ctx = await project(entry.family);
      const text = read(`projects/${entry.family}/${entry.entry}`);
      if (entry.kind === "notebook") {
        const result = readNotebookText(text, ctx);
        expect(result.diagnostics).toEqual([]);
        expect(result.skippedCharts).toEqual([]);
        expect(result.settings.charts.length).toBeGreaterThan(0);
      } else {
        const rows = ctx.rows(entry.query);
        expect(rows.length).toBeGreaterThan(0);
        const result = compileViews(text, { rows });
        expect(result.diagnostics).toEqual([]);
        expect(result.skippedCharts).toEqual([]);
        expect(result.views[0]!.settings.charts.length).toBeGreaterThan(0);
      }
      if (entry.companion)
        expect(
          read(`projects/${entry.family}/${entry.companion}`)
        ).toBeTruthy();
    }
  );

  // Prose may quote a finding; a quoted number must be the computed one.
  it.each(entries)("$id findings match its local data", async (entry) => {
    const ctx = await project(entry.family);
    const prose = [entry.entry, entry.companion]
      .filter(Boolean)
      .map((file) => read(`projects/${entry.family}/${file}`))
      .join("\n");
    expect(entry.findings.length).toBeGreaterThan(0);
    for (const finding of entry.findings) {
      const { statement } = evaluateFinding(
        finding,
        ctx.rows(finding.query ?? entry.query)
      );
      const lead = finding.text.slice(0, finding.text.indexOf("{value}"));
      if (lead.length > 12 && prose.includes(lead))
        expect(prose).toContain(statement);
    }
  });
});
