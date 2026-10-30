# Timeline concurrency and exact interval contributors

Build an opt-in concurrency mode inside the existing React Timeline, backed by a small pure TypeScript grouped-endpoint sweep over a saved finite analytical window. It should measure per-lane simultaneous intervals and conflict duration first, expose clearly named all-lane summaries, and resolve the exact source rows behind a chosen segment on demand. Use half-open occupancy, retain the existing inclusive brush contract, and preserve contributor boundaries even when adjacent counts are equal. This adds a complete analytical workflow without a scheduling engine, a new database, or quadratic contributor storage.

**Mission:** Methods, with enough product design to ship.  
**Repository baseline:** [byronwall/explorEDA at ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6](https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6).  
**Research date:** October 30, 2026.  
**Disposition:** Research and planning only. “Build” below is a planning recommendation, not authorization to implement.  
**Companion:** [Buildable implementation plan](timeline-concurrency-implementation-plan.md).

## 1. Decision and evidence boundary

### What is established

**Repository fact.** The attached packet contains 36 complete files at the named commit. All 36 were read across the research team; the complete CSV was parsed and checked. Supplemental files needed to resolve crossfilter ownership, record identity, trace dispatch, notebook writeback, and folder persistence were read through GitHub at the same exact commit. The packet remains authoritative. No current-main behavior has been substituted for it.

**Repository fact.** Timeline is presently a row visualization:

- Each valid source row produces one interval bar. Its lane and full-data domain derive from all eligible source IDs; the drawn population uses live IDs.
- Missing lanes, unreadable starts, unreadable present ends, and reversed ends are excluded by the planner. Missing ends are open and currently draw to the all-data domain end.
- A bar click selects one numeric source ID; Alt-click traces that one interval.
- The brush includes touching endpoints and saves paired date-range filters. Pointer brushing currently rounds to whole hours.
- Dark overlapping bars do not calculate occupancy or duration.

Evidence: [Timeline planner and tests][R1], [renderer, definition, and interaction tests][R2].

**Repository fact.** “All source” has an existing qualification: useGetAllIds(settings) applies the chart's localFilters. useGetLiveIds obtains the chart's crossfilter group and then facet restrictions. The crossfilter group excludes its own dimension's filter, while getAllData separately applies the owning chart's local population. This is the right starting point for avoiding self-filter feedback. The current hook treats an empty facet-ID array as unrestricted; the new analytical path must distinguish an absent facet from an explicitly empty one. Evidence: [live data hooks][R3], [crossfilter and local population][R10].

**Executed data check.** The bundled room-bookings CSV contains 673 records: 624 Confirmed, 46 Cancelled, and 3 Hold, across 12 rooms. All three holds have blank ends. Every nonempty timestamp has an explicit UTC Z suffix. No missing rooms or starts, invalid or reversed finite intervals, zero finite durations, duplicate booking IDs, or duplicate complete rows were found. The last open start is March 29, 2025 at 10:00 UTC, later than every finite end. The demo maps status to color and installs no status exclusion. This is a concrete reason to require an explicit horizon, and a concrete reason not to infer “confirmed only.” Evidence: [demo source and dataset][R9]. These checks inspected data; they did not run the application.

### What was and was not executed

Executed:

- Full packet extraction and complete source review across the team.
- Exact-reference supplemental GitHub reads.
- Current primary-source retrieval.
- CSV parsing and the data checks above.
- The delivered Python reference verifier: eight population/refresh scenarios, an analytical subwindow, selection and brush probes, explicit-offset DST examples, and 500 seeded random interval cases. It compares a grouped sweep with independent endpoint-cell membership scans; random cases also use integer-millisecond enumeration.

Not executed:

- explorEDA's Vitest suite, typecheck, pnpm check, Dashboard compiler, saved-data validator, rendered UI, browser gestures, host callbacks, or folder reopen.
- Product experiments in PostgreSQL, Perfetto, or Splunk.
- Production performance benchmarks.

The packet is a scoped complete-file source collection, not a full installed checkout. Proposed TypeScript, persistence, UI, notebook, and folder acceptance checks remain implementation work. The Python verifier is a research oracle, not the repository implementation and not a replacement for its test suite.

## 2. Stable recommendation register

The implementation plan uses these same IDs. Every recommended action is classified here; explanatory algorithms and acceptance cases elaborate these decisions.

| ID | Disposition | Recommendation and reason |
| --- | --- | --- |
| TC01 | **Build** | Use half-open occupancy [start,end), because adjacency should not create simultaneous positive-duration occupancy. |
| TC02 | **Build** | Require a saved finite analytical window, because an open interval has no finite measurable duration without a declared endpoint. |
| TC03 | **Build** | Separate source population, analytical window, and drawing viewport, because each answers a different question. |
| TC04 | **Build** | Preserve baseline eligibility rules, add explicit integer-millisecond exactness checks, and disclose exclusions, because invalid data must not become open occupancy. |
| TC05 | **Build** | Count duplicate source rows separately and retain typed lane keys, because record multiplicity and category identity are part of the observed data. |
| TC06 | **Build** | Ship per-lane count, busy time, total interval time, time above threshold, excess, and peak first, because these directly answer double-booking questions. |
| TC07 | **Build** | Add separately named global-row and occupied-lane summaries, because simultaneous records and simultaneously occupied resources are different quantities. |
| TC08 | **Build** | Use grouped endpoint events with lazy per-lane integration, because this yields exact summaries in O(n log n) time without scanning all lanes at every boundary. |
| TC09 | **Build** | Retain event boundaries and fetch source contributors on demand, because equal count does not imply equal membership. |
| TC10 | **Build** | Add a chart-owned semantic contributor filter with active-at and positive-overlap relations, because saved segment ordinals or source positions cannot express refresh-safe analytical intent. |
| TC11 | **Build** | Compute the owning strip before its own selection, but after external filters, local population, and facets, because selecting evidence must not erase that evidence. |
| TC12 | **Build** | Put the first surface in the existing Timeline as an exact step strip with segment tracing, because this keeps the measure beside the source intervals. |
| TC13 | **Build** | Add lane summaries and conflict highlighting as the next surface, because they make conflicts discoverable across many resources. |
| TC14 | **Build** | Add explicit concurrency trace and record routing, because one interval's current trace cannot explain a multi-interval duration. |
| TC15 | **Build** | Validate and test saved JSON, Dashboard text, host callbacks, and folder reopen together with each feature, because structural serialization alone does not preserve meaning. |
| TC16 | **Build** | Add a typed notebook interval finding with an explicit eligible-population scope, because existing row reducers cannot calculate interval duration correctly. |
| TC17 | **Build** | Preserve notebook interaction/writeback semantics and static-versus-mounted parity, because a persistent horizon and a transient click are different state. |
| TC18 | **Build** | Adopt the exact fixture and independent oracle as acceptance inputs, because endpoint and contributor errors need numerical proof. |
| TC19 | **Explore** | Add a centered interval index or worker execution only after measured latency or blocking exceeds budgets, because initial query-time scans avoid unnecessary infrastructure. |
| TC20 | **Explore** | Add provenance-bearing segment snapshots for existing charts, because they are useful secondary analysis outputs once their new row grain is explicit. |
| TC21 | **Defer** | Defer live cross-source prepared-table linkage, arbitrary interval joins, and a reusable global analysis registry, because the chart-owned specification is sufficient for this capability. |
| TC22 | **Defer** | Defer utilization, capacity calendars, weighted resource demand, recurrence, booking edits, and optimization, because they require additional semantics outside this mission. |
| TC23 | **Defer** | Defer notebook duration comparisons, selected-segment findings, and implicit capture of a dashboard's linked population, because their scope and unit contracts need separate explicit work. |
| TC24 | **Avoid** | Avoid pair enumeration or sampled time bins as the primary occupancy engine, because pairs can be quadratic and bins can lose exact boundaries. |
| TC25 | **Avoid** | Avoid full contributor arrays for every production segment, count-only coalescing as provenance, and silent numeric clamping, because they either waste quadratic space or change the answer. |
| TC26 | **Avoid** | Avoid silent status exclusions, automatic deduplication, inferred seconds-to-milliseconds conversion, and clock-relative horizons, because these change analytical meaning without an authored choice. |

