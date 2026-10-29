Build a native weighted ECDF in explorEDA’s existing React chart: one optional weight field, inclusive lower and upper shares, explicitly named inverse-ECDF quantiles, and inspectable numerator, denominator, zero-weight, and excluded source records. Preserve the current unweighted ECDF and interpolated box-plot behavior. Ship the complete weighted ECDF first, then configurable quantile readouts, then a narrowly scoped weighted box summary; keep histogram weighting and general statistical annotations separate. Analysts should be able to inspect represented shares while every stored row retains its original identity.

# Weighted empirical distributions — Methods report

- **Repository baseline:** `byronwall/explorEDA` at `6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e`.
- **Research date:** October 23, 2026.
- **Mode:** Methods. This report specifies proposed behavior; it does not implement it.
- **Companion:** [implementation-plan.md](implementation-plan.md), intended for integration at `docs/intent/weighted-distributions/implementation-plan.md`.
- **Scope:** React, TypeScript, pnpm, the existing client and contracts. Byron’s demand is sufficient. No outside-demand gate, usability study, server engine, survey-inference platform, or general reducer framework is a prerequisite.

## 1. Access check and evidence boundary

**Access passed.** The complete attached source packet was readable as UTF-8 and contained all 28 complete scoped files. In particular, `ecdfPlan.ts`, `definition.ts`, `ecdfTrace.ts`, `valueParsing.ts`, and `ecdfPlan.test.ts` were present and read. The full file inventory appears in Section 10. A public-web attempt to open the exact GitHub ref could not fetch it; the attached packet is the authoritative baseline for this report. No decisive research input is missing.

The following distinctions apply throughout:

- **Checked fact:** a behavior read in the supplied source or in a cited primary publication, documentation page, or implementation.
- **Derived result:** a mathematical consequence or a synthetic fixture calculation. Exact fixture values were independently checked with rational arithmetic.
- **Proposed behavior:** an implementation or interface decision recommended here.
- **Worker verification:** checks Codex should perform in the full checkout. Shared hook internals, annotation resolution, saved validation, and the CSV importer are not included in the packet. Their integration locations are identified by the supplied agent guide; this report does not pretend to have inspected their implementations.

No repository implementation, pnpm suite, or browser flow was run during this research. The browser checks in the companion plan are acceptance requirements for the future implementation.

`docs/research/DIRECTION.md` and the mission supersede the older outside-demand gates in `R009-weighted-ecdf.md` and `reusable-analysis-metrics/intent-brief.md`. Their concerns about population, eligibility, identity, and evidence remain useful.

## 2. What the current source establishes

Repository references below are paths and symbols in the supplied ref, rather than claims about a later checkout.

| Checked behavior | Repository evidence |
| --- | --- |
| A tied x value produces one step containing every original source ID; ties are ordered by row ID. | `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts` — `buildSteps`; corresponding tie tests in `ecdfPlan.test.ts`. |
| Lower share means `xᵢ ≤ t`; upper share means `xᵢ ≥ t`. | `ecdfPlan.ts` — `shareAt`, `idsThrough`. |
| Each group’s denominator is its valid-x row count. | `EcdfCurve.count`, `planEcdf` / `makeCurve`; test “splits by color with each group as its own 100%.” |
| Group ranking is by live valid-x row count, with a label tie-break. The cap is ten named groups **plus** pooled Other. | `MAX_ECDF_GROUPS`, `ranked`, `shown`, `rest` in `planEcdf`. |
| Overall pools original entries; it does not average group percentages. | `planEcdf` — `all` and `showOverall`. |
| X extent comes from all finite source x values and stays stable under peer filtering. Nonpositive source x makes requested ECDF log x fall back to linear. | `planEcdf` — extent loop, `logUnavailable`; domain/log tests. |
| Threshold clicks and spans write inclusive numeric range filters. They do not automatically restrict selection to one curve or to calculation contributors. | `EcdfChart.tsx` — `commit`; `ecdfPlan.ts` — `thresholdFilter`; `definition.ts` — `getFilterFunction`. |
| Live/all IDs and field maps come through shared hooks; the chart supplies an annotation frame with row populations but no weighting contract. | `EcdfChart.tsx` — `useGetLiveIds`, `useGetAllIds`, `useGetColumnData`, `annotationFrame`. |
| Current traces expose numerator IDs and tie IDs, but no separate denominator-record inspection; exclusions are plan-global. | `ecdfTrace.ts` — `EcdfTrace`, `resolveEcdfTrace`; `EcdfTraceBody.tsx`. |
| Current ECDF marks are directional 50%/90% crossings; the upper-direction crossing is a different operation from a lower inverse quantile. | `ecdfPlan.ts` — `crossing`, `QUANTILE_LEVELS`; `EcdfChart.tsx` — mark captions. |
| Existing box quartiles interpolate at `(n−1)p`; Tukey whiskers use observed values within the fences. | `BoxPlot/boxPlotCalculations.ts` — `getQuartile`, `calculateBoxPlotStats` and tests. |
| Shared aggregates currently include count, sum, average, max, and min. They do not supply weighted distributions. | `packages/explorEDA/src/lib/aggregates.ts` — `AGGREGATIONS`, `reduceNumbers`, `AggregateContributor`. |
| Composition’s summary mark has no observation-weight field. Its path has linear/smooth curves, not a native ECDF step mode. | `Composition/compositionTypes.ts` — `SummaryMark`, `PathMark`, `MarkDefinition`, `markFields`. |
| ECDF settings have an exhaustive DSL key list, and the chart union already includes `EcdfSettings`. | `lib/dsl/settingKeys.ts` — `CHART_SETTING_KEYS.ecdf`; `types/ChartTypes.ts`. |

