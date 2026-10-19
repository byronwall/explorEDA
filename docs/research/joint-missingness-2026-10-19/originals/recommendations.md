# Joint missingness and analytical eligibility: recommendations

**Decision date:** 2026-10-19. **Authoritative baseline:** `byronwall/explorEDA`, commit `9b16d78e3ed0742ed4d5858c1939fec9e758b510`, represented by the attached selected source packet. The preparation prompt and queue are local additions after that baseline.

**Recommendation:** conditionally adopt one small bundle that explains existing field/conversion and chart eligibility behavior, accompanied by documentation and a runnable indicator example. Defer a new joint-pattern diagnostic. No feature implementation is approved or completed by this research.

Source access is sufficient for this product decision. It is insufficient for an implementation-ready promise about rendered counts, provider populations, stable record identity, or excluded-row trace access. Relevant renderers, snapshot builders, provider implementations, and trace implementations are absent. Inspect those exact local dependencies before changing their consumers. The supplied old intent's statement about the registry does not establish the absence of every comparable feature in the current full repository.

The root research process executed an independent explicit-classification arithmetic checker for the ten-row fixture. That validates the specified oracle's arithmetic; it did not execute repository parsers, chart helpers, tests, or UI. Selected source tests were read. Browser checks, author observations, type checking, and repository validation remain proposed. See [proof-plan.md](proof-plan.md) for the complete fixture, executed/proposed ledger, and rejection gates; [joint-missingness-decision.md](joint-missingness-decision.md) for comparative research; and [research-queue.md](research-queue.md) for retained priorities.

## Disposition register

| ID | Disposition | Concrete direction |
| --- | --- | --- |
| JM-01 | keep | Preserve the shared parse/filter/trace contracts. |
| JM-02 | adopt-as-proposal | Clarify field, conversion-preview, and raw/effective meanings. |
| JM-03 | adopt-as-proposal | Explain each chart's own eligibility and inspection population. |
| JM-04 | adopt-as-proposal | Pair those changes with docs and an upstream-indicator example. |
| JM-05 | defer | Reconsider a bounded exact-pattern table only after a demonstrated task gap. |
| JM-06 | investigate | Resolve categorical-blank and preview-valid interpretation mismatches locally. |
| JM-07 | investigate | Observe the author comparator while keeping the local trust journey first. |
| JM-08 | reject | Exclude error scoring, mechanism diagnosis, imputation, and monitoring expansion. |
| JM-09 | keep | Preserve queue order and prior research ownership. |

These are stable reconciliation IDs, not nine implementation milestones. Confidence below separates source semantics from unobserved user benefit. Synthetic examples establish discriminating cases; they do not establish demand.

## JM-01 — Preserve shared parsing and existing interaction contracts

**Disposition: keep.**

**Evidence.** `packages/explorEDA/src/lib/valueParsing.ts` provides `isMissingValue` (lines 15–21), `parseNumber` (32–37), `finiteNumber` (101–104), and `parseBoolean` (119–124). Numeric zero is finite; false is valid Boolean data but is not numeric. Blank strings are missing under the shared predicate; nonfinite numbers and bad numeric text fail numeric eligibility. `packages/explorEDA/src/hooks/applyFilter.ts::applyFilter` separately specifies value/range/text/date-range matching. `CODING_STANDARDS.md` requires sanctioned parsing and existing mark-selection/Alt-click/Alt-Enter or header-trace access.

**Proposal.** Keep those contracts as the baseline. Explanations should call the existing predicates and identify their target type, settings, field set, and population. Retain React/TypeScript and current filter ownership. Preserve existing source identities when explaining contributors; first inspect the actual identity and trace wiring locally. Do not add an Inspect button to each chart or invent a generic failure filter.

**Alternative.** A new universal missingness predicate could simplify display code but would silently reinterpret categorical blanks, conversions, or numeric exclusions. A new filter kind would add persistence and ownership obligations. Neither is needed to research or explain the current behavior.

**Benefit and cost.** Authors can compare readings without a second parser or implicit coercion. Maintenance cost is low while reusing existing helpers; proof cost includes numeric zero, valid false, blank, configured token, malformed numeric text, nonfinite text, absent property, and filter ownership.

**Confidence and validation.** High confidence in inspected helper semantics; end-to-end identity confidence remains conditional. Keep this recommendation unless local execution reveals a bounded defect. Treat any semantic correction as an explicit reviewed decision with its own evidence, rather than folding it into wording work.

## JM-02 — Make existing field and conversion explanations precise

**Disposition: adopt-as-proposal.**

