# Distribution distance: implementation plan

Build an optional comparison inside the existing ECDF chart: the analyst chooses two explicit typed values of its grouping field, sees their largest share gap, then gains Wasserstein distance in the field’s units and signed differences at three empirical quantiles. Ship this as three complete, sequential releases. Each release includes its mathematical contract, record inspection, saved settings, documentation, runnable example, and input/export verification. Keep the React/TypeScript library, pnpm workflow, and present chart/filter/trace boundaries. Do not introduce a cohort registry, statistical execution engine, or inferential test menu.

## 1. Baseline, status, and how to start

**Source baseline:** the complete attached packet identifies commit `9d64a021e35d312887b1bc848e307f42b6c3091f`. Its 43 complete file sections take precedence over a different live checkout. The companion `methods-report.md` contains the complete reading inventory, mathematical reasoning, primary sources, exact proof cases, and recommendation IDs. This plan is a design deliverable: no application changes, repository tests, package installation, build, browser run, commit, push, or merge were performed for it. Commands and acceptance checks below are proposed work for the implementation owner.

**Start M1 by reading these exact boundaries in the implementation checkout:** `Ecdf/definition.ts`, `EcdfChart.tsx`, `ecdfPlan.ts`, the live-ID hooks, `CrossfilterWrapper`, saved-data validation, and the DSL/notebook files named below. Confirm that intervening changes preserve the packet’s population and serialization contracts. A changed live implementation is a reason to reconcile this plan, not to replace the specified mathematics with an accidental new convention.

The packet supplies the central call sites but not every integration implementation. Before changing those boundaries, inspect these **integration targets whose implementation was not supplied**: `packages/explorEDA/src/utils/saveDataUtils.ts`; DSL `paths.ts`, `schema.ts`, and `normalize.ts`; the trace-body dispatch; `AggregateContributorTable` and its actual Rows continuation; image-export code; `initializeData`, `carryRowSelections`, and the host history implementation. Their absence does not prevent M1 from starting. It prevents claiming that their internal behavior has already been verified.

### Release order

| Milestone | Independently useful result | Recommendations |
|---|---|---|
| M1 | Choose A/B, compare their largest ECDF share gap, and inspect both counts and source rows. | DD01–DD03, DD06–DD11, DD18 |
| M2 | Add exact first Wasserstein distance and an inspectable interval ledger. | DD04, DD06–DD09, DD12 |
| M3 | Add signed B−A differences at the 10th, 50th, and 90th empirical percentiles. | DD05–DD09, DD18 |

Each milestone can be merged and released after its predecessor without waiting for the next. M1 must not display placeholder Wasserstein or quantile results. No later milestone is needed to make M1’s settings restorable, its trace usable, or its documentation complete.

## 2. Contracts shared by every milestone

### 2.1 Public settings and state

Extend `EcdfSettings` in `packages/explorEDA/src/components/charts/Ecdf/definition.ts:9` with exactly these optional fields:

```ts
compareEnabled?: boolean; // Absent means comparison is off.
compareAKey?: string;    // A canonical categoryKey string.
compareBKey?: string;    // A canonical categoryKey string.
```

Reuse existing `field` for the numeric measure and `colorField` for the grouping field. No `compareField`, per-side filters, saved numerical result, or new top-level saved structure is required. `SavedChartSettings` already derives from the chart-settings union (`types/SavedDataTypes.ts:60`); `SavedDataStructure.charts` carries those settings (`types/SavedDataStructure.ts:24`). These citations and other shortened source paths below are relative to `packages/explorEDA/src/` unless they begin with `apps/` or `docs/`.

- **Saved:** enable state, ordered typed group keys, existing numeric/group fields, ordinary chart presentation and filters.
- **Transient:** sorted observations, exclusion IDs, BigInts, interval runs, distances, source generation, focus/hover, selected maximum, selected interval, trace state, and all source-row memberships.
- **Actions:** a valid group selection is one `updateChart` action; Swap changes A/B in one action. Changing `colorField` intentionally clears A/B in that same action unless a new field and new pair are committed together. A source/filter refresh retains choices whenever the existing host restore/reuse flow retains chart settings.
- **Defaults:** no automatic pair choice. Enabling an unconfigured comparison asks for A and B. Disabling preserves the pair for re-enabling. Old saves with absent settings render as before.

Use the existing category codec, not labels: `lib/categories.ts:17`, `categoryKey`, separates number `1` from string `"1"`, booleans from strings, and nonfinite numeric categories from their textual names. Its existing equivalences are null with undefined and negative with positive zero. Missing is a selectable category. A literal string `Other categories` remains a real category; the generated display pool is never selectable as a comparison group.

Validate boolean and canonical supported key shapes at the saved-data boundary. A tiny validator may decode the category tuple and require re-encoding with `categoryKey` to reproduce it. Malformed keys are invalid settings. Equal A/B or a missing field/key makes the comparison incomplete. A well-formed selected key absent from current rows is an empty/unavailable population: preserve the key and show zero candidate/valid rows. Retain the chart and choices in these states, explain the reason, and do not silently choose replacement groups. This separates serialization validity from current data availability and avoids DSL setting-order dependence.

