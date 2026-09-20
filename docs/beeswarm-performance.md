# Beeswarm performance

Measured locally on 2026-09-20. The box-plot example now enables beeswarm by default.

Each point previously scanned earlier points up to 100 times. Each comparison also recalculated both screen-space Y positions. Large groups therefore caused much more work than their SVG count suggested.

The fix caps each group at 300 sampled points, caches Y positions, and compares squared distances. An unchanged input produces the same sample. An empty optional field now returns a stable array, which preserves chart memoization. Box statistics still use every eligible value in each group.

The benchmark uses `apps/demo/public/correlated_medium.csv` with `Water Consumption (L)` grouped by `Mood Index`. The groups contain 6,547, 597, 409, 375, 363, 357, 353, 350, 334, and 315 rows.

It runs the actual layout function in Node 22.21.1 with a 50 px group width and a 356 px chart height. The Y mapping uses the installed `d3-scale` linear scale with the full data range and the chart's current 10% padding. Each case has three warmup runs and nine measured runs in one process. These timings cover layout only. They do not represent full browser load or SVG paint time.

| Case                                                        | Bee points |    Median |       P95 |
| ----------------------------------------------------------- | ---------: | --------: | --------: |
| Before: 1,000-point group cap and repeated Y-scale calls    |      4,453 | 690.33 ms | 719.59 ms |
| After: 300-point group cap and cached screen-space Y values |      3,000 |  28.25 ms |  29.13 ms |

Layout time fell by 96% in this run. The fixture has 33% fewer bee points. The chart shows a note when any group is capped.

Run the reproducible Node benchmark from the package directory:

```sh
node scripts/benchmark-beeswarm.mts
```

The script loads the previous implementation from baseline commit `f04e790` with `git show`, transpiles both source files with the installed TypeScript package, and calls both exported layout functions. CPU load can change absolute timings between runs.

The production browser comparison used the same example and a fixed viewport. Each timed run confirmed a CSS viewport of 1422 × 800 and a device pixel ratio of 0.9. The browser API request was 1280 × 720. Both builds used the same completion check: a chart SVG with more than 1,000 circles.

| Browser measure | Before | After |
| --------------- | -----: | ----: |
| First route open | 5,331 ms | 4,264 ms |
| Three repeated opens | 3,100 / 3,177 / 3,153 ms | 1,182 / 1,094 / 1,116 ms |
| Repeated-open median | 3,153 ms | 1,116 ms |
| Expand | 1,974 ms | 375 ms |
| Box-chart SVG circles, including one outlier | 4,454 | 3,001 |

Repeated-open time fell by 65%. These timings include browser automation and navigation overhead. They are local comparisons, not isolated CPU or paint measurements. An earlier comparison used different viewport sizes; these controlled runs replace it.

The old restore click timed out, although the chart returned to its default state. The final restore completed in 1,224 ms. The sampling note was visible at default, expanded, and narrow sizes. All ten groups remained visible. Browser checks found no console errors or warnings.

Validation passed: 199 package tests, 11 demo tests, package and demo type checks, builds, and the lean bundle check. Existing package lint errors remain in `categories.test.tsx`.

The layout still uses a bounded heuristic search. Many groups can still create many circles because the cap applies per group. A chart-wide pixel budget remains an option if that case becomes slow.
