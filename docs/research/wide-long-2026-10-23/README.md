# Build saved wide-to-long preparation

Add one `unpivot` query step for repeated measurements stored in separate columns.
Save the selected fields and mappings, preserve raw values, and open a copied query in a fresh view.
Each long row identifies an immediate input row and one measurement field.
Ship authoring, exact value origins, save/restore, docs, and a runnable example together.

Read the [implementation plan](../../intent/wide-long-reshape/implementation-plan.md), [run record](run.md),
and [Pro conversation](https://chatgpt.com/c/6adbb78d-732c-83e9-baaa-d809400e2381).
This Design topic scored **19/20**: capability 5, Pro advantage 5, buildable result 5, momentum 4.
No feature code changed. Build dispositions place work in the plan; they do not claim implementation approval.

## Findings checked against code

Review used `95832bd473884aeae23453af0888b4ca5187820d`, still current origin/main on October 23.

- `AnalysisStep` has no reshape member. Existing evaluator stages and copied expansion views provide the right boundary.
- Row references do not identify cells. Lookup aliases, calculation dependencies, and group members need distinct evidence.
- Missing-value helpers include blank text; query null filters and aggregate field counts have narrower rules.
- Workers retain previous completed results and applied bindings. Source-cell inspection also needs matching project/table references.
- `projectFile.ts` has two step allowlists and a schema walk to extend. Empty evaluation alone cannot validate downstream references.
- `compileDocument` infers fields from row profiles. Its compile options lack explicit schema, so empty-result text restore needs an extension.
- The live project workspace already receives evaluation field names and types. Preserve that existing schema path.
- Existing source-view navigation opens the source. An action promising exact supplying records must add exact row filters.

Primary sources support a small explicit operation, but differ on defaults.
[tidyr](https://tidyr.tidyverse.org/reference/pivot_longer.html) retains missing values by default and separates type confirmation from conversion.
[Power Query](https://learn.microsoft.com/en-us/power-query/unpivot-column) distinguishes fixed selections from refresh-dependent membership.
Its [Table.Unpivot example](https://learn.microsoft.com/en-us/powerquery-m/table-unpivot) omits null pairs.
[Vega-Lite fold](https://vega.github.io/vega-lite/docs/fold.html) uses known fields and retains original fields.
Our proposed projection, missing policy, identity, and evidence rules remain explicit product decisions.
These four references were independently checked; the Pro report contains the broader comparison.

## Local dispositions

| Pro ID | Disposition             | Local decision                                                                                                                                    |
| ------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| WL-01  | Build                   | Add one saved query step to the existing evaluator.                                                                                               |
| WL-02  | Build                   | Persist ordered selected/kept fields, literal mappings, stable output IDs, and declared family.                                                   |
| WL-03  | Build                   | Preserve scalars; keep missing pairs by default; separate rows, missing pairs, and valid measurements.                                            |
| WL-04  | Build, narrowed         | Save quantity/type/optional units and reject supplied conflicts. Omit the redundant compatibility attestation flag. Unknown units remain unknown. |
| WL-05  | Build                   | Add direct input-cell evidence; distinguish supplying cells, input result rows, and original/related records.                                     |
| WL-06  | Build                   | First Apply opens a copied query/view with bindings and fresh chart state.                                                                        |
| WL-07  | Build                   | Include editing, inspection, workers, JSON/text restore, docs, and example in M1.                                                                 |
| WL-08  | Build; calibrate limits | Preflight pairs/cells. Treat 100,000/2,000,000 as starting values, not measured capacity.                                                         |
| WL-09  | Build in M2             | Explicit refresh repair and deliberate all-measurements selection; no automatic additions.                                                        |
| WL-10  | Explore                 | Multiple value families need explicit occasion alignment and missing-combination rules.                                                           |
| WL-11  | Explore                 | Global unit metadata affects more than this step; scoped declarations suffice first.                                                              |
| WL-12  | Defer                   | No patterns, wildcard selection, reverse pivot, or automatic refresh membership.                                                                  |
| WL-13  | Avoid                   | Chart-only folding would separate chart rows from saved query rows and inspection.                                                                |
| WL-14  | Avoid                   | No implicit coercion, unit conversion, display-label identity, or independence claims.                                                            |
| WL-15  | Avoid                   | No general graph editor, new evaluator, version coexistence, or result catalogue.                                                                 |

Local review also replaces Pro's special null-unit token with ordinary optional unit text.
It resolves the report's unknown empty-view compiler path into specific `compile.ts`/`views.ts`/`analysisText.ts` work.
The earlier preparation study's upstream-only demand gate does not apply under DIRECTION.md.

## Evidence and open questions

Read both complete reports from the verified two-file archive. Originals remain under ignored tmp/.
Existing evaluator and selection tests pass: two files, 18 tests.
Independent calculations using current parsing helpers confirm the main fixture:
10 pairs, 3 missing pairs, 5 finite measurements, sum 28.5, and current non-nullish count 8.
Drop mode has 7 pairs. Numeric positive filtering has 3 pairs and sum 26.
Key/order invariance, presence distinctions, lineage fixture arithmetic, and budget arithmetic also pass.
These checks validate plan assumptions, not an unimplemented reshape engine.

Implementation must measure the growth ceiling and verify empty-result text restore, worker snapshots, and exact source filtering.
All UI, persistence, and feature acceptance checks remain proposed.
No material gap required a Pro follow-up; zero of one was used.
