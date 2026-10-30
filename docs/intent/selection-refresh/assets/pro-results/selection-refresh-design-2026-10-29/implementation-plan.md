# Implementation plan: selections and live findings through refresh

## Build decision and delivery order

Build one explicit keyed-refresh contract in the existing React/TypeScript library. Persist requested record keys and small duplicate-review guards; derive current numeric row IDs and findings. Keep ordinary workspaces linked and notebook selections local. Missing members can return under declared continuity; observed duplicate keys require deliberate repair.

Use commit **5594c95690859e8ce456aa3228fa9265ba686d12** as the research baseline. This plan is an integration handoff, not executed implementation. Four ordered releases each deliver a complete action:

1. **Keyed plain workspace:** select → refresh → inspect status → repair/clear → JSON save/reopen.
2. **Project and folder parity:** declare continuity → keep source-grain selection through query/data refresh → text/JSON/folder save/reopen.
3. **Live notebook:** select locally → Keep selection → refresh → read partial/current findings → inspect contributors → reopen/Undo.
4. **Exact expanded rows:** explicitly select one parent/child output record → refresh that pair without selecting siblings.

Releases 1–3 are the core mission. Release 4 is a separate, useful extension; it is not a prerequisite. No prior research PR, outside-demand gate, new audit, remote service, historical capture, or statistical reducer redesign is required.

Recommendation IDs SR01–SR16 match the companion design report. New filenames below are proposed; existing filenames are source-grounded. All `src/` paths are relative to `packages/explorEDA/` unless another root is shown.

## Contract every milestone must preserve

- The host/source author explicitly promises a stable source namespace and no reuse of a key for a different logical record.
- Plain sources declare fields; project adapters reuse evaluator output keys and key-quality metadata. Numeric `__ID` remains a current-evaluation position.
- Keys preserve number/string/boolean types and ordered compound parts. Zero and false work. Null, undefined, blank-only text, nonfinite numbers, and structured scalar values do not qualify. Negative zero normalizes to zero.
- Identity uses raw values before analytical conversions. Value/range/category predicates remain predicates over current values.
- Exactly one compatible unheld match resolves. Missing members remain requested. An observed duplicate adds a persistent review hold and resolves to no row, even after it becomes unique.
- No resolved identities from a nonempty request means a selection-dependent finding is unavailable; an explicit empty request counts zero; removing the exact filter means all otherwise eligible rows.
- Incomplete membership yields explicitly partial current-subset results. Numeric contributors are separately counted.
- Source/grain mismatch never silently rebinds or clears an exact owner.
- Ordinary refresh does not create an Undo step. A safety checkpoint saves newly discovered ambiguity or restores a missing current guard without adding history.
- Undo restores definitions against current rows and current guards; it does not restore historical data.

**Persistence channel.** Keep `onStateChange` edit-only. Add proposed `onRefreshCheckpoint(settings): void | Promise<void>` for safety-state changes. If persistence is asynchronous, the host returns its promise; errors leave an unsaved status. Both edit and checkpoint writes use one ordered/coalescing queue per persisted file or host settings destination, so an older full-state checkpoint cannot overwrite a later user edit. The provider always exposes its latest canonical settings through `getSettings()`. The folder saver needs per-path in-flight ordering and acknowledged failures; its baseline `flush()` waits only for pending work and its write errors are caught.

**Folder-session channel.** `App` remounts `ProjectWorkspace` on watched and manual reload. Retain bounded selection definitions, owner guards, and notebook Undo above that remount; hydrate before findings render. Existing `notebookMemory` preserves last-valid block text only. Keep these session values separate from persisted text and source data.

## M1 — Complete keyed refresh in a plain workspace

**User action shipped:** declare a key; select A and C; refresh edited/reordered rows; inspect retained/missing/review members; repair or clear deliberately; save settings; reopen with the same request.

**Recommendations:** SR01–SR08, SR12. This is a usable release by itself.

### Implementation boundary and files

- **New `src/lib/selectionIdentity.ts`**: plain declaration types, structural basis comparison, tagged tuple codec, current-row index, resolution, and duplicate guard merge. Start with direct synchronous code. Build the index once per source snapshot, not inside each row predicate.
- **`src/lib/valueParsing.ts`**: add/use a narrow exact-key validation helper that never coerces string keys to numbers. Do not change existing numeric/date reducer rules.
- **`src/components/ExplorEda.tsx`** and **`src/providers/DataLayerProvider.tsx`**: optional `rowIdentity` and checkpoint props; current canonical selection state per owner; atomic reconciliation; input classification before `setData`; explicit selection-edit operations; save/getSettings/restore conversion.
- **`src/types/FilterTypes.ts`, `SavedDataStructure.ts`, `SavedDataTypes.ts`**: add saved-only `SavedRecordFilter` and `SavedFilter`. Keep runtime `Filter` unchanged. Make the saved-chart wrapper distribute over the chart union; introduce runtime Rows settings instead of passing a saved-only filter into scalar execution.
- **`src/lib/rowIdFilters.ts`**: factor the existing four-owner traversal to support canonical/runtime conversion. Retain the legacy helpers for unkeyed behavior.
- **`src/utils/saveDataUtils.ts`**: introduce `isSavedFilter` for the four supported owner locations. Retain `isFilter` for finding-owned predicates and nested unsupported filter locations; do not globally admit a saved record variant into execution paths that cannot lower it.
- **`src/providers/lib/carryRowSelections.ts`**: keep the unkeyed behavior. Keyed refresh bypasses content matching.
- **`src/hooks/CrossfilterWrapper.ts` / `src/hooks/applyFilter.ts`**: keep scalar execution; ensure the lowered empty `__ID` value filter is evaluated as false for every row. Do not remove it just because `values.length === 0`.
- **New `src/components/RecordSelectionStatus.tsx`**: compact status/popover and actions, shared by all owners. Integrate with the existing chart/filter/Rows status surfaces; locate their exact insertion points in the integration checkout rather than adding a permanent panel.

