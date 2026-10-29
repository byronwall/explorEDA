Build a **Compare two groups** mode inside the existing ECDF: choose two explicit, typed values of one grouping field; compare the same unweighted numeric field under the same live population; show the largest cumulative-share gap, first Wasserstein distance in the field’s units, and signed differences at the 10th, 50th, and 90th empirical percentiles. Make every denominator, threshold witness, exclusion, and interval calculation inspectable through the existing trace and contributor-table boundaries. Ship this in three useful increments, beginning with a complete maximum-gap comparison. Keep inference, weights, named cohorts, frozen references, and cross-source comparisons outside this release.

# Distribution-distance methods report

**Repository:** explorEDA. **Baseline:** `9d64a021e35d312887b1bc848e307f42b6c3091f`. **Research date:** October 27, 2026, America/Indianapolis. The attachment identifies the source refresh as October 28, 2026; its baseline takes precedence over a different live branch.

**Access status:** the complete attached `source-packet(20261028-013822).txt` was available and read across the review team. All 43 file sections have matching end markers; every section was assigned and read completely. The mission was also read completely. This establishes access to the supplied baseline packet, not an independent Git checkout or verification that live `origin/main` still points to that commit. No decisive design input is missing.

**Evidence convention:** **R01–R16** identify local source paths and symbols in §12. **P01–P18** link primary papers, specifications, or official implementation documentation in §13. Statements about existing code are facts at the packet baseline; the proposed feature, settings, numerical contract, and milestones are design recommendations. Mathematical consequences derived here are distinguished from implementation behavior. The companion [implementation-plan.md](implementation-plan.md) turns the recommendations into buildable milestones.

## 1. The method bundle and what each number means

Let A contain eligible observations \(a_1,\ldots,a_n\), and B contain \(b_1,\ldots,b_m\). Both must have at least one valid value. Every row has equal mass within its own group:

\[
F_A(x)=\frac1n\sum_{i=1}^{n}\mathbf1(a_i\le x),\qquad
F_B(x)=\frac1m\sum_{j=1}^{m}\mathbf1(b_j\le x).
\]

These are right-continuous empirical CDFs. Group sizes need not match. Normalizing each group to mass one compares distributions of values rather than total row volume. Keep the two row counts visible because that normalization deliberately removes volume differences.

| Product reading | Mathematical quantity | Interpretation |
| --- | --- | --- |
| **Largest share gap** | \(D=\sup_x\lvert F_A(x)-F_B(x)\rvert\) | The greatest difference between the groups’ cumulative shares. Show \(100D\) **percentage points**, not percent change. |
| **Average value distance · Wasserstein** | \(W_1=\int_{\mathbb R}\lvert F_A-F_B\rvert\,dx\) | Average absolute separation over all percentile levels, in the original field’s units. It is nonnegative and has no higher/lower direction. |
| **Percentile differences · B − A** | \(\Delta_p=Q_B(p)-Q_A(p)\), for \(p=0.1,0.5,0.9\) | Where B’s lower, middle, and upper values are higher or lower than A’s. Positive means B’s percentile value is higher. |

The maximum gap is the descriptive statistic used by the two-sample Kolmogorov–Smirnov test; calculating it does not require calculating a test or p-value. Hodges gives the classical statistic and its independent, continuous-sample testing setting. SciPy exposes the statistic, its location, and its sign separately. [P01] [P02]

For distributions on the real line,

\[
W_1(A,B)
=\inf_{\pi\in\Pi(A,B)}\int|x-y|\,d\pi(x,y)
=\int_{\mathbb R}|F_A(x)-F_B(x)|\,dx
=\int_0^1|Q_A(p)-Q_B(p)|\,dp.
\]

Here \(\Pi(A,B)\) is the set of probability couplings with those two marginals. The CDF identity is the subject of Vallender’s paper; the quantile representation is stated and proved in Ramdas, García Trillos, and Cuturi, Proposition 1. SciPy’s current one-dimensional implementation documents the same CDF-based quantity. [P03] [P04] [P05]

The quantile definition must be explicit:

\[
Q_A(p)=\inf\{x:F_A(x)\ge p\}=a_{(\lceil np\rceil)},\qquad 0<p\le1.
\]

Use the generalized inverse of the empirical CDF, commonly called **Hyndman–Fan type 1**. At an even sample size, its 50th percentile is the lower middle observation, rather than the average of two observations. R’s `quantile(type = 1)` is a useful independent reference; R’s default `type = 7` is different. Hyndman and Fan document the alternatives and recommend a different estimator for their estimation objective; choosing type 1 here is our decision to describe the empirical distribution exactly. [P06] [P07]

Use fixed rational probabilities `1/10`, `1/2`, and `9/10` for ranks. D3's `quantile` and `quantileSorted` use the interpolated R-7 convention, so substituting either would change this contract; retrieve integer order statistics directly. [P18] The first release does not need a percentile editor, an inverse-quantile calculator, or a probability-query language. Its fixed comparisons remain independent of the weighted/inverse-quantile proposal identified as PR #514 in the mission. That PR is a scope boundary supplied by the mission, not a shipped dependency.

### Why these three belong together

- **D locates the strongest threshold contrast.** It is easy to explain through two counts. It ignores how far apart the observed values are horizontally.
- **W₁ accounts for horizontal separation throughout the range.** A small amount of mass far away can matter. It can therefore be sensitive to extreme values; the trace should expose those intervals, without silently trimming them.
- **Signed quantiles describe direction and heterogeneity.** A positive low-percentile difference and negative high-percentile difference immediately suggest crossing or a spread change. Three readings are summaries, not a complete description of the quantile-difference function.

For A = `[0, 3]` and B = `[1, 2]`, both means are 1.5, yet D = 1/2 and W₁ = 1. The percentile differences are `[+1, +1, −1]`. A mean difference alone misses this; a scalar distance alone does not explain the reversal. This is a derived, exactly checked example, detailed in V03.

Keep \(g(x)=F_A(x)-F_B(x)\) as the signed CDF difference. A positive g says **A has more observations at or below x**. It does not say A has higher values. Internally retaining \(D^+=\max g\) and \(D^-=\max(-g)\) lets the UI recognize crossings without adding more statistics to the headline. If both are positive, neither empirical CDF is everywhere above the other.

### No inferential output in this release

Do not show p-values, confidence bands, significance stars, pass/fail labels, or automatic “small/medium/large” severity colors. The observations describe the loaded rows; the application does not establish the sampling or randomization design.

- Ties do not invalidate D, W₁, or empirical quantiles. They do affect some inferential calibrations. It would be false to claim exact two-sample KS inference is universally impossible with ties: current R documentation describes an exact two-sample method with ties. [P08]
- Different rows may belong to the same person, device, account, or time series. The empirical distribution remains defined, but treating rows as independent replicates may be unjustified.
- Overlapping memberships would create another dependence issue; analyst-selected filters, repeated comparisons, and optional stopping require an inferential design of their own.
- A permutation test requires an appropriate exchangeability argument. A row bootstrap is not an automatic repair for clustering, overlap, or selection after looking at results.

This is a product decision based on the mismatch between the exploratory workflow and the assumptions of a particular test, not a claim that valid inference is impossible. A future inferential feature would need an explicit target, sampling unit, dependence structure, and multiplicity/sequential policy. It is not a prerequisite for this descriptive capability. [P01] [P02] [P08]

## 2. Exact population and identity contract

### Existing behavior that the design builds on

The current ECDF already prepares valid numeric values, groups by typed category, collapses ties into steps, uses each curve’s own valid count, and offers inclusive thresholds/spans, direction-dependent 50%/90% crossing marks, tracing, and a display log axis. Its planner caps ordinary visible groups at ten and pools the rest. Its optional all-rows curve uses **current live entries**, not a frozen or unfiltered reference. **R02–R05**

`useGetAllIds(settings)` applies chart-local `localFilters`. `useGetLiveIds(settings, facetIds)` reads the chart’s live Crossfilter group, then applies its optional facet intersection. The chart-owned group omits that chart’s own dimension filter; workspace filters and other linked chart dimensions apply. `CrossfilterWrapper.getAllData` also applies that chart’s local population restrictions. `getFilteredRowIds()` includes the current chart’s selection and is therefore the wrong input for this comparison. **R06**

### Proposed sets

Let U be the current prepared rows that pass:

1. This ECDF’s chart-local population restrictions, `localFilters`.
2. Workspace filters.
3. Other charts’ selections that are linked in the current workspace mode.
4. This facet’s membership, when a facet is supplied.

Exclude **all of this ECDF’s own linked `filters`** from U, matching its curve population. This includes its own group selection as well as its numeric threshold. When `localSelections=true`, chart selections stay local because chart dimensions are cleared; workspace filters still condition U. State the actual mode in the scope text. **R06**

For grouping field g and explicit typed keys kA and kB:

\[
C_A=\{r\in U:\operatorname{categoryKey}(g_r)=k_A\},\qquad
C_B=\{r\in U:\operatorname{categoryKey}(g_r)=k_B\}.
\]

The comparison arrays A and B contain the finite numeric measurements from those candidate rows. Their valid counts n and m are the denominators. Keep candidate counts, valid counts, exclusions by reason, and current-source IDs separately for each side. Rows in other categories are **outside the chosen comparison**, not numeric exclusions.

