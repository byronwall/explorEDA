# Analytical chart coverage

Reviewed against `3873c27` on 2026-10-04. This guide describes delivered behavior, data contracts, and limits.
The initiative retired on 2026-10-04. Byron waived the remaining acceptance checks.
The [initiative history](initiative-history.json) records closure; no follow-up work remains for this initiative.

## Chart families

The [registry](../packages/explorEDA/src/charts/registerAllCharts.ts) registers 18 view types.
Histogram and Distribution use existing saved types. Line, bar, scatter, and map modes do not create separate registry entries.

| Family | Delivered behavior | Selection and source inspection |
| --- | --- | --- |
| Bar | Category counts, numeric histograms, grouped measures, series groups, stacks, and percentage stacks. | Categories, numeric ranges, or an exact category/series pair. Traces retain contributors and stack denominators. |
| Row | Ranked category counts and an Other member list with search and paging. | Select actual typed member values. Resizing changes presentation, not saved member filters. |
| Distribution | Box and violin modes, observations, and beeswarm overlays. | Group selection; traces explain statistics, density inputs, exclusions, and source observations. |
| Scatter | Row points, numeric bubble area, and rectangular count-density bins. | Point and range selection; traces explain source inputs, size calculations, or exact bin intervals. |
| Line | Raw observations and UTC day/week/month summaries, optionally split by category. Calendar summaries support line, area, and stacked area. | Date period and series filters; time traces retain bucket bounds, source IDs, and band bounds. |
| Heatmap | Two categorical fields with count, sum, or average, axis limits, and cell traces. | One exact pair uses two intersected value filters. Row and column labels can select their category. |
| Calendar | UTC daily counts, sums, or averages in a year grid or compact month view. | Exact day, extended date span, or month selection; traces retain date boundaries and contributors. |
| Metric Card | Count, sum, or average for rows passing active filters. | Source inspection. Filtered cards compare the same metric with all source rows. |
| Map | Point coordinates with area/color encoding, or Region mode with shared local GeoJSON assets and typed joins. | Exact point rows or region keys; traces report omissions, joins, projections, and contributors. |
| Sankey | Two to six ordered categorical stages per row, count or nonnegative sum, missing-stage policy, and bounded Other nodes. | Nodes select stage values. A link selects its adjacent stage pair. Traces retain path/link contributors and excluded measure reasons. |
| Parallel Coordinates | Two to twelve numeric or bounded categorical axes, reorder, inversion, and one line per complete row. | Axis filters intersect. Bounds stay in data units; traces identify source rows and vertices. |
| ECDF | At-or-below and at-or-above curves, optional color groups, quantiles, and an overall curve. | Threshold or range on source values. Traces name valid denominators, ties, exclusions, and IDs. |

Pivot, source table, Summary, Color Legend, Markdown, and 3D Scatter complete the registry.
See the [feature inventory](application-feature-inventory.md#chart-and-view-catalogue) for their existing behavior.

## Shared analytical rules

A group has source members and numeric contributors. A missing measure can belong to the group while contributing no amount.
Use `summarizeGroup` for shared count, sum, and average semantics. Do not average period averages to calculate a larger period.
[UTC rollups](../packages/explorEDA/src/lib/dailyRollup.ts) define calendar boundaries and retain source IDs.
The inclusive date filter ends one millisecond before the next period starts.

Keep valid zero, no source rows, and no valid numeric inputs distinct. Stack counts and sums; do not stack averages.
Percentage stacks need a valid denominator. Signed values need explicit treatment; they cannot silently become positive shares.

Normal activation applies the mark's selection contract. Alt-click or Alt-Enter opens its trace; the chart header also exposes tracing.
Avoid chart-level Inspect buttons. Keep metric, fields, and active filter state visible.
Saved selections use values and intervals, never displayed rank, pixel coordinates, or a computed Other label.

One selected categorical pair maps to two intersected field filters. Independent field filters cannot represent arbitrary unions of pairs.
A Sankey stage pair is a field predicate. Its filter population can differ from included numeric flow contributors.
Distinguish missing stages and invalid weights when interpreting source and numeric contributor counts.

Maps use supplied coordinates or local geometry. They do not need geocoding, tile servers, or provider credentials.
Region keys keep their types; duplicate features can form one region. Geometry assets serialize with workspace settings.
Sankey stage index participates in node identity. Equal labels in different stages do not create the same node.
Parallel-coordinate axis filters stay fixed when axes move, invert, or resize.

## Implementation evidence

The original grouped-bar, heatmap, and Calendar slices are present at the reviewed revision.
Git merge history confirms the Metric Card and later stack PRs #114–#123 are merged.
Sankey merged through #107; ECDF through #108. Parallel coordinates is also present and registered.
The old stack's “In review” labels were obsolete.

Source and existing tests cover grouped selection, category pairs, numeric exclusions, UTC boundaries, stack denominators,
bubble size, density membership, map joins and geometry restore, Other member filters, and metric card restore.
Sankey tests cover stage identity, flow conservation, exclusions, node/link selection, and keyboard access.
Parallel-coordinate tests cover brush intersections, reorder, inversion, resize, categorical limits, and keyboard actions.
ECDF tests cover ties, valid denominators, thresholds, source traces, and keyboard steps.

Fresh `pnpm check` passed on Node 24 during this review: UI conventions, both builds, type checks,
530 library tests, and 21 demo tests. The demo emitted an existing React `act` warning.
No fresh browser run was performed for this documentation review.

Historical stack records report browser checks at 1280, 783, and 390 pixels for Metric Card through chart discovery.
Those records are earlier evidence, not a fresh browser run against this revision.
Cross-view comparisons and browser restores remained unverified at retirement. Byron explicitly waived that remaining work.
Retirement records the accepted scope; it does not report those checks as passed.
Broader visual/example review stays with the [example coverage initiative](intent/data-viz-review-and-example-coverage/intent-brief.md).

## Analysis options

The chart expansion request is delivered in code. Additional ideas require an observed task and a new priority decision:
constant reference marks, regression/interval layers, rolling periods, frozen-baseline distribution comparison, selection undo,
and an edge-list Sankey mode. The existing Metric Card all-row comparison is not a frozen baseline.
ECDF's overall curve is not a saved baseline snapshot.

Correlation, missingness, cohort, hierarchy, waterfall, network, funnel, retention, and Gantt views need their own data meaning.
A matrix or path renderer alone does not supply it. A universal chart grammar remains separate authoring scope.
Use a small local fixture and a direct source-row comparison before adding another family or shared abstraction.
