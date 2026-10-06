---
title: "Multi-source analysis with explicit data frames — implementation plan"
slug: "multi-source-analysis"
phase: plan
status: current
last_updated: "2026-10-06"
---

# Multi-source analysis with explicit data frames — implementation plan

## Plan at a glance

Deliver four milestones within the shape's three slices. Milestones 1–2 deliver sources, relationships, and frames. Milestone 3 delivers query paths and related-row exploration. Milestone 4 delivers parameter instances.

Start with configured shop relationships and two real frame queries inside the existing saved-view shell. Prove chart totals, view duplication, history preview, restoration, and reload together. This first milestone is an internal proof. The first product slice also requires schema-led relationship creation in milestone 2.

Keep one active result frame per view. Let the existing chart renderer consume that result as ordinary rows. Keep source identity, entity identity, and row origin beside those rows. Do not turn every chart into a join executor. Add explicit chart identity and measure rules where repeated entities need them.

The largest risk is restoring plausible charts over the wrong population. Resolve project definitions, view bindings, and result rows from one checkpoint. Then add authoring controls, complete query inspection, and automatic parameter updates. Each milestone adds to one deterministic fixture.

Implementation uses this same worktree on `codex/multi-source-frames`. The supplied planning edits were committed, then rebased onto PR #148 at `a2e67c0`. The baseline saved-view and history checks passed. The initiative map links milestone tickets; those tickets own execution evidence.

## Current verification

Checkpoint `f008df6` passes the full Node 24 `pnpm check`: 593 package tests and 47 demo tests. Builds, types, and UI rules pass. Independent browser acceptance passed the C4 empty-result correction, existing-link editing, query glyphs, read-only Rows, and affected restore flows. Tests used 1280, 783, and 390 px. Current browser console errors and horizontal overflow were zero. All four milestones are accepted. PR delivery remains.

## Execution decision

Browser measurements found input-to-frame delays of 447–1,006 ms on the fixed-seed parameter query. Long Tasks matched those delays. This meets the worker condition in milestone 4. One packaged worker now runs the pure evaluator. The host caches unchanged source serialization. Observed input delays were 75–100 ms without a chart and 125–128 ms with a chart. Final chart result application took about 479 ms. A 344 ms warmup task remains an observed chart cost. These timings are local measurements, not a service guarantee.

## Implementation strategy

### Ownership and execution boundary

Keep React and TypeScript. Extend the current host session, not a second tab or history manager.

| State or operation | Owner and planned boundary |
| --- | --- |
| Source data | Host supplies tables and source identities. Store each table once in a portable project or resolve its explicit reference. |
| Project definitions | Package types describe sources, relationships, queries, frames, scoped definitions, and stable glyph assignments. Host retains their current value. |
| View | Host stores its ID, name, query/frame binding, settings, and later parameter values and selected inspection stage. |
| Evaluation | A package function receives definitions, source tables, and bindings. It returns one result with stage rows, diagnostics, field origins, and row origins. |
| Charts | Existing `ExplorEda`, `DataLayerProvider`, and `CrossfilterWrapper` consume the selected result. Query context reaches headers, fields, and trace panels. |
| Edits and history | A package project component emits one coherent definition/view change. `SavedViewsWorkspace` records it and owns tabs, checkpoints, and storage. |

Use `ExplorEdaProject` around `ExplorEda`. It receives source tables, project definitions, the selected view, and read-only state. It emits the next definitions and selected-view state through one callback. Its schema/query panels use the existing side-panel contract. Export its types and evaluator from the package. Do not leave the capability inside the demo alone.

Keep `SavedDataStructure` as chart/view settings. Add project types beside it, rather than inserting source rows into every settings snapshot. Preserve the supported single-source entry point. A single-source example remains a useful regression check, not a second execution engine.