### 2.2 Population, filtering, and numeric preparation

Let the comparison universe be current prepared rows that satisfy this chart’s `localFilters`, workspace filters, other linked charts’ filters, and the current facet if one is supplied. Exclude **all filters owned by this ECDF** from both the comparison and its displayed A/B curves. Provider `localSelections=true` removes chart-to-chart conditioning; workspace filters continue to apply. State that mode accurately in scope text.

This follows the existing ownership boundary: `useGetLiveIds` reads chart live items (`components/charts/useGetLiveData.tsx:43`); `CrossfilterWrapper.addChart` gives each chart its own dimension and group (`hooks/CrossfilterWrapper.ts:92`); local population restrictions are applied when live data is collected (`CrossfilterWrapper.ts:187`). `getChartFilteredRowIds` includes every linked filter, including this ECDF’s, and is therefore the wrong comparison input (`CrossfilterWrapper.ts:178`). `useGetAllIds(settings)` already applies chart-private restrictions and is not an unrestricted-table alias (`useGetLiveData.tsx:61`).

Enumerate selector options from uncapped `useGetAllIds(settings)`, using its chart-local population before linked filters. Keep a selected group visible when filters leave it with no rows. Do not apply the ten-curve display limit to this enumeration. In comparison mode draw only the actual selected A/B curves; bypass the ordinary pooling path rather than trying to recover groups from Other. Keep the existing all-source/chart-local x-domain rule so filtering does not rescale the reference arbitrarily. `showOverall` has no comparison role: suppress its curve in comparison mode without overwriting the saved flag.

Handle an explicitly supplied empty facet `[]` as empty for **both** the comparison and displayed curves. The baseline helper’s `facetIds && facetIds.length > 0` check otherwise treats it as unrestricted (`useGetLiveData.tsx:43`). Prefer a narrow ECDF input boundary or an explicitly verified shared-hook change; do not fix the statistic while leaving its curves on a different population. Selector options and the existing source x-domain remain based on `allIds`.

Within each selected group, accept exactly the ECDF’s numeric preparation rules. Read values through provider columns and `lib/valueParsing.ts`; do not reparse raw rows with a different rule. `numericExclusionReason` and `parseNumber` distinguish missing/blank, boolean, and invalid/nonfinite measurements while accepting finite numeric strings (`valueParsing.ts:87`, `valueParsing.ts:32`). A prepared value, rather than its formatted label or original textual spelling, is the statistical input. Record separately:

- Candidate rows for A and B before numeric exclusion.
- Valid counts `n` and `m`, each its group’s denominator.
- Excluded rows and reasons within each group.
- Rows belonging to unselected groups, which are outside the comparison rather than numeric exclusions.

The first release compares disjoint categories of one field. Repeated entities in different rows remain repeated row observations; no automatic deduplication or independence assumption is introduced. If either valid count is zero, all distances and quantile differences are unavailable, not zero. Singletons and constants remain valid empirical distributions.

### 2.3 Selection, trace, and visible meaning

Preserve the numeric range-only behavior of `EcdfChart.commit` (`EcdfChart.tsx:228`). Choosing the analysis pair adds no group-union filter. A threshold/span continues to combine with any other pre-existing filters owned by that chart. Thus selecting a threshold is not limited to A/B, and linked Rows counts must reflect the actual provider/filter behavior, not the numeric-valid denominators used by the statistic.

Use visible text such as:

> Other filters apply. This chart’s selections do not change the comparison.

Add the compact selection explanation where a range is shown:

> Threshold selection is not limited to the comparison groups.

In `localSelections` mode adapt the first sentence to explain that chart selections remain local. Trace contributor tabs inspect exact subsets; they do not install filters automatically.

Reuse `TraceSource` and `ChartTraceScope`, whose selections store owner/kind/id/revision and close when stale (`trace/traceTypes.ts:38`, `trace/ChartTraceScope.tsx:108`). Extend the ECDF trace union/resolver and header targets. `ecdfTraceTargets` currently exposes curve quantile marks (`Ecdf/ecdfTrace.ts:59`), so add explicit comparison targets instead of depending on pointer access to a small gap mark. Keep `findEcdfTraceRow` mapping rows to their ordinary ECDF step; it is reverse navigation, not a causal allocation of Wasserstein distance.

Do not add chart-level Inspect buttons. Use Alt-click, Alt-Enter, and the existing header trace control. A new overlay must account for the full-plot transparent slider rendered after the marks (`EcdfChart.tsx:653`): route events deliberately or provide an appropriately ordered hit region. A line drawn underneath it is not automatically interactive.

### 2.4 Revisions, caching, and numerical architecture

Prepare finite observations once as `(value, sourceId)` entries, sort by numeric value then source ID, and collapse equal values into runs with offsets and cumulative counts. Compare values relationally, not by subtracting possibly huge endpoints in the sort comparator. Build the union-support merge in linear time after sorting. Store run/index ranges; do not copy a full cumulative ID array into every interval.