## 3. Ranked question 1 — quantities, population, and time contract

### 3.1 Occupancy and eligibility

Let the analytical window be W=[A,B), with finite integer epoch milliseconds and A<B. The endpoint convention is fixed for method version 1, not a user-selectable toggle.

For an eligible source row i, let sᵢ be its start, eᵢ its finite end or an open marker, and ℓᵢ its typed lane key. Normalize using the existing timestampOf and isMissingValue helpers; do not replace them with Date.parse or new Date(rawText).

Define:

- aᵢ=max(sᵢ,A).
- bᵢ=min(eᵢ,B) for a finite end; bᵢ=B for an open end.
- A positive analytical interval exists only when aᵢ<bᵢ.
- Row i is active at t exactly when aᵢ≤t<bᵢ.

Apply the following rules in a deterministic order so exclusion totals reconcile:

| Case | Method contract |
| --- | --- |
| Missing or whitespace-only lane | Exclude from every occupancy family and report missing-lane; do not create a synthetic resource. |
| Missing or unreadable start | Exclude and report unreadable-start. |
| Null, undefined, blank, or whitespace-only end | Open; replace with B for this analysis only. |
| Present but unreadable end | Exclude; never reinterpret as an open end. |
| End before start | Exclude; never swap endpoints. |
| End equals start | Retain as a zero-duration event for disclosure/record inspection; it has no active occupancy and no effect on the peak. |
| Equal timestamps across rows | Process all events at the timestamp together; there is no intermediate measurable state. |
| One end equals another start | The first row is inactive and the second active on the following segment; they are adjacent, not a conflict. |
| Duplicate records | Count both source rows; identify them by different current source IDs even if every data value is equal. |
| Same-looking lane values with different types | Preserve categoryKey identity: numeric 1 and string "1" are different lanes. |
| Valid interval wholly outside W | Report outside-window, not invalid; it contributes zero. |
| Interval begins at B or ends at A | Zero positive overlap with W. |
| Cancelled, tentative, or unfamiliar status | Count if the explicit population includes it; status labels have no built-in occupancy semantics. |

The order matters: a row with both a missing lane and unreadable start gets one primary exclusion reason, consistent with the baseline planner. Additional raw details can be inspected without double-counting the exclusion funnel. [R1, R4]

The algorithm measures occupancy represented by the included intervals. It does not establish that a person actually attended a booking or that a room was physically occupied. The “conflict” label means more than the declared threshold of included intervals in the same lane. In booking data containing cancellations, an analyst who wants live bookings must author the corresponding filter.

### 3.2 Population contract

Define the populations before calculating any duration:

1. **Source universe S:** current source rows and prepared field values.
2. **Chart population P₀:** S restricted by Timeline localFilters. These are authored “which records belong to this analysis” predicates.
3. **External population P₁:** P₀ after workspace filters and other charts' linked selections, when the workspace uses linked selections.
4. **Facet population P:** P₁ intersected with this facet's constraints. Undefined facet IDs mean no facet restriction; an empty array means an empty population.
5. **Analytical eligibility:** apply the interval validity rules to P, then clip positive intervals to W.

The Timeline's own filters are omitted from P. This includes its existing brush, single-row selection, and new contributor selection. They filter linked targets and style the owning chart's selection; they do not change the measurement's source population.

The stable lane universe comes from valid rows in P₀ before external filters and facets, matching the existing stable reference idea. A lane may therefore remain visible with count zero. This is a list of represented categories, not an inventory of available physical resources and not a utilization denominator. Keep the strip's count-axis reference based on P₀ for the same accepted W, measure, and scope, so external filtering does not rescale its heights. Cache that reference plan until its source, preparation, population, or analytical settings change.

Rows drawer searches and drawer-only filters remain local to that drawer. They must not change the Timeline measure merely because a user searches its records. A manually authored Timeline population filter does change the calculation; the UI must call it “Population,” not imply that it is an ordinary mark selection. [R3, R5, R10]

### 3.3 Quantities and units

For a lane ℓ:

\[
c_\ell(t)=\sum_{i:\ell_i=\ell}\mathbf1[a_i\le t<b_i].
\]

Across lanes:

\[
C(t)=\sum_\ell c_\ell(t),\qquad
L(t)=\sum_\ell\mathbf1[c_\ell(t)>0].
\]

C is **row concurrency**, or active interval count. L is **occupied-lane count**. Neither is utilization.

For any selected count function X(t), with threshold K a nonnegative safe integer:

\[
\begin{aligned}
B_X &= \int_A^B \mathbf1[X(t)>0]\,dt,\\
T_X &= \int_A^B X(t)\,dt,\\
D_{X,K} &= \int_A^B \mathbf1[X(t)>K]\,dt,\\
E_{X,K} &= \int_A^B \max(X(t)-K,0)\,dt,\\
P_X &= \max_{t\in[A,B)}X(t).
\end{aligned}
\]

| Measure | Meaning and unit |
| --- | --- |
| Busy duration B | Elapsed milliseconds with at least one active interval in the scope. |
| Total interval duration T for cℓ or C | Sum of clipped interval durations, in interval-ms; simultaneous rows each contribute. |
| Occupied-lane time T for L | Integral of occupied lane count, in lane-ms; also the sum of per-lane busy durations. |
| Duration above K, D | Elapsed milliseconds with a count strictly greater than K. |
| Excess occupancy E | Integral of the amount above K, in interval-ms or lane-ms; not just the time above K. |
| Peak P | Maximum count on a positive-duration segment; no transient endpoint-only spike. |
| Duration at peak | Sum of durations of all segments attaining P; it need not be one continuous run. |

“Above 1” means 2 or more. “At least 1” would describe a different predicate and is not the threshold wording.

For double bookings use cℓ>1. Across all lanes, additionally define:

\[
H_K(t)=\sum_\ell\mathbf1[c_\ell(t)>K],\qquad
D_{\mathrm{any},K}=\int_A^B\mathbf1[H_K(t)>0]\,dt.
\]

D_any is the elapsed time when **any lane** exceeds K. The sum ΣℓDℓ,K is lane-time and can exceed D_any if two lanes conflict simultaneously. Similarly, sum of lane excess is different from global excess.