The older reusable-metrics brief describes a smaller aggregate list than the current supplied code. Use the code’s count/sum/average/min/max list as the checked fact. Weighting does not require broadening that list in milestone one.

## 3. Mathematical choice: a normalized measure over original rows

### 3.1 Scope, eligibility, and definitions

For one curve, let `S` be its source rows in the current peer/local/facet scope, before that ECDF’s own interactive threshold or span is applied to linked views.

Define:

- `E = {i ∈ S : xᵢ is finite, wᵢ is finite, wᵢ ≥ 0}`: eligible rows.
- `P = {i ∈ E : wᵢ > 0}`: positive contributors.
- `Z = {i ∈ E : wᵢ = 0}`: eligible zero-weight rows.
- `W = Σᵢ∈E wᵢ = Σᵢ∈P wᵢ`: raw eligible total weight.

For `W > 0`, choose the weighted empirical cumulative distribution:

$$
F_w(t)=\frac{\sum_{i\in E} w_i\,\mathbf{1}(x_i\le t)}{W}.
$$

Choose the **inclusive upper share**:

$$
U_w(t)=\frac{\sum_{i\in E}w_i\,\mathbf{1}(x_i\ge t)}{W}
      =1-F_w(t^-).
$$

The normalized point mass is `mᵢ = wᵢ/W`. This is a measure over eligible input values, not a reconstruction of unobserved individual values within an aggregate row. NumPy’s documentation uses this weighted empirical-distribution definition. [S1]

At a tie `t`, write `a(t)=Σₓᵢ₌ₜ wᵢ`. Then, by direct algebra:

$$
F_w(t)+U_w(t)=1+\frac{a(t)}{W}.
$$

Both directions include the whole tie. Consequently, `1−F_w(t)` is the **strict** upper share, `P_w(X>t)`; it must not implement the inclusive upper direction.

For an inclusive interval `[a,b]`, use:

$$
P_w(a\le X\le b)=\frac{\sum_iw_i\,\mathbf{1}(a\le x_i\le b)}{W}
               =F_w(b)-F_w(a^-).
$$

The expression is a mathematical identity. The numerical implementation should sum a small selected interval directly when subtraction would discard its mass.

### 3.2 Selected quantile convention

Let `z₁ < … < zₘ` be the distinct x values with **positive input weight**. For `0 < p ≤ 1`:

$$
Q_w(p)=\min\{z_j:F_w(z_j)\ge p\}.
$$

Define `Q_w(0)=z₁` explicitly. Thus `Q_w(1)=zₘ`, and zero-weight extremes never become quantile endpoints. Reject nonfinite p or p outside `[0,1]`. Empty, wholly ineligible, and all-zero distributions have no quantiles.

At an exact cumulative boundary, return the lower support value. Do not interpolate or average adjacent values. In exact arithmetic, for an interior quantile:

$$
F_w(Q_w(p)^-)<p\le F_w(Q_w(p)).
$$

The lower inverse is a deliberate descriptive choice: the reported quantile is an observed positive-support value whose cumulative mass reaches the requested probability. It need not be the best estimator of a smooth underlying population quantile. Hyndman and Fan compare sample-quantile estimators for that latter purpose; their recommendation does not require an interactive inverse-ECDF mark to interpolate away from its displayed distribution. [S2]

**Keep quantile x positions independent of direction.** Weighted Q50 and Q90 mean the same x values in lower and upper views. Plot a dot at the actually attained `F_w(Qp)` or `U_w(Qp)` and show the requested percentile separately. A discontinuous curve need not attain exactly 50% at its median.

The existing unweighted upper crossing is different. For equal weights at `[0,10]`:

- Lower inverse Q50 is `0`.
- The largest x retaining at least 50% at-or-above mass is `10`.
- Existing interpolated box median is `5`.

Preserve existing unweighted behavior. In the weighted branch, use visible labels such as **Weighted p50 · inverse ECDF** and **Weighted p90 · inverse ECDF**, including in upper mode. Do not reuse the current upper-mode p10 caption for the new p90 mark.

### 3.3 Weight meaning must be declared, not inferred

The same nonnegative normalized measure can describe several things. It does not make their interpretations or inferential methods interchangeable. Primary weight classifications distinguish frequency, sampling, and analytic/reliability weights. [S3]

| Meaning | Interpretation and proposed wording |
| --- | --- |
| Frequency | A whole-count weight can represent repeated identical observations. Use “Frequency-weighted share”; describe represented observations only when the supplied counts support that meaning. Fractional weights remain usable as mass, but do not claim literal replication. |
| Probability mass | A discrete support value already has assigned mass or probability. Normalize by the actual supplied total and disclose it. A total different from one is visible; do not silently claim the input was a probability distribution summing exactly to one. |
| Sampling / probability weight | Usually a supplied inverse-inclusion or adjusted survey weight. Use “Population-weighted share” only as the user-declared interpretation. An inclusion probability `πᵢ` itself is not the usual inverse weight `1/πᵢ`. Do not invert a field automatically. |
| Reliability / precision | Relative influence, often related to inverse variance. Use “Reliability-weighted share.” It does not automatically describe shares of people or reconstruct a population distribution. |
| Exposure | A duration, distance, opportunity count, or other nonnegative exposure. Use “Share of exposure,” optionally with a unit such as hours. This describes where exposure lies over x. |
| Unspecified nonnegative mass | Default to “Weighted share” and show the weight field name. Do not guess its statistical meaning from its numbers. |

