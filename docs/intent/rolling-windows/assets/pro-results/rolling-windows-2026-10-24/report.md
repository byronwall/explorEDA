Build a rolling overlay in Line Chart’s Calendar summaries mode: trailing UTC calendar windows with observation-weighted count, sum, and mean, exact record selection, and a trace that explains the window, numerator, denominator, exclusions, and support. This is an independently useful addition to the existing React/TypeScript product. It reuses its calendar and evidence model while making the consequential distinction between averaging observations and averaging period summaries explicit.

# Rolling windows with exact contributors

**Methods decision · 24 October 2026**  
**Source baseline:** `95832bd473884aeae23453af0888b4ca5187820d`  
**Status:** researched design; implementation and browser proofs remain for Codex. Read the brief and decision table for the few-minute path. Sections 2–7 are reference detail; exact arithmetic is in Appendix A. Companion: [implementation-plan.md](implementation-plan.md).

## Two-minute decision brief

- **First release:** one rolling overlay on a calendar line chart, with count, sum, or mean. Keep the base periods visible and ship settings, exact evidence, selection, save/restore, exports, docs, and a runnable example together.
- **Window:** the labeled UTC period plus its preceding K−1 calendar periods, including empty slots. Include the lower endpoint and exclude the upper endpoint. Default K=3; use actual month/year boundaries and the saved week start.
- **Weighting:** every valid observation receives equal weight for a mean. Daily values `[10,20]` and `[90]` average to 40 when pooled, but their two daily means average to 52.5. Add that second estimand explicitly in M2.
- **Support:** suppress the early outputs that lack the requested calendar span unless Partial start is chosen. Report valid rows, observed periods, and exclusions separately. Collection coverage remains unknown; displayed zero-filled gaps never become observations.
- **Population:** apply Chart rows, facets, and peer/workspace filters before the window. The owning chart’s selection filters other views without recomputing its own reference value.
- **Evidence:** a rolling click selects its exact current window records. Trace can select used or excluded records separately. IDs are snapshot-bound; refresh recomputes values and closes stale traces.
- **Implementation:** merge compensated bucket statistics afresh for each window; retain source records once and resolve window contributors on demand. Measure the proposed workload before promising performance.
- **Next:** ship M1, then equal-period means in M2. Keep elapsed windows, coverage/exposure rates, and reusable preparation as separate extensions. The main release risk is selecting a different population from the one that produced the value.

## 1. Decisions

| ID / disposition | Recommendation | Reason |
| --- | --- | --- |
| RW-01 · **Build** | Chart-local calendar overlay first. | Useful without introducing reusable-query infrastructure. |
| RW-02 · **Build** | Current period plus preceding `K−1` UTC calendar periods; `[start,end)`. | Fixed, explainable membership through gaps and unequal months. |
| RW-03 · **Build** | Count records, sum valid inputs, mean valid observations. | Each operation has an explicit population and denominator. |
| RW-04 · **Build** | Separate calendar-span support, numeric support, and collection coverage. | A complete calendar grid does not prove complete collection. |
| RW-05 · **Build** | Peer filters before evaluation; own selection after evaluation. | Selecting evidence must not redefine its own reference value. |
| RW-06 · **Build** | Exact member/used/excluded record selection and revision-bound traces. | A rolling point often depends on records outside its labeled period. |
| RW-07 · **Build** | Compensated bucket statistics, fresh per-window merging, lazy contributor lookup. | Bounded work without subtraction drift or duplicated provenance arrays. |
| RW-08 · **Build, M2** | Explicit equal-period means with their own support policy. | A valid second estimand, with visibly different row weights. |
| RW-09 · **Explore** | Declared coverage and average period totals/event rates. | Zero-event assumptions and exposure denominators need their own contract. |
| RW-10 · **Defer** | Elapsed-duration, last-N-row, last-N-observed-period, centered, and local-zone windows. | Each changes membership or interpretation; none is needed for M1. |
| RW-11 · **Explore** | Reusable derived output, then a dedicated preparation step. | Reuse can follow the same kernel once its lineage and filter semantics are stable. |
| RW-12 · **Avoid** | Silent mean-of-means, display zeros as observations, generic window expressions, implicit deduplication. | These obscure the estimand or add unnecessary platform scope. |

Byron’s stated need is sufficient demand. `docs/research/DIRECTION.md` supersedes the older demand gates in R035 and R049. No outside-demand or usability-study prerequisite is proposed.

## 2. Mathematical contract

### Window and anchor

| Window basis | Legitimate use | Tradeoff |
| --- | --- | --- |
| **K calendar periods — chosen** | Compare the same calendar span at successive periods. | Observation counts vary; absent slots remain in the span. |
| Fixed elapsed duration | Recent activity relative to a particular instant. | Needs a separate anchor contract; sampling density varies. |
| N observed buckets | Summarize the last N reported periods. | Bridges calendar gaps and has a variable elapsed horizon; not N calendar days/months. |
| N ordered rows | Summarize the last N events/readings. | Fixes member count, not necessarily valid numeric count; duration varies and ties need a positional rule. |

Let the chart interval define consecutive UTC periods `B_j=[b_j,b_{j+1})`. For the output labeled period `j`, request:

\[
W_j=[b_{j-K+1},b_{j+1}),\qquad K\ge1.
\]

