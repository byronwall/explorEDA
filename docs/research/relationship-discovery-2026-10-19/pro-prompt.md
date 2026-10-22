# Relationship discovery after the mixed-type scatter matrix

https://github.com/byronwall/explorEDA

## Mission and decision

Research one question: what, if anything, should explorEDA add to help a person choose a useful field pair, given its existing mixed-type scatter matrix? Compare a docs/example-only route, a small pair-to-scatter navigation change, a bounded coefficient view, and ranked or mixed-type discovery. The result may reject all expansion. Favor a decision that changes product direction over a catalog of features.

Baseline origin/main: 9b16d78e3ed0742ed4d5858c1939fec9e758b510. Target local research branch: codex/relationship-discovery-research-2026-10-19. This is a personal React/TypeScript project. Assume no demonstrated demand. Do not infer demand from a fixture or another product. Codex owns local integration and its review PR; you must not mutate repository files.

## Access GO and NO-GO

Use the attached selected text snapshot if GitHub cannot expose the exact baseline. It is authorized source context, not a runnable checkout. Each file has a SHA-256 manifest. Report accessible files, baseline, tools and limitations before analysis. GO when this packet supplies the listed evidence and current primary sources are accessible. Stop as NO-GO if the owner/baseline mismatches, core matrix sources are absent, or a decisive claim requires unavailable evidence. State the smallest unblock. Do not invent runtime or author observations. Complete downloadable report content in the response if file creation is unavailable.

## Current facts to verify

The ScatterMatrix supports numeric, date and categorical fields, with two to ten fields and at most twelve category bands. Triangles choose points/correlation, boxes, tiles or shares; diagonals show distributions or labels. It already has per-color correlations and row/cell traces. Its correlation click path treats the cell as empty space; verify exact behavior before proposing navigation. Existing scatter has paired summaries and downstream analysis. The relationship-discovery intent and map contain historical claims; the map still says there is no relationship matrix. Current source outranks these stale statements. Do not propose rebuilding the delivered matrix.

Previous missions: preparation PR451, freshness PR452, missingness PR455 are complete research cycles. PR454 owns time-series axes. Do not repeat these or broaden into warehouse adapters, imputation, automated causal inference or a statistical notebook. The local selection/export/undo/reopen proof stays first in the queue and is not performed by this research.

## Ranked questions

1. What exact choice remains difficult after using the current matrix? Distinguish finding a pair, understanding its population, inspecting the shape, and opening detailed analysis. Compare current controls plus one teaching example against new UI. Specify the author evidence that could disprove a new feature's value.
2. Compare at least four concrete routes: keep current matrix/docs; pair-to-scatter handoff; separate compact numeric coefficient view; bounded ranking or mixed-type associations. Score task effort, statistical honesty, implementation cost, reuse and evidence strength. Select a route or a staged hybrid, with explicit rejection gates.
3. Which statistical traps could change that choice? Cover pooled versus grouped reversal, nonlinear relationships with weak Pearson r, outlier leverage, constant/insufficient pairs, pairwise missing populations, category cardinality, filtering and scanning many pairs. Distinguish descriptive exploration from inferential claims. Evaluate Pearson, Spearman and mixed-type measures only when needed; do not demand every method. Explain why cross-method scores may not form one honest ranking.
4. What can be learned from current primary documentation or papers for Orange, KNIME, JMP, Data Wrangler or comparable tools? Pick three or four relevant exemplars. Cite precise interactions and methods, date access, and mark source-only versus observed behavior. Avoid feature-count competition or vendor demand claims.
5. What is the smallest falsifiable proof and useful example? Supply a small synthetic fixture specification with exact expected values/sets for linear, nonlinear, grouped reversal and insufficient/constant cases. Show a task and a current-controls comparator. Define success and stop criteria, required docs page and demo example, and keep performance/author proof explicitly proposed unless executed.

## Reading route

Read AGENTS.md, docs/agent-guide.md, README.md and package manifests first. Then inspect the matrix definition, plan, cells, trace, renderer and tests. Compare pairedSummary.ts and scatter definition. Read docs pages and relationship intent/map last so stale intent cannot override code.

The supplied paths are:

- `AGENTS.md`
- `docs/agent-guide.md`
- `CODING_STANDARDS.md`
- `README.md`
- `package.json`
- `packages/explorEDA/package.json`
- `docs/intent/relationship-discovery/intent-brief.md`
- `docs/intent/relationship-discovery/initiative-map.json`
- `docs/intent/current-analysis-trust/intent-brief.md`
- `docs/intent/reusable-analysis-metrics/intent-brief.md`
- `apps/demo/src/docs/pages/scatter-matrix.mdx`
- `apps/demo/src/docs/pages/scatter.mdx`
- `apps/demo/src/docs/pages/trace.mdx`
- `packages/explorEDA/src/components/charts/ScatterMatrix/definition.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixCells.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts`
- `packages/explorEDA/src/components/charts/ScatterMatrix/MatrixTraceBody.tsx`
- `packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrix.tsx`
- `packages/explorEDA/src/components/charts/ScatterMatrix/ScatterMatrixSettingsPanel.tsx`
- `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`
- `packages/explorEDA/src/components/charts/ScatterPlot/definition.ts`
- `packages/explorEDA/src/lib/valueParsing.ts`
- `packages/explorEDA/src/lib/fieldProfiles.ts`

Useful local commands for Codex, not claims you ran them: `pnpm --filter exploreda exec vitest run src/components/charts/ScatterMatrix/matrixPlan.test.ts`; `pnpm --filter exploreda check-types`; root `pnpm check` before a review PR. Demo uses library source. Do not claim browser checks without browser evidence.

## Evidence and boundaries

Cite exact repository paths/symbols for current claims. Use current primary sources for decisive external claims, with URLs and access dates. Separate observed facts, inference, proposals and uncertainty. Check comparator versions and do not fabricate source access. Give alternatives their strongest case. Each recommendation must state problem, evidence, cost, API impact, confidence, disproof and destination. Research does not approve implementation. No new general framework, automatic significance score, AI agent or causal inference. No paid provisioning, merge or deployment. No broad API design before a demonstrated task. Keep rows, valid pairs, numeric contributors, filters and scale bounds distinct.

## Deliverable contract

Return four standalone downloadable UTF-8 Markdown files and a ZIP containing identical copies plus manifest.json (path, byte size, SHA-256). Link every file in your final response.

- `relationship-discovery-decision.md`: standalone candid decision, alternatives table, decisive evidence, source index, uncertainty and GO/NO-GO conditions.
- `recommendations.md`: at most eight substantive recommendations, stable IDs RD-01 onward, each with all required fields and a suggested adopt/investigate/defer/reject disposition. Include current strengths and explicit rejected expansion.
- `proof-plan.md`: concrete synthetic fixture, expected results, task comparator, author and runtime acceptance gates, bounded local checks and proposed docs/example scope. Separate computations actually performed from proposed product tests.
- `research-queue.md`: revise the attached queue without repeating completed topics. Preserve the local trust journey first; record remaining evidence and one clear next action for each useful seed.
- `relationship-discovery-research.zip`: exactly those four files and manifest.json. No executable programs or source patches needed.

If one key answer is uncertain, preserve a useful NO-GO rather than force a feature recommendation. Final status: access/baseline, files read, current primary sources, checks performed, deliverable links, unresolved blockers and assumptions. Do not declare completion unless all priority questions and output gates are addressed. Codex will independently verify claims and integrate decisions; at most two focused follow-ups are available for material gaps.
