# Build explicit, exact empty-selection recovery

**Recommended build:** add **Recover rows**, an on-demand preview that answers: “Which existing restriction can be removed to return records to this particular view, and exactly which records would return?” Start with single restriction removals. Add a bounded search of pairs when a single removal does not help. Keep the investigation unchanged until **Apply**. Preserve an intentional empty result.

**Repository:** explorEDA. **Source baseline:** `d3920a285f3755a8324998775deb131747e959f5`. **Research date:** November 1, 2026. **Mode:** Design; no repository implementation, commits, pushes, or pull requests.

The deliverable is a new analytical capability: comparable counterfactual populations, exact record evidence, and a deliberate way to adopt one alternative. It is larger than an empty-state wording change and smaller than a query optimizer or provenance platform. Build it in the existing React/TypeScript library and demo, with pnpm and existing saved settings.

## 1. Decision and delivery boundaries

The complete recommended capability has five independently useful releases:

1. **Workspace recovery:** exact single-removal previews, records, explicit Apply, saved settings, and an ordinary demo history checkpoint.
2. **Rows and table recovery:** distinguish local searches and Rows filters from linked filters; include hidden and calculated fields in real table-search semantics.
3. **Chart recovery:** target self-excluded chart context or selected records explicitly; support chart-local restrictions, histogram specification selections, and separate setup/plotting diagnostics.
4. **Joint recovery:** evaluate all pairs among at most 12 explicitly selected restrictions, at most 66 variants per request. Retain a temporary “Keep” choice and disclose coverage.
5. **Notebook and folder completion:** recover notebook-local selections without changing other charts; preflight supported authored local-filter edits; use the actual settings/text/file persistence boundaries.

The [implementation plan](empty-selection-implementation-plan.md) gives files, focused tests, documentation, runnable examples, risks, and concrete flows at 1280, 783, and 390px for each release. The [recommendation register](empty-selection-recommendations.md) assigns stable `ESR-###` IDs with Build, Explore, Defer, or Avoid dispositions. The [fixture guide](empty-selection-fixtures.md), [fixture JSON](empty-selection-fixtures.json), and [standalone verifier](verify-empty-selection-fixtures.mjs) make exact membership claims inspectable.

### Essential product decisions

- **One named population per preview.** The scope appears beside every result count. Workspace, chart context, chart selection, Rows, and a particular table are different questions.
- **One stored filter occurrence is the default unit.** This matches the existing status bar’s removal behavior. A range is a whole interval; a value filter is its complete selected-value set; a specification selection is its region predicate. Same-field owners and sibling predicates remain distinct.
- **Evaluate the real owner function.** Clone the affected settings and invoke the registered chart definition. A chart’s stored filters cannot universally be flattened into independent conjunctions.
- **Preview is read-only.** No live Crossfilter filter calls, savedData restore, chart creation, layout change, notebook writeback, or history entry.
- **Apply is one command.** Revalidate the snapshot, remove only the reviewed occurrences, and publish one application state change. Coalescing callbacks alone is insufficient.
- **No inferred preference for a larger result.** Show exact counts and impacts; keep a stable, transparent ordering. An analyst chooses which condition matters less.
- **No automatic repair of zero.** Recovery is an optional action. Closing it or choosing Keep empty result changes no analytical settings.
- **No global solver.** Pair search is deliberately bounded; three-condition conflicts, upstream SQL/joins, and inferred range widening remain outside automatic recovery.

### Evidence vocabulary

**Current** means read from the pinned repository source. **Checked** means the supplied standalone companion was actually executed. **Proposed** means a design, implementation task, or future acceptance test. External product mechanisms are supported by primary documentation or papers, not by an interactive audit of those products.

The 37 complete files in the attached packet were read before external research. Additional decisive files were retrieved from GitHub at the same exact commit, including the table’s resolved-row path, the bar predicate, notebook writeback, and host persistence. No required source remains inaccessible. The complete read inventory and verification limits are at the end.

## 2. What the existing code makes possible

The following are the source facts needed to design recovery. They are not a repeat of the prior filter-ownership audit.

| Current boundary | Decisive code | Consequence for recovery |
| --- | --- | --- |
| Each chart owns a Crossfilter dimension; its predicate comes from its definition | `hooks/CrossfilterWrapper.ts::addChart`, `getFilterFunction`, `updateChartFilters` | Keep chart ownership when changing one stored predicate. |
| Workspace membership passes every linked chart dimension and workspace field dimension | `CrossfilterWrapper.ts::getFilteredRowIds`, `getFilteredRowCount`, `setWorkspaceFilters` | This is the bottom status count’s population. |
| A chart group excludes its own entire dimension, then applies chart-local filters | `CrossfilterWrapper.ts::getAllData`; `lib/chartPopulation.ts::getPopulationTest` | A group count does not predict removal of only one sibling predicate. |
| Existing chips remove a particular chart filter index | `components/ActiveFilterStatus.tsx::getActiveFilters`, per-chip `onRemove`; corresponding test “removes one filter without clearing siblings” | Preview the same small action instead of silently clearing its owner. |
| Rows starts with workspace IDs and has independent settings | `components/RowsView.tsx::RowsView`; `DataTable/filteredRows.ts::getFilteredRows` | A Rows search can be empty while the workspace has records. |
| Data-table field filters are linked; its text search is local | `DataTable/definition.ts::getFilterFunction`; `filteredRows.ts::getFilteredRows` | Do not offer clearing a local search as a workspace recovery. |
| Table rows contain calculated values before searching | `DataTable/DataTable.tsx::resolvedRows` | Search all resolved row fields, including hidden columns and calculations. |
| Effective columns include current field conversions and calculations | `providers/DataLayerProvider.tsx::getColumnData`, `updateFieldSettings`, `refreshCalculations` | Use the mounted workspace’s field getter, never a new interpretation of raw rows. |
| Holds delay host callbacks but store updates still occur | `DataLayerProvider.tsx::holdStateChanges`, subscription in `DataLayerProvider` | An open held edit blocks Apply and invalidates an earlier preview. |
| Notebook chart selections do not narrow other charts | `ExplorEdaNotebook.tsx` provider `localSelections`; `CrossfilterWrapper.ts::updateChartFilters` | Notebook selected records require their own target. |
| Demo history is host-owned | `apps/demo/src/SavedViewsWorkspace.tsx::capture`; `savedViewsHistory.ts::pushCheckpoint` | Preserve ordinary Undo/Redo; do not install a second universal history system. |

Paths without a repository prefix in this table are under `packages/explorEDA/src/`. The supplemental files and pinned URLs are listed in §15.

Two details substantially change the design:

- **Bar predicates have mode-specific meaning.** At this baseline, a simple bar considers filters on its own field; a series bar combines its stored predicates; a grouped bar uses value predicates and the last numeric/date range. Removing that last range can expose an older range and exchange records instead of only adding them. This is current code in `components/charts/BarChart/definition.ts::getFilterFunction`, not a proposed semantic change.
- **Display activity is not predicate activity.** `ActiveFilterStatus.tsx::isActiveFilter` hides `values: []`, boundless ranges, and empty text filter values. The predicate layer can still restrict those states: an empty value set matches nothing, an unbounded range still requires numeric values, and an empty contains-text test still requires a string. Build the recovery inventory from stored predicates and effective evaluation after editing settles, not from visible chips alone. (`hooks/applyFilter.ts::applyFilter`.)

