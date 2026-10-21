# R043 recommendations: preserve entity meaning before changing reducers

**Repository:** [byronwall/explorEDA](https://github.com/byronwall/explorEDA). **Baseline:** `f4cacdde180e16ad814451a8c064e394535565d6`. **Research date:** 2026-10-21.

**Decision:** retain source-occurrence identity and selected-value identity as distinct contracts. Align a shared rule only where the same scoped rows form the same entity classes and the intended measure population agrees. Start with EG01, then the narrowly justified count/conflict and explanation work in EG02–EG04. Keep EG05 optional and EG06 deferred/rejected as specified.

All six entries are **disposition proposals**. No application change, dependency installation, product test, SQL execution, browser proof, or author task was performed during this research. Source-predicted outputs below are not observed product results. Byte/hash validation and independent fixture arithmetic/set checks reported in `proof-plan.md` do not satisfy an implementation gate.

## Common scope and visible-milestone contract

The frozen oracle distinguishes source members, selected entity classes and representatives, numeric contributors, expansion copies, conflicts, and excluded rows. It also preserves alternative measured-count intentions: E counts entities, V counts valid numeric scalars, and P counts present raw scalars. **V is an oracle alternative, not a recommendation for a new numeric-count feature.** Current shared and project count-with-measure populations remain distinct unless a later explicit product decision changes them.

Every visible milestone below pairs its named existing docs section with the **same proposed, new runnable folder**:

`docs/research/entity-grain-2026-10-21/examples/entity-grain/{exploreda.eda,analysis.eda,data/*.json}`

The folder would encode the frozen fixtures, source-origin and copied-field variants, and positive/negative controls using existing project steps. It has not been created. The documented `npx exploreda <folder>` route is the proposed way to open it; no command was installed or run. Existing `LiveExample id="metric-card"` remains the ordinary-case control. Verify the current docs/example registries before adding links or registrations; do not invent an existing example ID. [Sources: `apps/demo/src/docs/pages/project-folders.mdx`, “Open a folder as a project”][project-doc]; [`apps/demo/src/docs/pages/metric-card.mdx`, `LiveExample`][card-doc]; [`docs/agent-guide.md`, docs and example verification][guide].

For any adopted implementation, targeted tests must establish exact IDs and memberships as well as values. Run bounded type checking, then `pnpm check` once before review. Changed visible flows need real pointer/keyboard checks at 1280, 783, and 390 px. These remain proposed gates. Package behavior changes require the normal changeset; docs/test-only work does not. [Sources: `AGENTS.md`, “Verifying changes” and “Changesets”][agents].

## EG01 — Retain distinct identity contracts and add contract fixtures

**Disposition proposal:** adopt the contract table and targeted tests; preserve current source-occurrence and selected-value identity. **Confidence:** high in the source distinction, medium that the proposed lesson will be sufficient for an author. No named demand or comprehension result is established.

**Evidence and decision.** Shared `summarizeGroup` groups typed nonnull selected values and excludes missing IDs. Project `aggregateFrame` first uses a selected field's source origin to find its source reference; absent that reference, it groups nonnull values and gives nullish values a result-row fallback. `sourceReferences` preserves missing/duplicate declared source keys through positional occurrence identity plus diagnostics. A copied field can therefore change the partition even when its displayed values are unchanged. [Sources: `packages/explorEDA/src/lib/aggregates.ts`, `AggregateSpec`, `summarizeGroup`][shared]; [`packages/explorEDA/src/lib/analysis/evaluateProject.ts`, `sourceReferences`, `aggregateFrame`][evaluator]; [`packages/explorEDA/src/types/AnalysisProject.ts`, `AnalysisField`, `AggregateMeasure`][types].

Freeze conditional parity as: same filtered/grouped input population; same typed entity partition; same scalar agreement rule; same eligible measure population; same empty/conflict policy. Exact totals alone are insufficient. Independently observed events with equal labels or amounts remain separate at source grain. Typed `1` and `'1'` stay separate. Preserve the shared/project measured-count difference: shared count counts every nonconflicting unit, including null measures; project count(field) counts nonnull raw values, including invalid nonnull text. Changing project count to count every placeholder would break the shop's unmatched-item distinction. [Sources: `aggregateValues`/`summarizeGroup`][shared]; [`aggregateFrame`][evaluator]; [`packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`, declared-grain and empty cases][project-tests].

Raw agreement means agreement of values presented to the reducer before its own numeric parsing, not original file bytes or the `rawInputs` evidence sidecar. Chart adapters may already have converted values; direct number 10 versus text 10 and signed-zero agreement need separate preservation controls. [Sources: `summarizeGroup`][shared]; [`stable`, `aggregateFrame`][evaluator].

F4 isolates why missing-key fallback is an explicit contract choice. Four target occurrences have `(pk, amount)` values `(null,5)`, `('dup',8)`, `('dup',8)`, `('safe',9)`. Six left rows reference them with multiplicities 2,2,1,1 through distinct valid join keys. Source predictions are:

| Identity choice | Count / sum / average |
| --- | --- |
| Project source-origin target field: four source occurrences | `4 / 30 / 7.5` |
| Shared copied `pk`: exclude two null-ID rows; merge `'dup'` | `2 / 17 / 8.5` |
| Project copied `pk`: two null result-row fallbacks; merge `'dup'` | `4 / 27 / 6.75` |

The same count of four masks different partitions in the first and third rows. Keep fallback behavior pending an explicit product decision; do not call these equivalent contracts or silently “repair” the difference.

**Destinations and milestone.** Add cases to existing `packages/explorEDA/src/lib/aggregates.test.ts` and `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`; share a small proposed fixture at `packages/explorEDA/src/test/fixtures/entityGrain.ts` if it reduces drift. Update existing `metric-card.mdx`, “How it reads,” and `project-folders.mdx`, “Query steps,” together with the common proposed runnable folder. Keep both ordinary shop and repeated-entity controls.

**Cost / alternatives / gate.** Small docs-and-fixture work; no new saved setting. Pure documentation is cheaper but does not protect a demonstrated semantic boundary. A universal identity API costs more and lacks evidence. GO when clean-key, typed-key, missing-key, independent-event, and filter-scope cases preserve exact partitions. Reject any test that merely compares totals, or requires the intentionally different F4 outputs to match. Implementation behavior changes beyond EG02 remain NO-GO without a separate explicit policy decision.

## EG02 — Repair measured-count conflict availability only after reproduction

**Disposition proposal:** conditional bounded repair. Preserve ordinary count eligibility; propose whole-result unavailable for a measured count containing a scalar conflict. **Confidence:** high in the source-predicted disagreement; medium in adopting this conflict policy pending adoption of the conflict policy recorded in subsequent implementation review.

**Smallest case.** Use the same partition in both reducers: entity x has rows x1 amount 10 and x2 amount 20; entity y has y1 amount 5. All three amounts are finite and nonnull, so missing/numeric eligibility cannot explain a difference. Shared count with a measure is predicted unavailable; project count with a measure is predicted `1`, after x is discarded. Both sums/averages are predicted unavailable. No-measure count remains `2`. Changing only x2 to 10 is the negative control: measured count 2, sum 15, average 7.5, representatives `{x1,y1}`, repeated row `{x2}`. These are source predictions, not executed failures. [Sources: `packages/explorEDA/src/lib/aggregates.ts`, `summarizeGroup` final conflict guard][shared]; [`packages/explorEDA/src/lib/analysis/evaluateProject.ts`, `aggregateFrame` conflict loop and count branch][evaluator].

**Why this boundary merits a test.** Identity classes and nonnull eligibility agree, but conflict handling differs. Project's `conflictingEntity` invalidates only sum/average, whereas shared invalidates the whole aggregate. A surviving count of y alone can resemble a complete result. This finding does not establish that source-row identity is wrong or that every count operation should agree.

**Destinations and milestone.** First add the paired case to the two existing reducer test files. If reproduced and whole-result unavailability is accepted, change only the measured-count conflict branch in `aggregateFrame`; keep no-measure count, null exclusion, invalid-nonnull inclusion, source provenance, and ordinary lookup counts. Pair `project-folders.mdx`, “Query steps” / measured-count availability, with the common proposed runnable folder; cross-reference the shared contract in `metric-card.mdx`, “How it reads.”

**Cost / alternatives.** Small reducer change plus regression tests. Keeping entity-only exclusion is viable only as an explicit chosen contract with its excluded membership explained; it should not masquerade as parity. Making measured count ignore the measure changes shared semantics and is broader. A valid-numeric count is a new question and is outside this repair.

**GO / rejection gate.** Research GO for a targeted reproduction; implementation remains conditional on a complete-checkout reproduction and recorded adoption of the conflict policy. Reject or narrow the repair if the fixture reaches different partitions, if implementation review deliberately selects entity-only exclusion, or if it changes unmatched-item counts. The metric card clears `measureField` in count mode, so this is not evidence of a measured-count card bug. [Source: `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`, `planMetricCard`][card-plan].

## EG03 — Expose the project conflict first; expand its ledger only if needed

**Disposition proposal:** adopt a bounded explanation repair candidate, beginning with the smallest diagnostic/message and prior-stage navigation improvement. A complete per-measure ledger is conditional. **Confidence:** high in the distinction between omitted per-measure witnesses and unrendered diagnostic details; author sufficiency remains untested.

**Evidence.** In the x/x/y case, project `aggregateFrame` skips x before building `measureContributors`; the sum ledger contains only y1. The diagnostic message identifies x and has step/field information, but this conflict diagnostic has no structured row witness list. `QueryFlow.Diagnostics` renders only counts by code and hides the message. `QueryStageRows` can show the preceding rows and related source records but does not render `measureContributors`. Thus the raw witnesses remain recoverable by manual prior-stage inspection; the direct explanation fails to identify them explicitly. [Sources: `aggregateFrame`][evaluator]; [`packages/explorEDA/src/components/project/QueryFlow.tsx`, `Diagnostics`][flow]; [`packages/explorEDA/src/components/project/QueryStageRows.tsx`, `QueryStageRows`, `relatedRecords`][stage-rows].

**Smallest milestone.** Present the selected conflict's existing message/measure context and make the preceding step easy to reach. Use readable identity information without conflating labels with source identity. Do not promise automatic exact-row focus from fields that the current diagnostic does not contain. Test whether an author can identify x and both x1/x2 values through this route. Pair `project-folders.mdx`, “Query steps” / proposed “Explain an unavailable measure” subsection, with the common proposed runnable folder.

**Conditional expansion.** Only if that author task fails, retain conflict/duplicate witnesses before candidate selection and render the selected measure's reasons using the existing contributor model where sufficient. Destinations are `evaluateProject.ts::aggregateFrame`, `AnalysisProject.ts::AnalysisMeasureContributor` only if existing fields cannot express the chosen minimal explanation, and `QueryStageRows.tsx`/`QueryFlow.tsx`. Any contributor-type expansion remains deferred unless existing fields cannot express the demonstrated need. No schema or public API expansion is approved by this research; do not add a generic provenance graph.

**Accounting constraint.** `evaluateAnalysisQuery` currently computes stage `excludedCount` by summing false contributor entries across measures. Adding repeated/conflicting rows as false entries changes that count. Explicitly distinguish repetitions, numeric exclusions, conflict witnesses, and per-measure entries from unique row counts; never silently rename their meaning. `QueryFlow` does not display that count, so this is not a demonstrated visible “zero excluded” defect. Preserve the complete group reference sets and `traceRowIds`' all-row mapping. [Sources: `evaluateAnalysisQuery` stage assembly][evaluator]; [`packages/explorEDA/src/components/charts/trace/traceRows.ts`, `traceRowIds`][trace-rows]; [`QueryFlow`][flow].

**Cost / alternatives / gate.** Small message/navigation work first; medium cost only for ledger retention and accounting. Existing manual stage inspection is the cheapest alternative and may pass. GO for the smallest repair when the exact x/x/y task demonstrates the direct explanation gap; do not claim a browser failure already occurred. Reject ledger expansion if the smaller route passes. Negative controls: equal x values, numeric zero, and separate independent events. No count ledger is currently populated; do not claim rendering alone creates one.

## EG04 — Make shared traces name the entity and the counted unit

**Disposition proposal:** adopt a narrow trace-clarity repair; no reducer rewrite. **Confidence:** high in the source-observed wording and missing entity column, medium in the proposed presentation until exercised.

**Evidence.** Shared contributors already retain `entityKey`, row IDs, raw/input values, and reasons. `AggregateContributorTable` renders the row/input/reason fields but omits entity identity. `MetricCardTraceBody` always says each matching row adds 1 for count and labels `plan.rowCount` “Matching rows.” Under an entity selection, that number is nonconflicting units, not all matching input rows. `planMetricCard` deliberately distinguishes repeats from its displayed excluded count and strips the measure in count mode. [Sources: `AggregateContributor`, `summarizeGroup`][shared]; [`packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx`, `AggregateContributorTable`][aggregate-table]; [`packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx`, `MetricCardTraceBody`][card-body]; [`planMetricCard`][card-plan].

**Destinations and milestone.** Adjust `metricCardPlan.ts` and `MetricCardTraceBody.tsx` to distinguish source rows from selected units when an entity setting exists; carry only the existing setting's mode/label into the internal plan if needed, rather than parsing prose. Render typed entity values in `AggregateContributorTable` when present, preserving the exact reasons and pagination. Pair `metric-card.mdx`, “How it reads” / proposed “Read an entity trace” subsection, with the common proposed runnable folder and existing `metric-card` control. If grouped-bar inspection changes, exercise its current `BarTraceBody` consumer too. [Source: `packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx`, grouped trace consumer][bar-body].

**Exact controls.** Two equal expansion copies of x should visibly distinguish two source rows, one selected entity, one used representative, and one repeated row. In sum or average mode, the x/x/y conflict case must distinguish three rows from one remaining nonconflicting unit and two conflict witnesses. A typed1/string1 control must be distinguishable in the entity column. Ordinary unique-row count and observed zero must retain correct explanations.

**Cost / alternatives / gate.** Small internal-plan/table/copy changes; no new saved setting. A tooltip-only lesson is cheaper but leaves the displayed arithmetic label inaccurate. Renaming every `rowCount` API or making the reducers identical is unnecessary. GO after component/author verification shows truthful units and recoverable entity identity; reject a design that counts copies as generic numeric exclusions, hides conflict witnesses, changes source membership, or introduces prohibited Inspect buttons. Use existing trace controls. [Source: `CODING_STANDARDS.md`, UI inspection rules][standards].

## EG05 — Offer a keyed preaggregate/lookup lesson when it simplifies the task

**Disposition proposal:** retain PR451's boundary; make this lesson optional, without a new execution mode. **Confidence:** high in relational grain reasoning and immediate-provenance limits; author effort and recipe execution remain unverified.

**Recipe and comparison.** When a parent source is uniquely keyed, aggregate independent child events by that key upstream, retaining event count, nonnull numeric-amount count, and amount sum. Lookup that keyed relation from the intended parent population. Use all parents for an all-source question; restrict to represented parents for a represented-source question. Do not repeat parent amounts by expanding again without an explicit entity contract. `SUM(DISTINCT amount)` discards equal amounts from independent events and therefore does not express the requirement. DuckDB's official documentation confirms count-versus-count(argument), null/empty aggregate behavior, and value-level DISTINCT; left/semi join documentation supports the two population choices. These are documentation facts and relational inferences, not executed SQL proof. [Official sources, accessed 2026-10-21: aggregate functions][duck-agg]; [FROM/JOIN][duck-join].

Parent-amount parity compares `p.parent_amount` once per selected parent; `c.amount_sum` sums independent child events and is a separate metric. Preaggregation must not resolve the F2 scalar conflict x:{10,20} by summing to 30 or choosing the first value and call that the same intention.

The recipe assumes validated typed keys and finite numeric-or-null amounts. It does not silently repair dirty keys, stringify numeric1 with text 1, or reproduce JavaScript invalid-number classification. Carry the required validity evidence or reject that input. Preserve no-event versus all-null versus zero using counts; never blanket-coalesce unavailable sums to zero. Roll up means from sums and valid-value counts, not group averages.

**Destinations and milestone.** Add a compact lesson in existing `project-folders.mdx`, “Query steps,” paired with the common proposed runnable folder and a clearly proposed optional `data/preaggregate.sql` companion there. Read the current `database-sources.mdx` before amending its handoff explanation. Prefer a prepared scalar file when it meets the task; do not provision a database during research.

**Provenance and gate.** Local identity begins at the supplied prepared row. The recipe does not create automatic database contributor lineage or paired-source refresh guarantees. PR451 explicitly leaves its author/provenance proof unrun. [Sources: historical `docs/research/data-preparation-boundary-2026-10-16/README.md`, preparation boundary][prior-readme]; [`decisions.md`, DP-04/DP-05][prior-decisions]. Small documentation cost; medium only if a real author chooses the SQL handoff. Direct aggregation is the smaller alternative when complete local rows and expansion witnesses are already useful. GO only if both routes preserve the intended keyed population and the author can explain provenance. Reject the handoff if it loses needed witnesses or adds more maintenance than the existing local path. No performance or customer-demand claim is justified.

## EG06 — Defer helper extraction; reject forced reducer unification

**Disposition proposal:** defer a shared helper; reject forced unification for R043. **Confidence:** high that the current identity contracts must survive; no demonstrated maintenance benefit establishes extraction's value.

**Evidence and alternative.** `summarizeGroup` retains per-input reasons and typed selected values; `aggregateFrame` preserves source-reference identity and contextual provenance. `poolAggregateRows` re-reduces original contributor rows, so replacing it with arithmetic on displayed aggregates would also change entity and mean semantics. Existing duplication does not prove these responsibilities belong in one reducer. [Sources: `summarizeGroup`, `poolAggregateRows`][shared]; [`aggregateFrame`][evaluator]. The R043 brief explicitly allows keeping distinct contracts and rejects collapsing independent records through a shared value identity. [Source: `docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md`, research brief][idea].

**Cost and destinations.** No production extraction now. Record the disposition beside R043 in `docs/research/entity-grain-2026-10-21/` during later integration. Contract tests and EG02's local guard are cheaper alternatives. A future private helper could share only proven eligibility/conflict mechanics while receiving an explicit identity partition and preserving full evidence; that is a possible design, not approved implementation or a new public API.

**Reconsideration / rejection gate.** GO only after exact-membership tests demonstrate preservation of source identity, selected-value identity, copied/null fallback behavior, typed keys, independent equal-valued events, raw number/text and signed-zero agreement, conflicts, filtering, pooling, and contributor reasons—and after a concrete maintenance benefit exceeds migration cost. NO-GO if it merges valid independent events, erases reasons, expands schema/API scope, or relies on equal totals alone. This is not a visible feature milestone. Any future visible consequence must reuse EG01's docs sections and common runnable folder before adoption.

## Implementation status

GO for bounded documentation, contract tests, and targeted reproduction. EG02–EG04 require their stated implementation/author gates; EG05 is optional; EG06 rejects forced unification. No gate is marked passed by this recommendation file. A targeted complete-checkout follow-up is necessary to turn source predictions and proposed presentation repairs into verified product changes.

[shared]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/aggregates.ts
[evaluator]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[types]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/types/AnalysisProject.ts
[project-tests]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[card-plan]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts
[card-body]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx
[aggregate-table]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx
[bar-body]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/BarChart/BarTraceBody.tsx
[flow]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryFlow.tsx
[stage-rows]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/project/QueryStageRows.tsx
[trace-rows]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/packages/explorEDA/src/components/charts/trace/traceRows.ts
[project-doc]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/project-folders.mdx
[card-doc]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/apps/demo/src/docs/pages/metric-card.mdx
[agents]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/AGENTS.md
[guide]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/agent-guide.md
[standards]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/CODING_STANDARDS.md
[idea]: https://github.com/byronwall/explorEDA/blob/f4cacdde180e16ad814451a8c064e394535565d6/docs/intent/research-ideas-100/ideas/R043-entity-grain-parity.md
[prior-readme]: https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/README.md
[prior-decisions]: https://github.com/byronwall/explorEDA/blob/0984715cb4c0c85d0d6efa8436ab38368bd20ae1/docs/research/data-preparation-boundary-2026-10-16/decisions.md
[duck-agg]: https://duckdb.org/docs/2.0/sql/functions/aggregates
[duck-join]: https://duckdb.org/docs/2.0/sql/query_syntax/from