The evaluator has a finite operation set: source, equality lookup, explicit expansion, calculation, filter, and grouped aggregate. Add each operation when a milestone uses it. Queries reference upstream steps by ID; a schema may have cycles, but an executable query must be acyclic. Reuse calculation parsing and aggregate functions where their semantics match. Do not add SQL parsing, a query optimizer, or a provider abstraction.

### Identity, scope, and state rules

Source rows, entities, and result rows have separate identities. `initializeData` currently assigns numeric `__ID` values from array positions. Keep those runtime IDs for existing chart code. Add an evaluation-local mapping to stable result keys and qualified source-row references. Never persist a numeric `__ID` as an entity key. Rebind saved row selections through logical result keys, including after filters reorder or remove rows.

Identify fields by source/step and field key. Give projected fields stable, collision-free keys and separate display labels. Renaming a source or label must not change references. Validate declared entity keys. Duplicate or missing keys prevent entity collapse; ordinary source-row inspection can still expose the problem.

Start definition sharing conservatively. Share calculations, aggregates, and field settings among views with the same query/frame scope. Keep field-independent palettes and geometry assets at project scope. Use qualified field references for any field-bound definitions. Equal display names do not establish compatibility. Parameter values do not create new definition scopes.

Local chart and Rows filters stay with their view. Query filters belong to query steps. Do not propagate filters through relationships automatically. Preserve incompatible settings during a frame change, but mark them unresolved and offer repair. Never silently remove a filter and present the resulting population as equivalent.

Duplicate copies view settings and bindings. A binding change affects that view only. Editing a shared query updates its bound views immediately. An explicit “copy query” action creates an independent definition and glyph when needed. New view starts with blank charts and local filters on the active frame.

### Local proof and dependency strategy

Use real local joins, aggregates, the chart renderer, and the landed history code. Fixed data substitutes only for imported user data. Inject missing keys, ambiguous matches, empty outputs, and delayed completion as named fixture variants. There is no database, remote provider, credential, or deployment dependency.

The proof ladder is deterministic evaluator checks → real package/host integration → browser use against a frozen local build. Add a worker boundary only if measurement requires it. A fake executor can prove pending-state ordering; it cannot prove join correctness or browser speed.

Existing focused commands, run from the repository root:

```sh
pnpm --filter exploreda test src/test/providers/analysisReliability.test.tsx
pnpm --filter exploreda build
pnpm --filter demo test src/SavedViewsWorkspace.integration.test.tsx src/savedViewsHistory.test.ts
```

For the new evaluator, add one behavior-focused test file under `packages/explorEDA/src/test/lib/analysis/`. Then use:

```sh
pnpm --filter exploreda test src/test/lib/analysis/evaluateProject.test.ts
```

For browser proof, build the package before the demo:

```sh
pnpm --filter exploreda build
pnpm --filter demo build
pnpm --filter demo preview --host 127.0.0.1 --port 4173 --strictPort
```

The implemented `multi-source-shop` example runs at `http://127.0.0.1:4173/?example=multi-source-shop`. Build the package and demo before starting this preview. Use an isolated browser profile with synthetic data; do not clear the user's saved session. Installed dependencies need no network for these checks. The first dependency installation may need network access.

### Transition and rollback

Add the project example through the existing demo loader and saved-view shell. Keep the single-source path available. Use an explicit project file format and storage key; leave current single-source saved sessions intact. Do not add automatic format migrations or remote fallbacks.

Store source data once outside history. Checkpoints hold project definitions and views, not evaluated tables or historical source-data copies. Preview resolves both definitions and rows from that checkpoint using available sources. Missing dependencies produce a visible unavailable result, never replacement data. A source-data change invalidates the result revision; old checkpoints still use current available data.

Rollback uses a configuration checkpoint for query edits, or the previous code revision for code defects. Export a project before changing its file format. Removing the demo entry can contain an incomplete milestone. Do not claim that an older package can read a newer project format.

## Milestone 1: Switch and restore trustworthy order and item views

