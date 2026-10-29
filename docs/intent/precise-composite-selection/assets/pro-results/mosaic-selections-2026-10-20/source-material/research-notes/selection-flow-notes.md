# explorEDA selection and evidence audit

Research notes for the Mosaic Selections study. These notes are original analysis, not application changes. Baseline: `byronwall/explorEDA@9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Audit date: 2026-10-21. Repository paths below are relative to the immutable snapshot root, normally prefixed `packages/explorEDA/src/` (abbreviated `src/` below). `lib/aggregates.ts` and `lib/dailyRollup.ts` were absent from the selected packet and read from exact-baseline supplemental GitHub retrieval under `research-work/repo-supplement/`; they are distinguished in coverage. No application tests, benchmarks, UI checks, builds, dependency installation, or repository mutations were executed.

## Main finding

**Observed:** explorEDA already has source-owned field predicates, typed value matching, source-space numeric/date bounds, chart-independent workspace predicates, population restrictions, Crossfilter self-exclusion, exact row IDs, and planned-mark trace contributors. The largest immediate opportunity is to make resolution semantics consistent and explicit across consumers. A new backend is unnecessary to establish that contract.

**Observed counterexample, unexecuted:** histogram interior bins are half-open, while the filter written by clicking them is closed on both ends. The same mismatch occurs in Scatter marginal histograms. A shared contract should first prevent existing source-mark membership from diverging from linked evidence. Adding a new object without changing these writers and consumers would preserve the defect.

**Observed:** one chart's `Filter[]` does not have a uniform meaning across chart definitions. A normal Bar reads the first filter on its own field; aggregate Bar accepts all value filters and only the last range/date range; series Bar and Scatter evaluate all supplied filters; Heatmap accepts selected types on its row/column fields. Therefore an adapter that copies arbitrary predicates into `settings.filters` cannot promise uniform semantics.

**Inference:** retain Crossfilter and existing React renderers; extract a small exact semantic layer only as required by the four-consumer proof and the already-prioritized lasso proof. Identity, interval closure, scope, population, and evidence invariants earn their complexity. Mosaic-style metadata and acceleration need separate proof. Current source does not justify a claim that a SQL backend or materialized cube will improve this application's latency.

## 1. What exists: state, writers, resolution and readers

### 1.1 State is partially independent from renderers

`src/types/FilterTypes.ts:Filter:1–35` defines value, numeric range, text, and date-range predicates. Every predicate carries a field; value filters hold `datum[]`; numeric bounds are optional. It has no explicit interval closure, composite OR, tuple union, polygon, origin identity, dataset revision, or target policy. `datum` distinguishes string, number, boolean, null and undefined (`src/types/ChartTypes.ts:datum`); nonfinite number values can occur at runtime.

`src/types/ChartTypes.ts:BaseChartSettings:101–124` keeps `filters` beside display and chart settings. `localFilters` are separately documented as a chart's population: they do not filter sibling charts and are not cleared by other selections. Axis limits are documented as clipping/view bounds, not filters (`AxisSettings:63–83`). Facet display visibility is also separate: `visibleFacetIds === undefined` means all, `[]` means none (`BaseFacetSettings:38–44`). Do not collapse these settings into one generic filter bag.

`src/types/SavedDataStructure.ts:SavedDataStructure` persists charts, calculations, field settings, aggregates, independent Rows settings, color scales, and optional workspace filters. Workspace filters are limited to one per field (38–42). There is no durable dataset revision attached to chart predicates. `src/providers/lib/dataLayerState.ts:initializeData:7–11` assigns `__ID` from array position after spreading each row; it is an exact identity within the current prepared dataset, not a durable business-record key.

### 1.2 Gesture → settings → Crossfilter → plan

1. A chart's pointer/keyboard handler translates a gesture into its own `Filter[]` and calls `updateChart(id,{filters})`. Generic `useBrush` holds transient pixel coordinates locally; source-unit inversion is performed by the consuming chart. `src/hooks/useBrush.tsx:handlePointerMove/handlePointerUp` updates draft pixels during dragging and commits `onBrushChange` on pointer-up (154–178). Current ordinary brushing is not a stream of Crossfilter queries for every pointer-move.
2. `src/providers/DataLayerProvider.tsx:updateChart:1048–1072` merges settings while forcing the existing ID, calls `crossfilterWrapper.updateChart`, and generally rebuilds `liveItems` through `getAllData`. A short display-only key set preserves `liveItems` identity, but the wrapper update occurs before that optimization; a changed title can still cause a chart-predicate rebuild. This is a source-derived cost hypothesis, not a measured regression.
3. `src/hooks/CrossfilterWrapper.ts:addChart:92–105` owns one row-ID dimension and group per chart ID. `getFilterFunction:165–168` delegates semantic interpretation to the chart definition. `updateChartFilters:68–89` installs that predicate unless notebook `localSelections` is active, in which case the dimension is cleared.
4. `getAllData:187–214` reads each chart's group, then applies that chart's `localFilters` to the returned ID/count entries. Crossfilter groups exclude the filter on their own dimension, so these IDs are context after other charts and workspace filters. `useGetLiveIds` discards zero-valued group entries and applies a nonempty facet ID restriction (`src/components/charts/useGetLiveData.tsx:useGetLiveIds`). `useGetAllIds` gets the chart's full population before linked filters.
5. A renderer builds a data/geometry plan from these IDs and cached field columns. Source-chart context and exact selected evidence can be intentionally different. Bar and Heatmap keep context values and mark the current selection; Scatter adds `passesOwnFilter` and `passesAllFilters`; MetricCard explicitly requests the all-filter intersection. Trace sources resolve planned marks and their original contributor IDs.
6. Store subscriptions emit serializable host state for edits (`DataLayerProvider.tsx:1670–1683`). `saveToStructure:1303–1337` persists chart filter settings. Restore rebuilds prepared values, calculation manager, indexes, and chart/workspace predicates (`restoreFromStructure:1339–1479`). Rows/export/findings are separately audited by the sibling research agent; they are not assumed to reuse a chart trace merely because both have row IDs.

### 1.3 Exact resolution equations

Let `D` be prepared rows in one dataset revision, `W` the conjunction of all workspace predicates, `C_s` the predicate actually implemented by chart definition `s`, `P_t` target `t`'s local population, and `F_t` its facet ID set. Absent predicates denote true. The following are source-derived abstractions, not a new implementation:

| Current reader | Linked workspace (`localSelections=false`) | Notebook (`localSelections=true`) |
|---|---|---|
| Global exact selected IDs | `D ∩ W ∩ ⋂ C_s` | `D ∩ W` |
| Source chart `t` live context | `D ∩ P_t ∩ W ∩ ⋂_{s≠t} C_s` | `D ∩ P_t ∩ W` |
| Faceted source live context | Above, additionally intersect nonempty `F_t` | Above, additionally intersect nonempty `F_t` |
| `getChartFilteredRowIds(t)` | `D ∩ P_t ∩ W ∩ ⋂ C_s` | `D ∩ P_t ∩ W`; does **not** reapply `C_t` |
| Workspace field control group for field `f` | Global intersection excluding its own workspace field dimension; chart selections remain | Workspace intersection excluding its own field dimension |
| Bar/Heatmap source highlighting | Consumer-specific interpretation of `settings.filters` over source context | Same local highlighting despite uninstalled chart dimensions |
| Scatter point highlighting | Own x/y/color/ID/size predicates are reapplied by point planner | Same local highlighting; `passesAllFilters` still derives from workspace-only global intersection |
| Density/hex selected/dimmed state | Matching ID count against all-filter `filteredIds` | That all-filter set no longer includes own chart selection; local highlight parity needs a dedicated test |
| MetricCard | All-filter intersection inside its population | Workspace-only intersection inside population; scope text still says chart's filters |
| Written finding | No claim from this audit; daily findings use an independent representation | Same caution |

The facet-empty caveat is material: `useGetLiveData/useGetLiveIds` and Scatter use `facetIds && facetIds.length>0` so explicit `[]` means unrestricted. The current `FacetContainer` generates nonempty source groups, which normally avoids that input. This is an API/contract edge, not evidence of a routine empty-facet UI defect. By contrast, density/hex plans construct a Set whenever the array is present, so `[]` means no rows there. A proposed exact resolver should distinguish undefined scope from an empty set consistently.

### 1.4 Multiple sources, clearing and scope

Two charts selecting the same field remain two dimensions and intersect. Clearing chart A leaves chart B's predicate. Workspace filters instead have one entry per field; setting another filter replaces that field's earlier predicate (`CrossfilterWrapper.ts:setWorkspaceFilters:134–152`; `DataLayerProvider.tsx:setWorkspaceFilter:1149–1169`). A single value filter's values form an OR; chart predicates commonly combine multiple field filters with AND, subject to chart-definition exceptions. An absent filter allows every row; a value filter with `values:[]` matches none. Do not serialize an empty selection as `[]` if the intended meaning is an active predicate with zero matches.

`clearAllFilters:1121–1147` clears chart filters and table global search, workspace filters, and independent Rows filters/search, while retaining `localFilters`. `clearFilter:1171–1174` only writes `filters:[]`; it does not itself clear a DataTable global search. Deleting a chart clears/disposes its dimension and group (`CrossfilterWrapper.ts:removeChart:107–117`). Adding/duplicating through `addChart` creates a new UUID (`DataLayerProvider.tsx:1017–1029`); copying settings may also copy the predicates, so duplication policy needs a deliberate proof case.

**Critical current scope fact:** `localFilters` restrict which rows appear in a source chart, but they are not automatically included in its outgoing predicate. A category or range chosen within population A can select matching rows in population B in a sibling. A rectangular brush within a facet likewise writes source-field predicates without automatically appending facet fields. This may be an intentional global selection, but it cannot simultaneously be described as selecting exactly that panel's mark contributors.

Current paths differ:

| Writer | What is stored | Scope consequence |
|---|---|---|
| Ordinary Bar category | Value filter on category field | Applies to matching categories outside source local population/facet too |
| Numeric Bar bin | Numeric range on value field | Global field interval; current boundary mismatch below |
| Scatter rectangle | x/y span filters, possibly size eligibility | Source-space rectangle or band combination across all matching facets |
| Scatter point | `__ID` value filter | Exact current-revision point row, replacing prior filters |
| Series Bar mark | Group + series filters and explicit facet field filters | Explicit tuple and facet constraint (`SeriesBarChart.tsx:125–150`) |
| Density/hex bin | `__ID` list from bin's source IDs | Exact facet-restricted membership at the current dataset revision |
| Heatmap cell | Row value + column value or UTC period range | One pair, not an arbitrary disjoint tuple union |
| Facet header | Value filter on facet field | Consumer must actually honor that field; ordinary Bar's first-own-field-only definition is a compatibility hazard |

A union of (A,1) and (B,2) cannot be represented by independent `A|B` and `1|2` field lists without admitting cross pairs (A,2) and (B,1). A lasso likewise cannot be replaced by its bounding rectangle. Preserve explicit tuple/polygon semantics or an exact revision-bound ID selection. No general Boolean editor is necessary to prove this.

## 2. Chart and trace details

### 2.1 Bar/histogram

`src/components/charts/BarChart/definition.ts:getFilterFunction:46–87` is decisive: series filters all entries; aggregate mode accepts values plus last numeric/date range; ordinary mode uses the first predicate whose field matches `settings.field`. Highlight logic and the outgoing predicate should be compared explicitly, not inferred from the shared array type.

`BarChart.tsx:SingleBarChart` reads live IDs excluding its own source dimension and gets full-source values with `useGetColumnDataForIds(field)` without an IDs parameter. The helper returns `Object.values(column)` in that case (`useGetColumnData.tsx:16–35`), so normal histogram/count encoding domains are full dataset values, even when the chart has a narrower `localFilters` population. Aggregate domain computations instead use `useGetAllIds(settings)` and facet IDs. This distinction is delivered behavior; a shared population resolver must not accidentally change stable encoding domains while changing evidence membership.

`barPlan.ts` builds category counts or numeric bins and retains every contributing source ID. Count domains use full-source counts; linked filters reduce bar values without rescaling the full-source domain (`barPlan.test.ts:147–173`). The source chart's own filter changes selection/dimming, not context count. The inspector uses those planned contributors and states the scope (`barTrace.ts`, `BarTraceBody.tsx`, `GroupedAggregateInspector.tsx`). Aggregate inspectors retain excluded rows with raw/prepared values and reasons. Evidence behind a mark is therefore not always the same as the rows numerically included in its aggregate.

#### Confirmed static boundary mismatch

`bins.ts:numericBins:1–38` and `barPlan.ts:246–283` partition interior bins as `[start,end)`, closing the final bin. `BarChart.tsx:286–340` emits `{type:'range',min:start,max:end}` on bin click/brush. `applyFilter.ts:18–30` implements `>= min && <= max`. With x values `[0,0.5,1]` and two fractional bins, the first displayed/trace bin has only x=0; its emitted closed range also selects x=.5, which belongs to the second bin. The existing `bins.test.ts` and `barPlan.test.ts:175–188` test partition membership, not writer-to-linked-reader membership. No execution is claimed; it is a direct source-derived counterexample.

Fix choices must preserve public range meaning: either add explicit closure in the semantic contract (recommended if a contract is introduced), or translate exact bins to revision-bound ID sets for the proof. Do not silently subtract epsilon or choose the next representable float as a generic solution, especially for dates, scaled axes and arbitrary numeric magnitudes. Histogram numeric keyboard selection also needs proof: category/aggregate bars receive Enter/Space selection, while numeric bins' `selectable` branch is false; BaseChart supplies Escape to clear (`BaseChart.tsx:317–322`).

`BarChart.tsx:344–367` resnaps stored ranges when bin settings change. That can change membership as a display setting changes. The intended product behavior should be explicit: retain semantic interval, or let a bin-identity selection rebind with a visible explanation. A source-space selection must not be redefined merely by resize.

### 2.2 Scatter, density, marginals and lasso distinction

`useScatterData.ts` constructs a snapshot with full local-population IDs, own-excluding chart IDs, global all-filter IDs, facet IDs, field columns, copied color scale and revisions. `scatterPlan.ts` creates axes from full-population values; axis limits clip, not filter; missing/invalid/nonpositive-log points are separately excluded and explained. `scatterPlan.test.ts:177–230` explicitly expects all points to remain planned past a bound.

`scatterAxis.ts:spanFilter/filterSpan` performs numeric scale inversion or category-band selection, including a small pixel hit tolerance at band edges. Jitter is deterministic by row ID for visualization; a categorical brush means a category selection, not a geometric selection of individual jittered dots. `scatterPlan.ts:brushFilters:809–825` emits source-space spans plus nonnegative size eligibility when relevant. The ordinary rectangle is a pair of independent axis predicates. It is not a lasso.

`planScatterPoints.ts:73–85` recomputes own selection only for x/y, color, `__ID`, and size fields; the Scatter definition evaluates all filters. A filter on an unrelated field can narrow sibling/evidence rows while the source's point highlighting does not apply that filter. The exact source predicate should be resolved once and supplied as an ID/membership set, rather than rededuced from a subset of chart fields. This is an integration risk that should be tested using the actual intended writers, including facet headers, before presenting it as a universally reachable UI bug.

`ScatterPlot.tsx` clicking a point replaces all current filters with one `__ID` value predicate; brushing removes existing x/y/ID/size filters and appends source-unit spans while preserving other fields. This is a source-replacement operation, not arbitrary logical composition. Pixel draft state remains in `useBrush`; most semantic work occurs at commit. Scatter canvas hover uses linear point hit testing; the plan and canvas redraw are broader work than predicate evaluation alone.

`ScatterSvg.tsx:518–588` enables roving keyboard point activation when `plan.size` is present (bubbles). Ordinary canvas points do not get that same keyboard path. Escape calls brush.clear (605–608). The future lasso proof requires an equivalent keyboard-accessible exact row-selection mechanism; merely adding Escape is insufficient. A small proof can expose focused row selection and inspection alongside pointer lasso, without pretending a keyboard-drawn polygon is mandatory.

**Delivered stable density:** `densityPlan.ts:36–41,84–166` uses source-unit numeric bins and exact IDs; it is not a screen-pixel approximation. Interior edges go to the right bin; final edge closes. `sourceMax` comes from full-source bins and is shared across facets; an optional fixed color maximum is supported. A click writes exact `bin.sourceIds` as a `__ID` predicate. `density.test.tsx` already specifies boundary IDs, membership under resize, shared facet color maximum, selection and trace behavior. These tests were read, not run.

`hexPlan.ts:52–84` similarly tiles normalized axis space, stable under resizing; `hexBinFilters:192–207` selects exact source IDs. It does depend on axis transformation/domain and hex configuration; changing those can change bin membership. Identity persists as a list of current dataset row positions, so replacement/reorder must invalidate it.

**Density bounded-axis risk (inference, unexecuted):** numeric density assigns each finite value using bisect and clamps indices to edge bins without first rejecting values outside the domain. Since Scatter axis limits are view bounds, a bounded domain can fold offscreen values into edge-bin membership even though the label states a bounded numeric interval. Add a targeted fixture before describing each density bin as an exact interval, while retaining that its stored ID list is exact for the implementation.

**Marginal boundary mismatch:** `marginalPlan.ts:107–123` partitions points with `bisectRight`; `marginalBinFilters:237–263` writes a closed range. The first marginal's endpoint can select a row drawn in the adjacent bin. `summaryMarginals.test.ts:153–163` asserts the filter object shape, not the membership. A marginal drag also emits the start/end of chosen bins (`ScatterSvg.tsx:104–124`), so the closure rule should be shared. The planner currently clamps bounded outliers into the marginal's first/last bin too. Marginal heights are calculated from plotted point context, and own selection splits them; that is separate from selected evidence count.

### 2.3 Heatmap histories and colors are already delivered

`heatmapPlan.ts:rankPeriods:184–227` inserts absent calendar periods from the first to last, applies a cap, and takes the latest periods for the visible window. `heatmapHistories.test.ts` verifies complete chronological histories and fixed color ends. Treat these as delivered baseline capabilities, not planned work from older intent docs.

Heatmap axes are ranked using full local-population IDs, while cell values use live own-excluding context IDs. Invalid dates are omitted from period bucketing and recorded. Empty cell, rows with no valid measure, and true zero have distinct plan states; `heatmapPlan.test.ts:52–76` makes the difference explicit. `toggleCellFilters:511–531` emits one row+column pair; time-binned columns use UTC date boundaries. `toggleAxisFilters:537–559` replaces that two-axis selection with one selected row or column.

`src/components/charts/heatScale.ts:planHeatScale:24–55` derives default extremes from values on show. Fixed `colorDomain.min/max` replace respective ends; sqrt transformation is supported. Therefore the precise claim is: fixed ends preserve configured color meaning, and Scatter density uses full-source maxima by default. It would be incorrect to claim that every Heatmap's default scale is permanently fixed across linked filters.

`Heatmap.tsx` supplies arrow navigation, Enter/Space, and Alt-Enter inspection for cells. Each trace resolves the same planned cell, keys, reducer and contributor IDs (`heatmapTrace.ts`, `HeatmapTraceBody.tsx`). A multi-cell disjoint selection cannot be represented by independently unioning row and column values without tuple cross-product leakage.

The supplemental `lib/dailyRollup.ts:utcPeriod:75–85` accepts nonblank string values only, while `utcDay:62–72` and `valueParsing.ts:timestampOf` also accept numeric timestamps. Numeric date filters can therefore be valid where Heatmap period bucketing excludes the value. Prepared field conversion may normalize the ordinary UI path, but a shared predicate/consumer contract must define representation and eligibility rather than assuming every date reader is identical.

### 2.4 Metric and analytical denominators

`MetricCard.tsx:35–75` explicitly uses `crossfilter.getChartFilteredRowIds(settings)`, not the own-excluding live group. Its denominator is `useGetAllIds(settings)` before interactive filters. It also records raw numeric input and conversion failures. `metricCardPlan.ts:78–95` distinguishes no rows, no valid values or entity conflicts, and actual numeric zero. It compares average as a delta, count/sum as a share only when baseline>0 and selected value>=0 (101–140).

**Inference:** the share check does not establish that every underlying summand is nonnegative. For values `[100,-50]`, selecting the first gives 200% of a positive total; the comparison bar clamps visually to100% (`MetricCard.tsx:174–185`). A proposed written finding should initially bind an exact selected row count with `selected ⊆ explicitly named baseline`, or an explicitly eligible measure whose denominator policy is proven. Do not reuse arbitrary positive-net sum as a safe part-of-whole statement.

`MetricCard.tsx:16–20` does not destructure/use `facetIds`; if this chart is routed through faceting, each panel receives the whole chart metric. The snapshot's generic renderer forwards facet props, but this audit did not prove a standard UI permits a MetricCard facet, so report as a component/API edge or proposed proof condition, not a verified ordinary-user defect.

Notebook `localSelections` is another exactness edge: chart dimensions are cleared, and MetricCard's all-filter helper does not reapply own local predicates. The scope text still says rows pass the chart's filters (`metricCardPlan.ts:163–165`). Density/hex matching similarly depends on global filtered IDs. The proposed resolver should distinguish notebook local selection from global linked selection and compute a target's exact local set deliberately.

### 2.5 Aggregate semantics constrain optimization

Exact-baseline supplemental `lib/aggregates.ts:summarizeGroup:134–223` keeps every source row as a contributor but counts each declared entity once. Null/undefined entity IDs are excluded. Repeated agreeing values have one included row and repeated contributors marked excluded. Conflicting measure values within an entity make the aggregate unavailable. Agreement uses `Object.is` on prepared measure values. Group-level distinct entities are not additive across groups.

`aggregateValues:94–121` sums finite eligible values or computes average as sum/count; no valid numeric input returns undefined. `poolAggregateRows:262–288` re-reduces underlying contributors, including recomputing identity issues, rather than averaging precomputed averages or summing distinct counts. Any cache must retain enough sufficient information for the declared aggregation, identity policy, validity and evidence. A plain `(count,sum)` cube is insufficient for entity deduplication, conflicts, medians, exact row evidence or arbitrary lasso membership.

### 2.6 Trace identity and selected evidence are separate

`trace/ChartTraceScope.tsx` uses a React owner ID for a mounted trace source and resolves a selection `{owner,kind,id,revision}` against the current plan. A changed revision invalidates inspection. A resize with the same revision can preserve the trace and update its geometry; `ChartTraceScope.test.tsx:104–135` specifies this. Offpage facet lookup can focus the panel before resolving a row (138–148).

`useTraceRevision` includes data/store nonce and chart live nonce. `getAllData` gives every chart the same incremented nonce. This is useful stale-trace protection, but it is not a persisted dataset identity suitable for selection restores or asynchronous query fencing.

`traceRows.ts` maps certain trace types to contributor IDs. Bar and metric return all contributors, including rows excluded from numeric accumulation. Heatmap cells, density bins and hex bins have their own inspector evidence but are not included in that generic query-flow shortcut. `ChartTracePanel.tsx:QueryRowsLink` maps those positional IDs into `analysis.resultRows[id].key`, deduplicates, and only offers the shortcut when it has IDs. Do not promise that every trace presently has a uniform export/drill-through route.

`ScatterTraceBody.tsx:28–47` explicitly shows other-filter, own-chart and all-filter statuses, supporting the distinction between context and evidence. `MarginalTraceBody.tsx:19–43` labels interior bins with `< high`, making the inclusive outgoing filter mismatch visible in the inspector's own stated interval. `SurfaceTraceBody.tsx:46–87` lists all source IDs for a hexagon and strikes out those hidden by other charts. The generic Metric inspector, however, says each matching row adds1 and labels `plan.rowCount` as matching rows (`MetricCardTraceBody.tsx:11–29`), although entity mode counts units/IDs; a future shared metric/finding inspector should retain that unit distinction and avoid inheriting misleading row terminology.

## 3. Typed values, dates and missing data

| Case | Current source behavior | Proposed invariant / proof |
|---|---|---|
| Number `1` vs string `"1"` | `categories.ts:categoryKey/categoryEqual` preserve type; labels disambiguate numeric strings | Serialization/restoration and any SQL adapter must preserve typed literals |
| null and undefined | Category grouping normalizes both to null; equality groups them | Name this category and retain raw evidence |
| blank / whitespace strings | `isMissingValue` treats them as missing; `categoryValue` only normalizes nullish values | A null-valued filter also matches blank strings even when the category mark treats them separately; test mark→predicate parity |
| numeric strings | `parseNumber/finiteNumber` accepts decimal numeric text; booleans, blanks and radix prefixes rejected | Prepared/raw distinction and per-field conversion revision belong in binding |
| nonfinite numbers | Numeric ranges reject; value equality supports NaN SameValueZero; `categoryKey` encodes nonfinite numbers | Do not rely on bare JSON numbers or SQL null to preserve these |
| leading-zero IDs | `isExactNumberText` rejects identifier-looking normalization | Avoid conflating `"001"`, `1`, and `"1"` |
| numeric interval | Inclusive min/max in `applyFilter` | Make closure explicit for bins; no epsilon repair |
| date-only bounds | UTC start day and inclusive end day via `dateBound(max,true)` | Use half-open period interval or exact UTC end rule consistently |
| impossible dates / incidental text | Custom parser rejects invalid calendar dates and incidental labels | Unavailable predicate or explicit exclusion; never silent match-all |
| field absent | `getColumnData` returns undefined for each row; a null-valued filter can match those undefined values | Validate field existence separately; generic `applyFilter` is not a missing-field guard |
| explicit empty facet set | Some live/Scatter consumers treat `[]` as unrestricted; density/hex use empty Set | Distinguish no scope from zero-row scope |

Sources: `src/hooks/applyFilter.ts`, its full test file; `src/lib/valueParsing.ts` (especially dateBound274–285 and timestampOf292–305); `src/lib/categories.ts`; `src/lib/chartPopulation.ts:getPopulationTest:19–32`; `src/providers/DataLayerProvider.tsx:getColumnData:1193–1258`.

The chartPopulation comment says a missing field matches no rows, but `applyFilter(undefined,{type:'value',values:[null]})` evaluates true through missing-value matching. A missing field range does match none (existing Crossfilter test); that does not prove the general comment. A binding validator should fail closed before row evaluation for unknown fields, instead of changing legitimate missing-row behavior.

## 4. Lifecycle and invalidation

| Event | Observed behavior | Requirement for proposed shared selection |
|---|---|---|
| Clear one source | Chart filters replaced with empty; other source dimensions remain | Remove only clauses owned by that source; explicit distinction from active match-none |
| Clear all | Clears interactive chart/workspace/Rows filters and searches, retains local populations | Retain same scope boundary and expose what was cleared |
| Remove chart | Clears/disposes chart group/dimension | Remove owned clauses or explicitly retain as named independent selection; first proof should remove |
| Duplicate chart | New UUID via addChart; copied predicates may remain in copied settings | New source identity; deliberate copy-selection policy; no accidental shared mutable owner |
| Field type/date/null-token edit | Rebuilds prepared data/calculations/indexes; clears affected chart/workspace/Rows filters; retains localFilters (`updateFieldSettings:770–865`) | Revalidate population and selection field bindings; mark unavailable instead of widening |
| Calculated field edit | Clears calculation cache, refreshes every chart/workspace filter and live groups (`refreshCalculations:1515–1556`) | Cache key must include calculation/field revision; never reuse stale IDs or counts |
| Data replacement | setData rebuilds data and IDs, clears/rebuilds state; incoming savedData can restore predicates on replacement rows | Revision-bound positional ID selections must expire; semantic field predicates require explicit schema validation |
| Restore | Reconstructs prepared values and indexes before predicates | Preserve type, interval closure, source identity, scope; resolve against declared revision |
| Resize | Plans and transient geometry change | Exact semantic IDs unchanged; trace geometry may update |
| Binning change | Numeric Bar resnaps saved range | Product choice: retain semantic interval vs rebind bin identity visibly |
| Notebook mode | Chart dimensions cleared on initialization; chart-owned settings remain | Explicit target-local selection resolution; do not infer selected IDs from global Crossfilter alone |

There is no general undo action established by these paths. The research should propose a bounded reversible selection action only if needed, and not claim undo already exists. `assertUnusedCalculation:1483–1513` explicitly checks chart filters/facet and aggregate/workspace usage but not `localFilters`; a deletion/edit proof should cover population references too. Whether other validation catches those references requires focused verification before classifying as a user-visible bug.

## 5. Actual hot paths and performance interpretation

**Observed:** field arrays are cached, including calculation results, and `setWorkspaceFilters` reads each column once when compiling the predicate. This avoids the known per-row column materialization trap. `getColumnData` still scans calculations to locate a result and builds/caches uncached source columns; derived edits invalidate cache. `getAllData` fans out across every chart group, applies local-population predicates per chart, and increments a common nonce. Chart plans still group/aggregate eligible IDs, calculate geometry, trace contributors, exclusion reasons, bins and domains. MetricCard reads the whole `liveItems` map. Scatter redraw and linear hover hit-testing remain even if filtering accelerates.

**Inference:** separately time predicate commit, live ID materialization, per-chart plan, React/canvas rendering and exact evidence retrieval. A cache of only the global selected IDs would not remove own-excluding per-source contexts, facet-specific plans, aggregate provenance, repeated conversion diagnostics, or drawing work. Continuous-preview latency should not be reported as an existing pointer-move query workload when the current hook commits on pointer-up.

The smallest benchmark needs cold setup and warm repeated commit costs, changing active source, one and two dimensional predicates, multiple views, skew/cardinality, dataset replacement and calculated-field invalidation. Compare exact IDs at each step before accepting aggregate equivalence or latency. `count` is easiest; `average` needs eligible sum and eligible count; entity-aware aggregates require richer state; exact lasso requires geometry/ID membership and must not be replaced by pre-aggregation cell overlap. A materialized cube can have large product cardinality and expensive construction even when a sparse map avoids unused cells.

The current code has stable source density bins and exact ID evidence. Their existence neither proves that Mosaic materialized views are already implemented nor establishes demand for DuckDB. The proposed acceleration gate should remain separate from the semantic GO gate.

## 6. Recommended proof additions and exact candidate files

The main four-consumer fixture and recommendation numbering are owned by the parent report. The following gates should be incorporated; every check is **proposed/unrun**.

| Gate | Small counterexample / expected behavior | Exact candidate files |
|---|---|---|
| Histogram boundary parity | x=`[0,.5,1]`, two bins: first bin selects only ID0; next boundary ID1 belongs to next bin | `BarChart/bins.ts`, `barPlan.ts`, `BarChart.tsx`, `bins.test.ts`, `barPlan.test.ts`, `BarChart.select.test.tsx`, `hooks/applyFilter.ts` |
| Marginal parity | Interior boundary value belongs to one marginal bin and the committed predicate's same IDs | `ScatterPlot/marginalPlan.ts`, `ScatterSvg.tsx`, `summaryMarginals.test.ts` |
| Two sources same field | A selects low range, B overlaps partly; source A shows context excluding A, evidence intersects A+B; clear A leaves B | `hooks/CrossfilterWrapper.test.ts`, new bounded semantic resolver tests, `test/providers/DataLayerProvider.test.tsx` |
| Chart-definition parity | Shared unrelated-field/facet guard must not disappear in Bar/Heatmap or source highlight | `BarChart/definition.ts`, `Heatmap/definition.ts`, `ScatterPlot/planScatterPoints.ts`, registry contract |
| Facet/population scope | Same x/y in two facets; choose global vs facet-local once, assert declared IDs in all consumers | `FacetRelated/FacetContainer.tsx`, `useGetLiveData.tsx`, `ScatterPlot/scatterPlan.ts`, `SeriesBarChart.tsx` |
| Empty population | `facetIds=[]` resolves zero; absent scope resolves all allowed rows | same live hooks/plans; MetricCard if faceting is exposed |
| Local notebook | Own local predicate affects local evidence/highlight, never siblings; workspace still affects all | `CrossfilterWrapper.ts`, `useScatterData.ts`, `densityPlan.ts`, `hexPlan.ts`, `MetricCard.tsx` |
| Missing field vs missing value | Existing field null bucket works; nonexistent referenced field yields unavailable/empty according declared policy | `chartPopulation.ts`, `applyFilter.ts`, provider restore and field validation |
| Missing mark parity | Null, undefined, empty, whitespace string each labeled consistently; clicking missing mark selects precisely declared missing set | `categories.ts`, Bar/Heatmap plans, applyFilter tests |
| UTC period parity | Period boundary, leap day, timezone offset, invalid date, absent date, numeric timestamp eligibility | `valueParsing.ts`, supplemental `dailyRollup.ts`, Heatmap histories/tests |
| Exact lasso | Nonrectangular polygon excludes a point inside bounding box but outside polygon; equal selected IDs in table/export/finding | Proposed polygon/ID clause module, Scatter writer, common resolver; preserve prioritized precise-selection intent |
| Revision and restore | Restore same dataset preserves IDs; reorder/replace makes stale positional-ID clause unavailable or removes it visibly | `dataLayerState.ts`, `DataLayerProvider.tsx`, `SavedDataStructure.ts`, `saveDataUtils.ts` |
| Trace vs numerical contribution | Invalid measure row appears as excluded evidence, not included numeric contribution; export scope explicitly identifies which set | `GroupedAggregateInspector.tsx`, `traceRows.ts`, MetricCard/Heatmap/Bar trace files |
| Safe finding denominator | Selected count numerator subset of named baseline; baseline0 → unavailable percentage; zero matches remains explicit0 | findings module owned by sibling audit; shared exact resolver |
| Stable color | Linked selection retains source density maxima and fixed Heatmap color ends | `density.test.tsx`, `heatmapHistories.test.ts`, `heatScale.ts` |
| Bounded density | Values beyond explicit axis limit are explained, not silently assigned to a misleading interval label | `densityPlan.ts`, `marginalPlan.ts`, `scatterPlan.test.ts`, density tests |
| Keyboard / sizes | Pointer selection has keyboard equivalent and inspection; Escape clear; wide/intermediate/narrow layouts retain scope/status | ScatterSvg, BaseChart, Heatmap, four-consumer demo; widths proposed in parent proof |

### Candidate recommendation framing for parent

- **Keep:** explicit local populations, source context vs selected evidence, exact planned contributor evidence, prepared/raw separation, stable source density color scale and delivered Heatmap history/fixed-end work. Benefit: preserve analytical trust; no architectural churn.
- **Fix now:** interval closure mismatch in histogram and marginal writers; scope/field predicates silently ignored by chart-specific adapters when used in the proof; unknown-field fail-closed validation. Gate exact IDs from mark→predicate→table/export/trace. Change public range meaning only through a reviewed explicit shape, not hidden epsilon conventions.
- **Explore:** bounded internal source-owned semantic contract and exact lasso proof over existing Crossfilter. Separate `sourceId`, persistent predicate meaning, target policy and data revision from transient brush pixels/activation hints. First milestone useful without backend replacement.
- **Avoid:** copying arbitrary shared Filter[] to every chart; flattening tuple union into independent field ORs; calling a rectangle lasso; deriving exact evidence from pixel bins; treating `__ID` as persistent across replacement; using a positive-net sum as automatically safe share; claiming paper speedups for this app.
- **Defer:** Mosaic library/backend adoption and optimizer until the semantic proof is correct and a baseline benchmark isolates an actual query bottleneck. Preserve existing renderers and keep any adapter tiny.

## 7. Coverage and confidence

The companion `selection-flow-coverage.json` records exact files read completely versus excerpts, plus supplemental origin and unrun check status. Core semantics, selected renderers/plans, relevant trace readers, primitive parsing, source dimension rules, facets, Provider lifecycle and relevant tests were read. Peripheral Scatter regression/connection/settings implementations were not required for claims made here and are not represented as fully audited. Relevant code references above support observed behavior; proposed fixtures and performance consequences remain unexecuted. No paper or upstream Mosaic assertion is made by these child notes; those are separately owned by the parent study.