These facts justify an evaluator that uses the real definition and a restriction inventory that is more precise than the status bar’s display list. They do not require a broad cleanup of existing filtering before this feature can ship.

## 3. Primary-source approaches and the chosen model

The sources inform specific decisions; none is a dependency to adopt.

| Approach | What the primary source establishes | Choice for explorEDA |
| --- | --- | --- |
| Crossfilter’s contextual groups | The maintainer explains that a group ignores its associated dimension’s filter; the project also documents an `allFiltered` option that ignores selected dimensions. [E01](https://github.com/square/crossfilter/issues/161), [E02](https://github.com/crossfilter/crossfilter/releases) | Preserve contextual charts. Use exact candidate compilation for one occurrence inside an owner. |
| Mosaic’s client-specific selections | Selection strategies include intersection, union, and latest-clause resolution; crossfilter omits clauses for the associated client. `remove(source)` returns a cloned selection. Empty-selection meaning is configurable. [E03](https://idl.uw.edu/mosaic/api/core/selection.html) | Make the target and owner explicit. Adopt detached evaluation as a design pattern without introducing Mosaic’s coordinator or SQL layer. |
| Qlik’s associative alternatives | Its documented states distinguish selected intent from whether a value remains possible, including selected-excluded values. [E04](https://help.qlik.com/en-US/sense/May2026/Subsystems/Hub/Content/Sense_Hub/Selections/associative-selection-model.htm) | Keep conflicting conditions visible. Annotate alternatives with exact recovery counts; do not erase impossible selections automatically. |
| Qlik’s chronological navigation | Selection history offers backward/forward navigation separately from clearing selections. [E05](https://help.qlik.com/en-US/sense/May2026/Subsystems/Hub/Content/Sense_Hub/Selections/SelectionsToolbar/step-back-forward-selections.htm) | Retain Undo as navigation. It answers a different question from relaxing a particular current restriction. |
| Tableau’s relevant-value controls | Filter lists can consider other filters, all database values, or context; hiding a filter card does not remove its condition. [E06](https://help.tableau.com/current/pro/desktop/en-us/filtering.htm) | Keep existing distributions for prevention. Recovery must identify all actual influences, including controls that are not currently visible. |
| Tableau’s refresh-cost guidance | Relevant-value lists issue another query when other filters change. Its checklist also describes explicit Apply for multiple selections. [E07](https://help.tableau.com/current/pro/desktop/en-us/perf_checklist.htm) | Compute candidate populations on request rather than after every chart movement. This is qualitative support, not an explorEDA performance estimate. |
| Power BI’s scoped filters and reset | The documented filter pane distinguishes all-page, page, and visual scopes; clearing one filter differs from reset to authored defaults. [E08](https://learn.microsoft.com/en-us/power-bi/explore-reports/end-user-report-filter) | Name scope and preserve unrelated analysis settings. Keep a full reset outside the recommended recovery path. |
| Power BI’s blank-measure handling | A visual can omit groups with blank measures; showing items with no data has specific limitations and does not override every measure filter. [E09](https://learn.microsoft.com/power-bi/create-reports/desktop-show-items-no-data) | Distinguish no records from records that cannot produce marks. |
| Elasticsearch’s post-filtered hits | A `post_filter` narrows returned hits after aggregation, allowing the aggregation to describe a broader population. [E10](https://www.elastic.co/docs/reference/elasticsearch/rest-apis/filter-search-results) | Contextual distributions and final records may legitimately differ. The recovery result must name which one it measures. |
| Missing-answer provenance | Chapman and Jagadish identify query/workflow operations that excluded an expected item. This explains absence, rather than choosing the analyst’s preferred new query. [E11](https://dbgroup.eecs.umich.edu/files/ChapmanSIGMOD09.pdf) | Show concrete record evidence. Defer a full “why not this tuple?” workflow debugger. |
| Relaxation lattices | Koudas and colleagues formalize selection/join relaxation and describe an exponentially growing space of alternatives. [E12](https://www.vldb.org/conf/2006/p199-koudas.pdf) | Bound automatic search. Do not invent a cross-field distance metric or relax joins. |
| Interactive empty-answer relaxation | Mottin and colleagues propose small interactive condition removals, distinguish conditions users refuse to relax, and optimize application-dependent objectives. [E13](https://www.vldb.org/pvldb/vol6/p1762-mottin.pdf) | Let users temporarily keep restrictions. Use transparent enumeration and explicit choice instead of inferred utility or a probabilistic optimizer. |

### Single removal, Undo, and pairs

**Choose single-removal previews as the main entry.** They preserve the most state, can explain an exact change in one sentence, and fit the current per-filter controls. Each candidate says what would be removed, where it applies, how many target records return, and which records those are.

**Keep chronological Undo beside recovery, not inside its ranking.** The latest action might be a title edit, a data refresh, or the second half of a useful investigation. Returning to an earlier checkpoint can also undo unrelated changes. A counterfactual should not label the newest restriction as the cause, particularly because restrictions imported from JSON have no reliable action chronology.

**Build bounded pairs as a second stage.** Two independent conflicts can make every single-removal gain zero. Exact pairs solve a real class of dead ends without a generalized solver. Failure within this search means only that no tested single or pair restored this target under the kept restrictions.

**Reject automatic clearing and automatic range widening.** Clearing everything discards useful scope; range widening needs a meaningful notion of distance and can change inclusive/exclusive semantics. The current control remains available when the user wants to edit a bound, but the recovery engine’s first contract is removal of existing units.

## 4. The population being recovered

Let `U` be the current provider’s row IDs after its field conversions and current calculations are available. For a folder project this is the current query-result table, not every upstream source table. Let `W` be the conjunction of workspace field filters; `S_c` a chart’s complete registered selection predicate; `L_c` its chart-local population predicate; `R` Rows field filters; and `Q_r`/`Q_t` the actual Rows/table search tests.

These are sets of original provider records. They are not bars, grouped summary rows, facets, pixels, or valid numerical contributors.

| Named target | Dashboard membership | Notebook membership |
| --- | --- | --- |
| Workspace | `U ∩ W ∩ ⋂ S_c` | `U ∩ W` |
| Chart c context | `U ∩ W ∩ ⋂(d ≠ c) S_d ∩ L_c` | `U ∩ W ∩ L_c` |
| Chart c selected records | `context_c ∩ S_c` | `context_c ∩ S_c` |
| Rows visible records | `workspace ∩ R ∩ Q_r` | Same formula if a Rows surface is present; no new notebook Rows UI is promised |
| Data table t visible records | `context_t ∩ S_t ∩ Q_t` | `context_t ∩ S_t ∩ Q_t` |
| Chart-bound selected finding f | Not a dashboard recovery surface in this build | `context_c ∩ S_c ∩ F_f` |
| Chart-bound eligible finding f | Not a dashboard recovery surface in this build | `context_c ∩ F_f` |
| Finding f without a chart | Not a dashboard recovery surface in this build | `U ∩ F_f`, deliberately ignoring W and chart selections |

`F_f` means the finding’s own conditions. The formulas for findings follow `lib/notebook/findings.ts::evaluateFinding` and `components/notebook/NotebookFindings.tsx::useFindingResults`. An eligible finding excludes the chart selection from its inputs. Its recovery list must not pretend that clearing that unused selection would help.

### Scope rules with direct UI consequences

- A chart can retain two context records while the workspace has zero selected records. Do not overlay “No rows” over that chart simply because the bottom status count is zero.
- A table search is local even though that table’s column filters can be linked. The label must say “Orders table search” rather than “Workspace search.”
- `localFilters` restrict only their chart. Clearing the workspace’s ordinary filters does not clear those authored populations; `DataLayerProvider.tsx::clearAllFilters` leaves `localFilters` intact.
- A chart’s own selection is not an influence on its self-excluded context. It can be shown under “Not used by this scope,” but it is not a restoration candidate for that target.
- A chart context is still a source-record population. A candidate returning two context records does not assert that two points, bars, or regions will appear.
- An individual facet is a further scope. The first implementation recovers the whole chart context/selection and labels that fact; it does not infer a facet-specific recovery from a blank facet cell.
- Workspace field-editor distributions self-exclude that field’s workspace dimension. They are helpful for editing, but they are not the workspace candidate result.

The algebra is a formalization of the current contracts in `CrossfilterWrapper`, `chartPopulation`, `RowsView`, `getFilteredRows`, and `evaluateFinding`. The named targets, UI entry points, and evaluator are proposed.

## 5. Exactly what can be removed

| Restriction location | Removable unit | What must remain |
| --- | --- | --- |
| Workspace filter | The field’s one workspace filter | Every chart owner on the same field; all other fields |
| `chart.filters[i]` | That occurrence in that chart’s captured filter array | Sibling occurrences, `localFilters`, histogram limits, axes, fields, layout |
| `chart.localFilters[i]` | That chart-local occurrence | The owner’s linked selection and every other chart |
| `rowsSettings.filters[i]` | That Rows-local occurrence | Rows search, other Rows filters, all linked filters |
| Rows search | The complete literal `rowsSettings.globalSearch` string | Every field filter and sort/column setting |
| Table search | The complete literal `chart.globalSearch` string | That table’s linked filters and all other searches |
| Notebook local selection | One occurrence in that chart’s runtime `filters` | Other notebook selections and source text |

### Preserve atomic meaning inside a filter

- **Value filter:** selected values are alternatives inside one set. Removing one selected value would normally narrow that set, so that is not a recovery operation. Remove the entire value-filter occurrence. Preserve typed values: numeric `0`, text `"0"`, Boolean `false`, and text `"false"` are different categories.
- **Numeric/date range:** both ends form one interval. Numeric ranges also retain their independent exclusive flags; date ranges have inclusive bounds and no exclusive flags in the current type. Remove the interval as a whole. “Edit range” opens the existing control and leaves the recovery session; inferred endpoint expansion is deferred.
- **Specification status:** the region predicate is one unit. Removing it leaves `histogram.spec`, authored bins, and any numeric selection intact. The same status label on another owner may use different limits.
- **Two-axis brush:** X and Y are two stored occurrences. A candidate may remove X while retaining Y. If both are reviewed together, show “Remove 2 restrictions,” list both, and evaluate the combined change. Do not call it one restriction because one gesture created it.
- **Repeated same-field predicates:** use the chart ID, array (`filters` versus `localFilters`), and snapshot index. Field name alone cannot identify the change.

These transient occurrence addresses need no saved IDs or migration. They are valid only for one snapshot. A filter fingerprint must preserve undefined and nonfinite values; ordinary JSON stringification is not a sufficient value-preserving clone or identity function.

### Special inventory cases

1. Inventory every stored unit in the target’s semantic influences once `stateChangeHolds` is zero. Include contradictory empty selections even if no normal chip is visible.
2. Separate **stored but currently ineffective** occurrences from **zero-gain** occurrences. A zero-gain condition can participate in a useful pair. A simple bar’s off-field filter can be entirely ignored by its definition. Neither should be described as a proven cause.
3. A workspace array containing duplicate field entries violates the editor’s one-field/one-filter model. The wrapper currently resolves them with last-wins Map semantics, while removing a field clears all matching entries. For v1, explain that the workspace filter needs review and block removal of that ambiguous field in recovery; do not silently normalize imported settings. Other independent, fully modeled candidates may remain available only if their complete target can still be evaluated exactly.
4. Missing referenced fields use the existing getter’s undefined values. A numeric restriction then fails; a missing-bucket predicate can match. Reproduce that behavior and label the unavailable field; never infer that every absent-field condition is false. ESR-F22 makes this distinction exact.
5. Unsupported or throwing chart predicates that influence the target block exact evaluation. Do not omit them, assume true, or publish a partial count as exact. Opening the owner’s settings remains possible.

## 6. The user flow

### Entry and comparison

For an empty workspace with source rows, add **Recover rows** beside the bottom count. A Rows/table empty result exposes the same action beside that surface’s own count and names its local scope. For a chart, an entry is attached to its header/status only when a typed population diagnosis supports it. A notebook selected-count/finding entry says **Recover selection** when eligible context remains.

Opening the panel first shows the target, current count, and existing restrictions. It does not immediately replace the workspace or mark a winner. It computes single-removal counts against a captured state. Positive alternatives appear before zero-gain results; within those groups, target-local changes precede workspace-wide changes, followed by stable owner/occurrence order. A user can sort by count, but count magnitude is not treated as preference evidence.

Each alternative has:

- An owner-qualified removal label, including the exact inclusive/exclusive interval when relevant.
- The resulting **target** count, not only the number added.
- An impact statement, such as “Rows only,” “This chart’s population,” or “Linked views.”
- A Preview action; selecting it opens the returned-record pane without applying it.
- A Keep toggle that excludes this unit from automatic proposals for this session. It does not change the actual filter or save a permanent lock.

The detail pane shows the removed restriction(s), the restrictions still in force, the exact total, and the records. It shows up to 100 records initially with “First 100 of N shown”; pagination can read the remaining captured membership. The total is computed over the whole source, never estimated from the displayed prefix. Keep source row order by default; presentation sorting must not alter the count or membership. Display a user record key when one exists, plus the source-row reference; do not treat internal `__ID` as a stable identifier across refreshes.

### Explicit action and return

**Apply** removes only the reviewed occurrences after a final freshness/editability check. The existing workspace and local counts then update through the ordinary store. The panel confirms the actual new target count and returns focus to the initiating surface. A selected alternative that is stale, unsupported, still computing, or a non-monotone replacement has no enabled Apply action.

**Back** returns from records to alternatives. **Close** and **Keep empty result** return to the investigation without mutation. No hover, focus, candidate selection, record sorting, or opening another detail may apply a filter change.

The demo’s normal Undo moves back one history step, and Redo reapplies it. Embedded and folder workspaces can additionally show **Restore removed restrictions** using a short-lived inverse receipt. That is an ordinary new edit, not history navigation; if the demo user uses it, it creates another checkpoint. Expire the receipt on the next unrelated saved edit, data replacement, restore, or source-text revision. Never restore a whole old snapshot over later work.

### Exact four-record walkthrough

ESR-F01 has A=(West, Web), B=(West, Store), C=(East, Web), and D=(East, Store). Workspace Region=West conflicts with chart `east` selecting Region=East.

| User action | Workspace result | State consequence |
| --- | --- | --- |
| Open recovery | `[]`, 0 of 4 | No change; chart east’s context is already A,B |
| Preview removing chart East | Proposed A,B, count 2 | Workspace still `[]`; Workspace West remains |
| Back, then preview removing Workspace West | Proposed C,D, count 2 | Workspace still `[]`; chart East remains |
| Apply removing chart East | Actual A,B, count 2 | Only that chart occurrence is removed |
| Demo Undo | `[]`, count 0 | The occurrence returns; other settings stay |
| Demo Redo | A,B, count 2 | The same removal returns |

The proposed light-mode mockups show this fixture at [1280px](recovery-preview-1280.svg), [783px](recovery-preview-783.svg), and [390px](recovery-preview-390.svg). They are design illustrations, not screenshots of a running implementation.

### Responsive and accessible behavior

- At **1280px**, use a bounded, nonmodal panel beside visible charts. Alternative list and record detail can sit side by side. Keep scope and actions visible while records scroll.
- At **783px**, use a viewport-bounded overlay with one active detail pane and Back navigation. The underlying saved layout is not resized or rewritten.
- At **390px**, use a single-column sheet with a fixed action region. Owner and restriction labels wrap; the records area may scroll horizontally internally. Apply, Back, and Close remain reachable without horizontal page scrolling.
- Apply works at all three widths when the host permits edits. This deliberately verifies the new recovery surface; it does not expand the README’s desktop support promise to every chart or existing editor. The existing narrow grid flow/drag policy remains as it is.
- The real `readOnly` state, not viewport width, prevents mutation. `PlotManager.tsx` uses that prop to make editing regions inert. A host history preview must never acquire an Apply path through the new panel.
- Use the shared Button, ActionTooltip, popover/sheet conventions, semantic border/input/focus tokens, and visible action names. Do not add native `title` attributes. Keep focus return stable if the initiating chip disappears after Apply.
- Announce completed counts and stale status politely. Do not stream an announcement for every processed row. Preserve keyboard selection as alternatives finish computing.

## 7. Exact record examples that determine the design

The companion is the complete data-and-expectation contract. The examples below explain the design decisions behind it.

### Joint conflicts where every single removal fails

ESR-F10 uses the same four A–D records with four separate restrictions: Region West, Region East, Channel Web, and Channel Store. The result and all four single-removal results are empty.

| Removed pair | Retained conditions | Exact result |
| --- | --- | --- |
| West and Web | East and Store | D, count 1 |
| West and Store | East and Web | C, count 1 |
| East and Web | West and Store | B, count 1 |
| East and Store | West and Web | A, count 1 |
| Both Region restrictions | Web and Store | Empty |
| Both Channel restrictions | West and East | Empty |

This proves why single-removal counts alone are incomplete. ESR-F21 goes further: one source record with three conflicting restrictions remains excluded after every single and every pair; only a triple returns it. That triple is a fixture oracle case, not a promise of automatic triple search.

### Date limits and missing values

ESR-F03’s January 1 UTC window includes D1 at midnight, D2 at `23:59:59.999Z`, and D4 at `2026-01-02T00:30:00+02:00`, which lies on January 1 UTC. Removing a conflicting outside-day selection returns exactly D1,D2,D4; removing the date filter instead returns D0,D3. The invalid date and missing date remain distinct source records. The verifier also checks that an explicit midnight timestamp max does not extend to day end. (`applyFilter`, `dateBound`, `timestampOf`.)

ESR-F04’s missing selection returns M0=null, M1=undefined, M2=empty text, and M3=whitespace. Numeric zero, text zero, false, text false, the literal label `(missing)`, NaN, and infinities remain distinct. Removing the missing condition while keeping a nonnegative finite range returns M4, M5, and M12 (negative zero), exactly three rows. Never use truthiness or a display label to implement category membership.

### Two predicates owned by one histogram

ESR-F27’s histogram owns a numeric range [10,20] and an outside-spec selection, with inclusive specification limits 10 and20. It is currently empty.

| Candidate | Exact IDs | Count |
| --- | --- | ---: |
| Remove range; retain outside-spec | S0=9, S3=21 | 2 |
| Remove outside-spec; retain range | S1=10, S2=20 | 2 |
| Explicitly remove both predicates | S0,S1,S2,S3,S4=null,S5=bad | 6 |

The owner’s context already contains all six records. Using that context count as either single-removal answer would be wrong. All three changes preserve specification limits and bin settings. ESR-F11 separately tests specification limits changing after a preview, which must invalidate it.

### Local recovery preserves the rest of the investigation

- **Rows search:** ESR-F06 has workspace R1,R2 but an unmatched Rows query. Clearing that search returns R1,R2 to Rows; the workspace remains R1,R2. Removing the workspace filter while keeping the query still returns no Rows records.
- **Chart population:** ESR-F09 has workspace L3 and a chart restricted to Web rows. Removing that chart-local restriction returns L3 to the chart and changes no workspace membership. Removing the workspace restriction instead returns L1 to that chart and widens linked views.
- **Table scope:** ESR-F24 has a table’s West filter linked with another chart’s Web filter. The workspace is A, its table context is A,C, and its nonempty local search `Store` returns no rows. Removing the search returns A; removing the other chart’s Web restriction returns B to that searched table. A broad workspace count cannot substitute for the local result.

### Notebook selection and findings

ESR-F26 has six records. Workspace West contains n1,n2,n5. Chart A’s local Web population is n1,n5, but its East selection matches none. Chart B selects Store and contains n2.

- Removing A’s selection returns **n1,n5**, with count **2** and mean score **10** because n5’s score is missing. B remains n2.
- A’s eligible finding remains **2**, because it does not use that selection.
- A finding without a chart remains **6**, because its documented scope ignores workspace and chart filters.
- Removing Workspace West would instead give A **n3,n6**, mean **40**, and change B to n2,n4. That is a different, notebook-wide proposal; the first notebook milestone only explains this authored workspace alternative and routes to source editing.
- Count zero is a valid finding. A numeric finding with zero rows is `empty`; one with n5 but no valid numeric score is `invalid`. Neither is silently replaced by a recovered statistic.

## 8. Read-only counterfactual evaluator

### Use current values and actual predicates

The evaluator receives a captured source-ID sequence, effective column maps, immutable settings references/copies, the named target, and the current registered chart definitions. It does not consume a serialized raw-data export or re-run a second formula language. Capture must use `getColumnData`, whose intrinsic cache warming is permitted; it must not call setters, rebuild the provider, or change live filters.

Compile baseline chart predicates through `getChartDefinition(chart.type).getFilterFunction(chart, snapshotGetter)`. For a candidate, make a new chart object with only the selected occurrences removed and compile that full object again. Use `getPopulationTest` for `localFilters`, preserving owner specification limits. Use `applyFilter` for workspace and Rows conditions. Reuse/extract the actual resolved-row and search routines for table targets, so hidden/calculated fields and literal whitespace behave identically.

Column maps must belong to the captured data/calculation epoch. Capture required fields once before a scan, including fields in masked stored predicates that a removal may expose. Retain immutable column maps rather than copying every source field by default. A compiled function that requests an uncaptured field during scanning is unsupported for that snapshot; fail or restart capture before producing any result. Never fall through to a getter that reads a newer live state halfway through a chunked scan.

Clone filter values with a type-aware copy. Preserve undefined, NaN, infinities, and negative zero. Do not deep-clone arbitrary runtime chart objects with JSON: the existing 3D runtime conversion includes methods, and JSON also changes special numeric values. Keep unaffected immutable settings objects and copy the small predicate-bearing portions; the revision guard prevents using them across edits.

### A straightforward evaluator shape

The following is proposed internal structure, not an exported API or production patch:

```ts
type RecoveryTarget =
  | { kind: "workspace" }
  | { kind: "rows" }
  | { kind: "table"; chartId: string }
  | { kind: "chart-context"; chartId: string }
  | { kind: "chart-selection"; chartId: string }
  | { kind: "notebook-finding"; findingId: string };

type RestrictionRef =
  | { kind: "workspace-filter"; field: string }
  | { kind: "chart-filter"; chartId: string; index: number }
  | { kind: "chart-local-filter"; chartId: string; index: number }
  | { kind: "rows-filter"; index: number }
  | { kind: "rows-search" }
  | { kind: "table-search"; chartId: string };

type PreviewResult = {
  snapshotId: string;
  target: RecoveryTarget;
  remove: readonly RestrictionRef[];
  beforeCount: number;
  afterCount: number;
  returnedIds: readonly number[]; // Exact IDs in this data epoch only.
  addedIds: readonly number[];
  removedIds: readonly number[];
  relaxationOnCurrentData: boolean;
  application: "settings" | "session" | "notebook-text" | "explain-only";
};

// Conceptual orchestration. Helpers are ordinary target-specific branches.
function evaluateRemoval(snapshot: Snapshot, refs: RestrictionRef[]): Result {
  if (!snapshot.ready) return { status: "blocked", reason: snapshot.reason };
  const next = removeReviewedOccurrences(snapshot.settings, refs);
  const nextPredicates = compileChangedOwners(snapshot, next, refs);
  if (!nextPredicates.ok) return nextPredicates;
  const exact = evaluateTarget(snapshot, next, nextPredicates.value);
  return {
    status: "complete",
    ...exact,
    relaxationOnCurrentData: ownerMasksOnlyExpand(snapshot, nextPredicates.value),
  };
}
```

There is no finding-filter removal reference in the initial union: the finding target is for exact explanation of its upstream selection and eligible population. Authored finding conditions remain in force and are edited through source.

### Baseline reconciliation is a focused gate

Before showing exact alternatives, the evaluator’s unchanged workspace result must match `getFilteredRowIds()`. Chart context should match the existing captured live-item values for that owner, with the same local population. Rows/table membership should agree with their shared filtering routine. This is an on-open semantic check and a focused implementation test, not an invitation to audit every chart.

If parity fails, withhold exact recovery for that target and retain normal filter editing. Do not “fix” the discrepancy by mutating live filters or replacing the actual count with the evaluator’s preferred interpretation. Custom registered predicates must be read-only and supported by this compile boundary; unsupported influences produce an explicit blocked result.

### Why literal deletion can fail to be a relaxation

For each affected owner, compare the old and candidate predicate masks over **all of U**, not only the empty target. Require:

`oldOwnerMatches ⊆ candidateOwnerMatches`.

Also check any separately affected local/Rows/table predicate population. This is a dataset-specific containment check at this snapshot, not a mathematical proof over all possible future records.

ESR-F18 demonstrates the issue: removing a grouped bar’s last range exchanges G1 for G0. ESR-F25 demonstrates why checking `emptyTarget ⊆ candidateTarget` proves nothing: it is always true. A candidate that drops owner matches is shown as a setting change requiring the existing editor, not automatically recommended or enabled as a recovery relaxation.

Pairs are evaluated and checked independently. Do not discard a restriction from the pair universe merely because its single removal is non-monotone: removing both the old and latest ranges can produce a valid expansion. Likewise, zero single-removal gains cannot prune pair candidates.

### Pure evaluation versus Crossfilter alternatives

| Technique | Benefit | Decision |
| --- | --- | --- |
| Pure predicate evaluation on captured values | Reuses exact owner semantics; local scopes/searches are explicit; no observable filter mutation | **Build.** This is the reference path and correctness oracle. |
| Temporarily clear live dimensions and restore in `finally` | Superficially short code | **Avoid.** Intermediate groups, callbacks, held edits, exceptions, and concurrent changes make restoration insufficient. |
| `allFiltered(ignoreDimensions)` without mutation | Can reuse indexes for whole owner dimensions | **Explore after measurement.** It cannot remove one sibling predicate, and it does not itself model local search or notebook findings. |
| Disposable Crossfilter for each preview | Avoids changing the live object | **Defer.** Rebuilding indexes duplicates work and still requires all local-scope logic. |
| Boolean failure masks for each raw filter entry | Fast for a known independent conjunction | **Avoid as the general model.** Last-range precedence and ignored filters invalidate the assumption. |

An owner-level mask cache is safe when it stores the output of the real compiled function. This differs from assuming every stored filter is an independently applied Boolean clause.

## 9. Cost, scheduling, and bounded search

Let `N` be source rows, `M` effective predicate-owner/factor masks for the chosen target, `K` removable units, and `P` requested pairs. Actual predicate cost includes date parsing and chart-mode work; row count alone is not a timing estimate.

- A simple uncached reference evaluator costs approximately `O(N × M × K)` for singles. Keep that version small enough to review and use it for fixture comparisons.
- For interactive evaluation, compute unchanged owner masks once, then recompile only affected owners for each variant. Per-row counts of failed **owner factors** let a candidate substitute one or two masks while retaining the other factors. This is exact even when an owner has complex internal semantics.
- With mask reuse, work is roughly the baseline scan plus `N` times the sum of changed-owner predicate costs across candidate variants. Count all rows; retain only candidate counts until a user asks for its exact record pane. Re-scan a selected variant or retain its compact ID vector.
- Byte masks cost about `N × M` bytes. For one million rows and 30 factors that is about 30 MB before result vectors and existing data. This is arithmetic, not a benchmark. Start with a session mask budget such as 64 MiB; release masks on close and fall back to bounded streaming evaluation when that budget would be exceeded.
- Do not use a 32-bit JavaScript owner bitset that fails after 32 filters. Existing wrapper tests explicitly exercise more than 32 dimensions.

**Compute only on opening recovery, selecting an unevaluated option, requesting pairs, or choosing Refresh after a stale result.** Do not keep a permanent recovery index, recalculate candidates after every hover, or automatically restart expensive work after every edit. Reuse completed results only within the same snapshot.

Run in short cooperative chunks with cancellation and revision checks. Start after the panel has painted; make the first completed options usable before the list finishes. A proposed 4–8ms chunk budget is a scheduling target to measure, not a promised latency. A worker is unnecessary initially because registered closures and current column maps are not directly transferable; it becomes an Explore item only if measured interaction stalls justify a defined transport.

### Pair search contract

1. The default screen evaluates single removals. If none restore the target, show **Compare two restrictions**. Users may also open this deliberately.
2. Select at most 12 unkept, modeled units. If more exist, show the chosen subset and allow replacing it. Do not silently pick only restrictions with positive single gains.
3. Evaluate every unordered pair in that chosen subset: at most `12×11/2 = 66`. Two occurrences on the same owner are removed together from the original array positions, then that owner is recompiled once.
4. Report tested pairs and the candidate universe. “66 of 153 possible pairs examined, among 12 of 18 available restrictions” is honest when six restrictions were not selected. Kept or unsupported units are listed separately.
5. Publish only complete per-candidate counts. Cancellation may leave a partly searched list, but an incomplete candidate never receives a plausible-looking exact count.
6. If the current target is empty, every admitted single was checked, and none succeeds, a successful admitted pair has minimum **removal cardinality within that eligible unit model and snapshot**. Checking every pair establishes complete pair coverage; it is not necessary to establish that lower bound of two. If any single succeeds, a successful pair is not minimum cardinality. Neither result establishes the closest numeric edit or the analyst’s best choice. Default UI avoids the word “optimal.”
7. If none succeeds, say “No tested single or pair returns rows.” Offer choosing other restrictions, editing a condition, returning through History, or keeping the empty result. Do not say no solution exists.

## 10. Freshness, held edits, and Apply

The existing provider’s `nonce` and live-item nonce are insufficient as complete recovery versions: `updateRowsSettings` and many chart changes do not advance the former, and serialization/callback suppression is a separate concern. Add one **transient monotonic recovery revision**, with direct invalidation from the specific mutation paths; do not add a generic dependency engine.

| Change while recovery is open | Required behavior | Why |
| --- | --- | --- |
| New data array, query result, source, field declarations, or settings restore | Discard record membership and disable Apply | Numeric IDs refer to a different source epoch or restored model |
| Workspace/chart/local filter, table/Rows search, predicate-array reorder | Mark stale; require Refresh | The candidate’s address or retained restrictions changed |
| Calculation edit/removal/re-run or asynchronous boundary readiness | Mark stale | Derived values can change without raw rows changing |
| Field type, date preset, null-token conversion | Mark stale | The predicate input values changed |
| Histogram specification limits or other predicate-bearing chart mode | Mark stale | A saved spec-status or mode-dependent filter changes meaning |
| Notebook text recompile, frozen block, sheet source revision | Block affected authored edits; discard stale source locations | A text splice must target current valid text |
| Host readOnly/history preview or active edit hold | Disable Apply immediately | Permission and editing state changed |
| Presentation-only formatting/title/layout | Conservatively invalidate the session in v1 if saved settings changed | Simpler correct lifecycle; selective reuse can come later |
| Candidate highlight, record sorting, temporary Keep | No analytical revision | These are preview UI state only |

Capture/check the revision before and after collecting columns and compiling. Check it again between chunks and synchronously at Apply. `saveToStructure()` includes a fresh `modifiedAt`; do not use that timestamp alone as a revision. The existing fingerprint ignores it for host callback comparison. The new recovery revision should not be saved or itself emit `onStateChange`.

An open edit hold means some current displayed values may be provisional. Disable starting a new comparison until that edit finishes, with a concise reason. Do not close the editor, commit a draft, reset a hold, or clear an invalid draft to make recovery possible. If a hold starts after capture, stale the session. Waiting for release does not magically revalidate an old result.

### Commit sequence

1. Read current editability, revision, source epoch, and hold count; reject without mutation if any prerequisite differs.
2. Resolve every snapshot-addressed occurrence against its original owner/property/value. Reject ambiguous imported workspace duplicates and unsupported persistence targets.
3. Produce all next arrays/settings before mutating the provider; compile/evaluate affected owner predicates and prepare any supported notebook text edit.
4. Use a dedicated provider command to update all reviewed owners, workspace filters, and Rows settings, then publish one final store update/live-item set. Do not loop through public setters while claiming atomicity. `holdStateChanges` can coalesce callbacks but does not hide intermediate store states.
5. Keep the command synchronous across final validation and publication. An internal Crossfilter update failure must restore the prior wrapper state before publishing; an implementation may prepare an isolated replacement on this rare Apply path if that is the simpler safe approach. No speculative wrapper update is permitted during Preview.
6. Emit the ordinary settings callback once if saved state changed. Host file/network persistence failure is reported by the existing host; do not automatically clear more filters or discard the analyst’s applied state.
7. Publish a bounded inverse receipt and close or confirm the preview. No preview counts, IDs, masks, or candidate preferences enter the saved structure.

The atomicity promise is at the supported provider/store and host-callback boundary. Direct subscriptions to internal Crossfilter mutations are not a new supported extension API. The implementation tests must prove the visible and host-level behavior, including the failure path; a callback-count-only test is not sufficient.

## 11. Public API, saved state, and history

### Smallest public contract

**No new top-level public prop, persisted format, exported solver, or public predicate language is needed.** The built-in UI uses internal `captureRecovery`, `evaluateRemoval`, `commitRecovery`, and guarded inverse operations. Existing `data`, `savedData`, `onStateChange`, and `readOnly` remain the embedding contract. Notebook authored changes continue through `onTextChange`; transient notebook selections retain their existing meaning.

Use a small internal recovery controller for panel state, host editability, cancellation, and optional notebook commit preparation. The provider owns the final settings command. This respects the current architecture: `readOnly` is routed through `ExplorEda`/`PlotManager`, not a durable field in saved settings.

Separate three lifetimes:

- **Durable analytical state:** the existing workspace filters, chart filters/local filters, table search, Rows filters/search, fields, calculations, layout, and source text where supported.
- **Transient recovery state:** target, snapshot token, selected candidate, Keep choices, mask caches, exact preview IDs, partial-search coverage, and dismissal.
- **Transient inverse receipt:** reviewed before/after restrictions, source epoch, and the expected post-Apply revision. Expire it instead of merging across later edits.

### Save, load, and history

Accepted recovery is represented by the ordinary absence of the removed restriction(s). It needs no `recovery` field and no new schema version. `saveToStructure` and `onStateChange` pass JavaScript settings objects; a callback proves an in-memory change, not a successful durable save. Preserve primitive filter values exactly in the detached snapshot and inverse receipt. The fixture’s special-value tags are test encoding, not an application format.

**The existing JSON boundary is narrower than the runtime predicate boundary.** `utils/saveDataUtils.ts::stringifySavedData` validates settings and then uses JSON. Its `isFilter`/`isDatum` reject NaN and infinities as filter datums; the full-analysis codec only tags raw `data.data` cells. Undefined category entries serialize as null and negative zero as zero. Those canonicalizations preserve the current `applyFilter` membership rules, but are not exact JavaScript-object preservation. Keep that supported durable contract and visible validation failures; do not silently convert nonfinite filter values to null or add a public setting codec for recovery.

**Build one narrow history correction.** The demo currently clones checkpoints with ordinary JSON in both `savedViewsHistory.ts::clone` and `savedViewsSession.ts::clone`; its `signatures` also collapse special values. Replace those internal plain-saved-state clone/comparison operations with type-preserving equivalents. `DataLayerProvider::getSavedStateFingerprint` already tags undefined, NaN, and infinities, so it does not need a general rewrite. The recovery revision and receipt separately preserve exact occurrence identity, including negative zero.

`SavedViewsWorkspace.tsx` directly serializes the session, including historical snapshots, with JSON. Validate every settings object that will be persisted before that boundary. If a retained checkpoint contains unsupported filter values, keep the in-memory session and the last good stored session and report persistence failure. Removing an unsupported current filter does not make an older checkpoint serializable. Never silently discard history to claim a successful save. Supported serialized reloads promise equivalent predicate membership, while the proposed in-memory Undo and immediate inverse retain exact primitive values.

The demo gets one checkpoint because Apply publishes one meaningful `onStateChange`. `savedViewsHistory.ts::pushCheckpoint` already handles branching after Undo. Keep this behavior. Extend its filter classification narrowly to include local chart filters and table searches, which are outside its current explicit filter signature. These focused clone, comparison, and persistence checks do not require a new history system.

Historical checkpoints save settings, not proof of old record memberships. If source data changed, Undo reapplies those settings to the current data according to the existing restore path. Do not show a stale preview’s count as the count that an old checkpoint necessarily had.

The embedded **Restore removed restrictions** action publishes an inverse edit while its receipt is current. It is intentionally named differently from chronological Undo. It restores exact filter objects/flags and search text, and never overwrites layout or all savedData. Expiration is visible through removal of that action; existing host history remains the route to older states.

## 12. Notebook and folder behavior

### Notebook persistence is not dashboard persistence

Current notebook source writeback excludes runtime `filters` (`lib/notebook/writeBack.ts::textPart`) and ignores `select.*` tokens (`skippedKey`). `writeBackSettings` iterates chart edits; it does not implement workspace-filter or finding-condition authoring. Its return of unchanged text with no results is not evidence that an attempted workspace change was saved.

| Notebook recovery action | Proposed support | Persistence consequence |
| --- | --- | --- |
| Remove one chart click/brush predicate | Build | Session-local; affects that chart’s selected records/findings; zero text writes |
| Remove a supported chart-local authored restriction | Build with all-or-nothing writer preflight | One source edit through `onTextChange` when editable and representable |
| Remove an authored workspace filter | Explain exact alternative; Edit source | Direct durable Apply is deferred |
| Remove a finding-owned condition or change a comparison denominator | Explain scope; Edit source | Direct authoring is deferred |
| Pair of transient predicates | Build after pair engine | One session change; no text rewrite |
| Pair of supported authored local restrictions | Build only if both preflight together | Reject all if either fails; no partial source patch |
| Mixed transient-selection and authored-local pair | Defer | Prevent recompilation from silently resetting other transient selections |
| Frozen/invalid notebook block | Explain last-valid state only | No authored Apply until the current text is valid |

A source edit’s preparation must verify more than “writer returned no errors”: verify that the intended source-owned change is represented after compile and that unaffected authored state is equivalent. The writer can report partial success across charts; reject a partially supported recovery transaction before touching either text or provider. Preserve named chart identity and unrelated runtime selections when applying a supported source edit; if the current writer/recompile path cannot guarantee that, route the action to Edit source rather than silently resetting the session.

`evaluateNotebookFindings` is a source-field-only helper. Do not use it for mounted recovery involving calculations. Use the live context’s effective `getColumnData` and `evaluateFinding`, preserving selected/eligible/unbound differences and the numeric empty/invalid distinction.

### Folder use

The pinned folder host saves dashboard settings through `ProjectWorkspace.tsx::onStateChange → updateView → analysisFileText → FolderSaver.queue`. Notebook authored edits use `onTextChange → queue`; the host does not subscribe to notebook `onStateChange`. Accordingly, a local selection recovery must not claim a notebook file write. `FolderSaver` serializes writes, avoids disk-equivalent text, and reports failure. Use that existing mechanism, without a new recovery sidecar or save service.

**Preflight the actual folder representation before saving.** `lib/project/writeFolder.ts::analysisFileText` retains only text from `exportAnalysisText`, dropping its `omitted` diagnostics. The DSL exporter cannot represent every workspace filter; chart generic-path fallback covers some cases that shorthand cannot. A successful text string therefore does not prove preservation. At the host save boundary, inspect the complete exporter result and compile the proposed text before queuing or replacing a file. Verify both the intended removal and all retained restriction semantics. If that representation cannot preserve the analysis, keep the accepted in-memory settings and last good disk file, show an unsaved/save-failure state, and offer source editing. Do not automatically reverse the accepted edit or claim it was persisted.

The current public `onStateChange` is post-commit, so it cannot provide a before-Apply veto. This design keeps that API and places the folder guard before persistence, with the same distinction between in-memory success and save failure as JSON persistence. Notebook authored recovery is different: its internal text-owning action can and must preflight before changing either text or runtime settings. Do not introduce an undocumented host-precommit hook while claiming no public API change. Raw-row JSON encoding does not fix a DSL limitation.

The inspected folder host does not provide the demo’s general history. Use the bounded inverse action for immediate return. It may trigger a new normal file save for a durable dashboard/authored edit; a transient notebook selection inverse remains session-only.

An empty project query result is an empty `U`. The workspace engine cannot restore rows that the provider never received. Show “This source has no rows” and let the host navigate to Query or source refresh. Joins, SQL conditions, source authentication, and query execution plans remain outside recovery.

## 13. Empty reasons and unsupported surfaces

| Observed state | Recovery behavior | Available next step |
| --- | --- | --- |
| `U` has no rows | No restriction can manufacture records; no suggested relaxation | Source/query controls supplied by the host |
| Required chart field/configuration absent | Setup state, not zero-match recovery | Existing chart settings |
| Named record population is zero | Offer exact recovery when modeled restrictions exist | Preview one removal; then optional pairs |
| Records exist but every needed plotted value is invalid/missing | Keep record count and eligibility separate | Existing fields/trace/settings; no automatic clear |
| Axis bounds, log scale, hidden facets, map viewport, or display mode hide marks | Preserve record filters | Existing view controls; no automatic range/reset operation |
| Count or aggregate equals zero with legitimate input | Render the valid zero | Optional scope inspection; do not initiate repair |
| No supported exact evaluator for an influencing predicate | Block exact candidates for that target | Owner settings/source editing |
| Stale snapshot or held edit | Disable Apply | Finish the edit or Refresh explicitly |
| Intentional empty selection | Keep all state | Close/Keep empty result; reopen later if desired |

Do not change `ChartMessage` into a universal guesser based on its displayed text. Add an explicit empty reason at supported population/renderer boundaries. Initial visual eligibility is limited to table records and the existing histogram/scatter planning paths integrated in M3. Other chart types still benefit from workspace record recovery, but this design does not promise an exact mark-restoration count for every renderer, custom chart, facet cell, composition mark, map region, regression fit, or aggregate.

The narrow recovery surface is a deliberate local usability target; all-chart mobile operation, arbitrary custom renderers, upstream database relaxation, full causal diagnosis, and durable notebook authoring beyond the table above are unsupported in this build.

## 14. Main risks and implementation order

| Rank | Risk | Build response |
| --- | --- | --- |
| 1 | Correct count for the wrong population | Named target algebra, live baseline reconciliation, exact scope fixtures |
| 2 | Flattening chart semantics or clearing siblings | Compile full changed owner; occurrence identity; F18/F25/F27 and pair containment checks |
| 3 | Preview mutation or partial multi-owner Apply | Detached evaluator; dedicated synchronous commit; observer/callback/history tests |
| 4 | Applying old records after data/settings edits | Transient comprehensive revision, holds/editability checks, no automatic refresh |
| 5 | Notebook changes claimed durable but omitted by text writer | Explicit persistence modes, actual writer preflight, defer mixed transactions |
| 6 | Expensive scans become a permanent background cost | On-demand chunks, cached owner masks, cancellation, 12-unit pair cap |
| 7 | Empty plotted geometry mistaken for an empty query | Typed diagnosis and separate current-record versus plottable counts |
| 8 | Recovery’s inverse mistaken for history navigation | Different action name and expiration; ordinary demo Undo/Redo |
| 9 | Typed filter values lost in history or retained restrictions omitted from a file | Type-preserving in-memory checkpoints; existing JSON validation; full folder exporter/compile preflight |

M1 is the smallest coherent useful release: a user can open an empty workspace, compare actual returned rows, apply one small change, and undo it through the demo. M2 and M3 extend the same engine to precise local targets. M4 resolves joint conflicts. M5 closes notebook and folder lifecycle details without imposing unbuilt research as a prerequisite. The plan names actual files and proposed new modules; no external user study or adoption gate precedes any of them.

## 15. Access, read inventory, checks, and open questions

### Access status

**Complete for this design.** The supplied packet identifies the exact baseline and contains complete UTF-8 contents for its 37 files. All 37 were read. GitHub connector reads supplied the additional decisive code at that same SHA. A raw-web fetch of GitHub source failed, but authenticated repository reads succeeded. Current `main` was not substituted for source claims.

### Complete supplied files read

All paths below are relative to the repository root:

```text
AGENTS.md
README.md
CODING_STANDARDS.md
docs/agent-guide.md
docs/ui-defaults.md
docs/research/DIRECTION.md
package.json
packages/explorEDA/package.json
packages/explorEDA/README.md
packages/explorEDA/src/components/ActiveFilterStatus.tsx
packages/explorEDA/src/components/ActiveFilterStatus.test.tsx
packages/explorEDA/src/components/WorkspaceFilterEditor.tsx
packages/explorEDA/src/components/LocalFilterStrip.tsx
packages/explorEDA/src/components/RowsView.tsx
packages/explorEDA/src/components/charts/ChartMessage.tsx
packages/explorEDA/src/components/charts/DataTable/filteredRows.ts
packages/explorEDA/src/components/charts/DataTable/definition.ts
packages/explorEDA/src/hooks/CrossfilterWrapper.ts
packages/explorEDA/src/hooks/CrossfilterWrapper.test.ts
packages/explorEDA/src/hooks/applyFilter.ts
packages/explorEDA/src/hooks/applyFilter.test.ts
packages/explorEDA/src/providers/DataLayerProvider.tsx
packages/explorEDA/src/types/FilterTypes.ts
packages/explorEDA/src/types/ChartTypes.ts
packages/explorEDA/src/types/SavedDataTypes.ts
packages/explorEDA/src/lib/chartPopulation.ts
packages/explorEDA/src/lib/valueParsing.ts
packages/explorEDA/src/lib/categories.ts
packages/explorEDA/src/lib/specification.ts
packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx
packages/explorEDA/src/lib/notebook/findings.ts
apps/demo/src/savedViewsHistory.ts
apps/demo/src/docs/pages/filters.mdx
apps/demo/src/docs/pages/views-and-history.mdx
apps/demo/src/docs/pages/notebooks.mdx
docs/intent/research-ideas-100/ideas/R052-empty-selection-recovery.md
docs/research/filter-ownership-2026-10-22/summary.md
```

The R052 context and earlier ownership summary were read as context. Their old keep-current/demand gates are superseded by `DIRECTION.md` and the current mission. Prior research proposals are not treated as shipped dependencies.

### Supplemental pinned source

Fully read:

- [DataTable.tsx — resolvedRows](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx)
- [BarChart/definition.ts — mode-specific predicate](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/BarChart/definition.ts)
- [BarChart.tsx — context, selection, specification actions](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/BarChart/BarChart.tsx)
- [ScatterPlot/definition.ts — selection and required fields](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/ScatterPlot/definition.ts)
- [ScatterPlot.tsx — context population and no-points state](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx)
- [useGetLiveData.tsx — live/context IDs](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/charts/useGetLiveData.tsx)
- [dataLayerState.ts — internal source-position IDs](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/providers/lib/dataLayerState.ts)
- [ExplorEda.tsx — public props and readOnly routing](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/ExplorEda.tsx)
- [NotebookFindings.tsx — live finding inputs](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/notebook/NotebookFindings.tsx)
- [notebook/index.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/index.ts), [writeBack.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/writeBack.ts), and [writeBack.test.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/notebook/writeBack.test.ts)
- [apps/app/src/saver.ts — FolderSaver](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/apps/app/src/saver.ts)

Relevant sections inspected, without claiming complete-file review of these larger hosts:

- [PlotManager.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/components/PlotManager.tsx): readOnly/inert boundaries, narrow flow, Rows/status integration.
- [SavedViewsWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/apps/demo/src/SavedViewsWorkspace.tsx): `capture`, restoration, history preview, host callbacks.
- [ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/apps/app/src/ProjectWorkspace.tsx): dashboard/notebook save handlers and readOnly routing.
- [savedViewsSession.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/apps/demo/src/savedViewsSession.ts): checkpoint initialization/restoration and JSON clone. `SavedViewsWorkspace.tsx` session JSON persistence was also inspected.
- [utils/saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/utils/saveDataUtils.ts): settings validation, `isFilter`/`isDatum`, settings JSON encoding, and full-analysis raw-row codec.
- [project/writeFolder.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/project/writeFolder.ts), [project/analysisText.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/project/analysisText.ts), and [dsl/export.ts](https://github.com/byronwall/explorEDA/blob/d3920a285f3755a8324998775deb131747e959f5/packages/explorEDA/src/lib/dsl/export.ts): folder text generation, omitted-filter diagnostics, shorthand limits, and chart fallback.

### Checks versus proposals

**Executed:** the standalone Node fixture verifier passed **29 scenarios, 72 preview alternatives, and 422 assertions** against the separately authored JSON expectations, using exact baseline pure helper bodies and DataTable/Bar predicate bodies with TypeScript wrappers removed. The generated [verification result](empty-selection-verification.json) records those totals. The fixture guide explains which scope and finding reductions are independent test oracles. Source snapshots are frozen and checked unchanged in that companion; this does not exercise a real UI Cancel operation.

**Read but not executed:** supplied repository tests and supplemental notebook writeback tests.

**Proposed, not measured:** the recovery UI, live Crossfilter/provider parity, callback atomicity, history/Undo integration, notebook writeback transaction, file persistence, scheduling/memory limits, and real browser acceptance at all three widths. Static SVGs were created as design assets; their rendered inspection is not a product browser test. No repository install, `pnpm check`, product benchmark, or deployment was represented as complete.

### Remaining implementation questions

These are focused integration choices with defaults, not reasons to postpone the build:

1. **Which additional chart definitions pass the read-only baseline-parity contract immediately?** Default to the registry compiler for supported built-ins, with explicit blocking for an unmodeled influence; qualify further modes through behavior tests as they are exposed.
2. **Where should exact record paging reuse existing table components?** Prefer a detached read-only record pane that does not inherit Rows’ unrelated settings or update them. Sharing rendering is appropriate; sharing mutable table state is not.
3. **Does the existing wrapper permit a simple rollback-safe bulk commit?** Prefer one prepared command and one state publication. If preparation of an isolated wrapper is required for the safe first version, measure that rare Apply cost rather than mutating during Preview.
4. **Which authored notebook local-filter removals can preserve runtime selections through the current writeback/recompile path?** Build only the preflighted subset and route the rest to source editing. Mixed authored/transient pairs remain deferred.
5. **What chunk and memory budgets suit actual deployed datasets?** Begin with the explicit proposed budgets; use measured main-thread responsiveness and retained memory to tune them. No exhaustive solver or permanent recomputation is required.

**Artifact links:** [report](empty-selection-design-report.md), [implementation plan](empty-selection-implementation-plan.md), [recommendation dispositions](empty-selection-recommendations.md), [fixture guide](empty-selection-fixtures.md), [fixture data](empty-selection-fixtures.json), [verifier](verify-empty-selection-fixtures.mjs), [executed verification](empty-selection-verification.json), and [1280](recovery-preview-1280.svg) / [783](recovery-preview-783.svg) / [390](recovery-preview-390.svg) mockups.
