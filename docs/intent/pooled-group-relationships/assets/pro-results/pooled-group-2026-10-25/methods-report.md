# Pooled, within-group, and between-group relationships

**Methods decision for explorEDA · 25 October 2026**  
**Authoritative source baseline:** `95832bd473884aeae23453af0888b4ca5187820d`  
**Companion:** [implementation-plan.md](implementation-plan.md)

## 1. Build this

Build **Compare groups in Scatter Plot**: the analyst chooses numeric X and Y and one explicit grouping field, sees pooled and per-group linear relationships, and opens an exact explanation of how within-group variation and differences between group means combine. Keep the original observations visible. Make every statistic traceable to the actual pair-valid records, including its exclusions and reference population.

The shipped capability should include:

- A compact comparison section with pooled slope and Pearson r, each group's slope/r, valid-pair and eligible-row counts, X ranges, and selected-row state.
- A **Common within-group** slope, computed by removing each group's X and Y means before fitting one slope. Keep the individual group slopes alongside it.
- An expandable **Within / Between** explanation with the exact identity `total = within + between` for centered cross-products and variances, and a clearly labeled **Group means, weighted by pair count** relationship.
- Ordinary group activation that selects the typed category through the chart's ordinary filter state; Alt-click or Alt-Enter opens its trace. A trace distinguishes group records from the larger population needed for centering or a denominator.
- Explicit external-filter and facet scope. Own-chart selections change highlighting and linked views; they do not change this comparison's mathematical population.
- Save/reopen through normal chart settings and filters, with recomputation from the supplied source rows. No stored coefficients or assumed durable positional row IDs.

This adds a visible analytical workflow beyond the existing colored fits and summary trace. It needs neither a new correlation matrix nor a standalone statistical application. Byron's requested capability is the demand. The stale outside-demand and usability-study gates in R010 and earlier relationship-discovery notes do not apply: `docs/research/DIRECTION.md` supersedes them.

**Main mathematical decision:** use one disjoint partition of one common pair-valid population. Build the common within-group slope and the pair-count-weighted relationship among group means. Keep an equal-weight regression on group means out of the initial controls because it answers a different question and does not supply the between term in this decomposition.

### The worked result the product must explain

Five observations in two unequal groups give:

| Relationship | Slope | Pearson r |
| --- | ---: | ---: |
| Pooled, 5 pairs | −31/29 ≈ −1.068966 | −31/√1711 ≈ −0.749440 |
| Group A, 2 pairs | +1 | +1 |
| Group B, 3 pairs | +1 | +1 |
| Common within-group | +1 | +1 |
| Group means, weighted by 2 and 3 | −3/2 | −1 |

The sample covariance explanation is exactly:

\[
-\frac{31}{5}=\underbrace{1}_{\text{within contribution}}+\underbrace{\left(-\frac{36}{5}\right)}_{\text{between contribution}}.
\]

These are descriptive statements about those five observations. They do not establish which relationship should guide an intervention, whether a grouping variable is a confounder, or whether a common slope is an adequate predictive model. The complete rows and independently checked arithmetic appear in the fixture section.

## 2. Access, evidence, and current implementation

### Access result

**Passed.** The supplied prompt and all 39 complete files in the source packet were read before external research. The packet's declared baseline is the commit above. Its inventory and complete-file boundaries agree. This is verification of the supplied snapshot, not a claim that a remote checkout or today's `main` was fetched and matched.

The snapshot contains the decisive mathematical, scope, trace, persistence-validation, and demo-registration evidence needed for this Methods decision. Some imported integration neighbors are not included; the implementation plan identifies those as files Codex must inspect before editing, rather than inventing their APIs. No decisive missing input blocks the method choice.

### Facts verified in the packet

Repository citations below refer to paths and symbols in the supplied commit. Prefix `ScatterPlot/` or `ScatterMatrix/` with `packages/explorEDA/src/components/charts/`.

| Verified source | Existing behavior | Consequence for this design |
| --- | --- | --- |
| `ScatterPlot/pairedSummary.ts::pairedStats`, `planPairedSummary` | Finite numeric pairs; pooled and categorical-color-group means, sample covariance and Pearson r; covariance divides by n−1. | Reuse the parsing and scope conventions, but add an explicit grouping contract and decomposition. |
| `ScatterPlot/fitPlan.ts::groupScatterRows`, `planScatterFits` | Groups `plan.rowSets.facet` by categorical color; optionally includes a pooled fit. | Existing overlays are already delivered. Chosen comparison grouping must not be silently tied to the color legend. |
| `fitPlan.ts::fitInputKey`; `useScatterFits.ts::useScatterFits` | Fit dependencies exclude own selection; activation currently requires regression or summary. | Comparison needs its own activation and complete dependencies, including its group column. |
| `ScatterPlot/summaryMarginals.test.ts`; `regression.test.ts` | Supplied tests assert own-brush invariance and changes under other filters/facets. | Preserve this scope behavior; these tests were read, not executed in the application. |
| `ScatterPlot/scatterPlan.ts::planScatter`, `ScatterSnapshot` | Distinct all/chart/filtered/facet row sets; rendered points have additional size, scale and position exclusions. | Never derive the analytic population from drawn points, bins, brush membership, or visible axis bounds. |
| `ScatterMatrix/matrixPlan.ts::pairedCorrelation`, `pearson`, `planGroups` | Pooled and group Pearson values already exist; Pearson currently requires at least 3 pairs; matrix groups may be collapsed into 12 displayed bands. | Do not add another matrix or reuse its category collapse. New descriptive correlation is mathematically defined from 2 nonconstant pairs. |
| `lib/valueParsing.ts::finiteNumber`, `numericExclusionReason` | Shared numeric parsing rejects blanks, booleans, radix-prefixed text and nonfinite measurements. | Use these helpers, including their treatment of numeric strings. |
| `lib/categories.ts::categoryKey`, `categoryValue`, `categoryEqual`, `categoryLabel` | Typed categories; null/undefined coalesce; blanks remain distinct; NaN and infinities have distinct numeric keys. | Do not use displayed labels or numeric missing-value rules to establish group equality. |
| `trace/ChartTraceScope.tsx::ChartTraceScope` | A trace is bound to owner, kind, ID and revision; revision changes invalidate stale selections. Header lookup takes the first chart-role source. | Resolve comparison traces against their exact facet owner and current revision. |
| `ChartTraceDetails.tsx::ChartTraceRowSteps`; `ScatterPlot/scatterTrace.ts` | Traces show raw/prepared values, calculations, and source memberships. | Extend these conventions rather than introducing a lineage platform. |
| `utils/saveDataUtils.ts::isFilter`, `isChart`, `stringifySavedData` | Ordinary value filters accept only JSON-safe finite values; point filters persist snapshot `__ID` values unchanged. Durable refresh identity is not established by the supplied source. | Durable group selection cannot rely on raw NaN/Infinity values or assume snapshot row IDs follow records after refresh. |
| `types/SavedDataStructure.ts::SavedDataStructure`, `SavedAnalysisStructure` | Settings are separate from rows; complete analysis bundles can carry special row values. | Persist authored comparison configuration; recompute statistics on opening. |
| `lib/dsl/settingKeys.ts::CHART_SETTING_KEYS.scatter` | Compile-time coverage of chart settings feeds Dashboard text. | Register the new setting and test text round trips. |

Two implementation details matter without turning this mission into a robustness audit:

1. Existing paired summaries use an `if / else if` exclusion count: a row failing both axes is counted under X only. The new comparison needs independent X and Y reason masks and a deduplicated excluded-pair set.
2. Existing `planScatter` treats `facetIds: []` as unrestricted because it checks length. The new population constructor must distinguish **no facet restriction** from **an explicitly empty facet**. A local integration correction is required wherever the new comparison would otherwise inherit the wrong population.

### Evidence boundaries

- **Fact:** behavior established by complete supplied code or inspected primary sources.
- **Derivation:** finite-sample algebra and independently enumerated arithmetic in this report.
- **Proposal:** new controls, settings, filter representation, numerical helper, tests and milestones.
- **Unexecuted:** explorEDA application tests, browser interactions, integration with query sources, and product performance. They are acceptance work in the plan.

PR519, PR520 and PR524 are unbuilt proposals according to the task. No API, component or prerequisite from them is assumed. The current React/TypeScript library, pnpm tooling, storage-neutral host boundary, and existing chart interaction conventions remain the implementation environment. [Repository: `AGENTS.md`, `docs/agent-guide.md`, `DIRECTION.md`, and the supplied mission.]

## 3. Mathematical contract

### 3.1 One population and one disjoint partition

Let \(E\) be the source records in the current facet that pass external chart/workspace filters, excluding this chart's own filters. For a nonfaceted chart, the facet restriction is absent. Let

\[
P=\{i\in E:\operatorname{finiteNumber}(X_i),\operatorname{finiteNumber}(Y_i)\text{ both exist}\}.
\]

Every occurrence of a row in the source is one observation; equal values or duplicate business keys do not collapse observations. Set \(N=|P|\). Partition \(P\) using the exact `categoryKey` of the chosen G field:

\[
P=\bigsqcup_{g=1}^{K}P_g,\qquad n_g=|P_g|>0,\qquad \sum_g n_g=N.
\]

K counts groups with at least one valid pair, including the explicit missing-group category. A category with eligible rows but no valid pairs is shown in the table with zero pairs, but contributes no group mean or between term. A category absent from E is not counted in K.

All means use these same paired rows:

\[
\bar x_g=\frac{1}{n_g}\sum_{i\in P_g}x_i,\quad
\bar y_g=\frac{1}{n_g}\sum_{i\in P_g}y_i,\quad
\bar x=\frac{1}{N}\sum_gn_g\bar x_g,\quad
\bar y=\frac{1}{N}\sum_gn_g\bar y_g.
\]

Do not calculate an X mean over X-valid rows and a Y mean over a different Y-valid set. Do not calculate group means before applying external filters. The finite-sample algebra below is derived here for this exact population; the population-level analogue is the law of total covariance. [S1]

### 3.2 Centered cross-products and variances

Use the following three raw centered sums:

\[
\begin{aligned}
T_{xy}&=\sum_{i\in P}(x_i-\bar x)(y_i-\bar y),\\
W_{xy,g}&=\sum_{i\in P_g}(x_i-\bar x_g)(y_i-\bar y_g),\qquad
W_{xy}=\sum_gW_{xy,g},\\
B_{xy,g}&=n_g(\bar x_g-\bar x)(\bar y_g-\bar y),\qquad
B_{xy}=\sum_gB_{xy,g}.
\end{aligned}
\]

