# Narrow analytical reading

Build an ordered reader for saved workspaces and notebooks. Reuse current chart panels, selection state, and exact-record traces. Readers can select data, check scope, open supporting records, and return to their place.

Add an opt-in `presentation="reader"`. Keep the current presentation as the default. Save small reading groups after the reader works. Each milestone includes docs, a runnable example, and a minor changeset.

[Research summary](../../research/narrow-reading-design-2026-11-02/README.md) · [Original asset index](assets/pro-results/narrow-reading-design-2026-11-02/README.md) · [Decisions and evidence](decisions.md) · [Pro conversation](https://chatgpt.com/c/6ae84fbd-aa30-83e9-9d2d-f8e03355d424)

Baseline and checked current main: `d3920a285f3755a8324998775deb131747e959f5`. This is a build plan, not approval to implement it.

## Contracts

- Add `presentation?: "workspace" | "reader"` to `ExplorEda`; use `"notebook" | "reader"` for `ExplorEdaNotebook`.
- Pass an internal `edit | read | locked` value through existing panels. Existing `readOnly` retains its stronger lock.
- Reading permits selection, clear, filters, and traces. Gate all authoring handlers, shortcuts, context menus, and settings actions.
- Keep one chart instance and the existing provider. Navigation and evidence search remain temporary component state.
- Keep analytical changes in `onStateChange`. The host chooses session persistence. Reader interactions never rewrite notebook source through `onTextChange`.
- Keep authored chart conditions visible. Reset restores opening analytical settings, including those conditions.
- Derive counts from plans and positive chart `liveItems`. In linked mode, `getChartFilteredRowIds` includes owner selection and cannot supply eligibility.
- Notebook chart selections remain local. Chartless findings start from all source rows and apply their own predicates.
- Keep entity counts labeled as entities. Display-only record labels must not change `entityField` or measure meaning.
- Use source order for notebooks and DOM order for readers. Preserve all saved desktop rectangles.

## M1: Read existing saved workspaces

Add direct `components/reader/AnalysisReader.tsx`, `readerOrder.ts`, `ReaderScope.tsx`, and `reader.css`. Wire presentation under the existing provider in `components/ExplorEda.tsx`. Paths in this plan are under `packages/explorEDA/src/` unless stated otherwise.

Extend `GridChartPanel.tsx`, `PlotChartPanel.tsx`, `ChartTraceControl.tsx`, and `ChartTracePanel.tsx`. Show a visible header Records action. Reuse manual selection controls through `ActiveFilterStatus.tsx` and `LocalFilterStrip.tsx`. Inspect their edit actions before reuse. Gate title/axis/legend handlers and authoring shortcuts at their owners. A stable `useCallback` alone does not fix callbacks skipped by the panel memo comparator: use current refs or compare them explicitly.

Sort a copy by saved y, x, and original index. Render that sequence directly. Use one column at 390; pair only adjacent compact metrics when each fits. Extract shared notebook sizing only if required. Keep the current grid behavior intact.

Install the original twelve-order fixture through real factories or DSL. Its six-chart JSON is a specification, not importable saved settings. Register `narrow-order-reader` in demo `demos/examples.ts` and `coverage.ts`; pass presentation through `SavedViewsWorkspace.tsx`.

Tests: add order and reader tests, plus `apps/demo/e2e/narrow-reading.spec.ts`.

- Stored array: trend, rows, revenue, regions, channels, orders. DOM order: regions, orders, revenue, channels, trend, rows.
- Start with Active workspace filter: 12 source, 10 selected; revenue 1,900, eight valid inputs.
- Select East: four selected, Regions eligible ten; revenue 600, three valid inputs, one missing input.
- Add Web: selected O01/O03; Regions eligible five, Channels eligible four. Clear Web: four selected again.
- Verify authoring keys and context menus cannot change settings. Verify supported selection and Records work.
- After mount settles, navigation and width changes add zero save callbacks or geometry changes. Verify valid empty data separately from host load failures.

Docs: add demo `docs/pages/reader.mdx`, covering reading, scope, and interaction limits. Register its catalogue entry and targets. Add the runnable order reader in the same milestone. Run fixture coverage and dashboard-text tests immediately.

Main risk: hidden editing handlers or an incorrect eligibility denominator.

## M2: Check complete evidence and return

Extend the existing expanded-panel and trace paths. Add small `ReaderEvidence.tsx`, `readerReturn.ts`, and record-detail helpers only where existing primitives need them. Preserve a logical trace target through remounts; re-resolve after registration. Do not depend on a React-generated owner ID surviving remount.

Extend `AggregateContributorTable` in `GroupedAggregateInspector.tsx`. It already pages all contributors at 50 per page. Add local search, sort, included/excluded views, display-only record labels, and full-row detail. Keep `ChartDataPreview` labeled as a limited preview; its 100-row cap remains distinct.

At narrow widths, use the existing modal primitive for a full-width evidence surface. Keep controls outside table overflow. Capture the actual host scroll root and invoker. On close, restore offsets and connected focus. On sheet change, focus the destination instead. Close stale evidence on revision change with a short status message.

Tests:

- East average: O01–O04, three used, one missing, 600 / 3 = 200.
- East with a chart-local Web condition: O01/O03, 400 / 2 = 200. The same number must retain different records.
- Evidence search O03 after linked East+Web: one of two shown; global selected stays two.
- Values 1–101: sum 5,151, average 51, all 101 contributors reachable as 50/50/1 pages.
- Normal return preserves focus and scroll within one CSS pixel when geometry is unchanged. Removal uses a connected fallback.
- Reversed data invalidates old evidence. Fresh O01 is index11 and O03 index9.
- Check metric, row, scatter, facet, and title targets through focus transitions. Keep one panel per chart ID.

Docs: add exact records, exclusions, and return to `reader.mdx`. Extend the order reader with the two average states and a bounded long-evidence example.

Main risk: stale trace identity or a capped preview presented as complete inputs.

## M3: Read native notebooks and live narrow examples

Add presentation in `notebook/ExplorEdaNotebook.tsx`. Keep native segment order at every width, existing sheet props, and one local-selection provider. Extend `NotebookProse.tsx`, `NotebookFindings.tsx`, and notebook CSS with shared evidence presentation. Gate source writeback and source editing explicitly.

Frozen output currently has pointer blocking in CSS. Apply keyboard locking while keeping diagnostics readable. Preserve focused prose nodes when numeric tokens update.

Add a dedicated live-reader option through demo `docs/live/LiveExample.tsx`, its fetch gate, and `live/examples.ts`. Keep unrelated screenshot fallbacks. Add `NarrowReadingExample.tsx` using shared fixtures.

Tests:

- Compile the original notebook. Expect two deliberate `warning/no-rows` diagnostics for Wholesale. Do not require a clean diagnostic list.
- Initial findings: 10/10, mean237.5, sum1,900, Web-minus-Store −75, chartless count12.
- East: 4/10, mean200, sum600, difference0. Its records remain O01–O04.
- Select Web on the other sheet: Channels5/10, mean200; Regions remains4/10 after return.
- Add workspace West: Regions0/3, Channels2/3, chartless count12.
- Verify zero, invalid, empty, unknown finding, outside-share, and empty-denominator states through the existing evaluator.
- Selection produces no `onTextChange`. Evidence/sheet navigation produces no extra analytical callback.
- Test finding-link return and deliberate sheet change separately. Test real reader controls in narrow docs, rather than accepting a screenshot.

Docs: update `notebooks.mdx` for reading, local selections, claim scope, and evidence return. Add runnable `narrow-notebook-reader` and paired narrow-live docs steps.

Main risk: accidental global selection, source rewrite, or fixed prose presented as a current conclusion. Chartless claims recompute on data replacement; they are not historical snapshots.

## M4: Author and save reading groups

Add optional `reading: { version: 1, groups: [{ id, title?, chartIds }] }`. Use existing chart IDs. Add a small desktop order editor and keyboard move controls through `WorkspaceSettingsDrawer.tsx`. Inspect its entry point before editing.

Update `SavedDataStructure.ts`, provider initialization/reset/restore/save/fingerprints, and `saveDataUtils.ts`. Validate the new optional property explicitly: the current validator does not reject arbitrary unknown optional keys. Unknown metadata surviving parse does not establish persistence; provider serialization lists fields explicitly.

Use first chart occurrence, diagnose duplicates, retain unavailable slots for deleted references, omit empty groups, and append unlisted live charts in fallback order. Do not apply workspace groups to notebook source order. Check Dashboard-text and folder export paths before promising group portability; either preserve metadata or explicitly report its omission.

Tests: exact authored order, unchanged rectangles, legacy fallback, group save/restore, invalid shapes/version/IDs, duplicate references, missing references, and one history step per committed edit. Width previews create no history or save events.

Docs: extend `reader.mdx` for authoring, previews, and export support. Extend the runnable order example with both supplied arrangements.

Main risk: dropped metadata or an inaccessible chart after resolution.

## Release checks

Run targeted library tests and types during each milestone. Run demo fixture coverage and dashboard-text checks after example registration. Run docs checks, then browser tasks at 1280, 783, and 390. Include a 783-wide embed in a 1280 viewport. Add 320-equivalent reflow/zoom checks before claiming accessibility support.

Assert exact record keys, DOM order, settings deltas, focus, and actual scroll offsets. Test touch, keyboard, long titles, source notes, and both themes. Keep table overflow local. Screenshots alone do not pass interaction checks.

Run `pnpm check` once for each implementation PR. Add a minor changeset and attach implemented UI screenshots. Do not run the downloaded verifier programs. The originals' scratch paths and suggested commands are historical proposal text.

## Current proof and limits

A locally authored temporary probe checked the native notebook compiler, finding evaluator, actual CrossfilterWrapper, and pure layout function. All18 probe tests and14 existing tests passed. The initial probe wrongly required no diagnostics; it was corrected to expect the fixture's two warnings. The probe remains in ignored `tmp/`.

The probe checked all15 supplied arithmetic populations and actual linked eligibility. It checked local notebook findings under multiple owner selections and a workspace filter. It does not prove provider callbacks, rendered sheets, record paging, focus, touch, performance, or browser acceptance. The TypeScript companion is a proposal and was not typechecked here.
