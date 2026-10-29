# Evidence, persistence, identity, DSL, and bounded text bindings

## Audit status and citation convention

This is original research for the Mosaic Selections assignment, not an implementation. The selected packet baseline is `byronwall/explorEDA@9b16d78e3ed0742ed4d5858c1939fec9e758b510`. Packet files are under `source-snapshot/`; paths below are relative to that repository root. Files marked **supplemental** were fetched read-only from the same exact commit through the connected GitHub reader on 2026-10-21 and kept separately under `research-work/repo-supplement/`. No application sources were edited, dependencies installed, application tests executed, or runtime behaviors reproduced. A test described below is an inspected specification, not a reported test pass. The selected source snapshot is not a complete runnable checkout.

The companion `persistence-evidence-coverage.json` distinguishes complete reads, relevant excerpts, searches, supplemental provenance, and unexecuted verification. Code-derived behavior is marked **observed in source**; consequences that need a runnable repository are marked **inference**; new contracts are marked **proposal**. Exact-ref source URLs and blob hashes for supplemental files are in `persistence-supplement-access.json`. The supplements are internal research copies; the parent should decide redistribution independently and include an access record where permission is unavailable.

## Principal conclusions

1. Evidence-table membership already has a precise, reusable path: positive live row IDs, own column predicates and search, then sorting. CSV receives the whole resulting array; virtualization only limits DOM rendering. A proof must compare stable fixture identifiers in every consumer and the complete CSV, not visible row counts or screenshots alone. [`packages/explorEDA/src/components/charts/DataTable/filteredRows.ts:getFilteredRows:15–37`; `DataTable.tsx:123–135`; `DataTableBody.tsx:65–74`; `DataTableToolbar.tsx:41–58,169–177`.]
2. Global Rows is a separate scope: every active Crossfilter predicate, followed by Rows-local filters and search. A dashboard DataTable normally excludes its own linked chart dimension when obtaining peers, then applies its own filters locally; table search stays local. These scopes need separate expected populations, not one universal assertion that every visible count equals every other count. [Supplemental `packages/explorEDA/src/components/RowsView.tsx:21–39,43–52`; packet `DataTable.tsx:37–73,123–135`; `DataTable/definition.ts:getFilterFunction:54–79`.]
3. Single-table `__ID` is positional, but related-table projects already adapt persisted row selections to logical result-row keys. Extend this adapter when introducing new predicate containers. Its current traversal does not cover workspace filters or local filters. [`providers/lib/dataLayerState.ts:initializeData:7–11`; supplemental `components/ExplorEdaProject.tsx:144–158,225–256`; `components/project/analysisRowKeys.ts:6–49`.]
4. Persistence and history are not automatic just because a type can be JSON-serialized. Validators admit only the four existing filter forms; chart-ID normalization in text export, project ID adaptation, field compatibility, view duplication, history labeling, clear/reset paths, and data/type replacement all need explicit review for richer selection state. [`utils/saveDataUtils.ts:isFilter:163–195`; `lib/dsl/export.ts:chartHandles:194–235`; supplemental `savedViewsHistory.ts:35–130`; `SavedViewsWorkspace.tsx:597–631`.]
5. Daily findings are a separate, static condition/evaluation language. Their value coercion, missing-value rule, empty-result behavior, and denominator differ from ordinary interactive filters. Reusing them unchanged for live narrative would introduce semantic differences. A small selected-count binding should consume the same population as other interactive consumers and keep runtime output out of persisted author text. [`apps/demo/src/daily/findings.ts:52–92,157–235`; `components/charts/Markdown/Markdown.tsx:54–80`.]
6. The existing intent order supports a bounded exact scatter/lasso proof first, exact tuple unions later if that proof warrants them, and one live selected-count binding as the initial narrative consumer. Broad named population management remains deferred. Preserve the already delivered heatmap improvements and current trust workflows. [`docs/intent/precise-composite-selection/intent-brief.md:31–35,45–53`; `data-bound-narrative/intent-brief.md:39–49`; `population-baselines/intent-brief.md:45–53`; `progressive-built-in-charts/implementation-plan.md:129–138`.]

## 1. Evidence table and CSV semantics

### Membership, computation, and display

**Observed in source:** `DataTable` reads effective provider `data`, `getLiveItems(settings)`, column metadata, field data, and calculation results. Calculated values are merged into rows using `values[row.__ID]`, so the table is not just a raw source preview. It calls `getFilteredRows` with the chosen live population and the complete chart/Rows table settings. The resulting array goes to both `DataTableBody` and `DataTableToolbar`. [`packages/explorEDA/src/components/charts/DataTable/DataTable.tsx:37–62,123–135`.]