- **Trailing includes the labeled period.** The analytical anchor is its exclusive end. For visual comparison, draw at that period’s midpoint, matching existing calendar marks. The midpoint is a label position, not an assertion that the result was available then.
- **Every calendar slot counts toward K**, including absent periods. Never extend backward to find K nonempty buckets.
- Use the existing day, week, month, and year boundaries and saved Monday/Sunday week start. Months advance by calendar boundaries, never by 30 days. First-of-month boundaries avoid March-31 anniversary subtraction ambiguity.
- Include every record at the lower endpoint; exclude every record at the upper endpoint. Equal timestamps remain distinct records. Normalize offsets using the existing parser. Sort internally; input order, group interleaving, and table display sorting cannot alter membership.
- M1 is UTC only. A later duration window would use an explicit elapsed amount such as 72 hours. A later local-calendar window must save an IANA zone and a daylight-saving policy; “day” and “24 hours” must remain distinct.

**Proposed defaults:** rolling off; enabling uses `K=3`, full calendar span, minimum one contributing record. Support integer K from 1 through 366 in the bounded release. The existing chart aggregation is inherited; rolling is offered for count, sum, or average in Line display. Other combinations require an explicit setting change, not silent coercion.

### Population and estimands

For one series and facet, let `M_j` be the eligible dated records in the window and `V_j⊆M_j` those with finite numeric measures. Write `m_j=|M_j|`, `n_j=|V_j|`, and `S_j=Σ_{i∈V_j}x_i`.

| Operation | Exact definition | Meaning and support |
| --- | --- | --- |
| Count records | `m_j` | All dated window members count, including invalid measures. Minimum support uses `m_j`. No measure is required. |
| Sum | `S_j` | Sum of valid inputs; minimum support uses `n_j`. No division; trace denominator is “not applicable” or the algebraic identity 1. |
| Observation mean | `S_j/n_j` | Each valid input has weight `1/n_j`. Minimum support uses `n_j`, never total member count. |

The **unit is one chart input record**. With an ordinary source these are observations. If an upstream query has already aggregated or expanded records, the chart cannot infer original-observation weights or undo repeated entities. A mean of upstream mean rows is a mean of those input rows. Reconstructing an original pooled mean requires the original inputs or compatible sums/counts and lineage. M1 does not add “once per entity” to calendar windows.

For periods with valid measures, define `μ_b=S_b/n_b`. A later equal-period mean is:

\[
\bar x_{period}=\frac{1}{r}\sum_{b\in E}\mu_b,
\quad\text{versus}\quad
\bar x_{pooled}=\frac{\sum_b n_b\mu_b}{\sum_b n_b}.
\]

Here `E` is the explicitly eligible period set and `r=|E|`. Equal-period weighting answers “what is the average period’s mean?” Each underlying record in period b then weighs `1/(r n_b)`. It equals the pooled mean when bucket counts are equal, or coincidentally for particular data. Treating it as the average observation is generally misleading. Neither estimator is a time-integrated mean of an irregularly sampled physical signal; that needs duration weights and an interpolation/hold model.

**Example:** daily observations `[10,20]`, `[90]`, and an absent day give pooled mean `120/3=40`; the mean of the two available daily means is `(15+90)/2=52.5`. Inserting a zero daily mean produces 35, a third answer with an unsupported assumption.

### Gaps and edges

Keep four facts separate:

- **No observations:** no dated records in that period. Collection coverage is unknown.
- **All-invalid measure period:** records exist, but no numeric measure contributes. These records still contribute to Count records.
- **Observed zero:** an actual valid input of zero. It contributes to the mean’s denominator.
- **Collection coverage:** evidence about when observation was possible and complete. Neither rows nor calendar slots establish this.

M1’s analysis calendar is the inclusive sequence of periods spanning the chart/facet’s pre-peer-filter population. It is shared across that facet’s series; a late-arriving series has absent slots, not a silently shortened frame. A **full-span** result requires all K requested slots to lie inside that calendar. The first K−1 anchors are unavailable by default. **Partial start** is an explicit option: use the intersection with the analysis calendar and disclose, for example, `2/3 calendar periods available`. Do not pad it.

An absent or invalid period inside a full-span window does not automatically invalidate a pooled result; valid observations in its other periods may still contribute. Show requested slots, available slots, observed slots, valid-measure slots, member/used/excluded counts, and `Collection coverage: unknown`. A result over an empty target day is legitimate when earlier window records support it.

At minimum support 1, an entirely empty window has no displayed rolling result, including Count records; its trace still reports the exact loaded-record count 0. An all-invalid numeric window has no sum or mean. An observed zero does display 0. Changing the base chart’s existing Missing periods → Zero setting changes **only that base layer**, never these rolling inputs or thresholds.

The first and final source periods can be only partly collected even when calendar boundaries are complete. Do not infer an end-of-collection timestamp from the latest row, from midnight, or from the wall clock. Explicit nonaligned Chart rows date restrictions are analysis restrictions and must appear in scope; they do not become evidence of collection. Display zoom/clipping happens after evaluation and retains the earlier records required by visible windows.