Replace xy with xx or yy to define \(T_{xx},W_{xx},B_{xx}\) and \(T_{yy},W_{yy},B_{yy}\). The square terms are nonnegative; cross-products may have either sign.

Write \(x_i-\bar x=(x_i-\bar x_g)+(\bar x_g-\bar x)\), and similarly for Y. Expanding the product gives within, between, and two cross terms. Within each group,

\[
\sum_{i\in P_g}(x_i-\bar x_g)=\sum_{i\in P_g}(y_i-\bar y_g)=0,
\]

so the cross terms vanish **after summing the group**. Therefore

\[
\boxed{T_{xy}=W_{xy}+B_{xy}},\qquad
\boxed{T_{xx}=W_{xx}+B_{xx}},\qquad
\boxed{T_{yy}=W_{yy}+B_{yy}}.
\]

In matrix form, the 2×2 centered sum-of-products matrix is the sum of its within and between matrices. This identity needs no normal distribution, equal variance, random sampling, common slope, independence between records, or causal model. It is an algebraic property of a finite disjoint partition with the same observations and weights throughout.

For a random draw uniformly from P, empirical covariance is \(T_{xy}/N\). Its within term is

\[
\frac{W_{xy}}{N}=\sum_g\frac{n_g}{N}\left(\frac{W_{xy,g}}{n_g}\right),
\]

and its between term is the covariance of the group means under probabilities \(n_g/N\). This connects the sample construction to the total-covariance law without claiming a sampling model. [S1]

### 3.3 Denominators: identities must remain explicit

| Quantity | Definition | Meaning |
| --- | --- | --- |
| Overall sample covariance | \(T_{xy}/(N-1)\), N≥2 | Matches the existing paired-summary convention. |
| Within contribution to overall sample covariance | \(W_{xy}/(N-1)\) | Additive component; not the usual within-group covariance estimator. |
| Between contribution to overall sample covariance | \(B_{xy}/(N-1)\) | Additive component on the same scale. |
| Group sample covariance | \(W_{xy,g}/(n_g-1)\), n_g≥2 | Describes one group's pairs. |
| Pooled within-group sample covariance | \(W_{xy}/(N-K)\), N>K | Degrees-of-freedom-weighted average of available group sample covariances. |
| Empirical population covariance | \(T_{xy}/N\) | Covariance under equal probability per observed row. |

The product's decomposition uses the first three rows, so

\[
\frac{T_{xy}}{N-1}=\frac{W_{xy}}{N-1}+\frac{B_{xy}}{N-1}.
\]

If an analyst asks about the conventional pooled within covariance, the trace can explain

\[
\frac{T_{xy}}{N-1}=\frac{N-K}{N-1}\frac{W_{xy}}{N-K}+\frac{B_{xy}}{N-1},
\]

where N>K. For N=K every group is a singleton and W is zero; do not form `0/0`.

Do not add a term divided by N−K to a term divided by K−1 and call the sum the total sample covariance. A covariance of equally weighted group means is yet another quantity. Authoritative software uses differing between-covariance normalizations in different procedures; the label alone is insufficient. For example, SAS DISCRIM documents a between matrix normalization of \(N(K-1)/K\). This product deliberately exposes **contributions to overall sample covariance** with denominator N−1. [S2]

Apply the same denominator rules to X and Y variances. Cross-product and covariance units are X-unit×Y-unit; variance units are squared field units. There are no percentages of covariance by default: when signed terms cancel, percentages can be negative or exceed 100%, and division by a zero total is undefined.

### 3.4 Pooled and individual group slopes

For an ordinary least-squares line **with an intercept**, minimizing squared Y residuals gives

\[
\hat\beta_T=\frac{T_{xy}}{T_{xx}},\qquad
\hat\alpha_T=\bar y-\hat\beta_T\bar x,
\]

provided \(T_{xx}>0\). For group g,

\[
\hat\beta_g=\frac{W_{xy,g}}{W_{xx,g}},\qquad
\hat\alpha_g=\bar y_g-\hat\beta_g\bar x_g,
\]

provided \(W_{xx,g}>0\). Positive X variance implies at least two distinct X observations. Constant Y with varying X yields a valid slope of zero; it does not yield a defined Pearson r.

Show slope with units **Y units per X unit**. Use the centered equation \(\hat y=\bar y+\hat\beta(x-\bar x)\) in the calculation trace, rather than requiring an expanded intercept that can lose accuracy at large offsets. The slope is directional: swapping X and Y generally does not invert it. Pearson r is symmetric in X and Y. (See [S3] for the standard correlation and regression definitions; formulas above are derived for the chosen sample.)

### 3.5 Common within-group slope: build it

Fit a common slope with a separate intercept for each group:

\[
\min_{\beta,\{\alpha_g\}}\sum_g\sum_{i\in P_g}(y_i-\alpha_g-\beta x_i)^2.
\]

For fixed β, the minimizing intercept is \(\alpha_g=\bar y_g-\beta\bar x_g\). Substituting leaves

\[
\min_\beta\sum_g\sum_{i\in P_g}\left[(y_i-\bar y_g)-\beta(x_i-\bar x_g)\right]^2,
\]

hence

\[
\boxed{\hat\beta_W=W_{xy}/W_{xx}}\quad\text{when }W_{xx}>0.
\]

This is the least-squares coefficient from regressing demeaned Y on demeaned X, equivalently the X coefficient from regression with a full set of group intercepts. The equivalence is computational; it does not make a fitted association causal. Group-centering and the distinct meanings of within and between coefficients are treated by Enders–Tofighi; Stata's methods documentation explicitly describes mean-deviated regression and the group-indicator residualization. [S4], [S5]

For groups with positive X variation,

\[
\hat\beta_W=\sum_{g:W_{xx,g}>0}\frac{W_{xx,g}}{W_{xx}}\hat\beta_g.
\]

The weights depend on **within-group X variation**, which reflects both pair counts and spread. They are not `1/K` or `n_g/N`. A large group with almost constant X can carry little within-slope weight. A constant-X group contributes zero to Wxx and Wxy, even if its Y varies; its Y variation still contributes to Wyy and can reduce the within correlation.

**Product decision:** show **Common within-group slope** as a descriptive summary, with an explanation that it imposes one slope for the summary calculation. Do not replace the individual group slopes, hide mixed signs, or label it “the corrected slope.” No test of slope homogeneity, random-effects model, shrinkage, standard error or p-value is needed for this capability.

### 3.6 Relationship among group means: build with pair-count weights

Minimize the weighted squared deviations of group means:

\[
\min_{\alpha,\beta}\sum_gn_g(\bar y_g-\alpha-\beta\bar x_g)^2.
\]

Its weighted centroid is the pooled centroid, so

\[
\boxed{\hat\beta_B=B_{xy}/B_{xx}}\quad\text{when }B_{xx}>0.
\]

The line is evaluated at group means. The weights reproduce the contribution of the original pair-valid composition; they are not inverse-variance precision weights and do not establish a model of measurement error. The resulting correlation is also weighted by n_g.

Equal-weight regression over K mean points instead uses \(\tilde x=K^{-1}\sum_g\bar x_g\) and \(\tilde y=K^{-1}\sum_g\bar y_g\):

\[
\hat\beta_{B,\mathrm{equal}}=
\frac{\sum_g(\bar x_g-\tilde x)(\bar y_g-\tilde y)}{\sum_g(\bar x_g-\tilde x)^2}.
\]

It gives each group one vote, answers a group-level question, and generally differs. Stata explicitly distinguishes default ordinary regression on group means from its group-size-weighted option. R's `lm` documentation likewise defines weighted least squares and cautions that regression on replicated/mean observations does not recover within-group variation or automatically valid inferential errors. [S5], [S6]

**Product decision:** include **Group means, weighted by pair count** in the explanation, together with K means representing N original pairs. Display group means as derived summaries in a table; an optional later mean-point overlay must use a distinct aggregate mark and state its original-row count. Do not put these means into the Rows drawer as synthetic original records.

With only two distinct group X means and differing Y means, weighted and unweighted mean correlations are necessarily ±1 and the fitted line is the same for any positive weights. That geometric fact does not mean the between relationship is precisely estimated. The fixtures include a three-group case because two groups cannot test the weighting distinction.

### 3.7 What decomposes for slopes and correlations

When both component slopes are defined,

\[
\boxed{\hat\beta_T=\frac{W_{xx}}{T_{xx}}\hat\beta_W+\frac{B_{xx}}{T_{xx}}\hat\beta_B}.
\]

The X-variation weights are nonnegative and sum to one. If a component has zero X variation, its cross-product is zero and its coefficient is undefined; omit that zero-weight coefficient rather than evaluating `0 × undefined`. The numerator form \((W_{xy}+B_{xy})/T_{xx}\) remains the primary definition.

Pearson correlations are

\[
r_T=\frac{T_{xy}}{\sqrt{T_{xx}T_{yy}}},\quad
r_g=\frac{W_{xy,g}}{\sqrt{W_{xx,g}W_{yy,g}}},\quad
r_W=\frac{W_{xy}}{\sqrt{W_{xx}W_{yy}}},\quad
r_B=\frac{B_{xy}}{\sqrt{B_{xx}B_{yy}}},
\]

with each requiring both corresponding variances to be positive. The common within r is the correlation of **all group-demeaned records**, not an average of the group correlations.

An always-applicable additive correlation statement when Txx,Tyy>0 is

\[
r_T=\underbrace{\frac{W_{xy}}{\sqrt{T_{xx}T_{yy}}}}_{c_W}+
\underbrace{\frac{B_{xy}}{\sqrt{T_{xx}T_{yy}}}}_{c_B}.
\]

Here cW and cB are **contributions to pooled r**, not within and between correlations. When rW and rB exist,

\[
r_T=r_W\sqrt{\frac{W_{xx}}{T_{xx}}\frac{W_{yy}}{T_{yy}}}
+r_B\sqrt{\frac{B_{xx}}{T_{xx}}\frac{B_{yy}}{T_{yy}}}.
\]

Those two weights do not generally sum to one. No product label or calculation may imply `pooled r = average(group r)` or `pooled r = within r + between r`. The product leads with covariance contributions; the correlation contribution form belongs in the calculation trace if shown.

### 3.8 Interpretation and assumptions

The descriptive identities are exact in real arithmetic. A descriptive least-squares coefficient exists without normally distributed errors or independent observations. Generalizing from observed rows, attaching uncertainty intervals, interpreting a common slope as a data-generating parameter, or answering a causal question requires additional assumptions and a separate design.