Exposure illustrates why labels matter. If x is a row’s rate and w is its duration, the ECDF describes the share of duration associated with rates at or below a threshold. A pooled event rate is instead `Σ events / Σ duration`. Those are different quantities by their definitions. An ECDF also supplies no censoring or risk-set machinery for survival estimation.

Never treat total weight as effective sample size, independent observations, precision, or confidence. A sampling-weighted descriptive curve can be useful without implementing survey inference. Design-based uncertainty needs additional design information; the R survey API represents a survey design and exposes separate uncertainty and quantile-rule choices. [S4]

### 3.4 Which equivalences can coexist?

“Equal-weight equivalence” and “replication equivalence” are incomplete requirements until they name the unweighted method.

| Property | Selected inverse-ECDF convention |
| --- | --- |
| Multiply every weight by the same positive constant | Invariant in exact arithmetic. |
| Replace integer weights with literal copies, then take unweighted **type 1** | Equivalent, without needing to create copies. |
| All weights strictly positive and equal, compared with unweighted **type 1** on the same eligible rows | Equivalent. |
| All weights strictly positive and equal, compared with current box **type 7** on the same eligible rows | Not generally equivalent. |
| Literal integer replication followed by **type 7** | Not generally equivalent. |

The first three properties can all hold together. They cannot all be promised with the existing type-7 interpretation substituted into the final two rows.

**Exact impossibility witness.** With `x=[0,10]` and `p=1/4`:

1. Weights `[1,1]` correspond to the unweighted sample `[0,10]`. Type 7 returns `2.5`.
2. Multiply weights by two: `[2,2]` corresponds to `[0,0,10,10]`. Type 7 returns `0`.
3. A method equivalent to replicated type 7 has changed after uniform weight scaling. It cannot also be scale invariant.

The selected inverse returns `0` in both cases. This is a direct calculation from the interpolation formula used by R’s default type 7 and the repository’s box calculation. R separately identifies type 1 as the empirical-CDF inverse. [S5]

A three-way discriminator is `x=[0,10], w=[1,3], p=1/4`:

| Calculation | Exact result |
| --- | --- |
| Selected weighted inverse | `0` |
| Existing unweighted interpolation on the two source rows | `5/2` |
| Type 7 on `[0,10,10,10]` | `15/2` |

Do not silently force these results to agree by rescaling weights to a supposed sample size.

## 4. Primary implementation comparison

This table compares conventions, not package quality. External packages are reference implementations of different methods, not interchangeable test oracles.

| Primary source | Checked convention and implication |
| --- | --- |
| NumPy `quantile` | Unweighted default is `linear`; weights are supported only by `method="inverted_cdf"`. Use that explicit method for an ordinary weighted comparison. [S1] |
| R `stats::quantile` | Default type 7 interpolates; type 1 is the empirical inverse. The default API has no weight vector. [S5] |
| R `survey::svyquantile` | Default `qrule="math"`, also described as `hf1`, uses the lower inverse. Other weighted rules and survey uncertainty are separate options. [S4, S6] |
| Hmisc `wtd.quantile` | Default `type="quantile", normwt=FALSE` computes order positions `1+(W−1)p` and interpolates replicated order statistics. It agrees with type-7 integer replication, which is a different objective. [S7, S8] |
| statsmodels `DescrStatsW.quantile` | Pools exact ties; at a cumulative boundary it averages adjacent distinct support values. This differs from the selected lower inverse. [S9] |
| Julia StatsBase `quantile` | Distinguishes integer `FrequencyWeights` replication from a nonfrequency interpolation that agrees with ordinary quantiles for equal weights. This makes the choice between objectives explicit. [S10] |

Two source-level traps affect implementation:

- **Hmisc’s label “inverse” is insufficient to identify the step inverse.** Its non-default `"i/n"` quantile branch calls `approx` on weighted-CDF coordinates with linear interpolation. From that source, `x=[0,10], w=[1,1], p=.75` yields `5` for this branch, whereas the chosen step inverse yields `10`. This comparison is source-derived, not an executed Hmisc result. [S8]
- **Do not copy a raw-weight epsilon.** The inspected statsmodels source identifies boundary hits using an absolute `1e-10` difference in raw weight units. That comparison can change after changing units or uniformly scaling weights. explorEDA should not import that tolerance into its different inverse convention. [S11]

R survey’s 2026 quantile-rule vignette clearly specifies the `math/hf1` rule. Its `school/hf2` prose appears inconsistent about the equality case; use the package help and statsmodels documentation for the midpoint comparison, rather than copying that paragraph. This uncertainty does not change the selected lower-inverse decision. [S4, S6, S9]

## 5. Eligibility and numerical contract

### 5.1 Parse once through existing rules

Use `numericExclusionReason` and `parseNumber` / `finiteNumber` in `packages/explorEDA/src/lib/valueParsing.ts` for both x and weight. Do not add raw-row `Number(value)` coercions in the chart.

| Input condition | Proposed behavior |
| --- | --- |
| No configured `weightField` | Run the current unweighted behavior. |
| Configured field is absent or removed | Show a field-resolution error. Never fall back silently to row counts. |
| Invalid, missing, or nonfinite x | Exclude the row from weighted eligibility, even if its weight is zero. |
| Missing weight | Exclude; do not substitute one or zero. |
| Blank, boolean, radix text, nonnumeric text, NaN, ±Infinity weight | Exclude under the shared parser’s reason. |
| Finite negative weight | Exclude with “Negative weight”; never take absolute value, clamp to zero, or let signed weights cancel. |
| Zero or negative zero weight | Eligible, zero contribution, retained for inspection. |
| Finite positive weight | Positive contributor, even when it is too small to survive later normalization numerically. |
| Numeric text such as `"2.5"` | Accept if the shared parser accepts it. |
| All weights zero | No normalized curve or quantile; show total weight zero and retain eligible records. |
| No source rows versus no eligible rows | Distinct empty states, with exclusions inspectable in the latter. |

