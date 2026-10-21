# R026 — Missing-state accounting decision

**Research date:** 2026-10-21, America/Indianapolis.  
**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA).  
**Pinned baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`.  
**Intended review branch:** `codex/missing-state-accounting-research-2026-10-21` — not created by this study.  
**Scope:** research and review proposals; no application implementation or Git mutation.

## Decision

**Adopt the stage-specific accounting contract and its research documentation. Retain the current category and measurement semantics. Investigate three bounded consistency problems before deciding on a shared diagnostic classifier. Defer the classifier; reject a universal value-state enum for this scope.**

The twelve-row fixture can be reconciled without redefining a blank category as a missing measurement everywhere. Its important differences are attributable to population, value stage, target interpretation, and operation. A conversion preview's `validCount`, a numeric profile's contributing values, and a calculation's successful results answer different questions. Their totals should conserve their own population; they need not be numerically equal.

Three source-predicted problems deserve focused local proofs:

1. A categorical field's missing-count action can advertise three missing rows and select five, because the profile counts nullish values while the action also matches blank text.
2. A token-only conversion preview can ignore a host-declared numeric type even though Apply honors it. On the same twelve raw rows, this changes the predicted conversion outcome from eight valid/four missing/no failures to two valid/six missing/four failures.
3. Calculation tracing and batch calculation construct different variable maps for an absent source property. A direct field reference can be successful-but-missing in batch results and an undefined-variable error in the row trace.

These are **source predictions, not reproduced product defects**. The application, React hooks, existing Vitest tests, browser flows, and repository gates were not executed. The study executed provenance verification, independent ledger arithmetic, and artifact integrity checks only. Existing test files are evidence of asserted contracts, not fresh passes.

### Dispositions for Codex review

| ID | Disposition | Bounded decision |
| --- | --- | --- |
| MS01 | **Adopt** | Integrate the row ledger, conservation rules, scope explanations, and a proposed teaching example. |
| MS02 | **Investigate** | Align missing-action membership with its advertised count; distinguish missing from excluded in overview copy. |
| MS03 | **Investigate** | Make preview and Apply resolve the same effective type for a host-declared field. |
| MS04 | **Investigate** | Establish batch/trace agreement for absent properties without discarding dependency errors. |
| MS05 | **Defer** | Add a small private diagnostic classification only if the bounded proofs demonstrate an unmet repair task. |
| MS06 | **Reject** | Do not introduce a universal missing/invalid state model, public state API, or automatic cleaning system. |

“Adopt” means a recommendation for research/document integration. It is not implementation approval. No named customer demand was supplied. That does not block investigating a correctness boundary; it limits claims about product value and expansion.

## 1. Access and baseline gate

**GO for this source-grounded research.** The GitHub connector returned repository ID `933467100`, owner `byronwall`, name `explorEDA`, default branch `main`, and read permission. The exact baseline commit was retrieved; its message is the merge of PR463 collecting the research catalogue. The task's supplied pin, not a moving branch, defines this study. This does not assert that `origin/main` still points at that commit.

The attached packet contains **38 sections**: 33 complete baseline files, two selected baseline JSON record sets, two explicitly local additions, and one historical PR455 summary. All 33 complete files were compared with GitHub at the pin; their Git blob hashes also match. For 32 sections, exactly two packet-separator LF bytes were removed before comparison. The final provider section matched byte for byte without adjustment. The seven selected idea records and seven review records match the corresponding pinned JSON records. The PR455 summary matches `dcd9cfaea4d170eb881c2cca9e7f6178b904330e`.

The prompt's Mac checkout path is a handoff location, not this execution environment. The packet and narrowly fetched source files do not form a runnable repository. No checkout, dependency installation, test configuration, dev server, or browser run was established. The delivered evidence therefore cannot clear a runtime correctness gate.

**Inputs and provenance:**

- Prompt SHA256: `8aa8382537ac41f55c8762864f7f7461a389846c8628f7c12adb1e474fa42c7a`.
- Packet: 285,788 bytes; SHA256 `00610a0f82398652b9cab4db0f0ad0801d393cc6bf1946a072e0fb80c1ce3b2e`.
- The catalogue brief retains its older research baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`; it is prior framing, not the implementation pin for this study.
- The full file-by-file read and verification inventory, supplemental source receipts, and current external URLs appear in `sources-and-contracts.md`. This report independently gives the source paths and symbols supporting every recommendation.

