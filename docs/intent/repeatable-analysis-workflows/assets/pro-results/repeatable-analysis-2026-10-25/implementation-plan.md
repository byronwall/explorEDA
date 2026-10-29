# Implementation plan: parameterized local investigation notebooks

## Build decision and completion contract

**Implement RA01 from report.md: one project query → one notebook with typed saved inputs → current record inspection → save/reopen → a named copy for another question.** The local folder app owns persistence and navigation. The package supplies reusable rendering/evaluation behavior and remains storage-neutral.

The first complete journey must work without #507, #514, #517, #518, #519, #520, #521, or #523. Build live findings from #507 afterward as RA02. Historical evidence capture is RA03, not a prerequisite.

**Baseline:** `95832bd473884aeae23453af0888b4ca5187820d`. This is a proposed worker plan. No feature code, repository tests, or browser acceptance was executed in this research run. Newly named files below are explicitly marked **proposed**. Paths named **existing** were read at the baseline or identified in its guide; workers should check the current checkout before integrating.

### User-visible contract

- A notebook names exactly one query population. Sheets share that population and its definitions.
- The project owns query steps and typed parameter definitions. The notebook owns literal input values.
- Applying inputs writes one small notebook text change. Draft inputs are not saved.
- The scope line describes the **completed evaluation being shown**, including its applied inputs and row meaning.
- Charts use the current query rows. Chart-local selections retain their existing local meaning and are not silently promoted into saved inputs.
- Reopening a notebook reevaluates its saved question against current project sources.
- Saving another case means **copy first, open the copy, then change its inputs**. Applying inputs in the original would change the original.
- The initial handoff is an ordinary project-and-data folder opened with the **same explorEDA version**. It is editable analysis, not an immutable historical artifact or browser-only reader.
- Static prose is authored prose. Computed finding tokens are a later #507 capability.

### Milestones and rough effort

| Milestone | Independently useful result | Rough effort |
| --- | --- | --- |
| **M1** | Open an authored notebook, apply inputs, inspect current evidence, save, reopen, and refresh from changed sources. | Approximately 8–14 focused developer-days, including bounded input reversion, docs, and acceptance. |
| **M2** | Create a notebook and copy a named case in the app; return to its file/sheet and hand off the native example. | Approximately 3–6 focused developer-days. |

Allow approximately **3–5 focused engineer-weeks overall**, including integration/review. These are judgment bands, not a schedule promise. Empty-result schema and evidence freshness are the main uncertainties. Avoid adding a third generic-history milestone; a narrow input-reversion action is sufficient.

## 1. Reuse the actual boundaries

### Existing seams that decide the architecture

1. `AnalysisProject.ts` already defines parameters, parameterized filters, views, and query results. `evaluateProject.ts::evaluateAnalysisQuery` executes the supported query steps. Reuse them. [C1][C2]

2. `analysisText.ts::analysisViewQueries` already reads typed `bind.*` values on **view headers**. `bindValue` preserves quoted strings; `exportAnalysisText` uses `encodeScalar`. Reuse/extract that codec when it gains a second consumer. [C3]

3. `readNotebook.ts::readNotebookText` currently evaluates the named query with `{}` and keeps only `row.data`. This is where notebook binding semantics and evaluation diagnostics must be added. [C4]

4. `QueryParameters` applies every valid changed set today; `queryParameters` and `bindingProblem` supply selection/validation. The proposed notebook popover stages a tuple and has an explicit Apply action. Do not accidentally change existing project controls to this new commit policy. [C5]

5. `useAnalysisEvaluation` already supports direct/worker evaluation, old completed same-query results while pending, applied bindings, and late-response rejection. It does not retain the matching old source/project tuple for lineage resolution. Reuse it and make the small freshness boundary explicit. [C6]

6. `ExplorEdaProject` already connects `AnalysisChartContextProvider`, runtime row indexes, result keys, and query inspection. Reuse that evidence path; do not infer provenance from chart display positions. [C7]

7. `ProjectWorkspace` owns working notebook text and queues writes. `App` reloads on file changes. `FolderSaver` is delayed persistence, not a history engine. Its caught write errors mean a resolved `flush()` is not a blanket success acknowledgment. [C8][C11][C12]

8. `compileNotebook` shares definitions across sheets and supports last-valid block **text**. `writeBackSettings` excludes transient click/brush selection. Preserve both behaviors. [C9][C13]

### Recommended component split

Add **proposed** `packages/explorEDA/src/components/notebook/ExplorEdaProjectNotebook.tsx` alongside the existing row-driven `ExplorEdaNotebook`.

Its responsibilities are narrow:

- Read/validate the notebook’s query target and bindings.
- Evaluate that query from current `project` and `tables`.
- Show Inputs, applied scope, diagnostics, and a temporary query/evidence inspector.
- Pass coherent rows and declared field schema to `ExplorEdaNotebook`.
- Report explicit source-text edits through the existing host text callback.
- Accept host-controlled sheet/navigation props rather than owning routes or storage.

