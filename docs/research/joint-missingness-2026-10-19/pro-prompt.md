# Joint missingness and analytical eligibility: product decision

https://github.com/byronwall/explorEDA

## Mission and baseline

Research one decision: should explorEDA add a bounded joint-missingness diagnostic, improve existing field and chart explanations, or rely on current tools plus documentation and upstream indicator columns?

Source baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510` on main. Codex preparation branch: `codex/missingness-research-2026-10-19`. Use the attached selected source packet as the authoritative baseline. It is text, not a runnable checkout. Its header and manifest identify every real file. The prompt and ranked queue are local additions after the source baseline. Public repository discovery is permitted; label later-source differences. Codex owns integration and Git/PR actions.

Act as a candid analyst-workflow and statistical-graphics researcher. The goal is choosing a product direction, including doing less. Engineering and scientific analysis are a stated direction; no customer task or demand for a missingness view has been established. Synthetic examples test semantics, not demand. Do not infer market demand from a fixture or vendor feature.

## Access gates

GO only if the exact repository or supplied packet provides the required parsing, profiles, field controls, chart eligibility, filters, docs and prior intent. Identify the baseline and inspected coverage. State what cannot be run. You may retrieve other public repository files by the exact repository URL.

NO-GO if neither route provides essential evidence, source owner or baseline is wrong, or an essential conclusion requires invented source behavior. Report the smallest missing evidence. If files cannot be created, return complete standalone Markdown sections with their required names. Do not claim tests, browser work, local writes or demand evidence that you did not obtain.

## Reading route and observed facts to check

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, `README.md`, `package.json`.
2. `docs/intent/missingness-and-expected-records/intent-brief.md`, `docs/intent/current-analysis-trust/intent-brief.md`, `docs/intent/scientific-multivariate-analysis/intent-brief.md`, `docs/intent/comparison-opportunities/README.md`; this run's `research-queue.md`.
3. `packages/explorEDA/src/lib/valueParsing.ts`, `fieldSettings.ts`, `fieldProfiles.ts`, and their selected tests. Conversion can change the values charts use. Inspect raw versus effective values. Do not invent another parsing rule.
4. `packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts`, `components/FieldList/FieldRowReadings.tsx`, `components/SummaryTable/components/FieldInspector.tsx`, `hooks/useFilteredFieldProfiles.ts`, `hooks/applyFilter.ts`, `types/FilterTypes.ts`, `components/WorkspaceFilterEditor.tsx`.
5. `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`, `summaryMarginals.test.ts`, `ScatterMatrix/matrixPlan.ts`, `ParallelCoordinates/parallelPlan.ts`, and selected tests. Missing X and missing Y can be sequential exclusion buckets, not independent marginal counts. Read symbols before interpreting labels.
6. `apps/demo/src/docs/pages/fields.mdx`, `summary.mdx`, `scatter.mdx`, `scatter-matrix.mdx`, `parallel-coordinates.mdx`, `filters.mdx`; `apps/demo/src/demos/examples.ts`; `docs/research/demo-datasets/dataset-research.md` for prior coverage examples.

Source observations are not runtime proof. Numeric statistics have nullCount and excludedCount. Fields offers a missing-only filter. Conversion preview reports valid, missing and failed counts. Scatter has finite-pair statistics and traces; scatter matrix and parallel coordinates have their own eligibility. Inspect how own-versus-peer filters affect populations. Do not assume the feature is absent because an older intent says so.

Preparation research PR 451 already studied expected-versus-observed records, joins, missing dates, reshaping and reusable grouped outputs. Freshness PR 452 distinguishes shared reads, publication and identity. Open PR 454 owns time-series scales and inspection. The continuing queue favors a local trust journey. This mission is the narrower joint pattern/eligibility decision. Do not repeat those surveys. Prior decisions remain proposals unless source establishes delivery.

## Ranked questions

1. **What user decision can joint patterns change beyond current tools?** Build three bounded tasks: unfamiliar scientific measurements, conversion failures in mixed-type imported data, and a linked multivariate view whose eligible rows differ from loaded rows. Define user, row meaning, question, exact population, valid-value rules, current steps and remaining friction. These are candidate tasks, not claimed demand. Include a case solved adequately today. Compare matrix, pattern-frequency table/UpSet-style sets, field-inspector improvements, chart eligibility explanation, and docs/upstream indicators. Score task coverage, interpretability, author effort, row traceability, implementation cost and proof cost. Recommend one small bundle or NO-GO.
2. **Which semantics must remain distinct?** Distinguish raw absence, blank text, configured null tokens, failed conversions, non-finite values, valid zero/false, and chart-specific exclusion. Separate marginal missing counts, joint patterns, pairwise eligibility and complete-case eligibility. Do not infer MCAR/MAR/MNAR or bias mechanisms from a visual pattern. Explain descriptive limits with current primary sources. Show how linked filtering could conceal excluded rows and what inspection base should mean. Preserve the repository's current behavior as baseline; flag inconsistencies without silently rewriting it.
3. **What do current tools teach, and what should we refuse?** Compare 4–6 relevant tools or research systems using current primary sources. Favor interactive EDA, profiling and missingness workflows over broad BI feature lists. For each, cite exact behavior, limits, access date and transferable lesson. Distinguish documentation from operated UI. No market rankings, claimed user demand, or undocumented capabilities. Compare doing nothing, docs/recipes, bounded extension and a new diagnostic. Reject imputation, automatic error labeling, quality scores, monitoring platforms and statistical mechanism tests unless indispensable to the mission; such expansion normally means NO-GO.
4. **What smallest proof can reject the choice?** Give a tiny explicit fixture with stable record keys, at least three numeric fields, different joint patterns with identical marginal missing counts, zero, false, blank, bad numeric text, a configured null token and non-finite handling. Use JSON-safe encodings or a clearly marked in-memory fixture for NaN/Infinity. Compute exact record sets, pattern counts, pair counts and complete-case counts before/after conversion and a peer filter. State representation and population at every stage. Include zero rows and an all-ineligible field. Give an author task, keyboard/row-inspection flow, baseline comparator, success and rejection gates. Keep implementation proposed. Any proposed milestone must pair real source paths with a docs page/section and a runnable example in that same milestone.
5. **What should happen next?** Provide stable recommendation IDs, keep/adopt-as-proposal/investigate/defer/reject dispositions, concrete benefit, maintenance cost, alternatives and confidence. Preserve the existing ranked queue; add at most two new questions only when the evidence creates them. Name the next local observation rather than another broad survey.

## Evidence and scope

Separate repository facts, external facts, inference and proposed work. Cite real paths and symbols for current-state claims. Use current primary sources for decisive external claims: official documentation, original papers or maintained project source. Supply direct URLs, retrieval dates, claim support and known limits. Avoid invented quotations. Show contrary evidence and a plausible NO-GO outcome. No implementation, package changes, new API, service, deployment, paid account, large generated corpus or product redesign. No expected-record reconciliation survey, imputation, inferential diagnosis or autonomous data cleaning. No claims of performance without measurement. Keep React/TypeScript and existing parse/filter/trace contracts.

Local commands for later Codex validation include `pnpm --filter exploreda exec vitest run src/lib/fieldProfiles.test.ts src/lib/valueParsing.test.ts src/components/charts/ScatterPlot/summaryMarginals.test.ts src/components/charts/ScatterMatrix/matrixPlan.test.ts src/components/charts/ParallelCoordinates/parallelPlan.test.ts`, `pnpm --filter exploreda check-types`, `pnpm --filter demo docs:check`, `pnpm check`, and `pnpm check:pr`. Only claim commands you actually execute. Proposed UI proof uses 1280, 783 and 390 widths. Do not ask Codex to bypass checks or alter identities.

## Deliverable contract

Provide four complete downloadable Markdown companions plus one ZIP:

- `joint-missingness-decision.md`: standalone decision, access/coverage, three tasks, current workflow, comparison table, primary-source register with dates, recommended boundary, alternatives, risks, NO-GO conditions and unanswered questions.
- `recommendations.md`: no more than ten substantive recommendations, stable IDs JM-01 onward. For each: evidence, proposal, alternative, user benefit, cost, confidence and validation/disposition guidance.
- `proof-plan.md`: explicit fixture, exact values and member sets, conversion/filter stages, author task, falsifiable acceptance/rejection gates and at most one bounded proposed milestone pairing docs/example with feature work. Mark every unrun proof as proposed.
- `research-queue.md`: revise the supplied queue with reasons; do not restock it with repetitions.
- `joint-missingness-research.zip`: exactly these four Markdown files plus `manifest.json`. Manifest lists each companion's byte size and SHA-256, baseline and creation time. Link the four standalone companions and ZIP in the final response. Standalone files must match ZIP members byte-for-byte.

Codex will preserve originals, verify archive safety/integrity and source claims, reconcile substantive recommendations, integrate research/intent/queue, validate, and open a review PR. Local Git is not your assignment. Missing decisive evidence merits at most two focused follow-ups; nonessential product choices may stay explicit for review. End with access status, files read, checks actually run, deliverables, recommendation, unresolved limits and the next falsifiable action. Do not call a proposed proof executed.
