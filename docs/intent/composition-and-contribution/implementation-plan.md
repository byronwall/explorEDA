---
title: "Show parts of a whole and cumulative contributions — implementation plan"
slug: "composition-and-contribution"
phase: plan
status: draft
last_updated: "2026-10-12"
---

# Waterfall and donut — implementation plan

## Plan at a glance

There are four milestones, with one stacked PR each. Each ships a chart or mark together with its docs and demo example.

1. **Bridge waterfall.** Budget vs actual, with subtotals, selection, and trace.
2. **Accumulate mode** on the same chart.
3. **Donut chart.**
4. **Waterfall and donut as Composition marks.**

The bridge comes first because it carries the main risk: can two filtered grouped sums be differenced into steps that match direct sums and keep their source rows? That arithmetic lives in a pure plan module, tested on a budget vs actual fixture stored in two layouts, before any rendering. Accumulate mode reuses the waterfall's renderer, subtotals, and selection. Only the step calculation changes. The donut reuses the row chart's top-N and "Other" pooling. The Composition marks come last so they wrap calculations that are already proven.

There are no external dependencies. The risk is internal plumbing. A new chart type touches the chart registry, the `ChartSettings` union, saved-data validation (`saveDataUtils.ts`), Dashboard text (`lib/dsl/compile.ts`, `export.ts`), accessibility labels (`chartAccessibility.ts`), and default sizing (`useCreateCharts.ts`). The demo's `dashboardText.test.ts` exports and recompiles every example, so a waterfall example fails there until its settings round-trip.

## Implementation strategy