At restoration, strip canonical record filters into provider-local intent and lower only the current projection into runtime settings. At serialization, substitute canonical intent back into its original filter location. Never save both canonical keys and stale numeric positions as competing authorities.

Define user edits explicitly as replace/add/remove/toggle/clear/repair. Existing shared selection interaction code must pass the operation, not just a projected numeric array. Add/toggle preserves unresolved members; replacement intentionally replaces the request. A durable selection edit containing an initially invalid/ambiguous key rejects atomically and preserves the prior owner.

### Exact acceptance tests

Extend **`src/test/providers/savedSelectionRestore.test.tsx`** for integration and add **`src/test/providers/keyedRefresh.test.tsx`** for the new contract. A small pure codec fixture belongs in **`src/test/lib/selectionIdentity.test.ts`**. Assert visible membership/values/callbacks and save/reopen behavior, not private store shape.

1. **A/C happy path:** use raw numeric keys A=101/B=202/C=303, values10/20/30, request101/303. Initial count2/sum40/mean20. Refresh to C30,D100,A15,B20: exactly A,C; count2/sum45/mean22.5. Repeat reorder with cloned rows: unchanged membership.
2. **Latest local intent:** after that refresh, replace the request with B. Refresh B20→25: only B, sum25. Repeat without host echo, with an immediate cloned canonical echo, and with echo/data arriving together. None revives A/C.
3. **Absence and reopening:** remove C; request still101/303; selected A; partial count1/sum15/mean15. Save, unmount, reopen while C absent, then return C30: count2/sum45/mean22.5.
4. **Sequential ambiguity:** duplicate numeric101 with value999. Neither101 row selected; C only; sum30; one persistent review marker. Original A changes to string101 while other numeric101 remains: C only, sum30. Remove the other row and restore A's numeric key: still C only until Use current match. After repair:45/22.5.
5. **Guard save/reopen:** reopen the preceding guarded save over a now-unique A15. A remains blocked. Clearing `review` in an older supplied snapshot cannot waive the current session guard.
6. **Empty versus clear:** nonempty101/303 with no matches yields an active empty runtime filter and unavailable intended-cohort result. Explicit empty member array remains active, count0. Clear on C30,D100,A15,B20 yields count4/sum165/mean41.25.
7. **Types and compounds:** select numeric101, string101, false, numeric0, string0 independently. No cross-match. `["a:b","c"]` differs from `["a","b:c"]`; zero differs from false; negative-zero policy is explicit. Reject invalid components and duplicate fields without falling back to positions.
8. **Source/key basis:** equal-looking keys under a different source ID do not resolve. Reordering declared compound fields is incompatible. Measure conversion changes do not change key membership.
9. **Four owners:** use the existing 12-record fixture with one owner active at a time. Exact expected values are in Fixture L below. Then test workspace W plus local Rows filter: workspace retains L01/L10/L12, Rows intersection is L10; after changed measures the Rows result is one record/sum600.
10. **Callbacks/history:** selecting is one edit callback. Ordinary refresh, missing return, and equal echoes are zero edit callbacks and zero checkpoints. First duplicate discovery is one checkpoint and zero edits; identical repetition adds none. Repair/forget/clear each emits one edit.
11. **Persistence ordering:** queue a duplicate checkpoint, then a newer user selection edit before the first save completes. The final saved request is the newer edit plus applicable guards; the older full snapshot cannot win.
12. **Undo:** after a source refresh A10→15, Undo a selection edit restores A/C at45, not40. After ambiguity, Undo to a pre-ambiguity request retains the guard and reserializes it. Undo repair restores the hold; Redo of repair requires fresh Use current match review. Generic restore is never repair. Guards are keyed by owner+basis+key: repairing a chart owner does not release a workspace or sibling owner's hold.
13. **Legacy boundary:** existing unkeyed tests keep their documented content-match and explicit-restore behavior. A positions-only historical save cannot silently become a durable keyed selection. A saved record filter with no current identity frame stays blocked/unavailable; it cannot become positions or clear/all.
14. **Saved codec:** all four owners round-trip canonical keys/guards, including absent members and active-empty. Ordinary predicates, geometry, calculations, and serialized 3D cameras remain intact. Reject records in finding-owned predicate lists until a lowering path is deliberately provided.

### Documentation and runnable example