The packet’s facet helper treats `facetIds=[]` as no intersection because it checks `length > 0`. For this feature, explicitly map a supplied empty facet to zero comparison IDs **and zero rendered pair IDs**. The unfaceted `allIds` may continue to provide the shared display domain and group-choice catalogue. This is a narrow requirement for the new comparison input, not a request to audit all facets. **R06**

### Numeric eligibility

Read provider-prepared raw values through `numericExclusionReason` and `parseNumber`, as the ECDF does. Do not introduce a second parser, parse display strings, or substitute the stricter `isExactNumberText` type-inference rule. **R03, R07, R08**

| Input to the numeric planner | Treatment |
| --- | --- |
| Finite Number, including zero and negatives | Include. |
| Finite numeric text accepted by `parseNumber` | Include its parsed Number. |
| `null`, `undefined`, or `""` | Exclude as `Missing value`. |
| Whitespace-only text | Exclude as `Blank value`. |
| Boolean | Exclude as `Boolean values are not numeric`. |
| NaN, ±Infinity, nonnumeric text, radix-prefixed text such as `"0x10"` | Exclude as `Not a finite number`. |

The numeric guarantees begin with the prepared finite **binary64** values. Type conversion and parsing may already have changed an original source string. Preserve original values in the trace where the provider supports that, but do not claim arbitrary decimal-text exactness. **R07, R08**

### Group identity

Use `categoryValue`/`categoryKey` on the same prepared grouping column that supplies the curves. Existing equivalences and distinctions are intentional: **R07**

- Number `1` and string `"1"` are different groups; booleans and their text spellings are different.
- `null` and `undefined` share the missing category; numeric `−0` and `+0` share a category.
- Blank strings are categorical values, even though they are ineligible as numeric measurements.
- Numeric NaN and infinities have distinct category-key encodings. Their presence in the grouping field does not make an otherwise finite measurement invalid.
- A real string named `"Other"`, `"Other categories"`, or `"(missing)"` is a real source category, distinct from generated display pooling or the missing category.

Enumerate choices from the chart-local `allIds`, before linked filters, without the ten-group cap. A selected group filtered to zero stays selected. If a saved key is absent from the current source or field conversion, retain the choice and show its unavailable/zero-row state; never substitute the next visible group. Changing the grouping field intentionally clears both keys in the same settings action unless the new field and a new pair are supplied together.

The first UI requires two different keys from **one field**. Groups are consequently disjoint by row ID. Repeated entities across different rows remain possible. The same key on both sides, including equivalent missing or zero keys, is an incomplete comparison, not a meaningful self-comparison button.

### Selection, filtering, and source refresh

The chart’s own threshold/span should select linked rows while leaving U, A, B, and the distances unchanged. A workspace range on the same numeric field, or a range owned by another linked chart, conditions both groups and can empty one. This owner distinction must remain visible. **R05, R06**

Reuse the existing range-only `commit` behavior: it replaces the measurement range and preserves other same-chart filters. Choosing A/B does not write an implicit group-union filter. Therefore a threshold selection is **not limited to the comparison groups**; preserved same-chart category or other filters still constrain the linked result. The workspace row count is the provider’s actual selection count, not a renamed comparison numerator. A trace’s A/B row tables provide the exact statistical subsets.

Suggested compact text:

- “A: Standard · 84 valid of 89 rows” and “B: Express · 37 valid of 38 rows.”
- “Other filters apply. This chart’s selections do not change the comparison.”
- On selection: “Selected Value ≤ 2. Selection is not limited to A and B.”
- In local-selection mode: “Workspace filters apply. Chart selections stay in their charts.”

A source or prepared-column change invalidates all computed results, memberships, focused intervals, and traces. Re-resolve the stored group keys when the host’s existing restore/reuse flow retains the chart settings. Do not promise that every import retains charts: the provider’s `setData` path can reset them. `nonce` and live-item nonces are runtime invalidation signals, not durable source version identifiers. Positional IDs reach records in the current loaded source only. **R08, R09**

## 3. Empty groups, overlap, and repeated measurements

| Situation | Contract |
| --- | --- |
| Either valid group empty, including both empty | All three comparison outputs unavailable; preserve names and candidate/exclusion counts. Never report distance zero. |
| Singleton or constant group | Valid empirical measure. Compute normally; no artificial minimum sample size. |
| Unequal group sizes | Each valid A row has mass 1/n and each valid B row mass 1/m. Do not zip sorted rows or resample to equal lengths. |
| Ties | Aggregate both groups’ complete tie blocks at a value before evaluating a gap. Include the full tie block in a quantile trace. |
| Same group on both sides | Request two different groups; retain settings without inventing a result. |
| Repeated entity or duplicate table rows | Each row is one observation and contributes equal within-group mass. Do not silently deduplicate or claim an entity-level effect. |
| Shared observations in a future arbitrary-predicate API | Empirical distances remain mathematically defined; report overlap and avoid independent-sample inference. Not offered by the initial pair UI. |

**A group versus its complement** must name the complement universe. “Everything else” after which filters, numeric exclusions, and facet? Defer this shortcut rather than equating it with generated Other. An analyst can explicitly prepare a two-valued grouping field upstream if that is the question; explorEDA still compares the resulting row distributions.

**A group versus a containing whole** systematically dilutes the contrast. If the eligible whole H partitions into A and C with A’s share \(\lambda\), then:

\[
F_H=\lambda F_A+(1-\lambda)F_C,
\]
\[
D(A,H)=(1-\lambda)D(A,C),\qquad
W_1(A,H)=(1-\lambda)W_1(A,C).
\]

These identities follow by factoring \(F_A-F_H\); quantile differences do not generally have this scaling. V12 checks the effect. This is why `showOverall` is not an automatic reference choice. The existing metric-card all-source scalar comparison is a useful precedent for readable comparison text, not a general population or distribution-comparison API. **R03, R13**

## 4. What users see and how they inspect it

### Extend the ECDF

| Option | Assessment |
| --- | --- |
| **Compact ECDF comparison mode — choose** | Keeps the two curves, threshold interaction, source tracing, formatting, and grouping controls in one place. Needs a deliberate pair path that bypasses display pooling. |
| Separate comparison chart | Could give a full difference function more room, but would duplicate source/scope controls, registry/persistence work, and familiar ECDF gestures. Defer until a distinct visual task warrants it. |

In chart settings, add a compact **Compare groups** toggle, labeled A/B pickers, and a swap action. Reuse `field` and `colorField`; do not add a cohort editor or an independent grouping system. Enabling comparison does not silently choose a statistically meaningful pair. Show a short incomplete state until both values are selected.

In comparison mode, render the **two actual chosen curves**, including groups outside the ordinary top ten. Preserve category colors and label the curves directly as A/B; distinguish them with a line pattern as well as color. Suppress generated Other and the all-rows overlay in this mode, preserving their saved settings for ordinary ECDF mode. Keep the current allIds-based x domain so linked filters do not rescale the chart. This domain can contain values from groups outside the pair; that affects whitespace, not the statistics. **R02–R05**

Place a persistent compact summary below the plot, separate from the existing hover readout. It must remain legible when no pointer is over the chart and be included in image export. A useful example over V03 is:

- **Largest share gap:** 50 percentage points.
- **At Value ≤ 0:** A 1/2 (50%); B 0/2 (0%). “A has 50 percentage points more at or below 0.”
- **Average value distance:** 1 Value unit.
- **B − A percentiles:** 10th +1; 50th +1; 90th −1.

Use field units where provided. If no unit metadata exists, name the field or say “units of Value”; do not infer units from magnitude. Keep descriptive help in real tooltips and the trace, with no native `title` attributes or “Inspect” buttons. The repository’s coding standards and UI-defaults differ in their wording about tooltip focus; reuse the actual shared tooltip behavior, keep accessible names and keyboard help, and do not add native tooltips. **R01**

### Largest-gap interaction

- Draw one vertical connector between the two actual shares at the canonical maximizing threshold.
- If several atomic intervals tie, show “1 of 3 maximum-gap intervals” with previous/next controls. Keyboard navigation changes the inspected witness only; it does not write a filter or history item.
- A normal click or Enter on the connector selects its shown threshold through the existing range action. Alt-click or Alt-Enter opens its dual-group trace.
- Keep header trace targets for the comparison, largest gap, Wasserstein calculation, and fixed quantiles. A touch or keyboard user can reach the same information without discovering an Alt gesture.
- Preserve ordinary threshold/span input. The existing transparent slider covers the plot after its marks, so a decorative line underneath will not receive events. Route the event explicitly or supply a top hit region with the same click/Alt-click semantics. **R05, R09**

When D = 0, show “Same empirical distribution” with counts; do not manufacture a special maximum threshold. When a side is empty, keep its label and exclusions visible instead of hiding the whole comparison behind the ordinary chart’s early empty-state return.

### Wasserstein interaction and honest rows

On a linear display, a light between-curve fill can illustrate the interval integral. The trace shows an ordered ledger of atomic intervals, cumulative A/B counts, and their nonnegative contributions. Its sum is the displayed W₁. Navigating to an interval highlights that region without filtering it. Keep the full sum even if the ledger virtualizes or paginates its rows; label any preview limit.

