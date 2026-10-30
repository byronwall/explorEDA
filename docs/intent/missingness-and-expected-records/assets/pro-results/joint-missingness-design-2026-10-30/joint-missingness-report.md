# Joint missingness as a saved analysis

Build a registered **Joint missingness** chart whose primary view is a frequency-ranked table of **exact missing/present patterns**, using an UpSet-style dot matrix beside counts and shares. Keep one explicit, owner-excluded population behind every number. A selection stores the meaning of a pattern, re-evaluates against effective values, and leads to its complete record set through the existing trace system. Make the analysis durable through JSON, Dashboard text, and an explicit **Keep selection** action in notebooks, with existing named count and share findings. Add bounded group comparisons and chosen-field presence/finite-number checks in a second milestone. This adds a useful analytical capability without a separate missing-data engine, a general predicate language, or a dependency on the unbuilt selection-refresh initiative.

**Design date:** October 30, 2026.  
**Authoritative source baseline:** `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.  
**Mode:** research and design; no repository implementation, commits, deployment, or product acceptance claim.  
**Companion plan:** [joint-missingness-implementation-plan.md](joint-missingness-implementation-plan.md).

## 1. Decision and evidence boundaries

The attachment contains 55 complete baseline files. All 55 were read across the source reviews. Additional files were consulted at the same commit to resolve chart registration, record tracing, category identity, notebook parsing, source schema, and the actual folder save/reopen path. The complete packet inventory and adjacent-source list appear in §12. No source claim in this report relies on a later `main`.

The October 19 conditional review supplies useful distinctions, but its demand gate is superseded by this mission and `docs/research/DIRECTION.md`. Its proposal to stop at a recipe does not govern this design. The October 21 accounting review is retained as stage-specific context; this work does not attempt to harmonize every existing value count. The selection-refresh implementation plan explicitly describes unbuilt work and is not a prerequisite. [R01]

Evidence labels used here:

- **Source fact:** established by the supplied baseline or named adjacent source, not by browser execution.
- **External fact:** established by the primary documentation or research paper linked in §2 and §11. Comparator products were not run.
- **Checked arithmetic:** the supplied fixture memberships and 41 checks were executed using the baseline parsing/conversion helpers and an independently authored membership oracle. A separate arithmetic review corroborated the counts.
- **Proposal:** the new chart, interfaces, limits, interaction rules, persistence extensions, and acceptance tests. None is an implemented feature.

The central invariant is:

> The pattern, its count, its denominator, its selected records, and its notebook finding must be different presentations of the same predicate evaluated on the same current population.

This invariant is stronger than adding a missingness picture to a dashboard.

## 2. Ranked question 1 — What should the user see and do?

### 2.1 Compare the serious alternatives

| Alternative | Strength for this mission | Limitation and decision |
|---|---|---|
| Exact pattern-frequency table | Compresses repeated patterns; every row has a precise record set; counts reconcile to the population. | Names alone become hard to scan across many fields. **Use it as the analytical foundation.** |
| UpSet-style exact-pattern matrix with frequency bars | Shows which fields participate in each pattern while retaining quantitative comparison. | Requires an explicit legend and an exact/inclusive distinction. **Use this encoding inside the frequency table.** |
| Record-by-field matrix | Shows individual observations, adjacent blocks, and ordering effects directly. | Repeated patterns consume most of the space; sampling can hide a rare joint omission. **Use a paged record matrix in trace, not an unbounded overview.** |
| Completeness or chosen-input check | Answers how many records remain for specific fields; gives an immediate consequence. | A single complete-case total hides which omissions caused exclusion; presence alone does not imply numeric usability. **Add a linked reading, not a replacement for patterns.** |
| Existing profiles plus authored indicators/filters | Reuses current tools and supports simple investigations. | Independent field choices do not represent an arbitrary union of exact patterns; temporary selections and notebook scope need deliberate handling. **Keep as a useful comparator and entry point, not the final product.** |

The recommended combination is one chart with three related readings: **Patterns**, **Compare groups**, and **Inputs**. The pattern view is primary; the other readings reuse its fields, population, selection, and trace. They are not three independent engines. M1 delivers Patterns and all-chosen-fields completeness. M2 adds the bounded group and chosen-input readings.

### 2.2 What the named systems contribute

**UpSet — Lex et al., 2014, and the authors’ project.** The paper models exclusive intersections relative to the selected sets, includes the complement of their union, and connects set summaries to element views. Its matrix-plus-bar design is a strong precedent for exact patterns and a separate record view. Adopt those ideas. Do not import its full query/aggregation interface, expected-cardinality display, or an UpSet dependency. This chart needs a smaller, explicit subset of the interaction model. [E01]

**naniar.** `gg_miss_upset` exposes combinations of missingness, with documented defaults limiting sets and intersections. `bind_shadow` supplies missingness indicators alongside original data, and `gg_miss_fct` exposes differences by a categorical factor. These support bounded fields, explicit display limits, and group comparison. explorEDA should compute a temporary signature index over its existing effective columns rather than materializing a second shadow dataset into the user’s source. [E02–E04]

**missingno.** Its matrix combines record-level presence/absence with a completeness sparkline. Its correlation heatmap omits constant-nullity fields because their correlation is undefined. The useful lesson is to retain an individual-record view and disclose what a summary omits. The proposed chart must continue showing selected always-present and always-missing fields; neither pairwise correlation nor clustering should replace exact memberships. No error or causal interpretation is adopted from its explanatory examples. [E05]

**VIM.** `aggr` presents per-variable missing counts and combinations, with frequency/proportion displays and ordering controls; its matrix plot instead visualizes individual cells and supports sorting. This is a close precedent for pairing a compressed pattern overview with a record matrix. Use fixed-height pattern rows with count bars, rather than encoding frequencies through varying row heights, because rows also need reliable selection and trace targets. [E06–E07]

**OpenRefine.** Facets connect counts to matching records and combine restrictions, while its documentation distinguishes current facet state from persisted project data. This reinforces the need to make saved selection explicit. It does not supply the exact multi-field-pattern or notebook contract required here. [E08]

These are design inferences from documented capabilities. No claim is made that the proposed UI has outperformed these tools in a usability experiment.

### 2.3 Entry and field choice

1. **Add chart → Joint missingness.** A registered chart belongs in saved layouts, can be duplicated, and has existing settings, trace, image export, and notebook naming hooks. A transient field inspector cannot carry this whole analysis.
2. Choose **2–12 diagnostic fields** with the shared `FieldPicker`. Default to the fields supplied by an explicit invocation; otherwise ask for fields in the chart’s compact setup state. Do not silently select every field or assume that the largest marginal counts identify the most useful analysis.
3. Keep the chosen field names visible. Field labels may change; canonical field keys identify the saved analysis. Field order is a display choice. Reordering does not change a pattern.
4. Show picker summaries computed over the chart’s single base population. The current picker calls `useFilteredFieldProfiles`, whose field-dependent ownership rules are inappropriate for a joint denominator. Add a scoped-profile input and a maximum-selection input while reusing the existing search and metadata rows. [R04, R05]

An unconfigured chart does not filter any other chart. The selected field universe is explicit; no hidden field is silently removed from the predicate because its column is horizontally scrolled away.

### 2.4 Read patterns

Each pattern row contains:

- A readable label, such as **x, y missing**.
- A dot for every chosen field: filled means missing; hollow means present. A line joins the missing dots.
- An exact count, a linear frequency bar, and `count / current population` share.
- Selection state independent of hover, color alone, or row position.

The legend says **All other chosen fields are present**. The chart title/status identifies **Effective values** and **Exact patterns**. “All present” is a pinned, selectable complement, including when its count is zero. Do not enumerate thousands of absent theoretical patterns.

Default to descending current frequency, with deterministic field-key tie-breaking. Selecting this chart’s own patterns does not change its base counts, so multi-selection does not reorder the rows. Other filters can change the ranking; selection remains keyed by meaning. Offer rare-first and missing-field-count sorting without changing membership. Bar scale bounds are computed over this chart’s source cohort before peer/workspace filtering and stay fixed during those filters, matching the repository’s chart-axis convention. [R02]

Show 20 ordinary pattern rows per page, plus the pinned all-present reading. Search and “Selected patterns” reach every observed or retained selected pattern. If some patterns are not drawn, show both the omitted pattern count and the number of records they represent. This is display omission, not analytical exclusion.

### 2.5 Select and trace

- A click or Enter toggles one **whole exact pattern**. Multiple selected patterns form a union.
- Empty-plot click or the existing Clear control removes the selector. Toggling off the final selected row also clears it.
- A selected pattern that later has zero members remains selected. It is not silently cleared.
- Alt-click or Alt-Enter opens that pattern’s trace. Keep the existing header trace control; add no mark-level “Inspect” button.
- Trace shows the exact missing and present field lists, stage, population, denominator, count, and complete runtime record membership. The record table pages 50 rows at a time, with raw/effective values and origin explanations where known.
- A selected-union trace shows all records in the union once. Pattern rows are disjoint, so their counts add exactly.

The general Chart data preview currently takes the first 100 rows and does not independently apply a notebook chart’s own selection. M1 must add a dedicated missingness path using the same selected IDs and paged table; otherwise “View chart data” would be a misleading alternate record route. [R06]

### 2.6 Compare groups and chosen inputs

M2 adds one optional **Group by** field and a compact table of the current selection within each group. Each row shows group size, selected count, and within-group share. A group trace resolves its exact intersection with the selected predicate. An explicit **Use as cohort** action applies an ordinary chart-local group restriction; it does not create an implicit union of selected group-pattern cells.

The **Inputs** reading lets the analyst choose a nonempty subset of the diagnostic fields and either:

- **Have values:** every required effective value is present under `isMissingValue`.
- **Finite numbers:** every required effective value passes `finiteNumber`.

Both admitted and excluded counts are selectable, with exact trace records. Selecting one replaces the pattern selection in one action. The status names the new predicate. It does not invisibly AND the two modes.

### 2.7 Continue in a notebook

An editable notebook offers **Keep selection**, **Reset to kept selection**, and a guarded **Undo Keep**. Ordinary clicks remain exploratory; Keep writes the semantic selector into the named chart’s declaration. Existing findings then provide selected count, pre-selection scope count, share, and record links. A second notebook chart’s selection does not change these findings. [R07, R08]

For dashboard entry, provide **Copy notebook section** rather than inventing a reverse of the existing notebook-to-workspace Explore callback. The section contains a named chart, conversions/calculations it needs, reproducible local/workspace scope, findings, and prose. This action is enabled only when the section can reproduce the scope:

- Ordinary workspace restrictions can be copied as chart-local restrictions.
- Existing chart-local restrictions remain local.
- Active peer-chart selections must be absent in M1, unless a specific supported lowering is implemented and proven. A special peer predicate must not be placed in `localFilters` where it is invalid.
- Dependency names, scalar category types, and source/query binding must survive export/recompile.

If the scope cannot be transferred, state the specific unsupported selection and retain the current analysis. Never silently produce a broader notebook population. Opening the same query in a notebook and making the selection there remains the direct supported path.

### 2.8 Layout and accessibility

The [wireframe](joint-missingness-wireframe.png) shows the primary pattern view, group rates, input checks, exact trace, and notebook continuation with actual fixture counts. Its panels illustrate related states rather than a mandatory fixed dashboard. The editable [SVG](joint-missingness-wireframe.svg) is also supplied.

Follow the repository’s compact controls, existing theme tokens, visible field/filter state, and nonmodal local settings. Use real tooltips and accessible names; no native `title` attributes. Pattern rows need complete keyboard labels, for example “x and y missing; z, note, flag, w present; 2 of 12 records; selected.” On narrow screens, preserve field identity through horizontal scrolling and a textual pattern label; do not squeeze dots into unreadability. The source project already treats narrow layouts as view-oriented, so this does not introduce a separate mobile editing architecture. [R02]

## 3. Ranked question 2 — What exactly is a pattern?

### 3.1 Mathematical contract

Let `F` be the configured field set and `v_f(r)` the current effective value for field `f` on row `r`. Define:

\[
m_f(r)=\mathbf{1}[\operatorname{isMissingValue}(v_f(r))].
\]

For a subset `A` of `F`, the **exact** pattern is:

\[
E_A(B)=\{r\in B : \{f\in F:m_f(r)=1\}=A\}.
\]

Every chosen field outside `A` must be present. Fields outside `F` are irrelevant. The `E_A(B)` sets partition `B`, including `E_∅`, so their counts sum to `|B|`.

For selected patterns `T`, the selected records are:

\[
Q(B,T)=\bigcup_{A\in T} E_A(B).
\]

This is a union of full signatures. It is not a Cartesian product of independent choices for each field.

An **inclusive** intersection, if designed later, would instead be:

\[
I_A(B)=\{r\in B : A\subseteq \{f\in F:m_f(r)=1\}\}.
\]

Other fields may then be missing. Inclusive intersections overlap and do not form a partition. **Do not ship an exact/inclusive toggle in M1 or M2.** Exact answers are the product contract; inclusive answers in the fixtures demonstrate why the distinction matters. A later inclusive selector must retain its own semantic identity and cannot be saved as today’s list of matching exact masks.

### 3.2 Effective missingness first

The baseline `isMissingValue` means null, undefined, or blank/whitespace-only text. `missingRowCount` adds blank text to a field profile’s null count. Numeric exclusions remain a different quantity. `applyFieldSettings` converts only when an explicit type, date preset, or nonempty null-token list requests it; inference alone does not convert values. [R03]

| Input or result | M1 effective-pattern treatment | Explanation retained in trace |
|---|---|---|
| `null` | Missing | Raw null when this is a source field. |
| Explicit `undefined` | Missing | Distinct raw property state where inspection can establish it. |
| Absent property on an existing row | Missing | Property absent; not an absent observation. |
| `""` or whitespace-only text | Missing | Blank text; categorical storage may retain the literal value. |
| Finite `0` | Present | Valid numeric input unless an explicit authored rule converts it to missing. |
| `false` | Present | Valid Boolean value; not a finite numeric measurement under this parser. |
| Present invalid numeric text without conversion | Present | May fail a finite-number check; not automatically missing. |
| Numeric `NaN`, `Infinity`, `-Infinity`, or corresponding nonfinite text without conversion | Present | Not a finite measurement. |
| Invalid/nonfinite input under explicit numeric conversion | Missing | Conversion failure; this row is counted once in effective missingness. |
| An authored null token | Missing after that rule applies | Authored token, not a conversion error. Matching uses the converter’s existing rules. |
| Calculated output | Classify the actual current result | Use existing calculation diagnostics; missing dependencies do not automatically make a valid result missing. |

Two qualifications prevent overclaiming:

- An analyst can explicitly author `"0"` or `"false"` as a null token. `false` also fails explicit numeric conversion. The guarantee is that the diagnostic does not independently treat zero/false as missing.
- Categorical blanks may remain distinct values for categorical grouping while also satisfying the existing missing-value predicate. The chart names its predicate and preserves the raw text; it does not repair the category model.

For calculated fields, `getColumnData` reads calculation-manager output. Those outputs are not a same-name raw source column and are not run through raw field conversion again. Failed evaluations can yield undefined with an error; successful missing results are different. Trace the existing expression/error evidence without inferring an underlying cause. [R09]

### 3.3 Raw input, conversion failure, and effective value are separate stages

M1 selects effective patterns because those are the values the current analysis consumes. Record trace can show raw input, effective value, and a known conversion/calculation explanation together. Do not add failure counts on top of effective-missing counts: failed conversions already belong to that set.

Selectable raw patterns are explicitly deferred. The current chart predicate receives an effective field getter only. A raw mode would require a deliberate raw-column input through the registry, Crossfilter, and notebook evaluator; a new `basis="raw"` setting alone would be incorrect. Calculated fields would need an explicit exclusion or a different definition in that mode. [R05, R09]

No new universal value-state classifier is required. Reuse `isMissingValue`, `finiteNumber`, `convertFieldValue`, and existing calculation trace facilities, with a small missingness-specific signature helper.

### 3.4 One population and one denominator

| Symbol | Definition | Use |
|---|---|---|
| `S` | Every row in the current provider input or query-result frame | Source row count and cache basis. |
| `L` | `S` restricted by this chart’s `localFilters` | The chart’s source cohort. |
| `B` | `L` after workspace filters and active peer-chart selections; this chart’s own selector is excluded | Every pattern count, marginal-in-chart reading, and pattern share denominator. |
| `Q` | `B` intersected with this chart’s semantic selector | Selected records and the chart’s selected notebook findings. |

In notebooks, `localSelections` prevents peer-chart selections from entering `B`. Thus `B = L ∩ workspace restrictions`. The notebook finding with `population=eligible` names this pre-selection population; the word “eligible” in that existing API does **not** mean “suitable for a statistical analysis.” [R05, R07]

Rows-drawer-only search/filter controls are record-view restrictions, not another denominator for the pattern analysis. If the analyst wants them to define the analysis, the restriction must be made explicit as workspace or chart-local scope.

The chart header shows source count and current scope, with local restrictions inspectable. It does not assemble field-specific filtered profiles into a common table. `useFilteredFieldProfiles` intentionally excludes owners differently by field; its results cannot be assumed to share a denominator. [R04]

The new outgoing selection predicate must include the chart-local population **only while a selector is active**. With no selector, return true so configuring a local cohort does not unexpectedly filter all other charts. With an active selector, return `inLocalPopulation(id) && matchesSelector(id)`. Crossfilter’s displayed chart population alone does not enforce this outgoing restriction. [R05]

### 3.5 Empty and unavailable states

| State | Count/share and selection meaning |
|---|---|
| No selector | No outgoing narrowing; named selected finding equals its eligible population. |
| Selector with `patterns: []` | Explicit active-empty; selected count 0. Preserve through JSON/text. |
| Selector with `patterns: [[]]` | Select the all-present exact pattern. |
| Nonempty selector with zero current matches | Keep it active; selected count 0, share 0% when `|B| > 0`. |
| Valid empty `B` with known fields | Count 0; percentages unavailable, shown as “No rows in scope,” not 0% of zero. |
| Known field absent on some/all rows | Those rows have missing values for that field. |
| Referenced field no longer in the schema | Analysis unavailable; retain intent, fail a broken active selector closed, and do not report a valid zero count. |

The last distinction needs a small schema context because an empty column object alone cannot distinguish unknown fields from known all-absent fields. Use declared field names/types, observed keys, and calculation names; never treat the chart’s requested fields as evidence of source schema. Add a shared `missingnessProblem` check and a narrow chart-unavailable finding status. Preserve query schema through folder notebook loading, including declared type `"unknown"`. The computation guard in §6 uses the same unavailable path before column/signature work: both selected and pre-selection findings are unavailable, and trace must not claim an evaluated empty set. [R09, R10]

## 4. Ranked question 3 — Assess consequences without causal overclaiming

### 4.1 A bounded comparison

For each displayed group `g`, compute:

\[
N_g=|B_g|,\quad n_g=|Q\cap B_g|,\quad p_g=n_g/N_g.
\]

Report `n_g`, `N_g`, and `p_g` together. A two-group comparison may display `100(p_a-p_b)` percentage points using unrounded values. No significance badge, causal label, quality grade, or probability-of-cause display is warranted.

Use one effective group field, at most eight named displayed groups, and one explicit remainder if needed. The remainder is a display union, not a literal category. All records remain in the accounting, its trace lists the constituent categories, and no sampled numerator is divided by a full-population denominator. A chosen small group remains visible even if a top-frequency display would hide it.

The diagnostic’s **Missing group (includes blank text)** bucket follows `isMissingValue`. It is distinct from a literal category with that label. Existing `values: [null]` filtering and unquoted `where.group=null` reproduce this bucket, including blank strings. Other groups retain typed category identity, so numeric `0`, string `"0"`, and `false` are not merged. `categories.ts::categoryKey` already supplies typed keys. [R03, R11]

There is a text boundary to preserve: the current DSL’s category lookup uses `String(raw)` when resolving ordinary value filters. A number/string collision may not round-trip faithfully through a generated `where.` clause. M2 should verify generated category predicates by recompilation and typed membership; disable only the affected text/cohort export when exactness cannot be retained. JSON and exact group traces remain available. This mission does not repair the general parser. [R11]

Group rows are secondary statistical readings, not a new multi-cell selection surface. Trace them directly; use a single explicit cohort action before selecting a pattern. `(A AND pattern 1) OR (B AND pattern 2)` must never become `{A,B} AND {pattern 1,pattern 2}`. That richer selector is deferred.

### 4.2 Chosen-field completeness and finite-number readiness

For a nonempty required subset `R ⊆ F`:

\[
C_R(B)=\{r\in B: \forall f\in R,\neg\operatorname{isMissingValue}(v_f(r))\},
\]

\[
V_R(B)=\{r\in B: \forall f\in R,\operatorname{finiteNumber}(v_f(r))\ne\text{undefined}\}.
\]

The excluded set is always the complement **inside `B`**. Use the baseline numeric reader, not JavaScript `Number`, which would admit values such as false or blank text under a different contract.

For finite checks, distinguish records missing at least one required value from records whose required values are all present but at least one is numerically ineligible. These two row buckets are disjoint. Per-field reason counts may overlap; label them as field counts rather than adding them into an apparent row partition.

This is a check of declared inputs. It does not establish suitability for every scatter, model, time-series operation, weighting scheme, date operation, sample-size requirement, or causal analysis. Do not claim that having complete inputs fixes selection bias. The observed data alone cannot generally distinguish missing at random from missing not at random; this product performs no missingness-mechanism tests. [E09]

### 4.3 Exact six-field fixture

The complete machine-readable data is in [fixture-data.json](fixture-data.json). Diagnostic order is `[x, y, z, note, flag, w]`; `id` and `group` are metadata. Apply `x: {type:"numeric"}` and `note: {type:"categorical", nullTokens:["NA"]}`. Leave `w` unconverted. Values shown as strings below are literal strings; r07 contains two spaces and r11 has no `w` property.

| Record / group | Raw tuple in diagnostic order | Effective missing fields |
|---|---|---|
| r01 / A | `[0, 10, 1, "ok", false, 5]` | None |
| r02 / A | `[null, 20, 2, "ok", true, 6]` | x |
| r03 / A | `[null, 30, 3, "ok", false, 7]` | x |
| r04 / A | `[40, null, 4, "ok", true, 8]` | y |
| r05 / A | `[null, null, 5, "ok", true, 9]` | x, y |
| r06 / A | `[null, null, 6, "ok", true, 10]` | x, y |
| r07 / A | `[70, 70, 7, "  ", true, 11]` | note |
| r08 / A | `["bad", 80, 8, "ok", true, 12]` | x, after conversion failure |
| r09 / B | `[null, null, null, "ok", false, 13]` | x, y, z |
| r10 / B | `[100, 100, 10, "NA", null, 14]` | note, flag |
| r11 / B | `[110, 110, 11, "ok", true, absent]` | w |
| r12 / B | `[120, 120, 12, "", true, "Infinity"]` | note; w is present but nonfinite |

There are 12 observations, with A = 8 and B = 4.

| Exact effective missing set | Source IDs | Count / 12 |
|---|---|---|
| None | r01 | 1 / 12 = 8⅓% |
| x | r02, r03, r08 | 3 / 12 = 25% |
| y | r04 | 1 / 12 = 8⅓% |
| x, y | r05, r06 | 2 / 12 = 16⅔% |
| note | r07, r12 | 2 / 12 = 16⅔% |
| x, y, z | r09 | 1 / 12 = 8⅓% |
| note, flag | r10 | 1 / 12 = 8⅓% |
| w | r11 | 1 / 12 = 8⅓% |

The pattern counts total 12. Eleven records have at least one effective missing value. Marginal effective missing counts are x = 6, y = 4, z = 1, note = 3, flag = 1, w = 1. Their sum, 16, counts missing **cells**, not incomplete records; its denominator would be 72 cells, not 12 rows.

| Exact pattern | A, denominator 8 | B, denominator 4 |
|---|---|---|
| None | r01; 1/8 = 12.5% | None; 0/4 = 0% |
| x | r02, r03, r08; 3/8 = 37.5% | None; 0% |
| y | r04; 1/8 = 12.5% | None; 0% |
| x, y | r05, r06; 2/8 = 25% | None; 0% |
| note | r07; 1/8 = 12.5% | r12; 1/4 = 25% |
| x, y, z | None; 0% | r09; 1/4 = 25% |
| note, flag | None; 0% | r10; 1/4 = 25% |
| w | None; 0% | r11; 1/4 = 25% |

The rare x/y/z omission is 8⅓% overall but 25% within B. This is a descriptive concentration in these records, not evidence of its cause. A’s x-missing rate is 5/8 = 62.5%; B’s is 1/4 = 25%. The pooled rate is 6/12 = 50%, not the unweighted average 43.75%.

**Exact selection proof.** Select exact `{x,y}` OR exact `{note}`:

- IDs: **r05, r06, r07, r12**.
- Overall: 4/12 = 33⅓%.
- A: r05, r06, r07; 3/8 = 37.5%.
- B: r12; 1/4 = 25%.
- A contributes 3/4 of the selection, but that 75% composition share is different from its 37.5% within-group rate.

An incorrect independent-field Cartesian representation admits r01–r08 and r12: **nine records**, rather than four. Exact `{x}` OR exact `{y}` is a second useful guard: r02, r03, r04, r08; it excludes both-missing r05/r06 and all-present r01.

**Exact versus inclusive proof.** Exact x/y gives r05, r06. Inclusive x/y gives r05, r06, r09: 3/12 = 25%, with A = 2/8 and B = 1/4. Inclusive note gives r07, r10, r12; exact note excludes r10 because flag is also missing. Inclusive semantics are comparison evidence, not a proposed M1 control.

**Input consequence proof.** For required fields x/y/w:

| Reading | Exact IDs | Count and within-group result |
|---|---|---|
| Effective values present | r01, r07, r10, r12 | 4/12; A 2/8 = 25%, B 2/4 = 50% |
| Finite numeric inputs | r01, r07, r10 | 3/12; A 2/8 = 25%, B 1/4 = 25% |
| Excluded from finite inputs | r02, r03, r04, r05, r06, r08, r09, r11, r12 | 9/12; eight have required missingness, r12 has present nonfinite w |

r10 is incomplete across all six fields but usable for this particular finite x/y/w check. r12 is present in x/y/w but numerically ineligible. r01 proves zero and false are not inherently missing.

**Stage proof.** Raw all-present records are r01 and r08; effective all-present is only r01. Raw x is missing in five records, with r08 added after conversion. Raw note is missing in r07/r12, with r10 added by its null token. Baseline conversion previews are x = 6 valid / 5 missing / 1 failed and note = 11 valid / 1 missing / 0 failed. The note preview retains blank category strings, while the diagnostic missing predicate includes them. These are different operations, not totals to force into equality.

**Refresh proof.** Keep exact x-only, then change r08.x from `"bad"` to `0`. Its membership changes from r02/r03/r08 to r02/r03, while all-present gains r08. Reversing source order preserves the business IDs; reusing original positions `[1,2,7]` would instead pick r11/r10/r05. Adding a new matching r13 joins the semantic selection. These are separate tests for value re-evaluation, ordering independence, and new membership.

Adding an explicit numeric conversion for w provides another test: r12 moves from note-only to note+w, so the original exact x/y-or-note union drops r12, while finite x/y/w membership stays the same.

### 4.4 Equal marginals, different complete cases

The second fixture contains two four-record groups over x/y/z. Every present value is 1.

| Group | Exact missing records | Complete records |
|---|---|---|
| Spread | s1 lacks x; s2 lacks y; s3 lacks z | s4 |
| Cluster | c1 lacks x, y, and z | c2, c3, c4 |

Each field is missing in 1/4 = 25% of each group. Each group also has three missing cells out of twelve. Yet all-three-fields completeness is 1/4 = 25% in Spread and 3/4 = 75% in Cluster. Present x/y gives s3/s4 versus c2/c3/c4. Exact x/y with z present is empty in both groups; inclusive x/y includes c1 only.

This proves what marginal summaries cannot identify: the joint arrangement of omissions and the actual observations retained for an analysis. It does not imply that either arrangement is categorically better or less biased.

### 4.5 Permitted and impermissible conclusions

The product may state:

- Which combinations occur in the observed/current rows, their frequencies, and their exact records.
- How a named group differs descriptively under a shared rule and explicit denominator.
- Which records pass a chosen presence or finite-number requirement.
- Which raw/effective changes are established by current conversion or calculation evidence.

It must not infer missing completely at random (MCAR), missing at random (MAR), or missing not at random (MNAR); diagnose causes; impute; grade quality; recommend automatic cleaning; or infer observations that should have existed. An empty Heatmap category pair remains a different condition from missing values on existing records. [E09, R12]

## 5. Ranked question 4 — Fit the existing data and interaction model

### 5.1 Small state and one predicate owner

Use the existing chart registry, `ChartSettings` union, `filters`, `localFilters`, saved structure, and data provider. A conceptual extension is:

```ts
interface JointMissingnessSettings extends BaseChartSettings {
  type: "joint-missingness";
  fields: string[]; // Display order; unique canonical field keys.
  patternSort: "frequency" | "rare-first" | "missing-count";
  // M2:
  groupField?: string;
  eligibility?: {
    fields: string[]; // Nonempty subset of fields.
    requirement: "present" | "finite";
  };
}

