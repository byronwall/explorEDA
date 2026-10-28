# Methods: compare empirical distributions and inspect the difference

https://github.com/byronwall/explorEDA

Source commit: `9d64a021e35d312887b1bc848e307f42b6c3091f` (origin/main, refreshed October 28, 2026).
Mode: Methods. The attached source packet contains complete files from this baseline and this prompt.

## Mission

What methods should explorEDA build to quantify how two empirical distributions differ, explain that difference, and reach the original records?

Design a useful comparison over one numeric field and two groups in one loaded table. Start from the existing ECDF. Choose the statistics, their meaning, and the interaction. End with a staged implementation plan. This should add a capability analysts notice, with careful mathematics rather than a menu of unexplained tests.

Act as an applied statistician and visualization designer who has shipped exploratory statistical tools. Give candid tradeoffs, rejected options, numerical limits, and uncertainties. Byron is the demand. Do not require outside demand, usability studies, or an observed bug. Do not turn this into a robustness audit.

## Access check

First confirm access to the named ref or the complete attached packet. The packet takes precedence over a different live ref. If decisive inputs are missing from both, stop and name the smallest missing input. Do not claim source access you lack.

## Reading route

Read at minimum these files, supplied in the packet:

1. `AGENTS.md`, `docs/agent-guide.md`, `docs/research/DIRECTION.md`, `CODING_STANDARDS.md`, `docs/ui-defaults.md`, and `README.md`.
2. `packages/explorEDA/src/components/charts/Ecdf/`: `definition.ts`, `ecdfPlan.ts`, `ecdfPlan.test.ts`, `EcdfChart.tsx`, `EcdfChart.test.tsx`, `ecdfTrace.ts`, `EcdfTraceBody.tsx`, and `EcdfSettingsPanel.tsx`.
3. `packages/explorEDA/src/components/charts/useGetLiveData.tsx`, `useGetColumnData.tsx`, `packages/explorEDA/src/lib/chartPopulation.ts`, `lib/valueParsing.ts`, `lib/categories.ts`, `types/FilterTypes.ts`, `types/ChartTypes.ts`, `providers/DataLayerProvider.tsx`, and `hooks/CrossfilterWrapper.ts` with its tests.
4. `packages/explorEDA/src/components/charts/trace/traceTypes.ts`, `ChartTraceScope.tsx`, `packages/explorEDA/src/types/SavedDataStructure.ts`, `types/SavedDataTypes.ts`, `lib/dsl/settingKeys.ts`, `lib/dsl/export.ts`, `lib/dsl/compile.ts`, and `lib/notebook/writeBack.ts`.
5. `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts`, `apps/demo/src/docs/pages/ecdf.mdx`, `apps/demo/src/docs/live/examples.ts`, `apps/demo/src/demos/examples.ts`, and `apps/demo/src/demos/coverage.ts`.
6. `docs/intent/population-baselines/intent-brief.md`, `docs/intent/research-ideas-100/ideas/R009-weighted-ecdf.md`, and `ideas/R064-notebook-frozen-results.md` under the same catalogue.

## Current facts and scope

This is an existing React/TypeScript library and demo. Keep that stack and use pnpm. The provider takes rows and assigns positional IDs. Do not promise durable record membership from those IDs.

ECDF already has grouped curves, ties collapsed into steps, inclusive lower/upper threshold shares, median/90% marks, threshold/span selection, source traces, and a display log scale. Each curve uses its valid-value count. The planner caps visible groups at ten and pools remaining groups into Other. Do not treat this display pool as an automatically meaningful comparison population.

`useGetAllIds(settings)` applies chart-local population restrictions. `useGetLiveIds` uses provider filter ownership and optional facets. Read those paths before describing the population. `showOverall` builds its curve from the current live entries; it does not create a frozen reference. Metric cards already compare current metrics with all-source metrics. Neither is a general two-distribution method.

Named baselines and reusable outputs have historical low-priority seeds. Do not require either for this feature. Start with two explicit groups on the same field and same source revision. Broader saved predicates, frozen snapshots, and cross-source comparisons can be separate later decisions. This mission differs from open PR #514, which plans weighted ECDFs and inverse quantiles. Do not repeat its scope or assume its proposal has shipped. Other open research PRs are proposals, not dependencies.

## Ranked questions

