# Portable analytical handoffs: evidence and comparisons

Research date: **2026-10-20**, America/Indianapolis. Repository: **byronwall/explorEDA**. Baseline: **`9b16d78e3ed0742ed4d5858c1939fec9e758b510`**. This report is research only; its source-derived predictions are not application passes or verified defects.

## 1. Decision-bearing evidence

**Research access: GO. New companion: NO-GO now.** Keep local selection/export/undo/reopen proof first, then test one focused guide and example. Existing exports already address presentation, row exchange, settings transfer, ordinary analysis reopening, and project reopening. The strongest reason to keep that boundary is the absence of a supplied failing recipient task: another file would create an explanation, synchronization, disclosure, and maintenance obligation without evidence that it improves the handoff.

Five recommendation IDs are shared across the deliverables: **AH01** local trust first; **AH02** guide and example trial; **AH03** one conditional Markdown companion after the guide fails; **AH04** explicit upstream preparation or another destination; **AH05** retain the demand gate for result reuse and defer larger bundles. These are proposals, not implementation approval.

Evidence labels used here:

- **Checked source:** supplied authenticated text or additional code retrieved at the exact baseline.
- **External fact:** current official documentation retrieved on 2026-10-20; no product trial implied.
- **Inference:** consequences derived from the inspected contracts, including predicted failure probes.
- **Proposal / unrun:** a suggested experiment, expected result, or product decision that still needs observation.

The current-analysis-trust intent requires agreement among membership, numeric contributors, measures, export, history, and restoration. Reusable analytical outputs remain unprioritized until an actual downstream task. Neither a competitor's richer package nor an export-validation counterexample supplies that demand. [S01], [S02]

## 2. Source preflight and access

The packet identifies the owner, repository, baseline, and necessary source. Its **38 entries** were authenticated against their declared UTF-8 byte counts and SHA-256 values: **35 baseline files, two local additions, and one historical summary**. Authentication checks the supplied bytes against supplied headers; it is not a signature attesting to repository authorship.

| Supplied input | Authenticated identity |
| --- | --- |
| `source-packet(10).txt` | 475,336 bytes; SHA-256 `0a496740782d35fc22b911698f533a3ed494a1e30997d4153e3de03e0631b233` |
| `pro-prompt(20261020-190906).md` | 10,446 bytes; SHA-256 `06b46f25b80953dc657592bef9824366653655db64eac6bc7a0b152d4aed49da`; identical to the packet's embedded local prompt |

The reading route began with `AGENTS.md`, `README.md`, `docs/agent-guide.md`, and `CODING_STANDARDS.md`, followed by the intents and export documentation. Additional pinned files closed the decisive caller, parsing, project-session, DSL, and image-action gaps. The complete packet audit and supplemental inventory follow this report.

This was a text snapshot, not a runnable checkout. No source was executed, dependencies installed, application opened, browser download produced, repository modified, or test run. Research files and integrity calculations were created separately. Test assertions are evidence of intended coverage only.

The historical quantity summary is historical at **`350df70b`**. Its relative links belong to that historical research collection, not the current handoff directory. The supplied queue identifies the historical collection's [previous queue](https://github.com/byronwall/explorEDA/blob/350df70b/docs/research/quantity-semantics-2026-10-20/research-queue.md). Its conclusion—CSV values versus contextual settings is a boundary, not an accepted defect—is retained. No historical arithmetic count is promoted into current application proof.

## 3. Three synthetic jobs and existing export contracts

The seven-row proof fixture in `proof-plan.md` gives these jobs concrete stakes. Group A contains five rows, four finite amount contributors, amount sum **35**, and calculated `double_units` sum **30**. The complete source has seven rows and amount sum **100**. Table-only search selects two A rows with amount sum **15** and calculated sum **10**. These are declared expectations, not observed application results.

| Synthetic job | What success requires |
| --- | --- |
| **Explain a finding** | The recipient distinguishes A's 35 from the searched table's 15, states the population and contributor count, explains the formula and missing-value rule, and recognizes the source-time caveat. |
| **Reopen and inspect** | Compatible software restores intended source rows, definitions, filters, and values; the recipient can inspect contributors and change a selection. The sender's undo history need not travel. |
| **Reuse its rows** | The recipient receives the intended record grain, fields, types, and missing-value semantics for a named downstream operation. This does not itself require a reusable grouped/model/density result pipeline. |

### Current contract matrix

| Existing path | Preserves or supplies | Omits or requires externally |
| --- | --- | --- |
| **Chart PNG** | Documented drawn title/subtitle, legends, annotations, selection, theme; documented chart-specific extent rules. | No machine-readable dataset, formulas, query graph, or reopening state. A data-table image covers rows in view, not every matching row, and can disclose readable values or identifiers. Recipient explanation remains authored. [S03], [S04] |
| **Table / Rows CSV** | Matching interpreted records after relevant controls; configured field IDs/order; calculated values when configured; quote/comma/newline escaping. | Expressions, type declarations, labels/descriptions, reference population, source identity, freshness, and null-versus-empty distinctions. The recipient must interpret columns. [S05], [S06], [S07], [S08], [S09], [S10] |
| **Copy Data JSON** | The provider's full current `state.data` array, serialized with ordinary JSON. | Not the table's selected/search subset; not the full-analysis codec. Calculations are obtained separately and are not explicitly materialized here. No settings or special-value restoration map. [S11], [S12] |
| **Settings JSON** | Charts, formulas, field settings, layout, Rows controls, workspace filters, aggregates, geometry assets, and optional theme. | Rows and project source graph; restore uses current raw rows. Compatible code and the right data are external requirements. [S12], [S13] |
| **Ordinary full analysis JSON** | Original source rows plus settings; special source-value encoding; formula expressions for recomputation. | Not merely visible rows; no complete environment, source freshness proof, project query graph, or sender's undo branch. Independent host/import `fieldTypes` are not a named saved property. [S12], [S13], [S14], [S15] |
| **One project view JSON** | One view and reachable query steps, relevant relationship/source definitions, filter-used parameters, bindings, settings, and whole included source tables. | Not a crop to filtered marks or selected result keys. Closure edge cases need proof; cached evaluation results and local history do not travel. [S14], [S16], [S17] |
| **Full project JSON** | Project definitions, available source tables, all views, and active view. | A complete data set is not proved by successful structural validation alone; execution compatibility and source-time meaning remain external. [S14], [S16], [S17] |
| **Dashboard text** | Encodable fields, calculations, filters, Rows/chart/layout configuration, plus an omissions result. Separate project text API can name query/bindings. | No inline source tables. Current demo actions use generic DSL exports; project text API still requires external project/tables context. [S18], [S19] |

