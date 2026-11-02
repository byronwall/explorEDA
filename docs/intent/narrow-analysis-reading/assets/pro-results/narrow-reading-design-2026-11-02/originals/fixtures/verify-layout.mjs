#!/usr/bin/env node
/**
 * Executes the actual baseline pure layout module, not a rewritten algorithm.
 * Node 24+: node fixtures/verify-layout.mjs /absolute/path/to/chartGridPlacement.ts
 * The TS module's only import is type-only; Node strips it without dependencies.
 * Does not execute react-grid-layout, React, the DOM, or the proposed reader.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const sourcePath = process.argv[2];
if (!sourcePath) {
  console.error("Usage: node fixtures/verify-layout.mjs /absolute/path/to/chartGridPlacement.ts");
  process.exit(2);
}
const fixture = JSON.parse(await readFile(new URL("six-chart-order.json", import.meta.url), "utf8"));
const { NARROW_GRID_WIDTH, narrowColumnCount, flowTwoColumns } = await import(pathToFileURL(resolve(sourcePath)).href);
const before = JSON.stringify(fixture.storedChartArray);
assert.equal(NARROW_GRID_WIDTH, 960);
for (const [width, expected] of [[390, 1], [639, 1], [640, 2], [783, 2], [959, 2]]) {
  assert.equal(narrowColumnCount(width), expected, `column count at ${width}`);
}
assert.deepEqual(Object.fromEntries(flowTwoColumns(fixture.storedChartArray, fixture.columnCount)), fixture.expectedBaselineTwoColumnPlacement);
assert.equal(JSON.stringify(fixture.storedChartArray), before, "Pure flow must not mutate source layouts");
console.log("[baseline] Executed narrowColumnCount and flowTwoColumns from the supplied source file.");
console.log("[baseline] Threshold 960; 390/639 → 1 column; 640/783/959 → 2 columns; six exact placements match.");
console.log("[baseline] Input chart array and saved geometry unchanged by flowTwoColumns.");
console.log("[not run] React grid compaction, DOM/focus order, pixel layout, saved-state callbacks, or proposed reader.");