Useful identities at K=1 are:

\[
T_C=\sum_i(b_i-a_i)=\sum_\ell T_\ell,
\quad T_L=\sum_\ell B_\ell,
\quad E_{C,1}=T_C-B_C,
\quad \sum_\ell E_{\ell,1}=T_C-T_L.
\]

These identities are independent acceptance checks, not alternate names for the quantities.

**First shipment:** per-lane row concurrency, busy duration, total interval duration, duration above 1 or another constant K, excess, and peak, plus a plainly labeled all-lane row-count strip. This is enough to find and explain double bookings. The same core computes the all-lane occupied-lane and any-lane-conflict families; the second surface exposes them with lane summaries. TC06–TC07.

### 3.4 Means, zero denominators, and unused utilization

Optional descriptive means are:

- Mean active intervals over W: T_C/(B−A).
- Mean occupied lanes over W: T_L/(B−A).
- Mean active intervals while busy: T_C/B_C.

A valid window with no eligible positive intervals has zero durations and peak zero. Its duration at peak zero is B−A. Its mean while busy is unavailable because B_C=0; it is not zero and not infinity.

A zero-length or reversed analytical window is an invalid specification, not an empty successful result. A missing mapped field is an unavailable analysis, not a zero-occupancy observation. An existing field whose values are all invalid yields zero positive occupancy with explicit exclusion counts.

Do not ship “utilization %” from these values. A resource availability schedule or an explicitly defined constant resource inventory and available-time denominator would be necessary. Merely counting lane labels found in filtered data is not that denominator. TC22.

### 3.5 Analytical window, viewport, and source filter are separate

| Control | Effect |
| --- | --- |
| Population, workspace, linked, or facet predicate | Changes which source intervals are eligible. |
| Saved analytical window [A,B) | Changes the finite interval over which durations are integrated and open ends are bounded. |
| Viewport clipping or responsive drawing | Changes visible geometry only; never changes the calculated numbers. |

In the first concurrency mode, the plot is fitted to the explicitly saved W. Finite bars are clipped to W, open bars extend to B, and continuation marks indicate original portions outside W. The trace shows raw endpoints and clipped endpoints separately. This avoids an open bar visually stopping before the end of the duration attributed to it.

There is no new pan/zoom subsystem in the first milestone. W is an analytical setting, not a disguised viewport setting. A later viewport range must be separate; the supplied viewport-only proof demonstrates that changing it must not change the result. When concurrency mode is disabled, the legacy Timeline rendering/domain behavior remains its existing mode.

On enable, offer a concrete finite window using readable source bounds as a draft; for the room-bookings example, author a window explicitly extending beyond the last hold. Do not silently choose “now,” continuously extend B, or pretend the largest finite end settles an open hold. When no defensible finite draft exists, leave the feature in its compact setup state until A and B are valid. This is ordinary parameter entry, not an outside-demand gate. TC02–TC03.

### 3.6 Precision, units, DST, and refresh

**Baseline fact.** timestampOf reads finite numeric values as epoch milliseconds. Date text goes through parseDateText, which reads offset-free forms as UTC and rounds textual fractional seconds to milliseconds. The analytical feature must use these functions. It must not infer seconds or microseconds by magnitude. [R4]

**Proposed exactness boundary.** Require parsed endpoints and saved bounds to be safe integer milliseconds within the JavaScript Date display range. A numeric fractional-millisecond value or a finite numeric value outside that range receives an explicit analytical exclusion. Do not silently round it. This is an additional eligibility rule for the exact millisecond method, not a new timestamp parser. Raw and parsed values remain inspectable.

Safe endpoints do not guarantee safe sums. Check the window width, each duration, each duration-times-count product, and every accumulated metric with safe-integer arithmetic. If a metric overflows, return an explicit overflow/unavailable result for that metric while preserving usable counts and diagnostics; never display a rounded number labeled exact. BigInt accumulation is a possible future alternative with explicit serialization, not required for ordinary millisecond datasets.

JavaScript's time-value model uses integral milliseconds and does not represent UTC leap seconds. Its Date range is ±8.64×10^15 ms, narrower than Number.MAX_SAFE_INTEGER. These are representation limits, not benchmark-derived row limits. [E9]

Compute elapsed duration by subtraction of UTC instants. For example, 01:30−05:00 to 03:30−04:00 across spring daylight saving time is exactly 3,600,000 ms; the repeated autumn 01:30 with offsets −04:00 then −05:00 is also 3,600,000 ms. A calendar day and 24 elapsed hours are different operations in zones with daylight saving changes. Do not add calendar bucketing or time-zone preparation as a dependency. [E8]

Add a precision-aware analytical formatter: baseline timelineTime omits seconds/milliseconds and timelineDuration can round a positive short span to “0 min.” New traces show exact ISO UTC bounds and integer milliseconds alongside readable durations. Clip first; an unsafe original duration must not invalidate a safe clipped contribution.

Save concrete W, threshold, display scope, method version, and authored population controls. Reload and data refresh reuse those settings and recompute results from current data. Cached segments, source IDs, peaks, contributor lists, and trace payloads are derived state, not persisted results.

## 4. Ranked question 2 — algorithm and contributors

### 4.1 Compare the three computational choices

| Approach | Assessment |
| --- | --- |
| Grouped endpoint sweep | **Choose.** Exact counts, durations, and peaks follow from the intervals between sorted unique endpoints. It is independent of pixel width and time-bin size. |
| Overlap-pair enumeration | **Reject as the primary engine.** Useful if the question is explicitly “which pairs conflict,” but pair output can be quadratic and does not directly define duration above a threshold. |
| Prepared segment summary table | **Use later as an output.** It still needs correct interval computation upstream and introduces a new row grain and lineage boundary when opened in ordinary charts. |

A pairwise sum is especially misleading. For three identical 10 ms intervals, pairwise overlap duration is 30 ms, union busy duration is 10 ms, total interval duration is 30 interval-ms, duration above 1 is 10 ms, and excess above 1 is 20 interval-ms. Pairwise sums integrate choose(C(t),2), not excess occupancy.

Princeton's primary sweep exposition provides the endpoint/active-set pattern, but its example uses closed intervals and assumes no duplicated intervals. Adopt the event organization, then explicitly replace those semantics with this mission's half-open, duplicate-preserving contract. [E2] The complexity conclusions here are derivations for the proposed algorithm, not measured product performance.

### 4.2 Pure core boundary

Proposed modules under packages/explorEDA/src/lib/timelineConcurrency/:

- **types.ts:** method settings, normalized interval, exclusion reasons, compact segment, summary, contributor query, and result status.
- **normalize.ts:** baseline parser calls, validity, finite-horizon clipping, and typed lanes.
- **sweep.ts:** grouped events, global summaries, per-lane lazy accumulators, and endpoint arrays.
- **contributors.ts:** exact membership queries and source-row resolution.
- **population.ts:** adapter/resolver contracts, keeping source selection outside the numerical loop.

The computational core accepts IDs/columns or normalized intervals and a frozen population revision. It has no React, store mutation, DOM, wall clock, network, or scheduling dependency. The React adapter obtains source/filtered/facet populations and uses the core. This keeps testing small and lets notebook evaluation reuse the method.

