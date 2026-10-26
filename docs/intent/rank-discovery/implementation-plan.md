# Rank-based pair discovery

Build Spearman into the existing Scatter Matrix, then add comparison, pair navigation, and continuation into original Scatter.
Keep raw measurements, authored matrix order, and linked records visible.
This is a proposed implementation plan, not permission to ship the feature.

Baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`, checked October 26, 2026.
See the [research summary](../../research/rank-discovery-2026-10-26/README.md) for decisions, sources, and local review.
The [Pro conversation](https://chatgpt.com/c/6adf0075-3e48-83ea-86b8-605d87cfc376) contains the full fixture tables and alternatives.
No open research PR is a dependency. Keep this React library in React and TypeScript; use pnpm.

## Statistical and state contract

- Read numeric values with `finiteNumber`; read datetime values with `timestampOf` from `src/lib/valueParsing.ts`.
  Use runtime typed values. Do not add coercion, category ordinals, or another parser.
- Exclude invalid coordinates before ranking each pair. Assign average ranks to exact ties, starting at one.
  Signed zeros tie. Close distinct values remain distinct.
- Rerank within each pair-valid color group. Compute pooled values and Other unions directly from their paired rows.
  Never average subgroup coefficients or subset whole-column ranks without reranking.
- Compute Pearson on original measurements and Spearman as Pearson on their ranks.
  Use stable centered arithmetic. Keep raw covariance, regression, and existing `pairedStats` unchanged.
- New discovery results require three pairs. Check that minimum before constants.
  Return `ok`, `insufficient-pairs`, `constant-x`, `constant-y`, `constant-both`, or `numerical-failure`.
  Existing two-pair numeric summaries keep their meaning. Their trace must explain the different minimum.
- Keep four disjoint counts: paired, X-only invalid, Y-only invalid, and both invalid.
  Their sum equals live rows. Label selected rows and drawing exclusions separately.
- Source rows after `localFilters` establish domains and categories. Peer/workspace filters and the chosen facet establish live rows.
  The matrix's own selection highlights rows; it does not change its coefficients.
- Axis limits, size omissions, and log display exclusions do not change the underlying pair population.
  Date statistics use finite timestamps. Time drawing requires lossless date-bound serialization through the existing parser.
  Mark unsupported calendar positions separately; do not round or delete statistical observations.
- Zero correlation does not mean no relationship. Difference between coefficients is a browsing rule, not a nonlinearity test.
  Exclude p-values, stars, causal claims, automatic clustering, and universal mixed-type scores.

Proposed optional settings:

| Chart        | Setting                                                          | Read default                                    |
| ------------ | ---------------------------------------------------------------- | ----------------------------------------------- |
| Matrix       | `correlation: "pearson" \| "spearman" \| "both"`                 | Pearson; M1 accepts only the first two          |
| Matrix       | `pairOrder: "fields" \| "spearman" \| "pearson" \| "difference"` | Authored field order                            |
| Scatter      | `compareRanks: boolean`                                          | False                                           |
| Scatter axes | Existing `scaleType: "time"`                                     | Existing saved behavior until explicitly chosen |

Do not write absent defaults on mount. Validate optional values in `saveDataUtils.ts` and add roots to `lib/dsl/settingKeys.ts`.
Preserve no-op host echoes, Dashboard text, undo, project save/reopen, and image export in each exposing milestone.
Save settings, not coefficients, rank columns, result caches, browser search, open state, or navigation references.
Keep `MatrixCell.r` and `groupR` Pearson-specific during migration. `cell.pairs` already means categorical counts.

## M1 — Native Spearman

An author can select Spearman, inspect pair/group evidence, and reopen the saved analysis.

**Implementation:** paths below are under `packages/explorEDA/src/` unless otherwise stated.

- Add internal `lib/pairCorrelation.ts` with pair collection, average ranks, centered correlation, counts, and unavailable reasons.
  Separate coefficient results by method. Detect constants before rescaling. Do not change the regression solver.
- Extend `components/charts/ScatterMatrix/definition.ts` and `ScatterMatrixSettingsPanel.tsx` with Pearson/Spearman.
  Check the supported 2–10 distinct fields at the calculation boundary; do not truncate loaded settings silently.
- In `matrixPlan.ts`, calculate each unique continuous pair and group once.
  Keep own-selection drawing separate from coefficient calculation in `ScatterMatrix.tsx` and `matrixCanvas.ts`.
- Extend `matrixTrace.ts`, `MatrixTraceBody.tsx`, and existing `charts/trace/ChartTracePanel.tsx` dispatch.
  Show method, paired/live counts, reasons, and original values. Derive bounded rank evidence on demand.
  Use the existing row trace and Rows drawer routes.
- Add saved validation, DSL keys, export tests, and provider echo/selection tests.
  `DISPLAY_ONLY_KEYS` is typed over common union keys; use the ordinary update path until an optimization is justified.

**Proof:** fixtures A–D below, swapped constant-side reasons, missing color group, actual Other folding, and independent pair populations.
Method edits preserve outgoing filters. Own selection causes no reranking; peer membership changes do.
Old saves remain Pearson without added keys or callbacks. New settings round-trip through save, text, undo, and reopen.

**Docs and example:** extend `apps/demo/src/docs/pages/scatter-matrix.mdx`, section “Correlation methods and paired rows”.
Register `rank-correlation-basics` in demo examples and coverage, with separate tied and missing-data views.
Add live steps, setting descriptions, and docs verification in the same milestone.

**Risk and acceptance:** complete-data tests can hide incorrect population ranks.
Accept only with exact memberships/counts/ranks, named unavailable results, readable at-rest method/count labels,
and real keyboard/pointer checks at 1280, 783, and 390 pixels.
Measure correlation-cell timing at 10k and 100k rows; do not promise an unmeasured row envelope.

## M2 — Compare and browse pairs

Add Both mode and a compact Pairs surface. Preserve the matrix's field order.

**Implementation:** add `ScatterMatrix/pairDiscoveryPlan.ts` and a bounded Pairs popover.
Extend `PlotChartPanel.tsx` header integration explicitly: its existing toolbar target serves table-like charts, not matrix facets.
One chart controller owns the chosen facet and one Pairs action; do not mount competing actions per facet.
Show up to 45 unique continuous pairs per facet, with signed r, rho, and n.
The browser is pooled across color groups within its selected facet; group results stay available in trace.

Use `JSON.stringify([a,b].sort())` as canonical pair identity, using code-unit ordering on original field keys.
Keep X/Y orientation separately. Transposition swaps directional counts/reasons, not coefficients or identity.
Order by authored fields, descending `|rho|`, descending `|r|`, or descending `|rho-r|`.
For metric ordering, put unavailable values last and break exact ties by canonical ID.
Do not sort rounded strings, use locale order, or apply an epsilon comparator.

Opening Pairs can compute both methods without changing saved cell settings.
Search filters names, not records. Pair focus stays on its ID through sorting.
Preserve mark clicks for selection, empty-space clearing, and Alt-click/Alt-Enter for trace.
Use explicit actions for navigation. Show an explanatory empty state when no continuous pairs exist.
Persist `pairOrder` and Both in the same milestone.

**Proof:** fixtures E–F below; no diagonal/mirrored duplicates; field reorder keeps identity.
At minimum cell size, show two labeled coefficients and n. Put extra groups in trace with a visible count.
Prove keyboard focus/return, bounded popovers, and no page overflow at all three widths.

**Docs and example:** “Compare and browse pairs” in the matrix docs; register `rank-pair-discovery`.
Use separate exponential and U-shaped views. Live steps choose Both, sort Difference, and inspect raw points.
Update coverage, descriptions, saved text examples, and docs tests together.

**Risk and acceptance:** an ordering can imply analytical certainty.
Accept with method/scope labels, explicit difference meaning, deterministic ordering, original points, and image-export proof.

## M3 — Original Scatter comparison and time axes

Add opt-in pooled comparison to ordinary Scatter. Implement chronological datetime axes as explicit work.
This milestone is useful before automated continuation. Existing date scatters keep their saved default behavior.

**Implementation:** extend `ScatterPlot/definition.ts`, settings controls, `scatterAxis.ts`, `scatterPlan.ts`,
`ScatterPlot.tsx`, `ScatterSvg.tsx`, and `planScatterPoints.ts`.
Add `scatterComparison.ts` adapting self-excluded facet rows to the shared helper.
Carry numeric/datetime kind alongside geometry. Use timestamp positions, UTC ticks through existing axis tick inputs,
typed date-range brushing, source-derived domains, hidden/excluded notices, and original row trace.
Read new comparison inputs before size/log/viewport omissions.

Audit numeric-only guards in `pairedSummary.ts`, `fitPlan.ts`, `useScatterFits.ts`, `FitLabels.tsx`,
and reached density/surface consumers. A continuous time axis must not enable numeric covariance or fits by accident.
Keep numeric means/covariance/summary settings; suppress only a duplicate visible Pearson line when comparison is active.
Use `saveDataUtils.ts`, DSL, echo, and history tests for `compareRanks` and explicit time axes.

**Proof:** equivalent offset timestamps tie; Jan 1/2/10 positions have spacing ratio 1:8.
Date-only Jan 1–2 inclusive range selects IDs `[0,1]` from fixture G.
Its owner retains three self-excluded pairs; a peer receives two and shows insufficient pairs.
Finite `9e15`, fractional `0.25` milliseconds, and unsupported extended years remain statistical inputs
but receive named drawing exclusions when lossless date bounds are unavailable.
Invalid `2026-02-30` is excluded statistically.
For numeric X=Y=`[-1,1,2,3]`, size=`[1,1,null,1]`, log X draws IDs `[1,3]` but n remains four.
An X maximum of 2.5 leaves visible ID `[1]`, without changing n.

**Docs and example:** create `apps/demo/src/docs/pages/rank-discovery.mdx`, “Compare original measurements”.
Link from existing matrix/scatter pages and register `rank-original-scatter` with numeric/date views.
Add live steps, catalogue entry, setting descriptions, and coverage together.

**Risk and acceptance:** date continuity can bypass numeric-only assumptions.
Accept with correct date geometry/filters, explicit drawing exclusions, unchanged numeric fit tests,
save/text/echo/undo/reopen proof, accessible controls at three widths, and image evidence.

## M4 — Continue from pair to original records

Open a prepared standard Scatter through existing draft/placement controls.
It has original fields, color/scale, points, comparison enabled, fits off, and empty outgoing filters.
Copy source local scope plus typed semantic predicates for the chosen facet. Turn destination faceting off.
Do not copy runtime facet IDs, source outgoing filters, or record-index lists into destination scope.

**Implementation:** add a narrow prepared-draft entry to `plot/ChartDraftContext.tsx`.
Use existing `hooks/useCreateCharts.ts`, `AddChartDialog.tsx`, and `ChartPlacementLayer.tsx`.
Use a concrete Scatter or distributive draft type; current `Omit<ChartSettings,"id">` loses chart-specific keys.
Extract pure draft orientation/scope construction. Reuse facet predicates after checking their typed/missing semantics.

Default “Open Scatter” retains the matrix selection. In linked mode that selection narrows the destination.
Show source and destination paired counts by name. A separate “Clear matrix selection and open” action
clears only that source's outgoing filters on final acceptance. Omit it in local-selection mode.
Do not change saved state for preview or cancellation.

Preview reflects current linked rows, even when the secondary action is selected.
Label its future after-clear count separately. Recompute for current data and final draft fields/local scope.
For that count, add a small read-only wrapper query for peer-filtered IDs before source local restrictions.
`CrossfilterWrapper.getAllData` currently reads `group.all()` before applying `getPopulationTest`.
Reuse that boundary, then `chartPopulation.restrictToPopulation` with final destination scope and typed pair validity.
Do not reuse the matrix's already restricted live IDs if the draft broadens its copied local scope.
Changing the draft to another chart type discards source-clear intent and pair-specific counts.

Prevalidate source/settings/layout before acceptance. Coalesce clear/move/add callbacks with `holdStateChanges` and `try/finally`.
It batches notifications; it does not provide rollback or atomic subscriber state.
Change the provider mutation boundary only if checks show that batching cannot meet one accepted undo operation.
`addChart` generates an ID and returns void; obtain the accepted ID through a narrow typed placement result when needed.
Keep one transient origin/focus record in existing workspace context. Do not add a general navigation service.
Return restores source-pair/header focus while retaining accepted charts and filters.

**Proof:** fixture C matrix with A selected stays n8/rho1/21.
Default destination is n3/rho1. Secondary preview is n3, projected/final destination n8/rho1/21.
With a workspace filter retaining A, clearing the matrix still yields n3.
Test local-selection mode, typed/missing facets, broadened draft local scope, source removal, cancellation, placement Back,
one callback/undo entry, redo, read-only mode, and destination selection filtering the matrix as a peer.

**Docs and example:** “Continue from a pair to records” in rank-discovery docs; register `rank-linked-inspection`.
Live steps open/cancel, accept, inspect an original row, and return. Include the n8→n3 distinction.
Update coverage and docs verification in the same milestone.

**Risk and acceptance:** hidden population changes undermine comparisons.
Accept with final membership/owner checks, reversible acceptance, honest preview labels,
and keyboard/touch operation at 1280, 783, and 390 pixels.

## M5 — Measure and extend exact execution

Measure actual Pearson/Spearman/Both/group workloads in `ScatterMatrix/matrixPlan.bench.ts`.
Its current points-only cases do not measure rank cost. Record device, browser, revision, row/field/group/facet counts,
warm/cold timing, median/p95, longest main-thread task, and peak added memory.
Use ten fields at 10k/100k rows; use one million only as a deliberate stress case.

Keep M1's simple implementation as the reference. Add sorted-index reuse or a chart-local worker only when measurements justify it.
Sorted source indices can be reused, but each surviving pair/group must receive new average ranks.
Identity includes source/type/value revision and exact membership/group identity. Equal n is insufficient.
Own selection, resize, title, or palette-only changes must not start rank work.
Reject stale result revisions and avoid mixing old coefficients with new counts/order.
Do not claim synchronous sort is cancellable. Do not silently sample or approximate ranks.

**Proof:** reference/optimized equivalence on fixtures and seeded data; same-size opposite memberships;
rapid A→B→C publication; cancellation/unmount cleanup; bounded evidence buffers.
Choose timing targets after measurement rather than adopting Pro's suggested 50 ms/1 s thresholds as established limits.
The proposed endpoint clamp of `16 * Number.EPSILON` also needs numerical investigation before becoming a fixed contract.
Require finite results, separate numerical failure, and test large/small finite values and adjacent doubles.

**Docs and example:** “Performance and exactness” in rank-discovery docs; register local seeded `rank-scale-check`.
Use a modest default size and an explicit large-run choice. No external fetch or new service.

**Risk and acceptance:** caching the wrong cohort is faster but incorrect.
Accept optimization only with exact population proof and recorded performance improvement.
Publish the measured supported envelope and truthful pending/export behavior.

## Small exact fixtures

Use source IDs in listed order. Coefficients use absolute tolerance `1e-12` for these small well-scaled cases.
Ranks, membership, counts, reasons, and pair IDs require exact assertions.
The conversation supplies additional parser, save/reopen, numerical, and ordering cases.

| Case                | Input                                                                                                                                 | Expected                                                                                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| A: ties             | X `[1,1,2,3]`, Y `[10,20,20,30]`                                                                                                      | Ranks `[1.5,1.5,3,4]` / `[1,2.5,2.5,4]`; rho `5/6`, r `4/sqrt(22)`, n4                                                                        |
| B: missing pairs    | Rows `(x,y,z)`: `(1,1,1)`, `(2,null,2)`, `(3,null,3)`, `(4,2,null)`, `(5,3,null)`, `(null,4,4)`, `(null,null,null)`, `(Infinity,5,5)` | XY IDs `[0,3,4]`, XZ `[0,1,2]`, YZ `[0,5,7]`; every pair has counts `(3,2,2,1)` and rho1; XY r `sqrt(12/13)`                                  |
| C: groups           | A: X `[1,4,5]`, Y `[1,2,3]`; B: X `[2,3,6,7,8]`, Y `[50,40,30,20,10]`                                                                 | A rho1/n3; B rho−1/n5; pooled and represented A∪B Other rho `1/21`/n8, r `−58/sqrt(42*2472)`                                                  |
| D: minimum/constant | X `[1,1,1]`, Y `[1,2,3]`; then X `[1,2]`, Y `[10,20]`                                                                                 | Constant-X unavailable at n3; discovery insufficient at n2; legacy summary r1 and covariance `[[0.5,5],[5,50]]`                               |
| E: shapes           | X `[1,2,3,4,5]`, Y `[1,10,100,1000,10000]`; separately X `[-2,-1,0,1,2]`, Y `[4,1,0,1,4]`                                             | Exponential rho1, r `20988/sqrt(763192368)`; U-shape rho=r=0 despite Y=X²                                                                     |
| F: ordering         | Fields `x,inc,dec,c`; X=Inc `[1,2,3,4,5]`, Dec negated, C constant                                                                    | Six unique pairs. Metric order IDs: `["dec","inc"]`, `["dec","x"]`, `["inc","x"]`, then unavailable `["c","dec"]`, `["c","inc"]`, `["c","x"]` |
| G: dates            | UTC Jan 1/2/10, 2026; Y `[1,2,3]`                                                                                                     | n3/rho1, r `9/sqrt(292/3)`; elapsed spacing 1:8; Jan 1–2 inclusive date filter selects IDs0/1                                                 |

For B, globally ranked X subset `[1,4,5]` produces the wrong rho `sqrt(12/13)`; paired ranks `[1,2,3]` produce one.
For C, peer IDs `[0,1,2]` give rho1; equal-size IDs `[3,4,5]` give rho−1.
Also prove joint permutation, increasing transforms preserving ties, one-sided decreasing transforms,
signed zero, equal UTC instants with different offsets, and missing-group membership.

## Verification and release

Use focused Vitest files and library type checks while implementing.
Each milestone includes example coverage, Dashboard text round trips, docs checks, and browser docs verification.
Run `pnpm check` once before a feature PR, after focused fixes. Use shared test limits from `@repo/test-config`.
Use `pnpm shot` at 1280/783/390 and the export-proof runner for actual image behavior.
Attach screenshots from `tmp/` to UI PRs. Library changes require a changeset.
This documentation-only research PR requires doc/format checks and has no feature/browser/performance acceptance result.