**When zero is legitimate:** an analyst may assert that a covered event log contains every event and that no record means zero events, or supply explicit zero records for covered periods. A future average of daily totals may then include a zero total in its period denominator. Missing measurements and failed conversions never become zero. An absent mean is never a synthetic zero observation. Averaging counts or totals per month is not automatically a per-day rate; unequal month durations require an explicit exposure denominator.

## 3. What established tools contribute

Primary documentation was opened on 24 October 2026. These are comparisons, not proposed dependencies or claims of identical defaults.

| Tool / primary source | Checked behavior | Design implication |
| --- | --- | --- |
| [Observable Plot window][S1] | K counts input elements; order matters; the default is centered and non-strict. Strictness combines edge truncation and missing inputs. | Make anchor explicit; separate structural span from missing-measure support. A 7-element transform is not inherently seven days. |
| [pandas rolling][S2] | Positional and offset windows differ. `min_periods` defaults to K for integer windows, 1 for offsets; default endpoints are `(left,right]`. Generic offsets must be fixed-frequency; custom indexers are another route. | Persist support semantics. Build calendar boundaries explicitly. Do not inherit implementation-dependent defaults. |
| [PostgreSQL frames][S3] and [tutorial][S4] | `ROWS` counts positions, `GROUPS` counts ordering peers, and `RANGE` uses ordering-value distance. WHERE/HAVING filtering precedes windows; outer filtering can follow them. | Specify partition, order, frame, and filter stage separately. Existing bucket groups do not represent absent calendar slots. |
| [DuckDB windows][S5] | Its dated RANGE example handles missing days without counting physical rows; partition-edge frames truncate. QUALIFY filters computed results. | Good comparison for explicit time membership and pre/post-window filtering, not a reason to add SQL to explorEDA. |
| [R slider index][S6] and [period][S7] | Indexed windows group tied indexes. Period windows use actual calendar groups; a missing month does not make the preceding observed month adjacent. | Include whole ties and keep gaps in elapsed/calendar membership. Generate empty output slots explicitly in explorEDA. |
| [Polars rolling][S8] | Defaults to observed-timestamp anchors and `(t−period,t]`; calendar units differ from fixed elapsed time across daylight saving. Requires sorting within groups. | Keep UTC calendar and future elapsed/local modes separately named. |

A useful cross-tool trap: pandas’ documented tied-timestamp example returns successive totals 1 then 3 for two same-time rows, whereas slider groups tied indexes together. explorEDA’s single calendar output includes all in-frame ties. Raw per-row library output is therefore not a parity oracle until anchor, tie, closure, support, and missing-data rules are aligned. [S2] [S6]

## 4. Population, selection, and evidence

**Proposed evaluation order:** effective source fields → Chart rows/local population → facet partition → reference calendar and series → workspace/peer filters → series/window membership → numeric eligibility → own selection and display bounds. Workspace Rows drawer searches remain local to that drawer, not hidden rolling inputs. Notebook-style `localSelections` retains its existing isolation behavior.

The attached planner already uses `allIds` for calendar/reference domains and `liveIds` for current values. Keep that separation. The source trace must distinguish records outside the population from members excluded numerically; invalid dates belong to chart-level omissions because they cannot be assigned to a window. Count records uses all members as contributors. [R1] [R2] [R3] [R4]

### Exact selection

- Click/Enter on a **rolling** point selects its exact current window-member IDs, including excluded numeric inputs. Click/Enter on a **base** point retains its existing period/series behavior.
- Alt-click/Alt-Enter opens trace. Its actions select **Window records**, **Used records**, or **Excluded records**. Disable zero-sized subset actions.
- Reuse the existing chart-owned `value` filter on `__ID`; compile its IDs into a Set once. A date/split predicate alone can leak records outside Chart rows. Exact-set actions replace this chart’s previous selection filters, while preserving local population and other owners’ filters.
- A later base-point click removes the old ID selection before applying its period predicate. Otherwise `timePointFilters`, which preserves unrelated fields, would retain a hidden intersection.
- Separate the directly selected output from overlapping membership. One chosen record participates in several windows; `contributors.some(...)` is insufficient to identify which output was clicked. Use a transient output identity plus method/selection signature; ordinary restored record selections need not identify a unique output.

These decisions use verified pinned-source mechanisms, including `FilterTypes`, `rowIdFilters`, `CrossfilterWrapper`, and `DataLayerProvider.updateChart`. They require no new filter language. [R5]

### Trace and refresh

The trace begins with output period, **requested and effective window**, UTC `[start,end)` boundaries, operation/weighting, unformatted result, numerator, denominator, support, and scope. A 25-row paginated record list retains source ID, effective/raw date, effective/raw input, inclusion reason, and weight. Selecting a source record normally locates its base bucket; a secondary “Used by rolling windows” list resolves the many-to-many relationship deliberately.

Data replacement, conversions/calculations, peer population, partition, or method changes invalidate evidence. Keep the shared close-on-stale rule. **Own selection also closes the current trace at this baseline:** `getAllData()` advances a common nonce and `useTraceRevision` includes it. Announce the selected count and restore focus; reopening resolves current evidence. Numerical values must nevertheless stay unchanged by the owning chart’s selection. [R3] [R4] [R5]