### 4.3 Grouped event procedure

For each positive clipped interval, create a start event at aᵢ and end event at bᵢ. Always include A and B as boundaries. Zero events produce no occupancy events.

1. Sort events by timestamp.
2. For the current count state, integrate the elapsed segment leading up to the next timestamp.
3. Group every end and start at that timestamp.
4. Remove ending intervals and add starting intervals; evaluate counts and peaks only after the whole group.
5. Emit the state on the positive-duration interval to the next timestamp.
6. Close all accumulators at B.

No intermediate state during a timestamp group contributes a peak or duration. The practical implementation can apply ends before starts, but correctness comes from atomic group observation.

Retain a boundary even if the net global count change is zero. Row A ending and row B starting at the same timestamp is still a contributor change. Likewise, an endpoint in one lane can change the all-lane membership without changing occupied-lane count.

Maintain:

- Current total active row count C.
- Current count per lane.
- Current occupied-lane count L, updated when a lane crosses zero.
- Current number of lanes above K, H_K, updated when a lane crosses K.
- Global summary accumulators and per-lane last-event timestamp/accumulators.

Before updating a touched lane, integrate its previous count only from its own previous event time. At B close every lane once. Do not scan every lane for every global segment. The total number of touched-lane updates is bounded by the event count.

### 4.4 Atomic identity and permitted coalescing

The common global atomic partition is every positive interval between consecutive distinct clipped endpoints in the current population, including idle segments. It is a complete partition of W. A segment reference is:

- Plan revision.
- Scope and typed lane/facet identity.
- Exact startMs and endMs.

It is never just “segment 17.” A source change can insert a boundary before or inside that segment.

There are two different coalescing operations:

- **Visual coalescing:** adjacent equal heights may draw as one continuous step. Hit testing still locates the underlying atomic interval using the uncoalesced endpoint array.
- **Semantic coalescing:** adjacent cells can be presented as one exact-contributor span only if their contributor sets are equal for the requested scope. A per-lane stream may therefore omit boundaries caused solely by other lanes.

Threshold-run merging is also permitted for summarizing a continuous above-threshold episode. Its records are the **union of intervals involved over that episode**, and its trace must retain the constituent segments. It must not describe that union as one simultaneous set.

No cryptographic hashing or contributor hash manifest is needed. The core retains row identity in its interval/event representation; revision and exact boundaries identify a transient result.

### 4.5 On-demand exact contributors

For an atomic cell [u,v), row i contributes when:

\[
a_i\le u\quad\text{and}\quad b_i\ge v.
\]

Equivalently, query aᵢ≤u<bᵢ when [u,v) is known to be an atomic cell for that scope. For an arbitrary selected window Q=[u,v), the involved-row union instead uses:

\[
a_i<v\quad\text{and}\quad b_i>u.
\]

Those are different contracts. For a union of separated conflict runs, test intersection with the actual qualifying run union; do not use only its outer bounding box. Store sorted, merged qualifying runs and use binary search for the first run whose end exceeds an interval's start; then test that run's start against the interval's end. This returns a union-of-witness-rows query in O(n log r+k) for r runs and k output rows. For any-lane-conflict witnesses, use the qualifying runs for the row's own lane so a nonconflicting lane is not attributed as a cause. Avoid an interval-by-run Cartesian scan.

The first implementation scans the normalized interval array when the user opens a trace or commits a selection. It returns exact current source IDs and clipped contributions. Hover obtains counts and bounds by binary search without materializing contributors. Reuse one current trace result and discard it when the plan revision changes.

For an all-lane occupied-lane segment, show both the occupied lane keys and the source rows establishing each lane. L is the number of distinct active lanes, not the length of the source-ID list.

### 4.6 Complexity and measurable optimization criteria

Let n be the positive clipped intervals, m the distinct endpoints, g the represented lanes, k the contributors returned by a query, and p the overlap-pair output size.

| Operation | Proposed cost |
| --- | --- |
| Eligibility/normalization over N population rows | O(N) time and O(n) retained intervals. |
| Sort endpoint events | O(n log n) time, O(n) event storage. |
| Global summary and atomic partition | O(n+m) after sorting; m≤2n+2. |
| Per-lane summaries using lazy integration | O(n+g), not O(mg). |
| Retained core result | O(n+m+g) for numerical intervals/events/segments; O(N+m+g) if per-input diagnostic IDs/classifications are retained. Both are linear. Do not materialize a dense lane-by-global-segment matrix. |
| First-version exact segment query | O(n+k), or O(nℓ+k) with lane buckets. |
| Count-only pointer hit test | O(log m), with no source-ID expansion. |
| Summary involved-row query over r merged runs | O(n log r+k), using per-lane runs for lane-conflict witnesses. |
| Full pair enumeration | At least Ω(p) output; p may be Θ(n²). |
| Full contributors for every segment | Θ(n²) memberships in nested-interval cases. |

The fixture JSON intentionally includes full contributor arrays because it is tiny and serves as an oracle. That is not the production storage format.

Use performance budgets as **proposed measurements**, not fabricated capacity limits:

- Measure parse/normalize, sorting, sweep, React render, contributor query, and trace rendering separately.
- Test 1k, 10k, and 100k rows; include nested intervals, all-equal endpoints, many lanes, many duplicates, and almost all rows filtered out. Record actual endpoint count and maximum concurrency.
- If p95 main-thread core work exceeds 50 ms on the declared test machine, evaluate worker execution or cancellable scheduling; retain exact results.
- If committed contributor lookup repeatedly exceeds 100 ms at p95, evaluate a centered interval index with a documented O(log n+k) reporting guarantee and O(n) storage.
- If a page paints beyond its frame budget, reduce drawing work or aggregate pixels conservatively. Keep all exact semantic boundaries available to hit testing and trace.
- Estimate retained bytes from actual arrays and measured object overhead. Bound any query cache by bytes and current revision; do not install a universal row-count cutoff based on guesswork.

A generic augmented interval BST does not automatically have the centered-tree reporting guarantee. Verify the chosen structure before claiming it. No indexing or worker experiment was executed in this mission. TC19.

## 5. Ranked question 3 — analytical workflow and integration

### 5.1 Choose the surface

| Surface | Decision |
| --- | --- |
| Concurrency strip inside Timeline | First surface. Exact step heights show simultaneous counts and widths show elapsed time beside the source bars. |
| Per-lane conflict highlighting | Second surface. Excellent for locating affected resources, but coloring bars alone cannot explain exact duration or changing contributors. |
| Existing charts over segment rows | Secondary output. Useful for duration-weighted comparisons, but not the first source-record inspection workflow. |

The first mode uses the saved analytical window as its fitted time axis and renders an exact count strip beneath the interval lanes. A compact control selects all lanes or a specific lane. Default K=1 is explicitly labeled “Above 1”; in a single-lane scope, that is a conflict. The global view says “Active intervals,” not “Double bookings.”

The second milestone adds occupied-lane mode, a lane summary table in the existing temporary chart-data/trace surfaces, and same-lane conflict emphasis. Keep ordinary interval colors tied to the existing color field; use a distinct border/underlay treatment for conflict so status color does not acquire a second meaning. Counts and duration labels carry meaning without color.