This proves the state and identity boundary before interactive relationship authoring. It completes the shape's first proof with configured links.

**Baseline.** Reconcile PR #148 into this worktree before editing application code. Check its current saved-view tests and `ExplorEda` props. Preserve local planning edits. Resolve any newer baseline changes before using the paths below.

**Fixture.** Add one small fixture with four customers, five orders, eight items, and four products. Give orders O1–O5 amounts 30, 20, 50, 40, and 10. Assign them 2, 1, 3, 2, and 0 items. Item revenue totals 30, 20, 50, and 40 for O1–O4. C1 owns O1/O2, C2 owns O3, and C3 owns O4. C4 has no orders; O5 references a missing customer. Leave one product unused. Keep expected values as explicit assertions, independent of the evaluator.

| Population or measure | Expected result |
| --- | --- |
| Order frame after customer lookup | 5 orders; order amount 150; one missing customer |
| Item frame with order/product lookup | 8 items; 4 distinct orders; item revenue 140 |
| Order amount across distinct orders present in the item frame | 140 |
| Incorrect sum of repeated order amounts across item rows | 310; must not be presented as order revenue |
| C1 query result | 2 orders, 3 items, revenue 50 |

Create separate variants for duplicate customer keys, null keys, equal keys with different scalar types, and duplicate entity IDs. Do not mix every error into the default walkthrough. Assign fixed dates for later parameter tests. Put reusable fixtures beside package tests and demo presets under `apps/demo/src/demos/`; share the generator where practical.

**Evaluation and package contract.** Add project types and a pure evaluator in a small `lib/analysis` area. Implement source selection, indexed equality lookup, and aggregate-many-to-one for the fixture. Default a lookup to retaining the current frame. A missing match leaves missing attributes. Multiple matches yield a conflict diagnostic and unavailable dependent values; they never select the first row. Null keys do not match each other. Match scalar types exactly unless a declared calculation converts them.

Return selected rows, stable result keys, source references, field origin, and stage counts together. Use existing numeric exclusion rules for sums and averages. Distinguish no contributors from a numeric zero. Feed the real package renderer through the proposed project component. Show query glyph, frame, measure, and included/available population in headers. Begin with a table, metric card, and grouped bar whose inputs have an unambiguous grain.

**Views and history.** Extend `savedViewsSession.ts`, `savedViewsHistory.ts`, and `SavedViewsWorkspace.tsx`. Resolve data from the shown view, including preview, instead of always using `sourceAnalysis`. Snapshot definitions and tabs atomically. Include new bindings and definitions in change classification, restore, undo/redo, and history summaries. Keep the existing 50-checkpoint bound and meaningful change grouping. Evaluating rows must not create checkpoints.

Replace unconditional `SHARED_KEYS` propagation and baseline capture with the scoped rules above. In history preview, disable project edits as well as charts: current `readOnly` leaves host panels usable. Allow read-only navigation through schema, rows, and history. Do not let a preview mount write defaults into the current session.

**Host round trip.** Update `LandingPage.tsx`, `demos/examples.ts`, and `demos/exampleViews.ts` to load a multi-table project preset. Save source tables once, plus current definitions, views, and history. Reload that state in the demo. Verify the package callback with a minimal host that saves and restores its received state without demo internals.

**Proof.** Extend the real `SavedViewsWorkspace.integration.test.tsx` path. Create an order chart, duplicate its view, select the item query, then switch views. Apply the item query's compatible preset explicitly; do not reinterpret copied field keys. Filter one view and confirm the other keeps its own filters. Preview an earlier binding, restore it as a new checkpoint, undo/redo, and reload. Check expected totals, glyphs, definitions, and rows at each step. Add one negative scope case: equal field names in different frames must not share a calculation. Use the existing history unit suite for definition edits and checkpoint trimming, not DOM structure assertions.

### Desired end state

- Two configured investigations remain correct through view and history actions.
- The host can restore complete project/view state through package inputs and outputs.
- Every checkpoint resolves matching definitions and data; preview produces no edits.