**Evidence.** `packages/explorEDA/src/lib/fieldSettings.ts::buildConversionPreview` (339–382) counts any non-nullish raw value as valid when no explicit conversion is active. With conversion, it separates missing from failed values. `convertFieldValue` (106–143) makes both error-free missing inputs and failed conversions effective undefined. `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts::calculateValueStatistics` exposes numeric `nullCount` and `excludedCount`. `packages/explorEDA/src/components/FieldList/FieldRowReadings.tsx` renders missing counts and supports a missing-only callback, but its compact readings do not render `excludedCount`.

**Proposal.** Explain the difference among raw absence/blank, configured-token handling, conversion failure, effective missing values, and finite numeric measurements in the existing inspector/field surfaces. Name the preview's actual population after inspecting the provider. Preserve the counters; avoid presenting no-conversion “valid” as “usable in every chart.” Explain that applying numeric conversion can increase effective missing counts while leaving finite pair membership unchanged.

**Alternative.** Leave counts unchanged and add only documentation if the author comparator shows that sufficient. A standalone heatmap would still need the same distinctions and could lose conversion causes if built only from effective values.

**Benefit and cost.** The author can determine whether a disappointing count comes from input absence, a configured token, or a failed conversion. Cost is bounded copy/presentation work plus source/consumer inspection. A new failure ledger or cause engine is outside this proposal. `FieldInspector.tsx` already displays raw/runtime examples and failure ordinals (507–567): the helper caps examples at eight; failures initially show twelve with a show-all control. The rendered failure entries are plain text, so convenient stable-key row navigation is not assumed delivered.

**Confidence and validation.** High confidence in the semantic gap; medium confidence in workflow benefit. Adopt only if the proposed author task improves over current controls/docs. Reject scope requiring reconstructed causes from effective undefined without authoritative raw evidence.

## JM-03 — Explain chart-specific populations and existing counts

**Disposition: adopt-as-proposal.**

**Evidence.** `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts::pairedStats` (29–59) evaluates finite X/Y pairs over `group.ids`. Its `missingX` means unusable X; `missingY` means unusable Y only after X passed. `ScatterMatrix/matrixPlan.ts::planMatrixLayout` (629–741) computes each cell's own pair count; `planMatrixSelection` (825–856) counts selected live rows independently of a particular cell's eligibility. `ParallelCoordinates/parallelPlan.ts::planParallelCoordinates` (397–451) emits complete lines across retained axes, records omitted IDs, and counts selected complete lines. The shorter chart paths in this paragraph share `packages/explorEDA/src/components/charts/`.

**Proposal.** Explain each existing statistic with its field set and denominator: the pre-eligibility base, contributors to that statistic, and its own-selection subset where available. Preserve sequential scatter buckets and label their conditional meaning. Distinguish matrix pair counts from whole-matrix selected rows and parallel complete lines from overlapping per-axis omissions. Explain viewport clipping separately from analytical eligibility. Locate actual UI consumers locally before specifying label changes: these planners largely produce data, not rendered count controls.

**Alternative.** A common complete-case mode or universal “valid rows” counter could make numbers appear comparable while changing the analytical question. Keep current semantics and use chart-specific docs if no UI change earns its cost.

**Benefit and cost.** An author can explain why loaded, linked-selected, paired, and complete-line counts differ. Maintenance follows three existing chart contracts. Proof cost is meaningful: included and omitted IDs, peer/own/local scope, retained axes, zero rows, and inspection entry points must agree. Test-source trace expectations do not prove that excluded-row UI access is wired.

**Confidence and validation.** High confidence that denominators differ; conditional confidence in current wiring. Adopt only after snapshot/provider/trace inspection. Reject an explanation that derives excluded records from already filtered eligible marks or promises an unverified inspection base.

## JM-04 — Ship the documentation and indicator comparator together

**Disposition: adopt-as-proposal.**

**Evidence.** `AGENTS.md` requires docs and runnable examples in the same milestone as a user-visible feature. `apps/demo/src/docs/pages/fields.mdx` documents filtered missing counts and their action; `summary.mdx` gives little eligibility detail. `scatter.mdx`, `scatter-matrix.mdx`, `parallel-coordinates.mdx`, and `filters.mdx` provide existing teaching locations. `apps/demo/src/demos/examples.ts::examples` already references scatter-matrix, Palmer-penguin, and scatter-trace examples; their imported implementations were not supplied. `packages/explorEDA/src/types/FilterTypes.ts::Filter` supports ordinary value/range/text/date filters, without a dedicated joint-pattern type.

**Proposal.** In the same proposed M1, add a small documented recipe for upstream raw-missing and numeric-eligibility indicators, plus a runnable version of the ten-row example using existing chart types. State how the flags were computed and their population. Preserve stable record keys. Demonstrate that A and B each have one missing value per selected field among four rows, while A has one complete XYZ row and B has three. Document conversion and peer filtering separately. The fixture's r05 omits Y; r08 carries X as numeric text `"8"`.