interface MissingnessPatternFilter {
  type: "missingness-pattern";
  field: "__ID"; // Predicate input coordinate; no saved member IDs.
  patterns: string[][]; // Missing fields; other chosen fields must be present.
}

// M2; mutually exclusive with MissingnessPatternFilter.
interface MissingnessEligibilityFilter {
  type: "missingness-eligibility";
  field: "__ID";
  match: "eligible" | "ineligible";
}
```

The eligibility filter reads its owning chart’s current `eligibility` settings, like the existing chart-owned specification filter reads its limits. It does not duplicate the required-field list in two saved locations. An explicit change of the requirement re-evaluates the selected admitted/excluded set and is one undoable settings edit.

The inherited `BaseChartSettings.field` can follow the first diagnostic field for base compatibility; `fields` is authoritative. Keep this compatibility detail out of UI copy. Exact pattern identity uses sorted field-key subsets, not labels, row order, display order, or delimiter-joined strings. Runtime bitmasks are an optimization only.

Accept exactly one missingness selector in this chart’s own filters. Reject it in workspace filters, Rows filters, chart-local filters, finding filters, and other chart types. Do not extend scalar `applyFilter` into a cross-field engine. Ordinary local cohort restrictions retain their existing types. `saveDataUtils.isBaseChart` validates before the chart switch, so validation needs a small owner-aware seam rather than an indiscriminate global allowance. [R05, R13]

### 5.2 Small implementation pieces

Add a normal chart folder with:

- `definition.ts`: registration/defaults/validation/filter function.
- `missingnessCore.ts`: canonical patterns, availability, signature and chosen-input predicates.
- `missingnessPlan.ts`: counts, denominator, grouping, ordering, and on-demand memberships.
- `JointMissingness.tsx` and settings UI: existing shell, field picker, controls, and renderer.
- `MissingnessTraceBody.tsx`: paged exact records with existing trace treatment.

The effective columns and source schema enter once; the same predicate logic serves chart selection and notebook findings. Resolve column getters before the per-row test. The repository specifically warns that repeated field lookup inside that test can become quadratic. [R02]

A small optional predicate context supplies `hasField(field): boolean` to distinguish structural absence and `sourceRowCount` for a computation preflight. Thread it through the registry and Crossfilter; existing definitions may ignore it. The chart renderer, predicate, and a `FindingContext.chartProblem` callback use the same availability function before column/signature work. A blocked chart without a selector contributes no restriction; a blocked active selector matches no rows while its selected and pre-selection findings say unavailable. This applies to missing schema and to the computation guard.

### 5.3 Trace payload and record identity

Add discriminated missingness trace kinds for a pattern, selected union, group reading, and input check. They carry the current revision, field basis, stage, predicate description, base count, matched count, and complete runtime IDs. Resolve raw/effective cell explanations lazily for the displayed page.

Extend `traceRowIds` and existing trace dispatch so project records can use the existing query-provenance route. For a project result, one pattern observation is **one current query-output row**. An aggregate output with five contributors is one observation, not five missingness records. Show output rows and source references separately. The evaluator’s source references can use unique typed entity keys, or positional fallbacks; only the former establishes that identity within its declared source contract. A folder notebook currently receives flattened query rows: retain the evaluation rows as read-only provenance alongside its schema before offering original-source references there. Without that adapter, trace must identify its records as current input/output rows, not claim original-source lineage. [R06, R10, R14]

Do not promise durable record identity for every trace ID. Durable **semantic pattern** selection re-evaluates the current frame and regenerates trace references. Explicitly freezing arbitrary record membership across refresh remains owned by the adjacent selection-refresh design.

Stale trace/finding popovers close when their revision changes, following current behavior. A zero count has an empty record list, not fabricated examples. A structurally unavailable analysis has an explanation, not an asserted empty cohort.

### 5.4 Refresh, history, and host callbacks

| Change | Required behavior |
|---|---|
| Pattern toggle or Clear | One `updateChart`; one meaningful `onStateChange`; existing host settings history can undo it. |
| Field display reorder/rename label | Preserve semantic selector. |
| Change diagnostic field set | Clear the exact-pattern selector in runtime and authored text atomically. Retain an M2 eligibility rule/selector only when its nonempty required subset remains valid; otherwise clear both together. One history step. |
| In-session conversion edit | Retain pattern meaning; use new effective columns; recompute counts and records. |
| Calculation result refresh | Re-evaluate on the new output; no inferred dependency-missingness propagation. |
| Reopen kept JSON/text over reordered/new source data | Re-evaluate the kept semantic selector; never replay saved row positions. |
| Referenced field removed from schema | Retain blocked intent, fail an active selector closed, and make findings unavailable. |
| Passive recomputation with unchanged settings | No new saved-state edit or extra Undo checkpoint. |

Current provider code already rebuilds/rebinds effective columns and refreshes chart predicates for field settings and calculations. Its data-prop replacement path can restore the incoming `savedData`, however. **M1 guarantees refresh of kept settings/text supplied to the new evaluation, not survival of unkept exploration across arbitrary host data/savedData replacement or folder remount.** This limit is explicit in the docs and tests; solving all transient-selection refresh is not smuggled into this feature. [R05, R08]

DataLayerProvider does not itself own an Undo stack. Demo Undo belongs to its host. Keep changes notebook text, so M1 adds a narrowly guarded Undo Keep command rather than pretending a provider selection checkpoint reverses the source edit. The inverse command restores only the prior authored selector through verified writeback, after checking named chart identity, the same field set, and the unchanged currently authored selector. For M2, also guard the eligibility rule and invert any rule change included in that Keep command. It preserves unrelated prose. It leaves the live preview as-is and displays “Selection differs from kept notebook” when appropriate. [R02, R10]

### 5.5 JSON, text, and notebook persistence

**JSON:** store the chosen fields, local scope, conversion/calculation settings, and semantic selector. Counts, row memberships, masks, and finding results remain derived. Use existing saved-analysis special-value support for actual undefined/nonfinite values; ordinary JSON rows alone cannot preserve every native scalar distinction. [R13]

**Dashboard text:** the generic `chart <registered-type> @name` form already exists. Add a narrow chart-only `patterns` alias that lowers to the single filter. The current parser does not parse nested JSON literals as settings. Use its indexed path syntax:

```text
chart joint-missingness @gaps fields[]=x,y,z,note,flag,w {
  title="Which fields are missing together?"
  patterns[]=
  patterns.0[]=x,y
  patterns.1[]=note
}
```

No `patterns` entry means no selector. `patterns[]=` alone means active-empty; `patterns.0[]=` means all-present; `patterns=unset` clears. Resolve each member as a field reference, validate after the full field universe is known, reject sparse/malformed lists, and canonicalize duplicates deterministically. Invalid selectors must not fall back to an unselected chart. `CHART_SETTING_KEYS`, compiler, exporter, setting descriptions, and save validation must agree. [R11, R13]

M2 saves ordinary rule settings as `eligibility.fields[]=x,y,w` and `eligibility.requirement=finite`. A separate chart-only alias, `inputSelection=eligible` or `inputSelection=ineligible`, lowers to the eligibility filter; `inputSelection=unset` removes it. Declaring both an active `patterns` selector and `inputSelection` is an error, not an order-dependent override. Keep includes the selected eligibility rule when necessary to preserve its meaning, without copying unrelated transient settings.

**Notebook:** existing findings suffice:

```text
finding @selected count chart=@gaps
finding @scope count chart=@gaps population=eligible
finding @share share selected scope digits=1
finding @selected-a count chart=@gaps where.group=A
finding @scope-a count chart=@gaps population=eligible where.group=A
finding @share-a share selected-a scope-a digits=1
```

The complete proposed notebook companion includes both groups and exact record links: [joint-missingness-notebook-example.md](joint-missingness-notebook-example.md). Its new chart/selector syntax is a build specification, not runnable on the baseline.

Ordinary automatic writeback excludes filters. Keep calls `writeBackChart` with the authored chart plus the live selector, then reuses its export → splice/rewrite → recompile verification. Use the `patterns` alias outside ignored `select.*` tokens. Assign a stable authored chart name if needed in the same verified edit. Keep emits one `onTextChange`; it does not manufacture a second provider-state edit. A field-set change needs a special atomic reconciliation because ordinary writeback would otherwise preserve the old authored selector. [R08]

Generated live prose must remain true during exploration: say “The current selection contains…” and refer to the chart’s visible predicate. Do not hardcode “two patterns,” particular required fields, “admitted,” or “finite” into a sentence whose count will follow arbitrary selection/rule changes. User-authored interpretation can remain ordinary prose, but the generated template must not create a stale claim.

The standalone `evaluateNotebookFindings` helper constructs raw columns and omits calculated outputs. M1 must not use it to claim effective-value parity without an explicit prepared-column/schema adapter. The live provider path already has effective columns. Keep the adapter narrow; if required effective/calculated inputs are unavailable in a headless caller, report unavailable rather than evaluate the new chart on raw values silently. [R07]

**Folder reopening:** the real baseline path is `onTextChange → ProjectWorkspace notebookTexts → FolderSaver.queue → files.write`. `App.reload` awaits `flush` and retains edits on failure; `readProjectFolder` reads `.eda.md` files and `readNotebookText` evaluates the query and recompiles. Reuse this path. Keep may say “Kept in notebook text”; only the host’s acknowledged status may say “Saved to the folder.” Preserve the query’s schema fields through the notebook read result so known empty schemas remain distinguishable from missing fields. [R10]

Existing comparison findings cannot be assumed to subtract two share findings. M2 can display a rate gap in its own comparison panel, while notebook prose shows two live shares. A new named percentage-point finding is an optional later extension, not an excuse to add general arithmetic now. [R07]

### 5.6 Chart image export

Use the normal chart image path. The exported image includes title, field labels, legend, stage, exactness, population/denominator, visible pattern counts, selection state, and any omitted-pattern/record notice. It shows the current page, not a falsely exhaustive chart. It does not embed every source record or promise a reproducible notebook by itself.

Tag new editor-only controls with `data-export="omit"`; retain semantic legends and persistent scope notes. Verify exported output against the resting chart at supported sizes. This follows the existing UI/image convention and needs no new chart dependency. [R02]

## 6. Ranked question 5 — Useful stages and bounded cost

### M1 — Exact patterns that can be kept

Deliver a registered effective-pattern chart, 2–12 fields, exact union selection, a stable owner-excluded denominator, paged full-membership trace, all-present selection, strict JSON/text persistence, named notebook count/share findings, Keep/Reset/Undo Keep, and actual folder reopen verification. Use the existing six-field fixture and a separate equal-marginals tab. Include the docs page, settings reference, runnable example, and export proof in this same milestone.

The first worker proof is only the pure signature/predicate plus a mounted provider/notebook test: select exact x/y OR note; assert r05/r06/r07/r12, denominator 12, and a local notebook share of 1/3. Then persist/recompile that predicate and prove the x-only refresh case. It can be implemented on the supplied baseline; it does not wait for another research PR.

### M2 — Group consequences and chosen inputs

Add the one-field group comparison and presence/finite-number requirements, using the same denominator and trace machinery. Keep their selected predicate through the same JSON/text/notebook lifecycle. Add the unequal-group notebook and its live per-group findings in the same milestone, with all exact memberships from §4.

The [implementation plan](joint-missingness-implementation-plan.md) specifies ordered tasks, files, acceptance values, persistence coverage, documentation, and each milestone’s main risk. Build dispositions are planning recommendations, not permission to merge or ship.

### Cost and limits

- **Fields:** 2–12 for patterns; a nonempty subset for chosen-input checks. At 12 fields, there are at most 4,096 binary signatures.
- **Pattern index:** at most `min(N, 2^K)` observed patterns. Cache one `Uint16` mask per source row for a fixed effective-value revision and field universe. Do not create a Cartesian product of absent patterns.
- **Work:** initial signature calculation `O(NK)`; recount the current base `O(|B|)` once IDs are available; pattern ordering `O(P log P)`; each displayed page `O(20K)`. Existing Crossfilter enumeration may itself scan source IDs, so this is not a claim that total application refresh cost is only `O(|B|)`.
- **Memory:** roughly 2 MB of mask payload per million rows, plus counts, existing rows/columns, and bookkeeping; this excludes object/runtime overhead. Do not keep duplicate source-ID arrays for every pattern and group. Materialize a complete ID set on trace/open, then render pages.
- **Records:** 50 displayed per trace page; all matching IDs remain accessible and feed counts. Never sample a selector or silently truncate the record set.
- **Group display:** at most eight named groups plus an explicit remainder. Group cardinality can exceed display cardinality; the counts still cover every row.
- **Resource budget:** propose an initial 12-million source-row/field-evaluation budget per rebuild. Preflight `sourceRowCount × fields.length` before column/signature evaluation. Above it, ask for a narrower query or fewer fields, propagate chart-unavailable to selected/eligible findings, shares, and trace, and retain any active predicate in a closed state. With no selector, other charts remain unrestricted. This is a tunable engineering guard, not a measured limit or a claim that every device can process the budget interactively.
- **Timing:** measure 10k, 100k, and 1m-row fixtures at 6 and 12 fields during implementation. If the target device cannot meet the agreed interaction budget, consider chunking/worker execution with the existing snapshot lifecycle; do not change semantics or add sampling as a hidden fallback.

## 7. Stable recommendations

| ID / disposition | Recommendation | Reason / destination |
|---|---|---|
| JM-D01 — **Build** | Registered Joint missingness chart with exact matrix-and-frequency rows | A saved chart supplies the necessary lifecycle; M1. |
| JM-D02 — **Build** | Binary effective missingness using existing readers | Matches current analytical values while retaining stage distinctions; M1. |
| JM-D03 — **Build** | Chart-owned semantic pattern union, never frozen member positions | Preserves exact meaning and re-evaluates current records; M1. |
| JM-D04 — **Build** | One owner-excluded base population with explicit local scope | Prevents mixed denominators and local-cohort leakage; M1. |
| JM-D05 — **Build** | Paged exact record trace with raw/effective explanations | Makes every result inspectable without an unbounded matrix; M1. |
| JM-D06 — **Build** | Strict JSON/DSL/Keep round trips and active-empty distinction | Prevents a saved selection from widening or disappearing; M1. |
| JM-D07 — **Build** | Existing count/share notebook findings and explicit Keep/Undo Keep | Solves the actual notebook-local persistence boundary; M1. |
| JM-D08 — **Build** | Schema-aware unavailable state and kept-predicate refresh tests | Distinguishes absent values from absent field definitions; M1. |
| JM-D09 — **Build** | Complete-for-fields and finite-number input readings | Shows consequences without equating presence with usability; M1 all-present, M2 subset/finite. |
| JM-D10 — **Build** | Bounded within-group comparison and exact group traces | Reveals subgroup concentration with honest denominators; M2. |
| JM-D11 — **Build** | Bounded rendering, exact full counts, visible display omissions | Controls cost without discarding records; M1/M2. |
| JM-D12 — **Build** | Docs, runnable examples, persistence and image proof with each milestone | Documentation and examples are feature scope under AGENTS; M1/M2. |
| JM-D13 — **Explore** | A selectable raw-input mode with an explicit raw-column API | Useful later, but not supported by the current effective-only predicate interface. |
| JM-D14 — **Defer** | Inclusive queries and arbitrary cross-group cell unions | Need distinct saved semantics; exact patterns already answer the core mission. |
| JM-D15 — **Defer** | Unbounded record matrices, clustering, and missingness correlation views | Add rendering and interpretation cost without replacing exact record evidence. |
| JM-D16 — **Avoid** | Mechanism diagnosis, imputation, quality grades, expected-record generation | Neither the data nor this mission supplies those contracts. |
| JM-D17 — **Avoid** | Independent missing-data engine, generic rules language, new UpSet dependency | Existing React/provider/filter/trace/notebook seams are sufficient. |
| JM-D18 — **Explore** | A named percentage-point finding | A bounded extension may be useful later; two live shares already tell the supported story. |

## 8. What was checked and what remains proposed

The executed [verification log](verification-results.txt) records **41 passing checks**. [verify-fixtures.mjs](verify-fixtures.mjs) loads temporary copies of the baseline `valueParsing.ts` and `fieldSettings.ts`; only their module import path is adapted for Node. It compares derived sets against hand-authored [expected-results.json](expected-results.json), checks conversion-preview distinctions, native undefined/nonfinite/zero/false cases, exact/inclusive memberships, empty selections, row reorder, source append, and the equal-marginals fixture.

This is not an explorEDA integration test. It did not execute a proposed chart, Crossfilter integration, JSON/DSL extensions, Keep action, folder app, browser workflow, or performance benchmark. Those proofs are explicitly assigned to Codex in the implementation plan. The static wireframe was rendered and visually checked for readable labels, correct counts, and unclipped panels; it is not evidence of interactive usability.

## 9. Main risks and decisions already made

1. **Saved notebook meaning:** a chart can look correct while text lacks the live selection. Resolve with explicit Keep and round-trip record assertions, not a screenshot alone.
2. **Population drift:** profile ownership, notebook locality, chart-local scope, and peer-chart filters differ. Use one `B`, and restrict notebook-section export to a reproducible scope.
3. **Empty versus unavailable:** an absent field definition must not become an all-missing cohort. Add the small schema check and finding status now.
4. **Refresh promises:** kept predicates re-evaluate; unkept exploration across arbitrary remount/replacement is outside this first design. Do not depend on an unbuilt keyed-selection system.
5. **Category text fidelity:** mixed typed group values may not survive current `where.` text lookup. Verify or disable that narrow export; preserve exact JSON/trace behavior.
6. **Dense datasets:** field and display bounds are contractual; performance thresholds remain to be measured. Exactness cannot be traded away silently.

No outside-demand gate, author study, or adoption test blocks starting M1. Browser and accessibility checks are implementation verification, not permission to design the feature.

## 10. Open questions for implementation review

These are nonblocking engineering decisions; the defaults above remain the recommendation:

- Whether measured costs on the owner’s target device justify a worker/chunked rebuild below the proposed 12-million-cell guard.
- Which existing export action should host Copy notebook section; enable it only for the proven scope/dependency subset.
- Whether future inclusive or raw-input modes merit a separate design after exact effective patterns ship.
- Whether a named rate-gap finding becomes useful enough to extend the existing restricted comparison model.
- Which concurrent changes Codex must reconcile after the fixed baseline. This report does not treat those later changes as already present.

## 11. Evidence references

### External primary sources, checked October 30, 2026

- **E01:** Lex et al., [UpSet: Visualization of Intersecting Sets](https://vdl.sci.utah.edu/publications/2014_infovis_upset/), [paper](https://sci.utah.edu/~vdl/papers/2014_infovis_upset.pdf), especially §3.1–3.2; [author-maintained concept site](https://upset.app/). Supports exclusive intersections, complement, matrix/bar encoding, and element-view linkage.
- **E02:** naniar, [`gg_miss_upset`](https://naniar.njtierney.com/reference/gg_miss_upset.html). Supports combination display and documented field/intersection limits.
- **E03:** naniar, [`bind_shadow`](https://naniar.njtierney.com/reference/bind_shadow.html). Supports keeping missingness indicators alongside original variables.
- **E04:** naniar, [`gg_miss_fct`](https://naniar.njtierney.com/reference/gg_miss_fct.html). Supports descriptive missingness comparison by a categorical factor.
- **E05:** missingno, [official README](https://github.com/ResidentMario/missingno#readme), sections matrix and heatmap. Supports record matrix/completeness display and omission of constant-nullity fields from its correlation heatmap.
- **E06:** VIM, [`aggr`](https://statistikat.github.io/VIM/reference/aggr.html). Supports counts/proportions of existing missing/nonmissing combinations and ordering.
- **E07:** VIM, [`matrixplot`](https://statistikat.github.io/VIM/reference/matrixplot.html). Supports individual-cell visualization and sorting as a different analytical surface.
- **E08:** OpenRefine, [Exploring facets](https://openrefine.org/docs/manual/facets). Supports linked matching-record facets and its documented persistence distinction.
- **E09:** Stef van Buuren, [Concepts in incomplete data, §2.2.3](https://stefvanbuuren.name/fimd/sec-idconcepts.html), and [MCAR, MAR, MNAR concepts](https://stefvanbuuren.name/fimd/sec-MCAR.html). Supports the limit on distinguishing MAR from MNAR from observed data alone. No mechanism inference is proposed.

### Repository evidence, all pinned to the baseline

Paths below are repository-relative. Each link is pinned to the stated commit; symbols identify the decisive contract.

- **R01 — Direction and historical scope:** [`docs/research/DIRECTION.md`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/research/DIRECTION.md); `docs/research/joint-missingness-2026-10-19/{README,decisions,evidence}.md`; `docs/research/missing-state-accounting-2026-10-21/{README,evidence}.md`; `docs/intent/selection-refresh/implementation-plan.md`.
- **R02 — Architecture/UI/history rules:** [`docs/agent-guide.md`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/docs/agent-guide.md), `docs/ui-defaults.md`, `CODING_STANDARDS.md`, `AGENTS.md`, and `README.md`.
- **R03 — Value semantics:** [`valueParsing.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/valueParsing.ts)::`isMissingValue`, `parseNumber`, `finiteNumber`; [`fieldSettings.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/fieldSettings.ts)::`convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`; `fieldProfiles.ts::missingRowCount`; `statisticsCalculator.ts::calculateValueStatistics`; corresponding packet tests.
- **R04 — Profile/picker ownership:** [`useFilteredFieldProfiles.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts)::`rowsFor`; `components/FieldList/FieldPicker.tsx`.
- **R05 — Predicate/population/provider:** [`CrossfilterWrapper.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/hooks/CrossfilterWrapper.ts)::`getFilterFunction`, `getAllData`, `getChartFilteredRowIds`; `chartPopulation.ts::getPopulationTest`; `charts/registry.ts`; [`DataLayerProvider.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/providers/DataLayerProvider.tsx)::`updateChart`, `updateFieldSettings`, `refreshCalculations`, prop-replacement effect; `rowIdFilters.ts::isRowIdFilter`; `providers/lib/carryRowSelections.ts`.
- **R06 — Records and trace:** [`ChartDataPreview.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/ChartDataPreview.tsx); `trace/ChartTraceScope.tsx::useTraceRevision`; `trace/traceTypes.ts`; `trace/traceRows.ts::traceRowIds`; `trace/ChartTracePanel.tsx::QueryRowsLink`; `ChartTraceDetails.tsx`; `BarChart/GroupedAggregateInspector.tsx` under `components/charts/`.
- **R07 — Findings:** [`lib/notebook/findings.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/findings.ts)::`evaluateFinding`, `compareFindings`, `comparisonProblem`, `evaluateNotebookFindings`; `components/notebook/NotebookFindings.tsx::useFindingResults`.
- **R08 — Notebook writeback:** [`ExplorEdaNotebook.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx)::`handleStateChange`, local provider, block view; [`writeBack.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/notebook/writeBack.ts)::`skippedKey`, `textPart`, `writeBackChart`, `writeBackSettings`.
- **R09 — Calculations/schema:** [`CalculationState.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/calculations/CalculationState.ts)::`executeCalculation`, `getErrors`, `traceRow`; `DataLayerProvider.tsx::getColumnData`, `assertUnusedCalculation`; `components/charts/chartAccessibility.ts::getChartFields`; `lib/declaredFieldTypes.ts`.
- **R10 — Folder lifecycle:** [`ProjectWorkspace.tsx`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/apps/app/src/ProjectWorkspace.tsx)::notebook `onTextChange`, `SaveStatus`; `apps/app/src/saver.ts::FolderSaver`; `apps/app/src/App.tsx::reload`; `apps/app/src/httpFiles.ts`; `lib/project/folder.ts::readProjectFolder`; `lib/notebook/readNotebook.ts::readNotebookText` under the package source.
- **R11 — Text and category fidelity:** [`dsl/compile.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/dsl/compile.ts)::`buildChart`, `resolveValueFields`, `buildFilter`; `dsl/settingKeys.ts::CHART_SETTING_KEYS`; `dsl/export.ts::headFor`, `exportParts`; `dsl/parse.ts::parseValue`; `dsl/paths.ts::setPath`, `diffPaths`; [`categories.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/categories.ts)::`categoryKey`, `categoryIncludes`; `hooks/applyFilter.ts`.
- **R12 — Heatmap:** [`Heatmap/definition.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/components/charts/Heatmap/definition.ts); `Heatmap/heatmapPlan.ts::HeatmapCellState`, `toggleCellFilters`; `charts/registerAllCharts.ts`.
- **R13 — Persistence/type boundaries:** [`saveDataUtils.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/utils/saveDataUtils.ts)::`isFilter`, `isBaseChart`, `isChart`, `validateSavedData`, `stringifySavedAnalysis`, `parseSavedAnalysis`; `types/ChartTypes.ts::ChartDefinition`, `BaseChartSettings`; `types/FilterTypes.ts`; `types/SavedDataStructure.ts`.
- **R14 — Row unit/provenance:** [`evaluateProject.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/packages/explorEDA/src/lib/analysis/evaluateProject.ts)::`sourceReferences`, `sourceFrame`, `lookupFrame`, `expandedFrame`, `aggregateFrame`, `tableRevision`; `types/AnalysisProject.ts::AnalysisResultRow`, `AnalysisStage`.
- **R15 — Docs/examples:** [`apps/demo/src/docs/gate.ts`](https://github.com/byronwall/explorEDA/blob/ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6/apps/demo/src/docs/gate.ts)::`findDocsErrors`; `apps/demo/src/demos/coverage.ts::coverageFeatures`, `exampleCoverage`; `apps/demo/src/demos/examples.ts::ExampleData`, `examples`; packet docs pages for fields, heatmap, dashboard text, notebooks.

## 12. Access status, files read, and handoff

**Access status:** sufficient. The prompt was read first; all 55 complete packet files were read at the exact baseline. No decisive source remains inaccessible. Additional exact-baseline reads resolved the implementation seams described above. No browser/product acceptance was performed.

### Complete packet inventory

```text
AGENTS.md
README.md
package.json
CODING_STANDARDS.md
docs/agent-guide.md
docs/ui-defaults.md
docs/research/DIRECTION.md
docs/intent/missingness-and-expected-records/intent-brief.md
docs/intent/research-ideas-100/ideas/R027-joint-missingness-triage.md
docs/intent/research-ideas-100/ideas/R028-expected-record-reconciliation.md
docs/research/joint-missingness-2026-10-19/README.md
docs/research/joint-missingness-2026-10-19/decisions.md
docs/research/joint-missingness-2026-10-19/evidence.md
docs/research/missing-state-accounting-2026-10-21/README.md
docs/research/missing-state-accounting-2026-10-21/evidence.md
docs/intent/selection-refresh/implementation-plan.md
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/lib/fieldProfiles.ts
packages/explorEDA/src/lib/fieldProfiles.test.ts
packages/explorEDA/src/lib/fieldSettings.ts
packages/explorEDA/src/lib/fieldSettings.test.ts
packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts
packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts
packages/explorEDA/src/providers/DataLayerProvider.tsx
packages/explorEDA/src/hooks/CrossfilterWrapper.ts
packages/explorEDA/src/hooks/applyFilter.ts
packages/explorEDA/src/lib/chartPopulation.ts
packages/explorEDA/src/lib/rowIdFilters.ts
packages/explorEDA/src/types/FilterTypes.ts
packages/explorEDA/src/types/ChartTypes.ts
packages/explorEDA/src/types/SavedDataStructure.ts
packages/explorEDA/src/utils/saveDataUtils.ts
packages/explorEDA/src/components/charts/Heatmap/definition.ts
packages/explorEDA/src/components/charts/Heatmap/heatmapPlan.ts
packages/explorEDA/src/charts/registerAllCharts.ts
packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx
packages/explorEDA/src/components/charts/trace/traceTypes.ts
packages/explorEDA/src/components/charts/trace/traceRows.ts
packages/explorEDA/src/components/FieldList/FieldPicker.tsx
packages/explorEDA/src/lib/notebook/findings.ts
packages/explorEDA/src/components/notebook/NotebookFindings.tsx
packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
packages/explorEDA/src/lib/notebook/writeBack.ts
packages/explorEDA/src/lib/dsl/settingKeys.ts
packages/explorEDA/src/lib/dsl/compile.ts
packages/explorEDA/src/lib/dsl/export.ts
packages/explorEDA/src/types/AnalysisProject.ts
packages/explorEDA/src/lib/analysis/evaluateProject.ts
apps/demo/src/docs/pages/fields.mdx
apps/demo/src/docs/pages/heatmap.mdx
apps/demo/src/docs/pages/notebooks.mdx
apps/demo/src/docs/pages/dashboard-text.mdx
apps/demo/src/docs/gate.ts
apps/demo/src/demos/coverage.ts
apps/demo/src/demos/examples.ts
```

### Adjacent source consulted at the same commit

```text
packages/explorEDA/src/charts/registry.ts
packages/explorEDA/src/components/charts/chartAccessibility.ts
packages/explorEDA/src/providers/lib/dataLayerState.ts
packages/explorEDA/src/providers/lib/carryRowSelections.ts
packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx
packages/explorEDA/src/components/charts/trace/TraceBodies.tsx
packages/explorEDA/src/components/charts/ChartTraceDetails.tsx
packages/explorEDA/src/components/charts/Heatmap/HeatmapTraceBody.tsx
packages/explorEDA/src/components/ActiveFilterStatus.tsx
packages/explorEDA/src/components/ChartDataPreview.tsx
packages/explorEDA/src/components/charts/ChartTraceControl.tsx
packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx
packages/explorEDA/src/lib/calculations/CalculationState.ts
packages/explorEDA/src/lib/dsl/paths.ts
packages/explorEDA/src/lib/dsl/parse.ts
packages/explorEDA/src/lib/declaredFieldTypes.ts
packages/explorEDA/src/lib/categories.ts
apps/app/src/ProjectWorkspace.tsx
apps/app/src/App.tsx
apps/app/src/saver.ts
apps/app/src/httpFiles.ts
packages/explorEDA/src/lib/project/analysisText.ts
packages/explorEDA/src/lib/project/folder.ts
packages/explorEDA/src/lib/project/writeFolder.ts
packages/explorEDA/src/lib/notebook/readNotebook.ts
```

**Checked:** baseline source contracts, primary documentation/paper claims, exact fixture arithmetic, baseline pure helper behavior, and static wireframe readability. **Proposed:** every new feature, integration, persistence extension, browser acceptance case, and performance target. Codex owns implementation and reconciliation with subsequent code changes.

**Deliverables:** [implementation plan](joint-missingness-implementation-plan.md), [fixture data](fixture-data.json), [expected results](expected-results.json), [verification program](verify-fixtures.mjs), [executed log](verification-results.txt), [notebook specification](joint-missingness-notebook-example.md), [wireframe PNG](joint-missingness-wireframe.png), and [wireframe SVG](joint-missingness-wireframe.svg).

**Open questions:** the limited implementation choices in §10 remain; none blocks the first exact-pattern, record, and kept-notebook proof.
