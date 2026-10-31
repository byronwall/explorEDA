/**
 * Run: node verify-fixtures.mjs
 * Verifies the standalone oracle and fixture arithmetic. It does not run explorEDA,
 * parse formulas, test a worker/browser, or prove saved-state integration.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { decodeFixtureValue, evaluateTextFunction } from "./reference-text-functions.mjs";

const fixtures = JSON.parse(await readFile(new URL("./fixtures.json", import.meta.url), "utf8"));
const project = JSON.parse(await readFile(new URL("./project-fixture.json", import.meta.url), "utf8"));
let checks = 0;
function equal(actual, expected, label) {
  try {
    assert.deepStrictEqual(actual, expected);
  } catch (error) {
    console.error(`[FAIL] ${label}`);
    throw error;
  }
  checks += 1;
}
const points = (text) => Array.from(text, (character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`);
const sorted = (ids) => [...ids].sort();

equal(new Set(fixtures.primitiveCases.map((item) => item.id)).size, fixtures.primitiveCases.length, "unique primitive IDs");
for (const item of fixtures.primitiveCases) {
  const args = item.args.map(decodeFixtureValue);
  const actual = evaluateTextFunction(item.function, args);
  equal(actual, item.expected, item.id);
  if (item.resultCodePoints) equal(points(actual.value), item.resultCodePoints, `${item.id}: result code points`);
}
console.log(`[PASS] ${fixtures.primitiveCases.length} literal expected-value/error cases`);

function dependencyError(field, upstream) {
  return {
    success: false,
    value: null,
    errorCode: "DEPENDENCY_ERROR",
    error: `Dependency "${field}" failed: ${upstream.error}`,
  };
}

// Explicitly the three fixture operations, not an expression-language interpreter.
function prepare(rows) {
  return rows.map((row) => {
    const cleanCode = evaluateTextFunction("textTrim", [row.code]);
    const component = cleanCode.success
      ? evaluateTextFunction("textPart", [cleanCode.value, "-", 1])
      : dependencyError("cleanCode", cleanCode);
    const label = component.success
      ? evaluateTextFunction("textConcat", [row.site, " · ", component.value])
      : dependencyError("component", component);
    return { id: row.id, cleanCode, component, label };
  });
}

function review(rows, prepared, field, compare) {
  const result = { total: rows.length, changed: [], unchanged: [], produced: [], missing: [], errors: [], empty: [], presentCount: 0, distinctPresentCount: 0 };
  const distinct = new Set();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const outcome = prepared[index][field];
    if (!outcome.success) {
      result.errors.push(row.id);
      continue;
    }
    if (outcome.value === null) {
      result.missing.push(row.id);
      continue;
    }
    result.presentCount += 1;
    distinct.add(outcome.value);
    if (outcome.value === "") result.empty.push(row.id);
    if (!compare) {
      result.produced.push(row.id);
      continue;
    }
    const before = compare(row, prepared[index]);
    result[outcome.value === before ? "unchanged" : "changed"].push(row.id);
  }
  result.distinctPresentCount = distinct.size;
  return result;
}

function matchReview(actual, expected, label) {
  for (const [key, value] of Object.entries(expected)) {
    if (key === "distinctEligibleInputTextCount") continue;
    if (Array.isArray(value)) equal(sorted(actual[key]), sorted(value), `${label}.${key}`);
    else equal(actual[key], value, `${label}.${key}`);
  }
  const present = actual.produced.length || actual.changed.length + actual.unchanged.length;
  equal(present + actual.missing.length + actual.errors.length, actual.total, `${label}: complete disjoint partition`);
}

function outputGroups(rows, prepared) {
  const groups = new Map();
  for (let index = 0; index < rows.length; index += 1) {
    const result = prepared[index].cleanCode;
    if (!result.success || result.value === null) continue;
    const group = groups.get(result.value) ?? { value: result.value, ids: [] };
    group.ids.push(rows[index].id);
    groups.set(result.value, group);
  }
  return [...groups.values()];
}

function collisions(rows, prepared) {
  return outputGroups(rows, prepared).flatMap((group) => {
    const memberRows = group.ids.map((id) => rows.find((row) => row.id === id));
    const distinctInputs = [...new Set(memberRows.map((row) => row.code))];
    if (distinctInputs.length < 2) return [];
    return [{ output: group.value, distinctInputs, ids: group.ids, changedIds: memberRows.filter((row) => row.code !== group.value).map((row) => row.id) }];
  });
}

const workflow = fixtures.workflow;
const untouched = JSON.stringify(workflow.rows);
const prepared = prepare(workflow.rows);
equal(prepared, workflow.expectedRows, "18-row workflow outcomes");
for (const field of ["cleanCode", "component", "label"]) {
  const compare = field === "cleanCode" ? (row) => row.code : field === "component" ? (_, result) => result.cleanCode.value : undefined;
  matchReview(review(workflow.rows, prepared, field, compare), workflow.expectedReview[field], `workflow.${field}`);
}
equal(new Set(workflow.rows.filter((row) => typeof row.code === "string").map((row) => row.code)).size, workflow.expectedReview.cleanCode.distinctEligibleInputTextCount, "eligible input text categories");
equal(outputGroups(workflow.rows, prepared), workflow.cleanCodeOutputGroups, "clean groups including empty text");
equal(collisions(workflow.rows, prepared), workflow.cleanCodeCollisions, "collisions include unchanged members");
const scopeIds = workflow.rows.filter((row) => row.site === "North").map((row) => row.id);
equal(scopeIds, workflow.chartFilterExample.visibleIds, "chart filter membership");
equal(prepared.length, workflow.chartFilterExample.reviewStillUses, "review scope independent from chart filter");

const reordered = workflow.reorderIds.map((id) => workflow.rows.find((row) => row.id === id));
const byId = (rows) => [...rows].sort((left, right) => left.id.localeCompare(right.id));
equal(byId(prepare(reordered)), byId(prepared), "reorder preserves semantic outcomes by fixture ID");
equal(prepare(reordered).map((row) => row.id), workflow.reorderIds, "reorder display order");

const refresh = workflow.refresh;
const refreshedRows = workflow.rows.filter((row) => !refresh.removeIds.includes(row.id)).map((row) => ({ ...row, ...refresh.changes.find((change) => change.id === row.id)?.set })).concat(refresh.append);
const refreshed = prepare(refreshedRows);
matchReview(review(refreshedRows, refreshed, "cleanCode", (row) => row.code), refresh.expectedCleanReview, "refresh.cleanCode");
equal(new Set(refreshedRows.filter((row) => typeof row.code === "string").map((row) => row.code)).size, refresh.expectedCleanReview.distinctEligibleInputTextCount, "refresh eligible input categories");
for (const [field, expected] of [["component", refresh.expectedComponentCounts], ["label", refresh.expectedLabelCounts]]) {
  const actual = review(refreshedRows, refreshed, field);
  equal(actual.presentCount, expected.present, `refresh.${field}.present`);
  equal(actual.missing.length, expected.missing, `refresh.${field}.missing`);
  equal(actual.errors.length, expected.errors, `refresh.${field}.errors`);
  if (expected.distinctPresent !== undefined) equal(actual.distinctPresentCount, expected.distinctPresent, `refresh.${field}.distinct`);
}
equal(collisions(refreshedRows, refreshed), refresh.expectedCleanCollisions, "refresh collisions");
equal(JSON.stringify(workflow.rows), untouched, "original workflow records unmodified");
console.log("[PASS] Workflow partitions, collisions, grouping, reorder, refresh, source preservation");

const composed = fixtures.compositionCollision;
for (const row of composed.rows) equal(evaluateTextFunction("textConcat", [row.a, row.b]), { success: true, value: composed.expected.value }, `tuple collision ${row.id}`);
equal(new Set(composed.rows.map((row) => JSON.stringify([row.a, row.b]))).size, composed.expected.distinctInputTupleCount, "structural input tuple count");

for (const row of project.sourceTables.records) {
  const expected = project.expected.prepared.rows.find((item) => item.recordId === row.id);
  const clean = evaluateTextFunction("textTrim", [row.code]);
  const label = clean.success ? evaluateTextFunction("textConcat", ["Code ", clean.value]) : dependencyError("clean", clean);
  equal(clean, expected.cleanOutcome.logicalResult, `project ${row.id}: clean oracle`);
  equal(label, expected.labelOutcome.logicalResult, `project ${row.id}: label oracle`);
  equal(row, expected.rawSourceRecord, `project ${row.id}: original evidence`);
  equal(expected.key, `records:string:${row.id}`, `project ${row.id}: stated baseline key convention`);
}
for (const query of project.project.queries) {
  const steps = new Set();
  for (const step of query.steps) {
    if (step.inputStepId) equal(steps.has(step.inputStepId), true, `project ${query.id}: step reference ${step.id}`);
    steps.add(step.id);
  }
  equal(steps.has(query.outputStepId), true, `project ${query.id}: output reference`);
}
console.log("[PASS] Six-row project oracle results and fixture structure (not project execution)");
console.log(`[PASS] ${checks} assertions; Node ${process.version}; ICU ${process.versions.icu}; Unicode ${process.versions.unicode}`);
console.log(`[NOT RUN] ${fixtures.engineIntegrationCases.length} expression-engine integration cases; ${fixtures.missingReasonCases.length} missing-reason metadata cases; static project validation cases; real parser, worker, persistence, notebook, chart, and browser tests`);