`getFilteredRows` first builds a Set of live item IDs whose `.value > 0`, intersects effective rows by `row.__ID`, then applies search and column filters. Search excludes `__ID`, lowercases `String(value)`, and searches every remaining entry, including hidden fields and derived values. Every own column filter goes through `applyFilter`; the comparator sorts only after membership is decided. Thus changing order must not change membership or the exported ID set. [`packages/explorEDA/src/components/charts/DataTable/filteredRows.ts:15–37` and remaining comparator logic.]

`RowsView` obtains `crossfilter.getFilteredRowIds()`, intersects them with provider data, and passes these rows into DataTable. Its `liveItems` subscription forces membership refresh when selection changes. Rows filters/search/columns use `rowsSettings` instead of a registered chart dimension; in read-only preview the local table edits stay in `previewSettings`. [`packages/explorEDA/src/components/RowsView.tsx:21–52`, supplemental.]

The body uses fixed row height and a virtual window with overscan, while the toolbar's CSV builder iterates all `filteredData`. It exports the configured visible columns, escapes CSV quotes, commas and line breaks, and renders null/undefined cells as blank. A viewport screenshot cannot prove export completeness; use a stable explicit `recordId` visible column in the fixture so the CSV can be joined back to expected identities. If that column is hidden, the current exporter need not include an internal ID automatically. [`packages/explorEDA/src/components/charts/DataTable/DataTableBody.tsx:65–74`; `DataTableToolbar.tsx:35,41–58,169–177`.]

| Consumer | Starting population | Additional own restriction | Consequence for the proof |
|---|---|---|---|
| Dashboard DataTable | `getLiveItems(settings)`, with own chart context handled by provider | Column filters and globalSearch | A linked column filter and a local search are different operations |
| Global Rows | `getFilteredRowIds()` with every active Crossfilter predicate | Rows-local column filters and search | Clearing Rows search can change Rows without changing charts |
| CSV for either table | Its complete `filteredData` | Visible columns affect representation | Compare all records, including those outside the virtual window |
| Column distribution profiles | Dashboard table omits its own filter context; Rows includes linked filters | Distribution-specific field handling | A distribution may show context outside the table's currently listed rows |

The distribution-scope distinction is explicit in `DataTable.tsx:66–73`. It is intentional context, not automatically a disagreement.

### Existing interactions to preserve

Column filters replace the current filter for that field. An empty checked-values list removes the filter; it means clear/all rather than an active empty set. Numeric inputs accept finite bounds, use `undefined` for open sides, and remove the filter when both sides are open. The range slider converts endpoint positions to open bounds using the same clearing convention. Missing values are represented with a value filter containing `null`; typed category equality helpers are used for checkbox membership. [`DataTable/components/ColumnFilter.tsx:94–147,211–226,304–308,465–476`; `DataTableHeader.tsx:174–205`.]

The cell context menu selects missing values via `[null]`, an actual number with `range min=max`, a date string with `date-range min=max`, and other scalar categories with a typed value list. These are existing affordances for precise single-value selection; a new lasso/tuple facility should not replace or redefine them. [`DataTableContextMenu.tsx:cellFilter:43–57`.]

The inspected table tests cover keyboard sorting and filters, width/ordering helpers, virtualization, context actions, and highlighted search text. They do not establish the proposed cross-consumer lasso agreement or persistence guarantees. Preserve keyboard focus, Escape cancel, existing clear keys, and the meaning of table-only search as part of the proof rather than inventing a new table subsystem. [All DataTable tests listed in the coverage ledger; `DataTable/README.md`.]

### Concrete static risk: hidden filtered column

**Observed in source:** a dashboard DataTable's registered filter function only applies a filter when the filtered field exists in `settings.columns`. `hideColumn` removes that column but does not remove filters. The local `getFilteredRows` still applies every `settings.filters` entry without this column-presence gate; provider `updateChart` performs a shallow settings merge. [`DataTable/definition.ts:54–79`; `columnOps.ts:32–36`; `DataTableContextMenu.tsx:309–311`; `filteredRows.ts:35–36`; `providers/DataLayerProvider.tsx:1048–1071`.]

**Inference, unexecuted:** filter a table column, then hide it. The table can remain restricted by the hidden field while siblings no longer receive that chart predicate. This matters to any row-equality proof: a mismatch can predate Mosaic-inspired work. The bounded proof should capture this sequence, choose an explicit product contract (retain the hidden filter everywhere with visible scope, or clear it atomically everywhere), and resolve it only if the target workflow depends on it. Do not hide the mismatch by comparing counts with a table in a different scope.

## 2. Save formats, validation, and lifecycle

### What is currently durable

