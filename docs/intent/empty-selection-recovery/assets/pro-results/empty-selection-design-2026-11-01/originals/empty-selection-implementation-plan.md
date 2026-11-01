# Build plan: preview a precise relaxation, then apply it once

**Recommended build:** add an on-demand recovery panel that names the empty population, previews the exact records returned by removing a reviewed restriction, and applies only that removal. Start with single restrictions over the workspace intersection, extend the same mechanism to local surfaces, then add a bounded search over pairs and notebook integration. Preserve the existing React/TypeScript library, demo, linked selection rules, and settings/text formats.

**Baseline:** `d3920a285f3755a8324998775deb131747e959f5`. **Mode:** Design. Codex owns repository integration. No product code, commits, dependency installations, or product browser tests were performed for this plan. The separate exact-record companion executed 29 scenarios, 72 alternatives, and 422 assertions; its limits are stated below.

## 1. Delivery shape and effort

Each milestone ships a useful end-to-end capability with its own documentation and runnable example. Later milestones extend the supported targets; they are not prerequisites for using the first one. One developer can work sequentially on the existing deployed version, without a compatibility layer, cloud service, new query language, or general dependency engine.

| Milestone | Independently useful result | Rough engineering effort |
| --- | --- | --- |
| **M1 — Workspace recovery** | Preview an individual stored restriction’s removal, see exact records, Apply once, save normally, and return through host Undo or guarded restoration. | 7 working days |
| **M2 — Rows and table recovery** | Recover a local table result without accidentally clearing the workspace; include hidden and calculated search values. | 4 working days |
| **M3 — Chart populations** | Recover the correct chart context, selected population, or local population; preserve specification semantics and distinguish setup/eligibility states. | 5 working days |
| **M4 — Bounded alternatives** | Find useful pairs when singles fail, with explicit kept restrictions, a 12-unit search limit, and honest coverage. | 4 working days |
| **M5 — Notebooks and folders** | Recover local notebook selections and preflight authored local restrictions; preserve text and folder-saving boundaries. | 6 working days |

Allow another 1–3 working days for integration adjustments and final regression checks: approximately **5–6 weeks**. This is a planning estimate, not a measured implementation duration. The main uncertainty is how much chart-specific eligibility and notebook writeback integration the checkout requires. Do not add adoption studies, outside-user demand, or observed-failure gates before building.

## 2. Product contract to freeze before M1

### Recover a named population

Every result carries one explicit target. The default action from the workspace status bar targets **Workspace selected rows**. An empty Rows drawer targets **Rows results**; a chart action must distinguish **Chart context** from **Chart selected rows**; a notebook finding targets the population that finding actually uses. A result count without its population is incomplete.

The evaluator works over the current provider’s source/query-result rows. It cannot recover records already excluded by an upstream query, join, remote source, or import. If that current source is empty, present an empty-source explanation and navigation to the existing data/query controls. Removing a workspace restriction cannot create an absent row.

`CrossfilterWrapper.getFilteredRowIds`, `getChartFilteredRowIds`, and the live groups have different responsibilities. In particular, a normal chart’s live group excludes that owner’s selection as a whole; `getChartFilteredRowIds` starts with the global selected intersection and applies local population restrictions. Do not rename one of those methods and assume every recovery target has been implemented. Follow the explicit target expressions in the report and fixture guide. [Source: `packages/explorEDA/src/hooks/CrossfilterWrapper.ts`, `getFilteredRowIds`, `getChartFilteredRowIds`, `getAllData`; `packages/explorEDA/src/lib/chartPopulation.ts`, `getPopulationTest`.]

### Remove reviewed occurrences

- Default unit: **one stored `Filter` occurrence**, identified by owner, property path, original array position, and the captured revision.
- A value OR-set remains one unit. Its empty array remains a real match-nothing predicate. Do not split it into independently removable categories.
- A numeric interval remains one unit, including both bounds and its exclusive flags. A date interval remains one unit with inclusive bounds; the current date-filter model has no exclusive flags.
- A specification-status filter remains one occurrence. Its owner’s specification limits stay in place.
- A search unit is the complete current search string.
- Chart `localFilters` are distinct from chart `filters`, workspace filters, and table search.
- “Clear this chart selection” is an explicit group of **N restrictions**, with all N listed. It is never ranked or counted as a single restriction.

This matches the existing individual filter-chip removal model while making grouped changes reviewable. The same field in two owners produces two different units. Two occurrences in one owner also remain different. Original positions are resolved together, so removing indexes 0 and 2 cannot shift the second operation onto the wrong element. [Source: `packages/explorEDA/src/components/ActiveFilterStatus.tsx`, filter entries and per-entry removal; `packages/explorEDA/src/types/FilterTypes.ts`.]

### Preserve existing predicate meaning

For a chart-owned candidate, clone the complete owner settings, remove the reviewed occurrence(s), then call that owner’s registered `getFilterFunction` with captured current columns. Never flatten `settings.filters` into an assumed conjunction. The exact bar definition has cases where an older range becomes effective after the last range is removed; an off-field stored clause can also be ignored by a chart’s actual compiler. Those are meaningful inputs to this design, not reasons to change the chart’s linked-selection semantics. [Source: `packages/explorEDA/src/types/ChartTypes.ts`, `ChartDefinition.getFilterFunction`; fixture cases ESR-F18, F19, F25.]