Simpson's original paper examined interpretation when aggregation changes associations; its examples should not be misdescribed as the modern strict reversal definition. Pearl's later treatment explicitly defines sign reversal between every conditioned subgroup and the aggregate and explains why statistical values alone do not decide a causal question. Robinson's primary ecological-correlation paper distinguishes properties of group summaries from properties of individuals. These sources justify a descriptive comparison and careful group-mean labeling, not an automatic confounding diagnosis. [S7], [S8], [S9]

Use product language such as:

- “The pooled direction opposes both estimable groups.”
- “Within-group covariance contributes +1; differences between group means contribute −7.2.”
- “Group A contains 2 of 5 valid pairs and has X values from 0 to 2.”
- “The group X ranges do not overlap.”

Avoid “bias removed,” “confounder detected,” “true relationship,” “causal reversal,” and “significant reversal.” A group mean relationship may be useful in its own right; the warning is against substituting it for a record-level relationship without establishing that this is the intended question.

## 4. Analyst experience

### 4.1 Choose a compact scatter extension

| Alternative | Useful capability | Decision |
| --- | --- | --- |
| Compact scatter comparison | Preserves the actual observations, linked selections and current authoring while making comparison visible. | **Build.** Main comparison under the plot; details use existing trace/details surfaces. |
| Dedicated analysis view/chart type | More space for full tables and alternate coordinate views. | **Defer.** Duplicates scatter scope, layout, fields and persistence before a separate task requires it. |
| Only extend paired-summary trace | Cheap reuse of current numbers and details. | **Avoid as the whole feature.** Useful for explanation, but hides the authored comparison and group selection behind inspection. |

The comparison is independent of `regression` and `summary`: analysts can compare with no fit overlay, a linear overlay, or an explicitly separate nonlinear overlay. With `summary` and comparison both enabled, show one pooled readout and route the summary trace to the same prepared moments; do not display subtly disagreeing duplicate coefficients. This is a local single-source-of-calculation requirement, not a rewrite of every statistical planner.

### 4.2 Author, compare, select, inspect, change scope, save

1. **Author.** Choose X and Y through existing controls. Enable **Compare groups** and select G with the shared field picker and metadata. The choice is persisted literally. Existing categorical color can be suggested as a candidate, but enabling comparison never silently binds G to subsequent color changes.
2. **Compare.** Show X, Y, G, facet identity, `N pairs / |E| rows`, and “Other filters applied; this chart's selection is excluded.” Lead with pooled and common-within values. A bounded group table shows eligible rows, pairs, slope, r and X range. Counts remain visible when statistics are undefined.
3. **Select a group.** Click its group label/row target or press Enter/Space to toggle a typed category predicate in ordinary chart filters. OR selected categories within that predicate; AND it with other constraints such as an X range. When G is also color, the comparison and categorical legend edit the same equality selection; an existing value-filter selection is promoted without creating a contradictory second predicate. The group label is the interactive target, not a mark-level Inspect button.
4. **Distinguish selection from contributors.** Selecting G=A includes its eligible records even if X or Y is invalid. A trace of its statistic uses P_A only. If an existing X brush also applies, the group predicate intersects that brush. Display selected counts separately from the unchanged analytic pair count.
5. **Inspect.** Alt-click/Alt-Enter the group or statistic to open a trace without changing filters. Group statistics show valid pairs and excluded rows. Within terms show original-row deviations/products; between terms show derived group summaries and their original memberships. A native header trace entry provides a discoverable nonmodifier/touch route.
6. **Inspect the decomposition.** Expand **Within / Between** to see the common-denominator identity, component slopes/r and the pair-count-weighted means. Group X ranges use a shared raw X scale with start/end labels; an all-group intersection label describes range overlap without claiming distributional overlap.
7. **Change the analysis population.** Use workspace filters or another chart. All pooled, group and decomposition quantities recompute together. Selecting this chart's own group or brush leaves them unchanged. To analyze only a chosen group, the analyst explicitly applies that category as a workspace/peer filter; the product makes that scope change visible.
8. **Save and reopen.** Normal saved settings contain X/Y/G, chart mode, existing facets, color and canonical filters. Dashboard text and full analysis bundles preserve the same contract. Reopen recomputes using current rows; no cached coefficient is treated as fresh data.

Within a faceted chart, a **group selection is a chart-wide category selection across facets**, consistent with its G predicate. The tooltip/accessibility description states this. A panel's selected counts describe that facet; workspace Rows can include matching records from every facet. The trace remains explicitly scoped to the clicked facet. This avoids pretending a lone G predicate also encodes a facet restriction. An analyst wanting one facet in the population uses the facet field as an explicit external filter. Do not add implicit facet predicates or cross-facet unions behind the same group click.

### 4.3 Color, facets, nonlinear views, and scales

- **Color:** independent from G. Reuse existing swatches only when color is categorical and refers to G with the same keys. Otherwise use neutral group labels and a focus outline, preserving the plot's existing color meaning. An explicit “Use group field for color” action updates `colorField` and `colorScaleId` through the existing `getOrCreateScaleForField` pattern in `ScatterPlotSettingsPanel.tsx`; it does not promise categorical colors for a field configured with a numeric scale.
- **Facets:** compute one decomposition per panel. Never average panel coefficients into a chart-wide result. If G is also the facet field, each panel may have one group, so B=0 and between coefficients are undefined. Say “One group in this facet.”
- **Points/hexagons/density/contours:** these are drawing modes. The comparison always uses the row population, never bin centers, density weights, or marker area as statistical weights. The current `ScatterPlot.tsx` sends rectangular density directly to `DensityScatter`, bypassing `ScatterPoints` and its fit/trace wiring. Milestone 1 must integrate the comparison above that branch or explicitly into both branches; adding it only inside `ScatterPoints` would not satisfy this contract. The imported `DensityScatter` implementation was not supplied and must be inspected before editing.
- **Nonlinear fits:** keep the comparison labeled **Linear slope and Pearson r**. Polynomial degree and LOESS span do not change its math. No claim that a single linear direction describes every portion of a curved relationship.
- **Axis log/symlog, limits and formatting:** these change the view, not raw finite pair values. Nonpositive values hidden on a log axis can remain contributors; show a count of analytic pairs not drawn in the current view and the reason. An analyst who wants log-values analyzed selects an explicit calculated log field, which changes pair validity and units visibly.
- **Nonnumeric/date/category axes:** comparison unavailable with a named field reason; do not coerce category order or timestamp encodings into an unrequested numeric analysis. Retain the authored G setting while the analyst repairs the axes.

### 4.4 Counts, composition, and X-range overlap

Always show n_g, |E_g| and n_g/N. The exact between term uses n_g, and the common-within coefficient uses Wxx,g; show the latter weights in the explanation when the analyst asks why the common slope resembles one group more closely.

For each pair-nonempty group, report `[min X, max X]`. For K≥2, the common intersection is

\[
[L,U]=[\max_g\min X_g,\;\min_g\max X_g].
\]

- L<U: “All group X ranges overlap from L to U.”
- L=U: “Group X ranges touch at L.”
- L>U: “No X interval is shared by every group.”

The last statement does not mean no pair of groups overlaps. Min/max overlap also does not prove comparable density, coverage, experimental support or exchangeability. Show individual ranges so the analyst can inspect the actual composition. Do not automatically trim to an overlap interval; that would define a different population and can remove entire groups.

### 4.5 Direction classification

Define direction from the **unrounded centered cross-product** once X variation is available. Slopes and r share its sign whenever both are defined. Track these separately:

- `positive` / `negative`: numerically resolved sign.
- `zero`: computed zero at calculation precision; display no directional arrow.
- `unresolved`: numerical cancellation/roundoff prevents a reliable sign.
- `undefined`: no valid slope, for example singleton or constant X. Correlation has its own availability because constant Y permits slope zero but not r.

A tiny but resolved coefficient remains signed and is shown in scientific notation. There is no effect-size, p-value or significance cutoff. A value that rounds to zero in a short label is not classified as zero. Numerical resolution is documented separately in §7.

Use counts, not a generic “Simpson detected” badge:

| Condition | Label policy |
| --- | --- |
| At least two estimable groups; every eligible category displayed by the comparison has a resolved, nonzero direction opposite the resolved pooled direction | “Pooled direction reverses every group.” |
| At least two estimable groups all oppose pooled; additional eligible categories are undefined, including categories with zero valid pairs | “Pooled direction opposes all k estimable groups; u groups are undefined.” |
| Both positive and negative group directions occur | “Group directions differ,” with positive/negative/zero/undefined counts. |
| Any relevant direction is zero or unresolved | Report those states; no unqualified all-group reversal. |
| Only one estimable group and others undefined | “Pooled direction differs from the only estimable group,” if true; no blanket reversal. |
| One pair-nonempty group total | “One group in this scope”; no between comparison or reversal claim. |

Groups with eligible rows but zero pairs are also counted in the availability explanation; they prevent a claim about “every displayed group.” The exact all-group predicate is based on the complete groups, not just rows currently visible after table search or paging.

## 5. Population and edge-case decisions

### 5.1 Numeric and grouping eligibility

Use `finiteNumber` on X and Y and keep both reason sets from `numericExclusionReason`. A valid decimal numeric string is a measurement under the existing helper; `"001"` can be a numeric measurement even when field-type inference would have retained it as text. Axis readiness still follows the selected numeric field contract.

Set `invalidX`, `invalidY` independently. The distinct excluded set is their union, so

\[
|E|-N=|invalidX\cup invalidY|,
\]

not `invalidX.length + invalidY.length`. Show `X only`, `Y only`, `both` as disjoint accounting and the original helper reason for each axis. These are invalid numeric inputs, not all necessarily missing values.

Grouping itself does **not** exclude a pair:

- Null and undefined share the existing `(missing)` group.
- `""` and `" "` are separate literal categories, with quoted labels.
- Numeric 1, string `"1"`, boolean true and string `"true"` stay distinct.
- Numeric NaN, +Infinity and −Infinity are permitted category identities; they are not valid X/Y measurements. A string `"NaN"` is a separate category.
- +0 and −0 are one numeric category, as established by `categoryKey`.
- No inferred bins, rare-group pooling, `Other` bucket or implicit key conversion.

This preserves the same pair-valid pooled population when G changes. To exclude missing G, the analyst explicitly filters that category out externally; that recomputes every quantity from the new P.

### 5.2 Small, degenerate, unbalanced and many groups