`SavedDataStructure` includes charts, calculations, grid/metadata/colors, optional Rows settings, optional workspace filters, field settings, aggregates, geometry assets, and theme. Rows settings preserve filters/search as well as display order, sorting, and widths. Workspace filters are documented as one per field. `SavedAnalysis` is version 1 and adds raw source data. [`packages/explorEDA/src/types/SavedDataStructure.ts`, especially 41–42; `SavedDataTypes.ts`.]

`stringifySavedData` validates before serializing; parsing validates after JSON parse. Full-analysis serialization separately records undefined, NaN and positive/negative Infinity in raw cells with `[rowIndex,field]` keys; parsing restores those tagged special values. Plain settings/history JSON does not gain this cell-tagging behavior. [`utils/saveDataUtils.ts:31–43,46–127`.]

The `isFilter` validator accepts only `value`, `range`, `date-range`, and `text`. Numeric range bounds must be finite; date bounds must pass the date-text check; text has four named operators. A value datum may be undefined, null, string, boolean or finite number. Open range sides are omitted/undefined, not Infinity. `rowsSettings` and workspace filters use the same validator; workspace validation rejects repeated fields. Chart `filters` and `localFilters` are both validated. The migration function is currently a no-op. [`utils/saveDataUtils.ts:163–205,327–361,955–993,1114–1120`.]

**Implications:** new persisted rich predicates require an explicit backwards-compatible shape and validator/migration decision; adding a runtime predicate function is insufficient. Undefined in a persisted value-array becomes null through ordinary JSON, so distinguish typed identity from missing-value equivalence in the contract. Preserve valid open ranges as unbounded membership, not a concrete limit derived from today's dataset. A validator admitting `min > max` can represent no matches, but clearing an empty value UI selection currently means all; do not equate every syntactically empty structure with either case.

The inspected saveDataUtils tests assert special raw-cell roundtrip, null/date predicates, metric aggregates, formulas, theme/annotations, and average/time-summary behavior. They are relevant regression gates but were not executed here. [`packages/explorEDA/src/test/utils/saveDataUtils.test.ts`, complete.]

### Provider replacement and invalidation

| Action | Current source behavior | Required richer-selection decision |
|---|---|---|
| `setData` | Rebuilds effective data, field types, Crossfilter and calculation state; resets charts/defaults, filters, Rows, caches and other state | End old dataset-scoped row-ID predicates; re-evaluate compatible data-space geometry only under an explicit policy |
| Type/date/null-token reinterpretation | Rebuilds runtime data and Crossfilter; removes affected field filters from charts, workspace and Rows; resets applicable facet visibility | Traverse geometry/tuple/binding dependencies and invalidate together; do not retain stale coordinates |
| Display-only field settings | Updates display/nonce without rebuilding membership | Formatting must not change selected identities |
| `updateChart` | Shallow merge preserving chart ID; re-evaluates the chart dimension except known display-only changes | Publish one coherent committed predicate update; distinguish preview from commit |
| `removeChart` | Removes dimension and compacts layout | Dispose the source predicate and cancel pending preview/work; dependent reference policy must be visible |
| `clearFilter` | Clears chart `filters` only | Define how a new rich selection owned by that chart clears |
| `clearAllFilters` | Clears linked chart filters, DataTable search, workspace filters, Rows filters/search | Keep local population predicates distinct; include every new active selection source |
| Save structure | Serializes runtime settings and selected persistent state | Include definitions and stable references, not caches, callbacks, DOM objects or preview state |
| Restore structure | Reuses current raw data and restores through full-analysis pathway | Dataset compatibility must be checked before positional row selections are used |
| Restore full analysis | Rebuilds rows, calcs, aggregates, field caches, dimensions, workspace filters and settings | Check no interim consumer mixes new rows with old predicate caches |

Source ranges: `packages/explorEDA/src/providers/DataLayerProvider.tsx:682–749,770–864,1017–1071,1121–1146,1171–1173,1297–1300,1304–1478`. These were relevant excerpt reads; the selection-flow agent owns full provider analysis. One nuance to recheck is that the type-change map spreads each chart and clears its linked filters, leaving `localFilters` intact; a new invalidation policy should deliberately decide local data-space predicate behavior rather than depend on this incidental traversal.

### Demo saved views and undo/restore

This lifecycle is implemented by the demo host, not wholly by `SavedDataStructure`. **Supplemental source** `apps/demo/src/savedViewsSession.ts` defines two version-1 local-storage sessions, source/table data stored separately from view state, a 50-entry history limit, tabs with query bindings and selected row keys, and history entries with tabs plus optional project definitions. The read function checks the basic session shape and parses source analysis; it does not revalidate every nested setting itself. [`savedViewsSession.ts:12–56,58–103,120–185`.]

