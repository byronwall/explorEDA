https://github.com/byronwall/explorEDA

# Mission: decide how Mosaic Selections could help explorEDA

Act as a visualization interaction researcher and pragmatic React/TypeScript library architect. Produce a candid, repository-grounded integration study of Mosaic Selections. Decide what is possible, how it helps users, what costs and correctness risks it creates, and what smallest experiment should come first. This is research and planning. Codex will collect your originals, reconcile them against source, and open a review PR. Do not implement application changes or create commits, pushes, or PRs.

## Access and baseline

Repository: byronwall/explorEDA. Immutable source baseline: 9b16d78e3ed0742ed4d5858c1939fec9e758b510. Local research branch: codex/mosaic-selections-research. Prefer this commit over newer main. The attached mosaic-source-packet.zip is an explicitly permitted selected source snapshot. Its manifest identifies paths, hashes, and baseline. It is not a runnable complete checkout. Read the packet when connected GitHub access is absent or does not expose this exact source. The research prompt is a local addition, not shipped behavior.

GO only after confirming repo identity, baseline, required source availability, paper access, and tool capability. State actual access and coverage. Read-only access is sufficient. If file tools are absent, return the complete deliverable contents in the response. Do not imply that local paths are accessible without attachments.

NO-GO if the repo is wrong; both selected ref and packet are unavailable; required semantic source is missing; or the paper cannot be inspected. Report the smallest missing input. Partial peripheral access may be recorded as uncertainty, but cannot support invented claims. Stop an experiment when it changes exact membership, loses provenance, silently changes population, or requires an unresolved product choice. Do not substitute paper benchmark numbers for measurements in this repo.

## Primary source

Read the full version the user supplied: https://arxiv.org/html/2507.19690v1 . Title: Mosaic Selections: Managing and Optimizing User Selections for Scalable Data Visualization Systems. Jeffrey Heer, Dominik Moritz, Ron Pechuk, July 25, 2025. Inspect its model, algorithms, implementation, evaluation, limitations, and appendices. Use the paper's links to identify official Mosaic implementation and documentation. Verify current APIs against pinned source or a dated revision. Distinguish v1 paper claims from later implementation behavior. Use primary sources for technical claims.

The user's hypothesis: a shared object can hold field predicates, source-space bounds, originating view, and intended scope. A histogram, scatterplot, evidence table, and written finding could consume it. Source chart exclusion should be explicit. Metadata might permit pre-aggregation. Exact evidence must stay available when previews are pixel-binned. These are hypotheses to challenge, not a mandated architecture.

## Verified local starting facts

The existing library and demo use React and TypeScript. Preserve that stack. pnpm is required. This is a personal project: use a small direct design, without enterprise layers, speculative compatibility, server infrastructure, or a general query framework.

FilterTypes.ts currently defines value, range, text, and date-range field filters. CrossfilterWrapper owns one dimension per chart plus workspace dimensions by field. getAllData obtains per-chart groups, which exclude their own dimension filter. Chart localFilters restrict a chart population. localSelections clears cross-chart dimensions for notebook behavior, while workspace filters remain. This means chart-independent meaning has partial foundations already. Verify downstream live-data and trace paths before generalizing this observation.

