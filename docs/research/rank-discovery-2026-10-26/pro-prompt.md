# Rank-based pair discovery: Design mission

https://github.com/byronwall/explorEDA

Ref: `9d64a021e35d312887b1bc848e307f42b6c3091f` (origin/main, October 26, 2026).
Mode: Design, with a precise statistical contract.

What should explorEDA build so an analyst can discover monotonic relationships,
compare Pearson and rank correlation, and inspect the original measurements and records?
Recommend a coherent feature and a staged implementation plan.

Act as a statistical visualization designer who has shipped linked exploratory tools.
Use deep research to compare strong tools and methods. Give candid tradeoffs and rejected options.
Byron, the owner, wants this capability. Do not require outside demand or a usability study.
Old research briefs contain demand gates; this mission and DIRECTION.md supersede them.

## Access check and reading route

Confirm access to the named ref or the attached source packet before research.
The packet supplies complete files from that ref. If decisive files are missing from both,
stop and name the smallest missing input. Do not imply access you do not have.

Read at minimum:

1. `AGENTS.md`, `docs/agent-guide.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, and `docs/research/DIRECTION.md`.
2. `docs/intent/research-ideas-100/ideas/R005-rank-correlation.md`,
   `docs/intent/relationship-discovery/intent-brief.md`, and
   `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
3. `packages/explorEDA/src/components/charts/ScatterMatrix/`: definition, settings,
   planner, component, trace, canvas, and planner tests in the packet.
4. `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts`,
   `definition.ts`, `scatterPlan.ts`, and `fitPlan.ts`.
5. Provider, live-data hook, trace dispatcher, saved validation, DSL settings/export,
   and saved-selection restore tests in the packet.
6. The scatter-matrix docs page, live examples, and demo examples supplied.

## Current facts and boundaries

This is an existing React and TypeScript library and demo. Keep React; use pnpm.
The mixed-type matrix exists: points, correlations, boxes, categorical tiles/shares, and distributions.
Its planner computes Pearson on pair-valid live rows. Dates are continuous timestamps.
Its own selection dims rows without changing coefficients; other charts change live rows.
Color groups have their own coefficients. Source rows establish stable domains and categories.
The matrix Pearson helper requires three pairs; standalone paired summaries allow two.
Treat that difference as a design decision, not the mission's main audit.
No rank correlation setting exists. Do not propose a second generic correlation matrix.

Recent shipped work includes notebooks, annotations, rich scatter, and the workspace start tile.
Open research plans include live findings (#507), weighted distributions (#514),
engineering histograms (#517), wide-to-long (#518), contributor comparison (#519),
held-fit diagnostics (#520), rolling windows (#521), category maps (#523),
parameterized notebooks (#524), lag/difference (#525), pooled/group comparison (#526),
join-key preparation (#527), and covariance regions (#529).
Those are unbuilt proposals, not available dependencies. Make milestone one work on this baseline.
R005's older brief considered a smaller conditional experiment. Expand it into a buildable Design decision.

## Ranked questions

1. Which feature should we build? Compare an explicit Spearman option within the existing matrix,
   a Pearson/Spearman comparison that exposes interesting disagreements, and a prepared-rank workflow.
   Compare primary sources from named tools, libraries, and papers. Include at least one serious
   counterproposal. Decide whether pair ordering or a compact pair list earns its cost;
   separate it from merely adding another coefficient. Keep raw measurements visible.
2. What is the exact statistical contract? Decide average ranks for ties, pairwise deletion before ranking,
   group-specific reranking, numeric/date eligibility, constants, two-pair and small samples,
   infinities, signed zero, missing values, and nonlinear/nonmonotonic examples.
   Compare Spearman with Kendall tau-b and explain the chosen initial boundary.
   Define population and denominator labels. Do not confuse a descriptive coefficient with significance.
   Explain why one global rank cache can be wrong when each pair has different missing rows.
3. What does the analyst see and do? Give a concrete path from a matrix or pair readout to original Scatter,
   linked record selection, trace, and back. Define ownership of live rows, matrix-local selection,
   color groups, date fields, and destination filters. Preserve chart click/Alt-click conventions.
   Design accessible controls at 1280, 783, and 390 pixels. Avoid a new statistics control room.
4. What settings, state, calculations, and persistence should change? Name actual modules and types.
   Decide which consumers share the helper and which keep their current Pearson contract.
   Include savedData, host echoes, Dashboard text, undo, project save/reopen, and image export.
   Bound cost for ten fields and large row sets; distinguish exact computation from approximations.
   Propose simple caching only when correct for the chosen population.
5. What is the implementation plan? Give independent milestones with files, public API changes,
   a focused docs page/section and runnable example in each user-visible milestone, and main risks.
   Include deterministic tables with expected ranks, coefficients, pair IDs, and counts.
   Cover tied ranks, pair-specific missingness, unequal groups, strong monotonic nonlinear association,
   zero rank correlation for nonmonotonic association, constants, two pairs, row permutations,
   increasing/decreasing transforms, unrelated filters, and save/export/reopen.
   Show exact values or expressions where possible and justified numeric tolerances otherwise.

## Evidence and scope

Cite repository paths and symbols for current-code claims. Use current primary sources with URLs
for decisive external claims. Separate facts, inferences, and proposals. State unresolved choices.
Research external behavior; do not infer it from product names or screenshots.

Exclude p-values, significance stars, causal ranking, universal mixed-type association scores,
automatic field coercion, a new backend, external services, broad parser changes, and framework migration.
Do not make unbuilt research PRs prerequisites. Do not commit, push, or implement repository changes.

## Deliverables

Attach two complete Markdown files and link each in the final response. A ZIP is optional.
If files cannot be created, give the complete content inline.

1. `rank-discovery-report.md`: lead with the build decision in one paragraph; answer the ranked questions
   with sources and rejected options. Include stable recommendation IDs RD-01 onward,
   each marked Build, Explore, Defer, or Avoid with one reason.
2. `rank-discovery-implementation-plan.md`: ordered, independently shippable milestones.
   Each names files/modules, proof cases with exact expected results, docs section, runnable example,
   main risk, and acceptance conditions. Milestone one must be executable on this baseline.

Codex will read the reports, check decisive claims against current code, author local dispositions,
and open a small documentation PR with the plan and short summary.
End with access status, files read, checks versus proposals, deliverable links, and open questions.