`SHARED_KEYS` are calculations, color scales, field settings, aggregates, and geometry assets. Filters are view-local. The host shares these definitions between tabs only within the same project query; a new ordinary view clears charts, workspace filters, and Rows filters/search. A duplicate view deep-clones its settings and preserves chart IDs inside a new view ID. This is strong evidence that a future globally indexed selection source cannot use chart ID alone across view instances. Prefer source identity scoped by its owning view/workspace, or remap explicitly when copying. [`savedViewsHistory.ts:16–22`; `SavedViewsWorkspace.tsx:157–187,597–631,768–809`.]

History compares JSON signatures. Linked chart filters, workspace predicates, and Rows filters/search count as Filter changes; localFilters and dashboard-table search sit in other chart settings and therefore count as View changes. The snapshot itself still contains those settings. `pushCheckpoint` skips identical changes unless forced, snapshots tabs/project, records a parent, appends to all history, truncates the current redo path when branching, and caps stored history at 50 while remapping indices. Abandoned branches remain in history until the cap removes them. [`savedViewsHistory.ts:27–130,137–190`.]

Deleting a view is checkpointed and selects a neighbor; duplicate, rename, move and apply-dashboard-text actions are checkpointed. Undo/redo restores snapshot tabs and project definitions and remounts the workspace. Restoring a checkpoint first preserves displaced unsaved tab changes if necessary, then creates a new checkpoint with `restoredFrom`. Preview is read-only and remounted; keyboard undo avoids editable targets and dialogs. [`SavedViewsWorkspace.tsx:597–685,813–870,928–1057`.]

The tables themselves are kept in the current session, separate from history entries. Undoing a project definition therefore does not constitute arbitrary source-data version rollback. For data replacement tests, assert the actual supported replacement policy rather than promising historical source bytes. [`savedViewsSession.ts:69–103`; `SavedViewsWorkspace.tsx:398–419,527–574,943–949,1310–1320`.]

Existing history tests describe filter/Rows/workspace changes, branches, 50-entry remapping, bundles, and checkpointing query definitions/bindings together. They do not prove the new selection/binding lifecycle. [`apps/demo/src/savedViewsHistory.test.ts:67–193,219–266,307–367`, supplemental; complete file inspected.]

## 3. Row identity and project compatibility

The regular provider creates `__ID` from array index and overwrites any incoming value. It is appropriate for runtime joins within one loaded dataset, not a durable cross-dataset entity key. [`packages/explorEDA/src/providers/lib/dataLayerState.ts:7–11`.]

The project types already distinguish source row references, logical result-row keys, sourceRows and contributor provenance. A project result may represent a join or aggregate, not a single raw source row. Count bindings should name the query result's row meaning; trace interfaces must preserve the distinction between member result rows and underlying source/measure contributors. [`packages/explorEDA/src/types/AnalysisProject.ts:143,153–174,207–219`.]

`ExplorEdaProject` maps current evaluation result keys to runtime positional IDs. On settings reporting it calls `encodeAnalysisRowKeys`; on rendering saved settings it calls `decodeAnalysisRowKeys`. A missing key decodes to an unresolved string prefix, preventing a different row that acquired its old numeric index from matching accidentally. The inspected projectIdentity test expects selection of the logical order `orders:string:O1` to survive input reordering and become empty when that order is removed. [`components/ExplorEdaProject.tsx:144–158,225–256`; `components/project/analysisRowKeys.ts:31–49`; `test/providers/projectIdentity.test.tsx:39–107`.]

However, `mapIdFilters` only visits `chart.filters` and `rowsSettings.filters`, only for `type: value, field: __ID`. It does not visit `workspaceFilters`, `chart.localFilters`, future selection clauses, or a separate future binding reference. Its unresolved-key enumeration has the same narrow traversal. This is a concrete extension boundary for richer selections and a reason to inventory all containers. It is not a reason to replace the existing identity model. [`components/project/analysisRowKeys.ts:6–28,52–63`, supplemental.]

`settingsFieldUsage` includes chart role fields, chart filters and localFilters, facets, Rows columns/filters, aggregates and calculated-field dependencies. `incompatibleSettingsFields` checks availability and malformed calculations. Workspace filter fields are not enumerated in that helper. Incompatible settings are held back from rendering and `onStateChange` is disabled, while `getSettings` returns the held settings. Rich geometry/tuple clauses need field-dependency enumeration so missing fields do not silently broaden or reinterpret the selection. [`components/project/settingsCompatibility.ts:36–69,76–155`; `components/ExplorEdaProject.tsx:195–199,258–280,403–407`, supplemental.]

**Proposed durable contract:** use effective-field predicates (including geometry in data coordinates) when the intent is to select values in a compatible dataset; use logical project result-row keys when the intent is to select particular evaluated records. Keep single-table positional row IDs dataset-revision scoped, never a named baseline's durable identity. On deletion/incompatibility, show an unavailable or unresolved state and preserve enough definition for Undo; never widen silently to all rows. Whether a compatible data refresh re-evaluates a geometry predicate or invalidates it must be one explicit, tested choice.

