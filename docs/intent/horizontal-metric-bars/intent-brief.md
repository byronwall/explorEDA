---
title: "Rank a measure in horizontal bars"
slug: "horizontal-metric-bars"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Rank a measure in horizontal bars

## My read

Users should rank a meaningful measure by category without changing analytical contracts when they choose a horizontal layout. Long category names often fit a row chart better than vertical bars. Today the horizontal path counts rows, while the vertical path can use named measures and series. This is a narrower remaining gap than the old request to implement grouped and stacked bars.

The outcome is a direct revenue-by-region ranking with the same measure, category membership, colors, and linked filters as its vertical counterpart. Orientation should change presentation. It should not silently replace revenue with record count. Keep the existing inspectable Other membership and source trace behavior.

This is a near-term candidate because it extends an existing workflow. The suggested first proof is not an implementation plan.

## What matters most

- Show count, sum, or average in a horizontal ranking.
- Preserve category filters and exact contributor inspection.
- Keep ordering and Other membership understandable.

## The intended experience

Start with an existing vertical measure view. Change to a horizontal ranking, read long labels, select one category, and inspect its contributing rows. Sort by the measure. If categories exceed available space, show Other with its actual member list. Resize the chart and confirm the selected categories stay fixed.

## Boundaries

Do not rebuild vertical stacks or percentage bars. A sum and an average need different explanations; sorting is not a record filter. Expose metric sorting and explicit Top N only if they protect the ranking task. Stacked horizontal variants can follow after the single-measure path proves useful.

## What seems settled

This is a proposed completion of an existing analytical family. It is not approval to extract a new chart framework or merge every bar renderer.

## Current reality that matters

RowChartSettings has a category field and row-height settings. RowChart draws member counts. BarChartSettings supports aggregateId and series layouts. Shared named reductions already provide count, sum, and average.

## Expansion trigger

Expand to series or horizontal stacks when the same ranking task requires comparing subgroup contributions. Do not add them solely for chart-menu symmetry.

## Next step after confirmation

Compare a four-category horizontal sum against the existing vertical sum and a hand total. Select a category, inspect contributors, resize, and restore. Decide whether one shared measure path can support both presentations.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
