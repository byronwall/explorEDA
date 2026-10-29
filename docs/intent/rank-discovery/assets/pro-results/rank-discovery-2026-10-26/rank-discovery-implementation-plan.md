# Rank-based pair discovery: Implementation plan

**Implement five independently useful increments on baseline `9d64a021e35d312887b1bc848e307f42b6c3091f`: native Spearman in the existing Scatter Matrix; simultaneous Pearson/Spearman and a bounded pair browser; chronological original Scatter with opt-in comparison; a scope-aware prepared-draft continuation; and exact large-data scheduling/cache optimization. Each increment carries its own settings validation, persistence proof, focused documentation, and runnable example. No unbuilt research proposal is a dependency, and this Design mission makes no repository changes.**

Date: October 26, 2026. Repository: [byronwall/explorEDA](https://github.com/byronwall/explorEDA). The companion [decision report](rank-discovery-report.md) supplies the primary-source comparison and full rationale. This plan contains the contract, exact proof fixtures, ordered work, and acceptance checklist needed to implement it without guessing at statistical behavior.

## 1. Baseline and execution boundary

The attached prompt was read first, then the source packet’s 44 complete files. Fifteen supplementary files were retrieved read-only from the same commit to verify Scatter date rendering, prepared drafts, preview/counterfactual scope, and placement. The full inventory appears at the end of the report and is repeated by group in this plan’s completion record.

**Current code facts that govern the work:**

- `ScatterMatrix/definition.ts`, `matrixPlan.ts`, and `ScatterMatrix.tsx` already provide the mixed matrix, source-based domains/categories, self-excluded live coefficients, and separate own-selection drawing. The current `pearson` helper requires three pairs. Dates already use timestamps in the matrix.
- `ScatterPlot/pairedSummary.ts::pairedStats` remains numeric and allows two pairs, including sample covariance with `n−1`. `fitPlan.ts` fits original numeric values. Those meanings must survive.
- `ScatterPlot/scatterAxis.ts` currently treats datetime as band. The `"time"` value already in `AxisSettings.scaleType` is insufficient by itself; actual chronological Scatter support is M3.
- `DataLayerProvider.tsx` supplies `updateChart`, `addChart`, `holdStateChanges`, `localSelections`, and saved-data echo handling. `addChart` creates a fresh UUID and returns void. Callback batching is not rollback.
- `ChartDraftContext.tsx`, `ChartPlacementLayer.tsx`, and `useCreateCharts.ts` implement drafts and placement. `AddChartDialog.tsx::usePreviewChart` registers a temporary chart in the same Crossfilter wrapper and renders `ChartRenderer` directly, so the preview sees matrix peer filters and needs semantic local filters for a chosen facet.
- `settingKeys.ts` exhaustively covers saved chart roots. `saveDataUtils.ts` validates saved settings. `SavedDataStructure.ts` and the provider generically carry non-3D chart fields. `savedViewsHistory.ts` distinguishes view changes from filter changes.
- `docs/research/DIRECTION.md` and this mission supersede earlier demand gates. Use React, TypeScript, pnpm, existing chart registration, and existing filter ownership. Do not depend on #507, #514, #517–#529, or any other unbuilt proposal.

All paths in this plan are relative to the repository root unless a prefix is defined. A path marked **new** is a proposed addition. A module named from an import or guide must be opened in the implementation checkout before editing; this report does not imply its unprovided contents were executed or fully reviewed.

### Recommendation mapping

| IDs | Decision carried into implementation |
| --- | --- |
| RD-01, RD-02 | Build native Spearman with the exact pair/group contract. |
| RD-03, RD-04 | Build Both and a compact pooled pair browser, preserving matrix order. |
| RD-05, RD-06 | Build explicit populations and a scope-aware original-record continuation. |
| RD-07, RD-08 | Build time axes and shared opt-in comparison; preserve existing numeric statistics/fits. |
| RD-09, RD-10, RD-11, RD-18 | Build complete persistence, exact scalable execution, accessible interaction, and proof/docs in each increment. |
| RD-12 | Explore prepared ranks only for an explicitly fixed cohort or teaching example. |
| RD-13, RD-14, RD-15 | Defer Kendall tau-b, broad shape discovery, automatic matrix clustering, and group-only continuation. |
| RD-16, RD-17 | Avoid significance/causal/universal mixed scores/coercion, and avoid reusing global rank values or mutating source data into ranks. |

## 2. Contract to freeze before coding

### 2.1 Population and eligibility

Let `S` be source rows after this chart’s `localFilters`; `L` is `S` after workspace/peer filters and the current facet, excluding this chart’s outgoing selection. `P(a,b)` contains rows in `L` with both continuous measurements eligible. Group `g` uses `P(a,b) ∩ g` and reranks inside that set. Matrix selection only highlights `P`; it never changes its coefficient. A peer filter on an unrelated field still changes coefficients if it changes `L`.

Use detected field kinds. Numeric reads go through `finiteNumber`; datetime reads through `timestampOf`, in epoch milliseconds. Do not add raw `Number`, `Date.parse`, a second date parser, boolean conversion, category ordinals, or numeric-looking identifier coercion. Exclude missing, blank, invalid, and nonfinite measurements before ranking. Signed zero ties with positive zero. Two distinct finite values do not tie merely because their displayed labels or rounded decimals match.

For each pair and group, maintain disjoint counts:

```ts
type PairCounts = {
  liveRows: number;
  pairs: number;
  xOnlyIneligible: number;
  yOnlyIneligible: number;
  bothIneligible: number;
};
// liveRows === pairs + xOnlyIneligible + yOnlyIneligible + bothIneligible
```

Label them “n paired rows of E live rows,” with group-specific E/n when appropriate. `selectedPairs` and drawn-point exclusions are separate annotations. Numeric summary’s existing X-first exclusion counters remain unchanged and must not be relabeled as this new count structure.

Date comparison retains the finite timestamp contract. Chronological drawing/brushing requires a lossless UTC date-bound round trip through the existing parser: for a finite timestamp t, its chosen UTC bound string must parse via `dateBound` to exactly t. Calendar-invalid numeric times, fractional milliseconds rounded by the current representation, and unsupported extended-year forms have no supported date position. Mark these as drawing exclusions with raw/parsed timestamps retained in trace. Source time-axis bounds derive from supported source dates, not the filtered subset; this display condition does not silently delete a statistical pair or authorize a parser rewrite.

### 2.2 Ranks, coefficients, unavailable reasons

1. Collect aligned pair-valid row IDs/values.
2. Sort each coordinate by its parsed value. For a tie occupying zero-based sorted positions `i…j`, assign `(i+j+2)/2` to every member.
3. Compute Pearson on the original vectors for `r`, and Pearson on these average-rank vectors for `ρ`. Rerank after every pair/group membership change.
4. A pooled coefficient is calculated directly over all paired rows. Other is calculated over its represented union. Neither is an average of subgroup coefficients.
5. Apply the discovery minimum `n≥3` before constant checks. With fewer rows, return `insufficient-pairs`, including when the sole value is constant.
6. Detect original constant X/Y/both by exact parsed equality. Return `constant-x`, `constant-y`, or `constant-both`; never return zero.
7. Nonconstant eligible inputs that fail finite, positive-variance, or range checks return `numerical-failure`. This is an arithmetic status, not a statement about statistical reliability.

Use centered cross-products. Apply positive rescaling where needed to prevent ordinary overflow/underflow and compensated sums where practical. Detect constants before rescaling; if rescaling destroys detectable variation, return numerical failure rather than claiming an original constant. Pearson and Spearman statuses are independent when raw arithmetic fails but rank arithmetic succeeds.

Proposed endpoint guard: `ENDPOINT_SLACK = 16 * Number.EPSILON`. Clamp only values just outside `[-1,1]` within that slack; reject farther values. Preserve values already inside the interval. Normalize computed `−0` to `+0`. This is a narrow engineering guard, not a universal numerical error bound. Never use it for ties or pair-list sorting.

### 2.3 Pure helper and public settings

Add **new** `packages/explorEDA/src/lib/pairCorrelation.ts` with separately testable helpers for pair collection, average ranks, stable centered Pearson, and result projection. The public component API adds only the following settings:

```ts
// ScatterMatrix/definition.ts; M1 initially supports pearson | spearman.
type MatrixCorrelation = "pearson" | "spearman" | "both";
type MatrixPairOrder = "fields" | "spearman" | "pearson" | "difference";

interface ScatterMatrixSettings /* extends existing definition */ {
  correlation?: MatrixCorrelation; // absent => pearson
  pairOrder?: MatrixPairOrder;      // absent => fields; M2
}

// ScatterPlot/definition.ts; ScatterChartSettings is its existing alias.
interface ScatterPlotSettings /* extends existing definition */ {
  compareRanks?: boolean;           // absent/false => current behavior; M3
}
```

These sketches describe additions, not replacement interface declarations. Do not create duplicate declarations that discard existing fields.

A result shape should distinguish requested methods and unavailable values:

```ts
type CoefficientResult =
  | { status: "ok"; value: number }
  | { status: "insufficient-pairs" }
  | { status: "constant-x" | "constant-y" | "constant-both" }
  | { status: "numerical-failure" };

type OrientedPairResult = {
  pairId: string;
  xField: string;
  yField: string;
  counts: PairCounts;
  pearson?: CoefficientResult;  // undefined => not requested/calculated
  spearman?: CoefficientResult;
};
```

Store the reusable internal result with explicit canonical field keys. Project it to `OrientedPairResult` for a cell or destination. Transposition preserves coefficients and `pairs`, but swaps X/Y-only exclusions, constant-side reasons, value/rank columns, and axis metadata. Do not use display labels as identity.

Canonical pair ID is exactly `JSON.stringify([a,b].sort())` with JavaScript code-unit ordering. Keep orientation separately. Metric order is descending `|ρ|`, `|r|`, or `|ρ−r|`, then unavailable values, with exact ties resolved using the canonical string `<`/`>` comparator. Field order is `i` then `j>i` in authored fields, with unavailable pairs left in position. Do not use locale-dependent sorting, rounded strings, or an epsilon comparator.

`MatrixCell.r`, `groupR`, and `MatrixCellTrace.groups[].r` keep their Pearson meaning during migration. Add a named result field such as `correlations`; do not overload the existing `cell.pairs` / `MatrixPairs`, which describe categorical counts. The helper is internal initially; it need not become a new package entrypoint.

### 2.4 Persistence rules shared by milestones

- Defaults are read-time defaults. An old save without the new keys stays byte-shape-equivalent on a no-op round trip; do not inject explicit `undefined` properties or write a normalized default on mount.
- An actual user edit writes the chosen literal through `updateChart`. Validate optional enum/boolean values in `saveDataUtils.ts::isChart` and the chart’s settings validation; invalid savedData fails its normal validation, while invalid Dashboard text retains the prior valid value and warns through its current compile path.
- Add every new root to `lib/dsl/settingKeys.ts`. Generic export/compile should suffice; no parser grammar, alias, top-level saved schema, or framework change.
- Save method, list order, comparison, and time-axis settings. Never save rank vectors, coefficient caches, current pair-browser search, open state, focused pair, pending computation, or return navigation.
- `DISPLAY_ONLY_KEYS` currently uses `keyof ChartSettings`, whose union semantics cover common keys. Chart-specific keys cannot just be appended. Either keep the ordinary update path initially or make a narrow, tested distributive key/type predicate change. The acceptance requirement is selection preservation and correct recomputation, not this optimization.
- Existing `Omit<ChartSettings,"id">` also loses union-specific members. M4’s typed prepared draft should use a distributive alias, for example `T extends ChartSettings ? Omit<T,"id"> : never`, instantiated with the chart union, or a concrete Scatter draft type. Do not work around that by casting arbitrary unknown settings.
- Continue source-row identity restoration as tested in `savedSelectionRestore.test.tsx`; do not persist runtime row indices as new identities.

## 3. Milestone M1 — Native Spearman in the existing matrix

**Outcome:** an analyst can choose Pearson or Spearman in the shipped mixed matrix, see original points, inspect exact pair/group evidence, and save/reopen the choice. This milestone is executable directly on the supplied baseline. **RD-01, RD-02, RD-05, RD-09, RD-11, RD-17, RD-18.**

### Files and implementation work

Prefix `P = packages/explorEDA/src/`.

| Files/modules | Change |
| --- | --- |
| **New** `P/lib/pairCorrelation.ts`, `pairCorrelation.test.ts` | Implement the exact reference algorithm, statuses, disjoint counts, rank evidence, and oriented projection. Reuse `valueParsing.ts`; do not alter its coercion contract. |
| `P/components/charts/ScatterMatrix/definition.ts` | Add optional `correlation: "pearson" \| "spearman"`; default absent to Pearson. Validate supported fields and method. |
| `ScatterMatrixSettingsPanel.tsx` | Add one Correlation segmented row, Pearson/Spearman, with accessible names and real tooltips. Hide no raw panels. |
| `matrixPlan.ts` | Construct exact live/facet pair populations; call helper once per unique continuous pair and represented group; keep source domains/bands and own-selection path. Validate 2–10 distinct existing fields at the relevant entry instead of truncating oversized loaded configurations. |
| `matrixCanvas.ts`, `ScatterMatrix.tsx` | Draw named coefficient/count/unavailable states and at-rest method label. Preserve points, mixed cells, click/brush conventions, and stable domains. Repaint selection without recalculating ranks. |
| `matrixTrace.ts`, `MatrixTraceBody.tsx`, `charts/trace/ChartTracePanel.tsx` | Add method, E/n, group counts, unavailable reason, original/parsed values, and on-demand ranks. Preserve matrix-cell/matrix-row dispatch. Provide bounded evidence pages with a visible limit. |
| `P/utils/saveDataUtils.ts`, `lib/dsl/settingKeys.ts`, `lib/dsl/export.test.ts` | Validate/persist/export the new setting and cover old absent/new explicit/invalid values. `DataLayerProvider.tsx` owns `toRuntimeChart`, `toSavedChart`, and `saveToStructure`; `types/SavedDataStructure.ts` supplies the saved contract. Change conversion only if a round-trip test identifies a real need. |
| `P/providers/DataLayerProvider.tsx`, provider tests, `savedSelectionRestore.test.tsx` | Verify method edits do not clear outgoing selection; no-op host echoes do not restore/rebuild or emit extra changes. Add display-only typing work only if needed and proven. |
| `matrixPlan.test.ts`, existing summary tests | Assert helper integration, group counts, original Pearson behavior, and unchanged two-pair `pairedStats`. Do not rewrite fit/covariance code. |

### Exact proof cases

- **F01:** ranks `[1.5,1.5,3,4]` and `[1,2.5,2.5,4]`; `ρ=5/6`, `r=4/√22`, `E=n=4`.
- **F02:** `x/y` uses IDs `[0,3,4]`, ranks `[1,2,3]` both sides, `ρ=1`; all three pairs reconcile `(3,2,2,1)` across `E=8`. Explicitly reject the global-rank answer `√(12/13)` for Spearman.
- **F03:** A `n=3,ρ=1`; B `n=5,ρ=−1`; pooled and represented A∪B Other `n=8,ρ=1/21`.
- **F05/F06:** constants, zero/one/two rows, signed zero, numeric-text validity, and parsed date ties. A swapped constant pair changes `constant-x` to `constant-y` correctly.
- **F07/F08:** row permutation, transforms, own selection, unrelated peer filters, and same-size different membership.
- **F11:** default-absent save, explicit Spearman, host echo, DSL, undo, export/reopen, and row-order restoration.

### Focused docs and runnable example

Extend `apps/demo/src/docs/pages/scatter-matrix.mdx` with **Correlation methods and paired rows**. Explain Pearson versus Spearman, average ties, live-vs-selected scope, group-specific n, and unavailable results. Include the two-pair distinction without turning it into the page’s main topic.

Add a deterministic local example **`rank-correlation-basics`** to `apps/demo/src/demos/examples.ts`, with reusable data/settings in **new** `apps/demo/src/demos/rankDiscovery.ts` if that avoids duplicating fixtures. The example offers the F01 tied data and F02 missing-data matrix as named, separate views; it does not combine them into a misleading single coefficient. Register a focused live example and steps in `apps/demo/src/docs/live/examples.ts`: choose Spearman, inspect n, select a row, observe coefficient stability, then apply a peer filter. Add example coverage and setting descriptions through the existing `coverage.ts`, docs catalogue, and reference descriptions described by `docs/agent-guide.md`.

The proposed runnable route is `/examples/rank-correlation-basics` once registered; it does not exist on the baseline.

### Main risk and acceptance

**Risk:** apparent correctness on complete data can hide wrong reranking or accidental self-filter inclusion. The simple sort path can also block on large input; measure its envelope without claiming a latency that has not been observed.

**Accept M1 when:** all listed exact fixtures pass; method and n are visible in resting charts/images; original point/selection behavior remains; old saves stay Pearson with no mutation; new saves/DSL/undo/host echoes work; docs example runs; 1280/783/390 controls are usable by keyboard and touch. Record initial 10-field timing at 10k/100k rows using actual correlation cells. No later milestone or research PR is required to use this result on the verified initial envelope.

## 4. Milestone M2 — Compare and browse pairs

**Outcome:** Both mode displays the two coefficients together; a compact chart-local browser finds continuous pairs without rearranging the matrix. M1 remains useful if this increment is postponed. **RD-03, RD-04, RD-05, RD-09, RD-11, RD-18.**

### Files, APIs, and behavior

- Extend `ScatterMatrix/definition.ts`’s `correlation` enum with `"both"`; add `pairOrder?: "fields" | "spearman" | "pearson" | "difference"`. Extend saved validation, DSL keys/descriptions, and round-trip fixtures in the same increment.
- Add **new** `ScatterMatrix/pairDiscoveryPlan.ts` and `pairDiscoveryPlan.test.ts`: derive unique continuous-pair rows from canonical results, not positional cell IDs. Maximum 45 rows per selected facet for ten fields. Search affects field-name navigation only. Exact metric ties use code-unit ID order; undefined values sort last only for metric order.
- Add **new** `ScatterMatrix/MatrixPairsPopover.tsx` and a chart-level Matrix pair controller through `PlotChartPanel.tsx`. Its current `toolbarTarget` is table-like-only and is not passed through `FacetContainer`; explicitly extend header integration for Matrix. The one controller owns the chosen facet, consumes facet-specific pair snapshots/trace targets, and renders one header action/popover across facets and chart details. Inspect the actual `FacetContainer`/`ChartRenderer` prop route before extending it; do not create one competing portal/button per facet. Reuse standard popover, button, select, focus and tooltip primitives. Do not create a workspace sidebar or second chart type.
- Label the browser **All color groups**, within its explicitly chosen facet. Order by pooled coefficients. Keep group-specific results in trace; a group-only relationship can remain low in pooled order. No extra group selector in this increment.
- Opening Pairs computes and displays both `r` and `ρ` even if cells remain Pearson-only. It does not mutate the saved `correlation` setting. Changing list order updates only `pairOrder`; open/search/focus/facet browsing stay transient.
- Update `matrixCanvas.ts`, `MatrixTraceBody.tsx`, and accessible descriptions for Both. At minimum cell size, keep two labeled lines and `n`; place additional groups in trace with `+N groups`, never silently omit a method or unavailable group. Use fixed readable typography rather than endlessly shrinking text.
- In the list, show original names, signed r/ρ, n, and difference when that order is active. Selecting a row focuses that pair. Explicit trace/menu actions do not filter rows. The Open Scatter action arrives in M4; M2 can use trace and the matrix’s raw points independently.
- With fewer than two continuous fields, keep the existing mixed matrix and show **No numeric/date pairs — choose at least two continuous fields** in Pairs, with a route to field settings. If a selected pair disappears, move focus to the list’s status/nearest valid item with an announcement, not an unrelated invisible target.

### Exact proof cases

- **F04:** exponential has `ρ=1`, `r=20988/√763192368`; show difference about `0.2402791488`. The U-shape has both zero and remains visible in raw points; no “no relationship” conclusion.
- **F09:** exactly six pairs for four continuous fields, with the exact field/metric ID order given below. No mirrored or diagonal duplicates. Reordering fields changes only authored orientation/field-order enumeration; IDs survive.
- **F02:** Difference order is `['["x","y"]','["x","z"]','["y","z"]']`. X/Y gap is `1−√(12/13)`; other gaps are zero. All n remain 3.
- **F03:** pooled ordering reads `ρ=1/21`, with A/B results available in trace but no automatic subgroup-driven priority.
- Hold keyboard focus on `['dec','x']`’s canonical ID while changing order/filter. Focus stays on that pair when it survives. Arrow/key semantics match the chosen native/list pattern; Tab reaches named actions, and Escape restores the Pairs trigger.
- Confirm ordinary coefficient-cell click still follows empty-plot clearing, point click still filters, Alt still traces, and Pairs row selection changes no row predicate.

### Docs, example, risk, acceptance

Add **Compare and browse pairs** to `scatter-matrix.mdx`, with a prominent sentence that difference is a navigation heuristic and the browser is pooled within its selected facet. Register **`rank-pair-discovery`**, with F04 as separate labeled views and F09 as a deterministic ordering view. Its live steps switch Both, open Pairs, choose Difference, inspect the exponential pair, and inspect the U-shape’s original points. Update example coverage, setting descriptions, and docs verification for this example.

**Risk:** the list could appear to be a significance/quality ranking, or the UI could become unreadable at ten fields. Counter this with exact method/scope labels, no stars/“strong” badges, stable matrix order, and measured layout at all three widths.

**Accept M2 when:** canonical-order fixtures, enum/DSL/save/undo proofs, zero-pair state, pooled/group labels, bounded scrolling, focus return, and image-export semantics pass. The screenshot at 390 px must show a readable list row with both values/count and reachable actions, plus an intentionally scrollable matrix rather than whole-page overflow.

## 5. Milestone M3 — Original Scatter comparison and chronological dates

**Outcome:** an ordinary Scatter can display pooled raw/rank correlation, and an explicitly selected datetime axis uses elapsed time with original records. This is useful before automatic matrix continuation and supplies its missing date capability. **RD-02, RD-07, RD-08, RD-09, RD-11, RD-18.**

### Files and APIs

| Files/modules under `packages/explorEDA/src/` | Change |
| --- | --- |
| `components/charts/ScatterPlot/definition.ts` | Add `compareRanks?: boolean`; preserve `summary`, `regression`, and default settings. Validate the flag. |
| `ScatterPlotSettingsPanel.tsx` and its imported axis/analysis controls | Add one Compare ranks toggle. Expose Time only for detected datetime axes. Inspect the actual controls before editing; their implementation was not in the original packet. |
| `ScatterPlot/scatterAxis.ts` | Add explicit datetime/time behavior with `valueKind`, timestamp-based positions/inversion, UTC labels, and source-based renderable date domains. Existing saved default date bands remain unchanged. |
| `ScatterPlot/scatterPlan.ts`, `ScatterPlot.tsx`, `ScatterSvg.tsx`, `planScatterPoints.ts` | Carry numeric/date kind through point planning, reconstructed axis plans, own filters, date-range brushing, filter span drawing, clipping/hidden markers, and raw record traces. |
| `components/charts/Axis/axisPlan.ts` | Prefer the existing explicit `tickValues` input with linear millisecond geometry and local Scatter temporal metadata. Do not add a shared time variant across every chart without a demonstrated need. |
| **New** `ScatterPlot/scatterComparison.ts`, `scatterComparison.test.ts` | Adapt self-excluded facet rows to the shared helper, pooled only, n≥3, before log/size/viewport rendering exclusions. Return pair/count/status and on-demand evidence. |
| `ScatterPlot/FitLabels.tsx`, `useScatterFits.ts`, trace dispatch/renderer | Present the new comparison without an unexplained duplicate Pearson line. Keep `summary` saved as authored and keep Paired numeric statistics trace/means/covariance. Include value kind in eligibility/cache decisions. |
| `pairedSummary.ts`, `fitPlan.ts`, marginal/density/hexbin/contour consumers reached from Scatter | Add explicit numeric eligibility guards where a new continuous time axis would bypass old band checks. Do not implement date covariance, temporal regression, or date surfaces incidentally. |
| `saveDataUtils.ts`, `settingKeys.ts`, `export.test.ts`, provider/history tests | Carry `compareRanks` and explicit time axes through all persistence boundaries, without normalizing old saves. |

New comparison reads the typed pair population before size-field omissions, log restrictions, and axis clipping. Its trace shows drawing exclusions separately when `drawn≠pairs`. Compare ranks is unavailable for categorical axes, with a concise explanation; a date requires the explicit time axis. Numeric axes may remain linear/log/symlog while r/ρ still describe original measurements.

Keep existing category/color selection and original row IDs. No global rank field, ordinal-date spacing, lag calculation, or automatic line fit is added. The color scale remains an encoding; the first Scatter comparison is pooled and does not introduce a second group-scope control.

### Exact proof cases

- **F01/F03/F04:** Scatter comparison matches matrix results when its actual pair population matches, including both method names and n.
- **F05:** new comparison says Needs 3 at n=2; existing Paired numeric statistics still returns `r=1`, means `(1.5,15)`, and covariance `[[0.5,5],[5,50]]`. No fit/covariance rank conversion.
- **F06 dates:** the first two differently zoned strings occupy the same X position and share rank 1.5; comparison matches `ρ=5/6`, `r=4/√22`.
- **F12:** Jan 1, Jan 2, Jan 10 occupy elapsed-time spacings `1:8`; date brushes produce typed date-range filters and exact expected IDs. Raw date strings survive record trace. Test missing/invalid text separately from a finite out-of-calendar timestamp.
- Positive numeric points omitted by a size field, nonpositive values omitted by a log axis, and clipped points do not silently alter statistical n. Assert exact n and separate drawing-exclusion counts using the fixture below.
- With explicit time axes, numeric-only fits/paired statistics/surfaces remain unavailable or inactive with an explanation; selecting a valid numeric field restores their normal behavior. Do not keep stale prior numeric results under date labels.

### Docs, example, risk, acceptance

Create **new** `apps/demo/src/docs/pages/rank-discovery.mdx` with **Compare original measurements**, link it from `scatter-matrix.mdx` and the current Scatter documentation, register it in the docs catalogue, and link its live example. M4 and M5 extend this same page with their focused sections.

Register **`rank-original-scatter`** using F06/F12 date examples plus the exponential numeric example as separate views. Live steps enable Compare ranks, choose Time, brush Jan 1–2, inspect a source row, and compare numeric summary behavior at n=2. Update setting descriptions, coverage, live examples, and docs verification in this milestone.

**Risk:** treating datetime as a generic continuous scale can accidentally enable numeric-only consumers or serialize a numeric range instead of a date range. Audit every Scatter branch currently gated only by band/non-band and test restored filters, own-selection dimming, trace, and cache invalidation.

**Accept M3 when:** original timestamps/spacing/records and date filters are correct; numeric summary/fit regression tests stay unchanged; both counts reconcile even with drawing exclusions; old date scatters retain their saved behavior; `compareRanks` and time axes survive savedData/DSL/echo/undo/reopen; 1280/783/390 and image proof pass.

## 6. Milestone M4 — Matrix-to-Scatter continuation with truthful scope

**Outcome:** a selected pair becomes a prepared standard Scatter, then original record selection/trace, with cancellation and back navigation that preserve ownership. **RD-05, RD-06, RD-09, RD-11, RD-18.**

### Draft API and integration

Add a small internal `openPreparedDraft` entry to `components/plot/ChartDraftContext.tsx`. Use a discriminated/distributive `ChartDraftSettings` type or concrete Scatter draft settings. A possible call shape is:

```ts
openPreparedDraft(scatterSettings, {
  origin: { sourceChartId, pairId, facetIdentity },
  clearSourceChartFiltersOnAccept: false,
});
```

The options are transient draft context, not public saved chart settings. The secondary action sets the boolean true explicitly. Use `hooks/useCreateCharts.ts::buildChart` for defaults and existing placement. `addChart` generates the final ID; do not rely on a draft ID surviving or on a returned ID the API does not provide. If focus needs the new ID, resolve it through a narrow typed result from the accepted placement action rather than comparing entire chart lists in every chart hook.

`ChartDraftContext.place` currently clears the draft. Before that happens, transfer origin/return context into a workspace-scoped ephemeral navigation record keyed by the accepted Scatter ID. It must survive details/grid remounts, remain outside savedData/history, and clear on return, destination removal, or workspace restore. Merely leaving origin in draft options would lose the promised post-accept return path.

Prepare:

- Original `xField`, `yField`, field units/labels through existing metadata, `colorField`, and `colorScaleId`.
- Points enabled, fits off, `compareRanks: true`, and empty outgoing `filters`.
- Existing source `localFilters` intersected with typed semantic predicates for the chosen facet; destination facet display off for this one-facet continuation.
- Explicit `xAxis.scaleType: "time"` and/or Y time for detected date fields; normal original numeric axes otherwise. Do not copy a matrix’s pixel domain into a saved axis range.

Reuse the current facet predicate implementation or extract the smallest semantic adapter after reading it. Preserve type distinctions and missing-category semantics. Do not persist runtime `visibleFacetIds` or record-index lists. Color groups do not become local filters; initial handoff is pooled within the chosen facet.

### Default, secondary action, and preview

| Stage | Exact state rule |
| --- | --- |
| Open standard draft | No saved chart is added, no source filter is cleared, no existing layout moves. Preview registers temporarily with empty outgoing filters, as today. |
| Default Open Scatter | New chart will see current workspace and peer filters, including the matrix’s selection in linked mode. Show source coefficient n and destination preview n. |
| Secondary clear choice | Label **Clear matrix selection and open**. Preview still shows the current linked population. Separately state **After clearing this matrix: n paired rows**. Never label the preview itself as already widened. |
| Draft edits or source changes | Recompute both counts for final fields/local filters and current source revision. After-clear count uses self-excluded peer membership before the source local restriction, then applies final draft scope; never a click-time number. |
| Final placement acceptance | Validate chart/source/layout first. Clear only source outgoing filters if selected, apply proposed moves, and add chart as one undo/notification unit. Use `holdStateChanges` with release in `finally`; if true atomic subscriber state is required, use a small single-update provider action. |
| Cancel before acceptance | Remove temporary preview and discard draft/origin/clear intent; preserve all saved charts, selections, and layouts. No undo item or saved-state callback for speculative changes. |
| Placement Back | Preserve draft settings, origin, and clear intent; reopen editing and re-register its current linked preview. Recompute revision-sensitive counts. No saved charts, filters, layout, history, or callbacks change. |
| Return after acceptance | Close the relevant details/temporary browser and restore focus to source pair/header when available. Keep the added chart and all accepted filters. Its selection may now filter the matrix as an ordinary peer. |

In `localSelections` mode, source selection is not a destination peer filter, so omit the redundant secondary clear action. Keep workspace filters effective. Respect read-only/history-preview mode: inspection can remain available where existing rules allow, but chart creation and clearing remain disabled.

The two additional pinned source files resolve how to compute the projected count when the draft broadens its copied local scope. `CrossfilterWrapper.ts::getAllData` obtains the source chart’s raw `group.all()` before `getPopulationTest` applies source local filters. Add this narrow read-only method to the existing wrapper:

```ts
getPeerFilteredRowIds(chartId: string): IdType[] | undefined {
  const entry = this.charts.get(chartId);
  if (!entry) return undefined;
  return entry.group.all()
    .filter(item => item.value > 0)
    .map(item => item.key);
}
```

Apply `chartPopulation.ts::restrictToPopulation(peerIds, finalDraft, currentFieldGetter)` and then the final draft’s typed pair validity. The raw group excludes the source’s outgoing dimension and preserves workspace/peer dimensions. A missing source is unavailable, never zero or all rows. Do not substitute `getLiveItems(source)`, `getFilteredRowIds()`, or `getChartFilteredRowIds()`: the first has already applied source local filters; the latter two retain its outgoing selection. React to live/filter revision, data/calculation nonce, final fields, and final local filters, not just stable wrapper identity. Recheck the remembered source is still the intended matrix on acceptance. No isolated wrapper or saved filter exemption is required.

The existing Add Chart dialog can change destination type. If `draft.type !== "scatter"`, discard pair-specific projected counts and clear-on-accept intent; the remaining draft continues as an ordinary chart. A source-clear action must never survive into an unrelated chart type.

If draft X/Y changes, the destination readout names that final pair. Do not present the launch pair’s old coefficient/count as directly comparable unless the matching reference is recomputed; otherwise label it separately as the launch pair. The final counterfactual query always uses current destination fields and scope.

### Files/modules

- Matrix action/render: `ScatterMatrix.tsx`, **new** `MatrixPairsPopover.tsx`, `matrixTrace.ts`/`MatrixTraceBody.tsx`, existing plot action/menu API in `PlotChartPanel.tsx`.
- Draft/placement: `ChartDraftContext.tsx`, `AddChartDialog.tsx`, `ChartPlacementLayer.tsx`, `hooks/useCreateCharts.ts`, `ChartGridLayout.tsx` for layout/focus integration only where needed.
- State/undo: `DataLayerProvider.tsx`, provider tests, `apps/demo/src/savedViewsHistory.ts` and its current tests. Extract **new** `pairScatterDraft.ts` for pure orientation/scope construction rather than embedding it in pointer handlers.
- Counterfactual membership: `hooks/CrossfilterWrapper.ts` adds the read-only peer-ID query; `lib/chartPopulation.ts` supplies the existing final-local-filter restriction. Add a provider query facade only if the draft integration needs one.
- Original Scatter: current selection and trace paths; the new comparison trace from M3; generic `ChartTracePanel.tsx` dispatcher.
- Facets: inspect the actual current facet/predicate helpers referenced by chart rendering before extracting an adapter. This is one narrow implementation read, not an assumed unbuilt feature.

### Exact proof cases

- **F10:** source F03 matrix has `n=8,ρ=1/21`; select A rows. Default draft/accepted Scatter has `n=3,ρ=1`; matrix remains `n=8,ρ=1/21` until another peer changes scope. Secondary draft still previews n=3 and labels projected n=8; acceptance clears only the matrix and yields destination n=8,ρ=1/21.
- Undo secondary acceptance restores the exact three-row source selection and original layout and removes the added chart in one entry. Redo restores the accepted state once. Cancelling either action changes no saved state.
- With a peer/workspace filter retaining A, clearing the matrix does **not** make n=8; projected/final n remain3. In chart-local mode, a matrix A selection alone leaves destination n8, and no redundant clear option appears.
- **F12:** date pair opens original chronological positions, empty outgoing filters, exact raw date values, and typed date-range selection; no rank column is created.
- Facet example: A facet opens only its semantic A population through destination local filters. Default outgoing filters remain empty; changing that local filter affects only destination source scope. Missing facet values follow the existing missing predicate, not a literal string `"null"` guess.
- While draft is open, edit the pair, change a peer filter, or replace source rows. Counts/accepted settings reflect the final state. Remove the source chart: default continuation can use remaining valid prepared settings, but the source-clear action is disabled or removed; no unrelated chart is cleared.
- New Scatter brush selects original IDs, leaves its own comparison unchanged, and changes the matrix as a peer. Return does not reset the brush. Existing Alt-click trace and ordinary filtering remain intact.

### Docs, example, risk, acceptance

Add **Continue from a pair to records** to `rank-discovery.mdx`, including the explicit n=8→n=3 default case and the n=8 clear-on-accept case. Register **`rank-linked-inspection`** with F03, a colored matrix, a peer filter chart, original Rows access, and a date view. Its scripted live example opens a draft, cancels, then accepts and traces a real row. Cover a faceted view and local-selection host mode in targeted tests rather than adding many controls to the example.

**Risk:** preview or destination can silently use a different cohort, and callback batching can be mistaken for transactional state. Acceptance must assert actual final membership/IDs, filter owners, callbacks, undo count, and no speculative saved mutation.

**Accept M4 when:** F10 and facet/date/local-selection/read-only tests pass; cancellation and one-step undo are proven; source/destination counts are always named; a touch/keyboard user can open, accept/cancel, trace, and return at 390 px without losing the primary action or focus. Use the baseline’s narrow view-only layout behavior; do not add mobile drag-layout authoring as a prerequisite.

## 7. Milestone M5 — Exact large-data execution

**Outcome:** ten-field rank discovery remains exact while repeated filters, brushes, and resized charts avoid unnecessary sorting; long computations do not publish stale populations. **RD-10, RD-17, RD-18.**

### Files, calculation, and API boundary

- Extend `lib/pairCorrelation.ts` with an optimized path, or add **new** `lib/pairCorrelationIndex.ts` for immutable parsed-column/sorted-index state. Cache sorted row indices, never final whole-column ranks used after subsetting.
- For each pair, form exact pair membership. Walk each field’s sorted order and assign new ranks among surviving ties. Partition group-ordered sequences in one filtered pass per pair so total per-group walking is proportional to represented membership, not `groups × N` rescans.
- Retain the simple M1 path as a small-data reference/oracle in tests. Cross-check optimized pooled and group results, rank assignments, counts, statuses, and IDs against it on deterministic fixtures and seeded datasets.
- Add **new** a chart-local job hook/worker boundary, e.g. `ScatterMatrix/usePairCorrelations.ts` and `lib/pairCorrelation.worker.ts`, only as needed by measured workload. Use structured typed-array payloads and revision IDs. A worker is client-local; no service/backend is introduced.
- Cancel or supersede old work on data/type/live/facet/local-filter/group membership changes. `Array.sort` on the main thread is not made interruptible by checking a revision before/after it. Use actual worker termination/messages or yielding chunks with bounded work.
- Keep own selection and resize on the drawing path. Exact caches require source/type/value revision and exact membership/group identity; count-only or unverified hash keys are insufficient.
- Draw pending state honestly. Never combine old coefficients with new n or sort mixed revisions. A complete unchanged result can remain visible only with its old scope/revision clearly marked.
- Extend `ScatterMatrix/matrixPlan.bench.ts` with actual Pearson/Spearman/Both cases, group/missing/tie distributions, initial calculation, repeated filter changes, same-count different membership, pure brush, and resize.

No new public settings are needed. Do not expose an approximation toggle or a performance control room. Any job threshold is an internal measured scheduling choice; all final coefficients are exact under the same contract.

### Complexity and measurement contract

For k≤10 fields, naive pooled sorting is `O(k²N log N)`; exact sorted-index reuse is `O(kN log N + k²N)`. There are at most 45 unique pairs per facet. Multiple facets retain separate statistics; do not use 45 as a bound on their combined result count. The following estimates and initial timing budget describe one analysis population. Approximate comparison-scale work for 90 sorts is 149 million at 100k rows and 1.79 billion at 1m rows; these are not timing measurements.

Record machine/CPU, browser/runtime, commit, mode, warm/cold state, row/field/group/facet counts, missing/tie pattern, median and p95 elapsed time over a stated repeat count, main-thread longest task, and peak added memory. Suggested acceptance budget for the named target machine: own-brush feedback p95≤50 ms with zero new rank jobs; 10-field/100k complete-data recalculation p95≤1 s after warm parsing; main-thread tasks≤50 ms during worker computation. These are proposed product budgets, not measured claims or test timeouts. If a target is missed, report the measured envelope and optimize or adjust it explicitly; do not hide failure with sampling. One-million-row stress proves completion/cancellation/memory behavior without a fabricated universal latency promise.

Working-array estimate for ten fields: parsed Float64 values 80N bytes, Uint32 indices 40N, two reusable rank buffers 16N; 13.6 MB at 100k and 136 MB at 1m before source objects, masks, existing plot arrays, worker copies, and overhead. Measure actual peak use and release obsolete buffers. Do not allocate both ranks for all 45 pairs permanently.

### Exact proof, docs, example, risk, acceptance

- **F01–F09:** optimized results/ranks equal the reference; tolerance applies only to floating coefficients, not rows/ties/counts/order.
- **F08:** a filter from IDs `[0,1,2]` to `[3,4,5]` forces new results despite identical n, changing rho from 1 to −1.
- Own selection, resize, palette-only edits, and title changes trigger zero rank jobs; represented group membership/type changes do trigger jobs.
- Rapid revisions A→B→C may complete out of order; only C publishes. Superseded workers release buffers. Unmount/cancel leaves no pending publication.
- Pair-specific missingness and Other-group reranking still match exact membership; global rank values are never reused after intersection.

Add **Performance and exactness** to the discovery docs. Register **`rank-scale-check`**, a deterministic local seeded-data example with a modest default row count and an explicit large-run option for manual profiling. Its generator uses no external fetch and reports the chosen row count. Add steps showing that brushing keeps coefficients fixed while peer filters update them. Benchmark fixtures are separate from the small teaching examples.

**Risk:** a fast cache can silently reuse the wrong population, or copying worker buffers can erase its memory/latency benefit. Accept M5 only with exact reference equivalence, invalidation/cancellation proof, documented measurements, accessible pending states, bounded evidence paging, and save/export behavior unchanged. The browser export must wait for the current result or explicitly include its pending state, never capture an unlabeled stale value.

## 8. Deterministic fixture catalogue

**Assertion rules:** row membership, pair IDs, ranks, counts, statuses, filter objects, and save-setting presence are exact. For the well-scaled coefficient fixtures below, compare each available coefficient to its exact expression with absolute error `≤1e−12` and no relative tolerance. This exceeds the expected roundoff for these small fixtures while remaining far below differences that affect their purpose. Display rounding to two decimals is not a numerical assertion. Large/adversarial floating cases have their own stated mathematical target/status; do not claim a universal accuracy guarantee.

Rows use fixture IDs to make membership visible. They do not establish a new durable row-identity system. Pair IDs below are the literal JSON strings, not array-valued saved settings.

### F01 — Average ties

| ID | x | y | rank x | rank y |
| --- | ---: | ---: | ---: | ---: |
| 0 | 1 | 10 | 1.5 | 1 |
| 1 | 1 | 20 | 1.5 | 2.5 |
| 2 | 2 | 20 | 3 | 2.5 |
| 3 | 3 | 30 | 4 | 4 |

- Pair ID: `["x","y"]`; `E=4`, counts `(pairs,xOnly,yOnly,both)=(4,0,0,0)`.
- Rank centered sums `(Sxy,Sxx,Syy)=(15/4,9/2,9/2)`, so **ρ=5/6≈0.8333333333333333**.
- Raw centered sums `(20,11/4,200)`, so **r=4/√22≈0.8528028654224417**.
- Kendall tau-b, only as a counterproposal comparator: C=4, D=0, ties exclusive to X=1 and Y=1, so **τ_b=4/5**. No Kendall UI is required.
- Swapping axes keeps the pair ID and coefficients; rank/evidence columns swap. Ordinary rank evidence is source values plus derived ranks, not replaced data.

### F02 — Pair-specific missingness and invalid infinity

| ID | x | y | z |
| --- | ---: | ---: | ---: |
| 0 | 1 | 1 | 1 |
| 1 | 2 | null | 2 |
| 2 | 3 | null | 3 |
| 3 | 4 | 2 | null |
| 4 | 5 | 3 | null |
| 5 | null | 4 | 4 |
| 6 | null | null | null |
| 7 | +Infinity | 5 | 5 |

| Pair ID | Valid IDs | Paired rank vectors | E/n and disjoint counts | Expected r / ρ |
| --- | --- | --- | --- | --- |
| `["x","y"]` | `[0,3,4]` | `[1,2,3]` / `[1,2,3]` | E8,n3; `(3,2,2,1)` | `√(12/13)` / `1` |
| `["x","z"]` | `[0,1,2]` | `[1,2,3]` / `[1,2,3]` | E8,n3; `(3,2,2,1)` | `1` / `1` |
| `["y","z"]` | `[0,5,7]` | `[1,2,3]` / `[1,2,3]` | E8,n3; `(3,2,2,1)` | `1` / `1` |

For X/Y, rank finite X globally first: `[1,2,3,4,5]`. Subsetting those ranks to paired IDs leaves `[1,4,5]`, against Y ranks `[1,2,3]`. Their Pearson value is `√(12/13)≈0.9607689228305228`, **the wrong Spearman**. Recomputed paired ranks give 1. Infinity in X disqualifies row7 only for pairs involving X; it must not remove row7 from Y/Z or from the live denominator.

### F03 — Unequal groups, pooled calculation, and Other

| ID | group | x | y |
| --- | --- | ---: | ---: |
| 0 | A | 1 | 1 |
| 1 | A | 4 | 2 |
| 2 | A | 5 | 3 |
| 3 | B | 2 | 50 |
| 4 | B | 3 | 40 |
| 5 | B | 6 | 30 |
| 6 | B | 7 | 20 |
| 7 | B | 8 | 10 |

| Population | Rank X / rank Y in row order | Counts | Pearson r | Spearman ρ |
| --- | --- | --- | --- | --- |
| Pooled | `[1,4,5,2,3,6,7,8]` / `[1,2,3,8,7,6,5,4]` | E=n8; no exclusions | `−58/√(42·2472)≈−0.18000273965826585` | `1/21≈0.047619047619047616` |
| A | `[1,2,3]` / `[1,2,3]` | E_A=n_A3 | `√(12/13)` | `1` |
| B | `[1,2,3,4,5]` / `[5,4,3,2,1]` | E_B=n_B5 | `−160/√((134/5)·1000)≈−0.9773555548504419` | `−1` |

An unweighted mean of group rho is 0; a row-count-weighted mean is −1/4. Neither is pooled 1/21. Subsetting pooled ranks to A incorrectly gives `√(12/13)` as rho. A represented Other union of A∪B must produce the pooled result. Test that union in the group-planning adapter directly, and separately test actual category folding with enough source groups to trigger it; do not assume two groups naturally fold into Other at the baseline’s cap.

Missing color values can be represented separately. For an added test group of three otherwise valid rows with missing color and X/Y both `[1,2,3]`, that group has E=n3 and r=rho1; missing color is not an X/Y exclusion.

### F04 — Monotonic nonlinear and nonmonotonic pairs

| Case | Original coordinates | Ranks | Exact expected result |
| --- | --- | --- | --- |
| Increasing cubic | X `[0,1,2,3,4]`; Y `[0,1,8,27,64]` | Both `[1,2,3,4,5]` | n5, ρ1, r=`77/85≈0.9058823529411765` |
| Increasing exponential | X `[1,2,3,4,5]`; Y `[1,10,100,1000,10000]` | Both `[1,2,3,4,5]` | n5, ρ1, r=`20988/√763192368≈0.7597208512063609`; gap≈0.2402791487936391 |
| U-shape | X `[-2,-1,0,1,2]`; Y `[4,1,0,1,4]` | X `[1,2,3,4,5]`; Y `[4.5,2.5,1,2.5,4.5]` | n5, ρ0, r0, while Y=X² exactly |

Each is a separate fixture/view with pair ID `["x","y"]`, E=n, and no exclusions. Do not concatenate the three relationships and assert any of the individual values for their union.

### F05 — Constants and small samples

| X / Y | Ranks | Discovery result | Existing paired numeric statistics |
| --- | --- | --- | --- |
| `[1,1,1]` / `[1,2,3]` | `[2,2,2]` / `[1,2,3]` | n3, both unavailable `constant-x` | Existing numeric behavior unchanged |
| `[1,2,3]` / `[1,1,1]` | `[1,2,3]` / `[2,2,2]` | n3, `constant-y` | Same |
| `[1,1,1]` / `[2,2,2]` | Both `[2,2,2]` | n3, `constant-both` | Same |
| `[1,2]` / `[10,20]` | Both `[1,2]` | n2, `insufficient-pairs` even though mathematical r=ρ1 | r1, means1.5/15, covariance `[[1/2,5],[5,50]]` |
| `[1]` / `[10]` | Both `[1]` | n1, `insufficient-pairs` first | Means available; correlation unavailable |
| `[]` / `[]` | Both empty | n0, `insufficient-pairs` | Existing empty behavior unchanged |

Test n=3 with perfect ranks still displays n and no “significant” or “reliable” badge. Minimum count is a display convention, not an inferential guarantee.

### F06 — Signed zero, parser eligibility, and equivalent date instants

**Signed zero:** X `[-0,+0,1,2]`, Y `[1,2,2,3]`. Ranks match F01; E=n4; ρ5/6 and r4/√22. Do not tie-break the zeros by sign bit, original text, or source order.

**Numeric parsing fixture, with both fields explicitly numeric through existing field metadata:**

| ID | Raw x | Raw y | Expected membership bucket |
| --- | --- | --- | --- |
| 0 | `0` | `0` | pair |
| 1 | `"1"` | `"10"` | pair |
| 2 | `2` | `20` | pair |
| 3 | `NaN` | `30` | X only ineligible |
| 4 | `+Infinity` | `40` | X only ineligible |
| 5 | `−Infinity` | `50` | X only ineligible |
| 6 | `null` | `60` | X only ineligible |
| 7 | `""` | `70` | X only ineligible |
| 8 | `" "` | `80` | X only ineligible |
| 9 | `true` | `90` | X only ineligible |
| 10 | `3` | `"bad"` | Y only ineligible |
| 11 | `undefined` | `null` | both ineligible |

Valid IDs `[0,1,2]`, parsed X `[0,1,2]`, Y `[0,10,20]`, both ranks `[1,2,3]`; E12, counts `(3,7,1,1)`, r=ρ1. Trace may distinguish missing/blank/invalid/nonfinite reasons without changing the four buckets. The executed Python reference checked the parsed vectors; TypeScript parsing and raw export are proposed integration tests.

**Date instants:**

| ID | Raw date | Parsed UTC milliseconds | y | Date rank / y rank |
| --- | --- | ---: | ---: | --- |
| 0 | `2026-01-01T00:00:00Z` | 1767225600000 | 10 | 1.5 / 1 |
| 1 | `2025-12-31T19:00:00-05:00` | 1767225600000 | 20 | 1.5 / 2.5 |
| 2 | `2026-01-02T00:00:00Z` | 1767312000000 | 20 | 3 / 2.5 |
| 3 | `2026-01-03T00:00:00Z` | 1767398400000 | 30 | 4 / 4 |

E=n=4, r=4/√22, ρ=5/6. Matrix and explicit time Scatter agree when they share these four rows. Raw strings remain in row trace; the helper compares instants.

### F07 — Transform and permutation invariants

Start from F01, preserving row identity and pair membership.

| Change | Expected ρ | Expected r / identity |
| --- | --- | --- |
| X→3X+2, values `[5,5,8,11]` | 5/6 | 4/√22 |
| X→X³, values `[1,1,8,27]` | 5/6 | `260/√((1811/4)·200)≈0.8640305943823479` |
| Y→−Y | −5/6 | −4/√22 |
| Both coordinates negated | 5/6 | 4/√22 |
| Joint row order `[3,0,1,2]` | 5/6 | 4/√22; row 0 rank X remains 1.5 and row 3 remains 4 |
| Swap oriented X/Y | 5/6 | 4/√22; canonical pair ID unchanged, directional evidence swapped |

The invariant applies only when finite membership and ties are preserved. For an exact negative control, replace F01 X with `Math.round(x / 2)`: values `[1,1,1,2]`, ranks `[2,2,2,4]`, and unchanged Y ranks `[1,2.5,2.5,4]`. Both r and rho become `√(2/3)≈0.816496580927726`, so the created tie changes rho. Joint row permutation is not a permutation of one coordinate alone.

### F08 — Filters, domain stability, and exact cache membership

Use F03 with an additional independent field `cohort` assigning each row to a filterable cohort. Its values implement the memberships below; the field is not plotted as X or Y.

| Operation | Matrix pair population | Expected result |
| --- | --- | --- |
| No filter | IDs0…7 | E=n8; ρ=1/21, r−58/√(42·2472) |
| Matrix selects ID0 only | IDs0…7; selectedPairs1 | Same n/r/ρ; selection layer changes only |
| Matrix selects A, IDs0,1,2 | IDs0…7; selectedPairs3 | Same pooled n/r/ρ; A group n remains3 |
| Peer filter on unrelated `cohort` retains `[0,1,2]` | IDs0,1,2 | E=n3; ρ1, r√(12/13) |
| Same-size peer filter retains `[3,4,5]` | IDs3,4,5 | E=n3; ρ−1, r−√(12/13) |
| A different peer predicate yields identical IDs | Same exact membership | Same coefficients; exact cache may reuse |
| Rows drawer search only | Chart population unchanged | Same coefficients; drawer scope is separate |

All source domains/categories remain based on S and therefore unchanged by the peer filters. Explicit changes to the chart’s own local filters may redefine S; do not incorrectly preserve a source domain across a real source-population edit. A cleared filter restores the original coefficients. Repeat with an initially empty eligible set and after source revision so stale results cannot survive.

### F09 — Pair IDs and deterministic order

Authored fields `['x','inc','dec','c']`; X/Inc `[1,2,3,4,5]`, Dec `[-1,-2,-3,-4,-5]`, C `[1,1,1,1,1]`. E=n5 for every pair, no exclusions.

| Field-order position | Oriented X → Y | Exact canonical pair ID | r / ρ or reason |
| --- | --- | --- | --- |
| 1 | x → inc | `["inc","x"]` | 1 / 1 |
| 2 | x → dec | `["dec","x"]` | −1 / −1 |
| 3 | x → c | `["c","x"]` | constant-y in this orientation |
| 4 | inc → dec | `["dec","inc"]` | −1 / −1 |
| 5 | inc → c | `["c","inc"]` | constant-y |
| 6 | dec → c | `["c","dec"]` | constant-y |

All three metric orderings produce the exact list:

```json
[
  "[\"dec\",\"inc\"]",
  "[\"dec\",\"x\"]",
  "[\"inc\",\"x\"]",
  "[\"c\",\"dec\"]",
  "[\"c\",\"inc\"]",
  "[\"c\",\"x\"]"
]
```

The available pairs tie at magnitude 1 and gap 0; unavailable pairs sort after them, also canonically. Field order keeps constants in positions 3/5/6. Both triangles resolve to the same six IDs. The constant field comes first in its canonical encoding but must not incorrectly become constant X in the authored readout. Test keys with punctuation/quotes as an encoding case; JSON remains unambiguous, unlike joining names with a delimiter.

### F10 — Handoff populations and reversibility

Use F03, initially with no peer/workspace filter and the matrix selecting A through a typed category/row selection supported by the current chart.

| Surface/action | Actual or projected paired IDs | n / ρ |
| --- | --- | --- |
| Source matrix coefficient | `[0,1,2,3,4,5,6,7]` | 8 / 1/21 |
| Default draft preview | `[0,1,2]` | 3 / 1 |
| Default accepted Scatter | `[0,1,2]` | 3 / 1 |
| Secondary draft preview, before clear | `[0,1,2]` | 3 / 1 |
| Secondary projected destination after clear | `[0,1,2,3,4,5,6,7]` | 8 / 1/21 |
| Secondary accepted Scatter | `[0,1,2,3,4,5,6,7]` | 8 / 1/21 |
| Undo secondary acceptance | No added Scatter; source selection A restored | Matrix 8 / 1/21 |

Add a workspace/peer filter retaining only A: both actual and projected destination stay n=3, ρ=1. Add a source local filter for A: default copied destination local population is A even after outgoing selection clears. Remove that copied local restriction in the editable draft: the counterfactual must be recomputed from peer-only membership before source local restriction; it can return n=8 when no other filter remains. This case rules out reusing the source’s already local-filtered live list.

For source A facet, the prepared chart contains the semantic A predicate in local filters and has no destination faceting; n=3, ρ=1. Keep other charts’ outgoing filters byte-for-byte unchanged. Verify no rank columns or saved source-chart reference appears. Test Cancel and placement Back; neither mutates saved filters/layout. Count callbacks and undo entries, not merely final pixels.

### F11 — Save, Dashboard text, host echo, undo, and export

Use an F01 matrix with `correlation: "spearman"`, then M2’s `"both"`/`pairOrder: "difference"`; use an F06 original Scatter with `compareRanks: true` and explicit time X axis. Retain source row keys in the underlying records so restoration can be inspected.

| Boundary | Exact expected result |
| --- | --- |
| Old native save lacking all three new keys | Loads Pearson/field order/no comparison; a no-op save keeps those keys absent. No mount-generated `onStateChange`. Ignore only existing metadata changes where the baseline does. |
| Explicit defaults | Explicit `"pearson"`, `"fields"`, or `false` survive their normal round trip. No newly owned undefined property is introduced. |
| Invalid new values | Saved `correlation:"ranked"`, `pairOrder:"pvalue"`, or `compareRanks:"yes"` fails saved validation. Equivalent invalid Dashboard text warns and keeps its previous valid value. |
| Native save/reopen | Method/order/time/comparison and filter ownership preserved. F01 matrix ID `["x","y"]`; date Scatter ID `["date","y"]` when its X field is named `date`. Both tied-data cases recompute n=4, ρ=5/6, r=4/√22. No ranks/coefficient cache saved. |
| Dashboard text export→compile→export | Same meaning and settings after the existing ID/metadata normalization used by `export.test.ts`; pair IDs remain field-based. Do not require generated chart UUIDs to match text aliases. |
| Normal host echo | Echoing `saveToStructure()` does not rebuild data or reemit the same change. A genuinely changed method restores/updates normally without wiping selected logical rows. |
| Undo/redo | One method edit restores the previous method in one step; pair-list open/search/focus is absent from history. Clear-and-add restores both state changes together. |
| Reversed source row order | Selected logical source record survives under the baseline restoration contract; rank/coefficients survive joint permutation. Deleted/ambiguous duplicate records follow the existing conservative dropping behavior. |
| Raw analysis/project export | Original numeric/date values and source fields remain. F06 special values use the existing special-value encoding. Signed-zero bit preservation is unnecessary for equal ranks. |
| Image export | At-rest method names, r/ρ/n, unavailable reasons and scope survive; editor/popover/focus/return controls are omitted. Current/pending state is truthful. |

Example future Dashboard text forms, using existing syntax:

```text
chart scatter-matrix @rank fields=x,y correlation=both pairOrder=difference
scatter @raw x=date y=y compareRanks=true xAxis.scaleType=time
```

These are proposed post-M2/M3 examples, not baseline-supported input. M1 must reject Both until M2 ships it.

### F12 — Date geometry, brushes, and drawing exclusions

| ID | date | Timestamp | y | Date rank |
| --- | --- | ---: | ---: | ---: |
| 0 | `2026-01-01T00:00:00Z` | 1767225600000 | 1 | 1 |
| 1 | `2026-01-02T00:00:00Z` | 1767312000000 | 2 | 2 |
| 2 | `2026-01-10T00:00:00Z` | 1768003200000 | 3 | 3 |

Time-axis spacings between positions have ratio **1:8**. Compare ranks gives n=3, ρ=1; raw Pearson is **`9/√(292/3)≈0.912245460839306`**, calculated on elapsed times. A date-only filter object `{type:"date-range", field:"date", min:"2026-01-01", max:"2026-01-02"}` selects IDs `[0,1]` under the existing inclusive end-of-day rule. Its owning Scatter comparison remains n3 because own selection is excluded; a peer matrix sees only those two pairs and reports `insufficient-pairs`. The same filter as a workspace filter narrows both charts to n2.

Starting from the three-row date fixture, append ID3 with a finite numeric timestamp `9e15` in a field explicitly typed datetime and y=4: it remains statistically eligible under `timestampOf`’s finite-number contract, but has an unavailable calendar position. Counts are E=n=4 and `(4,0,0,0)`, with statistical IDs `[0,1,2,3]`, date-drawable IDs `[0,1,2]`, rho=1, and one date drawing exclusion; trace retains `9e15`.

Test the lossless date-bound support predicate separately: `0` milliseconds passes; `0.25` milliseconds remains statistically eligible but fails because the current date representation/parser rounds away the fraction. `253402300800000` (year 10000, ISO `+010000-01-01T00:00:00.000Z`) remains finite and calendar-valid but fails the existing four-digit-year parser. These unsupported positions are named drawing exclusions; their timestamps are neither snapped nor removed from pair statistics. ISO formatting here is from numeric timestamps, never a new parser for raw row text.

As a separate case starting again from the original three rows, append ID3 with date `"2026-02-30"` and y=4. Expect E=4, n=3, counts `(3,1,0,0)`, valid IDs `[0,1,2]`, rho=1, and r=`9/√(292/3)`. An invalid calendar string must not become a hidden ranked extreme or be confused with the eligible finite numeric timestamp above.

For numeric drawing exclusions, use X `[-1,1,2,3]`, Y `[-1,1,2,3]`, size `[1,1,null,1]`. All four are valid X/Y pairs with r=ρ=1. On log X with size enabled, ID0 is not drawable for log and ID2 is not drawable for size: n remains 4 while plottable IDs are `[1,3]`. Set the X maximum to 2.5: ID3 is additionally outside the viewport, leaving visible IDs `[1]`, while coefficient n remains 4. Exclusion categories may overlap in general; this fixture uses disjoint cases so it can reconcile exact drawn IDs without double counting.

### F13 — Numerical guard and finite extremes

| Case | Expected |
| --- | --- |
| Guard input `1 + 4*Number.EPSILON` | `ok`, value 1 |
| Guard input `−1 − 4*Number.EPSILON` | `ok`, value −1 |
| Guard input `1 + 32*Number.EPSILON` | `numerical-failure` |
| Guard input `1 − 4*Number.EPSILON` | Preserve exactly; do not snap inward values to 1 |
| Guard input NaN or either infinity | `numerical-failure` |
| Guard input −0 | Return +0 |
| X=`[1,2,3]·2^1000`, Y=`[3,2,1]` | Eligible n3; expected r=ρ−1 after stable rescaling; no square overflow |
| X=`[1,2,3]·2^−1000`, Y=`[1,2,3]` | Eligible n3; expected r=ρ1 after stable rescaling; no false constant from underflow |
| X=`[1,1+ε,1+2ε]`, Y=`[1,2,3]`, ε=`Number.EPSILON` | Three distinct parsed values/ranks; do not epsilon-tie them; ρ1 |

The endpoint guard is unit tested independently of the statistical input parser. Finite input eligibility does not mean every arithmetic procedure is adequate; numerical failure must remain distinguishable from ineligible rows and original constants.

For the large- and small-magnitude rescaling cases, require an `ok` result and absolute coefficient error ≤1e−12 against the stated ±1. Ranks, eligibility, statuses, and endpoint-guard results remain exact assertions.

## 9. Verification run sheet for the implementation

**These commands and UI steps are proposed, not executed in this Design mission.** Run them in a complete checkout after the corresponding files exist. Follow `AGENTS.md` and `docs/agent-guide.md`; tests use shared `@repo/test-config` time limits. Do not install a separate test stack or run a build from several worktrees simultaneously.

### Focused library and demo checks

Use the current scripts verified in the packet:

```bash
pnpm --filter exploreda exec vitest run src/lib/pairCorrelation.test.ts
pnpm --filter exploreda exec vitest run src/components/charts/ScatterMatrix
pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot
pnpm --filter exploreda exec vitest run src/lib/dsl/export.test.ts
pnpm --filter exploreda exec vitest run src/test/providers/savedSelectionRestore.test.tsx
pnpm --filter exploreda check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check
```

Add targeted provider echo/history/draft tests in the repository’s actual existing test folders after reading their examples. Reuse `registerAllCharts`, ResizeObserver setup, and pointer-event test setup as directed by the agent guide. Do not invent a command name for an uninspected test file. If demo typechecking needs the updated package types, build the library once first, as the guide requires.

Before a feature PR is handed off:

```bash
pnpm check:ui
pnpm --filter demo build
pnpm --filter demo docs:verify
pnpm check
```

`pnpm check` already runs UI checks plus recursive builds/type checks/tests; avoid repeating broad gates unnecessarily. Run only once at the final relevant stage, after targeted fixes. Run the existing lint command if the affected code warrants it; the guide notes it is separate from `pnpm check`.

### Real interaction, screenshots, and export

Start the source-running demo with `pnpm dev:agent`; use its printed URL. For each user-visible milestone, use real pointer, keyboard, and touch-equivalent actions at **1280, 783, and 390 CSS pixels**. The guide’s `pnpm shot` captures those widths by default; for example after M2 registers the route:

```bash
pnpm shot /examples/rank-pair-discovery --name rank-pairs
pnpm export-proof
```

Add the rank examples to export-proof’s cases or use its existing supported case selection after inspecting the runner. Save screenshots under `tmp/`, attach them to the eventual feature PR as the guide prescribes, and do not commit generated screenshots. Stop the owned dev server with `pnpm dev:agent --stop` afterward.

The UI acceptance sweep includes long field names, many categories/Other, null values, unavailable coefficients, active peer/local/own filters, empty results, a surviving focused pair after reordering, read-only mode, dark/light themes, tooltip/focus behavior, viewport-bounded popovers, background scroll locking in details, nested Escape, and header actions not covering titles. Record actual browser evidence rather than inferring interaction correctness from screenshots alone.

### Persistence and performance evidence

Exercise all F11 paths through actual public entrypoints: native save/reopen, exported Dashboard text, project savedData echo, undo/redo, reversed data, raw analysis export, and downloaded image. A unit serializer snapshot alone is insufficient for the one-operation handoff.

For M5, use the existing benchmark tooling after reading its package command, and include the measurements defined in §7. Distinguish benchmark algorithm time from chart paint and interaction latency. No timing thresholds are asserted to pass by this plan.

### Documentation and release discipline

Each feature PR updates the focused MDX section, `live/examples.ts`, demo registration/coverage, new setting descriptions, and docs catalogue targets. `docs:check`, example text round trips, and `docs:verify` establish that the example is runnable and linked. Library user-visible changes require the normal changeset under `AGENTS.md`; documentation-only planning PRs do not. The next Codex task can author local dispositions and a small docs PR without implementing these five milestones at once.

## 10. Primary sources and rejected expansion

The statistical contract follows [R `cor`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html) for pair-specific reranking and pairwise-complete limitations, [SciPy `rankdata`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html) for average ties, and the descriptive definitions in [SciPy `spearmanr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html) and [JMP’s nonparametric details](https://www.jmp.com/support/help/en/19.2/jmp/statistical-details-for-nonparametric-measures-of-association.shtml). [SciPy `kendalltau`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kendalltau.html) supports the tau-b counterproposal and efficient exact calculation; method scope, not an assumed quadratic lower bound, is why it is deferred.

The workflow comparison uses [Orange Correlations](https://orangedatamining.com/widget-catalog/unsupervised/correlations/), [GGally `ggpairs`](https://ggobi.github.io/ggally/reference/ggpairs.html) and [`ggally_cor`](https://ggobi.github.io/ggally/reference/ggally_cor.html), [JMP Multivariate options](https://www.jmp.com/support/help/en/19.2/jmp/multivariate-platform-options.shtml), [seaborn PairGrid](https://seaborn.pydata.org/generated/seaborn.PairGrid.html), and [jamovi `corrMatrix`](https://docs.jamovi.org/jmv/jmv_corrMatrix.html). Their documented capabilities motivate explicit coefficients, raw panels, counts, and pair continuation; they do not establish undocumented matching filter/missing-value policies.

Prepared ranks are a legitimate fixed-cohort teaching alternative but cannot generally provide one correct rank column per field for every pair/group/filter. Automatic matrix clustering remains separate because it changes spatial reference and needs additional distance/undefined-pair rules. [Graph-Theoretic Scagnostics](https://www.tableau.com/sites/default/files/2023-01/Wilkinson_Infovis-05.pdf) includes rank monotonicity among broader shape measures; broader discovery is deferred. [Same Stats, Different Graphs](https://www.research.autodesk.com/publications/same-stats-different-graphs/) supports inspecting plots even when numeric summaries agree; it does not claim equal Spearman in those datasets. [De Winter et al.](https://research.tudelft.nl/en/publications/comparing-the-pearson-and-spearman-correlation-coefficients-acros/) motivates comparing distribution-dependent behavior, not choosing Spearman as universally superior.

Do not add p-values, stars, causal ordering, a universal categorical/numeric association score, automatic coercion, new backend/services, parser rewrites, framework migration, or prerequisites from unbuilt research plans. A difference score is a browsing heuristic and zero rho is not proof of no relationship.

## 11. Completion record and open choices

**Access status:** the source packet was available, complete for its named files, and read at the requested commit. The named pinned supplements resolved otherwise missing creation/date behavior. There was no implementation checkout, application run, repository modification, commit, or push.

**Files read:** all 44 packet files: seven root/guidance files; three intent briefs; nine library data/state/trace/selection files; four DSL files; eleven Scatter Matrix files; six ScatterPlot files; and four demo/docs/history files. Exact paths are in the companion report’s §12. The supplied packet includes every minimum reading-route file in the mission. Fifteen supplemental paths are listed under C13/C14/C15 in that report; implementation-only files named above are not silently counted as source already reviewed.

**Checks versus proposals:** the research run executed 24 independent Python reference fixtures using exact rational ranks/centered sums and SciPy 1.17.0 coefficient comparison, with absolute tolerance 1e−12. It also checked canonical pair ordering independently in JavaScript and the additional date-spacing/rounding/endpoint fixture arithmetic. All new TypeScript tests, browser flows, savedData/DSL/undo proofs, screenshots, export proofs, timing budgets, and runnable example routes in this plan remain proposed implementation acceptance work. The TypeScript parser was read, not executed.

**Deliverables:** [rank-discovery-report.md](rank-discovery-report.md) gives the decision, evidence, and RD-01–RD-18 dispositions; [rank-discovery-implementation-plan.md](rank-discovery-implementation-plan.md) is this complete staged plan.

**Open implementation choices:** measured worker threshold and target-machine budgets; reuse point for typed semantic facet predicates; final tiny-cell typography; UTC tick interval selection; and removal versus temporary retention of internal Pearson aliases after checking the full package export surface. Defaults and proof conditions are already given. These are implementation decisions, not a request for external demand validation, and they do not block M1.