In this same release, update **`apps/demo/src/docs/pages/developers.mdx`**, replacing the unqualified refresh section with separate legacy and declared-key behavior; add **“Keep selected records through refresh”**, **“Missing and duplicate keys”**, and **“Saving safety checkpoints without Undo”**. Update **`packages/explorEDA/README.md`** props/save contract and the existing generated prop reference source.

Add **`apps/demo/src/docs/live/SelectionRefreshExample.tsx`** with buttons for Edit/reorder, Remove C, Return C, Duplicate A, Change original A key type, Repair, Save/reopen, and Undo. Show actual selected logical IDs and current aggregate values. This is a proposed runnable example, not a supplied implemented demo. Register it through the existing docs catalogue/live-example system and exercise it with real pointer/keyboard input.

**Main risk:** the provider currently couples row rebuilds to saved-data restoration. Solving only the initial refresh would still lose selection edits between refreshes or treat a safety checkpoint as an authored edit. The latest-intent/echo/Undo sequences are release gates.

## M2 — Reuse project identity and complete text/folder persistence

**User action shipped:** explicitly declare source continuity, select source-grain records in a project view, refresh source/query data, inspect missing/review status, save project or folder text, and reopen without rebinding.

**Depends on:** M1 only. **Recommendations:** SR02–SR09, SR12.

### Implementation boundary and files

- **`src/types/AnalysisProject.ts`**: widen the existing `entityKey` to scalar field or nonempty ordered field tuple; add optional `continuityId`. Widen source-reference key values consistently. Add serializable identity capability/quality to evaluated output; it must be worker-transferable data.
- **`src/components/project/sourceRowIdentity.ts`**, **`src/lib/analysis/evaluateProject.ts`**, and the shared identity helper: consolidate typed source-key extraction/indexing. Keep current source-reference inspection behavior while marking fallbacks nonportable.
- **New `src/lib/analysis/selectionIdentity.ts`**: a narrow adapter over the existing evaluation/key constructors, not a second query evaluator. Supply the source/grain basis, aligned output keys, and **ambiguous potential keys with candidate counts**. Existing duplicate fallback keys otherwise hide the original selected key.
- **`src/components/project/analysisRowKeys.ts`** and **`ExplorEdaProject.tsx`**: use the common canonical path for new record filters; preserve the legacy path where needed. Both `getSettings` and callbacks return canonical requests, never unresolved-sentinel projections.
- **`src/lib/analysis/useAnalysisEvaluation.ts`**: keep its prior-result-while-pending and stale-response behavior. Additionally retain a labeled previous result on failure; baseline thrown/worker errors currently construct `emptyEvaluation`. Treat ready `missing-source`/invalid-query results as failed identity refreshes too. Pass rows, identities, and revision from one completed result. No new worker is required; preserve the existing optional worker path.
- **`src/components/project/settingsCompatibility.ts`**: add explicit identity-basis/grain compatibility alongside current field compatibility; a field-compatible grain change must not restore old positions.
- **`src/lib/analysis/sources.ts`**: inferred/generated keys remain unconfirmed; explicit continuity is never synthesized by `sourceFromRows` or promotion.
- **`src/lib/analysis/projectFile.ts`**: update source metadata/key validation for scalar/compound keys and continuity. Validate canonical view settings at their supported owner locations. Its current validator requires scalar `entityKey`, so this boundary cannot be omitted.
- **`src/lib/dsl/project.ts`**: compile/export explicit source continuity and compound fields using parsed item boundaries. Do not split a decoded comma-containing field name.
- **`src/lib/dsl/parse.ts`, `compile.ts`, `export.ts`**: add the `selection` declaration and typed-key parser; canonical filters round-trip for chart, chart-local, Rows, and workspace. Existing predicate parsing remains separate.
- **`src/lib/project/analysisText.ts`, `folder.ts`, `writeFolder.ts`**, and **`apps/app/src/ProjectWorkspace.tsx`**: preserve declarations and canonical settings through analysis-local sources, project files, view callbacks, and the amended save queue.
- **`apps/app/src/App.tsx`** and **new `apps/app/src/selectionSession.ts`**: keep canonical requests/guards above the generation remount. Scope by folder/files identity, file, and verified named view/owner. Hydrate before initialization callbacks can replace the overlay. Compare authored owner fingerprints to distinguish data reload from an external selection edit. Current `path#index` view IDs cannot safely identify a reordered view; reuse only a verified named mapping. Otherwise load unrelated authored settings but block affected exact selections with “Selection owner changed; reselect,” retaining any unsaved safety state without attaching it to another owner.
- **`apps/app/src/saver.ts`**: serialize/coalesce each path's pending and running writes, await both in `flush`, acknowledge checkpoint success/failure, and retain failed status until that destination succeeds. Route authored and safety writes through the same chain. This orders app-origin writes; it does not solve races with an external writer after a write has already been issued.

Proposed explicit source text:

```text
source @orders path=data/orders.csv key=orderId continuity=orders-production
source @tenant-orders path=data/tenant-orders.csv key=tenant,orderId continuity=tenant-orders-production
source @odd-fields path=data/odd.csv key="tenant,code",orderId continuity=odd-fields-production
```

