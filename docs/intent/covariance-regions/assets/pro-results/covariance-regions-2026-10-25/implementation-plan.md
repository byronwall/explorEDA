**Decision.** Build descriptive covariance regions from the finite raw X/Y pairs in the chart's declared source population, using the sample covariance denominator `n−1` and a default covariance-scaled radius of `2`. Each categorical color group in each full-source facet receives its own region. Interactive filters change which records are current, while the source reference, boundary, and full-reference inside/outside membership stay fixed. Selection uses the existing chart-owned `__ID` value filter, accompanied only by a small semantic marker. Ship the complete comparison, trace, exact selection, export, undo, and save/reopen journey in Milestone 1. Milestone 2 adds projection of the same raw region through log/symlog display scales, with informational principal spread axes as an optional extension. Do not add a new statistical framework, a frozen-reference store, a quadratic filter language, or dependencies on unbuilt research PRs.

# Implementation plan: covariance regions for linked scatter analysis

Baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`, October 25, 2026. This is a proposed implementation plan. Repository integration and application verification belong to Codex. The companion [report.md](report.md) contains the alternatives, primary references, mathematical derivation, and recommendation dispositions.

## Fixed product contract

The following recommendations use the stable IDs and classifications in [report.md §10](report.md#10-stable-recommendation-register). Build entries are release requirements; the Explore entry identifies bounded local calibration, while Defer and Avoid entries set scope boundaries.

| Recommendation / classification | Requirement or boundary | Milestone |
| --- | --- | --- |
| CR-001 · Build | Descriptive raw-space sample-covariance regions answer center, direction, spread, and record-inspection questions | 1 |
| CR-002 · Build | Complete chart-local source/facet/group references remain independent of interactive own, peer, and workspace filters | 1 |
| CR-003 · Build | Default radius 2; accept a positive finite distance parameter with a positive finite squared radius, without a percentage interpretation | 1 |
| CR-004 · Build | Inherit grouping from categorical color and semantic facets, preserving typed category identity | 1 |
| CR-005 · Build | Keep estimation, current eligibility, source membership, selected records, and drawing populations distinct | 1 |
| CR-006 · Build | Materialize one region's complete source-side membership in one chart-owned `__ID` filter; empty values select zero | 1 |
| CR-007 · Build | Persist only a small side/region origin marker alongside the existing ID filter; no second ID list or per-row metadata | 1 |
| CR-008 · Build | Clear region results atomically on semantic/reference changes and actual source changes | 1 |
| CR-009 · Build | Preserve full-analysis and same-source restoration; strip region selections at unbound imports because IDs are positional | 1 |
| CR-010 · Build | Use anchored/scaled stable moments and a guarded 2×2 solve for large offsets, unequal units, and near-singularity | 1 |
| CR-011 · Build | Make rank-deficient and unusable regions unclassifiable; do not substitute pseudoinverse strips or planes | 1 |
| CR-012 · Build | Keep membership in raw field coordinates through axis transforms, bounds, and zoom changes | 1 and 2 |
| CR-013 · Build | Reuse SVG, trace, and input conventions with explicit keyboard subjects for inspection and selection | 1 |
| CR-014 · Build | Ship validation, Dashboard text, image/record export, host echo, history, docs, and their acceptance checks with the complete journey | 1 |
| CR-015 · Build | Add nonlinear projection and optional informational principal spread axes without introducing a new estimator | 2 |
| CR-016 · Explore | Calibrate conditioning, boundary-rounding, and projection tolerances in a bounded local numerical prototype | 1 and 2 |
| CR-017 · Defer | Live-versus-held and arbitrary separate-reference modes remain outside this source-reference design | Deferred |
| CR-018 · Defer | Confidence, prediction, tolerance, and robust-region methods require separate statistical contracts | Deferred |
| CR-019 · Avoid | No automatic anomaly/error labels, percentage claims, silent regularization, or pixel-based membership | Both milestones |
| CR-020 · Avoid | No framework changes, new selection platforms, per-row persistent metadata, or speculative capacity machinery | Both milestones |

The radius is a geometric boundary parameter. The label is **Covariance region · radius 2**, with **Reference: chart source** and **Raw field units** available persistently and in the trace. Do not label it `95%`, `2σ confidence`, a tolerance region, or an error boundary. Observed counts may say “9 of 11 finite reference pairs inside”; they do not estimate confidence coverage. The distinctions are substantive: NIST's [bivariate tolerance-region documentation](https://www.itl.nist.gov/div898/software/dataplot/refman1/auxillar/bvntolpl.htm) requires separate content and confidence probabilities, while scikit-learn's [EllipticEnvelope](https://scikit-learn.org/stable/modules/generated/sklearn.covariance.EllipticEnvelope.html) adds a contamination-driven outlier decision rule.

### Reference and membership

For a selected chart, facet, and region group:

- **Reference candidates, R:** every source row satisfying the chart's `localFilters`, the facet partition, and the region's typed category. Interactive `filters` and workspace/peer filters do not enter R.
- **Estimation rows, E:** the members of R with finite prepared numeric X and Y. They supply the mean and sample covariance. Invalid bubble sizes, clipping, log-invalid screen coordinates, and current selections do not remove a finite pair from E.
- **Current tested rows, T:** finite pairs in that region that currently pass peer and workspace filters, before this chart's own interactive filter. In notebook-local mode, inherit the existing local-selection behavior. T is useful for the current-count readout; it does not estimate the region.
- **Full-reference membership, I and O:** classify every member of E against this region's quadratic boundary. For an available region, I and O partition E and boundary equality belongs to I. For an unavailable region, all E are untestable rather than assigned outside.
- **Selected records:** the stored ordinary ID filter. A region action writes the full I or O set, including members currently excluded by peers. The linked result is the normal intersection with other filters.
- **Drawn marks and geometry:** projection/visibility results. They are never a substitute for E, T, I, or O.

This source reference deliberately differs from regression's existing peer-sensitive analysis. Document that difference directly. The first region journey does not offer a live/fixed switch. Editing `localFilters` changes the declared source reference and releases a region-generated selection; peer filtering does neither.

### Selection and lifecycle

Persist an optional `covarianceRegion` setting and an optional `covarianceSelection` marker in `ScatterPlotSettings`. A suitable minimal shape is:

```ts
type CovarianceRegionSettings = {
  radius: number;
};

