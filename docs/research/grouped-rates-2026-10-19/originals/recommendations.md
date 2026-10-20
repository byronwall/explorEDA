# Grouped rates: recommendations

Date: 2026-10-19. Project: **explorEDA**, React/TypeScript library and demo. Decision: **keep reusable rates deferred; demand remains unconfirmed**. The next useful evidence is one actual author task after the existing local trust proof, with current controls and upstream preparation available to reject a new API.

## Evidence and decision scope

These research recommendations authorize no implementation. No application changes, repository edits, commits, product tests, browser checks, or PR were performed. Static review and independently recomputed synthetic arithmetic establish neither demand nor completed interaction behavior.

The authorized source is `source-packet(7).txt`, identifying baseline `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Receipt: **296,375 bytes**; SHA-256 **88c5bc84d95608248ea1b96ab77e12be57514947db6a2a8ae2529867ec5211f0**. All 38 embedded file hashes matched their extracted contents. That verifies packet integrity, not independent correspondence to Git. The supplied branch name `codex/grouped-rates-research-2026-10-19` is provenance, not a branch created here.

Paths below cite the snapshot. Reading covered `AGENTS.md`, `docs/agent-guide.md`, `README.md`, `package.json`, selected intents/history, reducers, calculations, chart plans/tests, persistence, docs, and flights definitions. Missing context includes complete parsers, chart renderers/settings panels, crossfilter, history, Dashboard text implementation, and actual flights rows. The packet permits research GO; unconfirmed demand means prototype NO-GO.

## GR01 — Preserve the demand gate and keep the rates seed deferred

- **Problem / audience:** Byron cannot yet name a missing calculation from repeated use. A technically valid rate would not resolve that uncertainty. Audience: Byron as author and project maintainer.
- **Source evidence:** `docs/intent/reusable-analysis-metrics/intent-brief.md`, **My read**, **Expansion trigger**, and **Next step after confirmation**; `docs/intent/reusable-analysis-metrics/references/pro-candidates.json`, `current_priority: "seed-demand-unconfirmed"`; `docs/intent/current-analysis-trust/intent-brief.md`, **Next step after confirmation**. Historical descriptions are not current implementation facts.
- **Recommendation:** Retain deferred status. After the first local trust journey, ask the author to identify one decision, its current workaround, and evidence that the calculation is needed repeatedly. A synthetic demonstration alone does not pass this gate.
- **Alternatives rejected:** Immediate shared metrics, a survey of more enterprise products, or a documentation project justified only by hypothetical need. A short recipe remains available if a concrete task warrants it.
- **Benefit / cost:** Avoids permanent semantics and maintenance commitments before usefulness is known. Cost: a future author may temporarily prepare a calculation elsewhere; that friction becomes evidence to assess.
- **Public API / maintenance impact:** None now. Keep the existing contracts and queued scope intact.
- **Confidence:** High in deferral given the binding demand statement; unknown whether future use will reveal a repeated need.
- **Proof / rejection condition:** Reconsider only when a named repeated task fails a suitable existing recipe and a tolerable upstream workflow. If no task appears, deferral succeeds.
- **Local integration destination:** Proposed wording in `docs/intent/reusable-analysis-metrics/intent-brief.md`; preserve local trust first in `docs/research/grouped-rates-2026-10-19/research-queue.md`.

## GR02 — Offer a small eligible-indicator recipe when it answers the question

- **Problem / audience:** An author may request a count proportion that existing averages already express. Audience: authors with one row per eligible opportunity and a known binary outcome.
- **Source evidence:** `packages/explorEDA/src/lib/aggregates.ts`, `numericInputs`, `aggregateValues`, `summarizeGroup`; `packages/explorEDA/src/lib/calculations/functions/registry.ts`, `calculationFunctions`; `packages/explorEDA/src/lib/calculations/engine/Calculator.ts`, `evaluateValue`; `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`, `planMetricCard`.
- **Recommendation:** If appropriate, document an indicator: eligible successes are 1, eligible failures 0, exclusions missing with reasons. Three successes among five eligible known outcomes give `average = 3/5 = 0.6`. Converting a sixth unknown outcome to zero gives `3/6 = 0.5`; excluding it answers the complete-case question. The author must choose deliberately.
- **Alternatives rejected:** A new rate operator for this exact case; treating `avg(x,y)` as a dataset average; or implying percent formatting determines the denominator. Averaging row ratios is unsuitable for general exposure totals.
- **Benefit / cost:** Potentially solves a real question with existing arithmetic. Cost is a short explanation and verified example, including eligibility, row grain, filters, and numeric contributors.
- **Public API / maintenance impact:** No API expansion. Formula syntax and UI behavior still require the complete parser and running app before publishing a copyable recipe.
- **Confidence:** High in the arithmetic and selected reducer boundary; medium in end-to-end authoring until the omitted UI/parser paths are checked.
- **Proof / rejection condition:** A card scoped to the same group and an average-indicator bar must use identical eligible IDs and return 0.6. Reject the recipe if opportunities are aggregated into unequal batches or the requested denominator is exposure.
- **Local integration destination:** Conditional edits to `apps/demo/src/docs/pages/calculated-fields.mdx`, **In charts and tables**, and `apps/demo/src/docs/pages/metric-card.mdx`, **How it reads**; existing `calculations` and `metric-card` examples. Any flights extension belongs beside `apps/demo/public/daily-viz/projects/flights/carriers.eda` and its guide, after inspecting eligibility data. Existing count/mean views do not prove demand.

## GR03 — Require a task-specific population and denominator contract

- **Problem / audience:** Correct division can answer the wrong scientific question when inputs have different eligibility. Audience: the task author and anyone interpreting or exporting its result.
- **Source evidence:** `packages/explorEDA/src/lib/aggregates.ts`, `numericInputs`, `aggregateValues`, `AggregateResultRow`; `packages/explorEDA/src/lib/calculations/engine/Calculator.ts`, `evaluate` and division handling. Ordinary reductions select numeric contributors independently; row division rejects zero and nonfinite results.
- **Recommendation:** Record row/entity grain, numerator, denominator, units, scaling, common or separate populations, filter behavior, and missing/invalid policies before choosing a control. Distinguish a general count ratio, a subset count proportion, ratio of totals, mean row ratio, weighted mean, and category share. A hypothetical defects-per-part count ratio can exceed one; the binary recipe instead counts parts with a qualifying outcome. Denominator weighting equates a weighted mean with a ratio of totals only when the component ratios and suitable weights exist on the aligned population. Units alone cannot select the meaning.
- **Alternatives rejected:** Silent complete-case filtering, automatic zero filling, independent valid-value sums assumed to share a population, or a global rule rejecting every signed denominator. Separate populations can be intentional, but need separate provenance and are outside the proposed narrow candidate.
- **Benefit / cost:** Makes disagreements explainable and preserves domain judgment. Cost is a small author-owned definition. For the hypothetical exposure task, eligible rows have finite nonnegative integer events and finite positive hours; a true zero event count remains eligible. This is a task assumption, not an application default.
- **Public API / maintenance impact:** None now. Any future persisted contract would require visible undefined outcomes for empty/zero-denominator cases and explicit treatment of overflow, missingness, invalid values, and signed inputs.
- **Confidence:** High that these choices are necessary; no evidence selects universal scientific policies.
- **Proof / rejection condition:** Ask the author to classify missing events, missing hours, text events, zero hours, negative hours, and zero events at positive hours. If the policy is unresolved, stop feature exploration.
- **Local integration destination:** Proposed **Boundaries** and **What matters most** wording in `docs/intent/reusable-analysis-metrics/intent-brief.md`; carry the approved task definition into a later example's explanatory text.

## GR04 — Try upstream preparation with declared grain for exposure totals

- **Problem / audience:** A grouped exposure intensity may require two totals that current row formulas cannot compose across rows. Audience: an author comfortable preparing data outside explorEDA.
- **Source evidence:** `packages/explorEDA/src/lib/calculations/functions/registry.ts`, scalar `sum`/`avg`; `packages/explorEDA/src/lib/aggregates.ts`, `AggregateSpec`; `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`, `planMetricCard`. External comparator: [DuckDB Aggregate Functions](https://duckdb.org/docs/current/sql/functions/aggregates), accessed 2026-10-19, **Examples**, **Handling NULL Values**, **General Aggregate Functions**; supports grouped preparation and explicit contributor handling.
- **Recommendation:** First prepare numerator totals, denominator totals, rate, membership IDs, eligibility counts, and declared grain upstream. Retain raw inputs. For synthetic runs R1=A:1 event/10 hours, R2=A:1/90, R3=B:8/200, rates per 100 hours are A=2, B=4, pooled=`10/3`. Mean run rates=`136/27`; mean rig rates=3. These are different questions, independently recomputable from the three runs.
- **Alternatives rejected:** Averaging prepared rig rates to populate a pooled card; mixing rig rows and an all-rigs summary row in one source without explicit separation; or adding a database driver. Fixed-grain preparation cannot preserve arbitrary later filtering or regrouping.
- **Benefit / cost:** Tests whether a reusable API is necessary with no library expansion. Costs include regeneration, explicit provenance, and separate outputs where consumers need different grain. A pooled card needs raw additive components recomputed upstream or a separately scoped singleton pooled result.
- **Public API / maintenance impact:** No new driver, query service, or in-app SQL execution. The author owns preparation and its grain contract.
- **Confidence:** High in the arithmetic and representational limit; unknown whether this workflow is acceptable for a repeated real task.
- **Proof / rejection condition:** Demonstrate A, B, and pooled values without averaging group rates. If the author accepts preparing/recomputing the required outputs, reject the new API. Record concrete repeated friction if preparation is inadequate.
- **Local integration destination:** Conditional preparation note alongside `apps/demo/src/docs/pages/calculated-fields.mdx`, **In charts and tables**. Keep a later synthetic example separate from the flights project's actual data narrative.

## GR05 — Compare actual consumer populations and the complete lifecycle

- **Problem / audience:** Matching field names or settings do not establish matching rows. Audience: maintainers validating a real author workflow.
- **Source evidence:** `packages/explorEDA/src/components/charts/BarChart/barPlan.ts`, `aggregateId` handling; `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`, `planMetricCard`; `packages/explorEDA/src/components/charts/useGetLiveData.tsx`, `useGetLiveIds` and `useGetAllIds`; `packages/explorEDA/src/providers/DataLayerProvider.tsx`, `validateAggregateState`, `saveToStructure`, `restoreFromStructure`; `packages/explorEDA/src/utils/saveDataUtils.ts`, `validateSavedData`; `apps/demo/src/docs/pages/bar.mdx`, **Selection and row scope**.
- **Recommendation:** Preserve the first local trust task before a rates proof. For any later candidate, compare exact source IDs, contributors, totals, and scope before comparing displayed rates. Named bars reference aggregates; the selected card plan directly reduces its supplied IDs. That is a reuse boundary requiring evidence, not permission to unify the API now.
- **Alternatives rejected:** Equal rounded numbers as proof; assuming equal filter settings imply equal populations; or a broad chart certification project.
- **Benefit / cost:** Finds a bounded filter or lifecycle defect without confusing it with missing calculation capability. Cost is one focused journey through selection, inspection, save/reopen, export/reimport, and undo/redo.
- **Public API / maintenance impact:** None until a reproduced failure earns repair. Later rates must preserve readable saved definitions and reference validation.
- **Confidence:** High in selected plan and persistence boundaries; limited in complete runtime wiring.
- **Proof / rejection condition:** Proposed only: compare a rig bar with a card restricted to that rig, then all-rig totals; inspect members; save/reopen; check exported rows, Dashboard text reimport, and image labels; undo/redo; verify 1280, 783, and 390 px. A scope or restoration disagreement blocks rate exploration and returns to local trust.
- **Local integration destination:** `docs/intent/current-analysis-trust/intent-brief.md`; conditional Bar/Metric Card docs/examples. `docs/agent-guide.md` identifies omitted history, DSL, and example paths requiring checkout inspection. Interaction checks remain proposed.

## GR06 — Preserve entity semantics and separate members from contributors

- **Problem / audience:** Repeated entity totals and two-field eligibility can silently inflate or misalign a rate. Audience: authors using joined data and maintainers of reduction provenance.
- **Source evidence:** `packages/explorEDA/src/lib/aggregates.ts`, `summarizeGroup`, `poolAggregateRows`, `AggregateContributor`, `AggregateResultRow`, `ONCE_PER_HELP`; `packages/explorEDA/src/lib/aggregates.test.ts`, missing-ID, repeated-ID, and conflicting-value assertions. Test declarations were read, not executed.
- **Recommendation:** Preserve current once-per-entity rules. Missing IDs are excluded at the reducer boundary; repeated measures must agree using `Object.is`; a conflict makes the group value unavailable. Preserve all source members and reasons. `rowCount` represents reduction units, not necessarily numeric contributors. Pooling reconstructs contributors and reevaluates identities instead of averaging group results.
- **Alternatives rejected:** Choosing an arbitrary first record; deduplicating equal numeric values; summing per-category distinct counts as global distinct counts; or independently deduplicating numerator and denominator without an explicit joint policy.
- **Benefit / cost:** Retains established analytical meaning and inspection. A later two-field rate introduces genuine work: which entity records jointly contribute, whether both values agree, and how conflicting pairs surface.
- **Public API / maintenance impact:** No changes now. Any future rate must preserve existing entity behavior and make additional pair semantics explicit rather than retroactively altering existing reducers.
- **Confidence:** High in static identity/pooling behavior; absent parser/category helpers limit normalization claims.
- **Proof / rejection condition:** One ID P with value 30 in each of two categories contributes 30 per category but 30 globally when pooled. Changing the second value to 31 makes the pooled result unavailable. A candidate that reports 60 or silently selects a value fails. Missing and conflicting numerator/denominator pairs require further author-approved expectations.
- **Local integration destination:** Existing `aggregates.ts` contract and its tests only if later implementation is earned; explanations beside Metric Card **Once per** and Bar row-scope documentation.

## GR07 — Explore one common-population ratio of totals only after simpler options fail

- **Problem / audience:** A future repeated task may require one definition to retain its meaning across a grouped bar and pooled card. Audience: Byron and the maintainers assessing that specific request.
- **Source evidence:** `docs/intent/reusable-analysis-metrics/intent-brief.md`, **Expansion trigger**; `packages/explorEDA/src/lib/aggregates.ts`, `AggregateSpec`; `packages/explorEDA/src/types/SavedDataStructure.ts`, `aggregates`; the Bar and Metric Card plans cited in GR05. These expose a potential capability boundary, not demand.
- **Recommendation:** Only after GR01–GR06 earn it, explore one ratio of additive totals over a common population, retaining both totals and source inspection. The hypothetical fixture authorizes no feature. No interface or serialization shape is selected.
- **Alternatives rejected:** A general measure grammar, semantic layer, dependency/pipeline graph, server query engine, new driver, broad compatibility design, separate-population machinery, and additional consumers. Do not stack nonadditive rates or average them to construct totals.
- **Benefit / cost:** Could remove demonstrated repeated preparation and keep two outputs consistent. Cost is material: dual-input provenance, entity policy, consumer integration, validation, save/restore, export, undo, docs, and regression coverage.
- **Public API / maintenance impact:** A new public and persisted concept would be a continuing commitment. Keep it queued; do not disguise that commitment as adding a division function.
- **Confidence:** High that the gate is appropriate; low that this candidate is needed; provisional that it is sufficient until a real task is known.
- **Proof / rejection condition:** A named repeated decision must require two consumers, fail GR02/GR04, specify all GR03 policies, and pass GR05/GR06. Failure of any condition retains NO-GO. A successful existing workflow rejects the API.
- **Local integration destination:** The rates intent. If later earned, pair `metric-card.mdx` and `bar.mdx` with one proposed `grouped-rate-proof` example; registry destinations identified by the guide are `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/examples.ts`, and `apps/demo/src/demos/coverage.ts`. These are proposed destinations, not created assets or a milestone plan.

## Proposed edits to the existing rates intent — not applied

Target: `docs/intent/reusable-analysis-metrics/intent-brief.md`. Preserve its future-seed status and historical references. Suggested passages for review follow.

### My read

Keep reusable rates deferred while demand is unconfirmed. Existing eligible row indicators and shared reductions may answer a count proportion; upstream preparation may answer a ratio of totals. A potential gap becomes a product candidate only when Byron names a repeated decision that those alternatives cannot serve acceptably. Correct arithmetic and the existing flights examples do not establish that need.

### Boundaries

State grain, numerator, denominator, units, common or separate populations, filters, identity rules, and invalid/empty/zero policies for the task. Preserve source members and numeric contributors separately. Do not infer denominator meaning from formatting or units, silently align separate populations, stack nonadditive rates, or average grouped rates for a pooled total. Keep broad calculation languages and infrastructure outside this seed.

### Expansion trigger

Expand only after the first local trust proof and a named repeated two-consumer task fails both an appropriate current-controls recipe and an acceptable upstream workflow. Its population and entity policies must be explicit. The smallest possible candidate is one common-population ratio of additive totals; this wording does not approve its API or implementation.

### Next step after confirmation

Use one author task to try to reject a new API. Write expected unequal-group arithmetic and exact source/contributor IDs, then compare current controls with declared-grain preparation. Continue only if repeated unmet need survives; require filters, inspection, save/reopen, exports, undo/redo, and 1280/783/390 px evidence before any user-visible commitment. Until then, retain the deferred seed and local trust priority.