The numeric memo depends on prepared value/group column revisions, measure/group fields, A/B keys, current source generation, live membership, local population restrictions, and facet membership. It does not depend on width, height, display scale, label formatting, or hover. Conservative invalidation on existing provider nonce is acceptable. Never cache across source generations using only positional IDs or counts. `useGetColumnData` already includes nonce (`useGetColumnData.tsx:5`), and calculation refresh rebuilds live items and increments it (`DataLayerProvider.tsx:1509`).

Extend the plan’s trace revision with comparison identity and semantic settings; `useTraceRevision` alone is only `${nonce}:${liveNonce}` (`ChartTraceScope.tsx:170`). On data preparation, population, field, pair, or relevant orientation changes, invalidate old trace selectors and recompute. IDs are positional links within the current loaded source; do not save them as cohort membership. The provider can reset charts during `setData` without reused saved settings, so do not promise that pair settings survive every import (`DataLayerProvider.tsx:674`).

Use focused ECDF modules, proposed below. No weights, p-values, confidence intervals, normalized score, sampling, histogram approximation, or screen-coordinate input is part of this contract.

## 3. M1 — Explicit pair and maximum ECDF share gap

### User-visible deliverable

The analyst enables comparison, chooses A/B, sees their two curves with valid counts and exclusions, reads the largest difference in cumulative shares, and opens the two counts and records that establish it. The readout says which group has the larger displayed share at or below/at or above the shown threshold, according to direction. It does not call one distribution “better,” claim a global stochastic ordering, or label the result statistically significant.

At 1280 pixels, keep the pair controls and concise result near the chart. At 783 pixels, wrap controls before shrinking the plot or truncating group names. At 390 pixels, stack A/B and the result, keep the plotted field and filter state visible, and place interval/count details in the existing nonmodal trace surface. Use text plus color to identify A and B. No horizontal page overflow or inaccessible icon-only action is acceptable.

### Mathematical implementation

For nonempty A/B, define the canonical lower-tail difference:

\[
g(t)=F_A(t)-F_B(t),\qquad D=\sup_t |g(t)|.
\]

After consuming all tied observations at each union-support value `l`, retain the interval `[l,r)` to the next distinct support value and counts `cA`, `cB`. Compute its exact signed integer numerator:

\[
q=c_A m-c_B n,\qquad g=q/(nm).
\]

Require safe-integer counts and convert each operand to `BigInt` before multiplication. Use `BigInt` for products and comparisons; never subtract rounded cumulative percentages to find maxima. All intervals with maximal `abs(q)` are retained in increasing lower-endpoint order. The smallest lower endpoint is the canonical displayed maximum. Ties are compared exactly, not with an epsilon. Before the first support point and at/after the final point, the gap is zero.

For “at or below,” draw/trace the canonical marker at `l` using inclusive counts `X≤l`. For the existing inclusive “at or above” display, the corresponding maximum is at `r` using `X≥r`; its signed difference is `−g`. Do not use `1−F(r)` or place the same inclusive marker at `l`. Each interval can carry both endpoint views while the stored statistic retains its canonical lower-tail definition. If `D=0`, show “The empirical distributions match” and no maximum marker; do not invent a unique threshold.

Display D as a share gap in percentage points, backed by counts and exact numerator/denominator in the plan. For example, `D=1/2` is 50 percentage points. Swapping A/B leaves D and the maximizing intervals unchanged and flips signed gap explanations.

M1 introduces proposed `Ecdf/distanceArithmetic.ts` with the small exact rational-to-Number converter needed for D. Follow the methods report's integer quotient/remainder, round-to-nearest/ties-to-even procedure; round only the final scalar, retaining the exact fraction for maxima and trace details. M2 extends this same local module with binary64 endpoint decoding and the W1 accumulator. Include independent midpoint/rounding assertions with M1 so its numerical promise is complete at release.

Sorting costs `O(n log n + m log m)`; the merged scan costs `O(n+m)` integer operations. Memory is `O(n+m+k)` for observations, runs, and `k` union intervals. BigInt count arithmetic adds operand-bit costs, not a new statistical approximation. Computing the statistic must remain separate from axis projection. If huge endpoints cannot be drawn by the current axis, preserve the numerical readout and trace and explain that the plot cannot display that extent.

### Files and work sequence

