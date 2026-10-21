# Engineering histogram boundaries: proof plan

Date: 2026-10-21. Repository: https://github.com/byronwall/explorEDA. Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Related catalogue candidate: R008. Integration and review remain with Codex; this document proposes checks and contains no product implementation.

## 1. Decision being tested and execution status

**Direction:** retain current controls and defer authored histogram boundaries. Use a bounded proof to resolve the existing relationship between a histogram bar, its trace contributors, its inclusive range selection, and linked rows. A result from that proof does not authorize width/origin or explicit-edge controls. The four recommendations are EB01 (retain and defer), EB02 (current trust and exact-edge proof), EB03 (conditional focused lesson with a paired runnable example), and EB04 (named-task comparison before reopening the capability).

The synthetic task is to report, on repeated measurement deliveries, the exact rows and eligible-row shares below a lower specification limit, inside an inclusive specification interval, and above an upper limit, separately by a peer group. Specification limits in this fixture are **2 and 4 units**, with values equal to either limit considered inside. This is an exercise in observed membership and denominators. It does not establish process stability, process capability, a tolerance interval, a population defect rate, or real analyst demand.

Evidence labels throughout this plan:

- **S — source fact:** read from the pinned source packet or separately retrieved pinned source. It is not application execution.
- **A — arithmetic result:** independently calculated from the declared rows and interval predicates. The research script used exact rational arithmetic and imported no explorEDA modules.
- **P — proposal:** a future test, decision rule, or conditional milestone.
- **UNRUN:** no product module, package test, provider integration, demo, browser, export, undo/redo, or save/reopen test was executed in this research.

**Executed:** 76 assertions in an independent exact-rational arithmetic check passed. They cover the principal fixture, peer partitions, interval counts, density areas, source replacement, integer-only source, append-at-a-new-extreme, and saved-terminal-selection endpoint probes. A separate JavaScript-number arithmetic probe was executed without importing product code. These checks establish the expected arithmetic only. The selected source packet is not a runnable checkout.

**UNRUN:** every product check described below, including the supplied pnpm commands. No application source or repository was modified. No test success, browser defect, export result, or restoration behavior is claimed from the arithmetic results.

## 2. Compact discriminating fixture

### 2.1 Main fixture: 13 rows

**P:** use a numeric measurement field `x`, a categorical field `peer`, and an ordinary source field `record_key`. The measurement has one explicitly declared unit, written here as `u`. Use linear axes, no aggregate, no split series, no local population filters, no facets, no workspace filters, and `localSelections=false` for the first proof. Set `binCount=6`. Start with all charts' selections cleared.

`record_key` is the durable audit identity. For this exact row order, the source function `initializeData` assigns internal `__ID` values 0 through 12; it overwrites an incoming `__ID`. Compare exported and traced records by `record_key`, especially after source reordering. This is a source fact, not a guarantee of stable internal identity. [S1]

| Record key / initial internal ID | Raw `x` | Peer and purpose |
| --- | --- | --- |
| F01 / 0 | `0` | A; lower tail and full-source minimum |
| F02 / 1 | `1` | B; first authored edge |
| F03 / 2 | `2` | A; exact lower specification limit |
| F04 / 3 | `2` | B; repeated lower-limit tie |
| F05 / 4 | `2.5` | A; fractional observation |
| F06 / 5 | `3` | B; interior observation |
| F07 / 6 | `4` | A; exact upper specification limit |
| F08 / 7 | `4` | B; repeated upper-limit tie |
| F09 / 8 | `5` | A; above specification, inside authored display domain |
| F10 / 9 | `8` | B; final authored edge |
| F11 / 10 | `12` | A; extreme and full-source maximum |
| F12 / 11 | string `"NaN"` | A; present, numeric-like but not a finite measurement |
| F13 / 12 | `null` | B; missing measurement |

This is a compact discriminating fixture, not a mathematical claim that no smaller fixture could test a narrower set of behaviors. It uses two repeated specification boundaries, one fraction, a final-edge observation, an empty interval, two groups, an extreme, and distinct invalid/missing cases. The extra append probe below is a derivative case, not an enlargement of the initial proof.

**S:** `isNumberLike("NaN")` is true, while `finiteNumber("NaN")` is undefined. `isMissingValue(null)` is true. The main fixture therefore avoids introducing a nonnumeric text value that would force the whole bar field into category-count mode under `isNumericBarField`. [S2] [S3]

**A:** eligible measurements = 11; excluded measurements = 2. Peer A contains 7 raw rows and 6 eligible values. Peer B contains 6 raw rows and 5 eligible values. An unfiltered Rows view can show all 13 records; a numeric conformance denominator is 11, not 13. Missing and invalid observations are reported separately and are not automatically classified as specification failures.

