# Data preparation after database sources: choose the product boundary

https://github.com/byronwall/explorEDA

Baseline: `b07f3cf3483130f6cc3391bba47a87f616c93321` on `main`. The attached selected text snapshot is authoritative for this review. It is not a runnable checkout. This is a research assignment. Codex will integrate your results locally. Do not modify code, create commits, or claim tests ran without execution.

## Primary mission

Which data preparation work should explorEDA own now that database snapshots have shipped, and which work should stay in author SQL or an upstream tool?

Choose a product direction from concrete analyst tasks. Compare improving the existing local query workflow, adding a few missing transformations, delegating preparation to SQL, and adding demand-driven database execution. You may recommend doing less. The outcome must change a decision, rather than produce an inventory of desirable features.

The target is a personal developer's React/TypeScript library and local-folder/server app. Favor direct implementations, few abstractions, inspectable values, and one deployed version. No demand, performance limit, or user population is established by this prompt.

## Access and stop rules

GO only if you can read the exact repository or the attached source packet, identify its baseline, and inspect the required types, evaluator, UI, docs, and prior intents. State the inspected evidence. Use the packet when GitHub cannot supply the ref. Discover further files through public GitHub where useful. Mark missing coverage.

NO-GO if both repository and packet are unavailable, the owner or baseline differs, or essential semantics cannot be checked. State the smallest missing evidence. If you can research but cannot write files, return complete Markdown artifacts in fenced sections. Never imply a local artifact or test exists when it does not.

Stop broadening after one primary recommendation and two bounded alternatives. Do not use speculative demand to promote a deferred initiative. If no task earns new product scope, recommend a documentation/example proof and state what evidence would change that result.

## Reading route

1. `AGENTS.md`, `README.md`, `package.json`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`.
2. `packages/explorEDA/src/types/AnalysisProject.ts`, `packages/explorEDA/src/lib/analysis/evaluateProject.ts`, `packages/explorEDA/src/lib/analysis/sources.ts`, `packages/explorEDA/src/lib/dsl/project.ts`.
3. `packages/explorEDA/src/components/project/ProjectQueryPanel.tsx`, `QueryFlow.tsx`, and `QueryStageRows.tsx` in that folder. Inspect actual step authoring and record inspection.
4. `packages/explorEDA/src/server/sources/types.ts`, `contract.ts`, and `refresh.ts`; `apps/app/src/DatabaseSourceViews.tsx`; the shop fixture under `packages/explorEDA/src/server/team/fixtures/data-v1/projects/shop/`.
5. `apps/demo/src/docs/pages/project-folders.mdx` and `database-sources.mdx`; evaluator tests named in the source manifest.
6. Prior intents: `docs/intent/database-adapters/intent-brief.md`, `database-query-contract/intent-brief.md`, `warehouse-sources/intent-brief.md`, `reusable-analysis-outputs/intent-brief.md`, `columnar-data-transport/intent-brief.md`, `current-analysis-trust/intent-brief.md`, `missingness-and-expected-records/intent-brief.md`, and `comparison-opportunities/intent-brief.md`.

The database-adapters intent explicitly records shipped SQLite, DuckDB, PostgreSQL, MySQL, and SQL Server sources. Its original body is stale. The query-contract intent is stale and reframed. Reusable outputs remain unprioritized because Byron has not identified a task. Treat those status distinctions as constraints, not implementation facts. Verify all consequential current-state claims in source.

Open PRs at preparation: #447–450 implement progressive chart built-ins. #364 covers their research. #220 covers monetization. None is this mission. The completed daily-viz corpus research is a source of examples, not a new dataset-generation assignment.

## Priority questions

1. Establish five realistic tasks that reveal a preparation boundary. Include joining orders and returns without double counting, reconciling expected versus observed records, comparing periods with absent dates, reshaping a wide measure table, and reusing a grouped result. These are test cases, not validated user demand. For each, give row grain, keys, null/duplicate policy, steps, expected output, and source inspection behavior. Determine what works today from source, what needs awkward work, and what cannot be expressed. Do not assume the evaluator lacks grouped outputs merely because an old intent says so.
2. Compare four directions: improve current query authoring and explanations; add a small set of local steps; prefer SQL sources with reusable recipes; server execution/pushdown. Score each for task coverage, semantic clarity, author effort, local/SQL consistency, maintenance cost, and proof cost. Name the smallest winning bundle. Make no speed claims without a measured workload. Distinguish query semantics from transient linked chart filters.
3. Compare current primary documentation for at least four relevant tools: DuckDB, Observable Framework or data loaders, Evidence, and a visual preparation tool such as OpenRefine or Power Query. Focus on their task boundary, grain, refresh, provenance, and author feedback. Use current official documentation with retrieval dates. Do not rank brand popularity or copy entire platforms.
4. Specify one reproducible proof that can reject the recommendation. Include a tiny fixture with expected tables and contributor sets, a task flow, current baseline, observable acceptance gates, failure conditions, and precise source/docs/example changes. Keep large implementation proposed. Include the docs page and runnable example in the same proposed milestone as any user-visible feature.
5. Produce a ranked next-research queue with no more than six distinct questions. Check existing intents first. Give novelty, product value, uncertainty, dependency, and a clear next action. Preserve deferred status where demand is missing.

## Evidence rules

Cite exact repository paths and symbols. Separate observed facts, inference, proposals, external claims, and unrun checks. Independently verify decisive external claims with primary sources and links. Show when stale docs conflict with source. Explain strengths, rejected ideas, failure modes, and uncertainty. Do not invent line numbers. Do not turn a generic feature list into a roadmap.

Keep complete-or-refuse source reads, explicit refresh, server-held credentials, row membership, valid numeric contributors, and inspectable intermediate values in view. Do not assume mixed-source refresh is atomic without source evidence. Distinguish SQL row meaning from local evaluation and linked selection. New infrastructure must earn its cost.

## Deliverables

Return these four UTF-8 Markdown files in a downloadable ZIP named `exploreda-data-preparation-research.zip`, with SHA-256 and an inventory. Also provide readable individual file links when possible:

- `report.md`: standalone decision brief, at most 3,500 words excluding sources and fixture tables; access evidence, current capability map, five task cases, comparison scores, primary recommendation, two alternatives, explicit non-goals, and uncertain claims.
- `proof-plan.md`: fixture, exact expected outputs/contributors, author flow, acceptance and rejection gates, bounded milestone with source/docs/example paths. This is a plan, not an implemented proof.
- `recommendations.md`: one row per substantive recommendation, unique ID, evidence, benefit/cost, confidence, proposed disposition (adopt/investigate/defer/reject), and destination. Codex will decide final dispositions.
- `research-queue.md`: at most six ranked questions with rationale, prior intent/evidence, dependencies, and next action. Exclude duplicates of this mission.

Do not supply executable programs or a patch. If file creation fails, return complete content in the conversation and explicitly state the fallback. Finish with recommendation, evidence limits, actual artifact links, actual tests run, and unresolved product choices.
