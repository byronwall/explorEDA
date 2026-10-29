# Rank-based pair discovery: Design decision

**Build rank-based pair discovery inside the existing Scatter Matrix: an explicitly named Spearman option, then a Pearson/Spearman comparison and a compact browser of the matrix’s unique continuous-field pairs, followed by a scope-aware continuation into the original Scatter. Keep raw measurements, the authored matrix order, linked row selection, and existing traces central. Compute Spearman from average ranks after pairwise deletion, rerank within each represented color group, and retain the matrix’s three-pair minimum. Add explicit chronological date axes to Scatter as part of the continuation; the baseline does not already provide that behavior. Ship this in five independently useful increments, with persistence, documentation, and a runnable example in each increment.**

Date: October 26, 2026. Repository: [byronwall/explorEDA](https://github.com/byronwall/explorEDA). Authoritative baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`.

The companion [implementation plan](rank-discovery-implementation-plan.md) specifies files, public settings, deterministic fixtures, acceptance conditions, and verification commands. Stable recommendation IDs in this report are **RD-01–RD-18**; the plan uses the same IDs.

## 1. Access, evidence, and the decision boundary

**Access confirmed before research.** The prompt was read first. The source packet declares the requested baseline and contains **44 complete file sections**, with 44 matching begin/end markers. All 44 were read across complementary source-review passes. Fifteen additional files were retrieved and inspected read-only from that exact GitHub commit to resolve date rendering, comparison presentation, chart creation, and counterfactual filter scope. This is a complete review of the supplied packet plus the named supplements, not a claim to have checked out or executed the whole repository.

Evidence labels used below:

- **Current code:** behavior established by supplied or pinned source, cited by path and symbol through the C references.
- **External evidence:** behavior or methods established by primary documentation or papers, cited through the S references. Sources were accessed October 26, 2026.
- **Decision/proposal:** the recommended behavior to implement. These are not claims that the feature exists.
- **Executed reference check:** independent arithmetic checked in this research run. These are not repository tests.

`docs/research/DIRECTION.md` and this mission supersede the earlier R005 and relationship-discovery demand gates. Byron’s requested capability is the demand. No participant study, external-customer approval, or older research proposal is a prerequisite. React, TypeScript, pnpm, existing chart registration, and existing provider semantics remain the implementation platform. [C01]

### What the baseline already supplies

| Current code | Consequence for this decision |
| --- | --- |
| `ScatterMatrixSettings` already supports mixed numeric/date, mixed-type, and categorical cells; default lower continuous cells are points and upper continuous cells are correlation. `MAX_MATRIX_FIELDS` is 10. [C02] | Extend this chart. Ten continuous fields yield at most 45 unique unordered pairs. Preserve useful mixed cells. |
| `matrixPlan.ts::continuousValue` uses `finiteNumber` or `timestampOf`; `pairedCorrelation` pairs values before `pearson`, which requires three observations. [C03] | Keep typed, pair-valid measurement semantics. Add a method-specific result rather than renaming the existing `r` field to mean two different things. |
| `planMatrixLayout` excludes the matrix’s own selection; `planMatrixSelection` and `withSelectedBars` add selection effects. `ScatterMatrix.tsx` memoizes this separation. [C03, C04] | Own selection must never rerank or recalculate coefficients. External membership changes must. |
| `planGroups` derives bands from source rows; `planBands` preserves source categories, a missing-value band, and a bounded Other union. [C03, C05] | Group correlation is a direct calculation within each represented population. It is not a weighted average of subgroup coefficients. |
| `matrixTrace.ts` and `MatrixTraceBody.tsx` already expose pair/row traces, but their labels and payloads are Pearson-specific and group results lack their own pair counts. [C06] | Extend those traces with method, group denominators, exact contributors, and optional rank evidence. |
| `pairedSummary.ts::pairedStats` has a numeric Pearson/covariance contract from two pairs, with sample covariance denominators `n−1`. Fits use original numeric inputs. [C07] | Preserve these contracts. The new comparison path shares the new helper without changing covariance or regression to ranked measurements. |
| `BaseChartSettings.localFilters` defines a chart-only source population. Provider state, generic serialization, DSL paths, and history already carry chart settings. [C08–C10] | No new top-level saved-data format, backend, global rank columns, or field-preparation subsystem is necessary. |
| Pinned `scatterAxis.ts::scatterAxisKind` classifies datetime as band; `scatterPosition` parses numeric positions with `finiteNumber`. [C13] | Matrix-to-Scatter date continuity is actual implementation work. Merely setting `xAxis.scaleType = "time"` does not work on this baseline. |
| Pinned `useCreateCharts::buildChart`, `ChartDraftContext`, and `ChartPlacementLayer` support constructing a draft, editing it, previewing placement, and accepting it. [C14] | Reuse the prepared-draft route. Do not create a chart or clear a selection merely to preview a pair. |

The existing ten-field limit is principally a settings-UI limit: `validateSettings` and saved validation do not enforce every maximum/uniqueness condition. The new calculation entry must check the effective field set and fail clearly above the supported bound instead of silently truncating a loaded configuration. This is a bounded requirement for the new calculation cost, not a broad validation audit. [C02, C09]

## 2. Which feature earns its cost?

### The selected feature

The complete feature has three analytical operations:

1. **Choose how a pair is summarized.** `Pearson`, `Spearman`, or `Both` controls continuous correlation cells. Pearson remains the legacy default. Points, categories, distributions, boxes, and shares retain their meaning.
2. **Find a pair worth examining.** A chart-local **Pairs** browser lists each eligible unordered pair once. It can order the list by field order, absolute Pearson, absolute Spearman, or coefficient difference. It never reorders the matrix.
3. **Continue with the original measurements.** An explicit **Open Scatter** action prepares the existing Scatter with the original fields and a truthful destination population. Point selection and trace then operate on the original records.

Adding only Spearman is independently useful and is milestone one. It is not the entire discovery workflow: switching a scalar forces the reader to remember the previous value, and it leaves the original Scatter setup manual. Comparison and the pair browser add distinct capability and deserve their own milestone. **RD-01, RD-03, RD-04.**

### What strong existing tools establish

| Primary source | Verified behavior | Adopt or decline |
| --- | --- | --- |
| Orange Correlations and Scatter [S01] | Pearson/Spearman pair scores, pair filtering, and a selected Features output that configures Scatter when connected with Data. | Adopt an explicit field-pair continuation. Do not copy its node-editor interface or assume undocumented missing-value behavior. |
| GGally `ggpairs` and `ggally_cor` [S02, S03] | Mixed numerical/categorical panels, independently configured triangles/diagonal, method selection, and per-color-group correlations. | Extend the existing mixed matrix. Decline significance stars and a second coefficient-only chart. |
| JMP Multivariate [S04, S05] | Pairwise correlation tables, nonparametric coefficients, method-specific maps, and an option to cluster variable placement. | Borrow named method/population reporting. Treat automatic matrix ordering as a genuine alternative with its own costs. |
| seaborn PairGrid [S06] | Different functions can occupy upper/lower/diagonal panels, with selected variables and color groups. | Preserve raw plots beside summaries. Its API alone does not establish an interactive record handoff. |
| jamovi `corrMatrix` [S07] | Separate Pearson, Spearman, and Kendall flags, with optional case counts and plots. | Multiple summaries can coexist. Decline the larger inference-oriented options panel. |
| R `cor`, SciPy, pandas [S08–S12] | Explicit rank methods, tie rules, pairwise observations, and unavailable/threshold behavior. | Use them as method references and independent numerical comparators, not as product-workflow specifications. |

Wilkinson, Anand, and Grossman’s scagnostics paper uses squared Spearman as one monotonicity index alongside other shape diagnostics. That is evidence for using rank association to navigate pairs, and a useful warning against calling it general relationship discovery. Keeping the sign visible is this design’s choice. [S13]

Matejka and Fitzmaurice demonstrate markedly different shapes with matching means, standard deviations, and Pearson correlations to two decimal places. Their result supports retaining raw plots; it is not evidence that those datasets also share Spearman values. The exact U-shaped fixture below supplies our separate rank-correlation counterexample. [S14]

De Winter, Gosling, and Potter compare Pearson and Spearman across distributions, sample sizes, and outliers. The relevant conclusion here is that relative behavior depends on the data distribution. This design offers a comparison, not a claim that Spearman is always the better coefficient. [S15]

### Serious counterproposals and dispositions

**Prepared ranks, then ordinary Scatter.** This is the strongest small-code alternative. An author can prepare average-rank columns in R or pandas, retain original columns, and place ranked and raw scatters together. It makes ranks inspectable data and is attractive for a fixed cohort or a teaching notebook. However, linked filtering, pair-specific missingness, and color groups change the ranking population. One rank column per field cannot generally represent all those populations. Correct preparation would need separately scoped columns and recomputation. Keep a fixed-population teaching example available; do not make it the native workflow or create calculated rank fields when a method changes. **RD-12, Explore.** [S08, S10]

**Kendall tau-b first.** Tau-b has an appealing concordance interpretation and handles ties explicitly. It is a credible choice for an ordinal-agreement product. Spearman is the better initial fit here because the task is a direct comparison of correlation on measurements with correlation on their ranks, using the existing pair inspection path. Their magnitudes differ: the tied fixture yields Spearman `5/6` and tau-b `4/5`. Defer tau-b as another explicitly explained method. Do not justify that decision with a false quadratic-complexity claim; SciPy documents an `O(n log n)` implementation. **RD-13, Defer.** [S11]

**A pair-first scagnostics browser.** This could find clusters, U-shapes, and other structures that both Pearson and Spearman miss. It also requires several score meanings, shape-specific validation, a broader search scope, and a larger interface. It is a separate future discovery feature. This mission should name monotonic discovery accurately. **RD-14, Defer.** [S13]

**Automatically reorder matrix fields.** JMP establishes this as a real product option. It would require a similarity definition, treatment of missing/undefined pairs, deterministic clustering, and rules for changes under filtering. At ten fields the pair browser provides useful ordering while preserving the matrix’s spatial reference. Retain manual field order and defer automatic clustering. **RD-15, Defer.** [S04]

### The compact pair browser

Build it as one bounded popover owned by the matrix, opened by a named **Pairs** action in its header; the same action is reachable in chart details. Extend the chart-header action route for Matrix instead of inserting a persistent workspace sidebar. The current `PlotChartPanel` supplies `toolbarTarget` only to table-like charts, and its facet path does not pass that target. Add one Matrix header action/controller that owns the facet choice and shared pair browser; do not mount a duplicate header action from each facet. This is proposed integration work, not an already available Matrix toolbar API. [C14]

- One row per unordered numeric/date pair in the selected matrix/facet population; at most 45. No diagonal or mirrored duplicate. Group summaries stay in the pair trace, so 12 groups do not turn 45 pairs into 540 list rows.
- Label the list **All color groups** and order by pooled coefficients within its selected facet. A relationship strong only within one group can remain low in this order; group readouts and trace provide that inspection route.
- Default order: **Field order**. Other choices: **Spearman magnitude** `|ρ|`, **Pearson magnitude** `|r|`, and **Difference** `|ρ−r|`.
- Metric ordering is descending, unavailable values last, exact ties broken by canonical pair ID. Never sort rounded display strings or apply an epsilon comparator.
- Difference is a navigation heuristic. It can reflect curvature, outliers, ties, or opposite signs; it is not a nonlinearity test or a confidence measure.
- Show pair names, signed coefficients, and `n` in every row. Show the chosen difference when that ordering is active. Search filters this list’s field names only; it does not filter data.
- Opening Pairs calculates and shows both coefficients without changing the saved matrix method. With fewer than two continuous fields, show a named empty state and a route to field settings; keep the mixed matrix intact.
- Selecting/focusing a list row chooses the pair for its readout. It neither selects records nor changes the saved matrix field order. Row actions provide **Open Scatter** and the established trace/menu route.
- If several matrix facets are present, require a visible facet choice using the existing facet identity. Opening from a cell preselects its facet. A header browser must not silently pool facets. No new all-facets coefficient is introduced.

Canonical identity is the exact JSON string of the two original field keys sorted by code-unit order, for example `JSON.stringify(["x", "y"].sort())` → `"[\"x\",\"y\"]"`. Keep oriented X/Y separately: a cell uses its column as X and row as Y; a list row uses the current authored field order. Labels, field reorder, axis swap, and filtering must not change identity. Field rename/removal can invalidate a transient pair reference; it does not justify a new schema identity service. **RD-04.**

## 3. Exact statistical contract

### 3.1 Populations and labels

Define:

- `S`: source rows after this chart’s existing `localFilters`. These rows establish stable domains and matrix category bands.
- `L`: rows in `S` passing workspace filters and applicable peer-chart filters, intersected with the current facet. The matrix’s own outgoing `filters` are excluded by its live-data ownership rule.
- `P(a,b)`: rows in `L` with eligible continuous values for both fields.
- `P(a,b,g)`: the same pair-valid rows within represented color group `g`.
- `H`: rows in `L` passing the matrix’s own selection. `selectedPairs = |P ∩ H|` is an annotation on the population, not a replacement denominator.

The coefficient denominator label is **“n paired rows of E live rows”**, where `n=|P|` and `E=|L|`. An optional separate label states **“S source rows”**. For a group use **“n_g paired rows of E_g live rows in [group]”**. State **“After other filters; this matrix’s selection only highlights rows.”** Where provider `localSelections` makes chart selections local, use copy appropriate to that mode rather than claiming siblings are linked. [C03, C08]

Do not equate this `n` with degrees of freedom, independent subjects, a weight sum, or every visible dot. Each eligible source row contributes one observation. Repeated measurements or duplicate records still count as rows; the feature makes no independence assumption and conducts no significance test.

Source bounds, category folding, viewport limits, row selection, and coefficient scope are separate. Axis limits and a log display may hide points without changing the raw pair calculation. The Scatter comparison must calculate from its self-excluded raw row population, not from rendered points, whose availability may also depend on size or display mode. [C07, C13]

### 3.2 Eligibility

| Input or condition | Required result |
| --- | --- |
| Detected numeric field | Use the runtime column and `finiteNumber`. Accepted numeric text follows that existing parser; the feature adds no coercion rule. |
| Detected datetime field | Use `timestampOf` and UTC epoch milliseconds. Different textual representations of the same instant tie. Numeric values already interpreted as timestamps retain that interpretation. |
| Category, text, or boolean field | No coefficient in this initial feature. Keep the existing mixed/categorical cell. Ordered category labels need explicit preparation elsewhere. |
| `null`, `undefined`, blank/whitespace | Ineligible measurement; retain the row in exclusion evidence. |
| `NaN`, `+Infinity`, `−Infinity`, nonfinite numeric text | Ineligible; never rank as an extreme value. |
| Invalid numeric/date text | Ineligible under the existing parser. No `Date.parse`, `new Date(text)`, or direct `Number(raw)` outside `valueParsing.ts`. |
| `−0` and `+0` | Equal values and equal ranks. Display a computed zero without a negative sign. |
| Distinct close finite values | Distinct ranks. No rounding or epsilon tie rule. |
| A display transform or unit formatter | Does not alter parsed measurements or ranks. An explicitly calculated replacement field is a different input field. |

The date statistical adapter follows the baseline’s finite timestamp contract. Chronological Scatter drawing and brushing require a timestamp that can round-trip losslessly through its UTC label/bound representation and the existing `dateBound` parser. A finite timestamp outside the JavaScript calendar range, a fractional numeric millisecond such as `0.25`, or an extended-year timestamp whose ISO form the existing four-digit-year parser cannot read remains statistically eligible, but receives a named unsupported-date-position exclusion. Trace retains the parsed timestamp and pair count. This preserves exact saved brush membership without broadening the parser or silently snapping the measurements. Test these display boundaries separately from invalid date text. **RD-02, RD-07.** [C03, C07]

### 3.3 Pairwise deletion, average ties, and group reranking

For each pair, first construct the valid row IDs and aligned values. Then rank those values within that exact row set. For each color group, repeat within its own pair-valid members.

If a sorted tie occupies zero-based positions `i…j`, assign every member the average rank:

\[
R = \frac{i+j+2}{2}.
\]

Ranks start at 1. Equality uses the parsed original values. Sorting can be deterministic by row ID for trace display, but that tiebreaker must never assign different ranks to equal values. R explicitly documents reranking for each pair under pairwise completeness; SciPy documents average tied ranks. [S08, S10]

For a matrix Other group, rank the represented union of its source categories. Do not rank each constituent category and combine results. Missing color values may form a group without disqualifying valid X/Y. Keep the baseline `planGroups` membership rules rather than inventing numeric color quantiles. Pooled correlation is a direct calculation on all pair-valid rows, not an average of group coefficients. **RD-02, RD-05.**

### 3.4 Formula and unavailable results

For a paired vector `u,v`, define centered sums `S_uv = Σ(u_i−ū)(v_i−v̄)`, `S_uu = Σ(u_i−ū)²`, and `S_vv = Σ(v_i−v̄)²`.

\[
r = \frac{S_{xy}}{\sqrt{S_{xx}S_{yy}}},\qquad
\rho = \frac{S_{R_xR_y}}{\sqrt{S_{R_xR_x}S_{R_yR_y}}}.
\]

Pearson uses parsed original values; Spearman uses pair/group-specific average ranks. Sample covariance’s `n−1` factors cancel in correlation. Do not use the untied `1−6Σd²/[n(n²−1)]` shortcut on tied data. [S05, S08]

The new discovery helper returns a discriminated result, not an unexplained `NaN`:

- `insufficient-pairs`: `n<3`, evaluated first. Display **“Needs 3 paired rows · n=2”** or the actual count.
- `constant-x`, `constant-y`, `constant-both`: equality of all original paired values on the named side. The coefficient is unavailable, not zero.
- `numerical-failure`: finite eligible inputs whose calculation fails the prescribed finite, variance, or range checks. This concerns arithmetic; an available result is not a statistical reliability assessment.
- `ok`: finite coefficient in `[-1,1]`.

Use stable centered arithmetic, positive rescaling when needed, and a narrow roundoff clamp only at the endpoint; do not regularize a constant into a small nonzero variance. If raw Pearson fails numerically while ranks remain well-defined, Spearman can still be available. The plan specifies endpoint and large-magnitude tests for the new helper. This does not require changing the regression solver or legacy covariance calculation.

**Keep three pairs for matrix and new comparison displays.** With two nonconstant pairs both mathematical coefficients are necessarily `+1` or `−1`; suppressing that tautology is a reasonable discovery convention. Three pairs still do not establish reliability. Always display `n`, with no significance stars or arbitrary “strong” badges. Keep `pairedStats`’ existing two-pair numeric summary contract intact and label that distinction in its trace when the optional new comparison is also enabled. **RD-02, RD-08.** [C03, C07, S09]

### 3.5 Reconciled counts and evidence

For every pair and group, retain four disjoint counts:

`E = pairs + xOnlyIneligible + yOnlyIneligible + bothIneligible`.

Also retain coordinate-specific exclusion reasons for on-demand trace rows. If showing per-axis invalid totals, label them as overlapping: `invalidX=xOnly+both`, `invalidY=yOnly+both`. Their sum is not the total excluded row count. The existing standalone summary’s X-first exclusion counters remain its existing contract; they must not be silently relabeled as these new counters. [C06, C07]

The trace can reveal a bounded, paginated table of source row, raw X/Y, parsed X/Y, average rank X/Y in the chosen population, selected state, and exclusion reason. Ranks for excluded rows are absent. A heading names whether these are pooled or group ranks. Materialize this evidence on demand; do not keep a ranked copy for every pair in the saved workspace.

### 3.6 What the coefficients do and do not say

- Strictly increasing transforms preserve Spearman when they preserve finite membership and ties. Decreasing one coordinate reverses its sign; decreasing both preserves it. Rounding, clipping, overflow, or other new ties break that guarantee.
- Jointly permuting rows preserves coefficients and each record’s rank assignment. Permuting one coordinate alone changes the pairings.
- Zero Spearman does not establish independence or absence of a relationship. The exact U-shape below has zero Pearson and Spearman.
- Dates describe association with chronological order or elapsed time in these rows. No lag, prediction, causal direction, stationarity, or time-series inference is added.
- Pairwise-complete coefficients can use different row sets and need not form a positive-semidefinite matrix. Do not feed this discovery surface into PCA or a covariance-region calculation as though it were one common-cohort covariance estimate. [S08]

Kendall tau-b is `(C−D)/sqrt((C+D+T_x)(C+D+T_y))`, with concordant and discordant observation pairs and ties exclusive to each coordinate. It measures agreement of ordering rather than Pearson association of rank positions. Both are descriptive rank methods; their scales are not interchangeable. **RD-13.** [S11]

## 4. Analyst experience and ownership

### A complete inspection path

1. The analyst opens the existing matrix, selects continuous fields, and changes **Correlation** from Pearson to Spearman or Both. Lower-triangle points remain original measurements. The at-rest chart identifies the selected method; each correlation cell names its statistic and paired `n`.
2. In Both mode, a sufficiently large cell shows `r +0.76`, `ρ +1.00`, and `n 5`. A narrow cell keeps two labeled coefficient lines plus `n`; it does not become an unlabeled heatmap. Additional group rows are available through trace, with a visible `+N groups` indication when they do not fit. Unavailable groups remain represented with their reasons.
3. The analyst opens **Pairs**, orders by Difference, and finds the exponential example. The row shows both signs and `n=5`; the raw matrix still reveals its curved shape. Choosing a row focuses that pair, not its records.
4. **Open Scatter** prepares a fresh existing Scatter with original X/Y fields, original units, the existing color field and color-scale ID, points enabled, fits off, and **Compare ranks** enabled. A cell supplies column→X and row→Y. The pair browser supplies the authored field order. No ranked data columns are inserted.
5. The draft identifies its actual linked population and any proposed clearing operation. Accepting the existing placement flow adds the Scatter; cancelling leaves saved charts, filters, and layout unchanged.
6. In Scatter, a click or brush selects original records. Alt-click/Alt-Enter opens the existing trace route; a focusable menu exposes the same trace action for touch and keyboard users. The optional comparison trace exposes average ranks alongside original values. The Rows drawer can inspect the corresponding linked rows.
7. Closing details or using the contextual return action restores focus to the originating pair when that matrix still exists. The added Scatter remains a normal chart. Returning does not clear its filters or freeze the matrix’s earlier coefficients.

An origin reference `{sourceChartId, pairId, facetIdentity}` is transient navigation state, not a new saved dependency. On acceptance, transfer it from the draft into a workspace-scoped ephemeral navigation record keyed by the actual accepted Scatter ID, before the draft is cleared. It survives details/grid remounts, and is cleared on return, destination removal, or workspace restore. If a field or chart disappears, return to the chart header/workspace and explain that the original pair is unavailable. **RD-06, RD-11.**

### Selection ownership at the handoff

The matrix’s own filters are excluded from its coefficient population, but they are peer filters for a newly created Scatter. Copying the matrix’s outgoing filters into the new chart does not fix this: it duplicates selection ownership and can filter every other chart again. [C03, C08]

| Action or state | Required destination behavior |
| --- | --- |
| **Open Scatter**, default | Keep the matrix selection. The new Scatter has `filters: []` and sees the current linked rows, including the matrix filter when selections are linked. State source coefficient `n` and destination pair `n` if they differ. |
| **Clear matrix selection and open**, secondary | Explicitly clear only the source matrix’s outgoing filters on final acceptance. Preserve workspace filters, other charts’ filters, source local filters, method, field order, and color settings. The name never promises an unfiltered dataset. |
| Draft before acceptance | The existing preview shows the current linked rows. Show a separate projected `n` for the secondary action; do not pretend that the preview already reflects a clear that has not happened. |
| Chart-local selection mode | Honor provider `localSelections`. If the matrix selection does not constrain its peers, the two counts already agree and the redundant clear action is omitted. |
| Source matrix facet | Intersect its existing local filters with semantic, typed predicates for the chosen facet in the destination’s `localFilters`; turn off destination faceting for this one-facet continuation. Preserve missing-category semantics. Do not save runtime facet IDs or an ad hoc list of row IDs as a substitute. |
| Color group readout | Keep color encoding; opening the pair remains a pooled-pair continuation with its scope stated. Do not silently turn a selected group or an Other union into a new destination filter. Exact group-only continuation is deferred. |
| Destination selection | The Scatter’s own comparison remains self-excluded. Its selection is now a peer filter for the matrix, so the matrix may change. Back navigation preserves this ordinary linked behavior. |

**Concrete example:** the unequal-group fixture has matrix `n=8`, `ρ=1/21`. Selecting its three A records does not change that matrix coefficient. Default Open Scatter sees `n=3`, `ρ=1`. The secondary action yields `n=8`, `ρ=1/21` after acceptance, provided no other filter narrows that population. Both outcomes are correct; an unlabeled transition would be misleading.

Recompute destination counts after source/data revisions and after draft field or local-filter edits. Use the source’s self-excluded peer membership **before its local population restriction**, then apply the final draft’s semantic local filters and pair validity. This matters when a draft removes a copied local restriction: the destination can become broader than the original matrix population. Never reuse the coefficient’s click-time `n` or the already local-filtered matrix snapshot.

The pinned `CrossfilterWrapper.ts::getAllData` reads a chart’s `group.all()` before applying `getPopulationTest(chart.localFilters)`. A small proposed read-only `getPeerFilteredRowIds(sourceChartId)` can return positive-count IDs from that group; `chartPopulation.ts::restrictToPopulation` then applies the final draft’s filters. It needs current filter/data revisions and returns unavailable when the source is missing. This query neither clears the live filter nor introduces a saved per-chart exemption. If the draft changes to a non-Scatter chart, discard pair-specific counts and clear-on-accept intent. [C15]

If the draft changes X/Y, label its final pair explicitly. The launch matrix’s original pair/count is then historical context, not a directly comparable coefficient unless a matching current reference is recomputed. Keep that distinction visible rather than comparing counts under mismatched field labels.

Pinned `AddChartDialog.tsx::usePreviewChart` registers its temporary preview in the same Crossfilter wrapper with empty outgoing filters, and renders `ChartRenderer` directly. Consequently, it sees source selections and does not obtain a facet restriction merely from `visibleFacetIds`. The explicit local-filter intersection and separate future count address these actual baseline constraints. [C14]

Final placement prevalidates the source action, chart settings, and layout moves, then coalesces clear/move/add notifications using `holdStateChanges` with `try/finally`. That function batches callbacks; it is not a rollback transaction. Prove one undo entry and one final saved-state notification. If the implementation needs atomic subscriber visibility, add a small provider action that applies the prevalidated state in one update; do not call callback batching atomic. **RD-06, RD-09.** [C08, C14]

### Original date measurements

Make chronological axes an explicit Scatter option. A matrix date handoff sets the existing axis `scaleType: "time"` value and uses timestamp parsing for position, UTC calendar ticks, date-range brushes, and date-aware trace labels. Unequal intervals must occupy unequal space; this is not a rank plot. Keep existing saved Scatter defaults unchanged unless the author selects a time axis.

The shared `axisPlan.ts` already accepts explicit numeric tick values. A local Scatter temporal adapter can use linear millisecond geometry with UTC tick values and date formatting; it need not introduce a new scale variant across every chart. Carry `valueKind: "numeric" | "datetime"` alongside geometry so existing band checks cannot accidentally enable numeric-only covariance, regression, density, contours, or surfaces for dates. Date comparison is available on explicit time axes; categorical axes explain why it is unavailable. [C07, C13]

For numeric Scatter, a single opt-in **Compare ranks** control displays pooled Pearson/Spearman with the discovery minimum of three. Keep the saved `summary` setting and its numeric means/covariance/trace behavior. When comparison is active, suppress only the duplicate visible Pearson coefficient line, labeling the existing trace **Paired numeric statistics** and explaining its two-pair convention. There is no second method selector or automatic fit. **RD-07, RD-08.**

### Responsive and accessible treatment

| Width | Matrix, pair browser, and details |
| --- | --- |
| **1280 px** | Keep the matrix central. Place its compact settings/popover beside available chart space; use the existing chart-details arrangement with plot left and controls right. Pair rows have names, two numeric columns, `n`, and trailing actions. Preserve native matrix scrolling when ten fields exceed tile width. |
| **783 px** | Respect the baseline view-only saved-grid flow. Chart details stack plot above controls below 900 px. Bound the Pairs popover to the viewport and keep its action/search/order row reachable while its list scrolls. Keep the chart sufficiently visible to compare a chosen pair with raw points. |
| **390 px** | Use a single chart column and a viewport-bounded local pair surface. Each pair row may put its names on one line and coefficients/count/actions on a second; it is still one pair, not a wide table requiring whole-page horizontal scrolling. Matrix geometry retains its 72 px minimum cells and an explicitly scrollable chart region. Touch actions stay available. |

Use the repository’s 32 px controls and 28 px compact controls, `eda-setting-grid` label/control rows, focus-ring tokens, and real tooltips. Use native radio semantics for method choices and a labeled select for list order. Do not introduce an “Inspect” button, native `title` hints, or an extra persistent sidebar. Provide readable accessible text such as “Spearman correlation, plus 0.83, 4 paired rows”; never depend on `ρ`, sign color, or hover alone. [C01]

The baseline’s ordinary click on a coefficient cell is empty-plot behavior, not pair navigation. Preserve it. Point clicks and brushes keep filtering; Alt-click/Alt-Enter keeps tracing; the explicit header/list/context-menu action opens Scatter. Keyboard focus in the pair list is keyed by canonical pair ID and follows that pair through sorting, so a live update does not silently move focus to another relationship. Escape closes the innermost editor first and returns focus. Screenshots and real input checks at all three widths are required implementation evidence, not work executed in this Design mission. **RD-11.** [C04, C06]

## 5. Settings, calculation boundaries, and persistence

### Minimal public settings

| Owner | Proposed setting | Default and purpose |
| --- | --- | --- |
| `ScatterMatrixSettings` | `correlation?: "pearson" \| "spearman" \| "both"` | Absent means Pearson. M1 accepts the first two values; M2 adds Both. It affects continuous correlation presentation/calculation only. |
| `ScatterMatrixSettings` | `pairOrder?: "fields" \| "spearman" \| "pearson" \| "difference"` | Absent means authored field order. Persist the chosen analytical ordering, not the popover’s open state or its derived rows. Added in M2. |
| `ScatterPlotSettings` (alias `ScatterChartSettings`) | `compareRanks?: boolean` | Absent/false preserves existing Scatter. True adds the pooled comparison. Added in M3 and set by M4’s prepared handoff. |
| Existing axis settings | `xAxis.scaleType` / `yAxis.scaleType = "time"` | Already present in the axis setting union, but requires explicit Scatter implementation in M3. No new timestamp storage field. |

The new calculation helper should live in `packages/explorEDA/src/lib/pairCorrelation.ts`, independent of React, canvas size, color paint, and persistence. Accept typed parsed columns, exact row membership, optional represented-group membership, and requested methods. Return pair/group counts, per-method status/value, and a way to reconstruct trace evidence. Average-rank assignment and stable Pearson arithmetic are separately testable pure operations. Keep this helper internal; no new package entrypoint is necessary.

The matrix planner owns population and category rules; the helper does not infer field type or define source scope. Scatter’s new comparison uses the same helper with its own correct facet/self-excluded population. Existing `pairedStats`, covariance, marginal distributions, fit residuals, and regression remain on their original numeric contracts. Do not replace their raw values with ranks. **RD-02, RD-08.**

Store a symmetric pair result once per canonical pair and reuse it for both triangles, the list, and trace. Keep the existing `MatrixCell.r`, `groupR`, and `MatrixCellTrace.groups[].r` meaning Pearson while adapters migrate; never fill `r` with Spearman. Add a method-named result instead, without reusing `MatrixPairs` or `cell.pairs`, which already describe categorical counts. Orientation still matters for `constant-x` versus `constant-y`, exclusion counts, and evidence columns: store these by field key and project them to the displayed X/Y roles when a pair is transposed. [C03, C06]

### State that must survive, and state that must not

| Boundary | Required behavior and proof |
| --- | --- |
| `updateChart` / provider | Update the method/order/comparison through the normal chart-setting path. These are display/analysis choices, not linked predicates. If added to `DISPLAY_ONLY_KEYS`, prove that no predicate depends on them and that selection survives. |
| Saved-data validation | `saveDataUtils.ts::isChart` validates each optional enum/boolean. Absent fields remain valid. Unknown enum strings fail according to the existing saved-data validation path. Do not silently reinterpret an unknown method as Pearson. |
| Runtime ↔ saved conversion | The generic chart spread preserves the new settings. No top-level format version change or derived coefficient/rank payload is required. Add round-trip tests rather than assuming generic serialization is sufficient. |
| Host `savedData` echo | Read defaults without mutating old objects. Do not materialize `correlation: undefined`, normalize absent fields on mount, or emit a new callback for an equivalent echo. The fingerprint distinguishes absent and undefined properties and ignores `metadata.modifiedAt`. |
| Dashboard text | Add the roots to exhaustive `settingKeys.ts`; use the existing parser/exporter. Example: `chart scatter-matrix @rank fields=X,Y,Z correlation=both pairOrder=difference`. No grammar or alias change. Invalid values restore the prior valid setting with the existing warning behavior. |
| Undo/history | A method/order/comparison edit is one view change. Opening, searching, or focusing the pair browser is not saved history. Final clear-and-add is one undoable accepted operation; cancelling is none. |
| Save/reopen and reordered data | Save fields, chart filters, local filters, color-scale IDs, method, pair order, comparison, and time axes. Recompute ranks/results from restored data. Continue the current conservative selection restoration for reversed/replaced source rows and ambiguous duplicates. |
| Analysis/project export | Include the ordinary new settings. Preserve the existing raw-data special-value encoding for undefined/NaN/infinities. Signed zero need not survive bit-for-bit because its equality/rank semantics are unchanged. Never export synthetic ranked columns automatically. |
| Image export | Keep method names, coefficient/count text, and meaningful scope visible at rest. Mark Pairs/editor/navigation controls `data-export="omit"`. Do not omit all buttons by element type because legend controls also carry data meaning. |

The plan names exact tests for each boundary. None of these paths should depend on findings #507, group-comparison #526, parameterized notebooks #524, held-fit #520, or another unbuilt proposal. **RD-09, RD-18.** [C08–C12]

Two narrow TypeScript details matter. `DISPLAY_ONLY_KEYS` is typed as `keyof ChartSettings`, so chart-specific keys require a deliberate distributive key type or a chart-aware predicate before joining that fast path; leaving the optimization unchanged is valid initially. Likewise, non-distributive `Omit<ChartSettings,"id">` loses union-specific members, so the prepared-draft path should use a distributive alias or a concrete Scatter draft type. Do not move chart-specific settings into the base interface or use arbitrary casts to evade these checks. [C08, C14]

## 6. Exact computation and large-row cost

At `k≤10` continuous fields, compute `k(k−1)/2≤45` unique pairs per facet. Several visible facets have separate populations and results; 45 is not a bound on all results across an arbitrary number of facets. The estimates below describe one analysis population. The simple exact reference implementation intersects eligibility, computes Pearson in linear time, sorts two paired vectors for Spearman, and repeats ranking within represented groups. Its pooled cost is `O(k²N log N)` in the worst complete-data case. For each pair, group sort work is `Σ_g n_g log n_g`; do not describe 12 disjoint groups as 12 copies of every row.

For ten complete fields, 90 sorts at `N=100,000` imply roughly **149 million `N log₂N` comparison-scale operations**; at `N=1,000,000`, about **1.79 billion**. These are complexity estimates, not browser measurements or latency claims. The existing `matrixPlan.bench.ts` covers 3/5/10 fields and 10k/100k rows, but its points-only triangles do not measure rank calculation. Add correlation/Both/group cases explicitly. [C12]

### A correct optimization

Cache **sorted row indices** for each parsed continuous column, keyed to source revision and typed values. For each pair/group, intersect its exact membership, walk the relevant sorted indices, and assign average ranks anew among surviving equal values. A removed interior value closes a rank gap; a partially removed tie changes its average rank. Both are mandatory.

For pooled pairs, this reduces sorting to `O(kN log N)` plus pair scans `O(k²N)`. Build each pair’s group-ordered sequences in one pass, partitioning by group membership, rather than scanning all rows once per group. Reuse small buffers; do not retain 45 full ranked datasets. An on-demand trace materializes only the chosen pair/group, with a visible page limit such as “100 of 8,420 paired rows.” **RD-10, RD-17.**

Indicative added working storage for ten columns is `80N` bytes of Float64 parsed values, `40N` bytes of Uint32 sorted indices, and `16N` bytes for two reusable Float64 rank buffers: about **13.6 MB at 100k rows** or **136 MB at one million**. This excludes source data, membership, existing plot arrays, group buckets, object overhead, and worker transfer copies; it is not total application memory. Reuse already parsed arrays when safe and measure peak allocation.

### Invalidation and scheduling

- The exact result identity includes source/data revision, relevant field types and parsed values, the two field keys, exact self-excluded live/facet/local-filter membership, represented group membership, and requested methods.
- Equal row counts are insufficient. The fixture that replaces IDs `[0,1,2]` with `[3,4,5]` keeps `n=3` while changing `ρ` from `+1` to `−1`.
- Use stable provider revisions where their semantics guarantee identity, or exact row-ID/membership comparison after a candidate signature. A noncryptographic hash alone is not an exact cache contract.
- Own selection, resize, labels, paint colors, and browser-list focus do not invalidate ranks. A palette edit may repaint; a change in represented group membership does recalculate.
- Compute Spearman when Both or Spearman is requested, or when an open pair browser needs its value for display/order, even if matrix cells remain Pearson-only.
- Long jobs carry revisions. Reject results from stale revisions. Revision checks around a synchronous `sort` do not make it cancellable or responsive; use a browser worker or genuinely yielding chunks for the large-data increment. A local worker adds no backend or external service.
- While recomputing, label results as pending or explicitly previous. Do not show an old coefficient under a new `n`, sort a mixture of revisions, or claim approximate progress as an exact final answer.

M1 supplies the exact reference path and a measured initial envelope. M5 supplies the large-data optimization, scheduling, cancellation, and benchmark evidence. If the reference implementation blocks interaction at a release’s intended data size, bring the worker boundary forward before promising that size. No silent downsampling, quantile sketch, approximate ranks, or limit on contributing rows is part of this decision. **RD-10.**

## 7. Deterministic evidence that makes the decision reviewable

The companion plan gives complete row tables, ranks, IDs, counts, and round-trip procedures. The central results are summarized here; coefficients use absolute numerical comparison tolerance `1e−12` for these well-scaled fixtures, while ranks, membership, counts, statuses, and pair IDs are exact assertions.

| Fixture | Exact expectation | What it catches |
| --- | --- | --- |
| Ties: X `[1,1,2,3]`, Y `[10,20,20,30]` | Ranks X `[1.5,1.5,3,4]`, Y `[1,2.5,2.5,4]`; `n=4`, `ρ=5/6`, `r=4/√22`; tau-b `4/5`. | Average ties, distinction between rank methods, invalid untied shortcut. |
| Pair-specific missingness | Eight source rows give three pairs per pair; X/Y IDs `[0,3,4]` have ranks `[1,2,3]` on both sides, `ρ=1`, `r=√(12/13)`. All three pairs have counts `(3,2,2,1)`. | Globally cached ranks would wrongly give X/Y Spearman `√(12/13)`. |
| Unequal groups A/B | `n_A=3, ρ_A=1`; `n_B=5, ρ_B=−1`; pooled `n=8, ρ=1/21`, `r=−58/√(42·2472)`. | Group reranking, pooled-vs-average error, Other union. |
| Exponential: X `[1,2,3,4,5]`, Y `[1,10,100,1000,10000]` | `n=5`, `ρ=1`, `r=20988/√763192368≈0.7597208512`. | A meaningful comparison gap with original units visible. |
| U-shape: X `[-2,-1,0,1,2]`, Y `[4,1,0,1,4]` | `ρ=r=0`, despite `Y=X²`. | Overclaiming general relationship detection. |
| Constants and two pairs | Constants are unavailable; `n=2` is unavailable for discovery. Existing numeric summary still gives `r=1` for `[1,2]`, `[10,20]`. | Unavailable reasons and preservation of the two distinct contracts. |
| Signed zero / same instant in different zones | Signed zeros tie. Equivalent UTC instants tie. Both constructed examples reproduce `ρ=5/6`, `r=4/√22`. | Raw-string ranking, invalid tie splitting, date coercion. |
| Increasing/decreasing transforms and joint permutation | Increasing nonlinear X transform keeps `ρ=5/6` but changes `r`; one decreasing side flips both signs; both decreasing restore them; joint permutation keeps row→rank mapping. | Measurement/rank separation and accidental positional identity. |
| Own selection / unrelated peer filter | Own selection leaves pooled `n=8, ρ=1/21`; peer membership `[0,1,2]` gives `n=3, ρ=1`, then `[3,4,5]` gives `n=3, ρ=−1`. | Scope ownership, unrelated-field filters, count-only cache keys. |
| Save, export, reopen | Same canonical pair IDs, method, list order, filters, and recomputed fixture values; absent old settings remain absent without a callback. | Persistence completeness rather than a UI-only implementation. |

**Executed:** an independent Python reference used exact rational rank/centered-sum arithmetic and installed SciPy **1.17.0** to check 24 constructed cases. All applicable finite coefficient comparisons passed at absolute `1e−12`; constant/small-sample statuses were checked in the reference. These include the parsed timestamp vectors, not execution of the repository’s TypeScript parser. The current documentation consulted is independent of the installed reference version.

**Not executed:** repository unit tests, pnpm build/check, parser integration, save/host-echo behavior, Dashboard text round trips, browser interaction, screenshots, image export, or performance benchmarks. They are explicit implementation acceptance work. No empirical performance, user-study, or accessibility-pass claim is made. **RD-18.**

## 8. Shipping sequence

| Milestone | Independently useful result | Main proof and documentation |
| --- | --- | --- |
| **M1 — Native Spearman** | Existing matrix selects Pearson or Spearman; exact scoped ties/counts/reasons; persistence and trace. Works from this baseline. | Ties, pair deletion, groups, small samples, self/peer filters, save/DSL/echo. “Correlation methods” docs and a runnable tied/missing-data matrix. |
| **M2 — Compare and find pairs** | Both mode plus the compact pair browser and deterministic order; matrix stays in authored order. | Exponential/U-shape, duplicate suppression, exact pair-ID/tie order, keyboard/touch. “Compare and browse pairs” docs and nonlinear pair example. |
| **M3 — Faithful original Scatter** | Explicit chronological date axes and opt-in pooled Compare ranks, with numeric summary/fit compatibility. | Equal instants, uneven date gaps, date brushes, original record traces, numeric-only guards. “Compare original measurements” docs and runnable dated comparison. |
| **M4 — Complete the continuation** | Open Scatter prepared draft, scope preview/counts, explicit secondary clear, original selection/trace/return. | Default `n=3` vs cleared `n=8`, one undo, cancellation, facet/local-filter ownership. “Continue from matrix to records” docs and linked example. |
| **M5 — Exact large-data execution** | Correct sorted-index reuse, scheduling/cancellation, bounded trace buffers, measured cost. | Exact equivalence to reference; same-size membership changes; 10-field 10k/100k plus 1m stress measurement. “Performance and exactness” docs and seeded local benchmark example. |

Persistence, image semantics, accessible operation, docs, and runnable examples ship with the first milestone that exposes each setting or action. They are not a final cleanup milestone. M3 can be developed independently after the shared helper; M4 depends on its actual temporal support, not a claim that dates already work. No unbuilt research proposal appears in the dependency graph.

## 9. Stable recommendations

| ID | Status | Recommendation and reason |
| --- | --- | --- |
| **RD-01** | **Build** | Add native Spearman to the existing mixed matrix; its raw panels and linked scope already provide the right foundation. |
| **RD-02** | **Build** | Use pairwise deletion, average ties, group reranking, explicit statuses, and a three-pair discovery minimum; this defines one reproducible statistic. |
| **RD-03** | **Build** | Add Both mode; simultaneous values expose differences without relying on memory. |
| **RD-04** | **Build** | Add a bounded pair browser with canonical IDs and optional magnitude/difference ordering; 45 pairs justify navigation without disturbing matrix order. |
| **RD-05** | **Build** | Report pooled/group live denominators and self-selection separately; visible coefficients must identify their actual contributing rows. |
| **RD-06** | **Build** | Continue through a prepared original Scatter with explicit destination scope and a separately named clear action; linked-filter ownership otherwise creates a hidden population change. |
| **RD-07** | **Build** | Implement explicit chronological Scatter axes for date handoffs; baseline date axes are categorical. |
| **RD-08** | **Build** | Share the new helper with opt-in Scatter comparison while preserving paired numeric statistics and fits; ranked covariance/regression would change their meaning. |
| **RD-09** | **Build** | Carry settings through savedData, echoes, DSL, undo, reopen, and export in the exposing milestone; a transient-only method is not a finished library feature. |
| **RD-10** | **Build** | Keep computation exact and add correct sorted-index reuse plus measured scheduling; large-row responsiveness cannot be inferred from the current points benchmark. |
| **RD-11** | **Build** | Preserve selection/trace conventions and provide accessible bounded controls at all three widths; inspection must work without a mouse or hover. |
| **RD-12** | **Explore** | Keep prepared ranks as a documented fixed-cohort teaching route; it is transparent but cannot replace pair/group/filter-specific native ranking. |
| **RD-13** | **Defer** | Add Kendall tau-b only with a separate explanation and fixtures; another coefficient expands method choice without completing the primary workflow. |
| **RD-14** | **Defer** | Treat scagnostics or other shape discovery as a separate feature; rank correlation alone misses structured nonmonotonic pairs. |
| **RD-15** | **Defer** | Keep automatic matrix clustering and exact group-only handoff out of this increment; both add scope/identity decisions that the compact pooled browser avoids. |
| **RD-16** | **Avoid** | Exclude significance stars, p-values, causal priority, universal mixed-type scores, and automatic coercion; they exceed this descriptive, typed workflow. |
| **RD-17** | **Avoid** | Never reuse global rank values after pair/group subsetting or write rank fields into source data automatically; both can silently change the requested statistic. |
| **RD-18** | **Build** | Ship deterministic numerical, state, interaction, docs, and example evidence in each increment; reviewable proof must accompany the behavior it validates. |

## 10. Open implementation choices, with defaults

These do not reopen the build decision or impose an outside-demand gate.

- **Worker threshold:** choose from measurements on a named browser/device and document the envelope. Default design is exact results with revision-safe worker scheduling for large jobs; no automatic approximate fallback.
- **Typed facet conversion:** use existing facet predicate utilities where available; verify missing-category semantics before wiring the prepared draft. If no reusable converter exists, extract the smallest pure adapter and test it against the current facet evaluator. Do not persist facet runtime IDs.
- **Tiny cell typography:** start with two coefficient lines plus `n`, visible method labels, and group overflow in trace. Verify actual fonts/long labels at 72 px cells before deciding the final truncation rule.
- **Temporal tick intervals:** use UTC calendar boundaries chosen for visible span and width through the existing axis tick-values input. Check long intervals and the calendar-rendering boundary. The statistical date contract is already decided.
- **Legacy result adapters:** retain `r` as Pearson while migrating internal matrix consumers. Whether it can be removed in the same implementation depends on whether the full checkout exports those internal types; do not repurpose it.

## 11. Evidence index

### Repository evidence

All repository links below are pinned to `9d64a021e35d312887b1bc848e307f42b6c3091f`. Directory entries identify the complete named files in the inventory, not an assertion that every file in the directory was read.

| Key | Paths and decisive symbols |
| --- | --- |
| **C01** | [AGENTS.md](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/AGENTS.md), `CODING_STANDARDS.md`, `docs/agent-guide.md`, [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/docs/ui-defaults.md), `docs/research/DIRECTION.md`, and the three named intent briefs. |
| **C02** | [ScatterMatrix/definition.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts): `ScatterMatrixSettings`, `MAX_MATRIX_FIELDS`, defaults/validation; `ScatterMatrixSettingsPanel.tsx`. |
| **C03** | [ScatterMatrix/matrixPlan.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts): `continuousValue`, `pearson`, `pairedCorrelation`, `planGroups`, `MatrixCell`, `planMatrixLayout`, `planMatrixSelection`, `withSelectedBars`. |
| **C04** | [ScatterMatrix/ScatterMatrix.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrix.tsx): memoized layout/selection and interaction; `matrixCanvas.ts`: context/selection drawing. |
| **C05** | [ScatterMatrix/matrixBands.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/matrixBands.ts): `planBands`, represented category membership; `matrixCells.ts`: mixed-cell summaries. |
| **C06** | [ScatterMatrix/matrixTrace.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts), `MatrixTraceBody.tsx`, `charts/trace/ChartTracePanel.tsx`: matrix-cell/row evidence and dispatch. |
| **C07** | [ScatterPlot/pairedSummary.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts): `pairedStats`, `planPairedSummary`; `fitPlan.ts`: `groupScatterRows`, `fitInputKey`; `scatterPlan.ts`; [lib/valueParsing.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/valueParsing.ts): `finiteNumber`, `timestampOf`, `dateBound`. |
| **C08** | [providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/providers/DataLayerProvider.tsx): `updateChart`, `addChart`, `holdStateChanges`, `DISPLAY_ONLY_KEYS`, saved-data fingerprint, `toRuntimeChart`, `toSavedChart`, `saveToStructure`; `charts/useGetLiveData.tsx`; `types/ChartTypes.ts` and `FilterTypes.ts`. |
| **C09** | [utils/saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/utils/saveDataUtils.ts): `isChart`, saved validation/raw-data encoding; `types/SavedDataStructure.ts`: saved schema/type contract. |
| **C10** | [lib/dsl/settingKeys.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/dsl/settingKeys.ts), `compile.ts`, `export.ts`, `export.test.ts`; `apps/demo/src/savedViewsHistory.ts`. |
| **C11** | [apps/demo/src/docs/pages/scatter-matrix.mdx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/apps/demo/src/docs/pages/scatter-matrix.mdx), `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/examples.ts`: existing documentation/example registration. |
| **C12** | `ScatterMatrix/matrixPlan.test.ts`, [ScatterMatrix/matrixPlan.bench.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.bench.ts), `ScatterPlot/scatterPlan.test.ts`, `summaryMarginals.test.ts`, `test/providers/savedSelectionRestore.test.tsx`, root `package.json`. |
| **C13** | Pinned supplements: [ScatterPlot/scatterAxis.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/charts/ScatterPlot/scatterAxis.ts), `ScatterPlot.tsx`, `ScatterSvg.tsx`, `planScatterPoints.ts`, `useScatterFits.ts`, `FitLabels.tsx`, and `Axis/axisPlan.ts`. |
| **C14** | Pinned supplements: [plot/ChartDraftContext.tsx](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/components/plot/ChartDraftContext.tsx), `ChartPlacementLayer.tsx`, `AddChartDialog.tsx`, `hooks/useCreateCharts.ts`, `components/PlotChartPanel.tsx`, `ChartGridLayout.tsx`. |
| **C15** | Pinned supplements: [hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/hooks/CrossfilterWrapper.ts): `getAllData`, `updateChartFilters`, raw source group and local-selection semantics; [lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/9d64a021e35d312887b1bc848e307f42b6c3091f/packages/explorEDA/src/lib/chartPopulation.ts): `getPopulationTest`, `restrictToPopulation`. |

### Primary external sources

| Key | Source and relevance |
| --- | --- |
| **S01** | Orange, [Correlations](https://orangedatamining.com/widget-catalog/unsupervised/correlations/) and [Scatter Plot](https://orangedatamining.com/widget-catalog/visualize/scatterplot/): documented coefficients, Features handoff, and original record selection. |
| **S02** | GGally, [`ggpairs`](https://ggobi.github.io/ggally/reference/ggpairs.html): mixed panels and triangle configuration. |
| **S03** | GGally, [`ggally_cor`](https://ggobi.github.io/ggally/reference/ggally_cor.html): coefficient methods and groups. |
| **S04** | JMP 19.2, [Multivariate Platform Options](https://www.jmp.com/support/help/en/19.2/jmp/multivariate-platform-options.shtml): pairwise tables, nonparametric methods/maps, and correlation clustering. |
| **S05** | JMP 19.2, [Statistical Details for Nonparametric Measures of Association](https://www.jmp.com/support/help/en/19.2/jmp/statistical-details-for-nonparametric-measures-of-association.shtml): tied-rank correlation definition. |
| **S06** | seaborn, [`PairGrid`](https://seaborn.pydata.org/generated/seaborn.PairGrid.html): upper/lower/diagonal mappings, selected variables, and hue. |
| **S07** | jamovi, [`corrMatrix`](https://docs.jamovi.org/jmv/jmv_corrMatrix.html): separate coefficient, count, and plot options. |
| **S08** | R, [`cor`](https://stat.ethz.ch/R-manual/R-devel/library/stats/html/cor.html): pairwise completeness, per-pair reranking, and possible non-positive-semidefinite output. |
| **S09** | SciPy, [`spearmanr`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html): rank association and constant-input behavior. Its inference API is outside this feature. |
| **S10** | SciPy, [`rankdata`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html): average-rank tie convention. |
| **S11** | SciPy, [`kendalltau`](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.kendalltau.html): tau-b formula, ties, and efficient implementation. |
| **S12** | pandas, [`DataFrame.corr`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.corr.html): pairwise complete observations, methods, and minimum observations. |
| **S13** | Wilkinson, Anand, and Grossman (2005), [Graph-Theoretic Scagnostics](https://www.tableau.com/sites/default/files/2023-01/Wilkinson_Infovis-05.pdf): graph/shape measures and squared-rank monotonicity, §3.3.3. |
| **S14** | Matejka and Fitzmaurice (2017), [Same Stats, Different Graphs](https://www.research.autodesk.com/publications/same-stats-different-graphs/): authors’ paper/project account of differing shapes with matching summary statistics. |
| **S15** | de Winter, Gosling, and Potter (2016), [Comparing the Pearson and Spearman correlation coefficients across distributions and sample sizes](https://research.tudelft.nl/en/publications/comparing-the-pearson-and-spearman-correlation-coefficients-acros/): authors’ institutional publication record and distribution-dependent comparison. |

## 12. Completion record: access, files, checks, and next inputs

**Access:** the attached packet was the authoritative complete source for its 44 files at the stated baseline. The following complete packet files were read. Paths inside `packages/explorEDA/src/` are grouped to keep the inventory legible.

- Root/guidance: `AGENTS.md`, `README.md`, `package.json`, `CODING_STANDARDS.md`, `docs/agent-guide.md`, `docs/ui-defaults.md`, `docs/research/DIRECTION.md`.
- Intent: `docs/intent/research-ideas-100/ideas/R005-rank-correlation.md`, `docs/intent/relationship-discovery/intent-brief.md`, `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Library data/state: `lib/valueParsing.ts`, `providers/DataLayerProvider.tsx`, `utils/saveDataUtils.ts`, `types/ChartTypes.ts`, `types/SavedDataStructure.ts`, `types/FilterTypes.ts`, `components/charts/useGetLiveData.tsx`, `components/charts/trace/ChartTracePanel.tsx`, `test/providers/savedSelectionRestore.test.tsx`.
- Dashboard text: `lib/dsl/settingKeys.ts`, `lib/dsl/export.ts`, `lib/dsl/compile.ts`, `lib/dsl/export.test.ts`.
- `components/charts/ScatterMatrix/`: `definition.ts`, `ScatterMatrixSettingsPanel.tsx`, `matrixPlan.ts`, `matrixPlan.test.ts`, `matrixPlan.bench.ts`, `matrixBands.ts`, `matrixCells.ts`, `matrixCanvas.ts`, `matrixTrace.ts`, `MatrixTraceBody.tsx`, `ScatterMatrix.tsx`.
- `components/charts/ScatterPlot/`: `pairedSummary.ts`, `definition.ts`, `scatterPlan.ts`, `scatterPlan.test.ts`, `fitPlan.ts`, `summaryMarginals.test.ts`.
- Demo: `apps/demo/src/docs/pages/scatter-matrix.mdx`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/examples.ts`, `apps/demo/src/savedViewsHistory.ts`.

**Supplemental access:** C13 lists seven additional pinned files, C14 lists six, and C15 lists two; these 15 files were retrieved and inspected to resolve decisive integration questions. No current-main behavior was substituted for the baseline. No implementation checkout, repository change, commit, or push was performed.

**Checks versus proposals:** source reading and primary-source research were completed; 24 independent numerical reference cases were executed. Every new API, control, planner change, persistence assertion, UI proof, benchmark target, and milestone in these reports is proposed work for the implementation. The reports do not claim those acceptance checks already pass.

**Deliverables:** this [decision report](rank-discovery-report.md) and the complete [implementation plan](rank-discovery-implementation-plan.md). They are designed to support Codex’s current-code check, local dispositions, and small documentation PR.

**Open questions:** measured worker threshold, exact reuse point for typed facet predicates, final tiny-cell typography, temporal tick intervals, and whether internal compatibility adapters can be removed after full-checkout export inspection. None requires external demand validation or blocks M1’s baseline implementation.