1. **Choose the method bundle.** Compare maximum ECDF separation (descriptive KS distance), first Wasserstein distance, signed quantile differences, and a small number of credible alternatives. Which combination gives complementary, understandable answers? Define direction, scale, units, and exact formulas. Distinguish a descriptive distance from a hypothesis test. Decide whether any inferential output belongs in the first release, given ties, repeated entities, overlapping groups, optional stopping, and analyst-selected filters. Name and cite primary papers and implementations.
2. **Define both populations and interpretation.** Specify eligible rows, exclusions, sample sizes, group identity by typed value, and whether each group is conditioned on other filters. Decide what a threshold selected on this same chart should do to the comparison. Cover empty/singleton/constant groups, unequal sizes, ties, shared observations, a group versus its complement or containing whole, and repeated measurements. Propose clear controls and text that keep their meaning visible. Avoid inventing a durable cohort system.
3. **Make the answer inspectable.** Show what a user sees and does on the ECDF, in the readout, and in a trace. A maximum vertical gap has two counts at a threshold. Wasserstein distance integrates intervals; it has no unique set of causal records. Define honest record continuation for both. Address tied maximizing thresholds, left/right limits, above-versus-below direction, and display log axes. Explain what a distance cannot tell the user.
4. **Give correct algorithms and numerical contracts.** Design sorting/merge algorithms over raw values and IDs. State time/memory bounds, stable deterministic tie rules, and caching inputs. Cover huge finite endpoints, small separations on large offsets, unequal sample masses, integration overflow, scaling/unit transformations, invariance, cancellation, and rounding. Decide what is computed exactly, approximately, or unavailable. Do not use screen pixels, bins, or rounded labels as statistical inputs.
5. **Supply exact proof cases.** Include hand-checkable arrays, exact rational results where possible, expected maximizing intervals/thresholds and contributor IDs, exclusions, swapped group results, replication effects, and positive-affine transformations. Include crossing curves, discrete ties, identical shapes with unequal row counts, empty groups, and large-offset cases. Provide independent oracle routes. Explain why any normalized distance is or is not appropriate; do not hide unit changes behind an arbitrary scale.
6. **End with a buildable plan.** Compare a compact ECDF extension with a separate comparison chart and choose. Name saved settings, API/type changes, planner/trace/UI modules, filter ownership, DSL parse/export, notebook writeback, callback/history, source refresh, image export, docs, and a runnable example. Each milestone must ship alone and include its docs page/section, example, meaningful tests, and main risk. Explicitly separate required work from optional later capabilities. Use existing boundaries where clear; avoid a generic statistical engine or execution graph.

## Evidence and boundaries

Cite repository paths and symbols for code claims. Cite current primary sources with URLs for decisive external claims. Separate facts, inferences, and proposals. Compare strong tools or libraries where that improves the choice. Do not use marketing summaries as mathematical evidence.

The first build analyzes an unweighted numeric field from one table. Weights, multivariate distances, automatic all-pairs scanning, drift alerts, experiment management, external compute, and paid services are outside the first release. Briefly state how later weights would change the contract without redesigning weighted ECDFs here. Keep record exchange and source identity limits explicit.

The user prefers direct control flow, few meaningful tests, compact controls, and no enterprise layers. New UI must support pointer and keyboard use at 1280, 783, and 390 pixels. Product text should explain the statistic, not expose implementation details.

## Deliverable

Attach two complete Markdown downloads and link both in the final response. A ZIP is optional. Do not produce manifests, hashes, source receipts, or a code repository.

1. `methods-report.md`: start with one paragraph stating what to build. Answer the ranked questions. Include formulas, exact test vectors, algorithms, primary sources, rejected alternatives, and recommendations with stable IDs `DD01`, `DD02`, and so on. Classify each Build, Explore, Defer, or Avoid, with one reason.
2. `implementation-plan.md`: ordered, independently shippable milestones. Name source paths or proposed modules, state and persistence boundaries, exact acceptance cases, docs page/section, runnable example, and risk in each milestone. A worker should be able to start milestone one from this plan.

Codex will read the reports, check decisive claims against current code and primary sources, integrate the plan, and open a review PR. Do not commit, push, merge, or ask to run the repository yourself.

Finish with access status, files read, what you checked versus proposed, deliverable links, and unresolved questions. If file creation is unavailable, provide the complete content inline.