## 4. DSL preservation and loss

### Current representations

Chart `localFilters` export as `where.*`, linked chart filters as `select.*`, Rows filters as `where.*` on Rows, and workspace predicates as separate `filter` declarations. The compiler keeps workspace filters one per field and warns when a later one replaces an earlier one. These are separate semantics, not aliases for a general Boolean tree. [`packages/explorEDA/src/lib/dsl/export.ts:405–410,485–521`; `compile.ts:1395–1443`.]

`filterPairs` declines shorthand for repeated fields, empty value lists, undefined/blank-string values, unbounded both-sided ranges, or date-range/field-type mismatch. Charts and Rows can fall back to generic property differences: chart export compiles its skeleton and compares original settings with the result, then emits additional paths. Therefore it is inaccurate to say every filter that lacks shorthand is dropped. Workspace filters have a narrower export route: if no `filter` shorthand exists they are omitted and named in `omitted`. [`export.ts:50–94,458–462,485–505,512–521,554–575`.]

### Typed identity collision to prove

**Observed in source:** `buildFilter` collects existing field values in a `Map<string, datum>` keyed by `String(raw)`, keeping the first value for a display string. It then resolves literal items through that map. A numeric `1` and string `"1"`, or boolean true and string `"true"`, can collide; quoting alone does not provide an independent typed lookup here. [`compile.ts:1731–1746`.]

**Inference, unexecuted:** a mixed-type categorical workspace value filter can export/import with different row membership even if its text parses. Charts may recover their original types through the later generic difference fallback; workspace export lacks that fallback. Add exact membership fixtures for both routes, with row order reversed, and inspect `omitted`, `diagnostics` and skipped charts. Do not generalize a candidate workspace bug into an assertion that every DSL chart roundtrip loses types.

Chart handles are normalized: generated UUIDs become readable names/field-derived handles; already readable IDs are retained. A new binding or source clause that references chart IDs must participate in this remapping, or text export must reject/identify the unsupported reference. Existing tests deliberately ignore generated chart IDs in some equality helpers, so those tests do not prove referential integrity of new source-bound state. [`export.ts:194–235`; `export.test.ts:50–60`; `views.test.ts:128–138`.]

Invalid chart-level filters cause the chart to be skipped to avoid widening. Invalid Rows/workspace filter declarations can instead be diagnosed and omitted while the rest of the document remains available. Multi-view export applies the first view's shared definitions and reports views whose shared definitions differ; it is not a lossless project archive. The actual apply UI and diagnostics must be part of a proof before a partial rebuild is described as equivalent. [`compile.ts:1331–1339,1419–1421,2057–2089`; `views.ts:140–167`; `views.test.ts:141–147`.]

Composition already has its own measure fields: default population is `repeat` with `filters: follow`, and the grammar distinguishes population (`repeat`/`composition`) from filter policy (`follow`/`ignore`). It can drop undrawable parts with diagnostics, so “compiled” does not by itself establish full semantics. Preserve the existing distinction when discussing baselines or findings; it is not an implementation of arbitrary named populations. [`lib/dsl/composition.ts:416–424,799,947–949,2110–2221`; `docs/composition-mode.md:63–66`.]

**Recommendation:** prioritize faithful JSON save/restore and visible unsupported-text diagnostics for the first bounded selection slice. Add a small typed DSL syntax only if the shipped feature needs it. Any proposed syntax must have tests for semantics, types, source handles, scope, and empty-vs-cleared state. Never silently approximate a tuple union as independent axis value sets or a lasso as a bounding box just to fit existing syntax.

## 5. Daily findings and the first live binding

### Existing daily evaluator is independent

`DailyFinding` is an authored statement with `{value}`, an operation, fields, format, optional query, optional `where` conditions, and operation-specific `condition`. Conditions are `[field, operator, expected]` triples with six comparison operators. It supports count, numeric summaries, quantile, correlation, share, missing share, top share, ratio of sums and weighted mean. [`apps/demo/src/daily/findings.ts:6–40`.]

Its `numeric` helper accepts finite numbers and a strict numeric string pattern. Its `missing` helper checks null, undefined and the empty string. Numeric expected operands coerce the observed value; otherwise equality compares strings. Ordered nonnumeric conditions compare strings, with the comment that ISO dates compare as text. All conditions are ANDed. This is materially different from typed category keys and canonical datetime parsing. [`findings.ts:52–92`.]

