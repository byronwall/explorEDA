# Choose explorEDA's next complete analysis workflow

https://github.com/byronwall/explorEDA

Baseline: `95832bd473884aeae23453af0888b4ca5187820d` (origin/main, October 25, 2026).
Mode: **Strategy**. Research branch: `codex/repeatable-analysis-strategy-2026-10-25`.

## Mission and decision

Which complete, repeatable analysis workflow should explorEDA build next, and why would an analyst choose it over strong alternatives?

Choose a coherent product direction that connects exploration, reusable analysis, and a useful result someone can reopen or share. Rank three to five concrete capability bets. Recommend the first buildable bet and give its milestone plan. This is a product decision, not a general feature catalogue, robustness audit, marketing exercise, or monetization study.

Act as a senior product strategist who has shipped interactive analysis tools and notebook products. Research competing workflows deeply enough to distinguish real advantages from feature parity. Give candid tradeoffs and a clear choice.

Byron is the demand. He is a personal developer and the primary analyst. Do not require outside customers, usage telemetry, failure reports, or a usability study before making a recommendation. Older intent documents contain those gates; DIRECTION.md supersedes them. Choose worthwhile new capabilities, then find a small architecture that delivers them.

## Access check

Read the attached source packet. It contains complete baseline files, plus separately marked summaries of open research proposals. Confirm access and name the files read. If decisive code is unavailable both in the packet and connected GitHub, stop and name the smallest missing input. Do not claim a running product review from source alone.

## Context and reading route

explorEDA is a React and TypeScript library, a demo, and a local folder app. It began as linked charts and record inspection. Recent work adds notebook prose with inline charts, sheets, annotations, compositions, local project queries, and a daily visualization collection.

The package is storage-neutral; hosts own storage and routes. The local app saves project and analysis text. Do not confuse the embedded workspace, demo, local app, and published daily pages. Identify which surface should own the recommended workflow. Keep React and pnpm. Assume one author, one server, and one deployed version.

Read at minimum:

1. AGENTS.md, docs/research/DIRECTION.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, README.md, packages/explorEDA/README.md, and package.json.
2. apps/demo/src/docs/pages/notebooks.mdx, project-folders.mdx, export.mdx, views-and-history.mdx, and developers.mdx; docs/daily-viz.md. Distinguish current documented behavior from historical claims.
3. packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx; lib/notebook/compileNotebook.ts, sheets.ts, writeBack.ts; representative compile and sheets tests. Sheets split reading and share definitions. Current chart selections stay local to each notebook chart.
4. types/AnalysisProject.ts, types/SavedDataStructure.ts, components/ExplorEdaProject.tsx, lib/analysis/evaluateProject.ts, lib/project/folder.ts, and its tests. Queries already prepare related data and expose exact source references. General reusable window operations are not present.
5. apps/app/src/ProjectWorkspace.tsx, projectActions.ts, and saver.ts; apps/demo/src/SavedViewsWorkspace.tsx. Check real persistence, navigation, and ownership seams.
6. docs/intent/parameterized-task-navigation/intent-brief.md, reusable-analysis-outputs/intent-brief.md, reusable-analysis-metrics/intent-brief.md; catalogue candidates R049 and R041. These are seeds with stale demand gates, not vetoes.
7. The separately marked open-proposal summaries. They describe unbuilt plans, not baseline APIs. Consider their value and dependencies without researching their detailed design again.

