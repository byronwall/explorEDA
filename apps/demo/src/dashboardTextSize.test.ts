import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, it } from "vitest";
import { exportDocument, exportViews } from "exploreda";
import { evaluateAnalysisQuery } from "exploreda/analysis";
import { parseCsvData } from "./csvParser";
import { examples } from "./demos/examples";

/**
 * Dashboard text is written for people to review, so its size is a product
 * measure. These budgets only go down: when a change makes the examples'
 * text shorter, lower them to the new totals.
 */
const BUDGET = { lines: 1926, pairs: 2577 };
/** The same, for every file example's views written as one text. */
const VIEWS_BUDGET = { lines: 141, pairs: 102 };

/** Space-separated tokens outside quotes. */
function tokens(line: string) {
  return line.match(/(?:[^\s"]|"(?:\\.|[^"\\])*")+/g) ?? [];
}

async function exportAll() {
  const texts: string[] = [];
  for (const example of examples) {
    const views = [
      ...(example.savedData
        ? [{ name: example.title, savedData: example.savedData }]
        : []),
      ...(example.views ?? []),
    ];
    for (const view of views) {
      const rows =
        example.project && example.tables
          ? evaluateAnalysisQuery(
              example.project,
              example.tables,
              ("queryId" in view && view.queryId) ||
                example.project.queries[0]!.id,
              ("bindings" in view && view.bindings) || {}
            ).rows.map((row) => row.data)
          : await parseCsvData(
              readFileSync(join(__dirname, "../public", example.data), "utf8")
            );
      texts.push(exportDocument(view.savedData, { rows }).text);
    }
  }
  return texts;
}

it("keeps the examples' dashboard text within its size budget", async () => {
  const texts = await exportAll();
  const lines = texts.flatMap((text) =>
    text.split("\n").filter((line) => line.trim())
  );
  const pairs = lines.flatMap(tokens).filter((token) => /=/.test(token));
  const size = { lines: lines.length, pairs: pairs.length };
  // DUMP=<file> writes every example's text, to see what remains.
  if (process.env.DUMP) {
    writeFileSync(process.env.DUMP, texts.join("\n=====\n"));
  }
  expect(size.lines).toBeLessThanOrEqual(BUDGET.lines);
  expect(size.pairs).toBeLessThanOrEqual(BUDGET.pairs);
});

it("keeps the examples' multi-view text within its size budget", async () => {
  const texts: string[] = [];
  for (const example of examples) {
    if (example.project || !example.savedData || !example.views?.length) {
      continue;
    }
    const rows = await parseCsvData(
      readFileSync(join(__dirname, "../public", example.data), "utf8")
    );
    texts.push(
      exportViews(
        [
          { name: example.title, settings: example.savedData },
          ...example.views.map((view) => ({
            name: view.name,
            settings: view.savedData,
          })),
        ],
        { rows }
      ).text
    );
  }
  const lines = texts.flatMap((text) =>
    text.split("\n").filter((line) => line.trim())
  );
  const pairs = lines.flatMap(tokens).filter((token) => /=/.test(token));
  expect(lines.length).toBeLessThanOrEqual(VIEWS_BUDGET.lines);
  expect(pairs.length).toBeLessThanOrEqual(VIEWS_BUDGET.pairs);
});