**Alternative.** Retain the recipe entirely upstream if embedding it in the demo requires new calculation syntax, APIs, or preparation features. Exact example/settings/coverage wiring must be inspected before promising implementation paths beyond the supplied catalogue.

**Benefit and cost.** This offers a concrete baseline comparator and an adequately served workflow for authors who already prepare indicators. Maintenance includes the six named docs pages where relevant, one runnable example, and existing docs/example gates; author effort to prepare and keep indicators aligned remains a real tradeoff.

**Confidence and validation.** High confidence in the fixture's logical distinction; medium confidence in author usability. Adopt if the recipe remains short and executable at the stated representation. Prefer docs alone if they solve the task; reject an example that requires new product scope to be runnable.

## JM-05 — Defer a separate joint-pattern diagnostic

**Disposition: defer.**

**Evidence.** `docs/intent/missingness-and-expected-records/intent-brief.md` calls the diagnostic uncommitted and requires a pattern that field summaries hide. Current source already supplies missing-only actions and conversion triage. The explicit fixture demonstrates different joint patterns with equal marginal counts, but no observed customer task establishes that a new surface is necessary. `FilterTypes.ts` supplies no direct failure/pattern predicate; arbitrary pattern selection is therefore not proven a trivial reuse of filtering.

**Proposal.** Reconsider only a read-only exact pattern-frequency table over two to six explicitly selected numeric fields, if the local comparator demonstrates an unresolved task. A binary pattern over six fields has at most 64 possible patterns; display observed counts and stable-key membership. This is a deferred candidate boundary, not an API or implementation specification. A full row-by-field matrix, generalized UpSet interface, automatic field selection, and unrestricted all-column exploration are outside the bundle.

**Alternative.** Current field filters, chart-specific counts, upstream indicators, and docs may solve the task adequately. A matrix can preserve row ordering; an intersection display can compare sets; both add interaction and proof obligations that need an actual task advantage.

**Benefit and cost.** If justified, the table could answer exactly which combinations remove records without repeated manual intersections. Maintenance would include representation switches, field-order/mask stability, scope, row tracing, empty states, and keyboard operation. The 64-pattern bound is arithmetic, not a measured performance claim.

**Confidence and validation.** High confidence in the bounded mathematical case; low confidence in demand. Change disposition only after an author cannot reliably answer the named task with the explanation/indicator baseline and a minimal prototype demonstrates a clear gain. Otherwise keep deferred or close as NO-GO.

## JM-06 — Investigate semantic inconsistencies without silently correcting them

**Disposition: investigate.**

**Evidence.** `statisticsCalculator.ts::calculateValueStatistics` counts blanks as missing for numeric fields (77–110), but nonnumeric profiles count only null/undefined and retain blanks as categories (142–168). `applyFilter.ts::applyFilter` (12–17) lets a nullish value selection match blanks through `isMissingValue`. Separately, `fieldSettings.ts::buildConversionPreview` labels present unconverted blank/bad/nonfinite values valid. Thus neither a categorical missing count nor a preview-valid count can be substituted for numeric eligibility.

**Proposal.** Inspect the actual field-control consumers, categorical helpers, and provider conversion paths in the integration checkout. Record whether the blank discrepancy is intended and whether existing wording makes preview-valid meaning clear. Preserve raw and effective fixture projections while deciding. If a defect exists, identify its affected contract and disposition explicitly; M1 is not permission to reclassify data silently.

**Alternative.** Keep intentional behavior and clarify labels/docs. A uniform null definition would change category distributions and filtering, potentially exceeding this research's explanation boundary.

**Benefit and cost.** Authors avoid interpreting a displayed count as a guaranteed action-result count. The investigation is small; a semantic fix could carry broader compatibility, saved-state, and test obligations. Do not preapprove that larger cost.

**Confidence and validation.** High confidence in the source-level discrepancies; unknown user impact. Close this investigation when exact categorical blank and no-conversion preview examples establish intended behavior and matching copy. Escalate only a reproduced, bounded disagreement. Source comments or desired uniformity alone do not constitute a defect.

## JM-07 — Observe the author comparator after the first local trust check

**Disposition: investigate.**

**Evidence.** `docs/intent/current-analysis-trust/intent-brief.md` prioritizes source membership, finite contributors, export, history, and restore in one uninterrupted task. The supplied research queue places the local trust journey first. `useFilteredFieldProfiles.ts::useFilteredFieldProfiles` (82–117) demonstrates why a globally filtered profile can omit excluded records and why an owner's field distribution can use a different base. These findings require local observation rather than another broad product survey.

