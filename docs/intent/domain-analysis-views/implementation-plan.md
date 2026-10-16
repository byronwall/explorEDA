---
title: "Funnels, retention, and interval schedules — implementation plan"
slug: "domain-analysis-views"
phase: plan
status: current
last_updated: "2026-10-13"
---

# Funnels, retention, and interval schedules — implementation plan

## Plan at a glance

The order is Funnel, then Retention, then Timeline, one stacked PR each. Funnel goes first because it carries the riskiest new idea: a selection that depends on other rows. Clicking a stage has to select every event of the entities who reached it, and today's filter functions test one row at a time against stored values. If the per-entity filter works for Funnel, Retention reuses it unchanged. Timeline needs no per-entity logic, only an overlap rule on two fields, so it goes last.

Each milestone proves its counting rule in a pure plan module against a hand fixture before any SVG exists. The rule ships with its dataset, chart, docs page, and example, so every PR leaves a complete registered chart. Nothing touches the shared filter model, analysis steps, or Composition. Rolling back means dropping one `register` line.

## Implementation strategy

- **First proof:** `funnelPlan` counts match the hand fixture and the planted traps. A stage click narrows a DataTable to those users' events.
- **Primary seam:** each chart's `*Plan.ts`, a pure function from columns and settings to a prepared table, plus its `getFilterFunction`, which rebuilds the entity set from column getters.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/Funnel` and the same for the other two, plus `pnpm --filter demo dev` for the example.
- **Local dependencies:** none external. Seeded synthetic generators in `apps/data-samples/` write CSVs to `apps/demo/public/datasets/`.
- **Rollout and rollback:** each chart is one registry entry and one demo example. Remove the `register` line to disable it.

## Milestone 1: Funnel on a product event log

- **Change — dataset:** `apps/data-samples/product_events.ts` is a seeded generator, wired into `generate_all_samples.ts`. It writes `product-events.csv` (~1,500 users, ~30k events, columns `user_id, event, at, channel, plan`) with planted traps: out-of-order stages, repeats, skips, and users with no entry event. Add a README entry.
- **Change — `Funnel/funnelPlan.ts`:** ordered first-occurrence matching, an optional window from the first stage 1 event, and per-stage count, % of first, % of previous, and drop-off. Also an `entitiesAtStage(index)` helper.
  - Verify with `funnelPlan.test.ts`: the four-user fixture from the shape (4 → 3 → 2), window edges, ties at equal timestamps (ordered by row), and missing times.
- **Change — chart:** `definition.ts` (`type: "funnel"`, settings for entity, event, and time fields, `stages[]`, `windowDays?`, and `selectedStage?`), `FunnelChart.tsx` (horizontal bars with drop-off labels, built on BaseChart), `FunnelSettingsPanel.tsx`, `funnelTrace.ts`, and `FunnelTraceBody.tsx`. Register it in `registerAllCharts.ts`.
  - `getFilterFunction` uses the column getters to build the entity set for `selectedStage` once, then tests `id → entity ∈ set`.
- **Settled — which rows the filter function sees:** `fieldGetter` covers all rows, so a step's entity set comes from all rows, and the trace says so. The journeys are followed once per selection, not per row.
- **Change — docs and example:** `/docs/funnel` (`pages/funnel.mdx`, a catalogue entry, setting descriptions) and a `product-funnel` example with Funnel, DataTable, and a by-channel bar. Add a `coverage.ts` entry. Add a changeset (`minor`).

### Desired end state

- Funnel counts match the hand fixture. The trace lists each stage's rows.
- Clicking a stage narrows the linked DataTable. A save and restore keeps the selection.
- `pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts` passes, and the docs gate passes.
- Screenshots at wide, intermediate, and narrow widths are in the PR.

## Milestone 2: Retention on the same log

- **Change — `Retention/retentionPlan.ts`:** cohort by period of the entry event (default: the first event), elapsed period N active if any qualifying event falls in it, cohort size as the denominator, and blank cells where period N is beyond the data's last time. Use UTC periods consistent with `dailyRollup.ts`.
  - Verify with `retentionPlan.test.ts`: a skip-then-return case, cells past the data end, week boundaries, and a cohort of one.
- **Change — chart:** a grid with the shared `heatScale.ts` and `HeatLegend`, cohort-size labels, a trace per cell, and a cell selection stored as a value filter on the entity field listing the cell's entities, with `selectedCell` remembering which cell to outline.
- **Change — docs and example:** `/docs/retention`, a `product-retention` example on `product-events.csv`, and coverage. Extend the M1 changeset or add a second if the PR ships separately.

### Desired end state

- The cohort grid matches the hand fixture. Future cells are blank. Clicking a cell narrows the linked views.
- The docs gate and coverage tests pass. Screenshots are in the PR.

## Milestone 3: Interactive bookings timeline

- **Change — dataset:** `apps/data-samples/room_bookings.ts` writes `room-bookings.csv` (~12 rooms, 4 weeks, a few hundred rows; columns `booking_id, room, team, start, end, status`) with overlaps, open ends, and cancellations.
- **Change — `Timeline/timelinePlan.ts`:** lanes by field, intervals with an open-end limit, and an `overlaps(window)` rule (start ≤ window end and end-or-limit ≥ window start).
  - Verify with `timelinePlan.test.ts`: a touching endpoint, open ends, and missing starts left out and counted in the trace.
- **Change — chart:** lanes on a UTC axis drawn by the chart, the shared `useBrush` hook, a window stored as two date-range filters (start at or before the window's end, end at or after its start) whose filter function also keeps open ends, and click-select on a bar by `__ID`.
- **Change — docs and example:** `/docs/timeline` linking to Composition's span mark for static graphics, a `room-bookings` example (Timeline, a bookings-by-team bar, DataTable), and coverage.

### Desired end state

- Brushing a week keeps exactly the overlapping bookings in the linked views, open-ended ones included.
- The docs gate passes. Screenshots at three widths are in the PR.

## Cross-cutting verification

Run `pnpm --filter exploreda check-types` per milestone. Run `pnpm check` once before each PR, never in parallel worktrees.

## Open decisions and spikes

None open. The M1 spike was settled before Retention was built.

## Below the cut line

- Timeline concurrency strip and same-lane overlap highlighting
- Funnel and retention segment breakdowns
- Funnel and cohort analysis-query steps; wide stage-date input; survival-style retention
- A drop-off selection (reached N−1 but not N)
