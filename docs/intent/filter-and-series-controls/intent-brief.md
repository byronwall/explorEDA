---
title: "Filter a workspace without a chart"
slug: "filter-and-series-controls"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Filter a workspace without a chart

## My read

Users should be able to choose a segment, such as one region or a date range, without creating a chart only to hold the filter. The filter narrows every linked view, shows up beside the other active filters, and is cleared the same way.

Most of the parts exist. Every linked filter today belongs to a chart: each chart owns `filters`, a crossfilter dimension applies them, and the active filter bar names the owning chart. The Rows view has its own filters, but they apply only there. What is missing is a filter whose owner is the workspace itself, with a direct way to add one.

Byron said that filters without a chart "would also be really nice." This was one of two selection features he singled out; the other, lasso, belongs to [precise composite selection](../precise-composite-selection/intent-brief.md).

## What matters most

- Add a linked filter on any field without creating or choosing a chart.
- Tell apart three kinds of filtering: Rows-only filters and searches, a chart's own `where.` restriction, and linked filters, whether a chart or the workspace owns them.
- Reuse the field-aware filter controls, filter types, and the predicates that apply them.

## The intended experience

From the active filter bar, pick a field, choose values or a range in the control that the column filter popover and the Filters tab already use, and watch every linked chart and the row count update. The new chip reads as a workspace filter. Clicking it reopens the control for editing; × removes it; Clear all removes it with the rest. The filter survives saving and reloading, and dashboard text can say it.

## Boundaries

- One filter engine. A workspace filter is one more filter owner applied through crossfilter, not a second evaluation path or a separate group of filters.
- No chart, card, or grid space is created to hold the filter.
- Do not change existing chart-owned filters, chart-local `where.` restrictions, or Rows filters.
- Older saved layouts load unchanged, with no workspace filters.
- Moving a Rows search or a chart's filter into the workspace is optional, and it must be an explicit action.

## What seems settled

- Hiding or isolating a series in a line legend is no longer part of this initiative. It is a display change, not filtering, and is tracked as its own Product Grid task: "Hide or isolate a series from the legend."
- Dashboard text already has `where.<field>` (this chart only) and `select.<field>` (a linked filter owned by a chart). A workspace filter needs its own form; that form is still open.
- Continuous legend brushing and linked hover emphasis remain later possibilities.

## Current reality that matters

- `ActiveFilterStatus` builds chips from chart filters, Rows filters, and searches.
- `CrossfilterWrapper` creates one dimension per chart, keyed by chart ID.
- `ColumnFilter` and `FiltersSettingsTab` give field-aware value, range, and date controls.
- `applyFilter` evaluates one typed filter against one value.

## Expansion trigger

Expand to named segments, filters that apply across saved views, or promotion from Rows once analysts keep workspace filters across sessions or keep re-creating a chart's filter as a workspace filter.

## Next step after confirmation

Start [milestone 1 of the implementation plan](implementation-plan.md): a workspace filter owner and a plain **Add filter** entry in the active filter bar, checked against a chart's `select.` filter. The [shape brief](shape-brief.md) has the full scope.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