A declared source key is normalized once. Relationship join endpoints remain scalar fields; compound record identity does not introduce compound joins. Existing scalar parameter pickers must visibly reject a compound entity key or require an explicitly selected scalar field; never stringify a tuple into a scalar parameter.

First supported query shapes are source/filter/calculate and cardinality-preserving lookup. The identity basis ignores measure-only/query-predicate changes but includes the identity-defining source and grain. Entering expand/aggregate blocks a retained parent owner. Session-only unsupported selection may be inspected, but cannot be kept as portable. On result replacement, retain an empty runtime filter with an expired/unavailable status and “Select again for this result.” Selection-dependent findings remain unavailable until reselection or clear; do not serialize expiry as an intentionally empty `members: []` request or report count0.

### Exact acceptance tests

Extend **`src/test/providers/projectIdentity.test.tsx`**, **`src/test/lib/analysis/selectionIdentity.test.ts`**, **`sourceRowIdentity.test.ts`**, and reuse **`selectionIdentityFixture.ts`**. Add **`src/test/lib/project/selectionRefreshRoundTrip.test.ts`**, **`apps/app/src/selectionSession.test.ts`**, **`apps/app/src/selectionRefresh.test.tsx`**, and focused saver/project-text codec coverage. Existing app Vitest is sufficient.

1. **Source-grain parity:** perform the full A/C and Fixture L sequences through `ExplorEdaProject`, including save callback and imperative getter. Expected IDs/values match M1.
2. **Filter absence:** temporarily exclude C through a query parameter. C is “Not in current result,” still requested. Restoring the parameter returns C automatically. Do not label source deletion without evidence.
3. **Calculation/lookup:** modify A's derived measure to15 and a looked-up attribute without changing parent key. A/C remains the request. An ambiguous lookup produces the existing measure diagnostic; parent identity is still valid if unique.
4. **Hidden source duplicate:** introduce a duplicate selected source key, then query-filter one occurrence out. Still set review; the result's single visible occurrence must not resolve.
5. **Retained canonical keys:** save with C absent, reopen, return C. No unresolved-prefix accumulation; restored values are45/22.5.
6. **Source replacement:** change continuity while preserving all keys and fields. Every affected exact owner is incompatible and empty; selection-dependent findings are unavailable. Ordinary compatible predicates continue reevaluating.
7. **Unsupported grain:** one parent A becomes two expanded rows a1=4/a2=6. Old parent request resolves none, never both; no child sum10 presented as the retained parent result. Aggregate output also blocks. An unsupported session-only selection expires on result replacement with unavailable findings, not a definitive count0 or a serialized intentionally empty request.
8. **Explicit versus inferred keys:** a source with synthesized row_number or an inferred unique name never offers durable Keep until key/continuity are explicitly declared. Reordering or re-inferring cannot inherit selection.
9. **Compound codec:** compile/export/compile `key=tenant,orderId` as two fields. Preserve `key="tenant,code",orderId` versus one field `key="tenant,code,orderId"`. Preserve typed key tuples through JSON and text, including missing members.
10. **Folder round-trip:** edit one view's record selection; only its relevant analysis text changes. Explicit source continuity survives reload. Unrelated inferred declarations retain their short forms. Saving a duplicate marker updates the affected owner without an Undo step.
11. **Worker ordering:** request refresh R1 then R2; resolve R2 first and R1 last. Display only R2's rows/keys/values. While pending, current inspection uses the prior completed result. A failed refresh does not become an empty successful snapshot.
12. **Source inspection:** resolve scalar/compound source references after reorder using the same shared helper. Equal tuples with different array references still resolve. Keep the existing key-suffix and colon-containing expansion fixtures.
13. **Validation/parameter limits:** project JSON rejects malformed compound definitions and accepts valid scalar shorthand. A scalar source-key parameter picker on a compound source shows its unsupported state rather than producing a joined string.
14. **Actual app remount:** invoke both watched source-file refresh and manual reload through `App`. Current request/guard survives the generation change before the first findings render. Failed checkpoint plus another reload still excludes the guarded key. Another folder/files identity starts a separate session. A reordered unnamed view never inherits a different view's overlay.
15. **Write acknowledgment/order:** control deferred `files.write` promises. A newer edit must not finish on disk before an older same-path checkpoint can overwrite it. `flush()` waits for a write already running; rejection reaches the checkpoint status. Success on another path cannot report the failed checkpoint as saved. Test a quiescent external text edit separately; do not claim protection against an already-issued write racing another application.

### Documentation and runnable example

Update **`apps/demo/src/docs/pages/project-folders.mdx`** sections **“Declare source continuity”**, **“Keys and compound fields”**, **“Refresh a saved selection”**, and **“Unsupported query grains”**. Update the project section of the package README and project-text reference.

Add **`apps/demo/src/docs/live/ProjectSelectionRefreshExample.tsx`**, with a source filter toggle and a parent/children grain switch. Include a local fixture folder under **`apps/demo/public/selection-refresh/`** with explicit source declarations and reversible source snapshots. Demonstrate save/reopen via the actual folder adapter. No extra data service.