For headline reconciliation, assign one primary reason per excluded row: **x first, then weight**. Field diagnostics may retain additional issues, but must not double-count a row.

Required count identities:

$$
N_{\mathrm{source}}=N_{\mathrm{eligible}}+N_{\mathrm{excluded}},\qquad
N_{\mathrm{eligible}}=N_{\mathrm{positive}}+N_{\mathrm{zero}}.
$$

“All source rows” for the chart and “source rows in the current curve scope” must have separate names. A peer filter can change the second while leaving the first unchanged. The workspace’s row count always counts source records.

### 5.2 Chosen bounded algorithm

Use a small distribution helper, initially local to ECDF. The proposal is **binary64 arithmetic with explicit limits**, not exact arbitrary-precision statistics. ECMAScript Number arithmetic uses binary64; compensation improves summation but cannot recover precision already lost in parsing or division. [S12, S13]

1. **Classify and retain identity.** Read each scoped row once, retaining source ID, original x/weight inputs, parsed values, group key, and eligibility status. Never expand rows.
2. **Sort by x, then source ID.** Combine exact numeric ties; do not merge nearly equal x values with an epsilon. Keep positive and zero IDs separately.
3. **Scale per denominator.** For each group, Other, and overall independently, choose `M=max(wᵢ>0)` and `uᵢ=wᵢ/M`. An all-zero distribution returns its status before division. A large unrelated group must not erase a small group’s conditional distribution.
4. **Use Neumaier compensated accumulation.** Retain the correction while accumulating ties and forward/reverse prefixes; if merging a compensated tie state, feed both its sum and correction into the next accumulator. Do not reset away residuals at every tie boundary. The forward endpoint is the canonical scaled total `T`.
5. **Build direct inclusive suffixes.** Lower shares use the forward mass divided by `T`; upper shares use independently accumulated reverse mass divided by the same `T`. Avoid `1−F(t)` both because its inclusion rule is wrong and because subtraction can erase a tiny tail.
6. **Query sorted arrays.** Cache x/support arrays and binary-search thresholds. Quantiles choose the first positive-support cumulative mass satisfying `Cⱼ ≥ pT`, using unrounded values. Special-case `p=0` and `p=1` from positive input support. Do not use display-rounded percentages or an arbitrary fuzzy tie.
7. **Keep raw totals separate.** Store `M`, `T`, and `M×T` when finite. If the raw product overflows, the normalized curve remains usable; show “Total weight exceeds numeric range” plus the scaled representation in its evidence. Never divide by raw Infinity.
8. **Inspect a selected interval directly.** After its boundaries are located, sum its contributing scaled weights with compensation. This costs proportional to the selected data when needed and avoids subtracting nearly equal large prefixes.
9. **Preserve exact outer-tail identities.** With positive support `z₁..zₘ`, use `F(t)=0` for `t<z₁` and `F(t)=1` for `t≥zₘ`; use `U(t)=1` for `t≤z₁` and `U(t)=0` for `t>zₘ`. At the other two boundaries, `F(z₁)` and `U(zₘ)` retain their actual endpoint mass. Limit final probability clamping to roundoff excursions outside `[0,1]`. Never alter stored mass or reinterpret underflow as a genuine zero.

A compact Neumaier accumulator suffices; a new dependency is unnecessary. Higham’s primary analysis explains why summation method and order affect floating-point error. NumPy also explicitly warns that a cumulative sum’s last value can differ from a separately computed total. [S13, S14]

### 5.3 Numerical limits and required statuses

- **Raw overflow:** Two individually finite weights can have an unrepresentable raw total. This is not an invalid-weight exclusion.
- **Scaled underflow:** Detect `wᵢ>0 && uᵢ===0`. Keep the row in positive counts and identity. Draw only an explicitly approximate curve for that affected denominator and make **all interior quantiles unavailable**; endpoints remain the minimum and maximum positive-input support. Do not suppress a different group’s well-resolved quantiles.
- **Rounded plateaus:** A positive increment can leave a reported cumulative value unchanged. Interior quantiles remain queryable, but every result from that affected curve carries an approximate/precision-warning status; never present it as numerically exact. Ordinary compensation cannot guarantee correct real-number decisions at every breakpoint. This differs from scaled underflow, which makes interior quantiles unavailable.
- **Tiny displayed shares:** Use scientific notation or “less than the display unit” in traces. A rounded `0%` must not imply that the source has zero weight.
- **Uniform scaling:** Mathematical scale invariance is exact. Bitwise identity after arbitrary decimal rescaling is not promised. Input rounding near a jump can change the chosen adjacent support value. Use exactly representable scale tests and ordinary away-from-boundary decimal-scale checks.
- **Huge frequency counts:** Values or totals above the safe-integer range cannot be advertised as exact counts simply because they look integral.
- **Input underflow:** Text `"1e-400"` already becomes numeric zero under the shared parser; `"1e400"` becomes nonfinite and is excluded. This feature does not replace the common parser with a decimal arithmetic system.
- **Dominance:** A row carrying most mass legitimately collapses several quantiles onto its value. Show that row’s weight share; do not clip or winsorize it automatically.

