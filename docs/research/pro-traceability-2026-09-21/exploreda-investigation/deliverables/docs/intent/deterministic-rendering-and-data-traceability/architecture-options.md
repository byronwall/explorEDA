# Architecture options: deterministic rendering and data traceability

## Decision and status

**Proposed decision:** chart-specific pure planners, a small discriminated render-plan envelope, and shared references to prepared fields and row populations. Keep Crossfilter in the state/coordinator layer. Introduce no grammar, transform registry, general DAG executor, public export, saved-data change, or multi-source model.

**Status: PARTIAL.** Source investigation is repository-grounded at `593ca2e1f9210d5bc66985437afc37fcfcd8a56a`. Mutation is **NO-GO**: no authenticated writable clone/push transport exists in this runtime. An isolated planner experiment ran successfully, but live Crossfilter integration, the full 10,000-row calculated-orders workflow, React/D3 equivalence and repository `pnpm check` did not run. Do not promote this proposal to a fully validated migration on that evidence alone.

Read [implementation-plan.md](implementation-plan.md) for file-level phases and [prototype-findings.md](prototype-findings.md) for actual commands, measurements and failures. All source links below are immutable to the inspected commit. **Observed** means established by source inspection, not automatically runtime-tested. **Inference**, **proposal**, and **open decision** are labeled separately.

## 1. Product context recovered before repository inspection

The preceding conversation established an inspectable instrument, not a chart gallery. A row must be traceable forward; a glyph, statistic or annotation must be traceable backward. Filtering, faceting, grouping, reduction, scales, labels and manual offsets must not disappear behind rendering code. One row may affect a mark's value and other marks' scale domains for different reasons. Those are different dependency roles, not one undifferentiated contributor set.

The user explicitly expanded “glyph” to include titles, axis and tick text, legends, annotations and placement. Text and styles require provenance even when the terminal input is a constant or theme setting rather than a source row. The preceding HTML prototype demonstrated useful interaction intent but is not a trusted implementation specification: its last reported diagnostic state was 247/252, and none of its correctness claims validate this repository.

The August 2 transcript supports the source-to-glyph chain, explicit facet handoff and renderer-independent descriptions. The August 25 transcript distinguishes deterministic expansion from rich interactive TSX, rather than requiring every UI component to become a DSL. August 3 and August 4 discuss progressively expanded descriptions, grouping, transformations and derived layers. These are product direction, not instructions to implement a Vega-like language now. [Sources: traceability][trace-intent], [templating][template-intent], [specs][spec-intent], [transform order][transform-intent], [grouping][group-intent].

**Scope reconciliation:** earlier multisource infographic experiments do not override the attached prompt's explicit deferral of joins, multiple-source support and server execution. A dataset namespace on a row reference is sufficient now. No join operator, SQL provenance or external execution backend is proposed. Before/after animation and a new visual graph UI are not migration priorities.

**Unresolved before reading:** the smallest plan unit; which populations each chart really consumes; where existing lineage can be reused; which computations depend on drawing resources; and whether complete eager traces are affordable. The repository observations below answer these without treating the earlier HTML architecture as mandatory.

## 2. Corrected starting facts

| Starting claim | Verified result at the base commit |
|---|---|
| React/TypeScript library + demo; pnpm 11.9.0 | Confirmed by [root manifest][root-package], [library manifest][package] and [README][readme]. Root package name `data-viz` does not change the repository identity `byronwall/explorEDA`. |
| DataLayerProvider owns preparation and state | Confirmed, but `getColumnData` lazily evaluates and mutates caches; a getter call is not a pure immutable input. [DataLayerProvider][state] |
| Per-chart Crossfilter dimension/group | Confirmed. `getAllData` returns `group.all()` references; a copy boundary is needed. The all-filter result is a different method. [CrossfilterWrapper][crossfilter] |
| Live-data hooks are in `src/hooks` | **Path correction:** both are in `src/components/charts/`. The requested literal hook paths are absent; the required implementations are present. [live hooks][live], [column hooks][column] |
| Chart implementations mix computation with drawing | Confirmed across scatter, bar, line, box, tables and 3D. Some useful math is already extracted, so do not duplicate it. [reduction][reduction], [box math][box-math], [pivot math][pivot-math] |
| Facets always use shared full-data scales | This is a visible label and common behavior, **not a universal implementation invariant**. Named aggregate bars use current aggregate values and do not pass facet IDs to `getAggregateResult`. DataTable does not consume `facetIds`. [facets][facets], [bar][bar], [table][table] |
| ChartDefinition and `./core` are headless | Incorrect as an architectural interpretation. The registry wraps React components and is the `./core` build entry. Keep it intact; do not casually redefine the published contract. [types][types], [registry][registry], [build][build] |
| Saves exclude raw rows; analyses can include them | Confirmed. Keep render plans ephemeral and avoid saving generated scene records. [saved structures][saved], [state serialization][state] |
| Existing contributor and calculation tracing | Confirmed. Grouped aggregates retain raw and prepared inputs, inclusion and exclusion reasons; pivot cells retain IDs and numeric exclusions. Calculation tracing is a declared dependency tree with per-row values/errors, not a full execution log. [aggregates][aggregate], [pivot math][pivot-math], [calculation trace][calc-trace] |
| Axis configuration means all scale labels work | Additional correction: `numericScale` chooses symlog only for `"symlog"`; otherwise it uses linear. Do not claim current log/time behavior from the wider settings union. [numericScale][scale], [AxisSettings][types] |

