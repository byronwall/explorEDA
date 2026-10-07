---
title: "Complete saved analyses and optional templates"
slug: "saved-view-templates"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Complete saved analyses and optional templates

## My read

Analysts may want to save a useful arrangement of charts and reuse it for another segment or compatible source. The demo already has named tabs, duplication, local persistence, history preview, and undo/redo. The remaining seed is separating a reusable view definition from temporary exploration state.

Byron tentatively expects all analysis choices to carry forward: arrangement, styling, formulas, axis limits, base restrictions, and selections. Treat complete analysis saving as the current expectation. A separate filter-free template workflow remains an optional seed, not a selected behavior. This is not a new request for basic saving.

This remains a future seed. Its expansion trigger is a proposed decision rule, not a release commitment.

## What matters most

- Preserve the complete saved analysis unless the user deliberately asks for a reusable template.
- Preserve intentional chart-local restrictions.
- Check required source fields before applying a template.

## The intended experience

Save and reopen the complete analysis with its settings and selections. If a later task calls for a fresh template, choose what to omit explicitly. Do not clear filters merely because a view is being reused. Keep current named views and history available. Applying templates to another source remains a separate optional experience.

## Boundaries

Do not add account storage, a server, or autosave to the package. Do not erase localFilters by assuming all filters are temporary. Source field compatibility and row identity need explicit treatment. Task-oriented view navigation is already owned by a separate initiative.

## What seems settled

Current app persistence and history are delivered source behavior. Template separation is an uncommitted extension. The host remains responsible for durable storage unless Byron changes that boundary.

The preference to carry everything forward is tentative. No new source-compatibility or template policy is selected by “I think all of those.”

## Current reality that matters

SavedViewsWorkspace serializes the source and tabs to localStorage, duplicates views, exports analyses, and captures bounded checkpoints. SavedDataStructure stores chart filters alongside view settings. BaseChartSettings also stores chart-local restrictions.

## Expansion trigger

Expand when duplicated views repeatedly require clearing incidental selections, or the same arrangement must be reused against another compatible source.

## Next step after confirmation

Check that current save and restore retain the whole analysis. Shape a template only when repeated use reveals a need to omit state deliberately. Do not require another policy answer before advancing the four first-pass priorities.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
