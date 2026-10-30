# Keep selected records through refresh

Build an explicit key contract for plain workspaces, project views, and live notebooks.
Save requested logical keys. Derive current row positions and findings after each successful refresh.
Keep absent keys requested. Require deliberate repair after an observed duplicate.

Status: proposed, not implemented. Build dispositions define this plan; they do not authorize implementation.
Source baseline and integration check: `5594c95690859e8ce456aa3228fa9265ba686d12`.
Read the [short research summary](../../research/selection-refresh-design-2026-10-29/README.md),
[local evidence and dispositions](../../research/selection-refresh-design-2026-10-29/evidence.md), and
[original artifact index](assets/pro-results/selection-refresh-design-2026-10-29/index.md).
The original Pro plan contains the full acceptance matrix. This local plan controls implementation.

## Contract

The host declares source continuity and promises not to reuse a key for a different record.
Plain input declares proposed `rowIdentity={kind: "fields", sourceId, keyFields}`.
Project input reuses evaluator keys, with explicit source `entityKey` and proposed `continuityId`.
Inferred uniqueness and generated row numbers do not establish continuity.

Use exact string, finite number, and boolean components. Preserve `0`, `false`, and number/string distinctions.
Reject missing, blank-only, nonfinite, or structured scalar components. Normalize negative zero to zero.
Keep nonblank strings unchanged. Read raw keys before analytical conversions through a narrow `valueParsing.ts` helper.
Encode compound keys as ordered typed tuples; never join them with delimiters.
These are proposed portability rules, stricter than today's project key validity check.

Retain numeric `__ID` as a runtime coordinate. Add a saved record filter at the existing owner's filter location.
It contains a source/key/grain basis, requested keys, and duplicate-review markers.
Lower that request into a current numeric value filter. Never overwrite the request with its runtime projection.
Reuse `mapRowIdFilters` ownership: chart selection, chart-local, Rows, and workspace.
Do not admit this saved filter into finding predicates without a separate lowering path.

| Condition                                  | Selection and result                                                     |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| One compatible unique match                | Use its current row and values.                                          |
| Missing member                             | Keep its key; compute a visibly partial result from resolved members.    |
| Duplicate selected key                     | Exclude all occurrences; save a review marker.                           |
| Unique after an observed duplicate         | Keep excluded until explicit review of the current unique candidate.     |
| Nonempty request with no resolved members  | Keep an active empty runtime filter; dependent findings are unavailable. |
| Deliberately empty request                 | Keep an active filter; count zero.                                       |
| Clear                                      | Remove that owner's restriction.                                         |
| Source, key declaration, or grain mismatch | Retain the old request as blocked, including an old empty request.       |
| Failed or incomplete evaluation            | Preserve the labeled prior completed result; do not infer deletion.      |

Count requested members, resolved identities, selected records, and numeric contributors separately.
Show coverage for each contributing owner; do not add their denominators together.
Predicates reevaluate current values. Exact record membership remains separate from them.
Selected findings inherit relevant owner availability. Eligible findings bypass only their chart's selection.
Chart-independent findings retain their current source-wide scope.
Shares and differences propagate partial or unavailable operands without changing reducers.

Use existing status surfaces and compact nonmodal popovers. Offer forget, clear, replace, and review actions.
Repair requires uniqueness in the full identity-defining source, even if a query hides other occurrences.
Use existing Alt-click, Alt-Enter, and trace routes for records. Add no mark-level Inspect button.

## M1 — Plain workspace: select, refresh, repair, and reopen

Deliver a complete action with JSON persistence before adding project or notebook integration.
Support all four owners through one resolver and one owner traversal.

Change `packages/explorEDA/src/`:

- `components/ExplorEda.tsx`, `providers/DataLayerProvider.tsx`: declaration, current canonical intent, reconciliation, callbacks, and restore classification.
- `lib/selectionIdentity.ts` (proposed): tuple codec, basis comparison, snapshot index, resolution, and guard merge.
- `lib/valueParsing.ts`, `lib/rowIdFilters.ts`: exact key validation and shared owner conversion.
- `types/FilterTypes.ts`, `SavedDataTypes.ts`, `SavedDataStructure.ts`, `utils/saveDataUtils.ts`: saved/runtime filter separation and validation.
- `components/RecordSelectionStatus.tsx` (proposed): status and repair in existing filter surfaces.
- Existing selection interaction entry points: pass replace/add/remove/toggle/clear/repair semantics explicitly.

Read live intent before changing data. Classify unchanged restore input, equivalent echo, explicit restore, and reset.
An unchanged absent `savedData` preserves live keyed edits; removing a supplied save remains an explicit reset.
Publish rows, identity, runtime filters, and coverage together. Fingerprint canonical state, excluding runtime positions.
Add/toggle preserves absent members; replace deliberately replaces the request.
Reject a new durable selection containing invalid or ambiguous keys atomically.

