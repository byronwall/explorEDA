# R026 — Sources and contracts

Research date: **2026-10-21**, America/Indianapolis. Repository: **byronwall/explorEDA**. Study baseline: **`f4cacdde180e16ad814451a8c064e394535565d6`**. Intended later research branch: `codex/missing-state-accounting-research-2026-10-21`; this session did not create or modify that branch.

## 1. Access decision and scope

**GO for the bounded source-grounded R026 accounting investigation. NO-GO for a complete-runtime claim or implementation approval.** GitHub read access was available and the supplied source was independently checked against the exact baseline. A runnable checkout was not present. No explorEDA tests, React application, browser workflow, build, type check, or comparator product was executed.

The research addresses one field's values from raw rows through conversion and calculation. It does not reopen the PR455 joint-missingness survey, infer records that were never supplied, impute values, clean data automatically, or diagnose why data is missing. Missing product-demand evidence limits claims about feature value; it does not prevent a correctness investigation with a concrete fixture. The recommendation dispositions are for Codex review, not permission to implement.

### Repository and input receipts

| Receipt | Verified result |
| --- | --- |
| Repository owner and name | `byronwall/explorEDA`, repository ID `933467100`, owner login `byronwall`; verified through GitHub repository metadata. |
| Visibility and read access | Public repository; GitHub read retrieval succeeded. No write permission was needed or exercised. |
| Default branch | Metadata reports `main`; this study does not claim that current `main` still points to the pinned commit. |
| Baseline | Exact commit `f4cacdde180e16ad814451a8c064e394535565d6` retrieved successfully. Message: merge PR463, “Collect 100 research ideas for explorEDA.” |
| Prompt | `pro-prompt(20261021-125605).md`; SHA-256 `8aa8382537ac41f55c8762864f7f7461a389846c8628f7c12adb1e474fa42c7a`. |
| Selected source packet | `source-packet(20261021-125606).txt`; **285,788 bytes**; SHA-256 `00610a0f82398652b9cab4db0f0ad0801d393cc6bf1946a072e0fb80c1ce3b2e`. |
| Packet composition | **38 sections**: 33 complete baseline files, two selected baseline JSON excerpts, two local additions, and one explicitly historical summary. |
| Complete baseline-file check | All **33/33** file bodies match their pinned GitHub contents. Recomputed Git blob hashes match all 33 returned blob hashes. |
| Catalogue selections | All seven selected idea records and all seven selected review records match their baseline records by stable ID. |
| Historical summary | PR455 summary matches its declared historical commit `dcd9cfaea4d170eb881c2cca9e7f6178b904330e`. |