Keep the existing row-only notebook path for hosts and daily pages. Do not require every notebook to know about a project. Use existing `AnalysisProject`, `AnalysisScalar`, and `AnalysisEvaluation` types; no saved Investigation/Recipe/Run DTO is introduced.

### Minimal saved syntax

This header gains **new notebook semantics**:

~~~text
eda query=service-requests bind.service="checkout" bind.from=2026-10-01 bind.until=2026-10-08
~~~

The tokenizer already represents pairs and the ordinary chart compiler ignores the `eda` declaration. Prefer semantic parsing and source-span editing over a grammar rewrite.

For parameterized notebooks:

- Require one unambiguous query-target declaration. Reject duplicate target declarations or duplicate binding keys with file-line diagnostics.
- Reuse literal scalar encoding; do not add expressions, variable interpolation, saved runtime IDs, or query overrides in URLs.
- Reject unknown binding keys for this notebook target, wrong types, and missing required values. Do not silently substitute “All.”
- Preserve nonparameterized notebook fallback behavior for existing files.
- Keep one query for the whole notebook. A different query on another sheet is not supported by this boundary.
- Display only parameters used by the chosen query, in their declared order.
- Treat equal `from` and exclusive `until` as a valid empty interval, consistent with existing validation; reversed bounds are invalid.

## 2. Complete first example and exact expectations

All example paths in this section are **proposed**. Use a local JSON source to preserve null and nonnumeric values.

### Proposed folder files

- `packages/explorEDA/examples/request-review/exploreda.eda`
- `packages/explorEDA/examples/request-review/checkout-review.eda.md`
- `packages/explorEDA/examples/request-review/data/requests.json`
- `packages/explorEDA/examples/request-review/fixtures/requests-updated.json`
- `packages/explorEDA/examples/request-review/README.md`

Register/copy the example only through the repository’s existing example packaging path if distribution is included. The development command can open the proposed folder directly, so a new CLI flag is not an M1 dependency.

### Project text

The project/query syntax below is existing syntax; only the notebook binding behavior shown later is new.

~~~text
project @request-review

source @requests key=requestId path=data/requests.json {
  field requestId "Request ID" string
  field serviceId "Service" string
  field date "Date" date
  field durationMs "Duration (ms)" unknown
}

param @service "Service" string required
param @from "From" date required
param @until "Before" date required

query @service-requests "Service requests" glyph=R frame=requests {
  source @read requests
  filter @service-filter requests.serviceId = $service
  filter @from-filter requests.date >= $from
  filter @until-filter requests.date < $until
}
~~~

The first version uses a string service input, avoiding a new “distinct values from an arbitrary field” picker. Existing source-backed choices can be reused when a project has a proper service dimension whose entity key is the service ID. Do not point a request-source picker at `serviceId` and accidentally store request entity keys.

### Initial requests.json

~~~json
[
  {"requestId":"r01","serviceId":"checkout","date":"2026-09-30","durationMs":80},
  {"requestId":"r02","serviceId":"checkout","date":"2026-10-01","durationMs":100},
  {"requestId":"r03","serviceId":"checkout","date":"2026-10-02","durationMs":200},
  {"requestId":"r04","serviceId":"checkout","date":"2026-10-03","durationMs":null},
  {"requestId":"r05","serviceId":"checkout","date":"2026-10-04","durationMs":"timeout"},
  {"requestId":"r06","serviceId":"checkout","date":"2026-10-05","durationMs":500},
  {"requestId":"r07","serviceId":"search","date":"2026-10-02","durationMs":1000},
  {"requestId":"r08","serviceId":"checkout","date":"2026-10-08","durationMs":900},
  {"requestId":"r09","serviceId":"checkout","date":"2026-10-07","durationMs":0}
]
~~~

### Notebook text

The two `#` headings intentionally create two sheets. Both sheets share the one query result.

~~~~markdown
# Service request review

Review the duration measurements and the requests that supplied them.
Missing and nonnumeric values remain available in the request table.

```eda
eda query=service-requests bind.service="checkout" bind.from=2026-10-01 bind.until=2026-10-08
metric @requests count title="Requests in scope"
metric @latency avg(requests.durationMs) title="Mean latency (ms)"
```

# Inspect the requests

Use the table and chart trace to examine the current inputs.

```eda
table @records requests.requestId,requests.serviceId,requests.date,requests.durationMs title="Requests in scope"
```
~~~~

Add one ordinary plot to the runnable demo if useful for demonstrating local selection, using established chart syntax. Keep it on the same raw duration field; acceptance must verify that adding it does not install a numeric conversion on the shared field.