Record selection is a **snapshot**, not a live window subscription. Newly appended records may change the rolling value but do not silently join an earlier ID selection. Runtime IDs are array positions. Existing `carryRowSelections` can remap unchanged records when old/new datasets are available and drops ambiguous/changed selections. This is not portable record identity. On an unverified settings-only restore, clear **every chart-owned `__ID` selection on a rolling chart**, preserving its rolling configuration and local population. This rule needs no unavailable selection-origin marker. Same-data undo and full analysis restoration with accompanying rows may retain selection. Do not infer a binding from equal row counts or positional IDs. [R5]

## 5. Product seam and first release

| Seam | Benefit | Decision |
| --- | --- | --- |
| Calendar-chart overlay | Immediate comparison, linked records, existing settings and trace. | **M1.** One method object under `time.rolling`. |
| Reusable derived table | Several consumers can share one window result and its lineage. | Later, with explicit output grain and snapshot/recompute semantics. |
| Preparation step | Makes pre/post-window filtering authorable across project stages. | Later dedicated typed step; do not extend scalar `avg()` into an ordered engine. |

Author through Calendar summaries → Rolling → period count and support. Keep the base series visible as a thin line and the rolling series as a stronger, distinguishable line in the same category color. A resting label such as **“3-day mean · each valid record equally weighted · UTC”** survives image export. A count is labeled **“3-day record count”**, not “average count.” An empty base day can have a valid rolling mark.

The existing header trace control must offer facet, layer, series, and output-date targets, including unavailable results. `ChartTraceScope.targets` currently keeps only the first chart-role source: add deliberate facet routing or a facet chooser, and prove access to an unavailable output in a non-first facet. At 1280 px use a compact nonmodal editor beside the chart. At 783 px respect the view-only grid and use chart details for editing, with chart above controls. At 390 px use one chart column and a viewport-bounded header trace picker; touch must not depend on hitting tiny dots. Arrow/Home/End navigation, Enter selection, Alt-Enter trace, Escape dismissal, focus return, visible field/scope labels, and real tooltips are release criteria. No plot-level Inspect button. These are proposed proofs, not claims of completed mobile support. [R4] [R6]

Save method settings, not every output’s contributor arrays. Use the existing update path and held-edit mechanism for one undo step per continuous edit. Old saves leave rolling off. Dashboard text must round-trip every setting. Image export preserves visible method identity; chart-data export is explicitly **rolling outputs**, with windows/support/numerator/denominator. Source-record export retains actual records. A per-window evidence export includes its exact ID mapping and revision; settings-only exports do not imply data or portable row identity.

## 6. Algorithm and limits

Partition once; parse dates/eligibility through the existing helpers; sort by effective timestamp then source ID. Store each bucket’s member list and numeric eligibility once. Compute numeric count and a compensated two-component sum from included inputs, never from a displayed zero or `bucket.average × rowCount`.

**Choose fresh direct merging of K bucket statistics** for each output. Merge both sum components into a new compensated accumulator, then divide by the summed valid count for a mean. This is a small chart computation, not an execution engine.

Use the same prepared bucket sum state/count for the base and rolling layers. For supported present buckets, K=1 must match the base result even under cancellation. Extract a small shared compensated primitive for `reduceNumbers` sum/average and calendar preparation; leave count/min/max semantics unchanged. This deliberately improves some existing floating-point results, so include aggregate, calendar, and project regressions. Empty-period display and rolling support gates remain intentional differences.

| Approach | Cost after partitioning | Decision |
| --- | --- | --- |
| Rescan all source rows per output | Worst `O(N × outputCount)` | Avoid production; interval-directed raw reduction is a useful test oracle. |
| Traverse actual member rows in every frame | `O(NK)` for calendar outputs | Simple correctness reference; unnecessarily revisits dense periods. |
| Fresh merge of bucket counts/sum components | `O(N + F B K)` arithmetic; sorting `O(N log N)` | **M1 choice.** F is series/facet partitions; B is calendar slots per partition. |
| Prefix differences or add/remove sliding sums | `O(N + FB)` | Defer optimization. Large historic totals can erase a small current total; removal accumulates error. |

Memory is `O(N+FB)` plus the current trace page/selected ID set, rather than `O(NK)` copied contributors. Prefix **integer counts** may safely support pagination offsets within safe-integer range; this does not imply floating sums should use prefixes. Looking up a frame is O(1) from its period indexes; enumerating m exact records costs `O(K+m)`. A 25-record page can use cumulative member offsets to locate its buckets without materializing the whole window. A row’s affected outputs form a bounded run of at most K anchors; find them from its bucket index rather than scanning every output’s contributors.

Compensated summation improves accuracy but does not make floating arithmetic exact or associative. Higham analyzes the error and cancellation limits; pandas explicitly documents residual rolling-sum imprecision. [S9] [S10] M1 should use a documented Neumaier-style update, deterministic ordering, and a fresh accumulator per frame. Preserve both components across buckets. Return a numerical-unavailable status on nonfinite accumulation, including intermediate overflow; do not clamp a suspicious result to zero. Mean may be unavailable when its numerator overflows even if a differently implemented mean could be finite. This is a stated limit, not a claim of arbitrary-precision arithmetic.

