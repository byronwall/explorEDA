# Joint missingness and analytical eligibility: product decision

**Decision date:** 2026-10-19  
**Repository:** https://github.com/byronwall/explorEDA  
**Authoritative source baseline:** `9b16d78e3ed0742ed4d5858c1939fec9e758b510` on main, as identified by the supplied packet  
**Integration owner:** Codex, using the preparation branch `codex/missingness-research-2026-10-19`  
**Status:** Research complete; recommendations are proposals, not implementation approval.

## 1. Decision

**Prefer one small bundle of improvements to existing field and chart explanations, paired with a runnable documentation recipe. Defer a new joint-missingness diagnostic.** First observe whether the existing controls plus the recipe leave a concrete interpretation or record-inspection failure. If they do not, stop at documentation; no feature work is warranted.

The proposed bundle has three connected parts:

- Explain the relationship among raw values, conversion-preview outcomes, effective values, and finite numeric contributors in existing field inspection.
- Explain each chart's input population, eligibility predicate, and selected subset using its existing counters and trace entry points. Preserve the distinction between pairwise scatter/matrix contributors and complete parallel-coordinate lines.
- Teach a three-field example, including a serious upstream-indicator comparator, in the same milestone as any visible change. Do not introduce a chart type, saved API, independent parsing implementation, dependency, service, or data-cleaning workflow.

These are recommendations **JM-02, JM-03, and JM-04**, under the contract-preservation rule **JM-01**. A small exact-pattern frequency table is the most promising *deferred* joint representation (**JM-05**), but its incremental value remains unproven. The proposal is deliberately rejectable by the author comparison in [proof-plan.md](proof-plan.md).

### What the evidence establishes

The supplied code already has substantial missing-value support: field missing counts and missing-only filtering, conversion previews with separate failed counts, finite-pair scatter summaries, per-cell matrix counts, and parallel-coordinate omission accounting. A product decision must start from these delivered mechanisms, not from an older future-intent description. [R03–R12]

The ten-record arithmetic fixture establishes a real information difference. In cohorts A and B, every one of X, Y, and Z has exactly **one missing value among four records**. A has **one complete XYZ record and two eligible records per pair**; B has **three complete XYZ records and three per pair**. Marginal counts cannot recover that distinction. Across all ten records, each pair has five finite contributors and XYZ has four complete records. These are independently computed semantic expectations, not observed product results or demand evidence. [proof-plan.md, Sections 2–7]

The source also exposes explanation opportunities without a new view. A no-conversion preview can call present bad text or a blank value “valid,” while numeric statistics exclude it. Explicit numeric conversion turns failures into effective undefined values, so an effective missing count combines several causes. Scatter's `missingX` and `missingY` partition exclusions sequentially; they are not two independent missing rates. [R03–R06, R09]

**Confidence:** High in these source-level distinctions and the enumerated arithmetic; moderate in the explanation-first direction; low in demand, achievable author-time savings, and the value of a new diagnostic. None of those latter quantities was measured.

## 2. Access gate, provenance, and limits

**Access: GO for this scoped research decision.** The packet identifies the requested repository and baseline and includes the required parsing, profiles, field controls, eligibility planners, filters, documentation, prior intent, and continuing queue. All 39 delimited entries were inventoried: **37 baseline files plus two local research additions**. The supplied attachment is text, not an installed or runnable checkout.

- The uploaded controlling `pro-prompt(8).md` was read in full. Its content agrees with the packet's local prompt apart from one trailing blank line.
- The authoritative packet was read from the supplied scratch copy. Its SHA-256 is `cffd94b5eee4bbe11c81caa4e1725c070948afabdaaaec7557dc64ac79eb67ba`; size is 403,190 bytes. This identifies the attachment used, not an independent verification of the Git commit.
- The extraction inventory covers every delimited file. Full versus targeted reading is listed in Appendix A. Originals were preserved.
- Two optional exact-baseline raw GitHub retrievals for `registerAllCharts.ts` and `providers/DataLayerProvider.tsx` returned `DisabledError`. They supplied no source evidence. No later repository source was used, so there are no later-source differences to merge into the baseline analysis.
- The packet does not include registry implementation, provider/CrossfilterWrapper implementation, chart snapshot builders, most renderers, or complete trace implementations. This report therefore makes **no repository-wide absence claim** about an undiscovered joint view and **no end-to-end wiring claim**. The older intent's registry statement is intent evidence, not a fresh registry audit.

Repository tests, type checking, the demo, docs validation, layout/accessibility checks, package behavior, performance, export/restore, and an author task **were not run**. The independent fixture calculation does not remove those limits. The packet suffices to compare product directions; missing caller/trace evidence remains a prerequisite to implementation, not a reason to invent the wiring.

The supplied queue records preparation research in PR 451, freshness research in PR 452, and time-series ownership in PR 454. Their current public PR state was not independently checked. Those ownership notes are preserved as supplied, and none of their proposals is treated as shipped merely because a research cycle completed. [R02, R15]

### Evidence labels used throughout