**Model request:** Pro at power 5/5 was requested. This environment exposes no independent control or attestation for that user-interface power setting; no configuration change is claimed.

## 2. Evidence discipline

| Label | Meaning | What it permits |
| --- | --- | --- |
| **F — source fact** | Verified source text at the stated pin, including existing test assertions. | Statements about the code's branches and declared contracts. |
| **P — source prediction** | A fixture outcome inferred by following those branches. | A concrete expected result for a future local proof. |
| **A — executed arithmetic** | Independent set membership/conservation calculations with no repository imports. | Verification that the proposed ledger is internally consistent. |
| **D — documented comparator contract** | Current official documentation read on the research date. | A narrow alternative to consider; not a result from running that product. |
| **H — hypothesis/proposal** | Product interpretation, user benefit, or a prospective change. | A review question with an explicit rejection condition. |

No prediction is promoted to product evidence merely because its arithmetic balances. No difference is called a defect solely because two counters have different values.

## 3. What must remain distinguishable

The diagnostic unit is **one existing source row, one field, one value stage, one consumer, and one explicitly named population**. An absent property is not an absent record. All twelve fixture records exist.

A useful ledger retains these dimensions without making them a new public data model:

- **Source provenance:** whether the row owns the property; the raw scalar value and type; the difference between explicit `undefined`, `null`, empty text, whitespace, a configured token, invalid text, and a nonfinite number.
- **Conversion context:** no conversion versus an explicit operation; effective target type; date preset; exact null-token settings; successful output, recognized missing input, or failure reason.
- **Effective state:** the value visible to profiles, filters, and calculations after settings apply. Multiple raw causes can intentionally produce `undefined` here.
- **Consumer eligibility:** finite numeric measurement, accepted date, typed category, missing-filter membership, or a calculation result/error. Eligibility is contextual.
- **Population:** all raw rows, all effective rows, current filtered rows, owner-excluded context, or a paginated preview. Pagination does not shrink the computation's denominator.

These distinctions change a repair decision in different ways:

| Distinction | Decision it can change | Visibility needed |
| --- | --- | --- |
| Absent property vs explicit `undefined` | Inspect source schema/row construction; diagnose trace parity. | Raw inspection or targeted trace detail; not separate headline counters everywhere. |
| Nullish vs empty/whitespace text | Preserve a meaningful category, choose null tokens, or inspect broad missing selection. | State the consumer's rule; preserve raw text. |
| Configured `NA` vs failed numeric conversion | Accept a declared missing token or correct a bad measurement. | Conversion outcome and original row/value together. |
| Invalid text vs numeric `Infinity` | Repair source parsing/value entry or investigate a nonfinite calculation/input. | Reason detail where an actual repair is performed. |
| Zero vs missing | Retain a real numeric contributor. | Zero must remain eligible; never use truthiness for numeric admission. |
| `false` vs zero | Preserve a Boolean category or explicitly decide whether conversion is appropriate. | `false` remains distinct; numeric parsing must not silently make it zero. |
| Invalid ISO date vs accepted date | Correct the calendar value or select the intended input preset. | Failure reason and raw date text; no silent calendar rollover. |
| Conversion failure vs later calculation failure | Fix input preparation, the formula, or an upstream dependency. | Separate conversion provenance and calculation error maps/traces. |

**F:** `packages/explorEDA/src/lib/valueParsing.ts` (`isMissingValue`, `numericExclusionReason`, `finiteNumber`, `parseDateText`, `timestampOf`); `packages/explorEDA/src/lib/fieldSettings.ts` (`convertFieldValue`, `applyFieldSettings`, `buildConversionPreview`); `packages/explorEDA/src/lib/calculations/CalculationState.ts` (`executeCalculation`, `traceRow`).

## 4. Reconciled findings

### 4.1 Deliberate differences that should be preserved

**F/P:** With no conversion settings, `buildConversionPreview` passes through each raw value. Its valid partition is the non-nullish, non-error partition, not finite numeric measurements. For the twelve rows this predicts **9 valid + 3 missing + 0 failed = 12**. Blanks, false, and Infinity can belong to that valid partition. This is not a broken numeric validator: no numeric conversion was requested. PR455 had already identified this distinction; the present study reuses it.

**F/P:** The raw numeric profile probe predicts **2 finite + 5 missing + 5 excluded = 12**. The mixed fixture naturally infers categorical. A numeric raw profile therefore requires a deliberate helper type override or host-declared number type with no conversion setting; it is not the same operation as choosing an explicit numeric conversion in the editor.

