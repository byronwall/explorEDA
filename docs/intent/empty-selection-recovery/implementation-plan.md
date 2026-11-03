# Recover rows by previewing a precise removal

Build **Recover rows**. Let an analyst compare which records return when one restriction is removed.
Keep the current investigation until Apply. Preserve every unreviewed restriction.

Status: proposed implementation; this research does not approve or implement the feature.
Baseline: `d3920a285f3755a8324998775deb131747e959f5`.
See the [summary](../../research/empty-selection-design-2026-11-01/README.md),
[decisions](decisions.md), and [ten original Pro artifacts](assets/pro-results/empty-selection-design-2026-11-01/README.md).
The original plan has detailed acceptance flows and fixture references. This plan governs local implementation choices.

## Contract

- Name the population beside every count: Workspace, Rows, table, chart context, or chart selection.
- Remove one stored predicate occurrence. Keep an entire interval or value set together.
- Identify occurrences by owner, property, index, and captured revision. Retain same-field siblings.
- Inventory stored predicates, including effective predicates hidden by the chip display rules.
- Compile the complete changed chart owner. Do not AND arbitrary stored chart predicates independently.
- Check owner membership across every source ID before calling a removal a relaxation.
- Capture effective columns through `getColumnData`. Preview never changes live Crossfilter, history, settings, or text.
- Evaluate on demand. Cancel superseded scans. Count the whole captured population; label any display limit separately.
- Recheck revision, occurrence identity, held edits, and actual editability synchronously at Apply.
- Prepare one complete provider change, then publish coherent settings and memberships once.
- Keep recovery state transient. Accepted removal uses the existing settings shape.
- Use **Recover rows** consistently. Keep ordinary Undo separate from **Restore removed restrictions**, a guarded new edit.

Workspace membership includes every linked owner and workspace field filter.
Chart context excludes its entire owning selection, then applies its local population.
Chart selection adds its owner predicate back. Rows adds local filters and search to workspace membership.
Tables add their own filters and search to their context. Notebook selections remain local.
An unbound notebook finding reads all source rows; an eligible finding ignores the owning selection.

## M1: Workspace singles, records, Apply, and return

Ship an empty workspace with source rows → Recover rows → candidate records → Apply → Undo/Redo.
No local-surface recovery is promised yet.

Change `packages/explorEDA/src/components/ActiveFilterStatus.tsx`, `components/PlotManager.tsx`,
`providers/DataLayerProvider.tsx`, and `hooks/CrossfilterWrapper.ts`.
Add a small internal evaluator and removal patch under `lib/recovery/`, with a panel under `components/recovery/`.
Keep modules direct; the original plan's file split is guidance, not a required framework.
Use existing registered predicates and value helpers. An unsupported influencing predicate blocks an exact result.

Prepare affected arrays and predicates before a provider command publishes one final update.
An isolated wrapper prepared for Apply is acceptable if it simplifies failure handling.
Preview must never mutate the current wrapper. Holds delay callbacks; they do not make several setters atomic.
Use a conservative transient revision; invalidate on source, settings, calculation, restore, permission, or hold changes.

In `apps/demo/src/savedViewsHistory.ts` and `savedViewsSession.ts`, preserve primitive filter values in memory.
Keep the current durable JSON boundary. Validate settings in persisted tabs and history before session serialization.
Reject unsupported nonfinite filter datums visibly; preserve the last good saved session and current memory.
Supported undefined/null and negative-zero/zero normalization must preserve predicate membership.
Do not add a public special-value codec or general history service.

Tests: F01 returns A/B after removing chart East and C/D after removing Workspace West.
F02 preserves brush siblings. F17 preserves intentional emptiness on Cancel.
F18/F25 must reject non-monotone removals even when the target stays empty.
F28 inventories boundless ranges and empty text predicates.
Mounted tests prove no Preview/Cancel publication, one coherent Apply, stale/held/read-only rejection,
exact typed Undo/Redo, supported save/reload, and failure without partial publication.
Expire the inverse receipt after any later meaningful saved edit, restore, data, or text change.

Docs: add `apps/demo/src/docs/pages/empty-selection.mdx`; link from `filters.mdx` and `views-and-history.mdx`.
Example: add deterministic F01 in `apps/demo/src/demos/emptySelection.ts`.
Register the docs page, live example, `examples.ts`, and `coverage.ts` together.
At 1280, 783, and 390px, verify Preview A/B, Cancel, Apply, and return with pointer and keyboard input.
Keep owner labels, exact records, actions, and focus return usable without page overflow.
Risk: a plausible count for the wrong population, or partial provider mutation.

## M2: Rows and table search

Ship local recovery while workspace selections remain intact.
Change `components/RowsView.tsx`, `components/charts/DataTable/DataTable.tsx`, `filteredRows.ts`,
`definition.ts`, `ActiveFilterStatus.tsx`, and the shared recovery code.
Reuse the real resolved-row/search routine. Search includes hidden and calculated fields and literal whitespace.