### 5.2 Exact user journey

Using the proof data:

1. Add a Timeline with lane, start, and end fields. In settings enable Concurrency.
2. Set the UTC analytical window to January 15, 2026, 09:00–09:12. Set K=1. Set the population predicate included=true.
3. Choose lane A for the first double-booking question. The summary reports 240,000 ms above 1, 360,000 interval-ms of excess, and peak 3.
4. Move over a strip cell. The chart header shows its exact UTC bounds, elapsed duration, active interval count, and threshold relationship.
5. Click the cell to filter linked charts and Rows to its exact active-at contributors. A single click commits one chart-owned semantic selection.
6. Alt-click or Alt-Enter that cell to open the trace without changing filters. The trace shows raw endpoints, clipped endpoints, the window, and the exact rows.
7. For the all-lane cell 09:04–09:05, the source contributors are A2, A3, A4, and B2. The lane-A subset is A2, A3, A4. A3 and A4 are identical records with different source IDs, so both count.
8. To ask who was involved over 09:03–09:07, use the explicit positive-overlap range query. Seven rows were involved, but no more than four were active simultaneously. The trace states both facts.
9. Continue through linked status/team charts or the Rows drawer. Their filters may change the Timeline's external population, but the Timeline's own selection does not.
10. For a durable notebook explanation, author the same finite-window/lane configuration and a typed interval finding. Explicitly author any population predicates needed to match the intended notebook question. The first notebook finding does not pretend to capture arbitrary other-chart dashboard selections.

The current hour-snapping brush cannot author this 12-minute proof window precisely. The proposed analytical controls accept exact instants; browser acceptance should enter them or restore the companion settings. The legacy brush stays available for its existing inclusive record-overlap function. [R2]

### 5.3 Selection contract and filter ownership

Add a Timeline-owned interval-contributors Filter variant. It contains:

- Version and mapped lane/start/end fields.
- The same fixed analytical window as the owner.
- Either active-at plus atMs, or overlaps plus a positive half-open range.
- An optional typed lane value.
- Typed facet equality predicates captured from the clicked facet.

The owner definition compiles the multi-field row predicate once per filter update, including its localFilters. It calls fieldGetter once per field outside the per-row closure. External chart/workspace filters compose through crossfilter. Owner local population must also constrain the emitted linked selection; otherwise a click could select records the mark never counted.

Do not send the new filter through scalar applyFilter(value,filter) and expect it to read multiple columns. Initially allow it only in Timeline filters, not workspaceFilters, Rows filters, or localFilters. Add explicit validation, manual filter editing, status/chip labels, chart clearing, and exporter support.

On a strip click:

- Choose a declared instant inside the atomic cell; keyboard activation uses the cell start. The fixture's saved instant is 09:04.
- Persist the active-at query, not its resolved numeric ID list.
- Replace the owner's previous temporal/row output selection in one update, so a stale __ID filter cannot intersect away the new contributor set.
- Preserve source localFilters.
- Capture the current facet predicates so linked targets receive the same facet restriction.
- A repeated click on the same semantic query toggles it off.

Changing mappings, W, lane scope, facet configuration, or local population clears an incompatible contributor selection in the same update. A threshold-only edit can retain active-at: who is active at a time does not depend on K. Disabling concurrency clears its semantic output filter while retaining the authored analytical configuration for later re-enable.

Legacy bar clicks retain their single-row behavior, but replace any active contributor selection. Creating a legacy brush similarly replaces the new temporal selection. Clearing chart filters or clicking true empty plot space clears owner output filters without removing W, threshold, or local population.

Count-zero spans have no filled occupancy mark, so a plain click there preserves the existing empty-space clear gesture. Alt inspection or an explicit keyboard/table target can still explain the idle cell and its exact bounds. An empty-result contributor query can be authored through the query control; it is not created by disguising empty plot space as a mark.

### 5.4 Refresh and identity

Existing __ID values are current numeric row positions. The supplemental carryRowSelections implementation compares full row content excluding __ID, can rebind unique matching rows, and drops an affected filter when a record changed, disappeared, or has ambiguous duplicates. It is not a persistent business-key API. [R10]

The new semantic query intentionally has different behavior:

- A saved “active at 09:04 in lane A” query re-evaluates at that same instant.
- If a new row starts at 09:04:30, it is not part of that active-at result.
- The containing segment may shrink from 60,000 to 30,000 ms.
- The former segment trace closes or re-resolves under the new revision; it never combines old bounds with new IDs.
- A saved positive-overlap query for 09:04–09:05 does include the new row, because it asks a different question.

A vanished lane returns an empty valid selection and zero metrics for that requested category; a missing mapped field returns unavailable. On refresh, fixed W never auto-extends.

### 5.5 Trace records

Add explicit timeline-concurrency-segment and timeline-concurrency-summary trace variants, or one discriminated concurrency trace with a target subtype. Include:

- Method version, [) boundary policy, window, measure, K, lane/facet scope, and population description.
- Plan revision and exact segment bounds or qualifying-run query.
- Count, elapsed duration, and measure-specific contribution.
- Current exact source IDs resolved on demand.
- Each contributor's raw endpoints, parsed endpoints, clipped interval, open-end flag, and clipping reasons.
- Excluded, zero-event, and out-of-window counts with reachable records.

For a duration summary, source IDs are the union of rows involved in qualifying segments. They are not “the simultaneous contributors” to the whole total. Avoid inventing an additive per-row allocation of union busy time or excess occupancy: those are set/segment properties. Total interval duration is additive per row; union duration and excess require the segment calculation.

Integration is explicit: traceTypes.ChartTrace, ChartTracePanel.TraceBody, and traceRows.traceRowIds must all recognize the new aggregate. The last connection allows existing source-record/query-flow navigation to receive its contributing rows. Reuse ChartTraceScope's stale-revision behavior. Leave findRow pointing to the source interval trace initially, since one row may belong to many segments. [R7, R11]

### 5.6 Wide, intermediate, narrow, and accessibility

| Width | Reading behavior |
| --- | --- |
| 1280 px | Full Timeline and strip; inline compact summary; settings stay beside the plot when space allows; temporary trace keeps the original context visible. |
| 783 px | Follow the existing view-only responsive grid; show essential count/threshold/duration readouts and move secondary summary values into the trace/chart-data surface. Do not change saved layout. |
| 390 px | Single-column view; keep window and current scope visible; horizontally scroll exact record tables; use the existing sheet/details behavior. Avoid compressing many lane labels into unreadable text. |

Use keyboard navigation among exact segments, Enter/Space for selection, Alt-Enter for trace, visible focus, and accessible names containing bounds and count. A count-only coalesced glyph must still expose atomic boundaries for keyboard/record inspection. Keep actions in the header, avoid an Inspect button, preserve focus return, and mark editor-only controls for image-export omission.

For dense lanes, the lane selector and summary table provide a legible path without changing the saved layout or silently omitting records. A visible “first N shown” disclosure applies to any bounded preview; all counted records remain accessible. These are proposed checks at the repository's standard widths, not screenshots or tested observations. [R12]

### 5.7 Notebook boundary