Proceed only when the fixture's totals survive the full flow. Roll back to the prior checkpoint or single-source example if it fails.

## Milestone 2: Build relationships and choose chart grain from the schema

This completes the first product slice. It depends on milestone 1's round trip and adds real user authoring.

**Schema controls.** Build a compact package schema panel using `WorkspaceSidePanel`, `FieldMetadata`, and existing field pickers. Show source names, fields, identity keys, matching keys, and declared cardinality. Give sources and queries persistent glyphs plus text labels; color remains optional context. Use a simple deterministic arrangement before considering a graph-layout dependency.

Support dragging one field onto another to propose a link. Provide the same operation through two field selectors for keyboard and touch. Before applying, show observed matched/unmatched counts, conflicting keys, and expected row expansion. Evaluate the proposed link against local source data. Apply valid relationship edits and their affected view bindings as one host change. Cancel leaves the current investigation intact.

**Cardinality choices.** On a many-side traversal, offer grouped measures at the current grain or an explicit expanded frame. Count, sum, and average cover the first fixture. Preserve contributors for each group. Conflicting categorical values require another key, grouping, or an explicit frame change; do not invent a universal “first label” aggregate. Let users inspect conflicts and repair matching fields or declarations. Editing source records is outside this initiative.

Offer a new view for an expanded frame. Keep the original view available. Require explicit handling of fields, filters, and charts that no longer apply. Link deletion must report affected queries and views. Preserve their definitions with unresolved references until repaired or deliberately removed.

**Chart meaning.** Carry origin and grain through `FieldMetadata`, `PlotChartPanel`, `ChartTraceControl`, and chart settings. Add mark/entity selection and measure scope only to chart families that need them. Begin with scatter entity marks and grouped bar/metric measures. Use `planScatterPoints`, `barPlan`, `metricCardPlan`, and `aggregates.ts` as the concrete integration points.

An entity mark may collapse repeated IDs only when its displayed values agree or an explicit aggregation defines them. A repeated parent measure needs a declared parent-entity reduction before summing. Do not use value-based deduplication: two different orders can have the same amount. Preserve source contributors through that reduction. When a chart cannot honor a requested grain, explain the invalid configuration and offer a compatible frame. Existing row-grain chart modes continue to mean result rows. Do not silently change their semantics.

Rebind chart row-ID filters through stable result keys. Keep normal mark clicks as filters and Alt-click/Alt-Enter as trace actions. View data remains a temporary preview. Make the available-count denominator the selected query result before view filtering; label chart exclusions and distinct-entity counts separately.

**Portable investigation.** Extend `saveDataUtils.ts` with a project serializer/parser and public exports. Store definitions, views, glyphs, bindings, and restorable inspection selection. Demo exports include source rows once. Reuse special-value handling for undefined and nonfinite numbers. Validate IDs, references, and row values at this file boundary. Round-trip an entire investigation and an active view with its dependency closure. Reimport both through the demo. Do not export only materialized rows under a project label.

**Examples and proof.** Register the shop walkthrough and update package usage docs. Create a link by drag, then repeat through keyboard controls at 1280, 783, and 390 px. Select order grain, aggregate items, and inspect the 5-order/150-order-amount result. Change to item grain and show 8 items/140 item revenue. Resolve an ambiguous lookup without choosing an arbitrary match. Prove that a repeated-order measure cannot become 310 unintentionally. Verify empty, missing, and conflicting data with explicit fixture expectations.

Run a preliminary generated scale probe here, before expanding inspection UI. Measure lookup indexing, aggregation, serialization, and chart rendering separately. Record input and output counts so row expansion cannot hide behind a duration.

### Desired end state

- Users configure or create relationships, choose a frame, and chart a correctly labeled population.
- Ambiguous links and incompatible chart meaning have a visible resolution path.
- Project export/import and local reload preserve the first slice's full investigation.