**Inference:** the best existing path depends on the job. PNG plus a clear explanation suits reading; analysis/project files suit compatible inspection; CSV or explicitly prepared typed data suits row exchange. None of those choices alone proves computational reproducibility.

## 4. Exact row-export and parsing chain

### What the CSV button receives

**Checked source:** `DataTable.resolvedRows` starts with supplied `rows` or provider `data`. It merges calculated columns from `getColumnData`, keyed by each internal `__ID`. `filteredRows` then calls `getFilteredRows`; the toolbar receives `rows={filteredRows}`, as does the table body. Consequently, the button is not exporting only rendered DOM rows, and the toolbar's fallback alone is insufficient to understand formula handling. [S06]

`getFilteredRows` takes positive live-item IDs, applies case-insensitive substring search, applies every table filter, and sorts. Search scans all resolved properties except `__ID`, including hidden fields and calculation values. `DataTableToolbar.handleExport` writes only `settings.columns.map(column => column.field)`. A recipient can therefore receive a correctly selected row without the hidden field explaining its search match. This is a scope distinction worth teaching, not evidence that the export chose the wrong records. [S05], [S07]

`toTableCsv` uses `String(value ?? "")`, quotes comma/quote/CR/LF cells, doubles embedded quotes, and joins records with newlines. It does not apply display formatting or emit a metadata prelude. Its clock-based filename is an export time, not a source-refresh assertion. [S05]

### Which controls narrow which population

The dashboard table's `getFilterFunction` links column filters to other charts; `globalSearch` is absent from that predicate. Rows begins with `crossfilter.getFilteredRowIds()` and applies its own controls through `updateRowsSettings`, which does not install chart filter dimensions. Dashboard table `globalSearch` persists inside saved charts; Rows search persists inside `rowsSettings`. [S08], [S09], [S13]

`CrossfilterWrapper.getAllData` additionally applies each chart's `localFilters` population. With `localSelections=true`, chart selections intentionally do not narrow other charts, although workspace filters still apply. The main proof declares the ordinary default `false`; it must not silently generalize its expected linked behavior to every host configuration. `clearAllFilters` clears table/Rows search as well as filters. [S09], [S13]

### How CSV comes back

`readTableFile` / `readTableText` dispatch CSV to `readDelimited`. PapaParse reads text with `dynamicTyping:false`; quoted multiline cells are supported, quote errors and surplus nonblank cells are rejected, and short rows receive null cells. `typeTextColumns` then infers each whole column through `detectColumnType`. Blank cells become null; numeric and boolean columns convert; text and date columns retain text. Headers are trimmed, duplicates/empty names repaired, and reserved `__ID` renamed with notes. [S10]

`isExactNumberText` protects leading-zero and unsafe-integer digit strings from numeric inference. Thus a generic claim that this importer destroys `"001"` or `"9007199254740993"` is unsupported. Conversely, CSV has no original native-type tag: number `1` and string `"1"` become the same lexeme. [S20]

| Value distinction | Source-derived boundary |
| --- | --- |
| Zero versus missing | Zero emits `0`. Numeric columns reimport it as number; a mixed column containing `bad` infers text and returns string `"0"`. |
| Null, empty, undefined, absent | All become empty CSV cells; reimport cannot recover which original case applied. Whitespace-only cells also become null in this reader. |
| Invalid text | Without conversion, `bad` remains text. Explicit numeric field conversion can make it undefined before CSV; raw source data remains in a full analysis. |
| Formulas and presentation | Calculated values travel when configured. Expression, error explanation, labels, units, formatting, and descriptions do not travel in CSV. |

Those limits concern the selected interchange contract. No runtime defect was established. Where a downstream task requires distinctions that CSV cannot carry, AH04 calls for explicit preparation or an appropriate typed destination; a Markdown note cannot recreate information already lost.

## 5. Reopening, metadata, and history

**Checked source:** `SavedAnalysisStructure` wraps `data` and `settings`. The provider's `saveAnalysisToStructure` uses `state.rawData`; ordinary `SavedViewsWorkspace.exportView` calls `downloadAnalysis(sourceRows, settings, ...)`, where `getSavedViewsRows` parses original `sourceAnalysis`. Neither path replaces the source with the table's filtered or calculated snapshot. Restore reapplies field conversions, constructs a calculation manager from expressions, and restores chart/workspace/Rows state. [S12], [S13], [S14], [S15]

`stringifySavedAnalysis` records own `undefined`, `NaN`, and positive/negative infinity in `specialValues`; `parseSavedAnalysis` reconstructs them. Null, empty string, zero, and ordinary scalar types remain separate at that codec boundary. Settings-only serialization is ordinary JSON. Copy Data also uses ordinary `JSON.stringify`, so its undefined/nonfinite behavior must not be described as the full-analysis special-value contract. [S11], [S12]

`fieldSettings` can carry type overrides, labels, descriptions, formats, precision, unit, currency, date preset, and null tokens. Ordinary analysis does not independently save provider `fieldTypes`; preserving a source string is not identical to retaining every reader's type declaration. A fresh-recipient test should compare both scalar values and effective field interpretation. [S13], [S20], [S21]

Project definitions add field IDs/names/optional types, entity keys, relationship cardinality, queries, parameters, and bindings. They do not define source URL, original path, source refresh time, or content hash fields. This does not imply that names, descriptions, IDs, or row contents are public-safe. Byron must choose disclosure scope. [S17]

`saveToStructure.metadata.modifiedAt` is save activity. `evaluateAnalysisQuery.revision` uses query/binding metadata and process-local table identity, including WeakMap-assigned array revisions; it is not a durable source checksum. Export time, source-observation time, and recomputation time must remain distinct. Unknown source time stays unknown. [S13], [S22]

