# ChatGPT Pro prompt: deterministic rendering and data traceability plan

https://github.com/byronwall/explorEDA

## Mission

Act as a senior visualization-engine architect. Produce a repository-grounded implementation plan for extending the data-tracing ideas from our ongoing conversation into `explorEDA`.

This is an architecture investigation with authorized repository mutation. Clone the repository into a writable environment, create the branch named below, add the requested analysis documents, build bounded prototypes when they can resolve architectural uncertainty, validate the work, commit it, and push the branch. Do not open a pull request unless I ask later.

Use current `origin/main` as the base. This prompt was prepared from clean local commit `593ca2e1f9210d5bc66985437afc37fcfcd8a56a`. Verify the current remote ref and record the base commit. Newer repository evidence takes precedence when `main` has moved. Create and push `codex/deterministic-rendering-data-traceability`; never push to `main`.

The plan must cover two connected tracks:

1. **Deterministic middle rendering stack.** Separate chart computation and render planning from React TSX. Introduce the smallest useful non-React layer that can deterministically resolve filtered rows, facets, transforms, aggregates, scales, layout, marks, interactions, and diagnostics before a React, SVG, Canvas, or Three.js adapter draws them. Crossfilter behavior is part of this design, not an edge case.
2. **End-to-end data traceability.** Make it possible to inspect how source rows and fields flow through conversion, calculated fields, filters, facets, grouping, aggregation, sampling or reduction, scales, and marks. A user should be able to start at a rendered glyph or derived value and trace back to contributing source rows, including exclusions and fixed inputs where relevant.

Use the discussion immediately before this prompt as important product context. Extract its principles and unresolved questions before you inspect the repository. Reconcile that context with repository evidence. Do not force a prior idea into the codebase when a smaller or clearer design fits better.

The decision this plan must support is: **What is the smallest staged architecture that moves chart logic out of TSX and makes source-to-glyph lineage explicit, while preserving current cross-chart filtering and allowing incremental migration?**

## Access preflight

### GO

Continue only if all of these checks pass:

- You can access the exact repository at the URL above.
- The owner and repository are `byronwall/explorEDA`.
- You can inspect `main` and record its commit.
- You can read the required source files and design notes below.
- You can see the ongoing thread context about data tracing.
- You can produce a detailed plan without guessing a material product decision.
- The active environment has a writable clone, can create the exact branch `codex/deterministic-rendering-data-traceability`, and can push that branch to `origin`.

Before mutation, report the clone path, base commit, current branch, `git status --short`, and push capability. Preserve any existing changes. A fresh clone is preferred.

### NO-GO

Stop and report `NO-GO` for mutation if the repository is missing, is the wrong repository, lacks the required files, the prior thread context is unavailable, the checkout is not writable, the required branch cannot be created, or push access is absent. Also stop if conflicting instructions would materially change the architecture or if a core success gate cannot be evaluated from available evidence.

Name the failed gate, show the evidence, and give the smallest action that would unblock the work. Do not claim a repository review from partial access. If repository reading works but mutation or push does not, complete the investigation and return the full documents plus a usable patch in the response. State clearly that no branch, commit, or push was created.

## Repository facts to verify

Treat these as starting facts, not conclusions:

- The project is a React and TypeScript visualization library with a demo app. It uses pnpm 11.9.0.
- `DataLayerProvider.tsx` owns source rows, calculated fields, field conversions, chart settings, named aggregates, Crossfilter state, and persistence-related state.
- `CrossfilterWrapper.ts` maintains one dimension and group per chart. It exposes live row IDs through group entries and applies each chart definition's filter function.
- Hooks such as `useGetLiveData.tsx` and `useGetColumnData.tsx` join live IDs back to field columns.
- Individual chart components currently mix data selection, transforms, scale calculation, interaction, and drawing. The implementations use several targets, including SVG, Canvas, and Three.js.
- Faceting groups row IDs in `FacetContainer.tsx`, then renders the same chart once per facet. Current labels state that scales use full data and selections apply across facets.
- `ChartDefinition` combines metadata, the React component, settings UI, defaults, validation, and filter logic. The registry is also exported as the package's `./core` entry point.
- Saved workspace state stores chart settings, calculations, color scales, field settings, named aggregates, and rows settings. Raw rows live outside `SavedDataStructure`; `SavedAnalysisStructure` can include them.
- Traceability exists in limited forms. Calculated fields have a dependency trace. Grouped aggregates and pivot cells retain contributor IDs, inclusion state, and exclusion reasons.
- The repository already includes design notes about deterministic UI templating, spec-driven visualization, transforms, grouping, derived layers, source tables, and visualization traceability.

