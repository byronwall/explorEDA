---
title: "Rank a measure in horizontal bars"
slug: "horizontal-metric-bars"
phase: plan
status: current
last_updated: "2026-10-10"
---

# Rank a measure in horizontal bars

## My read

Users should rank a meaningful measure by category in the row chart, such as revenue by region, with the same numbers they get from a vertical bar. Long category names fit a row chart better than vertical bars. Today the row chart only counts rows, while vertical bars can show a named grouped summary: count, sum, or average, optionally once per ID. Choosing horizontal rows should change the presentation and nothing else. It must never quietly swap revenue for record count.

The outcome is a revenue-by-region ranking whose values, category membership, colors, linked filters, and contributor trace match the vertical bar built from the same grouped summary.

## What matters most

- Rank count, sum, or average from a named grouped summary in the row chart.
- Hold the ranking steady while other charts filter, and show the filtered value against its unfiltered context.
- Keep Other membership fixed with an explicit Top N, so resizing never moves a category in or out.
- Show signed measures, such as profit, honestly on both sides of zero.

## The intended experience

Open a row chart on Region and pick the "Revenue by region" summary, or create Sum of Revenue in place. The rows rank by revenue across all rows. Brush another chart: each bar shrinks to its filtered value over a faint unfiltered bar, and the order stays put. Set Top 5, and the rest collect in Other with its actual members and a correctly pooled value. Resize the chart and nothing changes membership. Click a region to filter, Alt-click to see the rows that make up its value. The ranking is also writable in dashboard text.

## Boundaries

- The row chart is the horizontal home. Vertical bars gain no orientation switch.
- The measure is a named grouped summary that other charts can reuse, not a private per-chart calculation.
- Do not rebuild series, stacks, or percentage bars horizontally.
- Sorting is presentation; it never filters records.
- A sum and an average need different explanations, including for Other.

## What seems settled

Product answers on 2026-10-10 chose the row chart as the entry point, named grouped summaries as the measure, a held order with unfiltered context, explicit Top N, negative values, and dashboard text for the first release. Composition-mode rows and a "show as rows" switch from a vertical bar are later.

## Current reality that matters

The row chart counts rows, orders categories by their count across all rows, and sizes Other from the chart's height. Vertical bars read a grouped summary through `aggregateId`, order categories by data or label only, and have no Other. Saved-data validation already accepts `aggregateId` on any chart type.

## Expansion trigger

Expand to series or horizontal stacks when the same ranking task requires comparing subgroup contributions. Do not add them solely for chart-menu symmetry.

## Next step after confirmation

Start Milestone 1 of the [implementation plan](implementation-plan.md): the shop "Revenue by region" ranking beside its vertical twin, then Beijing's signed "above reference" average.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