**F/P:** Categorical profiling counts only nullish values as missing and preserves present scalar categories. It therefore predicts **9 category values + 3 missing = 12**, including separate empty and whitespace strings, false, zero, and Infinity. Configuring `NA` as a null token with categorical interpretation yields **8 category values + 4 missing = 12**. It does not convert all categories into strings or erase blanks.

**F/P:** Explicit numeric conversion with token `NA` predicts **2 valid + 6 recognized missing + 4 failed = 12**. After Apply, both the six recognized-missing inputs and four failures have missing effective values. The numeric profile predicts **2 finite + 10 missing + 0 excluded = 12**. No rows disappeared. Preview failures supply conversion provenance; effective values supply the downstream measurement population.

**F/P:** Strict ISO conversion with `NA` predicts **0 valid + 6 missing + 6 failed = 12**. Numeric zero fails this explicit text-date conversion, while `timestampOf(0)` can be a valid epoch timestamp for a date distribution. The parser entry point matters. The invalid day `2025-02-30` is rejected rather than rolled forward.

**F/P:** `calculateValueStatistics` uses category counting for all nonnumeric profile types, including datetime. A date distribution separately applies `timestampOf`. A declared date profile can therefore retain present categories that a date distribution cannot place. That difference needs a documented projection, not a forced identical counter.

**F:** Numeric `uniqueCount` includes every distinct present raw/effective value, even a blank or excluded value. It is neither the number of contributors nor an additive state bucket. `fieldProfiles.test.ts` explicitly asserts this behavior. Do not “repair” conservation by subtracting unique counts from row totals.

### 4.2 Scope differences are part of the contract

**F:** `DataLayerProvider.getFieldConversionPreview` reads all `rawData`. `useFilteredFieldProfiles` reads effective values and uses the current filter population, with separate owner-exclusion behavior for a chart's edited field or a workspace field being edited. Calculated-field type is inferred from its full result column before filtered values are summarized.

**P:** The fixture's independent `cohort = 'focus'` filter keeps eight IDs. Its applied numeric profile is **2 finite + 6 missing = 8**, while the conversion preview still describes twelve raw inputs. That difference is not a reconciliation failure.

**F:** `updateFieldSettings` clears filters on the changed field and rebuilds effective data/calculations when type, date preset, or nonempty token settings change. The study deliberately filters a separate cohort field so before/after membership stays comparable. `CalculationPreview` explicitly describes all loaded rows before chart filters and displays pages of five rows. Its failed-only mode changes the displayed subset, not the underlying computation population.

### 4.3 Bounded inconsistency candidates

**P — MS02:** `FieldRowReadings` advertises `profile.nullCount`; `FieldListRow` supplies an action using `{type:'value', values:[null]}`; `applyFilter` additionally matches `isMissingValue`. On the raw categorical fixture, the advertised three rows are `{r01,r02,r03}`, but the predicate admits `{r01,r02,r03,r04,r05}`. The profile and predicate can each be intentional; promising “these rows” across unequal memberships is the consistency problem. Separately, `FieldOverview.FieldCard` labels `population.missing + population.excluded` as “missing.” A numeric view can therefore label ten rows missing while the numeric profile has five missing and five excluded. The overview count is a noninteractive span; this is not a claim that its span itself sets a filter.

**P — MS03:** The host type map `{x:'number'}` resolves to internal `numeric`. The provider's Apply path incorporates it; the preview path raw-infers type without it. A token-only `NA` draft under Automatic can therefore show categorical **8/4/0** while numeric conversion produces **2/6/4**, then an effective numeric **2/10/0** profile. `FieldInspector` initializes an absent setting as `{}`, keeps Automatic when `draft.type` is absent, merges null-token edits without inserting a type, and passes that draft both to preview and Apply. This establishes a source route to the mismatch, not a browser observation. Explicitly choosing numeric is a useful control case because both paths then receive the same type.

**P — MS04:** `CalculationManager.executeCalculation` inserts every dependency into its variable map, including absent source fields as `undefined`. `traceRow` fills only calculated dependencies beyond `Object.entries(row)`. `Calculator` distinguishes a missing map entry from a present entry holding `undefined`. The inspected `initializeData` initializer spreads each original row and adds `__ID`; it preserves an absent `x` property. A direct `x` reference on r01 can therefore differ in error status between execution and trace, while r02 with explicit `undefined` supplies the control. Normalize context construction only if the local proof confirms the difference; do not impose a new missingness model on every expression.