Current findings are row metrics or share/difference comparisons. evaluateFindings treats every truthy kind as a comparison; FindingResult.plan and OperandRecords are tied to MetricCardPlan and MetricCardTraceBody. A new interval finding therefore requires explicit type, dispatch, evaluator, compiler, validator, result, and records integration. It must not become another AggregateAggregation pretending to operate on ordinary independent rows. [R8, R11]

First notebook contract:

- Kind timeline-concurrency, owner chart reference, a specific interval metric, and target=analysis.
- Use the owner's finite W, threshold, lane scope, and method settings.
- Evaluate notebook eligible population: source, workspace filters, owner localFilters, and explicitly authored facet predicates.
- Ignore the owner's mark selection and other notebook chart selections for the analysis target.
- Label this scope in prose and records.
- Support raw source fields with matching initial and mounted evaluation first. If a required calculated field or nontrivial conversion is unsupported by static evaluation, report unsupported; do not substitute zero or show a different mounted number.
- Return interval-specific records and a segment calculation, not a fake row reducer.
- Defer selected-segment findings and duration share/difference until their unit and scope contracts are explicit.

Notebook settings writeback persists W, K, and presentation settings. Existing writeback deliberately strips click/brush filters from interaction updates, so a clicked active-at query remains transient in .eda.md unless authored as text. A structural edit to W, mappings, scope, or population must nevertheless remove an incompatible authored contributor filter in the same text writeback. That narrow cleanup ships with the first Timeline increment because the Timeline can already appear in notebooks; the new finding evaluator ships later. Saved JSON or an explicitly exported Dashboard can carry filter state separately. Dashboard export currently excludes findings; notebook text is their source. Do not claim a Dashboard file preserves notebook findings. [R6, R8, R11]

## 6. Ranked question 4 — primary methods and three strong comparisons

### 6.1 Foundational semantics

Allen's interval algebra distinguishes “meets” from “overlaps,” providing a useful vocabulary for adjacency. It does not dictate this application's half-open occupancy convention and does not justify adding a temporal constraint solver. Here the data contain concrete timestamps, so arithmetic over finite intervals is sufficient. [E1]

PostgreSQL's range notation makes inclusion, exclusion, empty ranges, adjacency, intersection, and union explicit. Its temporal OVERLAPS operator also illustrates why copying a named operation without reading its edge cases is risky: it treats equal endpoints as an instant and orders reversed endpoint pairs. This mission instead assigns zero occupancy to zero-length events and excludes reversed records. [E3, E4, E8]

### 6.2 Product comparison

| Product or approach | Adopt in explorEDA | Scope to leave behind |
| --- | --- | --- |
| PostgreSQL range/multirange operations | Explicit [) bounds, clipping by intersection, separate overlap/adjacency concepts, and union busy time. | A database service, exclusion constraints preventing booking writes, and treating range union as a concurrency/provenance result. |
| Perfetto interval counters and Data Explorer | Count-over-time with grouping; separate clipped analytical intervals from original intervals; return from a result to source records. | A trace-ingestion stack, SQL graph editor, scheduling hierarchy, and copying a span join that disallows overlapping inputs. |
| Splunk concurrency | Clear start/duration units and explicit naming of which count is returned. | Start-only concurrency as the duration engine, numeric clamping, or a paid service dependency. |

**PostgreSQL.** The documented range constructors and operators are a good semantic reference. range_agg produces a range union; by itself that result loses multiplicity and source identities, so it cannot supply the requested concurrency counts or exact segment contributors. That last conclusion follows from union's information loss. Keep the conceptual model without adding a query engine. [E3–E5]

**Perfetto.** Its standard library exposes intervals_overlap_count and intervals_overlap_count_by_group, closely matching the intended counter representation. Data Explorer distinguishes filtering source intervals from clipping their intersections and supports interval-aware exploration. Its older SPAN_JOIN warns that spans must not overlap within a partition; using it directly on double-booked lanes would violate its assumptions. Also, one merge helper documents closed/epsilon semantics, so do not assume every Perfetto helper shares this mission's endpoint rules. [E6–E7, E10]

**Splunk.** The current manual defines concurrency at each event's start and says this is not the total set of events overlapped over that event's lifetime. An ordinary average of those per-event values is not time-weighted occupancy. Its documented limit can clamp counts with a warning; exact analysis here should instead expose a resource or numeric failure rather than silently change the value. [E11]

No product was installed or run for this comparison. These are primary-documentation observations plus explicitly identified algorithmic deductions.

## 7. Ranked question 5 — exact proof cases

### 7.1 Fixture identity and input

Files:

- [timeline-concurrency-fixture.json](timeline-concurrency-fixture.json)
- [timeline-concurrency-expected.json](timeline-concurrency-expected.json)
- [verify-timeline-concurrency.py](verify-timeline-concurrency.py)

The fixture has 20 row envelopes. fixtureId is a test label outside each row's data; sourceId is its current zero-based source index. A3 and A4 contain exactly equal source data and must still count separately.

W is **2026-01-15T09:00:00.000Z to 2026-01-15T09:12:00.000Z**, or **1768467600000 to 1768468320000 ms**. Its duration is **720000 ms**. K=1. The explicit population is included=true. A cancelled row remains included.

| Label | Original interval, UTC on January 15 | Lane / interpretation |
| --- | --- | --- |
| A1 | 08:58–09:02 | A; left clipping. |
| A2 | 09:02–09:06 | A; adjacent to A1. |
| A3, A4 | Each 09:03–09:05 | A; exact duplicate source data, distinct rows. |
| A5 | 09:05–09:07 | A. |
| A6 | 09:06–09:08 | A; replaces A2 at equal lane count. |
| A7 | 09:10–open | A; finite horizon is 09:12. |
| B1 | 09:01–09:04 | B. |
| B2 | 09:04–09:06 | B; adjacent replacement at equal global count. |
| B3 | 09:07–09:09 | B. |
| B4 | 09:11–09:14 | B; cancelled, included, right clipping. |
| Z1 | 09:04–09:04 | A; zero-duration event. |
| ML1, MS1, IS1, IE1, RE1 | See exact JSON | Missing lane, missing start, invalid start, invalid end, reversed end. |
| OUT1, OUT2 | 08:56–08:58; 09:12–09:13 | B; outside positive overlap with W. |
| POL1 | 09:09–09:10 | A; explicitly excluded by included=false. |

The base funnel is 20 source rows → 19 population rows → 5 invalid, 1 zero event, 2 outside-window, and 11 positive clipped intervals. Open and clipped flags describe contributing rows; they are not additional disjoint exclusions.

### 7.2 Every base atomic segment and contributor set

All cells below are half-open, exactly **60000 ms**, on January 15, 2026 UTC. This is the common refinement across all lanes.

| Segment | Lane A contributors | Lane B contributors | C / L |
| --- | --- | --- | --- |
| 09:00–09:01 | A1 | none | 1 / 1 |
| 09:01–09:02 | A1 | B1 | 2 / 2 |
| 09:02–09:03 | A2 | B1 | 2 / 2 |
| 09:03–09:04 | A2, A3, A4 | B1 | 4 / 2 |
| 09:04–09:05 | A2, A3, A4 | B2 | 4 / 2 |
| 09:05–09:06 | A2, A5 | B2 | 3 / 2 |
| 09:06–09:07 | A5, A6 | none | 2 / 1 |
| 09:07–09:08 | A6 | B3 | 2 / 2 |
| 09:08–09:09 | none | B3 | 1 / 1 |
| 09:09–09:10 | none | none | 0 / 0 |
| 09:10–09:11 | A7 | none | 1 / 1 |
| 09:11–09:12 | A7 | B4 | 2 / 2 |

