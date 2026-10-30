# Integration evidence and dispositions

Checked October 30, 2026. Refreshed `origin/main`: `5594c95690859e8ce456aa3228fa9265ba686d12`, unchanged from Pro's baseline.
Checked open PRs through #568. No separate refresh Design plan duplicates this cycle.
This checks decisive code claims, not runtime acceptance of the proposal.

## Claims that control the plan

| Claim                                                        | Current source and local conclusion                                                                                                                                                                                                                |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plain refresh restores supplied settings and matches content | `DataLayerProvider.tsx` uses `savedRowsRef` and `carryRowSelections`. The helper compares non-ID content; its unchanged-position fast path skips duplicate remapping. Keyed current-intent reconciliation is new work.                             |
| Four-owner traversal exists                                  | `lib/rowIdFilters.ts` includes chart, chart-local, Rows, and workspace. Reuse it; do not propose missing traversal repairs.                                                                                                                        |
| Project keys are typed with positional fallbacks             | `sourceRowIdentity.ts` and `evaluateProject.ts:sourceReferences` separately construct scalar keys and missing/duplicate fallbacks. Current validity accepts blank strings and nonfinite numbers; the new portability contract is stricter.         |
| Missing project tokens can become sticky                     | `analysisRowKeys.ts` prefixes missing keys; decode preserves that prefix and encode preserves strings. This follows from the helpers, not a new application reproduction. Save canonical keys for the new contract.                                |
| Notebook input discards identity                             | `readNotebook.ts` maps evaluation rows to `row.data`; `ProjectWorkspace.tsx` passes those rows. `ExplorEdaNotebook.tsx` recompiles on data and uses `localSelections`. Pass the existing envelope through this route.                              |
| Notebook clicks are deliberately ephemeral                   | `writeBack.ts:skippedKey` skips `select.*`. Keep needs an explicit new path, not blanket click write-back.                                                                                                                                         |
| Folder refresh remounts the workspace                        | `App.tsx` increments generation on reload/watch and keys `ProjectWorkspace` by it. `notebookMemory` retains valid block text only. Keep session definitions/history above that boundary.                                                           |
| Baseline saver lacks ordered acknowledged checkpoints        | `saver.ts` permits overlapping writes, waits only pending entries in `flush`, and catches write errors. Open PR #566 already changes this; reuse its work where sufficient.                                                                        |
| Failed queries differ from successful empty data             | `useAnalysisEvaluation.ts` retains prior same-query worker results while pending and drops stale replies. Errors construct `emptyEvaluation`; missing sources can return ready diagnostics. Labeled prior-result retention on failure is new work. |
| Saved types and predicates need separate handling            | `SavedDataTypes.ts` reuses runtime chart filters and Rows `Filter[]`. `saveDataUtils.ts` validates them. Widen supported saved owners, then lower before execution.                                                                                |
| Existing text predicates cannot encode exact typed keys      | `dsl/compile.ts` indexes present values by `String(raw)`. `dsl/project.ts:single` joins items; `projectFile.ts` requires scalar `entityKey`. Typed selections and compound declarations need explicit codecs.                                      |
| Findings already use current revisions                       | `findings.ts`, `NotebookFindings.tsx`, and tests establish eligible/selected populations, numeric exclusions, comparisons, and close-on-revision inspection. Add coverage outside reducers.                                                        |

Unqualified library paths are under `packages/explorEDA/src/`; app paths are under `apps/app/src/`.
The 12-record ledger and active-East fixture match the report's records and arithmetic.

## Concurrent implementation

[PR #566](https://github.com/byronwall/explorEDA/pull/566), head `1bb9d56033981afa916af15ef67a2ca8561efa77`, is open.
Read its body, changed-file list, and fetched `saver.ts`.
It serializes writes globally, awaits the chain in `flush()`, retains failure/retry state, and protects reload after save failure.
It also changes folder query persistence and includes notebooks in view listings.

Recheck and reuse that implementation before changing save code.
Do not build a competing per-path queue merely because Pro named one.
Checkpoint acknowledgment and destination-specific failure remain acceptance requirements, not claims that #566 passes all new cases.
Do not treat this unmerged PR as current baseline behavior.

## Local dispositions

Build defines planned work; it does not authorize shipping. IDs retain Pro's mapping.

| ID   | Disposition      | Local decision and reason                                                                     |
| ---- | ---------------- | --------------------------------------------------------------------------------------------- |
| SR01 | Build            | One boundary with two adapters avoids forcing plain hosts into projects.                      |
| SR02 | Build            | Explicit continuity and typed compound keys separate identity from printed values.            |
| SR03 | Build            | Save canonical requests; keep predicates over current values.                                 |
| SR04 | Build            | Retain absent members so they can return after reopening.                                     |
| SR05 | Build            | Persist duplicate review to prevent a unique remaining impostor replacing the original.       |
| SR06 | Build            | Separate empty, clear, partial, unavailable, and incompatible states.                         |
| SR07 | Build            | Reconcile live intent and classify echoes/restores before publishing one revision.            |
| SR08 | Build            | Save guards without refresh Undo steps; reuse host queues/history.                            |
| SR09 | Build            | Factor existing project identity and carry full-source ambiguity.                             |
| SR10 | Build            | Pass query keys into notebooks; explicit Keep and session retention complete refresh.         |
| SR11 | Build            | Show per-owner coverage and current contributors outside existing reducers.                   |
| SR12 | Build            | Include persistence, docs, runnable examples, and meaningful checks in each milestone.        |
| SR13 | Build after core | Exact expanded pairs add child retention without parent fan-out.                              |
| SR14 | Explore          | Measure a real workload before optimizing synchronous resolution.                             |
| SR15 | Defer            | Group identity, mixed portability, and automatic migrations need separate semantics.          |
| SR16 | Avoid            | No content identity, duplicate winner, pruning, implicit rebind, capture system, or registry. |

## External checks and limits

Checked [AG Grid replacement behavior](https://www.ag-grid.com/javascript-data-grid/data-update-row-data/): stable IDs preserve selection for rows in both datasets.
Checked [TanStack selection](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection): state can retain absent IDs, and sub-row selection is configurable.
These support identity/value separation and retained requests. Duplicate guards and grain policy remain local design choices.
No new state library or table engine is required.

The Perspective guide URL in the original report was unavailable through the web tool during integration.
That comparison is supporting context, not a dependency of the chosen contract. Original citations remain intact.

Read both reports completely. Inventory checks match the [asset index](../../intent/selection-refresh/assets/pro-results/selection-refresh-design-2026-10-29/index.md).
The run record distinguishes local probes and existing baseline tests from proposed feature acceptance.
Watcher, persistence, Undo, browser, and performance acceptance remain implementation work.