Verify each material fact against the selected ref. Correct this list in the deliverable when the repository differs.

## Required reading route

Read at minimum, in this order:

1. `AGENTS.md`
2. `README.md`
3. `package.json`
4. `packages/explorEDA/package.json`
5. `packages/explorEDA/tsup.config.ts`
6. `docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt`
7. `docs/transcripts/2026-08-25-deterministic-ui-templating.txt`
8. `docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt`
9. `docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt`
10. `docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt`
11. `docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt`
12. `docs/calculation-workflow.md`
13. `packages/explorEDA/src/providers/DataLayerProvider.tsx`
14. `packages/explorEDA/src/providers/lib/dataLayerState.ts`
15. `packages/explorEDA/src/hooks/CrossfilterWrapper.ts`
16. `packages/explorEDA/src/hooks/useGetLiveData.tsx`
17. `packages/explorEDA/src/hooks/useGetColumnData.tsx`
18. `packages/explorEDA/src/types/ChartTypes.ts`
19. `packages/explorEDA/src/types/SavedDataStructure.ts`
20. `packages/explorEDA/src/charts/registry.ts`
21. `packages/explorEDA/src/charts/registerAllCharts.ts`
22. `packages/explorEDA/src/components/charts/ChartRenderer.tsx`
23. `packages/explorEDA/src/components/charts/BaseChart.tsx`
24. `packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx`
25. `packages/explorEDA/src/lib/aggregates.ts`
26. `packages/explorEDA/src/lib/calculations/CalculationState.ts`
27. `packages/explorEDA/src/components/calculations/CalculationTrace.tsx`
28. `packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx`
29. Representative chart paths: `ScatterPlot`, `LineChart`, `BarChart`, `BoxPlot`, `PivotTable`, `DataTable`, and `ThreeDScatter` under `packages/explorEDA/src/components/charts/`.
30. Relevant tests under `packages/explorEDA/src/hooks/`, `packages/explorEDA/src/lib/`, `packages/explorEDA/src/test/providers/`, `packages/explorEDA/src/test/charts/`, and each chart directory.

Also search for every caller of `getColumnData`, `getLiveItems`, `getAggregateResult`, `ChartRenderer`, and `getFilterFunction`. Inventory all chart types before proposing the migration order.

Use these repository commands only as verified guidance for a writable checkout:

```sh
pnpm check
pnpm --filter exploreda test
pnpm --filter exploreda check-types
pnpm --filter exploreda build
```

Do not claim that you ran a command when GitHub access only allowed source inspection.

## Ranked questions

Answer these in order. The first question is the most important.

### 1. What exact boundary should exist between state, deterministic computation, and drawing?

Trace one scatter plot, one grouped bar chart, one faceted chart, one line chart with reduction, and one 3D scatter from source rows to rendered output. Identify where React hooks or components currently perform domain work.

Define the minimum useful input and output contracts for a pure or deterministic render-planning layer. Show TypeScript type sketches for the contracts. Include identities for rows, derived rows, groups, facets, series, scales, marks, and diagnostics only where current or near-term behavior requires them.

Decide which work belongs in:

- source and field preparation;
- filter evaluation and Crossfilter coordination;
- transform and aggregate execution;
- facet and series partitioning;
- scale and layout resolution;
- a renderer-neutral scene or mark plan;
- target-specific SVG, Canvas, React, or Three.js adapters;
- interaction handling that turns pointer or keyboard input back into filter or selection updates.