**Budget proposals, not measurements:** start with 100,000 input rows, four series, 1,460 daily slots, K=30, 10% absent cells and 5% invalid measures. Measure cold construction separately from 30 warmed peer-filter updates. Initial review targets are ≤100 ms warmed kernel, ≤200 ms input-to-painted update, and ≤50 ms first trace page on a recorded reference desktop/browser. Stress 500,000 rows, 30 series, 2,000 slots, K=366 and multiple facets; do not promise those timings there. Retain existing 2,000-period/30-live-series limits and add a proposed aggregate limit of 60,000 output cells across facets. Reject over-limit configurations visibly; never silently thin the statistical population. Rendering and ID-selection costs need measurement as well as arithmetic.

## 7. Delivery sequence and risks

1. **M1: complete pooled overlay.** Kernel, trace, exact selection, settings/undo/restore/text, exports, accessibility, docs, and `rolling-calendar` example ship together. Internal kernel work is an implementation step, not the useful release by itself.
2. **M2: equal-period mean.** Explicitly named weighting, default all-period support, optional available-period denominator, weights in trace, and `rolling-weighting` example. It reuses M1’s boundaries and evidence.
3. **Later bounded extensions:** declared coverage/average totals, elapsed windows, reusable output, and a dedicated preparation step. Lag/difference keeps a distinct predecessor/tie contract. No streaming service, paid dependency, forecasting, confidence bands, model selection, causal claims, or stack migration is needed.

The principal risks are incorrect scope during exact selection, a misleading support label, positional selections restored against different data, and lost precision from preaggregation. Appendix A and the companion plan make these acceptance conditions concrete. No repository files were changed, and no commit, push, deployment, benchmark, or product test was performed.

## Appendix A. Exact acceptance fixtures

### A1. Input records and windows

Use K=3 days. Record labels below are the fixed numeric source IDs for pure planner tests; permute the ID iteration order without changing the ID→record map. In the runnable demo, also expose a `Record ID` source field; integration assertions resolve those labels to the provider’s current positional `__ID` rather than assuming persistence across reloads. All fixture records have `Region=North` unless a variant says otherwise.

Iteration order: `[10,4,1,13,8,2,11,6,5,3,12,7,9,14]`.

| ID / group | UTC timestamp | Measure / Channel |
| --- | --- | --- |
| 1 / A | 2024-02-27T00:00:00.000Z | 10 / Web |
| 2 / A | 2024-02-27T00:00:00.000Z | 20 / Store |
| 3 / A | 2024-02-28T23:59:59.999Z | 90 / Web |
| 4 / A | 2024-03-01T00:00:00.000Z | null / Web |
| 5 / A | 2024-03-01T00:00:00.000Z | "bad" / Store |
| 6 / A | 2024-03-02T00:00:00.000Z | 0 / Web |
| 7 / A | 2024-03-03T00:00:00.000Z | 30 / Store |
| 8 / B | 2024-02-27T12:00:00.000Z | 100 / Web |
| 9 / B | 2024-02-28T12:00:00.000Z | 200 / Web |
| 10 / B | 2024-02-28T12:00:00.000Z | 400 / Store |
| 11 / B | 2024-02-29T00:00:00.000Z | 5 / Web |
| 12 / B | 2024-03-01T00:00:00.000Z | 50 / Store |
| 13 / B | 2024-03-03T00:00:00.000Z | 300 / Web |
| 14 / A | "bad-date" | 999 / Web |

The reference calendar is `[2024-02-27,2024-03-04)`. Dates in the next tables are midnight UTC in 2024; every upper endpoint is excluded. ID sets are written in ascending order; trace display order is timestamp then ID.

| Target day | Requested window | Calendar support |
| --- | --- | --- |
| Feb 27 | [Feb 25, Feb 28) | 1/3; effective start Feb 27 |
| Feb 28 | [Feb 26, Feb 29) | 2/3; effective start Feb 27 |
| Feb 29 | [Feb 27, Mar 1) | 3/3 |
| Mar 1 | [Feb 28, Mar 2) | 3/3 |
| Mar 2 | [Feb 29, Mar 3) | 3/3 |
| Mar 3 | [Mar 1, Mar 4) | 3/3 |

The first two rows below are candidate arithmetic under **Partial start**; full-span default suppresses them. Collection coverage is unknown for every row. Count uses numerator m, no division; sum uses S, no division; each mean below shows its exact numerator/denominator.

| Group A target | Window members → numeric used | Count; sum; mean |
| --- | --- | --- |
| Feb 27 | {1,2} → {1,2} | 2; 30; 30/2 = 15 |
| Feb 28 | {1,2,3} → {1,2,3} | 3; 120; 120/3 = 40 |
| Feb 29 | {1,2,3} → {1,2,3} | 3; 120; 120/3 = 40 |
| Mar 1 | {3,4,5} → {3} | 3; 90; 90/1 = 90 |
| Mar 2 | {4,5,6} → {6} | 3; 0; 0/1 = 0 |
| Mar 3 | {4,5,6,7} → {6,7} | 4; 30; 30/2 = 15 |

| Group B target | Window members → numeric used | Count; sum; mean |
| --- | --- | --- |
| Feb 27 | {8} → {8} | 1; 100; 100/1 = 100 |
| Feb 28 | {8,9,10} → same | 3; 700; 700/3 |
| Feb 29 | {8,9,10,11} → same | 4; 705; 705/4 = 176.25 |
| Mar 1 | {9,10,11,12} → same | 4; 655; 655/4 = 163.75 |
| Mar 2 | {11,12} → same | 2; 55; 55/2 = 27.5 |
| Mar 3 | {12,13} → same | 2; 350; 350/2 = 175 |