The seven representative families and the four remaining registered families were inventoried. The exact type strings are `row`, `bar`, `scatter`, `3d-scatter`, `pivot`, `data-table`, `summary`, `markdown`, `boxplot`, `color-legend`, and `line`. The prior HTML prototype's twelve examples are unrelated to this count. [Registration][registered], [chart union][types], [dashboard examples][dashboard].

## 3. Five source-to-output paths

### 3.1 Scatter: Canvas marks with an SVG shell

**Observed:** `initializeData` assigns index-based `__ID`. Preparation occurs in the provider; requested calculated columns are evaluated through `getColumnData`. `useGetLiveData` obtains positive per-chart group entries, optionally constrains them by facet IDs, then looks up each requested column. Scatter computes x/y full-column numeric extents, padding, margins and scales inside TSX. It converts live coordinate values, discards invalid pairs, resolves colors, dims points failing its own x/y range filters, and draws Canvas circles. BaseChart draws axes and brush UI in SVG. Hover reconstructs an array index, not an exported mark identity. [row preparation][rows], [state][state], [live data][live], [ScatterPlot][scatter], [BaseChart][base-chart].

**Boundary pain:** parallel arrays separate values from row identity; scale populations differ from mark populations; Canvas hit indices are not a lineage model. The planner must produce IDs and final logical positions before Canvas sees them. DPR, Canvas resource setup, pointer coordinates and painting remain adapter work.

**Compatibility trap:** 2D scatter rejects null/undefined/empty-string coordinates before `Number`, but other values such as booleans or whitespace can coerce. 3D explicitly rejects booleans and whitespace. Do not unify these numerical policies as an incidental extraction. [2D][scatter], [3D preparation][3d-data].

### 3.2 Grouped bar: two different aggregation routes

**Observed:** categorical counts and numerical bins are computed inside BarChart from full columns and per-chart live arrays. Named aggregates instead call `DataLayerProvider.getAggregateResult`, defaulting to all-filter survivors. That method obtains group and measure columns, attaches raw inputs/conversion reasons, and calls the already-pure `calculateGroupedAggregate`. BarChart resolves domains, scales, baseline and rectangles; grouped bars open the existing contributor inspector. Invalid aggregate values do not become bars, and zero can still receive a one-pixel visible rectangle. [BarChart][bar], [getAggregateResult][state], [pure aggregation][aggregate], [inspector][aggregate-inspector].

**Boundary pain:** do not replace a traced aggregate with a new array of anonymous heights. A bar should reference the existing aggregate result row; its label references the aggregate value, while its geometry additionally references scale and baseline decisions. Preserve count/bin behavior separately from the named-aggregate branch.

### 3.3 Faceted chart: scope before render, with current exceptions

**Observed:** `groupFacetData` groups full prepared row IDs by typed category tuples. Facet selection and layout decide which groups and viewports reach the same registered chart. The child receives the original chart settings/ID plus `facetIds`; it is not a new independent Crossfilter dimension. Full-column x/y domains are commonly reused by scatter/line/box/row, while live mark data is constrained inside each component. [FacetContainer][facets], [ScatterPlot][scatter], [LineChart][line], [RowChart][row-chart].

**Discrepancies:** `useGetLiveData` treats `[]` as unrestricted; the column helper and several direct intersections treat it as empty. Aggregate bars and DataTable omit the facet restriction. A facet header writes category filters, but scatter's predicate only checks x/y ranges; bar checks its configured primary field. A generic “AND all facet predicates everywhere” refactor would change existing behavior. [live][live], [column][column], [bar][bar], [table][table], [scatter predicate][scatter-definition], [bar predicate][bar-definition].

**Proposal:** one explicit facet-membership result and a capability/compatibility boundary. Unsupported cases stay on the legacy path until their behavior is decided and tested. Naming the exception is safer than silently claiming uniform facets.