| Case | Required behavior |
| --- | --- |
| E empty or P empty | Counts and exclusions remain inspectable; no means or coefficients; empty moment sums may be stored as zero internally but are not evidence of a zero relationship. |
| N=1 | Means exist; raw centered sums are zero; sample covariance and slopes/r are undefined. |
| Group n_g=1 | Group means and between contribution exist; within raw sums are zero; group covariance/slope/r undefined. Keep the singleton in P and B. |
| Constant X, variable Y | Covariance zero; slope and r undefined. |
| Variable X, constant Y | Slope zero; covariance zero; r undefined. |
| Constant within groups but differing means | W=0; within slope/r undefined; between and pooled may be defined. |
| Identical group X means | Bxx=0; between slope/r undefined even if group Y means differ. |
| Two nonconstant pairs | Descriptive slope and r available; r is ±1. Show n=2 plainly; add no significance label. [S3] |
| Tiny but nonzero variation | Do not declare constant using a unit-dependent fixed threshold. Compute normalized moments, or report numerical inability separately. |
| Very unequal n_g | Retain all rows with unit observation weights. Show pair counts, composition and within-X weights. |
| Many categories / K=N | Calculate every group exactly; search/scroll/page only the displayed table. No top-K analytic truncation. All singletons means no common-within information. |
| No group field / deleted field | Keep a visible repair state; do not fall back to color or another similarly named field. |

### 5.3 Units and transformations

For \(x'=a+b x\), \(y'=c+d y\), with nonzero finite b,d and no loss of representable distinctions:

\[
S'_{xx}=b^2S_{xx},\quad S'_{yy}=d^2S_{yy},\quad S'_{xy}=bdS_{xy}
\]

for each T/W/B and each group. Thus \(\beta'=(d/b)\beta\) and \(r'=\operatorname{sign}(bd)r\). Offsets a,c do not change centered sums. Positive scale changes preserve directions; one negative scale reverses all defined directions together. Zero b or d creates a constant field and requires the corresponding degeneracy rules.

Units in field metadata are labels unless values are actually converted; do not infer conversions. Logarithms, powers, ranks and arbitrary calculated fields are different analyses, not mere unit changes. The comparison operates on their explicit prepared values and recalculates eligibility. Preserve the raw source and calculated-field trace where existing infrastructure supplies it.

Finite inputs do not guarantee representable raw sums or products. `1e308 + 1e308`, squared deviations, or an expanded intercept can overflow. Two decimals supplied upstream can also arrive as the same binary number; no client method can recover variation already lost. The implementation must distinguish mathematical undefinedness, input quantization, and an unrepresentable numerical output.

## 6. Which records explain a number?

### 6.1 Keep membership, centering reference, and derived summaries distinct

| Quantity or target | Original records and dependency | What the trace shows |
| --- | --- | --- |
| Pooled mean/slope/r or T | P; excluded E\P available separately | Raw/prepared X,Y; global means; centered products; denominator and units. |
| Group slope/r or W_g | P_g; exclusions E_g\P_g | Group means; deviations; each original-row product. |
| Overall W and common-within slope/r | All P, partitioned into P_g | Every group's W terms; Wxx weights; singleton and constant-group statuses. |
| Group B_g | Term records P_g **and** pooled reference P | n_g, group means, grand means and the multiplication; records remain the original P_g. |
| Overall B or weighted group-mean fit | All P; K derived mean points with n_g weights | Derived-group table plus original membership per group. |
| W_g/(N−1) or B_g/(N−1) | P_g plus P for N and possibly pooled means | Denominator explicitly belongs to P; group records alone do not reproduce the contribution. |
| Exclusion count | Exact E\P or the chosen reason subset | Both axis reasons where applicable, including overlapping failures. |
| Current group selection | Category predicate and other own/external filters | Selected eligible records and selected valid pairs as separately labeled counts. |

For F1, the B term for A is `2 × (1 − 17/5) × (7 − 17/5) = −432/25`. Its **term records** are a1,a2. Its **reference population** is all five pairs. Removing b3 would change A's between contribution even though A's own records are unchanged. A trace that lists only a1,a2 as the complete computational dependency would be incomplete.

Every group-summed total contribution satisfies

\[
\sum_{i\in P_g}(x_i-\bar x)(y_i-\bar y)=W_{xy,g}+B_{xy,g}.
\]

For a single record the expansion also has

\[
(x_i-\bar x_g)(\bar y_g-\bar y)+(y_i-\bar y_g)(\bar x_g-\bar x).
\]

Do not allocate B_g/n_g to each row and claim its total product equals within plus allocated-between. The fixture enumerates these nonzero cross terms. Default inspection uses original-row within products and group-level between products, which avoids the misleading rowwise equality.

A contribution is an additive term, **not deletion influence**. Removing a row changes means, denominators and other contributions. Do not label a contribution ranking “most influential records” or borrow held-fit diagnostic concepts from PR520.

### 6.2 Trace and selection lifecycles

- Use the existing `TraceSource` registration and resolver pattern in `ScatterPlot.tsx`. Add scoped comparison targets, not mark-level Inspect buttons.
- Bind targets to owner/facet, statistic kind, typed group key if any, and the source revision. A facet-targeted request must not fall through to the header's first chart source.
- Hold original snapshot row IDs for a trace only during that revision. On source replacement/reorder or other revision invalidation, close/invalidate the trace using the current convention; a new trace recomputes memberships.
- For keyless sources, exactness means exact records in the current array snapshot. It is not a claim of durable record identity. An attached business key can be displayed, but no new unique-key protocol is required.
- Persist semantic group selection through the ordinary filter collection, not through snapshot `__ID` values or a second comparison selection store. The proposed JSON-safe typed-category filter is detailed in the implementation plan. Existing point-filter serialization does not establish durable record identity and is not silently upgraded by this feature.
- After refresh, semantic group filters match current records of the same typed category. A selected category absent from the data remains a visible zero-match filter; never substitute a different category with the same display label.
- Query-derived data is analyzed at the **returned row grain**. One aggregated query result row is one observation unless the host explicitly supplies a different dataset. Do not reweight by underlying source contributor counts or call a result-row trace a complete database lineage proof. Reuse any existing upstream calculation/query trace only to the extent it actually exposes those records.

## 7. Numerical method and tolerances

### 7.1 Implement one local centered-moment helper

The product is not exact-arithmetic software. “Exact” here means a precise descriptive population, identity and contributor contract, evaluated with documented floating-point tolerances. Exact rational fixtures supply the reference values.

Use a small helper local to this comparison and its shared paired-statistics adapter:

1. Prepare finite X/Y once and keep memberships. Determine exact constant status from the prepared values' min/max, not from a fixed variance threshold.
2. Scale each field by an exactly representable power of two chosen from its finite magnitude, so subtraction and intermediate products avoid overflow. For each scope/group use a nearby origin and compensated summation of offsets. Keep the center as origin plus offset; do not reconstruct a huge mean and subtract it again.
3. Use corrected, centered two-pass sums. For approximate centered offsets a_i,b_i, correct the residual sums: `Sxy = sum(a*b) − sum(a)*sum(b)/n`, and similarly for squares. Compensate the sums. Normalize residual magnitudes before squaring/dot products so tiny variances do not underflow during the calculation.
4. Compute per-group moments, total moments directly, and between moments from weighted mean deviations. Retain the X/Y scale factors or exponents with every locally normalized group result; convert them to one common normalized coordinate system before summing W/B or testing T=W+B. Independently normalized group moments must never be added as if their units were identical. Sum with compensation, propagate scale-conversion errors, and compare in those common units. Do not calculate a tiny within term as `T−B` or a tiny between term as `T−W`.
5. Compute correlations by normalized vector norms/dot products; never form `sqrt(Sxx*Syy)` in raw units. Compute slopes with controlled scale ratios. A raw moment or slope can be outside the representable range even when r remains available.
6. Preserve per-quantity status: `available`, `undefined`, `numerically unresolved`, or `outside numeric range`. A nonzero moment that underflows on conversion must not be displayed as a true zero; an overflowing result must not leak `Infinity` or NaN into a coefficient label.

This is an implementation proposal, not a claim that existing `pairedStats` already has these protections. Chan–Golub–LeVeque's study documents the danger of variance calculations with small spread and large offsets; its inspected abstract supports the need for a stable method, not a claim that this exact proposed implementation has been proved. SciPy's primary documentation separately warns about constant and near-constant correlation inputs. [S3], [S10]

Power-of-two scaling is not permission to discard distinctions. If a necessary nonzero difference disappears when normalizing an extreme dynamic range, compute that scope/group with its local scale or return an unresolved result for the affected quantity. Keep unaffected group results available. No arbitrary-precision framework, general solver catalogue or backend is required.

### 7.2 A numerical direction guard, not statistical significance

Use sign from the normalized centered xy sum. Protect the label with a documented roundoff budget. A concrete initial engineering guard for N terms is

\[
\gamma_m=\frac{mu}{1-mu},\qquad u=2^{-53},\quad m=8N+32,
\]

\[
\tau_{xy}=\gamma_m\left(\sum_i|a_i b_i|+\sqrt{\sum_i a_i^2}\sqrt{\sum_i b_i^2}\right),
\]

in the same normalized centered coordinates. For aggregated W/B, include the corresponding group-level summation terms and propagated centering/conversion errors. If `m*u >= 1`, rescaling lost required distinctions, or the identity check is inconsistent, report unresolved rather than a direction. This is a conservative **engineering status policy**, not a certified interval bound for arbitrary underflow/overflow and not a test of a population hypothesis. Codex must validate the actual operation/error accounting against the cancellation fixtures before release; if the guard is revised, record the numerical reason and retain the exact sign fixtures.

- If the computed xy sum is nonzero and its magnitude exceeds the applicable budget, show its sign.
- If it is exactly zero at arithmetic precision, report zero at that precision.
- If it is nonzero but not separated from zero by the budget, report unresolved and retain the numerical estimate in the trace.
- Known constant-X/Y states take their explicit availability route before this guard.

Do not introduce a user-facing “minimum meaningful r,” minimum group count of 10/30, or a p-value cutoff. Numerical failure is separate from small magnitude. The near-zero fixture with δ=2^-40 is deliberately a resolved small negative association; δ=2^-48 is a cancellation stress case whose exact mathematical sign is negative but whose ordinary-precision direction may be reported unresolved.

### 7.3 Exact fixtures and floating-point assertions

For ordinary finite fixtures, compare against exact rational values using:

- Counts, typed group keys, membership sets and exclusion masks: **exact equality**.
- Moments, covariances and finite slopes: `abs(actual−expected) <= 1e−12 * max(1, abs(expected))`.
- Correlations: absolute error ≤ `1e−12`, with a separate sign/status assertion.
- T=W+B residual: `<= 1e−12 * max(1, abs(T), abs(W)+abs(B))` in the tested normalized units.
- F13 offsets: apply the same centered-moment/coefficient tolerances as the unshifted fixture, not a tolerance scaled to 2^40. The displayed large means may be within one correctly rounded binary64 unit in their magnitude.
- F14–F16: compare normalized moments to F1; compare slopes/r to F1 within `1e−12`. Separately assert unrepresentable raw-moment statuses where required. Do not use `max(1,expected)` to make every tiny raw moment trivially pass.
- F17 near-zero: compare the slope to `−δ/5` within `5e−16` absolute and assert a negative resolved sign; compare r within `5e−16`. These are acceptance tolerances, not strength thresholds.
- Reorder: same membership sets and typed group identities, with numeric values within the stated tolerance. Bitwise identity is not promised.

Do not obtain fixture expectations by calling the new planner or by running the same formulas through a second wrapper around it. Use independently enumerated rational sums and a separate least-squares library. NumPy's documented least-squares solver supplies the independent regression path used in this mission. [S11]

## 8. Recommendations and dispositions

Build means include in the proposed implementation plan; Codex and Byron still review the implementation.

| ID | Disposition | Decision and reason |
| --- | --- | --- |
| PG-01 | **Build** | Explicit Compare groups inside Scatter Plot; delivers an authored visible capability while reusing observations and scope. |
| PG-02 | **Build** | One common pair-valid P, typed disjoint groups and overlapping exclusion masks; makes comparisons and identities refer to the same records. |
| PG-03 | **Build** | Exact T/W/B centered-moment contract and common N−1 covariance contributions; prevents denominator confusion. |
| PG-04 | **Build** | Common within slope/r with per-group coefficients retained; summarizes within variation without hiding heterogeneity. |
| PG-05 | **Build** | Pair-count-weighted group-mean slope/r with aggregate labeling; reproduces the decomposition's actual composition. |
| PG-06 | **Build** | Original-record contribution traces with term records and reference population distinguished; makes each number reproducible. |
| PG-07 | **Build** | Canonical typed-category filter in ordinary chart filters; preserves missing and nonfinite category identities without a second selection store. |
| PG-08 | **Build** | Own-selection invariance, explicit facets, numeric/raw-scale labeling and visible scope; prevents unintended changes of estimand. |
| PG-09 | **Build** | Numerical availability states, stable local moment calculation, exact fixtures and independent solver checks; supports offsets and extreme finite values honestly. |
| PG-10 | **Build** | Save/text round trips, docs, runnable example, pointer/keyboard acceptance and measured performance in each feature milestone; completes the user flow. |
| PG-11 | **Build** | Counts, X ranges, range intersection and within-X weights; explains unequal composition without causal diagnosis. |
| PG-12 | **Explore** | Distinct group-mean overlay in the existing plot after the table ships; may improve spatial interpretation, but is not required for the exact explanation. |
| PG-13 | **Defer** | Equal-weight means regression and user-supplied statistical weights; useful separate estimands but would widen the initial contract. |
| PG-14 | **Defer** | Dedicated analysis chart, rank correlation, automatic group search, pair ranking and multilevel/random-effects fits; separate analytical tasks. |
| PG-15 | **Avoid** | Averaging correlations, mixing covariance denominators, category truncation, implicit transforms or mean rows presented as observations; these change or misstate the calculation. |
| PG-16 | **Avoid** | Confounding/causal labels, default p-values, automatic significance or effect-size thresholds; descriptive evidence does not supply those conclusions. |
| PG-17 | **Avoid** | Dependency on unbuilt PR519/520/524, generic lineage/statistics infrastructure or an outside-demand gate; none is necessary for this requested feature. |

## 9. Exact fixtures and independent checks

All cases below use original synthetic record IDs. Triple order is `(XX, XY, YY)`. `T`, `W`, and `B` denote total, summed within-group, and size-weighted between-group centered cross-products. A group's local triple is its own centered cross-products. `β` means a least-squares slope with an intercept; `r` is Pearson correlation. Undefined means mathematically unavailable, never numeric zero. Every unqualified covariance decomposition uses the common denominator `N−1`. This appendix is research evidence and a proposed application-test specification; no explorEDA implementation or tests were run.

### F1 — unequal-size pooled reversal

| Record | Group | X | Y |
|---|---|---:|---:|
| a1 | A | 0 | 6 |
| a2 | A | 2 | 8 |
| b1 | B | 4 | 0 |
| b2 | B | 5 | 1 |
| b3 | B | 6 | 2 |

Membership: pooled `{a1,a2,b1,b2,b3}`; A `{a1,a2}`; B `{b1,b2,b3}`. All five records belong to the within term, including b2 whose within contribution is zero. The between term contains **two group contributions**, each with its respective original-row membership; it does not contain five new original observations.

| Population | `(N, ΣX, ΣY, ΣX², ΣXY, ΣY²)` | Means `(X̄,Ȳ)` |
|---|---|---|
| A | `(2,2,14,4,16,100)` | `(1,7)` |
| B | `(3,15,3,77,17,5)` | `(5,1)` |
| Pooled | `(5,17,17,81,33,105)` | `(17/5,17/5)` |

| Quantity | Exact triple `(XX,XY,YY)` | Slope; correlation |
|---|---|---|
| A local | `(2,2,2)` | `βA=1; rA=1` |
| B local | `(2,2,2)` | `βB_group=1; rB_group=1` |
| Total T | `(116/5,−124/5,236/5)` | `βT=−31/29; rT=−31/√1711 ≈−0.7494396893960719` |
| Within W | `(4,4,4)` | `βW=1; rW=1` |
| Between B | `(96/5,−144/5,216/5)` | `βbetween=−3/2; rbetween=−1` |

- Common-denominator sample covariance: `−31/5 = 1 + (−36/5)`.
- Sample variances: `VarX=29/5=1+24/5`; `VarY=59/5=1+54/5`.
- Group sample covariances differ: A `2/(2−1)=2`; B `2/(3−1)=1`.
- The pooled within-group covariance using residual degrees of freedom is `WXY/(N−K)=4/3`; it is **not** the within contribution `WXY/(N−1)=1`.
- Slope identity: `βT=(5/29)·1+(24/29)·(−3/2)=−31/29`.
- A X range `[0,2]`; B `[4,6]`; their observed X ranges have a gap of `2`. Do not imply that their slopes compare the same observed X range.
- Within common-line intercepts: A `6`, B `−4`. Group-mean line: `Y=17/2−(3/2)X`. Pooled line: `Y=204/29−(31/29)X`.

#### F1 contributor arithmetic

| Record | Total XY contribution | Within XY contribution |
|---|---:|---:|
| a1 | `−221/25` | `1` |
| a2 | `−161/25` | `1` |
| b1 | `−51/25` | `1` |
| b2 | `−96/25` | `0` |
| b3 | `−91/25` | `1` |
| Sum | `−124/5` | `4` |

| Group | Between triple `(XX,XY,YY)` | Original records |
|---|---|---|
| A | `(288/25,−432/25,648/25)` | `{a1,a2}` |
| B | `(192/25,−288/25,432/25)` | `{b1,b2,b3}` |

Do not claim the displayed total contribution of an individual record equals its within contribution plus an equal allocation of its group's between contribution. The two cross terms cancel **after grouping**, not record by record. For a1, the equal allocation is `−216/25` and the cross terms sum to `−6/5`; hence `−221/25=1−216/25−6/5`. For a2 the cross-term sum is `+6/5`; for b1/b2/b3 it is `+4/5,0,−4/5`. A bounded product should show original-row within contributions and group-level between contributions, with drilldown to the original rows, rather than inventing allocated original observations.

### F2–F4 — direction control, mixed signs, singleton

Use F1 IDs and memberships except the stated changes.

| Case and exact change | Raw sums `(N,ΣX,ΣY,ΣX²,ΣXY,ΣY²)` | Means |
|---|---|---|
| F2: set every `Y=X` | `(5,17,17,81,81,81)` | `(17/5,17/5)` |
| F3: B Y values become `2,1,0`; A unchanged | `(5,17,17,81,29,105)` | `(17/5,17/5)` |
| F4: append c1, group C, `(3,4)` | `(6,20,21,90,45,121)` | `(10/3,7/2)` |

| Case | `T; W; B` triples | Coefficients and classification |
|---|---|---|
| F2 | `(116/5,116/5,116/5); (4,4,4); (96/5,96/5,96/5)` | All group/pooled/within/between slopes and correlations `+1`; consistent directions. |
| F3 | `(116/5,−144/5,236/5); (4,0,4); (96/5,−144/5,216/5)` | A slope/r `+1`; B slope/r `−1`; `βT=−36/29`, `rT=−36/√1711`; `βW=rW=0`; between `−3/2,−1`. Mixed group directions, not an all-group reversal. |
| F4 | `(70/3,−25,95/2); (4,4,4); (58/3,−29,87/2)` | `βT=−15/14`, `rT=−15/√399`; within `1,1`; between `−3/2,−1`. A and B positive; C singleton slope/r undefined. Report “opposite among 2 estimable groups; 1 group undefined,” never “all 3 groups reverse.” |

In F4, C has zero within triple and a nonzero between triple `(1/9,−1/6,1/4)`. Its original record must remain in the pair-valid total and between terms. A/B within triples remain `(2,2,2)`. Common covariance contributions are `−5 = 4/5 − 29/5`.

### F5 — overlapping exclusions and missing grouping

Start with F1 and append these **raw**, uncoerced records. The test should call existing `finiteNumber`, `numericExclusionReason`, and `categoryKey`, not duplicate parsing rules.

| Record | Raw `(X,Y,group)` | Pair membership / reason |
|---|---|---|
| m1 | `(null,9,"A")` | Excluded: X |
| m2 | `(7,"oops","B")` | Excluded: Y |
| m3 | `(undefined,Infinity,null)` | Excluded: X and Y |
| m4 | `(true,""," ")` | Excluded: X and Y |
| m5 | `("0x10",3,0)` | Excluded: X; radix-prefixed text is not a measurement |
| m6 | `("7","3",null)` | Included as `(7,3)`, group `(missing)` |
| m7 | `(8,4,undefined)` | Included, same `(missing)` group |
| m8 | `(9,5,"")` | Included, distinct empty-string category |
| m9 | `(10,6," ")` | Included, distinct space-string category |