ID 14 is a date omission, never a window’s numeric exclusion. A/Feb29 has zero rows in its target period but a supported rolling mean 40. A/Mar1 has three members, one used value, one absent window period, and one all-invalid period. A/Mar2’s zero comes from ID 6, not from filling an absence.

### A2. Weighting, gaps, and thresholds

- A/Feb29: observation weights 1/3 each; pooled 40. Available-period mean `105/2=52.5`; record weights 1/4, 1/4, 1/2 for IDs 1,2,3. All-three-period mean is unavailable. Zero-filling an absent mean would wrongly produce 35.
- B/Feb29: all three periods are present. Pooled `705/4=176.25`; equal-period `(100+300+5)/3=135`. IDs 8 and 11 weigh 1/3 each; IDs 9 and 10 weigh 1/6 each.
- A/Feb29, K=1: empty members, m=n=0. Loaded count is 0; default minimum-one policy yields no plotted rolling result. Sum/mean unavailable.
- A/Mar1, K=1: members {4,5}, used {}; count 2, sum/mean unavailable. K=2 has the same rows but additionally records the absent Feb29 slot.
- A/Mar2, K=1: members/used {6}; count 1, sum 0, mean 0.
- Minimum contributors 2 for a numeric operation suppresses A/Mar1 and A/Mar2 at K=3, while A/Mar3 remains 15. Count’s support checks m instead.
- Later average-of-daily-totals example: A/Feb29 observed daily totals 30 and 90 yield 60 over two observed days; explicitly assuming the absent day has total 0 yields `120/3=40` per day. Its equality to the pooled observation mean is accidental.
- Last-three-observed-days comparison at A/Mar2: Feb28, Mar1, Mar2 contain {3,4,5,6}, used {3,6}, sum 90, mean `90/2=45`. The chosen last-three-calendar-days frame Feb29–Mar2 contains {4,5,6}, used {6}, and mean 0. This difference is membership, not rounding.

### A3. Endpoints, weeks, and calendar duration

For A/Feb29’s `[Feb27,Mar1)`, both lower-bound ties 1 and 2 are included, and both upper-bound ties 4 and 5 are excluded. Replacing ID 3’s timestamp with `2024-02-29T04:59:59.999+05:00` and ID 4’s with `2024-03-01T05:00:00.000+05:00` changes nothing.

For K=1 week containing Sunday Mar3:

- Monday start: `[Feb26,Mar4)`; A members {1,2,3,4,5,6,7}, used {1,2,3,6,7}, count 7, sum 150, mean 30. B members/used {8,9,10,11,12,13}, count 6, sum 1055, mean `1055/6`.
- Sunday start: `[Mar3,Mar10)`; A {7}: count 1, sum/mean 30. B {13}: count 1, sum/mean 300.

Separate month dataset, one group:

| ID | UTC timestamp | Value |
| --- | --- | --- |
| 101 | 2024-01-31T23:59:59.999Z | 2 |
| 102 | 2024-02-01T00:00:00.000Z | 4 |
| 103 | 2024-02-29T23:59:59.999Z | 6 |
| 104 | 2024-03-01T00:00:00.000Z | 8 |
| 105 | 2024-03-31T23:59:59.999Z | 10 |
| 106 | 2024-04-01T00:00:00.000Z | 12 |
| 107 | 2024-04-30T23:59:59.999Z | 14 |
| 108 | 2024-05-01T00:00:00.000Z | 16 |

| Window | Members = used | Count; sum; mean |
| --- | --- | --- |
| February `[Feb1,Mar1)`; 29 days | {102,103} | 2; 10; 10/2 = 5 |
| 30 elapsed days `[Jan31,Mar1)` | {101,102,103} | 3; 12; 12/3 = 4 |
| Two months `[Mar1,May1)`; 61 days | {104,105,106,107} | 4; 44; 44/4 = 11 |
| 60 elapsed days `[Mar2,May1)` | {105,106,107} | 3; 36; 36/3 = 12 |

ID 108 is excluded at May1. The duration comparisons specify rejected equivalences, not additional M1 modes. Add a boundary-only year check: UTC 2024 is `[2024-01-01,2025-01-01)` and includes Feb29; adjacent Dec31/Jan1 records belong to different years.

### A4. Scope, selection, refresh, and bounds

