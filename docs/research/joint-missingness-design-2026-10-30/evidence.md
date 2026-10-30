# Source checks and local dispositions

Checked October 30 against `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`.
Refreshed origin/main and checked open PRs through #573. Main is unchanged from the submitted baseline.
Read both complete reports, the notebook companion, JSON fixtures, verification log/program, and SVG. Visually inspected the PNG.
The [asset index](../../intent/missingness-and-expected-records/assets/pro-results/joint-missingness-design-2026-10-30/README.md)
preserves every supplied original. The [local plan](../../intent/missingness-and-expected-records/implementation-plan.md) governs proposed implementation.

## Decisive source claims

| Evidence               | Checked code                                                                                               | Implication                                                                                                                        |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Value stages           | `valueParsing.ts`: `isMissingValue`, `finiteNumber`; `fieldSettings.ts`: converter, Apply, preview         | Effective absence, conversion failure, and finite eligibility differ. Reuse existing readers.                                      |
| Profile scope          | `fieldProfiles.ts`, `useFilteredFieldProfiles.ts`: `rowsFor`                                               | Marginal summaries have field-dependent owner exclusions. They cannot supply one joint denominator.                                |
| Predicate ownership    | `CrossfilterWrapper.ts`: `getFilterFunction`, `getAllData`, `localSelections`; `chartPopulation.ts`        | Definition predicates can implement semantic unions. Local chart population needs an explicit active outgoing guard.               |
| Registry forwarding    | `charts/registry.ts`: wrapped `getFilterFunction`                                                          | A small schema context must cross both wrapper and Crossfilter if the definition needs it.                                         |
| Effective calculations | `DataLayerProvider.tsx`: `getColumnData`, `getColumnNames`, field-settings rebuild, prop effect            | Calculated outputs have their own cache. A new data prop can restore supplied settings; unkept refresh survival is not guaranteed. |
| Known schema           | Provider `fieldNames`/profiles/calculations; `declaredFieldTypes.ts`; `readNotebook.ts`                    | Keep every query field name, including unknown types and empty results. Requested fields alone do not establish existence.         |
| Finding locality       | `NotebookFindings.tsx`: `useFindingResults`; `findings.ts`: live evaluation and `evaluateNotebookFindings` | Live columns are effective. The standalone helper constructs raw columns and omits calculation preparation.                        |
| Notebook text          | `writeBack.ts`: `skippedKey`, `textPart`, `writeBackChart`; `ExplorEdaNotebook.tsx`: echo bookkeeping      | Automatic writeback excludes filters. Explicit verified Keep and mounted echo tests are required.                                  |
| Record preview         | `ChartDataPreview.tsx`; `trace/traceRows.ts`, `ChartTracePanel.tsx`                                        | Generic preview takes 100 rows and misses notebook-local selection. Add a targeted paged route.                                    |
| Save validation        | `saveDataUtils.ts`: `isBaseChart` before `isChart`; `FilterTypes.ts`                                       | Common filter validation must recognize the new owner boundary. A late chart case alone cannot restore it.                         |
| DSL values             | `dsl/compile.ts`: `buildFilter`, `resolveValueFields`; `dsl/paths.ts`, parser/export/key coverage          | Indexed paths fit nested pattern lists. String-keyed category lookup can merge numeric/text labels during generated text export.   |
| Grain and identity     | `evaluateProject.ts`: `sourceFrame`, `sourceReferences`, `aggregateFrame`; `AnalysisProject.ts`            | One output row remains one pattern observation. Contributor counts and fallback positional references are separate facts.          |
| Notebook lineage       | `readNotebook.ts`: `.rows.map(row => row.data)`; `ProjectWorkspace.tsx`                                    | Folder notebooks lose query schema/provenance. Forward schema now; explore original-source navigation separately.                  |
| Actual folder save     | `ProjectWorkspace.tsx`: notebook callback; `saver.ts`: queue/flush/failure; `App.tsx`: reload              | Use the existing ordered saver and acknowledged status. Do not treat synchronous text change as disk success.                      |