**Raw-value requirement:** retain `durationMs` as unconverted raw input. Do not add a `:num` alias or a numeric field conversion. Source/query loading preserves null versus `"timeout"`, but an explicit numeric conversion can turn both into undefined. The average/table must preserve the difference in their source evidence. Verify actual runtime field preparation, not merely the project declaration. [C2][C10]

**Date requirement:** these are consistently formatted date strings. Current query filtering compares strings lexically; declaring a date parameter validates it but does not normalize arbitrary mixed timestamp formats or offsets. This fixture requires no new date/window method.

### Exact acceptance values

| Check | Initial data | Corrected/appended data |
| --- | --- | --- |
| Request-source size | 9 | 10 |
| Checkout query IDs | r02, r03, r04, r05, r06, r09 | Same six plus r10 |
| Query row count | 6 | 7 |
| Finite duration IDs | r02, r03, r06, r09 | Same four plus r10 |
| Finite input count | 4 | 5 |
| Sum | 800 ms | 1,300 ms |
| Mean | 200 ms | 260 ms |
| Invalid/missing duration inputs | r04 null; r05 "timeout" | Same two |
| Search / same interval | r07; count 1; mean 1,000 ms | Same |
| Unmatched service | count 0; mean unavailable | Same |

The update fixture changes r03’s duration from 200 to 400 and appends:

~~~json
{"requestId":"r10","serviceId":"checkout","date":"2026-10-06","durationMs":300}
~~~

Generate the updated fixture from those two changes and preserve every other row. These are expected exact memberships and arithmetic, independently checked in this research. They are not executed application tests.

Further focused expectations:

- r09’s zero contributes to the average.
- r08 is excluded by the exclusive end; r01 is excluded by the inclusive-start comparison.
- `from=until=2026-10-01` is valid with zero rows.
- `from=2026-10-08, until=2026-10-01` cannot apply.
- Reversing valid uniquely keyed source order preserves the membership set and values.
- A missing/duplicate source key exposes existing diagnostics; no durable cross-refresh identity is promised for fallback rows.
- A static sentence containing “200 ms” remains text after the mean becomes 260 ms. Do not make the example imply otherwise.

## 3. M1 — Apply inputs, inspect, save, and reopen

### Behavior

Ship the complete text-authored journey:

1. Open the proposed project in the local app and select `checkout-review.eda.md`.
2. Show service/date inputs and a scope line for the current completed query.
3. Open Inputs, edit a tuple, apply it once, and update notebook text through one explicit mutation.
4. Recompute all sheets from the resulting query population.
5. Inspect a metric’s available native trace and open the exact current query rows/source references it supplies. In the request table, use the `requestId` column filter to select `r06`: the table shows that record while the separate count and mean cards remain 6 and 200 ms. Clear the table filter before continuing; saved service/date bindings never change.
6. Save, close/reopen, and recover the same question from the notebook file.
7. Replace the source with the update fixture and show 7 requests / 260 ms once the new evaluation completes.
8. Copy the saved example folder and reopen that independent copy with the same app version.

### Modules

Prefixes below are relative to `packages/explorEDA/src/` unless an app/docs path is written in full.

| Module | Work |
| --- | --- |
| **Proposed** `lib/notebook/queryTarget.ts` and tests | Parse/validate one target and typed bindings with source spans. Share it between folder/CLI reading and the interactive wrapper. |
| **Proposed** `lib/project/bindingTokens.ts`, if extraction is needed | Move the existing scalar bind codec from `analysisText.ts` for two consumers; preserve existing view behavior. |
| **Existing** `lib/notebook/readNotebook.ts` | Evaluate with parsed bindings, carry schema/evaluation information needed by the caller, and surface evaluator diagnostics. |
| **Proposed** `lib/notebook/writeBackTarget.ts` and tests | Patch target/binding tokens while preserving prose, comments, spacing, chart lines, and unrelated keys. Validate the reconstructed target. |
| **Proposed** `components/notebook/ExplorEdaProjectNotebook.tsx` and tests | Connect target, current evaluation, scope, Inputs, text callback, and temporary evidence inspection. |
| **Existing** `components/project/QueryParameters.tsx` and `parameterBindings.ts` | Reuse validation and typed input logic; extract shared fields if needed. Keep the existing auto-valid-apply policy outside this notebook. |
| **Existing** `lib/analysis/useAnalysisEvaluation.ts` | Reuse evaluation and request rejection. Add only the minimum completed-input association needed to keep evidence coherent, if the wrapper cannot handle it. |
| **Existing** `components/AnalysisChartContext.tsx`, `components/project/ProjectQueryPanel.tsx`, `QueryStageRows.tsx` | Reuse current-result context and stage inspection. Use a read-only query-definition view; notebook authoring does not become a second query editor. |
| **Proposed** `components/notebook/NotebookQueryDetails.tsx`, if needed | A small adapter for temporary query/stage focus and exact direct-source reference display. Avoid a permanent new sidebar. |
| **Existing** `lib/dsl/compile.ts`, `lib/notebook/compileNotebook.ts`, `components/notebook/ExplorEdaNotebook.tsx` | Carry declared field schema to compilation/rendering so valid empty results keep charts. Preserve existing row-only defaults and last-valid text behavior. |
| **Existing** `apps/app/src/ProjectWorkspace.tsx` | Replace folder-load-only notebook rows with the project-aware wrapper; keep working text, `notebookMemory`, and saver ownership. |
| **Existing** `apps/app/src/saver.ts` and its owning tests | Reuse save state; do not build history here or treat `flush()` as success. Change only if required by a concrete new flow. |
| **Existing package export entry identified by the checkout** | Export the project-aware component/types without a new persistence format; include the required minor changeset for new package capability. |