- Peer `Channel=Web`, Feb29: A members/used {1,3}, count 2, sum 100, mean 50; B {8,9,11}, count 3, sum 305, mean `305/3`. Calendar bounds stay fixed. Removed records are filtered out, not numeric exclusions.
- Own base-period selection of A/Mar1 selects {4,5} and leaves its rolling mean 90. The same date restriction as a peer filter leaves members {4,5}, used {}, and no numeric result. Own rolling-point selection selects {3,4,5}; Used selects {3}; Excluded selects {4,5}; all leave the owner’s value 90.
- Own rolling selection of A/Feb29 selects {1,2,3}, although its target day is empty. Selection must not mark every overlapping rolling output as directly clicked.
- Local/facet leakage variant: add ID 15, group A, Feb27 noon, value 900, Region South. Restrict the chart or facet to North. A/Feb29 stays 40 and exact selected IDs stay {1,2,3}; South’s record must not leak through a date/group predicate.
- Refresh variant: append ID 16, group A, Feb28 noon, value 30, Web, North. A/Feb29 becomes `150/4=37.5`; its old record selection remains the prior three records, not four. Old trace closes. Reordered unchanged unique records may be remapped by the existing refresh mechanism; changed/ambiguous records cannot be silently matched by position.
- Show only Feb29 through Mar3 via display bounds: A/Feb29 still uses {1,2,3} and equals 40. Apply an analysis/peer date filter beginning Feb29 instead: it has no members and no plotted result. A nonaligned analysis filter starting Feb27 noon excludes IDs 1,2; A/Feb29 becomes `90/1=90` while structural span remains 3/3 and collection coverage remains unknown.

### A5. Units and numerical expectations

With unchanged eligibility, `x′=a x+b` gives `S′=aS+b n` and `mean′=a mean+b`; counts are unchanged. Invalid inputs remain invalid, not b. These are arithmetic checks, not an endorsement of summing every kind of offset-scale measurement.

For `x′=(9/5)x+32`:

- A/Feb29: sum 312, n=3, mean 104; available-period mean becomes 126.5.
- B/Feb29: sum 1397, n=4, mean `1397/4=349.25`.
- A/Mar2: the actual zero input becomes 32; sum/mean 32. A/Mar1 at K=1 remains unavailable numerically.
- Pure scale `x′=x/1000` gives A/Feb29 sum 0.12 and mean 0.04. Formatting alone changes neither stored value nor membership.

Adversarial arithmetic:

| Inputs / frame | Exact expectation | Failure caught |
| --- | --- | --- |
| One bucket `[10^16,1,−10^16]` | Sum 1; mean 1/3 | Naïve accumulation gives 0. |
| Buckets `[10^16,1]`, second K=1 | Sum/mean 1 | Prefix subtraction may give 0. |
| Buckets `[10^16,1,2]`, last K=2 | Sum 3; mean 3/2 | Rounded add/remove state may give 2. |
| Two buckets `[10^16,1]` then `[−10^16]`, K=2 | Sum 1; mean 1/3 | Collapsing each bucket to one rounded scalar loses the correction. |
| Finite inputs whose intermediate sum overflows | Numerical-unavailable status | Never render Infinity as a valid result. |

Assert IDs, boundaries, statuses, counts, and small integer sums exactly. Keep rational expectations such as `700/3`, `305/3`, and `1/3` in documentation; for these small fixtures use `absolute error ≤ 1e−12 × max(1, |expected|)`. This is a fixture tolerance, not a universal precision guarantee. Exact contributors do not imply exact floating-point arithmetic.

## Appendix B. Evidence and access

### Repository evidence map