### 2.2 Minimal variants

- **Integer-only source:** remove F05 from the entire source. Do not merely filter it out of the live rows. The other 12 raw records remain, with 10 eligible integer measurements.
- **Replacement:** keep the main 13 records and change only F11 from 12 to 24. Keep the same `record_key` and row order.
- **Append:** keep the original F11 at 12 and append F14 with `x=24` and `peer=A`. This tests whether an unchanged observation at the former final edge changes membership when the display extends.
- **Saved terminal selection:** separately start from the original 13 rows and append T01 with `x=14` and `peer=A`. This tests whether a saved last-displayed interval retains its right-open selection predicate when a new observation equals its former display edge. Do not combine this variant with the F14 append.
- **Reorder:** reverse the main source order without changing `record_key`, values, or peers. Do not reuse the initial internal-ID mapping.
- **Mode-boundary probes:** separately replace F12 with `"bad"` or `true`; do not mix these into the primary histogram proof. Probe blank text, numeric `NaN`, and `Infinity` separately for parsing/exclusion coverage.

## 3. Independently worked specification and ECDF expectations

### 3.1 Exact contributor sets

**A:** all rows below are keyed by `record_key`; sets are unordered for equality checks.

| Predicate | Count / eligible denominator | Exact contributor keys |
| --- | --- | --- |
| `x <= 2` | 4/11 | F01, F02, F03, F04 |
| `x >= 2` | 9/11 | F03, F04, F05, F06, F07, F08, F09, F10, F11 |
| `x <= 4` | 8/11 | F01, F02, F03, F04, F05, F06, F07, F08 |
| `x >= 4` | 5/11 | F07, F08, F09, F10, F11 |
| `2 <= x <= 4` | 6/11 | F03, F04, F05, F06, F07, F08 |
| `x < 2` | 2/11 | F01, F02 |
| `x > 4` | 3/11 | F09, F10, F11 |
| Outside inclusive specification `[2,4]` | 5/11 | F01, F02, F09, F10, F11 |

The in-spec share is 6/11, approximately 54.55%; outside is 5/11, approximately 45.45%. These are observed-sample shares only. Store exact numerator and denominator in the proof record rather than comparing rounded percentages.

**S:** the ECDF functions `shareAt`, `countInRange`, `idsThrough`, and `thresholdFilter` explicitly distinguish at-or-below, at-or-above, and inclusive ranges. Each curve uses its own valid-row denominator. [S4]

**A:** exact ties are decisive. `P(x <= 2) + P(x >= 2) = 13/11`, because the two values equal to 2 appear in both inclusive predicates. Similarly, `P(x <= 4) + P(x >= 4) = 13/11`. These sums are not complementary probabilities. Subtracting `F(2)` from `F(4)` gives 4/11 and omits F03 and F04. The correct inclusive interval can be recovered as `P(x <= 4) + P(x >= 2) - 1 = 6/11`, or counted directly with both inclusive endpoints.

### 3.2 Grouped denominators

| Predicate | Peer A: eligible denominator 6 | Peer B: eligible denominator 5 |
| --- | --- | --- |
| `x <= 2` | 2/6: F01, F03 | 2/5: F02, F04 |
| `x >= 2` | 5/6: F03, F05, F07, F09, F11 | 4/5: F04, F06, F08, F10 |
| `x <= 4` | 4/6: F01, F03, F05, F07 | 4/5: F02, F04, F06, F08 |
| `x >= 4` | 3/6: F07, F09, F11 | 2/5: F08, F10 |
| Inclusive `[2,4]` | 3/6: F03, F05, F07 | 3/5: F04, F06, F08 |
| Below 2 / above 4 | 1/6 / 2/6 | 1/5 / 1/5 |

**P / UNRUN:** inspect both groups and an All curve, then select a peer through a separate chart. Confirm whether the active trace and denominator refer to the group, the All curve, the linked population, or a chart-local population. An All curve must not silently substitute a global denominator for each group's denominator.

### 3.3 Existing comparator to test first

**P / UNRUN:** use the current ECDF for the threshold readout and source trace; use its inclusive range selection for `[2,4]`. The primary fixture deliberately places observations at both limits so pointer selection can select them exactly. Then create an ECDF selection, open its Filters settings, and repeat with an arbitrary specification threshold not present among the observations by typing its exact bounds. The ECDF's pointer snapping to observed values must not be presented as arbitrary typed-threshold entry. The existing settings filter control provides numeric At least / At most fields; establish its runtime behavior before claiming the comparator fails. [S4] [S5] [S17]