The evaluator optionally exposes unambiguous bare aliases for prefixed query-result fields. `share` returns the count of condition matches divided by all scoped rows and reports denominator rows. Numeric summaries exclude invalid numeric values; correlation and weighted/ratio calculations use valid pairs. It throws when the resolved rows are empty or the resulting number is nonfinite, even for zero scoped rows in a count finding. Statement formatting substitutes the placeholder and returns data for the published finding. There is no interactive workspace subscription in this module. [`findings.ts:140–155,157–235`.]

The supplemental corpus tests compile each daily item against local data, require no dropped charts, check number formatting, evaluate every catalog finding, and compare prose that quotes a finding lead with the computed statement. This proves the authored-corpus intent of the test suite; it does not prove reactive agreement with chart selection. [`apps/demo/src/daily/corpus.test.ts:27–42,68–74,171–212`, supplemental, inspected not run.]

### Existing ordinary Markdown is static authored HTML

`MarkdownSettings` has `content: string`; its filter predicate is always true. The Tiptap editor starts from that content and persists `editor.getHTML()` via `updateChart` when the author edits. Slash blocks include headings, lists, quote, code and divider. No data binding appears in the inspected rendering/edit path. [`components/charts/Markdown/definition.ts:6–9,20–32`; `Markdown.tsx:54–80`; `blocks.ts:28–108`.]

### Bounded proposal

Ship one explicit selected-result-row count binding in an authored note or a small dedicated finding consumer. Its definition should store an operation (`count`), a scope (`current workspace selection`), a numeric display format, and a stable binding ID; render its value from the same full active selection population as the count card. Count zero should render `0`. It should not run arbitrary code or interpolate arbitrary field expressions. A later bounded numeric operation should reuse the existing metric aggregation semantics and separately report contributor count when invalid values are omitted.

Keep author content and binding definitions persistent; keep evaluated values, selected row-ID arrays, geometry caches, transient preview state, and timestamps of rendering out of authored content. Otherwise every brush frame can mutate note HTML and create history noise. A binding update should be driven by the same coherent selection revision as the metric/table; its displayed value must not derive from a separate `DailyFinding.where` evaluator. An inspect action should open evidence for exactly its scope and label any existing Rows-local search/filter that narrows the inspection. Do not silently reuse a previously narrowed Rows view as if it listed all binding contributors.

For asynchronous project evaluation, the consumer must share the currently applied evaluation and selection revision. During a new pending query, show either the last coherent applied result with a pending indicator or an unavailable state until ready; do not combine new bindings with old rows or old text with new metric values. The exact UI choice is a proposal; `ExplorEdaProject` already distinguishes pending/unavailable from ready, providing an existing lifecycle boundary. [`components/ExplorEdaProject.tsx:135–158,372–407`, supplemental.]

The first proof should select rows with scatter, see the count card and note agree, inspect the named records, export them, clear, undo, redo, save, restore, duplicate the view, and repeat after a compatible reorder. Leave named baselines, comparisons, percentages with selectable denominator, templating, generated prose and DSL expression authoring for a later demonstrated need. This follows the current narrative and baseline intent briefs, including the user's recorded low appetite for general named population management. [`docs/intent/data-bound-narrative/intent-brief.md`; `docs/intent/population-baselines/intent-brief.md:13–17,25–35,45–53`.]

## 6. Proof design for Codex

### Identity oracle and fixture construction

Use a checked-in deterministic JSON fixture with an explicit `recordId` column, two numeric scatter fields, two tuple-category fields, a mixed scalar category field, a numeric measure including zero/null/invalid cases, and canonical datetime/offset/boundary examples. JSON preserves the distinction between number `1` and string `"1"`; do not let a CSV parser or field inference erase that distinction before the typed test starts. Pin effective field settings and record both raw and interpreted fixture values. Every case should list expected record IDs, member count, numeric contributor IDs, and metric value separately.

The expected results must come from a small independent reference predicate, not the application's `applyFilter`, DataTable helper, scatter hit tester, trace helper, or SQL compiler. The reference may enumerate membership by hand for a dozen rows and use exact sets. Compare sorted stable identifiers, not positions or just total count: two different populations can have equal counts and equal sums.

### Minimum cases and outcomes

