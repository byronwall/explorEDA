# Grouped rates: choose the smallest useful product boundary

https://github.com/byronwall/explorEDA

## Mission and decision

Research one decision: should explorEDA keep reusable grouped rates deferred, explain existing recipes, recommend upstream preparation, or explore one small reusable rate definition? Give a candid decision that could change product direction. Do not assume a metric language is needed.

Repository baseline: 9b16d78e3ed0742ed4d5858c1939fec9e758b510 (origin/main, verified 2026-10-19). Local research branch: codex/grouped-rates-research-2026-10-19. React/TypeScript library and demo; pnpm 11.9.0. Use the attached selected source packet as the permitted source fallback. It is a text snapshot, not a runnable checkout. Its tracked files match baseline; this prompt and research queue are local additions. The packet includes its own per-file paths and hashes. Compute and report the packet receipt hash if tools permit.

You are a product researcher with expertise in exploratory analysis, scientific data, aggregate semantics and practical BI authoring. Compare useful alternatives, including keeping current behavior. Distinguish correctness from demand. Byron has not used the tool enough to name a missing calculation. This fact is a binding limit on recommendations, not a gap you can fill by inventing a customer.

## Access gate

GO only when the exact repository/ref or attached packet is readable, and source evidence covers the decision. Name accessed files and missing context. Prefer packet baseline over newer default-branch behavior. If GitHub differs, label revisions separately.

NO-GO when required evidence is absent from both sources, the repository is wrong, or a decisive conclusion needs a guessed product choice. Report the smallest unblock action. Partial evidence can yield a bounded research conclusion, not a complete feature endorsement. No writable checkout is required. Do not modify files in the repository or claim tests ran from a selected packet.

## Reading route and verified starting facts

Read AGENTS.md, docs/agent-guide.md, README.md and package.json. Then:

1. docs/intent/reusable-analysis-metrics/intent-brief.md and references/pro-candidates.json; docs/intent/reusable-analysis-outputs/intent-brief.md; docs/intent/current-analysis-trust/intent-brief.md; product-feedback-2026-10-06.md under docs/intent/comparison-opportunities/resources/.
2. packages/explorEDA/src/lib/aggregates.ts and aggregates.test.ts: AggregateSpec names group/measure/entity fields and count/sum/average. summarizeGroup distinguishes source members and numeric contributors. poolAggregateRows reduces contributors again; it does not average group averages. Verify entity conflicts and missing IDs.
3. packages/explorEDA/src/lib/calculations/{types.ts,functions/registry.ts,engine/Calculator.ts}: sum/avg functions operate within one row. Do not describe these as dataset reducers.
4. packages/explorEDA/src/components/charts/MetricCard/{definition.ts,metricCardPlan.ts,MetricCard.test.tsx}: card uses basic reducers and optional entityField. Its filtered-versus-all comparison is a share/delta, not an arbitrary business rate.
5. packages/explorEDA/src/components/charts/BarChart/{definition.ts,barPlan.ts,seriesBarPlan.ts,barPlan.test.ts}; normalized series divides by category totals. Existing normalization is not automatically a conditional rate.
6. packages/explorEDA/src/components/charts/PivotTable/{definition.ts,utils/calculations.ts}; richer pivot reductions do not prove arbitrary formula composition. Composition/calculations.ts has a separate scope/population contract.
7. packages/explorEDA/src/types/SavedDataStructure.ts, src/utils/saveDataUtils.ts and src/providers/DataLayerProvider.tsx (same package): inspect named aggregate reuse, validation, filters and serialization. Hook path: packages/explorEDA/src/components/charts/useGetLiveData.tsx.
8. apps/demo/src/docs/pages/{calculated-fields,metric-card,bar,pivot}.mdx and apps/demo/public/daily-viz/projects/flights/{exploreda.eda,carriers.eda,carriers.guide.md}. The existing flights pivot/cards show count and mean. They do not establish demand for a reusable rate.
9. This run's research-queue.md and previous completed research summary, included as historical context only.

Inspect relevant source beyond these paths if accessible. Cite exact paths and symbols. Do not rely on historical recommendations as current implementation facts.

## Ranked questions