type CovarianceSelection = {
  side: "inside" | "outside";
  regionKey: string;
};
```

Absence of `covarianceRegion` means off. A deterministic `regionKey` encodes the semantic facet key and typed category key, or the ungrouped identity. Never use a label, palette color, first row, array position among visible facets, or a lossy hash as that identity. Optional informational display settings added in Milestone 2 remain separate from the marker.

The existing ID value filter is the only selected-membership truth. Store no persistent centers, covariance matrices, eigenvectors, screen paths, estimation ID arrays, tested ID arrays, distances, or per-row region flags. The marker explains the existing filter; it does not duplicate its IDs.

- Selecting inside or outside replaces this chart's interactive selection with one numeric `__ID` value filter and the matching marker in one `updateChart` patch. It preserves `localFilters` and filters owned elsewhere.
- An empty result writes `values: []` and shows zero selected. Removing the filter means unrestricted rows. Never conflate these operations.
- Every non-region mutation of this chart's own interactive filters clears the marker atomically. Cover point, brush, own-legend, marginal, facet-heading, filter-chip, and sidebar actions, including removal and replacement. Remove the former region-owned ID filter while preserving the valid filter newly requested by the action; when that action explicitly installs a generic ID result, retain its new ID filter without a region marker. A click on the first ID of a multi-ID region must select that single point, not trigger the existing single-point toggle incorrectly. No unrelated own-filter mutation may leave the old provenance marker attached.
- Radius, X/Y field, chart-local restriction, grouping, effective facet partition, or relevant field/calculation-preparation changes clear the marker and its owned ID filter atomically. The new reference is then derived. Facet visibility, paging, focus, and wrap `columnCount` do not change partition membership and do not invalidate. Switching grid/wrap can change the partition through column grouping; invalidate when its effective grouping semantics change, not merely because a facet display setting changed. Disabling regions also clears the marked result.
- Bounds, zoom, dimensions, axis display scale, title, palette, and theme do not change raw membership or release a valid region selection. Peer/workspace selections also leave it intact.
- Switching away from the supported points/bubbles display ends the region interaction and clears its marked result atomically, with an explicit unavailable-display explanation. Returning restores the region settings, not a concealed old selection.

Do not implement cleanup as a render effect that performs a second save. Normalize at the originating store command or source-change/restore consumer, so host callbacks and history never observe a marker detached from its ID filter.

### Source and restore boundary

At this baseline, `__ID` values are generated source positions. `sourceRowIdentity.ts` contains a different project identity mechanism; it does not make arbitrary scatter ID filters durable entity selections. Respect that limit.

| Event | Region behavior |
| --- | --- |
| Peer/workspace filter | Retain reference, membership, marker, and stored IDs; update current counts and linked intersections |
| Non-region own-filter action | Retain the reference; remove the region marker and former region-owned ID result atomically, preserving the newly requested valid filter |
| Same ordered source contents in a fresh equal array | Preserve when the proposed cleanup uses the existing equality utility to prove same ordered contents |
| Actual source replacement, including reordering | Clear region-owned ID filter and marker, retain display settings, recompute reference, explain that source changed |
| Same-source full `SavedAnalysis`, undo/redo, or host echo | Preserve settings, marker, and exact IDs as one coherent state |
| Settings-only or Dashboard text applied to its original source/order | Preserve under the explicit paired-source contract |
| Unbound settings/text import onto an arbitrary source | Strip the marker and its associated ID filter at the import UI; retain display settings and explain the omission |
| Host supplies different data and different settings together | Honor the existing trusted paired-input contract; the host is responsible for matching them |

Do not change generic point/brush selection carry. The region-specific replacement rule is deliberately conservative because a changed source also changes the statistical reference. Do not silently rerun membership and select different records. Do not indiscriminately strip markers in generic `restoreFromStructure`, which would break legitimate undo and same-source restoration. A folder/history consumer must not apply an old positional selection to a newer source snapshot merely because both have the same row count.

## Exact runnable example and acceptance data

Add `/examples/scatter-covariance-regions`, backed by `apps/demo/public/datasets/covariance-regions.csv`. The dataset is synthetic and should be labeled accordingly. Each row below is a distinct record even when coordinates repeat. The declared CSV order determines the baseline internal IDs used in the tests.

```csv
Record,Batch,Phase,X,Y,Size
A01,A,Core,10,20,1
A02,A,Core,10,20,1
A03,A,Core,10,20,1
A04,A,Core,9,19,1
A05,A,Core,11,21,1
A06,A,Core,9,21,1
A07,A,Core,11,19,1
A08,A,Core,9,21,1
A09,A,Core,11,19,1
A10,A,Extended,6,16,1
A11,A,Extended,14,24,1
A12,A,Core,,20,1
B01,B,Core,18,20,1
B02,B,Core,18,20,1
B03,B,Core,18,20,1
B04,B,Core,16,22,1
B05,B,Core,20,18,1
B06,B,Core,17,19,1
B07,B,Core,19,21,1
B08,B,Core,18,,1
```

The example contains a scatter with categorical Batch colors and regions enabled, a Phase peer row chart, a matching-record count, and an exact-record table. Use a concise typed dashboard module or an exported definition beside existing scatter examples. The private helpers in `dashboardSettings.ts` are not importable API; do not reorganize that large file merely to create this example.

### Initial source reference, radius 2

There are 20 source rows and 18 finite pairs. A12 has a missing X; B08 has a missing Y. Neither is inside or outside.

| Result | Group A | Group B |
| --- | --- | --- |
| Finite reference count | 11 | 7 |
| Center | `(10,20)` | `(18,20)` |
| Covariance | `[[19/5,3],[3,19/5]]` | `[[5/3,-1],[-1,5/3]]` |
| Eigenvalues, descending | `34/5`, `4/5` | `8/3`, `2/3` |
| Major direction in these units | 45° | −45° |
| Radius 2 semiaxes | `2√(34/5)`, `2√(4/5)` | `2√(8/3)`, `2√(2/3)` |
| Inside record IDs | A01 through A09 | B01 through B07 |
| Outside record IDs | A10, A11 | Empty |

For A, squared distances are 0 for A01–A03, `5/17` for A04/A05, `5/2` for A06–A09, and `80/17` for A10/A11. For B, its three center records have distance 0 and its other four finite records have squared distance 3.

The exact internal filter values for A inside are `[0,1,2,3,4,5,6,7,8]`; A outside is `[9,10]`; B inside is `[12,13,14,15,16,17,18]`; B outside is `[]`. Internal IDs 11 and 19 are unclassified missing pairs. The first milestone selects one explicitly identified region at a time; it has no implicit union across all groups or test against every group's ellipse.

### Peer Core versus chart-local Core

Selecting **Core in the peer chart** retains A's original reference count 11 and covariance `[[19/5,3],[3,19/5]]`. A's current tested count is 9. Its two outside source records still exist in O, but zero currently pass the peer filter. Selecting A outside must write `[9,10]` and yield zero linked records. Clearing Core then reveals A10 and A11 without recomputing or replacing the stored selection.

Applying **Core as this scatter's local restriction** changes its declared reference. Clear any marked region selection in the same action. A then has n = 9, center `(10,20)`, covariance `[[3/4,-1/4],[-1/4,3/4]]`, eigenvalues 1 and 1/2, and a major direction −45°. A04/A05 have squared distance exactly 4 and belong inside. A06–A09 have squared distance 2. All nine finite A records are inside. B remains unchanged. This distinction is the central scope acceptance test.

Exact moments and membership for these literal coordinates were independently checked using Python rational arithmetic during research. Those checks establish expected values; they do not establish that the proposed TypeScript implementation, browser interactions, serialization, or restore path already work.

## Milestone 1 — Complete source-reference region journey

**Shippable outcome:** an analyst chooses two numeric fields, compares the two source-defined clouds, traces the estimation rows, selects exact inside/outside records, filters linked views, exports, undoes, saves, and reopens with the declared meaning intact. Supported visible geometry is points/bubbles on linear numeric axes. Other scale choices retain valid raw statistics and selection with an actionable display notice. This milestone is complete enough to use independently of Milestone 2.

### 1. Numerical kernel and populations

Add small pure modules under `packages/explorEDA/src/components/charts/ScatterPlot/`:

- `covarianceRegionMath.ts`: stable finite-pair center/covariance calculation, rank/conditioning status, a factor of the covariance, squared-distance evaluation, and raw boundary parameterization.
- `covarianceRegionPlan.ts`: chart-source population, explicit facet scope, typed groups, region keys, E/T and missing-pair partitions, membership arrays, and trace-ready counts.
- `covarianceRegionMarks.ts` if needed: linear projection and clipping-ready geometry. Keep it separate from row membership and from persistent state.
- `useCovarianceRegions.ts`: cache analytical results on their actual inputs and derive projected marks separately.

Read row values through `lib/valueParsing.ts` helpers. `pairedSummary.ts:pairedStats` establishes finite-pair eligibility and the `n−1` contract, but its existing raw mean sum is not evidence of high-offset accuracy. Use a small shared stable-moment helper if needed and retain that statistical definition. Avoid a global numerical-library migration. Each record contributes once; bubble size is not a weight.

Use `useGetAllIds(settings)` for the source/local population. The exact-baseline supplementary source shows this helper applies chart-local restrictions without interactive chart/workspace filters. The facet producers likewise derive from all IDs, so peer filtering must not make a reference facet disappear. Introduce an unambiguous facet argument: absent means unfaceted; an explicit empty list means an empty facet. Do not reuse the existing `facetIds.length ? ... : chartIds` fallback as a statistical population rule.

Preserve `groupScatterRows` category semantics, but provide the source reference population rather than accidentally reusing peer-filtered `plan.rowSets.facet`. Group only when the color scale is categorical. A numeric color field with a continuous scale creates one model; an explicitly categorical scale over numeric codes may group those codes. Use canonical category keys, including the existing missing-category convention. Legend display counts are not the model's finite-pair counts.

For positive-definite S, classify using the raw covariance-scaled inequality `d² ≤ radius²`, with the documented numerical boundary treatment. Generate drawing from the same model, never from a pixel polygon or visible-point subset. Use a factor/solve rather than an unnecessarily fragile explicit inverse. Test model and boundary behavior under translation, unit rescaling, reflection, and swapping axes.

Insufficient pairs (`n<2`), rank0, rank1, and numerically unresolved near-singular clouds produce an unavailable two-dimensional region. Retain available center/covariance information in the trace. Disable inside/outside classification with a specific reason; do not report all rows outside or silently add diagonal regularization. `n=2` is necessarily rank-deficient; `n≥3` alone is not enough.

Near-singular thresholds must be dimensionless, based on standardized conditioning or an equivalent scale-aware test. The report's proposed numerical tolerances require a local prototype before release: compare representable large offsets, unequal units, nearly collinear inputs, and boundary-adjacent points against an oracle that treats the actual binary64 input values exactly before high-precision calculation. The candidate squared-distance allowance is `τq = 64 × Number.EPSILON × max(radius², |q|)`, with no absolute `1` floor; calibrate it locally rather than treating the constant as established evidence. Rounding allowance must not become a larger effective radius. If numerical conditioning or a near tie remains unresolved, report numerical unavailability instead of expanding the tolerance. Record the chosen constants and rationale in the numerical test or implementation note. Do not expose an arbitrary “robustness” knob to users.

### 2. Settings, rendering, and analytical meaning

Update `definition.ts:ScatterPlotSettings`, `ScatterPlotSettingsPanel.tsx`, and a small `CovarianceRegionSettings.tsx`. Add one compact section with enable/disable and a radius input. Validate both `radius > 0` and `radius² > 0`, with both quantities finite, consistently in UI and saved data. Reject `1e-200` because its square underflows to zero and `1e200` because its square overflows to infinity. Apply only valid drafts; keep an invalid draft visible without changing the chart. A continuous edit uses the existing edit/hold convention so it becomes one undo operation.

Add `CovarianceRegionLayer.tsx`, connected through `ScatterPlot.tsx` and `ScatterSvg.tsx`. Reuse the SVG plot clip, existing color encoding, and the fitted-curve outline/halo treatment. Show a center marker and a thin outline with a narrow hit stroke. Do not lay a transparent filled hit surface across the whole ellipse: that would take clicks and brushes away from the points. Keep analytical geometry visible even when peer filters leave no current points. The current empty-chart branch must allow a valid source region and its counts to render.

Give each region an accessible name that identifies its category/facet and radius. Keep the reference and raw-unit meaning in visible resting content that image export retains. Current counts may be shown alongside source membership: “2 outside source pairs; 0 currently pass other filters.” Avoid an unlabeled percentage or a generic `n` whose population cannot be identified.

Categorical axes make the method unavailable. On numeric log or symlog axes in this milestone, keep the raw statistics, classification, and valid marked selection, but suppress the boundary and show **Use linear axes to display this raw covariance region**. Offer a direct route to the existing axis settings. Do not silently drop nonpositive finite pairs from estimation or refit in transformed coordinates. The trace must remain reachable when geometry is suppressed.

Keep density, hexbin, and smoothed contour meanings separate. The initial rendering scope is the points/bubbles branch; do not claim that `DensityScatter` shares the same insertion point. Existing hand-authored annotation ellipses remain annotations with authored bounds. The new settings belong to the analytical scatter feature, not the Notes region editor.

### 3. Interaction, trace, and exact selection

Add a covariance-region trace target/result to `components/charts/trace/traceTypes.ts`, register it in the scatter trace source, and dispatch `CovarianceRegionTraceBody.tsx` through the actual existing trace-body dispatcher. Reuse `ChartTraceScope`, `TraceSection`, `TraceReadout`, and existing record navigation rather than opening a second inspector system.

The trace must expose:

- X/Y fields and units, descriptive method, radius, denominator, center, covariance, conditioning status, facet/group identity, and **Reference: chart source**.
- Reference candidates, finite estimation pairs, pair-exclusion reasons, current tested pairs, full-source inside/outside counts, current inside/outside counts, and rows hidden by rendering restrictions.
- Exact estimation, inside, outside, and excluded record lists. Show current-filter status separately from membership and allow analysts to inspect a selected row's squared distance.
- Named actions **Select inside source rows** and **Select outside source rows**, with source and currently matching counts. A zero-member action has defined empty-selection behavior, not a clear-all fallback.

Trace access uses Alt-click, Alt-Enter, or the chart-header trace control. Do not add an Inspect button on the chart. Plain activation of a region outline selects its inside source rows; outside selection is available from its trace/context action. Enter/Space and Alt-Enter must operate on a focusable region subject. Ensure overlapping regions remain separately addressable through named trace/menu targets.

Coordinate pointer handling with `ScatterSvg` and its brush helper. Preserve a near point's row action, distinguish a directly hit region stroke, and let a genuine drag brush normally. An empty plot click clears the chart's interactive filters and marker. Escape closes the active trace/editor before applying chart-level clear behavior. Verify this with real input; a React `onClick` test alone will not cover the brush's earlier `onPlotClick` dispatch.

### 4. Persistence, validation, and source transitions

Add a small helper such as `covarianceRegionSelection.ts` for atomic activation/cleanup and semantic-input comparison. Integrate it into `DataLayerProvider.tsx:updateChart` and the source/field-preparation paths that can change meaning. Route every non-region own-filter mutation through its cleanup rule, including marginal, facet-heading, filter-chip, and sidebar producers; handling only point/brush/legend handlers is insufficient. Compare effective facet partition semantics rather than all facet settings, and preserve cosmetic visibility, paging, focus, and wrap-column changes. Do not subscribe every chart to the entire chart list, and do not treat the broad data nonce as proof that a statistical input changed.

Update `utils/saveDataUtils.ts:isChart` for the new setting and marker. Structural validation must check radius, marker side/key, and the marker's association with the expected chart-owned numeric ID value filter. Reject malformed saves through the existing validation path rather than accepting a false provenance label. Keep legitimate settings without a marker and ordinary ID selections valid. Resolve semantic changes through the originating operation; do not mutate saved state merely because a derived render noticed a missing region.

Add properties to `lib/dsl/settingKeys.ts:CHART_SETTING_KEYS.scatter`. Use the existing generic export/diff machinery in `lib/dsl/export.ts`, then verify compile/normalize round trips. A zero-length value filter needs a focused test: `filterPairs` cannot express it as ordinary shorthand, so the generic chart-setting fallback must preserve the exact empty array without `omitted` warnings. If that fallback is insufficient, fix the smallest chart-filter export seam; do not move the filter to workspace scope.

Ordinary scatter settings already pass through `toSavedChart` and `saveToStructure`; no new top-level `SavedDataStructure` population collection is needed. Full `SavedAnalysisStructure` carries rows and settings together. Keep save output deterministic so `getSavedStateFingerprint` still recognizes host echoes. Opening a trace, recomputing a model, resizing, or redrawing must not call `updateChart` or emit a new save.

Implement the source table above at the actual consumer boundaries. The baseline provider observes array identity; the proposed region cleanup must use the existing equality utility to establish identical ordered contents before preserving a marked result on a fresh array. This is new region behavior, not an existing provider guarantee. For observed replacement/reorder, strip only a marked region's owned filter and marker, retain other charts' generic carry behavior, and announce **Source changed; select records again**. A same-source undo/full-analysis restore is legitimate. Unbound settings import must make its selection stripping visible in the import result; generic provider restore must remain usable for trusted paired inputs.

For notebooks and folder projects, reuse their current chart and save mechanisms. Notebook-local selection remains local; it does not gain a hidden cross-notebook filter route. Workspace filters still affect current counts. Folder refresh follows the same observed-source-change rule. Inspect the actual notebook/folder consumers before editing; no parameterized-notebook implementation from proposal PR#524 is required.

### 5. Documentation and example, in this milestone

Update `apps/demo/src/docs/pages/scatter.mdx` with five sections:

1. **Covariance regions: center, direction, spread** — raw finite pairs, sample covariance, radius, and descriptive meaning.
2. **Reference and current rows** — chart-local source versus interactive filters, with the peer Core/local Core comparison.
3. **Trace and select records** — exact contributor/member lists, inclusive boundary, hidden selected members, and zero-result selection.
4. **Save, reopen, and refresh** — full-analysis reproducibility, same-source settings, positional IDs, and source-change release.
5. **Limits and display scales** — degenerate clouds, categorical axes, nonlinear display notice, and distinction from density/annotation regions.

Register the runnable example in `apps/demo/src/demos/examples.ts`, its dashboard definition, `coverage.ts`, and `docs/live/examples.ts`. Add `mode:scatter-covariance-region` as a required feature and connect it to the scatter documentation's coverage mapping. Add descriptions for the new setting keys in `docs/reference/settingDescriptions.ts`. The exact catalogue and descriptions files were identified by the guide; the worker must read them locally before editing.

Use the existing `LiveStep` vocabulary for a short documentation smoke flow: initial 20 rows, named region, select A inside, nine linked records, visible filter chip. Put keyboard, source replacement, history, image/CSV export, and reload in `apps/demo/e2e/covariance-regions.e2e.ts`. Add the explicit `covariance-regions` project in `apps/demo/playwright.config.ts`; the global `.e2e.ts` matcher alone is insufficient because current projects have their own matchers.

Append this project entry alongside the existing projects:

```ts
{ name: "covariance-regions", testMatch: /covariance-regions\.e2e\.ts$/ }
```

### 6. Focused acceptance and release proof

Add `covarianceRegionMath.test.ts` and `covarianceRegionPlan.test.ts`; extend the existing renderer/provider/serialization tests only for the changed contracts. Protect outputs and analytical meaning, not private cache shapes or a copy of the implementation formula.

| Acceptance area | Required observable result |
| --- | --- |
| Exact initial fixture | Centers, covariance matrices, eigenvalues, and I/O IDs match the values above |
| Peer versus local scope | Peer Core leaves reference n11/S unchanged; local Core produces n9/new S and includes A04/A05 exactly on the boundary |
| Full-reference selection | Under peer Core, outside writes `[9,10]`, displays zero, then reveals the two records when Core clears |
| Empty set | B outside persists `values: []`; zero survives JSON and Dashboard text round trips |
| View independence | Bounds, zoom, and an invalid size hide marks without changing E/I/O |
| Population identity | Numeric color pools; typed categorical groups and explicit empty facets behave distinctly |
| Degenerate inputs | n0/n1, repeated constant points, collinearity, and constant coordinate give clear unavailable status and no false membership |
| Numerical behavior | High offsets, unequal scales, rotation, reflection, swap, and boundary-adjacent values meet locally justified tolerances |
| Small-radius contract | Reject underflowing/overflowing squared radii; at radius `1e-10` on the initial A model, center `(10,20)` is inside and probe `(10 + 1e-7,20)` is outside; use an exact-binary64-input oracle for near ties |
| Atomic lifecycle | Semantic edits clear marker/result together; cosmetic edits and interactive peer filters preserve them |
| Own-filter ownership | Point, brush, legend, marginal, facet-heading, filter-chip, and sidebar mutations clear stale region provenance; the valid new filter survives, including an explicitly installed generic ID result |
| Facet semantics | Visibility, paging, focus, and wrap `columnCount` preserve the marked result; changes to effective grouping/partition membership, including a grid/wrap transition that changes column grouping, clear it |
| Source identity | Actual reorder/replacement releases region result; exact-equal ordered arrays and trusted same-source restores preserve it |
| Restore/host/history | One action gives one checkpoint/callback; undo/redo restores both marker and IDs; matching echoes do not rebuild repeatedly |

At 1280, 783, and 390 CSS px, execute the complete example using pointer and keyboard input. Confirm reachable controls, long field names, visible filter state, bounded trace popovers, focus return, overlapping-region targeting, and no horizontal clipping of the primary actions. Responsive reflow must not modify saved layout or add history. Include a dark-theme border/focus check without turning this into a new theme project.

For export, assert selected CSV record IDs, not just row count. Capture the chart at rest and compare its image export: region geometry and meaning labels remain; hover actions, focus handles, and editor controls do not. Exercise JSON/full-analysis reopen and Dashboard text round trip, then source reorder/replacement. Test the same-source host echo at provider level and the real demo undo flow in the browser. Folder/notebook behavior needs a focused existing-consumer check, not a new app harness.

**Main risk:** an apparently harmless filter, restore, or source transition changes the reference while the UI continues calling an old positional record set “inside” or “outside.” The exact Core scenario, source replacement tests, and atomic marker/filter assertions are the release gates. Record actual performance before introducing workers, capacity thresholds, specialized spatial indexes, or broad caching infrastructure.

## Milestone 2 — Raw regions on nonlinear displays, with optional spread axes

**Shippable outcome:** the same raw-unit covariance region remains visible when an analyst chooses log or symlog display axes. Changing display scale changes geometry only. It preserves the reference, distance, inside/outside records, marked selection, save state, and source-change contract from Milestone 1.

### Files and behavior

Extend `covarianceRegionMarks.ts`, `CovarianceRegionLayer.tsx`, `useCovarianceRegions.ts`, `ScatterSvg.tsx`, and the existing scatter scale descriptor integration. Read the actual `scatterAxis`/numeric-scale helpers before implementation. Keep the estimator and selection modules unchanged unless a concrete test exposes a missing shared representation.

Parameterize the raw boundary as `p(t) = μ + radius × L × [cos(t), sin(t)]`, where `L Lᵀ = S`. Map each coordinate through the existing display scale. A raw ellipse generally becomes a warped path on nonlinear axes; do not draw a screen-space `<ellipse>` and present it as the same boundary.

- **Symlog:** project continuously through the declared existing transform. Preserve its constant/base semantics; do not infer a new data transformation from the axis label.
- **Log:** only the parts with valid positive raw coordinates can be projected. Split paths where raw X or Y crosses the invalid domain. Never connect across invalid arcs or close an open projected segment with an invented straight chord.
- **Clipping:** use plot bounds to clip drawing, not to alter raw membership. A finite pair outside the log domain stays in E/I/O and receives an explicit display-omission reason in trace.
- **Zoom/resizing:** regenerate projected vertices for the current view. Keep raw analytical results stable. Membership never depends on the vertex count, hit stroke, screen tolerance, or clipping rectangle.

Use adaptive screen-space subdivision or a comparably justified bounded approximation for drawing, with explicit termination. Prototype its pixel tolerance on highly curved log/symlog arcs and at all three target widths. Document the chosen drawing tolerance separately from the numerical membership tolerance. If a projection cannot be represented reliably, preserve statistics/selection and show a specific unavailable-geometry state; do not manufacture a closed shape.

Optional principal spread axes may ship in the same milestone if they clarify the comparison without obstructing marks. They are informational segments along the eigenvectors, scaled from the same raw covariance and projected through the same scale mapping. They do not create independent selection targets or a second membership rule. Explain that their angles depend on the chosen units; the full region and corresponding memberships transform consistently under invertible unit changes. A rank1 cloud may show its direction segment as **Direction only; no two-dimensional region**, while inside/outside classification remains unavailable. Do not silently use a pseudoinverse strip as a bounded region.

### Focused tests, docs, and example

Extend the same runnable example with a second view or documented axis controls; do not require another dataset. Add a positive-shifted/reflected fixture from the report for a log-valid raw ellipse and a fixture whose raw ellipse crosses zero. Assertions must distinguish raw coordinates and display coordinates:

Use report fixture F8 for exact projection checks: translate F1 to center zero, retain all five inside IDs even though only (2,1) is drawable on two positive-log axes, and split its valid arc at the raw zero crossings. With plot size 400×300 and log domains [0.1,10], raw boundary point (1,2) maps to (200,104.8455006504). With explicitly configured symlog constant 1 and domains [−3,3], it maps to (300,31.1278124459), and (3,0) maps to (400,150). These are controlled test scales, not assumptions about automatic axis defaults.

- Linear, log, and symlog versions retain identical center/covariance and I/O IDs for the same source.
- Positive-domain projected vertices correspond to the raw quadratic boundary within the chosen drawing tolerance; invalid arcs produce separate paths, never bridging chords.
- Raw finite nonpositive records remain classified and traceable even when their marks cannot appear on log axes.
- Pan/zoom, axis swap, reflection, and unit conversion preserve the declared analytical invariants. Optional direction angles change appropriately under unequal unit scaling; their labels never suggest unit-invariant physical directions.
- Rank1/rank0 and unavailable regions stay unavailable for classification. Optional direction rendering does not activate inside/outside buttons.
- Switching display scales while a marked region selection is active preserves the ID filter/marker and produces only the expected axis-edit history action. Save/reopen and image export reproduce the projected geometry without serializing sampled vertices.

Update `/docs/scatter` **Raw regions on log and symlog axes** and, if shipped, **Principal directions and units**. Remove the Milestone1-only linear-display notice where nonlinear geometry is now supported; retain actionable notices for truly invalid or unrepresentable geometry. Keep the estimation/selection language unchanged.

Extend `covariance-regions.e2e.ts` under the existing explicit project. At 1280, 783, and 390 px, choose each display scale with real controls, trace a hidden/nonpositive record, activate and retain a region selection, export at rest, undo the scale edit, and reopen the saved analysis. Confirm split arcs, readable reference/radius labels, keyboard trace access, and no false filled area where an arc is invalid. Add image-export proof for one nonlinear view rather than rerunning an unrelated gallery.

**Main risk:** a convenient rendering approximation turns a raw-unit region into a transformed-unit estimator or invents geometry across log-invalid values. Keep membership tests independent of rendering tests, and compare projected positions to known raw boundary points. Optional axes must be cut from this milestone if they delay the complete nonlinear-region journey; their absence does not weaken the covariance-region contract.

## Worker execution and review

These commands are proposed, not executed during this research. Run them in the actual checkout after implementing the named files. Adjust a proposed filename only to match the final small-module organization; keep the analytical checks intact.

```bash
# Focused library behavior and provider restore tests.
pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot/covarianceRegionMath.test.ts src/components/charts/ScatterPlot/covarianceRegionPlan.test.ts src/components/charts/ScatterPlot/ScatterSvg.test.tsx src/test/providers/savedSelectionRestore.test.tsx
pnpm --filter exploreda check-types