The baseline includes recently merged complete Heatmap histories and stable color work (PR #450). Do not describe those delivered features as open merely because older intent or research files do. The README describes stable Scatter density bins, exact row evidence, linked selection, metric cards, and record tracing. Current daily findings have a separate condition representation. Do not assume they already subscribe to workspace selections.

## Required reading route (at minimum)

1. AGENTS.md, README.md, CODING_STANDARDS.md, docs/agent-guide.md, docs/ui-defaults.md, docs/performance-checks.md, packages/explorEDA/package.json, packages/explorEDA/README.md.
2. packages/explorEDA/src/types/FilterTypes.ts, ChartTypes.ts, SavedDataStructure.ts; hooks/CrossfilterWrapper.ts and its tests; hooks/applyFilter.ts and tests; hooks/useFieldFilter.ts, hooks/useBrush.tsx; providers/DataLayerProvider.tsx and providers/lib/dataLayerState.ts; lib/chartPopulation.ts; lib/valueParsing.ts. Paths after the package src prefix refer to that directory.
3. packages/explorEDA/src/charts/registry.ts and definitions; components/charts/useGetLiveData.tsx; BarChart, ScatterPlot, Heatmap, DataTable, MetricCard, and trace directories. Read reducers, selection writers, brush inversion, bin edge rules, and evidence readers, not only declarations. Follow actual paths in the manifest when a directory's name differs.
4. packages/explorEDA/src/utils/saveDataUtils.ts; saved structures, persistence tests, DSL export and compile; demo examples; apps/demo/src/daily/findings.ts and relevant tests; apps/demo/src/docs/pages/filters.mdx and heatmap.mdx.
5. docs/intent/precise-composite-selection/intent-brief.md, data-bound-narrative/intent-brief.md, population-baselines/intent-brief.md, current-analysis-trust/intent-brief.md, progressive-built-in-charts/intent-brief.md and implementation-plan.md; docs/composition-mode.md.

Resolve each path from the packet manifest. Enumerate missing files. Do not invent a useChartData.ts hook: the actual shared path is components/charts/useGetLiveData.tsx.

## Ranked questions

### 1. Semantic contract and immediate user benefit (highest priority)

Map actual selection flow from gesture to saved state, per-view resolution, display, selected IDs, table/export, trace, and clearing. Explain which meaning already belongs outside chart renderers and what is coupled to them. Identify concrete failures or user costs, not abstraction for its own sake.

Compare Mosaic clause sets, predicates, resolution, source/client identity, selection scope, activation, and lifecycle with chart filters, workspace filters, localFilters, facets, notebook localSelections, and table filters. Distinguish population restrictions, interactive selections, highlights, viewport bounds, full-source encoding domains, and final evidence membership. Include a truth table for each target: source view, sibling, evidence table, metric, written finding, facet, notebook. Address two charts selecting the same field, multiple sources, empty selection, clearing one source, AND/OR, tuple unions, lasso, missing/invalid values, and data replacement. Do not propose a general Boolean editor as a default.

### 2. Integration options and costs

Compare at least: retain current architecture with documented contracts; introduce a small internal selection/predicate contract over Crossfilter; adopt Mosaic selection components through an adapter if feasible; adopt a Mosaic/DuckDB query backend. Assess independently whether the Mosaic model, library, optimizer, and rendering ecosystem are needed. Keep React and existing renderers. Use a task-specific scored comparison for semantic fit, exactness, consumer work, maintenance, performance potential, migration cost, and public API size. Recommend the smallest option that earns its complexity. State an explicit no-adoption outcome when appropriate.

Show a minimal proposed TypeScript shape and end-to-end pseudocode for one selection shared by histogram, scatterplot, table, and finding. Label it proposed. Define stable source identity, source-unit bounds with inclusivity, typed values, serializable meaning, and target resolution. Separate semantic state from transient pixel/interaction metadata. Reuse existing types and functions where sound. Explain restore, data replacement, field edits, chart deletion/duplication, undo, and DSL consequences without adding speculative compatibility machinery.

### 3. Exact evidence and honest analytical meaning

Define invariants linking visible selection, exact IDs, trace contributors, exports, metric denominators, and written statements. A histogram's context distribution may intentionally differ from selected evidence: state that explicitly. Keep absent periods, invalid dates, blank measures, and true zeros distinct. Retain full-source color meaning where present. Explain numeric/string identity, dates and UTC boundaries, interval edges, facet-local versus global selection, composites versus independent ranges, and lasso versus a rectangular brush. Existing precise-selection intent now favors a lasso proof; do not quietly replace that priority.

Evaluate the current daily findings condition language against shared selection reuse. Show a bounded selected-count or measure binding, inspection behavior, empty/unavailable result, and safe denominator. Avoid generated prose, arbitrary code, or a report template language.

### 4. Performance: when metadata helps and when it does not

Explain the paper's materialized-view compatibility, dimensions, sufficient measures, representation, invalidation, and workload assumptions. Distinguish exact aggregation, pixel quantization, and approximate membership. Determine what works with Crossfilter today and what requires SQL/DuckDB or another backend. Discuss average as sum/count, nonadditive statistics, multidimensional cardinality, sparse versus dense memory, construction cost, cold versus warm latency, active-clause switching, query fan-out, and cache invalidation after calculated fields or data edits. Inspect repo hot paths before suggesting caching.

Report paper benchmarks with dataset, hardware/backend, workload, warm/cold setup, comparator, and limitations. Never promise those speedups here. Propose a small reproducible benchmark against the immutable repo baseline: representative row counts and distributions, 1D and 2D brushes, number of views, p50/p95 interaction and evidence-query latency, memory and setup cost. Exact row-ID equality is a hard gate. Identify whether performance work is justified by existing measured repo evidence or remains a hypothesis.

### 5. Smallest proof and staged decision

Specify a bounded four-consumer experiment (histogram, scatterplot, evidence table, written finding). Include source-self-filtering on/off, two competing selections, clear/restore, zero rows, boundaries, and exact trace/export checks. Give fixture rows and expected IDs for the main cases. Include keyboard operation and wide/intermediate/narrow widths when UI work is later authorized. No execution is required in this research; mark every unrun check.

Define semantic acceptance gates separately from optional acceleration gates. Define GO, NO-GO, defer, and stop outcomes. Identify exact files likely to change and a small milestone sequence. Every user-visible milestone must include the docs section and demo example. Keep the first milestone useful without backend replacement. Bound uncertainties rather than requesting an open-ended rewrite.

## Evidence and recommendation rules

Separate observed repo facts, paper claims, current upstream facts, inferences, and proposals. Cite repo path and symbol (line numbers when reliable), paper section/figure/table, and precise external URL plus retrieval date. Record conflicts between old docs and current source. Label proposed tests versus executed checks. Do not claim tests ran in a non-runnable selected snapshot.

Give each substantive recommendation a stable MOS-001-style ID, problem, affected workflow, evidence, proposed change, benefit, cost, exactness/performance/API impact, alternative, confidence, and proof gate. Classify Keep, Fix now, Explore, Avoid, or Defer. Include reasons to reject attractive ideas. Treat full adoption as an option to earn, not the expected answer.

## Deliverables

Produce a downloadable mosaic-selections-research.zip plus standalone companions:

- mosaic-selections-report.md: detailed standalone research, executive decision, current-flow map, semantic truth tables, option comparison, proposed contract, correctness risks, performance analysis, bounded proof, milestone/docs/example map, unresolved decisions, and evidence appendix.
- mosaic-selections-recommendations.json: stable IDs and all recommendation fields above; machine-readable references to source IDs.
- mosaic-selections-sources.json: source IDs, title/author, URL, version/ref, retrieval date, supported claims, exact sections or repo symbols, access limits, and original filename where collected.
- mosaic-selections-proof-plan.md: fixture and expected IDs, procedures, acceptance/stop gates, benchmark design, proposed versus completed checks.
- source-material/: preserve primary source material you can lawfully download, relevant official implementation excerpts with license/commit context, and research notes. Include the supplied paper when permitted. Do not redistribute material when its license does not permit it; preserve citation, access note, and short excerpt instead. Do not include credentials, unrelated personal content, dependencies, or downloaded executables.
- manifest.json: baseline, coverage, files, byte sizes, SHA-256, checks performed, missing assets, and open questions.

Link every output and ZIP in your final response. If artifact creation fails, return complete Markdown and JSON contents so Codex can preserve them. Do not finish with links alone or an incomplete outline. State access status, inspected files, checks actually run, principal recommendation, artifact list, and limits. Success requires evidence-backed answers to every ranked question, readable deliverables, and explicit unanswered decisions. Codex owns final source verification, integration, Git, and PR work.
