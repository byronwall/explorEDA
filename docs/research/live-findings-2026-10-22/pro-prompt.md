# Design live findings for explorEDA notebooks

https://github.com/byronwall/explorEDA

Mode: Design. Source commit: 7f466fdebcf14c0fd87233aa634c0c74f91b4e93.

What should explorEDA build so an author can put live numerical findings in a notebook, bind them to exact selections and evidence, and keep fixed prose honest during exploration?

Recommend a substantial but staged feature, with an implementation plan workers can start. Byron is the demand. Do not require outside demand, observed defects, or a usability study. This is feature design, not a robustness audit. Codex will review the result against code and make all repository changes.

Act as a senior visualization and notebook designer who has built reactive documents and linked views. Use strong tools and research to make a candid recommendation. Compare alternatives and choose one. Do not default to keeping current behavior because a feature is unproven.

## Access

Read the attached scoped source packet at the stated commit. It contains complete text files with path headers; it is not a runnable checkout. Prefer this snapshot when GitHub differs. If decisive source is absent from both, stop and name the smallest missing input. State the access limits without inventing runtime evidence.

## What is new about this mission

The prior Mosaic study already compared selection architectures and proposed a small Crossfilter contract, a histogram/lasso/table/count proof, and deferred a new backend. Reuse its conclusions; do not repeat the survey. The new decision is the feature's authoring and reading experience, live value/binding representation, explicit scope and evidence references, notebook persistence, and a shippable plan.

Current source facts checked locally:

- NotebookProse renders static Markdown through markdown-it. It receives only text.
- ExplorEdaNotebook uses DataLayerProvider with localSelections. Notebook charts keep their selections local by default. Do not silently change that behavior.
- Notebook writeBack skips select.\* tokens as transient state. Current prose editing preserves surrounding source.
- MetricCard already uses summarizeGroup, field conversion, formatting, empty/invalid states, contributor traces, and exact chart-filtered IDs. Its baseline can differ from a workspace-eligible denominator.
- DailyFinding/evaluateFinding is a separate demo/corpus evaluator. It does not already follow interactive notebook selection.
- SavedDataStructure has charts, calculations, workspace filters and aggregate references, but no notebook finding registry.
- Current FilterTypes has value/range/text/date-range filters; polygon/lasso is not delivered. Do not call a rectangle an exact lasso.

Recent work shipped sheets, section layouts, notebook text editing, annotations, and daily narrative examples. Open repairs cover row identity/restore, histogram edges, entity grain, regression, and current trust tests. These are separate work; do not turn this design into another defect audit.

## Reading route

At minimum read these packet files:

1. AGENTS.md, docs/research/DIRECTION.md, docs/agent-guide.md, CODING_STANDARDS.md, docs/ui-defaults.md.
2. docs/intent/data-bound-narrative/intent-brief.md and docs/intent/precise-composite-selection/intent-brief.md. Their old demand/expansion gates are historical; DIRECTION.md governs this mission.
3. docs/research/mosaic-selections-2026-10-20/{README.md,recommendation-review.md}; R067 and R068 idea briefs.
4. components/notebook/{ExplorEdaNotebook.tsx,NotebookProse.tsx,ExplorEdaNotebook.test.tsx}; lib/notebook/{parseNotebook.ts,compileNotebook.ts,writeBack.ts,sheets.ts,writeBack.test.ts} under packages/explorEDA/src.
5. MetricCard/{MetricCard.tsx,metricCardPlan.ts,metricCardTrace.ts,definition.ts}, lib/aggregates.ts, hooks/CrossfilterWrapper.ts, components/charts/useGetLiveData.tsx, providers/DataLayerProvider.tsx, types/{FilterTypes.ts,SavedDataStructure.ts}, utils/saveDataUtils.ts.
6. apps/demo/src/daily/findings.ts, apps/demo/src/docs/pages/notebooks.mdx, and the supplied earthquakes notebook.

## Ranked design questions

1. What should the author and reader do? Compare at least three serious designs: inline binding tokens, named finding declarations referenced from prose, and references to existing chart/card results. Compare authoring cost, exact scope, inspectability, source edit stability, and extensibility. Recommend a coherent design with concrete notebook syntax, reader interactions, and compact editor controls. Show a complete example with two values, a named cohort, a comparison, and supporting records. Decide when an opt-in shared selection is needed versus a binding to one chart's local selection.
2. What is the smallest durable analytical model that supports the design? Choose metric definitions, ownership, eligible/selected/contributing populations, denominator choices, typed field references, and invalid states. Reuse existing reducers, formatters, trace routes, and provider state where they fit. Distinguish definition from derived result. Resolve binding by name versus chart ID, sheet changes, renamed/deleted fields or charts, duplicate names, zero/empty/invalid values, and source replacement. Give TypeScript shapes and exact expected values for a small fixture. Do not invent a second competing selection store.
3. How should authored claims follow evidence without automatic rewriting? Distinguish fixed dataset context, live descriptive values, and a saved cohort claim. Decide whether a reader inspects current rows or restores a saved scope. Explain how an explicit link communicates that difference. Show a filter that reverses a comparison. Avoid universal staleness warnings, arbitrary code execution, generated prose, or causal claims from descriptive measures.
4. What can we learn from the best existing tools and papers? Research at least four relevant primary sources, such as Observable reactive documents, Quarto inline computation, Olli/Idyll data-driven documents, Vega-Lite parameters, Mosaic, or another stronger comparator. Check current official docs/papers. Explain which mechanisms fit this React/Crossfilter/Markdown product and which should be rejected. Focus on design consequences rather than a catalogue of features.
5. What should we build first, then next? End with a staged implementation plan, each milestone useful on its own. Name concrete current files and proposed new modules, dependencies, acceptance tests, docs sections, and a reachable runnable example in the same milestone. Include keyboard and 1280/783/390px checks. Provide a cut line that still delivers live findings without requiring a full query language, report engine, or new database. Decide where exact lasso and shared selection belong in the sequence; reuse the earlier Mosaic result rather than redesigning it.

## Evidence and constraints

Cite repository paths and symbols for source claims. Cite primary sources with URLs for decisive external claims. Separate facts, inferences, and proposals. State what you checked versus proposed. Do not invent participant results, benchmarks, or observed product failures.

Keep React and TypeScript, pnpm, Crossfilter, current chart renderers, and one local client/server. Preserve existing static Markdown and local notebook selection defaults. No framework conversion, remote model runtime, paid service, arbitrary JavaScript templates, generic query engine, mixed-version support, or automatic migration framework. Do not import the daily evaluator into the package merely for apparent reuse; decide the shared semantic boundary.

## Deliverables

Put the decision at the top: what to build and why, in one paragraph.

Attach two Markdown downloads and link both in the final answer:

- report.md: ranked answers, primary-source comparisons, worked notebook example, recommendation table with stable LF-01 style IDs and Build/Explore/Defer/Avoid dispositions, one-line reasons, and open questions.
- implementation-plan.md: ordered shippable milestones with files/modules, exact fixture values and useful tests, docs page/section and runnable example in each visible milestone, main risk, dependency order, and cut line. A worker must be able to start milestone one from this plan.

A ZIP is optional. Do not spend time on manifests, hash receipts, archive ceremony, or a large study protocol. If downloads cannot be created, give full Markdown inline. End with access status, files read, what was checked versus proposed, links, and open questions. Do not commit or push.
