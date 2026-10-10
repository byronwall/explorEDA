---
title: "Filter a workspace without a chart — shape brief"
slug: "filter-and-series-controls"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Filter a workspace without a chart — what we are adding

**Outcome:** An analyst narrows the whole view to a segment without adding a chart, and can always see and clear that filter.

**Primary flow:** Active filter bar → **Add filter** → pick a field → set values or a range → every linked chart and the row count update → a **Workspace** chip shows the filter.

## Feature scope

```text
Workspace filters
├── PLANNED ADDITIONS
│   ├── Add filter, at the start of the active filter bar
│   │   ├── Field picker with FieldMetadata (type, missing count)
│   │   └── The field's existing control: values, number range with distribution, date range
│   ├── Workspace chip, one per field; picking a filtered field edits its filter
│   │   ├── Reads "Workspace · Region: West, East"
│   │   ├── Click reopens the control in a nonmodal popover; × removes it
│   │   └── Clear all removes it with the chart and Rows filters
│   ├── Applies to every linked chart, the row count, chart traces, and Rows
│   ├── Saved with the view; older saves load with none
│   └── Dashboard text form, so text round-trips the filter
├── EVALUATE BEFORE COMMITTING
│   └── "Filter workspace by this field" in the field list and column header menus
└── LATER POSSIBILITIES
    ├── Move a chart's filter or a Rows search into the workspace
    ├── Named segments that apply across saved views
    └── Turning a workspace filter on and off without removing it
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Workspace filter set on Region | Every chart, including one that draws Region, shows only the chosen regions. The chip states why. |
| A chart also filters on Region | Both filters apply. The bar shows both chips, each with its owner. |
| Edit or remove the filter | One state change, so one undo step. |
| Add filter on a field that already has one | Opens that filter for editing. There is never a second filter on the same field. |
| The field is removed | Its workspace filter is removed too, as Rows filters are now. A display rename changes only the chip's label. |
| Chart trace or details | Workspace filters are listed with the other filters that narrowed the chart. |
| Rows view | Rows filters stay Rows-only. Workspace filters narrow Rows as chart filters do now. |
| Load a save without workspace filters | Unchanged. |

## Examples

Dashboard text, one line per workspace filter:

```text
filter Region=West,East
filter "Order Date"=2024-01-01..2024-03-31
bar Region
```

`filter` sits at the view level beside `rows`. Values use the same forms as `where.`.

## Decisions and boundaries

**Appetite:** One small-to-medium feature: a new filter owner, one entry point, saved state, and dashboard text. No new filter types or controls.

**Key decision:** The workspace becomes one more owner of linked filters, applied through one crossfilter dimension per filtered field and evaluated with the existing `applyFilter`. Per-field dimensions let the editor show a field's full distribution, as a chart's own filter does. The cheaper alternative, a marks-free "filter card" chart, needs no engine change. It still puts a chart on the grid to hold the filter, which is the very thing Byron wants to avoid, so it is not recommended.

**Boundary:** Chart filters, `where.` restrictions, and Rows filters do not change. Workspace filters are linked, never chart-local, and there are no independent filter groups. Dashboard text replaces the whole dashboard, so the `filter` form must ship with the feature; otherwise, applying edited text would drop workspace filters. Removing the entry point and ignoring the saved field disables the feature.

**First proof:** **Try:** add the workspace owner and a Region value filter set from **Add filter** in the demo, with no new chart. **Observe:** every chart and the row count match a chart-owned `select.Region` filter on the same values, the chip names the workspace, × and Clear all restore the full set, and the filter survives reload. **Decide:** if the counts match and the entry is easy to find at 1280, 783, and 390 px, go on to polishing the bar and adding the dashboard text form. If the counts differ, fix the filter model before touching the UI.

**Settled (2026-10-10):** The active filter bar is the only entry point to start; make it feel good there before adding others. There is one workspace filter per field, and editing changes it instead of stacking or combining. Dashboard text uses the plain `filter <field>=…` form, chosen for clarity.

[Intent brief](intent-brief.md) · [Implementation plan](implementation-plan.md) · [Reference packet](references/README.md)
