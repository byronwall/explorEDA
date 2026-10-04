# Remaining analytical chart stack

Byron approved this sequence after Metric Card PR #114. Each branch starts from the previous branch. Work stays in this thread without subagents.

| Step | Addition | Branch | PR | Status |
| --- | --- | --- | --- | --- |
| 1 | Metric card | `codex/metric-card` | #114 | In review |
| 2 | Calendar time series | `codex/calendar-time-series` | #115 | In review |
| 3 | Grouped bars | `codex/grouped-bars` | #116 | In review |
| 4 | Stacked and 100% bars | `codex/stacked-bars` | #117 | In review |
| 5 | Area and stacked area | `codex/area-charts` | #118 | In review |
| 6 | Bubble scatter | `codex/bubble-scatter` | #119 | In review |
| 7 | Binned scatter density | `codex/scatter-density` | #120 | In review |
| 8 | Point map | `codex/point-map` | #121 | In review |
| 9 | Region map | | | Pending |
| 10 | Histogram, Distribution, and Other discovery | | | Pending |

Each PR needs a worked example, exact source tracing, linked selection where meaningful, keyboard controls, saved settings, and a changeset. Check the browser at 1280, 783, and 390 px. Run `pnpm check` on Node 24. Upload screenshots of the chart, trace inspector, and configuration menu with `gh --attach`.

Correlation matrices, waterfall, hierarchy charts, missingness views, and domain charts remain outside this stack.

## Calendar time series evidence

PR #115 adds UTC day, week, and month summaries to Line Chart. It includes source tracing, exact period and facet selection, saved settings, and a worked example. All 495 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard selection, invalid inputs, signed sums, and dark mode. Four screenshots are attached to the PR.

## Grouped bars evidence

PR #116 adds series within each category to Bar Chart. It includes exact pair and facet selection, source tracing, saved settings, and a worked example. All 498 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard selection, counts, sums, averages, and reset. A dark fixture checked signed values, typed and missing categories, invalid inputs, and long labels. Five screenshots are attached to the PR.

## Stacked bars evidence

PR #117 adds stacked counts and sums, plus percentage shares, to split Bar Charts. Traces show segment records and category denominator records. All 500 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard selection, reset, signed totals, zero totals, invalid inputs, and dark mode. Six screenshots are attached to the PR.

## Area charts evidence

PR #118 adds area and stacked-area display to calendar summaries. Traces show band bounds and the source records for each contributing series. All 502 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard selection, counts, sums, averages, reset, signed areas, gaps, zero fill, invalid inputs, and dark mode. Six screenshots are attached to the PR.

## Bubble scatter evidence

PR #119 maps a numeric field to bubble area in Scatter Plot. Traces show source values, the full-source size domain, and the radius calculation. All 504 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard and pointer selection, overlap, linked filtering, size changes, reset, zero, invalid inputs, and dark mode. Six screenshots are attached to the PR.

## Binned scatter density evidence

PR #120 adds rectangular count bins to Scatter Plot. Traces show exact intervals, source rows, omitted coordinates, and color values. Bin edges and the automatic color maximum stay fixed across filters and facets. All 506 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, keyboard and pointer selection, row tracing, linked filters, controls, and reset. A separate CSV count confirmed the selected bin and filtered result. Dark fixtures checked shared boundaries, invalid inputs, empty results, and exact facet selection. Six screenshots are attached to the PR.

## Point map evidence

PR #121 adds maps with explicit latitude and longitude fields, point area, and color. Traces show raw and prepared inputs, source rows, projection settings, size calculations, omissions, and points outside the view. Pan and zoom preserve row selection. All 509 tests passed on Node 24. Browser checks covered 1280, 783, and 390 px, chart creation, preview edits, pointer and keyboard selection, overlapping points, linked filters, facets, pan, zoom, and reset. Dark fixtures checked zero, invalid values, negative sizes, poles, and the date line. Six screenshots are attached to the PR.
