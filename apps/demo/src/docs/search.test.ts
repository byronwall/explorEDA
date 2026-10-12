import { describe, expect, it } from "vitest";
import { catalogue } from "./catalogue";
import { CHART_QUESTIONS } from "./chooser";
import { plainText, searchDocs, sectionsOf } from "./search";
import { loadSearchEntries } from "./searchIndex";

describe("docs search", () => {
  it("reads the words a page shows, not its markup", () => {
    expect(
      plainText(
        [
          'import X from "./x";',
          "Drag **across** the `bins`, see [Filters](/docs/filters).",
          '<LiveExample id="bar" caption="Delivery days in numeric bins." />',
          '<Callout title="Grouped summaries differ.">',
          "  Body text stays.",
          "</Callout>",
          "Press <kbd>F</kbd>.",
        ].join("\n")
      )
    ).toBe(
      "Drag across the bins , see Filters. Delivery days in numeric bins. Grouped summaries differ. Body text stays. Press F ."
    );
  });

  it("gives each section the anchor its heading renders with", () => {
    const sections = sectionsOf(
      "bar",
      "Bar chart",
      "Intro.\n\n## Selection and row scope\n\nRows.\n\n### Grouped, stacked\n\nSeries.\n\n```md\n## Not a heading\n```\n"
    );
    expect(sections.map(({ anchor, text }) => [anchor, text])).toEqual([
      ["selection-and-row-scope", "Rows."],
      ["grouped-stacked", "Series."],
    ]);
  });

  it("ranks an exact title first and needs every word", async () => {
    const entries = await loadSearchEntries();
    expect(searchDocs(entries, "bar chart")[0]?.entry).toMatchObject({
      kind: "page",
      topic: "bar",
    });
    expect(searchDocs(entries, "binCount")[0]?.entry).toMatchObject({
      kind: "setting",
      topic: "bar",
      anchor: "setting-binCount",
    });
    expect(searchDocs(entries, "filter")[0]?.entry).toMatchObject({
      kind: "page",
      topic: "filters",
    });
    expect(searchDocs(entries, "binCount zebra")).toEqual([]);
  });

  it("indexes every page, and each shared setting once", async () => {
    const entries = await loadSearchEntries();
    const pages = entries.filter(({ kind }) => kind === "page");
    expect(pages).toHaveLength(catalogue.length);
    const titles = entries
      .filter(
        ({ kind, context }) => kind === "setting" && context === "Every chart"
      )
      .map(({ title }) => title);
    expect(new Set(titles).size).toBe(titles.length);
    expect(titles).toContain("title");
  });

  it("finds a section by words in its text, with a snippet", async () => {
    const hit = searchDocs(await loadSearchEntries(), "snapped range").find(
      ({ entry }) => entry.kind === "section"
    );
    expect(hit?.snippet).toMatch(/snapped range/);
  });
});

describe("chart chooser", () => {
  it("only recommends chart types that have a page", () => {
    const documented = new Set(catalogue.map((page) => page.chartType));
    for (const question of CHART_QUESTIONS) {
      for (const [chartType] of question.picks) {
        expect(documented, `${question.id}: ${chartType}`).toContain(chartType);
      }
    }
  });
});