Before automatically recommending a candidate as a **relaxation**, verify that every affected owner’s old predicate membership is contained in its new membership over **all current source IDs**, and verify the affected population adapters. Checking containment only on an already-empty target proves nothing. A nonmonotonic change belongs in an explanatory result with an edit route, not an automatic “remove this to broaden” recommendation. Re-evaluate pairs independently: removing two occurrences together can be monotonic even when a constituent single removal is not.

## 3. Minimal API and state design

### Public boundary

Add **no new top-level public props or saved-data fields** for v1. Existing `readOnly`, `savedData`, `onStateChange`, notebook `text`, and `onTextChange` remain the public boundaries. Recovery is available through the built-in UI. The host continues to own durable storage and general history.

Accepted changes use existing settings properties. Do not save candidate IDs, preview rows/counts, failed attempts, search coverage, dismissal state, or inverse receipts. Transient record IDs are valid only within the current provider data epoch. Existing settings JSON and `.eda`/`.eda.md` contracts are retained. [Source: `DataLayerProvider.saveToStructure`; package README, saved settings and notebook sections; `ExplorEdaNotebookProps`.]

### Typed values: exact memory, bounded persistence

Preserve every primitive filter value in detached snapshots, removal patches, and inverse receipts. Build a type-preserving **in-memory** demo checkpoint clone and equality path: `savedViewsHistory.clone` and `savedViewsSession.clone` currently use JSON copying, and history’s JSON signatures collapse distinctions that recovery must retain. Replace those narrow plain-saved-state operations with structured copying and structural comparison that preserve the runtime values. The provider already uses a tagged fingerprint for undefined, NaN, and infinities; do not replace that working mechanism gratuitously. [Source: `apps/demo/src/savedViewsHistory.ts`, `clone`, `signatures`, `classifyChange`; `apps/demo/src/savedViewsSession.ts`, `clone`; `DataLayerProvider` saved-state fingerprint path.]

Keep the existing durable settings boundary. Validated settings JSON **rejects NaN and infinite filter datums visibly**. An undefined category entry becomes null in JSON, and negative zero becomes zero; these supported canonicalizations preserve `applyFilter` membership but do not promise identical JavaScript objects. The full-analysis special-value codec covers raw `data.data` values only; it does not extend filter-settings support. Do not introduce new public tags or a saved-data codec for this feature. `SavedViewsWorkspace` currently encodes the session through raw JSON; preflight **every persisted tab and history checkpoint’s settings** before that encode so it cannot bypass the supported-value boundary. Report unsupported persistence through the existing save-error path, preserving both in-memory state and the last good stored version; never silently rewrite bad values or drop history. Ordinary supported canonicalization remains membership-equivalent. [Source: `packages/explorEDA/src/utils/saveDataUtils.ts`, filter validation, `stringifySavedData`, full-analysis raw-value codec; `apps/demo/src/SavedViewsWorkspace.tsx`, session encoding/persistence.]

Tests must distinguish exact in-memory Undo/restoration from predicate-equivalent supported JSON save/reload and visible rejection of nonfinite filter export. A successful runtime preview or removal does not promise that the original unsupported filter values can be saved durably. Folder text writes additionally require their own serializer/writeback preflight; use the existing source-edit route when the intended state has no faithful text representation.

### Internal modules, with direct ownership

Create these small internal modules under `packages/explorEDA/src/`; all paths in this list are **new**:

- `lib/recovery/types.ts`: discriminated targets, restriction references, snapshot token, candidate result, coverage, and inverse receipt.
- `lib/recovery/snapshot.ts`: capture current source IDs, effective column values, owner settings, target state, and revision; enumerate admitted units.
- `lib/recovery/evaluate.ts`: compile affected owner clones, compose the exact target population, check monotonicity, count, and expose exact IDs.
- `lib/recovery/patch.ts`: build a removal patch and guarded inverse against captured occurrence positions. It contains no React or Crossfilter mutation.
- `lib/recovery/pairs.ts` in M4: bounded pair enumeration and coverage accounting.
- `components/recovery/RecoveryPanel.tsx`: candidate list, preview, Apply, Back/Close, kept restrictions, scope labels, stale state, and restoration action.
- `components/recovery/RecoveryRecords.tsx`: detached read-only records from the selected candidate’s exact IDs and captured effective values.
- `components/recovery/useRecoverySession.ts`: ephemeral UI lifecycle, cancellation, focus return, and subscription to invalidation.

Use ordinary discriminated unions and a few internal commands: `captureRecoverySnapshot`, `evaluateRecovery`, `commitRecoveryRemoval`, and `restoreRecoveryRemoval`. Names are proposed, not existing exports. The commit and restoration commands live with the provider’s existing write ownership. Do not create a plugin protocol, generic dependency graph, persisted patch engine, or separate state store that competes with the provider.

The snapshot should cache each requested column once through `getColumnData`, including derived fields. It must capture the complete resolved field set used by table searches. It must not evaluate formula text itself, reinterpret raw values with `Number`/`Date.parse`, or use a saved export as a substitute for current effective values. [Source: `DataLayerProvider.getColumnData`; `valueParsing.ts`; `DataTable/filteredRows.ts::getFilteredRows`.]

## 4. Evaluation, commit, and return lifecycle

### Capture and evaluate on demand

An empty result shows a compact **Find a recovery** action. Nothing is computed exhaustively in the background. Opening the panel captures the current immutable inputs and computes supported single-removal counts. Selecting a result obtains its exact membership for the records preview. Counts are exact for the captured rows; a displayed limit such as “First 100 of 2,431 records” limits only presentation, with paging/virtualized access to all 2,431 IDs.