### Important implementation choices

**Input transactions.** Use a compact nonmodal popover with a draft tuple, Apply, and Cancel. Apply validates the entire tuple, uses scalar encoding, and emits one text edit. Keep ordinary chart settings live as required by the UI defaults. Boolean controls must yield actual booleans if offered; the current generic fallback text input cannot provide that on its own.

**Bounded reversion.** Offer one “Revert inputs” action for the last committed input change. Store only previous and expected-next target/bindings. Patch bindings in the current text, preserving later prose/chart edits. Invalidate the action after external target/binding edits or a query-definition change. Reversion reevaluates current data; it does not restore old rows or create a general history system. Preserve the demo’s existing callback/history semantics.

**Stable target identity.** Parsing a new text object must not rerun the query or reset selection solely because a paragraph or chart title changed. Reuse a semantic target/binding identity for evaluation dependencies. Apply/Cancel must not rely on the notebook’s recent-document-input heuristic for chart write-back.

**Pending results.** Reuse `appliedBindings` for the shown scope. Do not show draft/new input labels beside an old completed result. For the first implementation, close existing evidence inspectors and disable source-record actions as soon as the shown evaluation’s input tuple no longer matches current project/table/target inputs. Do this synchronously at the mismatch boundary, including before a worker effect marks the next request pending. Resume after a matching completed result. This avoids a historical source-tuple store.

**Errors versus empty results.** Invalid target/required inputs are diagnostics, not a valid “0 requests” result. A valid zero-row evaluation replaces the old result with zero and retained schema. While an invalid draft is open, keep the last completed result under its own applied scope. On initial invalid load, show the problem and no successful result. Do not suppress informational source diagnostics or treat every diagnostic as a fatal query error.

**Transient selections.** On a successfully applied input/source-context change, clear ordinary chart-local transient selections and current traces in this new wrapper. Preserve authored `where.*` and other saved definitions. Scope this decision to the new notebook workflow; do not blanket-clear IDs in provider restore or change existing same-data undo/remapping. In M1, wire `sheet` / `onSheetChange` to host session state so this reset does not send the reader to the first sheet; M2 adds durable last-open preferences.

**Exact evidence.** Build runtime index → result key mapping from the same evaluation rows passed to the notebook. Never resolve old references against newer arrays. “Query rows,” “direct supplying source records,” and “related records” need distinct labels. Do not call `row.contributors` a universal used-in-calculation ledger; counts and richer query stages have different evidence. Existing nested related-record previews are capped and broader than direct contributors. A new direct-reference path must provide complete paged access for the references it promises.

**No-write hosts.** When the host omits text persistence or marks the context viewing-only, the new wrapper must never call authoring/create/copy/reversion writes. Either disable Apply or make a clearly local preview; choose **disable saved-input editing in M1**. Existing chart interaction without persistence is not advertised as full enforced read-only delivery.

### Focused acceptance evidence

These are required future checks, not claimed results:

- **Target/codec tests:** query, string/number/boolean/null literals, quoted `"0012"` versus numeric 12, quoted `"true"` versus boolean true, unknown keys, duplicate declarations/keys, required values, and reversed/equal bounds.
- **Text mutation tests:** one Apply changes only target/binding tokens; comments/prose/chart edits survive; Cancel emits nothing; reversion preserves intervening unrelated edits and fails safely after a conflicting external binding edit.
- **Fixture integration:** exact IDs and arithmetic above; distinguish null and nonnumeric input in raw evidence; zero remains valid.
- **Schema tests:** valid zero-row query retains defined fields and charts through compile, UI, folder read, and reopen. An unknown field is still a diagnostic.
- **Mounted evaluation tests:** last-completed rows and labels match; a late worker result cannot win; trace/source actions cannot read a mixed generation; a prose-only edit does not reevaluate the query.
- **Scope tests:** sheets share rows; filtering the request table’s `requestId` column to `r06` leaves the separate count at 6, mean at 200 ms, and saved binding tuple unchanged; clearing the filter restores the table. Input/source changes clear only transient interaction.
- **Evidence tests:** resolve exact current result keys to source records; use a small additional fixture over the existing preview cap to prove all promised direct records are reachable. Do not add a new generic table test suite.
- **Host lifecycle tests:** first open does not dirty files; Apply queues the expected notebook text; file watcher/source replacement produces updated values; full close/reopen uses saved bindings; failed save remains visibly failed.
- **Regression checks:** existing notebook compilation/sheets/write-back behavior, saved `.eda` view bindings, and demo checkpoint semantics remain intact.
- **Browser journey:** perform the complete sequence with pointer and keyboard at 1280, 783, and 390 px. Verify compact controls, visible applied scope, accessible names, focus return, and the absence of horizontal page overflow. Do not infer accessibility conformance from these checks.