For group ranking, compare each group’s raw-total representation `(M,T)` in a common pairwise scale, for example with `s=max(Mₐ,Mᵦ)` and `Tₐ(Mₐ/s)` versus `Tᵦ(Mᵦ/s)`. Positive groups rank ahead of true zero groups. Never rank each group’s normalized total, since every nonempty normalized group equals one.

**Complexity:** `O(n log n)` sorting, `O(n)` classification/accumulation, `O(g log g)` group ranking, and `O(n+g)` retained evidence. Threshold/quantile lookup is `O(log m)` after planning; listing k source members costs at least `O(k)`, and direct interval accumulation costs `O(log m+k)`. Store tie members and boundaries, not a copied cumulative ID array at every step. Overall may retain a second index into rows; it must not create replicated observations.

### 5.4 Log x is an interface decision

Preserve the current ECDF’s all-source x-domain rule. Changing weight or applying a peer filter changes mass, not coordinates. A finite source x of zero or below still makes requested log x unavailable, including a zero-weight row. Keep the existing visible linear fallback. Do not silently discard nonpositive rows to make log work, log-transform weights, or renormalize to only visible x values.

## 6. Native weighted ECDF and its evidence contract

### 6.1 Minimal public settings

Add optional settings to `EcdfSettings`, not `BaseChartSettings`:

```ts
weightField?: string;
weightMeaning?: "mass" | "frequency" | "sampling" | "reliability" | "exposure";
weightUnit?: string;
```

- `weightField` absent/cleared means the existing row-count feature.
- `weightMeaning ?? "mass"` is a read-time default. Meaning and unit affect labeling, never weight transformation or eligibility.
- `weightUnit` is display text, not a conversion rule.
- The parser accepts every finite nonnegative weight under all meanings. Literal frequency-replication claims remain conditional on integer weights. Fractional “frequency” inputs get a mass interpretation notice in the trace.
- Preserve the current x range filter when changing weight field, meaning, or unit. Its record-selection meaning has not changed.
- If a saved weight field is missing, report it; retain the saved name and settings for correction.

Use the shared field picker, `FieldMetadata`, compact settings grid, accessible names, and real tooltips. Show **Weight by**, a neutral weighted-share label, and the weight field name on screen. Do not hide the weight field only in a tooltip.

A useful trace summary is:

> Weighted share ≤ 2: 20.8333% = weight 5 ÷ 24.  
> 16 source rows; 10 eligible; 7 positive contributors; 3 zero-weight; 6 excluded.

Units and declared meaning can refine this wording. They must not turn `24` into a sample-size claim.

### 6.2 Denominators, groups, and Other

- Each named group normalizes by its own eligible total weight.
- In **weighted mode**, rank live groups by descending total weight; break ties by displayed label and then typed category key. Retain current row-count ranking in unweighted mode.
- Keep **ten named groups plus Other**. Other is displayed after named groups, not re-ranked by its pooled weight.
- Pool the original source rows of the remaining groups, then recompute Other’s eligibility, total, and distribution. Do not average normalized curves.
- Preserve all-zero and wholly ineligible groups in the evidence inventory. They have a status, not a fake curve.
- The optional overall curve uses every scoped source record once. It is not the sum of already rendered curves plus Other.
- Live ranking follows the existing live-scope pattern; peer filtering can change which groups enter Other. Trace the current constituent category keys and names, so the change is inspectable.
- Keep category colors attached to shared category identity.

For positive group totals, pooling obeys:

$$
F_{\mathrm{overall}}(t)=\sum_g\frac{W_g}{\sum_hW_h}F_g(t).
$$

This identity explains why an arithmetic average of group percentages is wrong for unequal masses. Compute from original rows to preserve evidence and zero-group behavior.

### 6.3 Filtering and source identity

Keep the established `RangeFilter` boundary.

| Surface | Proposed meaning |
| --- | --- |
| Curve’s denominator | Current peer/local/facet scope, evaluated under the chart’s existing scope contracts, with this chart’s own interactive selection left out of its reference distribution. |
| Click threshold / drag span | Existing inclusive numeric x filter; no hidden weight-eligibility or nearest-curve group filter. |
| Explicit legend/group filter | Keep real-category selection semantics. Add no synthetic Other filter control in milestone one; its trace lists actual constituents. A shared control that already exposes pooled membership must resolve actual category keys, never an invented source category named Other. |
| Linked selected records | Original rows matching the saved field/group filters and other active filters. Valid-x zero/invalid-weight rows can be selected. |
| Numerator inspection | Exact eligible and positive source members behind the displayed weighted share. |
| Denominator inspection | All eligible records in the curve denominator, with positive and zero contributors identifiable. |
| Exclusion inspection | Scoped original records and raw inputs with their reasons, including invalid x rows. |

The chart’s threshold does not rebase its own denominator. In the main fixture, an inclusive `[2,4]` range has weight `6` out of `24`; it does not become `6/6` because those rows were selected.

This distinction is deliberate, visible, and cheaper than adding an invisible contribution filter to the shared filtering system. Clicking A’s curve still selects x values across groups unless an explicit group filter is active. The trace must name A when reporting A’s share; it must not present A’s numerator list as every linked-selected row.

Use original source IDs for all membership. Do not duplicate rows according to weights, create synthetic IDs for fractional mass, deduplicate equal-valued records, or save a giant contributor-ID filter in place of a numeric range. An imported business-record column is useful for display, but is not automatically the provider’s source ID.

The full hook implementations are outside the packet. Codex must confirm self-filter exclusion, local filters, workspace filters, and facet intersection with store-backed tests, rather than assuming a supplied `liveIds` planner test proves them.

### 6.4 Exact trace evidence

