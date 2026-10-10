---
title: "Set and reset chart domains without filtering rows"
slug: "axis-domain-controls"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Set and reset chart domains without filtering rows

## My read

Analysts should change the region of a numerical chart they see without unintentionally changing the record population. Explicit axis bounds and reset behavior are useful when comparing facets, revisiting a detail, or showing a target range. A true logarithmic option is a separate related gap for strictly positive data.

The outcome is deliberate domain control. Full-source domains currently support stable comparisons under brushing. Preserve that useful default. A user should know whether a control changes the display, selects records, or changes the population used to derive the domain. Axis settings in a type declaration do not prove every renderer consumes them.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Separate display zoom from row selection.
- Preserve comparable facet domains when requested.
- Explain nonpositive values under a true log scale.

## The intended experience

Set a visible numeric interval, zoom into a region, and reset to the declared default. Confirm the source table count stays unchanged. Brush within the zoomed display and inspect the raw saved bounds. Restore the workspace and compare multiple facets on compatible domains.

## Boundaries

Do not silently map log to symlog. Specify omission or rejection for nonpositive values and show exclusions. Saved selections stay in data units. Avoid a universal pan/zoom toolkit, renderer rewrite, or domain-population policy before one existing chart proves the controls.

## What seems settled

Linear and symlog behavior are delivered. ECDF also has a working positive-value log option. Common true-log controls remain proposed, even though AxisSettings lists log. Shared source domains remain the default until a user selects another scope.

## Current reality that matters

numericScale.ts chooses symlog or linear. ECDF uses scaleLog through its own logX option. Explicit bounds now exist as `xAxis.limits` and `yAxis.limits` (in-place editing, #204), honored by scatter, bar, histogram, line, row, and box charts and clipped rather than filtered. The older AxisSettings `min` and `max` keys are an unused placeholder that every saved chart carries. Date axes, ECDF, heatmap, and map have no limits yet. Existing brushes use numerical inversion. Calendar and map-specific controls do not establish a common 2D domain contract.

## Expansion trigger

Expand when an analysis repeatedly needs manual bounds, display-only zoom, or positive data spanning orders of magnitude.

## Next step after confirmation

The [editing-in-place initiative](../in-place-chart-editing/intent-brief.md) owns access to axis editing and candidate drag gestures. This initiative owns domain meaning, accepted bounds, and reset behavior. One shared proof can check both without creating two limit models.

Use a positive fixture and one scatter chart. Change bounds without changing row IDs, brush, reset, and restore. Add zero and negative values before deciding true-log behavior. Verify facet comparison separately.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