### Docs and runnable example in this milestone

- **Existing** `apps/demo/src/docs/pages/notebooks.mdx`: add “Query inputs,” “What is saved,” “Changing sources,” and “Inspecting current records.” State that sheets share the population and local selection is transient.
- **Existing** `apps/demo/src/docs/pages/project-folders.mdx`: add the request-review walkthrough and native folder/data copying boundary.
- **Existing** `apps/demo/src/docs/pages/developers.mdx` and `packages/explorEDA/README.md`: show project-aware notebook props/callback ownership and the row-only alternative.
- **Existing** `apps/demo/src/docs/pages/export.mdx`: explain native project/data reopening versus chart images, without claiming a new historical capture feature.
- **Existing** `apps/demo/src/docs/live/examples.ts` and relevant docs registry/coverage files: register a runnable notebook example using the same fixture and sequence.
- **Proposed** `apps/demo/e2e/parameterized-notebook.e2e.ts`: add it to the actual Playwright project’s test matcher. Existing proposal reviews warn that a guessed `.spec.ts` would not be discovered.
- Include the proposed example files above and a source-update/reopen instruction. Product docs describe the working feature; implementation caveats stay in the intent plan.

**Dependencies:** current query/evaluation/notebook/folder modules only. Coordinate the empty-schema seam with #518 and current notebook reevaluation with #523 if those plans are integrated concurrently. Neither operation is a prerequisite.

**Main risk:** old rows or references appearing under newly applied inputs. A passing target parser is insufficient; mounted and folder-lifecycle evidence must demonstrate the whole journey.

## 4. M2 — Create, copy, and return to named cases

### Behavior

Provide two compact host actions:

- **New notebook:** choose an existing query and a name, provide its required inputs using the same typed controls, and create a small valid notebook skeleton. The first skeleton needs supported count/table views and explanatory text; it is not a template gallery or query editor.
- **Save another case:** capture the **current working notebook text**, confirm that the original and other working text that navigation would discard have saved successfully, create the copy from that captured text, await creation, open the copy, and only then change/apply its inputs. This preserves the original’s committed question without a second draft/copy-with-inputs mode.

**Chosen save-failure policy:** block creation/navigation while current working text cannot be saved. Add a narrow awaited operation, provisionally `FolderSaver.flushAndConfirm(expectedTexts)`, for these host actions. It must account for already in-flight writes as well as queued writes, preserve/retry failed current text, and confirm the expected latest text for every working file that reload would discard. Briefly prevent further authoring and duplicate actions during this operation; never infer success merely from `flush()` resolving or an aggregate `saved` event. On failure, retain the current workspace, text, and visible error; do not create the copy or reload. After confirmed save, a failed destination write likewise leaves the original workspace open. Use a dedicated awaited action path in `App`: its existing generic `act` helper reloads after `flush()` and must not be reused unchanged. This is a bounded save-before-navigation requirement, not a new autosave/history subsystem.

A copied notebook keeps referencing the same project query. Its prose/charts are independent copies; later edits do not synchronize across copies. Its query definition remains shared, so editing that query affects both cases. Make both facts clear in docs.

Extend M1’s session-level `sheet` / `onSheetChange` wiring with a durable host preference for the last-open file/sheet on the next visit. Keep this navigation preference outside project/notebook analytical definitions and scope it to the current folder. A missing path/sheet falls back safely. Navigation memory must never override saved bindings.

### Modules

| Module | Work |
| --- | --- |
| **Existing** `apps/app/src/App.tsx` | Wire create/copy actions and a dedicated save-confirm-create-navigate sequence; own folder-scoped last-open preference and failure state. |
| **Existing** `apps/app/src/ProjectWorkspace.tsx` | Extend the `ProjectActions` interface declared here; add compact notebook actions and supply current working text and controlled sheet state. |
| **Existing** `apps/app/src/projectActions.ts` | Implement file-operation helpers and await successful direct writes. |
| **Existing** `apps/app/src/saver.ts` and its owning tests | Add the narrow save acknowledgment above, including already in-flight writes and failed current text; keep history out of the saver. |
| **Proposed** `apps/app/src/notebookActions.ts` and tests | Keep notebook path generation, creation, and copying focused if adding them to projectActions would obscure existing behavior. |
| **Existing** notebook parser/write-back/folder interfaces | Reuse canonical target text and `ProjectFiles`; add no new project persistence owner. |
| **Proposed** `apps/app/src/notebookNavigation.ts` and tests, only if useful | A small host navigation preference helper; no general router or global registry. |