The current charts and Rows keep showing the current investigation during preview. The records component consumes the candidate membership directly; it must not reapply the unchanged live table search and accidentally hide the records being previewed. Preview never adds a chart, replaces `savedData`, changes layout, mutates a live Crossfilter dimension, changes a finding, or emits `onStateChange`.

Compile changed owner predicates once per candidate; reuse unchanged masks within the captured request. A simple exact implementation costs roughly one scan per admitted candidate, plus the baseline masks. Candidate count, source row count, field preparation, and compiler cost determine actual time. Do not assert a fixed latency without measurement. Chunk long scans so cancellation and rendering remain responsive; abort results from superseded requests. Start on the main thread with bounded work. A worker is a later measured optimization, not a prerequisite or another formula runtime.

### Apply is one provider transaction

At Apply, synchronously check the snapshot token, reviewed unit addresses, current editability, and hold state again. Reject before mutation if any check fails. Build the complete next settings patch before publishing it. Update the affected Crossfilter state and corresponding settings as one provider-owned operation, then publish **one store update** containing coherent settings and `liveItems`.

Do not implement Apply as a loop over existing `updateChart`, `setWorkspaceFilter`, and `updateRowsSettings` actions. Each can publish independently. `holdStateChanges` suppresses the host callback while held; it does not make intermediate Zustand states atomic. Reuse the single-publication pattern visible in `clearAllFilters`, but remove only the reviewed units. Preparation must complete before touching the live wrapper; if a potentially throwing wrapper update cannot be made safely, construct replacement state before swapping rather than leaving a partly mutated published wrapper. [Source: `DataLayerProvider.holdStateChanges`, `updateChart`, `setWorkspaceFilter`, `updateRowsSettings`, `clearAllFilters`, subscription invoking `onStateChange`.]

Everything else survives: siblings on the same field, untouched owners, local restrictions, search, source data, calculations, field settings, specification limits, axes, bins, layout, titles, notebooks, and other saved views. A successful commit emits one meaningful callback; the demo records one checkpoint. It does not create a raw-data export or change the public saved format.

### Cancellation and return are different actions

- **Back, Close, or Cancel before Apply:** zero settings, history, text, or file mutations. Returning to the same list reuses only a still-current snapshot.
- **Demo Undo/Redo:** use the host’s existing checkpoint path. Undo restores the previous accepted settings; Redo returns to the accepted removal. Applying after Undo creates the ordinary history branch.
- **Restore removed restrictions:** a bounded inverse for standalone/folder use. It is a **new ordinary edit**, not a hidden history rewind, and it has no general Redo contract. Store the previous value of each touched property, the expected post-Apply value, and the exact expected post-Apply recovery revision. In v1, the receipt expires after **any subsequent meaningful saved-state edit or restore, data change, or source-text change**, including an unrelated title/layout edit. Restore only while that exact revision remains current and the owner/touched-property guards also pass. Within that valid receipt, apply only the property-scoped inverse; do not replace the whole snapshot. Once expired, decline restoration and offer the existing editor/history route.

Do not call a restoration button “Undo” where it creates another checkpoint. Do not restore an entire saved snapshot to reverse one restriction. Clear transient receipts on provider replacement and every change that advances the post-Apply recovery revision; a receipt does not survive later title/layout edits merely because its touched filter lists still match.

### Comprehensive invalidation

A recovery revision is separate from `nonce`; `nonce` alone is insufficient because Rows search and some settings edits do not advance it. Capture a provider/session identity plus a conservative generation that changes when any relevant input changes:

- Source array/query result, source order/row identity, data restoration, or provider remount.
- Runtime field settings, type conversion, missing tokens, date presets, derived definitions/results, asynchronous recomputation, or resolved field names/columns used by search.
- Workspace filters; chart filters or their order; chart type/definition; local filters; specification limits; selection mode; Rows filters/search; table search; and target identity.
- Notebook text/compile result, last-valid block status, active ownership relevant to writeback, saved-data restore, and host history restore/preview.
- Beginning or ending a held edit, a draft touching a relevant dependency, or a transition into read-only mode.

While a hold or relevant unapplied edit is active, do not publish a committable recovery preview. Ask the user to finish or cancel that editor, then capture fresh committed inputs. A late asynchronous result can never re-enable Apply for an old generation. Conservatively invalidating on extra settings changes is acceptable initially; silently accepting stale records is not.

## 5. M1 — Workspace single-restriction recovery

### Result and scope

From “0 selected rows,” open a panel listing each admitted effective restriction by owner, field, predicate, and “rows if removed.” Review one candidate’s exact returned records and retained restrictions, then Apply. An intentional empty selection remains unchanged until that explicit action. At this milestone, only the workspace intersection is a public recovery target; Rows/table-local and chart-local empty states keep their existing controls and do not borrow workspace recovery copy.

Support workspace filters and chart-owned stored Filter occurrences participating in the workspace intersection. Recompile complete built-in owner settings for every candidate. An active opaque custom definition without a trusted pure semantic adapter blocks an exact claim for that target; do not silently ignore its predicate. Empty source data and unsupported target semantics produce scoped explanations without Apply.

### Files

**Existing and packet-read:** `packages/explorEDA/src/providers/DataLayerProvider.tsx`; `hooks/CrossfilterWrapper.ts` and its test; `hooks/applyFilter.ts` and its test; `components/ActiveFilterStatus.tsx` and its test; `components/WorkspaceFilterEditor.tsx`; `types/FilterTypes.ts`; `types/ChartTypes.ts`; `apps/demo/src/savedViewsHistory.ts`. The history change is narrow: preserve typed in-memory checkpoints/equality needed by recovery, without expanding the public save schema.