The first milestone includes the following baseline evidence, including for its fixed quantile marks; the second milestone adds configurable levels and a richer readout, rather than postponing trace correctness. Every weighted curve/step trace must expose:

- Revision, x field, weight field, declared meaning/unit, and method identifier `inverse-ecdf`.
- Scope description: peer filters, local scope, facet, category identity, or current Other constituents.
- Counts: current source, eligible, positive, zero, excluded; distinguish chart-wide totals from group totals.
- Raw numerator and denominator totals when representable, their scaled representation otherwise, and the normalized share.
- Comparator and threshold/range endpoints, including inclusion at each endpoint.
- Tie weight/mass with its numerical status and exact tie source IDs; distinguish all eligible tie members from positive contributors.
- Numerator eligible IDs and positive IDs.
- Denominator eligible IDs, positive IDs, and zero IDs.
- Excluded IDs with original x and weight values plus the primary reason.
- Precision/overflow status.
- For a quantile: requested p, chosen x, `F(x−)`, `F(x)`, tie IDs, and the actual ordinate in the chosen display direction.

Generate lists lazily from the current distribution and row index. A change in data, calculations, weight field, or scope invalidates cached evidence and any stale resolved trace.

Use existing Alt-click, Alt-Enter, and header trace access. Do not add prohibited “Inspect records” buttons to the plot. All-zero groups and excluded rows need a group/curve-level trace target reachable from the header; they cannot depend on a positive jump that does not exist. A zero-only x value may be a flat selection/inspection anchor without becoming positive quantile support.

### 6.5 Statistical annotations: protect the first release

The current annotation frame has no weight metadata, and ECDF documentation advertises `rule x=median`. That cannot silently claim to be the weighted curve’s median.

For milestone one, **suppress resolution of statistic-dependent annotations while Weight by is active**, preserving their saved objects and Notes entries. Use the existing annotation-status mechanism with actionable copy such as “Statistic unavailable with Weight by. Choose a fixed value or use weighted quantile marks.”

- Keep constant rules, constant bands/regions, and record callouts working.
- A constant `y=0.5` line is still meaningful.
- Inspect statistical operands in bands and regions, not only median rules.
- An annotation with one unsupported statistical bound is unavailable as a whole.
- Clearing Weight by restores ordinary annotation evaluation without rewriting saved content.

This is a narrow protection, not a generic weighted-annotation system. The exact status/resolve seam must be inspected in the worker checkout. General weighted annotation statistics stay a separate later decision.

## 7. Prepared cumulative tables versus native support

| Consideration | Native ECDF versus prepared table |
| --- | --- |
| Computation | A prepared table can contain group, x, tie weight, cumulative weight, total, and lower/upper shares. Native computation applies the same definition directly to original rows. |
| Rendering | Composition’s current path can draw authored repeated-x vertices with linear segments; the packet does not expose a ready-made step-ECDF mark. Do not interpolate a single vertex per knot as though it were a step function. |
| Inspection | A derived cumulative row naturally points to itself. Original numerator and denominator membership need a separately maintained mapping. Native support can retain original IDs throughout. |
| Peer filtering | A static prepared table cannot recompute shares after arbitrary filters on original records. Upstream preparation must rerun or deliberately limit the interaction. |
| Specialist methods | Prepared results are useful for survey-design estimates, externally chosen interpolation, privacy-constrained aggregates, or fixed reports. Label the supplied method and scope. |
| Maintenance | Native support adds one weight map, a small distribution helper, settings, evidence, and tests to an existing chart. A general bridge between prepared cells and arbitrary original-row selections would be a larger feature. |

**Recommendation:** build the native boundary. The project already has the chart, source identity, linked filtering, settings, and tracing. Repeatedly preparing cumulative tables would push exactly the mission’s denominator and row-membership work onto callers. Keep a small prepared-table recipe as an optional interoperability exploration, not a demand gate or replacement for the native feature.

## 8. Exact proof cases and next capabilities

The companion plan contains the complete rows, source IDs, exclusions, and test cases. These values summarize the decisive checks.

### 8.1 Ties, dominance, invalid weights, and peers

The 16-row fixture has A’s dominant weight `16` at x `10`, B’s smaller total, and an all-zero C group.

| Quantity | Full scope / peerKeep=true |
| --- | --- |
| Source / eligible / positive / zero / excluded rows | `16/10/7/3/6` / `13/7/5/2/6` |
| Overall raw total | `24` / `7` |
| A / B / C raw totals | `20/4/0` / `4/3/0` |
| Overall lower share at 2 | `5/24` / `5/7` |
| Overall inclusive upper share at 2 | `23/24` / `6/7` |
| Inclusive interval [2,4] share | `6/24 = 1/4` / `6/7` |
| Q0, Q25, Q50, Q75, Q90, Q100 | `[1,3,10,10,10,10]` / `[1,2,2,3,3,3]` |

For `[2,4]`:

- Linked-selected source IDs: `[1,2,3,5,8,9,12]`.
- Eligible numerator IDs: `[1,2,3,8,9,12]`.
- Positive numerator IDs: `[1,2,8,9]`.
- ID `5` has negative weight and remains a linked-selected source record.
- IDs `3` and `12` have zero weight and remain inspectable.
- C’s normalized shares and quantiles are unavailable, not zero.

### 8.2 Quantile marks and readouts

The first release must make its inherited fixed marks correct; `showQuantiles` is already enabled by default. Ship weighted Q50/Q90 in milestone one, with collapsed marks grouped into one accessible label if both land on the dominant row.

Next, add a bounded list of requested percentile levels and a compact readout/trace. Use the same inverse method everywhere. In upper mode, the percentile x does not change. Show attained share and the jump interval, so a requested percentile inside a large jump is understandable.