1. **Product boundary:** What concrete analytical failure, if any, remains after current row indicators, reductions and normalized charts? Compare four alternatives: defer; docs/example recipe; upstream SQL or prepared rows with explicit grain; one bounded shared rate. Propose no more than one preferred next proof. A valid outcome is keep deferred. Do not turn lack of use into demand.
2. **Meaning and populations:** Distinguish count ratios, ratio of totals, unweighted mean of per-row ratios, weighted mean, and share of category total. Show when an average of a binary indicator is exactly a rate and when it fails. Explain common versus separate eligibility populations, missing/invalid inputs, zeros, zero/negative denominators, empty groups, filters and entity deduplication. Do not choose silent policies. Separate arithmetic validity from the domain's scientific meaning.
3. **Two-consumer hypothesis:** Use one hypothetical engineering/science exposure or yield task plus one current-data comparator. State the author, decision, row grain, numerator, denominator, units and two consumers. The flights case can expose existing behavior, but is not demand proof. Determine whether the same metric can be represented by existing controls and what must stay upstream. Show exact small unequal-size examples where naive averaging changes the answer. Keep synthetic fixtures explicit and independently recomputable.
4. **Practical alternatives from current products:** Compare at least three relevant primary-source patterns, including a scientific/exploration tool and a BI/semantic measure tool. Candidates include JMP, Orange, Tableau, Power BI/DAX, Vega-Lite and DuckDB. Select only relevant patterns, cite current official docs/research, and show where semantics or authoring differ. Do not turn enterprise capabilities into requirements for this personal project. Separate sources inspected from recalled claims.
5. **Smallest proof and documentation:** Specify the cheapest task that can reject a new API. Include exact expected arithmetic, contributor/membership checks, filters, save/reopen, export, undo, and three browser widths (1280/783/390). Mark checks proposed unless run. Identify the existing docs page/section and demo example that would accompany any later user-visible milestone. Keep implementation queued, no milestone plan unless the evidence earns it.

## Evidence and decision rules

For every decisive external claim use a current primary source with URL, access date and relevant section. Separate observed repository facts, external facts, inference, hypothetical tasks, and proposals. State uncertainties. No invented product demand, benchmarks, performance results or executed browser checks.

Use stable recommendation IDs GR01 onward. For each: problem, audience, source evidence, recommendation, alternatives rejected, benefit/cost, public API and maintenance impact, confidence, proof/rejection condition, and local integration destination. Prefer 5–8 substantive recommendations to a repetitive list.

GO toward a prototype only after a named repeated task fails the simpler options and its numerator/denominator/population policy is explicit. NO-GO for a general measure grammar, semantic layer, pipeline graph, server query engine, new database driver, or broad compatibility design. Do not stack nonadditive rates. Do not claim formatting a percentage fixes aggregation. Do not infer ratio meaning from units alone. Preserve row inspection and existing entity semantics. Keep implementation deferred when demand remains absent.

Prior completed cycles: preparation PR451, freshness PR452, missingness PR455, relationship discovery PR456. Their proposed proofs remain proposed. Open PR454 owns time-series axes. Do not repeat those surveys or assume their branches are merged. Local trust journey remains first local proof. This mission is research, not approval to expand product scope.

## Deliverable contract

Return four standalone UTF-8 Markdown files and one ZIP named grouped-rates-research.zip. ZIP contains these same four files plus manifest.json with byte sizes and SHA-256 hashes. Also link standalone manifest.json. Keep every substantive report complete and independently readable.

- grouped-rates-decision.md: concise recommendation, access/baseline, current behavior, ranked questions answered, four-option comparison, current primary product comparisons, arithmetic examples, uncertainties and GO/NO-GO decision.
- recommendations.md: GR IDs with the required evidence/cost/proof fields; suggested edits to the existing rates intent, clearly proposed. No repository mutations.
- proof-plan.md: one cheapest falsifiable author task, explicit synthetic inputs and expected values/populations, current-controls/upstream comparator, rejection gates and docs/example destinations. Separate checks executed from checks proposed.
- research-queue.md: concise ranked queue with rationale, evidence, next action; maintain local trust first and avoid repeated surveys.

Link every output in the final response. Summarize recommendation, sources read, checks actually run, artifact inventory, unanswered questions and material blockers. If file generation is unavailable, provide the complete four Markdown bodies in the response. Codex will collect, authenticate, independently review, integrate and open a review PR. Do not claim local commits, product tests or a PR. A source packet cannot run the app.
