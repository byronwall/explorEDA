---
title: "Field list"
slug: "field-list"
phase: intent
status: current
last_updated: "2026-09-27"
---

# Field list

## My read

Fields are the unit of work in an exploration, but today a user reaches them only through a table. The summary table and the data table both list fields and open the field inspector. A workspace that holds only charts has no field view at all. The user must add a summary table, which changes the saved layout, or open chart settings one chart at a time.

The request is a detailed field list that opens from anywhere in the workspace. It should open fast and support quick checks of a field. From a field, the user should be able to open the full inspector and add a chart. A narrow list may also let users drag a field onto a chart to swap an axis. Byron marked that last idea as uncertain, so this plan treats it as a later step that the first two steps do not depend on.

A separate change makes the inspector easier to open from a chart axis and fixes its layout (PR 36 and its follow-up thread). This plan reuses that inspector and its open path. It does not redesign the inspector.

## What matters most

- One field view that is always one action away, with or without tables in the layout.
- Fast scanning: type, name, and a useful statistic on one line for every field.
- Quick inspection without losing sight of the charts.
- Direct paths from a field to the inspector and to a new chart.

## The experience you appear to want

On a workspace with only charts, the user presses a Fields control in the toolbar or a keyboard shortcut. A narrow panel appears at the side of the workspace with a search box and one row per field. Each row shows the type icon, the display label, and compact metadata such as range or distinct count. The numbers describe the rows that pass the current filters, as the summary table does. The user types a few letters to find a field. They expand a row to see its distribution and which charts use it. They open the full inspector from the row or add a suitable chart. Later, they drag a field onto a chart's axis to replace that axis field. The charts stay visible and usable while the list is open. Closing the list leaves the saved layout unchanged.

## Boundaries

### Must be true

- The list opens from the workspace toolbar and a keyboard shortcut, regardless of which charts are present.
- Opening, searching, expanding, or closing the list never creates a chart or changes the saved layout.
- Rows use the shared `FieldMetadata` component and include calculated fields.
- Statistics follow the current filter scope and say so.
- Inspect opens the same `FieldInspector` the tables and chart axes use.
- Every action has a pointer and a keyboard path. Dragging always has a non-drag equivalent.
- The list works at 1280, 783, and 390 pixels.

### Must be avoided

- Do not build a second inspector or a second copy of field statistics.
- Do not add native hover tooltips.
- Do not resize or reflow the chart grid when the list opens.
- Do not block the first release on drag and drop.

## What seems settled

The list is a workspace-level panel owned by the library, so host applications get it without extra wiring. It is nonmodal, floats over the right edge of the workspace without resizing the grid, and stays open until closed. It reads `fieldProfiles` and `FieldMetadata` for its rows and `FieldInspector` for full inspection. New charts go through `useCreateCharts`, as the summary table's chart actions do.

## Possibilities, not decisions

- The shortcut key, the grouping (by type or source order), and the expanded row's content are design choices.
- Drag targets could be axis labels only, or also chart bodies and empty grid space.

## Current reality that matters

`CompactSummaryTable` and `DataTableHeader` are the only places that open `FieldInspector`. `ChartActions` creates row, bar, scatter, and pivot charts from a field. `getChartFields` and `getChartAxisFields` in `chartAccessibility.ts` map a chart's settings to its fields and axes. `@dnd-kit` is already a dependency, used for sortable field badges. `ChartGridLayout` already creates a chart in empty grid space from a type menu. `docs/ui-defaults.md` says not to add a persistent sidebar for temporary inspection; the field list is a workspace tool rather than one field's inspection, and the shape brief addresses that rule.

## Decided

- 2026-09-27: Byron chose a floating panel. It overlays the right edge of the workspace, never resizes the grid, and stays open until the user closes it.

## Next step after confirmation

Tickets exist for the three milestones. Build milestone 1.
