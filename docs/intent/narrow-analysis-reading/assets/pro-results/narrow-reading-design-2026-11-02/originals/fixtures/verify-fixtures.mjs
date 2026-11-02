#!/usr/bin/env node
/**
 * Independent arithmetic oracle for the hand-authored reading fixture.
 * Run: node fixtures/verify-fixtures.mjs (from the deliverable directory).
 * Uses only Node built-ins. It does not import, render, or test explorEDA.
 * Raw inputs are deliberately limited to finite number literals, null, and
 * the invalid string "bad". This is not an implementation of valueParsing.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = async (name) => JSON.parse(await readFile(new URL(name, import.meta.url), "utf8"));
const rows = await read("orders.json");
const expected = await read("expected.json");
const orderFixture = await read("six-chart-order.json");
const keys = (items) => items.map((row) => row.order_id);
const isValid = (row) => typeof row.revenue === "number" && Number.isFinite(row.revenue);
const active = rows.filter((row) => row.active);
const east = active.filter((row) => row.region === "East");
const west = active.filter((row) => row.region === "West");
const web = active.filter((row) => row.channel === "Web");
const store = active.filter((row) => row.channel === "Store");
const eastWeb = east.filter((row) => row.channel === "Web");
const eastStore = east.filter((row) => row.channel === "Store");
const populations = {
  all: rows,
  active,
  inactive: rows.filter((row) => !row.active),
  eastActive: east,
  westActive: west,
  northActive: active.filter((row) => row.region === "North"),
  webActive: web,
  storeActive: store,
  eastWebActive: eastWeb,
  eastStoreActive: eastStore,
  westWebActive: west.filter((row) => row.channel === "Web"),
  invalidOnly: rows.filter((row) => row.order_id === "O08"),
  missingOnly: rows.filter((row) => row.order_id === "O04"),
  zeroOnly: rows.filter((row) => row.order_id === "O07"),
  empty: rows.filter((row) => row.channel === "Wholesale"),
};

function measure(items) {
  const valid = items.filter(isValid);
  const sum = valid.length ? valid.reduce((total, row) => total + row.revenue, 0) : null;
  return {
    sourceRowIds: items.map((row) => rows.indexOf(row)),
    orderIds: keys(items),
    count: items.length,
    validOrderIds: keys(valid),
    excludedOrderIds: keys(items.filter((row) => !isValid(row))),
    validCount: valid.length,
    numericState: !items.length ? "empty" : !valid.length ? "invalid" : "value",
    sum,
    mean: sum === null ? null : sum / valid.length,
  };
}

assert.equal(rows.length, 12);
assert.equal(new Set(keys(rows)).size, 12, "Every order has a distinct business key");
assert.deepEqual(Object.keys(populations), Object.keys(expected.populations));
for (const [name, items] of Object.entries(populations)) {
  assert.deepEqual(measure(items), expected.populations[name], name);
}
console.log(`[fixture] Checked ${Object.keys(populations).length} exact populations against orders.json.`);
console.log("[fixture] Source 12; active 10; East active 4; active Web 5; East + Web active 2.");

// Membership algebra for a linked dashboard. The product must separately
// prove that it applies these intended owner/exclusion rules.
const dashboard = expected.dashboard;
assert.equal(dashboard.initial.sourceCount, rows.length);
assert.equal(dashboard.initial.workspaceCount, active.length);
assert.equal(dashboard.regionEast.selectedCount, east.length);
assert.equal(dashboard.regionEast.webOnlyMetric.eligibleCount, eastWeb.length);
assert.equal(dashboard.regionEast.webOnlyMetric.mean, measure(eastWeb).mean);
const both = dashboard.regionEastAndChannelWeb;
assert.equal(both.selectedCount, eastWeb.length);
assert.equal(both.regionsChart.eligibleCount, web.length);
assert.equal(both.channelsChart.eligibleCount, east.length);
const evidenceSearch = eastWeb.filter((row) => row.order_id.includes("O03"));
assert.deepEqual(keys(evidenceSearch), both.tableSearchO03.orderIds);
assert.equal(evidenceSearch.length, both.tableSearchO03.matchingCount);
assert.equal(both.tableSearchO03.globalSelectedCountAfterSearch, eastWeb.length);

const notebook = expected.notebook;
assert.equal(notebook.initial.n, active.length);
assert.equal(notebook.initial["mean-revenue"], measure(active).mean);
assert.equal(notebook.initial["total-revenue"], measure(active).sum);
assert.equal(notebook.initial["channel-gap"], measure(web).mean - measure(store).mean);
assert.equal(notebook.regionEast.n, east.length);
assert.equal(notebook.regionEast.eligible, active.length);
assert.equal(notebook.regionEast["mean-revenue"], measure(east).mean);
assert.equal(notebook.regionEast["total-revenue"], measure(east).sum);
assert.equal(notebook.regionEast["channel-gap"], measure(eastWeb).mean - measure(eastStore).mean);
assert.equal(notebook.channelWebWhileRegionEast["channel-n"], web.length);
assert.equal(notebook.channelWebWhileRegionEast["channel-mean"], measure(web).mean);
const westEast = west.filter((row) => row.region === "East");
assert.equal(notebook.additionalWorkspaceRegionWest.regionSelectedCount, westEast.length);
assert.equal(notebook.additionalWorkspaceRegionWest.regionEligibleCount, west.length);
assert.equal(notebook.additionalWorkspaceRegionWest.channelSelectedCount, populations.westWebActive.length);
assert.equal(notebook.additionalWorkspaceRegionWest.chartlessAllCount, rows.length);
console.log("[fixture] Checked linked and local-selection population arithmetic; no UI state was exercised.");

// Two averages equal 200 but must retain different supporting populations.
const averageVariant = orderFixture.averageEvidenceVariant;
assert.equal(averageVariant.aggregation, "average");
assert.equal(averageVariant.localFilter, null);
assert.deepEqual(averageVariant.expectedAfterEastSelection, {
  candidateOrderIds: keys(east),
  includedOrderIds: keys(east.filter(isValid)),
  excludedOrderIds: keys(east.filter((row) => !isValid(row))),
  count: east.length,
  sum: measure(east).sum,
  mean: measure(east).mean,
  globalSelectedCount: east.length,
});
const localVariant = orderFixture.localFilterVariant;
assert.equal(localVariant.aggregation, "average");
assert.deepEqual(localVariant.localFilter, { channel: "Web" });
assert.deepEqual(localVariant.expectedAfterEastSelection, {
  candidateOrderIds: keys(eastWeb),
  count: eastWeb.length,
  mean: measure(eastWeb).mean,
  globalSelectedCount: east.length,
});
console.log("[fixture] Both averages are 200: unrestricted East uses four candidates; East/Web uses two.");

const comparisons = expected.comparisonAndFailureCases;
const percent = (part, whole) => `${(100 * part.length / whole.length).toFixed(1)}%`;
assert.equal(percent(east, active), comparisons.eastShareOfActive.formattedOneDigit);
assert.equal(percent(east, rows), comparisons.eastShareOfSource.formattedOneDigit);
const outside = east.filter((row) => !web.includes(row));
assert.deepEqual(keys(outside), comparisons.outsideShare.outsideOrderIds);
assert.ok(outside.length > 0, "A share is unavailable when its part is not contained in its whole");
assert.equal(measure(web).mean - measure(store).mean, comparisons.webMinusStoreActive.value);
assert.equal(measure(eastWeb).mean - measure(eastStore).mean, comparisons.webMinusStoreWithinEast.value);
assert.equal(measure(populations.empty).count, comparisons.emptyCount.value);
assert.equal(measure(populations.empty).numericState, comparisons.emptyAverage.unavailable);
assert.equal(measure(populations.invalidOnly).numericState, comparisons.invalidAverage.unavailable);
assert.equal(measure(populations.zeroOnly).mean, comparisons.zeroAverage.value);
console.log("[fixture] Checked exact revenue contributors, shares, differences, empty input, invalid input, and valid zero.");

// A demonstrable identity hazard, not a promise of persistent row identity.
const reversed = [...rows].reverse();
assert.equal(reversed.findIndex((row) => row.order_id === "O01"), 11);
assert.equal(reversed.findIndex((row) => row.order_id === "O03"), 9);
console.log("[fixture] Array replacement changes source-row indices; business keys remain O01 and O03.");
console.log("[not run] Notebook compilation, findings runtime, chart renderer, callbacks, keyboard/touch, focus, scroll, and all three browser widths.");
console.log("[not run] Missing-finding UI, revision invalidation, sheet persistence, and product share-error messages.");