- **First proof:** `waterfallPlan.ts` turns the wide and long budget fixtures into identical bars. Each step equals actual minus plan, and the end bar equals `sum(actual)`.
- **Primary seam:** a pure plan function. Settings and rows go in; bars with their totals and source row IDs come out. The renderer, selection, trace, and later the Composition mark all read this plan and never recompute values.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/Waterfall` and `pnpm --filter demo dev`. The library runs from source, so it never needs a build.
- **Local dependencies:** a budget vs actual CSV under the demo's datasets, in two layouts: two columns (`plan`, `actual`) and a scenario column (`scenario`, `amount`). Unit tests use a small in-memory copy.
- **Rollout and rollback:** each chart type is one registry entry. No saved layout contains the new types until a user adds one. Rolling back means removing the entry, the docs page, and the example together.

## Milestone 1: Bridge waterfall explains budget vs actual

This milestone builds the whole bridge path, docs and example included. Accumulate mode and the donut are excluded.

- **Change — bridge calculation (`components/charts/Waterfall/waterfallPlan.ts`)**
  - Filter the rows for each state with `applyFilter` over that state's filter list.
  - Run `calculateGroupedAggregate` per state, grouped by the step field, using sum or count.
  - Difference the two results per category; a category missing from one state counts as 0 there.
  - Order steps by parent group, then by category order. Add a subtotal after each group.
  - Each bar records its value, running base, kind (start, step, subtotal, end), and source row IDs per state.
  - Vitest:
    - The wide and long fixtures produce identical bars.
    - Each step equals actual minus plan, and the end bar equals `sum(actual)`.
    - A line item missing from one state counts as 0, and that state's empty set is recorded.
    - A state left with no rows produces a message instead of bars.
    - Start plus the steps equals end.
- **Change — chart type (`type: "waterfall"`)**
  - Settings fields:
    - `mode: "bridge"`;
    - `aggregation` (sum or count);
    - `measureField`;
    - `states: [{ label, measureField?, filters }]` (two of them);
    - `stepField`;
    - `parentField?`.
  - Add the type to the `ChartSettings` union, `registerAllCharts`, saved-data validation, accessibility labels, and default sizing.
  - Verify with a saved-data round-trip test and a `chartAccessibility` label test.
- **Change — renderer and selection**
  - Horizontal floating bars on `BaseChart`, read top to bottom like a statement, so line-item labels stay readable at 390 px. Colored by direction. Start, end, and subtotal bars share a neutral total color. Signed labels on steps, values on totals.
  - Clicking a step sets a value filter on the step field. Clicking a subtotal selects every category in its group. Clicking start or end applies that state's filters. Clicking empty plot space clears this chart's filters, and `getFilterFunction` applies the chart's own filters.
  - Verify with a component test of the click paths. In the browser, a step click filters a neighboring table to that line item.
- **Change — trace**
  - A `waterfall-step` trace kind that shows each state's value and contributors through `AggregateContributorTable`, plus the missing-state note. Alt-click and Alt-Enter open it, as in the row chart.
- **Change — settings panel**
  - Measure, mode, state 1 and state 2 (label, optional measure, conditions), step field, and parent field, using `FieldMetadata` pickers.
  - Reuse the filter editors from `FiltersSettingsTab` for the state conditions.
- **Change — Dashboard text**
  - Register the settings in `settingKeys.ts`. The generic `chart waterfall` line and nested paths, such as `states.0.filters.0.values[]=Plan`, already round-trip every state, so no new keyword is needed.
  - Verify with `export.test.ts` and `compile.test.tsx` round trips.
- **Change — docs and example**
  - Budget vs actual dataset and demo example: the bridge with parent subtotals beside a line-item table.
  - Add an entry in `coverage.ts` with `chart:waterfall` set to `shown`.
  - `pages/waterfall.mdx` with a catalogue entry, a `LiveExample` whose scripted step clicks a step, and setting descriptions.
  - Add a changeset (`minor`).

- **Spike — embedding the state-condition editor (resolved)**
  - `ChartRowsFilters` already edited a standalone filter list. It is now the shared `FilterListEditor`, so each state gets every condition kind; no fallback was needed.

### Desired end state

- A user adds a waterfall on the budget data, picks plan, actual, the line item, and the parent group, and reads the start, signed steps, subtotals, and end.
- Clicking a step filters the workspace to that line item, and Alt-click shows both states' contributing rows.
- The waterfall docs page and demo example are live, and `pnpm --filter demo build`, `docs:verify`, and `pnpm check` pass.
- Screenshots at 1280, 783, and 390 px go in the PR.

## Milestone 2: Accumulate mode for ordered running totals

This milestone adds a second way to compute steps. Rendering, subtotals, selection, and trace stay unchanged.

- **Change — accumulate plan**
  - `mode: "accumulate"` sums a signed measure per step-field category. Steps are ordered by the field's numeric, date, or category order. The start bar shows an optional start value.
  - Vitest: the running end equals the start plus the sum of the measure. Ordering by number and by date is stable. Negative steps draw downward.
- **Change — settings and Dashboard text**
  - A mode toggle with a tooltip explaining Bridge and Accumulate. In Accumulate, a single measure and a start value replace the two states. Add `mode=accumulate` and `start=` keys.
- **Change — docs and example**
  - A staged running total example: a building battery's state of charge through one day (`battery-day`), from a 40 kWh start through signed hourly solar, grid, and load flows, with a subtotal per part of the day. Add a section for the mode to `waterfall.mdx`, a second live example, and a coverage entry.

### Desired end state

- The same chart switches between Bridge and Accumulate without losing its step field or parent field.
- The docs show both modes, each with a live example, and Dashboard text round-trips both.

## Milestone 3: Donut shows a small whole as shares

This milestone adds the donut chart. Waterfall code is unchanged.

- **Change — donut plan (`components/charts/Donut/donutPlan.ts`)**
  - Count or sum a nonnegative measure by category over the filtered rows. Reuse `planRowCategories` and `poolAggregateRows` for the top N (default 6) and "Other."
  - Negative input, or a sum of zero, produces a message instead of slices.
  - Vitest: shares sum to 1. "Other" pools its members. A negative value is refused.
- **Change — chart type, renderer, selection, and trace**
  - The same registration checklist as M1.
  - The ring shows the total and the measure's name in the center. Clicking a slice selects its category, and clicking "Other" selects its members. Trace reuses the row chart's trace body.
  - Verify the clicks and the cross-filtered whole in the browser.
- **Change — docs and example**
  - The donut beside a percent bar on the same field.
  - `pages/donut.mdx` with a live example, a coverage entry, and a changeset (`minor`).

### Desired end state

- A user adds a donut, reads the shares of the filtered whole, folds small categories into "Other," and cross-filters from slices.
- The docs page and example are live, and every check passes.

## Milestone 4: Waterfall and donut as Composition marks

This milestone adds marks that consume the M1–M3 plans and recompute nothing.

- **Change — marks**
  - Add `waterfall` and `donut` to `MarkDefinition`, along with `markFields`, `markScaleIds`, the resolver, and the SVG renderer. Each mark calls the existing plan function on the unit's rows.
  - Verify with Composition tests in the style of `waffle.test.ts` and `stacks.test.ts`.
- **Change — Composition trace and editor**
  - Add the new marks to `compositionTrace.ts` and the inspector's mark controls.
- **Change — docs and examples**
  - A section for each mark in `composition.mdx`.
  - One editorial example, such as an annual budget bridge with a donut of spending mix, with `chart:composition` set to `shown`.
  - Add a changeset (`minor`).

### Desired end state

- Both marks render in a Composition graphic with the same numbers as their chart types, and they are documented and shown in an example.

## Open decisions and spikes

Both M1 unknowns are resolved: the shared filter-list editor edits each state, and Dashboard text carries states through generic setting paths. None remain open.

## Below the cut line

- User-placed subtotals
- Price, volume, and mix decomposition
- Nested rings and sunbursts
- Sorting waterfall steps by size
- OR conditions across fields within one state
