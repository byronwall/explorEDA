# Checked evidence and integration decisions

Source baseline and refreshed main: `5594c95690859e8ce456aa3228fa9265ba686d12`, October30,2026.
Checked all open PRs through #572. No new duplicate research cycle was found.
All paths below are relative to the repository root.

| Decisive claim                                            | Current source and checked result                                                                                                                                | Plan consequence                                                                                               |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Cross-query result roots are absent                       | `types/AnalysisProject.ts` has physical source roots and local input steps; `evaluateProject.ts:validateQuery` walks one query.                                  | Add one result root to the same evaluator.                                                                     |
| Grouping and reuse by multiple views already exist        | `aggregateFrame` feeds later local steps; `AnalysisView.queryId` and `ExplorEdaProject` select a query.                                                          | Do not claim another group/chart/view as the new capability.                                                   |
| Stage opening and copying do not create live dependencies | `components/project/queryEditing.ts:queryForStage/copyQuery` copy local steps and remap IDs.                                                                     | Keep copies and result references distinct.                                                                    |
| Flattened membership cannot explain nested arithmetic     | `aggregateFrame` deduplicates source refs; numeric contributors retain immediate values but no qualified upstream stage. Count measures omit contributor arrays. | Retain immediate count/measure operands and qualified dependency stages.                                       |
| Numeric counts differ from present counts                 | `aggregateFrame` count checks null; numeric reducers call `numericExclusionReason`.                                                                              | Add numeric eligibility to query count only; preserve legacy count.                                            |
| Empty and unavailable are separate host states            | `sourceFrame` emits a diagnostic for absent tables; `folder.ts` uses `[]` plus `missingSources` for failed reads.                                                | Propagate availability explicitly to dependencies.                                                             |
| Output metadata needs care                                | Aggregate fields have local step origins and no numeric type; group fields preserve physical origins used by `relationshipSide`.                                 | Add structural numeric types and qualified trace addresses while retaining relationship endpoints.             |
| Pending results retain only part of applied context       | `useAnalysisEvaluation.ts` drops old request IDs and keeps a previous evaluation/bindings; project trace context uses current project/query/tables.              | Retain matching immutable context, disable stale edits, and never resolve old positional keys into new tables. |
| Portable selected-view export is local                    | `projectFile.ts:selectAnalysisProjectView` walks one query, relationship sources, and filter parameters.                                                         | Export transitive producers plus selected-view binding definitions and parameter-option sources.               |
| Folder serialization omits implicit/local definitions     | `writeFolder.ts:projectFileText` filters `implicitQueries` and `localSources`.                                                                                   | M3 initially requires explicit project-owned definitions.                                                      |
| Notebook load discards project lineage                    | `readNotebookText` maps evaluation rows to `row.data` with empty bindings; `ProjectWorkspace` passes preloaded rows; notebook uses `localSelections`.            | Use a project-aware adapter with one result across sheets; preserve local selection behavior.                  |
| Folder host needs view-creation wiring                    | `ProjectWorkspace.tsx` mounts `ExplorEdaProject` without `onOpenView`.                                                                                           | Include host integration in M3.                                                                                |
| New text settings need explicit handling                  | `dsl/project.ts:checkPairs` warns and ignores unknown pairs; compiler uses version1.                                                                             | Validate new result/eligibility/binding syntax; do not promise older-reader coexistence.                       |

Module paths in the first nine rows are under `packages/explorEDA/src/` unless otherwise qualified.
Folder host paths are under `apps/app/src/`.

The numeric `<=20` filter case matches `filterFrame` for this fixture's number values and numeric threshold.
It does not authorize generic coercion of numeric text. Production parsing still belongs to `valueParsing.ts`.
The guarded pooled formula requires execution in the real Calculator during implementation, especially for missing operands.

Read current `apps/app/src/saver.ts`. Open PR #566 already addresses save ordering and edited source queries.
Reuse its final behavior where sufficient. This research does not prescribe a competing queue or transaction layer.
Guided source promotion is optional after the initial project-owned-source boundary.

## External checks

Checked primary documentation for [Vega derived data](https://vega.github.io/vega/docs/data/),
[DuckDB views](https://duckdb.org/docs/2.0/sql/statements/create_view), and
[Perspective derived tables](https://perspective-dev.github.io/guide/explanation/derived_table.html).
They support explicit dependencies, saved recipes, and grain-aware reaggregation respectively.
The choice to extend existing queries is our design inference from those sources and this code.
No competitor interaction was tested. Other Pro citations remain its supplied research, not independently reverified claims.

## Collection and check boundaries

Pro finished in35m57s. Collected the existing ZIP through its linked preview under standing human download approval.
An initial click produced no immediate file; a bounded download-event retry timed out, then the actual ZIP appeared in Downloads.
Checked actual files before any further retry. No regeneration or follow-up was needed.
Verified safe relative paths, no duplicate entries or symlinks, CRC, and exact six-file inventory before extraction.
Read both complete reports, fixture JSON, Python companion, and SVG. Inspected the supplied PNG visually.
The Python companion is preserved for review but was not executed. It claims65 arithmetic checks; that is Pro's result.
Its nine application cases are explicitly proposed and unexecuted.

Original reports include relative links to their delivery ZIP. The ZIP intentionally remains ignored working storage.
Those immutable source links are documented exceptions; the authored asset index lists every committed original.
The SVG/PNG depict a static design concept. They do not prove running UI behavior or responsive acceptance.