The endpoint at 09:02 changes A1 to A2 while C remains 2. At 09:04 it changes B1 to B2 while C remains 4. At 09:06 lane A changes A2 to A6 while c_A remains 2. Any implementation retaining only count changes loses these exact contributors.

### 7.3 Exact totals

| Measure | All source intervals C | Occupied lanes L |
| --- | ---: | ---: |
| Busy duration, ms | 660000 | 660000 |
| Integrated count | 1440000 interval-ms | 1080000 lane-ms |
| Duration above 1, ms | 480000 | 420000 |
| Excess above 1 | 780000 interval-ms | 420000 lane-ms |
| Peak | 4 intervals | 2 lanes |
| Duration at peak, ms | 120000 | 420000 |

| Measure | Lane A | Lane B |
| --- | ---: | ---: |
| Busy duration, ms | 600000 | 480000 |
| Total interval duration, interval-ms | 960000 | 480000 |
| Duration above 1, ms | 240000 | 0 |
| Excess above 1, interval-ms | 360000 | 0 |
| Peak | 3 | 1 |
| Duration at peak, ms | 120000 | 480000 |

Any-lane conflict duration is **240000 ms**. Summed lane conflict duration happens to be the same in this fixture; that equality is not a general identity. The rows involved in any same-lane conflict are A2, A3, A4, A5, and A6.

Mean active intervals over W is exactly 1440000/720000=2. Mean occupied lanes is 1080000/720000=1.5. These are counts averaged over time, not utilization.

### 7.4 Linked filters, facets, reload, and changed source

Every scenario's atomic segments, contributor labels/current IDs, exclusions, and summary families are in the expected JSON.

| Scenario | Exact result to preserve |
| --- | --- |
| Base | Busy 660000 ms; total 1440000 interval-ms; global peak 4; any-lane conflict 240000 ms. |
| Explicit status=confirmed | Busy 540000 ms; total 1260000; global peak 4; conflict 240000. It removes the open hold as well as the cancellation. |
| Facet A | Busy 600000 ms; total 960000; global-within-facet peak 3; conflict 240000. |
| Empty facet | All durations and peak zero; full-window duration at peak zero; no fallback to the full population. |
| Zero event only | Zero occupancy and peak; event remains disclosed. |
| Population filter removed | POL1 fills the idle minute: busy 720000; total 1500000; global peak 4. |
| Restored base | Every value equals base after abstract settings JSON roundtrip; this does not claim application persistence was tested. |
| Changed source | Busy 600000; total 1380000; global peak 5 for 30000 ms; any-lane conflict remains 240000. |

The changed source closes A7 at 09:11, removes B4, adds A8 at 09:04:30–09:05:30, reverses row order, and reassigns source positions.

The active-at query for 09:04 in lane A still resolves A2,A3,A4, with numeric source positions changing from [1,2,3] to [18,17,16]. Its global containing cell changes from [09:04,09:05) to [09:04,09:04:30). A positive-overlap query for the original minute instead resolves A2,A3,A4,A8.

The wider positive-overlap query [09:03,09:07) involves seven distinct rows in base, while peak simultaneous rows is four. After refresh those figures become eight and five. This directly demonstrates why window contributors cannot be labeled a simultaneous set.

The legacy inclusive brush [09:02,09:06] retains A1 at its ending boundary, A6 at its starting boundary, and zero event Z1. Its raw linked filter also admits ML1 and RE1, which the interval planner excludes. Preserve this as a distinct record-selection contract; do not use raw brush membership as an occupancy proof.

Viewport-only clipping to 09:03–09:07 leaves the base totals unchanged. Changing the analytical window itself to [09:03,09:07) instead gives busy 240000 ms, total 780000 interval-ms, global duration above 1 of 240000 ms, excess 540000 interval-ms, and peak 4.

### 7.5 Invariants for an independent implementation

- Atomic cells are positive length, disjoint, ordered, and cover W exactly, including idle time.
- Every positive interval contributes +1 and −1; the state after B is empty.
- Counts are nonnegative, and occupied lanes never exceed active rows.
- Atomic row count equals the exact contributor count; occupied lanes equal distinct contributor lane keys.
- Integral C equals the direct sum of clipped row durations.
- Sum of per-lane integrals equals global interval duration.
- Integral L equals sum of per-lane busy durations.
- D_X,0=B_X and E_X,0=T_X.
- At K=1, global excess equals total interval duration minus global union busy duration.
- Sum of lane excess at 1 equals total interval duration minus occupied-lane time.
- D_X,K+1≤D_X,K and E_X,K+1≤E_X,K.
- Adding a duplicate adds exactly its clipped duration to total interval time and one to the count wherever it is active.
- Splitting one interval into adjacent pieces with distinct row IDs preserves aggregate occupancy but changes contributor identity at the split.
- Source-order permutation preserves measures and fixture identities after remapping current source IDs.
- Pure viewport changes preserve every analytical result.
- Clearing the owner's selection preserves the owner's measured population; changing external/population filters can change it.
- A summary's involved-row union can be larger than every simultaneous set; traces must not assert otherwise.

The delivered verifier checks the principal mathematical invariants and the listed exact scenarios. Application callback, filter-chip, serialization, and browser invariants remain the plan's acceptance gates.

## 8. Sources

### Repository evidence map

All paths refer to the pinned baseline. Links point to that commit. Symbols are named so an implementation worker can locate the exact contract without relying on line numbers that later move.

[R1]: https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Timeline
[R2]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Timeline/Timeline.tsx
[R3]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/useGetLiveData.tsx
[R4]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/valueParsing.ts
[R5]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/providers/DataLayerProvider.tsx
[R6]: https://github.com/byronwall/explorEDA/tree/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/dsl
[R7]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/trace/traceTypes.ts
[R8]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/findings.ts
[R9]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/apps/demo/src/demos/journeyDashboards.ts
[R10]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[R11]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/notebook/NotebookFindings.tsx
[R12]: https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/ui-defaults.md