**Main risk:** unique-looking inferred/fallback keys and filtered duplicates can appear valid if the adapter examines only output rows. Portability must originate from the identity-defining source and survive query operations, with the ambiguous portable token retained even when runtime row keys fall back to positions. The actual folder remount and saver acknowledgment are release gates, not optional follow-up work.

## M3 — Kept notebook selections, live findings, and current records

**User action shipped:** select records in one chart; refresh without losing that local selection; Keep it; read updated findings; inspect available and unresolved members; save/reopen the notebook; Undo an authored selection change against current data.

**Depends on:** M1–M2. **Recommendations:** SR05–SR12. This finishes the core mission, including project notebooks.

### Implementation boundary and files

- **`src/lib/notebook/readNotebook.ts`**: retain the evaluation envelope and return rows plus identity from the same query. Do not derive fresh keys from the already-flattened rows.
- **`src/lib/notebook/compileNotebook.ts`**: compile typed retained-selection declarations after named chart IDs exist. Retain the saved source/grain binding; validate it against the current frame without replacing it.
- **`src/components/notebook/ExplorEdaNotebook.tsx`**: accept the same identity input; distinguish authored text restore, data-only recompile, and own-write echo. Preserve live canonical requests for stable owners. Use `localSelections` as before.
- **`src/lib/notebook/writeBack.ts`**: keep ordinary click persistence behavior; add a narrow deliberate Keep/edit/clear path. Splice only that owner's declaration and verify by recompiling. Add a safety-checkpoint splice for kept members' review markers. No full notebook export merely to persist one click.
- **`src/lib/notebook/findings.ts`**: accept owner coverage/availability alongside current positional selection predicates; add selection-unavailable and partial metadata outside reducers. Include current frame/guard revision in evaluation identity. Comparisons propagate current operand coverage.
- **`src/components/notebook/NotebookFindings.tsx`**, **`src/components/charts/MetricCard/MetricCardTraceBody.tsx`**: show per-owner coverage and final selected/numeric-contributor counts. Reuse current raw/prepared measure and exclusion trace. Preserve the close-on-revision guard and reopen against current rows.
- **`apps/app/src/ProjectWorkspace.tsx`**, **`App.tsx`**, and **`selectionSession.ts`**: pass the identity envelope; reevaluate edited `eda query=` bindings before publishing data; wire authored and safety text changes to the ordered saver; expose save errors. Lift unkept local requests and notebook history into the M2 App-level session. Add **new `apps/app/src/notebookSelectionHistory.ts`** for bounded definition/text Undo, owned above the remount and wired through the workspace. Store no source snapshots.
- **`src/lib/project/folder.ts` / `writeFolder.ts`**: finish the notebook refresh/save/reopen path using the same persisted source declaration and canonical selection.

Keeping an unnamed chart assigns a stable authored `@name` together with its selection in one edit. Unkept local selections survive internal folder reload in the same app session; only kept text survives a fresh browser/app session. Subsequent edits to a kept owner update text; empty body means active-empty; deleting the block clears it. Compare authored selection fingerprints per owner: external selection edits restore that owner, prose/title changes preserve local requests, and removed owners evict intent. A source/grain change keeps old intent visibly blocked.

Ordinary data/measure/missing-return refreshes do not rewrite text. Duplicate discovery and restoration of an older unchecked text require a safety checkpoint. Merge current guards **before** serializing the restored notebook, so Undo cannot save text that loses a known hold. Guards use owner+basis+key. Editing away `review=` is not implicit permission to release a current guard.

Use a small history rule: repair Undo restores review; automatic Redo of that repair does not release it and offers fresh **Use current match**. This avoids an event log or impossible physical-candidate comparison.

### Exact acceptance tests

Extend **`src/lib/notebook/findings.test.ts`**, **`src/components/notebook/ExplorEdaNotebook.test.tsx`**, and the M2 **`apps/app/src/selectionRefresh.test.tsx`**. Add **`src/lib/notebook/selectionWriteBack.test.ts`** and **`apps/app/src/notebookSelectionHistory.test.ts`**. Exercise the actual App reload/remount/saver route as well as a mounted library rerender.