# New public settings types must exist in dist before the demo typecheck.
# Do not run broad package builds concurrently from several worktrees.
pnpm --filter exploreda build
pnpm --filter demo check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
pnpm --filter demo build

# The new explicit project discovers covariance-regions.e2e.ts.
pnpm --filter demo docs:verify --project=covariance-regions
pnpm --filter demo docs:verify --project=pages -g '/docs/scatter$'

# Real example screenshots at the repository's three standard widths.
pnpm shot /examples/scatter-covariance-regions --name covariance-regions
# Add the focused case to the existing export-proof script before invoking it.
pnpm export-proof --only covariance-regions

# Add a package-user changeset for each independently shipped feature PR.
pnpm changeset:add minor 'Compare scatter clouds with descriptive covariance regions and select their exact records.'

# Run the broad required gate once after focused checks pass.
pnpm check
```

Use repository timing defaults from `@repo/test-config`; add no test-specific timeout. Use `pnpm dev:agent` for interactive local verification and stop that worktree's server afterward. Screenshots stay under `tmp/` and are attached through the existing PR workflow, not committed. Codex should write the initiative and concise research summary in the repository's established destinations; the research originals and this download bundle are not source receipts to commit.

### Remaining implementation decisions

The statistical meaning, source reference, radius default, selection ownership, and source-change policy are decided. Remaining local decisions are bounded engineering choices:

- Select and justify numerical boundary/conditioning tolerances from the independent fixtures and high-offset/near-singular prototype.
- Locate the actual trace dispatcher, notebook/folder source consumer, and unbound-import handler before editing them; preserve source-bound undo and trusted paired host input.
- Confirm the generic Dashboard text fallback round-trips an empty chart-owned ID filter with no omission. Repair that narrow path if the proposed test fails.
- Choose the smallest accessible region-target implementation that coexists with the current canvas/brush dispatch.
- Measure the actual number of rows/groups and redraw cost before adding capacity infrastructure. Include optional principal directions only if their informational value is clear in the existing example.

No outside-demand or usability-study gate is required. PRs #520, #524, and #526 remain proposals, and none is a prerequisite for these milestones. Robust MCD, confidence for a mean, prediction/tolerance regions, weighted regions, arbitrary held reference populations, and all-display-mode integration are deliberate future boundaries, not hidden work inside the first release.

## Access and verification status

The complete 45-file packet at the stated full baseline was reviewed across the source-reading tasks, including the governing guides, all supplied scatter implementation/tests, filter and persistence files, trace definitions, docs, examples, coverage, and Playwright configuration. Narrow supplementary source at that same commit established all-ID population ownership, facet production, empty value-filter behavior, and generated positional IDs; the report provides the detailed source inventory and access qualifications.

For this plan, the demo/doc sources were read completely: `README.md`, `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `docs/research/DIRECTION.md`, `apps/demo/src/docs/pages/scatter.mdx`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/dashboardSettings.ts`, `apps/demo/src/demos/coverage.ts`, `apps/demo/playwright.config.ts`, and both supplied package manifests. Numerical expected values were independently checked in scratch. Application implementation, TypeScript tests, builds, browser flows, serialization execution, performance measurement, and image exports remain proposed worker verification. No repository implementation, commit, push, merge, or service provisioning was performed.
