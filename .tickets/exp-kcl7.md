---
id: exp-kcl7
status: closed
deps: []
links: []
created: 2026-09-27T01:30:00Z
type: feature
priority: 2
assignee: Byron Wall
tags: [field-list, fields, ui]
---

# Open a field list from anywhere in the workspace

## Outcome and Why

A workspace with only charts has no field view today. A Fields toggle in the toolbar and a keyboard shortcut open a narrow, floating field list on any workspace. The user can search, scan every field on one line, open the field inspector, and add a chart without adding a table to the layout.

## Ready Gate

Byron chose a floating panel that overlays the right edge and never resizes the grid. The panel stays open until the user closes it. The field inspector from PR 36 should be merged, or this work should start from its branch.

## Owned Context and Scope

Own a new field list component rendered by `packages/explorEDA/src/components/PlotManager.tsx` beside `ChartGridLayout`, plus its toolbar toggle. Read `fieldProfiles`, `calculations`, and `getFieldLabel` from the data layer. Rows use `FieldMetadata`. Inspect opens `FieldInspector`. Add chart uses the type rules in `SummaryTable/components/ChartActions.tsx` and calls `useCreateCharts`. Open the inspector through one workspace-level controller that takes a field and an anchor; reuse the axis-label thread's controller if it has landed, or add it here and share it.

## Decisions and Discretion

Must: Float at the right of the workspace under the sticky controls, about 300 pixels wide, and use a bottom sheet at narrow widths. Never change the grid's width. Close with the toggle, the shortcut, or Escape. Show a labeled search field and a shown-of-total count. Match display labels and source names. Include calculated fields with their marker. Say that the numbers describe filtered rows. Show row actions on hover and focus, and keep them reachable on touch. Keep the list open after Add chart and bring the new chart into view.

Executor may choose: The shortcut key (it must not fire in text inputs), the toggle icon, and the row order.

Do not: Create a chart or change the saved layout on open, search, or close. Compute new field statistics. Store the open state in the saved analysis. Add a native `title` tooltip.

## Behavior and Failure Proof

Remove the summary and rows tables from the demo. Open the list with the toolbar and with the shortcut. Search for a field, inspect it with the list still visible, and add a chart. Apply a chart filter and confirm the rows update. Confirm the saved layout changes only on the add.

## Acceptance Checklist

- **Invariant:** Opening, searching, and closing the list leave the saved layout unchanged.
- **Invariant:** Row metadata matches the summary table for the same filter scope.
- **Observed baseline:** Check at 1280, 783, and 390 pixels with pointer and keyboard, including long names, many fields, calculated fields, and an empty filter result.
- **Fixture:** Component tests for search, filtered scope, and no layout change on open. Run `pnpm check:ui` and `pnpm check`. Add a `minor` changeset.

## Cut Line and Provenance

Leave expanded rows, chart usage, and drag below this ticket's cut line. Source: Byron's 2026-09-27 request; field-list claims `anywhere`, `fast`, `actions`, `layout`, and `metadata`; milestone M1. Repository baseline `9435727`.