1. **Mounted local refresh:** select A/C, refresh to C30,D100,A15,B20. Count2/sum45/mean22.5. Sibling chart clicks do not affect these findings. With no Keep action, no selection text is written.
2. **Keep and reopen:** Keep A/C; assert exactly one authored text/history change. Remove C, save, reopen; A only and partial15. Return C30;45/22.5 without manual reselection. The text still requests both original keys.
3. **Edit between refreshes:** replace the kept request with B, then refresh B to25; count1/sum25. Add B instead of replace and missing A/C requests remain. A data-only compile cannot restore older authored members over the current edit.
4. **Typed text:** round-trip numeric101, string101, false, numeric0, string0, and compound tuples, even when none exists in current rows. Quoted strings keep types. Duplicate/conflicting selection declarations and tuple arity errors produce located diagnostics; invalid authored retained selection must not silently compile as clear/all.
5. **Current numeric contributors:** on the existing active-East fixture, exact request r01/r06/r07/r10 initially selects4, numeric3, sum240, mean80. Change r01→100, r10 raw→"5" with numeric conversion: selected4, numeric4, sum255, mean63.75. Add unselected active East r13=1000: exact result stays255/63.75; the East field predicate yields count5/sum1255/mean251.
6. **Invalid measures:** A="bad", C30 with a numeric measure interpretation: selected2, numeric1, sum30, mean30, full identity coverage. Both invalid: selected2, numeric0, numeric findings unavailable as “no valid values,” count2. A0/C30: sum30, mean15; zero contributes.
7. **Coverage through eligibility:** workspace request {A,C}, chart request {C,D} over A15/B20/C30/D100 yields final C/count1/sum30, with separate 2-of-2 owner coverage. Remove C: both owners are partial; final intersection empty, partial count0 and numeric “no rows.” If workspace requests only missing C, both the selected and eligible findings are selection-unavailable. A chart-independent finding still counts all current source rows.
8. **Selected versus eligible:** with no workspace record filter, a missing-only chart selection makes selected finding unavailable but leaves `population=eligible` at the current eligible count. All record owners resolved but a legitimate `where` predicate excludes them: count0, numeric “no rows,” no false identity-unavailable status.
9. **Comparisons:** on refreshed A15/B20/C30/D100, selected A/C count2 and eligible4 give share50%. Remove C: selected1, eligible3, share1/3 with partial coverage. No selected identities means share unavailable, not0%. Difference operands inherit partial status; existing containment, unrounded values, and zero-denominator tests remain.
10. **Inspection freshness:** open records at A10/C30; refresh A to15 and reorder. Existing popover closes. Reopen: current logical A/C, A raw/prepared15, C30, correct current positions, no old10. Invalid measure rows remain in selected-record inspection with an exclusion reason; missing members appear only in the coverage list.
11. **Duplicate checkpoint lifecycle:** keep A/C, introduce duplicateA, receive one safety text checkpoint/zero Undo steps. Reopen after duplicates become unique: A still needs review. Repair makes one authored step; Undo restores the hold. Undo to pre-duplicate text reserializes the hold before the saver writes. Another owner's hold remains unchanged.
12. **Save errors and ordering:** force a checkpoint save rejection; current evaluation stays guarded and UI shows unsaved status. Queue a subsequent authored selection edit; the eventual saved text is the latest canonical state. A failed checkpoint cannot be reported as saved.
13. **Text ownership:** Keep preserves prose, comments, other charts, ordinary `where/select` predicates, and unknown unaffected text. A frozen/invalid owner block refuses the write, keeps runtime selection safe, and exposes unsaved status. Moving a named chart between blocks preserves ownership; removing it removes its selection/finding binding deliberately.
14. **Headless boundary:** raw-numeric A/C fixtures produce40 then45 with synthesized runtime `__ID`. Resolve canonical selections before `evaluateNotebookFindings`; return/reuse the next guarded settings between calls. Duplicate→unique remains held on the next call. Do not claim provider calculation/conversion parity for this source-field-only helper.
15. **Query/file lifecycle:** change notebook `eda query=` to an expanded or different-source query; publish the new rows and basis together and block old identity. Change source CSV through the actual watcher and manual reload; after the generation remount, unkept A/C still yields45/22.5, no selection block was written, and pre-refresh Undo history remains. Hydration precedes findings and cannot be overwritten by initialization callbacks. A fresh app session loses unkept membership but restores kept keys. Verify a failed load preserves an explicitly labeled prior result rather than manufacturing missing records.
16. **Empty mismatch precedence:** an explicitly empty saved selection under another source/grain is incompatible/unavailable. Clear it or deliberately create an empty request under the current basis; the latter counts0.
17. **External authored restore:** while no app write is in flight, edit only notebook prose/title and reload: current unkept membership remains. Edit one named owner's selection declaration: only that owner restores from text, unioning current guards. Remove the owner: evict its intent. Change folders: no session selections or history leak.

M1's availability tests can assert shared provider/owner status without notebook dependencies. These tests add the mounted finding and prose assertions once M3 exists.

### Documentation and runnable example

Update **`apps/demo/src/docs/pages/notebooks.mdx`** sections **“Keep a record selection”**, **“Refresh and partial findings”**, **“Selected records and numeric contributors”**, and **“Undo uses current data”**. Link the explicit-key recipe from project-folders and developers documentation.

Add **`apps/demo/src/docs/live/NotebookSelectionRefreshExample.tsx`** with the A/C sequence, one owner chart, one sibling chart, count/sum/mean findings, a share, and current-record links. Include Keep/refresh/delete/return/duplicate/key-type/repair/reopen/Undo controls. Keep the existing **`NotebookFindingsExample.tsx`** honest: its current ephemeral example need not start saving clicks.

**Main risk:** recompilation, text write-back, and folder saves currently follow different lifecycles. The release is incomplete if it only preserves a mounted provider while the actual file refresh remount loses local membership, guards, or Undo. Preserve session state across that boundary, then prove kept text survives a fresh app session.

## M4 — Exact expanded output pairs

**User action shipped:** explicitly select one child-grain output record, refresh parent/child data, and keep only that pair through save/reopen. This is independently useful after the core mission.

**Depends on:** M2; M3 supplies notebook presentation. **Recommendations:** SR09, SR13.