| Label | Meaning |
| --- | --- |
| Repository fact | Behavior directly visible in the supplied source, tests, or documentation. A test assertion is not a test pass. |
| External fact | A behavior or limitation supported by current primary documentation or an original research source, retrieved 2026-10-19. |
| Inference | Product reasoning from those facts, including candidate tasks and qualitative option scores. |
| Proposal | Work that could be implemented or observed later. No proposed UI or repository proof is reported as executed. |
| Executed arithmetic | Set/count checks over an explicit, source-derived classification oracle; no application parser or component was executed. |

## 3. Three bounded candidate tasks

These tasks are plausible for the stated scientific/engineering direction. No interviewed customer, recurring demand, or observed author failure has been established. A synthetic task can expose a semantic failure; it cannot prove that a product surface should exist. [R02]

### T1 — Choose a defensible comparison in unfamiliar scientific measurements

**User and row meaning.** A laboratory or environmental analyst opens one imported table. Each existing row is a keyed specimen measurement event, not a field and not an expected sampling slot. X, Y, and Z are three compatible numeric measurements whose units and scientific meaning are supplied by the author.

**Decision.** Can a three-measurement profile represent the same recorded events as an X–Y comparison, or does it describe a materially narrower set? Which actual records account for the difference? The analyst may retain a broader pairwise analysis, report a narrower complete-case analysis, or ask the data owner about the excluded events. The tool should not choose a deletion or imputation policy.

**Exact population and rules.** Start with every loaded keyed record, then name a peer cohort filter. For this proof, A is `{r01,r02,r03,r04}` and B is `{r05,r06,r07,r08}`. A value contributes to a numeric comparison only if the existing `finiteNumber` returns a number. A pair needs its two values; a profile needs all retained numeric axes. Zero is valid. An event with an omitted cell remains an existing event. No unrecorded specimen is inferred. [R03, R09–R11]

**Current steps, source-grounded rather than operated:**

1. Open Fields/Summary to inspect each field and its filtered missing count.
2. Confirm any type override and null-token settings in FieldInspector before selecting numeric axes.
3. Compare the scatter or matrix pair with parallel coordinates over X/Y/Z.
4. Use the documented mark/header trace and Rows workflow to inspect included records; use missing-only filters or prepared indicator columns to locate the remainder. Exact omitted-row access through the actual trace consumers remains to be verified. [R06–R12]

**Remaining friction.** Equal marginals can conceal whether missing cells coincide. Current matrix cells answer pairwise questions, while complete lines answer a different question. Repeating missing-only filters does not automatically produce every exclusive pattern or a stable-key membership table. Existing filter types do not expose a dedicated arbitrary joint-pattern or conversion-failure predicate. [R07, R09–R11]

**Value a joint view could add.** Exact combination counts with affected keys could explain why A retains one XYZ row and B retains three. A row matrix is useful only if row order itself answers a question, such as an explicitly supplied run sequence. Here, a small frequency table is easier to reconcile than thousands of colored cells. This is an inference, not a usability finding.

### T2 — Decide how to read one mixed-type imported field

**User and row meaning.** A host author imports a local measurement file. Each row is an existing source record with an `id`. One column contains numeric text, nulls, whitespace, a declared `NA` sentinel, Boolean false, or bad numeric text.

**Decision.** Should X be explicitly read as numeric with `NA` as a configured null token, and which preview outcomes will that create? This is a conversion decision, not a discovery of which measurements should have existed.

**Exact population and rules.** The proposed author task supplies the full ten-row raw input; the executed arithmetic checker classifies its expected preview outcomes. Actual source/UI preview-scope wiring must be checked separately. Set numeric type and `nullTokens: ["NA"]` on X. `convertFieldValue` matches tokens exactly against trimmed text, excludes blank text for noncategorical targets, rejects nonfinite numeric conversion, and preserves the raw rows in its input by creating effective copies through `applyFieldSettings`. A separate Boolean `flag=false` remains valid under Boolean conversion. [R03–R04]

**Current steps:** inspect the inferred/effective type, choose the override and tokens, read valid/missing/failed counts, compare the first eight raw/runtime examples, expand the failures list when necessary, then apply the explicit setting. The current component already supplies these controls and explanations. It initially displays twelve failures and can show all retained failures. [R04, R06]

**Case adequately solved today.** The narrow question “what will this one explicit conversion do?” is adequately supported by the current preview contract. For X it should show **6 valid, 3 missing, 1 failed**, with r09's false causing the failure. A joint diagnostic does not improve that basic decision. This is a source-supported adequacy judgment, not an observed successful user session.

**Remaining friction.** With no conversion, the preview's **8 valid / 2 missing / 0 failed** means non-nullish values retained, not eight finite numeric contributors. After conversion, effective X has four missing values because its failure also becomes undefined. Failure entries use row ordinals; the supplied component does not provide a stable-key trace action on those entries. Scope and provenance copy, plus a verified existing Rows route, address this more directly than a binary joint view. [R04–R06]

### T3 — Explain why a linked multivariate view uses fewer rows

**User and row meaning.** An analyst builds linked views over keyed experimental events. A peer cohort selection and a local chart brush are both active. Loaded rows, rows passing filters, rows eligible for a plot, selected rows, and drawn marks can differ.

