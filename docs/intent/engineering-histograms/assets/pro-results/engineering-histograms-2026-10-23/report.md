Build engineering histograms inside explorEDA’s existing Bar chart: retain automatic bins, add authored width/origin and short explicit edge lists, keep specification limits independent of those bins, and show observed compliance with exact contributing records. Add shared-edge numeric group comparisons and a focused “Outside specifications” selection that survives save, text export, and source refresh as a numeric predicate. This gives engineers repeatable measurement intervals, honest group denominators, and a direct route from a result to its records without requiring distribution fitting or a process-control platform.

# Engineering histograms and specification limits

- **Mode:** Design; implementation belongs to the follow-on workers.
- **Baseline:** [`6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e`](https://github.com/byronwall/explorEDA/tree/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e), identified as `origin/main` by the supplied mission.
- **Research date:** 23 October 2026.
- **Evidence labels:** “Verified” describes the supplied source or cited primary documentation. “Recommendation” and the contracts below describe proposed behavior. Fixture results are independently checked arithmetic, not repository test results.
- **Companion:** [implementation-plan.md](implementation-plan.md), a four-milestone worker handoff.

## 1. Decisions and complete first-version scope

### Stable recommendations

| ID / disposition | Decision | Reason |
| --- | --- | --- |
| **EH-01 · Build** | Automatic, width/origin, and short complete-edge histogram modes, with finite saved authored coverage. | Reproducible engineering intervals need explicit boundaries and visible coverage tails. |
| **EH-02 · Build** | Separate inclusive specification limits, observed below/within/above counts, shares, and exclusions. | Acceptance belongs to individual finite measurements, including measurements outside plotted coverage. |
| **EH-03 · Build** | One focused specification-status filter; frozen numeric limits with live row membership. | Both tails require a union inside one predicate while the existing filter list remains an intersection. |
| **EH-04 · Build** | One computed histogram result for marks, summaries, selections, traces, and exact Records. | A displayed count and the records opened from it must have identical scope and membership. |
| **EH-05 · Build** | One numeric grouping field, shared edges/scales, small multiples, and a complete group compliance table. | Groups of unequal size need visible denominators and comparable geometry. |
| **EH-06 · Build** | Count/Percent/Density for equal widths; Density geometry for unequal widths, with counts retained. | Irregular-width bar area must express mass truthfully. |
| **EH-07 · Build** | Live settings, one-edit undo, lossless JSON/text, explicit refresh/selection rules, and feature-matched docs/examples. | The authored analysis must remain understandable after editing or reloading. |
| **EH-08 · Explore** | Exact status segments within bins and richer multi-group comparison layouts after V1. | They may help mixed-bin inspection, but compete with group hue and compact interaction. |
| **EH-09 · Defer** | Capability indices, fitted defect rates, control charts, weights, per-group specs, unit conversion, and population-baseline work. | Each needs additional statistical or state decisions; observed compliance is independently useful. |
| **EH-10 · Avoid** | Epsilon membership, silent widening/deduplication, whole-bin failure coloring, intersected tail ranges, and saved row-ID selections. | These change meanings or make exact counts and refresh behavior unreliable. |
| **EH-11 · Avoid** | A general Boolean filter language, new chart framework, migration/version coexistence, or a renewed outside-demand gate. | The mission supplies demand and the existing React architecture can host the feature. |

### Choose an engineering histogram with empirical compliance

| Viable design | What it delivers | Decision |
| --- | --- | --- |
| Authored bins plus ordinary reference lines | Repeatable intervals and visible limits, using much of the present renderer. | Useful first milestone; insufficient final scope because mixed bins, compliance counts, and both-tail records remain unanswered. |
| **Engineering histogram plus observed compliance** | Independent boundaries/limits, exact records, semantic selections, grouped counts, and shared geometry. | **Recommended complete V1.** Four shippable increments fit the existing chart, filter, trace, and saved-state architecture. |
| Full process-capability workspace | Fitted distributions, sigma estimation, subgroup methods, capability indices, and predicted failures. | Defer. A sample histogram does not establish stability or the assumptions required for those claims. [E12] [E13] |

The complete V1 includes the short irregular-edge editor; it is not an indefinite research follow-up. The independently useful first milestone is authored regular coverage with exact bin and coverage-tail records. Specifications, group comparison, and unequal intervals then complete the same product rather than introduce a second chart family.

## 2. What the baseline already provides

The following are verified at the stated commit, not inferred from the older engineering audit.

| Verified implementation | Implication for this feature |
| --- | --- |
| `BarChart/bins.ts: numericBins` uses full-source extents, count-based automatic bins, a 2–100 automatic count clamp, and integer-centered bins. The settings slider currently exposes 2–50. `binIndex` uses stored edges; the final bin is closed. | Preserve the automatic algorithm and integer behavior. New authored modes have their own explicit limits; do not replace Auto with an engineering preset. [R-bins] [R-settings] |
| `binRangeFilter` uses `maxExclusive` at interior edges. `bins.test.ts` and `BarChart.select.test.tsx` cover agreement between bin membership and selected rows. | This endpoint repair already exists. Preserve it and extend only the new cases; do not rebuild the prior audit. [R-bins] [R-bin-tests] [R-select-tests] |
| `barPlan.ts: binRows` retains exact source contributors. Numeric detection can fall back to categorical bars when a present value cannot be parsed. | Reuse contributor planning. An explicitly configured engineering histogram must remain numeric and report invalid measurements rather than silently change chart kind. [R-plan] |
| `BarChart.tsx` routes `seriesField` to a separate series renderer. `seriesBarPlan.ts` uses categorical bands and per-category series totals. | Existing series bars are not grouped numeric histograms. Add a distinct numeric grouping setting and route. [R-bar] [R-series] |
| The ordinary bar filter function uses the first matching measurement filter; the series route applies all filters. | The new numeric route must evaluate all its active field predicates, including the grouping predicate. Adding a type alone is insufficient. [R-definition] |
| `useGetLiveData.tsx`, `CrossfilterWrapper.ts`, and `chartPopulation.ts` distinguish other-chart filters, the chart’s own dimension, and independent local predicates. | Specify summary context separately from the chart’s measurement/group selection. Do not merge local population into linked selection state. [R-live] [R-crossfilter] [R-population] |
| `ecdfPlan.ts` has inclusive at-or-below and at-or-above helpers; `countInRange` is inclusive. | A strict above-spec tail cannot directly reuse inclusive `shareAt(U, "above")`. Add a documentation distinction, without expanding the weighted ECDF work. [R-ecdf] |
| Annotation types/context/resolution can draw fixed numeric lines and bands. | Guides are reusable presentation mechanisms; annotations currently do not compute specification compliance. [R-annotations] |
| `updateChart` is the shared settings write path and performs a shallow merge. `holdStateChanges` supports a single edit transaction. | Send a complete nested histogram object on each committed live update; coalesce typing into one undo step. [R-provider] |

`docs/research/DIRECTION.md` supersedes the earlier lack-of-named-demand gate. The prior engineering-bins README, decisions, and evidence remain useful background; their old endpoint defect and defer-for-demand conclusions do not determine this mission. Population baselines, PR514’s weighted ECDF work, and PR507’s notebook work remain outside this plan. [R-direction] [R-prior] [R-population-intent]

## 3. External comparison and what to borrow

These are primary-source documentation comparisons, not claims that the applications were executed. JMP references identify 19.2 and a January 2026 publication date. Minitab and Origin references are their current online help; no application-build-specific refresh behavior was verified. The Vega-Lite paper supplies a durable interaction model rather than current product behavior.

| Tool / source | Verified capability | Design consequence for explorEDA |
| --- | --- | --- |
| **JMP Histograms; Process Capability** | Precise bin-width input and dragging that changes width/origin; bar selection links to represented source rows. Specification properties can be displayed on histograms. Capability additionally introduces distribution and within-group sigma choices. [E01] [E02] | Put numerical authoring and exact records in one workflow. Save limits as semantic chart settings, while keeping V1’s statistics empirical. |
| **Minitab Binning; Graph Builder Histogram** | Interval counts or specified midpoint/cutpoint positions; the binning page describes equal spacing. Grouped graphs can share X/Y scales; percent height supports comparison of unequal sample sizes. [E03] [E04] | Make origin explicitly a boundary, expose shared scales, and show group sample sizes. These pages do not establish arbitrary unequal intervals in that UI. |
| **Minitab Observed Performance** | Below-LSL observations are strictly less than LSL; above-USL observations are strictly greater than USL; total observed nonconformance adds the two tails. [E05] | Equality passes. Compute tail counts from measurements, even when a bin straddles a limit. |
| **Origin Histograms; Frequency Counts** | Bin Size/Begin/End controls, binned output worksheets, grouped counts, shared histogram limits, and monotonic user-defined boundary datasets. Its explicit upper coverage tail includes values at or above the maximum. [E06] [E07] | Offer short complete edge lists and separate coverage-tail readouts. Do not infer exact source-row tracing from an aggregate worksheet. Keep explorEDA’s existing final-closed endpoint contract. |
| **D3 bin** | Bins retain input elements; lower bounds are inclusive, interior upper bounds exclusive, and the final upper bound inclusive. Out-of-domain values are omitted; a threshold array supplies internal cuts. [E08] | Preserve exact contributors and existing membership. An engineering wrapper must account for omitted tails and distinguish complete edges from D3 thresholds. |
| **NumPy histogram** | Complete increasing edges permit unequal widths; the last interval includes its right edge. Density describes area and is normalized over the represented range. [E09] | Use complete edges and density for irregular widths. Explicitly document explorEDA’s proposed all-valid denominator, which intentionally leaves uncovered tail mass outside finite bars. |
| **Vega-Lite binning and the authors’ paper** | `step` specifies spacing and `anchor` aligns a boundary. The selection model relates events and points of interest to an inclusion predicate. [E10] [E11] | Width/origin is a compact declarative input. A saved predicate can re-evaluate current rows after refresh without saving positional IDs. This is an architectural inference, not a claim about explorEDA’s present filter implementation. |

The sources disagree about the final endpoint: Origin’s cited frequency-count tail convention differs from D3/NumPy and explorEDA. There is no need to standardize on a vendor’s convention; retaining the tested explorEDA convention avoids a needless semantic change.

The recommendation for small multiples rather than many overlapping group distributions is a design judgment: common numerical geometry, readable denominators, and one clear hit target per group/bin fit the current product. The evidence does not establish a universal usability winner. Similarly, the proposed bin and panel caps below are bounded product defaults, not measured performance thresholds.

NIST distinguishes specification requirements from statistical control limits, and capability analysis adds assumptions about a stable process and its distribution. Label the feature **Specification compliance** or **Observed conformance**. Do not label its percentages capability, stability, predicted yield, or future failure probability. [E12] [E13]

## 4. Exact numerical and population contracts

### 4.1 Keep three concepts independent

- **Bins** divide a numeric measurement axis into intervals.
- **Specifications** classify finite measurements against acceptance limits.
- **Axis bounds** clip the current view. They do not change bins, classifications, or denominators.

A specification may cross the middle of a bin, lie outside authored coverage, or be equal to a bin edge. Each case has the same measurement-level classification. The existing `xAxis.limits` and `yAxis.limits` remain view controls; the deprecated `axis.min/max` placeholders acquire no meaning. [R-guide]

### 4.2 Population and denominator

Use these definitions consistently in the planner, readout, and record actions:

| Symbol | Proposed meaning |
| --- | --- |
| **S** | All source rows before chart-local or linked filters. Use finite measurements in S to initialize/Fit coverage, establish the source group domain, and compute reference axis heights. |
| **L** | Rows returned for this chart after workspace/peer selections, its independent `localFilters`, and the current generic facet, excluding its own linked-filter dimension. This follows the existing live-data machinery. |
| **C** | L after this chart’s own predicates on fields other than the measurement and its current histogram grouping field. These unrelated conditions remain effective. |
| **Vg / ng** | Finite measurements in C for group g, and their count. Include finite measurements below/above authored coverage. Ungrouped uses one pooled group. |
| **Q** | C intersected with the current measurement selection and optional group selection. Use Q for selected marks/counts, not the compliance denominator. |

This separation matters immediately: selecting Outside must not turn the chart’s displayed nonconformance into 100%. A peer selection legitimately changes C and therefore ng; the chart’s own status click changes Q while preserving the context summary. A local predicate remains part of L even if it uses the same field as the histogram. Existing host `localSelections` behavior continues to determine whether a chart selection propagates to peers. [R-live] [R-population] [R-provider]

Show the scope visibly: for example, “Group A · chart population · 7 valid of 9 records”; keep the selected count separate. Do not label an all-source reference Y scale as the current summary population.

### 4.3 Authored boundaries and coverage

**Auto** retains `numericBins`, its full-source extents, its count setting, and integer-centered behavior. A histogram settings object is explicit numeric intent even if Auto is selected; invalid measurements then appear as exclusions. Legacy bars without that object retain their present numeric/categorical inference.

**Width + origin** stores a positive finite width, a finite origin, and two safe integer grid indices. Origin is a grid boundary, not a bin center. If the saved indices are `firstIndex=a` and `lastIndex=b`, the complete edge array is `e(k)=origin+k×width` for k=a…b, and there are b−a bins. Require b>a and at most **512** intervals.

On activation, derive a suggested width/origin from the current automatic result, then calculate an enclosing grid against all-source finite measurements and persist its indices. Editing width or origin retains those indices, visibly recomputes the coverage boundaries, and applies the whole valid configuration atomically. Only a coverage edit or **Fit coverage** changes the indices. Coverage inputs show measurement units and accept only actual grid boundaries. Fit recomputes the enclosing interval from S in one undo step; it may expand or shrink. With no finite source measurements, a valid typed width/origin initializes indices 0…1 and displays “No valid measurements”; do not invent a data-driven extent.

**Edges** stores the complete finite edge array, including its first and last bounds. Accept 2–65 entries, hence at most **64** intervals. Empty bins stay present. Reject duplicates, descending values, or values that collapse to identical Numbers. Do not sort, deduplicate, or silently change the list. There is no automatic Fit action for explicit edges; editing the list is the explicit change.

For both authored modes, source refresh and filtering preserve the saved edges. Finite measurements outside them go into coverage readouts:

- Underflow: `x < firstEdge`.
- Interior bins: `[edge[i], edge[i+1])`.
- Final bin: `[edge[last-1], edge[last]]`.
- Overflow: `x > lastEdge`.

Coverage tails are selectable/traceable counts beside the chart, never artificial infinite-width bars. “Below coverage” and “Above coverage” must be distinct labels from “Below specification” and “Above specification.” Limits never expand coverage automatically. A limit outside the current view remains in the summary with an offscreen guide indicator.

### 4.4 Stable decimals without fuzzy membership

Use a small private decimal-grid builder, not repeated binary addition and not a general decimal-number framework:

1. Parse the finite saved origin and width’s canonical `Number.toString()` representations, including exponent notation, into signed decimal integer coefficients and scales.
2. Compute each `origin + k × width` using aligned integer coefficients, with private BigInt arithmetic.
3. Convert each completed edge to Number once. All consumers share this one array.
4. Validate finite edges, strict increase, safe integer indices, finite positive interval widths, and a finite positive plotting span. Validate generated heights before rendering density.
5. Compute Fit candidates with signed exact decimal floor/ceil division: `first=floor((min-origin)/width)` and `last=max(first+1,ceil((max-origin)/width))`. The one-bin minimum handles a constant source exactly on a boundary. Verify the converted endpoints against the actual measurement extrema and adjust adjacent candidates within a bounded check. Avoid overflowing floating `(x-origin)/width` estimates and unbounded correction loops.

This yields `[0.1,0.2,0.3,0.4,0.5]` for origin 0.1 and width 0.1. Measurement values are **not** rounded: `0.1 + 0.2`, represented as `0.30000000000000004`, remains above a specification at 0.3. Membership uses direct comparisons to resolved Numbers. Existing `edgeTolerance` remains a gesture helper; it must not become a specification or bin-membership rule. [R-bins]

The save format still contains ordinary Numbers, not BigInts or a parallel decimal type. Therefore values already indistinguishable as a JavaScript Number cannot regain their original precision on restore. At input time, reject mathematically distinct authored decimal edges/bounds that become the same Number; equivalent spellings such as `1` and `1.0` are the same intended value. At runtime, reject collapsed bin edges and unusable spans with an actionable error. `origin=1e16,width=0.1` cannot produce the requested distinguishable adjacent bounds. A 513-bin request fails with “Choose a wider interval or narrower coverage”; never silently widen it.

One important Fit case is source `[8e307,9e307]`, origin `-1e308`, width `1e307`: indices 18…19 and the resulting span are representable, although a floating subtraction used for the quotient overflows. The decimal calculation avoids rejecting that valid case. Conversely, finite endpoints alone do not guarantee a finite plotting span or density; retain exact counts/records and show a geometry error if rendering would require nonfinite arithmetic.

### 4.5 Specification classification

With optional finite lower L and upper U, require at least one bound when specifications are enabled:

| Status | Exact membership |
| --- | --- |
| Below | L exists and `x < L`. |
| Within | `(L absent or x >= L) and (U absent or x <= U)`. |
| Above | U exists and `x > U`. |
| Outside | Below or Above, evaluated as one predicate. |

Only values accepted by `finiteNumber` enter these classes. Reuse `numericExclusionReason` to separate missing values from other invalid measurements. Null/undefined/blank, booleans, nonfinite numbers, and unparseable text must not become failures through a blind “not Within” expression. Finite numeric text follows the existing parser. [R-values]

Equality at either acceptance limit passes. One-sided specifications omit/disable the absent tail rather than claim that it was measured as zero. With neither bound, the compliance section is off; do not report 100% accepted. Intentionally equal L=U is allowed and labelled **Exact value**; only that value passes. L>U is invalid. Distinct typed bounds that collapse numerically produce an input error; a deliberately identical saved numeric pair expresses the exact-value contract.

For ng>0, each share is its status count/ng. Below + Within + Above = ng and Outside = Below + Above. For ng=0, show “No valid measurements” and an undefined share, not 0% or 100%. Pooled compliance is `sum(withinCount_g) / sum(ng)`; never average group percentages.

### 4.6 Heights, groups, and axes

For equal widths, provide **Count**, **Percent**, and **Density**, defaulting to Count:

- Count height: `c`.
- Percent height: `100 × c/ng`.
- Density height: `(c/ng) / (rightEdge-leftEdge)`.

For unequal widths, require **Density** in V1. Counts and percentages remain in readouts and the bin table. When an edit first makes edges unequal, the same edit switches height to Density and explains the unit. An explicitly saved Count/Percent request with irregular edges is invalid; omitted height resolves to Density. Determine equal spacing from canonical decimal edge differences, not an arbitrary tolerance; a declared regular grid is equal-width by definition.

All-valid ng includes coverage tails. In Density mode, finite bar areas add to the covered share, potentially below one; the coverage readouts account for the rest. This deliberately differs from NumPy’s in-range density normalization. Label the Y axis “Density (share per measurement unit)” and show ng. For ng=0, render empty context geometry with no density value. Selected contribution heights use the same context ng: `selectedCount`, `100×selectedCount/ng`, or `(selectedCount/ng)/binWidth`, respectively. Never renormalize the overlay by the number selected in Q.

Grouped histograms use exactly the same resolved edges and X scale. Each group has its own ng. Shared Y uses the same height unit for all panels. Count compares volume; Percent/Density compare distributions relative to group sample size. Never reuse categorical series percent-stack denominators. [R-series]

Use full-source reference heights as the automatic Y floor. Current Count cannot exceed its source count; current Percent/Density can increase when filtering concentrates the population. Expand the shared automatic Y maximum when needed, then return to the source floor when the filter clears, matching the repository’s domain rule. Compute this maximum across the complete group domain, not just currently displayed panels. [R-ui]

Authored X stays fixed through filtering and refresh. Auto X may change on source replacement. Automatic Y is recomputed for a new source revision; users who require the identical Y across revisions use saved `yAxis.limits`. Do not promise both a permanently fixed auto Y and unclipped normalized heights. Explicit axis limits are honored as clipping, with hidden-content notices. Engineering/authored histograms use linear X and Y; enabling this mode makes any necessary scale change in the same visible settings transaction. Existing legacy Auto scale choices remain available until engineering mode is enabled.

## 5. What users see and do

### 5.1 Compact live settings

Extend the existing nonmodal chart-settings popover. Use the repository’s 28px controls, shared setting rows, and 100px label column; do not introduce a wizard or a second settings panel. Valid changes apply live. Draft invalid text stays local to the editor while the last valid chart remains visible. [R-ui] [R-settings]

| Section | Controls and feedback |
| --- | --- |
| **Bins** | Auto / Width + origin / Edges. Auto retains the count control. Width mode shows Width, Origin, first/last coverage boundary, and Fit coverage. Edges uses one short comma/newline list plus interval count. Show precise validation next to the edited field. |
| **Specifications** | Optional Lower and Upper inputs; blank means open. Display “Limits included” and the exact inequalities. Equal bounds show “Exact value.” Clear specifications is explicit. |
| **Compare** | Optional Group field, Count/Percent/Density, and Show groups. For irregular edges Density is explained and fixed. Group display controls never filter data. |

Use `histogram.groupField`, distinct from categorical `seriesField`. Engineering settings are incompatible with `forceString`, `aggregateId`, and `seriesField`; make the conflicting setting visible and require an explicit mode switch. Do not reinterpret existing series charts. V1 permits either the existing generic facet or numeric histogram grouping, not both simultaneously; show the conflict and reject an incompatible imported configuration. Ungrouped histograms continue to work inside existing facets.

Group values use typed scalar identities, so numeric 1 and text "1" remain different. Normalize null, undefined, and blank group values into one Missing group to match the existing null ValueFilter. Other string/number/boolean groups reuse `categoryKey`/`categoryLabel`. A nonfinite numeric group key cannot be represented by the current saved ValueFilter; show grouping unavailable with its exact invalid-key records and retain pooled measurement compliance. Do not silently discard those rows or create a second group-filter framework. [R-categories] [R-apply] [R-save]

Default to the first two source groups, saving those identities when grouping is enabled; permit up to six visible panels. If a compiled/restored configuration omits `visibleGroups`, normalize it once when that configuration is installed with source data and retain the resulting identities in saved state; never fill defaults during rendering or each refresh. Explicit `visibleGroups: []` means table-only. A compact searchable/paged table covers **every** group, including zero-valid groups, with valid n, exclusions, below/within/above counts, and Within %. Hidden panels remain represented in pooled/group totals; there is no silent “Other” pool. Display “2 of 17 groups shown.” Keep source group identities through peer/own selections; groups do not vanish because their current context is empty. Refresh may add groups to the complete table while preserving the saved visible-group choices.

Plan sparse per-group bin membership and synthesize zero bins for displayed panels, rather than allocating every possible group×512 cell. The initial two-panel default and six-panel limit are product bounds to validate in implementation, not benchmark conclusions.

### 5.2 Plot, summary, and color

The plot retains the chart/group hue. Draw labelled neutral specification guides and an optional subdued accepted-region guide behind the bars. Do not turn a whole bin red or green: Fixture A’s `[6,8)` contains three accepted records and one above-limit record.

Below the plot, show a compact summary such as:

> **In spec 9/15 (60%) · Below 3 · Above 3 · Outside 6**  
> Coverage 0…12: below 1 · above 1 · Missing 3 · Invalid 3

Labels and text carry status, so color is not the only signal. A selection uses the existing hue plus dimming, with selected contribution drawn against the context count/height. A partially selected bin must show the selected fraction, including when a frozen range no longer aligns with the current edges. Status coloring within a bin remains EH-08 exploration; it is not needed to obtain exact status records.

Hover and keyboard focus update a header/readout region, not a floating tooltip that blocks dense marks. Show exact interval notation, count, group denominator, percent/density, and below/within/above breakdown. The compact axis may round labels; the focused readout/trace exposes sufficient precision to distinguish neighboring Numbers. A zero-height bin retains an accessible hit target and reads zero, without a visible bar that falsely implies a positive count.

### 5.3 Selection and keyboard contract

| Action | Proposed result |
| --- | --- |
| Click / Enter / Space on a bin | Replace the measurement selection with that exact interval. A grouped bin also sets its group ValueFilter. Repeating the identical measurement-and-group action clears both histogram slots. |
| Drag a brush | Snap to resolved edges at gesture creation and store the resulting interval with exact endpoint flags. In a group panel, also set that group. Keyboard range editing provides the same operation. |
| Click / Enter / Space on Below, Within, Above, or Outside | Replace the measurement selection with one specification-status snapshot. A group-row action also sets its group; a pooled action clears the histogram group slot. |
| Click a coverage tail | Use strict `< firstEdge` or `> lastEdge` range semantics; a group-panel action sets that group, and a pooled action clears the group slot. Preserve the final finite endpoint in the final bin. |
| Alt-click / Alt-Enter on a mark or count | Open its exact trace without changing selection. Also expose an ordinary labelled Trace/Records action for discoverability. |
| Click empty plot / use Clear selection | Clear all this chart’s linked `filters`, matching the existing header clear behavior; retain independent `localFilters`, bins, specifications, and other chart settings. |
| Escape | Cancel the active edit or close the innermost trace/popover before closing chart details; restore focus to the invoking control. |

Use roving keyboard focus for bin targets, with arrow keys traversing intervals and Home/End reaching the first/last bin. Each target announces group, full interval, count/ng, and selected count. Status actions are real buttons. The present numeric renderer needs this keyboard work explicitly; it is not safe to assume it already mirrors categorical selection. [R-bar]

Selection fields are two ordinary field slots in `filters`: the measurement and, if configured, the numeric-histogram group. Ordinary bin/status/brush actions replace those slots atomically and preserve other field predicates. Compare the whole action—effective numeric predicate plus typed group scope—for pressed/toggle behavior: Outside for B must replace Outside for A, not toggle it off because its numeric predicate matches. Repeating a group action clears both owned slots; the explicit chart-wide clear removes all linked filters, as required by the existing UI defaults. Independent `localFilters` are untouched. There is no saved `selectedStatus`, selected-bin index, or per-feature ownership metadata. [R-ui]

### 5.4 Exact trace and Records versus global Rows

Extend existing bar traces and the shared trace dispatcher. A bin trace shows its bounds, context/selected counts, status composition, and contributor records. Status, coverage, and exclusion traces show their literal predicate/reason and exact contributor IDs from the same plan. Reuse the existing paged contributor-table convention, including an empty trace for an empty bin. [R-bar-trace] [R-trace-panel] [R-inspector]

The ordinary global **Rows** surface follows global linked filters and can also have its own filters/search. A chart-local population does not automatically propagate to that surface. Therefore it is incorrect to promise that clicking a numeric Outside predicate always makes global Rows contain exactly the chart’s displayed Outside count. [R-rows] [R-population]

Provide **Records** from the trace by extending `ChartDataPreview.tsx` with an optional transient `{ sourceIds, scopeLabel, revision }` input. This exact view uses the plan’s IDs, includes source and calculated columns through the existing column accessors, pages the complete result, and labels its scope. It must not reapply unrelated global/Rows filters or stop at the existing first-100 preview. It creates no chart, changes no dashboard layout, and persists no row IDs. The existing chart-specific data preview and ordinary global Rows remain useful for their respective populations. [R-preview] [R-provider]

Example: a local `Group=A` chart has three Outside records, while its numeric Outside predicate alone can match six globally. The trace and exact Records show those three and say “Chart population: Group A.” The linked-selection chip explains the actual numeric predicate. A group-specific action adds Group=A and can narrow global selection accordingly; arbitrary local predicates still remain local. Do not copy all local predicates into a linked selection to hide the distinction.

Invalidate/close an open trace or exact Records view on a relevant source/settings revision using the existing trace nonce mechanism, rather than leave a stale list looking current. Extend `traceRows.ts: traceRowIds` as well as the visible trace body, since project/query actions use that dispatcher. [R-trace-scope] [R-trace-rows]

## 6. State, planning, filtering, and persistence

### 6.1 Small saved state

This is a proposed API sketch; these properties/types do not exist at the baseline:

```ts
type HistogramBinning =
  | { mode: "auto" }
  | {
      mode: "width";
      width: number;
      origin: number;
      firstIndex: number;
      lastIndex: number; // last edge index, not a bin count
    }
  | { mode: "edges"; edges: number[] };

interface HistogramSettings {
  binning: HistogramBinning;
  spec?: { lower?: number; upper?: number };
  groupField?: string;
  height?: "count" | "percent" | "density";
  visibleGroups?: Array<string | number | boolean | null>;
}

// Add to existing BarChartSettings:
// histogram?: HistogramSettings

type SpecRegion = "below" | "within" | "above" | "outside";
interface SpecStatusFilter extends FilterBase {
  type: "spec-status";
  lower?: number;
  upper?: number;
  region: SpecRegion;
}

// Add to existing RangeFilter:
// minExclusive?: boolean
```

The new grouping field must differ from the measurement. Keep automatic `binCount` where it is today; `histogram.binning.mode="auto"` delegates to it. No schema version, migrated parallel settings, persisted counts/edges cache for grids, or stored specification annotation is needed.

### 6.2 A single computed source

Add focused pure helpers, provisionally `BarChart/histogramBins.ts`, `BarChart/histogramPlan.ts`, and `lib/specification.ts`:

- `histogramBins` resolves/validates one complete edge array and exact interval predicates. It delegates Auto to the existing bin implementation.
- `specification` validates bounds and classifies a finite Number. Both the planner and `applyFilter` use it, preventing a separate tail formula in each renderer.
- `histogramPlan` receives full-source column values, context IDs, current selection predicates, and settings. It computes edges, source reference counts, sparse group/bin contributors, context/selected counts, specification contributors, coverage contributors, exclusions, and shared domains.
- Existing `barPlan`/rendering adapters use that result for the numeric route. Traces, readouts, row actions, and density do not independently recount the source.

Keep exact source IDs in the transient result, as present bar plans already do. Source-reference geometry needs counts, not a second full copy of every trace array. Store no contributor IDs in saved settings. This is a local histogram calculation, not a new generic analytics pipeline. [R-plan]

### 6.3 Both tails inside one filter atom

The existing `Filter[]` remains AND. A single `SpecStatusFilter` with region Outside evaluates finite `x < L || x > U`, respecting absent bounds. A Below filter requires L; Above requires U; Within and Outside require at least one bound. Validate L≤U and finite supplied bounds. Invalid measurements always return false. This represents the necessary union without intersecting two incompatible ranges or adding a general OR tree.

`RangeFilter.minExclusive` is separately required for exact above-coverage selection. Keep the existing `maxExclusive` behavior intact. Filter labels and editors must expose strictness; a `spec-status` filter is not an ordinary brush interval. `getAxisFilter`/`useFilterExtent` should continue to return ranges only. [R-filter-types] [R-apply] [R-axis-filter]

For numeric histograms, `definition.ts: getFilterFunction` must collect each active filter’s column once, outside the per-row predicate, then AND every predicate. Do not preserve its current first-measurement-only behavior for the new grouping/selection route. [R-definition]

### 6.4 Frozen predicates, live settings

Changing specification limits updates guides and context counts immediately. An existing selection retains its own numeric bounds. Its chip says, for example, `x < 2 or x > 6`; if the visible limits become 2…7, show “Selection uses earlier limits” with **Update selection**. That explicit action changes the snapshot in one undo step. Clearing specifications leaves a valid prior filter intact until it is cleared or replaced.

Preserve both optional bounds in a saved status snapshot even if a Below/Above predicate only uses one; export/recompile retains that snapshot. Determine button pressed/toggle equality from the effective numeric predicate, including endpoint flags, plus the typed group scope—not fuzzy `sameRange` or mere status name. A stored but irrelevant opposite bound is not evidence that a Below predicate changed.

The same principle applies to bin selections. Snap when the gesture is made; do not re-snap a saved numeric predicate in a render effect after bins, coverage, or source change. Remove the current automatic re-snapping behavior for numeric histograms as an intentional selection-contract change, including Auto. Auto’s bin algorithm and initial interactions remain useful. A saved final-bin `[10,12]` remains inclusive after Fit makes 12 an interior edge; it can partially select the new `[12,14]` bin. Render that partial contribution correctly. [R-bar]

Changing an engineering histogram’s measurement field is an explicit units/context change: clear its former measurement slot, reset unit-dependent authored bins/specifications, and clear the old `xAxis.limits`/`yAxis.limits` in the same settings transaction, preserving unrelated/local predicates. If the new measurement equals the current group field, also clear the conflicting grouping, its old filter slot, and visible-group choices. A group-field change clears the old group slot and initializes the visible group choices. Centralize those field-switch rules at the existing update path or a narrowly shared edit helper so axis menus and settings cannot diverge. Deliberate new configurations compiled from text are validated against their declared field rather than treated as interactive field switches.

Use `holdStateChanges`/the existing edit-session pattern for focus-to-commit typing. Valid values update live; Enter/blur commits once; Escape restores the entry snapshot before releasing the hold. Popover Reset restores its opening snapshot. Do not emit one host undo checkpoint per keystroke. Because `updateChart` shallow-merges, replace the complete nested `histogram` value. [R-provider] [R-guide]

### 6.5 JSON, Dashboard text, and source replacement

Extend `saveDataUtils.ts` validation for new settings and filter types in every supported filter location: chart selection, chart-local population, workspace filters, and Rows filters. Reject incompatible modes, nonfinite values, collapsed bin edges/spans, invalid group values, excess bins, and invalid strict endpoint flags. Deliberately equal specification bounds remain valid. A missing source field after restoration produces an “Unavailable field” state with retained authored settings; it is not zero observations or 100% compliance. [R-save]

Add nested `histogram.*` settings to `settingKeys.ts` and completion/schema hints. Preserve `bins=20` as the existing automatic bin-count shorthand and preserve `group=` as the existing aggregate reference. Do not repurpose them for numeric histogram grouping. [R-dsl-keys] [R-dsl-compile] [R-dsl-schema]

Use one proposed lossless filter syntax through the shared `buildFilter` path:

```text
histogram.binning.mode=width
histogram.binning.width=2 histogram.binning.origin=0
histogram.binning.firstIndex=0 histogram.binning.lastIndex=6
histogram.spec.lower=2 histogram.spec.upper=6
histogram.groupField="Group" histogram.height=count

select."Measurement".spec=outside:2..6
select."Measurement".spec=within:2..
select."Measurement".spec=above:..6
select."Measurement".spec=below:2..6

select."Measurement"=[0..2)
select."Measurement"=(12..)
```

These are setting/filter fragments, not a complete runnable dashboard. `.spec` encodes the region plus optional snapshot bounds. Unbracketed `0..2` remains the inclusive range shorthand; bracket/parenthesis interval values carry strict endpoint flags. An inclusive final-bin range can export as `10..12`. The same syntax must work under the existing `where.` local-filter prefix, workspace `filter`, and Rows filter contexts. Use the existing path formatter for quoted field names and lossless Number strings for bounds.

The current lexer accepts the punctuation as value text; the needed work is explicit decoding in `compile.ts: buildFilter`, validation/hints, and lossless `export.ts: filterPairs` support. Do not rely on the chart exporter’s generic settings-diff fallback: workspace and Rows paths do not provide equivalent protection. Test semantic round trips, not byte-for-byte retention of omitted false flags. [R-dsl-parse] [R-dsl-export]

`DataLayerProvider.setData` currently resets state; the design must not promise that a bare call preserves authored settings. For refresh with continuity, retain saved settings and use the controlled data-plus-savedData/restore path. Reorder or replace rows, then re-evaluate saved numeric/group predicates against the new source. Authored coverage stays fixed; new extremes enter coverage tails. Use the existing trace revision invalidation, and preserve the established clearing behavior when field type/null-token conversions invalidate linked predicates. No row-index carryover, migration service, or hidden “rebind” action is required. [R-provider] [R-carry]

### 6.6 Concrete integration map

For the table below, `BarChart/` abbreviates `packages/explorEDA/src/components/charts/BarChart/`, and `trace/` abbreviates `packages/explorEDA/src/components/charts/trace/`. Other library paths are relative to `packages/explorEDA/src/`; demo paths are written in full. New names are proposals; existing files are verified inputs.

| Area | Files and required change |
| --- | --- |
| Settings and dispatch | `components/charts/BarChart/{definition.ts,BarChart.tsx,BarChartSettingsPanel.tsx}`: optional histogram namespace, explicit numeric dispatch, full-AND filter evaluation, compact controls, grouped route. Keep `seriesBarPlan.ts` categorical. |
| Numerical planning | Existing `BarChart/{bins.ts,barPlan.ts}` plus new `histogramBins.ts`, `histogramPlan.ts`, `lib/specification.ts`: one edge/classification/contributor source, domain rules, typed exclusions. |
| Rendering and summaries | Proposed `BarChart/HistogramSummary.tsx` and `GroupedHistogramChart.tsx`: shared panels, complete group table, context versus selected contribution, exact hit/focus targets. Prefer small components over another renderer framework. |
| Filters and labels | `types/FilterTypes.ts`, `hooks/applyFilter.ts`, `components/ActiveFilterStatus.tsx`, `components/settings/FiltersSettingsTab.tsx`, `components/charts/DataTable/components/ColumnFilter.tsx`, `hooks/useFieldFilter.ts`: recognize the focused atom and strict lower endpoint; literal chips; explicit editing/replacement. |
| Brush extent | `hooks/{getAxisFilter.ts,useFilterExtent.ts}`: exclude specification atoms from interval assumptions; retain typed range behavior. |
| Persistence and text | `utils/saveDataUtils.ts`, `lib/dsl/{settingKeys.ts,schema.ts,compile.ts,export.ts}`; `parse.ts`/`paths.ts` document the existing token/path contract. Extend all filter contexts and round-trip tests. |
| State/dependencies | `providers/DataLayerProvider.tsx` for edit transactions and field-switch rules; `components/charts/chartAccessibility.ts: getChartFields` must include `histogram.groupField` so calculation dependencies and field inspection stay correct. |
| Exact evidence surfaces | `BarChart/{barTrace.ts,BarTraceBody.tsx,GroupedAggregateInspector.tsx}`, `trace/{traceTypes.ts,ChartTracePanel.tsx,traceRows.ts}`, `components/ChartDataPreview.tsx`: status/coverage/exclusion traces, exact dispatch, paged all-field Records. `components/charts/ChartTraceDetails.tsx` is shared UI, not the trace dispatcher. |
| Annotations | `lib/annotations/context.ts` advertises numeric axes and appropriate capabilities; renderer supplies a continuous frame. Existing `resolve.ts` can project fixed lines. Derive specification guides from settings/plan; do not save duplicate annotations or allow a Notes-line drag to change compliance. Aggregated histogram marks do not gain per-record callouts. |
| Docs/demo | `apps/demo/src/docs/pages/{bar.mdx,ecdf.mdx}`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/docs/reference/settingDescriptions.ts`, `apps/demo/src/demos/{examples.ts,coverage.ts}`, a proposed `apps/demo/src/demos/engineeringHistograms.ts`, and a small labelled dataset under `apps/demo/public/datasets/`. |

## 7. Fixtures with exact expected results

Fixture labels below are stable record keys for assertions and explanations, not saved positional IDs. Compare record-key sets after reorder. The arithmetic was independently evaluated in scratch without importing or running repository code.

### Fixture A — ties, mixed bins, missing values, and groups

Use these 21 records. Quoted entries are strings; `Infinity` and `NaN` are actual JavaScript numeric values in the unit fixture.

| Record | Group | Measurement |
| --- | --- | --- |
| a0 | A | -1 |
| a1 | A | 0 |
| a2 | A | 2 |
| a3 | A | 2 |
| a4 | A | 4 |
| a5 | A | 6 |
| a6 | A | 13 |
| a7 | A | null |
| a8 | A | "bad" |
| b0 | B | 1 |
| b1 | B | 2 |
| b2 | B | 4 |
| b3 | B | "6" |
| b4 | B | 7 |
| b5 | B | 12 |
| b6 | B | " " |
| b7 | B | Infinity |
| c0 | null | 3 |
| c1 | null | 6 |
| c2 | null | NaN |
| e0 | E | null |

Settings: width 2, origin 0, indices 0…6; edges `[0,2,4,6,8,10,12]`; specifications `[2,6]` inclusive.

| Interval / coverage | Exact records | Count |
| --- | --- | --- |
| Below coverage `<0` | a0 | 1 |
| `[0,2)` | a1, b0 | 2 |
| `[2,4)` | a2, a3, b1, c0 | 4 |
| `[4,6)` | a4, b2 | 2 |
| `[6,8)` | a5, b3, b4, c1 | 4 |
| `[8,10)` | none | 0 |
| `[10,12]` | b5 | 1 |
| Above coverage `>12` | a6 | 1 |

- **Valid:** 15 of 21. **Missing:** `{a7,b6,e0}`. **Other invalid:** `{a8,b7,c2}`.
- **Below specification:** `{a0,a1,b0}` = 3/15 = 20%.
- **Within:** `{a2,a3,a4,a5,b1,b2,b3,c0,c1}` = 9/15 = 60%.
- **Above:** `{a6,b4,b5}` = 3/15 = 20%.
- **Outside:** `{a0,a1,b0,a6,b4,b5}` = 6/15 = 40%.
- Lower ties `{a2,a3,b1}` and upper ties `{a5,b3,c1}` pass.
- `[6,8)` is deliberately mixed: a5, b3, c1 pass; b4 fails high. Its whole-bin color cannot communicate compliance truthfully.
- b5=12 belongs to the final finite bin and fails the upper specification. a0 is both below coverage and below specification; the two labels still describe different tests.
- Narrowing coverage to `[4,8]` sends four accepted records `{a2,a3,b1,c0}` below coverage while specification counts remain `3/9/3`. A coverage tail is not necessarily a failure tail.

| Group | Denominator / exclusions | Bins and specification result |
| --- | --- | --- |
| A | 9 rows; n=7; 2 excluded | Bins `[1,2,1,1,0,0]`; coverage tails 1/1; below/within/above `2/4/1`; Within `4/7`. |
| B | 8 rows; n=6; 2 excluded | Bins `[1,1,1,2,0,1]`; tails 0/0; statuses `1/3/2`; Within `3/6`. |
| Missing group | 3 rows; n=2; 1 excluded | Bins `[0,1,0,1,0,0]`; tails 0/0; statuses `0/2/0`; Within `2/2`. |
| E | 1 row; n=0; 1 excluded | Zero bins; no valid measurements; Within share undefined. |
| Pooled | 21 rows; n=15; 6 excluded | Bins `[2,4,2,4,0,1]`; statuses `3/9/3`; Within `9/15`, not a mean of group shares. |

Additional assertions from the same data:

- Lower-only L=2: Within 12/15, Below 3/15, no Above tail.
- Upper-only U=6: Within 12/15, Above 3/15, no Below tail.
- Exact-value `[2,2]`: Within 3/15, Below 3/15, Above 9/15.
- Peer filter Group=B: context n=6 and statuses `1/3/2`. Own Outside selects `{b0,b4,b5}`; an own Above selection selects `{b4,b5}`. Neither action changes the denominator from 6.
- Change U from 6 to 7: current Within becomes 10/15; Above becomes 2/15; Outside becomes 5/15. A frozen Outside 2…6 selection still contains six, including b4. Update selection drops b4.
- Ungrouped histogram with independent local `Group=A`: n=7 and exact Outside `{a0,a1,a6}`. A global numeric Outside 2…6 filter matches six across groups. Exact Records must show the three chart-context records and a scope label.

### Fixture B — irregular widths and conserved mass

Use Fixture A with complete edges `[0,1,4,6,8,12]`; retain specifications `[2,6]`. Widths are `[1,3,2,2,4]` and the denominator remains 15, including the two coverage-tail measurements.

| Interval | Count | Density `(count/15)/width` |
| --- | --- | --- |
| `[0,1)` | 1 | `1/15` |
| `[1,4)` | 5 | `1/9` |
| `[4,6)` | 2 | `1/15` |
| `[6,8)` | 4 | `2/15` |
| `[8,12]` | 1 | `1/60` |

Finite-bar area is `13/15`; underflow and overflow each account for `1/15`. Specifications remain `3/9/3`. Changing bins must not change acceptance counts.

| Group | Counts in the five bins | Densities and total finite area |
| --- | --- | --- |
| A, n=7 | `[1,2,1,1,0]` | `[1/7,2/21,1/14,1/14,0]`; area `5/7`. |
| B, n=6 | `[0,2,1,2,1]` | `[0,1/9,1/12,1/6,1/24]`; area `1`. |
| Missing, n=2 | `[0,1,0,1,0]` | `[0,1/6,0,1/4,0]`; area `1`. |
| E, n=0 | all zero | Density undefined; no valid measurements. |

Check the UI transition to mandatory Density, the density axis unit, exact widths in readouts, and unchanged specification records. Do not normalize the covered 13 observations into unit area without explaining a different denominator; that is not this design.

### Fixture C — decimal grid with real neighboring values

Origin 0.1, width 0.1, indices 0…4 must resolve exactly to Number values `[0.1,0.2,0.3,0.4,0.5]`. Specifications are `[0.2,0.3]`.

| Record | Measurement | Relevant distinction |
| --- | --- | --- |
| d0 | 0.1 | First edge. |
| d1 | 0.2 | Lower acceptance tie. |
| d2 | 0.3 | Upper acceptance tie. |
| d3 | 0.30000000000000004 | Result of `0.1 + 0.2`; strictly above U. |
| d4 | 0.4 | Interior edge. |
| d5 | 0.5 | Final finite edge. |
| d6 | 0.29999999999999993 | Representable neighbor below 0.3. |
| d7 | 0.5000000000000001 | Representable neighbor above 0.5. |
| d8 | 0.09999999999999999 | Representable neighbor below 0.1. |

- Bin contributors: `[{d0},{d1,d6},{d2,d3},{d4,d5}]`; counts `[1,2,2,2]`.
- Underflow `{d8}`; overflow `{d7}`.
- Below `{d0,d8}`; Within `{d1,d2,d6}`; Above `{d3,d4,d5,d7}`.
- `d3` must fail the upper specification even if an axis label rounds it to 0.3. The exact readout must distinguish d2 and d3.
- Export/restore the configuration and selection; assert the same Numbers and record-key sets. Never use an epsilon-based assertion to hide a membership difference.

### Fixture D — source reorder, replacement, and Fit

First reverse Fixture A’s record order. Bin/status/group results and record-key sets remain identical; internal positional source IDs may change.

Then replace a6’s measurement 13 with 5 and append `b8: Group B, x=14` plus `r0: Group C, x=4`. Retain saved authored coverage `[0,12]`, specifications `[2,6]`, and a saved Outside 2…6 predicate.

| Result | Exact expectation |
| --- | --- |
| Source / valid population | 23 records, 17 valid, 6 excluded. |
| Saved edges | Still `[0,2,4,6,8,10,12]`. |
| Finite-bin counts | `[2,4,4,4,0,1]`; underflow `{a0}`; overflow `{b8}`. |
| Specifications | Below 3, Within 11, Above 3; Within `11/17`. |
| Within records | Fixture A’s nine Within records plus a6 and r0. |
| Above records | `{b4,b5,b8}`. |
| Saved Outside membership | `{a0,a1,b0,b4,b5,b8}`: still six, with b8 replacing a6. |
| Group n / Within | A `7/5`; B `7/3`; Missing `2/2`; E `0/0` with undefined share; new C `1/1`. |
| Saved `[10,12]` selection | Still exactly `{b5}`. |

Press Fit coverage. Its source-enclosing indices become −1…7, yielding `[-2,0,2,4,6,8,10,12,14]` and bin counts `[1,2,4,4,4,0,0,2]`. Coverage tails become zero. Specifications stay `3/11/3`. The saved inclusive `[10,12]` predicate still selects only b5, now one of two contributors in the final `[12,14]` bin. This catches both silent range re-snapping and whole-bin selected highlighting.

### Focused validation and missing-field cases

Reject zero/negative/nonfinite width; unsafe grid indices; 513 regular intervals; 66 explicit edges; duplicate/decreasing/collapsed edges; nonfinite interval/span/density geometry; L>U; missing required bound for a Below/Above filter; or strict flags without the associated range endpoint. Test the valid large-magnitude Fit example in §4.4 as well as the collapsed `1e16 + 0.1` case.

With no finite measurements, retain authored bins and show exclusions plus undefined compliance. If the measurement or grouping field disappears during a controlled replacement, preserve settings and expose the unavailable-field state; do not silently switch to a similarly named field. Restoring that field permits recomputation.

The runnable demo should use the same labelled cases in a small CSV, with its ingestion choices stated. CSV cannot carry actual numeric NaN/Infinity as typed values; those exact exclusion reasons belong in the unit fixture. Do not change global type inference or clean unrelated data just to make the demo reproduce every runtime type.

## 8. Verification and worker delivery gates

### Important tests, tied to concrete risks

| Check family | Required assertion |
| --- | --- |
| Numerical contract | Fixtures A–D; exact intervals and status partition; decimal stability; coverage tails; empty bins; cap/collapse failures; valid large-magnitude Fit. Retain existing endpoint/integer tests. |
| Shared truth | For every bin/status/coverage target, rendered count = trace contributor count = exact Records count; selected contributors are an intersection with the same context. |
| Filter/state contract | Outside works as one AND-compatible atom; strict overflow excludes the last edge; group and unrelated predicates are honored; local predicates stay independent; own selection does not shrink its denominator. |
| Persistence | JSON and text round-trip settings plus filters in chart/local/workspace/Rows scopes, including one-sided/equal specs, both endpoint flags, quoted field names, and old-selection/new-guide mismatch. |
| Edits/refresh | Live typing is one undo step; invalid drafts do not apply; Escape/Reset work; controlled replacement re-evaluates predicates; Fit changes coverage only; stale trace/Records closes. |
| Exact records | The exact preview pages past 100 records with correct total and all fields, preserves its stated context, and does not acquire global Rows search/filter conditions. Use a small derived 121-record case for this specific risk. |

Use targeted unit/integration tests for these contracts. Do not add snapshots of every control or reimplement each arithmetic function in a test. Renderer acceptance must assert record identities where the question is exact membership; a row-count-only assertion can miss swaps.

### Browser acceptance at the required widths

Run the same core workflow at **1280, 783, and 390 px**, using actual panel width to choose layout rather than assuming the full viewport belongs to one chart.

| Viewport | Required interaction / layout | Evidence to collect during implementation |
| --- | --- | --- |
| 1280 | Author width/origin; inspect mixed `[6,8)`; select Outside; open exact Records; compare A/B on common scales; edit U and explicitly update the selection. | Screenshot of plot/settings and group summary; exact key-set assertions; no blocked marks or clipped controls. |
| 783 | Settings and chart details preserve focus and live changes; groups rearrange without independent axes; a peer filter changes ng; unrelated/local predicates remain visible. | Screenshot plus keyboard traversal, one-edit undo, and restore/text round-trip checks. |
| 390 | Setting rows stack vertically while retaining the shared label/input row structure; panels become one column; counts and predicate labels wrap; trace/Records remain usable. The group table may scroll within its own region without page overflow. | Keyboard-only bin/status/trace flow, Escape/focus return, exact last-page records, and no horizontal page overflow. |

At every width, cover a zero bin, a one-sided specification, a partly selected mixed bin, a limit outside the view, and coverage tails independently of specification tails. Exported chart images should retain limits, group labels, and scope-bearing summary text when those elements are part of the chart image. Verify this through the existing chart-export flow; no screenshot claim is made by this Design run.

### Docs and runnable examples are part of every milestone

Create one complete `/examples/engineering-histograms` analysis, incrementally expanded in the same milestone as each feature, with focused live documentation examples:

- `engineering-width`: authored grid, empty bin, coverage tails, and exact records.
- `engineering-specs`: inclusive limits, both tails, mixed bin, frozen selection, and local/global scope.
- `engineering-groups`: A/B/Missing/E denominators and shared geometry.
- `engineering-edges`: unequal edges, density, and conserved covered mass.

Use `apps/demo/src/docs/live/examples.ts` and the existing complete-example registry. Register new coverage capabilities as **shown** when supported; do not mark them reviewed without a real dated review. The current `LiveStep` union supports brush/expectRows/expectChip/select/expectMark/click/expectText/choose, not arbitrary fill, keyboard, replacement, or exact-ID assertions. Add a focused Playwright acceptance file for those gaps instead of pretending the existing live-step schema covers them. [R-live-examples] [R-coverage] [R-examples]

The [implementation plan](implementation-plan.md) names implementation files, tests, docs sections, runnable examples, and the main risk for each of four stages. Repository commands there are instructions for workers, not commands executed for this report.

## Primary references

All URLs below were opened during the research on 23 October 2026. Statements about vendor capabilities are confined to these documentation pages. The older paper is identified by publication date.

- **E01:** JMP 19.2, [Histograms](https://www.jmp.com/support/help/en/19.2/jmp/histograms.shtml).
- **E02:** JMP 19.2, [Process Capability](https://www.jmp.com/support/help/en/19.2/jmp/process-capability.shtml).
- **E03:** Minitab, [Binning](https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/display-options/binning/).
- **E04:** Minitab, [Histogram — Graph Builder](https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/graph-builder/histogram/).
- **E05:** Minitab, [Observed performance for normal capability analysis](https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/capability-analysis/how-to/capability-analysis/normal-capability-analysis/interpret-the-results/all-statistics-and-graphs/observed-performance/).
- **E06:** Origin, [Creating Histograms](https://docs.originlab.com/origin-help/create-histogram/).
- **E07:** Origin, [Frequency Counts dialog](https://docs.originlab.com/origin-help/freqcount-dialog/).
- **E08:** D3, [Binning data](https://d3js.org/d3-array/bin).
- **E09:** NumPy, [numpy.histogram](https://numpy.org/doc/stable/reference/generated/numpy.histogram.html).
- **E10:** Vega-Lite, [Binning](https://vega.github.io/vega-lite/docs/bin.html).
- **E11:** A. Satyanarayan, D. Moritz, K. Wongsuphasawat, J. Heer, [Vega-Lite: A Grammar of Interactive Graphics](https://idl.uw.edu/papers/vega-lite), IEEE TVCG / InfoVis 2017, DOI `10.1109/TVCG.2016.2599030`.
- **E12:** NIST/SEMATECH, [What is process capability?](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm).
- **E13:** NIST/SEMATECH, [What are Variables Control Charts?](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm).

Repository citations throughout this report resolve to the pinned baseline. The following inventory distinguishes complete reads from targeted inspection.

## 9. Access, evidence, deliverables, and open questions

### Access status

The two attachments were available and read. Access to the full supplied packet at the stated baseline was confirmed before external research. All **40 packet files** were read across the research team. Decisive supplemental files were obtained through repository access at the **same pinned commit**; no fallback to current main was used. No decisive input remains inaccessible.

### Files read

The packet inventory is listed completely here. Paths beginning with `packages/explorEDA/src/` are abbreviated as `src/` in this inventory only; source links below retain the full repository paths.

| Area | Packet files read |
| --- | --- |
| Governing files, read first | `AGENTS.md`; `docs/agent-guide.md`; `docs/ui-defaults.md`; `CODING_STANDARDS.md`; `docs/research/DIRECTION.md`. |
| Package configuration | `package.json`; `packages/explorEDA/package.json`. |
| Histogram implementation/tests | `src/components/charts/BarChart/definition.ts`; `bins.ts`; `bins.test.ts`; `barPlan.ts`; `BarChart.tsx`; `BarChartSettingsPanel.tsx`; `seriesBarPlan.ts`; `barTrace.ts`; `BarTraceBody.tsx`; `BarChart.select.test.tsx` in that same directory. |
| ECDF | `src/components/charts/Ecdf/ecdfPlan.ts`; `src/components/charts/Ecdf/definition.ts`. |
| Data/filter/settings | `src/components/charts/useGetLiveData.tsx`; `src/hooks/applyFilter.ts`; `src/types/FilterTypes.ts`; `src/types/ChartTypes.ts`; `src/utils/saveDataUtils.ts`; `src/lib/valueParsing.ts`. |
| Dashboard text | `src/lib/dsl/settingKeys.ts`; `src/lib/dsl/compile.ts`. |
| Annotations | `src/lib/annotations/types.ts`; `context.ts`; `resolve.ts`. |
| Prior research and intent | `docs/research/engineering-bins-2026-10-21/README.md`; `decisions.md`; `evidence.md`; `docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md`; `docs/intent/population-baselines/intent-brief.md`. |
| Docs and coverage | `apps/demo/src/docs/pages/bar.mdx`; `ecdf.mdx`; `apps/demo/src/docs/live/examples.ts`; `apps/demo/src/demos/coverage.ts`. |
| Mission in packet | `docs/research/engineering-histograms-2026-10-23/pro-prompt.md`, plus the separately attached `pro-prompt.md`. |

Supplemental complete reads at the same baseline, all under `packages/explorEDA/src/` unless a full path is shown:

- `providers/DataLayerProvider.tsx`; `providers/lib/carryRowSelections.ts`; `hooks/CrossfilterWrapper.ts`; `lib/chartPopulation.ts`.
- `components/ActiveFilterStatus.tsx`; `components/settings/FiltersSettingsTab.tsx`; `components/charts/DataTable/components/ColumnFilter.tsx`; `hooks/useFieldFilter.ts`; `hooks/useFilterExtent.ts`; `hooks/getAxisFilter.ts`.
- `lib/dsl/export.ts`; `lib/dsl/schema.ts`; `lib/dsl/parse.ts`; `lib/dsl/paths.ts`; `lib/categories.ts`; `components/charts/chartAccessibility.ts`.
- `components/charts/trace/ChartTraceScope.tsx`; `traceTypes.ts`; `ChartTracePanel.tsx`; `traceRows.ts` in that trace directory; `components/charts/ChartTraceDetails.tsx`; `components/charts/BarChart/GroupedAggregateInspector.tsx`.
- `components/charts/useGetColumnData.tsx`; `components/ChartDataPreview.tsx`; `components/RowsPeek.tsx`; `components/RowsView.tsx`; `components/charts/DataTable/filteredRows.ts`; `components/charts/DataTable/definition.ts`.
- `apps/demo/package.json`.

Targeted supplemental reads, not claimed as complete: `components/PlotChartPanel.tsx` for details/trace/focus flows, and `apps/demo/src/demos/examples.ts` for the example type, registry, and route/data shape. Referenced future edit targets such as `docs/reference/settingDescriptions.ts` are grounded in the agent guide; no unseen internal implementation is asserted for them.

### Checked versus proposed

- **Checked:** baseline source facts and repair status; source/filter/trace/persistence integration points; current primary external documentation; DSL punctuation/path compatibility; fixture counts, memberships, denominators, density areas, decimal cases, and added edit/local-scope expectations.
- **Proposed:** the histogram settings namespace, numeric group route, limits/status filter, strict-lower range extension, decimal builder, exact scoped Records input, UI behavior, caps, DSL additions, milestone files, tests, and demo examples.
- **Not executed:** the repository, its tests/builds, vendor applications, browser acceptance, runtime benchmarks, deployments, or commits. No code implementation, source archive, hash manifest, or receipt is included.

### Deliverables

- [report.md](report.md): complete design, evidence, semantics, fixtures, and review boundaries.
- [implementation-plan.md](implementation-plan.md): staged implementation handoff.
- [engineering-histograms.zip](engineering-histograms.zip): the two Markdown deliverables only.

### Open questions, with defaults that do not block implementation

1. **Do 512 regular intervals, 64 explicit intervals, and two default/six maximum visible panels fit real workloads?** Start with these limits; change them only after a concrete browser or workload result, keeping errors explicit and membership exact.
2. **Would status segments improve mixed-bin reading enough to justify competing with group hue?** Keep neutral guides and exact textual composition in V1; explore with the same fixtures afterward.
3. **Should a later release support per-group specifications, nonfinite numeric grouping keys, or simultaneous generic facets and numeric groups?** V1 deliberately uses one common spec and one grouping layer with the stated validation. No extra persistence or filter abstraction is justified yet.

These are bounded follow-ups, not a request for additional demand or permission. The four milestones can start from this design.

[E01]: https://www.jmp.com/support/help/en/19.2/jmp/histograms.shtml
[E02]: https://www.jmp.com/support/help/en/19.2/jmp/process-capability.shtml
[E03]: https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/general-graph-options/display-options/binning/
[E04]: https://support.minitab.com/en-us/minitab/help-and-how-to/graphs/graph-builder/histogram/
[E05]: https://support.minitab.com/en-us/minitab/help-and-how-to/quality-and-process-improvement/capability-analysis/how-to/capability-analysis/normal-capability-analysis/interpret-the-results/all-statistics-and-graphs/observed-performance/
[E06]: https://docs.originlab.com/origin-help/create-histogram/
[E07]: https://docs.originlab.com/origin-help/freqcount-dialog/
[E08]: https://d3js.org/d3-array/bin
[E09]: https://numpy.org/doc/stable/reference/generated/numpy.histogram.html
[E10]: https://vega.github.io/vega-lite/docs/bin.html
[E11]: https://idl.uw.edu/papers/vega-lite
[E12]: https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm
[E13]: https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc32.htm

[R-bins]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/bins.ts
[R-settings]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx
[R-bin-tests]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/bins.test.ts
[R-select-tests]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/BarChart.select.test.tsx
[R-plan]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/barPlan.ts
[R-bar]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx
[R-series]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/seriesBarPlan.ts
[R-definition]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/definition.ts
[R-live]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/useGetLiveData.tsx
[R-crossfilter]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[R-population]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/chartPopulation.ts
[R-ecdf]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts
[R-annotations]: https://github.com/byronwall/explorEDA/tree/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/annotations
[R-provider]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/providers/DataLayerProvider.tsx
[R-direction]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/research/DIRECTION.md
[R-prior]: https://github.com/byronwall/explorEDA/tree/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/research/engineering-bins-2026-10-21
[R-population-intent]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/intent/population-baselines/intent-brief.md
[R-guide]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/agent-guide.md
[R-ui]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/docs/ui-defaults.md
[R-values]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/valueParsing.ts
[R-categories]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/categories.ts
[R-apply]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/hooks/applyFilter.ts
[R-save]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/utils/saveDataUtils.ts
[R-bar-trace]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/barTrace.ts
[R-trace-panel]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx
[R-inspector]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx
[R-rows]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/RowsView.tsx
[R-preview]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/ChartDataPreview.tsx
[R-trace-scope]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx
[R-trace-rows]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/components/charts/trace/traceRows.ts
[R-filter-types]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/types/FilterTypes.ts
[R-axis-filter]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/hooks/getAxisFilter.ts
[R-dsl-keys]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/dsl/settingKeys.ts
[R-dsl-compile]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/dsl/compile.ts
[R-dsl-schema]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/dsl/schema.ts
[R-dsl-parse]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/dsl/parse.ts
[R-dsl-export]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/lib/dsl/export.ts
[R-carry]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/packages/explorEDA/src/providers/lib/carryRowSelections.ts
[R-live-examples]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/apps/demo/src/docs/live/examples.ts
[R-coverage]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/apps/demo/src/demos/coverage.ts
[R-examples]: https://github.com/byronwall/explorEDA/blob/6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e/apps/demo/src/demos/examples.ts