**Existing and fetched at the pinned ref:** `packages/explorEDA/src/components/ExplorEda.tsx`; `components/PlotManager.tsx`; `apps/demo/src/SavedViewsWorkspace.tsx`; `apps/demo/src/savedViewsSession.ts`; `packages/explorEDA/src/utils/saveDataUtils.ts`. The panel inherits actual editability; viewport width does not manufacture read-only state. The latter persistence files establish the clone/validation boundary; reuse the existing validator rather than expanding it to accept new durable filter datums.

**New:** the M1 internal modules in section 3; `lib/recovery/evaluate.test.ts`; `lib/recovery/patch.test.ts`; `components/recovery/RecoveryPanel.test.tsx`; `providers/recoveryTransaction.test.tsx`; and `apps/demo/src/recoveryHistory.test.tsx` for the existing host’s checkpoint/persistence behavior. Add targeted assertions to existing `ActiveFilterStatus.test.tsx` and `CrossfilterWrapper.test.ts` rather than duplicating their broad suites.

### Focused behavior tests

- ESR-F01: both removals return the declared IDs; applying the workspace removal preserves the chart owner and vice versa. Assert the exact unchanged same-field predicate, not merely the new count.
- ESR-F02: one occurrence and an explicit N-unit group have different reviewed effects; the group is not counted as one.
- ESR-F03–F05, F20, F23: UTC date-only boundaries, offsets, invalid dates, typed/missing categories, and exclusive numeric edges use the real helpers. Add the exact cases to the shared evaluator suite without reimplementing those helpers.
- Typed lifecycle: preserve undefined, NaN, infinities, and negative zero in an in-memory checkpoint/receipt and its exact restoration. Separately assert that supported JSON canonicalization of undefined category entries to null and negative zero to zero preserves membership; validated export rejects nonfinite filter values visibly. In `apps/demo/src/recoveryHistory.test.tsx`, ensure an unsupported older checkpoint blocks a direct session write even when the current tab is JSON-safe; in-memory Undo remains usable, the last good stored session is unchanged, and no history entry is silently discarded. Do not count the raw-row special-value codec as filter-settings coverage.
- ESR-F12: a derived-field change invalidates a preview; the replacement preview uses current effective values.
- ESR-F14/F17: empty source is not recoverable; intentional match-nothing state remains untouched on dismissal.
- ESR-F18/F19/F25: full-owner compilation and monotonicity are correct even with ignored clauses, range fallback, and an empty target.
- ESR-F28: enumerate stored predicates by their effective semantics, not the status bar’s display-only active-filter heuristic. Boundless numeric/date ranges still require valid values, and `contains ""` still requires a string; their individual removals return Q2, Q1, and Q0/Q7 respectively.
- Mounted provider: Preview/Cancel emits zero callbacks and no store membership changes; Apply publishes one coherent update/callback; stale Apply and active-hold Apply publish none. Exact before/after settings show only the reviewed removal.
- Demo: one Apply creates one checkpoint; in-memory Undo and Redo recover the exact member arrays and typed restrictions; an edit after Undo uses the existing branch path. Supported settings save/reload preserves predicate membership and no recovery-session object, subject to the explicit JSON canonicalization above. A subsequent title/layout edit expires the separate Restore removed restrictions receipt, even when its touched filter property is unchanged.

### Docs, runnable example, and acceptance

Create **`apps/demo/src/docs/pages/empty-selection.mdx` (new)** with sections “Preview a removal,” “What stays selected,” “Apply and return,” and “When the source itself is empty.” Add a short link from the existing `filters.mdx` and explain the host distinction in `views-and-history.mdx`.

Create **`apps/demo/src/demos/emptySelection.ts` (new)** with a focused saved dashboard for ESR-F01 and named modes for the later milestones. Register it in existing `apps/demo/src/demos/examples.ts` and `coverage.ts`; register its scripted live example in `apps/demo/src/docs/live/examples.ts`; register the docs page in `catalogue.ts`. These integration paths are established by `docs/agent-guide.md`; their exact registration shapes must be read in the checkout before editing. The example uses the four literal rows A–D, not randomized data or a cloud fetch.

- **1280px:** open the workspace recovery action; preview removal of chart East, see A/B and “Keep Workspace Region: West”; Cancel preserves zero; reopen and Apply returns A/B; Undo restores zero; Redo returns A/B.
- **783px:** perform the same sequence with the bounded panel beside/over the responsive grid; owner labels and all primary actions stay visible without page-wide horizontal scrolling.
- **390px:** use a viewport-bounded sheet; choose the candidate, open exact records, return, Apply, then Restore removed restrictions. The owner and “2 rows” remain visible; records scroll inside their region; Escape/Close restores trigger focus. Apply remains functional when editable.

**Main risk:** an apparently harmless removal changes an owner’s predicate nonmonotonically or publishes intermediate states. **Ship gate:** exact owner-mask parity, the one-publication mounted test, and the complete acceptance flow above pass. No later milestone is required.

## 6. M2 — Rows and table-local results

### Result and scope

From an empty Rows drawer or Data Table, recover its local result while preserving workspace selections. Distinguish a table’s linked column filters from its local search. Show both current workspace count and local result count when they differ. A search may match a hidden source column or a calculated column; the preview must use the same effective table rows as the real table.