**Decision.** Does a displayed count refer to all recorded events in the named cohort, finite X–Y pairs, complete XYZ lines, or the current selection? Where are the excluded keys, and can they be inspected without clearing unrelated context?

**Exact population and rules.** After conversion, loaded L contains r01–r10. Peer `cohort=A` produces P=`{r01,r02,r03,r04}`. XY eligibility is `{r01,r04}`; XYZ completeness is `{r01}`. Add the chart's own X range 0 through 1: the global all-filter set is `{r01}`. The proposed exclusion inspection still uses P, so XY-excluded keys `{r02,r03}` remain findable. [R03, R07, R09–R11; proof-plan.md]

**Current steps:** name the active peer/workspace filter, inspect the chart count and its trace, compare Fields/Rows, and inspect or clear the chart's own brush. Existing docs distinguish linked and local filters and describe dimmed unselected marks. The source supplies different owner-aware profile populations, matrix selection counts, and parallel complete-line counts. [R07–R12]

**Remaining friction.** Computing a missingness summary from globally filtered rows after the brush would show one complete row and no exclusions; it would conceal the rows that explain the drop. A chart's own X-field distribution may instead retain four peer rows while its Y-field profile describes the globally filtered row. A single unlabeled denominator or generic “selected rows” label cannot describe all of those surfaces accurately. [R07, R10–R11]

**Best first response.** Explain and preserve the existing scope distinction at the point where the analyst reads a count. Verify that a reason bucket's inspection route resolves keys from its named pre-eligibility population. A separate diagnostic would inherit exactly the same scope problem and would not solve it by its presence alone.

## 4. Semantics that must remain distinct

### 4.1 Values and conversion outcomes

| Condition | Supplied baseline behavior | Consequence for the decision |
| --- | --- | --- |
| Raw absence: null or absent/undefined property | `isMissingValue` is true. Conversion returns undefined without an error. | Existing row, absent cell; no claim about a missing record. |
| Blank or whitespace-only text | Shared missing predicate is true. Numeric statistics count it as missing. Noncategorical conversion makes it undefined without failure. | Do not silently replace blank handling with another parser. |
| Blank in a nonnumeric profile | `calculateValueStatistics` uses nullish-only missing counts for nonnumeric types; blank remains a category. | Baseline discrepancy with missing-only filtering must be reproduced and resolved explicitly. |
| Configured token, such as `NA` | Before configuration it is present text. `convertFieldValue` checks a case-sensitive exact token against trimmed text or `String(raw)`. | Configuration and representation must accompany the count. `na` is not automatically `NA`. |
| Failed conversion | Numeric false or bad text returns undefined with an error. Preview retains the failure reason and raw value. | Effective undefined alone cannot recover whether a conversion failed. |
| Nonfinite number or text | `parseNumber` can return a nonfinite number; `finiteNumber` excludes it. Numeric conversion reports a failure. | “Present” is not “finite”; do not show NaN/Infinity as valid measurements. |
| Numeric zero | Finite numeric input; accepted under the fixture's `NA` policy. | Keep zero in pairs, profiles, and range filters that include it. |
| Boolean false | A valid Boolean under `parseBoolean`; rejected as a numeric measurement. | Value validity depends on the requested analysis. Do not use truthiness for missingness. |
| Display format only | `applyFieldSettings` skips conversion unless type, date preset, or nonempty tokens request it. | Formatting is not a second conversion pipeline. |
| Chart-specific exclusion | A missing position, absent retained axis value, scale restriction, or clipping can affect different outputs. | Distinguish analytical contributors from marks visible in the current viewport. |

These are source observations at R03–R07 and R09–R11. `numericExclusionReason` additionally distinguishes an empty string's “Missing value” wording from whitespace's “Blank value” wording. A semantic explanation should name the actual predicate rather than promise every surface already has identical labels.

A configured token could deliberately be `0` or `false`, because conversion compares `String(raw)` for nonstrings. The proof intentionally uses only `NA`; it does not redefine a user-selected token policy to protect values that the user has explicitly chosen as tokens. [R04]

### 4.2 Four analytical summaries

For an explicitly named population P and ordered field set F:

- **Marginal missing count:** the number of records missing field j under the stated representation and predicate. It says nothing about whether the same records are missing another field.
- **Exact joint pattern:** one mutually exclusive vector over F for each record. With `1 = unavailable`, `100` means only X unavailable among X/Y/Z; it does not include `110` or `111`. Every record belongs to exactly one pattern, including `000`.
- **Pairwise eligibility:** records for which the two named fields satisfy that chart's value predicate. Different pairs can contain different keys even when their counts agree.
- **Complete-case eligibility:** records satisfying the predicate on every retained analytical dimension. The dimension set is part of the result; adding or removing a dimension changes the question.

In this fixture, raw shared-missing patterns and finite-unavailability patterns differ. After explicit numeric conversion they coincide for X/Y/Z, but that is a property of this configuration, not a universal equivalence. A future view must not switch between raw missingness and numeric usability under one unchanged legend. [R03–R04; proof-plan.md]

### 4.3 Descriptive limits

