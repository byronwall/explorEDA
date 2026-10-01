---
title: "Project and task views"
slug: "project-task-views"
phase: intent
status: current
last_updated: "2026-09-29"
---

# Project and task views

## My read

A project should hold several related task views over one source dataset for now. Users need to switch between analyses and move from an overview to detail without losing their work. They should reuse field definitions, color scales, and filters across those views. Side-by-side comparison is lower priority.

Multiple sources are a separate initiative. Products, orders, and customers remain the motivating example for that future work. They no longer determine the scope of the current view system. The current product can use a supplied order table with the fields its views need.

Shared field definitions and color scales should probably update every dependent view immediately. Keeping different current interpretations in per-view snapshots would make changes difficult to understand. History snapshots for Undo are separate from that rule: there is still one current shared definition at any moment.

Filters identify fields, thresholds, and selected values. Users apply them to remove bad data or focus on a region of interest. A saved filter should work in another view even when no visible chart plots its field. A dedicated Filters section keeps these independent conditions visible and controllable.

A view can accept a parameter and open from another view with useful context. Users and developers can both create views and their connections. Opening another entity can reuse a detail view or leave another instance open. Easy duplication matters more than fixing one permanent tab policy now.

## What matters most

- Keep the current project, views, and agent workflow single-source.
- Support switching analyses and opening details without losing work.
- Reuse field-based filters independently of displayed charts.
- Apply shared definition changes across dependent views.
- Let users create, connect, and duplicate task views.

## The intended experience

A user opens an order overview and creates charts and saved filters. They open a detail view for a selected store or customer represented in that same dataset. They can configure the destination and parameter connection themselves. Another view can use a saved condition without including its field in a chart.

The user duplicates a view to keep another investigation open. A shared color or field definition change reaches every view that references it. Developers can prepare the same views and connections through runtime configuration.

A project's definition supplies shared settings. View settings supply task-specific layout and choices. The active analysis should be explainable through those current definitions rather than copied shared settings that drift independently.

## Boundaries

One source supplies the current project's working data. There are no cross-table lookups or relationship-based filters in this initiative. See [multiple sources and lookups](../multi-source-analysis/intent-brief.md) for that separate direction.

A field absent from charts differs from a field absent from the source. The first should remain filterable. The second needs visible applicability in the Filters section. Adding an arbitrary filter must not falsely claim that it restricts the current data.

Automatic saving, explicit Save, and persistence of temporary selections remain undecided. Preserve the requirement to retain meaningful work without inventing a save policy. Side-by-side comparison remains deferred.

## What seems settled

Independent switching and overview-to-detail navigation both matter. Views use one source for now. Saved filters store field names and conditions. Users and developers can build parameterized views and connections. Shared definitions use one current value across dependent views.

## Current reality that matters

`ExplorEda` accepts one row array and one saved analysis. The current provider has chart and Rows filters, but no independent reusable view filter collection. The chart engine can therefore remain useful while the project shell and filter ownership are shaped.

Whole-settings snapshots can preserve analysis state over the same source. Shared project definitions must be included when a checkpoint promises to restore the entire project. View-local history should not silently rewind unrelated shared changes.

## Remaining uncertainty

Save policy is deliberately undecided. History boundaries between a whole project and a single view need an example before implementation. A condition naming an unavailable source field needs a visible applicability rule.

## Next step after confirmation

Review an overview, parameterized detail view, duplicate, and independent filter over one order dataset. Keep source expansion separate.