Keep the exact existing search semantics: case-insensitive substring matching, all resolved fields except `__ID`, null/undefined skipped, and literal whitespace. Display a whitespace search visibly, without normalizing it away. Sorting and displayed columns change presentation, not membership. [Source: `RowsView`; `DataTable/filteredRows.ts::getFilteredRows`; `DataTable/definition.ts::getFilterFunction`.]

### Files and tests

Modify the packet-read `components/RowsView.tsx`, `components/charts/DataTable/filteredRows.ts`, `definition.ts`, `DataLayerProvider.tsx`, `ActiveFilterStatus.tsx`, and shared recovery modules. Wire the trigger in existing **`components/charts/DataTable/DataTable.tsx`**, whose path is established by imports in RowsView/definition; inspect the consumer before editing because its full body was not in the supplied packet. Extract a tiny shared pure search matcher if needed so the table and recovery cannot diverge; keep its current behavior.

Add **`components/recovery/localResults.test.tsx` (new)** and extend the evaluator/transaction suites. ESR-F06 proves workspace R1/R2 remain selected while Rows search hides everything; removing only that search returns R1/R2. ESR-F07 proves hidden and derived matches and literal whitespace. ESR-F08 proves Rows field and search restrictions are separate. ESR-F24 proves table filters remain linked but table search is local: removing local search returns A; removing peer Web returns B; removing only the table Region restriction still leaves the table empty.

Test a table’s column visibility change during a preview conservatively invalidates the snapshot even though membership may be unchanged. Test a newly added derived field can change a search result. In read-only Rows, existing component-local preview settings are a separate target snapshot: local exploratory controls must not authorize provider mutation or silently persist through recovery.

### Docs, runnable example, and acceptance

Extend `empty-selection.mdx` with **“Rows is empty while the workspace has rows”** and **“Table search is local.”** Update the existing `filters.mdx` language and example links. Add Rows-search and table-search modes to `demos/emptySelection.ts`, register live steps, and retain the standalone literal records R1–R3 and A–D.

- **1280px:** select West, open Rows, search `gamma`; workspace count stays 2 while Rows count is 0. Preview clearing only search, verify R1/R2, Apply, and confirm chart selections are unchanged.
- **783px:** run ESR-F24 in chart details, open recovery from the empty table, inspect A, Apply, and close details; the workspace still selects A. A table-local search is never labeled a workspace filter.
- **390px:** open the full-width Rows drawer, move into recovery and back, then Apply the search removal. Search text, target scope, Close, and Apply remain reachable. Keyboard focus returns to the Rows search/recovery trigger rather than an obscured page toolbar.

**Main risk:** building preview rows from raw objects or visible columns gives a false search count. **Ship gate:** exact hidden/derived membership, local-versus-linked ownership, and one-callback Apply pass in mounted table/Rows tests.

## 7. M3 — Chart context, selection, and visual eligibility

### Result and scope

Give supported chart surfaces a recovery entry that targets what is actually empty. A chart can retain contextual marks while its selected set is empty. A local population restriction can empty that chart while the workspace remains nonempty. Removing the chart’s own selection cannot recover its already self-excluded context; it is not an effective candidate for that target.

Do not treat every `ChartMessage` as “empty selection.” Distinguish:

- **Setup required:** a required field/valid chart configuration is absent; route to the existing settings control.
- **Empty source:** the provider has no rows; route to source/query inspection.
- **No rows in the named population:** offer restriction recovery for that target.
- **Rows exist but no plottable values:** show the real eligibility/trace reason, such as invalid coordinates or measures; do not promise that removing a selection fixes it.
- **Rows/marks outside an axis viewport or log domain:** retain the existing bounds/eligibility explanation; axis limits are not removable row restrictions.

M3 must not invent a universal eligibility engine. Add a typed recovery trigger where the owning renderer/plan already knows its state. Start with the concrete chart families exercised by the example and exact fixtures, and explicitly mark unsupported render-specific eligibility states. The row-population evaluator can still be available from the workspace status bar even when a renderer has no dedicated empty-state adapter.

### Files and tests

Modify `components/charts/ChartMessage.tsx`, `components/LocalFilterStrip.tsx`, `lib/chartPopulation.ts`, the shared recovery modules, and the owning chart message call sites. Existing `components/PlotChartPanel.tsx` is identified by the agent guide; inspect its actual trigger and details ownership before integration. The built-in **`components/charts/BarChart/definition.ts`** is a decisive semantic reference for bin/specification and range fallback; preserve its `getFilterFunction` behavior.

Add **`components/recovery/chartPopulation.test.tsx` (new)** and **`components/recovery/emptyReason.test.tsx` (new)**. Reuse ESR-F01’s context versus selected difference; ESR-F09’s local Web restriction; ESR-F11’s specification limits; ESR-F15/F16’s eligibility/setup distinction; ESR-F22’s actual undefined-value semantics; and ESR-F27’s two same-field histogram occurrences.

For ESR-F27, the histogram’s outside-spec selection and inclusive 10–20 bin restriction conflict. Removing only the bin returns S0/S3. Removing only the outside-spec selection returns S1/S2. Explicitly clearing both returns S0–S5, including invalid/missing measures that may remain unplottable. Assert that all actions preserve `histogram.spec`, binning, axis settings, and the untouched occurrence. After changing the upper specification limit to 21, Apply against the old preview must be refused.

### Docs, runnable example, and acceptance