A missingness display describes recorded values and their associations. **MCAR** means missing completely at random: the missingness probability is independent of observed and unobserved values. **MAR** means missing at random conditional on observed information: missingness may depend on observed values but not further on the unseen values. **MNAR** means missing not at random: dependence on unobserved values remains. These are assumptions about a data-generating process, not labels that can be read from a stripe or an intersection bar. A general visual examination of observed data cannot establish MAR versus MNAR or determine an inferential bias mechanism. [E12–E13]

A pattern can motivate a question to the data owner about collection, applicability, protocol, or conversion. It cannot establish that a record is erroneous or that complete-case analysis is unbiased. No mechanism tests, causal diagnosis, imputation, quality grading, or automatic cleaning are needed for this product decision. If the requested value depends on them, this mission should be NO-GO rather than expanded.

## 5. Current workflow and population accounting

### 5.1 Source behavior to preserve

| Surface | Observed behavior | Important limit |
| --- | --- | --- |
| Fields / numeric Summary | `nullCount` covers shared missing values; `excludedCount` covers present but nonfinite/unparseable numeric values. `FieldRowReadings` exposes missing counts but does not render `excludedCount`. | Raw distinct-value counts are not distinct finite-measurement counts. Empty profiles omit statistics. [R05–R06] |
| FieldInspector | Type and conversion controls; valid/missing/failed counts; raw/runtime examples and expandable failures. | No-conversion “valid” is nullish-only. Provider preview population and actual filter-clearing behavior were not executed. [R04, R06] |
| Workspace filter editor | Uses a distribution profile that excludes the currently edited field's workspace filter; the editor also receives a separately resolved source profile. | The shared ColumnFilter consumer and CrossfilterWrapper implementation are absent. [R07–R08] |
| Scatter paired summary | Loops supplied group IDs; uses `finiteNumber` on both fields; `eligible = missingX + missingY + pairs`. | Missing X is tested first. Missing Y counts only rows with usable X. Drawing and scale restrictions are separate. [R09] |
| Scatter matrix | Numeric cell n is pairwise; diagonal n is the field's valid count. Selection is computed separately over live IDs. | `selectedCount` can include rows ineligible in a particular cell. Categorical/date handling differs from the numeric fixture. [R10] |
| Parallel coordinates | Complete lines require a usable position on every retained axis. `omittedIds` is the union of excluded live rows; per-axis missing counts can overlap. | Numeric all-ineligible axes remain retained; categorical axes exceeding 40 categories can be rejected. `selectedCount` counts complete lines only. [R11] |

The matrix's continuous Pearson calculation requires three pairs; scatter spread/correlation logic begins at two pairs, with further constant-field restrictions. This is another baseline difference to explain or investigate, not silently harmonize during a missingness change. A two-record pair can be eligible even when a statistic is unavailable. [R09–R10]

### 5.2 Inspection base

The proposed explanation should distinguish five populations without creating a named-baseline feature:

1. **Loaded records:** the current source table, with a known key and representation.
2. **Inspection base:** records passing named peer filters and any applicable local restrictions, before the chart's own selection and before analytical exclusion.
3. **Eligible records:** those in the inspection base satisfying the named chart/dimension predicate.
4. **Selected records:** the subset passing the chart's own filters; state whether this count includes analytically ineligible rows.
5. **Drawn marks:** what can be rendered after scale/domain/viewport rules, which is not necessarily a record count.

This vocabulary is proposed; existing property names are not to be renamed across the repository without need. In particular, `PairedStats.eligible` means the input group size, not the count of finite pairs. The matrix and parallel plans attach different meanings to `selectedCount`. [R09–R11]

`useFilteredFieldProfiles(own)` is field-specific. For a field filtered by that owner, it starts from the owner's live base, excludes that field's own filter, and reapplies the owner's filters on other fields. Other fields describe globally passing rows. Workspace editing has a corresponding one-field exception. Do not promise one peer-only denominator for every displayed field. [R07]

An exclusion inspection must resolve its members from the stated inspection base. Rebuilding it from the currently selected marks would lose r02 and r03 in T3. Proposed keyboard and trace checks must prove that exclusion membership is preserved without unexpectedly clearing peers, changing conversion settings, or adding a new population-baseline object. See [proof-plan.md](proof-plan.md).

## 6. Product options and explicit scoring

These scores are local design judgments, not customer ratings or benchmarks. They assume three numeric fields, ordinary local data, existing React/TypeScript controls, and reuse of existing trace contracts where verified. They do not assume a universal row limit or claim performance.

### Task coverage: 0 = does not answer; 1 = partial/manual; 2 = direct answer

| Option | T1: unfamiliar measurements | T2: conversion decision | T3: linked eligibility |
| --- | ---: | ---: | ---: |
| No change | 1 | 2 | 1 |
| Docs and upstream indicators | 2 | 2 | 1 |
| Row-by-field matrix | 2 | 0 | 1 |
| Exact pattern-frequency / small UpSet-style table | 2 | 1 | 1 |
| Field-inspector explanations alone | 1 | 2 | 1 |
| Chart-eligibility explanations alone | 1 | 1 | 2 |
| Proposed combined explanations + recipe | 2 | 2 | 2 |

The combined bundle's coverage assumes its recipe can answer T1 and its existing trace route can answer T3. Those are precisely the unrun rejection gates. A new pattern display gets only partial T3 coverage because population ownership and exclusion access still require separate work.