### 3.4 Line: ordering, gaps and reduction are domain work

**Observed:** LineChart computes full-population x and left/right y domains, orders live IDs by x, divides data at invalid gaps, calls `reduceDataPoints` with available width, and creates curved paths. The reducer clamps bucket count, preserves start/min/max representatives and stable tied-x order. Its public point type only exposes x/y/type; source identity is not carried through the chart's reduction pipeline. A render-time effect assigns missing series colors back into settings. [LineChart][line], [reduceDataPoints][reduction], [reduction tests][reduction-test].

**Boundary pain:** reduction is not simply “drop some points.” A kept point has its original source ID; its selection also depends on its bucket population and the width-derived budget. A path depends on its ordered retained vertices, gaps, curve policy and series. The initial migration must preserve tied-x ordering and the special dense equal-x case, not substitute another decimator. Color initialization belongs in state preparation; path painting must not write settings.

### 3.5 3D scatter: world-space planning is not SVG geometry

**Observed:** `buildThreeDScatterData` already performs useful pure math, but lives in a hook-importing module and emits anonymous points plus an omitted count. It keeps x/y/z world values, resolves size against a full-data domain, and normalizes finite sizes. `ThreeDScatterPoints` makes Float32 position/color/size buffers and perspective-sized point sprites. `ThreeDScatterChart` owns scene/camera/resources, DPR, orbit controls and debounced camera persistence. [data preparation][3d-data], [points adapter][3d-points], [chart lifecycle][3d].

**Boundary pain:** retain row IDs and individual omission reasons before packing buffers. Do not force world positions through 2D pixel scales. Keep cameras as plain numeric descriptions in a 3D view payload; construct Three objects only in the adapter. The inspected code provides no mark-ID picking contract, so inspection support is new work, not an existing feature to claim preserved.

## 4. Consider-and-contrast checkpoint

### Candidates solving the same decision

**A — Minimal pure view-model extraction.** Extract each chart's row preparation and math into local functions. Keep axis/layout expansion and interaction-specific geometry partly in adapters. No shared plan or trace contract; each component defines its own view model. Reuses current wiring with the least immediate migration surface. This remains a valid first step only if its omissions are explicit.

**B — Chart-specific planners + a small shared envelope (selected).** The coordinator captures values and explicit ID populations. Pure planners run existing math and return `plan.kind` variants for 2D marks, logical tables, 3D point layers, and fixed content. Shared scale/field/row-set references connect each output to existing contributor records. Adapters receive completed plans and emit interaction intents. No generic execution scheduler or user grammar is introduced.

**C — Declarative grammar + general operator graph.** Compile current settings into a reusable graph of filter/facet/group/scale/layout/mark operators. A runtime executes it with generic lineage propagation. Existing charts can be wrapped during migration, but broad schema and operator semantics must be defined. This could serve the transcripts' long-term vision; it is not earned by today's requested changes and conflicts with the prompt's explicit ceiling.

### Scoring rules

Scores describe the **specified approaches**, not measurements of implementations that do not exist. Every rationale below is either tied to inspected behavior or marked **assumption**. Scores are not averaged. A scope violation or unrepresentable current target disqualifies an approach regardless of its scores.

| Dimension | 0 means | 10 means |
|---|---|---|
| Repeatability of resolved output | Hidden effects, clocks or mutable closures can alter a plan for identical inputs | Same complete versioned inputs produce identical canonical plan values with no rendering dependency |
| Crossfilter semantics preserved | Collapses own-exempt and all-filter populations or changes filtering | Explicit populations and per-family policies retain all characterized own/cross-chart behaviors |
| Glyph contributor trace coverage | Only a final value/pixel is available | Every mark/guide/cell resolves value, control and exclusion references to a source or fixed input |
| Target representation | One current target cannot be represented | SVG/Canvas 2D, logical tables, 3D world points and fixed content fit without target objects in transforms |
| Independent chart migration | All eleven families must move at once | Each family can opt in without changing other families' registry/settings behavior |
| Lineage population-copy bound at 10k rows | Expanded source arrays can be copied once per mark, or there is no declared ceiling | Shared ordered populations plus immediate references give an explicit linear bound; no raw-row copies per mark |
| Saved/export surface preservation | Requires incompatible saved formats or replacing published entry points | Can remain internal; existing saves and `./core`/chart exports remain untouched |

**Timing is deliberately not scored:** there is no executed repository baseline, so assigning a 0–10 speed score to the alternatives would invent evidence. The sixth dimension is the data-duplication bound, which can be inspected. Actual planner time, trace bytes and integration gaps are reported separately. This absence prevents final implementation GO.