- Eligible `14`; pair-valid `9`; excluded union `5`.
- Invalid-X IDs `{m1,m3,m4,m5}`: `4`.
- Invalid-Y IDs `{m2,m3,m4}`: `3`.
- Both-invalid IDs `{m3,m4}`: `2`.
- Identity: `4+3−2=5`, rather than pretending overlapping reasons partition rows.
- Pair-valid IDs `{a1,a2,b1,b2,b3,m6,m7,m8,m9}`.
- Missing grouping is retained as a descriptive category: `{m6,m7}`. Eligible missing-group IDs include excluded m3 as well; do not confuse eligible count `3` with paired count `2`.
- Group `(missing)` local mean `(15/2,7/2)`, local triple `(1/2,1/2,1/2)`, slope/r `1`; empty and space-string groups are separate singletons. Number of nonempty pair groups `K=5`. The eligible numeric-0 category has one row and zero valid pairs; include it among undefined categories, although it has no mean and is not counted in K.
- Raw sums `(9,51,35,375,191,191)`, means `(17/3,35/9)`.
- `T=(86,−22/3,494/9)`, `W=(9/2,9/2,9/2)`, `B=(163/2,−71/6,907/18)`.
- `βT=−11/129`, `rT=−11/√10621`; `βW=rW=1`; `βbetween=−71/489`, `rbetween=−71/√147841`.
- Covariance: `−11/12 = 9/16 − 71/48`.

This differs intentionally from the existing `pairedStats`/`planScatterFits` first-failure `if ... else if` counters. The new explanatory trace must label overlapping reason sets and a distinct union count; preserving compatibility does not justify calling exclusive first-failure counts marginal invalid-X/Y totals.

### F6 — three unequal groups distinguish legitimate weights

| Group | Original records `(id,X,Y)` | Local mean; local triple |
|---|---|---|
| A | `(a1,−1,−1),(a2,1,1)` | `(0,0)`; `(2,2,2)` |
| B | `(b1,1,5),(b2,2,4),(b3,3,3)` | `(2,4)`; `(2,−2,2)` |
| C | `(c1,1,−5),(c2,3,−1),(c3,5,3),(c4,7,7)` | `(4,1)`; `(20,40,80)` |

Raw group sums: A `(2,0,0,2,2,2)`; B `(3,6,12,14,22,50)`; C `(4,16,4,84,56,84)`.

- Pooled raw sums `(9,22,16,100,80,136)`; global means `(22/9,16/9)`.
- `T=(416/9,368/9,968/9)`, `W=(24,40,84)`, `B=(200/9,8/9,212/9)`.
- Group slopes/r are `(1,1)`, `(−1,−1)`, `(2,1)` respectively.
- `βT=23/26`; `rT=23/√1573≈0.5799138415081941`.
- `βW=5/3`; `rW=10/(3√14)≈0.8908708063747479`.
- Size-weighted group-means regression: `βbetween=1/25`; `rbetween=2/(5√106)≈0.038851434494290564`.
- Equal-weight group-means regression: centered triple `(8,2,26/3)`; slope `1/4`, correlation `√(3/52)`. This is a different estimand; the weighted slope is not an implementation detail.
- A size-weighted average of individual-group slopes is `7/9`, and their simple average is `2/3`; both differ from the correct `βW=5/3` because the proper slope weights are each group's `SXX` (`2,2,20`).
- Common sample covariance: `46/9 = 5 + 1/9`.
- Pooled slope identity: `(27/52)·(5/3)+(25/52)·(1/25)=23/26`.
- Group between triples: A `(968/81,704/81,512/81)`; B `(16/27,−80/27,400/27)`; C `(784/81,−392/81,196/81)`.
- Group X ranges: A `[−1,1]`, B `[1,3]`, C `[1,7]`; shared intersection is the point `{1}`, with no positive-width common interval. A one-point overlap does not establish broad comparability.

### F7/F8 — constants distinguish slope from correlation

| Case / explicit records `(id,group,X,Y)` | `T; W; B` | Expected availability |
|---|---|---|
| F7: `(a1,A,3,1),(a2,A,3,3),(b1,B,3,5),(b2,B,3,7)` | `(0,0,20); (0,0,4); (0,0,16)` | Every slope and r undefined because X is constant. Raw sums `(4,12,16,36,48,84)`; global means `(3,4)`. |
| F8: `(a1,A,0,7),(a2,A,1,7),(b1,B,2,7),(b2,B,3,7)` | `(5,0,0); (1,0,0); (4,0,0)` | Pooled, both group, within, and between slopes are exactly `0` because X varies. Every r is undefined because Y is constant. Raw sums `(4,6,28,14,42,196)`; means `(3/2,7)`. |

Also require three degenerate mutations: empty current population → no means/coefficients; one retained record → means but no slope/r; make each F1 row its own group → `W=(0,0,0), B=T`, within slope/r unavailable, no estimable per-group slopes, pooled/between unchanged. These are proposed application fixtures; exact zero identities are immediate from the definitions.

### F9/F10 — external filter changes versus own selection

- F9: externally remove b3 from F1. Eligible/paired IDs `{a1,a2,b1,b2}`; A two and B two pairs. Raw sums `(4,11,15,45,21,101)`; means `(11/4,15/4)`. `T=(59/4,−81/4,179/4)`, `W=(5/2,5/2,5/2)`, `B=(49/4,−91/4,169/4)`. `βT=−81/59`, `rT=−81/√10561`; within slope/r `1`; between slope `−13/7`, r `−1`.
- F10: externally retain only A from F1. Raw sums `(2,2,14,4,16,100)`; `T=W=(2,2,2)`, `B=(0,0,0)`. Pooled/within/group slope/r `1`; between coefficients undefined. Show one group, not a reversal comparison.
- Own brush or own group selection restricting visible selection to `{a1,a2}` must **not** change F1 comparison values or memberships. It updates selected highlighting/counts only. Faceting to A does change the analysis population and yields F10.
- Reorder source rows to `[b3,a1,b2,a2,b1]`; all moments and group memberships remain mathematically identical. With stable source IDs, compare sets exactly; with positional IDs, rebuild membership for the current snapshot and do not pretend old positional IDs follow records across refresh.

### F11 — typed categories

| Typed group | Records `(id,X,Y)` | Slope/r |
|---|---|---|
| number `1` | `(n1,0,0),(n2,1,1)` | `1,1` |
| string `"1"` | `(s1,0,1),(s2,1,0)` | `−1,−1` |
| boolean `true` | `(b1,0,2),(b2,1,3)` | `1,1` |
| string `"true"` | `(t1,0,3),(t2,1,2)` | `−1,−1` |

Four separate groups of two, never two coalesced labels. Raw sums `(8,4,12,4,6,28)`; means `(1/2,3/2)`; `T=(2,0,10)`, `W=(2,0,2)`, `B=(0,0,8)`. Pooled and within slope/r `0`; between slope/r undefined. Existing `categoryKey` also keeps numeric NaN separate from string `"NaN"` and treats null/undefined together; add focused key assertions if not already covered by shared-helper tests, rather than duplicating a parsing framework.

### F12–F16 — units, offsets, tiny variation, extreme finite data

#### F12, affine unit change

Apply `X′=1000X+100`, `Y′=−2Y+7` to F1, preserving IDs/groups.

- Raw sums `(5,17500,1,84450000,53100,189)`; means `(3500,1/5)`.
- `T′=(23200000,49600,944/5)`; `W′=(4000000,−8000,16)`; `B′=(19200000,57600,864/5)`.
- `βT′=31/14500`; `βW′=−1/500`; `βbetween′=3/1000`.
- Correlations change sign: pooled `+31/√1711`, both groups and within `−1`, between `+1`.
- `CXY′=−2000·CXY`, `CXX′=10^6·CXX`, `CYY′=4·CYY`; translations change means but no centered products. The direction relationship remains a reversal.

#### F13, large offsets

Apply `X′=2^40+X`, `Y′=−2^40+Y` to F1. All integer raw input values remain exactly representable. Means are `2^40+17/5` and `−2^40+17/5`, rounded only for binary64 output. All T/W/B centered products, slopes, and r values equal F1. A calculation that subtracts two huge uncentered sums is unacceptable; even centering around a rounded global mean should not be allowed a tolerance proportional to `2^40`. Use offset-relative/scaled coordinates for the moments.

#### F14–F16, scaled versions of F1

| Case | Transformation | Exact result / numeric risk |
|---|---|---|
| F14 | Both X/Y multiplied by `2^−500` | All cross-products multiply by `2^−1000`, while all slopes/r remain F1. The moments are representable, but direct `SXX*SYY` underflows, so naive r may fail. |
| F15 | Both X/Y multiplied by `2^600` | Finite input values; moments multiply by `2^1200` and exceed binary64 output range. Scaled moments still yield the F1 slopes/r. Report unrepresentable dimensional moments explicitly; never drop finite rows or substitute zero. |
| F16 | Both X/Y multiplied by `2^−600` | Finite, distinct inputs; moments multiply by `2^−1200`, which underflows binary64. Scaled moments still yield F1 slopes/r. Never label these fields constant merely because unscaled products become zero. |

The exact-rational oracle checked all transformations and coefficient invariance. The independent least-squares checks use normalized coordinates for sensible conditioning; no application implementation has been tested for these cases. If a future binary64 calculation cannot support a dimensional output, its availability status is separate from population inclusion and from the availability of dimensionless r.

### F17/F18 — near-zero versus exactly zero

Use A `(0,1+δ),(2,3+δ)` and B `(4,0),(6,2)`, with stable IDs a1/a2/b1/b2. For F17 take `δ=2^−40`; for F18 take `δ=0`.

- `N=4`, global means `(3,3/2+δ/2)`.
- Raw sums `(4,12,6+2δ,56,18+2δ,14+8δ+2δ²)`.
- `T=(20,−4δ,5+2δ+δ²)`; `W=(4,4,4)`; `B=(16,−4(1+δ),(1+δ)²)`.
- Both group slopes/r and within slope/r equal `+1`.
- `βT=−δ/5`; `rT=−4δ/√[20(5+2δ+δ²)]`.
- F17 is a mathematically negative pooled association of magnitude about `3.64×10^−13` in r; it must not be presented as a material effect or rounded into an unexplained exact zero. F18 is exactly zero and is not an opposing direction.
- Do not use an absolute slope epsilon for “zero”: a unit change would alter classification. A display-level “rounds to zero” state and a numerical-precision availability state are distinct from a significance test.

### Numerical assertions for these fixtures