Canonical references: [repository](https://github.com/byronwall/explorEDA), [study commit](https://github.com/byronwall/explorEDA/commit/f4cacdde180e16ad814451a8c064e394535565d6), and [historical PR455 summary](https://github.com/byronwall/explorEDA/blob/dcd9cfaea4d170eb881c2cca9e7f6178b904330e/docs/research/joint-missingness-2026-10-19/README.md).

**Byte-comparison method.** Each complete baseline file was fetched through GitHub using the exact commit ref and compared as UTF-8 bytes. The first 32 baseline sections have exactly two packet separator LF bytes after the source file. Those two framing bytes alone were excluded. The final provider section matches directly. No source indentation, interior whitespace, line endings, or trailing source bytes were normalized. The Git blob check independently computes SHA-1 over `blob <byte-length>`, a NUL byte, and the file bytes. Appendix B records both the remote content SHA-256 and Git blob SHA for all 33 files.

The two selected JSON sections are excerpts, so their verification used parsed-object equality keyed by stable catalogue ID, not whole-file byte equality. The historical summary is verified at its original ref and is never counted as current baseline source. The local prompt and queue are supplied local context and are never claimed to exist at the baseline commit.

### Distinguishing the historical baselines

- The **R026 catalogue brief** records the older catalogue evidence baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`.
- This study checks current supplied code at **`f4cacdde180e16ad814451a8c064e394535565d6`**. Finding an older baseline in the reused brief is provenance, not a packet mismatch.
- The **PR455 summary** belongs to **`dcd9cfaea4d170eb881c2cca9e7f6178b904330e`**. Its relative links retain that original context; none is silently resolved against the current baseline.
- Local queue statements that R008 is complete in PR464 and R011 overlaps PR461 were reused as supplied scheduling constraints. This research did not independently certify those PRs' current state or repeat their surveys.

## 2. Evidence classes

| Label | Meaning and permissible conclusion |
| --- | --- |
| **Source fact** | A named branch, predicate, field, or call path exists in the pinned files. It supports an implementation-contract description. |
| **Source prediction** | A fixture result derived from those branches. It is falsifiable by the proposed local probe; it is not a recorded application result. |
| **Executed provenance check** | Retrieval, byte comparison, SHA computation, or selected-record comparison actually performed in this session. It verifies sources, not product behavior. |
| **Arithmetic proof** | Reconciliation of explicit row sets and totals. Where executed, it checks the stated ledger's internal accounting. It does not execute the React application or prove its wiring. |
| **External documented contract** | A current primary-source description of Arrow, pandas, or OpenRefine. The comparator was not executed. |
| **Inference** | An interpretation supported by source facts, such as why two totals legitimately differ. |
| **Hypothesis** | An untested claim about user understanding, repair value, or a browser-observable manifestation. |
| **Proposal** | A bounded verification or later change for review. No proposal in these reports is application implementation approval. |

The central distinction is **a different predicate is not automatically a defect**. A present category may be excluded from a numerical analysis. A conversion failure can become an effectively missing value while remaining a failure in the preview. Two counts can be individually correct while their shared label or promised click action is misleading. Only comparisons with the same population, stage, predicate, and type can establish a genuine accounting disagreement.

## 3. Fixture context for the source claims

The study uses twelve native JavaScript row objects with IDs `r01` through `r12`. Their `x` values, in order, are: absent property; explicit `undefined`; `null`; empty text `""`; three spaces `"   "`; configured token `"NA"`; invalid text `"oops"`; numeric `Infinity`; numeric zero; boolean `false`; numeric text `"12.5"`; and invalid calendar date `"2025-02-30"`. The fixture is defined before source-derived outcomes are compared. Undefined values and infinity must not be passed through JSON as a fixture-copy mechanism.

This report summarizes the source contracts; `row-ledger-and-proof.md` contains complete row memberships, frozen expectations, conservation equations, the filtered population, and executable local proof proposals. The explanations below are sufficient to interpret the headline totals without that companion:

- In **no-conversion preview**, “valid” means present and no conversion error. The predicted partition is **9 valid / 3 missing / 0 failed**, including blanks, false, infinity, and invalid numeric/date text among the present values.
- In a **forced numeric raw profile**, the predicted partition is **2 finite measurements / 5 missing measurements / 5 present exclusions**. The finite measurements are zero and `"12.5"`; the two string blanks join absent/undefined/null in measurement missingness.
- In **categorical conversion with `nullTokens: ["NA"]`**, the predicted preview is **8 valid / 4 missing / 0 failed**. Empty and whitespace-only strings remain categories; the token becomes missing.
- In **numeric conversion with `nullTokens: ["NA"]`**, the predicted preview is **2 valid / 6 missing / 4 failed**. Effective profile accounting then becomes **2 finite / 10 missing / 0 excluded**, because the four failed conversions return `undefined`. The preview and effective profile describe different stages, and both equations conserve twelve rows.

These figures are **source predictions and ledger arithmetic**, not executed product results.

## 4. Verified repository contracts

### 4.1 Raw values and numerical eligibility

**Source facts.** `packages/explorEDA/src/lib/valueParsing.ts` defines `isMissingValue` as null, undefined, or a string whose trimmed value is empty. `parseNumber` preserves native numbers, rejects booleans and blank strings, excludes radix-prefixed text, and parses other numeric text. `finiteNumber` admits only finite results. `numericExclusionReason` names null/undefined, boolean, blank text, and nonfinite or unparseable numerical values through different reasons. `parseDateText` validates supported calendar forms; the supplied tests include invalid-date cases. These are distinct predicates with distinct purposes, not one universal state.

**Inference.** `0` must remain a measurement and `false` must remain a boolean/category when applicable. An analytical exclusion does not entitle a consumer to overwrite the raw value. Empty text and whitespace can legitimately be preserved as separate categories while excluded from a numerical calculation. The diagnostic value of separating absent-property from explicit undefined is strongest at an ingestion or calculation-context boundary; it is not established for a persistent chart legend.

Exact source: [valueParsing.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/valueParsing.ts), symbols `isMissingValue`, `parseNumber`, `isNumericValue`, `numericExclusionReason`, `finiteNumber`, `parseDateText`, `timestampOf`; packet section 08. Its included tests are section 09. Reading those tests is not a claim that they passed during this session.

### 4.2 Profiles are type-dependent projections

**Source facts.** `calculateValueStatistics` in `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts` has a dedicated numeric branch. It counts missing measurements with `isMissingValue`, admits finite measurements, and defines exclusions by subtraction. Its non-numeric branch counts only nullish values as null and records every other value in category statistics. `uniqueCount` is a distinct-value statistic, not a count of usable measurements and not an additive partition term. The numeric branch even records non-null raw representations in its uniqueness set before measurement eligibility is decided.

`packages/explorEDA/src/lib/fieldProfiles.ts` uses `buildFieldProfile`, `buildValuesProfile`, and `buildFieldProfiles` to apply either a known type or `detectColumnType`. `dataTypeDetection.ts` ignores measurement blanks during inference and requires all remaining values to satisfy a candidate type. The mixed twelve-row field naturally falls back to categorical unless overridden or declared by a host. Forced numeric profiling in the experiment is deliberate.

**Inference.** Different categorical and numeric null totals are intentional contracts in this code. A universal classification that requires blank text to be either always present or always missing would erase one of those meanings. All reports should name both the type and the stage of a profile.

Exact sources: [statisticsCalculator.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts), `calculateValueStatistics`; [fieldProfiles.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldProfiles.ts), `buildFieldProfiles`; [dataTypeDetection.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts), `detectColumnType`. Packet sections 12–15; included profile tests are section 13.

### 4.3 Conversion preview preserves an error that effective values alone cannot

**Source facts.** `convertFieldValue` in `packages/explorEDA/src/lib/fieldSettings.ts` returns undefined for nullish inputs and matching configured tokens. It compares tokens with trimmed text, preserves categorical raw values, treats blank non-categorical inputs as missing, and returns undefined plus an error for failed numerical, boolean, or date conversions. `buildConversionPreview` evaluates all supplied rows, checks conversion error before missingness, and partitions each row into valid, missing, or failed. Its no-conversion path returns the raw value and tests nullness, not finite-number eligibility. Examples are limited, but the total/failure accounting covers the supplied population.

`applyFieldSettings` clones each row and applies selected conversion settings only when the field is present according to `field in row`. It skips absent properties. The provider keeps `rawData` separate from runtime `data`, rebuilds profiles after settings changes, and reconstructs calculations against effective values. The included provider tests document the intended raw/effective separation, but were not run here.

**Inference.** The no-conversion 9/3/0 preview and raw-numeric 2/5/5 profile are not an inconsistency: they ask different questions. Likewise, preview failures becoming effective missing values is explainable as a stage transition. However, effective missingness cannot reconstruct whether the original cause was absence, a declared token, or failed conversion. A cause-specific repair must revisit retained raw values and settings or use preview diagnostics.

Exact sources: [fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldSettings.ts), `convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`; [DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/DataLayerProvider.tsx), `rawData`, `data`, `updateFieldSettings`, `getFieldConversionPreview`, `saveToStructure`; packet sections 10, 11, 22, and 38.

### 4.4 Filter ownership changes the relevant population

**Source facts.** `useFilteredFieldProfiles` reads effective source values and calculated column values. Ordinary profiles use rows passing current linked filters. An owning chart's control can omit that owner's field filter, while preserving the relevant other filters. An edited workspace field can similarly leave its own workspace filter out. Calculated field type is inferred from all calculated values before filtering. Conversion preview, by contrast, uses `rawData` rather than the current filtered effective rows.

`buildFieldDistribution` carries an all-row population and optionally a filtered population. Numerical distributions use `finiteNumber` and measurement missingness; date distributions use `timestampOf` and nullish missingness; categorical distributions retain category membership. Therefore a raw date distribution and an ISO conversion preview also require separate definitions.

**Inference.** Reconcile counts within the population each surface actually declares. A selected numerical range, a self-excluded control distribution, and an all-row conversion preview should not be forced to share a denominator. The filtered row ledger must name IDs, active owner, and effective stage. Shared diagnostic labels alone cannot solve scope errors.

Exact sources: [useFilteredFieldProfiles.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts), `useFilteredFieldProfiles`, `rowsFor`, `useFilteredRowCount`; [fieldDistribution.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/fieldDistribution.ts), `buildFieldDistribution`; packet sections 16–17. Supplement `useFieldDistribution.ts` traces its consumer call path.

### 4.5 Label aggregation and selection membership need separate review

**Source facts.** `FieldOverview.tsx`'s `FieldCard` computes its displayed missing amount as `population.missing + population.excluded`. `FieldMetadata.tsx`'s `fieldMetadata` instead constructs separate null and exclusion labels. Its exclusion wording is “not finite,” although numeric exclusions also include a boolean or text that cannot be parsed as a measurement. `FieldRowReadings.tsx` displays `profile.nullCount` and describes its button as showing those missing rows.

The supplemental `FieldListRow.tsx` proves that this button calls `toggleFilter` with a value filter containing null. `useFieldFilter.ts` attaches that filter to a summary chart. `applyFilter.ts` explicitly makes such a null-containing value filter match every `isMissingValue`, including blank text. `categories.ts` confirms null/undefined membership handling without collapsing ordinary text categories.

**Source prediction.** On the unconverted categorical fixture, `profile.nullCount` is three while the null-containing filter accepts five row values. Thus the count-to-action promise can disagree with the membership selected, even though each standalone predicate is intentional. This is stronger evidence for a bounded repair investigation than the mere existence of different category/measurement counts. It remains a source-predicted UI path; no click or rendered count was executed in this session.

**Hypothesis.** A clearer label or matching button population could resolve the repair task without a new shared state system. MS02 investigates the count/action contract and overview wording while preserving deliberate numerical and categorical semantics. The later browser proof must inspect exact IDs rather than judging a screenshot or aggregate alone.

Exact sources: [FieldOverview.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldOverview.tsx), `FieldCard`; [FieldRowReadings.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx), `FieldRowReadings`; [FieldMetadata.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldMetadata.tsx), `fieldMetadata`; [applyFilter.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/applyFilter.ts), `applyFilter`; packet sections 18–21 and the named supplements.

### 4.6 Host-declared type exposes a different preview/apply boundary

**Source facts.** `DataLayerProvider.tsx`'s `typeOverrides` merges host-declared types with explicit field-setting overrides. `updateFieldSettings` uses those types to construct inference for `applyFieldSettings`. However, `getFieldConversionPreview` builds a raw profile without passing host type overrides. Supplemental `declaredFieldTypes.ts` maps host `number` to internal `numeric`. Supplemental `FieldInspector.tsx` sends its draft to `getFieldConversionPreview` and provides an Automatic type selection that leaves `draft.type` undefined.

**Source prediction.** With host `fieldTypes: { x: "number" }`, the mixed twelve-row raw fixture, and a token-only draft `{ nullTokens: ["NA"] }`, Automatic preview infers categorical and predicts **8 valid / 4 missing / 0 failed**. Application resolves the same field through the declared numeric type, resulting in **2 finite values / 10 missing / 0 exclusions**. The numerical conversion corresponding to that applied path would have a **2 valid / 6 missing / 4 failed** preview. This is not explained merely by raw versus effective stages: the two paths have selected different types for the same draft.

**Hypothesis and proposal.** MS03 should verify this exact host path locally and decide whether preview and application should share type resolution. An explicit numerical override is a useful negative control because both paths then have the same target type. No demand claim or broader schema redesign follows from the discrepancy.

Exact source symbols: `typeOverrides`, `updateFieldSettings`, `getFieldConversionPreview` in packet section 38; `declaredDataTypes`, `DECLARED_DATA_TYPES`, `FieldInspector`'s preview `useMemo`, and its Type override/Automatic handler in the supplements. These supplementary reads closed a concrete evidence gap; host declaration mapping and the relevant UI route were not guessed.

### 4.7 Calculation results, errors, and traces carry different information

**Source facts.** `Calculator.evaluate` catches exceptions and returns success/value/error. `Calculator.value` rejects nonfinite numeric results at expression-node evaluation. `numericValue` in the supplemental function registry distinguishes a nullish/empty input from other invalid numerical inputs; numerical arithmetic uses `finiteNumber`. A direct field reference must exist in the context map, though its value may be undefined. The `count` function counts supplied arguments, including missing values, so it is not a non-missing-count recipe.

`CalculationManager.executeCalculation` installs every declared dependency in the row's variables map, taking the source value or calculated result. An absent source property therefore gets an entry with value undefined. By contrast, `traceRow` starts with `Object.entries(row)` and adds only calculated dependencies found through tracing. An absent source property can remain absent from the map. Supplemental `providers/lib/dataLayerState.ts` confirms that `initializeData` copies `{ ...row, __ID: index }` without filling absent source properties. The manager stores successful values and errors separately; an error result becomes effective undefined. Calculated profiles alone consequently do not recover the originating error. `CalculationPreview.tsx` consumes the manager's errors and labels its scope as all loaded rows before chart filters.

**Source prediction.** An absent source property can produce different trace and batch results or messages. A direct identity reference may be successful-but-missing in batch and fail with “Undefined variable: x” in trace; arithmetic may report missing-numeric in batch and undefined-variable in trace. Explicit undefined is a negative control because it is present in `Object.entries`. A downstream calculation may see a dependency's undefined result without automatically inheriting its original error, even though error maps and dependency traces remain available for inspection.

**Proposal.** MS04 investigates the trace/batch context boundary with exact row IDs and expressions. It does not approve changing truthiness, all function behavior, or adopting a new error value in the public data type. Use the existing error maps and trace links before proposing a broader provenance system.

Exact sources: [Calculator.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/engine/Calculator.ts), `evaluate`, `value`, `evaluateValue`; [CalculationState.ts](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/CalculationState.ts), `CalculationManager.traceRow`, `executeCalculation`, `getErrors`; [CalculationPreview.tsx](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/calculations/CalculationPreview.tsx), `CalculationPreview`; packet sections 23–25, plus supplemental `functions/registry.ts` and calculation `types.ts`.

## 5. Reused research and project constraints

The supplied PR455 summary had already separated preview validity from finite measurement eligibility, identified raw versus effective populations, and kept a dedicated joint-missingness diagnostic deferred. Those findings were reused. This study supplies the individual twelve-row accounting that its summary says was still unexecuted. PR455's future author/task comparison is useful for deciding whether a new view helps; it is not a prerequisite for investigating this correctness boundary.

The missingness intent and current-analysis-trust intent support explanation and exact-population proof, not automatic cleaning or a universal state architecture. Their historical browser reports are context, not fresh passes. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, and `docs/ui-defaults.md` were read. Their applicable constraints are preserved: React/TypeScript and pnpm; raw-value interpretation through the shared parsing module; compact, scope-visible controls; shared field metadata; and documentation plus runnable examples in the same later feature milestone.

The existing docs pages are `apps/demo/src/docs/pages/fields.mdx`, `summary.mdx`, and `calculated-fields.mdx`. They are the natural destinations for the bounded ledger lesson and any accepted scope, conversion, or calculation explanation. The guide identifies `apps/demo/src/docs/live/examples.ts` and demo example/coverage registration as later integration surfaces. Those registration files were not read or changed here; a proposed example name is not represented as already registered or runnable in the product.

Stable recommendation cross-reference:

- **MS01 — Adopt for review:** integrate the stage/population ledger and a bounded docs/example proof.
- **MS02 — Investigate:** count/action membership and misleading missing/exclusion labels.
- **MS03 — Investigate:** host-declared type parity between conversion preview and application.
- **MS04 — Investigate:** absent-property trace/batch calculation parity.
- **MS05 — Defer:** a small private diagnostic projection until a repair task demonstrates information missing from present controls.
- **MS06 — Reject:** a universal state model that collapses category and measurement semantics.

The full problem/evidence/alternative/cost/API/confidence/rejection records belong to `missing-state-decision.md`. This source report supplies the provenance and limits needed to assess them; it creates no additional recommendation IDs or implementation approval.

## 6. Current primary-source comparisons

All following official documentation was retrieved **2026-10-21**. These are documented alternative contracts, not executed comparator evidence. No performance, robustness, popularity, or market-demand claim is inferred. Live Arrow documentation exposed differing documentation-build titles during retrieval; no installed release version is inferred from those titles.

### E01–E03: Arrow validity and numerical usability

**External documented contract.** The [Arrow Columnar Format validity-bitmap section](https://arrow.apache.org/docs/format/Columnar.html#validity-bitmaps) represents primitive-slot nullness separately from payload; set bits mean non-null, and null payloads need not have a particular value. [PyArrow `is_null`](https://arrow.apache.org/docs/python/generated/pyarrow.compute.is_null.html) defaults `nan_is_null` to false and optionally includes NaN. [PyArrow `is_finite`](https://arrow.apache.org/docs/python/generated/pyarrow.compute.is_finite.html) separately excludes NaN and positive/negative infinity. Retrieved 2026-10-21.

**Inference.** Presence, nullness, and analytical usability can coexist as explicit predicates. This supports explaining the predicate behind a count, not importing Arrow or imposing its vocabulary on explorEDA. The flat-field comparison does not generalize Arrow's nested/union validity rules into a new product state model.

### E04–E05: pandas missingness and conversion policy

**External documented contract.** [pandas `DataFrame.isna`](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.isna.html) treats `None` and numeric NaN as missing while empty text and infinity are not missing under that method. [pandas `to_numeric`](https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html) defaults to raising on invalid parsing; `errors='coerce'` maps invalid parsing to NaN. Retrieved 2026-10-21.

**Inference.** A downstream missing value need not reveal its original cause, and missingness definitions differ across tools. Neither documented choice makes explorEDA's whitespace-aware measurement rule wrong. Retained raw values and conversion diagnostics can explain a coercion without making all categories obey a numerical rule.

### E06–E08: OpenRefine conversion diagnostics

**External documented contract.** [OpenRefine Expressions](https://openrefine.org/docs/manual/expressions) describes initial-row transformation previews and choices to preserve an original value, store an error, or produce a blank. [Exploring facets](https://openrefine.org/docs/manual/facets) distinguishes stored conversion errors from null/empty/blank inspection and defines blank as null or an empty, zero-length string. [GREL controls](https://openrefine.org/docs/manual/grel) include separate `isBlank`, `isNull`, `isNumeric`, and `isError` predicates. Retrieved 2026-10-21.

**Inference.** Detailed conversion previews and targeted diagnostic inspection are credible alternatives to a global classification. Persistent post-conversion causes require a demonstrated repair task. No claim is made that OpenRefine's import, whitespace, mutation, or storage semantics match explorEDA, and its documentation does not establish explorEDA demand.

| Decision question | Comparison result | Local evidence still required |
| --- | --- | --- |
| Must “valid” imply finite? | The documented contracts distinguish presence/nullness from numerical usability. | Whether explorEDA's actual wording communicates the intended predicate. |
| Is one missing definition mandatory? | These primary contracts differ. | Which distinction changes the user's repair decision. |
| Could preview-only diagnosis suffice? | Transformation tools make it a credible alternative. | Whether a recurring task remains unsolved after preview and raw-value inspection. |
| Should coercion preserve a cause? | Cause can be represented separately from the effective value. | Whether existing error maps and raw rows already provide enough evidence. |

## 7. Negative results, uncertainty, and remaining questions

### What the source does not justify calling defective

- A non-converting preview may count an invalid number, infinity, false, or blank string as present without promising finite numerical validity.
- Categorical blank preservation and numerical blank exclusion answer different questions.
- A conversion failure becoming effective undefined is compatible with a preview that still reports failure.
- Missing counts before and after filtering, or under self-exclusion, need not match.
- The strict calendar parser's rejection of `2025-02-30` is expected behavior, not a defect to repair by normalizing into March.
- Absent-property versus explicit-undefined information is meaningful in the fixture, but that does not prove it needs a permanent public diagnostic label.

### Focused unanswered questions

1. Can local tests reproduce the count/action, host-type preview, and trace/batch predictions exactly at the pinned commit? These are the smallest missing checks for MS02–MS04.
2. Does a rendered browser show the predicted values and memberships after normal interaction, including filter owner and declared host type? No browser manifestation is claimed here.
3. Does existing preview, row inspection, filter state, and calculation error inspection support the actual repair task? A negative answer must name the task and failed information lookup before MS05 advances.
4. Does a field distribution ignore a workspace filter when there are zero charts? Supplemental `useFieldDistributions` gates filtered IDs on chart existence, whereas `useFilteredFieldProfiles` also considers workspace filters. This is an **unexecuted scope hypothesis referred to existing R051**, not an additional R026 feature or confirmed product defect.
5. Which current-main changes, if any, affect these contracts after the pinned baseline? Current main was not substituted for the requested commit; Codex must check drift before integrating or implementing.
6. Are native undefined, absent-property, and infinity distinctions preserved in the chosen local fixture-loading path? Use native JavaScript objects; JSON copy/import cannot be assumed to preserve them.

### GO / NO-GO boundaries

**Research GO** is supported by verified repository identity, exact baseline content, all required named source paths, an explicit packet inventory, and narrow supplements resolving otherwise ambiguous dependencies. A writable checkout is not required for that result.

**Runtime NO-GO** remains until a real checkout with its dependencies and test configuration executes the proposed proof. A compiled extract, arithmetic script, or source comparison is not a React application run. **Implementation NO-GO** remains until Codex reviews the bounded findings, reproduces the relevant behavior, chooses the intended contract, integrates docs/examples, and runs the required gates. No new classification is approved merely because a difference exists.

Stop and request the smallest missing evidence if pinned source cannot be obtained, a local baseline differs unexpectedly, or an omitted rule would materially determine the result. Re-run only checks needed to resolve an identified boundary; do not reopen the broad catalogue or PR455 survey.

## 8. Checks actually run and checks reserved for Codex

| Check | Status and interpretation |
| --- | --- |
| GitHub owner/repository metadata and exact commit lookup | Executed successfully; confirms identity and access. |
| Packet inventory and attachment SHA-256 | Executed; 38 framed sections and input hashes recorded. |
| 33 complete baseline-file comparisons | Executed; all match after exact packet-separator accounting. |
| Git blob SHA-1 recomputation | Executed for all 33 complete baseline files; all match. |
| Selected catalogue record comparisons | Executed; seven idea and seven review objects match by ID. |
| Historical PR455 summary comparison | Executed only at its declared historical ref; matches. |
| Narrow supplementary-source retrieval and integrity receipts | Executed as documented in Appendix C. |
| Current primary-source retrieval | Executed; official Arrow, pandas, and OpenRefine documentation only supports the listed contract claims. |
| Source reading and call-path tracing | Performed for the inventory and named supplements; static evidence only. |
| Row-ledger arithmetic | Separately recorded in `row-ledger-and-proof.md`; no application result follows from arithmetic alone. |
| Existing package tests, new proof tests, type checks, `pnpm check` | **Not run.** They require the actual repository environment. |
| React rendering and browser proofs at 1280/783/390 px | **Not run.** Required later for accepted visible behavior changes. |
| Comparator product execution or benchmark | **Not run.** Comparisons are documentation-based. |
| User/task study, implementation, Git writes, deployment | **Not performed.** Research recommendations remain for review. |

Codex owns collection of originals, integrity verification, document integration, executable proof, local gates, and the scoped review PR. The four complete reports plus manifest and archive are the research output. No application file was changed.

## Appendix A. Every packet section read and its role

Packet line ranges below refer to body lines in the attached text packet, excluding each delimiter. Ordinary baseline paths are at `f4cacdde180e16ad814451a8c064e394535565d6`. The source line numbers within each body begin at one. Local additions and historical material retain their explicitly different provenance.

| Section | Exact source path or selected record source | Role/provenance | Packet body lines |
| --- | --- | --- | --- |
| 01 | `AGENTS.md` | BASELINE: Working rules | 8–48 |
| 02 | `docs/agent-guide.md` | BASELINE: Agent guide and local gates | 50–201 |
| 03 | `CODING_STANDARDS.md` | BASELINE: Coding, copy and data rules | 203–232 |
| 04 | `docs/ui-defaults.md` | BASELINE: UI, scope and verification rules | 234–374 |
| 05 | `README.md` | BASELINE: Repository/package context | 376–599 |
| 06 | `package.json` | BASELINE: Workspace scripts | 601–635 |
| 07 | `packages/explorEDA/package.json` | BASELINE: Library scripts/dependencies | 637–844 |
| 08 | `packages/explorEDA/src/lib/valueParsing.ts` | BASELINE: Parsing and eligibility | 846–1153 |
| 09 | `packages/explorEDA/src/lib/valueParsing.test.ts` | BASELINE: Parsing/eligibility tests; not run | 1155–1385 |
| 10 | `packages/explorEDA/src/lib/fieldSettings.ts` | BASELINE: Conversion/preview | 1387–1771 |
| 11 | `packages/explorEDA/src/lib/fieldSettings.test.ts` | BASELINE: Conversion tests; not run | 1773–1917 |
| 12 | `packages/explorEDA/src/lib/fieldProfiles.ts` | BASELINE: Profile construction | 1919–1997 |
| 13 | `packages/explorEDA/src/lib/fieldProfiles.test.ts` | BASELINE: Profile tests; not run | 1999–2100 |
| 14 | `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts` | BASELINE: Numeric/category statistics | 2102–2273 |
| 15 | `packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts` | BASELINE: Type inference | 2275–2321 |
| 16 | `packages/explorEDA/src/lib/fieldDistribution.ts` | BASELINE: Distributions/exclusions | 2323–2925 |
| 17 | `packages/explorEDA/src/hooks/useFilteredFieldProfiles.ts` | BASELINE: Effective filtered profile scope | 2927–3103 |
| 18 | `packages/explorEDA/src/hooks/applyFilter.ts` | BASELINE: Filter predicates | 3105–3174 |
| 19 | `packages/explorEDA/src/components/FieldList/FieldOverview.tsx` | BASELINE: Field-overview display | 3176–3617 |
| 20 | `packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx` | BASELINE: Field-row count/action copy | 3619–3720 |
| 21 | `packages/explorEDA/src/components/FieldMetadata.tsx` | BASELINE: Shared metadata labels | 3722–3990 |
| 22 | `packages/explorEDA/src/test/providers/fieldSettingsProvider.test.tsx` | BASELINE: Provider tests; not run | 3992–4061 |
| 23 | `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` | BASELINE: Expression evaluation | 4063–4244 |
| 24 | `packages/explorEDA/src/lib/calculations/CalculationState.ts` | BASELINE: Calculation results/errors/traces | 4246–4433 |
| 25 | `packages/explorEDA/src/components/calculations/CalculationPreview.tsx` | BASELINE: Calculation preview scope/status | 4435–4614 |
| 26 | `docs/intent/missingness-and-expected-records/intent-brief.md` | BASELINE: Missingness intent | 4616–4666 |
| 27 | `docs/intent/current-analysis-trust/intent-brief.md` | BASELINE: Trust intent/evidence limits | 4668–4718 |
| 28 | `apps/demo/src/docs/pages/fields.mdx` | BASELINE: Fields docs | 4720–4743 |
| 29 | `apps/demo/src/docs/pages/summary.mdx` | BASELINE: Summary docs | 4745–4757 |
| 30 | `apps/demo/src/docs/pages/calculated-fields.mdx` | BASELINE: Calculated-fields docs | 4759–4777 |
| 31 | `docs/intent/research-ideas-100/README.md` | BASELINE: Catalogue overview/provenance | 4779–4851 |
| 32 | `docs/intent/research-ideas-100/ideas/R026-missing-state-accounting.md` | BASELINE: Complete R026 brief; older baseline retained | 4853–4882 |
| 33 | `docs/research/missing-state-accounting-2026-10-21/pro-prompt.md` | LOCAL: Local prompt | 4884–4991 |
| 34 | `docs/research/missing-state-accounting-2026-10-21/research-queue.md` | LOCAL: Local queue | 4993–5015 |
| 35 | `docs/research/joint-missingness-2026-10-19/README.md` | HISTORICAL dcd9cfa…: Historical PR455 summary | 5017–5039 |
| 36 | `docs/intent/research-ideas-100/ideas.json — selected records` | BASELINE EXCERPT: Selected seven idea records | 5041–5383 |
| 37 | `docs/intent/research-ideas-100/review.json — selected records` | BASELINE EXCERPT: Selected seven review records | 5385–5428 |
| 38 | `packages/explorEDA/src/providers/DataLayerProvider.tsx` | BASELINE: Provider raw/effective orchestration | 5430–7163 |

## Appendix B. Complete baseline integrity receipts

Each row's index maps to the exact path in Appendix A. Bytes and SHA-256 describe repository file content, excluding packet framing. Git blob SHA-1 is both the GitHub returned blob identity and the independently recomputed value. All 33 comparisons passed. These are file/source checks, not tests of application semantics.

| Section | Repository bytes | Verified Git blob SHA-1 | Content SHA-256 |
| --- | ---: | --- | --- |
| 01 | 4033 | `2215cd2e41684bc5a6cd6b290278e70de2c84c66` | `802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33` |
| 02 | 19779 | `c623061ce09dd0100853630f7381b5db25bc6cdd` | `0992949f205d1ae72a8249c69bccb33f1eb70763b14a526a6384a7a91f9c9f00` |
| 03 | 2213 | `207560f0702dda29fe9b65eedc6e6ba0272126c7` | `b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5` |
| 04 | 19093 | `da88ba112744cca4d65a611f0e45db04e5ccf43e` | `93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a` |
| 05 | 10263 | `d28c66ac13c97fdbc11f7f0da45c45eda3c9ca5f` | `1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28` |
| 06 | 1258 | `8cad36033ae7c7efed8d3d5d50d0076d134f8e15` | `f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3` |
| 07 | 6082 | `37443375738997950f1d03ed8d0b7fff3f312e8b` | `17a71fd8852bcfbfb92cf76a9faf03766e934d0a5f0afcdcc9a5d0fd563b452a` |
| 08 | 10226 | `12d14afc1f035b78103d504cc974cd4cbb0ac1cb` | `18793ed3c9f09e3ac6c184fd658ad68b88f564c5c2d800bac7108188afd845d6` |
| 09 | 7406 | `ce7838c02892cbf0932db023ca4f7beceb273810` | `e3d2a86ad3d28494429cf8596da15cd74b3683d5d71b49e7060d2444653bb81a` |
| 10 | 10610 | `4b043f794d3502519406ffc6a54a93f395951c61` | `12381672c4bd38ddb826cc2ac8b671e4714ee3f965c0ce2db2e6beb5b8a05236` |
| 11 | 4691 | `f819a5587402c410b9bddd4d7c373cb737bfceb3` | `83b2b9b5b5b01b5305bab7f005f3f614c0e9ce1b6394631b8aacdfa123c4cf78` |
| 12 | 2011 | `563421e0c517846f3b37681fe3b6351e04a6eb5a` | `22258fd930d4b63dd64a63972642f10392df2eaf8922ad870b2ec2d3c5457988` |
| 13 | 3058 | `26a1f4a5a7a996d34d151fbc524000e06ca6b0ed` | `d6d0c7ffdd0ff261144da23dc72ab1f0e3c8c92c40127de29feb04a658202087` |
| 14 | 4810 | `2eda60d718eb364a312b66a615cc53ca5f6231a9` | `bb630d2f003d0f98e6dced59839b84a812d4d7438cd15ef65fb1277337a6e097` |
| 15 | 1208 | `e29aca246bfe4df1fca26f24fb6a8535e18f256e` | `8bba727e0e4205a0df8762770d27a83be212089397e3d19d76055a8bfd1a8db1` |
| 16 | 17034 | `5cac55370619c9e35eb5e43cbee54c8fdd1e7891` | `69d2e246d8b6fb6947c35855c4245b348fbd82752ef5b2cc40f2312058c71f32` |
| 17 | 6357 | `490da015f303433f18e29a61b46dc2aed5cbd1d0` | `cd8a3a8f2fe0e9b958027a58348934b11b5ce1196f66b4800d10d1cbaba7447e` |
| 18 | 1974 | `6236e52545cf2384c29cc54399927da6215943ef` | `d8f0610999aa93372bbbb29d9811d9106b71e1c40675b5bc3f3714ea5bbc3953` |
| 19 | 14204 | `9c292318a5639e001ad227b6e0e6375664340663` | `be58521bd593f91088998917a4d4cf328ca28ce4bddcd918fff592fc3919d970` |
| 20 | 3205 | `da1f649873039d220e2c8f7decb3306c518254f2` | `356c5ecb5340f55017cf6e4d8588c9d658f4c84045ecf7affd21c44b5d737c8b` |
| 21 | 8362 | `f3e6b59531700230e099669283f76c341011c63e` | `b141b6708594ce779a6a2f4cebdb8ace1d51f40949a29edf3454bbe24559b0eb` |
| 22 | 2229 | `f9066535c5fcbe07843752a9b2472f062cd1f259` | `c7ad5bee766aeb379abd9f0b000334f2c8d975f78d6b8c7727262ea00e8f90d4` |
| 23 | 5702 | `0ff8ff4ab59d352bed002ae0f0a04eb784c9e8f7` | `cbe2114e76c1fcfcd95ad35114b5f205a595ac29134ec3d040c4573aca3dd117` |
| 24 | 6231 | `8e3eb46f53b700fdb648f19c853fd4e1ae2f6979` | `bc4c855f7fd491f743f1f6e460b31d68844aea674e07a7ff50a27fb238b41ed0` |
| 25 | 6005 | `3b5a640cce89cb7888989790a154351efe814a38` | `cdd7d6f8ac30a5edad4455f97712d8098ff1c7cc1a97890f55b7a2aa592ef268` |
| 26 | 2851 | `5ccc5fad4edec48d69bbb5bc6ba23b46047db825` | `1a9747d348dd5124206ffac7866dac6030d2ffd41f00132406d74a1aa9fdb4b2` |
| 27 | 3006 | `c9ea8b2a68da2ee5e34a7ac52e5fac092d8d0cc9` | `d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7` |
| 28 | 1052 | `62922aaf4898ef7766443ed97dbff07a25bea72f` | `6684572ef2332d4edf136e2458ce7f6b013d3d420407f642d0ac1449ceaca872` |
| 29 | 258 | `996fdea5e8b888395e50de7a1286ec34b8774603` | `6b47411aa431f11b3383e8c064e6ef4243c310da02df77a0aaf3ccde8f00b3e1` |
| 30 | 1054 | `fb265c485706792c5ca2b991e719fbad12e5baf7` | `27580a0568ac5bdb798466a65ccd5c439615824f7af4eea1a45bc6f83f46073c` |
| 31 | 6362 | `2b50111519511defb5f43790cbcd9c7da38146b9` | `63ec0d118382fcbe7551e5556f10cd2970e0120414766612fab1e54ca6477512` |
| 32 | 3372 | `6789c796b7ec64e756d5add36bad439dc1a23213` | `cfac6110e0637ee8dd943a5ef5603af0ffe87c9f248cbeb1231e1315451f7d44` |
| 38 | 55689 | `c161093db9df4aa480bf3a20fc33c53bf6245f65` | `c0ab7260c912fb628d393e7cbae1c752e44db4a20e347d9ec07f755b3ae7771d` |

### Selected catalogue records and historical summary

Selected IDs in each JSON excerpt: **R001, R008, R011, R026, R043, R051, R077**. Deep equality passed for each selected object. The following hashes identify the full remote JSON files used for comparison; packet excerpts have different byte content by design.

- `docs/intent/research-ideas-100/ideas.json` at `f4cacdde180e16ad814451a8c064e394535565d6`: 227,133 bytes; Git blob `c08eb233435e07eb439d1753290382b73baf286b`; SHA-256 `3b436493c899da20dded7bcd4d3955f019acc11df2626912e82c7cef2efc3213`.
  - All seven selected records match.
- `docs/intent/research-ideas-100/review.json` at `f4cacdde180e16ad814451a8c064e394535565d6`: 35,155 bytes; Git blob `b40f34632b7b4faf2e1213226eee2ceb28f967c0`; SHA-256 `6f1438def9363327208f45eea2cea09cacc7cba815246f21ea63a9fff09c44a8`.
  - All seven selected records match.
- `docs/research/joint-missingness-2026-10-19/README.md` at `dcd9cfaea4d170eb881c2cca9e7f6178b904330e`: 2,440 bytes; Git blob `7555382fd308e37a468b18767767652f1d2d0e4a`; SHA-256 `e37d12c7efd3f514999a63643b0a6650762cd85cfe9ebf2bcc918d2201fc374b`.
  - Historical summary content matches; exactly two packet separator LF bytes excluded. Its linked survey was not reopened.

The two local additions have packet-section SHA-256 values `4e27cc65108531cd634eccb3375579cc448b3db0088271acea1177bf4b215f2e` (prompt, section 33) and `c29b59b745634e90931d5201766fb4721666b473bd45d00e4daf5744fd966db5` (queue, section 34). These include packet separator bytes and establish supplied-input identity, not GitHub-baseline provenance.

## Appendix C. Narrow supplementary reads

The packet is selected source, not a checkout. The following exact-ref reads were needed to remove concrete ambiguity: numerical calculation helpers and expression types; missing-button callback and filter membership; distribution scope; host-declared type mapping and the Automatic preview path; and source-row initialization where applicable. They supplement the packet transparently. They do not imply full-repository coverage or a runnable environment.

**9 supplemental files**, all retrieved at the exact study baseline on 2026-10-21. All original GitHub file contents pass independent Git blob SHA-1 recomputation. The registry and types local copies match directly. Each of the seven surface supplement copies has exactly one extra terminal LF from local materialization; comparison confirmed that every source byte before that LF matches, and only that extra framing byte was excluded for the source receipts below. No interior source content was changed. These reads are outside the attached packet and do not constitute a checkout.

### S01. `packages/explorEDA/src/lib/calculations/functions/registry.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/functions/registry.ts); 3,629 repository bytes.
- Git blob SHA-1: `1ffeb8c97d1b95ade6c964c792b2653eb9a8a703`; independent source-byte recomputation matches.
- SHA-256: `75be6d61404101b3dc4dc6c88de8a6f72a132b1aa1258fbac899e71a814527dc`.
- Local materialization suffix excluded: 0 LF byte(s).
- Reason read: `numericValue` and existing function contracts remove guesswork about arithmetic, count, and failed numeric inputs.

