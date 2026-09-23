---
title: "Facet controls"
slug: "facet-controls"
phase: intent
status: current
last_updated: "2026-09-22"
---

# Facet controls

## My read

Faceted charts should keep the data in view and make secondary actions easy to find when needed. The current facet cards use a bold, underlined Focus action. The paging row uses prominent Previous and Next text, but it does not offer a quick way to choose which facets appear. A line above the charts explains shared scales and selection scope in terms that feel like implementation detail. Together, these controls use space and attention that should belong to the charts.

The requested change is a smaller, calmer control surface. Put a compact focus or expand control next to a facet name. Keep clicking a facet name as a filter action for now. Add a subtle picker between the paging actions so a user can choose visible facets without opening chart settings. Remove the sentence about shared scales and cross-facet selections. This request changes presentation and access to existing behavior. It does not ask to change how scales, selections, filters, or saved layouts work.

The screenshot shows a wrap layout with Online and Store. Those names and counts are examples. The same chart system also has a grid layout, so the work should leave its focus and paging controls usable.

## What matters most

- Keep each facet name and chart prominent.
- Make focus and facet visibility available through small, clear controls.
- Keep current filter behavior and chart data behavior.

## The experience you appear to want

In a faceted chart, a user can select a compact control beside a facet name to inspect it alone, then return to all visible facets. When paging is needed, the user can move back or forward or open the control between those actions to choose visible facets. The chart reflects that choice immediately. The explanatory line no longer appears.

## Boundaries

### Must be true

- The visible-facet picker uses the same selection as the existing chart setting.
- A user can reopen the picker after choosing only a small subset, including one facet.
- Controls have accessible names and work with keyboard input.
- The chart remains usable at wide, intermediate, and narrow widths.

### Must be avoided

- Do not turn a click on a facet name into focus in this pass.
- Do not change shared scales, selection scope, or saved layout data.
- Do not add native hover tooltips.

## What seems settled

The focus action becomes a small expand-style control beside the facet name in the wrap layout. The visible-facet control sits between paging actions. The technical sentence is removed.

## Possibilities, not decisions

The exact icon, popover layout, and wording inside the picker remain design choices. The grid layout has no name in each cell, so its per-cell focus control may need a different placement.

## Current reality that matters

`FacetContainer` owns focus and applies `visibleFacetIds`. Both facet layouts own paging. `FacetSettingsTab` already edits visible facets with `MultiSelect`. The checkout has edits in these files; preserve them.

## Next step after confirmation

The shape and plan are ready for local tickets. The next step is to implement and verify the two UI passes.
