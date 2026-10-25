# Parameterized local investigation notebooks

Build one existing project query into a notebook with saved typed inputs, current record inspection, and reliable reopening.
The local folder app owns files and navigation. The React package supplies rendering and evaluation.
This is a proposed feature plan. Build means planned scope, not permission to ship.

Source review: `95832bd473884aeae23453af0888b4ca5187820d`, unchanged origin/main on October 25, 2026.
See the [Strategy review and dispositions](../../research/repeatable-analysis-2026-10-25/README.md) and [Pro conversation](https://chatgpt.com/c/6add5995-4c74-83e9-ab90-723ecb543e89).
No open research PR is a prerequisite.

## Product contract

- One notebook uses one query population. All sheets share that population and their definitions.
- The project owns parameter definitions and query steps. Notebook text owns literal binding values.
- Apply commits the complete valid input tuple. Cancel changes nothing. Ordinary chart settings continue to apply live.
- The scope line describes the completed result on screen: query, applied inputs, row meaning, and row count.
- Clicks and brushes remain local to each chart. They do not change saved inputs or other sheets' populations.
- Reopening evaluates the saved question against current source files. Static prose remains authored text.
- A named case is another notebook file. Copy first, open the copy, then change its inputs.
- A copied project with relative local data is an editable native handoff using the same application version.
- A copy includes all source-file rows. It is not a filtered export or a historical evidence format.

Do not add a recipe registry, result database, semantic layer, publishing service, or new execution engine.
Live findings remain the separate proposal in [PR #507](https://github.com/byronwall/explorEDA/pull/507).

## Existing seams

Paths below are relative to the repository root.

| Existing module                                                                       | Current behavior and required connection                                                                                                                               |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `packages/explorEDA/src/types/AnalysisProject.ts`                                     | Defines typed parameters, query stages, bindings, results, and source references. Reuse these types.                                                                   |
| `packages/explorEDA/src/lib/project/analysisText.ts`                                  | Reads `bind.*` on view headers. Its scalar codec preserves quoted strings. Share this codec when adding notebook bindings.                                             |
| `packages/explorEDA/src/lib/notebook/readNotebook.ts`                                 | Finds the first named query, evaluates with `{}`, and keeps only `row.data`. Add bindings and retain evaluation/schema information needed by callers.                  |
| `packages/explorEDA/src/components/project/parameterBindings.ts`                      | Finds used parameters and validates types and bounds. Equal bounds are allowed; reversed bounds are rejected.                                                          |
| `packages/explorEDA/src/components/project/QueryParameters.tsx`                       | Applies every valid changed set. Reuse fields/validation, while keeping notebook Apply separate. Boolean parameters need an actual boolean control.                    |
| `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts`                        | Supplies direct/worker evaluation, applied bindings, and late-response rejection. Pending results lack their original source-table tuple.                              |
| `packages/explorEDA/src/components/AnalysisChartContext.tsx`                          | Maps runtime row indexes to query result rows and opens query inspection. Wire it to the notebook's exact displayed rows.                                              |
| `packages/explorEDA/src/lib/notebook/compileNotebook.ts`, `sheets.ts`, `writeBack.ts` | Share definitions across sheets and preserve text. Last-valid text is recomputed; transient `select.*` is excluded from write-back.                                    |
| `apps/app/src/ProjectWorkspace.tsx`                                                   | Owns working notebook text and saver queues; currently renders rows from folder loading. Connect current project evaluation here.                                      |
| `apps/app/src/App.tsx`, `saver.ts`, `projectActions.ts`                               | Own reloads and file operations. `flush()` catches write failures and does not await all already-running writes. Its resolution cannot confirm a safe copy/navigation. |

The compiler currently derives fields from rows. Valid empty query results need a narrow declared-schema input through compilation and rendering.
Keep ordinary row-driven notebooks available for hosts and daily pages. This is an existing product boundary, not version coexistence.

## M1 — Apply, inspect, save, and reopen

Ship a complete journey from a text-authored notebook. New file names below are proposals.

1. Add `lib/notebook/queryTarget.ts` under `packages/explorEDA/src/` for the query target, typed bindings, and source spans.
2. Share the scalar binding codec with `lib/project/analysisText.ts`. Reuse the existing tokenizer and `encodeScalar`.
3. Add focused target write-back, beside existing notebook write-back. Change only the query/binding tokens.
4. Add `components/notebook/ExplorEdaProjectNotebook.tsx` as a small project-aware wrapper around `ExplorEdaNotebook`.
5. Connect validation, evaluation, Inputs, applied scope, diagnostics, and existing query/stage inspection.
6. Pass declared query fields through `readNotebook.ts`, `compileNotebook.ts`, `lib/dsl/compile.ts`, and rendering for empty results.
7. Connect the wrapper in `ProjectWorkspace.tsx`. Keep text, saver, last-valid text, and session sheet choice host-owned.
8. Export the component from the existing package entry. Add a minor changeset when implementing the package capability.

The saved declaration has new notebook semantics:

```text
eda query=service-requests bind.service="checkout" bind.from=2026-10-01 bind.until=2026-10-08
```

Require one unambiguous query target for this parameterized path. Report duplicate declarations, duplicate keys, unknown bindings, and invalid required inputs.
Existing notebooks without bindings retain the current query/default-query rule. Do not add migrations or a second saved format.
Only the chosen query's used parameters appear, in project order.
Quoted `"0012"` stays text; unquoted `12` is numeric. Quoted `"true"` differs from boolean `true`.

Inputs use a compact nonmodal popover with Apply and Cancel. Disable saved-input edits when the host cannot persist text.
Keep invalid drafts local. An invalid initial target is a diagnostic, not a successful zero-row query.
Expose one guarded Revert inputs action for the last input edit. It patches current text and preserves later prose/chart edits.
Invalidate reversion after conflicting target/binding or query-definition changes. Do not add general folder history.

Memoize the semantic target and bindings. A prose or chart-title edit must not rerun the query.
Keep displayed rows, schema, applied inputs, and inspection from one evaluation.
When current inputs/project/tables differ from that evaluation, close or disable evidence actions immediately, before worker effects run.
Old rows may remain visibly updating under their old applied scope. Resume inspection only after a matching result completes.
Do not store historical source tuples or add a new evaluation protocol.

On a completed input/source change, clear only this wrapper's transient selections and traces. Preserve authored `where.*` and sheet position.
Do not change shared provider restore, same-data undo, or existing notebook selection defaults.

Use the existing header trace and Alt-click/Alt-Enter routes. Query rows, direct source records, and related records have different meanings.
Keep runtime index-to-result mapping aligned with the displayed evaluation. Never resolve old references against new table arrays.
Reuse existing stage/measure evidence; do not promise a universal contributor ledger.
Where existing previews cap records, provide complete paged access for any new direct-record promise.

### Exact example

Add a proposed `packages/explorEDA/examples/request-review/` folder with project text, `checkout-review.eda.md`, local data, an update fixture, and README.
Define source `requests`, entity key `requestId`, and fields below. Keep `durationMs` raw with type `unknown`.
The query reads requests, then filters service equality, date `>= $from`, and date `< $until`.
Parameters are required string service and date from/until. Use canonical ISO date strings in this example.
Current query filtering compares strings; this plan does not add date normalization or window methods.

| ID  | Service  | Date       | Duration, ms |
| --- | -------- | ---------- | ------------ |
| r01 | checkout | 2026-09-30 | 80           |
| r02 | checkout | 2026-10-01 | 100          |
| r03 | checkout | 2026-10-02 | 200          |
| r04 | checkout | 2026-10-03 | null         |
| r05 | checkout | 2026-10-04 | "timeout"    |
| r06 | checkout | 2026-10-05 | 500          |
| r07 | search   | 2026-10-02 | 1000         |
| r08 | checkout | 2026-10-08 | 900          |
| r09 | checkout | 2026-10-07 | 0            |

Use two top-level headings for two sheets. Show a count card, average-duration card, and request table.
Avoid a `:num` alias: conversion would erase the distinction between null and nonnumeric source inputs.

| Case                                                                  | Exact expected result                                                           |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| checkout, October 1 inclusive to October 8 exclusive                  | r02,r03,r04,r05,r06,r09; count 6; finite IDs r02,r03,r06,r09; sum 800; mean 200 |
| Change r03 to 400; append checkout r10 on October 6 with duration 300 | Same six plus r10; count 7; five finite inputs; sum 1300; mean 260              |
| search, same interval                                                 | r07; count 1; mean 1000                                                         |
| Unmatched service                                                     | Count 0; mean unavailable; fields and authored charts retained                  |
| from equals exclusive until                                           | Valid empty population                                                          |
| from after until                                                      | Apply blocked; shown result keeps its applied scope                             |

r09's zero contributes. r01 and r08 stay outside the interval. Reversing uniquely keyed source order preserves membership and values.
Filtering the table to r06 leaves the separate cards at 6 and 200 and leaves bindings unchanged.
A static sentence containing “200 ms” remains text after data changes to a mean of 260.

### Evidence required when implemented

Keep tests focused on boundaries that can fail:

- Target/codec and write-back: typed collisions, invalid required inputs, duplicate targets/keys, one Apply, Cancel, and guarded reversion.
- Evaluation/schema: exact fixture membership, raw exclusions, valid empty fields/charts, source refresh, and late worker responses.
- Mounted flow: scope matches shown rows; stale source actions disable; prose edits do not reevaluate; selections stay local.
- Folder flow: Apply saves only notebook text; reopening and source replacement recover correct results; failed saves remain visible.
- Evidence: exact current row/source mapping, plus access beyond an existing preview cap if the new flow promises all direct records.
- Browser: full apply/inspect/save/reopen/update journey with pointer and keyboard at 1280, 783, and 390 px.

Pair this milestone with `notebooks.mdx` sections for inputs, saved meaning, refresh, and current records.
Update `project-folders.mdx`, `export.mdx`, `developers.mdx`, and the package README for ownership and native handoff.
Register the same fixture in `apps/demo/src/docs/live/examples.ts` and relevant example/coverage entries.
Register a proposed `parameterized-notebook.e2e.ts` in an explicit Playwright project; the current config uses per-project regexes.
An `.e2e.ts` suffix alone does not ensure discovery.

Main risk: new scope labels beside old evidence. Completion requires mounted and folder/browser evidence, not just parser tests.

## M2 — Create, copy, and return

Add compact local-app actions: New notebook over an existing query, and Save another case.
New notebook chooses a name/query and required inputs, then writes a small valid count/table skeleton.
Do not add a template catalogue or query wizard.

Copy captures current working text. Confirm that every working file a reload would discard saved its expected text.
Then create a distinct `.eda.md` path, await the write, open it, and let the analyst change the copy's inputs.
Use a narrow awaited save acknowledgment in `FolderSaver`; account for pending and already-running writes and failed latest text.
Do not use `flush()` resolution or one aggregate saved event as proof. Keep history outside the saver.
Prevent concurrent edits/duplicate copy actions during this bounded operation. Failure keeps the original text and workspace open.
Do not reuse `App.tsx`'s generic `act` unchanged: it reloads even through its error path.

Use `App.tsx`, `ProjectWorkspace.tsx`, `projectActions.ts`, and `saver.ts`. Extract notebook file helpers only if clarity needs them.
The current rename helper expects `.eda`/dashboard text; notebook rename is optional and not part of this milestone.
Store last-open file/sheet as a folder-scoped host preference, outside analytical definitions. Missing paths use a safe fallback.
Shared query edits affect both cases; copied prose/charts and bindings remain independent.

Verify current unsaved text is copied; save/write failure blocks creation/navigation; read-only hosts cannot write.
Include an in-flight write and another working file's failed save so unrelated success cannot mask lost text.
Reopen checkout and search cases: initially 6/200 and 1/1000 respectively. Verify file/sheet return after restart.
Copy the full example folder, open it with the same build, and confirm the original stays independent.

Extend the same notebooks, project-folders, and export docs and runnable example in this milestone.
Main risk: copying stale disk text or losing unsaved work during navigation.

## Validation and stopping point

During implementation, run targeted notebook, project binding, evaluation, and app saver/action tests, then package/app types.
Use the repository's shared test time limits. Run example coverage/dashboard-text checks after registering the example.
Run `pnpm check` once before each implementation PR. The current planning PR changes only docs and does not require it.
Use `scripts/app-shot.mjs` for app screenshots; its change stream prevents network-idle waits from finishing.
Run the registered notebook browser project explicitly, then the updated notebook docs journey after the demo build.
Check folder CLI validation and same-build reopening from a fresh temporary copy of the example.

Stop when Byron can apply a saved question, inspect current records, reopen after source correction, and hand off an independent native copy.
Pro estimates roughly 3–5 focused developer-weeks for both milestones. This is an unmeasured judgment, not a schedule commitment.
Historical capture, paired-case navigation, reusable rates, and specialist chart methods remain separate proposals.
No new Pro run or outside-demand gate blocks this plan's first milestone.