Use a workspace filter or the ECDF's filter when the task requires the exact specification interval to remain fixed. A typed own range on the histogram is subject to the histogram's edge-snapping effect. That is a different analytical contract. [S6]

**P/A:** the upstream-category comparator should use a declared field such as `spec_band`, with `Below` for `x<2`, `Within` for `2<=x<=4`, and `Above` for `x>4`. Its expected counts are 2, 6, and 3; exact keys are the corresponding rows in section 3.1. F12 and F13 need separate unusable/missing states or an explicit eligibility filter, not silent assignment to `Above`. On peer B the three counts are 1, 3, and 1. Source replacement F11=24 leaves those categories unchanged; appending F14=24 adds one to `Above`. A category bar uses equality on the prepared category, so its source trace and selected category have the same declared endpoint ownership. Test that assertion through the real preparation and filter path rather than assuming the upstream expression is correct.

## 4. Current automatic-bin expectations

### 4.1 Six bins on the fractional source

**S:** `numericBins` uses the full finite-source minimum and maximum. The presence of F05 makes this the fractional branch. Requested count 6 yields interval width `(12-0)/6=2`. `binRows` constructs half-open membership, with the final bin closed, and contributor lists from the same interval assignment. [S3] [S7]

**A:** edges are `0,2,4,6,8,10,12`.

| Bin | All-source count and contributors | Peer B count and contributors |
| --- | --- | --- |
| `[0,2)` | 2: F01, F02 | 1: F02 |
| `[2,4)` | 4: F03, F04, F05, F06 | 2: F04, F06 |
| `[4,6)` | 3: F07, F08, F09 | 1: F08 |
| `[6,8)` | 0: none | 0: none |
| `[8,10)` | 1: F10 | 1: F10 |
| `[10,12]` | 1: F11 | 0: none |

Peer A counts in the same bin order are `1,2,2,0,0,1`. The peer counts sum elementwise to the all-source counts `2,4,3,0,1,1`. Totals are 6 + 5 = 11.

**P / UNRUN:** apply peer B with a separate chart. The bar heights should use the remaining live rows while the original edges and source-domain reference remain fixed. Peer B contains no fractional live observation, but that alone must not switch the histogram to integer-centered bins: the full source still contains F05. The source setting and the filtered population must be recorded separately. [S3] [S8]

### 4.2 Own brush and exact-edge comparison

**P:** from the unfiltered main fixture, brush a range with nominal data coordinates `[2.2,3.6]`. Its nearest bin edges are 2 and 4; no halfway tie is involved. Also click the `[2,4)` bar as a separate interaction. Capture the resulting filter object rather than assuming the gesture reached the intended bar.

**S:** the current click path stores `{type:"range",field:"x",min:2,max:4}`. `applyFilter` includes both numeric endpoints. The own-filter display marks bins wholly inside that range, while the originating chart retains its population before its own selection. [S6] [S9] [S10]

**A / source prediction:** under this declared starting state:

| Surface | No peer filter | Peer B active |
| --- | --- | --- |
| `[2,4)` bar and its trace contributors | 4: F03, F04, F05, F06 | 2: F04, F06 |
| Inclusive linked `[2,4]` rows | 6: F03–F08 | 3: F04, F06, F08 |
| Difference at the excluded upper edge | F07, F08 | F08 |

This is a precise source-predicted difference between two predicates. It is not an executed defect report. The browser proof must establish the real interaction, stored filter, trace IDs, linked-row IDs, and any additional filters before classifying it. A bar count and its own trace are predicted to agree here; the suspected disagreement concerns the inclusive linked range.

**P:** inspect the final bin `[10,12]` as a control. Its count and inclusive range both include F11. Do not use a final-bin-only test as evidence that all bins share identical endpoint semantics.

**Acceptance for EB02:** record the intended user contract explicitly. If selecting a mark is intended to select exactly its contributors, all scoped and endpoint-correct sets must agree. If the current contract intentionally selects an inclusive snapped numeric range, the retained count-versus-selection distinction must be clear and successful in the task. Merely changing a test expectation is not sufficient. Any repair requires its own review and tests; it does not approve a new bin control or a global change to inclusive ranges.

### 4.3 Editing the requested count from six to three

**A:** the new automatic edges are `0,4,8,12`, with counts `6,3,2` and contributors:

- `[0,4)`: F01–F06.
- `[4,8)`: F07, F08, F09.
- `[8,12]`: F10, F11.

**S / source prediction:** a saved own histogram range `[2,4]` is re-snapped after the edges change. The lower bound 2 is exactly halfway between 0 and 4; the lower-bound tie moves outward to 0. The upper bound remains 4. The predicted saved range becomes `[0,4]`. [S6] [S7]