For interval \([l,r)\), expose:

- The exact endpoints and the cumulative counts at l.
- \((r-l)|F_A(l)-F_B(l)|\) in field units.
- A and B rows counted at or below l, their complete valid denominators, and the tied rows at l and r.
- Each side’s numeric exclusions, labeled separately from its valid denominator.

Call these **“Rows behind these cumulative shares.”** There is no unique set of records that caused an interval’s contribution. The open interval can contain no observations. Selecting rows inside it would not select the mass establishing the CDF gap. A transport decomposition can split a row’s mass across multiple rows when counts differ, and tied allocations need not be unique; none of that establishes matched individuals or causal movements.

The baseline’s verified continuation is `EcdfTraceBody` passing IDs to `AggregateContributorTable`, plus `TraceSource.findRow` for reverse row-to-mark navigation. Reuse those boundaries for separate A/B numerator, denominator, tie, and exclusion tables. The packet does not contain the contributor-table internals or a verified bulk Rows/export API. Reaching original rows in the trace is required; a new bulk exchange workflow is not. If the implementing worker exposes an existing Rows handoff, it must pass the exact named subset and current revision, and expire it on refresh. **R09**

Out-of-pair or excluded rows need not have a rendered pair step. Reverse navigation should honestly report that absence rather than assign them a Wasserstein “contributor” mark.

### Percentile interaction

For each fixed p, show both values and B − A. A trace gives the rank, group size, value, and complete tie block whose ranks contain the selected order statistic. For a tie spanning ranks r through s at value v, show:

\[
(r-1)/n < p \le s/n,\qquad Q_A(p)=v.
\]

Keep the empirical quantile definition independent of the displayed curve direction. The existing `crossing` helper uses different inclusive crossings in above mode. Suppress those ordinary direction-dependent markers in comparison mode; milestone three supplies canonical lower-tail percentile marks and differences, controlled by the existing `showQuantiles` setting. Ordinary ECDF mode keeps its current behavior. **R03, R04**

Use labeled x-axis percentile guides at each selected quantile value. If a guide also marks a curve, place that mark at the curve's actual inclusive `shareAt(Q(p), direction)`, not automatically at p or 1−p: tied jumps can make those ordinates different. Its label still names the lower-tail percentile p in either display direction.

### Small screens and images

At 1280 px, show the plot and compact summary together. At 783 px, allow the summary to occupy two rows without hiding the pair or counts. At 390 px, keep a full-width plot and stack the three summary readings; use the existing bounded, nonmodal settings/trace surfaces. Maintain visible labels, tab order, focus return, and reachable actions at each width. Do not rely on hover or color alone. **R01**

Export the resting chart with field/unit, A/B names, valid counts, scope, largest-gap witness, and whichever metrics the milestone supplies. Mark navigation/editor controls `data-export="omit"`. Hover readouts and transient hints are not the evidence in an exported finding. Actual image-export capture behavior is an implementation validation item because its implementation is outside the packet. **R01, R05**

## 5. Exact support intervals, direction, and row witnesses

Let \(z_1<\cdots<z_K\) be the union of valid observed values. After consuming **both** groups’ complete tie blocks at \(z_i\), define:

\[
a_i=\#\{A\le z_i\},\quad b_i=\#\{B\le z_i\},\quad
q_i=a_i m-b_i n,\quad d=nm.
\]

Then for \(i<K\):

\[
g(x)=q_i/d\quad\text{for }x\in[z_i,z_{i+1}),
\]
\[
D=\max_i|q_i|/d,\qquad
W_1=\frac1d\sum_{i=1}^{K-1}|q_i|(z_{i+1}-z_i).
\]

Before the first support and after the last, the difference is zero. The final support also has zero difference after both distributions reach 100%. With one distinct support value, D and W₁ are both zero. These finite-sum identities are derived directly from the empirical step functions.

Use BigInt for the count products and signed scores, converting each count operand before multiplication. Ties between maxima are equality of integer magnitudes with the same denominator. Do not compare rounded percentages or introduce an epsilon.

The canonical nonzero maximum is the atomic interval with the smallest lower endpoint. Retain **all** tied maximizing intervals, including opposite signs. Adjacent intervals may form one visual maximum plateau while their counts change at internal support values; keep those individual witnesses in the trace. D = 0 has every real threshold as a maximizer, so it gets no special marker.

### Left limits and inclusive “at or above”

The existing above direction is inclusive:

\[
S_A(t)=P_A(X\ge t)=1-F_A(t^-),\qquad
S_A(t)-S_B(t)=-g(t^-).
\]

A below maximum on \([z_i,z_{i+1})\) therefore corresponds to an above maximum on \((z_i,z_{i+1}]\). To show it at an observed threshold, use **\(z_i\) for below and \(z_{i+1}\) for above**. Do not negate the right-limit gap at the same observed value. No machine epsilon, midpoint, or next-representable-number probe is needed. **R03**

For V03, below at 0 gives A 1/2 and B 0/2. Its above counterpart is at 1, giving A 1/2 and B 2/2. Above at 0 gives both 100% and is not the same witness. The magnitude D and W₁ stay unchanged; the signed displayed A-minus-B share gap reverses. A quantile difference remains B minus A in either view.

At a witnessed threshold t, retain exact numerator and denominator IDs for both groups, plus IDs exactly equal to t. The complement rows establish the denominators even when they are not in the numerator. A count difference of one is not a share difference of one when group sizes differ.

### Display transformations

`logX` changes display coordinates only. D, W₁, quantiles, interval widths, and threshold predicates continue to use the original measurements. A screen-space area on a log axis is not proportional to \(\int|F_A-F_B|dx\). Disable the W₁ area encoding on log display; keep its numeric value and interval ledger, with “Distance uses original units.” A vertical share gap remains a valid vertical encoding. **R02, R03**

A user-created log-transformed **field** asks a different question: W₁ then measures separation in log units. For positive observations, an exact strictly increasing transform preserves D, but does not generally preserve W₁. Never infer that transformed-field statistic from the axis option.

## 6. Algorithms and numerical contracts

### Data preparation and a single merged sweep

Use focused ECDF modules, not a generic statistical engine:

1. Read the eligible ID population once. Partition candidates by the two typed keys and record exclusion reasons before adding valid `{id, value}` entries.
2. Sort each group by numeric value using relational comparisons, then by numeric current-source ID. Collapse `−0` and `+0` into one support value. The ID tie order makes presentation deterministic; it does not create a privileged quantile record.
3. Build tie runs with source IDs and prefix counts. Retain the sorted entries and run offsets once, not copies of cumulative ID arrays at every threshold.
4. Merge the two sorted supports. At every distinct value, consume both tie runs before recording counts, signed score, maximum status, and the next atomic interval.
5. Compute W₁ with the exact dyadic accumulator below. Compute fixed quantile ranks using BigInt ceiling division: for count N, use `ceilDiv(BigInt(N), 10n)`, `ceilDiv(BigInt(N), 2n)`, and `ceilDiv(9n * BigInt(N), 10n)`. Convert the resulting in-range rank to an array index; retrieve the selected run and all its tied IDs.
6. Project the prepared result into pixels afterward. Formatting, width, height, palette, log display, and hover state are not statistical inputs.

One suitable control-flow sketch is:

```text
if pair is incomplete or identical: return incomplete
prepare A and B from the shared live population
if A.validCount == 0 or B.validCount == 0: return unavailable with counts
sort and build tie runs for both groups
denominator = BigInt(n) * BigInt(m)
for each merged support value:
    consume all A and B ties at this value
    score = BigInt(countA) * BigInt(m) - BigInt(countB) * BigInt(n)
    if there is no next support: continue
    record the atomic interval and prefix positions
    update exact maximum and tied maxima
    add abs(score) * exactWidthInBinary64Units to the W1 numerator
read fixed ranks and round only the final scalar outputs
return plan with exact counts, statuses, and lazy record subsets
```

Require `Number.isSafeInteger` for counts supplied to the numerical helper; nonempty n and m must also be positive. Never accept an already rounded count product as input. For N = n + m eligible values and K distinct union supports, initial sorting costs O(n log n + m log m), merging O(N + K), and storage O(N + K). A trace row request costs O(log N + k) to locate a threshold and materialize k requested IDs, or O(k) from stored prefix positions. Do not store all prefix ID lists: that can become quadratic. A full-support interval ledger has O(K) rows; it should be virtualized/paged if needed without approximating the result.

### Why ordinary floating subtraction is insufficient

A direct `sum(abs(cA/n - cB/m) * (right - left))` is not an adequate numerical contract:

- The two rounded shares can lose a small nonzero difference or produce inexact maximum ties.
- `right - left` can overflow for finite opposite endpoints even when its weighted contribution is finite.
- `0 * Infinity` can produce NaN for identical distributions with extreme support.
- Scaling all endpoints before subtraction can erase a representable small gap on a large offset.
- An otherwise correct positive W₁ can be smaller than the smallest positive Number and silently round to zero.

