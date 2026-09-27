---
title: "Field list — implementation plan"
slug: "field-list"
phase: plan
status: current
last_updated: "2026-09-27"
---

# Field list — implementation plan

## Status

2026-09-27: All three milestones are built. The inspector path is the one PR 36 added for chart axes: `FieldInspector` takes a field and an `anchor`, and now a `side`, so no separate controller was needed. The summary table and the field list share `useFilteredFieldProfiles`, and the inspector and the expanded row share `useFieldDistribution`. The F key toggles the list. Drag works with a mouse; touch and keyboard use the "Use on chart" menu. Drops on empty grid space are not built.

## Plan at a glance

Make three visible changes. First, add a field list that opens from the toolbar or a shortcut on any workspace. It offers search, compact field rows, Inspect, and Add chart. This proves the panel, its speed, and the shared inspector path. Second, let a row expand in place for a quick distribution and the charts that use the field. Third, let a user put a field on a chart's axis, first through a "Use on chart" menu and then by dragging. Each step leaves a usable product and can be reviewed alone. Existing profiles, filters, charts, and saved layouts remain the source of truth.

## Implementation strategy

- **First proof:** On a chart-only workspace, open the list, find a field, inspect it, and add a chart. The saved layout changes only on the add.
- **Primary seam:** A new field list component rendered by `PlotManager` beside `ChartGridLayout`. It reads data-layer state and calls existing actions.
- **Fast local loop:** Focused component tests with Testing Library, `pnpm check:ui`, then browser checks at 1280, 783, and 390 pixels.
- **Local dependencies:** Demo data and the inspector from PR 36. Nothing new from the network.
- **Rollout and rollback:** Library UI only. Each milestone reverts without migrating saved analyses. Add a `minor` changeset with the first milestone, since it gives package users a new feature.

## Milestone 1: Open-anywhere field list

Add a Fields toggle to the workspace toolbar next to the chart actions, with an accessible name and `ActionTooltip`. Add a shortcut that works when focus is not in a text field. The panel floats at the right of the workspace under the sticky controls. It uses a bottom sheet at narrow widths. It never changes the grid's width. It holds a labeled search field, a shown-of-total count, and a scrollable list. Each row uses `FieldMetadata` in compact form, with the calculated-field marker the field selector uses. Rows follow the filtered `fieldProfiles` and say that the numbers describe filtered rows. Row actions appear on hover and focus and stay reachable on touch. Inspect opens `FieldInspector` beside the panel. Add chart offers the types `ChartActions` allows and calls `useCreateCharts`. The new chart scrolls into view, and the list stays open.

Open the inspector through one workspace-level controller that takes a field and an anchor. If the axis-label thread has landed such a controller, use it. Otherwise add it here and tell that thread, so both paths match.

### Desired end state

- A chart-only workspace can open the list by toolbar and shortcut, and close it by the toggle, the shortcut, or Escape.
- Search finds fields by display label and source name.
- Inspect and Add chart work by pointer and keyboard. Opening and closing the list does not change the saved layout.
- Tests cover filtered scope in rows, search, and no layout change on open.

## Milestone 2: Quick inspection in the row

Let a row expand in place. The expanded row shows a small distribution from the inspector's Values view (`FieldValues`, `fieldDistribution`). It computes that distribution only for the open row. It also lists the charts that use the field, from `getChartFields`. Hovering or focusing a chart entry highlights that chart. Selecting it scrolls to the chart and focuses it. Keep one row expanded at a time so the list stays scannable.

### Desired end state

- Expanding a row shows its distribution for the filtered scope without opening the inspector.
- "Used in" lists every chart that references the field and can move focus to one.
- Opening the list on the widest demo dataset stays fast, because collapsed rows do no extra work.

## Milestone 3: Put a field on a chart

Add a "Use on chart" row action. It lists charts that have an x or y axis, from `getChartAxisFields`, with each axis as a choice. Choosing one replaces that axis field through a typed update for each chart type. The update rejects fields the axis cannot use, following `lib/numeric.ts`. Then make rows drag sources with `@dnd-kit` and make axis labels drop targets that show valid and invalid states while dragging. Dropping on an axis does the same update as the menu. Dropping on empty grid space may create a suitable chart through the existing empty-grid creation path.

### Desired end state

- Every drag result has a menu equivalent that works by keyboard.
- A drop on an axis replaces only that axis field. An invalid drop is refused with a visible reason and changes nothing.
- Chart type, layout, filters, and other fields stay as they were.

## Cross-cutting verification

Read `docs/ui-defaults.md` before editing. Use accessible names and no native `title`. Run `pnpm check:ui` and `pnpm check`. Verify at 1280, 783, and 390 pixels with pointer and keyboard. Include a long field name, many fields, calculated fields, an active filter, and a filter with no matching rows. Check light and dark borders, focus return when the panel and inspector close, and that primary chart actions stay reachable under the panel. After milestone 1, add one line about the field list to the UI defaults.

## Below the cut line

- A docked sidebar that narrows the chart grid.
- Editing field settings in the list rather than in the inspector.
- Field grouping, folders, hiding, or custom order.
- Dragging several fields at once, or drop targets for pivot, data table, facet, color, or 3D slots.
- Saving the list's open state or search in the saved analysis.

## Tickets

- [Open a field list from anywhere](../../../.tickets/exp-kcl7.md) — milestone 1.
- [Quick field inspection in the list](../../../.tickets/exp-ja94.md) — milestone 2.
- [Put a field on a chart axis](../../../.tickets/exp-3xyp.md) — milestone 3.