**A:** the selected first bar has 6 contributors; the inclusive linked rows contain F01–F08, count 8. With peer B, the first bar has F02, F04, F06, count 3, while the linked inclusive range also includes F08, count 4.

**P / UNRUN:** capture state before the count edit, immediately after it, and after any snapping effect. Record `onStateChange` emissions and undo checkpoints. Undo and redo must be tested against the actual event sequence; do not assume the count edit and automatic range rewrite form one history step. Inspect both the final settings and records after reopen.

## 5. Unequal authored edges: arithmetic comparator, not implemented capability

**P:** compare a hypothetical explicit edge list `1,2,4,6,7,8`, with `[left,right)` membership and the final interval closed. Keep underflow `x<1` and overflow `x>8` as separately inspectable tail counts. This is a proposed comparison contract, not a current explorEDA option.

**A:** underflow is F01, count 1; overflow is F11, count 1. The five finite bands contain 9 valid measurements. F12 and F13 remain separate exclusions. These tails are different from specification failures: F09 is above the specification limit but inside the finite authored domain.

| Interval / width | Count and exact contributors | Count density `count/width` |
| --- | --- | --- |
| `[1,2)` / 1 u | 1: F02 | 1 row/u |
| `[2,4)` / 2 u | 4: F03, F04, F05, F06 | 2 rows/u |
| `[4,6)` / 2 u | 3: F07, F08, F09 | 3/2 rows/u |
| `[6,7)` / 1 u | 0: none | 0 |
| `[7,8]` / 1 u | 1: F10 | 1 row/u |

The empty `[6,7)` band remains visible in this proposed definition. F10 proves that the final closed edge includes the value 8. The exact upper specification-limit ties F07 and F08 belong to `[4,6)`, even though the specification predicate `[2,4]` includes them. A specification interval and a nonoverlapping histogram partition need not have the same endpoint convention.

### 5.1 Heights and denominators

**A:** a geometric histogram with unequal numeric widths needs a deliberate height convention.

| Interval | Probability density over all 11 eligible measurements | Conditional density over the 9 in-domain measurements |
| --- | --- | --- |
| `[1,2)` | `1/11` per u | `1/9` per u |
| `[2,4)` | `2/11` per u | `2/9` per u |
| `[4,6)` | `3/22` per u | `1/6` per u |
| `[6,7)` | `0` | `0` |
| `[7,8]` | `1/11` per u | `1/9` per u |

Multiplying each height by its interval width and summing gives:

- Count density: area = 9 rows.
- All-eligible probability density: area = 9/11; the other 2/11 is in disclosed tails.
- Conditional in-domain probability density: area = 1; the denominator change must be stated.

Ordinary count heights `1,4,3,0,1` drawn at those unequal numeric widths give a total rectangular area of 16 row·u, not a count or probability. A chart can instead show equally spaced, named categorical bands with count heights; then numeric width is not encoded geometrically. This is a reason to compare upstream authored categories seriously before adding unequal histogram bins.

**P / UNRUN:** the task comparison must ask the reader to explain the denominator and both tails, then inspect all source IDs. Do not present infinite tail intervals as finite-width density bars. Do not automatically normalize away underflow/overflow, drop empty bands, or label all above-limit values as statistically defective.

## 6. Source replacement, restoration, and unchanged-edge membership

### 6.1 Separate the application branches

**S:** `DataLayerProvider.setData` resets workspace state and creates defaults when requested. When data props change without saved settings, preservation of the old histogram is not the source contract. `restoreFromStructure` reapplies saved settings to current raw rows; `restoreAnalysisFromStructure` restores both rows and settings. The provider's prop-handling branch can rebuild data and then restore supplied settings. [S11]

| Scenario | Arithmetic / source expectation | Required unrun proof |
| --- | --- | --- |
| Same rows, same saved settings | Main count-6 edges and `[2,4]` range should remain the same | Save, close, reopen; inspect filter object, contributor keys, denominator and linked rows |
| Replacement data without saved settings | Provider resets; the old selection must not be assumed to survive | Observe new charts and filters; do not treat reset as range drift |
| F11 changes 12→24, then main saved settings restored | Count-6 edges become `0,4,8,12,16,20,24`; range `[2,4]` is predicted to snap to `[0,4]` | Observe the actual settings-restore branch, effects and final rows |
| Full analysis bundle restored | Rows come from the bundle with its settings | Confirm whether the bundle contains 12 or 24 before asserting expected counts |
| Main rows reordered with saved numeric ranges | Range predicates should identify the same `record_key` sets; generated internal IDs change | Compare by `record_key`, not stored row indices; record actual ID mapping |

### 6.2 Replacement arithmetic