`pushCheckpoint` saves tabs/project definitions and history relationships, not source-row snapshots. `moveHistory` restores view/project edits while retaining session tables. Project export excludes history/path/cursor; imported projects begin with a fresh history entry. Faithful reopening therefore does not promise the sender's undo branch or historical data rewind. [S14], [S15], [S23]

### Context that still needs an explicit handoff choice

| Context dimension | Preserved boundary and recipient question |
| --- | --- |
| **Schema and types** | CSV supplies field IDs and inferred values; analysis adds explicit saved field overrides; project definitions add declared field types and relationships. Which representation does the receiver actually consume? |
| **Labels and descriptions** | Saved field settings carry them; CSV does not. Which names or descriptions are necessary and appropriate to disclose? |
| **Reference population** | Saved settings/query definitions can retain the computation and filtering choices. They do not automatically explain why A's five records, four contributors, and the seven-record source answer different questions. |
| **Parameters and dependencies** | Project views retain bindings and selected definitions; ordinary analysis and CSV do not supply the project query context. Which bound values and source tables does reopening require? |
| **Identity and freshness** | Project source/entity IDs support in-project meaning; save timestamps describe save activity. What source identity and observation time can the author actually substantiate? |

This mapping is a source-derived interpretation of the contracts above. A guide or optional note should ask only for context needed by the named job, and must leave unsupported context explicitly unknown.

## 6. Project dependencies: actual boundary and discriminating probes

### Selection algorithm

**Checked source:** `selectAnalysisProjectView` finds the selected view and query, starts at `outputStepId`, and recursively follows `inputStepId`. It gathers source steps, lookup/expand relationships, and filter-referenced parameter IDs. It adds both endpoints of retained relationships, keeps those source definitions and whole table arrays, retains only visited query steps, filters parameter definitions, and keeps the original selected view. [S16]

This is a bounded dependency selection, not row filtering. Query filters are preserved for later evaluation; chart selection, Rows controls, bindings, and `selectedRowKeys` do not crop the included tables. A two-row query result or one selected result key may travel with complete source/dependency tables. Full project export instead carries every available project table, definition, and view. [S14], [S16]

The project codec recursively preserves undefined/nonfinite values and escapes reserved-marker collisions. Source-row validation accepts declared scalar fields; missing table arrays can remain structurally valid while query evaluation reports unavailable sources. Serializing a project therefore does not prove that it can recompute successfully. [S16], [S22]

### Named source-predicted probes, all unrun

- **P-OPTIONS — parameter option source.** The existing `shopProject.ts` fixture's `customer-instance` query starts from `orders` and filters `customerId`, `dateStart`, and `dateEnd`. The `customerId` parameter obtains options from `customers`. The evaluator test supplies `C1`, `2025-01-01`, and `2025-02-01`, expecting O1/O2. Selected-view closure follows only the query source and filter parameters; it does not follow the retained parameter's `options.sourceId`. The subsequent serializer is predicted to reject with `Parameter customerId has invalid options` if `customers` has been removed. This is a concrete existing-fixture probe, not an observed browser failure. [S16], [S24], [S25]
- **P-BINDING — unused retained binding.** A structurally valid view can bind both a query-used parameter and another defined parameter. Selection keeps only query-used parameter definitions but the original complete bindings object. Validation is predicted to reject a binding whose parameter definition was dropped. The remedy could trim unused bindings, retain their definitions, or prevent that state earlier; source inspection does not choose an implementation or prove the UI creates it. [S16], [S17]
- **P-LOCAL-SPECIAL — file versus local-session storage.** `savedViewsSession.writeProjectTables` uses plain JSON while the project file uses its special codec. Explicit own undefined/nonfinite project row values are therefore predicted to differ after local storage and reload. Test only the named local workflow that uses these values; do not infer a general storage-rewrite requirement. [S15], [S16]

If reproduced, these are AH01 local-trust repairs. A companion cannot fix omitted dependencies or rejected serialization. They must not count as evidence that a recipient needs a new explanation artifact.

## 7. What existing tests establish—and leave open

| Inspected tests | Contract evidence and limit |
| --- | --- |
| `saveDataUtils.test.ts` | Assertions cover special source values, reserved-looking field names, and formula validation. They do not establish a downloaded-file or browser-reopen flow. [S26] |
| `analysisReliability.test.tsx` | Assertions compare formula edits, derived filters, table values, CSV escaping, search, clear, and settings restoration. CSV is called directly and restoration uses existing raw rows. [S27] |
| `DataTable.test.tsx` | Widths, table-only search/clear, and Escape behavior; no complete export/import trial. [S28] |
| `evaluateProject.test.ts` | Grain/totals, typed/null keys, ambiguity, parameters, calculations, ordinary dependency closure, and selected codec cases. P-OPTIONS/P-BINDING are not covered by the inspected selection assertions. [S25] |
| Workspace/history tests | Shared definitions, per-view settings, history branches/bounds, and storage-failure handling. Workspace tests mock `ExplorEda`; anchor-click assertions do not inspect download bytes. [S29], [S30] |

**Proposal:** keep serialization checks, real application/browser checks, and recipient comprehension separate. An arithmetic agreement or parsed JSON equality cannot demonstrate that a browser used the intended export action; an export button working cannot demonstrate that a recipient understood its scope.

## 8. Six external comparisons

All facts in this section come from official pages retrieved **2026-10-20**. They show distinct contracts, not popularity, standards compliance, customer demand, or tested behavior in this research.

### Observable Framework