1. **Settings and input preparation.** Extend `Ecdf/definition.ts` and `EcdfSettingsPanel.tsx`; add a small proposed `Ecdf/ecdfComparisonPlan.ts`. Define group preparation, exclusion/run metadata, readiness states, exact gap numerators, maximum intervals, and pure record-range lookup. Reuse `categoryKey` and shared numeric parsing. Inspect and extend saved-data validation at the same time.
2. **Curves and readout.** Integrate the pair input into `EcdfChart.tsx` and `ecdfPlan.ts`. A/B curves and the numeric plan must share the same prepared entries. Add proposed `Ecdf/EcdfComparisonReadout.tsx`; draw only the chosen groups, preserve the source x-domain, and suppress the Overall display pool/path in comparison mode. Keep ordinary ECDF behavior unchanged when disabled.
3. **Quantile display consistency.** In M1/M2 comparison mode suppress the existing direction-dependent 50/90% crossing marks. Do not expose a no-op quantile toggle in that mode. Preserve the saved `showQuantiles` flag; M3 will use it for the specified canonical lower-tail markers. There is no user-facing “coming soon” control or implementation note.
4. **Trace.** Add proposed `Ecdf/ecdfComparisonTrace.ts` and `Ecdf/EcdfComparisonTraceBody.tsx`; register their union/dispatch through the existing trace system. Provide a maximum-gap target, exact A/B counts, denominator rows, at-endpoint tie rows, exclusion rows, and all tied maximizing intervals. Reuse `AggregateContributorTable` after inspecting its actual handoff behavior. Label zero-count contributor sections explicitly rather than omitting a denominator.
5. **Persistence and text.** Register the three fields in `lib/dsl/settingKeys.ts:469`. Use the generic paths in `compile.ts:2229` and generic export in `export.ts:526`. Do not encode the pair as `where.`/`select.` filters: `compile.ts:1732` currently matches values through `String(raw)`, which cannot preserve all typed distinctions. Keep all three literal settings—`compareEnabled`, `compareAKey`, and `compareBKey`—out of notebook field-alias rewriting (`lib/notebook/writeBack.ts:175`); even boolean `true` can collide with a field alias. Retain optional keys across chart-type writeback (`writeBack.ts:690`).
6. **Callbacks, refresh, export.** Commit each control action with `updateChart`; a Swap is one call. Open trace, hover, maximum navigation, and resize emit no settings callbacks. Test savedData echoes and restore stability at the existing fingerprint boundary (`DataLayerProvider.tsx:1639`, `DataLayerProvider.tsx:1675`). Include the comparison readout, group labels, counts, units, and scope note in image export, not only the SVG curves. Inspect the actual exporter before choosing HTML versus SVG placement.

The generic DSL can express the settings without new grammar:

```text
ecdf @comparison Value color=Group compareEnabled=true compareAKey="[\"string\",\"A\"]" compareBKey="[\"string\",\"B\"]"
```

The exact quoted keys above are proposed saved identity, not visible product text. Validate export→compile→save with the real path codec, which was not in the packet. `writeBackChart` already recompiles a splice and falls back to a single-declaration rewrite (`writeBack.ts:539`); preserve that protection and surrounding notebook prose/comments.

### Runnable example and documentation

Add proposed `apps/demo/src/demos/distributionComparisonDashboard.ts` and `apps/demo/public/datasets/distribution-comparison.csv`, served as `/datasets/distribution-comparison.csv`. `LiveExampleSpec.data` specifies a CSV under `public/` (`apps/demo/src/docs/live/examples.ts:64`). Register the example in `apps/demo/src/demos/examples.ts` as `distribution-comparison`, yielding `/examples/distribution-comparison`. Include the comparison ECDF, a Region filter chart, and Rows. Add its capability/coverage entry in `apps/demo/src/demos/coverage.ts`. The repository guide requires example coverage and Dashboard-text roundtrips when an example is added (`docs/agent-guide.md`, Tests).

Use this exact prepared-value fixture for integration tests and the illustrative example:

| Positional ID | Group / Value | Region |
|---|---|---|
| 0 | A / 0 | W |
| 1 | A / 3 | W |
| 2 | B / 1 | W |
| 3 | B / 2 | W |
| 4 | A / null | W |
| 5 | B / true | W |
| 6 | C / 100 | W |
| 7 | A / 2 | E |
| 8 | B / 4 | E |

CSV ingestion may represent `true` as text or convert a mixed column differently. Test the exclusion contract directly with these prepared TypeScript values. Verify the demo loader’s actual preparation; if necessary, use a small existing typed dataset construction route for the example or display the loader’s actual exclusion reason. Do not assume that a CSV spelling preserves a boolean measurement. The numeric A/B result must remain the one stated below.

With the peer Region chart selecting W: A has valid IDs `[0,1]`, values `[0,3]`, and excluded ID `[4]`; B has valid IDs `[2,3]`, values `[1,2]`, and excluded ID `[5]`. ID 6 is outside the pair. There are two maximizing intervals, `[0,1)` with `g=1/2` and `[2,3)` with `g=−1/2`. The canonical below marker is 0: A’s count is `1/2` from ID `[0]`; B’s is `0/2` from `[]`. The above counterpart is 1: A’s count is `1/2` from `[1]`, B’s `2/2` from `[2,3]`. The raw x-domain still reflects the source/local population, including C’s 100.

