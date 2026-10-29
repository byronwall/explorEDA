# Covariance regions for Scatter Plot

Build descriptive covariance regions with exact inside/outside record selection.
Estimate each region from the complete chart-local source, before interactive filters.
Keep that reference fixed while linked filters change the current records.

This is a proposed plan, not shipped behavior. [Research and dispositions](../../research/covariance-regions-2026-10-25/README.md).
Source reviewed: `9d64a021e35d312887b1bc848e307f42b6c3091f`.

## Product contract

Use finite prepared X/Y pairs, their arithmetic center, and sample covariance with denominator n−1.
“Raw” means before the display-axis transform, after field preparation and calculations.
Repeated coordinates remain distinct records. Bubble size supplies no statistical weight.

Default radius k is 2. The region contains points with squared Mahalanobis distance q ≤ k².
Include boundary equality. Do not label radius as confidence, coverage, or an error threshold.
Keep missing pairs and unusable models unclassified. Do not turn them into outside records.

Categorical color gives one region per typed category and semantic facet.
Numeric color gives one region per facet. Inherit existing category keys and palette ordering.
There is no pooled overlay when categorical regions exist in the first release.

| Population             | Rule                                                                                |
| ---------------------- | ----------------------------------------------------------------------------------- |
| Reference candidates   | All source rows passing `localFilters`, facet membership, and the region's category |
| Estimation pairs       | Reference candidates with finite X and Y                                            |
| Current pairs          | Estimation pairs passing peer/workspace filters, before the chart's own filter      |
| Inside/outside members | Classify all estimation pairs against their source region                           |
| Selected records       | Store one region's complete inside or outside set in the chart-owned ID filter      |
| Drawn points/path      | Apply display scales, size validity, and clipping; none controls membership         |

A region action selects its own group's members. It does not classify every workspace row against that group's outline.
Selecting outside includes members currently hidden by peers. Normal filter intersection can therefore show zero current rows.
Clearing the peer filter reveals the original members without moving the reference or replacing the selection.
Notebook selections remain local under the existing `localSelections` policy.

## State and lifecycle

Add optional `covarianceRegion: { radius: number }` and `covarianceSelection: { side, regionKey }` to scatter settings.
The side is inside or outside. The key contains semantic facet and typed category identity, never display labels.
The existing `filters` array holds the only selected-ID list. Store no covariance, paths, source snapshots, or per-row flags.

One activation replaces this chart's interactive filters with one `__ID` value filter and its marker.
Preserve `localFilters` and other owners. An empty values array selects zero records; removing the filter clears selection.
Apply changes in one store transaction, so callbacks and history see one coherent state.

| Change                                                                                               | Required result                                                                  |
| ---------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Peer/workspace selection                                                                             | Keep reference, source membership, marker, and IDs; update current counts        |
| New own point/brush/legend/marginal/facet/filter-panel action                                        | Remove old region provenance/result while preserving the new requested filter    |
| Radius, X/Y, local restriction, effective category/facet partition, relevant preparation/calculation | Clear marker and its ID result before exposing the new reference                 |
| Disable region or choose an unsupported surface display                                              | Clear its marked result in the same action                                       |
| Bounds, zoom, display scale, title, palette colors, size, theme, facet paging/visibility/focus       | Preserve reference and membership                                                |
| Actual source replacement/reorder with retained settings                                             | Release marked result and explain the source change; retain region configuration |
| Equal ordered data values in a fresh array                                                           | Preserve if existing equality checks establish unchanged analytical inputs       |
| Trusted full-analysis restore, same-source undo, matching host echo                                  | Restore marker and IDs together without another history entry                    |
| Unbound settings/text import                                                                         | Keep configuration; remove marked positional selection at the import boundary    |

Use semantic changes, not the broad nonce, as the invalidation rule.
Cosmetic edits must not clear selections. Explicit empty facets must differ from absent facet scope.
Keep generic selection carry behavior as it is. Do not strip all ID filters through `mapRowIdFilters`.

**Project/folder correction from local review:** project settings already encode ID filters as string row keys.
`ExplorEdaProject.reported` calls `encodeAnalysisRowKeys`; `renderedSettings` decodes them.
Require numeric IDs when activating a runtime region selection.
Saved validation must respect the existing encoded-key representation at its owning boundary.
Do not add a numeric-only requirement that rejects valid project settings.
Entity-key resolution preserves record identity, not the covariance estimated from all rows.
Release marked results on a new project evaluation or folder reopen when unchanged reference inputs cannot be established.
Prevent a later host echo from reviving that released result within the same evaluation.
A small runtime guard at the existing owner is enough; no persisted generation or per-row tracking is needed.
Trusted complete analysis restoration remains distinct from loading current external source files.

## Independent fixture anchors