### Interpretation, effort, traceability, and cost

I = interpretability and R = row traceability, each 1 weak to 5 strong. A = author effort, C = implementation cost, P = proof/maintenance cost, each 1 low to 5 high. C/P are relative judgments over this bounded task, not time estimates.

| Option | I | A | R | C | P |
| --- | ---: | ---: | ---: | ---: | ---: |
| No change | 2 | 4 | 3 | 1 | 2 |
| Docs / upstream indicators | 3 | 4 | 4 | 1 | 2 |
| Row matrix | 3 | 2 | 3 | 5 | 5 |
| Exact pattern table | 4 | 2 | 4 | 4 | 5 |
| Field explanations alone | 4 | 2 | 3 | 2 | 3 |
| Chart explanations alone | 4 | 2 | 4 | 2 | 3 |
| Combined explanations + recipe | 4 | 3 | 4 | 3 | 4 |

There is no weighted total: implementation/proof cost cannot be traded for correct row membership. The matrix's R=3 assumes a row mapping that still needs implementation; a purely colored raster would score lower. The pattern table's R=4 assumes membership inspection, not counts alone. The recipe has more author effort because indicators must preserve semantics and be recomputed when preparation or conversion policy changes.

**Choice rationale.** The combined proposal covers three distinct explanation failures using current machinery, whereas a new joint view is most directly useful only for T1. Documentation alone is a credible cheaper winner if the author already finds the existing counts and records understandable. If ordered missing runs are the real task, a row matrix could beat a frequency table; that task has not been established. If only pairwise N matters, existing matrix/scatter explanations could be sufficient without any joint pattern surface.

## 7. What six primary-source comparators teach

**Method:** Documentation, maintained source where noted, and original research pages were read. No compared tool UI was operated, no data was uploaded, and no package or benchmark was run. Retrieval date for every row is **2026-10-19**. The lesson column is inference.

| Tool / system | Exact documented behavior and limit | Transferable lesson |
| --- | --- | --- |
| **missingno** [E01] | Its matrix shows row/field nullity with a row-completeness sparkline. The README gives about 50 labeled variables as guidance. Its nullity-correlation heatmap removes always-full and always-empty fields. | Row order can help a sequence question. Preserve all-ineligible fields explicitly. Correlation of masks does not answer exact membership or justify automatic error labels. |
| **naniar** [E02–E03] | `gg_miss_upset` documents five sets and 40 intersections by default, ordered by frequency. `bind_shadow` appends `_NA` indicators; `only_miss` can restrict them to variables with missingness. | A selected-field pattern display needs visible scope and omission rules. Upstream indicators are a substantive comparator. These docs do not establish linked record inspection or compatible conversion rules. |
| **VIM** [E04–E05] | `aggr` returns combinations, counts, percentages and an indicator matrix. If `only.miss` suppresses the complete-case bar, its number remains. `scattMiss` adds observed-coordinate lines for missing values in a two-field plot, with limited margin-click interaction. | Exact counts can be the core result, and exclusion context can accompany an existing scatter. Preserve complete cases. No general cross-chart trace guarantee follows from the documented interaction. |
| **DataExplorer** [E06] | `plot_missing` profiles fields, optionally hides complete fields, and can convert to Plotly. Default bands are Good 5%, OK 40%, Bad 80%, Remove 100% upper bounds. | Marginal profiling is a small alternative. Refuse those automatic quality/removal labels here; proportions lack the domain policy needed to justify them. Optional Plotly is not evidence of record-linked filtering. |
| **Interactive UpSet / UpSet 2** [E07–E09] | The original system couples intersection queries with an element/attribute view. The current concept guide explains exclusive intersections, including none-of-the-sets, and suggests pairwise co-occurrence views for pairwise-only tasks. UpSet 2 documentation separately lists upload/download and provenance. | Copy the requirement for membership inspection, not the whole tool. Counts abstract individual rows. Original research behavior and current project documentation are distinct evidence; neither proves explorEDA demand. |
| **Orange** [E10–E11] | Select Rows combines conditions with AND and provides matching, nonmatching, and annotated full-data outputs. Column Statistics supplies field summaries and selected-feature/statistics outputs. The reviewed pages do not establish an exact missingness-pattern diagnostic. | Make the excluded side reachable beside the selected side. Existing summaries and rule-based subsets can support useful inspection without a dedicated pattern view. Do not infer undocumented null predicates or keyboard behavior. |

### Primary-source register

All entries below were retrieved **2026-10-19**. URLs refer to primary authors/maintainers. Publication dates and version labels, where present, are separated from the access date. None is an operated UI result.