### S02. `packages/explorEDA/src/lib/calculations/types.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/calculations/types.ts); 1,515 repository bytes.
- Git blob SHA-1: `aea72ba6cafcf7074f4310630155302242ea2697`; independent source-byte recomputation matches.
- SHA-256: `d71fb207511f9767a9456a8e1ef04a92d5e757b27b1f91fbc7663b097f4a3917`.
- Local materialization suffix excluded: 0 LF byte(s).
- Reason read: Expression, context, result, and value types ground the executable proof proposal.

### S03. `packages/explorEDA/src/components/FieldList/FieldListRow.tsx`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/FieldList/FieldListRow.tsx); 12,222 repository bytes.
- Git blob SHA-1: `009b8eeca0ff5fde6ec28ef9551ed41714b665aa`; independent source-byte recomputation matches.
- SHA-256: `845d96317146265fb6ae40597ff66d30a5339f806596ff5e5b8881aac5e9278f`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Connects displayed Missing counts to the actual null-containing filter callback.

### S04. `packages/explorEDA/src/hooks/useFieldDistribution.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/useFieldDistribution.ts); 2,530 repository bytes.
- Git blob SHA-1: `c21cbc38bfa52eaa59370a287c5a88927b91483c`; independent source-byte recomputation matches.
- SHA-256: `b963dabc02478e321c919e92748b878e0d2b1fea0b695b55f7973055a0e6a40a`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Establishes effective data retrieval and chart-based filtering of displayed distributions.

