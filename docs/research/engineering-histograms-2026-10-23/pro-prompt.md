# Engineering histograms and specification limits

https://github.com/byronwall/explorEDA

Ref: 6d9130ba1c5242c15bbbeb9b20b7fd0707d0aa0e (origin/main).
Mode: Design.

What should explorEDA build for engineering histograms with authored boundaries, specification limits, grouped compliance counts, and exact out-of-spec records?

Act as a visualization tool designer with experience in engineering statistics and linked analytical views.
Compare strong tools and papers, recommend a coherent design, and give workers a staged implementation plan.
Byron is the demand. Do not require outside demand, a named failure, or a usability study.
The result should add useful capability. An audit or lesson alone does not satisfy this mission.

## Access check

Read the supplied source packet at this ref. Confirm access before researching.
It contains complete selected text files, each headed by its repository path.
If a decisive input is absent and repository access fails, stop and name the smallest missing input.
Do not infer unseen implementation. Codex will review the result and make all repository changes.

## Context and reading route

Read AGENTS.md, docs/agent-guide.md, docs/ui-defaults.md, CODING_STANDARDS.md, and docs/research/DIRECTION.md first.
This existing React/TypeScript library stays React. Use pnpm. Assume one developer, server, client, and deployed version.

Read BarChart/definition.ts, bins.ts, bins.test.ts, barPlan.ts, BarChart.tsx, BarChartSettingsPanel.tsx, and seriesBarPlan.ts.
These paths are under packages/explorEDA/src/components/charts/.
Then read BarChart/barTrace.ts, BarChart/BarTraceBody.tsx, Ecdf/ecdfPlan.ts, and Ecdf/definition.ts.
Read components/charts/useGetLiveData.tsx, hooks/applyFilter.ts, types/FilterTypes.ts, types/ChartTypes.ts,
utils/saveDataUtils.ts, lib/dsl/settingKeys.ts, lib/dsl/compile.ts, and lib/annotations/{types,context,resolve}.ts.
Read the prior engineering-bins research README, decisions, and evidence, plus R008 and population-baselines intent.
Read apps/demo/src/docs/pages/bar.mdx and ecdf.mdx, and the example catalogue/coverage files supplied.

Current source facts to verify: numericBins uses full-source extents, count-based automatic bins, and integer-centered bins.
Bar plans hold exact source contributors. Bin membership and range filters now agree at interior edges through maxExclusive.
The earlier audit predates that repair. Do not re-research or rebuild it.
A seriesField currently takes a separate categorical series-bar route. Do not assume grouped numeric histograms exist.
Current annotations can draw fixed limits; that alone does not define compliance statistics or exact tail records.
The earlier engineering audit deferred controls for lack of named demand. DIRECTION.md supersedes that gate.
Reuse its useful math and comparisons, but answer the new feature design question.
Weighted ECDF research has open PR514, and live notebook findings has PR507. Avoid expanding those plans.

## Ranked questions

1. What complete first version should users gain? Compare JMP, Minitab, Origin, and suitable libraries or papers.
   Decide how authored width/origin, short explicit edges, spec limits, group comparisons, counts, and exact records fit together.
   Compare viable designs. Pick an ambitious but coherent scope, with an independently useful first milestone.
2. How should binning and specification semantics work? Separate bin boundaries from lower/upper acceptance limits.
   Decide equality at limits, one-sided limits, invalid measurements, finite explicit coverage, under/overflow, empty bins,
   irregular-width count versus density, grouped denominators, shared bin edges, and stable axes under filtering and refresh.
   State what happens when bounds collapse numerically or a regular grid needs too many bins.
   Avoid arbitrary epsilon membership rules. Keep statistical acceptance limits distinct from control limits and fitted capability claims.
3. What does a user see and do? Give compact settings and chart/readout flows, plus pointer and keyboard behavior.
   Explain how to reach exact below-limit, in-spec, and above-limit records with existing trace and row surfaces.
   Decide how to express both tails when current Filter[] combines filters by intersection and a range cannot represent a union.
   Choose the smallest clear state model. Do not promise an OR filter without identifying its required changes.
   Clarify how spec coloring interacts with series coloring and saved selections. Preserve visible scope and current live settings.
4. What changes in settings, planning, filtering, persistence, Dashboard text, annotations, and source evidence?
   Give concrete types or API sketches and actual files. Prefer a single computed source of truth for displayed counts and records.
   Address edits, undo, export/recompile, restore, source replacement, and independent local chart predicates.
   Keep existing automatic histograms useful. Do not add version coexistence, migration layers, or a general process-control platform.
5. Which fixtures prove the design? Give small labeled records with exact expected bin counts, group denominators,
   spec shares, tail membership, ties, missing values, and refresh outcomes. Include irregular edges and a stable decimal grid.
   Give only tests for important behavior. Name browser acceptance at 1280, 783, and 390 px.
6. What should be built first, explored, deferred, or avoided? Give milestones that workers can start immediately.
   Each milestone must name implementation files, meaningful checks, the docs page/section, a runnable demo example,
   and the main risk. Put docs and examples in the same milestone as each visible feature.

## Evidence and boundaries

Cite repository paths and symbols for source facts. Use current primary sources with URLs for decisive external claims.
Keep facts, inferences, and proposals distinct. Say when evidence is missing or conflicting.
Research externally; do not run this repository or write commits. No paid services, deployment, or unrelated data preparation.
Do not turn the answer into a robustness audit. Existing endpoint fixes are context, not the requested product.
Do not add production abstractions or broad frameworks without a concrete need.

## Deliverables

Attach report.md and implementation-plan.md as downloadable Markdown. One ZIP is optional.
Start the report with one paragraph: what to build and why.
Answer each ranked question. Provide stable recommendation IDs with Build, Explore, Defer, or Avoid and a one-line reason.
Keep the plan concrete and readable in a few minutes; put detailed comparisons and fixtures in the report.
Do not create hash manifests, receipts, or archives of source code.
End with access status, files read, what you checked versus propose, deliverable links, and open questions.