The local audit used rational arithmetic and Gaussian elimination, separate from Pro's direct inverse calculation.
Original reports and scratch checks remain under ignored tmp storage, linked through the [Pro conversation](https://chatgpt.com/c/6adeacce-77f0-83ea-9469-24059afa1f3b).

Use five rotated reference pairs: (12,21), (8,19), (11,19), (9,21), (10,20).
Their center is (10,20); covariance is [[5/2,1/2],[1/2,1]].
At radius 2, probes (13,20) and (11,22) have q=4 and belong inside.
Probe (10,22) has q=40/9 and belongs outside.
Adding (100,20) changes the center to (25,20) and makes that added source record outside.
Duplicating all five records gives n=10 and covariance [[20/9,4/9],[4/9,8/9]].
Do not deduplicate coordinates.

For the runnable two-cloud example, use these finite pairs in this order:

| Group | Core pairs                                                    | Extended pairs  |
| ----- | ------------------------------------------------------------- | --------------- |
| A     | (10,20) ×3, (9,19), (11,21), (9,21), (11,19), (9,21), (11,19) | (6,16), (14,24) |
| B     | (18,20) ×3, (16,22), (20,18), (17,19), (19,21)                | None            |

Name A's finite records A01–A11. Append A12=(missing,20) before B's records.
Name B's finite records B01–B07. Append B08=(18,missing).
Use columns Record, Batch, Phase, X, Y, Size; Size starts at 1.
This gives 20 rows, 18 finite pairs, and internal invalid-pair IDs 11 and 19.

| Result, radius 2 | A                   | B                   |
| ---------------- | ------------------- | ------------------- |
| Center           | (10,20)             | (18,20)             |
| Covariance       | [[19/5,3],[3,19/5]] | [[5/3,−1],[−1,5/3]] |
| Eigenvalues      | 34/5, 4/5           | 8/3, 2/3            |
| Inside IDs       | 0–8                 | 12–18               |
| Outside IDs      | 9,10                | Empty               |

Peer Phase=Core leaves A's reference n=11 and covariance unchanged; its current finite count becomes 9.
Selecting A outside still stores [9,10], with zero linked rows until Core clears.
Chart-local Phase=Core instead gives n=9 and covariance [[3/4,−1/4],[−1/4,3/4]].
A04/A05 have q=4 and stay inside; all nine finite Core A rows are inside.
Changing Size on A01 to −1 hides its bubble without changing estimation or membership.

Also prove empty, one-pair, two-pair, collinear, constant-coordinate, and constant-cloud cases.
Singular models have no inside/outside classification. A pseudoinverse alone would create an unbounded strip.
For points (−1,−1), (0,δ), (1,1), covariance determinant is δ²/3 and every reference q=4/3.
Test δ=10⁻⁴, 10⁻⁵, 10⁻⁶, 10⁻⁸ for numerical availability under unit changes.
Translation by 10¹², unequal scaling/reflection, and axis swapping preserve exact distances when inputs stay representable.

## M1 — Complete source-reference region journey

Deliver points/bubbles on linear numeric axes, traces, exact selection, save/reopen, export, and undo together.
Keep raw statistics and valid selection accessible on nonlinear axes; show a direct route to linear axis settings.
Do not draw a false screen ellipse there. Keep density/hexbin/contour and authored annotations separate.

**Implementation seams.** Library paths below start at `packages/explorEDA/src/`.

- Add small scatter math and population planners under `components/charts/ScatterPlot/`.
  Read values through `finiteNumber`. Reuse the n−1 meaning from `pairedSummary.ts`.
  Share stable moments only if needed; do not refactor unrelated numerical consumers.
- Use `useGetAllIds(settings)` and full-source facet IDs for reference rows.
  Preserve `groupScatterRows` category semantics, but do not reuse its peer-filtered population.
  Keep moments, membership, current counts, and projection as distinct derived work, without a new cache framework.
- Add settings, region layer, and trace body beside existing scatter components.
  Integrate `definition.ts`, `ScatterPlot.tsx`, `ScatterSvg.tsx`, and `ScatterPlotSettingsPanel.tsx`.
  Add trace union/row routing in `traceTypes.ts` and `traceRows.ts`.
  Register the body in **`ChartTracePanel.tsx`**, the current dispatcher.
- Integrate atomic marker cleanup in `DataLayerProvider.updateChart`, clear-filter, preparation, and source transitions.
  Inspect all filter producers; a render effect must not create a second save.
  Update project/notebook/folder consumers at their existing evaluation/import boundaries.
- Validate settings and marker/filter shape in `utils/saveDataUtils.ts`.
  Add keys in `lib/dsl/settingKeys.ts`; verify generic export/compile preserves empty filters without omissions.
  Keep save fingerprints deterministic so matching host echoes do not rebuild the workspace.

Use anchored/scaled moments and a stable solve for q. Avoid raw uncentered cross-products and explicit inversion in production.
Return clear unavailable results for rank deficiency, overflow, or unresolved conditioning.
Do not jitter covariance or silently remove extreme records.
Accept k only if k and k² are positive and finite; reject 10⁻²⁰⁰ and 10²⁰⁰.
Calibrate dimensionless conditioning and boundary error locally before accepting production values.
Pro's 10⁻¹² condition threshold and 64ε boundary allowance are prototype candidates, not release requirements.
Never use an absolute epsilon floor that enlarges tiny regions. At k=10⁻¹⁰, a center is inside but (10+10⁻⁷,20) is outside.
For close cases, calculate reference values from the actual represented binary64 inputs.

Draw a thin group-colored outline and small center, with no filled hit surface over points.
Keep the source region traceable when peers leave zero current points.
Resolve point/stroke/brush priority through `ScatterSvg`'s early `useBrush.onPlotClick` path.
Fix the existing point-toggle check to require one selected ID before toggling off.
Provide Enter/Space selection, Alt-Enter tracing, a named header target, and an outside action in the trace/menu.
Keep field names, reference scope, raw-coordinate meaning, and radius visible at rest and in image export.
Trace exact estimation/excluded/member rows; distinguish current matches and display omissions.

**Docs and example in this milestone.** Update `apps/demo/src/docs/pages/scatter.mdx` with meaning, source/current scope,
record actions, unavailable results, and save/refresh behavior.
Add `/examples/scatter-covariance-regions` using the two-cloud fixture above.
Register its dashboard, `demos/examples.ts`, `demos/coverage.ts`, `docs/live/examples.ts`, and docs catalogue coverage.
Describe new settings in `docs/reference/settingDescriptions.ts`.
Add `apps/demo/e2e/covariance-regions.e2e.ts` and an explicit project matcher in `apps/demo/playwright.config.ts`.
Global `.e2e.ts` matching alone does not register a new project.

**Checks.** Test the fixture centers, covariance, membership, boundary inclusion, singular cases, and unit/offset invariance.
Test peer versus local Core, explicit empty facets, numeric versus typed categorical color, and zero-member selection.
Prove one callback/history step per activation or semantic edit; cosmetic changes and trace opening add none.
Round-trip empty/nonempty selections through JSON, complete analysis, and Dashboard text.
Test project string-key settings, source reevaluation/reorder, folder reopen, notebook-local selection, and host echo release.
Use real pointer/keyboard input at 1280, 783, and 390 px.
Check zero-current-region access, overlap targets, focus return, point/brush priority, visible filter state, and bounded controls.
Verify CSV Record values, undo/redo, save/reopen, and resting image export with meaning labels.
Run focused library tests/types, demo coverage/text/docs checks, then `pnpm check` once before its feature PR.
Include a minor changeset and screenshots through `gh --attach`.

**Main risk:** using visible/live rows for estimation, or letting source/marker/ID changes reach history separately.

## M2 — Project the same raw region through nonlinear axes

Extend the scatter projection planner/layer and existing scale integration. Keep the estimator and membership rule unchanged.
Sample a factorized raw boundary, then map it through log/symlog scales.
Split invalid log-domain arcs; never close a gap with an invented straight segment.
Clip drawing to the view without changing source membership, including finite nonpositive pairs.
Use bounded adaptive projection with seeded extrema/domain intersections. Calibrate pixel error from actual exports.
If drawing cannot be reliable, retain statistics and selection with an unavailable-geometry explanation.

Translate the five-pair fixture to center (0,0). All five remain inside; only (2,1) draws on two positive-log axes.
For a 400×300 plot and log domains [0.1,10], raw boundary (1,2) projects to (200,104.8455006504).
For symlog constant 1 and domains [−3,3], it projects to (300,31.1278124459); (3,0) maps to (400,150).
These controlled scales are test fixtures, not current automatic scale defaults.
Check curve points against the raw quadratic independently of tessellation.

Extend the same docs page, runnable example, explicit browser project, and resting export proof at all three widths.
Scale/zoom changes must preserve exact member IDs through save, undo, and reload.
Include a minor changeset and screenshots for the visible extension.
Optional principal spread axes remain **Explore**: include them only if they clarify the example without delaying nonlinear projection.
Explain their unit-dependent direction. A singular spread segment never enables classification.

**Main risk:** treating nonlinear display coordinates as a new estimator, or bridging invalid log arcs.

## Deferred scope

Defer captured historical references, live/fixed switches, arbitrary cross-group testing, robust covariance, and inferential regions.
Avoid error/anomaly labels, automatic trimming, percentage promises, pixel membership, and speculative capacity machinery.
Measure row/group interaction cost before adding workers or indexes.
Neither milestone depends on unbuilt research PRs #520, #524, or #526.
No application implementation or browser acceptance is claimed by this research plan.

## Preserved Pro result materials

[Original Pro reports and artifacts for #529](assets/pro-results/covariance-regions-2026-10-25/ASSET_INDEX.md)

All extracted result materials are preserved without ZIP containers. Original bytes and attribution are unchanged.