Use collision-safe `.eda.md` paths. Do not run the existing analysis rename helper unchanged: it expects `.eda` and `dashboard` text rather than notebook headings. Renaming existing notebooks is optional and not part of this milestone.

### Focused acceptance evidence

- New notebook creation writes a valid target with typed required inputs; opening it shows the expected query result.
- Creating over an existing query does not mutate the query or raw sources.
- “Save another case” captures unsaved but valid working text, confirms its successful save, and copies that text rather than an earlier disk version.
- The action confirms all working text that its reload would discard, creates a distinct path, waits for successful creation, opens the copy, and then input changes affect only that copied file.
- The original working text/bindings remain unchanged by the copy-and-edit route. For a disk byte comparison, establish the baseline after an earlier save succeeds; completing a preexisting pending original save is allowed and is not a copy-induced edit.
- A failed save or destination write remains on the original and reports the error; it does not pretend a successful `flush()` proves either save or creation.
- A failed original save prevents copy creation and navigation, retains the current working text, and permits a retry. Cover an already in-flight write and a failure in another working file that reload would discard; an unrelated successful write must not mask that failure.
- Read-only/no-write host state guards direct file actions as well as saver queues.
- Rapid duplicate clicks do not create conflicting writes or navigate to an incomplete file.
- File/sheet return works through source reload and full reopening; a renamed/deleted path uses a safe fallback.
- A query definition edit changes both referencing cases, while a prose/chart edit in one copy changes only that copy.
- Native handoff opens the copied folder under the same built app version with every example input present.

Use existing host tests plus focused new ones, not a new cross-application history framework.

### Docs and runnable example in this milestone

- **Existing** `notebooks.mdx`: add “Create a notebook,” “Save another case,” and “Shared query, separate notebook.”
- **Existing** `project-folders.mdx`: explain that the folder rail lists the new file and how file/sheet return works.
- **Existing** `export.mdx`: extend the native handoff walkthrough with the copied case; make the included-data scope explicit.
- **Proposed example README:** start from checkout, copy it to `search-review.eda.md`, open the copy, then apply search. Reopen both: checkout is 6 / 200 ms initially and search is 1 / 1,000 ms.
- **Existing docs live-example registration and proposed E2E file from M1:** extend the same journey with copy-first behavior and restart; no separate demonstration app.

**Dependencies:** M1 and existing host file actions only. No open planning PR, new storage service, or historical capture format.

**Main risk:** copying stale text, changing the original before the copy exists, or discarding working text after a failed save. Keep the operation’s ownership and order visible and verify the narrow save acknowledgment and failure paths.

## 5. Source refresh, handoff, and scope rules

### A bounded state transition

The worker may keep this transition in ordinary React state and existing evaluator requests:

1. **Draft:** inputs are local; the shown completed result retains its own scope.
2. **Apply:** validate, patch the canonical notebook bindings once, request evaluation, and invalidate current evidence.
3. **Pending:** show the last completed same-query result under its applied inputs with Updating, or wait when there is none.
4. **Ready:** replace rows/schema/applied scope together; the new current result owns inspection.
5. **Error:** display the actual failure; do not claim the requested question succeeded.
6. **Source replacement:** reuse the same transition from the host’s current tables; keep authored notebook text and saved bindings.

Do not add a durable state-machine protocol, evaluation cache, or method-version mechanism for this workflow.

A notebook syntax-error “frozen” block still means last-valid source text over the current rows. A saved copy still means a query recipe over current sources. Neither state is a captured result.

### Native handoff in both milestones

The example’s recipient flow is deliberately concrete:

- Save the project/notebook successfully.
- Copy the complete example folder, including relative `data/requests.json`, into a different directory.
- Open that folder with the same application build.
- Select the notebook and inspect its current query records.
- Change the recipient copy’s inputs and verify the original folder is untouched.
- Change the original folder to the update fixture; the untouched copy still recomputes from its earlier data bytes.

The copy includes **all source rows in its data files**, including rows outside the selected service/period. It is not an export of only selected records. The first example needs no credentials, external absolute paths, network service, or deployment.

Do not call this read-only or immutable. A recipient can edit their copy. Automated smaller evidence capture and browser-only delivery belong to RA03. The chart PNG path remains useful presentation output and carries no reusable row evidence.

### Preserve existing behavior

- Do not feed every chart callback back as a fresh controlled notebook restore.
- Do not clear positional filters in the shared restore path.
- Do not turn a clicked overview mark into a saved population without an explicit contract.
- Do not treat chart preview caps as complete membership.
- Do not normalize date strings, join keys, or source values silently.
- Do not change current ordinary charts or notebook selection defaults to satisfy a future live-finding design.
- Keep React, TypeScript, pnpm, one author/server/version, and host-owned file access.
- Keep the source data intact. Only the deliberate test fixture update replaces a test data file.

