# Scatter matrix performance

Measured locally on 2026-10-07 on an Apple silicon laptop with Chrome for Testing 1234 and the demo dev server. The targets come from the [scatter matrix plan](intent/scatter-plot-matrix/implementation-plan.md): about 100 ms of brush feedback at 5 fields × 100,000 rows, and under 500 ms at 10 fields.

## What keeps brushing fast

- **Layout and selection are planned separately.** Domains, bands, positions, correlations, and diagonal bins don't depend on the matrix's own filters. A brush reuses them and only recounts the selected rows (`planMatrixLayout`, `planMatrixSelection`, `withSelectedBars`).
- **One position array per field.** A cell reads the column field's array for x and the row field's array for y, so 10 fields hold 10 arrays, not 90.
- **A cached gray layer.** The context canvas holds every row and redraws only when the layout changes. A brush redraws only the selected rows on a second canvas.
- **Small points go straight into pixels.** When the radius is 1.5 px or less, each point adds one to a per-pixel count. A pixel's alpha is 1 − (1 − opacity)^count, the same result as drawing the color that many times with source-over. Larger points still draw as circles.
- **Large drags preview in the matrix.** Above 20,000 rows, a drag updates only the matrix, at most once per frame, and filters linked charts once, on release. Smaller data filters linked charts live.

## Planner benchmark

`pnpm --filter exploreda exec vitest bench --run src/components/charts/ScatterMatrix` runs `matrixPlan.bench.ts` on seeded data from `src/test/fixtures/matrixData.ts`. Both triangles draw points, which is the worst case. "Mixed" fields are about one-third categorical. Times are means in Node with jsdom.

| Rows    | Fields    | Full plan | Brush on a planned layout | Full replan before the split |
| ------- | --------- | --------: | ------------------------: | ---------------------------: |
| 10,000  | 5         |    3.6 ms |                    0.6 ms |                            — |
| 10,000  | 10, mixed |   13.1 ms |                    0.9 ms |                            — |
| 100,000 | 5         |   34.4 ms |                    6.0 ms |                      36.5 ms |
| 100,000 | 10        |   74.7 ms |                    9.2 ms |                      71.2 ms |
| 100,000 | 10, mixed |  122.5 ms |                    8.9 ms |                     121.6 ms |

## Brush feedback in the browser

Each run serves a generated CSV in place of the penguins file and rewrites the example's field list. It drags across one cell in 20 steps at a 1600 × 1200 viewport. The time runs from the mark the matrix sets when a selection changes to the end of its point drawing (`eda-scatter-matrix-update` in the Performance panel). Below 20,000 rows that includes every linked chart's update. Above it, drag steps measure the matrix alone, and the release commit is the maximum.

| Rows    | Fields                       | Median |    p95 | Release (max) |
| ------- | ---------------------------- | -----: | -----: | ------------: |
| 10,000  | 5                            |  56 ms |  88 ms |         88 ms |
| 10,000  | 10, points in both triangles |  58 ms |  93 ms |         96 ms |
| 100,000 | 3                            |  16 ms |  24 ms |        693 ms |
| 100,000 | 5                            |  25 ms |  41 ms |        681 ms |
| 100,000 | 10                           |  51 ms |  88 ms |        721 ms |
| 100,000 | 10, points in both triangles |  59 ms | 110 ms |        779 ms |

With box plots above the diagonal at 100,000 rows × 10 mixed fields, each brush step recounts every box from rows sorted once per layout: 64 ms median, 84 ms p95.

Before the pixel path and the preview, the same 100,000-row drags took 280 ms median at 5 fields and 340 ms at 10 fields, with p95 values of 700–930 ms.

Releasing a brush on 100,000 rows still takes about 0.7 s. A CPU profile of that commit puts most of it outside the matrix: the workspace recomputes field statistics for every filter change (`calculateColumnStatistics`, `useFilteredFieldProfiles`), and the demo serializes its history. The matrix's own share is about 25 ms. The same cost follows any chart's filter on data this size.

## Rerunning

The browser runs use Playwright scripts that are not checked in. To repeat a run, start `pnpm --filter demo dev` and serve a generated CSV for `/datasets/palmer-penguins.csv`. Then set the matrix's `fields` in `scatterMatrixDashboard` and drag across a cell while recording `eda-scatter-matrix-update` measures. CPU load changes absolute timings between runs.