Keep milestone 1's configured presets usable if authoring needs repair. Remove an incomplete authoring entry point before reverting shared state code.

## Milestone 3: Follow a complete query and inspect related records

This delivers the second slice. Reuse the evaluator's stage records and existing trace controls; do not build a parallel lineage engine.

**Query flow.** Extend definitions with explicit step inputs for calculations, filters, grouped aggregates, and branches. Each result stage records its row unit, condition or expression, input/output counts, exclusions, field origins, and row-origin links. Reuse `CalculationManager` and its row calculation trace where possible. Make query operations inspectable even when their output is empty.

Connect query stages to the renderer's remaining work. Full flow must include view/chart filters, field conversions, calculations, chart aggregation, and numeric exclusions after query evaluation. Reuse the chart's actual plans and traces for those operations. Do not describe a recomputed approximation as the chart's backing flow. Preserve Crossfilter's own-chart filter semantics and identify those scopes in the trace.

**Selected query over the schema.** Highlight the active query path while leaving the complete schema visible. Distinguish repeated uses of the same source with step identity. Selecting a step opens its rows and conditions. Provide a compact summary first, then a Full flow mode that exposes every operation. Include relevant original inputs and contributors. Keep one query selected; comparison layouts remain deferred.

**Cardinality exploration.** Let users open a source or intermediate result as a new saved view with its own frame binding. Selecting a customer exposes related orders and their items in a nested inspector. Represent this as related scalar tables plus row links; do not put nested objects into `SavedRow`. Start with one selected parent at a time and show full related counts. Aggregate inspection opens contributing rows and explains exclusions. Temporary inspection must not create charts, change the layout, or save new views implicitly.

**Restoration and stale selection.** Save query, step, inspection mode, and stable record selection where these define the investigation. Keep hover and temporary menus transient. Include the applied result revision in trace selection. Reuse `ChartTraceScope` invalidation when data or bindings change. If a saved selected step disappears, preserve the view and show the missing reference instead of opening another step.

**Examples and proof.** Extend the fixture with an order-total path and a product-revenue path. Include filtering before aggregation, a calculation, an unused product, and an empty stage. Assert the expected rows, counts, and totals for every step. Start from a chart trace and reach its exact backing items, then its source rows. Follow C1 to 2 orders and 3 items totaling 50. Open a related result in another tab; verify the first view is unchanged. Restore a checkpoint with a different query definition and inspect its complete flow.

### Desired end state

- Users explain a chart through its real transformations and schema path.
- Separate views, nested related rows, and aggregate contributors retain explicit row meaning.
- Simplified and full inspection describe the same applied result and survive restoration.

Closing the query panel returns to the same chart workspace. A failed inspection change can be reverted without removing first-slice analysis.

## Milestone 4: Inspect parameter instances with automatic, consistent updates

This delivers the third slice after complete stage inspection works.

**Bindings.** Add a small typed parameter definition and per-view binding map. Start with customer ID and date bounds. A known source record supplies customer ID; dropdowns and date pickers support manual input. Show required inputs for an isolated intermediate step. Follow only that step's upstream dependencies. Use explicit query references for bindings, not string substitution into expressions.

**Automatic results.** Keep draft inputs separate from applied bindings. Validate required values and date ranges before evaluation. Valid changes start evaluation automatically. Publish stage rows, output rows, counts, labels, and provenance in one result update. Keep prior data labeled with its applied bindings while pending. An empty valid result replaces the prior result; it is not an execution error.

Use a monotonically increasing request ID if evaluation can overlap. Discard a superseded completion, including one that finishes after switching views or history previews. Add actual cancellation only if needed for costly work. Parameter edits create meaningful configuration history steps; intermediate computations do not. Restore bindings with their query definition, then recompute against available sources.

