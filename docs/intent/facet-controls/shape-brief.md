---
title: "Facet controls — shape brief"
slug: "facet-controls"
phase: shape
status: current
last_updated: "2026-09-22"
---

# Facet controls — shape brief

## Recommendation

Keep the existing facet state and chart behavior. Replace the wrap card's Focus text with a small, named expand control beside the label. Give grid cells a compact focus affordance without hiding their row and column headings. Remove the explanatory line from `FacetContainer`; its behavior stays in place. Put a small picker trigger between paging actions in each layout. Use the existing `visibleFacetIds` setting for its choices, so settings and chart controls always agree. Keep the picker accessible even after the choice reduces the page count to one.

## Problem and appetite

- **Problem:** Secondary facet controls take attention and space from charts, while quick visibility changes require chart settings.
- **Outcome:** Focus, paging, and facet visibility are clear, compact actions near the chart.
- **Appetite:** Two focused UI passes using current state and components.
- **Not in this shape:** New filtering semantics, local selection scope, scale changes, or a new facet store.

## Core shape

The chart continues to render from `FacetContainer`. A facet name still filters. Its adjacent focus control changes only the local focused facet. The paging row keeps its previous and next actions and gains a small picker trigger in the middle. The picker changes the chart's `visibleFacetIds` through the existing update path. An empty selection can use the existing empty state and Show all facets action. A focused chart keeps its return action.

## Current fit

- **Reuse:** `FacetContainer`, `FacetWrapLayout`, `FacetGridLayout`, the current page planners, `FacetSettingsTab`, and the existing popover and selection controls.
- **Add:** Compact controls and a picker view tied to current facet IDs.
- **Avoid or replace:** Remove the technical sentence. Replace bold underlined Focus text. Do not add another source of visibility state.

## How to make this go better

- **Prove focus first.** It changes no saved state and shows whether the new placement stays clear of names and charts.
- **Use current visibility state.** This keeps choices in the chart and settings in sync, including after reload.
- **Keep paging separate.** Page position is temporary; visible facets are a chart setting. Let the layout adjust when the choice changes.

## First proof

- **Question:** Can a compact control beside a wrap facet name focus and return without changing name-click filtering?
- **Proof:** One wrap chart with at least three facets and a focused view.
- **Observe:** Focus and return work by pointer and keyboard; a name click still filters; no technical sentence appears.
- **Pass / fail:** The action is findable without dominating the header, and the chart remains readable at 1280, 783, and 390 pixels.
- **Deliberately excludes:** The picker and any new chart state.

## Rabbit holes and no-gos

- Do not rewrite the facet layout planners or chart renderer for control changes.
- Do not make facet labels both filter and focus.
- Do not add a second visibility setting or native tooltip.

## Plan handoff

Ship the quiet focus controls and remove the line first. Then add the visible-facet picker to the paging row. Keep icon and picker presentation choices reversible.