Extend `empty-selection.mdx` with **“Context and selected rows,” “Only this chart,” “Specification selections,”** and **“Rows without marks.”** Link from `filters.mdx`. Add local-population and histogram modes to `demos/emptySelection.ts`, using ESR-F09 and F27 records; add a setup/invalid-coordinate comparison with ESR-F15/F16. Each mode needs live documentation steps that show exact records, not only a screenshot of an empty tile.

- **1280px:** open the F27 selected-row recovery; preview S0/S3 after removing the bin restriction; Apply; confirm outside-spec selection and limits remain. Restore removed restrictions returns the exact conflict.
- **783px:** use the local-Web chart with workspace East; recover L3 by removing only the local restriction. Workspace remains L3 throughout. Details and local filter chips retain their ownership labels.
- **390px:** switch between the invalid-coordinate and setup examples. Neither offers a false selection-removal cure. Then use F27’s recovery sheet; records and primary actions remain reachable, and the “context 6 / selected 0” distinction is readable.

**Main risk:** conflating row membership with marks or using selected IDs for a self-excluded context. **Ship gate:** target-specific exact memberships and the three non-recovery states are tested through the actual owning UI/plan integration.

## 8. M4 — Bounded pair alternatives and kept restrictions

### Result and scope

When no supported single restores rows, offer **Try two restrictions**. The user chooses up to **12 units** from the current scope; all unchosen and explicitly kept restrictions stay active. Check at most **66 distinct pairs**. Show the selected set and coverage: for example, “Checked 66 of 66 pairs among these 12 restrictions; other restrictions stayed applied.” Do not silently pick 12 from a larger inventory and call the result complete.

Use explicit exclusion/Keep controls to protect a restriction within this recovery session. These are temporary search constraints, not changes to its filter. Group clear operations show their actual removed unit count; they are not two-unit alternatives unless they remove exactly two reviewed occurrences.

Evaluate pairs against the original captured settings, including two occurrences owned by one chart. Recompile that owner once for the combined removal. A single’s failed monotonicity does not eliminate every pair containing it; check the combined owner mask and target independently. Rank eligible alternatives transparently by number removed and scope locality, with exact returned count as visible evidence. Do not claim causal blame, optimal repair, nearest data, or minimum-cardinality proof beyond the tested set.

### Files, tests, docs, and example

Add `lib/recovery/pairs.ts` and **`lib/recovery/pairs.test.ts` (new)**; extend RecoveryPanel and transaction tests. No persistent state or new public options are needed. Use an internal constant for the 12-unit cap; do not expose a tuning API before a host need exists.

ESR-F10 is the acceptance core: all four singles return zero; the four cross-conflict pairs return D, C, B, and A respectively; removing both Region restrictions or both Channel restrictions still returns zero. ESR-F21 proves pairs are incomplete: no single/pair returns H1, while a user-chosen triple would. The UI must say **“No restoring single or pair found in this search”**, never “No recovery exists.” ESR-F29 proves pair admission is independent of each single: removing the latest range alone is nonmonotonic, while removing both ranges together returns G0/G1/G2, retains G1, and preserves category A so G3 remains excluded.

Add tests for the 12-unit/66-pair boundary, keeping a restriction, changing the chosen set, aborting mid-scan, and an invalidation racing the final result. Exact counts are emitted only for completed candidates; partial coverage is visible. Apply two reviewed removals in one provider update and one host callback, with original-index addressing and an exact guarded inverse.

Extend `empty-selection.mdx` with **“When one removal is not enough”** and **“What this search checked.”** Add a pair-conflict mode to `demos/emptySelection.ts` using A–D from ESR-F10, plus the one-row triple case as the honest-boundary example. Register both live step sequences.

- **1280px:** observe four zero single counts; select four units and run six pairs. Mark workspace West as Keep, invalidate the old coverage, then recompute the **three pairs among the remaining three units**. Preview removing chart East plus chart Store, which returns A while workspace West and chart Web remain applied. Apply both restrictions once; history gains one checkpoint.
- **783px:** change the chosen pair set and Keep selection while the panel is open; old coverage disappears until recomputed. Records and retained restrictions agree for the selected pair.
- **390px:** choose units in a bounded list, review the two removed restrictions on separate wrapping rows, inspect exact records, then Apply. Run F21 and verify the bounded-search statement fits without hiding the edit route.

**Main risk:** presenting a bounded search as exhaustive or misclassifying a multi-clause group. **Ship gate:** exact pair membership, independently checked pair monotonicity, cancellation, coverage, and one-transaction behavior pass.

## 9. M5 — Notebook and folder integration

### Notebook behavior

The notebook uses the same evaluator with local-selection semantics. Other chart selections never enter the target chart’s selected or eligible population. Selected findings apply that owner’s selection; eligible findings ignore it; findings without a chart read all source rows plus their own conditions and ignore workspace filters. Count zero stays a valid value. Numeric summaries retain their separate “no rows” and “no valid values” states. [Source: `ExplorEdaNotebook`, `localSelections`; `lib/notebook/findings.ts::evaluateFinding`; fetched `NotebookFindings.tsx::useFindingResults`.]

Ship two explicitly separated mutation paths:

1. **Chart-local selection recovery:** Apply to current runtime selection only. Notebook text does not change. Provide the transient guarded restoration action. A remount/reload follows the authored source again; do not promise persistence of this selection change.
2. **Authored chart-local `where.` recovery:** when text authoring is available, preflight the exact removal through `writeBackSettings` and a full intended-state check. Accept only a complete supported result for the current text/compile revision that preserves the named chart’s identity **and all unrelated runtime selections**. Commit through one notebook-owned action and the existing `onTextChange` path; preserve unrelated source, comments, aliases, and chart settings. If a rewrite/recompile would regenerate the chart ID or reset another chart’s transient selection, fall back to **Edit source** before mutation. A frozen block or unsupported/partial writer result also blocks Apply before any runtime mutation.