Use a formal consider-and-contrast checkpoint before selecting the boundary. Compare two to four genuinely different approaches that solve the same decision. Include the current architecture or a minimal extraction when it remains viable. Likely candidates are a small set of chart-specific pure planners, one typed renderer-neutral render-plan model, and a fuller declarative visualization grammar, but change the candidates when repository evidence supports better alternatives.

Score each approach from 0 to 10 only on domain-specific dimensions that can change the decision. Use these starting dimensions when evidence confirms they discriminate:

- repeatability of the resolved plan for identical rows, settings, filters, and viewport inputs;
- fidelity to current Crossfilter self-filter and cross-chart behavior;
- completeness of glyph-to-source contributor tracing;
- ability to represent current SVG, Canvas, table, and Three.js output without target leakage;
- number of current chart families that can migrate independently while the rest remain unchanged;
- render-plan time and lineage memory on the repository's 10,000-row calculated-orders example;
- churn to saved workspace data and published package exports.

State what 0 and 10 mean for each scored dimension. Give one evidence-backed reason per score. Mark assumptions. Do not add generic columns such as cost, speed, complexity, flexibility, ease, risk, maintenance, or interpretability. Replace any such concern with the exact visualization outcome or failure mode that matters here. Do not average across a hard disqualifier.

Select one option or a tightly bounded hybrid. State the decisive tradeoff and the largest evidence gap. Reject abstractions that do not earn their surface area.

### 2. How should Crossfilter integrate without making the middle layer impure or opaque?

Map the current semantics precisely. Explain whether a chart sees its own filtered-out rows, how chart groups expose live IDs, how global and per-chart filtering interact, how facets constrain IDs, and how full-data scales differ from filtered mark data.

Then specify a deterministic boundary around Crossfilter. Decide whether the render planner consumes a resolved row-ID set, a filter snapshot, a query interface, or another small contract. Explain cache invalidation and identity stability. Do not propose replacing Crossfilter unless repository evidence shows that replacement is necessary.

Include invariants and tests that catch wrong self-filter behavior, stale calculated fields, facet leakage, row-order drift, and inconsistent scale domains.

### 3. What lineage model supports source-to-glyph tracing without becoming a general data platform?

Build on the contributor data already present in grouped aggregates and pivot cells, plus the calculated-field dependency trace. Define the smallest composable lineage representation that covers:

- source rows and fields;
- type conversion and null handling;
- scalar calculated fields and their dependencies;
- filter inclusion and exclusion reasons;
- facets, groups, and series;
- aggregate contributors and numeric exclusions;
- line reduction or sampling;
- scale domains and color mappings;
- final marks, paths, table cells, and 3D points;
- fixed or external values that have no source-row lineage.

Distinguish provenance needed for correctness and inspection from verbose execution logs. State whether lineage is eager, lazy, or mixed. Give cost controls for large datasets. Include stable IDs and a concrete trace example from one glyph back to source rows.

Do not design multi-source joins, SQL lineage, server execution, or a general DAG engine unless the current code needs a clear seam now. If those future cases affect an identity or boundary decision, preserve only the smallest extension point and explain its ceiling.

### 4. How can the two tracks share one execution model?

Show how a deterministic render plan can carry enough lineage to answer inspection questions without coupling the drawing adapter to raw data or Crossfilter.

Provide one end-to-end example object or compact sequence for a real current chart. Include source IDs, filtered IDs, transform output, domain decisions, marks, and lineage references. Keep the example small but structurally complete.

Define determinism. Cover stable ordering, generated IDs, floating-point behavior, seeded sampling, viewport inputs, text measurement, device pixel ratio, current time, randomness, and environment-specific drawing. State which outputs can be byte-stable and which can only be semantically stable.

### 5. What staged migration delivers value before a full rewrite?

Propose phases that keep the application usable after each merge. Prefer a thin vertical slice through one representative chart before broad framework work. Use prototypes to test the decision, not to pre-implement the entire architecture.

For each phase, specify:

- the user-visible or developer-visible outcome;
- exact files to add, change, or delete;
- type and API changes;
- which chart or behavior migrates;
- compatibility impact on saved layouts and package exports;
- the smallest high-value tests;
- performance measurements;
- exit criteria;
- rollback or containment strategy;
- dependencies on earlier phases.

Choose the first chart deliberately. Compare scatter, grouped bar, line, and a simpler chart as candidates. Include a migration matrix for every current chart type. Identify charts that should use different adapters but the same plan contract.

End with a dependency-ordered backlog of implementation-sized tasks. Each task must have acceptance criteria and name the relevant repository paths. Separate work that can run in parallel from work that must be sequential.

### 6. Which uncertainties need working prototypes before the architecture is credible?

Choose one or two high-value uncertainties from the comparison. Build the smallest working prototypes that can falsify the leading design. At least one prototype must pass data through a non-React planner and render it through an existing chart adapter or a minimal test adapter. It must cover filtered row IDs and lineage references, not only static geometry.

Keep prototype code internal. Do not change the public package API or persisted data format. Prefer a single representative chart and focused tests. Delete a prototype that gives no useful evidence; record the rejected result in the findings document. Clearly label retained code as prototype or experimental.

Measure or inspect, as applicable:

- deterministic plan equality for repeated inputs;
- Crossfilter behavior before and after the seam;
- exact lineage from one output mark to its contributing source IDs;
- whether the same plan is usable by a React/SVG adapter and a non-DOM test adapter;
- plan time and lineage memory on a representative large demo;
- the amount of chart-specific logic that remains in TSX.

Do not add a dependency unless the prototype cannot be completed with the standard library and installed packages. Document the result even when the prototype disproves the preferred option.

## Evidence rules

- Cite exact repository paths and symbols for every claim about current behavior.
- Use short code excerpts only when they clarify a boundary.
- Separate **observed fact**, **inference**, **proposal**, and **open product decision**.
- Say when evidence is missing or conflicting.
- Distinguish current common cases from future advanced cases.
- Explain each recommendation's benefit, cost, failure mode, and public API effect.
- Preserve accessibility, filtering semantics, saved layouts, and current drawing behavior unless the plan explicitly schedules a verified change.
- Treat existing contributor tracing and calculation inspection as assets to reuse, not parallel systems to replace without cause.
- Favor the fewest new concepts and files that solve both tracks.
- Do not count shorter code as success if complexity only moves behind an opaque abstraction.

## Scope and non-goals

In scope:

- Architecture and phased implementation planning.
- Internal and public contract recommendations.
- Data and control-flow diagrams in Mermaid when they improve clarity.
- Test, benchmark, and migration strategy.
- Explicit decisions that connect deterministic rendering and traceability.

Out of scope:

- A complete Vega-like grammar.
- A new UI design for the trace inspector beyond the minimum integration points needed to validate the architecture.
- Replacing React, Zustand, D3, Three.js, or Crossfilter without strong evidence.
- Multi-user, distributed, server-rendered, database, or enterprise architecture.
- Backward-compatibility layers for unreleased internal APIs.
- Speculative joins, SQL execution, or multiple data-source support.
- A large test suite that repeats implementation details.

## Required repository artifacts

Create this directory on `codex/deterministic-rendering-data-traceability`:

`docs/intent/deterministic-rendering-and-data-traceability/`

Add these stand-alone Markdown files:

1. `architecture-options.md` — the current-state evidence, genuinely different approaches, domain-specific 0-to-10 comparison, decision, rejected alternatives, and open questions.
2. `implementation-plan.md` — the selected target, contracts, phases, chart migration matrix, tests, measurements, and dependency-ordered backlog.
3. `prototype-findings.md` — hypotheses, prototype design, files changed, commands run, observed results, measurements, rejected ideas, and what the results change in the plan.

The `implementation-plan.md` document must contain:

1. Executive decision and the smallest recommended architecture.
2. Access evidence: repository URL, branch, commit, files read, and checks actually run.
3. Product principles recovered from the prior thread and repository transcripts.
4. Current-state dataflow with exact symbols and pain points.
5. A concise link and decision summary from `architecture-options.md`.
6. Target architecture for both tracks.
7. TypeScript contract sketches.
8. Crossfilter semantics and integration contract.
9. Lineage model with one concrete source-to-glyph trace.
10. Determinism contract and known limits.
11. Incremental migration phases with file-level changes and gates.
12. Current-chart migration matrix.
13. Test and performance plan.
14. Risks, open product decisions, and explicit deferred work.
15. Dependency-ordered implementation backlog with acceptance criteria.
16. GO, NO-GO, and stop conditions for implementation.

Keep the document detailed enough that a later coding agent can implement the phases without repeating the architecture investigation. Avoid generic advice.

Place bounded prototype source and tests under existing `packages/explorEDA/src/` paths when practical. Add a new internal directory only when the comparison justifies it. The allowed mutation scope is:

- `docs/intent/deterministic-rendering-and-data-traceability/**`;
- `packages/explorEDA/src/**` for bounded prototype code and focused tests;
- `apps/demo/src/**` only when a small opt-in demo is necessary to inspect the prototype.

Do not change dependency manifests, the lockfile, release metadata, saved-data formats, or public exports unless you stop and obtain approval first.

## Git and validation protocol

Use pnpm only. Do not discard or overwrite existing changes. Do not use destructive Git commands.

Before each commit, verify both Git identities are exactly `Byron Wall <byron@byroni.us>`. If either differs or is missing, set the author and committer identity for that commit without changing unrelated repository configuration.

Make small, coherent commits on the branch. Keep documents and retained prototypes in separate commits when that makes review clearer. Before each commit, inspect the staged diff and stage only authorized files.

Run focused tests during prototyping. Before the final push, run:

```sh
pnpm check
```

If the full check fails for an unrelated baseline issue, show the exact failure, run the narrowest relevant checks, and do not claim full validation. Push only the named branch. Record the pushed commit and remote branch URL. Do not open a pull request.

## Implementation gates for the plan

Define implementation as `GO` only if the plan proves all of these:

- One render-plan boundary serves SVG, Canvas, and Three.js without forcing target-specific details into every transform.
- Current Crossfilter behavior is documented as testable invariants.
- The first migration slice preserves current saved settings and cross-chart filtering.
- Render planning can run in a unit test without mounting React.
- A glyph or derived value can resolve a compact lineage chain to source IDs and exclusion reasons.
- Lineage cost has a stated bound or lazy strategy for large row counts.
- Stable ordering and generated IDs have explicit rules.
- Every current chart type has a migration disposition.
- The plan names a small set of tests that can reject an incorrect implementation.
- Each phase leaves the repository buildable and useful.

Define implementation as `NO-GO` if any of these remain true:

- The proposed layer is only a renamed React component or hook collection.
- Crossfilter stays hidden behind side effects with no deterministic snapshot or query contract.
- Traceability depends on reverse-engineering rendered DOM or Canvas pixels.
- The design requires all charts to migrate at once.
- The plan breaks saved layouts or public exports without an explicit product decision.
- The proposed scene model cannot represent one of the current SVG, Canvas, table, or Three.js cases.
- The lineage model stores unbounded copies of source rows by default.
- The plan introduces a general-purpose DAG, query engine, or grammar before a current chart needs it.

Stop planning and mark the relevant section unresolved if a material choice depends on missing product intent. Ask the smallest specific question needed. Do not hide the choice inside an architectural assumption.

## Final quality gate and response summary

Do not declare success until every ranked question has an evidence-backed answer, all required chart types have a migration disposition, and each phase has a rejectable acceptance gate.

After the repository work, add a compact status summary with:

- `Status: GO`, `Status: NO-GO`, or `Status: PARTIAL`;
- repository and commit inspected;
- files read;
- checks actually run;
- artifact paths and prototype paths;
- branch name, commit IDs, pushed remote branch URL, and whether the push succeeded;
- unresolved blockers;
- assumptions that materially affect the plan.