Compensated summation helps accumulation error, but does not by itself repair those earlier operations. A hybrid with many fallbacks is harder to specify than the compact exact path below.

### Chosen path: exact dyadic accumulation local to ECDF

ECMAScript Number uses binary64; its finite values are integer multiples of \(\epsilon=2^{-1074}\). BigInt can represent the required integers. [P16] [P17] The following algorithm is this report’s proposed derivation, not a claim that the existing ECDF or SciPy already implements it.

Write \(x=I(x)\epsilon\). Decode the finite Number with `DataView`. For sign bit s, stored exponent e, and 52 fraction bits f:

\[
I(x)=
\begin{cases}
(-1)^s f,& e=0,\\
(-1)^s(2^{52}+f)2^{e-1},&1\le e\le2046.
\end{cases}
\]

Then compute one nonnegative BigInt numerator:

\[
T=\sum_{i=1}^{K-1}|q_i|\,[I(z_{i+1})-I(z_i)],\qquad
W_1=(T/d)\,2^{-1074}.
\]

This makes interval subtraction, unequal sample masses, multiplication, addition, zero detection, and tied-gap comparisons exact over the parsed input values. It avoids cancellation and intermediate overflow. It does not need rational reduction for every interval. Keep only the accumulator and necessary endpoint decodes; derive an interval’s exact contribution when inspected.

The largest endpoint integer has 2098 bits and an extreme width at most 2099. The numerator needs at most 2205 bits under the safe-integer-count contract, because:

\[
T\le nm\sum_i\Delta I_i=nm\,[I(z_K)-I(z_1)].
\]

It does not gain an unbounded extra factor from the number of intervals. Under that input contract, the merged phase remains linear with bounded-size integer operations; more explicitly, its bit cost is O(K M(B)) for bounded B of roughly 2205 bits and multiplication cost M. Input arrays and tie/run storage dominate the asymptotic memory. Browser latency must still be measured; no product throughput guarantee follows from this argument.

### Output states and one final rounding

Let \(I_{\max}=(2^{53}-1)2^{2045}\), corresponding to `Number.MAX_VALUE`. Keep these states distinct:

| Exact condition | Output contract |
| --- | --- |
| A or B empty | `unavailable-empty`; no numeric distance. |
| T = 0 | `zero`; numeric 0 is exact. |
| 0 < T < d | `positive-below-range`; the true result is between 0 and `Number.MIN_VALUE`. Do not expose numeric 0. |
| T > d Imax | `above-range`; the true result exceeds `Number.MAX_VALUE`. Do not expose Infinity as an ordinary metric. |
| Otherwise | `finite`; correctly rounded binary64 value plus retained exact transient numerator/denominator. |

The below-range policy intentionally identifies **every positive result smaller than the smallest positive Number**, including one that ordinary rounding might round upward. It is an explicit magnitude contract, not a claim that all such values round to zero. Similarly, above-range is checked against the exact finite maximum before rounding.

For the finite case:

1. Find \(e=\lfloor\log_2(T/d)\rfloor\) from BigInt bit lengths and an exact comparison; do not convert T to Number to take its logarithm.
2. Set \(s=\max(0,e-52)\).
3. Divide T by \(d2^s\), giving integer quotient q and remainder r.
4. Increment q when \(2r>d2^s\), or when equal and q is odd.
5. Return \(\operatorname{Number}(q)2^{s-1074}\).

The rounded integer is at most \(2^{53}\), including a carry, and is exactly representable as a Number; the power-of-two scaling is exact in the admitted range. This is one round-to-nearest, ties-to-even operation on the exact rational result. Apply the same local conversion to \(|q_{\max}|/d\) for a rounded D presentation, using numerator `abs(qMax) << 1074n` in minimum-subnormal units. Preserve D’s exact fraction for maximum selection and details. M1 ships this small rational conversion helper for D; M2 extends the same local module with endpoint decoding and W₁ accumulation.

Signed quantile differences use \(I(Q_B)-I(Q_A)\), denominator one, then the same conversion with its sign. A nonzero difference between two binary64 observations is at least one epsilon, but can exceed the largest finite Number. Its availability is independent of W₁: W₁ can be finite while a displayed percentile difference overflows.

The interval ledger uses the same exact difference and range-status conversion for its displayed width. A width can be above range while its weighted contribution is finite. If interval numerator is \(T_i\) and total T is positive, compute its contribution share as the exact rational \(T_i/T\), then round once with the same range policy; do not divide separately converted BigInts. For T = 0, omit contribution shares instead of evaluating 0/0. In V14's finite extreme-width case, width is above range, contribution is M, and contribution share is exactly 1.

Keep BigInt and exact intermediates out of `savedData`, callbacks, history, notebook source, and JSON exports. They belong to the runtime plan. Ordinary formatted numbers are approximate renderings of exact computed quantities; the source text is not restored from them.

### Formatting, invariance, and limits