### Scores and evidence, one reason per score

| Candidate | Repeatability | Evidence-backed rationale |
|---|---:|---|
| A | 6 | Pure data functions can repeat, but BaseChart guide expansion, line color effects and TSX margins remain outside the resolved object. [BaseChart][base-chart], [LineChart][line] |
| B | 9 | Explicit viewport, color decisions, prepared values and ID arrays remove the observed hidden inputs. Isolated repeat tests passed; D3/Intl/text parity remains unverified. [prototype findings](prototype-findings.md) |
| C | 9 | **Assumption:** a fully specified graph can capture the same inputs; a grammar alone does not fix text/environment determinism. The transcripts demand explicit parameters, not identical raster pixels. [trace intent][trace-intent] |

| Candidate | Crossfilter preservation | Evidence-backed rationale |
|---|---:|---|
| A | 9 | Leaves existing wrappers and per-chart queries in place, retaining their exceptions; the remaining live aliases still need copying. [CrossfilterWrapper][crossfilter] |
| B | 9 | Named `othersPass` and `allPass`, plus explicit facet restriction, describe the two current routes without replacing Crossfilter. Real wrapper parity test is supplied but unexecuted. [live][live], [getAggregateResult][state] |
| C | 6 | **Assumption:** generic filter operators would need additional own-dimension exemption and local Rows/search semantics; a single filter node is insufficient for the inspected charts. [DataTable filtering][table-filter], [wrapper][crossfilter] |

| Candidate | Contributor tracing | Evidence-backed rationale |
|---|---:|---|
| A | 5 | Aggregate cells remain traceable, but unrelated per-chart models have no common reference for Canvas points, reduced vertices or guide text. [aggregate][aggregate], [scatter][scatter], [line][line] |
| B | 9 | Shared typed references reuse existing aggregate/pivot/calculation evidence and extend IDs through scale and mark encoding. Full field/guide integration remains future work. [aggregate][aggregate], [pivot math][pivot-math], [calc trace][calc-trace] |
| C | 9 | **Assumption:** generic lineage propagation can represent the same chain, but typed source and exclusion semantics still have to be supplied by each operation. [numericInputs][aggregate] |

| Candidate | Targets represented | Evidence-backed rationale |
|---|---:|---|
| A | 9 | Separate local view models can retain table rows and 3D world points, at the expense of a common inspection boundary. [table][table], [3D points][3d-points] |
| B | 9 | A shared envelope with distinct 2D/table/3D/content payloads fits the inspected outputs; it does not pretend every target can draw every payload. Only 2D adapters were exercised. [3D][3d], [Markdown][markdown] |
| C | 6 | **Assumption:** a mark-centric grammar needs explicit table virtualization, rich-editor content and world-point variants or opaque escape hatches; those contracts are not present today. [DataTable][table], [Markdown][markdown], [3D][3d] |

| Candidate | Independent migration | Evidence-backed rationale |
|---|---:|---|
| A | 10 | Each component can import a local pure helper with unchanged ChartRenderer dispatch. [ChartRenderer][renderer] |
| B | 9 | Internal opt-in planner selection preserves registry dispatch, but shared guide/legend changes need a compatibility path until consumers migrate. [registry][registry], [BaseChart][base-chart] |
| C | 6 | **Assumption:** a settings-to-graph compiler can coexist with legacy components, but each new chart family needs both schema mapping and graph coverage before opt-in. [ChartDefinition][types] |

| Candidate | Population-copy bound | Evidence-backed rationale |
|---|---:|---|
| A | 6 | Existing contributor arrays can be reused, but the approach specifies no shared domain-population reference across independent view models. [aggregates][aggregate], [pivot math][pivot-math] |
| B | 9 | Shared populations and per-mark row references avoid N×M source expansion. Probe at 10k: 18,374 population memberships, 5,000 point references, two scale population references; verbose per-point strings still cost bytes. [findings](prototype-findings.md) |
| C | 5 | **Assumption:** materializing every operator output with transitive row arrays would duplicate lineage; a lazy/reference model could raise this score but would reproduce the selected design's bounded storage rules. [trace intent][trace-intent] |

| Candidate | Saved/export preservation | Evidence-backed rationale |
|---|---:|---|
| A | 10 | Local pure helpers need no persisted/public shape change. [saved][saved], [build][build] |
| B | 10 | Plans are ephemeral; internal dispatch leaves `ChartDefinition`, registry and save serializers unchanged. The prototype patch adds files only. [registry][registry], [saved][saved] |
| C | 5 | **Assumption:** either keep a settings-to-grammar compiler indefinitely or expose/persist a second specification form; neither is required by current saved analyses. [saved][saved], [spec intent][spec-intent] |