**A:** changing only F11 from 12 to 24 leaves the eligible denominator at 11 and leaves every specification predicate in section 3 unchanged. Count-6 automatic bins now contain:

- `[0,4)`: F01–F06, count 6.
- `[4,8)`: F07, F08, F09, count 3.
- `[8,12)`: F10, count 1.
- `[12,16)`: none.
- `[16,20)`: none.
- `[20,24]`: F11, count 1.

Counts are `6,3,1,0,0,1`. If an exact ECDF/workspace specification range `[2,4]` is restored without histogram-own snapping, its intended contributor set remains F03–F08. If the histogram's saved own range is re-snapped to `[0,4]`, the inclusive linked set becomes F01–F08. This contrast is a task hypothesis to verify in the application, not an executed comparison.

### 6.3 Width plus origin does not by itself prove stable membership

**A:** on the append variant, F11 stays at 12 and new F14 is 24. A width-2, origin-0 grid that initially ends at 12 treats F11 as a member of final-closed `[10,12]`. If that same grid simply extends to 24, `[10,12)` becomes interior and F11 moves to `[12,14)`. The measurement did not change. Stable width and origin alone therefore do not establish stable band membership under a changing final edge.

**P:** one conditional width/origin contract uses **every grid interval as `[a,b)`, including the last displayed interval**, and places the final grid edge **strictly above** the current maximum to cover every finite observation. The right-open predicate must remain part of a saved selection even when its interval was formerly the last one drawn. This differs from the final-closed convention of current automatic bins and the proposed fixed explicit-edge array. Strict upper coverage alone is insufficient if selection silently becomes inclusive. This is a proposal to test, not a decision to add a control or change current ranges. A fixed finite extent with explicit tails is another coherent contract, but costs another authored choice.

**A:** with all grid intervals right-open, strict upper coverage, width 2, and origin 0:

- Original source: edges `0,2,4,6,8,10,12,14`; counts `2,4,3,0,1,0,1`.
- Appended source: edges `0,2,4,6,8,10,12,14,16,18,20,22,24,26`; counts `2,4,3,0,1,0,1,0,0,0,0,0,1`.
- Every unchanged original observation stays in its original interval, including F11 in `[12,14)`.

The number of displayed intervals grows, and the implementation would need a finite, representable next edge. A bin cap must not silently alter the authored width. Failure to generate a valid strictly greater edge requires a visible validation decision or a rejected configuration, not an undocumented approximation.

For comparison, current automatic count-6 bins on the append variant have edges `0,4,8,12,16,20,24` and counts `6,3,1,1,0,1`. The eligible denominator is now 12; in-spec is 6/12, below is 2/12, and above is 4/12. A new observation legitimately changes shares even when unchanged-record membership is stable.

### 6.4 Saving the former terminal interval must preserve the open endpoint

**A:** independently start again from the original 13-row source, with the proposed width-2/origin-0 grid ending strictly above its maximum at 14. Select `[12,14)` and save that proposed interval predicate. It contains F11 only. Now append T01 at exactly 14; all original measurements, including F11=12, remain unchanged. Strict coverage extends the grid to 16. Its eight counts are `2,4,3,0,1,0,1,1`.

| Predicate or interval | Before T01 is appended | After T01 is appended |
| --- | --- | --- |
| Proposed saved `[12,14)` | F11, count 1 | F11, count 1 |
| New `[14,16)` band | Not displayed | T01, count 1 |
| Naively persisted inclusive `[12,14]` | F11, count 1 | F11 and T01, count 2 |

The exact difference between the persisted open and closed predicates is T01. The unchanged selected band's membership remains F11. This arithmetic exposes a second failure mode: extending the grid correctly is insufficient when the saved filter retains a different endpoint rule from the mark.

**P / UNRUN:** a future width/origin proposal needs a reviewed way to preserve right-open interval identity through selection, export, undo, restore, and source append. The current inclusive `RangeFilter` does not express that distinction merely by storing min and max. Do not simulate it by subtracting an epsilon or silently change all charts' range semantics. If the selection/restore contract remains unresolved, reject or defer the capability. This case does not change the current automatic-bin or fixed explicit-edge arithmetic above and does not establish any executed product behavior. [S9]

## 7. Integer, parsing, and representable-boundary probes

### 7.1 Integer-only source

**S/A:** after F05 is removed from the entire source, finite values are `0,1,2,2,3,4,4,5,8,12`. The integer span is `12-0+1=13`. For requested count 6, the current source calculation gives `step=ceil(13/6)=3`, `size=ceil(13/3)=5`, and starting edge `-0.5`. [S7]