### Implementation boundary and files

Update the shared source-key constructors, **`src/lib/analysis/evaluateProject.ts`** `expandedFrame`, **`src/lib/analysis/selectionIdentity.ts`**, project/notebook adapters, and selection text codecs. Reuse the existing structural parent/child output key builder. Add portability and potential-key ambiguity alongside it; do not create a second expansion identity algorithm.

A pair requires valid, explicitly continuous identity on both sides, with the expansion/relationship path in its grain descriptor. Propagate ambiguous parent/child keys from the full sources even when output filtering hides an occurrence. A lookup's secondary contributors do not define its grain; an expansion's child does.

Matched pairs and unmatched-parent placeholders are distinct output records. Do not convert an unmatched-parent selection into all children on later matching. Defer durable selection of unmatched placeholders in this release; retain ordinary inspection and explicit unavailable status.

### Exact acceptance tests

Extend **`src/test/lib/analysis/selectionIdentity.test.ts`**, project identity integration, and the notebook refresh example:

- Parent A → children a1=4/a2=6: old parent selection remains incompatible; count2/sum10 must not appear as its preserved result.
- Explicit pair (A,a1): count1/sum4. Reorder, change a1→7, append a3=9: count1/sum7; a2/a3 stay unselected.
- Remove a1 while A persists: request remains, finding unavailable. Return a1 uniquely:7 unless held for prior ambiguity.
- Duplicate the selected child's key, then remove the original while keeping the duplicate: pair remains under review; no automatic substitute.
- A duplicate parent hidden by a query filter still blocks its selected pair.
- Change relationship or expansion path under the same query ID: old pair basis is incompatible.
- Existing colon-containing parent/child keys produce distinct pairs. Add compound parent and child keys with delimiter-containing string components.
- Save/reopen absent/review pair membership through project JSON, analysis text, and kept notebook text.
- Repair one pair/owner does not select its sibling pair or clear another owner's hold.
- Unmatched→matched and parent→expanded transitions have explicit blocked status, no prefix matching or automatic descendant selection.

### Documentation and runnable example

Add **“Retain an exact expanded row”** and **“Parent and child grains”** to **project-folders.mdx** and a short matching notebook section. Extend **ProjectSelectionRefreshExample.tsx** with a separate **Select a1** action; the grain switch itself must never perform that selection.

**Main risk:** contributor lineage is not output identity. Requiring every lookup contributor to be portable over-blocks valid parents, while ignoring child identity on expand silently changes membership.

## Fixture L — Exact typed ledger expectations

Use the existing 12-record `selectionIdentityFixture.ts`; do not replace it. Names repeat, raw keys mix types, and measures are powers of two.

Test owners independently before combining scopes:

| Owner and request | Initial count / sum / mean | After reversed F1 |
| --- | --- | --- |
| Chart C: L02,L05,L10 | 3 / 530 / (530/3) | L10,L05,L02; 3 / 618 / 206 |
| Chart-local: L01,L10,L12 | 3 / 2561 / (2561/3) | L12,L10,L01; 3 / 2703 / 901 |
| Rows: L04,L08,L10 | 3 / 648 / 216 | L10,L08,L04; 3 / 736 / (736/3) |
| Workspace W: L01,L10,L12 | 3 / 2561 / (2561/3) | L12,L10,L01; 3 / 2703 / 901 |

**F1 is exact:** reverse the original rows; set L01=3, L10=600, L12=2100; add unique unselected L13 with measure8192. Output order may follow the new source; canonical selected membership does not depend on it.

**F2 removes L10 from F1:** Chart C has L05,L02, sum18/mean9; chart-local and W have L12,L01, sum2103/mean1051.5; Rows has L08,L04, sum136/mean68. Each request still contains L10. Return L10=600 restores F1.

**Selection edit:** replace W with L02,L06,L07 (string101,false,numeric0). Original current sum98; refresh these measures to5,35,65 gives105/35. Numeric101 and string0 must not enter.

**Type collision:** from the original ledger, change L01 numeric101→string101. W retains L10,L12, sum2560/mean1280; C's string101 is ambiguous, so C retains L05,L10, sum528/mean264. Both new string101 occurrences are excluded for that requested member and a review hold is stored.

**Measure-invalid:** from F1, L10's key stays valid while its measure is invalid under numeric interpretation. W has3 selected records,2 numeric contributors, sum2103/mean1051.5. Use the current conversion/exclusion machinery; no new statistical rule.

**Do not compare owner counts to a combined intersection.** For multiple active owners, assert each owner's coverage separately, then the final visible/eligible intersection.

## Verification run sheet for the implementation worker

These commands are **proposed**, not executed in this research session. New test paths become valid when their milestone creates them. Use the repository's pnpm and shared test timeouts. Run targeted checks while implementing, then the required broad gate once before the review PR.