**Unsupported direct mutations in this milestone:** notebook workspace `filter` declarations; finding-owned `where.` conditions; comparison operands/denominators; and pairs mixing a transient selection change with an authored text change. Explain their scope and exact counterfactual where evaluation is supported, then route to the source editor. Existing `writeBackSettings` processes chart text, skips `filters`/`select.*`, and does not write workspace or finding definitions. An empty results array is not a persistence success. [Source: fetched `lib/notebook/writeBack.ts`, `skippedKey`, `textPart`, `writeBackSettings`; `writeBack.test.ts`.]

### Files and folder behavior

Modify packet-read `components/notebook/ExplorEdaNotebook.tsx` and `lib/notebook/findings.ts`; fetched `components/notebook/NotebookFindings.tsx` and `lib/notebook/writeBack.ts`; and shared recovery modules. Add internal notebook recovery ownership/context as needed, without changing the public props. Do not rely on the existing two-second last-input heuristic to prove a durable transaction; the explicit recovery action owns its preflight and commit.

Use existing **`apps/app/src/ProjectWorkspace.tsx`** and **`apps/app/src/saver.ts`**, both fetched at the pinned baseline. Dashboard changes already reach `updateView`, `analysisFileText`, and `FolderSaver.queue`. The convenience `analysisFileText` path discards the fuller exporter’s `omitted` diagnostics: the host save boundary must inspect the **full exporter result plus compile preflight of every retained restriction before queuing or writing**, not only a successful text string. The exact existing integration files are `packages/explorEDA/src/lib/project/writeFolder.ts::analysisFileText`, `lib/project/analysisText.ts::exportAnalysisText`, and `lib/dsl/export.ts`. The existing `onStateChange` callback runs after the library commit, so it cannot block that accepted runtime edit in advance. On exporter omission or compile mismatch, keep the accepted in-memory settings, preserve the last good disk file, show unsaved/save-failure status with an **Edit source** route, and queue no write. Do not automatically revert the accepted edit or claim it was persisted. This uses the current callback contract and adds no public host-precommit hook.

Notebook authored recovery remains different: its internal owner can preflight **before both runtime and text mutation**, then use the existing `onTextChange` file queue. The folder notebook does not subscribe to ordinary settings callbacks, so selection-only recovery correctly writes no file. Keep actual write failures visible through existing `SaveStatus`. Exact runtime `onStateChange` is not itself proof of durability.

Folder use does not gain the demo’s general Undo/Redo history. **Restore removed restrictions** is a compensating ordinary change: after a persisted local-filter removal it queues the restored source/settings through the same saver. Before a pending write, returning to disk-equivalent text can be de-duplicated by FolderSaver. A source reload invalidates transient receipts. Read-only mode never acquires persistence permission merely because temporary on-screen selection is possible.

### Tests, docs, example, and acceptance

Extend existing fetched `lib/notebook/writeBack.test.ts`; extend **`components/notebook/ExplorEdaNotebook.test.tsx`**, whose existing path was confirmed through pinned GitHub discovery, after reading its current test setup. Add **`components/recovery/notebookRecovery.test.tsx` (new)** and **`apps/app/src/recoveryPersistence.test.tsx` (new)**. The folder test covers an exporter omission of a retained restriction: the runtime removal remains accepted, save preflight blocks the queue/write, the last good disk file survives, and unsaved status exposes Edit source. It also distinguishes that host save-preflight failure from an actual file-write failure. The notebook test separately verifies that its internal authored-edit preflight blocks both runtime and text mutation. These tests exercise public behavior and exact source text, not private function call order.

ESR-F13 proves notebook selection isolation. ESR-F26 proves A’s selection removal returns n1/n5, average 10, eligible count 2, unbound count 6, and B remains n2. Confirm zero text writes for selection recovery; one supported text change for a local `where.` removal; unchanged notebook state for unsupported workspace/finding changes; and no partial commit across a failing preflight. An authored removal must preserve the named chart ID and another chart’s existing transient selection; a proposed rewrite that fails either check offers Edit source without mutation. Open records, change source/settings, and ensure stale rows disappear. Test a save failure as a persistence failure, not a changed membership result.

Extend existing `apps/demo/src/docs/pages/notebooks.mdx` with **“Recover selected rows”** and **“Temporary selections and authored restrictions.”** Extend `empty-selection.mdx` with the folder save/restore contract; update the package README’s notebook section. Create **`apps/demo/public/empty-selection/records.json`**, **`notebook.eda.md`**, and **`workspace.eda`** as **new** local example assets, using the F26 records and a verified project source/query declaration. Register a notebook live example in `docs/live/examples.ts`. The folder example must open through the existing CLI and round-trip its accepted `.eda`/`.eda.md` edits; do not ship uncompiled illustrative DSL as a runnable example.

