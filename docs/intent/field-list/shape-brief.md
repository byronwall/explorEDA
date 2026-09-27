---
title: "Field list — shape brief"
slug: "field-list"
phase: shape
status: current
last_updated: "2026-09-27"
---

# Field list — shape brief

## Recommendation

Add a Fields toggle to the workspace toolbar and a keyboard shortcut that opens the same panel. The panel floats at the right edge of the workspace, below the sticky controls. It is about 300 pixels wide and fills the available height. At narrow widths it becomes a bottom sheet over the charts. It does not move or resize the grid. It stays open while the user works with charts and closes with its own control, the shortcut, or Escape. Its open state is a viewer convenience and is not stored in the saved analysis.

The panel has a labeled search field and a count of fields shown. Below that is a scrollable list with one row per field. Each row uses `FieldMetadata` in its compact form. Hover or keyboard focus reveals row actions on the right: Inspect and Add chart. A row can expand in place to show a small distribution and the charts that use the field. Inspect opens the shared `FieldInspector`, anchored beside the panel so the list stays visible. Add chart offers the chart types that suit the field and creates the chart through `useCreateCharts`.

Drag to chart is a third step. A field row becomes a drag source, and each chart's axis labels become drop targets. Dropping replaces that axis field. A "Use on chart" menu in the row actions does the same job without dragging.

## Problem and appetite

- **Problem:** Field details and field-first actions exist only inside tables. A chart-only workspace has no field view.
- **Outcome:** A fast field list is one action away everywhere, supports quick inspection, and starts charts.
- **Appetite:** Three focused passes. The first two ship value alone. The third is optional.
- **Not in this shape:** A new inspector, new profile math, field editing in the list, or grouping and folders.

## Core shape

The panel is a new component beside `ChartGridLayout` in `PlotManager`, rendered for the Charts and Rows tabs. It reads `fieldProfiles`, `calculations`, and `getFieldLabel` from the data layer. These are the filtered profiles the summary table already shows, so the list needs no new statistics. The expanded row reuses the distribution view from the field inspector (`FieldValues` and `fieldDistribution` from PR 36) at a small size. It computes that view only for the expanded row. "Used in" comes from `getChartFields` across the current charts. Hovering an entry highlights that chart, and selecting it scrolls to and focuses it.

The inspector open path should be shared. The axis-label work in the other thread needs a way to open `FieldInspector` for a field from outside a table. The field list needs the same thing. One workspace-level inspector controller, with a field and an anchor, serves both. This plan adopts that controller if the other thread lands one, and adds it if not.

Drag uses `@dnd-kit`, which is already installed. Drop targets come from `getChartAxisFields`, so they cover charts that have an x or y field. Each chart type needs a small, typed "set axis field" update. It should reject a field whose type the axis cannot use, following the shared numeric rule in `lib/numeric.ts`.

## The persistent-sidebar rule

`docs/ui-defaults.md` says not to add a persistent sidebar for temporary inspection. The field list is a workspace tool, not an inspection of one field, and it overlays rather than takes space from the grid. It stays open because drag and repeated add-chart actions need it open. Byron chose this floating, stay-open panel on 2026-09-27. The UI defaults should gain one line about the field list once the behavior is settled.

## Current fit

- **Reuse:** `FieldMetadata`, `FieldInspector` and its Values view, `ChartActions` rules for suitable chart types, `useCreateCharts`, `getChartFields`, `getChartAxisFields`, `ChartTypeMenuItems`, `@dnd-kit`, `ActionTooltip`.
- **Add:** The panel, its toolbar toggle and shortcut, an expandable row, a workspace inspector controller if none exists, and per-chart axis field updates for drop.
- **Avoid or replace:** A second statistics source, a panel that resizes the grid, and chart creation on open.

## How to make this go better

- **Prove speed first.** Open the list on the largest demo dataset and measure time to first rows. Keep expanded-row work lazy. Virtualize the list only if a wide dataset needs it.
- **Share the inspector path.** Coordinate with the axis-label thread so the chart axis and the field list open the inspector the same way.
- **Keep drag optional.** Build the "Use on chart" menu before drag and drop, so the non-drag path exists first.

## First proof

- **Question:** Can a chart-only workspace open a useful field list in one action, find a field, inspect it, and add a chart without changing the saved layout until the add?
- **Proof:** The demo with the summary and rows tables removed, and the list opened by toolbar and shortcut.
- **Observe:** Rows show `FieldMetadata` for the filtered scope. Search narrows the list. Inspect opens the inspector with the list still visible. Add chart creates one chart. Nothing else changes in the saved layout.
- **Pass / fail:** All of the above work by pointer and keyboard at 1280, 783, and 390 pixels. The list opens without a visible delay on the largest demo dataset.
- **Deliberately excludes:** Expanded rows, "Used in", and drag.

## Rabbit holes and no-gos

- Do not compute new per-field statistics for the list. Use existing profiles.
- Do not let drop change a chart's type or add fields to a slot that holds one field.
- Do not build drop targets for pivot, data table, or 3D scatter slots in this pass.
- Do not add a field reordering or hiding model to the list.

## Plan handoff

Ship the open-anywhere list with Inspect and Add chart first. Add expanded rows and chart usage second. Add "Use on chart" and drag to axis third, and keep that step separable.