Add live example ID `ecdf-compare-gap` in `apps/demo/src/docs/live/examples.ts`. Its script chooses A/B, selects Region W, traces the maximum, changes to above direction, selects a numeric threshold, and clears it. Add sections **Compare two groups**, **Largest share gap**, **Which filters apply**, and **Trace the counts** to `apps/demo/src/docs/pages/ecdf.mdx`. Update setting descriptions and documentation coverage targets where required; the existing ECDF page/live example is a starting point, not evidence that new settings are already documented.

The supplied `LiveStep` union supports selects, clicks, menu choices, brushes, and assertions, but no explicit modified-click or keypress action (`apps/demo/src/docs/live/examples.ts:43`). Use existing header trace controls where those actions suffice. Inspect the unsupplied runner before extending it; add a narrow typed step only if the intended scripted interaction cannot be expressed. Real Alt-click/keyboard acceptance remains a browser test requirement rather than an unsupported live-script assumption.

### Acceptance and release gate

- **One table-driven mathematical test family:** V01–V08 and V13 below. Check exact D, every maximizing interval, canonical threshold, inclusive endpoint counts, exact contributor IDs, swap symmetry, and D=0/no-marker. Empty results must be unavailable.
- **One population/interaction test:** use the W fixture. Own `x≤0` leaves A/B/D unchanged while the actual linked selection reaches ID 0; a peer/workspace `x≤0` empties B and makes the comparison unavailable. Test own non-range filters remain excluded from comparison and preserved by range commits. In localSelections mode peer chart selections do not condition the pair; workspace filters do. Explicit empty facet makes both curves and comparison empty.
- **One typed identity and persistence test family:** distinguish `1`/`"1"`, missing/`"(missing)"`, and real Other/generated Other; choose groups beyond the normal display cap. Cover old-save absence, malformed key rejection, absent-group retention, enabled/incomplete state, Swap, field-change reset, DSL roundtrip, notebook literal aliases/type change, and controlled savedData echo. Keep tests around public outcomes, not each helper branch.
- **One source-refresh case:** same row count and positional IDs with changed values must recompute and close traces; a selected group removed under reused settings remains selected but unavailable. Do not assert that fresh imports retain charts when the existing provider resets them.
- **Real input/export verification:** pointer and keyboard at 1280, 783, and 390 pixels; reach A/B, Swap, maximum navigation, header trace, and contributor records without hover-only information. Confirm Alt-click is not intercepted incorrectly, Escape behavior follows the existing nested surface, and exported image carries the result and population meaning.

**Main risk:** the mathematical pair and rendered/selected populations diverge, particularly through capped groups, own-filter ownership, empty facets, or typed serialization. Ship only after those shared-input acceptance cases pass. M1 includes its user-facing minor changeset and all documentation/example work.

## 4. M2 — Exact Wasserstein distance and interval ledger

### User-visible deliverable and math

Add **Average value distance** with the first Wasserstein distance `W1`, in the numeric field’s original units. Explain it as the area between the two CDFs on the original value scale, equivalently average absolute separation of equal probability levels. It measures value displacement across the whole distribution; it does not assign a cause to particular records or identify matched entities.

Reuse M1’s union intervals and exact `q`:

\[
W_1=\sum_{[l,r)} \frac{|q|}{nm}(r-l).
\]

Extend M1's proposed `Ecdf/distanceArithmetic.ts` with local finite-binary64 decoding and accumulation. Decode every finite input exactly as `I(x) × 2^-1074`, with signed integer `I(x)`. Accumulate:

\[
S=\sum |q|\,[I(r)-I(l)],\qquad
W_1=\frac{S}{nm}\,2^{-1074}.
\]

Use exact integer widths before multiplying/dividing; a naive `r-l` may overflow even when its weighted contribution is finite. This contract is exact for the prepared binary64 inputs, not for unrepresented original decimal values. There is no threshold sampling, subsampling, numerical quadrature, or rounded-label integration.

Return a discriminated result with four statuses:

1. **True zero:** `S=0` exactly.
2. **Finite:** the exact value lies between `Number.MIN_VALUE` and `Number.MAX_VALUE`, inclusive; convert the rational once with round-to-nearest, ties-to-even.
3. **Positive below range:** `0<W1<Number.MIN_VALUE`; report a positive value below displayable numeric range, never zero.
4. **Above range:** exact `W1>Number.MAX_VALUE`; report that the value exceeds numeric range, never an ordinary computed Infinity.

Classify against the exact bounds before conversion. Do not use `Number(S)` and then divide: that can overflow while the final rational is finite. Keep the exact numerator/denominator available transiently for comparisons and oracle tests. Decimal UI formatting happens last. No arbitrary division by pooled SD, IQR, range, or mean is included.

The scan remains linear in interval count, with bounded finite-double exponent width plus count-product bits for BigInt operations. Store endpoint/count metadata and one accumulated S; compute an interval’s large exact contribution on demand rather than retaining copied contributor IDs or large per-row BigInts. The ledger should render only a bounded visible page/window while its totals remain computed from all intervals.

### Files, inspection, and controls