- For nonzero statistics, use enough significant digits or scientific notation to avoid a bare displayed zero. D reads in percentage points; W₁ and quantile differences read in field units. At small differences on large offsets, the trace must offer full round-tripping endpoint numbers so two different thresholds do not appear identical.
- A nonfinite pixel projection makes the **drawing** unavailable, not the mathematical comparison. Keep its readout and trace usable and explain that the value range cannot be drawn. Never drop finite rows or clip values merely to make the scale work.
- No method can recover precision lost before preparation. Numeric `2**53 + 1` already equals `2**53` in JavaScript. Those represented inputs have zero distance if otherwise identical.
- Mathematically, for \(x'=a x+b\), \(a>0\), D is unchanged, W₁ and every signed quantile difference multiply by a, and witness intervals transform by the same map. A floating conversion that overflows or merges observations changes the represented input and can break that identity.
- D and W₁ are symmetric; swapping A/B flips signed CDF and quantile differences. Uniform replication of every row in either group preserves all three methods, while selective replication can change them.
- For finite nonempty supports, \(0\le D\le1\), \(0\le W_1\le D(z_K-z_1)\), and \(W_1\ge|\bar b-\bar a|\). Use exact arithmetic in an oracle when the range or means would overflow floating arithmetic. These are consequences of the definitions, not additional UI metrics.

### Caching

Initially memoize the mathematical plan using the current provider/preparation generation, numeric and group column identities, field names, typed A/B keys, chart-local restrictions, live membership, and facet membership. Conservative invalidation on the existing provider nonce is acceptable. Do not key by counts alone, IDs alone across refreshes, labels, or a width/height-dependent drawing plan. Source refresh, field conversion, calculation edits, and relevant filter changes must invalidate it. **R06, R08**

Width, height, log display, direction, palette, and formatting can reuse the mathematical data and rebuild the projection. Above/below direction changes witness presentation, not D/W₁/quantiles. A trace revision must also cover pair order, fields, facet, and semantic settings, because the current provider/live nonce alone does not identify all of them. Existing trace scope already closes stale selections. **R09**

## 7. Exact proof cases

Unless a fixture specifies IDs explicitly, A’s array positions have IDs `a0`, `a1`, … and B’s `b0`, `b1`, …. These are readable aliases for current-source integer IDs `0..n−1` and `n..n+m−1`; they are not persistent record keys. A swap preserves the original IDs. Every listed maximum interval is a **below/right-continuous** interval; its above counterpart uses the right endpoint as described in §5.

For each nonempty fixture, \(\Delta\) means `[Δ10, Δ50, Δ90]` under type 1. All rational equalities below were checked by direct cumulative-count integration and an independent quantile-mass partition, except the explicitly unavailable cases.

### V01 — identical empirical shape, unequal counts

A = `[0, 2]`; B = `[0, 0, 2, 2]`.

- D = 0; W₁ = 0; Δ = `[0, 0, 0]`.
- At threshold 0, A counts `{a0}`/2 and B counts `{b0,b1}`/4: both 1/2.
- Every real threshold maximizes the zero gap. Expected UI: no special maximum marker, and both different sample sizes visible.
- This is equality of empirical probability measures, not equality of record sets or volume.

### V02 — pure shift and a continuous maximizing plateau

A = `[0, 1, 2]`; B = `[1, 2, 3]`.

- D = 1/3; W₁ = 1; Δ = `[1, 1, 1]`.
- Maxima are `[0,1)`, `[1,2)`, `[2,3)`, all with g = +1/3.
- Canonical threshold 0: A `{a0}`/3; B `{}`/3.
- Threshold 1: A `{a0,a1}`/3; B `{b0}`/3. Threshold 2: A `{a0,a1,a2}`/3; B `{b0,b1}`/3.
- Each interval contributes 1/3 to W₁. A visual plateau `[0,3)` must retain all three different count witnesses.

### V03 — crossing curves and no mean shift

A = `[0, 3]`; B = `[1, 2]`.

| Interval | Signed gap | W₁ contribution |
| --- | --- | --- |
| `[0,1)` | +1/2 | 1/2 |
| `[1,2)` | 0 | 0 |
| `[2,3)` | −1/2 | 1/2 |

D = 1/2, W₁ = 1, Δ = `[1, 1, −1]`; both means are 3/2.

- At the canonical below threshold 0: A `{a0}`/2; B `{}`/2; endpoint ties A `{a0}`, B `{}`.
- At the second below maximum 2: A `{a0}`/2; B `{b0,b1}`/2; endpoint ties B `{b1}`.
- Above counterparts: at 1, A `{a1}`/2 and B `{b0,b1}`/2; at 3, A `{a1}`/2 and B `{}`/2.
- Below at 1 and above at 0 both have gap zero. A same-threshold sign flip would fail.
- Full denominators are always `{a0,a1}` and `{b0,b1}`. The open intervals `(0,1)` and `(2,3)` contain no observations despite positive W₁ contributions.

### V04 — ties and unequal masses

A = `[0, 0, 2]`; B = `[0, 1]`.

| Interval | Signed gap | W₁ contribution |
| --- | --- | --- |
| `[0,1)` | 2/3 − 1/2 = 1/6 | 1/6 |
| `[1,2)` | 2/3 − 1 = −1/3 | 1/3 |

- D = 1/3; W₁ = 1/2; Δ = `[0, 0, −1]`.
- Only maximum: `[1,2)`. At threshold 1, A `{a0,a1}`/3; B `{b0,b1}`/2.
- Above at 2, A `{a2}`/3; B `{}`/2.
- A’s 50th percentile is 0 at rank 2 of 3; its entire tie block is `{a0,a1}`, ranks 1–2. B’s 50th percentile is 0 at rank 1 of 2, tie `{b0}`.
- Consume A’s two zeros and B’s zero together; interleaving tied rows must not create a false intermediate maximum.

### V05 — singleton and constant groups

A = `[5]`; B = `[8, 8, 8]`.

- D = 1 on `[5,8)`; W₁ = 3; Δ = `[3,3,3]`.
- At 5, A `{a0}`/1; B `{}`/3. All B percentile traces return `{b0,b1,b2}`.
- Both A and B may instead be the same constant, with any positive counts: all distances/differences are zero. Variance and IQR being zero do not make these empirical comparisons invalid.

### V06 — a tail difference

A = `[0,0,0,10]`; B = `[0,0,0,20]`.

- D = 1/4 on `[10,20)`; W₁ = 5/2; Δ = `[0,0,10]`.
- At 10, A `{a0,a1,a2,a3}`/4; B `{b0,b1,b2}`/4.
- The only nonzero interval has width 10 and share gap 1/4. The repeated zeros still establish both denominators.
- Moving B’s last value from 20 to 100 leaves D = 1/4 but changes W₁ to 90/4 = 45/2. This additional value is derived from the same one-interval formula.

### V07 — unequal sizes require split transport mass

A = `[0,3]`; B = `[1,2,4]`.

- D = 1/2 on `[0,1)`; W₁ = 7/6; Δ = `[1,2,1]`.
- Canonical numerator IDs: A `{a0}`/2; B `{}`/3.
- CDF interval contributions on `[0,1)`, `[1,2)`, `[2,3)`, `[3,4)` are `1/2, 1/6, 1/6, 1/3`.

An independent quantile route gives:

| Probability interval | `(Q_A, Q_B)` | Contribution |
| --- | --- | --- |
| `(0,1/3]` | `(0,1)` | 1/3 |
| `(1/3,1/2]` | `(0,2)` | 1/3 |
| `(1/2,2/3]` | `(3,2)` | 1/6 |
| `(2/3,1]` | `(3,4)` | 1/3 |

The total is 7/6. The two A observations carry halves; the three B observations carry thirds. A simple zip of sorted rows is incorrect.

### V08 — typed groups, exclusions, and unrelated rows

This is a planner fixture over **prepared** column values, so provider conversion cannot silently change the intended types in the test.

| Current ID | Group value | Measurement |
| --- | --- | --- |
| 0 | number `1` | string `"2"` |
| 1 | number `1` | `null` |
| 2 | number `1` | `true` |
| 3 | number `1` | string `"0x10"` |
| 4 | string `"1"` | number `2` |
| 5 | string `"1"` | string `"4"` |
| 6 | string `"1"` | `Infinity` |
| 7 | string `"1"` | string `"   "` |
| 8 | missing | number `99` |
| 9 | string `"Other"` | number `100` |

Choose numeric 1 as A and text `"1"` as B.

- Candidate A IDs `{0,1,2,3}`; valid `{0}` with value 2. Exclusions: ID 1 missing; ID 2 boolean; ID 3 not finite.
- Candidate B IDs `{4,5,6,7}`; valid `{4,5}` with values `[2,4]`. Exclusions: ID 6 not finite; ID 7 blank.
- IDs 8 and 9 are outside the chosen pair, not exclusions. A real `"Other"` option is selectable if requested; generated Other is not.
- D = 1/2 on `[2,4)`; W₁ = 1; Δ = `[0,0,2]`.
- At threshold 2: A `{0}`/1 and B `{4}`/2. A’s numeric text is analyzed as 2 without using its display label.
- Save/DSL/notebook roundtrips must preserve the two different group keys and these memberships.

### V09 — small separations on a large offset

Let L = \(2^{52}=4503599627370496\). A = `[L,L+3]`; B = `[L+1,L+2]`.

- All four values are distinct, exactly representable Numbers.
- D = 1/2; W₁ = 1; Δ = `[1,1,−1]`.
- Maxima `[L,L+1)` and `[L+2,L+3)` have signs + and −. Contributor aliases are the same as V03.
- Subtracting exact dyadic endpoints preserves the widths. Formatting them with too few digits must not combine steps or change a witness.

### V10 — positive-affine change and unit conversion

Apply \(x'=2x+7\) to V03: A = `[7,13]`, B = `[9,11]`.

- D = 1/2; W₁ = 2; Δ = `[2,2,−2]`.
- Maxima `[7,9)` and `[11,13)`; contributor aliases unchanged.
- A pure offset leaves W₁/Δ unchanged; a positive change of unit multiplies them by its scale. This is expected behavior, not a normalization defect.

### V11 — replication and row weighting

Uniformly replicate every A row in V03 three times while leaving B unchanged. Counts change from `(2,2)` to `(6,2)`, but D = 1/2, W₁ = 1, and Δ = `[1,1,−1]` remain unchanged. The new rows have distinct current IDs, and their tie blocks all appear in traces.

Selectively duplicate A’s zero instead: A = `[0,0,3]`, B = `[1,2]`.

- D = 2/3 on `[0,1)`; W₁ = 7/6; Δ = `[1,1,−1]`.
- Canonical A numerator `{a0,a1}`/3, B `{}`/2.
- The three fixed quantile differences happen to remain unchanged while the full distribution changes. They are summaries, not a substitute for the curves or distances.
- If duplicated rows represent repeat readings from the same entity, the method still describes the row distribution; it does not discover an entity-level weighting scheme.

### V12 — shared observation in a containing whole, for later semantics

Let A contain ID 0 at value 0, and C contain ID 1 at value 2. The containing whole H contains IDs `{0,1}`, so A and H share ID 0.

- A versus C: D = 1, W₁ = 2.
- A versus H: D = 1/2 on `[0,2)`, W₁ = 1, Δ = `[0,0,2]`.
- At 0, A numerator `{0}`/1 and H numerator `{0}`/2. The same record appears in both tables with different probability mass.
- This is a mathematical boundary case; the initial two-distinct-values UI cannot construct overlapping groups. It must not implicitly construct this comparison through `showOverall`.

### V13 — empty and incomplete inputs

A = `[]`, B = `[1,2]`; or both arrays empty; or one candidate group has only invalid measurements.

- D, W₁, and Δ are unavailable. No threshold, maximum interval, or scalar zero is emitted.
- Show candidate/valid/excluded counts and the cause of unavailability.
- Identical selected keys or a missing grouping field are incomplete settings; malformed key encodings are validation errors. Distinguish these from a valid selected group temporarily absent from the source.

### V14 — floating-point extremes and representation boundaries

Let M = `Number.MAX_VALUE` and ε = `Number.MIN_VALUE` = \(2^{-1074}\).

| Inputs | Exact expectation | Required output |
| --- | --- | --- |
| A = B = `[-M,M]` | D = 0, W₁ = 0 | Exact zero, even though the total width exceeds M. |
| A = `[-M,M]`, B = `[M,M]` | D = 1/2 on `[-M,M)`; W₁ = M | Finite W₁. Δ10 = Δ50 = 2M are above-range; Δ90 = 0. |
| A = `[-M]`, B = `[M]` | D = 1; W₁ = 2M | Above-range W₁ and quantile differences; D remains usable. |
| A = `[0,0,0]`, B = `[0,0,ε]` | D = 1/3 on `[0,ε)`; W₁ = ε/3 | Positive-below-range W₁, not zero. Δ = `[0,0,ε]`. |
| A = `[2**53]`, B = `[2**53 + 1]` as Numbers | The represented observations are identical | D = 0, W₁ = 0; no claim to recover the intended integer difference. |

For the finite extreme-width case, the canonical below numerator is A `{a0}`/2 and B `{}`/2; the zero-width/tie processing must not split B’s two M values. For the underflow case, below at 0 gives all three A rows and B’s first two rows.

### Shared invariants for V01–V14

Swapping A/B leaves D, W₁, the set of maximum intervals, and availability magnitudes unchanged. It swaps contributor sets and negates every signed gap and finite quantile difference. Positive-affine changes transform thresholds and units as specified. Display direction, log axis, chart width, label precision, and color do not change the mathematical output. Source refresh must recompute it even if counts and positional ID sequences happen to be unchanged.

### Population integration example

The proposed runnable example uses nine rows: `(ID, Group, Value, Region)` = `(0,A,0,W)`, `(1,A,3,W)`, `(2,B,1,W)`, `(3,B,2,W)`, `(4,A,null,W)`, `(5,B,true,W)`, `(6,C,100,W)`, `(7,A,2,E)`, `(8,B,4,E)`.

With an external Region = W filter, valid A IDs `{0,1}` and valid B IDs `{2,3}` reproduce V03; A excludes ID 4 and B excludes ID 5. ID 6 is outside the pair. The ECDF’s own Value ≤ 0 selection leaves that comparison unchanged and selects ID 0 in the linked result under the stated fixture. The same range owned by the workspace or a peer chart empties B’s valid group and makes the comparison unavailable. With explicit facet IDs `{1,2}`, the arrays are A = `[3]`, B = `[1]`: D = 1, W₁ = 2. With explicit empty facet IDs, both arrays are empty.

Use a direct typed fixture for the boolean exclusion. A CSV loader may expose `true` as text instead; the live example must assert its actual prepared values and exclusion counts instead of assuming CSV retains a boolean. This does not change the intended valid distributions.

## 8. Alternatives, normalization, and implementation references

### Credible alternatives

| Alternative | Assessment for this capability |
| --- | --- |
| Energy distance | A credible omnibus distance. SciPy’s convention is \(\sqrt{2E\lvert X-Y\rvert-E\lvert X-X'\rvert-E\lvert Y-Y'\rvert}=\sqrt{2\int(F_A-F_B)^2dx}\). That has square-root field units; its square has field units but is a different quantity and not the same metric. W₁ is easier to explain in this one-dimensional UI. Defer. [P09] [P10] |
| Cramér–von Mises / Anderson–Darling | Integrate squared CDF contrasts with pooled-rank or tail weighting. Useful alternatives for a specified testing objective, but add calibration and convention choices without improving the initial units/counts story. Current implementations explicitly address rank/tie variants. Defer. [P11] [P12] [P13] |
| Probability that a B draw exceeds an A draw | \(\theta=(\#(b>a)+\tfrac12\#(b=a))/(nm)\) is a readable directional effect related to Mann–Whitney. It is not a general distribution distance: V03 gives θ = 1/2 despite D = 1/2 and W₁ = 1. Explore separately if ordering probability becomes the question. [P14] |
| Mean/median difference alone | Small and familiar, but can conceal crossing or tail differences. Keep them as possible context, not replacements for the chosen bundle. V03 and V11 demonstrate the limitation. |

Also reject raw-atom KL/JS or a histogram-distance menu for the initial feature. Two distinct singleton values, however close, have disjoint empirical supports: KL is infinite and JS has its maximal separation under the chosen log base. Binning or smoothing changes that behavior by introducing another scale choice. W₁ directly respects how close the values are without bins. W₂, kernel MMD, and multidimensional transport can be useful elsewhere; none is needed to implement this univariate question.

### Do not normalize away units

Keep W₁ in the field’s units and D in percentage points. Do not divide W₁ by the axis range, observed pooled range, pooled standard deviation, or pooled IQR by default.

- Axis bounds are view state and must not change an analysis.
- Observed range depends strongly on extremes.
- SD and IQR can be zero for valid constant/discrete distributions.
- A pooled scale can change when only one group is uniformly replicated, although the two empirical measures being compared have not changed.
- A unitless ratio still needs a substantively justified scale; it is not automatically comparable across unrelated fields.

An explicitly chosen positive domain tolerance s could later support `W₁ / s`, labeled with the exact tolerance and units. That would be a separate interpretation choice, not a hidden “normalized distance.” Do not assign universal severity thresholds to either statistic.

### What to learn from strong implementations

| Reference | Useful precedent | Boundary for explorEDA |
| --- | --- | --- |
| SciPy `ks_2samp` and `wasserstein_distance` | Separate KS statistic/location/sign; direct one-dimensional W₁ with equal default row mass. [P02] [P05] | Use as independent ordinary-case scalar oracles. Do not import p-values, a Python runtime, or assume its floating arithmetic satisfies this report’s extreme-value contract. |
| R `quantile` and `ks.test` | Explicit quantile conventions; exact two-sample tie-aware KS inference is possible under its statistical setup. [P07] [P08] | Specify `type=1`; do not rely on defaults or claim ties alone prohibit all inference. R checks are proposed, not executed here. |
| D3 `quantile` / `quantileSorted` | Official documentation names the R-7 interpolation convention. [P18] | Existing JavaScript convenience functions are not interchangeable with this feature's inverse-ECDF order statistic. Use the specified integer ranks. |
| Python Optimal Transport `wasserstein_1d` | Computes through quantile functions; useful independent formulation. Its general return is \(W_p^p\), so choose p = 1. [P15] | No matrix optimizer or transport-plan UI is needed. Keep a local sort/merge method and row traces. POT was researched, not executed. |

The official SciPy pages retrieved in this research identify themselves as v1.18.0. The installed SciPy used in isolated numerical checks was v1.17.0; these are different evidence items. R’s development manual and POT’s stable documentation were read at their current URLs. No package-version or dependency change is proposed.

### Later weights change the contract

If weights are later added, replace counts/n by sums of nonnegative eligible weights divided by each group’s positive total weight. Show both valid row counts and total weights; decide zero/invalid weight and measurement eligibility together. The CDF, W₁, and generalized-inverse definitions still apply, but integer count cross-products no longer describe the masses. Weight normalization and exact arithmetic need an explicit new contract. Do not infer effective sample size, survey variance, or confidence from arbitrary weights. This report neither implements nor repeats the separate weighted ECDF design. **R15**

## 9. Recommendation register

These stable IDs are used by the companion implementation plan.

| ID | Classification | Recommendation and reason |
| --- | --- | --- |
| DD01 | **Build** | Extend ECDF with comparison mode; it preserves the existing inspectable distribution workflow. |
| DD02 | **Build** | Two explicit typed group keys under one shared live scope; their identities and denominators must survive filtering and serialization. |
| DD03 | **Build** | Descriptive maximum ECDF gap with exact tied maxima; it gives a concrete threshold and two count witnesses. |
| DD04 | **Build** | Raw-unit W₁ with an interval ledger; it measures horizontal separation that D cannot. |
| DD05 | **Build** | Fixed signed type-1 percentile differences, B minus A; they explain direction without an inverse-query subsystem. |
| DD06 | **Build** | Sorted raw values/IDs and local exact integer/dyadic arithmetic; the promised numerical cases require more than rounded shares and floating widths. |
| DD07 | **Build** | Separate A/B numerator, denominator, tie, and exclusion continuations; a global integral has no unique causal row set. |
| DD08 | **Build** | Recompute transient results and memberships on source/preparation changes; positional IDs are not durable cohorts. |
| DD09 | **Build** | Save/DSL/notebook support, docs, examples, and tests inside each milestone; a usable feature must roundtrip from its first release. |
| DD10 | **Avoid** | Inferential output and automatic significance/severity in this release; the exploratory workflow does not establish its statistical design. |
| DD11 | **Avoid** | Implicit comparison against generated Other or the all-rows overlay; display pooling does not define the requested reference population. |
| DD12 | **Avoid** | Default range/SD/IQR normalization; it hides an arbitrary, sometimes singular and replication-dependent reference scale. |
| DD13 | **Defer** | Weights, multivariate methods, all-pairs scans, drift alerts, and experiment management; they change the problem and are outside the unweighted one-field release. |
| DD14 | **Explore** | An explicit domain-tolerance ratio later; it could give meaningful scale context when the analyst supplies a positive reference with units. |
| DD15 | **Defer** | Complement/whole shortcuts, saved predicates, frozen baselines, and cross-source comparison; they need additional population/source semantics. |
| DD16 | **Explore** | A full quantile-difference or signed CDF-difference view later; it may explain richer changes when three fixed readings are insufficient. |
| DD17 | **Defer** | A generic statistical engine or reusable-result graph; focused ECDF modules cover the present capability with fewer state boundaries. |
| DD18 | **Build** | Pointer/keyboard parity, compact layouts at all three widths, and complete resting image export; inspection and communication are part of the feature. |

## 10. Shipping recommendation

1. **M1: two groups and largest share gap.** A complete, saved, traceable ECDF comparison with correct populations, tied witnesses, responsive interaction, documentation, and a runnable example. It is useful without later statistics.
2. **M2: Wasserstein value distance.** Add exact dyadic accumulation, statuses, the interval explanation, and record continuations. M1 remains independently useful if this waits.
3. **M3: signed percentile differences.** Add fixed lower-tail readings and tie-aware traces. The recommended bundle is complete after this milestone.

No milestone waits for named baselines, frozen results, PR #514, a reusable-output subsystem, external demand research, or an observed bug. The implementation plan names concrete files, acceptance cases, source-reading obligations for unprovided boundaries, and proposed validation commands.

## 11. What was checked, and what remains proposed

### Executed in this research

- Read the complete mission and all 43 complete packet files. Checked section coverage without claiming access to an unprovided Git checkout.
- Inspected source paths for population ownership, numeric preparation, typed groups, tie steps, traces, state refresh, callbacks, saved settings, DSL compilation/export, notebook writeback, and documentation/example wiring.
- Retrieved the primary papers and official documentation in §13. Used the full accessible paper sections for decisive formulas; Vallender’s publisher/journal abstract verifies its CDF identity, and Ramdas et al. provides an accessible quantile proof. No marketing summary is mathematical evidence.
- Ran standalone Python exact-rational checks using **two independent routes**: direct cumulative-count rectangle sums and quantile-probability partition integration. The 12 nonempty principal fixtures included V01–V12’s numeric arrays, with swaps and uniform replication of one group checked for each; an independent review reran and confirmed those cases.
- Independently checked empty/unavailable semantics and extreme-value constructions with exact fractions; checked representative ordinary/offset values against installed SciPy **1.17.0**. Only the KS statistic and W₁ scalar were used, not p-values.
- Exercised a small isolated JavaScript prototype of dyadic decoding, accumulation, range classification, and final rounding on ordinary, offset, extreme, overflow, and positive-underflow cases. It was not added to application code and is not a repository implementation.
- Compared **4,074 standalone rational-conversion cases** with an independent Python `Fraction`-to-float oracle: 4,026 finite, 22 positive-below-range, and 26 above-range cases, with no mismatch in finite output bits or range classifications. Cases included midpoint ties, exponent carries, normal/subnormal boundaries, exact bounds, and large integer rationals. These are representative checks, not exhaustive verification or a formal proof of a production implementation.

### Proposed acceptance work, not executed here

- All explorEDA Vitest, type checks, full `pnpm check`, docs gates, notebook/save roundtrips, callback/history integration, and source-refresh tests.
- Browser checks with real pointer/keyboard input at 1280, 783, and 390 px; image export proof and actual application performance measurement.
- R or POT execution; exhaustive binary64 verification; a formal proof of the production implementation.
- Implementation of application changes, public exports, or a persistent cohort/result system.

No application changes, package installs for the repository, commits, pushes, merges, or PRs were made. The mathematical analysis is evidence for the proposed design; it is not a claim that the feature or its acceptance gates already pass.

## 12. Local evidence and complete reading inventory

All paths below refer to the supplied commit. Line references identify a useful **starting line** in the extracted complete file; symbols are the authoritative navigation target. A file named only as an implementation touchpoint in the companion plan was not necessarily supplied or read.

### Local citation map

- **R01 — Working and product rules:** `AGENTS.md`; `docs/agent-guide.md` (`Where things live`, `Commands`, `Traps`, `Tests`); `docs/research/DIRECTION.md` (`What Pro is for here`, `What a run hands back`); `CODING_STANDARDS.md`; `docs/ui-defaults.md` (`Density`, `Popovers and dialogs`, `Verification`); `README.md` (`Use it in your React app`). These establish React/TypeScript, pnpm, settings/callback conventions, docs/examples in each milestone, inspection gestures, and the three viewport widths.
- **R02 — ECDF settings:** `packages/explorEDA/src/components/charts/Ecdf/definition.ts`, `EcdfSettings` (line 9), `ecdfDefinition`; `EcdfSettingsPanel.tsx`, `EcdfSettingsPanel` (line 46). Existing numeric/group fields, direction, log, marks, overall overlay, and filter clearing on field/direction edits.
- **R03 — ECDF mathematics and display:** same directory, `ecdfPlan.ts`, `EcdfCurve` (40), `MAX_ECDF_GROUPS` (98), `buildSteps` (133), `shareAt` (158), `idsThrough` (190), `crossing` (200), `planEcdf` (221), group ranking (323), all-rows overlay (427), `thresholdFilter` (503).
- **R04 — Existing source tests, read only:** `Ecdf/ecdfPlan.test.ts`, tests for ties/exclusions (48), group denominators (75), directional crossing marks (87), stable domain (100), traces (149), ID tie order (162); `Ecdf/EcdfChart.test.tsx`, keyboard threshold selection (21).
- **R05 — ECDF rendering and selection:** `Ecdf/EcdfChart.tsx`, `EcdfChart` (92), source hooks (105), snapshot/plan (125), `commit` (228), `handleKey` (277), readout/status, and the final transparent threshold slider. Existing Alt-click/Alt-Enter and range-only action are visible here.
- **R06 — Population/filter ownership:** `components/charts/useGetLiveData.tsx`, `useGetLiveIds` (43), `useGetAllIds` (60); `lib/chartPopulation.ts`, `getPopulationTest` (14), `restrictToPopulation` (34); `hooks/CrossfilterWrapper.ts`, `updateChartFilters` (68), `addChart` (92), `setWorkspaceFilters` (130), `getAllData` (187); its complete tests; `types/ChartTypes.ts`, `BaseChartSettings` local-population comment (119); `types/FilterTypes.ts`, `RangeFilter`/`ValueFilter`.
- **R07 — Shared value semantics:** `lib/valueParsing.ts`, `parseNumber` (32), `numericExclusionReason` (87), `finiteNumber` (101); `lib/categories.ts`, `categoryValue` (3), `categoryKey` (17), `categoryEqual` (35), `categoryLabel` (53). Paths are under `packages/explorEDA/src/`.
- **R08 — Data/state lifecycle:** `providers/DataLayerProvider.tsx`, initial preparation (506), `holdStateChanges` (663), `setData` (674), `updateFieldSettings` (762), `updateChart` (1042), `getLiveItems` (1170), `getColumnData` (1187), `saveToStructure` (1297), `refreshCalculations` (1509), data/savedData synchronization (1602), callback fingerprint subscription (1675); `components/charts/useGetColumnData.tsx`, column memoization hooks.
- **R09 — Trace boundary:** `Ecdf/ecdfTrace.ts`, `EcdfTrace` (4), `resolveEcdfTrace` (25), `ecdfTraceTargets` (58), `findEcdfTraceRow` (68); `Ecdf/EcdfTraceBody.tsx`, `EcdfTraceBody` (10), `AggregateContributorTable` usage (52); `trace/traceTypes.ts`, `TraceSelection` (38), `ChartTrace` (114), `TraceSource` (157); `trace/ChartTraceScope.tsx`, stale-selection resolution (108), `useTraceRevision` (170). All component paths are under `packages/explorEDA/src/components/charts/`.
- **R10 — Saved state types:** `types/SavedDataStructure.ts`, `SavedDataStructure` (24), `SavedAnalysisStructure` (57); `types/SavedDataTypes.ts`, `SavedChartSettings` (60); `types/ChartTypes.ts`, chart definitions and settings union boundaries. No general comparison-result store is present in these supplied types.
- **R11 — Dashboard text:** `lib/dsl/settingKeys.ts`, exhaustive key checks (31), ECDF key list (469); `lib/dsl/export.ts`, `exportParts` generic setting iteration (526); `lib/dsl/compile.ts`, `chartFits` (1567), `resolveValueFields` (1578), `buildFilter` string-key lookup (1732), `applyPath` (2229). All paths are under `packages/explorEDA/src/`.
- **R12 — Notebook editing:** `lib/notebook/writeBack.ts`, `skippedKey` (45), `aliasToken` (175), `writeBackChart` (539), `textPart` (609), `newTypeChart` (690), `writeBackSettings` (752). This supplies the minimal-splice/recompile boundary and the specific literal-key/type-change obligations.
- **R13 — Existing scalar comparison:** `components/charts/MetricCard/metricCardPlan.ts`, `MetricCardSnapshot` (40), `planMetricCard`, live/all comparison branch (109).
- **R14 — Demo/docs integration:** `apps/demo/src/docs/pages/ecdf.mdx`, `Try it`, `How it reads`; `apps/demo/src/docs/live/examples.ts`, `LiveStep`, `LiveExampleSpec`, `focus`, `liveExamples.ecdf`; `apps/demo/src/demos/examples.ts`, `ExampleData`, `examples`, `product-activity`; `apps/demo/src/demos/coverage.ts`, `coverageFeatures`, `exampleCoverage`, `findCoverageErrors`.
- **R15 — Historical scope seeds:** `docs/intent/population-baselines/intent-brief.md`; `docs/intent/research-ideas-100/ideas/R009-weighted-ecdf.md`; same directory `R064-notebook-frozen-results.md`. These are intents/proposals and historical context, not dependencies or proof of new shipped behavior.
- **R16 — Workspace/package facts:** root `package.json`; `packages/explorEDA/package.json`; `apps/demo/package.json`. These supply pnpm scripts, the existing React/TypeScript packages, and their dependency boundaries.

### Complete files read: 43

**Rules, direction, and package definitions — 9 files**

1. `AGENTS.md`
2. `README.md`
3. `CODING_STANDARDS.md`
4. `docs/agent-guide.md`
5. `docs/ui-defaults.md`
6. `docs/research/DIRECTION.md`
7. `package.json`
8. `packages/explorEDA/package.json`
9. `apps/demo/package.json`

**ECDF — 8 files**, all under `packages/explorEDA/src/components/charts/Ecdf/`

10. `definition.ts`
11. `ecdfPlan.ts`
12. `ecdfPlan.test.ts`
13. `EcdfChart.tsx`
14. `EcdfChart.test.tsx`
15. `ecdfTrace.ts`
16. `EcdfTraceBody.tsx`
17. `EcdfSettingsPanel.tsx`

**Population, values, state, and scalar precedent — 11 files**, paths relative to `packages/explorEDA/src/`

18. `components/charts/useGetLiveData.tsx`
19. `components/charts/useGetColumnData.tsx`
20. `lib/chartPopulation.ts`
21. `lib/valueParsing.ts`
22. `lib/categories.ts`
23. `types/FilterTypes.ts`
24. `types/ChartTypes.ts`
25. `providers/DataLayerProvider.tsx`
26. `hooks/CrossfilterWrapper.ts`
27. `hooks/CrossfilterWrapper.test.ts`
28. `components/charts/MetricCard/metricCardPlan.ts`

**Trace and persistence — 8 files**, paths relative to `packages/explorEDA/src/`

29. `components/charts/trace/traceTypes.ts`
30. `components/charts/trace/ChartTraceScope.tsx`
31. `types/SavedDataStructure.ts`
32. `types/SavedDataTypes.ts`
33. `lib/dsl/settingKeys.ts`
34. `lib/dsl/export.ts`
35. `lib/dsl/compile.ts`
36. `lib/notebook/writeBack.ts`

**Docs, examples, and related intents — 7 files**

37. `apps/demo/src/docs/pages/ecdf.mdx`
38. `apps/demo/src/docs/live/examples.ts`
39. `apps/demo/src/demos/examples.ts`
40. `apps/demo/src/demos/coverage.ts`
41. `docs/intent/population-baselines/intent-brief.md`
42. `docs/intent/research-ideas-100/ideas/R009-weighted-ecdf.md`
43. `docs/intent/research-ideas-100/ideas/R064-notebook-frozen-results.md`

## 13. Primary sources

These sources were retrieved during this research. URLs are ordinary portable links so a worker can check the reports without this conversation’s citation UI. Mathematical identities above use the cited primary material; numerical engineering choices, product decisions, and proof vectors are developed here.

1. **[P01] J. L. Hodges Jr. (1958), “The significance probability of the Smirnov two-sample test,” Arkiv för Matematik 3, 469–486.** [Primary paper PDF](https://archive.ymsc.tsinghua.edu.cn/pacm_download/116/6944-11512_2007_Article_BF02589501.pdf). The accessible introduction defines D and the independent, continuous-sample testing premise. DOI: `10.1007/BF02589501`.
2. **[P02] SciPy, `scipy.stats.ks_2samp`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html). Statistic/location/sign and inference assumptions. The retrieved stable page identifies v1.18.0.
3. **[P03] S. S. Vallender/Vallander (1973 original; 1974 English translation), “Calculation of the Wasserstein Distance Between Probability Distributions on the Line.”** [Journal archive](https://www.mathnet.ru/php/archive.phtml?jrnid=tvp&option_lang=eng&paperid=4387&wshow=paper), [English publication DOI](https://doi.org/10.1137/1118101). The journal abstract confirms equality with the L¹ distance between CDFs; this review did not claim access to paywalled English full text.
4. **[P04] Aaditya Ramdas, Nicolás García Trillos, Marco Cuturi (2015), “On Wasserstein Two Sample Testing and Related Families of Nonparametric Tests.”** [arXiv version record](https://arxiv.org/abs/1509.02237), [v2 full text](https://arxiv.org/html/1509.02237v2). Proposition 1 is the one-dimensional quantile representation. Use the 2015 version history, not a regenerated HTML date.
5. **[P05] SciPy, `scipy.stats.wasserstein_distance`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wasserstein_distance.html). Equal default mass, transport interpretation, and CDF integral. Its linked source identifies the implementation module; no claim here depends on having fetched every line of that large module.
6. **[P06] Rob J. Hyndman and Yanan Fan (1996), “Sample Quantiles in Statistical Packages.”** [Author’s publication page and errata](https://robjhyndman.com/publications/quantiles/), [DOI](https://doi.org/10.1080/00031305.1996.10473566). Establishes the need to name a quantile convention; does not itself recommend this feature’s type-1 choice.
7. **[P07] R `stats`, `quantile`.** [Official development manual](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html). Type 1 is inverse empirical CDF; default type 7 differs.
8. **[P08] R `stats`, `ks.test`.** [Official development manual](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/ks.test.html). Current exact two-sample handling includes ties under its testing setup and cites Schröer/Trenkler and Viehmann.
9. **[P09] Gábor J. Székely and Maria L. Rizzo (2013), “Energy statistics: A class of statistics based on distances.”** [Primary paper](https://pages.stat.wisc.edu/~wahba/stat860public/pdf4/Energy/JSPI5102.pdf), DOI `10.1016/j.jspi.2013.03.018`. Primary mathematical context for the energy alternative.
10. **[P10] SciPy, `scipy.stats.energy_distance`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.energy_distance.html). States the square-root convention and its CDF integral, avoiding ambiguity with the squared quantity.
11. **[P11] SciPy, `scipy.stats.cramervonmises_2samp`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.cramervonmises_2samp.html). Gives the rank statistic, midrank ties, and independent-sample testing context.
12. **[P12] F. W. Scholz and M. A. Stephens (1987), “K-Sample Anderson-Darling Tests.”** [Author-hosted paper](https://faculty.washington.edu/fscholz/Papers/ADk.pdf). Covers continuous/discrete formulations and sample-size/tail weighting.
13. **[P13] SciPy, `scipy.stats.anderson_ksamp`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.anderson_ksamp.html). Current variant and permutation options; researched as an alternative, not a new dependency.
14. **[P14] SciPy, `scipy.stats.mannwhitneyu`.** [Official documentation](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.mannwhitneyu.html). Names Mann and Whitney’s 1947 original work and distinguishes independent-sample inference and tie treatments. The descriptive ordering probability in §8 is stated explicitly here.
15. **[P15] Python Optimal Transport, `ot.wasserstein_1d`.** [Official API](https://pythonot.github.io/all.html#ot.wasserstein_1d). Quantile-integration route and \(W_p^p\) return convention; p = 1 is the relevant case.
16. **[P16] Ecma International / TC39, ECMAScript Number and BigInt types.** [Living specification](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type). Primary basis for binary64 values and integer arithmetic. This is a living specification, not a proposed application dependency.
17. **[P17] NIST Digital Library of Mathematical Functions, §3.1, Arithmetics and Error Measures.** [Official numerical reference](https://dlmf.nist.gov/3.1). Binary64 parameters, machine precision, rounding, underflow, and overflow context.
18. **[P18] D3 by Observable, “Summarizing data,” `quantile` and `quantileSorted`.** [Official documentation](https://d3js.org/d3-array/summarize#quantile). Specifies the R-7 interpolation convention, which differs from this feature's chosen empirical generalized inverse.

## 14. Unresolved questions and their effect

- **Actual browser cost of exact arithmetic:** the algorithm and bounded integer sizes are specified, and isolated arithmetic was exercised, but browser responsiveness within a full filtered workspace is unmeasured. Measure representative tables during M2. If worker scheduling becomes necessary, keep the same result contract and revision checks; do not silently sample, bin, or substitute approximate distances.
- **Unprovided integration internals:** saved-data validation, DSL path/schema normalization helpers, the contributor-table renderer, trace-body dispatch, image export, and host history internals need local inspection before implementation. The supplied call sites establish the design boundaries but do not prove those absent implementations. The plan names this work explicitly.
- **Field unit and observation meaning:** the host/source owns them. Use existing metadata and visible row counts; do not invent an entity key, unit, or causal interpretation. No additional cohort system is needed to begin.
- **Future comparisons or inference:** complement, containing-whole, weights, frozen snapshots, and formal tests remain separate decisions with the mathematical cautions above. None blocks M1 or requires outside demand or a usability study to justify the current mission.

[P01]: https://archive.ymsc.tsinghua.edu.cn/pacm_download/116/6944-11512_2007_Article_BF02589501.pdf
[P02]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.ks_2samp.html
[P03]: https://www.mathnet.ru/php/archive.phtml?jrnid=tvp&option_lang=eng&paperid=4387&wshow=paper
[P04]: https://arxiv.org/html/1509.02237v2
[P05]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.wasserstein_distance.html
[P06]: https://robjhyndman.com/publications/quantiles/
[P07]: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html
[P08]: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/ks.test.html
[P09]: https://pages.stat.wisc.edu/~wahba/stat860public/pdf4/Energy/JSPI5102.pdf
[P10]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.energy_distance.html
[P11]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.cramervonmises_2samp.html
[P12]: https://faculty.washington.edu/fscholz/Papers/ADk.pdf
[P13]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.anderson_ksamp.html
[P14]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.mannwhitneyu.html
[P15]: https://pythonot.github.io/all.html#ot.wasserstein_1d
[P16]: https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type
[P17]: https://dlmf.nist.gov/3.1
[P18]: https://d3js.org/d3-array/summarize#quantile