| Interval / displayed integer label | Count | Contributors |
| --- | --- | --- |
| `[-0.5,2.5)` / `0–2` | 4 | F01, F02, F03, F04 |
| `[2.5,5.5)` / `3–5` | 4 | F06, F07, F08, F09 |
| `[5.5,8.5)` / `6–8` | 1 | F10 |
| `[8.5,11.5)` / `9–11` | 0 | none |
| `[11.5,14.5]` / `12–14` | 1 | F11 |

Requested count is not a promise of exactly that many rendered integer bins. A peer filter that removes F05 from live rows alone must not produce this source change.

### 7.2 Invalid-value and mode boundaries

**P / UNRUN:** verify the main fixture actually enters bin mode after the chosen loader and field preparation. Require the ECDF exclusion readout and a source-record audit to preserve one nonfinite and one missing entry. Histogram per-bin traces omit those records; they cannot establish the exclusion inventory. Separately test:

- Numeric strings accepted by `finiteNumber`, with an explicit expectation that their parsed finite values contribute.
- `NaN`, `Infinity`, and their supported text forms excluded from measurements.
- Null and blank text excluded as missing/blank according to the readout's reason contract.
- A nonnumeric string or boolean changing the field's bar-mode eligibility, rather than assuming it is merely omitted by an already-numeric bar.
- All-invalid or empty inputs as distinct states; do not infer their rendering from the mixed valid fixture.

These are classification checks. No imputation, row repair, or automatic defect labeling is proposed. [S2] [S3]

### 7.3 Numeric boundary representation

**A:** the primary boundaries and observations use integers and halves, which are exactly representable in binary floating-point. The language-only probe additionally found:

- `0.1 + 0.2` produces `0.30000000000000004`, which is not equal to the literal `0.3`.
- `4 - Number.EPSILON` evaluates to `4`; it is not a safe way to make an exclusive upper bound.
- `9007199254740992 + 1` equals `9007199254740992`; adjacent large integers need not remain distinct.
- For values `3.9999999999999996`, `4`, and `4.000000000000001`, `[2,4)` includes only the first; `[2,4]` includes the first two.

**S:** bin-edge tolerance appears in `sameRange` equality and `binInRange` whole-bin selection. `snapRangeToBins` instead uses nearest-edge distances and exact-distance ties, without that tolerance. Numeric membership and `applyFilter` use their own comparisons. A tolerance used to compare saved bounds must not be assumed to redefine measurement equality. [S7] [S9]

**P / UNRUN:** if a new boundary definition is ever considered, reject nonfinite values, nonincreasing edges after parsing, zero or negative widths, overflowing spans, and intervals whose adjacent parsed boundaries collapse to one number. Tie the unit to the measurement field and preserve the actual numeric setting, not just its rounded label. Test values one representable step below, at, and above important edges. Do not change inclusive ranges by subtracting a convenient epsilon. Any cross-chart endpoint extension needs a separate saved-filter compatibility and restore plan.

## 8. Keep scope differences separate from the first exact-edge proof

The first proof uses no local filters or facets. The following variations are necessary afterwards because a source trace and globally filtered Rows view can intentionally describe different populations. `useGetLiveIds`, `getPopulationTest`, `CrossfilterWrapper`, and the two chart renderers must be read together. [S8] [S10] [S12]

| Isolated case | Histogram `[2,4)` contributor expectation | Linked inclusive range expectation |
| --- | --- | --- |
| No peer/local/facet filters | F03, F04, F05, F06 | F03–F08 |
| Separate peer chart selects B | F04, F06 | F04, F06, F08 |
| Histogram has local population `peer=B`; no global peer filter | F04, F06 | F03–F08; local population is not automatically copied into its range filter |
| Histogram renders facet B; no global peer filter | F04, F06 | F03–F08; facet predicate is not automatically copied into the range filter |
| `localSelections=true`, no workspace filters | Own highlight may change; all-source contributor counts remain | Other views remain unfiltered: 13 raw records, 11 eligible measurements |

**P / UNRUN:** use distinct saved states for these cases so they cannot be conflated. For `localSelections=true`, a peer chart selection is also local; use an actual workspace filter if the purpose is to test a shared restriction. For a local ECDF population B, its eligible denominator is 5 and its full local x extent is derived from B; a facet-only B ECDF uses B's live curve but its `allIds` extent follows the chart's local-population contract, not automatically that facet. Bar numeric extents instead use its full column data. Record both `allIds`/all-values and `liveIds` in any planner-level proof.

A scope mismatch is not evidence that arbitrary bin boundaries are needed. Resolve whether the compared surfaces are intended to share the same population before treating unequal numbers as a consistency failure.

## 9. Proposed proof sequence and stop conditions

### P0 — Local trust first (EB02, prerequisite to all later product acceptance)