## 6. Verification run sheet for Codex

**These commands are proposed to run after implementing the files. They were not executed in this research.** The repository script names and CLI entry paths were verified from the baseline package files. Proposed test filenames must match the implementation; register the browser test in the existing Playwright configuration before relying on it.

~~~bash
# From the repository root, after implementing M1.
# Targeted library checks; these test files are PROPOSED.
pnpm --filter exploreda exec vitest run   src/lib/notebook/queryTarget.test.ts   src/lib/notebook/writeBackTarget.test.ts   src/components/notebook/ExplorEdaProjectNotebook.test.tsx   src/lib/notebook/compileNotebook.test.ts   src/lib/notebook/sheets.test.ts
pnpm --filter exploreda check-types

# After implementing M2; this host test file is PROPOSED.
pnpm --filter app exec vitest run src/notebookActions.test.ts
pnpm --filter app check-types

# Run the local app against a COPY of the proposed fixture folder.
# Leave this dev command running in a dedicated terminal.
cp -R packages/explorEDA/examples/request-review /tmp/exploreda-request-review
EXPLOREDA_FOLDER=/tmp/exploreda-request-review pnpm --filter app dev

# In another terminal, after the initial values and saved bindings are verified,
# deliberately replace ONLY the copied test data with the update fixture.
cp /tmp/exploreda-request-review/fixtures/requests-updated.json   /tmp/exploreda-request-review/data/requests.json

# Verify docs/example registration and the implemented notebook docs journey.
pnpm --filter demo exec vitest run   src/demos/coverage.test.ts src/dashboardText.test.ts

# Run the registered parameterized-notebook.e2e.ts under its actual configured
# Playwright project; use that checkout's existing browser test command.
# Capture the app at 1280 / 783 / 390 with scripts/app-shot.mjs and real controls.
# Do not use a network-idle wait on the app's open change stream.

# The required broad gate: run ONCE before the review PR, after targeted checks.
# Do not run this concurrently from several worktrees.
pnpm check

# The docs journey requires the demo build produced by the broad gate above.
pnpm --filter demo docs:verify -g "/docs/notebooks$"

# After that build, verify CLI parsing and reopen against the same built version.
node packages/explorEDA/dist/cli/exploreda-dsl.js project   /tmp/exploreda-request-review
node packages/explorEDA/dist/cli/exploreda.js   /tmp/exploreda-request-review
~~~

Use a fresh temporary directory on rerun rather than overwriting a real project. Derive actual browser selectors from the implemented UI. Use repository time limits from `@repo/test-config`. Add the minor package changeset required for the new user-visible API/capability; docs-only portions do not require a separate changeset. Codex owns local verification and its review PR; this research does not authorize a commit, push, merge, deploy, or provisioning action.

A focused browser test should cover the full journey, not only a rendered title. Broader testing is justified by the changed compiler/host integration and the repository gate, not by speculative robustness work.

## 7. Open proposal coordination

| Proposal | First-build dependency and integration note |
| --- | --- |
| #507 live findings | **Not required.** Best next feature; keep query population separate from finding-owner selection. |
| #514 weighted distributions | **Not required.** Ordinary request count/average has no weights. |
| #517 engineering histograms | **Not required.** Ordinary descriptive inspection does not need specifications. |
| #518 wide-to-long | **Not required.** Share/coordinate the declared-schema path for empty results if both are implemented. |
| #519 contributor comparison | **Not required.** Reuse later for supported current-value comparison; no historical capture guarantee. |
| #520 held-fit diagnostics | **Not required.** A later specialist notebook, not a condition for basic investigation. |
| #521 rolling windows | **Not required.** A chart-local option; no general ordered query operation is assumed. |
| #523 category mappings | **Not required.** Coordinate runtime notebook reevaluation and folder ownership if both land; the example needs no mapping. |

Do not duplicate the detailed design or Methods work in those plans. Integrate their chosen behavior only when the corresponding capability is implemented.

## 8. Follow-up questions for the other ranked bets

| Recommendation | Suggested next research question | What Codex can do meanwhile |
| --- | --- | --- |
| **RA02 — Build #507 next** | **Design integration only:** how should one finding expose applied notebook inputs and owner-local selected scope without two state owners? | Follow the supplied #507 plan; do not repeat its reducer/selection research. |
| **RA03 — Explore saved evidence** | **Design:** compare an entire copied native project with a focused captured evaluation/input attachment; define complete source evidence and recipient actions for one saved finding. | Ship the ordinary native handoff now. Never relabel temporary traces or PNGs as durable evidence. |
| **RA04 — Explore navigation/paired cases** | **Design:** choose explicit service/from/until mapping, destination reuse versus new case, and caller return; then decide whether a paired-case surface needs two evaluations. | Reuse RA01 as the destination. Preserve existing query/view ownership; do not use sheets for different datasets. |
| **RA05 — Explore one reusable rate/result** | **Methods/Design:** specify one ratio-of-sums or derived result, exact numerator/denominator populations, row grain, null/zero rules, and two consumers. | Use existing project aggregate/calculate stages where they already answer the job. Avoid a general result registry. |

