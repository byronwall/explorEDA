---
title: "Project and task views — shape brief"
slug: "project-task-views"
phase: shape
status: current
last_updated: "2026-10-04"
---

# Project and task views — what we are adding

**Outcome:** Users retain several analyses of one source and can recover earlier edits.

**Primary flow:** Open data → create or duplicate tabs → edit charts and filters → switch or reopen → review history.

## Feature scope

```text
Saved views over one source
├── PLANNED ADDITIONS
│   ├── Named view tabs
│   │   ├── Create, rename, duplicate, and switch views
│   │   └── Each view retains chart definitions, layout, and its own filters
│   ├── Visible filter state
│   │   ├── Filters section shows conditions and their scope
│   │   └── Filtering does not require that field on a visible chart
│   ├── Automatic local persistence
│   │   ├── Retain tabs, active tab, analysis settings, and committed filters
│   │   ├── Retain source data once and history within a proven storage budget
│   │   └── Show failed saves and let users export their current analysis
│   └── Undo and time travel
│       ├── Undo and Redo completed edits
│       ├── Timeline slider previews previous states and returns to the present
│       ├── Labels distinguish View, Filter, Both, and Shared changes
│       └── Restore a selected state and retain the displaced present in history
├── EVALUATE BEFORE COMMITTING
│   ├── Source size and retained history that fit local storage
│   └── Shared calculation and grouped-summary ownership
└── LATER POSSIBILITIES
    ├── Parameterized overview-to-detail navigation and filter inheritance
    ├── Named reusable filter presets and side-by-side comparison
    └── Multiple sources, server saves, and shared projects
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Switch tabs | Restore that view's charts and filters; keep other tabs unchanged. |
| Duplicate a view | Copy its current chart and filter settings; later local edits stay independent. |
| Finish a brush or settings edit | Save the completed state and record a history entry; pointer movement creates no entries. |
| Refresh or reopen | Restore saved client state and the source within the proven storage budget. |
| Change a shared definition | Update dependent tabs; label the checkpoint Shared. |
| Move the timeline slider | Preview a consistent earlier project state without replacing the saved present. |
| Restore a preview | Make it current; retain the displaced present as a recoverable checkpoint. |
| Save fails | Keep current work open, show that saving failed, and offer export. |

## Decisions and boundaries

**Appetite:** One project, one source, multiple tabs, automatic local saving, and recoverable history. Prove these in slices.

**Key decision:** Separate saved views from [parameterized navigation](../parameterized-task-navigation/intent-brief.md). Tabs provide value before destination parameters or inherited filters have rules.

**Ownership:** The project owns source rows and current shared field definitions and colors. Views own charts, layout, and filters. Duplication copies local settings. Shared calculations and grouped definitions need one concrete example before ownership is fixed.

**History proposal:** Use one chronological project timeline with full settings checkpoints, excluding repeated source rows. Categorize entries from changed state. Restore charts and filters together, so an old filter cannot target a missing chart. Undo and Redo step through completed edits. Preview is read-only. Editing after Undo appends a new checkpoint; older states remain available through the timeline. Tab switching persists the active tab without creating an analysis edit.

This is a proposed history scope, not a user decision. The smaller alternative is tabs with autosave alone. It proves retention quickly, but Undo and the slider remain required outcomes.

**Reuse and boundary:** Keep the existing single-source chart engine and saved-settings codec. The host owns local storage. State callbacks collect changes; restore runs on tab changes or explicit history actions. Keep chart filters and local Rows filters visibly distinct. Existing single-view restore remains usable while tabs are introduced.

**Storage proof:** Measure one project containing source rows, tab settings, and retained history. Inject write failure and reload failure. Do not silently drop source data or history to report success. If representative data does not fit, revise the storage boundary before claiming complete client persistence.

**First proof:** **Try:** Create Sales and Returns over a fixed order fixture. Give them different charts and filters. Switch, reload, and revisit one chart edit and one filter edit. **Observe:** Tabs restore independently; counts and layouts match; timeline labels match the edits; preview leaves the saved present intact. **Decide:** Continue only if retention and recovery work without navigation features. Resolve storage limits before expanding the dataset.

**Open choices:** Confirm project-wide history versus view-only history. Establish the source size and history retention target from a representative import.

See the [intent brief](intent-brief.md). Implementation planning has not started.