| Case | Exact proof requirement | Existing seam |
|---|---|---|
| A source is cleared | All rows subject to other scopes; no active source clause | Existing empty checked list clears; new active-empty must be distinct |
| Active selection with zero members | Count `0`, empty evidence/export, unavailable mean rather than throwing or widening | Daily finding empty behavior cannot be reused unchanged |
| Same-field independent sources | Per-source replacement does not erase the other source; consumers apply documented intersection | Existing workspace one-per-field cannot stand in for source identity |
| Exact selected tuple union | Only explicit pairs, never cross-product combinations | Persist correlated values together |
| Lasso and boundary | Inside/boundary/outside points follow one documented rule; invalid x/y excluded; pan/resize does not alter data-space membership | Reuse source geometry/trace path but independent oracle |
| Add/toggle/replace | Result sets match explicit action semantics; modifier/cancel behavior and keyboard alternative are exercised | No inference from a brush rectangle UI alone |
| Open numeric and date ranges | Membership stays open after save/restore and data extension; temporal boundary choice explicit | Avoid Infinity or current-domain maxima |
| Typed categories | `1`/`"1"`, true/`"true"`, missing variants retain the approved equality relation | Include JSON and DSL workspace roundtrip |
| Dashboard table search | Only table/CSV narrow; other consumers remain at workspace scope | Search is not linked predicate |
| Rows-local filter/search | Only Rows/Rows CSV narrow; scope remains visible | Supplemental RowsView confirms distinction |
| Hide a filtered table column | All relevant consumers follow the chosen retained-or-cleared policy | Resolve static inconsistency if target flow exposes it |
| Invalid numeric measure | Membership set includes selected rows; contributors exclude invalid values; zero remains valid | Compare member IDs and contributor IDs separately |
| Virtualized export | CSV contains the whole membership set despite few rendered rows | Toolbar receives full filteredData |
| Date/type/null-token change | Recompute/invalidate every dependent clause and binding atomically | Provider affected-field reset path |
| Formula edit/delete | New effective values invalidate affected coordinates and aggregates; absent dependencies visible | Existing provider calculations lifecycle, other agent audit |
| Source chart deletion | Its clause removed, subscriptions disposed, dependent binding explicit | Dimension removal exists; source registry would add obligations |
| Chart duplication | New chart source ID distinct; initial selection copy policy explicit | Provider addChart assigns UUID |
| View duplication | No cross-view source collision despite retained inner chart IDs | Host duplicates settings unchanged inside new view |
| Undo/redo and checkpoint restore | Matching IDs, count, text, trace, CSV after each committed revision | Host snapshot/remount mechanism |
| Project reorder/missing logical row | Same logical records survive reorder; missing record remains unresolved/empty, never retargeted | Existing analysisRowKeys adapter |
| Dataset replacement | Old positional selection cannot select unrelated same-index rows | Provider initializeData rewrites positional IDs |
| Unsupported DSL | `omitted`/diagnostics identify loss and proof fails equivalence | Existing partial compile/export intentionally supported |

These cases describe future verification work, not test executions. Keep the first implementation milestone small: one shared semantic representation, one scatter interaction, one count consumer, one evidence path, and one persisted binding. Expand only when the independent row-ID comparisons reveal a concrete failure.

### Interaction and product checks

At each completed gesture, compare: source-selection membership; count card; bound count text; evidence table; trace member/contributor sets as appropriate; exported IDs. During a gesture, ensure all consumers see one preview revision or one committed revision under the chosen contract. Count history callbacks and verify a canceled gesture leaves no saved step. Repeat after clear-all, chart clear, undo/redo, restore, field type change and data replacement.

Use the supported desktop layout and a narrow viewport resilience check requested by the assignment. The library README currently states desktop support at 1024 CSS pixels or more, with narrow/mobile outside its support contract. A narrow check should document clipping/focus/escape/export discoverability without silently promising a full new mobile editor. [`packages/explorEDA/README.md:277–280`.]

Keyboard checking should include reachability of the source chart and clear controls, a documented equivalent to the proposed pointer-only gesture, accessible selection summary, Escape cancellation, focus after settings popover closure and history remount, and a non-color-only selected/empty state. Respect the host's undo handling in editable note text so `Ctrl/Cmd+Z` edits the note when the editor owns focus. [`SavedViewsWorkspace.tsx:252–257,1020–1057`; table tests and README.]

Performance evidence should time the complete gesture-to-coherent-consumers path in a production build, with row count, chart count, renderer, data distribution, hardware/browser, cold/warm cache and timing method recorded. The old composition doc's local resolver timing is a narrowly scoped historical measurement, not a target for the new end-to-end flow. [`docs/composition-mode.md:116–121`.]

## 7. Intent and documentation decisions

| Intent/document | Source-grounded conclusion | Milestone implication |
|---|---|---|
| `precise-composite-selection/intent-brief.md` | User values exact tuples and lasso; current global-coordinate behavior accepted; open-ended ranges separate | Lasso is the next bounded proof; no general Boolean editor |
| `data-bound-narrative/intent-brief.md` | Static Markdown delivered; one selected count is next | Explicit binding, inspectable scope, no generated narrative engine |
| `population-baselines/intent-brief.md` | Low priority; all-row count exists; no durable positional IDs | Defer named management until concrete use, preserve population/filter distinction |
| `current-analysis-trust/intent-brief.md` | Select/read/inspect/export/undo/restore must remain one uninterrupted task | Use existing work as regression baseline; fix exposed seams only |
| `progressive-built-in-charts/intent-brief.md` and plan | Native charts and composition both have roles; delivery notes supersede old pending checklist | Preserve shipped heatmap; do not reopen as unrelated redesign |
| `docs/composition-mode.md` | Prior-head observations; repeated population and filter policy separate; display windows not filters | Use source baseline for claims; document any new selection semantics explicitly |
| `filters.mdx` | Local and workspace scope, clear one/all, search behavior already taught | Add exact selection and empty/clear language here with a live example |
| `heatmap.mdx` | Complete periods, exact dates, stable ends/sqrt, missing-vs-zero distinctions taught | Check regression against delivered heatmap examples |