```bash
# M1: key/owner/provider contract and legacy restore.
pnpm --filter exploreda exec vitest run \
  src/test/lib/selectionIdentity.test.ts \
  src/test/providers/keyedRefresh.test.tsx \
  src/test/providers/savedSelectionRestore.test.tsx

# M2: project identity, source references, and actual persistence.
pnpm --filter exploreda exec vitest run \
  src/test/providers/projectIdentity.test.tsx \
  src/test/lib/analysis/selectionIdentity.test.ts \
  src/test/lib/analysis/sourceRowIdentity.test.ts \
  src/test/lib/project/selectionRefreshRoundTrip.test.ts
pnpm --filter app exec vitest run \
  src/selectionSession.test.ts \
  src/selectionRefresh.test.tsx \
  src/saver.test.ts

# M3: live values, text ownership, and notebook history.
pnpm --filter exploreda exec vitest run \
  src/lib/notebook/findings.test.ts \
  src/lib/notebook/selectionWriteBack.test.ts \
  src/components/notebook/ExplorEdaNotebook.test.tsx
pnpm --filter app exec vitest run src/notebookSelectionHistory.test.ts

# Type correctness and docs registration.
pnpm --filter exploreda check-types
pnpm --filter demo docs:check

# Build before demo type/docs verification: demo types read package dist.
pnpm --filter exploreda build
pnpm --filter demo build
pnpm --filter demo docs:verify

# Required final repo gate after the integrated milestone is ready.
pnpm check
```

The exact-baseline app manifest already supplies `vitest run` and the shared test configuration. Add these cases within that runner; no separate runner is needed. The proposed app test paths are implementation targets, not claims that the new tests already exist.

Browser acceptance must use real selection gestures, status/repair controls, keyboard access, save/reopen, and inspection at **1280, 783, and 390 px**, as required by the repository's working rules. Start with light mode; check dark status contrast too. Assert meaning and membership, not only screenshots. Reuse the existing `pnpm shot` and docs verification workflows. No runtime/browser checks occurred in this Design mission.

For a package feature release, include the required minor changeset and screenshot evidence in Codex's later PR. This handoff itself makes no repository changes or PR.

## Source anchors, completed checks, and handoff limits

### Decisive baseline anchors

- [DataLayerProvider.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/providers/DataLayerProvider.tsx): `initializeData` integration, provider effect, fingerprint, save/restore, edit holds. Current saved-state/row-rebuild lifecycle determines M1.
- [rowIdFilters.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/rowIdFilters.ts) and [analysisRowKeys.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/analysisRowKeys.ts): all four owners already traverse; current project tokens must not be confused with canonical new safety state.
- [SavedDataTypes.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/types/SavedDataTypes.ts) and [saveDataUtils.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/utils/saveDataUtils.ts): saved/runtime type and validator coupling.
- [evaluateProject.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/evaluateProject.ts), [sourceRowIdentity.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/project/sourceRowIdentity.ts), and [useAnalysisEvaluation.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts): source identity, grain, duplicate fallbacks, and asynchronous result ordering.
- [sources.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/sources.ts), [dsl/project.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/dsl/project.ts), and [projectFile.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/analysis/projectFile.ts): generated row-number keys, scalar source declaration parsing, and scalar JSON validation.
- [readNotebook.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/readNotebook.ts), [ExplorEdaNotebook.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx), [writeBack.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/writeBack.ts), and [ProjectWorkspace.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/ProjectWorkspace.tsx): discarded query envelope, local selections, deliberate skipped click persistence, and text autosave.
- [findings.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/findings.ts), [NotebookFindings.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/components/notebook/NotebookFindings.tsx), and [findings.test.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/packages/explorEDA/src/lib/notebook/findings.test.ts): current scopes, contributor exclusions, revision guard, and exact active-East fixture.
- [App.tsx](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/App.tsx), [saver.ts](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/src/saver.ts), and [app package.json](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/apps/app/package.json): generation-keyed workspace remount, block-text-only notebook memory, pending/in-flight write distinction, swallowed write errors, and existing Vitest runner.
- [AGENTS.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/AGENTS.md), [agent-guide.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/agent-guide.md), and [DIRECTION.md](https://github.com/byronwall/explorEDA/blob/5594c95690859e8ce456aa3228fa9265ba686d12/docs/research/DIRECTION.md): same-milestone docs/examples, verification, changeset, and feature-design direction.

The companion design report contains the full 46-file reading inventory, 18 supplemental reads, current primary-source comparison, alternatives, refresh matrix, and SR dispositions. This plan contains the complete implementation sequence and its tests.

### Performed versus proposed

**Performed:** read both attachments; confirm all 46 complete packet boundaries and byte counts; review fixed-baseline source; follow 18 supplemental files at that exact commit (17 complete, one targeted compiler read); inspect official AG Grid/TanStack/Perspective documentation; independently calculate and simulate the A/C and typed-key reference cases without executing repository code; review the resulting design for persistence/Undo/source-quality contradictions.

**Proposed:** every implementation edit, Vitest assertion above, browser check, folder refresh experiment, performance measurement, changeset, and PR. No downloaded repository code ran. No repository was modified, committed, or pushed.

**Open integration choices:** final API naming and reuse of any suitable host-history abstraction. Defaults and App-level insertion points are specified; no missing input blocks M1. The folder-remount lifecycle and existing app Vitest runner were verified in source; their proposed integration behavior still needs runtime testing. Codex should reconcile subsequent repository changes while preserving this report's baseline claims.