**Performance decision.** Generate the proposed ten-table, ten-thousand-rows-per-table case with a fixed seed and controlled fan-out. Record cold/warm evaluation, peak result rows, origin-link size, browser responsiveness, and persisted size. Measure ambiguous-key and large-expansion cases separately. Keep joins indexed. Avoid duplicating full source records in every provenance edge or checkpoint.

If measured work blocks input, move evaluation behind the same function boundary into one web worker. Retain the deterministic evaluator and repeat its behavioral tests through worker messaging. If output growth is the problem, preview its size and require a narrower query or aggregation. Do not silently truncate computed results. Apply visible paging or limits only to inspection rendering. Set any execution limit from measurements and document it as a product constraint. The user's scale estimate remains a hypothesis, not a promised service level.

**Examples and proof.** Add customer/date presets for valid, missing, invalid, and no-match inputs. Confirm C1 returns its expected records; then select C4 and see a consistent empty result. Inject a slow C1 evaluation followed by a faster C2 evaluation. All visible stages must finish on C2, regardless of completion order. Repeat across view changes and read-only preview. Export, reload, and restore a parameter instance with its selected stage.

### Desired end state

- Users start from a record or assisted inputs and inspect every stage of one instance.
- Pending, failed, and empty results remain distinct and accurately labeled.
- Results stay responsive at the measured local scope, with documented limits and no silent truncation.

Revert parameter edits through history. Parameter-free queries remain usable if the new input controls need repair.

## Cross-cutting verification

Keep tests concentrated on semantic failure points: join cardinality, identity, totals, state round trips, and stale result rejection. Extend existing suites where they own the behavior. Do not snapshot component structure or build a broad test platform.

After each visible milestone, use a separate browser verification worker when practical. Give it the starting URL, fixture expectations, and user flow. Do not give it implementation hints. Check real pointer, keyboard, and touch-oriented controls at 1280, 783, and 390 px. Record discovery and accessibility problems as findings, then repeat affected checks after fixes.

Use `ActionTooltip` or the Button tooltip prop for non-obvious controls. Follow the supplied project rule for hover and keyboard help. Use visible text or accessible names, never native `title` tooltips. Check panel focus return, viewport bounds, semantic borders, field names, active filters, and read-only authoring controls. Save screenshot evidence under `tmp/`.

Run `pnpm check:ui` during UI work and `pnpm check` for each broad delivery. Build package exports before host integration checks. Run release checks on Node 24 and preserve its AbortController/AbortSignal in the demo test environment.

Add a minor changeset for package features with `pnpm changeset:add minor "summary"`. Keep one coherent changeset per implementation PR. Add screenshot evidence for visible changes using `gh --attach` and verify the saved PR body. Update package usage docs, example counts, and this map when milestone proof is observed. Implementation has started. The map is active; tickets own current execution evidence. Publishing and deployment require a separate request.

## Open decisions and spikes

1. **Identity bridge, during milestone 1.** Prove that source references and stable result keys survive chart `__ID` filters and restore. Inspect the real provider and chart-selection paths. If a general mapping spreads through chart internals, keep numeric IDs within each applied result and translate at the project boundary. Do not replace all chart IDs.
2. **Execution scheduling, probe in milestone 2 and decide in milestone 4.** Measure the fixed-seed case and fan-out separately. Keep synchronous evaluation if responsive. Otherwise use one worker; bound excessive expansion through an explicit user decision. Do not add incremental execution or a remote engine by default.

## Below the cut line

- Agent-suggested relationships and agent execution services.
- SQL parsing, arbitrary query-language import, automatic lineage discovery, and a general query optimizer.
- Remote sources/execution, database access, server persistence, and historical source-data versions.
- Automatic relationship filter propagation or mixed result frames within one chart workspace.
- Side-by-side query comparison, batch parameter execution, and speculative split-result layouts.
- Universal entity deduplication, arbitrary conflict resolution scripts, and source-record editing.
- A graph-layout platform, incremental execution, multi-worker scheduling, and old-format migration support.
