---
title: "Analytical chart coverage"
slug: "analytical-chart-coverage"
phase: intent
status: current
last_updated: "2026-10-02"
---

# Analytical chart coverage

## My read

Byron wants a deeper evaluation of the chart types and interactions in explorEDA. The desired experience is a workspace where a useful next question has a direct answer. He calls out conspicuously missing primitives and wants future users to feel that the toolkit is complete and pleasant. Calendar heatmap, maps, Sankey, and parallel coordinates now matter to him soon. On 2026-10-02 he asked to start implementation: three meaningful new charts or upgrades, each in its own pull request with screenshots. Map and Sankey order still depends on their first datasets.

The Pro review gives a strong candidate sequence: close the discontinuity between category bars, grouped measures, selection, and source inspection; then add a heatmap, calendar-aware time series, and metric cards. It also names reference marks, relationship views, cumulative distributions, comparison, and selection history. Its linked 21-item backlog and acceptance checklist are now available. They add exact tests and two useful near-term tasks: expose hidden Histogram and Distribution modes, and make the Row Chart's Other bucket inspectable. These remain Pro recommendations, not an approved feature backlog.

The first release should make one common analytical journey reliable: group a measure, select a group, watch linked views change, and inspect the records behind the value. This tests the consistency that future chart types need. More chart names cannot create the desired sense of completeness if the same click means filter in one view and inspect in another, or if measures disagree. A heatmap is a plausible first new family after that common path works. Calendar grouping is a separate, larger question because it needs time boundaries, missing-period rules, and a source-row mapping.

## What matters most

- Answer common category, measure, time, distribution, and relationship questions without external preprocessing.
- Keep linked selection, inspection, and record provenance consistent across views.
- Make useful existing modes discoverable before reimplementing them.
- Treat analytical meaning, defaults, and reversibility as part of chart quality.

## The experience or behavior you appear to want

An analyst opens orders, groups revenue by region, selects a segment, and sees other views and a metric change. They can inspect contributing rows, clear or undo the selection, and restore the analysis. Later, they can compare two categories in a heatmap or form a weekly series from raw dated records without preparing a pivot outside the app. Each view states its metric, population, and missing-value treatment.

## Boundaries

### Must be true

- A mark's filter action and inspection action must not compete or silently change meaning.
- Group values must retain source membership, including values excluded from a numeric reducer.
- A saved selection cannot silently change because a chart was resized.
- New views must have keyboard-accessible essential actions and clear zero, missing, and invalid states.

### Must be avoided

- Do not build a universal visualization grammar or query engine before one coherent path works.
- Do not treat a matrix renderer as a correct correlation, cohort, or retention analysis by itself.
- Do not infer runtime smoothness or performance from source review alone.

## What seems settled

- Histograms, violin and beeswarm modes, faceting, a pivot, and contributor inspection already exist in some form.
- The grouped-aggregate bar currently inspects on click while a category bar selects. This is a real interaction gap.
- Everyday two-dimensional work ranks above more 3D variants or decorative gauges.

## Possibilities, not decisions

- Heatmap is the strongest candidate for the first new chart family; metric cards may be a smaller addition.
- Grouped/stacked bars, time rollups, references, ECDF, density, bubble encoding, and correlation-to-scatter are possible follow-ons. Their order depends on actual use.
- Calendar heatmap, maps, Sankey, and parallel coordinates need near-term designs. Their first data shapes decide their exact order; they are no longer distant gallery ideas.

## Current reality that matters

At `main` `22a9bd3`, `calculateGroupedAggregate` has one group field and count, sum, or average, with contributors and exclusion reasons. A grouped bar still only inspects on click; `RowChart` still forms a height-dependent Other bucket. The registry has eleven view types. Three slices are now in review: grouped bars select their group (byronwall/explorEDA#105), a categorical heatmap (byronwall/explorEDA#103), and a calendar heatmap over a shared UTC daily rollup (byronwall/explorEDA#104).

## Next step after confirmation

Review and merge the three slices. Then decide the next one from real data: the Row Chart Other repair and distribution presets, a metric card, or the first map, Sankey, or parallel-coordinates proof.