The progressive plan's historical top sections include work that was subsequently completed. Its delivery section records #447–#450, including per-axis limits/order, date binning and exact date selections, fixed color endpoints/sqrt, dense label thinning and examples. It explicitly left Heatmap Notes, row totals, arbitrary color stops and a scrolling viewport out. Do not treat those omitted conveniences as requirements for Mosaic-inspired selection research. [`docs/intent/progressive-built-in-charts/implementation-plan.md:129–138`.]

### Proposed code/docs/demo map by milestone

**Milestone 0: write the contract and oracle.** Update the relevant intent brief after implementation review, preserve the source snapshot baseline, add fixture/expected-ID metadata and test plan. Relevant seams: FilterTypes, applyFilter, chart source ownership, provider dimensions, `SavedDataStructure`, validator, project adapter, DSL exporter. `docs/intent/current-analysis-trust/intent-brief.md` should record exactly which previously delivered behaviors were preserved and any confirmed failures; do not present this research audit as validation already run.

**Milestone 1: bounded scatter selection.** Target existing scatter gesture/selection path and consumers, plus filters docs and the precise-selection intent. Add a reachable example in `apps/demo/src/demos/examples.ts` backed by explicit settings in `dashboardSettings.ts` or a focused deterministic fixture module. Reuse the density dashboard arrangement as a starting point: it already combines scatter density, count card, histogram and evidence table; substitute a small transparent fixture for semantic proof before the 10k-row performance run. [`apps/demo/src/demos/dashboardSettings.ts:1227–1267`; `examples.ts:534–542`.]

**Milestone 2: durable lifecycle.** Extend validation, source identity traversal, field-dependency checks, clear/reset, view copy/delete, history descriptions, JSON save/restore and unsupported DSL behavior. Reuse `projectIdentity.test.tsx`, `saveDataUtils.test.ts`, history tests and DSL tests as hosts for targeted new cases in the full checkout. Add documentation of dataset replacement and unresolved selection behavior to the library README/API docs. Keep source/reference identity out of display label strings.

**Milestone 3: selected-count finding.** Add explicit typed binding settings to an appropriate note/finding component, reuse effective population and metric formatting, and update narrative docs/intent. Extend the reachable proof demo with the finding and its inspection action. Daily findings remain their authored corpus workflow unless a separate reviewed adapter is justified. Do not change published statements merely to make them match the new live component.

**Milestone 4: production validation.** Run the row-ID oracle, complete lifecycle flow, keyboard/focus and viewport checks, then bounded performance investigation. Reuse delivered heatmap examples (`message-heatmap`, `measles-heatmap`, election heatmap entries) as regressions, not as redesign targets. Their source settings show month bins/80 columns for messages, 51 by 85 measles extent with average and fixed 0–1000 sqrt scale, and election average margin with fixed −40/+40 ends. [`apps/demo/src/demos/examples.ts:1375–1408`; `dashboardSettings.ts:7027–7092`; `apps/demo/src/docs/pages/heatmap.mdx`.]

`docs/agent-guide.md:28` names live docs examples at `apps/demo/src/docs/live/examples.ts`; that file was not in the selected packet and was not fetched in this audit because its implementation is not needed to establish selection semantics. Codex should update that existing registration when making the eventual filters/selection docs interactive. A source file proposed for modification here is not evidence that a corresponding implementation was created.

## 8. Limits and handoff

This audit did not execute application or browser checks, resolve all peripheral imports, read all 2,900 lines of the DSL compiler, or read all 2,291 lines of composition DSL. It read their relevant semantics and records exact coverage. Supplemental exact-ref fetches closed Rows, history, logical identity and daily-test gaps. External paper/official Mosaic implementation evidence is owned by the parent report; no claim in this file substitutes repository inference for paper evidence.

The highest-value checks for Codex are the hidden-column table discrepancy, typed workspace DSL roundtrip, exact project identity traversal, and one selected-count consumer using coherent workspace membership. They are specific, bounded places where an otherwise attractive architectural recommendation could fail the user's select→read→inspect→export→restore workflow.