**UNRUN:** select one ordinary category in an existing example, compare bar, metric card, and exported row keys, then undo, redo, and reopen. Stop at a disagreement and preserve the exact state and reproduction. This is the already-prioritized local-trust task, not a new broad survey. It prevents a new capability argument from absorbing a general selection or persistence problem.

### P1 — Source and pure planner expectations

**UNRUN:** in Codex's actual checkout, confirm the baseline and source signatures. Run the current targeted tests before adding any new tests. Then add only the discriminating fixture cases needed to prove current behavior in `bins.test.ts`, `barPlan.test.ts`, `applyFilter.test.ts`, and `ecdfPlan.test.ts`. If code at the integration branch differs, reconcile expectations and record the changed commit; do not force the pinned conclusion onto changed source.

Pass conditions: exact per-bin contributor sets, sum of eligible counts, final-edge inclusion, grouped denominator arithmetic, and specified exclusion classifications. A failure of the expected current behavior is evidence to investigate, not automatic permission to repair or extend it.

### P2 — Existing histogram selection and linked rows

**UNRUN:** in the actual component/provider integration, capture a click and brush separately, inspect the stored range, trace the chosen mark, and compare linked table/export keys. Add peer B only after the no-scope case is understood. Use the known six-bin and three-bin expectations. Confirm the final-bin control and exact upper ties. Existing `BarChart.select.test.tsx` can inform interaction setup but does not replace this cross-surface proof.

Stop if the event did not reach the expected mark, a hidden filter is present, the field entered category mode, or the source population differs. Preserve those observations rather than calling the predicted numeric difference an executed defect.

### P3 — Count edit, restoration, and source changes

**UNRUN:** run the count-6→3 edit, same-source restore, replacement-with-settings, replacement-without-settings, full-analysis restore, append, and reorder branches separately. Preserve `record_key` maps, settings before/after, and emitted state changes. Verify export keys and reopening after the application has settled. Do not assume a saved range represents a fixed engineering limit if the histogram effect changes it.

### P4 — Scope and numeric edge coverage

**UNRUN:** execute the isolated local/facet/local-selection cases in section 8; test the integer-only source and parsing probes. Test representable boundaries only to resolve a proposed contract's concrete risk. Do not grow this into an unrelated numeric compatibility framework.

### P5 — Task comparison and reopening gate (EB04)

**UNRUN:** recruit a named task owner with actual recurring measurement deliveries and two declared specification limits. Observe at least two source refreshes and one later revisit. Keep units, valid-row eligibility, groups, endpoint policy, and required output fixed for the comparison.

Compare these five alternatives on the same task:

1. Current histogram plus a focused lesson.
2. Current ECDF and exact range-filter controls.
3. Upstream authored categorical bands.
4. A proposed width-plus-origin contract, only if the required bands form a regular lattice.
5. A proposed explicit edge list, only if irregular intervals materially change the task.

For each, record exact answers and contributor keys, denominator explanation, setup actions, repeated reconfiguration after refresh, time against a user-accepted budget declared beforehand, and ability to inspect/export the rows. Give instruction time consistently; do not compare a polished prototype against an unexplained current feature.

**GO to consider a bounded proposal, not implementation:** a named owner identifies a material recurring burden; the best current comparator either cannot produce a required repeated output or needs at least one recurring manual reconfiguration step per refresh that the candidate removes; all membership and denominator answers remain correct; the owner accepts the measured improvement. The candidate must also have a coherent endpoint, tail, selection, source-change, and saved-state contract.

**NO-GO / retain current controls:** the best current comparator is equally accurate and workable within the accepted budget; the task occurs only in the synthetic fixture; the benefit is only competitor parity; width/origin would require silently moving boundaries; explicit edges would require a general editor; or unresolved selection/restore ambiguity remains. A small task study does not establish general market demand.

## 10. Conditional documentation and runnable-example milestone (EB03)

**P:** create no new chart documentation system. Existing bar and ECDF pages and live examples are already delivered. A lesson milestone is conditional on the named-task comparison or current proof identifying an explanation gap that affects a real reader. Its scope is one explanation and one runnable fixture together, after behavior is reconciled. [S13] [S14] [S15]

The same milestone would:

- Update `apps/demo/src/docs/pages/bar.mdx`, existing **Selection and row scope** and **Settings and limits** sections, with the verified distinction between bin intervals, snapped inclusive ranges, and row scope, including how a bin-count edit affects the histogram's own selected range.
- Update `apps/demo/src/docs/pages/ecdf.mdx`, existing **How it reads** section, and add the proposed section **Specification thresholds and exact ties**. Explain inclusive limits, eligible-row denominators, exact ties, and source inspection using the accepted current behavior.
- Add one proposed focused live-example ID `engineering-thresholds` to `apps/demo/src/docs/live/examples.ts`, paired with `apps/demo/public/datasets/engineering-thresholds.csv` and existing runnable-demo plumbing. The dataset must carry `record_key`, `x`, and `peer` and reproduce this fixture after loading. If CSV parsing changes the `NaN` token into a missing value, resolve the fixture's loader representation before publishing; do not quietly claim the nonfinite check passed.
- Preserve existing `bar-histogram` and `ecdf` examples. Their current registrations already provide the relevant entry points; the new focused example is optional and proposed, not delivered here.
- Script exact expected row counts and key comparisons, peer B, threshold ties, source inspection, and the accepted restore contract. If the demo registry needs a new dashboard example, pair its `examples.ts` and coverage registration in that same milestone under the existing agent-guide rules.

**Acceptance:** a reader can recover 6/11 in-spec, identify F03–F08, explain why the repeated ties matter, identify the two excluded entries, and distinguish a display interval from an engineering specification. Verify the paired page/example at 1280, 783, and 390 CSS pixels with the existing docs/browser workflow. Internal unresolved concerns belong in research or intent documents, not user-facing caveat lists.

**Rejection:** do not add the lesson/example if the current documentation already enables the task or no named reader needs it. If the proof reveals a consistency repair, keep that repair's scope separate from EB03 and from a bin-control proposal. If a future capability is eventually approved, its exact docs section and runnable example belong in the same capability milestone, not a later cleanup.

## 11. Codex run sheet — all commands below are UNRUN

Run only in the authorized actual checkout after Codex has reconciled this research. This is a proposed verification sheet, not an instruction to install a checkout or mutate the repository in this research session. The broad check is run once when the eventual reviewed change requires it; there is no reason to execute it repeatedly for this arithmetic package.

```bash
# Existing targeted baseline checks supplied by the research prompt.
pnpm --filter exploreda exec vitest run src/components/charts/BarChart/bins.test.ts src/components/charts/BarChart/barPlan.test.ts src/components/charts/Ecdf/ecdfPlan.test.ts

# Bounded endpoint and selection checks, when Codex prepares the current-contract proof.
pnpm --filter exploreda exec vitest run src/hooks/applyFilter.test.ts src/components/charts/BarChart/BarChart.select.test.tsx
pnpm --filter exploreda check-types

# Only for an accepted docs/example milestone.
pnpm --filter demo docs:check
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo build
pnpm --filter demo docs:verify

# Once, at the appropriate review gate for an eventual authorized change.
pnpm check
pnpm check:pr
```

Use the repository's shared test timeout configuration and existing browser tooling. [S16] The packet does not contain runnable dependency resolution or a browser state. If a future proof is blocked, the smallest missing dependency is the relevant checkout/component fixture and its actual loader/provider wiring, not a new broad source survey. If evidence contradicts the packet, request the changed exact file/commit before deciding behavior. No new control is approved by this proof plan or by a passing test command.

## Source references

All source references below are pinned to baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. The source packet was supplied on 2026-10-21; supplementary sources were read at the same pinned ref on 2026-10-21. Line numbers are supporting navigation, while file and symbol names identify the contract.

[S1]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/lib/dataLayerState.ts#L7-L21 "initializeData assigns __ID=index"
[S2]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts#L15-L113 "isMissingValue, parseNumber, isNumberLike, numericExclusionReason, finiteNumber"
[S3]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.ts#L169-L291 "isNumericBarField and binRows"
[S4]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts "buildSteps, shareAt, countInRange, idsThrough, planEcdf, thresholdFilter"
[S5]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx "chartFilterFields exposes the field after an ECDF selection"
[S6]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx#L279-L369 "brush, click-bin range and effect-driven re-snapping"
[S7]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts "numericBins, snapRangeToBins, binInRange and sameRange"
[S8]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx "useGetLiveIds and useGetAllIds"
[S9]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts#L10-L37 "inclusive numeric range predicate"
[S10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts "own/peer dimensions, localSelections and local population application"
[S11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx "setData, saveToStructure, restoreFromStructure, restoreAnalysisFromStructure and prop synchronization"
[S12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts "getPopulationTest and restrictToPopulation"
[S13]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/live/examples.ts "delivered bar-histogram at lines 112–135 and ecdf at lines 378–384"
[S14]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/bar.mdx "delivered bar documentation and Selection and row scope section"
[S15]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/ecdf.mdx "delivered ECDF documentation and How it reads section"
[S16]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md "test limits, docs/example integration and browser verification"

[S17]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx "ColumnFilter.updateRange and At least / At most numeric inputs"