Use the exact membership assertions and numerical tolerances in §7.3. They distinguish ordinary arithmetic, large offsets, tiny/huge raw moments, and resolved near-zero signs; do not let a generic absolute tolerance make an incorrect zero pass.

### Checks actually executed

Research-only commands, from the scratch workspace:

```bash
# Exact rational raw moments; independent centered contribution enumeration;
# independent NumPy least-squares and residual-Pearson checks.
python3 analysis/fixtures_reference.py

# Numeric-array mathematics only; seven repeats after one warm-up, no cache.
OPENBLAS_NUM_THREADS=1 OMP_NUM_THREADS=1 python3 analysis/reference_performance.py
```

The exact oracle uses Python `fractions.Fraction` to evaluate raw sums and centered products separately. It checks every group and total identity, contributor cross-term cancellation, exact reorder invariance, and affine/offset/extreme scaling invariance. A separate NumPy `linalg.lstsq` route fits (1) `[1,X]`, (2) all group-indicator columns plus X, (3) `[1,X̄g]` multiplied by `√ng`, and (4) unweighted group means. `numpy.corrcoef` on separately demeaned original rows checks within r. NumPy version `2.3.5`, Python `3.12.14`. Constants are checked for mathematical availability before comparing a numerical solver's rank-deficient output. Extreme-scale fixtures are validated by exact arithmetic and normalized relationships, not unscaled rank-deficient least squares.

Actual notable numerical checks: F1 pooled `−1.0689655172413788`, within dummy slope `0.9999999999999982`, weighted means `−1.4999999999999996`; F6 pooled `0.8846153846153848`, within `1.6666666666666663`, weighted means `0.03999999999999993`, unweighted means `0.25000000000000033`, within residual r `0.890870806374748`. These agree with exact targets at stated tolerances.

No repository install/build/test, React render, browser interaction, saved-state round trip, or new production planner was executed. Their acceptance checks remain proposed implementation work.

#### Measured reference mathematics probe

Single-thread BLAS environment, one warm-up plus seven timed repeats, input generation outside timing, fresh moment arrays each invocation, no cache. Recorded platform: Linux 6.18.55, x86_64, glibc 2.39; Python 3.12.14 and NumPy 2.3.5. CPU model and isolated hardware performance were not recorded. The function computes global and group means and all T/W/B products using NumPy arrays and **pre-encoded numeric group IDs**, then checks the decomposition. Median/p95 below are milliseconds; p95 is linearly interpolated from seven observations, so this is a coarse reference probe, not a stable performance percentile.

Reproduction recipe: initialize `rng = np.random.default_rng(20261025)` once; iterate N=(1000,10000,100000), then K=(2,20,200,2000), skipping K>N. Set `g=np.arange(N)%K`, `x=1e6+0.2*g+rng.normal(size=N)`, and `y=1e6−0.3*g+0.8*(x−1e6−0.2*g)+rng.normal(size=N)`. Inside timing, subtract each field's first value, compute global means and `np.bincount` group means, form total/within/group-mean deviations, and accumulate the three triples with `np.dot`. Include the `np.allclose(T,W+B,rtol=1e−11,atol=1e−8)` assertion in each timed invocation. Use `time.perf_counter_ns` and `np.quantile(times,.95)` after seven calls. This simple benchmark's identity tolerance is solely its workload check; the production acceptance tolerances remain §7.3. Timing values are environment-specific.

| N rows | K nonempty groups | median / p95 ms |
|---:|---:|---:|
| 1,000 | 2 | `0.093 / 0.573` |
| 1,000 | 20 | `0.051 / 0.102` |
| 1,000 | 200 | `0.063 / 0.330` |
| 10,000 | 2 | `0.343 / 0.596` |
| 10,000 | 20 | `0.119 / 0.160` |
| 10,000 | 200 | `0.166 / 0.278` |
| 10,000 | 2,000 | `0.137 / 0.300` |
| 100,000 | 2 | `2.790 / 3.052` |
| 100,000 | 20 | `2.041 / 2.117` |
| 100,000 | 200 | `2.486 / 3.208` |
| 100,000 | 2,000 | `1.778 / 2.279` |

`N=1,000,K=2,000` nonempty groups is impossible and was not fabricated. The probe excludes parsing, typed categorization, row-ID/trace creation, JavaScript, React, DOM/SVG, rendering, responsiveness, and peak memory. It provides evidence that basic linear-time moment arithmetic is tractable in this reference environment; **it does not measure explorEDA throughput, prescribe an application row limit, or justify a cache**. The first implementation milestone must measure the actual planner and interactive end-to-end flow before introducing performance policies.




### Compact independent oracle

This research-only Python script was executed successfully with Python 3.12.14 and NumPy 2.3.5. It imports no explorEDA code, uses exact rational raw moments for the enumerated fixture expectations, and checks the resulting coefficients against independently solved least-squares models and residual correlations. The code is an oracle, not the proposed production floating-point algorithm.

```python
from fractions import Fraction as Q
from collections import defaultdict
import math
import numpy as np

# Research oracle only: exact raw moments + independent linear algebra.
# Rows are (record ID, group, X, Y), with no product-planner import.
f1 = [('a1','A',0,6), ('a2','A',2,8),
      ('b1','B',4,0), ('b2','B',5,1), ('b3','B',6,2)]
fixtures = {
    'F1': f1,
    'F3': [(i,g,x,2-y if g == 'B' else y) for i,g,x,y in f1],
    'F4': f1 + [('c1','C',3,4)],
    'F6': [('a1','A',-1,-1), ('a2','A',1,1),
           ('b1','B',1,5), ('b2','B',2,4), ('b3','B',3,3),
           ('c1','C',1,-5), ('c2','C',3,-1),
           ('c3','C',5,3), ('c4','C',7,7)],
}
# Expected triples are XX, XY, YY, independently enumerated in the report.
expected = {
    'F1': [(Q(116,5),Q(-124,5),Q(236,5)), (4,4,4),
           (Q(96,5),Q(-144,5),Q(216,5))],
    'F3': [(Q(116,5),Q(-144,5),Q(236,5)), (4,0,4),
           (Q(96,5),Q(-144,5),Q(216,5))],
    'F4': [(Q(70,3),-25,Q(95,2)), (4,4,4),
           (Q(58,3),-29,Q(87,2))],
    'F6': [(Q(416,9),Q(368,9),Q(968,9)), (24,40,84),
           (Q(200,9),Q(8,9),Q(212,9))],
}

def moments(rows):
    n = len(rows)
    x = [Q(row[2]) for row in rows]
    y = [Q(row[3]) for row in rows]
    sx, sy = sum(x), sum(y)
    raw = (n, sx, sy, sum(v*v for v in x),
           sum(a*b for a,b in zip(x,y)), sum(v*v for v in y))
    centered = (raw[3]-sx*sx/n, raw[4]-sx*sy/n, raw[5]-sy*sy/n)
    return raw, (sx/n,sy/n), centered

for name, rows in fixtures.items():
    raw, (mx,my), total = moments(rows)
    grouped = defaultdict(list)
    for row in rows:
        grouped[row[1]].append(row)
    group_stats = [moments(rs) for rs in grouped.values()]
    within = tuple(sum(s[2][j] for s in group_stats) for j in range(3))
    between = (sum(s[0][0]*(s[1][0]-mx)**2 for s in group_stats),
               sum(s[0][0]*(s[1][0]-mx)*(s[1][1]-my) for s in group_stats),
               sum(s[0][0]*(s[1][1]-my)**2 for s in group_stats))
    assert [total,within,between] == expected[name]
    assert total == tuple(a+b for a,b in zip(within,between))

    # A distinct numerical route: dummy-intercept and weighted-mean models.
    x = np.array([r[2] for r in rows], dtype=float)
    y = np.array([r[3] for r in rows], dtype=float)
    d = np.array([[float(r[1] == g) for g in grouped] for r in rows])
    counts = d.sum(axis=0)
    gx, gy = (d.T@x)/counts, (d.T@y)/counts
    residual_x, residual_y = x-d@gx, y-d@gy
    design = np.column_stack([np.ones(len(counts)),gx])
    root_n = np.sqrt(counts)
    got = [np.linalg.lstsq(np.column_stack([np.ones(len(x)),x]),y,rcond=None)[0][-1],
           np.linalg.lstsq(np.column_stack([d,x]),y,rcond=None)[0][-1],
           np.linalg.lstsq(design*root_n[:,None],gy*root_n,rcond=None)[0][-1]]
    numeric_correlations = [np.corrcoef(x,y)[0,1],
                            np.corrcoef(residual_x,residual_y)[0,1],
                            np.corrcoef(d@gx,d@gy)[0,1]]
    for triple, slope, r in zip([total,within,between],got,numeric_correlations):
        xx,xy,yy = triple
        exact_slope = float(xy/xx)
        exact_r = float(xy)/math.sqrt(float(xx)*float(yy))
        assert abs(slope-exact_slope) <= 1e-12*max(1,abs(exact_slope))
        assert abs(r-exact_r) <= 1e-12
    equal = np.linalg.lstsq(design,gy,rcond=None)[0][-1]
    if name == 'F6':
        assert abs(equal-0.25) <= 1e-12 and abs(got[2]-0.04) <= 1e-12
    # IDs are compared as membership sets; summation order may differ in float.
    assert moments(list(reversed(rows)))[1:] == moments(rows)[1:]
    print(name, 'raw=', raw, 'slopes=', got, 'r=', numeric_correlations)

# Near-zero fixture must resolve the negative sign at the proposed tolerance.
delta = 2.0**-40
x, y = np.array([0.,2.,4.,6.]), np.array([1+delta,3+delta,0.,2.])
slope = np.linalg.lstsq(np.column_stack([np.ones(4),x]),y,rcond=None)[0][-1]
r = np.corrcoef(x,y)[0,1]
expected_r = -4*delta/math.sqrt(20*(5+2*delta+delta*delta))
assert slope < 0 and abs(slope+delta/5) <= 5e-16
assert r < 0 and abs(r-expected_r) <= 5e-16
print('F17: negative sign and 5e-16 tolerance passed.')
print('All exact identities and independent checks passed; NumPy',np.__version__)
```

The script checks F1, F3, F4, F6 and the strict F17 near-zero tolerance. It does not execute application planners, parsing, selection, persistence, rendering, or browser acceptance.


## 10. Direct sources and what they establish

External sources were consulted after the complete source-packet access gate. Links below identify primary papers or authoritative method documentation, accessed **25 October 2026**. The finite-sample proofs, synthetic datasets and exact arithmetic in this report are original derivations for the chosen contract. Product and implementation decisions are proposals; citations do not imply that a reference implementation already exists in explorEDA.

