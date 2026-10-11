---
title: "Set and reset chart domains without filtering rows — implementation plan"
slug: "axis-domain-controls"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Set and reset chart domains — implementation plan

## Plan at a glance

Five PRs, each shippable alone, in this order: the hidden-rows marker on scatter, the marker on the other bounded charts, stable axes on aggregate charts, log on scatter, then log on line and box.

The marker comes first because it is new UI with no open question, and log depends on it: log's nonpositive warning is the same marker with a different reason. Scatter goes first because its plan already lists excluded rows with reasons (`ScatterPlan.exclusions`) and already sets its domain from all rows, so the count has one clear meaning there.

Stable axes are a separate PR because they change existing behavior on four charts, and they wait on one product answer (growing or clipping for averages). Doing them before log keeps the log work on axes whose domain population is already right.

There are no external dependencies. Everything runs in the demo dev server and in vitest against the chart plans.

## Implementation strategy

- **First proof:** a scatter chart in the demo with an x maximum set shows a marker at the right end of the axis, with a count and a Reset.
- **Primary seam:** `AxisPlan` in `components/charts/Axis/axisPlan.ts` gains a `hidden` field per side: `{ count, unit, reason: "bound" | "nonpositive" }`. Each chart plan fills it; `PlannedAxes` in `AxisLayer.tsx` draws it. Charts never draw their own marker.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/scatterPlan.test.ts src/components/charts/Axis` and `pnpm --filter demo dev` with the shop and flights analyses (positive revenue; signed delays).
- **Rollout and rollback:** each PR reverts on its own. Log is only offered where `logAxes(settings)` allows it, so turning it off is a one-line change in that function.

## Milestone 1: Scatter says when a bound hides rows

The smallest visible proof of the marker. It excludes other charts and log.

- **Change — axis plan carries what is hidden**
  - Add `AxisHidden` and `hidden?: { low?: AxisHidden; high?: AxisHidden }` to `AxisPlan` and `AxisInput`; pass it through `planAxes`.
  - In `scatterPlan.ts`, count drawn points whose value falls outside the bounded domain, per axis and side. Count rows the chart draws, including dimmed ones.
  - Test in `scatterPlan.test.ts`: counts per side, zero when nothing is clipped, unchanged domain after a filter.
- **Change — the marker and its popover**
  - Draw a small icon at the axis end in `PlannedAxes`, focusable, with an `aria-label` naming the count. No `title` attribute (`pnpm check:ui`).
  - Open a compact nonmodal `Popover` on hover or focus, anchored the way `useAxisEditing` anchors the range editor. It shows the count and a Reset that clears only that side through `useChartEdit`, so it is one undo step.
  - Test with `Axis.test.tsx`-style rendering: marker appears, Reset clears one side.

### Desired end state

- On the shop demo, setting a scatter x maximum shows the marker. Its count matches the rows beyond the bound, and Reset restores the automatic maximum.
- Checked in the browser at 1280, 783, and 390 px and in dark mode; the marker never covers tick labels or starts a drag.

## Milestone 2: Every bounded chart shows the marker

- **Change — fill `hidden` in each plan**
  - Bar and histogram (`barPlan.ts`, `seriesBarPlan.ts`): bars past the bound, unit "bars".
  - Row chart (`RowChart.tsx`): rows past the x bound, unit "rows" (bars).
  - Line (`timeSeriesPlan.ts`): periods past the y bound, unit "periods".
  - Box (`BoxPlot.tsx`): raw values past the y bound, unit "rows".
  - Charts that draw axes through `BaseChart` pass `hidden` into `planAxes` there.
- **Change — tests per chart** in the existing `barPlan.test.ts`, `RowChart.test.tsx`, `TimeSeriesChart.test.tsx`, and `Distribution.test.tsx`.

### Desired end state

- All six charts that honor limits show the marker with a count in their own unit; none shows it without a bound.

## Milestone 3: Aggregate charts keep stable axes

Brings aggregate bars, series bars, row charts, and the line value axis in line with the stable-axes rule in `docs/ui-defaults.md`.

- **Change — compute the domain from all rows**
  - In each plan, compute the same aggregate over all rows (or all rows in the facet) for the domain, and keep the live result for the marks. Reuse `calculateGroupedAggregate` and `rollupByPeriod`.
  - Set `domainSource.population` to "all source rows" so the trace says so.
  - When a live aggregate passes the all-rows domain, grow the domain to fit. Never shrink below the all-rows domain.
- **Change — tests:** brushing another chart leaves the domain unchanged in `barPlan.test.ts`, `SeriesBarChart.test.tsx`, `RowChart.test.tsx`, and `TimeSeriesChart.test.tsx`.

### Desired end state

- In the flights demo, brushing a scatter leaves the axes of every bar, row, and line chart still. Only the marks change.
- The time-series date axis is unchanged here; it belongs to the date initiative.

## Milestone 4: True log on scatter

- **Change — scale and transforms**
  - `numericScale` returns `scaleLog` for `log`; `ScaleDescriptor`, `describeScale`, and `buildScale` gain `log`.
  - `scatterAxis.ts`: bounds from positive values only; `paddedDomain` pads in log space; nonpositive values get no position and a new exclusion reason.
  - `axisDrag.ts`: add a log transform beside `SYMLOG`.
  - `boundedDomain` and `AxisLimitFields`: a bound at or below zero under log is invalid and never applied.
- **Change — offer it**
  - Add `logAxes(settings)` beside `numericAxes` in `axisBounds.ts`. The Axes tab adds a Log option, with a tooltip, only where it allows. Ineligible charts keep drawing linear even if `log` is saved.
  - Axis label suffix "· log", as symlog does today.
  - Nonpositive rows fill `hidden.low` with reason `nonpositive`; the marker shows as a warning.
- **Change — tests:** `scatterPlan.test.ts` (domain, exclusions, counts), `axisDrag.test.ts`, `axisBounds.test.ts`, `AxisLimitFields.test.tsx`, and the existing DSL `scaleType: "log"` round trip.

### Desired end state

- On flights, a log arrival-delay axis draws positive delays, and the warning counts early and on-time flights. Drag and exact bounds work in log space.
- Add a changeset (`minor`): log scales on scatter axes.

## Milestone 5: Log on line values and box plots

- **Change — line:** `logAxes` allows the y axis for Line display only; area and stacked stay linear as today. Nonpositive periods leave gaps and are counted.
- **Change — box:** statistics use every value; anything at or below zero is clipped at the axis floor and counted.
- **Change — tests** in `TimeSeriesChart.test.tsx` and `Distribution.test.tsx`.

### Desired end state

- Both charts offer Log, show the warning with honest counts, and draw unchanged quartiles.

## Cross-cutting verification

- Each PR: targeted vitest runs and `pnpm --filter exploreda check-types`; `pnpm check:ui`; `pnpm check` once before opening the PR.
- Each PR with visible change: browser checks at 1280, 783, and 390 px, screenshots attached with `gh pr create --attach`, and a changeset.

## Below the cut line

- "Use symlog instead" inside the log warning.
- Free scales per facet panel; ECDF bounds; heatmap, map, and calendar limits.
- Color domains that follow filters (heatmap, map).
- Removing the unused `min`/`max` axis placeholder.
- The time-series date axis range, which moves to [date and time handling](../date-time-handling/intent-brief.md).
