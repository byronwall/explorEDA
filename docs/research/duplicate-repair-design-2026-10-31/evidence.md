# Checked duplicate-repair evidence

Collected October 31, 2026 from the recorded [Pro conversation](https://chatgpt.com/c/6ae5fdfa-7aa0-83e9-b5d6-9603c7e92c6b).
Pro finished in 27m6s. No follow-up was sent.
Refreshed `origin/main` remains `ab4ecd2aa98f3fd1da11e8f552efdb269f4b65a6`; open PRs through #580 were checked.

## Decisive repository claims

| Claim                                                                                              | Current source checked                                                           | Consequence                                                                                                              |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Source reads and relationship targets independently read physical tables                           | `lib/analysis/evaluateProject.ts`: `sourceFrame`, `lookupFrame`, `expandedFrame` | A query-only preparation step cannot repair an existing lookup target.                                                   |
| Ambiguous lookup projects undefined, keeping candidate references                                  | `lookupFrame`; existing evaluator tests                                          | Preserve that protection for raw and alternate-field relationships.                                                      |
| Duplicate identity uses positional fallbacks                                                       | `sourceReferences`; `components/project/sourceRowIdentity.ts`                    | Manual decisions need content guards and immutable occurrence coordinates.                                               |
| Entity-aware reduction prefers source references and rejects conflicting values                    | `aggregateFrame`; `entityGrain.test.ts`                                          | Logical prepared identity belongs in execution references; excluded witnesses remain evidence.                           |
| Preview matched count includes ambiguous rows; expanded counts extra rows                          | `components/project/relationshipEditing.ts`: `countMatches`                      | Name units and use evaluator-matched before/after semantics. Current NaN handling differs between preview and evaluator. |
| Chained relationship direction depends on field origin or qualified field ID                       | `relationshipSide` and `queryEditing.ts`                                         | Unchanged aliases do not prove a retargeted chain remains valid.                                                         |
| Source inference adds unmarked generated row numbers                                               | `lib/analysis/sources.ts`: `sourceFromRows`                                      | Add metadata before excluding generated fields from exact comparison.                                                    |
| Selected-view export closes direct step and relationship sources only                              | `lib/analysis/projectFile.ts`: `selectAnalysisProjectView`                       | Add physical-ancestor and evidence closure.                                                                              |
| The existing codec preserves undefined/nonfinite values and collision escapes, but not signed zero | `projectFile.ts`: `encode`, `decode`                                             | Extend this codec for original evidence. Do not use plain JSON on snapshots.                                             |
| Workers share evaluation and reject stale replies                                                  | `analysisWorkerProtocol.ts`, `useAnalysisEvaluation.ts`                          | Extend the existing route and its dependencies. Process-local revisions are not snapshot IDs.                            |
| Notebook loading discards evaluation provenance and diagnostics                                    | `lib/notebook/readNotebook.ts`: `readNotebookText`                               | Return current outcome and record mapping alongside chart values.                                                        |
| Folder notebooks receive initial loaded rows                                                       | `apps/app/src/ProjectWorkspace.tsx`: notebook render and `onProjectChange`       | Reevaluate notebook data after accepted project edits.                                                                   |
| Notebook findings need unavailable guards before count reducers                                    | `lib/notebook/findings.ts`, `components/notebook/NotebookFindings.tsx`           | Missing repair data must not become a current zero.                                                                      |
| The host callback is void and updates project/view state                                           | `components/ExplorEdaProject.tsx`; `ProjectWorkspace.tsx`                        | Evidence and definition need one acknowledged host operation.                                                            |
| Saver write failures are caught and later queued writes continue                                   | `apps/app/src/saver.ts`: `start`, `write`, `flush`                               | Queue order alone cannot guarantee evidence exists before its pointer.                                                   |
| Folder read/write assumes physical or inferred sources and direct usage                            | `lib/project/folder.ts`, `writeFolder.ts`, `lib/dsl/project.ts`                  | Recognize preparation explicitly and retain transitive source declarations.                                              |

Library-relative paths above start at `packages/explorEDA/src/`.
These are source observations and design implications, not implemented feature acceptance.

## External checks

[Microsoft Table.Distinct](https://learn.microsoft.com/en-us/powerquery-m/table-distinct) confirms no general survivor guarantee.
[PostgreSQL window functions](https://www.postgresql.org/docs/current/tutorial-window.html) confirms unspecified order among tied row numbers.
[OpenRefine clustering](https://openrefine.org/docs/technical-reference/clustering-in-depth) distinguishes syntactic similarity from semantic reconciliation.
These support explicit survivor rules and unresolved ties. No comparator application was executed.

## Local corrections and proof

DR-F06 contains ten rows: eight invalid-key occurrences, valid numeric zero, and valid false.
Its explicit-exclusion run emits two rows. Pro's M1-A06 discusses an invalid-only zero-output case absent from that fixture.
The local plan requires both the existing two-row outcome and a separate invalid-only test.

The local plan defers v1 migration/legacy adapters under the single-version rule.
It blocks incompatible retargeted chains before considering automatic relationship cloning.
The existing folder saver still requires a direct evidence-success barrier; this is a concrete persistence boundary.

Independent locally authored Python checks read fixture JSON only. They do not import supplied or repository programs.
They pass **236 assertions**, covering 21 repair variants, seven relationship count vectors, complete occurrence partitions,
whole-record equality, generated-field projection, 90/80/70/120 populations, and refresh-group guards.
All 16 cases and 25 snapshot structures were inspected. This is not a complete selection-engine oracle.

The entire supplied verifier and contract sketch were read. SVG XML and Mermaid source were inspected.
The reports, recommendations, and guide were read. No downloaded program was executed.
Pro's standalone verifier and TypeScript syntax checks remain Pro-reported.
Production parser, persistence, worker, browser, transaction, performance, and repair implementation acceptance remain future checks.

Existing baseline evaluator/entity-grain/source-identity tests pass: three files, 13 tests.
Docs checks pass: three files, 74 tests, with existing React act warnings.
This PR changes docs and original result assets only. No full package check or changeset applies.
Authored formatting, links, whitespace, commit authors, and original ZIP/disk/Git inventory are checked before completion.
