# explorEDA reconciliation against the product transcripts

Original audit: 2026-09-17, commit `a168f1b`. Baseline reconciliation: 2026-09-19, commit `eb887c4` on `main`. Current review: 2026-09-20, through `0cc3947`, including implementation commit `f04e790`.

This review covers all three completed rounds in [⭐ 🧮 00 · Close analysis gaps](thread://01a0bcb3-c383-70c0-a4ea-5b54cc265e8f?hostId=local). The working tree was clean before review. No outstanding work needed an initial commit.

**Next action: add inline field distributions and finish shared formatting.** Numeric eligibility is repaired: blank and nonfinite inputs now give the same results in every view (R18). Histogram and box contributors follow; date controls and time axes come next.

This update includes the [trust repairs](transcript-trust-fixes.md) and [calculation workflow](calculation-workflow.md). It separates completed work, remaining defects, and proposed scope.

This audit compares the application with all **20 transcript files** in [docs/transcripts](transcripts/README.md). The companion [application feature inventory](application-feature-inventory.md) describes current behavior and links its implementation.

The application already supports a substantial first exploration loop: load one scalar table, inspect fields, create eleven kinds of views, and filter them together. It also has calculated columns, two facet layouts, shared color scales, table virtualization, and serializable workspace state.

The largest difference is how the system explains and reuses its work. The transcripts describe reusable transformations and a trace from marks to inputs. Many charts still calculate and render their results internally. Calculated fields expose formulas, source values, dependency trees, and downstream uses. Pivot cells and named grouped summaries expose contributors. Other aggregate marks still lack this inspection, and general intermediate tables remain absent.

The approved repair pass covers calculation correctness, derived values, filter scope/reset, typed categories, and comparable facets. Validation now executes formulas against source rows. Tables and exports resolve calculated values. Facets use full-source domains. Date calculations use UTC. Category selections retain source types.

The later calculation pass adds inspectors, live draft previews, explicit Apply, and a calculation-rich example. These close scalar inspection gaps. This follow-up adds field settings, shared formatting, chart consistency repairs, and named grouped summaries. Earlier passes added pivot inspection and JSON restore. Durable storage remains the host's responsibility.

These findings do not make every transcript idea an approved feature. The September shape brief deliberately narrows the next product slice. This report preserves that distinction.

## Contents

- [Method, evidence, and status definitions](#method-evidence-and-status-definitions)
- [Main findings](#main-findings)
- [Intent already represented in the application](#intent-already-represented-in-the-application)
- [Input data, schema, and source scope](#input-data-schema-and-source-scope)
- [Dashboard experience and saved analysis](#dashboard-experience-and-saved-analysis)
- [Filtering, selection, and linked views](#filtering-selection-and-linked-views)
- [Tables, field inspection, and formatting](#tables-field-inspection-and-formatting)
- [Calculations and reusable transformations](#calculations-and-reusable-transformations)
- [Facets, axes, and color](#facets-axes-and-color)
- [Individual charts and advanced chart ideas](#individual-charts-and-advanced-chart-ideas)
- [Traceability, declarative specifications, and reproducibility](#traceability-declarative-specifications-and-reproducibility)
- [Performance, errors, and accessibility](#performance-errors-and-accessibility)
- [Verified mismatches and source-derived risks](#verified-mismatches-and-source-derived-risks)
- [Intent tensions and scope decisions](#intent-tensions-and-scope-decisions)
- [Suggested order and decisive proof scenarios](#suggested-order-and-decisive-proof-scenarios)
- [Transcript coverage ledger](#transcript-coverage-ledger)
- [Audit limits](#audit-limits)

## Method, evidence, and status definitions

### How evidence was reconciled

The original audit read all twenty transcripts, including the three adjacent product-design notes. Their combined scope covers table interaction, dashboard coordination, data transformation, chart construction, provenance, and design methods.

The transcripts are voice notes. They contain examples, alternatives, unresolved questions, and speech-recognition errors. An example of a chart is not automatically a promise to ship it. A proposed architecture is not automatically a settled product requirement.

Each section below separates the desired outcome from its proposed implementation. The source ledger provides a file and distinctive phrase for retrieval. The transcript files have no useful internal timestamps, so this report does not invent timecodes.

Current behavior was traced through the active package and demo paths. Existing plans and the demo coverage manifest were used as context. They were not treated as proof of implementation. The [September shape brief](intent/interactive-eda-workspace/shape-brief.md) is a scope decision, not evidence that every item in its “Add” list remains missing.

This reconciliation retains that transcript ledger and reviews the recent implementation and source paths. It checks user decisions, completed task reports, commits, and current source. Fresh automated checks and direct probes appear under Audit limits. Browser evidence comes from the linked task; this review did not repeat those browser passes or ingest new transcripts.

### Completed work reviewed

| Round | Commits | Delivered outcome | Remaining boundary |
| ----- | ------- | ----------------- | ------------------ |
| Trust repairs and calculation workflow | `3cd4191`, `eb887c4`, `79e25b0` | Calculation validation, editing, dependency inspection, shared derived values, reset, typed categories, and facet repairs. | Scalar calculations; no complete mark provenance. |
| Chart semantics, pivot inspection, and JSON restore | `ba40b48`, `f4e16b1`, `aceaf67` | Ordered lines, observed Tukey whiskers, local pivot errors, exact pivot contributors, editable settings JSON, and full analysis restore. | Host storage remains separate. Formula drafts remain local. |
| Field settings, chart consistency, and aggregate reuse | `f04e790`, `0cc3947` | Conversion previews, preserved raw rows, shared display settings, facet navigation, legends, beeswarm geometry, 3D fixes, and named summaries. | One group field and count/sum/average. Result bars and tables use global filters and do not create selections. |

The accepted save path puts settings JSON first for library embedding. The full analysis file also carries source rows. Failed field conversions become missing analytical values; original values remain available. These decisions remain in force.

### Implementation status

| Status       | Meaning                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| Present      | The active source supports the outcome within the stated scope. This alone is not complete browser verification. |
| Partial      | A working path covers only part of the outcome. The remaining difference is stated.                              |
| Missing      | No active implementation was found for the outcome after tracing the relevant paths.                             |
| Mismatch     | An existing path contradicts its exposed contract or an explicit part of the desired behavior.                   |
| Unverified   | The question needs runtime, visual, accessibility, or performance evidence not collected here.                   |
| Planned only | The repository describes future work without an active implementation.                                           |

### Strength and scope of intent

| Label       | Meaning                                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------------------------- |
| Core        | Repeated or strongly stated product outcome. This is an audit classification, not new authorization to build. |
| Specific    | A concrete behavior described in a transcript, with narrower or less repeated support.                        |
| Candidate   | A possible approach whose tradeoffs remain open.                                                              |
| Exploratory | An example or architectural investigation that should not become an automatic backlog commitment.             |
| Parked      | Explicitly outside the September single-source product slice. The broader intent remains valid evidence.      |

“Core / parked” is possible. Multi-source analysis can be important to the long-term vision while remaining outside the current slice. Status and priority are different: a missing treemap can matter less now than an incorrect filter on an existing chart.

## Main findings

| Finding                       | Assessment                                                                                                                                                                    | Relevant gaps                         |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| One-table exploration         | Substantial implementation exists. Field profiles, field overrides, typed controls, defaults, linked filters, and public state emission are current features.              | DATA-01–04, DASH-01, FILT-01–03       |
| Trust in derived values       | Scalar evaluation and exports share results. Summary statistics, chart paths, and grouped aggregates share one numeric eligibility rule. | CALC-01–07; R01–R02, R18 |
| Meaning of the current subset | Global chart filters, peer-filtered chart context, table search, and local Rows controls coexist. Labels explain their scope, and the main reset clears all row restrictions. | FILT-01–05                            |
| Persistence                   | The package emits and restores primary settings JSON and full analysis JSON. The demo does not provide durable named saved analyses. Metadata remains limited; `modifiedAt` records snapshot time. | DASH-03–06; V05, R02                  |
| Comparable facets             | Supported facets share full-source domains and category order. Selections apply across facets, as approved.                                                                   | FACET-01–06                           |
| Analytical traceability       | Scalar formulas, pivot cells, and named grouped summaries expose inputs. Other mark contributors and other intermediate transformation tables remain absent.                    | TRACE-01–06                           |
| Table quality                 | Virtualization, typed filters, widths, column order, field inspection, and shared formatting exist. Summary badges and filter chips still bypass shared formats. | TABLE-01–11; R19 |
| Chart breadth                 | The eleven registered views are real. Bars also support read-only named grouped count, sum, and average results. Other marks remain chart-local.                             | CHART-01–10                           |
| Performance                   | Several concrete measures exist. A 2026-09-20 desktop walkthrough covered a 10,000-row sample; this does not establish a general size envelope. | PERF-01–05 |
| Advanced architecture         | A general dataflow/spec system, server queries, joins, and custom glyph composition are largely exploratory or parked.                                                        | DATA-05–08, TRACE-04–06, CHART-08–10  |

Numeric summaries now agree on eligible inputs. The next feature should improve field inspection within the existing single-source flow.

## Intent already represented in the application

This section prevents completed work from being reclassified as missing because older notes describe it in the future tense.

| Intent                        | Existing behavior                                                                                                     | Evidence and limit                                                                                                                                           |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Start with useful views       | New data opens a distribution chart, Summary, and a source table. Field actions create additional charts.             | [T09], [T12], [T13]; [workspace inventory](application-feature-inventory.md#dashboard-workspace). Defaults still use simple field heuristics.                |
| Linked exploration            | Chart predicates intersect through Crossfilter. Own-chart context is available separately from other-chart filtering. | [T12]; [filter inventory](application-feature-inventory.md#filtering-and-chart-coordination). Styling and local table scope differ.                          |
| Manual bounds beside brushing | Bar, line, and scatter settings can edit range bounds. Brushes can draw, move, resize, and clear selections.          | [T06], [T12]; [brush hook](../packages/explorEDA/src/hooks/useBrush.tsx). Inputs live in settings rather than beside every brush.                            |
| Understand unknown fields     | Shared profiles include field union, type, missing count, distinct count, and numerical/category summaries. A field inspector now previews raw/runtime values and conversion failures. | [T09], [T13]; [field profiles](../packages/explorEDA/src/lib/fieldProfiles.ts), [field settings](../packages/explorEDA/src/lib/fieldSettings.ts). No inline distributions. |
| Move and size a dashboard     | Grid panels can move, resize, duplicate, expand, and be removed.                                                      | [T12], [T14]; [workspace inventory](application-feature-inventory.md#dashboard-workspace). No individual facet pinning.                                      |
| Keep configuration            | Saved structures contain layout, filters, calculations, colors, field settings, and grouped definitions. A public callback emits changes. | [T08], [T12]; [state inventory](application-feature-inventory.md#saved-state-exports-and-host-integration). The demo does not store them durably. |
| Compare groups                | Wrap/grid facets, box groups, categorical charts, pivot grouping, and named grouped summaries exist.                  | [T11], [T14]; [facet inventory](application-feature-inventory.md#faceting). Broader transform output is not reusable.                                    |
| Use shared colors             | Scale IDs and a color manager allow shared palettes and category edits.                                               | [T08], [T14]; [color inventory](application-feature-inventory.md#axes-colors-labels-and-common-settings). Legends and line series use partly separate paths. |
| Inspect substantial row sets  | Data tables use virtual rows, sticky headers, typed filters, resizing, and CSV export.                                | [T02], [T06]; [table inventory](application-feature-inventory.md#data-table-and-rows-mode). No measured capacity guarantee.                                  |
| Add explanation               | A rich-text panel can accompany charts and is saved with the workspace.                                               | Adjacent [T19]; [explanation panel](application-feature-inventory.md#markdown--explanation-panel). It stores HTML and has no live data binding.              |

The shape brief's proposed profiles, active-filter display, and state callback are now present. Field inspection, shared formatting, calculation inspection, grouped summaries, and editing are implemented slices. Broader transformation inspection remains open. The shape brief still describes pagination. The demo [coverage manifest](../apps/demo/src/demos/coverage.ts) now names virtual scrolling correctly.

## Input data, schema, and source scope

The primary job is to understand what was loaded before drawing conclusions from it. A broader job is to preserve source grain while selecting only the data an analysis needs.

| ID      | Desired outcome and intent                                                                                                    | Current state                                                                                   | Remaining gap                                                                                                                                                   |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DATA-01 | Load an arbitrary table and start inspecting it. **Core**, [T01], [T09], [T13].                                               | **Present** for one scalar table through CSV, flattened JSON, or a host array.                  | Import has no preflight type preview. Rich JSON structure becomes scalar paths.                                                                                 |
| DATA-02 | Know field types, nulls, distinct values, and ranges before selecting a chart. **Core**, [T09], [T13].                        | **Present slice**: full-source profiles, filtered Summary, and a field inspector show inferred/effective types, counts, examples, and failures. | No inline distributions or broader inference diagnostics beyond the inspector's inferred/effective explanation. |
| DATA-03 | Correct bad inference without rewriting the original file. **Specific**, [T09].                                               | **Present slice**: type overrides, null tokens, date presets, and conversion previews apply to effective runtime values. | No import-time preflight or durable source schema. Other chart eligibility rules remain local. |
| DATA-04 | Understand source identity and the meaning of one row. **Core**, [T11], [T13], [T15].                                         | **Partial**: raw rows, effective rows, and positional IDs exist.                                   | No durable source key, grain description, schema metadata, checksum, or source-version record. Flattening is not recorded as a transform.                       |
| DATA-05 | Inspect related source tables and choose the correct grain. **Core / parked**, [T11], [T13], [T15].                           | **Missing**.                                                                                    | No source catalogue, relationships, key diagnostics, joins, or source selection per chart. A duplicated file-level value can still be counted at row grain.     |
| DATA-06 | Distinguish all available data, loaded working data, and currently visible data. **Core; server scope parked**, [T12], [T13]. | **Partial**: full loaded rows and chart-filtered rows are distinct.                             | No remote available population or persistent working-set layer. “All” means all rows already in memory.                                                         |
| DATA-07 | Request needed fields and rows without hiding what remains available. **Candidate / parked**, [T13].                          | **Missing**.                                                                                    | No dependency-based column fetch, incremental loading, server filters, aggregation pushdown, or loaded-versus-total disclosure.                                 |
| DATA-08 | Use derived tables as named analytical inputs. **Core for reuse; architecture exploratory**, [T11], [T13], [T15]–[T17].       | **Partial**: named grouped summaries persist one definition and feed read-only bar and table views. | Pivot, cleaned, modeled, and general intermediate tables remain unavailable as reusable chart sources. |
| DATA-09 | Distinguish missing values from missing expected observations. **Specific**, [T13].                                           | **Partial** for missing cells only.                                                             | Profiles count nulls in existing records. They cannot compare an expected test plan, time grid, or key set with actual records to identify absent observations. |

Source evidence: [input inventory](application-feature-inventory.md#input-data-and-field-profiles), [field settings](../packages/explorEDA/src/lib/fieldSettings.ts), [grouped aggregates](../packages/explorEDA/src/lib/aggregates.ts), [JSON parser](../apps/demo/src/jsonParser.ts), [provider](../packages/explorEDA/src/providers/DataLayerProvider.tsx), [row initialization](../packages/explorEDA/src/providers/lib/dataLayerState.ts).

DATA-02–04 can improve within the existing table model. DATA-08 already has a named grouped-summary slice. Broader source and transformation work needs a concrete use case before selecting its architecture.

## Dashboard experience and saved analysis

The transcripts seek a short path from a field to a useful view, then a reliable way to keep the analysis. They distinguish the arrangement of views from a temporary selection.

| ID      | Desired outcome and intent                                                                                        | Current state                                                                                            | Remaining gap                                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| DASH-01 | Create useful charts with few choices and sensible defaults. **Core**, [T09], [T12], [T13].                       | **Partial**: starter views, a chart menu, field actions, and inferred defaults exist.                    | No role-aware field assignment or eligibility explanation. A field action can still choose other grouping fields heuristically.                                    |
| DASH-02 | Explore several analysis views without losing each one's state. **Specific**, [T12].                              | **Partial**: chart panels retain state within one workspace.                                             | Charts/Rows/Calculations are modes, not named dashboard tabs. No multiple saved analyses, dirty-state indicator, or view-switch history.                           |
| DASH-03 | Preserve all meaningful user configuration. **Core**, [T08], [T12].                                               | **Implemented slice**: settings JSON includes charts, formulas, colors, layout, and provider-owned Rows filters/search/sort/order/widths. | Source rows remain separate from primary settings. Calculation drafts remain local. View identity and original creation metadata are absent.                         |
| DASH-04 | Save and reopen an analysis through the application. **Core**, [T08].                                             | **Implemented slice**: settings JSON restores against current rows; full analysis JSON carries rows and settings. | No durable named host/server save or reload workflow. Storage remains the host's responsibility.                                                       |
| DASH-05 | Share a small view by URL and manage larger views at a useful scope. **Candidate**, [T08].                        | **Partial**: URLs select examples.                                                                       | The live filters, chart settings, and layout are not encoded. Workspace/project/dataset view ownership does not exist.                                             |
| DASH-06 | Save layout separately from temporary filters; recover earlier decisions. **Specific / candidate**, [T08], [T12]. | **Missing** as separate user choices.                                                                    | Filters are embedded in chart settings. No filter-free save option, workspace undo, checkpoint, or restored-state diff.                                            |
| DASH-07 | Make changes near their result and judge them immediately. **Core preference**, [T08], [T17]. | **Partial**: calculation inspectors and the field inspector preview drafts before explicit Apply. | Broader chart settings and density bandwidth controls still lack comparable editing beside the result. |
| DASH-08 | Keep the full dashboard understandable while rearranging or focusing it. **Core**, [T12], [T14].                  | **Partial**: drag, resize, duplicate, panel expansion, facet focus, and labels exist.                  | No per-facet pin operation. No explicit explanation that a duplicate also duplicates its active filter ownership. |

Source evidence: [workspace inventory](application-feature-inventory.md#dashboard-workspace), [state inventory](application-feature-inventory.md#saved-state-exports-and-host-integration), [Rows mode](../packages/explorEDA/src/components/RowsView.tsx), [demo host](../apps/demo/src/LandingPage.tsx).

The package already has the small host persistence seam requested by the September shape. The remaining product gap is to use that seam consistently. It does not imply that the package must own a database or a storage service.

## Filtering, selection, and linked views

The desired loop is: see a distribution, select a subset, understand the resulting population, inspect it elsewhere, and remove the selection confidently.

| ID      | Desired outcome and intent                                                                                                                              | Current state                                                                                      | Remaining gap                                                                                                                            |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| FILT-01 | Understand exactly which subset every view represents. **Core**, [T06], [T12].                                                                          | **Partial**: counts and labels distinguish chart filters from table-local restrictions.            | Local filters remain in their table controls. There is no row-exclusion explanation or peer-filter population inspector.                 |
| FILT-02 | Compose chart filters predictably, including two charts on the same field. **Core**, [T12].                                                             | **Present** for AND across chart dimensions.                                                       | No display of the effective intersection, intermediate row counts, or reason why a record was excluded.                                  |
| FILT-03 | See filter ownership and return to its control. **Specific**, [T12], phrase “jump to the chart.”                                                        | **Partial**: chips identify an owner and can remove its filter.                                    | No jump/focus action, filter funnel, or explicit warning about contradictory selections.                                                 |
| FILT-04 | Reset the active analysis subset reliably. **Core**, [T06], [T12].                                                                                      | **Present**: Clear all filters resets chart filters, dashboard searches, and local Rows controls.  | Reset returns every loaded row. Separate working-set constraints remain outside this scope.                                              |
| FILT-05 | Separate persistent working-set constraints, temporary selections, and independent linked groups. **Candidate / parked in broader form**, [T12], [T15]. | **Missing** within one workspace.                                                                  | No filter islands or stable base-filter layer. Separate workspace instances are an embedding option, not a dashboard control.            |
| FILT-06 | Combine graphical ranges with exact numerical inputs. **Core**, [T06], [T12].                                                                           | **Partial**: brush and Select settings share range state.                                          | Inputs are in a settings panel. No explicit precision/tolerance policy connects rounded displayed values to exact comparisons.           |
| FILT-07 | Express an open-ended interval by brushing to the edge. **Specific**, [T06], phrase “one-sided greater than 80.”                                        | **Partial**: range types and text inputs allow an omitted bound.                                   | Brush output remains a finite interval. It does not preserve “everything above this threshold” as data extents change.                   |
| FILT-08 | Use category distributions without losing uncommon or missing values. **Core**, [T06], [T09].                                                           | **Partial**: typed category options, missing groups, row/bar counts, and legends exist.            | No common top-values-plus-remainder picker. The collapsed remainder is not drillable.                                                    |
| FILT-09 | Search the intended fields and see why each row matches. **Core**, [T06], [T09].                                                                        | **Partial**: table search includes raw and calculated fields, including hidden fields.             | Internal IDs are excluded. No visible-field scope switch or match highlights.                                                            |
| FILT-10 | Offer richer text queries without surprising the basic user. **Candidate**, [T06], [T09].                                                               | **Missing** for fuzzy/token and unified-query modes.                                               | Exact substring search is a reasonable baseline. A query language is not justified merely because the transcript explores one.           |
| FILT-11 | Select calendar periods with clear date/time semantics. **Core**, [T07].                                                                                | **Partial**: ISO date filtering and calculations use UTC; date-only maximums include the full day. | No relative periods, month/year presets, calendar stepping, or time-of-day controls.                                                     |
| FILT-12 | Let the data guide useful date and numerical selections. **Specific / candidate**, [T06], [T07].                                                        | **Partial**: charts display numerical distributions.                                               | Table filters lack inline histograms and calendar counts. No data-density guidance, year-aware month choices, or natural-break grouping. |

Source evidence: [filter inventory](application-feature-inventory.md#filtering-and-chart-coordination), [common predicates](../packages/explorEDA/src/hooks/applyFilter.ts), [filter status](../packages/explorEDA/src/components/ActiveFilterStatus.tsx), [table filtering](../packages/explorEDA/src/components/charts/DataTable/filteredRows.ts).

The transcripts consider inclusive/exclusive endpoints and displayed precision without settling one universal rule. The current inclusive numeric range is a real policy. The unresolved gap is to expose and apply that policy consistently, rather than silently change it.

## Tables, field inspection, and formatting

The table notes cover both a generic unknown-schema explorer and specialized tables with known content. Those two products need different amounts of configuration.

| ID       | Desired outcome and intent                                                                                  | Current state                                                                                                     | Remaining gap                                                                                                                                               |
| -------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TABLE-01 | Choose fields, reorder them, and recover hidden fields. **Core**, [T02]. | **Partial**: searchable selection and sortable badges preserve widths for fields that stay selected. Rows state saves order and widths. | No header hide/context action, direct header reordering, or named column sets. |
| TABLE-02 | Give widths useful defaults and adjust them quickly. **Core**, [T02].                                       | **Partial**: name-based widths, pointer resize, and keyboard resize exist.                                        | No double-click auto-fit, content percentile fit, maximum-width policy for outliers, or explicit fit-to-container choice.                                   |
| TABLE-03 | Sort values in a sensible order and return to source order. **Core**, [T09].                                | **Partial**: numeric and natural single-column ascending/descending sort.                                         | No third reset state. Missing-value placement changes with direction. Multi-sort was not required as the default.                                           |
| TABLE-04 | Use clear field labels while retaining canonical names. **Core**, [T02], [T09].                             | **Present slice**: field settings retain canonical names and supply display labels and descriptions.               | No common-prefix cleanup or separate alias history.                                                                                                          |
| TABLE-05 | Format numbers, currency, dates, and units consistently. **Core**, [T02], [T08], [T09]. | **Partial**: shared formats reach data cells and many chart paths. | Summary badges and filter chips bypass shared formats. Pivot counts inherit measure formats (R19). Axis tick policies and local override indicators remain incomplete. |
| TABLE-06 | Read long text without losing the structure that matters. **Specific**, [T04].                              | **Partial**: compact cells and raw-value titles.                                                                  | No selectable truncation side, wrapping policy, multiline/code rendering, row-height control, or durable detail expansion.                                  |
| TABLE-07 | Render rich values in an appropriate cell. **Specific / parked**, [T04], [T05].                             | **Missing**.                                                                                                      | No tag arrays, image previews/carousels, sparklines, related-record cards, or typed cell renderers. JSON flattening removes much of the required structure. |
| TABLE-08 | Change the view when the data has very few rows or many columns. **Candidate**, [T01], [T19].               | **Missing**.                                                                                                      | No transposed record view, card layout, or automatic small-record presentation. The same table model remains in use.                                        |
| TABLE-09 | Keep interesting records or subsets for later. **Specific**, [T01].                                         | **Missing**.                                                                                                      | No row bookmarks, tags, breadcrumbs, or saved subset collection. Saving chart filters is a partial substitute only for a subset.                            |
| TABLE-10 | See calculated values with their source records. **Core**, [T11], [T13], [T15].                             | **Present**: cells, search, sort, filters, and CSV resolve calculated values. Cells open row-specific inspectors. | Errors have reasons. Formula chains and source values are inspectable. This does not explain an aggregate mark's contributors.                              |
| TABLE-11 | Export the records and values currently being inspected. **Specific; supports traceability**, [T11], [T15]. | **Present** for CSV of matching rows and selected fields in displayed order.                                      | Derived values and escaped headers are included. Export does not add error-reason columns.                                                                  |
| TABLE-12 | Apply color rules or edits only where the task needs them. **Candidate**, [T02], [T04], [T09].              | **Missing** for inline edit and general conditional formatting.                                                   | These are not universal table requirements. Derived-field-based color remains a possible simpler direction than an Excel-style rule engine.                 |

Source evidence: [table inventory](application-feature-inventory.md#data-table-and-rows-mode), [summary inventory](application-feature-inventory.md#summary-table), [column settings](../packages/explorEDA/src/components/charts/DataTable/DataTableSettingsPanel.tsx), [sortable selector](../packages/explorEDA/src/components/ui/multi-select.tsx), [CSV export](../packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx).

Column reordering exists in selected-field badges. Widths survive when fields stay selected. Remaining work concerns discovery, direct header controls, and auto-fit.

## Calculations and reusable transformations

The recurring intent is to perform math once, inspect the result, and reuse it. Per-row calculations and named grouped summaries cover bounded cases. Other chart aggregates remain separate implementations.

| ID      | Desired outcome and intent                                                                                                    | Current state                                                                                                                       | Remaining gap                                                                                                                                      |
| ------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| CALC-01 | Create a useful derived column from source values. **Core**, [T11], [T13].                                                    | **Present** for scalar columns: arithmetic, comparisons, logic, conditionals, functions, and dependencies.                          | Bracketed references support arbitrary field names. Group/window calculations are tracked separately in CALC-07/08.                                |
| CALC-02 | Trust validation before using a result. **Core**, [T09], [T15].                                                               | **Present**: live validation checks dependencies, functions, cycles, and source rows before Apply.                                  | Invalid formulas cannot replace saved definitions. Valid formulas can retain inspectable row failures.                                             |
| CALC-03 | Know why a result is missing or invalid. **Core**, [T09], [T15].                                                              | **Present**: saved/draft results, input values, row errors, paging, and failed-only rows are visible.                               | Evidence belongs to the current dataset and session. No durable execution history exists.                                                          |
| CALC-04 | Reuse documented functions consistently. **Specific**, [T11], [T17].                                                          | **Present**: searchable runtime function help and cursor insertion use the supported registry.                                      | Functions operate within one row. Group and array expressions remain outside the grammar.                                                          |
| CALC-05 | Edit a calculation and update every dependent result. **Core**, [T11], [T15].                                                 | **Present**: select chain steps, preview drafts, Apply one edit, and update dependent results under retained filters.               | Drafts survive closing and chain navigation within the session. Reload clears them. In-use rename/delete is blocked; consumer rewrites are absent. |
| CALC-06 | Use the same result in charts, tables, and exports. **Core**, [T11], [T15].                                                   | **Present**: tables and CSV resolve the same column values as charts and previews. Named grouped summaries also feed linked bar and table views. | Other chart aggregates remain local and are not shared outputs. |
| CALC-07 | Separate row calculations from group/window calculations. **Core**, [T11], [T16], [T17]. | **Partial**: scalar formulas and named one-field grouped count/sum/average summaries have distinct controls. | `sum(x, y)` remains a row expression. Window/rank functions and arbitrary grouped formulas remain absent. |
| CALC-08 | Inspect and reuse grouped tables, pivots, and statistics. **Core; full architecture exploratory**, [T11], [T13], [T15]–[T17]. | **Partial**: one named grouped summary supports count, sum, or average with reusable bar/table references and exact contributors. | Pivot, density, modeled, and general intermediate tables remain unavailable as shared outputs. |
| CALC-09 | Add regression, confidence bands, densities, and reference limits at the right scope. **Specific / candidate**, [T15], [T17]. | **Partial** for the box violin's internal density only.                                                                             | No reusable models, regression layers, confidence intervals, control limits, or global/per-facet/per-color scope selector.                         |
| CALC-10 | Keep transformations deterministic and interpretable. **Core**, [T15], [T18].                                                 | **Partial**: expressions, UTC date results, row errors, and some fixed-seed sampling exist.                                         | No execution history, source-version binding, or stable row-key contract. Reduction and layout outputs remain internal.                            |
| CALC-11 | Identify derived fields and inspect each scalar dependency in place. **Core**, [T08], [T15]; selected 2026-09-19 workflow.    | **Present**: ƒx markers, formula cards, row inputs/results, selectable upstream trees, downstream calculations, and affected views. | This trace covers scalar calculations. Aggregate contributors, chart transforms, and geometry remain TRACE-01–03 gaps.                             |

Source evidence: [calculation inventory](application-feature-inventory.md#calculations-and-data-transformations), [parser](../packages/explorEDA/src/lib/calculations/parser/semantics.ts), [evaluator](../packages/explorEDA/src/lib/calculations/engine/Calculator.ts), [calculation manager](../packages/explorEDA/src/lib/calculations/CalculationState.ts), [function registry](../packages/explorEDA/src/lib/calculations/functions/registry.ts).

The scalar calculation contract now has runtime and interaction evidence. The 10,000-order example contains 14 calculated fields and 14 panels. Its chain covers Gross sales, Discount amount, Net sales, Contribution, and Contribution rate. See the [workflow and limits](calculation-workflow.md).

A reusable transform system remains a separate design question. Named grouped summaries now provide one reusable output. They are separate from scalar formulas and do not establish a general transform graph.

## Facets, axes, and color

Faceting is one of the clearest transcript themes. The desired behavior goes beyond repeating a chart: comparison scales, selection scope, visible group choice, and manageable layout must remain coherent.

| ID       | Desired outcome and intent                                                                                                           | Current state                                                                              | Remaining gap                                                                                                                               |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| FACET-01 | Repeat a view by one or two fields. **Core**, [T14], [T16].                                                                          | **Present** for the five supported 2D chart families.                                      | No deeper nesting or explicit repeated list independent of a grouping field. Other registered views are not generally exposed for faceting. |
| FACET-02 | Share comparable axes by default. **Core**, [T14].                                                                                   | **Present**: all five supported families use full-source domains and category order.       | Field changes recompute domains. There is no alternate domain-population control.                                                           |
| FACET-03 | Choose between an XY selection everywhere and a selection inside one facet. **Specific**, [T14], phrase “filter in four dimensions.” | **Partial**: selections apply across all facets, with a visible scope label.               | This is the approved behavior for this pass. Facet-local selection remains a separate future option.                                        |
| FACET-04 | Filter through facet headers. **Specific**, [T14].                                                                                   | **Present slice**: wrap and grid headers toggle the parent chart's facet-field filter. | Facet-local selection remains separate from parent-field filtering. |
| FACET-05 | Choose and order visible facets without changing the underlying subset. **Specific**, [T14].                                         | **Partial**: `visibleFacetIds` selects and orders displayed groups; wrap and grid layouts page that ordered set. | No top-group selector, nesting, or separate durable pin workflow. |
| FACET-06 | Keep a chart readable without internal scrolling; inspect a small facet in detail. **Explicit preference**, [T14].                   | **Partial**: paging replaces internal scrolling, Focus opens one facet, and visibility selection limits the displayed set. | No nesting or pinned facet workflow. |
| FACET-07 | Preserve group identity across all data values. **Core correctness requirement**, [T14]–[T16].                                       | **Present**: typed tuple keys preserve category identity and separator-containing values.  | Null and undefined share the labeled missing group. Ambiguous text values use quotes.                                                       |
| SCALE-01 | Know whether scales describe all, working, or visible data. **Core**, [T12], [T15].                                                  | **Partial**: facet labels state full-source scales.                                        | No common scale-source switch. 3D axes retain their separate behavior.                                                                      |
| SCALE-02 | Zoom an axis and return to a stable comparison. **Specific**, [T14].                                                                 | **Missing** for common 2D charts.                                                          | Brush selection filters rows; it is not axis zoom. Axis min/max declarations are not a working universal domain control.                    |
| SCALE-03 | Choose meaningful linear, log, categorical, and date scales. **Specific**, [T11], [T14], [T18].                                      | **Partial**: linear, symlog, and categorical bands exist; saved validation accepts symlog. | True time/log behavior remains absent from the common numerical helper.                                                                     |
| SCALE-04 | Share formatting and units with clear local overrides. **Core**, [T08], [T15]. | **Partial**: field defaults and explicit axis-label overrides work. | R19 identifies display paths that bypass field defaults. Override origin and shared tick policies remain incomplete. |
| COLOR-01 | Keep category meaning consistent across views. **Core**, [T08], [T14].                                                               | **Partial**: chart-bound and source-field shared scales now resolve by scale ID/source field, with category editing and field formatting. | Scale creation follows effective field types. Line colors use a separate series model.    |
| COLOR-02 | Explain every non-obvious color encoding automatically. **Explicit preference**, [T14].                                              | **Partial**: colored charts show an automatic legend for their bound field and scale; the Color Legend view supports explicit fields. | No complete guarantee for every mark, line-series model, or scale explanation.                |
| COLOR-03 | Filter or emphasize data through the legend. **Specific**, [T14].                                                                    | **Partial**: legends filter typed categories and include missing values.                   | No numerical legend brush, linked hover emphasis, or clickable line-series legend.                                                          |

Source evidence: [facet inventory](application-feature-inventory.md#faceting), [facet layouts](../packages/explorEDA/src/components/charts/FacetRelated/), [axis/color inventory](application-feature-inventory.md#axes-colors-labels-and-common-settings), [numerical helper](../packages/explorEDA/src/components/charts/Axis/numericScale.ts).

The “never scroll a chart” preference is explicit evidence. Paging, ordered visibility, header filters, and Focus now protect readable facet layouts.

## Individual charts and advanced chart ideas

The chart transcripts often use one chart to test the proposed transformation model. Absence of each example is not equally significant.

| ID       | Chart job and intent                                                                                          | Current fit                                                                               | Remaining gap and commitment                                                                                                                                                                                                   |
| -------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CHART-01 | Draw supplied measurements as bars, while keeping count charts convenient. [T11], [T18].                      | **Partial**: bar supports histogram/category counts and read-only named grouped count/sum/average results. | Arbitrary Y measures, stacked/grouped bars, repeated-label raw bars, and general supplied-measure grammar remain missing. **Core distinction** between glyph and aggregate; a general grammar remains exploratory. |
| CHART-02 | Use a scatter plot to find relationships and inspect selected records. [T11], [T14], [T15].                   | **Partial**: Canvas points, color, hover, 2D brush, facets, and raw-data shortcut exist.  | Mark-to-row inspection, size encoding, jitter, regression, confidence bands, and density layers are missing. Record inspection is **core**; additional layers are **specific/candidate**.                                      |
| CHART-03 | Represent lines according to the data's shape. [T16], [T18]. | **Partial**: one line per Y column, ascending finite X order before reduction, retained missing-Y gaps, right axis, and X brush. | Long-format grouping, line per row, slope/parallel-coordinate forms, and date axes remain absent. **Specific** line semantics; general topology exploratory. |
| CHART-04 | Compare distributions and tune the density being shown. [T14], [T15], [T17].                                  | **Implemented slice**: boxes use observed Tukey endpoints, screen-space beeswarm distances, outliers, violin, bandwidth settings, and sampled beeswarm. | Statistics are not inspectable tables. No live local bandwidth interaction or contributor drill-down. **Core** trust and comparison; richer layering **candidate**. |
| CHART-05 | Inspect an aggregate and reuse or explain it. [T11], [T13], [T15].                                            | **Implemented slice**: pivot has eleven aggregations and contributor inspection; named grouped summaries support reusable count/sum/average bars and tables with contributors. | No totals, subtotal hierarchy, percentages, previous-period differences, pivot-as-source reuse, or general aggregate output graph. Broader aggregate reuse remains **core**; each derived measure is **specific**. |
| CHART-06 | Coordinate 3D exploration with other views. [T12], [T15].                                                     | **Partial**: 3D receives filters, supports camera movement, saves camera state, maps finite size values per point, and omits invalid coordinates. | No selecting/picking, labeled data scales, or point provenance. Broader 3D grammar is exploratory. |
| CHART-07 | Include tables, summaries, legends, and explanation as analytical views. [T09], [T13], [T14], adjacent [T19]. | **Present / partial** across four dedicated view types.                                   | Summary has no inline distributions; numerical legends lack brushing; text is static rich content. See TABLE, COLOR, and TRACE gaps.                                                                                            |
| CHART-08 | Build stacked/grouped/normalized bars and stacked areas from inspectable transforms. [T18].                   | **Missing**.                                                                              | No cumulative baselines, percentage transforms, stable stack ordering, dodging, stacked area, or streamgraph. **Exploratory chart examples** with clear transform requirements, not a committed catalogue.                     |
| CHART-09 | Represent hierarchies or multivariate rows with suitable layouts. [T18].                                      | **Missing**.                                                                              | No treemap, packing, hierarchy-aware aggregate policy, or parallel coordinates. **Exploratory**. The transcript uses these to test composition boundaries.                                                                     |
| CHART-10 | Make geometry transforms deterministic and distinct from data aggregation. [T18].                             | **Partial**: bins/statistics/reduction/sampling helpers exist.                            | No inspectable stacking, dodging, jitter, ordering, or glyph-position pipeline. **Core explainability goal**, but the general implementation remains open.                                                                     |

Source evidence: [full chart catalogue](application-feature-inventory.md#chart-and-view-catalogue), active [chart directories](../packages/explorEDA/src/components/charts/), [line reduction](../packages/explorEDA/src/lib/chartUtils.ts).

A useful boundary is already visible. Supporting a pre-aggregated bar table is a bounded capability. Building a universal scene compiler merely to support it would go beyond the settled scope.

## Traceability, declarative specifications, and reproducibility

The strongest repeated long-term requirement is to answer “how did this mark get here?” The answer must cover data, transformations, filters, scales, and defaults.

| ID       | Desired outcome and intent                                                                                                   | Current state                                                                                                                    | Remaining gap                                                                                                                                                                                        |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TRACE-01 | Select a mark and see its exact source contributors. **Core**, [T11], [T15]. | **Partial**: pivot cells and named grouped summaries expose positional source IDs, inputs, exclusions, aggregation, result, and errors. Scalar calculations expose their row chain. | IDs apply to the loaded snapshot; reordering or replacing rows changes identity. Ordinary histogram, box, violin, and line marks lack contributor mapping. |
| TRACE-02 | Inspect every intermediate table used to produce a result. **Core**, [T11], [T13], [T15].                                    | **Partial**: named grouped summaries expose one reusable grouped result table.                                                                 | Bins, pivot outputs, density samples, and reduced line points remain internal or chart-local arrays. They cannot all be inspected as named reusable outputs. |
| TRACE-03 | Explain every visible property, including default and scale choices. **Core**, [T15].                                        | **Partial**: field settings explain effective display values, calculated values explain scalar inputs, grouped results show exclusions, and facet headers state full-source scales. | No complete account of every aggregate step, default, override, scale population, or viewport-derived geometry. |
| TRACE-04 | Keep convenient chart controls connected to an inspectable expanded specification. **Candidate**, [T16], [T17].              | **Partial**: chart-specific settings form a declarative configuration.                                                           | No compiler from friendly controls to a common source/transform/filter/scale/glyph specification. User transforms cannot be substituted for built-in chart transforms.                               |
| TRACE-05 | Reproduce a chart independently from the current UI and renderer. **Specific / parked architecture**, [T15], [T16]. | **Partial**: settings restore against host rows; a full analysis bundle preserves rows with settings. | No source-version contract, renderer-neutral scene, or headless chart evaluation/export. The full bundle restores the application, not a renderer-independent provenance package. |
| TRACE-06 | Reuse grouping, repetition, and derived layers without forcing manual pipeline maintenance. **Candidate**, [T16], [T17].     | **Partial**: faceting repeats a registered renderer.                                                                             | No explicit-list repetition, group-object table inspector, inherited grouping scope for models, or shared layer graph.                                                                               |
| TRACE-07 | Reconcile intended behavior against evidence without losing the status of ideas. **Core process requirement**, [T10], [T20]. | **Partial**: this reconciliation links completed work, current source, automated checks, and browser evidence.                   | Evidence remains a dated snapshot. There is no automatic claim-to-proof synchronization.                                                                                                             |

Source evidence: [traceability inventory](application-feature-inventory.md#traceability-and-reproducibility), [chart data action](../packages/explorEDA/src/components/PlotChartPanel.tsx), [saved state](../packages/explorEDA/src/providers/DataLayerProvider.tsx), [chart registry](../packages/explorEDA/src/charts/registry.ts).

Pivot cells and grouped summaries now prove bounded contributor inspection. Extend that path to histogram bins and box groups before selecting a broader graph design.

## Performance, errors, and accessibility

The transcripts connect performance to data scope and repeated work. They also require useful interaction under real data, not just successful rendering of a small fixture.

| ID      | Desired outcome and intent                                                                                             | Current state                                                                                                             | Remaining gap                                                                                                                                                                                             |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PERF-01 | Keep interactive inspection fast for the loaded dataset. **Core**, [T01], [T13].                                       | **Partial**: the 2026-09-20 desktop walkthrough covered 10,000-row examples and the calculation example adds 14 derived fields. | No general capacity envelope. Main-thread scans and repeated arrays remain; interaction latency and memory need measurements. |
| PERF-02 | Compute shared results once and reuse them. **Core**, [T11], [T13], [T17]. | **Partial**: raw/derived caches and shared grouped definitions exist. | Each grouped-summary consumer calls the calculation again. Shared definitions do not mean shared execution. Other chart/facet transforms remain separate; measure cost before adding a cache. |
| PERF-03 | Move only necessary data and know when it is incomplete. **Candidate / parked**, [T13].                                | **Missing**.                                                                                                              | No server query protocol, projected columns, streaming, truncation disclosure, or on-demand record fetch.                                                                                                 |
| PERF-04 | Keep loading and long calculations understandable. **Specific**, [T13].                                                | **Partial**: demo fetch loading, cancellation, errors, and retry exist.                                                   | No local parse progress, calculation progress/cancellation, worker execution, or long-work feedback.                                                                                                      |
| PERF-05 | Base optimization decisions on representative proof. **Core method**, [T20] and September shape.                       | **Partial**: representative samples are documented, but they do not establish capacity. | No heap measurement, facet growth study, device sweep, or repeatable performance benchmark was run. |
| UX-01   | Explain bad fields and invalid calculations before they produce misleading views. **Core**, [T09], [T15]. | **Partial**: field conversion previews, calculation errors, pivot errors, and grouped exclusions are visible. | No common numeric eligibility policy (R18) or chart eligibility/error summary. |
| UX-02   | Preserve useful controls when a filter yields no data. **Core**, [T06], [T07].                                         | **Partial**: empty tables, summaries, and facet cells have paths.                                                         | All-invalid numerical charts, zero-range axes, and empty color domains need consistent visible behavior and targeted proof.                                                                               |
| UX-03   | Complete key tasks with clear controls and keyboard alternatives. **Core baseline; supported by [T02], [T09], [T20].** | **Partial**: calculation inspectors have named actions, editor focus return, keyboard Apply, and explicit draft controls. | Complete keyboard and screen-reader flows remain unverified. Canvas/WebGL marks and dashboard drag/brush alternatives still need work.                                                                    |
| UX-04   | Adapt presentation to the task and available space. **Specific**, [T01], [T14], [T19].                                 | **Partial**: source paths include desktop resizing, panel expansion, and adaptive ticks. Browser checks cover desktop panels and facet navigation. | Mobile remains parked in the September shape. Record-card modes remain absent; facet paging and focus now limit crowding. |

Source evidence: [performance inventory](application-feature-inventory.md#performance-and-resource-use), [accessibility/error inventory](application-feature-inventory.md#accessibility-errors-and-supported-screens), [package test scripts](../packages/explorEDA/package.json).

The current code does not support an honest claim such as “works with a million rows.” It also does not prove that its present optimizations are inadequate. Capacity remains a measurement question.

## Verified mismatches and source-derived risks

These findings concern behavior already exposed or supported by the current model. They are separate from missing future features.

### Original probes and current results

The original probes ran on the baseline above. The repair pass replaces those failures with focused checks.

| ID  | Original concern                                         | Current result and evidence                                                                            |
| --- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| V01 | Comparisons and logic parsed but failed at runtime.      | Current evaluator checks cover correct results and short-circuit behavior. |
| V02 | An if/then expression failed on its comparison.          | Conditional branches evaluate lazily, including function calls and strings.                            |
| V03 | Function documentation differed from the runtime.        | Active help uses the runtime registry. Unsupported names fail before saving. Functions remain per-row. |
| V04 | Quoted text was treated as a field.                      | Quoted literals and field references remain distinct through evaluation.                               |
| V05 | Saved validation rejected symlog.                        | Validation now accepts the exposed scale option.                                                       |
| V06 | Date-only formatting returned the prior year in Indiana. | Current checks cover UTC date formatting and extraction. |
| V07 | Category labels could change the selected source type.   | Chart and table actions retain raw values. Number 1 and text "1" select separate groups.               |

### Implemented slices with historical browser evidence

The approved source changes address these findings. Historical browser evidence remains under [Audit limits](#audit-limits); current integration evidence is recorded separately there.

- R09: line input is ordered by ascending finite X values before rendering and reduction. Historical browser proof: [Audit limits](#audit-limits).
- R10: Tukey whiskers use the observed values nearest the theoretical fences. Historical browser proof: [Audit limits](#audit-limits).
- R15: `singleValue` reports a cell-local error and leaves other pivot cells available. Historical browser proof: [Audit limits](#audit-limits).

### Integration findings and repair status

| ID  | Trigger or path                                                          | Source evidence and likely result                                                                                                            | Evidence level                                                                                                 |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| R01 | Edit a calculated field used by an active range filter.                  | Fixed: edits preserve thresholds and rebuild predicates from new calculated values.                                                          | Provider integration test; browser threshold check.                                                            |
| R02 | Replace saved state containing calculated-field filters.                 | Fixed: restore validates and installs calculations before chart predicates.                                                                  | Provider restore test, including a retained derived threshold.                                                 |
| R03 | Put a calculated column in a data table.                                 | Fixed in source: table display, search, sort, filters, and CSV resolve calculated columns.                                                  | Provider, table, and CSV checks plus the dated browser walkthrough are historical; current integration status is in [Audit limits](#audit-limits). |
| R04 | Rename, delete, or create circular calculations.                         | Fixed: cycles, bad dependencies, and name collisions fail before mutation. In-use rename/delete is blocked.                                  | Calculation manager regression checks and source review.                                                       |
| R05 | Compare line facets with different numerical ranges.                     | Fixed in source: line facets share full-source X and both Y domains.                                                                         | The dated regional facet browser check is historical; current integration status is in [Audit limits](#audit-limits). |
| R06 | Change fields or facet groups after a broad domain was registered.       | Fixed: domains derive directly from current source fields; the accumulating provider was removed.                                            | Source-path review. Complete field/facet combination matrix remains untested.                                  |
| R07 | Use mixed typed facet values or values containing `__`.                  | Fixed: grouping uses typed tuple keys without separator splitting.                                                                           | Mixed-type, separator, and prototype-name fixture.                                                             |
| R08 | Force numerical bar values to categories; select missing row categories. | Fixed: bar, row, box, legend, and table category paths retain source values.                                                                 | Real row/bar selection tests, table options, and legend predicate checks.                                      |
| R09 | Supply unsorted X values to a small line series.                         | Implemented: line input is ordered by ascending finite X values before rendering and reduction.                                           | Historical browser proof: [Audit limits](#audit-limits). |
| R10 | Interpret Tukey whiskers as observed values inside the fences.           | Implemented: Tukey endpoints select observed values nearest the theoretical fences.                                                       | Historical browser proof: [Audit limits](#audit-limits). |
| R11 | Turn on beeswarm with different value ranges.                            | Fixed in source: collision distance uses screen-space Y through the chart scale.                                                          | Geometry regression and browser comparison pass for Small (0–0.19) and Large (0–19000) ranges. |
| R12 | Use a 3D size field or rows with missing coordinates.                    | Fixed in source: finite size values map per point, and invalid coordinates are omitted with a count.                                      | Browser fixture omits two invalid coordinate rows and shows different point sizes. |
| R13 | Sort a table, then export it; use punctuation in field names.            | Fixed: export receives sorted, filtered, resolved rows. Headers and summary text escape quotes.                                              | Known-answer CSV check. Browser download inspection remains tool-dependent.                                    |
| R14 | Reorder or change selected table columns after resizing.                 | Implemented: provider-owned Rows settings preserve filters, search, sort, column order, and widths through selection changes.              | Browser status: [Audit limits](#audit-limits).                                                              |
| R15 | Use `singleValue` on a pivot group containing several values.            | Implemented: the cell records an error and the pivot keeps the other cells available.                                                     | Historical browser proof: [Audit limits](#audit-limits). |
| R16 | Replace a dataset with more or fewer rows while using facets. | Fixed in the first linked-task round: the all-ID hook subscribes to source data. | Provider replacement test checks current IDs and facet groups after growth and shrinkage. |
| R17 | Use NaN, Infinity, or -Infinity as host-supplied numeric categories. | Fixed in the first linked-task round: keys remain distinct; shared membership and removal preserve category identity. | Category selection and shared filter regression checks. Numeric range filters still exclude non-finite values. |
| R18 | Inspect an automatically inferred numeric field containing whitespace or nonfinite values. | Fixed: one shared rule in `lib/numeric.ts` treats blanks as missing and excludes nonfinite values. Summary, bins, boxes, scatter, line, 3D, and grouped results agree. | `src/lib/numeric.test.ts` compares profiles, bins, boxes, and grouped averages on one mixed-input group. |
| R19 | Apply currency/precision settings, then inspect Summary badges, filter chips, and pivot counts. | **Open display gap:** badges and chips bypass shared formatting. Pivot counts inherit measure-field formats, which can mislabel units. | Current source trace. No fresh browser reproduction. |

Source map for these findings: [provider](../packages/explorEDA/src/providers/DataLayerProvider.tsx), [calculation manager](../packages/explorEDA/src/lib/calculations/CalculationState.ts), [table](../packages/explorEDA/src/components/charts/DataTable/), [facets](../packages/explorEDA/src/components/charts/FacetRelated/), [line helpers](../packages/explorEDA/src/lib/chartUtils.ts), [box files](../packages/explorEDA/src/components/charts/BoxPlot/), [3D points](../packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterPoints.tsx), [pivot aggregates](../packages/explorEDA/src/components/charts/PivotTable/utils/calculations.ts).

### New open findings from this review

**R18 — numeric eligibility disagreed across views (now fixed).** The probe used raw source values without field overrides. It executed current inference, statistics, and grouped-average functions on identical rows.

| Values in one group | Summary statistics | Grouped average | Why it matters |
| ------------------- | ------------------ | --------------- | -------------- |
| `10, 20, " "` | Min `0`, mean `10`, missing count `0` | `15`; whitespace excluded as blank | A blank becomes a measurement in Summary. Its range and exported mean disagree with the grouped result. |
| `10, 20, Infinity` | Max/mean `Infinity`, standard deviation `NaN` | `15`; infinity excluded | Host rows can carry nonfinite values. The full-analysis codec preserves them, so this input is within the supported boundary. |

[Type inference](../packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts) accepts these columns as numeric. [Statistics](../packages/explorEDA/src/components/SummaryTable/utils/statisticsCalculator.ts) use `Number` and reject only `NaN`. [Grouped inputs](../packages/explorEDA/src/lib/aggregates.ts) reject blanks and all nonfinite numbers. Ordinary chart paths also contain separate numeric conversions.

Repair this before adding distributions. Reuse the existing numeric eligibility rule where numeric analysis needs it. Preserve raw values and explicit categorical choices. Show excluded counts separately from valid measurements. One regression should compare profiles, bins, boxes, and grouped results on the same mixed-input fixture.

The repair moved the grouped-input rule into [numeric eligibility](../packages/explorEDA/src/lib/numeric.ts). Type inference, Summary statistics, bar bins, box plots, scatter, line, 3D, pivots, and grouped summaries now call it. Blank strings count as missing. Nonfinite values stay in a numeric field but are counted as excluded, and field details show that count. Explicit categorical fields keep their raw values.

**R19 — display formatting still needs consistent scope and units.** [Summary badges](../packages/explorEDA/src/components/SummaryTable/components/CompactSummaryTable.tsx) pass raw min/max values to `StatBadge`. [Active-filter chips](../packages/explorEDA/src/components/ActiveFilterStatus.tsx) use a separate formatter and canonical field names.

For example, USD with two decimal places formats table values but leaves a Summary minimum such as `12.5` unformatted. Complete these paths during field inspection work. Keep exact filter thresholds available when display rounding makes bounds look equal.

[Pivot cell formatting](../packages/explorEDA/src/components/charts/PivotTable/PivotTable.tsx) applies measure-field formats without checking aggregation type. Source review therefore predicts a currency label on a count of currency values. Counts need count formatting; sums and averages can retain measure units. Confirm both in the next browser pass.

## Intent tensions and scope decisions

These are decisions to preserve, not contradictions to conceal.

| Tension                                                       | Evidence                                                                                                      | Reconciled reading                                                                                                                             |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Simple exploration versus general visualization grammar       | [T12] seeks good defaults; [T15]–[T18] examine a broad spec system.                                           | The product should remain easy to use. A common internal representation is a candidate means, not the first user-facing requirement.           |
| One source now versus related sources later                   | [T11], [T13], [T15] discuss source grain and relationships. September shape parks joins and multiple sources. | Record the missing capability without classifying its absence as a failure of the current slice.                                               |
| Fixed scales versus visible-data autoscaling                  | [T12] favors stable working-data domains; [T14] wants zoom and comparison controls.                           | Stable domains are a good current default. An explicit alternate population or zoom mode is separate work.                                     |
| No internal chart scrolling versus readable minimum cells     | [T14] says never force chart scrolling; current layouts enforce minimum dimensions.                           | Paging, ordered visible groups, header filters, and facet Focus resolve the current crowding path. Layouts reserve space for headers, paging controls, and axis labels. |
| Count defaults versus raw glyph inputs                        | [T11], [T18] distinguish counting from drawing bars.                                                          | Preserve convenient histograms. Add a clear measure/pre-aggregated path only when needed, without redefining count semantics silently.         |
| Save everything versus keep filters temporary                 | [T08] wants configuration preserved; [T12] separates view saving and filters.                                 | Save broad state by default, but make inclusion of transient filters an explicit product choice.                                               |
| One universal table versus task-specific rich tables          | [T02]–[T05] describe advanced cells; [T09] favors restrained known-schema tables.                             | Scalar EDA remains the baseline. Specialized renderers should follow actual datasets.                                                          |
| Fuzzy or textual query power versus predictable controls      | [T06] explores a single query; [T09] prefers simple defaults.                                                 | Keep substring and typed controls understandable. Do not infer that a query language is mandatory.                                             |
| Shared defaults versus complicated inheritance                | [T08] wants common field formatting but cautions against excessive corporate hierarchy.                       | A field default plus local override could meet the outcome. A multi-level policy system is not implied.                                        |
| Fully separate computation/rendering versus linked provenance | [T15] wants renderer independence while retaining the full explanation chain.                                 | Merely moving helpers into files does not achieve the intent. Their inputs and outputs must remain connected and inspectable.                  |
| Reusable components versus custom interaction                 | [T10], [T19], [T20] explore reuse and deterministic templates.                                                | Reuse the existing package boundary. A templating DSL, skill marketplace, recipe renderer, or resume workflow is not an explorEDA feature gap. |

Several choices remain genuinely open in the transcripts: general transform specifications, how friendly controls expand into a spec, and how layer scope inherits facet/color grouping. The named grouped-summary boundary is documented here without selecting a broader architecture.

## Suggested order and decisive proof scenarios

### Work to remove from the next-feature backlog

| Completed slice                        | Current proof                                                                                           | Boundary                                                        |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| Calculation execution and validation   | Arithmetic, conditionals, dependencies, UTC dates, partial failures, and invalid replacement checks.    | Scalar functions only.                                          |
| Shared derived values                  | Tables, search, sorting, filters, summaries, and CSV use calculated values.                             | CSV error-reason columns are absent.                            |
| Filter repair                          | Formula edits retain thresholds. Clear all resets chart filters, table searches, and Rows restrictions. | No filter islands or row-exclusion explanation.                 |
| Category identity and facet comparison | Typed selections and tuple grouping have checks. Supported 2D facets use full-source domains, facet-header filters, and ordered visible groups. | Facet-local pinning and nesting remain open. |
| Calculation inspection and editing     | In-place markers/cards, row previews, upstream trees, downstream uses, and explicit Apply.              | Drafts remain session-local. Broader mark provenance remains open. |
| Chart semantics and pivot inspection | Lines use ordered X values and preserve gaps. Tukey whiskers use observed endpoints. Pivot errors stay local and contributors are inspectable. | Ordinary bins, boxes, and other marks still lack contributor inspection. |
| JSON save and restore | Settings JSON supports embedding. Full analysis JSON preserves source values. Rows order, widths, filters, and searches restore. | Durable host storage, source identity, and draft persistence remain separate. |
| Field settings and formatting | Conversion previews retain raw rows and apply valid values; many table/chart paths share display settings. | R18 numeric eligibility, R19 formatting gaps, inline distributions, and import preflight remain open. |
| Named grouped summaries | One saved count/sum/average definition feeds bars and tables with exact contributor inspection. | One group field; broader transformations remain open. |
| Chart and facet consistency | Ordered visible facets, paging, header filters, Focus, bound legends, beeswarm spacing, and 3D omission/size behavior have evidence. | No facet-local selection, pinning, line-series color unification, or 3D picking. |
| Representative examples                | Shop: 10,000 rows, 16 fields, 15 panels. Calculated orders: 14 extra fields, 14 panels.                 | These are product examples, not capacity benchmarks.            |

The prior proof list mixed completed source slices with future scenarios. Focused checks cover several changes; browser results and limits appear under [Audit limits](#audit-limits).

### Remaining priority order

| Rank | Priority and remaining gap | Why this order | Smallest decisive proof |
| ---- | -------------------------- | -------------- | ----------------------- |
| 1 | **Done: Numeric eligibility repair** (R18, DATA-02, UX-01/02) | Existing views can disagree on a basic result. New distributions would expose or copy that disagreement. | Use `10`, `20`, whitespace, null, and nonfinite inputs. Numeric views agree on eligible IDs and counts; grouped average stays `15`. Explicit categories retain their raw identity. |
| 2 | **P2: Inline field distributions and consistent display** (DATA-02, FILT-12, TABLE-05, R19) | This completes the first inspection loop using existing profiles and field controls. | Inspect a numeric field and a category. Show distributions, population scope, missing/failed counts, and shared formats. Use existing filter controls; counts agree across Summary, Rows, and a chart. |
| 3 | **P2: Histogram and box contributor inspection** (TRACE-01/02/03, CHART-01/04) | It extends a working inspection pattern and exposes the meaning of current marks. | Inspect a bin boundary and a box group. Show exact source IDs, exclusions, bin bounds, quartiles, whiskers, and outliers. Recompute the displayed result. |
| 4 | **P2: Calendar filtering and real time axes** (FILT-11, SCALE-03, CHART-03) | Date conversion and date inputs work, but line X values still use numeric conversion and common scales lack time behavior. | Mix date-only and offset timestamps across a month boundary. A month/year filter and UTC time axis agree before and after JSON restore. |
| 5 | **P2: Explain and navigate the active subset** (FILT-01/02/03/06, UX-03) | Scope labels help, but users cannot jump from a chip to its owner or explain an empty intersection. | Combine two filters on one field, reach each owner by keyboard, inspect exact bounds, and clear the empty intersection. Keep row-level exclusion tracing as a later extension. |
| 6 | **P3: One further reusable transformation** (DATA-08, CALC-08/09, TRACE-02/06) | Grouped summaries already prove reuse. Broader infrastructure needs a concrete consumer and analytical question. | Select one use case, such as pivot output feeding another chart. Expose its result table and reproduce it from source rows before generalizing. |

P1 means repair before feature work. P2 means the next bounded product slices. P3 means defer until a concrete need justifies it. These priorities do not approve implementation.

The chart semantics, save/restore codec, Rows state, field settings, grouped summaries, and pivot contributor inspector are implemented slices. Facet navigation, bound legends, beeswarm geometry, and 3D omission/size controls are also implemented within the stated boundaries. Runtime status is recorded under [Audit limits](#audit-limits).

**Recommendation: R18 is repaired; build the rank-2 field inspection slice next.** Keep the existing field inspector, profiles, histogram bins, formatter, and filter ownership. Do not combine this with import preflight, a schema catalogue, or a new filtering model.

### Concrete next steps

1. Align numeric eligibility in profiles and existing chart paths. Add one mixed-input regression and verify excluded counts.
2. Add a compact numeric histogram and category frequency view to field inspection. Label full-source and filtered populations clearly.
3. Complete Summary and filter-chip formatting. Give pivot counts count units. Preserve exact thresholds and raw category identity.
4. Verify the public package flow: inspect, filter, reset, copy settings, and restore. Include empty, constant, and all-invalid fields.
5. Ship that slice before starting histogram contributor inspection. Add box contributors in a separate small follow-up.

Carry keyboard operation and clear empty states into each slice. Run a focused screen-reader pass on field inspection and contributor dialogs. Measure load, filter, preview/Apply, scrolling, and memory on the existing 10,000-row examples. Add performance machinery only after those measurements identify a problem.

Import preflight and durable source metadata remain useful follow-ups, not prerequisites. Relative date periods need an explicit saved reference time. Start date work with fixed month/year ranges and UTC axes.

### Save/reopen handoff

Primary embedding uses `SavedDataStructure`: copied settings JSON can be passed as `savedData` with the current host `data`. `onStateChange` emits the same storage-neutral settings shape. It includes charts, applied calculations as formula strings, colors, layout, provider-owned Rows filters, search, sort, column order, widths, field settings, and grouped definitions. Native settings JSON rejects nonfinite filter values during validation. Draft formulas remain session-local.

The secondary `SavedAnalysisStructure` contains `data` and `settings`. Its codec preserves `undefined`, `NaN`, `Infinity`, and `-Infinity` raw row values through tagged `specialValues`, and hosts can parse it with `parseSavedAnalysis` when imported rows must reopen with the analysis. Neither shape provides durable named or server storage; the host owns that boundary. `modifiedAt` records the snapshot time.

The earlier product answer requires imported rows and the exact applied analysis, including active filters and searches. The full bundle addresses that requirement; settings-only restore addresses the primary embedded-library case.

The implemented contract covers:

1. Copy settings JSON and restore it against current host rows.
2. For a full bundle, save the loaded rows with package state.
3. Preserve Rows filters, search, sorting, column order, and widths (R14).
4. Preserve applied calculations, charts, layout, colors, and camera settings.
5. Validate the complete incoming state before replacing the current state.
6. Keep formula drafts session-local.

Use the existing single-source model. A manual copy/open path is the current integration boundary. Server storage, autosave, URL sharing, history, filter-free templates, and multiple saved analyses remain parked until a demonstrated need.

The decisive check uses imported rows rather than a reloadable example URL. Record source row values, active subset IDs, a derived result, Rows settings, and chart settings before saving. Compare them after settings restore and full-bundle reopen. Also try invalid saved JSON and verify that the current analysis remains intact.

### Later scope and measurement

A reusable pivot output or grouped regression should define one concrete transformation boundary before broader infrastructure. Named grouped measure bars already exist; arbitrary supplied-measure bars remain a separate extension.

Multi-source joins, server projection, renderer-independent scenes, general repeat/layer specifications, rich cell plugins, and advanced chart families remain parked or exploratory.

Measure load time, filter latency, preview/Apply latency, table scroll, and memory on the existing examples. Vary rows, fields, charts, and facets separately. Record the device and data shape. Do not infer capacity from one successful walkthrough.

## Transcript coverage ledger

Every copied transcript is accounted for below. Phrases are short retrieval anchors, not edited requirements. The linked files retain the complete source wording and context. [Archive provenance](transcripts/README.md) maps each copy to its original voice-memo path.

### Interactive tables

| Source                                        | Covered regions and retrieval anchors                                                                                                                                                                                                                                           | Reconciliation                                                                                                                                         |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| [T01: Interactive data table explorer][T01]   | Dataset shape; few-row alternatives; linked graphical filtering; interesting rows/subsets; “store little bookmarks or breadcrumbs.”                                                                                                                                             | DATA-01, TABLE-08/09, FILT-01. Bookmarks are a distinct outcome, not equivalent to chart duplication.                                                  |
| [T02: Table column controls][T02]             | Show/hide/order; unknown-field inspection; aliases; width defaults; auto-fit; resizing; reordering; formatting; conditional colors. Anchors: “ability to alias or label things,” “double click its column header border.”                                                       | TABLE-01–05/12, DATA-02, SCALE-04. Width algorithms are candidates. Shared labels and usable controls are the outcomes.                                |
| [T03: Interactive data table controls][T03]   | Short framing note about controls for displayed rows.                                                                                                                                                                                                                           | Context for FILT and TABLE sections. No distinct requirement beyond the longer notes.                                                                  |
| [T04: Interactive data table rows][T04]       | Row height; truncation location; wrapping; code/newlines; expanded content; image inspection; sparkline arrays; possible editing. Anchors: “when the text is truncated,” “24 values.”                                                                                           | TABLE-06/07/12. Rich-cell and editing ideas remain conditional on real content.                                                                        |
| [T05: Rich data inside table cells][T05]      | Tags as one collection; related entity details; branch context; historical sparklines; expanded detail cards.                                                                                                                                                                   | TABLE-07 and DATA-01/04. Flattened JSON is not an implementation of rich cells.                                                                        |
| [T06: Table filtering and distributions][T06] | Global/field search; scope and counts; AND/OR; fuzzy search; match emphasis; query syntax; numeric ranges; precision; category cardinality; graphical distributions; open-ended edges. Anchors: “you have to back it up with text inputs,” “one-sided greater than 80.”         | FILT-01–10/12, TABLE-10, CALC-03. Query syntax and fuzzy matching are candidates, not mandatory defaults.                                              |
| [T07: Date filtering patterns][T07]           | Dates versus timestamps; UTC preference; relative/calendar windows; stepping periods; meaningful granularity; year/month selection; calendar distribution; unusual breaks and domain filters. Anchors: “we're gonna store all dates in UTC,” “slide the window left and right.” | FILT-11/12, CALC-10, SCALE-03, V06. Server/client timezone discussion informs the contract; this audit does not allege an SSR bug in the current demo. |
| [T08: Saved table views and formatting][T08]  | Save all meaningful choices; URL versus named views; scope; autosave; checkpoints; widths; formatting inheritance; colors; local overrides; near-result editing. Anchors: “answer is everything,” “as close to the display as possible.”                                        | DASH-03–07, TABLE-05, SCALE-04, COLOR-01. Large organizational inheritance is not promoted into a requirement.                                         |
| [T09: Data table defaults and schemas][T09]   | Known versus unknown schema; restrained controls; sort reset; natural order; search defaults; type-aware filters; null inspection; inference correction; aliases; chart creation; warn before failure. Anchors: “third state of reset back to default,” “50 of them are null.”  | DATA-02/03, DASH-01, FILT-08–10, TABLE-03–05, UX-01. This source supports a strong scalar baseline before a rich table framework.                      |

### Dashboards and chart systems

| Source                                                  | Covered regions and retrieval anchors                                                                                                                                                                                                                                                                                                                                                           | Reconciliation                                                                                                                               |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| [T11: Data visualization system design][T11]            | Source tables and grain; transformations; raw glyphs versus aggregate templates; counts and supplied measures; one computation reused by charts/tables; scale provenance; pivot percentages/differences. Anchors: “bar count chart,” “do the math one time,” “Show me exactly how it got there.”                                                                                                | DATA-04/05/08, CALC-06–09, CHART-01/05, TRACE-01–03. PCA and other advanced transforms are examples, not individually committed features.    |
| [T12: Dashboarding, filtering, and chart defaults][T12] | Fast chart creation; all/working/visible populations; server versus local constraints; filter islands; analysis tabs; stable scales; own-chart context; same-field filters; funnel and ownership; manual brush inputs; save views apart from filters. Anchors: “all data, working data, visible data,” “jump to the chart,” “disentangle the view saving from the filtering.”                   | DASH-01/02/06/08, DATA-06/07, FILT-01–07, SCALE-01. Existing Crossfilter behavior is credited; missing explanatory controls remain gaps.     |
| [T13: Data transforms, loading, and source tables][T13] | Templates and transforms; needed-column selection; loaded versus available data; server filtering/aggregation; source catalogue; schema and relationships; statistics; field actions; quality and missing-data analysis. Anchors: “eight of the possible 92 columns,” “which keys are mismatched.”                                                                                              | DATA-02–09, DASH-01, CALC-08, PERF-01–04, TRACE-02. Missing expected observations and join diagnostics exceed current null counts.           |
| [T14: Faceting and shared scales][T14]                  | Facet dimensions; color/facet swaps; global XY versus facet-key selection; header filters; shared position/color/size; labels; legends; zoom; facet focus/pinning; nesting; crowding; no-scroll preference; visible group selection; chart suitability. Anchors: “filter in four dimensions,” “You can never force a chart to have a scroll bar,” “always default to showing a colored legend.” | FACET-01–07, SCALE-01/02, COLOR-01–03, CHART-02/04. Chart suitability examples do not imply that every view must facet.                      |
| [T15: Visualization traceability and dataflow][T15]     | Full mark explanation; intermediate tables; user/built-in transform parity; scope of regression/limits; source grain; filter groups; independent reproduction; server/no-DOM rendering; parameter origins; linked compute/render stages. Anchors: “complete traceability,” “server-side without any actual rendering capability.”                                                               | TRACE-01–06, DATA-04/05, FILT-05, CALC-03/08–10. Saved JSON alone does not meet this intent.                                                 |
| [T16: Spec-driven interactive visualization][T16]       | Sources/transforms/filters/axes specification; defaults; explicit repetition versus data grouping; row versus column series; derived regression layers; inspectable grouped tables.                                                                                                                                                                                                             | TRACE-04/06, CALC-07–09, CHART-03. Public spec structure and group representation remain open design questions.                              |
| [T17: Chart specs, grouping, and derived layers][T17]   | Color encoding versus actual grouping; regression and confidence/density outputs; local bandwidth controls; facet-by-color scope; friendly controls expanding to a spec.                                                                                                                                                                                                                        | CALC-08/09, DASH-07, TRACE-04/06, CHART-04. This note questions how much grouping machinery should be exposed.                               |
| [T18: Advanced chart specs and transforms][T18]         | Count transforms; raw pivot inputs; stacked baselines before scale conversion; order; normalized stacks; area/stream shapes; grouped spacing; missing categories; hierarchy/treemap aggregation; parallel coordinates; deterministic jitter.                                                                                                                                                    | CHART-01/03/08–10, CALC-10, TRACE-02/03. These are architecture stress cases and possible chart families, not a blanket delivery commitment. |

### Adjacent design notes

| Source                                                  | Covered regions and retrieval anchors                                                                                                                                                                                                                                      | Disposition                                                                                                                                                                 |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [T10: Reusable interactive component requirements][T10] | Requirements catalogue; comparisons; baseline versus preference; conditional features; source evidence; reusable components/skills; progressive disclosure.                                                                                                                | Applied to the audit method and status distinctions. A skill catalogue or publication workflow is outside explorEDA's feature scope.                                        |
| [T19: Deterministic UI templating][T19]                 | Table/file rendering; Markdown; structured repeated content; recipe and GitHub examples; semantic styles; responsive layouts; actions; editable binding; terse templates versus full components. Anchor: “content templating layer.”                                       | Relevant to TABLE-08, explanation panels, and reuse boundaries. A UI DSL, recipe app, diff viewer, and email client are adjacent examples, not missing analytical features. |
| [T20: UI complexity and component boundaries][T20]      | Simple controls versus custom interactive components; state ownership; reference components; stale plans; granularity; explicit user flows; evidence-to-output examples; simplest useful implementation. Anchors: “no real differentiation,” “simplest dumbest user flow.” | Applied to TRACE-07, PERF-05, UX-03, and the proof scenarios. Soccer scheduling and resume generation remain outside this application.                                      |

The archive README mentions an empty recording and a short audio test that were not copied into this folder. They contain no product requirements and are outside this twenty-file comparison.

## Audit limits

Historical proof for unchanged paths: On 2026-09-20, a six-row fixture reproduced pivot sums 22, 7, and 9, including one group without valid numbers. A conflicting `singleValue` cell preserved other cells and exposed its two source rows. Lines followed numeric X order, retained the missing-Y gap, and showed the expected hover value. The Tukey fixture used an observed upper whisker of 4 and an outlier of 100.

Historical JSON proof: Settings export restored an edited `X * 3` formula and produced 90 for X=30. Settings and full-analysis restore preserved source rows, filters, sort, hidden columns, and widths. Invalid formulas and unknown fields preserved the current state. Valid imports worked after each error. These records cover unchanged line, pivot, Tukey, and JSON paths.

Fresh validation in this review passed: `pnpm check` ran both builds, type checks, 198 package tests, and 11 demo tests. `pnpm --filter exploreda verify:lean` passed at 742,700 bytes (162,128 bytes gzip). Existing build warnings concern mixed CommonJS exports and demo chunk size; they did not fail the checks.

The separate R18 probe executed the current TypeScript functions through the installed TypeScript transpiler. Its known inputs and observed outputs appear above. The passing suite does not cover that cross-view mismatch. R19 is source-derived. Neither finding was browser-tested during this review.

The linked task recorded these browser checks on 2026-09-20. They remain historical evidence for the reviewed implementation:

- Numeric, boolean, and date corrections showed valid, missing, and failed values before Apply. Raw rows survived full-analysis restore.
- Shared labels, units, precision, and currency formatting preserved exact calculation results. Field changes cleared only that field's filters.
- Grouped summaries reproduced sums 20 and 25.25, then averages 10 and 12.625. Zero, negative, and all-invalid groups remained distinct.
- Shared definitions survived edits and JSON restore. Invalid JSON and dangling references preserved the current analysis. Referenced deletion showed a useful error.
- Result paging reached all 66 groups. Contributor paging reached all 56 rows in one group, with exact inputs and exclusions.
- Rounded categories remained separately selectable. Beeswarm spacing matched across different units. The 3D fixture omitted two invalid rows and displayed different sizes.
- Facet visibility, paging, focus, and keyboard header selection worked. Default and expanded grid/wrap views kept complete axis labels.
- Color-scale rename retained chart colors, legends, and shared IDs. Generated labels followed field changes; explicit overrides remained intact.

That task's final browser console had no errors or warnings. Browser CSV download inspection did not complete; known-answer export tests passed. Full-page captures lost paint for large facet states, so visual checks used viewport captures.

The linked task began a separate beeswarm-example update during this review. Its pending edits are outside the completed-work boundary above. This review does not change or commit those files.

This review is not a screen-reader audit, capacity benchmark, or deployment test.

There is no meaningful single “percent complete” for these transcripts. They mix strong current product goals, parked scope, candidate designs, and examples. Counting every mentioned chart or architecture idea equally would create a misleading denominator.

The transcript ledger retains the dated source context. Remaining work separates the confirmed numeric mismatch, display gaps, product extensions, verification limits, and parked architecture. Completed JSON restore and grouped-summary reuse are no longer missing-feature claims.

[T01]: transcripts/2026-06-25-interactive-data-table-explorer.txt
[T02]: transcripts/2026-06-25-table-column-controls.txt
[T03]: transcripts/2026-06-25-interactive-data-table-controls.txt
[T04]: transcripts/2026-06-26-interactive-data-table-rows.txt
[T05]: transcripts/2026-06-26-rich-data-inside-table-cells.txt
[T06]: transcripts/2026-06-28-table-filtering-and-distributions.txt
[T07]: transcripts/2026-06-29-date-filtering-patterns.txt
[T08]: transcripts/2026-06-29-saved-table-views-and-formatting.txt
[T09]: transcripts/2026-06-29-data-table-defaults-and-schemas.txt
[T10]: transcripts/2026-07-13-reusable-interactive-component-requirements.txt
[T11]: transcripts/2026-07-26-data-visualization-system-design.txt
[T12]: transcripts/2026-07-28-dashboarding-filtering-and-chart-defaults.txt
[T13]: transcripts/2026-07-28-data-transforms-loading-and-source-tables.txt
[T14]: transcripts/2026-07-29-faceting-and-shared-scales.txt
[T15]: transcripts/2026-08-02-visualization-traceability-and-dataflow.txt
[T16]: transcripts/2026-08-03-spec-driven-interactive-visualization.txt
[T17]: transcripts/2026-08-04-chart-specs-grouping-and-derived-layers.txt
[T18]: transcripts/2026-08-04-advanced-chart-specs-and-transforms.txt
[T19]: transcripts/2026-08-25-deterministic-ui-templating.txt
[T20]: transcripts/2026-08-27-ui-complexity-and-component-boundaries.txt