Eight open planning PRs already cover live selection-bound findings (#507), weighted distributions (#514), engineering histograms (#517), wide-to-long (#518), contributor comparison (#519), held-fit diagnostics (#520), rolling windows (#521), and category mappings (#523). Their summaries are supplied. Do not repeat those missions. You may prioritize or combine them, but the new strategic contribution must state the complete job they serve and what still needs design. The inventory and old comparison reports may lag code; prefer supplied current code and docs.

## Ranked questions

1. **Choose the primary workflow and user.** Compare at least three plausible directions: reusable local investigations, interactive narrative delivery, and an embedded analysis workspace. Specify the analyst, input, repeated question, result, and return visit. Which direction gives this small project a useful advantage? Separate source facts, product judgment, and uncertainty. Do not assume commercial growth is the goal.
2. **Compare strong alternatives on the same job.** Use current primary sources for at least four relevant tools. Consider Observable notebooks/Framework or Mosaic, JMP or Tableau, a notebook/report workflow such as Quarto or Jupyter, and a local visual preparation tool such as Orange or Power Query. Choose competitors by workflow relevance. Compare the actual sequence from data to inspection to repeatable result and handoff. Identify where explorEDA can win, where parity is enough, and where another tool should remain the recommendation. Avoid unsupported speed, capacity, or accessibility claims.
3. **Rank three to five capability bets.** For each, state what becomes possible, why it fits the chosen direction, which existing building blocks it uses, cost/dependencies, and the main risk. Include concrete user scenarios and a suggested Design or Methods follow-up question. Judge reusable investigation recipes, parameter-driven detail or comparison, reusable analytical results/measures, and read-only delivery or saved evidence where relevant; you may propose stronger alternatives. Distinguish selecting an existing open plan from adding a new design. Avoid a platform rewrite, universal semantic layer, or an unrelated chart shopping list.
4. **Make the leading bet concrete.** Walk through one realistic analysis, including source update and reopening. Show what the analyst sees and changes, what stays live, what is saved or frozen, which rows a result describes, and what a recipient can inspect. Compare two or three viable product boundaries. Choose one. Do not silently turn static narrative prose into verified computation, confuse current filters with a saved population, or imply that a PNG contains reusable evidence.
5. **Give a buildable first plan and stop list.** For the leading bet, provide independently shippable milestones with real modules, focused acceptance checks, docs sections, and runnable examples. Include a complete first user journey. State which open proposals are prerequisites and which are optional; prefer an independent first milestone. Give an honest rough effort band, not a delivery promise. Name features or strategic directions to Defer or Avoid, with reasons. Separate what Codex can plan now from questions needing another Pro Design or Methods run. Do not use a follow-up research request as a substitute for a useful first plan.

## Evidence and constraints

Cite paths and symbols for current code behavior. Cite current official documentation, papers, or source repositories for decisive external claims, with direct URLs. Label proposals and inference. Explain missing evidence. Do not require a market-size model, billing system, sales process, multi-tenant service, or paid infrastructure.

Use compact controls and visible analytical scope. Keep existing source data intact. Respect actual host callbacks, undo, folder serialization, and notebook write-back. Avoid compatibility scaffolding, extra DTO layers, and speculative worker machinery. Define useful capability before minimizing implementation.

This is not permission to change code. Codex owns local verification, integration, and the review PR. Do not commit, push, merge, deploy, or provision services.

## Deliverables

Attach two complete Markdown files, linked in the final response. A ZIP is optional. Do not create manifests, hashes, receipts, or additional report variants.

- **report.md**: start with the recommended workflow and first capability to build. Answer the ranked questions. Include the competitor comparison, ranked bets, and recommendations with stable RA01-style IDs. Classify each Build, Explore, Defer, or Avoid, with a one-line reason.
- **implementation-plan.md**: a compact, worker-ready plan for the leading bet. Name proposed files as proposed. Each milestone includes behavior, modules, acceptance evidence, docs and runnable example, dependencies, and main risk. Give a suggested next Design or Methods question for each other bet. Keep this a useful staged plan, not an enterprise roadmap.

Codex will read both, check claims that decide the plan against current code, apply local dispositions, and write docs/intent/repeatable-analysis-workflows/implementation-plan.md plus a short research summary.

End with access status, files read, checked facts versus proposals, download links, and unresolved choices. Use one response; do not stop at an outline or ask permission to start.