Extend `ecdfComparisonPlan.ts` to produce W1 and interval metadata and `EcdfComparisonReadout.tsx` to display it. Extend the arithmetic helper and focused tests; no new settings are needed. Extend the existing comparison trace with:

- Exact interval bounds `[l,r)`, both cumulative counts, the absolute share gap, interval width, contribution, and contribution share when W1 is nonzero.
- A/B denominator records; cumulative `≤l` records explaining the gap; and records tied at each endpoint, clearly named.
- Navigation in numeric interval order, with zero-contribution intervals represented consistently. Do not call rows lying strictly inside the interval “the contributors”: adjacent union-support intervals contain no observations in their open interior.

Compute displayed interval width through the same exact difference/range-status helper. A width may exceed `Number.MAX_VALUE` while its weighted contribution is finite. For nonzero total numerator S, compute an interval's contribution share as the exact rational `S_i/S`, then round once with the same range policy; never divide `Number(S_i)` by `Number(S)`. When S is zero, omit shares instead of evaluating 0/0. For A=`[-M,M]`, B=`[M,M]`, width is above range, contribution is M, and its share is exactly 1.

On a linear x-axis, a restrained area overlay may show the global difference and highlight the selected ledger interval. On a log display, retain W1’s original-unit result but suppress any implication that displayed screen area equals W1; use interval boundary/gap guides and text. Display axis changes leave the mathematics unchanged. Keep a finite or range-status readout available even when an extreme axis extent cannot be drawn.

Opening the W1 trace or moving among intervals changes local inspection state only. It must not call `updateChart`, filter Rows, create an undo checkpoint, or write notebook text. Export includes W1 and its unit/status; an open trace ledger itself need not be embedded in the chart image.

### Docs, example, and acceptance

Extend `/examples/distribution-comparison` and add live ID `ecdf-compare-distance`. The W-filtered crossing example has `W1=1`: `[0,1)` contributes `1/2`, `[1,2)` contributes zero, and `[2,3)` contributes `1/2`. Its maximum gap is 50 percentage points, but its median shift is not a summary of its entire difference. Include a second view or scripted pair for V06’s tail to show why D and W1 answer different questions.

Add **Average value distance**, **Inspect an interval**, and **Units and log display** to `ecdf.mdx`; extend the same demo coverage. Document source-row continuation precisely and explain that different mixtures of shifts and shape changes can produce the same scalar distance.

- Compare the interval integral against an independent exact quantile-transport oracle for V01–V11. The oracle merges probability-mass boundaries, not the implementation’s value intervals. Retain exact rational assertions before testing decimal presentation.
- Test selective replication separately from uniform replication. Repeating every row within either group preserves its empirical measure; repeating just one observation can change W1.
- Test V09’s large offset and V10’s positive affine transform; D remains fixed while W1 scales by the positive multiplier.
- Exercise V14’s true overflow, intermediate-overflow/finite-answer, subnormal positive-below-range, and rounding cases. Add explicit rational rounding fixtures around normal/subnormal boundaries and halfway ties, using a separately derived integer-rational oracle.
- Trace the crossing example’s two nonzero intervals and check exact A/B cumulative and endpoint IDs. Verify no invented single causal record set or one-to-one entity pairing appears.
- Verify the linear/log render and exported image at all three widths; swapping groups preserves W1, and source/filter changes invalidate its interval inspection.

**Main risk:** numerical range handling or the visual metaphor misstates a mathematically valid result. Exact integer accumulation and independent probability-space oracles are required, not optional polish. Ship M2 with its own docs/example changes and user-facing changeset.

## 5. M3 — Signed empirical quantile differences

### User-visible deliverable and contract

Add a compact fixed readout at 10%, 50%, and 90%, with signed values:

\[
\Delta(p)=Q_B(p)-Q_A(p),\quad
Q_A(p)=x_{(\lceil pn\rceil)},\quad 0<p\le1.
\]

Use the generalized inverse of the empirical CDF, often called type 1. For these fixed probabilities compute ranks by BigInt ceiling division: `ceilDiv(BigInt(count), 10n)`, `ceilDiv(BigInt(count), 2n)`, and `ceilDiv(9n * BigInt(count), 10n)`. Convert the resulting in-range rank to an array index. Convert operands before multiplication; avoid an approximate floating `p*n` decision or an unsafe Number product. The sorted array is one-indexed in the formula and zero-indexed in code. State the convention in trace and documentation. D3 `quantile`/`quantileSorted` use R-7 interpolation, so they do not implement this contract (methods report P18).

Positive Δ means B has the larger value at that lower-tail percentile; negative means smaller. Keep this definition when the chart is displayed in “above” direction. Do not repurpose the existing direction-dependent crossing helper (`Ecdf/ecdfPlan.ts:200`) without replacing its semantics. In comparison mode, `showQuantiles` now controls these canonical percentile marks; ordinary ECDF mode retains its current behavior.