Keep `onStateChange` for edits. Proposed `onRefreshCheckpoint(settings): void | Promise<void>` persists new review markers without Undo.
Expose pending/failed persistence until acknowledgment. Hosts must order checkpoint and edit writes to the same destination.
Manual `getSettings()` remains possible without a durability claim.
Merge current owner/basis/key guards into stale restores and Undo. Explicit repair alone releases them.
Undo repair reinstates review; Redo requires fresh review. Store definitions, not historical rows or measures.
Retain unkeyed content-matching behavior without building a general migration layer.
A positions-only historical save cannot establish record identity. Require deliberate adoption from a known snapshot.

Prove in provider and pure identity tests:

- A101=10, B202=20, C303=30; request A/C: count 2, sum 40, mean 20.
- Refresh C30,D404=100,A15,B20: A/C remains; sum 45, mean 22.5.
- Remove C: partial A, sum 15. Save/reopen, then return C: 45/22.5.
- Duplicate numeric 101: only C contributes, sum 30. Original A changes to string `"101"`: numeric impostor stays blocked.
- Restore unique A15: still blocked until review, then 45/22.5. Save/reopen retains the guard.
- Replace with B between refreshes; update B to 25: only B. Equal host echoes cannot revive A/C.
- No matches is unavailable; intentional empty counts zero; clear on four rows counts 4, sum 165, mean 41.25.
- Each owner round-trips typed/compound keys, guards, and absent members. Existing unkeyed tests still pass.
- Refresh emits no edit; first duplicate emits one checkpoint; repeated duplicate emits none. Newer edits win ordered saves.

Extend `src/test/providers/savedSelectionRestore.test.tsx`; add focused `keyedRefresh.test.tsx` and codec cases.
Use the existing typed ledger for owner cases; do not duplicate every matrix row as a separate test.

Docs in this milestone: `apps/demo/src/docs/pages/developers.mdx`, package README, and public prop reference.
Add/register `SelectionRefreshExample.tsx`: edit/reorder, remove/return, duplicate/type change, repair, save/reopen, Undo.
Risk: rebuilding from the initial supplied save can erase a newer live selection.

## M2 — Project identity and actual folder refresh

Deliver source-grain selection through query refresh and JSON/text/folder reopening.
Support source, filter, calculate, and cardinality-preserving lookup output first.
Measure or lookup changes preserve parent identity; aggregate and expand do not preserve parent grain.

Change `packages/explorEDA/src/`:

- `types/AnalysisProject.ts`, `components/project/sourceRowIdentity.ts`, `lib/analysis/evaluateProject.ts`: shared source key extraction, compound declarations, and quality metadata.
- `lib/analysis/selectionIdentity.ts` (proposed): adapter over existing evaluation and key constructors.
- `components/ExplorEdaProject.tsx`, `components/project/analysisRowKeys.ts`, `settingsCompatibility.ts`: canonical persistence and basis checks.
- `lib/analysis/useAnalysisEvaluation.ts`: coherent prior result while pending or failed; reject identity-fatal ready results.
- `lib/analysis/sources.ts`, `projectFile.ts`: explicit continuity and compound validation; never infer continuity.
- `lib/dsl/project.ts`, `parse.ts`, `compile.ts`, `export.ts`: typed selection declarations and source-key list boundaries.
- `lib/project/analysisText.ts`, `folder.ts`, `writeFolder.ts`: complete declaration and selection round-trip.

Carry source-wide ambiguous potential keys separately from output keys. Positional fallbacks otherwise hide the duplicated requested token.
Reuse project scalar key constructors; add structural compound tokens. Update source references and scalar parameter-picker limits consistently.
Do not extend relationship joins to compound keys as part of this work.
Unsupported session-only exact selections expire on replacement with unavailable status, not an intentionally empty saved request.

In `apps/app/src/App.tsx` and `ProjectWorkspace.tsx`, preserve bounded current definitions and guards above the generation remount.
Scope by folder/files identity, file, and verified named owner. Hydrate before findings or initialization callbacks run.
Data reload and prose-only edits retain local intent. Authored owner changes restore that owner with current guards merged.
Do not transfer a `path#index` overlay to another view after reorder. Require verified named mapping or explicit reselection.