These are source checks. They do not establish any proposed chart, Keep, schema-loss, or browser behavior.
The scalar preview distinctions are intentional inputs to this feature; unrelated consistency audits remain separate work.

## Primary-source checks

- [UpSet authors' publication](https://vdl.sci.utah.edu/publications/2014_infovis_upset/) supports matrix intersections and linked element views.
- [naniar `gg_miss_upset`](https://naniar.njtierney.com/reference/gg_miss_upset.html) documents field/intersection display limits and frequency ordering.
- [VIM `aggr`](https://statistikat.github.io/VIM/reference/aggr.html) documents combinations, counts/proportions, ordering, and complete-observation display.

The local inference is to combine a bounded pattern overview with complete paged records.
No comparator was run. No local finding establishes missingness causes or mechanism classes.

## Recommendation dispositions

| Pro ID | Local disposition                       | Reason and destination                                                                                       |
| ------ | --------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| JM-D01 | Build — M1                              | Registered exact-pattern chart supplies the saved analysis lifecycle.                                        |
| JM-D02 | Build — M1                              | Effective values reuse current readers and preserve raw-stage explanations.                                  |
| JM-D03 | Build — M1                              | Whole semantic unions avoid Cartesian leakage and saved positions.                                           |
| JM-D04 | Build — M1                              | One owner-excluded population supplies every denominator.                                                    |
| JM-D05 | Build — M1; Explore lineage adapter     | Complete current-row traces are required. New notebook original-source navigation is separate.               |
| JM-D06 | Build — M1                              | Strict JSON/text validation preserves active-empty and unavailable intent.                                   |
| JM-D07 | Build — M1                              | Explicit Keep/Reset and guarded source inverse complete persistence. Reuse host Undo where available.        |
| JM-D08 | Build — M1                              | Known schema and explicit unavailable findings prevent silent widening. Kept settings re-evaluate on reload. |
| JM-D09 | Build — M1/M2                           | All-present first; chosen presence/finite checks later use the same predicates.                              |
| JM-D10 | Build — M2                              | Within-group shares explain descriptive concentration with exact group records.                              |
| JM-D11 | Build bounds; Explore computation guard | Page rendering and retain all records. Measure before accepting Pro's arbitrary 12-million-cell cutoff.      |
| JM-D12 | Build — each milestone                  | Docs, runnable examples, browser/persistence/export proof accompany the feature.                             |
| JM-D13 | Explore — later                         | Selectable raw mode needs explicit raw-column semantics across every consumer.                               |
| JM-D14 | Defer                                   | Inclusive intersections and arbitrary group-pattern unions need distinct saved meaning.                      |
| JM-D15 | Defer                                   | Unbounded matrices, correlations, and clustering add scope without replacing exact records.                  |
| JM-D16 | Avoid                                   | Mechanism diagnosis, imputation, grades, and expected observations have different contracts.                 |
| JM-D17 | Avoid                                   | Existing React/provider/trace seams do not justify a separate engine or dependency.                          |
| JM-D18 | Explore — later                         | Named percentage-point findings extend a restricted comparison model; existing shares suffice.               |

Also defer Pro's Copy notebook section action. M1 directly authors and keeps notebooks.
A later exporter must prove preparation, aliases, typed values, query binding, and peer-selection transfer together.
The original wireframe labels this fixed fixture's two patterns. Generated live prose must remain selection-neutral.

## Verification limits

Twenty-nine local fixture checks passed using independently authored Python arithmetic and JSON data only.
They do not import or execute the supplied verifier or repository programs.
The original 41-check log remains attributed to Pro.
Existing profile/conversion/finding/writeback tests passed: four files, 42 tests. They do not test the proposed feature.
Doc/format checks and committed byte inventory are recorded in the run record before completion.
No proposed feature, full persistence journey, browser workflow, or performance acceptance ran during this research integration.