| ID | Source and supported claim | Known limit |
| --- | --- | --- |
| E01 | [missingno README](https://github.com/ResidentMario/missingno), `matrix` and `heatmap` sections: row matrix, sparkline, label guidance, constant-nullity omission. | Moving repository documentation; no measured scaling here. Its suggested error interpretation is not adopted. |
| E02 | [naniar `gg_miss_upset`](https://naniar.njtierney.com/reference/gg_miss_upset.html): defaults and frequency ordering. | Site identifies a development build; defaults are not proposed product limits. |
| E03 | [naniar `bind_shadow`](https://naniar.njtierney.com/reference/bind_shadow.html): appended indicator columns and `only_miss`. | Does not prescribe explorEDA's raw/effective semantics. |
| E04 | [VIM `aggr`](https://statistikat.github.io/VIM/reference/aggr.html), Value/Details/`only.miss`: exact combination outputs and complete-case number. | R documentation; imputation features are excluded from this decision. |
| E05 | [VIM `scattMiss`](https://statistikat.github.io/VIM/reference/scattMiss.html), Details: observed-coordinate missingness marks and margin-click behavior. | Pairwise graphic; no claimed shared filters or exported row identity. |
| E06 | [DataExplorer `plot_missing`](https://boxuancui.github.io/DataExplorer/reference/plot_missing.html): marginal profile, default bands, optional Plotly. | Bands are package defaults, not scientific thresholds or a recommendation. |
| E07 | [Lex et al., UpSet: Visualization of Intersecting Sets](https://vdl.sci.utah.edu/publications/2014_infovis_upset/), 2014, [DOI](https://doi.org/10.1109/TVCG.2014.2346248): linked intersections and elements. | Original research system, not an observation of current UpSet 2. |
| E08 | [UpSet concept guide](https://upset.app/), updated 2026-04-29: exact/none intersections, count abstraction and pairwise alternative. | Design guidance; no performance or universal usability inference. |
| E09 | [UpSet project page](https://upset.app/upset/), updated 2026-04-29: separates original system and UpSet 2. | Use as a library and automatic captioning are marked work in progress; no integration proposed. |
| E10 | [Orange Select Rows](https://orangedatamining.com/widget-catalog/transform/selectrows/): AND rules and matching/nonmatching/annotated outputs. | Reviewed page does not define every missing-value operator. |
| E11 | [Orange Column Statistics](https://orangedatamining.com/widget-catalog/data/featurestatistics/): field summaries and output tables. | Page does not establish joint missingness analysis. |
| E12 | [van Buuren, Flexible Imputation of Missing Data, Section 1.2](https://stefvanbuuren.name/fimd/sec-MCAR.html): missingness-mechanism definitions. | Authored methodological text; not a diagnosis of this fixture. |
| E13 | [van Buuren, Section 2.2.4](https://stefvanbuuren.name/fimd/sec-idconcepts.html): observed-data limits on MAR/MNAR distinction. | General observed-data limitation; additional substantive assumptions are not supplied here. |

An optional publisher PDF retrieval for Seaman et al. returned a wrapper, and an arXiv HTML attempt failed; no decisive claim relies on those results. An outdated Orange `/data/selectrows/` path returned 404; the current `/transform/selectrows/` page above was successfully read. Failed retrievals were not treated as capability evidence.

## 8. Recommended boundary and alternatives

### One conditional bundle, one milestone

The single proposed milestone **M1** is specified in [proof-plan.md](proof-plan.md), with actual source producers/consumers distinguished, matching docs sections, and a runnable example in the same milestone. No feature work is authorized by this report.

- Reuse current parsing, conversion, filter ownership, profile and trace contracts. Keep raw cause information separate from effective values.
- Prefer visible, compact explanations of existing numbers. No new Inspect button on a chart; use the documented trace/header and Alt-Enter/Alt-click conventions. Keep names, active fields, scope, and focus clear. [R01, R06, R12]
- Source the displayed count from the same population used by its underlying calculation. Do not infer finite pairs from a global selected count or from two marginal rates.
- Restrict the runnable example to the ten keyed records, three numeric analytical fields, one Boolean, one peer cohort, and an all-ineligible probe. Include raw and effective status and a compact, ordinary indicator-column comparator. No generated corpus or additional dataset acquisition is needed.
- Implement only a demonstrated explanation or access failure. If changing filter representations or saved state is necessary, stop and review scope; do not smuggle an arbitrary joint-predicate API into a wording change.

### If a joint view later earns consideration

Prefer **an exact pattern-frequency table for two to six explicitly selected numeric fields**, with all observed combinations, named unavailable-value semantics, N and share, source keys, and an explicit all-eligible group. Six binary fields permit at most 64 patterns; this is a proposed complexity bound, not a measured performance guarantee. Do not truncate rare groups silently. Show raw absence/conversion causes separately from numeric unavailability, not as unexplained extra mask colors.

A row-by-field matrix remains deferred for a task requiring meaningful record order. A full UpSet query system, correlation heatmap, clustering/dendrogram, automatic field ranking, arbitrary Boolean predicate builder, or dashboard redesign is outside the recommendation. The numeric-only candidate is not an implementation milestone in this packet.

### Serious alternatives

- **Do nothing:** defensible if no recurring task exists and current controls answer the observed questions. It keeps ongoing maintenance lowest while leaving the documented ambiguities to local investigation.
- **Docs/recipe only:** preferred fallback if a short explanation and upstream flags let the author name counts and retrieve keys correctly. Indicator preparation must state its value policy and be recomputed when that policy changes.
- **Field explanation only:** sufficient for the narrow conversion decision in T2; no joint display needed.
- **Chart explanation only:** sufficient if the observed confusion is exclusively pairwise versus complete-case denominators or ownership of filters.
- **New bounded diagnostic:** justified only by a demonstrated repeated joint-pattern task that defeats those smaller alternatives, with exact membership and accessible inspection preserved.

## 9. Risks, contrary evidence, and NO-GO conditions

### Evidence against building more

1. T2 is already substantially solved by the conversion inspector. Treating that surface as absent would overstate the gap. [R06]
2. The matrix already shows multiple field pairs, and parallel already accounts for omitted rows. Much of the proposed value may be explanation and discoverability. [R10–R11]
3. Upstream indicators can encode an exact pattern using ordinary fields. Existing selected datasets already include coverage-oriented workflows; neither a new dataset survey nor a new preparation platform is needed. Prior Beijing B1/B5 and earthquake E5 are repository proposals/examples, not fresh data or author demand. [R13–R14, E03]
4. Pattern-frequency views lose row order; row matrices make exact combination counts harder to reconcile. A visual preference cannot substitute for a named question. [E01, E07–E08; inference]
5. A new diagnostic has the same raw/effective and linked-filter ambiguity as existing views. Adding one before resolving the underlying reading task may create another apparently inconsistent number.

### Baseline inconsistencies to investigate, not silently repair

- Nonnumeric blank counts versus missing-only filtering. [R05, R07]
- Preview “valid” with no conversion versus finite contributors; effective missing after conversion versus preview missing. [R04–R06]
- Different `selectedCount` populations in matrix and parallel; different minimum pair counts for correlation. [R09–R11]
- `emptyFieldProfile` omits statistics and does not explicitly preserve an `excludedCount=0` field. Empty data should not be confused with ten wholly unusable values. [R05]
- No retained parallel axes produces empty-coordinate line records at the planner level; higher-level suppression is unknown. Do not label that corner as meaningful 100% completeness. [R11]
- Tooltip guidance differs between CODING_STANDARDS and UI defaults on focus-triggered tooltips. This report does not resolve that policy conflict by changing behavior; use visible accessible names and verify the actual existing controls. [R01]

### Rejection conditions

**NO-GO for implementation** if the exact source/trace callers cannot establish a consistent named population and stable-key inspection without new infrastructure; if a purported improvement changes numeric/filter semantics; or if the local author comparator shows no interpretation or effort gap beyond docs.

**NO-GO for a new diagnostic** if no recurring joint question is established; if a recipe or current pairwise/complete-line counts answer it adequately; if the view conceals all-ineligible fields or excluded rows after selection; if it needs imputation, quality scores, mechanism tests, monitoring, or expected-record reconciliation to have value; or if its exact membership cannot survive the proposed keyboard/trace checks.

**Access NO-GO** would apply if the packet owner/baseline were wrong or an essential current-state conclusion required invented behavior. That threshold was not reached for this scoped research. Unavailable provider/renderer wiring limits implementation confidence explicitly.

## 10. What happens next

Preserve the queue's first priority: the existing **local selection/export/undo/reopen trust journey**. Do not promote missingness above it. Stop at the first bounded agreement failure across bar, card and exported keys. [R02, R15]

Within the existing missingness queue item, allow only two focused follow-ups:

1. **Local source/consumer check:** in Codex's runnable checkout at the declared or explicitly reconciled baseline, verify field conversion-preview population, live/own/peer snapshot ownership, omitted-row trace entry points, and stable-key mapping. Establish whether a joint view already exists outside the packet. Record any newer source differences. No generic survey is requested.
2. **One observed author comparator:** ask a named author to execute T1–T3 using current controls and the indicator recipe, then try a minimal explanation revision only if a specific failure is observed. Exact answers and decision thresholds are in the proof plan. An actual recurring task is needed to revisit JM-05; the ten-row fixture proves semantics only.

Nonessential choices such as final copy, field cap within the proposed bound, and exact table ordering may stay explicit for review. Do not schedule another tool or dataset survey to decide them.

## 11. Execution ledger and deliverables

**Actually executed:** attached prompt/packet reading; safe extraction and a 39-entry inventory; full/targeted source and test-text review; primary-source web retrieval; independent Python arithmetic over explicit classifications; local Markdown writing; and final archive integrity checks reported with the delivered ZIP.

The arithmetic command was `python3 evidence/fixture_arithmetic.py`. It checked pattern partitions, member sets, reconstructed marginals, pair and complete-case counts, preview partitions, selected/peer set arithmetic, and the empty population. The reproducible script is included in [proof-plan.md](proof-plan.md). **It did not execute explorEDA's parsing helpers, Vitest, React, the demo, or a UI workflow.**

**Proposed / not run:** every implementation milestone, author observation, keyboard/row inspection, viewport check at 1280/783/390, repository test/type/docs/check command, performance measurement, Git action, and PR action. No package installation or source change was performed.

Companions: [recommendations.md](recommendations.md), [proof-plan.md](proof-plan.md), and [research-queue.md](research-queue.md). The archive `joint-missingness-research.zip` contains exactly these three companions, this decision file, and `manifest.json`. The manifest records the baseline, creation time, byte sizes, and SHA-256 hashes; standalone companions match archive members byte-for-byte.

## Appendix A. Inspected repository coverage and source register

Unless stated otherwise, the paths below are **real packet files at the supplied baseline**, not later GitHub discoveries. Full reading was shared across the source audits. Two long files received targeted reads; everything else in the 37-file baseline inventory was read in full. References describe inspected source, not runtime passes.

### Guidance, direction, and prior work

- **R01 — full:** `AGENTS.md`; `docs/agent-guide.md`; `CODING_STANDARDS.md`; `docs/ui-defaults.md`; `README.md`; `package.json`. Supports React/TypeScript/pnpm, shared parsing, existing trace gestures, compact surfaces, docs/example co-scope, required later commands and viewport widths. The README is a feature overview, not a complete registry audit.
- **R02 — full:** `docs/intent/missingness-and-expected-records/intent-brief.md`; `docs/intent/current-analysis-trust/intent-brief.md`; `docs/intent/scientific-multivariate-analysis/intent-brief.md`; `docs/intent/comparison-opportunities/README.md`. Supports uncommitted missingness intent, scientific direction, delivered matrix context, current trust journey, and unproven expansion triggers.

### Parsing, field controls, and filters

- **R03 — full:** [`packages/explorEDA/src/lib/valueParsing.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts): `isMissingValue`, `parseNumber`, `isExactNumberText`, `isNumericValue`, `numericExclusionReason`, `finiteNumber`, `parseBoolean`; selected `valueParsing.test.ts` was read, not run.
- **R04 — full:** [`packages/explorEDA/src/lib/fieldSettings.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/fieldSettings.ts): `convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`; selected `fieldSettings.test.ts` was read, not run.
- **R05 — full:** `packages/explorEDA/src/lib/fieldProfiles.ts` (`buildValuesProfile`, `emptyFieldProfile`, `buildFieldProfiles`); selected `fieldProfiles.test.ts`; `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts` (`calculateValueStatistics`).
- **R06 — full:** `packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx` (`fieldReading`, `FieldRowReadings`); `packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx` (`FieldInspector`, Type and Preview branches, failure list).
- **R07 — full:** `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts` (`useFilteredFieldProfiles`, `rowsFor`, `useFilteredRowCount`); `packages/explorEDA/src/hooks/applyFilter.ts` (`applyFilter`); `packages/explorEDA/src/types/FilterTypes.ts` (`ValueFilter`, `RangeFilter`, text/date filters).
- **R08 — full:** `packages/explorEDA/src/components/WorkspaceFilterEditor.tsx` (`WorkspaceFilterEditor`, `FieldFilter`, workspace-field profiling call).

### Charts, tests, and documentation

- **R09 — full:** [`packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts), especially `pairedStats` and `planPairedSummary`; `summaryMarginals.test.ts` was read, not run. Grouping, rendering and trace imports do not make their implementations inspected.
- **R10 — full:** [`packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts): field values/offsets, `pearson`, `planMatrixLayout`, `planMatrixSelection`, `cellPoint`, `nearestRow`, selection replacement; `matrixPlan.test.ts` was read, not run.
- **R11 — full:** [`packages/explorEDA/src/components/charts/ParallelCoordinates/parallelPlan.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/ParallelCoordinates/parallelPlan.ts): `planParallelCoordinates`, `MAX_AXIS_CATEGORIES`, axis position/completeness loop, `omittedIds`, `selectedCount`, `scopeNote`, `findNearestLine`; `parallelPlan.test.ts` was read, not run.
- **R12 — full:** `apps/demo/src/docs/pages/fields.mdx`; `summary.mdx`; `scatter.mdx`; `scatter-matrix.mdx`; `parallel-coordinates.mdx`; `filters.mdx`. Supports documented controls, gestures and the location of missing scope/eligibility explanations. Their live-example imports were not run.
- **R13 — targeted:** `apps/demo/src/demos/examples.ts`: imports/catalogue types; Beijing, World Bank, earthquakes and wine entries; scatter density/regression/matrix/surface/bubble entries; Palmer penguins; scatter trace and controls. Inspected ranges include 1–255, 302–448, 534–588, 655–671 and 716–737, with file-wide targeted searches. Imported dashboards, CSVs and live example settings are not in the packet.
- **R14 — targeted:** `docs/research/demo-datasets/dataset-research.md`: baseline/capability cautions, Beijing B1–B5 and its coverage/profile interpretation, earthquake E5 and its indicator recipe, final limitations; file-wide heading/missingness/coverage searches. This is prior research at an older baseline, not current delivery or fresh dataset verification.
- **R15 — local additions, full:** `docs/research/joint-missingness-2026-10-19/pro-prompt.md` and `docs/research/joint-missingness-2026-10-19/research-queue.md`. They follow the baseline and are not represented as committed source at it. The separate uploaded prompt is controlling.

The six selected test files are `valueParsing.test.ts`, `fieldSettings.test.ts`, `fieldProfiles.test.ts`, `ScatterPlot/summaryMarginals.test.ts`, `ScatterMatrix/matrixPlan.test.ts`, and `ParallelCoordinates/parallelPlan.test.ts`. Their assertions were inspected for intended behavior; no test outcome is inferred from that reading.
