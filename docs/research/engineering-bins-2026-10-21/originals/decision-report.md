# Engineering histogram boundaries: decision report

**Decision date:** 2026-10-21, America/Indianapolis.  
**Repository:** https://github.com/byronwall/explorEDA  
**Source baseline:** `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.  
**Intended Codex integration branch:** `codex/engineering-bins-research-2026-10-21`; not checked out or modified.  
**Disposition:** Research complete; retain current controls and defer authored histogram boundaries. Four recommendations, **EB01–EB04**. No product implementation is authorized.

## 1. Decision and its basis

**Keep count-based histograms for distribution exploration. Use existing ECDF and exact numeric ranges for inclusive specification questions, and upstream authored categories when strict tail membership or named bands are required. Do not add width/origin or an explicit edge list on the evidence available.**

The supplied R008 candidate describes a plausible engineering task, but supplies no named analyst, observed repeated failure, or executed defect. The current source already supports threshold shares, inclusive range counts, contributor tracing, and an editable exact numeric range after an ECDF selection. That makes retaining current controls a substantive solution, not a placeholder. A no-work deferral is also acceptable if no task owner appears. A focused lesson is conditional on observed confusion; it is not a commitment to expand documentation merely because research was commissioned. [S07, S18–S24, H01]

There is a separate current-consistency question. Histogram bins and their traces use half-open intervals, except for the final closed bin, while histogram clicks and brushes create an inclusive numeric range. A small fixture predicts a four-row bar with six linked rows because two records equal its upper edge. This prediction warrants a bounded local proof after the existing trust task. It is **not an executed runtime defect**, and repairing it would not establish demand for new bin controls. [S01–S03, S06–S09]

Four recommendations support one direction:

| ID | Disposition | Immediate consequence |
| --- | --- | --- |
| **EB01** | Retain current controls; defer authored boundaries | No new histogram setting, density mode, or persistence contract. |
| **EB02** | Prove the current contract independently | Local trust first, then exact-edge count/trace/linked-row checks; any confirmed repair is separate. |
| **EB03** | Add a focused lesson only if needed | Update existing sections and one paired runnable example in the same conditional milestone. |
| **EB04** | Reopen only for a named repeated task | Compare all existing routes before choosing at most one small capability. |

### Evidence labels

- **[S] Source fact:** Read in the authenticated packet or a pinned repository file. It describes code, not a successful execution.
- **[E] External fact:** Read in current primary documentation; URLs and retrieval dates appear in the evidence report.
- **[A] Arithmetic:** Independently calculated fixture results. No explorEDA module or browser was executed.
- **[I] Inference:** A conclusion drawn from the sources or arithmetic.
- **[P] Proposal:** A future test, lesson, acceptance rule, or conditional contract.

These labels apply throughout. Recommendation scores are judgments, not measurements of user performance.

## 2. Access gate and execution boundary

**Research access: GO. Runtime acceptance and capability implementation: NO-GO.**

- All **34 packet entries** matched their declared UTF-8 byte counts and SHA-256 values: 30 baseline files, two local additions, and two historical documents at separately supplied commits. The whole packet is 299,953 bytes; its SHA-256 is recorded in the evidence report.
- The declared baseline was identified through GitHub's read-only API. A separately retrieved `bins.ts` matched the packet byte for byte. Narrow supplemental reads supplied the missing column helper, Crossfilter wrapper, traces, save validator, numeric filter UI, row identity initializer, and live-example definitions. These reads remove the decisive source-access gaps for this recommendation. [S01, S10–S17, S21–S26]
- Initial public web opens of GitHub/raw URLs returned `DisabledError`. The read-only GitHub connector then succeeded. This is not evidence that files are absent from the repository.
- Packet hashes authenticate the delivered entries against their declarations. They are not, by themselves, an independent attestation of every entry's Git provenance. The sampled baseline match and supplemental API blob checks are separate evidence.
- The packet is not a runnable checkout. No application tests, type checks, builds, browser interactions, export/undo/reopen flows, or usability sessions were run. The arithmetic and file-integrity checks are the only executed proofs.
- No application code, repository branch, worktree, PR, merge, deployment, paid service, or account configuration was changed. The four reports are new research artifacts; the attached originals remain unchanged.

If Codex later cannot access a dependency needed for an execution proof, stop that proof and request the exact pinned file or runnable baseline plus its existing lockfile/test configuration. Do not substitute reconstructed snippets for an application run. No further access request is needed to support the present retain/defer decision.

## 3. Ranked question 1: what engineering decision is blocked?

### T1 — one repeated decision to test, not established demand

**[P] Candidate task:** At each measurement-file refresh, a technician reviews a declared population of measured parts, reports how many measured values lie below a supplied lower specification limit, within the inclusive limits, or above the upper limit, compares two production groups, and inspects the exact records requiring review. The technician saves the analysis and repeats it on a later source. One row must mean one measurement of the same quantity in the same unit.

For the synthetic proof, use `measurement` in an illustrative unit, lower limit **2**, upper limit **4**, and acceptance predicate **2 ≤ x ≤ 4**. The action is to identify records for review. It is not an automated defect label, batch-release decision, capability estimate, or safety assurance.

The required outputs are concrete:

- Counts and record keys for `x < 2`, `2 ≤ x ≤ 4`, and `x > 4`.
- The denominator of valid measurements, plus separate missing and invalid counts.
- The same results for groups A and B, with each group's denominator visible.
- Stable literal specification limits after save/reopen and an explicitly declared source-replacement path.

**No supplied evidence shows T1 defeating current controls.** The source and arithmetic instead identify workable comparators:

| Comparator | What it can answer | Limit that must remain visible |
| --- | --- | --- |
| ECDF plus exact numeric range | Inclusive limits, threshold shares, repeated ties, range counts and row selection | Gesture snapping uses observed values. Create a selection, then edit its bounds in Filters for unobserved limits; browser proof remains unrun. |
| Current inclusive ranges | Exact `min ≤ x ≤ max`, including ties | A numeric histogram's own range is resnapped to bin edges. Do not use that owner for a fixed specification promise. |
| Upstream authored categories | Exact `<L`, `[L,U]`, `>U` classification and tail-row inspection | Requires a maintained preparation rule and preserved source key. Categories absent from the entire source are not automatically materialized as zero-count bars. |

The ECDF can derive strict tail **counts** by complement among valid values: below-L = N − count(x ≥ L); above-U = N − count(x ≤ U). Current min/max filters have no strict comparison or OR-union field. Therefore, do not claim that one range selects both strict tails. Upstream categories remain a real alternative for their exact row selection. Do not manufacture strictness by subtracting an epsilon. [S08–S09, S18–S24]

### Rejection comparator

**[P] Reject new histogram controls if the named owner can obtain the exact counts, contributors, and declared denominators using the best current route, preserve the task through refresh/reopen, and finish within a time budget the owner accepts before the comparison.** If a lesson resolves the problem, prefer that. If upstream categories are already maintained, include their actual ongoing cost rather than treating preparation as free or disqualifying it automatically.

A possible distinct task is repeatedly comparing distribution shape in a fixed grid, or inspecting several irregular semantic bands simultaneously while preserving empty intervals. Current automatic bins may be unsuitable for that requirement. It remains a hypothesis: no supplied task owner, recurrence, or failed comparator establishes it. Do not upgrade T1 into this more favorable task to justify a feature.

### Analytical boundaries

| Question | Appropriate meaning | What histogram boundaries do not establish |
| --- | --- | --- |
| Supplied specification limits | An externally chosen acceptance rule and observed record counts | A probability guarantee about future production. |
| Distribution shape | Location, spread, skewness, modes and gaps in observed data | That a convenient bin edge is an engineering limit. |
| Process control | Time-ordered monitoring against a process model | A histogram discards observation order and does not establish control. |
| Statistical tolerance interval | An estimated interval covering a population proportion at stated confidence | It is not a synonym for an engineer's supplied limits. |
| Capability or inference | A model-based claim with sampling/process assumptions | A 13-row synthetic fixture cannot establish capability or analyst demand. |

**[E]** NIST explicitly distinguishes prescribed engineering tolerances from statistical tolerance intervals, and describes control and capability as separate analyses. [E06–E09] These distinctions bound the research; no process-control platform is proposed.

## 4. Ranked question 2: current analytical contract

All rows below are **[S]**, except where a consequence is marked **[I]**. Every UI/runtime acceptance remains **unrun**. Symbols refer to the pinned baseline through the source links at the end.

| Contract area | Current source contract | Practical consequence / remaining proof |
| --- | --- | --- |
| Automatic source extent | `numericBins` uses min/max of finite `all`; `SingleBarChart` calls `useGetColumnDataForIds(settings.field)` without IDs, which returns the whole column. [S01, S03, S11] | Geometry uses global source values, including when peers, chart-local filters or facets narrow counts. |
| Count setting | `numericBins` rounds and clamps to 2–100. `BarChartSettingsPanel` exposes 2–50, step 1. Default `binCount` is 20; planner uses `settings.binCount || 20`. [S01, S04–S05] | Requested count and rendered integer-bin count can differ. No width, origin or edges setting exists. |
| Integer treatment | With all finite values integral: span = high−low+1, step = ceil(span/requested), size = ceil(span/step), first edge = low−0.5. [S01] | One fractional source value changes the mode. A peer filter removing that value does not change the full-source test. |
| Fractional and constant values | Fractional data divide source extent into requested equal widths; a constant noninteger gets ±0.5 padding. No finite extent produces no bins. [S01] | Full-source extremes can move every automatic edge. |
| Membership | `numericBins` and `binRows` use floor-based indexing and cap at the last bin: interiors `[a,b)`, final `[a,b]`. [S01–S02] | Repeated values at an interior edge enter the following bin. Decimal arithmetic requires its own check. |
| Count / contributors / trace | `binRows` constructs `value`, `rowCount`, and contributors. `resolveBarTrace` returns the planned mark; `BarTraceBody` lists its contributors and closure. [S02, S06–S07] | The intended trace follows the same plan. Count and member indexing are separate calculations and need parity checks at difficult numeric boundaries. |
| Empty bins | `numericBins` creates all bins before assigning values; `binRows` keeps empty contributor arrays. [S01–S02] | Zero bins persist geometrically. A minimum-height drawing target is not a positive count. |
| Missing / invalid measurements | `finiteNumber` excludes nonfinite or nonnumeric inputs; `isMissingValue` identifies null, undefined and blank text. ECDF uses `numericExclusionReason`. [S14, S18] | Histogram invalids are discarded before per-bin membership; do not promise every omitted row appears in a bin trace. |
| Field mode | `isNumericBarField` needs one finite value and every nonmissing source value to be `isNumberLike`, absent categorical/forceString/aggregate modes. [S02, S14] | Accepted `"NaN"` text preserves numeric mode but is omitted. Raw `"bad"` or a boolean can make the whole chart categorical. |
| Shared numeric endpoints | `RangeFilter` has optional min/max, no closure flags; `applyFilter` uses finite values with `>= min` and `<= max`. [S08–S09] | Inclusive range semantics are broader than histogram membership. Changing them globally would change other consumers. |
| Histogram click | `selectBinAt` stores the bin's start/end as a numeric range; a matching second click clears it. [S03] | **[I]** Interior upper-edge ties can be linked even though the clicked bin omits them. |
| Histogram brush | `handleBrushChange` calls `snapRangeToBins`; nearest edges win, exact-distance ties move outward, and a collapsed range expands around its midpoint bin. [S01, S03] | Ordinary snapping can shrink a range. It is not an unconditional outward expansion. |
| Own selection | Crossfilter group context excludes its own dimension's filter. `binInRange` controls whole-bin emphasis; selected-bin status sums selected bars. [S01–S03, S13] | Own context counts remain available while linked views narrow. Compare like scopes before asserting a mismatch. |
| Peer / workspace scope | `CrossfilterWrapper` creates chart and workspace dimensions; `useGetLiveIds` retains positive live items after the other predicates. [S10, S13] | Peers and workspace filters narrow counts, while histogram geometry remains global-source based. |
| Chart-local scope | `getAllData` applies `getPopulationTest`; `restrictToPopulation` ANDs local filters. [S12–S13] | Local population restricts displayed rows but is not automatically added to the chart's linked selection predicate. |
| Facet scope | `useGetLiveIds` intersects a nonempty facet ID array; `SingleBarChart` still reads the whole source column. [S03, S10] | A clicked facet emits a numeric range, not an additional facet predicate. Empty-facet construction was not fully audited. |
| Local-selection mode | `CrossfilterWrapper.updateChartFilters` clears chart dimensions when `localSelections` is true; workspace predicates remain. [S13, S15] | The primary linked proof must declare `localSelections=false`. |
| Bin-count edits | `SingleBarChart` effect snaps the first own-field range to newly computed edges and calls `updateChart` when `sameRange` differs. [S03] | Literal selection bounds can change after a count edit. Source predicts additional callback activity; actual undo granularity is unrun. |
| Numeric tolerance | `edgeTolerance` is source edge span × 1e−9; `binInRange` and `sameRange` use it. Membership and `applyFilter` do not. [S01, S08] | It is selection-comparison tolerance, not a measurement tolerance or a valid way to encode strict specification limits. |
| Save representation | `toSavedChart`/`toRuntimeChart` pass non-3D settings through; `saveToStructure` stores charts. `isFilter` validates finite bounds; the bar validator accepts finite optional count. [S15, S17] | Count and range settings persist. An edge array does not. Validator acceptance alone does not imply the UI's 2–50 restriction. |
| Restoration | `restoreFromStructure` applies saved settings to current raw data; `restoreAnalysisFromStructure` rebuilds data and filters. [S15] | Rendering can then resnap a restored histogram range. A round trip on unchanged source is a different test from new-source restoration. |
| Source replacement | Provider data-reference handling calls `setData`; without supplied saved settings it resets charts/settings, while the savedData path reapplies that supplied snapshot. [S15] | Preservation depends on the host path and snapshot captured. Do not promise latest edits survive any replacement. |
| Record identity | `initializeData` assigns `__ID=index` on every initialization, overriding an input `__ID`. [S16] | Use a separate stable source key after reordering; internal numeric IDs are not durable membership. |
| ECDF population | `EcdfChart` uses live IDs and `useGetAllIds(settings)`; local filters restrict its all-ID X domain, while peers/facets additionally restrict live rows. `makeCurve` uses each group's valid count. [S10, S18–S19] | Its overall curve means all valid live context rows, not an unfiltered named reference population. |
| ECDF ties and ranges | `buildSteps` groups ties; `shareAt` and `idsThrough` implement at-or-below/at-or-above; `countInRange` includes both endpoints. [S18] | At-or-above U includes U ties. Do not label it strictly above U. |
| ECDF exact entry | `snapToValue` targets observed values. Existing selections become fields in `chartFilterFields`; `ColumnFilter.updateRange` accepts finite typed At least/At most bounds. [S18–S24] | Exact unobserved limits are source-supported through Filters after selection, not by the pointer gesture alone. High-precision input display/round-trip remains unrun. |

### Scope equality is a prerequisite to a consistency proof

Let S be source rows, W workspace filters, Cᵢ chart selections, L local population, and F facet membership. In normal linked mode, a histogram's counts and trace use:

`S ∩ W ∩ all peer Cᵢ ∩ L ∩ F`

The histogram's own selection controls its emphasis and other views. Globally selected rows use:

`S ∩ W ∩ all Cᵢ`

Its local/facet predicates are not automatically part of its emitted selection. The first endpoint check therefore uses no local filter or facet; later checks deliberately test their different scopes. The ECDF also keeps its own context and per-curve valid denominators. [S10–S13, S18–S20]

## 5. Ranked questions 3 and 4: alternatives and boundary obligations

### Five alternatives, scored for T1

**[I] Scores are source-informed semantic judgments, not an executed usability comparison.** Each vector is **A/S/R/I/M**: decision accuracy, setup ease, repeatability, row inspection, maintenance ease. Scale 1–5; higher is better, including lower effort/burden. There is no weighted total. Correctness and acceptance gates override small score differences.

| Alternative | A/S/R/I/M | Rationale and cost |
| --- | --- | --- |
| No change plus a focused lesson | **4/4/4/4/5** | Reuses delivered features. Conditional editorial/example maintenance; a no-work deferral is valid if no observed confusion warrants it. |
| Current filters / ECDF | **5/4/4/5/5** | Strong exact inclusive predicate and denominator fit. Source supports editing limits; discoverability, refresh path and numeric round-trip need proof. Strict tail selection needs another route. |
| Upstream authored categories | **5/2/5/5/4** | Explicit rules encode both inclusive limits and strict tails. Preparation owner must maintain units, rule version, labels and source keys. Unobserved categories need an explicit zero-band policy. |
| Width plus origin | **3/3/4/3/3** | Good candidate for a genuinely repeated equal-grid task. Does not itself encode inclusive specification acceptance; adds validation, save/restore, extent growth and selection work. |
| Explicit edge list | **3/2/4/3/1** | Can represent irregular numeric bands, but introduces editing, closure, tails, density and persistent-selection decisions. A cut at U still does not encode inclusive [L,U]. |

New-mode repeatability and inspection scores are conditional on solving the proposed contract. They are not delivered capabilities. If the actual named task is regular half-open band counting rather than T1, the scores must be reassessed; this report does not invent that demand.

### What the primary comparisons establish

**[E]** D3 supports internal thresholds plus a domain; NumPy supports a complete edge array. Both document lower-inclusive interiors and a closed last bin. R's default interiors are right-closed and its counting includes a numerical fuzz policy. Vega-Lite exposes exact `step` and `anchor`; its public bin page does not fully settle endpoint/overflow behavior. Observable Plot separately documents empty-bin and threshold-array choices. These are different contracts, not one industry convention. [E01–E05]

**[I]** They demonstrate feasible API designs and maintenance choices. They do not establish analyst demand, competitor-driven priority, or implementation approval. The evidence report supplies direct URLs, retrieval dates, and limits for five primary-source families plus NIST.

### Reference contract for any future bounded candidate

The following are **[P] conditional test contracts**, not settings to implement now. They make the alternatives reviewable and expose why two inputs are more than a cosmetic change.

| Issue | Resolution for comparison | Rejection / maintenance implication |
| --- | --- | --- |
| Specification ties | Keep supplied acceptance `[L,U]` separate from histogram partition rules. Use exact inclusive ranges or authored categories for that predicate. | Do not label the band beginning at U as strictly above U. Do not solve the mismatch with epsilon-adjusted limits. |
| Width and origin | Width must be finite and positive; origin is a finite lattice anchor, not necessarily the minimum. Use a grid `origin + k×width`. For automatic covering extent, the final edge must be strictly greater than the greatest finite source value, and every width-grid interval uses `[a,b)`, including the terminal interval. | A former closed maximum can change bands after extension; a saved closed terminal selection can also admit newly appended edge ties. Strict coverage plus uniform half-open closure avoids those two problems. Validate generated edges for finiteness and strict increase. |
| New extremes with a width grid | Extend the same grid; retain interior cuts and literal selected predicates. Do not silently coarsen width. Use a bounded candidate limit of 100 rendered bins, subject to task validation. | If a refreshed source exceeds the budget or cannot produce distinct finite edges, preserve settings and expose a non-renderable state with rows still available elsewhere; reject the candidate if this occurs in ordinary use. |
| Explicit edges | A complete finite, strictly increasing list defines a fixed extent. Interiors are `[a,b)` and the final finite bin is `[a,b]`. Retain the list on source replacement. | Reject duplicate, decreasing, nonfinite, or numerically collapsed edges. A limit matching 100 finite bins bounds the experiment; no general editor. |
| Underflow / overflow | For fixed explicit extent, report separate `< first edge` and `> last edge` counts and source keys. Last-edge ties belong in the last bin. Keep invalid/missing outside both tails. | Never silently drop extremes or fold them into the nearest band. Tail categories are counts, not infinite-width density bars. |
| Empty bands | Retain every defined numeric interval with count zero and an empty contributor list. Upstream categorical bands retain filtered-out source categories but may omit categories absent from the full source. | If permanent empty-band visibility is a real requirement, explicitly test the category comparator; do not create fake observations to force zero bars. |
| Unequal widths and heights | Prefer categorical count bars for semantic bands. If a numeric-width histogram is necessary, choose and label count height, count per unit, or probability density. For the comparison default, probability density uses all valid context rows, with tails disclosed. | Do not interpret unequal-width rectangle area as count when height is raw count. Never normalize silently to only in-range values. A new density mode is additional scope, not assumed. |
| Denominator | Use finite rows after declared peer/workspace/local/facet scope; per-group comparisons use that group's finite count. Show N, excluded count, and tail count. | No weighting, inferred population rate, or named reference system. |
| Row inspection | Every bin/tail exposes exact source keys, its predicate, raw values and inclusion rule; compare to linked row predicate under the same scope. | Require count = contributor cardinality. Scope differences must be disclosed, not hidden by a total. |
| Selection persistence | A new bin-origin selection must save literal bounds and closure explicitly. Existing generic ranges remain inclusive. A dedicated selection representation or opt-in closure contract needs separate design review. | Do not silently reinterpret existing saved ranges or default all charts to exclusive maxima. This is a capability gate, not an approved schema change. |
| Editing a definition | In a candidate authored mode, clear only that chart's bin-origin selection when its definition changes, in one undoable operation; explicitly disclose the clear. Keep independent threshold predicates independent. | Avoid current-mode resnapping being inherited accidentally. This requires knowing selection origin and history behavior. |
| Restoration / source identity | Persist the definition and its semantic selection, re-evaluate against the new source under the host's declared restore path, and audit stable record keys. | Do not store positional IDs as durable bins. An unchanged predicate can legitimately match a different set of new rows. |
| Units | Store/interpret boundaries in the measured field's data units. Require a declared conversion or re-authoring when the quantity/unit actually changes. | Formatting a unit label is not a value conversion. No automatic unit guesses or unit framework. |
| Representable numbers | Require distinct finite binary64 boundaries and use round-trip-safe numeric editing. Test exact fractions separately from nearby decimal values and very large magnitudes. | Reject a requested distinction that the numeric representation collapses. `Number.EPSILON` is not a universal spacing; selection tolerance must not redefine acceptance. |

The count/density distinction is quantitative. With proposed edges `[1,2,4,6,7,8]`, counts are `[1,4,3,0,1]`; widths are `[1,2,2,1,1]`. Count per unit is `[1,2,1.5,0,1]`. Dividing again by all 11 valid observations gives area 9/11, with one underflow and one overflow. Dividing by only the nine in-range observations gives area 1 and answers a conditional question. The proof plan, section 5, works both cases exactly. **[A]** These synthetic results were calculated independently; they are not data from an external reference.

## 6. Ranked question 5: the smallest discriminating proof

The primary fixture has **13 rows**, including 11 finite measurements, two repeated values at each specification limit, one fractional value, one extreme, one invalid `"NaN"` string and one missing value. It has stable keys F01–F13 and peer groups A/B. Every row and expectation is printed in `proof-plan.md`; no executable fixture is required to read the research.

**[A] Independently worked expectations:**

- Six automatic bins on `[0,12]` have counts **2, 4, 3, 0, 1, 1**. The `[2,4)` contributors are **F03, F04, F05, F06**.
- Inclusive specification `[2,4]` has **six** contributors: **F03–F08**. Strictly below are F01/F02; strictly above are F09/F10/F11. Valid denominator is **11**, not 13.
- An own brush from 2.2 to 3.6 snaps to `[2,4]`. The bar count is four; the inclusive range predicate matches six. This is arithmetic combined with a source prediction, not a browser observation.
- Under peer B, that bar has two contributors, while inclusive `[2,4]` has three. The full-source edges remain unchanged.
- Changing count 6→3 makes edges `[0,4,8,12]`; the saved minimum 2 is exactly between 0 and 4 and snaps outward to 0. The first bar has six contributors, while inclusive `[0,4]` matches eight.
- Replacing the extreme 12 with 24 and reapplying saved settings moves automatic edges to `[0,4,8,12,16,20,24]`; it can trigger the same bound movement. A bare data replacement that resets charts is a different source path.
- Appending a new extreme while retaining the old maximum exposes the closed-final-edge problem for a naive width grid. A strict covering upper edge avoids that particular membership drift; uniform half-open width-grid intervals also keep a formerly terminal selection from acquiring a new edge tie. This is a derivative probe, not extra evidence of demand.

The fixture's fractional row is essential: removing it from the **source** produces integer-centered spacing and fewer than six bins. Filtering it out only from the live peer population does not. Invalid text `"bad"` belongs in a separate mode test because it can make the bar categorical. **[S, A]** [S01–S03, S14]

Arithmetic proves expected sets and values. Runtime must still establish that the real planner, trace, click/brush, filters, state changes, export and restoration produce them. Browser checks must then establish actual interaction and disclosure at 1280, 783 and 390 px. The proof plan marks every such check **UNRUN** and gives the existing pnpm run sheet without claiming execution.

## 7. Ranked question 6: four recommendations and falsifiable gates

### EB01 — retain current controls and defer authored boundaries

- **Task:** T1, exact repeated specification review.
- **Evidence:** Existing inclusive ECDF/range functions and editable bounds; no named task failure supplied. Historical R008 explicitly permits rejection of another control. [S18–S24, H01]
- **Alternatives considered:** No work; focused lesson; current filters/ECDF; upstream categories; width/origin; explicit edges.
- **Benefit:** Preserves a smaller analytical contract and gives the candidate task an available route.
- **Cost:** Existing discovery and exact-entry workflow can require several steps. Hosts still need to handle refresh and saved settings correctly. Deferral may leave a real multi-band task underserved until observed.
- **Confidence:** High that a feature is not yet justified; moderate that the current UI will be workable for a named user, because usability and browser execution are unrun.
- **Falsification:** A named owner repeatedly cannot obtain required correct outputs, or pays an accepted-as-material recurring cost after the current comparators have been tried correctly.
- **Gate:** GO for retaining behavior. NO-GO for new controls until EB04 and the selection/restore contract pass. A candidate's existence or a competitor option does not meet the gate.

### EB02 — prove current consistency before considering capability

- **Task:** First the existing category-selection/bar/card/export trust task, then the exact-edge histogram fixture.
- **Evidence:** Current-analysis-trust names the local proof as first; source separates half-open membership from inclusive ranges. [S01–S03, S08–S13, H02]
- **Alternatives considered:** Accept documented behavior without execution; change all numeric endpoints; add bin controls; investigate one bounded disagreement. Choose the bounded proof.
- **Benefit:** Establishes what users can trust today and prevents a consistency concern becoming an unearned feature justification.
- **Cost:** One baseline integration fixture and real interaction/restore checks. If reproduced, the repair choice may touch selection disclosure, a histogram-specific selector, serialization or shared consumers. The research does not choose that repair before observation.
- **Confidence:** High in the source-level concern and the fixture's expected sets; runtime occurrence and intended UX resolution are unverified.
- **Falsification:** Under matching scopes the real mark, contributors, predicate and linked rows agree with the documented contract, or the perceived discrepancy is fully explained by declared scope and disclosed interval semantics.
- **Gate:** GO for a Codex-owned proof after local trust. Record any reproducible disagreement precisely. NO-GO for calling it an executed defect here, or silently changing global range inclusion. Any confirmed repair gets independent scope and review.

### EB03 — conditional focused lesson with its runnable example

- **Task:** Help a named user distinguish shape bins, inclusive specification thresholds, strict tails and valid denominators.
- **Evidence:** Bar and ECDF docs and live examples already exist; current exact-entry workflow is spread across chart interaction and Filters. [S22–S26]
- **Alternatives considered:** No doc change if users succeed; a focused existing-page lesson; a new broad tutorial; a new control. Prefer no change or the focused lesson.
- **Benefit:** May remove a task error at lower ongoing cost than a new saved analytic definition.
- **Cost:** Editorial maintenance, one small example's fixture/expected values, docs verification, screenshots and accessibility checks. This is nonzero work and remains conditional.
- **Confidence:** Moderate in the teaching content; low in unobserved need or effect on time/errors.
- **Falsification:** Users already complete T1 accurately, or the focused explanation does not resolve the observed error.
- **Gate:** Only after EB02 and observed confusion. In one milestone, update `bar.mdx` **Selection and row scope** / **Settings and limits**, and `ecdf.mdx` **How it reads** plus a proposed **Specification thresholds and exact ties** section, paired with a focused runnable example registered in `apps/demo/src/docs/live/examples.ts`. The proof plan specifies the optional `engineering-thresholds` example and validation. Existing `bar-histogram` and `ecdf` examples remain delivered; this is not their initial creation.

### EB04 — one named-task comparison before reopening a capability

- **Task:** A named repeated decision over at least two source refreshes plus a revisit, with units, row grain, strict/inclusive rules, denominator, required band outputs, source identity and accepted effort declared first.
- **Evidence:** R008's task is plausible but unobserved; primary APIs show feasible, differing boundary contracts. T1 has strong existing comparators. [H01, E01–E09]
- **Alternatives considered:** Continue deferral; use current methods; maintain upstream categories; test width/origin for regular bands; test explicit edges only for necessary irregular bands.
- **Benefit:** Distinguishes a useful small capability from a general editor and gives deferral a concrete reopening condition.
- **Cost:** Owner time, paired task runs, recording exact outputs and effort, and reconciliation of selection/restore choices. No broad survey, telemetry project or performance framework.
- **Confidence:** High in the gate's relevance; low in the likelihood or magnitude of a new control's user benefit until the task exists.
- **Falsification:** The best current comparator produces all required correct results within the predeclared accepted effort, or the proposed mode adds closure/density/restore errors. Reject an extension that needs a general editor to pass.
- **Gate:** Zero row/denominator errors; either a required repeated output current routes cannot provide, or at least one material recurring reconfiguration step removed per refresh while staying within the owner's declared time budget. Confirm that burden matters to the owner. Treat this as task validation, not statistical proof of broad demand. If only equal-grid bands matter, consider width/origin alone. Explicit edges require a separately demonstrated irregular-band need. Never automatically ship both.

## 8. Remaining choices and stop conditions

The recommendation is settled; these are inputs that could change it, not a request to design the product now:

- Who owns the recurring task, how often it occurs, and what output is currently wrong or too costly?
- Is the decision an inclusive specification predicate, a strict-tail inspection, or comparison of distribution shape in fixed bands?
- Is the source replacement a new independent sample, appended history, revised records, or changed measurement units? Which saved snapshot is restored?
- If EB02 reproduces a discrepancy, is the intended user contract exact bin membership or a visibly disclosed inclusive selected range? A repair must make that choice explicit.
- Would authored intervals need unequal widths, zero bands, domain tails and a density encoding? If so, their cost may make upstream categories or deferral preferable.
- What exact finite numeric resolution is required? If adjacent requested boundaries cannot be represented, the experiment stops rather than rounding them silently.

Named baselines are independent and remain outside scope. Byron's low interest in named reference populations is neither approval nor rejection of bin refinements; the population-baselines intent says the refinements do not depend on the named-baseline system. [H03]

The revised queue retains local trust first, respects PR462's Mosaic ownership and PR454's time-series axes, and does not reopen the completed PR451/452/455–461 surveys. A recommendation does not authorize implementation. Codex independently collects, reconciles, validates and opens any subsequent review PR.

## Sources

Repository references below were read at the pinned baseline on 2026-10-21. Exact symbols are identified above; detailed integrity records and test-source observations are in `evidence-and-comparisons.md`.

- **S01** [BarChart/bins.ts — numericBins, snapRangeToBins, binInRange, sameRange](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/bins.ts)
- **S02** [BarChart/barPlan.ts — isNumericBarField, binRows, planBarChart](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barPlan.ts)
- **S03** [BarChart/BarChart.tsx — SingleBarChart, selectBinAt, handleBrushChange, range-snapping effect](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx)
- **S04** [BarChart/BarChartSettingsPanel.tsx — bin-count input](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarChartSettingsPanel.tsx)
- **S05** [BarChart/definition.ts — BarChartSettings, barChartDefinition](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/definition.ts)
- **S06** [BarChart/barTrace.ts — resolveBarTrace](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/barTrace.ts)
- **S07** [BarChart/BarTraceBody.tsx — interval and contributor disclosure](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx)
- **S08** [hooks/applyFilter.ts — applyFilter](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts)
- **S09** [types/FilterTypes.ts — RangeFilter](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/FilterTypes.ts)
- **S10** [charts/useGetLiveData.tsx — useGetLiveIds, useGetAllIds](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetLiveData.tsx)
- **S11** [charts/useGetColumnData.tsx — useGetColumnDataForIds](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/useGetColumnData.tsx)
- **S12** [lib/chartPopulation.ts — getPopulationTest, restrictToPopulation](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts)
- **S13** [hooks/CrossfilterWrapper.ts — updateChartFilters, getFilterFunction, getAllData](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts)
- **S14** [lib/valueParsing.ts — finiteNumber, finiteNumbers, isNumberLike, numericExclusionReason](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts)
- **S15** [providers/DataLayerProvider.tsx — setData, saveToStructure, restoreFromStructure, restoreAnalysisFromStructure](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx)
- **S16** [providers/lib/dataLayerState.ts — initializeData](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/lib/dataLayerState.ts)
- **S17** [utils/saveDataUtils.ts — isFilter, isChart, validateSavedData](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts)
- **S18** [Ecdf/ecdfPlan.ts — shareAt, countInRange, idsThrough, thresholdFilter, snapToValue, planEcdf](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts)
- **S19** [Ecdf/EcdfChart.tsx — commit and population hooks](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/EcdfChart.tsx)
- **S20** [Ecdf/definition.ts — ecdfDefinition.getFilterFunction](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/definition.ts)
- **S21** [Ecdf/ecdfTrace.ts — threshold contributors](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/Ecdf/ecdfTrace.ts)
- **S22** [settings/FiltersSettingsTab.tsx — chartFilterFields, FiltersSettingsTab](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/settings/FiltersSettingsTab.tsx)
- **S23** [DataTable/components/ColumnFilter.tsx — updateRange, At least / At most](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/components/ColumnFilter.tsx)
- **S24** [components/ChartSettingsContent.tsx — filter validation and editing](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/ChartSettingsContent.tsx)
- **S25** [bar.mdx — existing bar documentation](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/bar.mdx) and [ecdf.mdx — existing ECDF documentation](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/ecdf.mdx)
- **S26** [docs/live/examples.ts — liveExamples bar-histogram and ecdf](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/live/examples.ts)
- **H01** [R008 candidate at historical commit 476a1be3544f93baf7c4732a436163609fbbd02f](https://github.com/byronwall/explorEDA/blob/476a1be3544f93baf7c4732a436163609fbbd02f/docs/intent/research-ideas-100/ideas/R008-engineering-bin-boundaries.md)
- **H02** [current-analysis-trust intent](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md)
- **H03** [population-baselines intent](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/population-baselines/intent-brief.md)

Primary external references, all retrieved **2026-10-21**; versions were not installed or executed:

- **E01** [D3 bin API](https://d3js.org/d3-array/bin)
- **E02** [Vega-Lite bin parameters](https://vega.github.io/vega-lite/docs/bin.html)
- **E03** [NumPy histogram](https://numpy.org/doc/stable/reference/generated/numpy.histogram.html)
- **E04** [R hist manual, patched](https://stat.ethz.ch/R-manual/R-patched/library/graphics/html/hist.html)
- **E05** [Observable Plot bin transform](https://observablehq.github.io/plot/transforms/bin)
- **E06** [NIST histogram interpretation](https://www.itl.nist.gov/div898/handbook/eda/section3/histogra.htm)
- **E07** [NIST tolerance intervals versus engineering tolerances](https://www.itl.nist.gov/div898/handbook/prc/section2/prc263.htm)
- **E08** [NIST control charts](https://www.itl.nist.gov/div898/handbook/pmc/section3/pmc31.htm)
- **E09** [NIST process capability](https://www.itl.nist.gov/div898/handbook/pmc/section1/pmc16.htm)