Use M2’s dyadic arithmetic for subtraction: `I(QB)−I(QA)` can exceed numeric range even though both quantile values are finite. Return signed range status instead of an unqualified Infinity. Swapping A/B negates Δ, while positive `a*x+b` scales Δ by `a`. No quantile confidence band or interpolated quantile estimator is added.

### Files, records, persistence

Extend `ecdfComparisonPlan.ts` with the three rank pairs, values, exact signed differences, and tie-run references. Reuse prepared runs and `distanceArithmetic.ts`. Extend the readout and trace with a small linked percentile strip or compact marks; do not introduce a separate chart type. No extra saved percentile list is needed.

Draw labeled x-axis percentile guides at `QA(p)` and `QB(p)`. If also placing a mark on a curve, use its actual direction-specific inclusive `shareAt(Q(p), direction)`, never blindly `p` or `1-p`; tied jumps can make those positions differ. The label continues to name lower-tail percentile p in above mode.

For each percentile, trace its probability, rank, valid group size, selected value, and the full tied set at that value. If multiple rows share the selected rank’s value, list all ties rather than choosing one source row as uniquely responsible. Source ID ordering remains deterministic for navigation but is not a mathematical tie-breaker for the quantile value. Show A and B independently; percentile matching is between probability levels, not observed pairs of the same person.

The ordinary `showQuantiles` setting already persists through saved data, Dashboard text, and notebook writeback. Add regression checks for its new comparison-mode interpretation, mode switching, and old-save behavior. Inspection state remains ephemeral; use the existing source revision to close traces after value, population, or pair changes. Export includes the signed readout and visible canonical marks without changing the original-unit calculation on a log display.

### Docs, example, and acceptance

Add live ID `ecdf-compare-quantiles` and extend the same runnable example. With Region W, A=`[0,3]`, B=`[1,2]`, the signed differences are `[1,1,−1]` at `[10%,50%,90%]`: the lower and middle quantiles are higher in B while the upper quantile is lower. This is the deliberate explanation of the crossing curves, not a claim that B has shifted uniformly.

Add **Where the groups differ**, **Percentile convention**, and **Ties and repeated rows** sections to `ecdf.mdx`. Link to the existing ECDF explanation and show how percentile differences complement both D and W1. Include the fixed-level choice in the settings reference without exposing implementation vocabulary in the compact chart copy.

- Assert the exact Δ triples in the vector table below, including odd/even sizes, unequal n/m, ties, singletons, and selective replication.
- Assert swap sign, positive-affine scaling, and uniform replication invariance. Uniform replication can change a rank number while preserving its generalized-inverse value; test the value and full tied set semantics.
- Check the display direction toggles between above/below without changing any Δ, and `showQuantiles` affects marks without changing the values.
- Verify a quantile trace lists all tied endpoint rows and both denominators, with no arbitrary unique “record behind the percentile.”
- At 1280/783/390, reach each percentile through keyboard and header trace navigation, see the sign and A/B meaning without color alone, and confirm export and saved/notebook roundtrips.

**Main risk:** an unstated interpolation or direction convention reverses an explanation or changes a reported median. The fixed integer-rank contract and exact proof cases make that choice reviewable. Ship M3 with its own docs/example extension and changeset.

## 6. Exact acceptance vectors

These are future test expectations, not claims that an implementation has passed them. Give observations deterministic fixture IDs by group/index; the methods report expands maximizing intervals and record sets. “Δ” means `[p10,p50,p90]` under the M3 convention. Array order is immaterial to the measures; input-ID ordering is used only for deterministic record display.

| Case and arrays | Exact expected distances | Exact Δ |
|---|---|---|
| V01 A=`[0,2]`, B=`[0,0,2,2]` | D=0; W1=0; no maximum marker | `[0,0,0]` |
| V02 A=`[0,1,2]`, B=`[1,2,3]` | D=1/3; W1=1 | `[1,1,1]` |
| V03 A=`[0,3]`, B=`[1,2]` | D=1/2; W1=1; maxima `[0,1)`, `[2,3)` | `[1,1,−1]` |
| V04 A=`[0,0,2]`, B=`[0,1]` | D=1/3; W1=1/2; maximum `[1,2)` | `[0,0,−1]` |
| V05 A=`[5]`, B=`[8,8,8]` | D=1; W1=3; maximum `[5,8)` | `[3,3,3]` |
| V06 A=`[0,0,0,10]`, B=`[0,0,0,20]` | D=1/4; W1=5/2; maximum `[10,20)` | `[0,0,10]` |
| V07 A=`[0,3]`, B=`[1,2,4]` | D=1/2; W1=7/6; maximum `[0,1)` | `[1,2,1]` |
| V08 eligible A=`[2]`, B=`[2,4]`, with typed-group/exclusion fixture | D=1/2; W1=1; maximum `[2,4)` | `[0,0,2]` |
| V09 V03 shifted by `2^52` | D=1/2; W1=1; shifted maxima | `[1,1,−1]` |
| V10 apply `2*x+7` to V03 | D=1/2; W1=2; maxima `[7,9)`, `[11,13)` | `[2,2,−2]` |
| V11 A=`[0,0,3]`, B=`[1,2]` | D=2/3; W1=7/6; maximum `[0,1)` | `[1,1,−1]` |
| V12 A=`[0]`, B=`[0,2]` interpreted as group versus containing whole | D=1/2; W1=1; mathematical future-contract case only | `[0,0,2]` |
| V13 either valid group empty | All comparison statistics unavailable | Unavailable |