### S05. `packages/explorEDA/src/lib/categories.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/categories.ts); 2,168 repository bytes.
- Git blob SHA-1: `8f600ae636966910c9169e2ef914cdf914c4693f`; independent source-byte recomputation matches.
- SHA-256: `6a0f2450cc369a188091ce0533e26dc5775e1b647a37e64e2590eb3f3d68e123`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Checks typed category identity and null/undefined membership used by `applyFilter`.

### S06. `packages/explorEDA/src/hooks/useFieldFilter.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/hooks/useFieldFilter.ts); 2,606 repository bytes.
- Git blob SHA-1: `5024de123087bf67d3f27caee230ac85ad033301`; independent source-byte recomputation matches.
- SHA-256: `ca0cf2ff3c9b4468dd9c2d0599327ec671a15e7c2ef481c0b1dbfdded4c57410`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Confirms filter ownership and the summary-chart update performed by the Missing action.

### S07. `packages/explorEDA/src/lib/declaredFieldTypes.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/declaredFieldTypes.ts); 951 repository bytes.
- Git blob SHA-1: `4087288902ac640c1973330277eb58b2373ee2a0`; independent source-byte recomputation matches.
- SHA-256: `7d93680df986f01768e16dafb4ea2fccc7449f64d2c229919ce199ca63f3f951`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Resolves host `number` to internal `numeric`, required for the preview/apply counterexample.