- **1280px:** open the selected finding at zero; preview n1/n5; Apply selection removal; see average 10 and B=n2; source text remains byte-identical. Restore restrictions returns zero while its receipt is current. Then remove an authored local restriction through preflight, confirm the named chart ID and B’s transient selection survive the accepted edit, save, reopen, and confirm the authored text and exact resulting population. Reload follows authored selections; it does not promise persistence of B’s transient selection.
- **783px:** notebook stays in its reading column; perform the same selection recovery. A workspace/finding-owned condition offers source editing, without a misleading durable Apply. Frozen blocks preserve last-valid results and block authored mutation. Exercise a preflight that would change chart identity or erase an unrelated runtime selection; Edit source is offered and the notebook remains unchanged.
- **390px:** finding trigger, scope, exact records, Apply, and restoration fit the bounded sheet. Dismissal returns focus to the finding. A local-selection action remains usable where the host permits interaction; authored mutation remains unavailable when the host cannot write text.

**Main risk:** conflating temporary selection with persisted text, or accepting the writer’s partial success. **Ship gate:** exact notebook populations, session-only selection proof, atomic text preflight, file-save/reopen, and guarded restoration pass.

## 10. Integration verification and one command run sheet

The fixture companion is evidence for exact pure predicate and population semantics. It embeds baseline helper/selected compiler bodies and an original oracle; it does **not** instantiate live Crossfilter, React, provider callbacks, notebook writeback, history, or chart renderers. The reported 422 assertions are not a claim that the proposed feature has passed product tests.

Use the fixture JSON’s exact arrays as expectations in focused repository behavior tests. Do not generate the expected answer with the same evaluator being tested. Preserve fixture-only special-value decoding in tests; it is not a new saved-data codec. Add checks only to resolve the concrete risks named above, then run the existing broad gate once before the integration PR.

The following run sheet is **proposed for Codex after implementation**. New test/example paths refer to the planned files above. Run commands for completed milestones; do not run missing tests. Commands were not executed against a product checkout during this design mission.

```bash
# One developer, existing pnpm workspace. Use the repository-required runtime.
pnpm install

# Standalone exact-record companion, copied from this deliverable bundle.
pnpm exec node /absolute/path/to/verify-empty-selection-fixtures.mjs \
  --output /absolute/path/to/empty-selection-verification.json

# Focused semantic, transaction, and UI checks as their milestones land.
pnpm --filter exploreda exec vitest run \
  src/lib/recovery \
  src/components/recovery \
  src/providers/recoveryTransaction.test.tsx \
  src/hooks/CrossfilterWrapper.test.ts \
  src/hooks/applyFilter.test.ts \
  src/components/ActiveFilterStatus.test.tsx
pnpm --filter exploreda check-types

# M5 adds focused notebook writeback and folder persistence checks.
pnpm --filter exploreda exec vitest run \
  src/lib/notebook/writeBack.test.ts \
  src/components/notebook/ExplorEdaNotebook.test.tsx
pnpm --filter app exec vitest run src/recoveryPersistence.test.tsx

# Validate example registration and dashboard text round trips.
pnpm --filter demo exec vitest run \
  src/demos/coverage.test.ts \
  src/dashboardText.test.ts \
  src/recoveryHistory.test.tsx
pnpm --filter demo docs:check

# Run the real accepted flows at 1280, 783, and 390 pixels.
# The example route is part of the proposed registration, not an existing route.
pnpm dev:agent
pnpm shot /examples/empty-selection --name empty-selection
pnpm --filter demo build
pnpm --filter demo docs:verify --grep '/docs/empty-selection'

# Package changes require a changeset; write the user-facing release summary.
pnpm changeset:add minor "Preview exact records before relaxing an empty selection."

# Run this broad gate once, from one worktree, before the implementation PR.
pnpm check
pnpm dev:agent --stop
```

Confirm the app package’s current test script before using the proposed `pnpm --filter app exec vitest` command; `apps/app/src/recoveryPersistence.test.tsx` is a new test, not a pre-existing gate. Test time limits remain in `@repo/test-config`. Capture real pointer and keyboard flows, not just static screenshots. No need to broaden testing after these concrete acceptance conditions and the required gate pass. [Source: `AGENTS.md`; `docs/agent-guide.md`, commands/tests/docs registration.]

## 11. Access, evidence, and remaining implementation choices

**Access confirmed.** The complete 37-file source packet at the named baseline was read across the research team. The supplied prompt, governance, filter/model/provider/UI/tests, notebook findings, history, and docs informed this plan. Supplemental notebook writeback, live findings, demo history host, folder host/saver, and editability components were fetched at that same ref to resolve decisive boundaries. No claim here relies on current `main` replacing the baseline.

**Checks versus proposals.** Exact fixtures and their standalone verifier executed successfully. All proposed React UI, transactions, Crossfilter integration, real history, notebook mutation, folder save/reopen, performance, and 1280/783/390 browser flows remain implementation acceptance work. The current package README still limits overall product support to desktop; this plan requires the recovery surface itself to remain safe and functional at the three review widths and does not promise every chart becomes mobile-supported.

**Companion artifacts:** [report](empty-selection-design-report.md), [recommendation dispositions](empty-selection-recommendations.md), [fixture data](empty-selection-fixtures.json), [fixture guide](empty-selection-fixtures.md), [runnable verifier](verify-empty-selection-fixtures.mjs), and [executed verification result](empty-selection-verification.json). Codex should integrate the selected plan and concise research summary under the repository’s intent/research paths; the downloadable originals remain the review record, not a proposed repository dump.

**Open implementation choices, with defaults:** use a conservative recovery revision before optimizing invalidation; use an internal built-in owner adapter boundary before admitting arbitrary custom compilers; use exact scans with cancellation before a worker; and retain inferred demo history labels before adding any public event metadata. Check the current docs/example registration and app test harness before editing those referenced modules. None of these choices blocks the recommended first build or requires new user demand.