V12 is not a first-release UI mode: it documents overlap/containment mathematics for a deferred decision. Do not expose it by treating Overall as B.

For V14, let `M=Number.MAX_VALUE` and `s=Number.MIN_VALUE`:

- A=B=`[-M,M]`: D=0 and W1=0 exactly; all Δ are zero. This rejects the naive `0 * Infinity` path.
- A=`[-M]`, B=`[M]`: D=1, exact W1=`2M`, above-range; every Δ is above-range positive.
- A=`[-M,M]`, B=`[M,M]`: D=1/2, exact W1=`M`, finite even though the interval width `2M` overflows naive subtraction; Δ=`[2M,2M,0]` with signed range status for the first two.
- A=`[0,0,0]`, B=`[0,0,s]`: D=1/3, exact W1=`s/3`, positive-below-range; Δ=`[0,0,s]`, matching the methods report. A separate halfway-rounding variant A=`[0,0]`, B=`[0,s]` has D=1/2 and W1=`s/2`, with the same positive-below-range status.
- Input precision boundary: if preparation has already rounded a decimal beyond binary64 precision to the same finite number as another observation, this feature compares those prepared numbers. It must not invent the missing separation. V09 deliberately uses an offset whose integer separations are still representable.

Oracle routes are deliberately independent: hand-count CDF steps for D; exact rational probability-space monotone transport for W1; integer order-statistic ranks for Δ; and separate binary-rational decoding/rounding fixtures for extremes. SciPy or R can be an additional ordinary-range comparison when available, but a floating implementation is not the exact overflow oracle. The methods report supplies primary implementation sources and interpretation limits.

## 7. Proposed verification commands and release discipline

Use pnpm and the repository’s configured time limits. The following are examples for the implementation worker; adjust proposed test filenames to the files actually created. None was executed in this research run.

```bash
pnpm --filter exploreda exec vitest run src/components/charts/Ecdf
pnpm --filter exploreda check-types
```

Run the focused persistence/notebook tests that cover the changed boundaries, then verify the new example’s roundtrip and coverage:

```bash
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
```

For browser input and images, use the repo’s existing `pnpm dev:agent`, `pnpm shot`, docs verification, and export-proof facilities, following `docs/agent-guide.md`. Capture the new example at 1280, 783, and 390 pixels; check actual pointer/keyboard state changes as well as screenshots. A proposed capture is:

```bash
pnpm shot /examples/distribution-comparison --name distribution-comparison
pnpm --filter demo build
pnpm --filter demo docs:verify -g "/docs/ecdf$"
```

The packet’s `apps/demo/package.json:18` defines `docs:verify` as `playwright test`; the guide documents passing `-g` for a page. Add the comparison chart to the existing image-export proof cases and run the targeted case through the documented export-proof command. Reuse the repository’s browser tooling and pinned environment; do not create a parallel screenshot harness just for this feature.

Each package-feature PR includes its own user-facing minor changeset. Run the complete `pnpm check` once before the implementation PR, from one worktree at a time, as required by `AGENTS.md`. Broaden testing only to satisfy that gate or a concrete uncovered integration risk. Research did not mark any of these future checks passed, and it did not request execution, commits, or publishing.

## 8. Required scope and separate later decisions

**Required through M3:** exact unweighted one-field/two-group mathematics; shared population/curve preparation; honest record continuation; stable typed settings and text roundtrips; current-source invalidation; all three input widths; meaningful image export; docs and runnable examples in every milestone.

**Separate later work:** weights and multivariate distances (DD13); complement/containing-whole comparisons, saved predicates, frozen snapshots, and cross-source comparisons (DD15); a full quantile-difference curve or CDF-difference strip (DD16). External practical tolerance in meaningful domain units can be explored without changing the raw distances (DD14). These are not prerequisites for this release, and open research proposals—including weighted ECDF work—are not treated as shipped dependencies.

**Avoid or defer:** inferential claims/p-values (DD10), generated Other or Overall as implicit populations (DD11), default arbitrary normalization (DD12), and a generic statistical engine/execution graph (DD17). Future weights would replace counts by validated nonnegative masses, require explicit zero/invalid-weight rules, and change the integer-mass contract; that warrants a separate design rather than an unused abstraction now.

The remaining implementation questions are narrow: reconcile the unsupplied validator/path/trace/export files against the named contracts; verify prepared types in the runnable CSV example; and measure the exact dyadic helper on representative in-memory sizes before considering performance work. The selected statistics, population scope, pair identity, signs, units, tie rules, empty-state behavior, and milestone order are decided here.