### S08. `packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/SummaryTable/components/FieldInspector.tsx); 23,271 repository bytes.
- Git blob SHA-1: `bff552731cabff1e59e31d20eb7327cb7e058fcc`; independent source-byte recomputation matches.
- SHA-256: `54a92d51d031af549d0ffc8fa9784f0dee5da8072fad47d94740ba488b9e9335`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: Confirms Automatic type leaves draft type absent, token-only editing is source-reachable, and preview/apply use that draft.

### S09. `packages/explorEDA/src/providers/lib/dataLayerState.ts`

- Ref: `f4cacdde180e16ad814451a8c064e394535565d6`; [pinned source](https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/providers/lib/dataLayerState.ts); 804 repository bytes.
- Git blob SHA-1: `76b54c6a71987c813850368dd261c8d8f19c5a93`; independent source-byte recomputation matches.
- SHA-256: `2469556f6e39537ff394ff4b242cd0da5aee866907568f0f2685e87525ec1569`.
- Local materialization suffix excluded: 1 LF byte(s).
- Reason read: `initializeData` spreads each row and adds `__ID`; absent source properties remain absent, preserving the trace/batch witness.


## Completion record

Access succeeded; the requested baseline and 33 complete baseline files were independently verified. All 38 packet sections retain explicit provenance, with narrow supplemental reads identified separately. Provenance checks and documentary research executed; application tests, product interaction, and implementation did not. The remaining material gaps are exact local reproduction of the bounded predictions, current-main drift review, and evidence that a broader diagnostic changes a real repair decision. Assumptions remain explicit: native row fixture semantics, the declared stage/population/type for each count, and supplied local scheduling context for prior research.
