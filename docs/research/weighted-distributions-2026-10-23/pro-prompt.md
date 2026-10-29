# Weighted empirical distributions: Methods mission

https://github.com/byronwall/explorEDA

Source ref: `6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e` (origin/main).
Mode: **Methods**. The attached source packet contains complete scoped files at this ref.

What weighted distribution methods should explorEDA build, starting with ECDFs and quantiles, and how should workers implement them?
Give a staged, ambitious but bounded plan. Byron is the demand. Do not require outside demand or a usability study.
The result should let analysts inspect represented population shares without expanding weighted records into duplicate rows.

Act as an applied statistician who has built interactive analytical tools.
Compare conventions candidly. Separate mathematical choices from interface choices and statistical inference.
Codex will check your decisive claims and make all repository changes.

## Access check

First confirm you can read the packet, including ecdfPlan.ts, definition.ts, ecdfTrace.ts, valueParsing.ts, and ecdfPlan.test.ts.
Use the packet as the baseline if connected GitHub access cannot read this ref.
If a decisive input is missing from both, stop and name the smallest missing input.

## Context and reading route

explorEDA is a React and TypeScript library with a React demo, linked charts, row inspection, calculated fields, and saved settings.
Keep React. Use pnpm. Assume a personal project, one server, one client, and one deployed version.
Prefer direct code and shared existing contracts. Do not design a survey inference platform or universal reducer framework.

Read at minimum:

1. AGENTS.md, README.md, CODING_STANDARDS.md, docs/agent-guide.md, docs/ui-defaults.md, docs/research/DIRECTION.md.
2. docs/intent/research-ideas-100/ideas/R009-weighted-ecdf.md and docs/intent/reusable-analysis-metrics/intent-brief.md.
   These contain older demand gates. DIRECTION.md and this prompt supersede those gates.
3. packages/explorEDA/src/components/charts/Ecdf/: definition.ts, ecdfPlan.ts, ecdfPlan.test.ts, EcdfChart.tsx,
   EcdfSettingsPanel.tsx, ecdfTrace.ts, EcdfTraceBody.tsx, EcdfChart.test.tsx.
4. packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts and its tests;
   packages/explorEDA/src/lib/aggregates.ts; packages/explorEDA/src/lib/valueParsing.ts.
5. packages/explorEDA/src/components/charts/Composition/compositionTypes.ts;
   packages/explorEDA/src/lib/dsl/settingKeys.ts; packages/explorEDA/src/types/ChartTypes.ts.
6. apps/demo/src/docs/pages/ecdf.mdx, apps/demo/src/docs/pages/boxplot.mdx,
   apps/demo/src/docs/live/examples.ts, apps/demo/src/demos/examples.ts, apps/demo/src/demos/coverage.ts.

Current source observations, to check: ECDF accumulates valid row counts at ties and uses each group's valid count as its denominator.
Its inclusive lower and upper directions retain exact source IDs. Its group cap ranks by row count.
Box plot quartiles use interpolation at (n-1)p. These unweighted conventions need not change.
Settings, trace text, exclusions, and source membership are part of a weighted feature, not later cleanup.
Recent histogram edge and identity fixes are merged; this mission adds capability rather than auditing those repairs.

## Ranked questions

1. Define the weighted ECDF, inclusive upper-tail share, and inverse quantiles exactly.
   Distinguish frequency, probability/sampling, reliability, and exposure weights.
   Which semantics can share a descriptive curve, and which need distinct labels or methods?
   Compare primary statistical sources and implementations, including R and NumPy weighted quantiles where relevant.
   Decide whether integer replication equivalence, scale invariance, and equal-weight equivalence can all hold for the selected quantile convention.
   Explain incompatibilities explicitly. Keep existing unweighted interpolation intact unless a deliberate visible choice requires otherwise.
2. Specify eligibility and numerical behavior: missing/invalid/nonfinite/negative/zero weights, invalid x, all-zero totals,
   dominant weights, very small and very large magnitudes, cancellation/overflow, ties, empty groups, and log x.
   Choose practical accumulation and comparison algorithms. State complexity and numerical limits.
   Distinguish source rows, eligible rows, positive contributors, raw total weight, and normalized mass.
   Do not infer sample size, precision, confidence bounds, or survey-design validity from total weight.
3. Design the first native weighted ECDF and its exact evidence contract.
   Decide the weight-field API and visible labels, group denominators and Other ordering, optional overall curve,
   peer filtering, threshold/range selection, zero-weight row inspection, and what source records linked filters select.
   Compare a prepared cumulative table as an alternative, then recommend a buildable native boundary.
   Keep a row's identity: weighting never creates replicated records. Explain numerator and denominator inspection.
4. Decide the useful next steps for weighted quantile marks and box summaries.
   Scope weighted boxes, histograms, annotation statistics, and shared reducers separately.
   Prevent an unweighted annotation median from silently claiming to be the weighted curve's median.
   Do not expand every chart in milestone one. Identify what to Build, Explore, Defer, and Avoid.
5. Provide a worker-ready plan with exact fixtures and expected values.
   Include a tied-value fixture with zero and invalid weights, unequal group sizes, peer filters, and a dominant observation.
   Give exact lower/upper shares, quantiles, selected IDs, exclusions, denominator totals, and scale-invariance checks.
   Add a case that distinguishes the selected quantile convention from unweighted interpolation and integer replication.
   Specify save/restore and DSL round trips, trace acceptance, and browser checks at 1280, 783, and 390 pixels.

## Evidence and boundaries

Cite repository paths and symbols for current behavior. Cite current primary docs, papers, or source for decisive external claims.
Separate facts, inferences, and proposed behavior. Explain uncertainty that changes implementation.
Research and design the feature; do not run a robustness audit or ask for a named outside user.
No new framework, backward-version coexistence, paid service, server engine, or broad expression language.
Do not ask for manifests, integrity receipts, or a study as a prerequisite to the plan.

## Deliverables

Attach two complete Markdown downloads and link them in your final message. One ZIP is optional.

- **report.md:** Start with one paragraph saying what to build. Answer the ranked questions with sources.
  End with recommendations with stable WD identifiers and Build/Explore/Defer/Avoid dispositions and one-line reasons.
- **implementation-plan.md:** Milestones in order, each shippable alone. Name source files or modules,
  useful tests with exact expected values, the docs page/section, a runnable demo example, and the main risk.
  Put docs and examples in the same milestone as each visible capability.
  Target docs/intent/weighted-distributions/implementation-plan.md for local integration.

End with access status, files read, what you checked versus proposed, deliverable links, and open questions.
If attachments fail, provide complete content inline. Codex owns review, commits, and the PR.