**Proposal.** Preserve that first task, then observe a named author answering the fixture questions using current Fields, conversion preview, charts, Rows/traces, and indicator recipe. Compare with the smallest M1 explanation prototype. Require exact keys and a verbal explanation of denominators, including A/B completeness, r09/r10 conversion causes, and W's zero complete cases. Use the acceptance/rejection gates in the proof companion; do not treat fixture arithmetic as usability evidence.

**Alternative.** If current tools plus the recipe succeed, choose documentation or no product change. If the prerequisite selection/export/undo/reopen task fails, repair its bounded disagreement before introducing another analytical surface.

**Benefit and cost.** This identifies whether friction lies in discovering controls, understanding counts, or inspecting records. Cost is one bounded observed task, keyboard/row-inspection proof, and specified 1280/783/390-width checks; no participant study or demand estimate has been performed.

**Confidence and validation.** High confidence that this observation discriminates between product directions; user-benefit confidence remains provisional. Stop at the first falsifiable disagreement and record actual sets/settings. Reject expansion when the comparator cannot demonstrate an advantage.

## JM-08 — Reject interpretive and platform expansion

**Disposition: reject.**

**Evidence.** The supplied mission forbids imputation, inferential diagnosis, autonomous cleaning, and monitoring expansion. `docs/intent/missingness-and-expected-records/intent-brief.md` distinguishes missing values from absent expected records and explicitly rejects automatic error labeling or an ingestion/rules platform. The inspected source computes descriptive counts, conversions, and chart membership; it supplies no evidence identifying the reason observations are absent.

**Proposal.** Keep error/quality scores, statistical missingness-mechanism tests, automatic causal explanations, imputation recommendations, monitoring, and expected-record reconciliation outside this decision. Do not turn a recurring mask into an assertion of bias or a missingness mechanism. A configured null token expresses settings, not proof that the source was wrong. A synthetically missing record says nothing about an expected sampling universe.

**Alternative.** Show descriptive patterns, row keys, exact denominators, and source-provided context. If a real task later requires modeling assumptions or an expected-record catalogue, route it to a separately scoped owner with the necessary evidence.

**Benefit and cost.** Authors receive auditable descriptions without unsupported diagnosis. Maintenance avoids a second product category and statistical assumptions that this tool cannot establish from patterns alone. Proof remains focused on current row semantics.

**Confidence and validation.** High confidence in this boundary. Reject any M1 change requiring these additions. A future scope change needs a new explicit task; the current synthetic counterexample and competitor capabilities cannot authorize it.

## JM-09 — Keep the continuing queue and prior ownership intact

**Disposition: keep.**

**Evidence.** The supplied `docs/research/joint-missingness-2026-10-19/research-queue.md` preserves local trust, SQL author proof, refresh identity, capacity, and preparation-author observation. It attributes preparation to PR 451, freshness to PR 452, and time-series axes/inspection to PR 454. These are supplied handoff facts; this research does not independently establish their current public PR status. The corresponding prior intents remain proposals unless current source establishes delivery.

**Proposal.** Update the selected joint-missingness entry with this conditional explanation-first decision, then return effort to its local comparator at the existing priority. Keep other queue order and ownership. Do not restock the queue with another preparation survey, shared-refresh architecture, named baselines, generalized uncertainty feature, or derived-output platform proposal.

**Alternative.** Launch a broader research track only when the next local observation produces an essential question that existing evidence cannot answer. At most two focused new questions are allowed by this mission; neither should repeat settled surveys.

**Benefit and cost.** Owners receive a small, reconcilable decision rather than competing initiatives. Maintenance is a reasoned queue update and stable cross-references, with minimal ongoing research overhead.

**Confidence and validation.** High confidence in preserving supplied priorities; future prioritization depends on task evidence. Keep until a named owner and observed blocker justify changing order. Integrators retain Git/PR and implementation decisions.

## One bounded proposed milestone: M1

M1 combines JM-02, JM-03, and JM-04 after the local prerequisites in JM-06/JM-07. It uses the supplied field/preview components and chart count producers, their locally verified existing consumers, the six named docs pages, and one runnable example registered through the real demo catalogue/coverage wiring. It creates no diagnostic chart, parser, filter kind, service, or generalized quality system.

The proof companion owns implementation prerequisites, exact commands, interaction tasks, and stop gates. **All M1 product work and runtime proof remain proposed.** If wiring cannot support a truthful, inspectable explanation at this boundary, or if the baseline task is already adequate, choose docs-only or NO-GO and retain the deferred diagnostic disposition.