All repository references are at [the supplied commit](https://github.com/byronwall/explorEDA/tree/95832bd473884aeae23453af0888b4ca5187820d). Paths below identify source facts; recommendations throughout this report are proposals.

- **R1:** `packages/explorEDA/src/lib/dailyRollup.ts` — `utcPeriod`, `rollupByPeriod`, `TimeBucket`; complete UTC boundaries and source contributors. Its tests check leap days, offsets, year/week/month boundaries, and pooled unequal populations.
- **R2:** `packages/explorEDA/src/lib/aggregates.ts` — `AGGREGATIONS`, `summarizeGroup`, `poolAggregateRows`, `reduceNumbers`; five reducers, eligibility, pooling, and presently ordinary floating addition. `valueParsing.ts` owns date/numeric interpretation. Calendar `utcPeriod` currently accepts date strings; this proposal does not silently broaden its date-input contract.
- **R3:** `packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts` — `planTimeSeries`, `timePointFilters`; `TimeSeriesChart.tsx`; `timeSeriesTrace.ts`; `TimeSeriesTraceBody.tsx`; `TimeSeriesChart.test.tsx`. Distinct empty/invalid states, zero display policy, stable reference periods, selection, and exact trace records are present.
- **R4:** `packages/explorEDA/src/components/charts/useGetLiveData.tsx` — `useGetAllIds`, `useGetLiveIds`; `trace/traceTypes.ts` — `TraceSelection`, `TraceSource`; `trace/ChartTraceScope.tsx` — stale closure and `useTraceRevision`.
- **R5, additional pinned GitHub reads:** `packages/explorEDA/src/types/FilterTypes.ts`; `lib/chartPopulation.ts`; `hooks/CrossfilterWrapper.ts`; `hooks/applyFilter.ts`; `lib/rowIdFilters.ts`; `providers/lib/carryRowSelections.ts`; `providers/lib/dataLayerState.ts`. Complete files read. Relevant `DataLayerProvider.tsx` sections and `CrossfilterWrapper.test.ts` lines 1–200 were also inspected. These resolve exact-ID filters, chart-local populations, nonce advancement, and conditional positional-selection remapping.
- **R6:** `AGENTS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `CODING_STANDARDS.md`; prescribed React/TypeScript/pnpm workflow, compact editing, trace entry, three widths, docs/examples, and verification. `TimeSeriesSettingsPanel.tsx` and `definition.ts` supply current controls/types.
- **R7:** `packages/explorEDA/src/types/AnalysisProject.ts` — `AnalysisStep`, `AnalysisResultRow`; `lib/analysis/evaluateProject.ts` — `calculateFrame`, `aggregateFrame`, `evaluateAnalysisQuery`; `lib/calculations/functions/registry.ts` — `calculationFunctions`; no ordered-window step or cross-row scalar function exists in these files.
- **R8:** `packages/explorEDA/src/types/SavedDataStructure.ts`; `apps/demo/src/docs/pages/line.mdx`, `calculated-fields.mdx`; `apps/demo/src/demos/examples.ts` — `examples`, including `calendar-series`. These establish save boundaries and docs/example registration, not automatic support for new settings.

### All 30 complete packet files read before research

```text
AGENTS.md
README.md
CODING_STANDARDS.md
docs/agent-guide.md
docs/ui-defaults.md
docs/research/DIRECTION.md
packages/explorEDA/src/lib/dailyRollup.ts
packages/explorEDA/src/lib/dailyRollup.test.ts
packages/explorEDA/src/lib/aggregates.ts
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/components/charts/LineChart/definition.ts
packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts
packages/explorEDA/src/components/charts/LineChart/timeSeriesTrace.ts
packages/explorEDA/src/components/charts/LineChart/TimeSeriesTraceBody.tsx
packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.tsx
packages/explorEDA/src/components/charts/LineChart/TimeSeriesChart.test.tsx
packages/explorEDA/src/components/charts/LineChart/TimeSeriesSettingsPanel.tsx
packages/explorEDA/src/components/charts/useGetLiveData.tsx
packages/explorEDA/src/components/charts/trace/traceTypes.ts
packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/lib/analysis/evaluateProject.ts
packages/explorEDA/src/lib/calculations/functions/registry.ts
packages/explorEDA/src/types/SavedDataStructure.ts
apps/demo/src/docs/pages/line.mdx
apps/demo/src/docs/pages/calculated-fields.mdx
apps/demo/src/demos/examples.ts
docs/intent/research-ideas-100/ideas/R035-rolling-contributor-semantics.md
docs/intent/research-ideas-100/ideas/R049-ordered-difference-transforms.md
docs/intent/time-series-axes/implementation-plan.md
```

The last intent concerns axes and original observations; its proposed work is not a prerequisite for rolling mathematics. The attached mission prompt was also read completely. No decisive source was missing. Additional integration owners named in the plan—validators, DSL, trace-panel dispatch, chart-data/image export—still need their exact implementation inspected by Codex before edits; their behavior is not asserted here.

### Primary external sources

- **S1:** Observable Plot, [Window transform][S1].
- **S2:** pandas, [DataFrame.rolling][S2].
- **S3:** PostgreSQL, [Window function call syntax and frames][S3].
- **S4:** PostgreSQL, [Window functions tutorial][S4].
- **S5:** DuckDB, [Window functions][S5]. Stable documentation redirected to the 2.0 path during this review.
- **S6:** R slider, [slide_index][S6].
- **S7:** R slider, [slide_period][S7].
- **S8:** Polars, [DataFrame.rolling][S8].
- **S9:** Nicholas J. Higham (1993), [The Accuracy of Floating Point Summation][S9], SIAM Journal on Scientific Computing 14(4), 783–799; [DOI](https://doi.org/10.1137/0914050).
- **S10:** pandas, [Windowing operations, numerical precision note][S10].

[S1]: https://observablehq.com/plot/transforms/window
[S2]: https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.rolling.html
[S3]: https://www.postgresql.org/docs/current/sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS
[S4]: https://www.postgresql.org/docs/current/tutorial-window.html
[S5]: https://duckdb.org/docs/2.0/sql/functions/window_functions
[S6]: https://slider.r-lib.org/reference/slide_index.html
[S7]: https://slider.r-lib.org/reference/slide_period.html
[S8]: https://docs.pola.rs/api/python/stable/reference/dataframe/api/polars.DataFrame.rolling.html
[S9]: https://nhigham.com/wp-content/uploads/2023/10/high93s.pdf
[S10]: https://pandas.pydata.org/docs/user_guide/window.html

[R1]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/dailyRollup.ts
[R2]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/aggregates.ts
[R3]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/charts/LineChart/timeSeriesPlan.ts
[R4]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx
[R5]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[R6]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/docs/ui-defaults.md
[R7]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts
[R8]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/demo/src/demos/examples.ts

## Closing handoff

**Access:** complete attached prompt and all 30 complete packet files; additional pinned GitHub reads as listed. **Checked facts:** existing boundaries, reducers, eligibility, scopes, trace revisions, scalar/project seams, and exact-ID selection mechanisms. **Proposals:** every new rolling setting, estimator choice, support rule, UI, algorithm, budget, and milestone. **Deliverables:** [report.md](report.md) and [implementation-plan.md](implementation-plan.md), also packaged together in `rolling-window-methods.zip`.

**Open questions for integration, with defaults chosen:** verify the exact fresh-restore path and clear unbound positional selections; confirm the chart-data export owner; measure the stated workloads before fixing the performance ceiling. Later coverage metadata must define who attests collection and for which groups. None blocks starting M1 with unknown coverage, UTC, pooled observations, and the fixtures above.