### 4.4 Calculated propagation is not one universal rule

**F/P:** The registry's `numericValue` rejects missing/invalid numeric inputs; the engine also rejects an evaluated nonfinite numeric result. A raw identity expression is predicted to succeed with eight present values, succeed with three missing values, and fail on Infinity. Raw `x + 1` has two finite outputs and ten failures. After numeric conversion, identity has two present/ten missing/no failures, while `x + 1` still has ten failures but different input reasons.

**F/P:** The existing `count` function counts supplied arguments, including missing values. Its arguments are evaluated first, so raw `count(x)` can fail on Infinity; after numeric conversion it can return one even for a missing input. It is not a missingness indicator. A dependent null comparison can succeed after an upstream failure has become an undefined result; the upstream error map remains separate. The trace already exposes dependencies. This warrants documenting the distinction and exact tests, not assuming all downstream results should automatically inherit every upstream error.

**Negative result:** The frozen predeclaration expected categorical conversion with `NA` to remove blanks as well. Source tracing rejects that expectation: blanks remain categories. The report retains the original expectation and documents the correction. It does not rewrite the experiment to appear successful.

## 5. Alternatives and scores

Scores are explicit research judgments, not measured engineering estimates or user results. **C** is implementation/maintenance complexity, 1 low to 5 high; **A** is analytical clarity, 1 low to 5 high; **R** is preservation of raw distinctions, 1 weak to 5 strong. Lower C and higher A/R are preferred. The alternatives share the obligation to repair any proven count/action or preview/Apply inconsistency.

| Option | Scorecard and API impact | Assessment |
| --- | --- | --- |
| Retain contracts; explain stage/scope; prove bounded repairs | **C1 / A3 / R5**. Documentation and focused internal repair can avoid a new public API. | **Preferred starting point.** Explains the ledger and preserves intentional categories; must not excuse a failed identity proof with prose. |
| Detailed reasons only in conversion preview | **C2 / A4 / R5**. Existing preview already has failure rows/reasons; extra private explanation may suffice. | Useful if a conversion repair task still fails. Does not solve unrelated count/action or calculation-context divergence. |
| Small shared private diagnostic classification | **C3 / A4 / R5** if derived from raw rows and existing helpers, never authoritative over every consumer. | **Defer.** Adds a policy boundary and synchronization burden; approve only after an exact repeated reason-recovery failure. |
| Universal cross-product state enum used by every consumer | **C5 / A2 / R2** when it forces incompatible eligibility into one state. | **Reject for R026.** Either erases category/measurement meaning or grows into a combination of independent dimensions. |

The clarity score for a classifier is conditional. More labels can make a repair less clear when they merely restate the row's raw value. Complexity scores express relative surface area, not person-days or runtime cost.

### Narrow external comparisons

Official Arrow documentation separates validity from value payload and supplies separate null and finiteness predicates. pandas documents a missing-value policy in which empty strings and infinity are not missing, plus a separate numeric-conversion error/coercion choice. OpenRefine offers transformation previews, error-handling choices, and distinct blank/error inspection. These are alternative contracts, not authorities for changing explorEDA. They support preserving orthogonal questions and evaluating preview-based repair before adding a universal classifier.

Primary references, all retrieved **2026-10-21**:

- Arrow: [validity bitmaps](https://arrow.apache.org/docs/format/Columnar.html#validity-bitmaps), [is_null](https://arrow.apache.org/docs/python/generated/pyarrow.compute.is_null.html), and [is_finite](https://arrow.apache.org/docs/python/generated/pyarrow.compute.is_finite.html).
- pandas: [DataFrame.isna](https://pandas.pydata.org/docs/reference/api/pandas.DataFrame.isna.html) and [to_numeric](https://pandas.pydata.org/docs/reference/api/pandas.to_numeric.html).
- OpenRefine: [expressions and transformation error handling](https://openrefine.org/docs/manual/expressions) and [facets](https://openrefine.org/docs/manual/facets).

No comparator product was executed. These documentation contracts do not establish demand, compatibility, performance, or robustness for explorEDA; `sources-and-contracts.md` records the detailed claim limits.

## 6. Recommendations, costs, and rejection proofs

### MS01 — Adopt the accounting proof and teaching contract

- **Problem:** Cross-surface numbers can be misread when population, stage, and eligibility are implicit. Correct differences and candidate inconsistencies then look alike.
- **Repository evidence:** `lib/valueParsing.ts` (`isMissingValue`, `finiteNumber`, `timestampOf`); `lib/fieldSettings.ts` (`buildConversionPreview`, `applyFieldSettings`); `components/SummaryTable/utils/statisticsCalculator.ts` (`calculateValueStatistics`); `lib/fieldDistribution.ts` (`buildFieldDistribution`); `hooks/useFilteredFieldProfiles.ts` (`rowsFor`, `profileFrom`); `components/calculations/CalculationPreview.tsx` (all-loaded preview data and error precedence). Prefix for each path: `packages/explorEDA/src/`, at the pinned baseline.
- **Proposal:** Integrate the four research reports and retain the native twelve-row fixture, expected/predicted partitions, and conservation equations as the review record. Teach four questions: which rows, which stage, which interpretation, which operation. Make finite contributors explicit in explanations of numeric statistics.
- **Alternative:** Leave current explanations alone if the local proof and one repair exercise demonstrate that the existing labels already communicate those four answers. Do not add persistent chrome merely to repeat a tooltip.
- **Cost:** Low for research/document integration; a bounded fixture and focused checks for any later lesson. No runtime or performance benefit is claimed.
- **API impact:** None. No new exported types, saved-state keys, or data mutation.
- **Docs and runnable example:** Pair `apps/demo/src/docs/pages/fields.mdx` and `summary.mdx` with a proposed `missing-state-accounting` example using the exact native fixture in `row-ledger-and-proof.md`: inspect all rows, set numeric plus `NA`, filter `cohort`, and reconcile the two populations. Extend the existing `fields`/`summary` live-example routes or register one shared example through `apps/demo/src/docs/live/examples.ts` and the demo example catalogue. Registration locations are supplied by `docs/agent-guide.md`; the example is a concrete proposal, not an existing delivered demo.
- **Confidence:** High in the accounting need and source distinctions; untested in author comprehension.
- **Rejection proof:** Ask an author to identify exact contributing IDs and distinguish configured missing from failed conversion using current controls. If every repair decision is already supported, retain the research/test record and limit UI documentation expansion. No named author is required before the correctness tests.

### MS02 — Investigate missing count/action membership and display wording

- **Problem:** A label promising a row set should agree with the action's actual set. Separately, “missing” currently covers both missing and excluded in one surface and only missing in another.
- **Repository evidence:** `components/FieldList/FieldRowReadings.tsx` (`profile.nullCount`, `onMissingFilter`); `components/FieldList/FieldListRow.tsx` (`toggleFilter` with `[null]`); `hooks/useFieldFilter.ts` (`toggleFilter`); `hooks/applyFilter.ts` (value branch); `lib/categories.ts` (`categoryIncludes`); `components/FieldList/FieldOverview.tsx` (`FieldCard`); `components/FieldMetadata.tsx` (`fieldMetadata`). Prefix: `packages/explorEDA/src/`.
- **Proposal:** Prove exact categorical count-versus-action membership first. If confirmed, make the action-specific count and wording describe its broad missing-or-blank predicate, or choose an already-supported exact nullish selection if it can be done without changing saved filter semantics. Keep categorical blanks available as categories. Review overview text as separate missing/excluded counts or an accurately named combined count; review “not finite” wording because numeric exclusions also include false and nonnumeric text.
- **Alternative:** Documentation alone if the actual action does not select extra rows or if an existing equivalent control already exposes the intended set clearly. Do not globally redefine categories to make one button's count agree.
- **Cost:** Small display repair if it can derive counts from existing profiles; moderate if filter semantics or selection representation must change. That latter case requires a separate design review.
- **API impact:** Target none. Changing global `[null]` semantics or exported filter types would exceed this bounded proposal and needs explicit compatibility review.
- **Docs and runnable example:** Pair `fields.mdx` “Field actions” and `summary.mdx` count meaning with proposed `missing-state-selection`: raw category mode, compare the advertised count with exact clicked IDs, repeat after categorical `NA` conversion, then numeric conversion. Include the all-blank categorical control where `nullCount` is zero. Reuse the native fixture and test predicates in `row-ledger-and-proof.md`; a browser run must verify actual interaction and accessible text.
- **Confidence:** High in the source route; runtime and author benefit remain unverified.
- **Rejection proof:** Exact IDs and advertised count agree at the pin/current reviewed commit, or a smaller truthful label plus existing inspection answers the repair task. A shared classifier is rejected if this can be solved within the current profile/action boundary.

### MS03 — Investigate shared effective-type resolution for preview and Apply

- **Problem:** A preview of one operation should forecast that operation's result on the same inputs. Host-declared types can currently produce different conversion rules in preview and Apply.
- **Repository evidence:** `lib/declaredFieldTypes.ts` (`DECLARED_DATA_TYPES`, `declaredDataTypes`); `providers/DataLayerProvider.tsx` (`typeOverrides`, initialization, `updateFieldSettings`, `getFieldConversionPreview`); `components/SummaryTable/components/FieldInspector.tsx` (draft initialization, local helper `update`, Automatic option, null-token edit, Apply); `lib/fieldSettings.ts` (`buildConversionPreview`, `applyFieldSettings`). Prefix: `packages/explorEDA/src/`.
- **Proposal:** First run the host `{x:'number'}`/Automatic/`NA` token-only witness. If it confirms the predicted mismatch, reuse the existing target-type precedence consistently in the provider's preview and Apply paths. Keep raw inference separately identifiable when it is useful. Verify default, explicit type, declared unknown, and explicit override control cases.
- **Alternative:** Require an explicit type choice in this narrow workflow only if that is the intended existing product contract and it is clearly explained. Broadly reclassifying values does not solve a disagreement about which converter was requested.
- **Cost:** Bounded provider/editor reasoning and a regression fixture. No time estimate or performance assertion is justified before local verification.
- **API impact:** Aim for no exported API or saved-schema change; a private resolution helper may be sufficient. Audit semantics before changing preview's reported `inferredType` versus `effectiveType`.
- **Docs and runnable example:** Pair `fields.mdx` conversion guidance with proposed `declared-number-preview`: load the twelve native rows with host `fieldTypes={{x:'number'}}`, leave Automatic, add `NA`, capture preview row IDs/reasons, Apply, and reconcile `valid + missing + failed` with the effective profile. Repeat after explicitly choosing Number; that control should remove the type-resolution divergence.
- **Confidence:** High in the source prediction and editor route; no executed provider/browser proof.
- **Rejection proof:** A pinned provider test and real editor interaction use the same resolved type and predict every effective row, or an upstream layer demonstrably supplies an explicit type in every supported case. If the witness fails to reproduce, document why and close this proposal rather than broadening the state model.

### MS04 — Investigate batch/trace parity for absent source properties

- **Problem:** The explanation of a calculated result should agree with how that result was computed. The absence of an own property can affect map membership even when reading the value returns `undefined`.
- **Repository evidence:** `lib/calculations/CalculationState.ts` (`executeCalculation`, `traceRow`); `lib/calculations/engine/Calculator.ts` (`evaluateValue` literal branch, `evaluate`); `lib/calculations/functions/registry.ts` (`numericValue`, `count`); `providers/lib/dataLayerState.ts` (`initializeData`, `{ ...row, __ID: index }`); `components/calculations/CalculationPreview.tsx`. Prefix: `packages/explorEDA/src/`.
- **Proposal:** Run a direct field-reference calculation on r01 absent and r02 explicit undefined; compare stored value, row-local error, trace value, trace error, and dependency inputs. If different, align dependency context construction at that boundary. Keep successful missing values distinct from evaluation failure and keep upstream dependency errors inspectable.
- **Alternative:** Explain a deliberate distinction only if a real execution contract establishes why trace and computation must differ. Avoid changing arithmetic/null rules to patch a variable-map discrepancy.
- **Cost:** A small manager-level witness and potential internal context-building repair; follow with provider/editor proof. Full error-lineage redesign is separate work.
- **API impact:** Target none. Altering `CalculationResult`, public functions, or downstream failure propagation is not approved here.
- **Docs and runnable example:** Pair `calculated-fields.mdx` with proposed `calculation-missing-trace`: identity `x`, `x + 1`, `count(x)`, and a dependent null comparison on the same twelve rows before/after conversion. The report supplies executable expression fixtures and exact predicted results. Compare batch status with the selected row trace; do not teach `count(x)` as a present-value counter.
- **Confidence:** High at manager source level; product observation unverified.
- **Rejection proof:** Local execution/trace agree for absent and explicit undefined. At the inspected baseline, `initializeData` preserves absence, so normalization by that initializer cannot dismiss the witness. If a later integration baseline changes the input pipeline to materialize absent fields, record that changed-source control explicitly. Preserve the two-row witness as a negative result if the mismatch cannot occur. Broader dependency diagnostics require a separately demonstrated repair failure.

### MS05 — Defer a small private diagnostic classifier

- **Problem:** Effective `undefined` can hide whether its raw cause was absent/nullish, configured missing, blank, or failed conversion. A repair task may require that reason after Apply.
- **Repository evidence:** `lib/fieldSettings.ts` (`buildConversionPreview` preserves failure details; `applyFieldSettings` writes only converted values); `providers/DataLayerProvider.tsx` (`rawData`, `getFieldConversionPreview`); `lib/calculations/engine/Calculator.ts` (`evaluate`) and `lib/calculations/CalculationState.ts` (`executeCalculation`, `traceRow`) separate values and errors. Numeric/categorical branches in `components/SummaryTable/utils/statisticsCalculator.ts` (`calculateValueStatistics`) intentionally disagree on blank eligibility. Prefix: `packages/explorEDA/src/`.
- **Proposal if reopened:** Derive diagnostic reasons privately from raw value, property presence, exact settings, stage, and existing parser/converter results. Keep raw cause, conversion outcome, and consumer eligibility as separate dimensions. Reuse existing helper semantics; never let the diagnostic layer decide all category or measurement membership. No per-row provenance store is justified by this study.
- **Alternative:** Current failure rows/reasons plus raw inspection and the MS01 lesson. Preview-only detail is the next-smallest experiment.
- **Cost:** Moderate conceptual/maintenance cost because multiple consumers and settings revisions must stay aligned. Runtime cost is unmeasured; do not claim an optimization or regression.
- **API impact:** Must remain private for this proposal. No additions to public `FieldProfile`, `ConversionPreview`, row schemas, or saved analyses without a separate review.
- **Docs and runnable example:** If approved later, pair `fields.mdx` and `calculated-fields.mdx` with the same `missing-state-accounting` and `calculation-missing-trace` examples. Add a specific task: recover which applied missing rows were recognized `NA` versus failed numeric conversion, then fix only the failed inputs. A runnable comparison must show how current tools fail before introducing new labels.
- **Confidence:** High that reasons can matter; low-to-medium that a shared abstraction is necessary.
- **Rejection proof:** Existing raw inspection and conversion failure rows identify the exact repair set, or additional categories change no action. Also reject if the proposed abstraction must redefine preserved categorical blanks, serialize away source distinctions, or manufacture a single denominator.

### MS06 — Reject universal state semantics and scope expansion

- **Problem:** One exclusive state per raw scalar cannot simultaneously express categorical membership, numeric eligibility, strict date conversion, broad missing-filter membership, and function-specific calculation behavior.
- **Repository evidence:** `lib/valueParsing.ts` (`isMissingValue`, `timestampOf`) versus `components/SummaryTable/utils/statisticsCalculator.ts` (`calculateValueStatistics`) and `lib/fieldSettings.ts` (`convertFieldValue` datetime branch); `hooks/applyFilter.ts` (value filter branch); `lib/calculations/functions/registry.ts` (`numericValue`, `count`); `providers/DataLayerProvider.tsx` (`rawData`, effective `data`). Prefix for source paths: `packages/explorEDA/src/`. Intent boundaries: `docs/intent/missingness-and-expected-records/intent-brief.md` and `docs/intent/current-analysis-trust/intent-brief.md`.
- **Proposal:** Keep R026 about individual-value accounting. Reject a universal public enum, automatic null coercion, imputation, quality scores, inferred absent records, missingness-mechanism diagnosis, new services, and a new joint-pattern view.
- **Alternative:** A bounded, contextual private diagnostic under MS05, only after its rejection test fails; separate expected-record work requires an explicit expected population.
- **Cost avoided:** Cross-cutting policy migration and compatibility burden. No quantified savings are asserted.
- **API impact:** None in the adopted research outcome; rejecting a public model avoids new contracts.
- **Docs and runnable example:** No feature milestone is proposed, so no new demo is required. MS01's twelve-row counterexamples and the existing missingness intent document the boundary. Any future feature must identify its own docs page and runnable example before review.
- **Confidence:** High for rejecting a universal model under the supplied task and evidence.
- **Rejection proof for this decision:** Reopen only with a specific recurring repair task that survives current controls/preview-only comparison and needs shared diagnostics without collapsing consumer semantics. A named task may support expansion; a market or robustness claim alone cannot.

## 7. Integration order and GO/NO-GO gates

1. **Receive and verify artifacts — GO when hashes match.** Codex verifies all four report hashes against `manifest.json`, verifies the separately published ZIP/manifest digests, and preserves originals. The ZIP contains the reports plus manifest; the manifest intentionally does not hash itself.
2. **Review source/current baseline — GO for pinned findings; revalidate on change.** Read the evidence classifications and repeat the narrow witnesses at the integration commit. A changed branch can invalidate a source prediction without invalidating this historical study.
3. **Run bounded local proofs — NOT RUN here.** Execute the proposed source-dependent checks in a real checkout, then the relevant existing tests. Record exact IDs, values, errors, scopes, and command output. A source packet or arithmetic verifier cannot clear this gate.
4. **Review proposed repairs — conditional GO.** Consider MS02–MS04 individually only when their witnesses reproduce or another concrete observation establishes the same problem. Keep each repair local to the responsible contract.
5. **Docs/example/browser gate — NOT RUN here.** Any adopted user-visible change must ship its named docs and runnable example together. Verify pointer/keyboard flows at 1280, 783, and 390 px, then the relevant docs examples and repository gates. Research-document integration alone does not claim these passes.
6. **Classifier expansion — NO-GO without new evidence.** MS05 remains deferred; MS06 remains rejected. Existing tools successfully completing the repair task is a stopping condition.

Working rules read: `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, and `docs/ui-defaults.md`. They require React/TypeScript, pnpm, compact scope-aware UI, paired docs/examples, focused verification, and one `pnpm check` before a review PR. This study makes no application changes; it does not fabricate an execution of those gates or create a changeset. Codex owns document integration, local gates, and the scoped review PR.

## 8. Prior research, queue, and closure

The pinned PR455 summary is reused for three findings: preview validity can differ from finite measurement eligibility; conversion can map multiple causes to effective missingness; and raw conversion previews and effective filtered profiles describe different populations. Its two-cohort joint-missingness arithmetic and author-demand gate are not repeated or imported as prerequisites for this correctness study. The summary explicitly says its browser/fixture product proofs were proposals. None becomes a pass here.

R026 remains the selected priority-1 study. The next eligible candidates remain **R043, R077, R001, R051** in that order. R008 is recorded as researched in PR464 by the supplied local queue; R011 overlaps PR461. Those surveys remain closed. The no-chart/workspace-filter-only distribution boundary discovered in supplemental source is a focused R051 referral, not a reason to launch a new scope survey. `research-queue.md` supplies the concrete next actions and stopping conditions.

**Access status:** GitHub read access and exact source pin verified; selected packet complete for the requested source study, supplemented only to close specific call-path and calculation-function gaps. No runnable checkout or product session.

**Files read:** All 38 packet sections, including the named rules, R026/catalogue/queue records, parsers, settings/profiles/tests, statistics, distribution/filter/UI paths, provider, calculation engine/state/preview, intent briefs, docs pages, and historical PR455 summary; narrowly pinned supplements are itemized in `sources-and-contracts.md`.

**Checks actually run:** Source/record/hash comparisons; predeclaration integrity; source-derived partition and filtered-set arithmetic; a native JavaScript representation check demonstrating the documented JSON-loss hazard; final Markdown/manifest/archive checks. No repository imports in the arithmetic checks. No application, browser, Vitest, typecheck, build, docs gate, comparator product, or performance run.

**Deliverables:** `missing-state-decision.md`, `sources-and-contracts.md`, `row-ledger-and-proof.md`, `research-queue.md`, `manifest.json`, and `missing-state-research.zip`.

**Unresolved gaps:** Actual product reproduction of MS02–MS04; validation of the workspace-only R051 scope case; author comprehension/repair usefulness; behavior after any subsequent source changes; full serialization round-trip guarantees. The provider's in-memory raw preservation is not a claim that JSON can preserve undefined or Infinity.

**Assumptions:** Native scalar fixture objects are retained without JSON transport; all rows exist; raw sources are not mutated during the experiment; the separate cohort filter holds membership stable; source predictions apply to the pinned commit. None of these assumptions authorizes implementation, Git push, merge, deployment, or a broad diagnostics platform.
