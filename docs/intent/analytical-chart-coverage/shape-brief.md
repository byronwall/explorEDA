---
title: "Analytical chart coverage — shape brief"
slug: "analytical-chart-coverage"
phase: shape
status: current
last_updated: "2026-09-21"
---

# Analytical chart coverage — shape brief

## Recommendation

Treat the first work as consistency, not a chart expansion campaign. Make one grouped measure chart select a source category while retaining a separate inspection path. Keep the existing aggregate computation and contributor data. Then expose existing distribution modes and repair the Row Chart's Other dead end. Use a two-field categorical heatmap as the first new family only if its single-cell behavior can reuse the same metric and source-row meaning. A metric card can follow as another consumer. Defer multi-cell tuple selection, stacked averages, and a generalized chart grammar.

## Problem and appetite

- **Problem:** Basic measure-by-category analysis splits across paths with different actions and reducer rules.
- **Outcome:** A user can move from a measure to a linked selection and its source records without a dead end.
- **Appetite:** One focused vertical slice, then one new chart family. The complete Pro wishlist is not one release.
- **Not in this shape:** All chart variants, domain-specific matrices, or new data infrastructure.

## Core shape

The existing grouped summary computes a metric over globally filtered source rows. A bar displays that result. Its mark can select the group through the current chart filter path; an explicit inspect control opens its contributors and reducer exclusions. A named scope and consistent formatting explain the value. The selection updates other views. The same metric and contributor behavior can later feed a heatmap cell and a card. The workspace remains usable after each increment, and the new chart can be omitted without changing old saved layouts.

## Current fit

- **Reuse:** `lib/aggregates.ts`, `BarChart`, `GroupedAggregateInspector`, `ChartDataPreview`, existing value filters, and order examples.
- **Add:** A distinct select action and one inspect affordance; focused tests for metric, scope, and source IDs. Add creation presets and an Other member list without duplicate renderers.
- **Avoid or replace:** A second reducer inside a new renderer or a new filtering engine before the existing one is proven.

## How to make this go better

- **Prove one normal question.** Start with revenue by region, not every reducer and display mode.
- **Keep semantics visible.** Say whether count, sum, or mean uses all rows or valid numeric rows. Inspect exclusions separately.
- **Separate actions.** Let a click select and provide a direct inspect control that also works without a pointer.
- **Bound heatmap selection.** Start with a single exact cell. Two independent field filters cannot represent arbitrary unions of pairs.
- **Verify against records.** Compare the aggregate value, selected IDs, inspection list, and exported matching rows on a fixed dataset.

## First proof

- **Question:** Can the current grouped result drive linked selection without losing provenance?
- **Proof:** A grouped revenue bar in the existing order example, with a select action and explicit contributor inspection.
- **Observe:** Other views filter, the selected group has the expected source IDs, and reset restores the prior state.
- **Pass / fail:** The bar, pivot, and source rows agree on value and population. If a grouped result cannot map cleanly to existing filters, solve that narrow boundary before a new chart.
- **Deliberately excludes:** Stacking, a second group field, and a heatmap renderer.

## Rabbit holes and no-gos

- An Other bucket derived from rendered height must not become a persisted analytical selection.
- Average is not an additive stacked metric. Percentages need an explicit denominator.
- Calendar buckets and missing periods need their own policy; area fill does not solve them.
- Do not claim feature completeness from the eleven registry names.

## Serious alternative

Add a heatmap immediately. It would make the gallery look broader, but it would inherit the same unresolved selection and metric meanings. The grouped-bar proof costs less and changes that risk before another renderer depends on it.

## Plan handoff

Build and browser-test the grouped-bar path. Keep heatmap and card as separate decisions after the first proof.