### Selection

Select **B, reached through A-sized per-chart extractions**. The decisive requirement is not shared drawing primitives by themselves; it is a single inspection contract that does not collapse population semantics or erase IDs. A alone leaves the same tracing problem in eleven different forms. C solves a larger authoring/runtime problem than the prompt permits and is disqualified for the present implementation, not declared inherently inferior for future work.

The common layer initially earns only four concepts: immutable prepared inputs, named row-set scopes, a discriminated plan, and trace references to existing evidence. Add a shared operation only when a second migrated family genuinely uses it. Do not create a configurable DAG merely because the visual inspector can display a graph.

**Largest evidence gap:** byte/semantic parity and measured overhead in the real provider + Crossfilter + D3 pipeline. The isolated probe is not proof of chart compatibility, stale-calculation safety, Three.js output parity, or full-workspace memory consumption.

## 5. Boundary ownership

| Work | Owner and constraint |
|---|---|
| Source identity, conversion, formula edits | State preparation. Reuse `initializeData`, `applyFieldSettings`, CalculationManager and existing caches; publish a coherent revision. |
| Filter coordination | Crossfilter in state. Capture ordered ID sets after predicates have been updated; never call live `getColumnData`/Crossfilter from a planner. |
| Facet, group, series and reduction | Pure planning functions. Reuse typed grouping and mathematical helpers, preserve existing per-family population rules. |
| Scale/domain/color/layout decisions | Pure planning from captured inputs and explicit environment values. Persisted color mappings remain authoritative; adapters do not grow domains while drawing. |
| Marks and guide descriptions | Typed plan data with semantic IDs and lineage references; guide/text planning can migrate after points, behind a clear phase boundary. |
| React, SVG, Canvas, Three objects | Adapter lifecycle and event plumbing only. Tables retain a logical row/cell plan and virtualized DOM adapter. |
| Interaction | Adapter translates pointer/keyboard inputs to domain-space intents or mark IDs; state applies existing filter/update logic. Inspection selection does not become a filter automatically. |

Benefit: repeated inputs can be tested without React and one inspector can follow a source chain across targets. Cost: copying currently mutable ID arrays and carrying explicit metadata adds work; it must be measured. Failure modes: aliasing, stale revisions, wrong population selection, layout guessed outside the plan, identity loss during reduction, or an adapter consulting live state. Public API effect: none for the internal stages.

## 6. Open decisions and stop rules

1. **Facet-header filtering across families:** should it constrain all families, or preserve today's ignored/category-only cases? Do not change it in the first slice. Gate any corrective phase on a separate explicit product decision.
2. **Named-aggregate facets:** should aggregates be recomputed per facet, or should the unsupported setting be rejected? Current rendering can repeat a global result; label this exception instead of inventing facet-scoped math.
3. **Empty facet arrays:** the new contract gives `[]` the unambiguous meaning “empty.” The legacy bridge must characterize callers and stay legacy for incompatible cases until the change is approved. Do not silently “fix” this in a supposedly behavior-preserving extraction.
4. **Unknown color categories:** a pure resolver must freeze the effective mapping. Decide whether current implicit ordinal expansion is preserved at state preparation or becomes a diagnostic/default color; do not let draw order choose new colors.
5. **Text determinism ceiling:** exact cross-platform pixels are not promised. Semantic text/anchors are required; font measurements must be explicit snapshots or bounded deterministic estimates.

No product decision is needed to run the observational scatter probe. Production opt-in remains blocked until full tests and characterization resolve the affected behavior, without changing saves or public APIs. If a later implementation needs a new public `./planning` entry point, stop for approval rather than repurposing `./core`.

## Appendix: repository evidence and reading inventory

The required reading route was followed through the named core files, with the two hook-path corrections above. Representative chart modules, relevant utility tests and remaining registered families were then inspected. Large generator/dashboard files were read in the relevant named sections, not represented as a complete audit of unrelated generators or demos. Indexed caller inventory is in the implementation plan; indexed search is not a substitute for a final local `git grep` audit.