| ID | Direct source | Decisive use and evidence boundary |
| --- | --- | --- |
| S1 | Charles W. Champ and Andrew V. Sills (2022), *The Generalized Law of Total Covariance*, [arXiv:2205.14525][S1], introduction. | States the total-covariance identity and its total-variance specialization. The report separately derives the exact finite partition and sample-denominator rules. |
| S2 | SAS Institute, *The DISCRIM Procedure: Displayed Output*, [official documentation][S2], covariance/SSCP matrix definitions. | Confirms that total, pooled-within and between covariance labels can use different normalizations. The chosen N−1 additive display is explicit rather than inferred from the word “between.” |
| S3 | SciPy, [`pearsonr`][S3] and [`linregress`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.linregress.html), official API documentation. | Standard coefficient definitions, constant/near-constant warnings, and the two-pair Pearson endpoint behavior. Inferential defaults and near-constant warning thresholds are not adopted as product significance rules. |
| S4 | Craig K. Enders and Davood Tofighi (2007), *Centering Predictor Variables in Cross-Sectional Multilevel Models: A New Look at an Old Issue*, **Psychological Methods 12(2), 121–138**, [full paper][S4]; DOI [10.1037/1082-989X.12.2.121](https://doi.org/10.1037/1082-989X.12.2.121), especially pp. 124–126. | Distinguishes total, within and between coefficients and explains group centering. The report uses the algebraic coefficient distinction; it does not import a multilevel inference model or its assumptions. |
| S5 | StataCorp, *xtreg — Linear models for panel data*, [official methods manual][S5], “Methods and formulas,” particularly printed pp. 40–42 in the inspected PDF. | Mean-deviated regression and group-indicator residualization support the common-within coefficient. The between section distinguishes default OLS on means from the optional group-size-weighted fit; the decomposition needs the latter weighting. |
| S6 | R Core Team, *lm: Fitting Linear Models*, [official R manual][S6], weights, details and warning sections. | Defines weighted least squares and QR fitting, and cautions about inference from group means/replication weights when within-group variation is absent. R was a methodological reference, not an executed oracle here. |
| S7 | E. H. Simpson (1951), *The Interpretation of Interaction in Contingency Tables*, **Journal of the Royal Statistical Society, Series B 13(2), 238–241**, [original-paper scan][S7]. | Primary historical treatment of aggregation and interpretation. Do not attribute every modern strict reversal example to this paper or infer a causal answer from the descriptive pattern. |
| S8 | Judea Pearl (2014), *Comment: Understanding Simpson's Paradox*, **The American Statistician 68(1), 8–13**, [author-hosted reprint][S8]; DOI [10.1080/00031305.2014.876829](https://doi.org/10.1080/00031305.2014.876829). | Explicit strict sign-reversal definition and explanation of why statistical associations alone do not determine the causal interpretation. Used to bound labels, not to add causal analysis. |
| S9 | W. S. Robinson (1950), *Ecological Correlations and the Behavior of Individuals*, **American Sociological Review 15(3), 351–357**, [original-paper scan][S9]. | Distinguishes relationships among aggregate groups from individual-level relationships. No historical numerical example or weighted-correlation formula from the paper is used as a fixture or implementation rule. |
| S10 | Tony F. Chan, Gene H. Golub and Randall J. LeVeque (1983), *Algorithms for Computing the Sample Variance: Analysis and Recommendations*, **The American Statistician 37(3), 242–247**, [publisher record and abstract][S10]; DOI [10.1080/00031305.1983.10483115](https://doi.org/10.1080/00031305.1983.10483115). | The inspected abstract establishes the small-spread/large-offset numerical concern. Full-text retrieval was unavailable in this run. No exact algorithm, operation bound or proposed direction guard is represented as verified from that full paper. |
| S11 | NumPy, [`numpy.linalg.lstsq`][S11], official reference. | Documents the independent least-squares minimization route. The actual research oracle ran NumPy **2.3.5**, independently of the live documentation version. It did not call the proposed production planner. |

[S1]: https://arxiv.org/pdf/2205.14525
[S2]: https://support.sas.com/documentation/cdl/en/statug/67523/HTML/default/statug_discrim_details23.htm
[S3]: https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.pearsonr.html
[S4]: https://www.stat.cmu.edu/~brian/valerie/617-2022/week10/Enders%20Tofighi%20-%20centering%20-%202007.pdf
[S5]: https://www.stata.com/manuals/xtxtreg.pdf
[S6]: https://stat.ethz.ch/R-manual/R-devel/library/stats/html/lm.html
[S7]: https://math.bme.hu/~marib/bsmeur/simpson.pdf
[S8]: https://ftp.cs.ucla.edu/pub/stat_ser/r414-reprint.pdf
[S9]: https://www.stats.uwo.ca/faculty/aim/2015/9938/articles/Robinson1950AmericanSociologicalReview.pdf
[S10]: https://www.tandfonline.com/doi/abs/10.1080/00031305.1983.10483115
[S11]: https://numpy.org/doc/stable/reference/generated/numpy.linalg.lstsq.html

## 11. Completion and open decisions

### Access status

**Complete supplied-source access confirmed.** The attached `pro-prompt.md` and complete `source-packet.txt` were read before external research. All 39 repository files below were read in full across the research team. The packet declares commit `95832bd473884aeae23453af0888b4ca5187820d`; this mission did not fetch or certify a remote checkout. `docs/research/DIRECTION.md` governs the decision: Byron is the demand. No missing decisive source blocks this Methods result.

### Files read

The two attachments and the following complete packet files supplied the repository evidence:

1. `AGENTS.md`
2. `README.md`
3. `CODING_STANDARDS.md`
4. `docs/agent-guide.md`
5. `docs/ui-defaults.md`
6. `docs/research/DIRECTION.md`
7. `docs/intent/research-ideas-100/ideas/R010-pooled-group-reversals.md`
8. `docs/intent/research-ideas-100/ideas/R005-rank-correlation.md`
9. `docs/intent/scientific-multivariate-analysis/intent-brief.md`
10. `docs/research/relationship-discovery-2026-10-19/README.md`
11. `packages/explorEDA/src/lib/valueParsing.ts`
12. `packages/explorEDA/src/lib/categories.ts`
13. `packages/explorEDA/src/types/SavedDataStructure.ts`
14. `packages/explorEDA/src/utils/saveDataUtils.ts`
15. `packages/explorEDA/src/lib/dsl/settingKeys.ts`
16. `apps/demo/src/docs/pages/scatter.mdx`
17. `apps/demo/src/docs/pages/scatter-matrix.mdx`
18. `apps/demo/src/demos/examples.ts`
19. `apps/demo/src/demos/coverage.ts`
20. `apps/demo/src/docs/live/examples.ts`
21. `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`
22. `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts`
23. `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts`
24. `packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts`
25. `packages/explorEDA/src/components/charts/ScatterPlot/summaryMarginals.test.ts`
26. `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts`
27. `packages/explorEDA/src/components/charts/ScatterPlot/scatterTrace.ts`
28. `packages/explorEDA/src/components/charts/ScatterPlot/PairedSummaryBody.tsx`
29. `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts`
30. `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx`
31. `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx`
32. `packages/explorEDA/src/components/charts/ScatterPlot/FitTraceBody.tsx`
33. `packages/explorEDA/src/components/charts/ScatterPlot/useScatterFits.ts`
34. `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts`
35. `packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts`
36. `packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts`
37. `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts`
38. `packages/explorEDA/src/components/charts/ChartTraceDetails.tsx`
39. `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx`

Imported integration neighbors absent from the packet are listed in implementation-plan §3. They are implementation inspection targets, not files claimed to have been read here.

### Checks performed versus proposed

| Status | Work |
| --- | --- |
| **Executed** | Complete packet read and boundary/inventory reconciliation before research; source-path/symbol inspection; primary-literature and official-documentation research with the access limitation for S10 stated above. |
| **Executed** | Exact rational fixture arithmetic: raw sums versus separately enumerated centered products, per-group and total identities, contributor cross terms, reordering and affine/offset/extreme scaling invariants. |
| **Executed** | Independent NumPy least-squares comparisons for pooled, group-intercept/common-within, pair-count-weighted means and equal-weight means; residual Pearson checks; strict near-zero sign/tolerance checks. The portable compact oracle is included above. |
| **Executed** | Uncached Python/NumPy arithmetic-only timing probe with the reported input sizes, warm-up and repeats. This is reference mathematics evidence, not a product benchmark. |
| **Proposed for Codex** | TypeScript parsing/planner/filter tests, schema and Dashboard text round trips, query-source integration, host echo/undo/refresh, native traces and all shared filter-consumer paths. |
| **Proposed for Codex** | Real pointer/keyboard acceptance at 1280/783/390 px, docs/example browser checks, rendering-mode coverage, package/demo gates and actual browser performance/memory measurements before caches or limits. |
| **Not performed** | Repository implementation, dependency installation, commits, PR creation, merges, publication or deployment. |

### Deliverables

- This **[methods-report.md](methods-report.md)**: the selected method, alternatives, proofs, scope, edge cases, record semantics, exact fixtures, executable independent oracle, sources and dispositions PG-01–PG-17.
- **[implementation-plan.md](implementation-plan.md)**: two ordered, complete milestones with real source seams, proposed files/settings/filter shape, exact numerical and lifecycle tests, docs, runnable examples, input/width acceptance, performance probe and main risks.
- **[pooled-group-relationships.zip](pooled-group-relationships.zip)** contains those two Markdown files only.

### Open decisions

No unresolved mathematical choice or demand question blocks the handoff. Four bounded implementation decisions remain for the checkout:

1. Place the visible comparison and exact trace within the current renderer/dispatcher, including the rectangular-density branch and facet ownership.
2. Complete the canonical category predicate through the real shared filter, legend, chip, manual editor, workspace/Rows and Dashboard text paths. The supplied packet establishes the need but not every imported API.
3. Validate the precise numerical error accounting for centered/scaled accumulation and the direction guard. The guard is an engineering policy, not a proven universal error bound; all exact and near-zero acceptance fixtures remain required.
4. Choose any table virtualization or dependency-local reuse only after measuring the actual product. Analytical population and category membership remain complete.

Equal-weight group means, mean-point overlays, rank methods, automatic search, inferential models and causal interpretation remain outside the selected initial capability under their explicit dispositions. Neither these options nor PR519/520/524 is a prerequisite.