**External facts:** Framework data loaders produce build-time data; required interpreters/packages belong in the build environment. Runtime fetching is optional, so every app is not necessarily a fixed snapshot. Deployment supports static hosting. Sources: [Data loaders](https://observablehq.github.io/framework/data-loaders), [Deploying](https://observablehq.github.io/framework/deploying).

**Inference:** an authored interactive narrative or regularly rebuilt data app can be a better destination than an additional explorEDA export. Its build/source contract exceeds a small companion. This comparison concerns Framework; it does not establish current Observable Notebook export behavior.

### Jupyter / nbformat / nbconvert

**External facts:** Notebook code cells can retain source, execution counts, and outputs; metadata is optional. nbconvert execution selects a kernel and working context and normally stops on errors. Sources: [Notebook format](https://nbformat.readthedocs.io/en/latest/format_description.html), [Executing notebooks](https://nbconvert.readthedocs.io/en/latest/execute_api.html).

**Inference:** stored output, an explanatory notebook, and a successfully rerun computation are separate achievements. A recipient needing code and repeatable computation may need a notebook plus declared inputs/environment. Reopening explorEDA JSON should not be described as supplying that environment.

### Tableau packaged workbooks

**External facts:** A `.twbx` packages the workbook with local sources/assets for Desktop or Reader. Non-file connections require extracts for inclusion. The page warns that packaged data and filter values are readable. Source: [Packaged Workbooks](https://help.tableau.com/current/pro/desktop/en-us/save_savework_packagedworkbooks.htm).

**Inference:** compatible software and included-data scope are part of portable reopening. A visible selection is insufficient evidence of disclosure scope. That lesson motivates inspecting explorEDA's actual closure; it does not transfer Tableau behavior to explorEDA by analogy.

### W3C CSVW

**External facts:** CSVW metadata can supply column titles, datatypes, null representations, and table descriptions; the default null marker is empty text. A converter need not be a validator. Source: [Metadata Vocabulary for Tabular Data](https://www.w3.org/TR/tabular-metadata/).

**Inference:** this is useful when an identified consumer expects CSVW. Metadata cannot reconstruct which original values produced identical empty CSV cells. A human note listing fields does not establish CSVW conformance; that would require a separate mapped contract and verification.

### Data Package / Table Schema

**External facts:** Data Package describes resources that may be local, remote, or inline. Its `created` timestamp can mean data creation or package creation depending on publisher. Table Schema describes fields/types/keys and applies missing-value markers before casting. Sources: [Data Package](https://datapackage.org/standard/data-package/), [Table Schema](https://datapackage.org/standard/table-schema/).

**Inference:** a recurring dataset exchange can justify such a descriptor when a consumer needs it. It still leaves a finding's interpretation, denominator, and source-time policy to the author. It does not justify a universal provenance schema here.

### DuckDB

**External facts:** Database export writes data with reconstruction SQL, including `schema.sql` and `load.sql`; CSV and Parquet are documented formats. Import recreates the database in a fresh destination. Source: [EXPORT and IMPORT DATABASE](https://duckdb.org/docs/current/sql/statements/export).

**Inference:** repeated SQL joins/aggregates or materialized relational delivery can belong upstream. The cited contract does not promise capture of every external dependency mentioned in view SQL, nor does a database export explain a finding's significance.

### Three outcomes kept separate

**Explaining** requires correct recipient interpretation. **Matching stored results after reopening** requires comparing expected memberships/values in compatible software. **Computational reproduction** additionally requires a declared recipe, inputs, dependencies, parameters, and execution environment that actually run again. These are operational definitions for this study, not certified definitions from the standards above.

## 9. Alternatives and the strongest case for stopping

| Alternative | Evidence-based disposition |
| --- | --- |
| **No change / deferral** | Valid default while no named task fails. Zero new format maintenance; experienced recipients may already have enough context. Unknown comprehension remains a trial question. |
| **Focused guide plus example** | AH02's first experiment after AH01. Explain the job, selected/source/search scope, formulas, missing-value boundary, and compatible opening path. Docs and example belong in the same milestone. |
| **Explicit upstream preparation** | AH04 when the receiver requires typed exchange, deliberate missing markers, repeatable SQL, or a controlled notebook. State the work and destination explicitly. |
| **One Markdown companion** | AH03 remains conditional. Compare it with the identical text in an ordinary cover message; a file is justified only by the recipient task, not by being easy to generate. |
| **Larger package / result system** | AH05 defers it. Requires repeated downstream work, a specified result grain, contributor meaning, filter/refresh rules, and a consumer that existing paths cannot serve. |

The evidence does not identify a verified comprehension failure that current controls plus a short lesson cannot address. Candidate closure/storage failures would require bounded repair if reproduced; they cannot be repaired by explaining them better. The proposed companion entry gate is two comparable real handoffs showing the same essential context failure after the guide. Only then compare identical approved facts in an ordinary message and one note, using distinct comparable findings and varying order or recipient where practical. A direction-changing result would show that the note keeps necessary context available better for the observed task at acceptable author effort. This is a bounded diagnostic, not statistical validation; no such observations were supplied.

Authoring another artifact adds review and synchronization work. Automatically copying source names, identifiers, descriptions, timestamps, or parameter values can create misleading scope or disclose information the author did not intend to share. The proposed response is explicit author choice, not new access-control infrastructure. Byron retains recipient, scope, timestamp, and source-disclosure decisions.

No checkout, implementation, merge, deployment, paid service, account messaging, or repository change follows from this research. The source remains React/TypeScript with pnpm. No unit engine, lineage graph, cloud sharing system, compatibility layer, worktree, or reporting platform is proposed.

## 10. Source registry and coverage limits

Source labels are local to this document; AH01–AH05 are shared recommendation IDs. Repository references below are pinned to the declared baseline. Symbols and ranges identify the inspected contract, including additional files absent from the packet. The separate integrity appendix inventories all packet entries; authentication alone does not imply every line of every file determined the recommendation.

Governing sources: [`AGENTS.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/AGENTS.md), [`README.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/README.md), [`docs/agent-guide.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/agent-guide.md), and [`CODING_STANDARDS.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/CODING_STANDARDS.md). Their docs/example milestone rule, existing React/TypeScript/pnpm constraints, and distinction between expected and executed checks govern this proposal. Supplemental contract documentation includes [`DataTable/README.md`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/README.md) and [`readers/types.ts`](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/types.ts), `TableFile` and `ReadTableOptions`.

- **S01:** `docs/intent/current-analysis-trust/intent-brief.md`, “What matters most,” “Boundaries,” and expansion trigger. [Source][S01]
- **S02:** `docs/intent/reusable-analysis-outputs/intent-brief.md`, unprioritized status, result grain, expansion trigger. [Source][S02]
- **S03:** `apps/demo/src/docs/pages/export.mdx`, Copy/save, PNG extent, analysis/project actions. [Source][S03]
- **S04:** `components/PlotChartPanel.tsx`, `useChartImageExport` wiring and image shortcuts; `components/charts/export/useChartImageExport.ts`, capture/copy/download action wiring. [Panel][S04] / [hook][S04h]
- **S05:** `DataTableToolbar.tsx`, `handleExport` and `toTableCsv`, lines 35–59, 169–178. [Source][S05]
- **S06:** `DataTable.tsx`, `resolvedRows`, `filteredRows`, toolbar/body, lines 46–63, 123–159, 237–243. [Source][S06]
- **S07:** `filteredRows.ts`, `getFilteredRows`, lines 10–47. [Source][S07]
- **S08:** `DataTable/definition.ts`, `getFilterFunction`, lines 54–81; `RowsView.tsx`, lines 20–51. [Definition][S08] / [Rows][S08r]
- **S09:** `CrossfilterWrapper.ts`, selection mode, `getFilteredRowIds`, `getAllData`; `chartPopulation.ts`, `getPopulationTest`; `applyFilter.ts`, `applyFilter`. [Crossfilter][S09] / [population][S09p] / [predicates][S09f]
- **S10:** `readers/readTable.ts`, dispatch; `readers/delimited.ts`, `readDelimited`; `readers/columns.ts`, `fieldNamesFromHeader`, `typeTextColumns`; `SummaryTable/utils/dataTypeDetection.ts`, `detectColumnType`. [Dispatch][S10] / [CSV][S10d] / [columns][S10c] / [inference][S10t]
- **S11:** `PlotManager.tsx`, `copyDataToClipboard`, lines 599–612, using store `data` at line 190. [Source][S11]
- **S12:** `saveDataUtils.ts`, `stringifySavedData`, `stringifySavedAnalysis`, `parseSavedAnalysis`, lines 31–126, and `saveRawDataToClipboard`, lines 1122 onward. [Source][S12]
- **S13:** `DataLayerProvider.tsx`, `getColumnData`, `updateRowsSettings`, `saveToStructure`, `saveAnalysisToStructure`, restore, lines 1193–1478. [Source][S13]
- **S14:** `SavedViewsWorkspace.tsx`, `downloadAnalysis`, `projectFile`, `downloadProject`, `sourceRows`, `exportView`, `moveHistory`, DSL actions, full-project action. [Source][S14]
- **S15:** `savedViewsSession.ts`, `writeProjectTables`, `getSavedViewsRows`, local storage restore, `projectSession`. [Source][S15]
- **S16:** `lib/analysis/projectFile.ts`, codec, `selectAnalysisProjectView`, `stringifyAnalysisProject`, validation; lines 23–177, 249–269, 543–583. [Source][S16]
- **S17:** `types/AnalysisProject.ts`, source/relationship/query/parameter/view types; `types/SavedDataStructure.ts`, settings/analysis types. [Project][S17] / [saved analysis][S17s]
- **S18:** `lib/dsl/export.ts`, `exportDocument`, `exportParts`, `omitted`, lines 296–605. [Source][S18]
- **S19:** `lib/project/analysisText.ts`, `readAnalysisText`, `exportAnalysisText`, lines 107–234. [Source][S19]
- **S20:** `lib/valueParsing.ts`, missing/numeric/exact-ID predicates, lines 11–124. [Source][S20]
- **S21:** `lib/fieldSettings.ts`, settings fields, `convertFieldValue`, `applyFieldSettings`, lines 20–30, 106–144, 310–337. [Source][S21]
- **S22:** `lib/analysis/evaluateProject.ts`, source/lookup/calculate/filter stages, `tableRevision`, `evaluateAnalysisQuery`. [Source][S22]
- **S23:** `savedViewsHistory.ts`, `SHARED_KEYS`, `pushCheckpoint`, lines 16–22, 137–190. [Source][S23]
- **S24:** `test/fixtures/shopProject.ts`, customer-instance query, lines 355–387; customerId options, lines 470–479. [Source][S24]
- **S25–S30:** test files and assertion limits identified in section 7. [Codec][S26] / [reliability][S27] / [table][S28] / [project][S25] / [workspace][S29] / [history][S30]

Additional access limits:

- Guessed `packages/explorEDA/src/lib/analysis/projectFile.test.ts` and `packages/explorEDA/src/test/lib/analysis/projectFile.test.ts` returned GitHub 404. The supplied `evaluateProject.test.ts` contains relevant serialization assertions; no nonexistent test was inferred.
- PNG fidelity remains a documented contract plus inspected action wiring. The leaf capture renderer and actual pixels/downloads were not verified. DSL inspection covered the exporter and current demo calls; no complete DSL/browser round-trip was run.
- Legacy Observable embed documentation redirected to an explicitly old archive and was excluded from current Notebook claims. Current Notebook pages yielded insufficient body text; no authenticated browser/account exploration followed.
- The guessed nbconvert `/execute.html` route failed; `/execute_api.html` succeeded. DuckDB's older URL redirected to the cited current export page.
- PR451/452 and PR454–459 remain supplied ownership/context boundaries, not current approval or status evidence. Preparation/freshness, missingness, relationships, rates, navigation, units, and axes surveys were not reopened.
- There were no customer interviews, recipient observations, timing measurements, runtime compatibility trials, or executed proof results. The next evidence must come from the named task, not further synthesis alone.

[S01]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/current-analysis-trust/intent-brief.md
[S02]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/docs/intent/reusable-analysis-outputs/intent-brief.md
[S03]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/docs/pages/export.mdx
[S04]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/PlotChartPanel.tsx
[S04h]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/export/useChartImageExport.ts
[S05]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx#L35-L59
[S06]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx#L46-L159
[S07]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/filteredRows.ts#L10-L47
[S08]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/definition.ts#L54-L81
[S08r]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/RowsView.tsx#L20-L51
[S09]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts
[S09p]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts
[S09f]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts
[S10]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/readTable.ts
[S10d]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/delimited.ts
[S10c]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/columns.ts
[S10t]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts
[S11]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/PlotManager.tsx#L599-L612
[S12]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/utils/saveDataUtils.ts
[S13]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1193-L1478
[S14]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.tsx
[S15]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts
[S16]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/projectFile.ts
[S17]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/AnalysisProject.ts
[S17s]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/types/SavedDataStructure.ts
[S18]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/export.ts#L296-L605
[S19]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/project/analysisText.ts#L107-L234
[S20]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/valueParsing.ts#L11-L124
[S21]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/fieldSettings.ts
[S22]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[S23]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.ts#L137-L190
[S24]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts
[S25]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts
[S26]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/utils/saveDataUtils.test.ts
[S27]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/providers/analysisReliability.test.tsx
[S28]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/__tests__/DataTable.test.tsx
[S29]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/SavedViewsWorkspace.test.tsx
[S30]: https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsHistory.test.ts

## 11. Complete input integrity inventory

Every entry below passed both an independently measured byte-count check at its packet end marker and SHA-256 comparison with its header. Framing text is excluded from entry byte counts. These are packet-content integrity checks; they do not independently attest that every baseline entry was fetched from GitHub. The exact baseline commit was separately accessible through GitHub's commit endpoint. No current-main comparison was performed.

### Authenticated packet entries

- **01. baseline** — `AGENTS.md`
  - UTF-8 bytes: **4,033**; byte count and SHA-256: **PASS**.
  - SHA-256: `802990c1bacd76b4b867239da78fd011fb32653f891d4a88560e9ee629979a33`.

- **02. baseline** — `README.md`
  - UTF-8 bytes: **10,263**; byte count and SHA-256: **PASS**.
  - SHA-256: `1f05b6c4992b07d1fc2b38d7bf9273db9e4a3a0d94513b7265e13b81cd7c5e28`.

- **03. baseline** — `package.json`
  - UTF-8 bytes: **1,258**; byte count and SHA-256: **PASS**.
  - SHA-256: `f9b14daf225872f605d9435ddfb46fdede88b203c87a0e8507fe20743536f6e3`.

- **04. baseline** — `CODING_STANDARDS.md`
  - UTF-8 bytes: **2,213**; byte count and SHA-256: **PASS**.
  - SHA-256: `b4358fe75d063d53aea1edbc58d0dc6fd8df6e6165aa5792d8d2aa35eefe7ac5`.

- **05. baseline** — `docs/agent-guide.md`
  - UTF-8 bytes: **19,779**; byte count and SHA-256: **PASS**.
  - SHA-256: `0992949f205d1ae72a8249c69bccb33f1eb70763b14a526a6384a7a91f9c9f00`.

- **06. baseline** — `docs/ui-defaults.md`
  - UTF-8 bytes: **19,093**; byte count and SHA-256: **PASS**.
  - SHA-256: `93ee25ebd3917a1e56d7db818ff4b6edcfe7e063f390ff9d5e9b83a0cc32f84a`.

- **07. baseline** — `docs/intent/current-analysis-trust/intent-brief.md`
  - UTF-8 bytes: **3,006**; byte count and SHA-256: **PASS**.
  - SHA-256: `d6b2d620753c1ea532fffcb1cb43cc42711e03daa898e989a7f283f475186bd7`.

- **08. baseline** — `docs/intent/reusable-analysis-outputs/intent-brief.md`
  - UTF-8 bytes: **3,214**; byte count and SHA-256: **PASS**.
  - SHA-256: `3f57173fe3d02c1a2b76759f55d87480d38aba5f897f665733ee7282fbd556d5`.

- **09. baseline** — `docs/intent/reusable-analysis-outputs/references/README.md`
  - UTF-8 bytes: **2,092**; byte count and SHA-256: **PASS**.
  - SHA-256: `6cd6238b8440efc2408c23370a9defd216a43d04bea53ddb724bf3fd472f7bd0`.

- **10. baseline** — `apps/demo/src/docs/pages/export.mdx`
  - UTF-8 bytes: **1,786**; byte count and SHA-256: **PASS**.
  - SHA-256: `c2928e4af2c5f9a8713662a6532aa746b33acabce5653dfbdce61f1486f876dc`.

- **11. baseline** — `packages/explorEDA/src/types/SavedDataStructure.ts`
  - UTF-8 bytes: **1,926**; byte count and SHA-256: **PASS**.
  - SHA-256: `d06d902c2e9ba967adb39f25502405153b2b582bfd2bf7305ad51bec9b9dfebb`.

- **12. baseline** — `packages/explorEDA/src/types/AnalysisProject.ts`
  - UTF-8 bytes: **4,839**; byte count and SHA-256: **PASS**.
  - SHA-256: `374ffd46c8143f95c7256859d0a1bcc24e1eabe82a80dce9d465a2c4ba693408`.

- **13. baseline** — `packages/explorEDA/src/utils/saveDataUtils.ts`
  - UTF-8 bytes: **38,882**; byte count and SHA-256: **PASS**.
  - SHA-256: `aad0e318e8453f09980ce6627c0dd7c4e314de4f220a78dc0fd52f90f468a4d8`.

- **14. baseline** — `packages/explorEDA/src/lib/analysis/projectFile.ts`
  - UTF-8 bytes: **21,021**; byte count and SHA-256: **PASS**.
  - SHA-256: `58c0d7462eb14be5597e296aed1b0dcca47f8b91993a2063952f6809631f52b4`.

- **15. baseline** — `packages/explorEDA/src/lib/analysis/evaluateProject.ts`
  - UTF-8 bytes: **29,524**; byte count and SHA-256: **PASS**.
  - SHA-256: `0e92ca221ab5c2ae78c5b0454dcf09902d1372638c1fe28a93fccdc1e6bd75d1`.

- **16. baseline** — `packages/explorEDA/src/lib/project/analysisText.ts`
  - UTF-8 bytes: **7,101**; byte count and SHA-256: **PASS**.
  - SHA-256: `6e05b58602a1004e01f007733df9f7d22df77949fa7fbb5e8f415bc2d84b65b1`.

- **17. baseline** — `packages/explorEDA/src/lib/readers/delimited.ts`
  - UTF-8 bytes: **2,120**; byte count and SHA-256: **PASS**.
  - SHA-256: `0f8533a043e56a2a8b04a6c128787261497f1e0a0c2a002085afc102f9377b76`.

- **18. baseline** — `packages/explorEDA/src/lib/readers/readTable.ts`
  - UTF-8 bytes: **4,700**; byte count and SHA-256: **PASS**.
  - SHA-256: `268cc2194c90feffd983d3166c1dd8a354e14d1b506868863ddc91b3bbda3174`.

- **19. baseline** — `packages/explorEDA/src/lib/readers/types.ts`
  - UTF-8 bytes: **2,263**; byte count and SHA-256: **PASS**.
  - SHA-256: `84d4c57e9631125b72f3ca3d68be1c8d1d00a9e1584754356fea38bb6ef63c4f`.

- **20. baseline** — `packages/explorEDA/src/lib/valueParsing.ts`
  - UTF-8 bytes: **10,226**; byte count and SHA-256: **PASS**.
  - SHA-256: `18793ed3c9f09e3ac6c184fd658ad68b88f564c5c2d800bac7108188afd845d6`.

- **21. baseline** — `packages/explorEDA/src/lib/fieldSettings.ts`
  - UTF-8 bytes: **10,610**; byte count and SHA-256: **PASS**.
  - SHA-256: `12381672c4bd38ddb826cc2ac8b671e4714ee3f965c0ce2db2e6beb5b8a05236`.

- **22. baseline** — `packages/explorEDA/src/components/charts/DataTable/DataTableToolbar.tsx`
  - UTF-8 bytes: **5,533**; byte count and SHA-256: **PASS**.
  - SHA-256: `401418aac8f4c132ccdb3b906ccefad82392e94db56e1bd558eb582e74bf65a7`.

- **23. baseline** — `packages/explorEDA/src/components/charts/DataTable/filteredRows.ts`
  - UTF-8 bytes: **2,197**; byte count and SHA-256: **PASS**.
  - SHA-256: `0723f9d5341214b0522d6c8231a0ee9ec32dd816b6e0a6067c9d49bedb5c147b`.

- **24. baseline** — `packages/explorEDA/src/components/charts/DataTable/README.md`
  - UTF-8 bytes: **1,398**; byte count and SHA-256: **PASS**.
  - SHA-256: `288468c5fa9fffce4afe1f8386d19f79eb7aaaad413a847acde9ad494776243d`.

- **25. baseline** — `packages/explorEDA/src/components/RowsView.tsx`
  - UTF-8 bytes: **1,758**; byte count and SHA-256: **PASS**.
  - SHA-256: `34c1d5c2df55089d49c3711c6b65548f8652ad1f4285e5111ef37569c52024c0`.

- **26. baseline** — `packages/explorEDA/src/components/PlotManager.tsx`
  - UTF-8 bytes: **37,389**; byte count and SHA-256: **PASS**.
  - SHA-256: `086e81dfac8b05f48c222d48f31467d5cba9d011719395e741db43c911bbce6a`.

- **27. baseline** — `packages/explorEDA/src/providers/DataLayerProvider.tsx`
  - UTF-8 bytes: **55,689**; byte count and SHA-256: **PASS**.
  - SHA-256: `c0ab7260c912fb628d393e7cbae1c752e44db4a20e347d9ec07f755b3ae7771d`.

- **28. baseline** — `packages/explorEDA/src/test/utils/saveDataUtils.test.ts`
  - UTF-8 bytes: **12,581**; byte count and SHA-256: **PASS**.
  - SHA-256: `2c7e7e86d742154a11790fc984cb6525a76b49add80bce6878d30f4a3816f624`.

- **29. baseline** — `packages/explorEDA/src/test/providers/analysisReliability.test.tsx`
  - UTF-8 bytes: **4,724**; byte count and SHA-256: **PASS**.
  - SHA-256: `3c8974c33ddc4042bd66da2daca4ece1e2a8bdb3327c924199cf618ce06ef934`.

- **30. baseline** — `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts`
  - UTF-8 bytes: **12,780**; byte count and SHA-256: **PASS**.
  - SHA-256: `13a1f675f5055a702c16384f2aee5835108a0725dd0fc8d979703e3e8a11f88b`.

- **31. baseline** — `packages/explorEDA/src/components/charts/DataTable/__tests__/DataTable.test.tsx`
  - UTF-8 bytes: **4,552**; byte count and SHA-256: **PASS**.
  - SHA-256: `5bc175b5fdb57b48a05b79da2a351eb130363df6297b4ee58a81e583a9d6d05c`.

- **32. baseline** — `apps/demo/src/SavedViewsWorkspace.tsx`
  - UTF-8 bytes: **41,082**; byte count and SHA-256: **PASS**.
  - SHA-256: `75fa5ee6649939c264603991399b5a55897e33a97d8bccd2ad3f9780c6c48523`.

- **33. baseline** — `apps/demo/src/SavedViewsWorkspace.test.tsx`
  - UTF-8 bytes: **24,452**; byte count and SHA-256: **PASS**.
  - SHA-256: `9b730184a09ebfc5c7a880624b86843ffe082471d18dc221be689318f21e3ea7`.

- **34. baseline** — `apps/demo/src/savedViewsHistory.ts`
  - UTF-8 bytes: **34,392**; byte count and SHA-256: **PASS**.
  - SHA-256: `64013981d656cc65b62a5716626782b98bd1808ca5409aeb345ea64603aa5cda`.

- **35. baseline** — `apps/demo/src/savedViewsHistory.test.ts`
  - UTF-8 bytes: **11,455**; byte count and SHA-256: **PASS**.
  - SHA-256: `6c193c6ae707a8a3d505be60d4b714f2e7f187a5fa270d58f47fee9116863d4d`.

- **36. local addition** — `docs/research/analysis-handoff-2026-10-20/pro-prompt.md`
  - UTF-8 bytes: **10,446**; byte count and SHA-256: **PASS**.
  - SHA-256: `06b46f25b80953dc657592bef9824366653655db64eac6bc7a0b152d4aed49da`.

- **37. local addition** — `docs/research/analysis-handoff-2026-10-20/research-queue.md`
  - UTF-8 bytes: **2,687**; byte count and SHA-256: **PASS**.
  - SHA-256: `392f812bb1af9fd8c3d87bd53a1625a1e7892dab2588a636d038a119d14c34c0`.

- **38. historical at 350df70b** — `docs/research/analysis-handoff-2026-10-20/prior-quantity-summary.md`
  - UTF-8 bytes: **2,887**; byte count and SHA-256: **PASS**.
  - SHA-256: `7a7464eec29b5c2460fced0f8dde6024071269a6f0efc61a28e708fddb98c8b3`.

### Additional source retrieved at the exact baseline

The twelve distinct files below were absent from the packet. Each was retrieved on **2026-10-20** through a read-only GitHub file request pinned to `9b16d78e3ed0742ed4d5858c1939fec9e758b510`. The saved UTF-8 bytes were hashed with SHA-256, and their Git blob SHA-1 was recomputed and matched the API's blob identifier. Source excerpts and assertions were read; the files were not executed. The DSL exporter was requested by two parallel reviewers but is counted once here.

- [apps/demo/src/savedViewsSession.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/apps/demo/src/savedViewsSession.ts)
  - UTF-8 bytes: **6,957**. SHA-256: `69784a461ca0df7a355fff5427b6d93e9dc6d0e3ff79bbf310f81f0387ed23f3`.
  - Matched Git blob SHA-1: `3ee33cbb6517bb87a0c87c304a1fdcbd7e0fb05a`.

- [packages/explorEDA/src/components/PlotChartPanel.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/PlotChartPanel.tsx)
  - UTF-8 bytes: **42,150**. SHA-256: `0491886b1d275957947eab1ba38edf9cdedf5c44b599d6d99306d5833a937f3e`.
  - Matched Git blob SHA-1: `2200120bc971c2d9435bc1b7c475c6249a38ef15`.

- [packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/SummaryTable/utils/dataTypeDetection.ts)
  - UTF-8 bytes: **1,208**. SHA-256: `8bba727e0e4205a0df8762770d27a83be212089397e3d19d76055a8bfd1a8db1`.
  - Matched Git blob SHA-1: `e29aca246bfe4df1fca26f24fb6a8535e18f256e`.

- [packages/explorEDA/src/components/charts/DataTable/DataTable.tsx](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/DataTable.tsx)
  - UTF-8 bytes: **8,968**. SHA-256: `0039f22156ef1dd3f0cd6ef58e73115a7f3b5ae12eaf8c4e04e2677295bc74c1`.
  - Matched Git blob SHA-1: `95524915d63e46ecabe339a1d95311ade2634944`.

- [packages/explorEDA/src/components/charts/DataTable/definition.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/DataTable/definition.ts)
  - UTF-8 bytes: **2,249**. SHA-256: `d40fd095ef8e2244b9d178b172ef4e132f2265e0c3588eec6e62c183eece853c`.
  - Matched Git blob SHA-1: `dd10fe4712189f53f2f75a0f9f4bbe13f2c27e17`.

- [packages/explorEDA/src/components/charts/export/useChartImageExport.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/components/charts/export/useChartImageExport.ts)
  - UTF-8 bytes: **1,760**. SHA-256: `a20f19f8e786d8fa4cd5507ac8fc994d47eda7b03bb22881148a66473891a178`.
  - Matched Git blob SHA-1: `944ed3c342231d869f938c44849728f5ffc81d43`.

- [packages/explorEDA/src/hooks/CrossfilterWrapper.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/CrossfilterWrapper.ts)
  - UTF-8 bytes: **6,855**. SHA-256: `444f228baffb694c82f7826da6a2eee88ce0296b47ec5e3f59c36b0d1070b483`.
  - Matched Git blob SHA-1: `8560522bd2712fcd371f5472322fc27df3d100e3`.

- [packages/explorEDA/src/hooks/applyFilter.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/hooks/applyFilter.ts)
  - UTF-8 bytes: **1,974**. SHA-256: `d8f0610999aa93372bbbb29d9811d9106b71e1c40675b5bc3f3714ea5bbc3953`.
  - Matched Git blob SHA-1: `6236e52545cf2384c29cc54399927da6215943ef`.

- [packages/explorEDA/src/lib/chartPopulation.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/chartPopulation.ts)
  - UTF-8 bytes: **1,425**. SHA-256: `3108817ced390197b9b90708d5ee76386c992470716d9326adbc12ce1d0bab86`.
  - Matched Git blob SHA-1: `fe9acc4d42b6eacdaf0ae3c34d84e2076b80f53e`.

- [packages/explorEDA/src/lib/dsl/export.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/dsl/export.ts)
  - UTF-8 bytes: **20,402**. SHA-256: `522575e4f1bc8b4a6927b2dd504d280c99a49fc5e27feb37bb0b461a8b5b08af`.
  - Matched Git blob SHA-1: `6d9770862a44426b2cbcd0df8e33d87e91d3dfb7`.

- [packages/explorEDA/src/lib/readers/columns.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/lib/readers/columns.ts)
  - UTF-8 bytes: **3,550**. SHA-256: `af4914b88861580d04750796d0e6a50c26f9af62812c12bc8042bc35653d821d`.
  - Matched Git blob SHA-1: `b6df772c70c88663d9f5bb7ac66899ad2cf7938a`.

- [packages/explorEDA/src/test/fixtures/shopProject.ts](https://github.com/byronwall/explorEDA/blob/9b16d78e3ed0742ed4d5858c1939fec9e758b510/packages/explorEDA/src/test/fixtures/shopProject.ts)
  - UTF-8 bytes: **14,422**. SHA-256: `dceb807341e6023b1270a0c53df4d37177cb0ac3fb495794d8a2b5c9aef8107a`.
  - Matched Git blob SHA-1: `4eae01c939784509b4fdfd01d493191fe25e666c`.

### Coverage boundary after authentication

The 35 selected baseline files plus these 12 supplements are enough for the contracts asserted in this report. This is not a repository-wide audit. Authentication covered every packet entry; behavioral reasoning used the relevant symbols and tests identified above. Uninspected renderer internals, external spreadsheet behavior, dependency availability, browser/app routes, compatibility across versions, source freshness and recipient understanding remain outside observed proof. The two local additions and the historical summary retain their declared provenance; they were not silently treated as baseline implementation.
