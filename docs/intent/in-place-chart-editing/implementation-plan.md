---
title: "Edit chart features in place: implementation plan"
slug: "in-place-chart-editing"
phase: plan
status: current
last_updated: "2026-10-08"
---

# Implementation plan

Each milestone ships as one PR stacked on the one before it. Every PR includes a screenshot and a changeset.

## Shared rules

- **One path for settings.** In-place editors call `updateChart`, the same action the settings popover uses. There is no second chart state.
- **Immediate updates, one undo step.** `useChartEdit` (in `components/charts/InPlace/`) applies each change at once and holds `onStateChange` until the edit ends (`holdStateChanges` in `DataLayerProvider`). The host therefore records a typed title or a dragged axis as one checkpoint. Escape restores the starting values, so nothing is reported.
- **Entry gestures.** Double-click and Enter (or F2) open an editor. The context menu offers the same action beside the existing field actions. Alt-click and Alt-Enter stay tracing, and Command-click stays field inspection.
- **Never move or filter.** An editor never starts a grid drag, a brush, or a chart shortcut. Editing leaves row counts unchanged.
- **Read-only stays read-only.** The chart area is `inert` during history previews, so no editor opens.

## Milestones

| #   | PR             | Outcome                                                                                                                                                                                                                                                 |
| --- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Title in place | Double-click, Enter, F2, or the title's context menu edits the title in its place. Each keystroke shows; Escape restores; a cleared title follows its fields again. One edit is one undo step.                                                          |
| 2   | Axis limits    | Scatter, bar, histogram, line, row, and box charts honor `xAxis`/`yAxis` `min` and `max`. Marks outside are clipped, never filtered. The Axes tab gains exact Min and Max inputs with a reset. An inverted draft is shown as invalid and never applied. |
| 3   | Axes in place  | Double-clicking a numeric axis opens a compact range editor anchored to it. Double-clicking an axis title edits it in place. The axis context menu adds "Set range", "Reset range", and "Edit axis title".                                              |
| 4   | Axis drag      | Dragging along a numeric axis pans its range, and dragging an end stretches that bound. The whole drag is one undo step, and the range editor refines the result.                                                                                       |

## Proof for each milestone

- Unit tests drive the gesture, the immediate chart update, Escape, and the single `onStateChange` call.
- In the browser at 1280, 783, and 390 px: the edit opens where the feature is drawn, the chart does not move, and the row count does not change.
- Saved state round-trips through `saveToStructure`/`restoreFromStructure` without new keys: titles and axis bounds already save.

## Cut line and follow-ups

- **Subtitles** arrive with the editorial styling stack (`subtitle` setting, PR byronwall/explorEDA#192). Once it merges, the subtitle reuses `InlineTextEditor` and `useChartEdit` unchanged.
- Axis limits on ECDF, time-series X, map, and calendar charts need their own domain rules. They are out of scope here; see [axis-domain-controls](../axis-domain-controls/intent-brief.md).
- True log scales stay with the axis-domain initiative.
