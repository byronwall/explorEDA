---
title: "Scatter plot matrix with diagonal distributions — implementation plan"
slug: "scatter-plot-matrix"
phase: plan
status: draft
last_updated: "2026-10-06"
---

# Scatter plot matrix — implementation plan

## Plan at a glance

Start with the rule that makes everything else cheap: every cell uses its two fields' shared axes, continuous or band, and cell kinds only change what is drawn. The first milestone proves that rule with points in every cell on a mixed penguins matrix (numeric, categorical, and boolean-like fields), plus correlation text, histogram and bar diagonals, one brush, and gray context. That answers whether "scatters support all data types" holds up with the existing band axes and deterministic jitter, before any special cell kinds exist.

The second milestone protects the main technical risk. Point cells grow with the square of the field count, so at 10 × 100,000 rows the renderer may draw 9 million points. Measure it, cache the gray context, redraw only selected points, and pick a fallback before building on the renderer.

The third milestone adds the intentional categorical cells — box plots, count tiles, share bars — on top of the same axes, so brushing and dimming need no new rules. The fourth adds the ggpairs look: densities and group color. Settings, trace, narrow layouts, and release follow. Each milestone leaves a registered, saveable view that works on its own.

## Implementation strategy

- **First proof:** Penguins with bill length, body mass, species, and sex: points in every off-diagonal cell, r in numeric pairs, histogram and bar diagonals, brushing with gray context.
- **Primary seam:** A pure `planScatterMatrix(settings, snapshot, size)`: per-field axes (continuous or band) and pixel arrays, cell rectangles and kinds, pairwise counts, per-cell summaries, diagonal shapes, and brush state. Cell kinds are small planners that receive the two axes; the component only draws.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/ScatterMatrix`, `pnpm --filter exploreda check-types`, `pnpm --filter demo dev`.
- **Local data:** `apps/demo/public/datasets/palmer-penguins.csv` (missing values, species, island, sex); a seeded generator for 10,000/100,000 rows with up to 10 fields of mixed type, including a high-cardinality category and a date.
- **Live confirmation:** None needed; no external service.
- **Rollout and rollback:** Separate `scatter-matrix` registration and add-chart entry. Removing the entry hides it. Keep the type and its `saveDataUtils` case, because the validator rejects unknown chart types.

## Milestone 1: A mixed-type penguins matrix with points everywhere and linked brushing

Proves the shared-axis rule across types. Excludes box, tile, and bar cells, densities, color, settings, and trace.

- **Change — View definition and wiring**
  - `ScatterMatrix/definition.ts`: `type: "scatter-matrix"`, `fields`, region cell-kind settings, `pointSize`, `pointOpacity`, `filters`; intersecting `getFilterFunction` as in Parallel Coordinates.
  - Wire it into the `ChartSettings` union, `registerAllCharts`, the scatter group of `AddChartDialog`, `chartAccessibility`, and the `saveDataUtils` validator. `useCreateCharts` starts with up to five fields, numeric first.
- **Change — Axis model and planner**
  - Build one axis per field from all rows with `planScatterAxis`: numeric gets continuous, categorical and boolean get bands with `jitter`. Dates get a continuous axis from `dateTime` timestamps with date ticks — a matrix-specific branch, since the scatter view treats dates as bands.
  - Pairwise-valid populations, `passesOwnFilter` as in scatter, n only where reduced, r from `pairedStats` for numeric pairs, histogram bins from `marginalPlan` stacking, category bar counts for band fields.
  - Tests on penguins: counts, r matching `pairedStats`, domains and bands fixed under a brush, and brush output of range or value filters through the band-aware `brushFilters` logic. Add a date fixture test.
- **Change — Renderer**
  - One canvas for point cells, gray context first; SVG for strips, ticks, text, diagonals, and the brush. New brush replaces the old one; empty click clears.

### Desired end state

- On penguins, brushing a numeric pair, a species × mass cell, or a species × sex cell each produce the right two filters and gray every other cell consistently.
- Planner tests pass; browser check at wide, intermediate, and narrow widths; Byron judges readability.

## Milestone 2: Brushing stays responsive at 100,000 rows and 10 fields

- **Change — Benchmarks**
  - `scripts/benchmark-scatter-matrix.mts`, modelled on the beeswarm benchmark: planning at 10k/100k rows and 3, 5, 10 fields, all-numeric and half categorical, both triangles as points.
  - Development `performance.mark` from brush move to drawn frame, recorded in the browser with generated data.
- **Change — Redraw protections**
  - Offscreen cached gray context; redraw only selected points while brushing; rectangles for radii of 1.5 px or less; batch fills by color; one redraw per animation frame.
- **Spike — Fallback if over budget**
  - Decision required: response when brushing exceeds 500 ms at 10 × 100k, or misses 100 ms at 5 × 100k.
  - Evidence: profiles split into planning, context draw, and selected draw.
  - Fallback: live brush rectangle with filtering on release; then binned point cells from `densityPlan` above a row threshold.

### Desired end state

- `docs/scatter-matrix-performance.md` records the table and rerun commands; targets met or the fallback in place. Milestone 1 behavior and tests unchanged.

## Milestone 3: Intentional cells for categorical pairs

- **Change — Cell kinds on the shared axes**
  - Box plot for numeric × categorical, reusing `boxPlotCalculations`: gray box for all rows, narrower colored box for the selection, recomputed on brush. Include it in the Milestone 2 benchmark.
  - Count tiles and share bars for categorical × categorical, with filled share for the selection.
  - Clicking a box, tile, or segment selects its categories; rectangle brushing keeps working.
- **Change — Options**
  - Cell kind per region and pair type with the defaults in the shape brief; jitter width setting replacing the fixed `JITTER_SHARE` for matrix cells.
  - More than 12 categories: 11 most common plus Other; selecting Other filters to the remaining values. Test with the generated high-cardinality field.

### Desired end state

- Penguins shows box plots, tiles, and share bars that dim consistently with point cells; the benchmark still meets its targets with box cells.

## Milestone 4: ggpairs look — densities and group color

- **Change — Density diagonal:** binned, count-scaled kernel density helper beside `calculateKernelDensity` (about 512 bins, Scott's rule); gray full density with the selected density filled on top; default for numeric and date fields. Tested against the existing KDE on small inputs and benchmarked at 100k.
- **Change — Group color:** optional `colorField` and `colorScaleId` with the shared color scale; colored points, overlapping count-scaled group densities, stacked colored bars, and per-group r lines from `groupScatterRows`. Tested on penguins species.

### Desired end state

- Penguins colored by species matches the ggpairs iris reference; benchmark still meets targets.

## Milestone 5: Settable, traceable, and usable at every width

- **Change — Settings panel:** field list with `FieldMetadata` (add, remove, move, cap 10, all types), cell-kind selectors per region and pair type, jitter width, group color, point size and opacity; tooltips on non-obvious controls; `settingKeys` DSL entries with tests.
- **Change — Interactions:** Esc clears; status line "x of y selected"; hover on a reduced n names the missing field.
- **Change — Trace:** Alt-click or Alt-Enter rings the row in every point cell; `PlotChartPanel` trace entry lists the row's values per field.
- **Change — Narrow layout:** minimum cell size, scroll within the card, no page scroll.

### Desired end state

- Users configure fields, cell kinds, and color, brush any cell, and trace a row; `pnpm check:ui` passes; browser checks at three widths.

## Milestone 6: Shipped in the demo and package

- **Change — Demo and docs:** penguins example colored by species with mixed fields; `coverage.ts` entry; update `docs/analytical-chart-coverage.md`.
- **Change — Release:** `minor` changeset: "Adds a Scatter Matrix view for numeric, categorical, and date fields, with configurable scatter, correlation, box plot, and count cells, distribution diagonals, group colors, and linked brushing." Run `pnpm check` once; PR with screenshots at three widths.

### Desired end state

- Demo shows the matrix; `pnpm check` passes; PR has screenshots and the changeset.

## Open decisions and spikes

- Renderer fallback: see the Milestone 2 spike.

## Below the cut line

- Violin and faceted-histogram mixed cells; group-dodged box plots
- Contour cells, significance stars, Spearman, categorical association measures
- Opening a pair as a full chart, lasso, several brushes, in-matrix drag reordering
- Regression, marginal, and bubble layers inside cells
- Continuous date axes in the ordinary Scatter Plot (worth sharing once the matrix proves them)