Tests: F06 clearing Rows search returns R1/R2 without changing workspace IDs.
F07 covers hidden and derived matches. F24 distinguishes table filters from search:
removing search returns A; removing peer Web returns B; removing only table Region returns none.
Verify held edits, search changes, new calculated columns, and read-only controls cannot apply stale state.
Docs: extend `empty-selection.mdx` and `filters.mdx` for local results.
Example: add F06/F24 modes to the same registered example and live steps.
Run the local search → Preview → Apply → return flow at all three widths.
Risk: applying Rows state or live search to detached preview records.

## M3: Chart context, selection, and local populations

Ship named chart recovery targets. Add typed entry points where a renderer knows why it is empty.
Change `components/charts/ChartMessage.tsx`, `components/LocalFilterStrip.tsx`,
`components/PlotChartPanel.tsx`, `lib/chartPopulation.ts`, and supported chart call sites.
Start with histogram/scatter population and eligibility paths; keep unsupported render states explicit.
Record counts do not promise restored mark counts.

Tests: F09 removes only a chart-local restriction and retains workspace L3.
F27 removes the histogram range to return S0/S3, or removes outside-spec to return S1/S2.
Keep limits, bins, and the sibling occurrence. Changing limits makes Apply stale.
F15/F16 distinguish invalid plotted values and missing setup from empty records.
Docs: extend `empty-selection.mdx` for context, selected rows, local restrictions, and records without marks.
Example: add F09/F27 and setup/invalid-value modes, with live record steps.
Verify those flows at 1280, 783, and 390px. Do not overlay an empty-workspace message on nonempty context.
Risk: confusing chart context with selected records or visible marks.

## M4: Bounded pairs

Ship an explicit two-restriction comparison. Let users choose at most 12 unkept units, giving at most 66 pairs.
Keep all other restrictions applied. State the admitted set and completed coverage.
Temporary Keep controls affect proposals only. Do not discard pairs because one single is non-monotone.

Extend the evaluator, panel, and provider transaction tests; add a small pair enumerator.
F10 has four failed singles, four successful cross-conflict pairs, and two failed same-field pairs.
F21 proves that a triple can succeed after every pair fails. Never claim no solution exists.
F29 proves two ranges together can expand membership when removing the latest range alone exchanges rows.
Test the cap, cancellation, stale results, original-index addressing, and one publication for a pair.
Docs: add pair coverage and Keep sections to `empty-selection.mdx`.
Example: register F10 and the F21 boundary alongside existing modes.
At all three widths, choose units, recompute after Keep, inspect exact records, Apply, and return.
Risk: treating bounded enumeration as complete or choosing a preferred restriction automatically.

## M5: Notebook and folder lifecycle

Ship notebook-local selection recovery first. It changes runtime selection only and writes no source text.
Then admit authored chart-local removals only where full writer/compile preflight preserves chart identity
and every unrelated runtime selection. Otherwise offer Edit source before mutation.
Direct workspace/finding authoring and mixed authored/transient pairs stay deferred.

Change `components/notebook/ExplorEdaNotebook.tsx`, `NotebookFindings.tsx`, `lib/notebook/writeBack.ts`,
and the recovery owner. Preserve actual selected/eligible/unbound finding inputs.
In `apps/app/src/ProjectWorkspace.tsx`, check the full exporter result and compile retained restrictions
before `FolderSaver.queue`. `analysisFileText` alone drops omission diagnostics.
A post-commit save failure preserves accepted runtime settings and the last good file, with unsaved status.
Notebook authored preflight instead rejects before both runtime and text mutation.
Keep the existing `onStateChange` and `onTextChange` contracts; add no public veto callback.

Tests: F26 selection removal returns n1/n5, mean 10, eligible count 2, unbound count 6, and B remains n2.
Test zero text writes for selection, one supported authored edit, rejected partial writer results,
retained selections/chart IDs, stale source, exporter omission, actual save failure, and save/reopen.
Docs: extend `notebooks.mdx`, `empty-selection.mdx`, and the package README.
Example: add compiled local notebook/folder assets under `apps/demo/public/empty-selection/` and live registration.
At all three widths, recover selection, return, then exercise supported authored edits and source-edit fallback.
Risk: claiming a session change was written durably or accepting partial notebook writeback.

## Verification and limits

The local review passed 29 fixture cases against actual Crossfilter and registered Bar/DataTable compilers.
It checked baseline, preview, population, and variant memberships. It did not implement recovery or run Apply.
See [evidence](../../research/empty-selection-design-2026-11-01/evidence.md).
Pro's 422-assertion result remains attributed to Pro. Its downloaded verifier was inspected, not executed.
The SVGs are static design proposals. Real interaction, persistence, and performance gates remain unrun.

During implementation, run focused recovery/owner tests and package types.
Run demo coverage and dashboard-text tests immediately after example registration, then docs checks.
Use the actual app test harness for folder tests; confirm its commands first.
Run the complete browser flows at all three widths, add the required minor changeset, and run `pnpm check` once.
No unbuilt research, outside-user demand, broad audit, worker, or complete relaxation solver is a prerequisite.