No follow-up request is required to start M1. Byron supplies demand. There is no adoption or study gate between the current plan and implementation planning.

## 9. Stop list and dispositions

The following map to the report’s stable recommendation IDs:

- **Build RA06, RA07, RA08, and RA15:** local app ownership, coherent applied scope, native handoff, and an independent first milestone.
- **Defer RA09:** specialist methods/preparation as separate features, not a combined prerequisite queue.
- **Defer RA10:** R049 ordered differences and R041 key preparation; neither is needed here.
- **Avoid RA11:** recipe registry, universal semantic layer, general result graph, execution rewrite, new DTO stack, and speculative worker machinery.
- **Avoid RA12:** implicit filter inheritance, multiple hidden sheet populations, durable runtime row IDs, and broad restore changes.
- **Defer RA13:** a publishing product or hosted reader as the primary direction.
- **Avoid RA14:** outside-demand gates, market sizing, billing, multi-tenancy, paid infrastructure, or a robustness audit substituted for capability.
- **Avoid RA16:** ordinary prose, last-valid text, settings-only JSON, and PNGs represented as verified reusable evidence.

## 10. Access status, evidence, and unresolved choices

**Access: GO.** The complete supplied prompt, all 35 baseline files, and all eight unbuilt summaries were read. The companion report contains their complete named inventory. Additional pinned GitHub files supplied the decisive notebook/parameter/runtime seams. The core files for this implementation are:

- `types/AnalysisProject.ts`, `types/SavedDataStructure.ts`, and `lib/analysis/evaluateProject.ts`.
- `components/notebook/ExplorEdaNotebook.tsx`; `lib/notebook/compileNotebook.ts`, `sheets.ts`, `writeBack.ts`, `readNotebook.ts`, and the supplied compile/sheets tests.
- `lib/project/folder.ts`, `folder.test.ts`, `analysisText.ts`, `writeFolder.ts`, and `tables.ts`.
- `components/ExplorEdaProject.tsx`, `AnalysisChartContext.tsx`, and `components/project/{ProjectQueryPanel,QueryParameters,QueryStageRows}.tsx`, `parameterBindings.ts`.
- `components/charts/DataTable/DataTable.tsx`, `definition.ts`, and `filteredRows.ts`, read completely to verify the table-owned filter route; the exact three paths appear in the companion report.
- `lib/analysis/useAnalysisEvaluation.ts` and `lib/valueParsing.ts`.
- `apps/app/src/{App,ProjectWorkspace}.tsx`, `projectActions.ts`, `saver.ts`, and the demo’s `SavedViewsWorkspace.tsx`.
- The supplied governance, README, docs, intents, and proposal summaries; the library/app package scripts. Targeted extra portions of `lib/dsl/compile.ts`, `lib/dsl/project.ts`, and `lib/fieldSettings.ts` were inspected, not claimed as complete extra-file reads.

**Checked facts:** the baseline seams and limitations described above, exact supported project/chart syntax, the raw-value conversion caveat, package command paths, and independent fixture arithmetic.

**Proposals / unexecuted acceptance:** notebook binding support, the project-aware component, explicit Apply/reversion, schema propagation, evidence freshness, source-update UI, creation/copy behavior, docs/example changes, and all test/browser commands.

**Deliverables:** this complete `implementation-plan.md` and `report.md`; final chat links include both originals and a ZIP containing only those two reports. No implementation assets or extra report variants are produced.

**Unresolved:** later historical evidence format and recipient interaction policy; later detail/paired-case navigation; measured capacity and optimization needs. The first target, ownership, input commit policy, copy-first behavior, source-update meaning, and native handoff boundary are chosen. No decisive missing input or further Pro run blocks Codex from planning M1.

### Pinned code references

[C1]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/types/AnalysisProject.ts
[C2]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/evaluateProject.ts
[C3]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/project/analysisText.ts
[C4]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/readNotebook.ts
[C5]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/project/QueryParameters.tsx
[C6]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts
[C7]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/components/ExplorEdaProject.tsx
[C8]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/ProjectWorkspace.tsx
[C9]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/writeBack.ts
[C10]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/fieldSettings.ts
[C11]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/App.tsx
[C12]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/apps/app/src/saver.ts
[C13]: https://github.com/byronwall/explorEDA/blob/95832bd473884aeae23453af0888b4ca5187820d/packages/explorEDA/src/lib/notebook/compileNotebook.ts