### 8.3 Weighted box summaries

Build weighted boxes only after the native ECDF contract ships.

- Quartiles: `Q(.25), Q(.5), Q(.75)` from the same inverse helper.
- Min/max whiskers: extrema of **positive-weight support**.
- Tukey option: `IQR=Q3−Q1`, fences `Q1−1.5 IQR` and `Q3+1.5 IQR`, whiskers at observed positive-support values inside the fences.
- Outliers: original positive-contributor rows outside those whiskers; retain individual row IDs and weights.
- Zero-weight rows: inspectable, but do not set quartiles, whiskers, or ordinary observation glyphs.
- Source glyphs: one per original eligible positive record, subject to the existing visible cap; never replicated by weight.
- Labels: explicitly weighted and inverse-ECDF. Existing unweighted interpolation remains intact.
- Exclude weighted standard-deviation whiskers, violin density, notches, and confidence intervals from this milestone. Do not show an unweighted violin beside a weighted box under one unexplained label.
- Preserve incompatible saved options and expose their unavailable state until the user selects a supported option; do not silently change an authored statistic.

In the full fixture:

- A: `Q1=Q2=Q3=10`, `IQR=0`, Tukey whiskers `10..10`, outlier IDs `[0,1,2]`.
- B: `Q1=2, Q2=3, Q3=3`, `IQR=1`, fences `0.5..4.5`, whiskers `2..3`, outlier ID `10` at x `8`.
- Overall: `Q1=3, Q2=10, Q3=10`, `IQR=7`, fences `−7.5..20.5`, whiskers `1..10`, no outliers.
- C: unavailable.

A dominant observation making a degenerate weighted box is valid under this definition; the ECDF and source trace explain it better than changing the method to make the box wider.

### 8.4 Separate follow-ups

- **Weighted histograms — Explore.** Reuse the already repaired bin-membership/edge contracts. A frequency-mass histogram sums weight in each bin; a normalized share divides by the curve’s eligible total; a density divides again by bin width. Define which one the axis shows. This does not belong in milestone one.
- **Weighted annotation statistics — Defer.** A future annotation needs explicit field, weight, scope, and method. Do not inherit an unweighted median or introduce a general expression language to solve this.
- **Shared reducer — Build narrowly when boxes need it.** Move the proven weighted-distribution helper into `src/lib/weightedDistribution.ts` at that point. Do not retrofit all scalar aggregates or Composition summary marks.
- **Frequency-specific interpolated quantiles — Explore only as an explicit separate method.** They can serve callers who require replication-to-type-7, but lose unrestricted scale invariance. Do not add an unlabeled switch or make it a hidden behavior of the meaning dropdown.
- **Survey inference and effective sample size — Defer.** They need a separate model and purpose; total weight alone does not authorize them.

## 9. Open questions and practical limits

No open question blocks the proposed first milestone. Defaults are chosen here:

- Neutral mass interpretation unless the user declares another meaning.
- Weighted groups ordered by live raw total weight.
- Existing numeric range selection retained.
- Weighted quantiles use lower inverse, independent of display direction.
- Statistical annotations visibly unavailable while weighted, with their saved definitions preserved.
- Scaled-underflow curves approximate; interior quantiles unavailable for that curve.

Worker inspection must settle the exact shared-hook and annotation-status integration signatures, saved-data validation path, and CSV importer assertions. These are ordinary implementation checks, not requests for more mission inputs.

The next method question, if pursued, is whether a distinct frequency/type-7 option has enough value for Byron’s work to justify its visibly different guarantees. It is not required to ship this plan. A configurable overall-versus-group annotation scope is likewise a later feature, not an implicit milestone-one behavior.

## 10. Files read

All paths are relative to the supplied repository ref. All 28 files were read, including full contents of the large Composition, DSL, and demo registries.

**Governance and intent (8):**

- `AGENTS.md`
- `README.md`
- `CODING_STANDARDS.md`
- `docs/agent-guide.md`
- `docs/ui-defaults.md`
- `docs/research/DIRECTION.md`
- `docs/intent/research-ideas-100/ideas/R009-weighted-ecdf.md`
- `docs/intent/reusable-analysis-metrics/intent-brief.md`

**ECDF (8), under `packages/explorEDA/src/components/charts/Ecdf/`:**

- `definition.ts`
- `ecdfPlan.ts`
- `ecdfPlan.test.ts`
- `EcdfChart.tsx`
- `EcdfSettingsPanel.tsx`
- `ecdfTrace.ts`
- `EcdfTraceBody.tsx`
- `EcdfChart.test.tsx`

**Supporting source (7):**

- `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts`
- `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.test.ts`
- `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts`
- `packages/explorEDA/src/lib/valueParsing.ts`
- `packages/explorEDA/src/lib/aggregates.ts`
- `packages/explorEDA/src/lib/dsl/settingKeys.ts`
- `packages/explorEDA/src/types/ChartTypes.ts`

**Docs and examples (5):**

- `apps/demo/src/docs/pages/ecdf.mdx`
- `apps/demo/src/docs/pages/boxplot.mdx`
- `apps/demo/src/docs/live/examples.ts`
- `apps/demo/src/demos/examples.ts`
- `apps/demo/src/demos/coverage.ts`

## 11. Primary sources

Sources were retrieved on October 23, 2026. Links identify the inspected documentation/source; moving stable/master URLs may later change. No external implementation was executed as part of this report.

