---
title: "Rank a measure in horizontal bars — implementation plan"
slug: "horizontal-metric-bars"
phase: plan
status: draft
last_updated: "2026-10-10"
---

# Rank a measure in horizontal bars — implementation plan

## Plan at a glance

Prove the numbers first, then the stability rules, then inspection, then authoring.

1. The row chart draws a grouped summary and matches its vertical twin on the shop example.
2. Top N, signed values, and pooled averages hold up on Beijing's signed station average.
3. Hover, Alt-click trace, and selection explain each ranked value.
4. The settings panel and dashboard text create the ranking, the demo shows it, and it ships.

The main pushback is on mechanics, not scope. The row chart should not compute measures itself. It reads `getAggregateResult` twice: once for live rows, for values, and once for all rows, for order and context. One new helper pools Other's rows through `summarizeGroup`. Count mode is a mapping onto the same ranked-row shape, so there is one renderer path and today's count output stays identical.

Every milestone leaves a working chart. Existing row charts never change unless a saved chart sets `aggregateId` or `topN`. Before M4, a ranking can be made only in dashboard text, which is enough to prove M1–M3 in the demo.

## Implementation strategy

- **First proof:** `row Region aggregateId=revenue-by-region` in the shop example, beside `hist Revenue aggregateId=revenue-by-region`, with matching values.
- **Primary seam:** a pure ranking planner in `RowChart/rowChartPlan.ts` that takes count columns or aggregate results and returns ranked rows, Other, and a domain. The renderer only draws.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/RowChart src/lib/aggregates` plus `pnpm --filter demo dev --port 5291 --strictPort` with the dashboard text panel.
- **Oracles:** hand totals in fixtures, `planBarChart` output for the same summary, and the vertical bars already in the shop and Beijing examples.
- **Rollout and rollback:** additive optional settings. Unsetting `aggregateId` returns a chart to counting; unsetting `topN` returns to fit-to-height. No flag is needed.

## Milestone 1: Shop revenue ranking matches its vertical twin

This proves the core contract: same summary, same values, held order. It excludes Top N, negative values, trace changes, and settings UI.

- **Change — settings and persistence**
  - Add `aggregateId?: string` to `RowChartSettings` in `types/ChartTypes.ts`.
  - Accept it in the `row` case of `isChart` in `utils/saveDataUtils.ts`. The existing chart-to-summary reference check already covers every type.
  - Add `aggregateId` to the `row` list in `lib/dsl/settingKeys.ts`; the compiler's reference warning is already generic.
  - Verify: save → restore round-trip test in `RowChart.test.tsx`.
- **Change — pool helper in `lib/aggregates.ts`**
  - `poolAggregateRows(rows, spec)` rebuilds input rows from the members' contributors and runs `summarizeGroup`. Sums add, averages re-average over all member rows, and once-per IDs count once across members.
  - Verify: unit tests for a pooled average against a hand average, and a shared ID across two groups.
- **Change — ranking planner in `rowChartPlan.ts`**
  - Input: ranked items from either count columns or `{ live, all }` aggregate results. Output: rows with `current`, `context`, `label`, and `sourceIds`, plus Other and a domain.
  - Order comes from all-row values, largest first. Other is pooled for summaries and summed for counts.
  - Verify: a four-category fixture equals hand totals and `planBarChart` rows. The existing count output is unchanged, pinned by a test written before the refactor.
- **Change — `RowChart.tsx` draws measures**
  - With `aggregateId`, call `getAggregateResult(id, liveIds)` and the all-rows result, memoized so filter changes don't recompute it. Draw value bars over context bars. Format labels with the measure field's display format, and default the x label to the measure.
  - Facets keep today's rule: shared all-row order and no context bars.
  - Verify: a `RowChart.test.tsx` case where filtering another field changes values but not order.

### Desired end state

- In the demo, the shop ranking shows the same four region revenues as the vertical bar, in revenue order.
- Brushing Category shrinks bars over faint unfiltered bars, and the order stays put.
- Saved row charts without `aggregateId` render pixel-identically, and their tests still pass.

## Milestone 2: Fixed membership and signed averages

This adds the two stability rules and signed values, using Beijing's `above-reference` (an average with negative stations) as the oracle.

- **Change — `topN` setting**
  - Add `topN?: number` (a positive integer) to the type, save validation, and `settingKeys`.
  - The planner uses `topN` when set and the height fit when unset, for both count and measure rows.
  - Rows compress when `topN` exceeds what fits at `minRowHeight`, and membership never changes. See the open decision on the height floor.
  - Verify: the existing Resize harness in `RowChart.test.tsx` keeps Other's members identical at 160px and 800px with `topN` set, and still changes them without it.
- **Change — signed domain**
  - The domain spans `min(0, low)` to `max(0, high)` through `boundedDomain`. Bars start at `xScale(0)` with a zero rule, and value labels sit outside each bar's end.
  - Rows rank by signed value. Unavailable rows show "Unavailable" with no bar, below the valued rows; Other is always last.
  - Verify: planner tests with mixed signs and unavailable values; a Beijing browser check with `topN=5`.
- **Spike — context for averages**
  - Decision required: draw an average's unfiltered context as a faint bar or a tick.
  - Evidence to gather: screenshots of Beijing filtered by a season where filtered averages exceed unfiltered ones, compared both ways.
  - Fallback: a tick for averages, and faint bars for counts and sums.

### Desired end state

- With Beijing ranked at `topN=5`, stations below the reference extend left of zero, and Other shows the pooled average of its rows, matching a hand calculation.
- Resizing never changes membership when `topN` is set.
- The context decision is recorded in the initiative map.

## Milestone 3: Ranked values explain themselves

This makes each value inspectable to the same standard as vertical bars.

- **Change — readout:** shows the summary name, current value, unfiltered value, and contributing row count. Count mode keeps "Rows n of m · Share".
- **Change — trace:** `RowTrace` carries aggregate rows when a summary is set. `RowTraceBody` renders `AggregateContributorTable` with included and excluded contributors and their reasons. Other lists members and their pooled contributors.
- **Change — summary-aware surfaces:** extend the `settings.type === "bar" && settings.aggregateId` checks in `ChartSettingsContent.tsx` and `FiltersSettingsTab.tsx` to row charts where they describe the summary.
- **Verify:** `RowChart.test.tsx` covers Alt-click on a region and on Other showing the right contributors and exclusions. Clicking a region and Other still writes the same value filter as today.

### Desired end state

- Alt-click on West lists exactly the rows behind West's revenue, with excluded rows and reasons.
- Selection and clearing behave as they do for count rows.

## Milestone 4: Create it from settings and text, then ship

- **Change — `RowChartSettingsPanel.tsx`**
  - A Measure select offers Count rows, the summaries whose `groupField` is this field, and Create Sum or Average of a numeric field, following `createAggregate` in `BarChartSettingsPanel.tsx`. Extract a shared helper only if the copy is non-trivial.
  - Add a Top N input. Give both controls `ActionTooltip` help, such as "Show the N largest categories; the rest go in Other. Leave empty to fit the chart's height."
  - Changing Data Field clears `aggregateId` and returns the chart to Count rows.
- **Change — dashboard text**
  - Add a compile warning when the summary's `groupField` differs from the row field. The chart itself says why it is empty.
  - Export round-trip tests in `lib/dsl/export.test.ts` and `compile.test.tsx` for `row Region aggregateId=… topN=…`.
- **Change — demo and docs**
  - Add the shop ranking to an existing view where it answers a question, and update the row chart entry in chart docs.
  - Run `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts`.
- **Change — release:** `pnpm changeset:add minor "Row charts can rank a grouped summary (count, sum, or average) with a fixed Top N and signed values."`, then `pnpm check`.

### Desired end state

- A user creates Sum of Revenue by Region from the row chart's settings without touching text, and the result round-trips through dashboard text.
- The flow has been checked in the browser at wide, intermediate, and narrow widths, with screenshots attached to the PR.

## Cross-cutting verification

- Performance: on `shop-10000`, brushing with a measure ranking open should feel the same as with a count ranking. The all-rows summary must not recompute per filter change.

## Open decisions and spikes

- **Average context** — decided in M2. Averages mark their all-row value with a tick, because a faint bar hides behind any filtered value above it (Beijing in Winter: Wanshouxigong 12.2 against 4.8). Counts and sums keep the faint bar, and switch to a tick only when it would be hidden.
- **Top N below the height floor** — decided in M2. Rows compress to 12px. A chart too short for that shows as many top categories as fit and says "Top N needs a taller chart" in the status line. Membership never changes at any size where Top N fits.

## Below the cut line

- Composition-mode horizontal measure rows.
- A "show as rows" switch from a vertical grouped-summary bar.
- Series or stacked rows, until the expansion trigger fires.
- Merging the row and bar renderers into a shared bar framework.
- Value sorting for vertical bars.
- A shorter `group=@…` dashboard-text alias.