- **R1:** Timeline/timelinePlan.ts: readRow, planTimeline, overlapsWindow; timelinePlan.test.ts: stable domain, exclusions, touching endpoints, open ends.
- **R2:** Timeline.tsx: plan memo, source, select, brush and trace handlers; definition.ts: TimelineSettings, timelineWindow, withTimelineWindow, getFilterFunction; Timeline.test.tsx: saved JSON and Dashboard roundtrip tests; TimelineSettingsPanel.tsx and TimelineTraceBody.tsx.
- **R3:** useGetAllIds, useGetLiveIds, useGetLiveData; use of restrictToPopulation and empty-facet condition.
- **R4:** valueParsing.ts: isMissingValue, parseDateText, timeOfDay, timestampOf, dateBound; lib/categories.ts: categoryKey/categoryLabel; hooks/applyFilter.ts: date-range inclusivity.
- **R5:** DataLayerProvider.tsx: getLiveItems, getColumnData, updateChart, holdStateChanges, toSavedChart, saveToStructure, restoreAnalysisFromStructure, provider data-refresh effect, getSavedStateFingerprint.
- **R6:** lib/dsl/compile.ts: DSL_CHART_KEYWORDS, applyPath, buildChart, chartFits, buildFilter, finding parsing; export.ts: filterPairs, headFor, diffPaths/exportParts; settingKeys.ts: CHART_SETTING_KEYS.timeline, DASHBOARD_COVERAGE.findings. types/FilterTypes.ts, types/SavedDataStructure.ts, and utils/saveDataUtils.ts supply the persistence and validation boundary.
- **R7:** traceTypes.ts: ChartTrace, TraceSource, TraceSelection.
- **R8:** findings.ts: FindingDefinition, FindingResult, evaluateFinding, evaluateFindings, comparisonProblem, evaluateNotebookFindings; findings.test.ts: own-chart scope and comparison cases.
- **R9:** journeyDashboards.ts: bookingTimeline and roomBookingsDashboard; docs/pages/timeline.mdx; docs/live/examples.ts: timeline and FINDINGS_NOTEBOOK; docs/catalogue.ts: timeline/notebook/folder/text pages; public/datasets/room-bookings.csv.
- **R10, supplemental exact-ref:** hooks/CrossfilterWrapper.ts: getAllData, getFilterFunction, localSelections; lib/chartPopulation.ts: getPopulationTest/restrictToPopulation; providers/lib/carryRowSelections.ts.
- **R11, supplemental exact-ref:** trace/ChartTracePanel.tsx: TraceBody; trace/traceRows.ts: traceRowIds; trace/ChartTraceScope.tsx; components/notebook/NotebookFindings.tsx: useFindingResults/OperandRecords; lib/notebook/writeBack.ts: skippedKey/textPart/writeBackSettings; ExplorEdaNotebook.tsx; lib/project/folder.ts: readProjectFolder; analysisText.ts; writeFolder.ts: analysisFileText; apps/app/src/ProjectWorkspace.tsx and saver.ts: FolderSaver.
- **R12:** AGENTS.md, docs/agent-guide.md, CODING_STANDARDS.md, docs/ui-defaults.md, docs/research/DIRECTION.md, and docs/intent/research-ideas-100/ideas/R013-timeline-concurrency.md. The mission supersedes older demand gates and retired intent references.

### External primary sources

All accessed October 30, 2026. No marketing comparison, secondary tutorial, or unexecuted product test is treated as proof.

- **E1 — James F. Allen, 1983 revised TR 86, Maintaining Knowledge about Temporal Intervals.** [Original institutional PDF](https://urresearch.rochester.edu/fileDownloadForInstitutionalItem.action?itemFileId=22361&itemId=10182). Figures 1–2 distinguish endpoint relations including meets/overlaps.
- **E2 — Sedgewick and Wayne, Princeton Algorithms, Geometric Intersections.** [Primary exposition](https://algs4.cs.princeton.edu/93intersection/). Retrieved through primary search text; direct page open returned 403. Endpoint sweep, active intervals, maximum overlap; example assumptions differ from this design.
- **E3 — PostgreSQL Range Types.** [Official manual](https://www.postgresql.org/docs/current/rangetypes.html). The retrieved current page identified PostgreSQL 18; explicit bounds, empty and unbounded ranges.
- **E4 — PostgreSQL Range/Multirange Functions and Operators.** [Official manual](https://www.postgresql.org/docs/current/functions-range.html). Overlap, adjacency, union, intersection.
- **E5 — PostgreSQL Aggregate Functions.** [Official manual](https://www.postgresql.org/docs/current/functions-aggregate.html). range_agg as range union.
- **E6 — PerfettoSQL standard library, intervals.overlap.** [Official documentation](https://perfetto.dev/docs/analysis/stdlib-docs#intervals-overlap). Overlap counters and grouped counters; helper-specific merge semantics.
- **E7 — Perfetto Data Explorer.** [Official documentation](https://perfetto.dev/docs/visualization/data-explorer). Interval filtering/clipping and analytical exploration.
- **E8 — PostgreSQL Date/Time Functions and Operators.** [Official manual](https://www.postgresql.org/docs/current/functions-datetime.html). OVERLAPS endpoint exceptions and calendar-day versus elapsed-hour arithmetic.
- **E9 — ECMA-262, ECMAScript 2026, Numbers and Dates.** [Official specification](https://tc39.es/ecma262/2026/multipage/numbers-and-dates.html). Safe integers, integral time values, TimeClip range, and leap-second representation.
- **E10 — PerfettoSQL Getting Started, span joins.** [Official documentation](https://perfetto.dev/docs/analysis/perfetto-sql-getting-started). Nonoverlapping partition prerequisite.
- **E11 — Splunk Enterprise 10.6, concurrency.** [Official command reference](https://help.splunk.com/en/splunk-enterprise/search/spl-search-reference/10.6/search-commands/concurrency). Updated September 9, 2026; event-start count definition, duration units, and clamping limit.

## 9. Delivery, access, and remaining questions

**Access status:** successful. No decisive method input remains missing. Retired domain-analysis paths mentioned by R013 are not prerequisites.

**Files read:** all 36 packet files: AGENTS.md; README.md; CODING_STANDARDS.md; root and library package.json; docs/agent-guide.md; docs/ui-defaults.md; docs/research/DIRECTION.md; R013-timeline-concurrency.md; DataLayerProvider.tsx; ChartTypes.ts; FilterTypes.ts; SavedDataStructure.ts; applyFilter.ts; saveDataUtils.ts; categories.ts; valueParsing.ts; DSL compile.ts/export.ts/settingKeys.ts; notebook findings.ts/findings.test.ts; useGetLiveData.tsx; traceTypes.ts; timeline.mdx; docs live/examples.ts; docs/catalogue.ts; journeyDashboards.ts; room-bookings.csv; and all seven Timeline files including both test files. Supplemental exact-ref reads are identified above; selected-region supplemental reads are not described as complete-file coverage.

**Executed versus proposed:** numerical oracle checks and data inspection executed; repository implementation, app tests, browser verification, compile/export, and reopen checks proposed. No code was committed, pushed, merged, deployed, or provisioned.

**Deliverables:**

- [Full implementation plan](timeline-concurrency-implementation-plan.md)
- [Fixture input JSON](timeline-concurrency-fixture.json)
- [Exact expected results JSON](timeline-concurrency-expected.json)
- [Runnable independent verifier](verify-timeline-concurrency.py)
- [Proposed saved settings](timeline-concurrency-saved-settings.json)
- [Proposed Dashboard text](timeline-concurrency-dashboard.eda)
- [Proposed notebook text](timeline-concurrency-notebook.eda.md)

**Open questions for implementation, none blocking the method:** the measured dataset size at which a worker or interval index pays off; whether users need an explicit business-key selection API beyond the semantic time query; and whether to promote segment snapshots into live linked datasets after the initial feature. Scope, endpoint convention, horizon behavior, first surface, and first notebook contract are decided above.