- **[S1] NumPy:** [`numpy.quantile`](https://numpy.org/doc/stable/reference/generated/numpy.quantile.html), especially “Weighted quantiles” and the `weights`/`method` arguments.
- **[S2] Hyndman, R. J., and Fan, Y. (1996):** [“Sample quantiles in statistical packages,” author publication page](https://robjhyndman.com/publications/quantiles/), *The American Statistician* 50(4), 361–365; [author-hosted paper](https://robjhyndman.com/papers/sample_quantiles.pdf), DOI [10.1080/00031305.1996.10473566](https://doi.org/10.1080/00031305.1996.10473566). The report uses the methodological distinction and current API definitions, not an unverified claim that one method satisfies every desirable property.
- **[S3] Julia StatsBase:** [Weight Vectors](https://juliastats.org/StatsBase.jl/stable/weights/), frequency, analytic, and probability-weight definitions.
- **[S4] R survey:** [`svyquantile` and survey-design reference](https://cran.r-project.org/web/packages/survey/refman/survey.html), “Quantiles under complex sampling.”
- **[S5] R stats:** [Patched `quantile` documentation](https://stat.ethz.ch/R-manual/R-patched/library/stats/html/quantile.html), types 1 and 7.
- **[S6] Lumley, T. (2026):** [“Estimating quantiles,” survey package vignette](https://cran.r-project.org/web/packages/survey/vignettes/qrule.pdf), February 24, 2026; mathematical inverse / `hf1` section.
- **[S7] Hmisc:** [Weighted Statistical Estimates](https://search.r-project.org/CRAN/refmans/Hmisc/html/wtd.stats.html), `wtd.quantile`, `normwt`, and zero-weight handling.
- **[S8] Hmisc primary implementation:** [`R/wtd.stats.s`](https://github.com/harrelfe/Hmisc/blob/master/R/wtd.stats.s), `wtd.quantile` and `wtd.Ecdf`.
- **[S9] statsmodels:** [`DescrStatsW.quantile`](https://www.statsmodels.org/stable/generated/statsmodels.stats.weightstats.DescrStatsW.quantile.html), tie pooling and exact-boundary averaging.
- **[S10] Julia StatsBase:** [Scalar Statistics — weighted quantiles](https://juliastats.org/StatsBase.jl/stable/scalarstats/), frequency/nonfrequency branches.
- **[S11] statsmodels primary implementation:** [`statsmodels.stats.weightstats`](https://www.statsmodels.org/stable/_modules/statsmodels/stats/weightstats.html), `DescrStatsW._quantile` and its absolute boundary tolerance.
- **[S12] ECMA-262:** [The Number Type](https://tc39.es/ecma262/multipage/ecmascript-data-types-and-values.html#sec-ecmascript-language-types-number-type), binary64 arithmetic.
- **[S13] Higham, N. J. (1993):** [“The Accuracy of Floating Point Summation,” author-hosted paper](https://nhigham.com/wp-content/uploads/2023/10/high93s.pdf), *SIAM Journal on Scientific Computing* 14(4), 783–799; DOI [10.1137/0914050](https://doi.org/10.1137/0914050).
- **[S14] NumPy:** [`numpy.cumsum`](https://numpy.org/doc/stable/reference/generated/numpy.cumsum.html), notes on accumulation versus independently computed sum.

## 12. Recommendations

These stable identifiers are the handoff contract. “Explore” and “Defer” are separate from the three recommended build milestones.

| ID / disposition | Recommendation and one-line reason |
| --- | --- |
| **WD-01 — Build** | Native weighted ECDF with one optional weight field: existing linked records and tracing make represented shares directly inspectable. |
| **WD-02 — Build** | Explicit inverse-ECDF weighted quantiles: preserve scale invariance and type-1 replication equivalence with a named boundary rule. |
| **WD-03 — Build** | Eligibility, stable accumulation, overflow and precision statuses: a normalized curve needs a trustworthy denominator and honest numerical limits. |
| **WD-04 — Build** | Separate numerator, denominator, zero, excluded, and linked-selected records: selection and contribution answer different questions while preserving identity. |
| **WD-05 — Build** | Mass-ranked weighted groups, pooled Other, and optional pooled overall: unequal groups must retain their actual weight and constituent records. |
| **WD-06 — Build** | Correct fixed Q50/Q90 marks, then bounded configurable percentiles: make the selected method useful without expanding every chart. |
| **WD-07 — Build** | Weighted boxes after ECDF, using inverse quartiles and observed min/max or Tukey whiskers: reuse one tested descriptive distribution contract. |
| **WD-08 — Build** | Preserve unweighted behavior and guard statistical annotations when weighted: avoid silently changing established interpolation or mislabeling an unweighted median. |
| **WD-09 — Build** | A small shared weighted-distribution helper when boxes become a second consumer: share proven math and evidence without a reducer framework. |
| **WD-10 — Explore** | Weighted histograms using existing bin contracts: mass/share/density labels and bin evidence deserve their own capability scope. |
| **WD-11 — Explore** | Prepared-table recipe and explicitly separate frequency/type-7 quantiles: useful interoperability paths with different interaction or invariance tradeoffs. |
| **WD-12 — Defer** | General weighted annotation statistics, weighted violins, and standard-deviation summaries: each needs its own method and scope contract. |
| **WD-13 — Defer** | Survey design, confidence bounds, and effective-sample-size diagnostics: total weight alone cannot justify inferential claims. |
| **WD-14 — Avoid** | Replicated source rows, signed-weight cancellation, automatic probability inversion, and hidden eligibility filters: they break identity or alter the stated measure. |
| **WD-15 — Avoid** | Universal reducer/expression machinery and an all-charts first milestone: they broaden the project beyond the requested native distribution feature. |