- [AGENTS.md](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/AGENTS.md) — `Repository contribution rules`.
- [README.md](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/README.md) — `Supported workspace and source-reference contract`.
- [package.json](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/package.json) — `packageManager; check`.
- [packages/explorEDA/package.json](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/package.json) — `exports; scripts; dependencies`.
- [packages/explorEDA/tsup.config.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/tsup.config.ts) — `entry; external; splitting`.
- [docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt) — `Source-to-glyph provenance; explicit boundaries`.
- [docs/transcripts/2026-08-25-deterministic-ui-templating.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-25-deterministic-ui-templating.txt) — `Deterministic template expansion; role of TSX`.
- [docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt) — `Declarative expansion; chart defaults`.
- [docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt) — `Transform order; stacking; derived layers`.
- [docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt) — `Grouping versus encodings`.
- [docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt) — `Loaded, available and visible data`.
- [docs/calculation-workflow.md](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/calculation-workflow.md) — `Calculation workflow; calculated-orders example`.
- [packages/explorEDA/src/providers/DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/DataLayerProvider.tsx) — `getInitialStoreState; getColumnData; refreshCalculations; getAggregateResult; updateFieldSettings; restoreAnalysisFromStructure`.
- [packages/explorEDA/src/providers/lib/dataLayerState.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/lib/dataLayerState.ts) — `initializeData; IdType`.
- [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.ts) — `addChart; getAllData; getFilteredRowIds; updateChartFilters`.
- [packages/explorEDA/src/components/charts/useGetLiveData.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetLiveData.tsx) — `useGetLiveData; useGetLiveIds; useGetAllIds`.
- [packages/explorEDA/src/components/charts/useGetColumnData.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetColumnData.tsx) — `useGetColumnData; useGetColumnDataForIds`.
- [packages/explorEDA/src/types/ChartTypes.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/ChartTypes.ts) — `ChartDefinition; ChartSettings; BaseChartProps; AxisSettings`.
- [packages/explorEDA/src/types/SavedDataStructure.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/SavedDataStructure.ts) — `SavedDataStructure; SavedAnalysisStructure`.
- [packages/explorEDA/src/charts/registry.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registry.ts) — `registerChart; getChartDefinition; component wrapper`.
- [packages/explorEDA/src/charts/registerAllCharts.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts) — `registerAllCharts`.
- [packages/explorEDA/src/components/charts/ChartRenderer.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ChartRenderer.tsx) — `ChartRenderer`.
- [packages/explorEDA/src/components/charts/BaseChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BaseChart.tsx) — `BaseChart; brush and guide rendering`.
- [packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx) — `groupFacetData; FacetContainer; header selection`.
- [packages/explorEDA/src/lib/aggregates.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts) — `calculateGroupedAggregate; numericInputs`.
- [packages/explorEDA/src/lib/calculations/CalculationState.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/calculations/CalculationState.ts) — `CalculationManager; executeCalculation; getErrors`.
- [packages/explorEDA/src/components/calculations/CalculationTrace.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/calculations/CalculationTrace.tsx) — `CalculationTrace; dependency inspection`.
- [packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx) — `GroupedAggregateInspector`.
- [packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx) — `ScatterPlot; full domains; Canvas draw; hover; brush`.
- [packages/explorEDA/src/components/charts/ScatterPlot/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts) — `scatterPlotDefinition.getFilterFunction`.
- [packages/explorEDA/src/components/charts/LineChart/LineChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx) — `LineChart; sorted indices; segments; reduction; color effect`.
- [packages/explorEDA/src/components/charts/LineChart/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/definition.ts) — `lineChartDefinition; SeriesSettings`.
- [packages/explorEDA/src/components/charts/BarChart/BarChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx) — `BarChart; named aggregate branch; bins and categories`.
- [packages/explorEDA/src/components/charts/BarChart/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/definition.ts) — `barChartDefinition.getFilterFunction`.
- [packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx) — `BoxPlot; full versus live groups; overlays`.
- [packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts) — `calculateBoxPlotStats; calculateKernelDensity; calculateBeeSwarmPositions`.
- [packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx) — `PivotTable; selected rows; contributor inspector`.
- [packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts) — `calculatePivotData; generateCell; makeContributors`.
- [packages/explorEDA/src/components/charts/DataTable/DataTable.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx) — `DataTable; prepared rows; named aggregate branch`.
- [packages/explorEDA/src/components/charts/DataTable/filteredRows.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts) — `getFilteredRows; compareValues`.
- [packages/explorEDA/src/components/charts/DataTable/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/definition.ts) — `dataTableDefinition.getFilterFunction`.
- [packages/explorEDA/src/components/charts/ThreeDScatter/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/definition.ts) — `threeDScatterDefinition`.
- [packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx) — `ThreeDScatterChart; scene and camera lifecycle`.
- [packages/explorEDA/src/components/charts/ThreeDScatter/useThreeDScatterData.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/useThreeDScatterData.ts) — `buildThreeDScatterData; useThreeDScatterData`.
- [packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterPoints.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterPoints.tsx) — `ThreeDScatterPoints; attributes and shaders`.
- [packages/explorEDA/src/lib/chartUtils.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.ts) — `reduceDataPoints`.
- [packages/explorEDA/src/hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/applyFilter.ts) — `applyFilter`.
- [packages/explorEDA/src/hooks/useColorScales.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/useColorScales.ts) — `getColorForValue; getOrCreateScaleForField; d3Scales`.
- [packages/explorEDA/src/lib/categories.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/categories.ts) — `categoryKey; categoryValue; categoryLabel; categoryEqual`.
- [packages/explorEDA/src/components/charts/Axis/numericScale.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Axis/numericScale.ts) — `numericScale`.
- [packages/explorEDA/src/lib/fieldSettings.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/fieldSettings.ts) — `applyFieldSettings; convertFieldValue; buildConversionPreview; formatFieldValue`.
- [packages/explorEDA/src/components/charts/RowChart/RowChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx) — `RowChart; displayCounts; Other categories`.
- [packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx) — `SummaryTable; allProfiles`.
- [packages/explorEDA/src/components/charts/ColorLegend/ColorLegendChart.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ColorLegend/ColorLegendChart.tsx) — `ColorLegendChart; fieldCounts; scale creation effect`.
- [packages/explorEDA/src/components/charts/Markdown/definition.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/definition.ts) — `markdownDefinition`.
- [packages/explorEDA/src/components/charts/Markdown/Markdown.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/Markdown.tsx) — `Markdown; EditorProvider`.
- [docs/ui-defaults.md](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/ui-defaults.md) — `Inspection, tokens, keyboard and responsive checks`.
- [apps/demo/src/demos/examples.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/examples.ts) — `calculated-orders`.
- [apps/demo/src/demos/dashboardSettings.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/dashboardSettings.ts) — `orderCalculations; calculationDashboard (relevant sections)`.
- [apps/demo/public/datasets/README.md](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/public/datasets/README.md) — `Shop Operations: 10,000 rows`.
- [apps/data-samples/sample_data.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/data-samples/sample_data.ts) — `createSeededRandom; shop_operations (relevant sections)`.
- [packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts) — `counts rows that survive every chart filter`.
- [packages/explorEDA/src/test/charts/chartRuntime.test.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/charts/chartRuntime.test.ts) — `line, pivot, legend filters; seeded sampling; 3D data`.
- [packages/explorEDA/src/test/providers/DataLayerCalculations.test.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/DataLayerCalculations.test.tsx) — `dependency order and calculated columns`.
- [packages/explorEDA/src/test/providers/analysisReliability.test.tsx](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/analysisReliability.test.tsx) — `formula edits + active derived filter + restore + CSV`.
- [packages/explorEDA/src/lib/chartUtils.test.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.test.ts) — `small-data ordering; ties; reduction`.
- [packages/explorEDA/src/lib/aggregates.test.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.test.ts) — `typed groups; raw inputs; numeric exclusions; signed results`.
- [packages/explorEDA/src/components/charts/PivotTable/__tests__/calculations.test.ts](https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/__tests__/calculations.test.ts) — `contributors; errors; missing saved fields; focus restoration`.