**Reuse concurrent save work:** [PR #566](https://github.com/byronwall/explorEDA/pull/566) already proposes ordered writes and an in-flight-aware `flush()`.
It is open, not part of this baseline. Recheck its merged implementation before editing `saver.ts`.
Use one existing destination queue; do not add Pro's second per-path queue beside a sufficient global chain.
Prove checkpoint acknowledgment, same-path newest-state ordering, retry, and destination-specific failure status.
Add only the remaining gaps. This does not promise conflict control against external applications with writes already in flight.

Prove project A/C parity, hidden source duplicates, query-filter absence/return, continuity mismatch, and scalar/compound text round-trips.
Preserve quoted comma-containing field names. A stable query ID alone never permits grain rebinding.
Test stale worker replies, failed loads, actual watched/manual reload, view reorder, and deferred write failure/retry.
Extend project identity, source reference, folder codec, and app saver tests; add focused app refresh/session cases.

Docs: `project-folders.mdx`, package project API, and project-text reference.
Add/register `ProjectSelectionRefreshExample.tsx` plus a local fixture folder with reversible snapshots.
Risk: output uniqueness can conceal a duplicate in the source. Mounted provider tests alone miss app remount loss.

## M3 — Notebook Keep, live findings, and current contributors

Finish the core mission: local select → Keep → refresh → read findings → inspect current records → reopen/Undo.
Unkept selections survive refresh within the app session. Only kept text survives a fresh session.

Change `packages/explorEDA/src/lib/notebook/readNotebook.ts`, `compileNotebook.ts`, `writeBack.ts`, and `findings.ts`.
Pass the evaluation identity envelope through `ProjectWorkspace` into `components/notebook/ExplorEdaNotebook.tsx`.
Do not recover discarded query keys from displayed columns.
Preserve local selection scope. Separate data recompilation, authored restore, and write-back echo.
Keep assigns an unnamed chart a stable authored name in the same text edit.
Typed `selection` declarations store their original source/grain binding, absent keys, and guards.
An empty declaration means active-empty; removing it clears the owner.
Malformed declarations produce located diagnostics and preserve safe prior intent; never compile silently as all rows.

Splice only the affected declaration. Ordinary refresh does not rewrite text.
Checkpoint newly observed duplicates for kept members. Invalid/frozen text or save errors retain safe memory and show unsaved status.
Own notebook definition/text history above the app remount. Undo restores definitions against current data and merged guards.
Reevaluate edited `eda query=` before publishing its matching rows and identity.
For headless findings, synthesize the current ID column and return the next guarded state for reuse.
Do not claim provider calculation/conversion parity for that source-field-only helper.

Update `NotebookFindings.tsx` and existing trace bodies for per-owner coverage and current selected/numeric counts.
Keep revision-based inspection closure. Missing keys appear in coverage, never as fabricated contributor rows.

Prove A/C mounted, kept, and fresh-session reopen sequences, including missing return and duplicate repair.
On active-East r01/r06/r07/r10, initial count is 4, numeric count 3, sum 240, mean 80.
After r01=100 and r10 becomes numeric 5: count 4, numeric 4, sum 255, mean 63.75.
Add unselected active-East 1000: exact sum stays 255; the East predicate sums 1255 over five rows, mean 251.
Prove eligibility exclusion differs from missing identity; shares/differences propagate partial/unavailable status.
Test old inspection closure, current raw/prepared values, Keep splice ownership, malformed text, Undo, and watcher remount.
Use raw numeric data for headless tests and mounted tests for conversions.

Docs: `notebooks.mdx` sections for Keep, refresh, coverage, contributors, and Undo; cross-link developer/folder recipes.
Add/register `NotebookSelectionRefreshExample.tsx` with A/C, a sibling chart, metrics, share, and current records.
Risk: recompilation or remount can restore old text over live intent. Save success must mean actual acknowledgment.

## M4 — Exact parent/child output pairs

After the core, support an explicitly selected expanded pair. Reuse `expandedFrame`'s structural parent/child keys.
Require continuity on both sides and include the expansion path in the grain.
Carry full-source parent/child ambiguity. Defer durable unmatched placeholders and grouped-result identity.

Prove parent A becoming a1=4/a2=6 blocks the old parent selection; it never reports child sum 10 as preserved membership.
Explicit (A,a1) yields count 1/sum 4. Edit a1 to 7 and add a3=9: count 1/sum 7.
Missing return, duplicate review, path changes, and project/notebook save/reopen follow the same contract.
Docs: project-folders and notebook grain sections. Extend the project example with a separate Select a1 action.
Risk: contributor lineage is not output identity. Never select descendants by parent-key prefix.

## Verification and release

Run targeted Vitest cases and library types during implementation, using shared test limits.
Run docs checks; build the library before demo type checks and docs browser verification.
Verify each new example with real pointer/keyboard input at 1280, 783, and 390 px.
Include save/reopen, status/repair, Undo, and contributor inspection; check dark status contrast.
Run `pnpm check` once before each implementation PR. Include its minor changeset and UI screenshots.
This research PR changes docs only; no feature, browser, persistence, or performance acceptance is claimed.