[policy]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/AGENTS.md "Repository contribution rules"
[readme]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/README.md "Supported workspace and source-reference contract"
[root-package]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/package.json "packageManager; check"
[package]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/package.json "exports; scripts; dependencies"
[build]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/tsup.config.ts "entry; external; splitting"
[trace-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-02-visualization-traceability-and-dataflow.txt "Source-to-glyph provenance; explicit boundaries"
[template-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-25-deterministic-ui-templating.txt "Deterministic template expansion; role of TSX"
[spec-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-03-spec-driven-interactive-visualization.txt "Declarative expansion; chart defaults"
[transform-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt "Transform order; stacking; derived layers"
[group-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt "Grouping versus encodings"
[source-intent]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt "Loaded, available and visible data"
[workflow]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/calculation-workflow.md "Calculation workflow; calculated-orders example"
[state]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/DataLayerProvider.tsx "getInitialStoreState; getColumnData; refreshCalculations; getAggregateResult; updateFieldSettings; restoreAnalysisFromStructure"
[rows]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/providers/lib/dataLayerState.ts "initializeData; IdType"
[crossfilter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.ts "addChart; getAllData; getFilteredRowIds; updateChartFilters"
[live]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetLiveData.tsx "useGetLiveData; useGetLiveIds; useGetAllIds"
[column]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/useGetColumnData.tsx "useGetColumnData; useGetColumnDataForIds"
[types]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/ChartTypes.ts "ChartDefinition; ChartSettings; BaseChartProps; AxisSettings"
[saved]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/types/SavedDataStructure.ts "SavedDataStructure; SavedAnalysisStructure"
[registry]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registry.ts "registerChart; getChartDefinition; component wrapper"
[registered]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/charts/registerAllCharts.ts "registerAllCharts"
[renderer]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ChartRenderer.tsx "ChartRenderer"
[base-chart]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BaseChart.tsx "BaseChart; brush and guide rendering"
[facets]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/FacetRelated/FacetContainer.tsx "groupFacetData; FacetContainer; header selection"
[aggregate]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.ts "calculateGroupedAggregate; numericInputs"
[calculation]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/calculations/CalculationState.ts "CalculationManager; executeCalculation; getErrors"
[calc-trace]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/calculations/CalculationTrace.tsx "CalculationTrace; dependency inspection"
[aggregate-inspector]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx "GroupedAggregateInspector"
[scatter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx "ScatterPlot; full domains; Canvas draw; hover; brush"
[scatter-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts "scatterPlotDefinition.getFilterFunction"
[line]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/LineChart.tsx "LineChart; sorted indices; segments; reduction; color effect"
[line-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/LineChart/definition.ts "lineChartDefinition; SeriesSettings"
[bar]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx "BarChart; named aggregate branch; bins and categories"
[bar-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BarChart/definition.ts "barChartDefinition.getFilterFunction"
[box]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/BoxPlot.tsx "BoxPlot; full versus live groups; overlays"
[box-math]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts "calculateBoxPlotStats; calculateKernelDensity; calculateBeeSwarmPositions"
[pivot]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx "PivotTable; selected rows; contributor inspector"
[pivot-math]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts "calculatePivotData; generateCell; makeContributors"
[table]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx "DataTable; prepared rows; named aggregate branch"
[table-filter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts "getFilteredRows; compareValues"
[table-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/DataTable/definition.ts "dataTableDefinition.getFilterFunction"
[3d-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/definition.ts "threeDScatterDefinition"
[3d]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx "ThreeDScatterChart; scene and camera lifecycle"
[3d-data]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/useThreeDScatterData.ts "buildThreeDScatterData; useThreeDScatterData"
[3d-points]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterPoints.tsx "ThreeDScatterPoints; attributes and shaders"
[reduction]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.ts "reduceDataPoints"
[filter]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/applyFilter.ts "applyFilter"
[colors]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/useColorScales.ts "getColorForValue; getOrCreateScaleForField; d3Scales"
[categories]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/categories.ts "categoryKey; categoryValue; categoryLabel; categoryEqual"
[scale]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Axis/numericScale.ts "numericScale"
[conversion]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/fieldSettings.ts "applyFieldSettings; convertFieldValue; buildConversionPreview; formatFieldValue"
[row-chart]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/RowChart/RowChart.tsx "RowChart; displayCounts; Other categories"
[summary]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/SummaryTable/SummaryTable.tsx "SummaryTable; allProfiles"
[legend]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/ColorLegend/ColorLegendChart.tsx "ColorLegendChart; fieldCounts; scale creation effect"
[markdown-definition]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/definition.ts "markdownDefinition"
[markdown]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/Markdown/Markdown.tsx "Markdown; EditorProvider"
[ui]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/docs/ui-defaults.md "Inspection, tokens, keyboard and responsive checks"
[demo]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/examples.ts "calculated-orders"
[dashboard]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/src/demos/dashboardSettings.ts "orderCalculations; calculationDashboard (relevant sections)"
[fixture]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/demo/public/datasets/README.md "Shop Operations: 10,000 rows"
[generator]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/apps/data-samples/sample_data.ts "createSeededRandom; shop_operations (relevant sections)"
[crossfilter-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts "counts rows that survive every chart filter"
[runtime-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/charts/chartRuntime.test.ts "line, pivot, legend filters; seeded sampling; 3D data"
[calc-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/DataLayerCalculations.test.tsx "dependency order and calculated columns"
[reliability-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/test/providers/analysisReliability.test.tsx "formula edits + active derived filter + restore + CSV"
[reduction-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/chartUtils.test.ts "small-data ordering; ties; reduction"
[aggregate-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/lib/aggregates.test.ts "typed groups; raw inputs; numeric exclusions; signed results"
[pivot-test]: https://github.com/byronwall/explorEDA/blob/593ca2e1f9210d5bc66985437afc37fcfcd8a56a/packages/explorEDA/src/components/charts/PivotTable/__tests__/calculations.test.ts "contributors; errors; missing saved fields; focus restoration"
