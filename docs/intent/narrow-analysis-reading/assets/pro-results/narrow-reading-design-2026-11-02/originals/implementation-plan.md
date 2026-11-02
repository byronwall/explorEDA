# Implementation plan: narrow analytical reading

Build an opt-in ordered analysis reader over the existing explorEDA chart panels, with explicit population summaries, discoverable header tracing, and a focused evidence view that returns to the original sentence or chart. Ship workspace reading first, then complete evidence, native notebook reading, and desktop-authored groups. Keep the current workspace default, existing analytical state and trace plans, and all saved desktop geometry. Reading must work without a second renderer, new selection graph, recovery engine, or generated conclusions.

**Baseline:** `d3920a285f3755a8324998775deb131747e959f5`. **Mode:** Design; Codex implements and validates. **Date:** 2 November 2026. Stable decisions: [recommendations.md](recommendations.md), NAR-01–NAR-20. Detailed rationale, primary references, and repository evidence: [report.md](report.md). The full type-only proposal is [reader-contracts.ts](reader-contracts.ts).

## 1. Implementation contract and sequencing

| Milestone | Independently useful outcome | Main risk |
| --- | --- | --- |
| M1 | Existing saved workspaces become ordered, interactive readers with truthful scope and a visible Records route. | An editing shortcut remains active, or the owner’s selected rows are mislabeled as eligible. |
| M2 | Readers can examine complete evidence, page/search its records, and return with focus, scroll, and selection intact. | A limited preview is mistaken for complete evidence, or a focus transition loses trace identity. |
| M3 | Native multi-sheet notebooks preserve authored claims, source order, local selections, and finding evidence at narrow widths. | Reader interaction rewrites notebook text or combines unrelated chart selections. |
| M4 | Desktop authors can save small reading groups and preview widths without changing their existing canvas. | Serialization drops metadata or a missing reference makes live charts disappear. |

Each milestone ships its documentation, runnable example, tests, and normal package changeset together. The milestones depend on earlier increments, not later ones: M1 needs no saved reading metadata; M2 needs no notebook changes; M3 needs no group editor. No outside-demand study is a prerequisite.

### Nonnegotiable boundaries

- Add `presentation?: "workspace" | "reader"` to `ExplorEda`; default remains workspace. Add `presentation?: "notebook" | "reader"` to `ExplorEdaNotebook`; default remains its existing notebook presentation.
- Keep `readOnly` stronger than reader presentation. Its existing locked/inert behavior is not the mechanism for permitting reader selection and tracing.
- Keep `onStateChange` for analytical changes. The host chooses whether a reading session is persisted. Evidence paging, navigation, focus, width, and scroll do not become saved settings or undo steps.
- In notebook reader presentation, selection changes must not invoke `onTextChange` to rewrite source, even when the host supplies that callback.
- Preserve one real panel per chart. Reuse `GridChartPanel`, `PlotChartPanel`, current renderers, provider, and trace plans. Do not introduce mark-level Inspect buttons.
- The host owns loading and fetch-error presentation. A supplied `data=[]` is a valid empty dataset, not evidence that a source failed; do not infer a new source-status contract from it.
- Compare semantic settings after initial rendering has stabilized; ignore only generated `metadata.modifiedAt`. Do not disguise reader-induced saves as existing render-time normalization.

Paths below identify existing files unless expressly marked **Proposed new**. Files named by the agent guide but not included in the packet require checkout inspection before editing; they are integration targets, not claims of complete source review.

## 2. Fixture installation and exact starting state

Use the complete companions, not newly invented sample totals:

- [orders.json](fixtures/orders.json): twelve synthetic orders, one row per order; `revenue` in USD. O04 is missing, O08 contains `bad`, and O07 is a valid zero.
- [six-chart-order.json](fixtures/six-chart-order.json): exact rectangles, scrambled saved array, intended fallback/group order, an unrestricted average-evidence variation, and a separate local-filter variation. It is a design specification, **not** importable `SavedDataStructure` JSON. Build real chart settings using existing factories or the baseline DSL.
- [notebook.eda.md](fixtures/notebook.eda.md): two sheets, fixed-scope author claim, owner-bound findings, comparison operands, and source notes.
- [expected.json](fixtures/expected.json): fifteen exact populations, candidate/included/excluded keys, means, shares, differences, and state-transition expectations.

**Proposed new demo files:** `apps/demo/public/datasets/narrow-reading-orders.json` and `apps/demo/src/demos/narrowReading.ts`. The latter builds the six actual charts and exports reusable dashboard/notebook fixture inputs; it does not implement a second chart schema. Register the proposed example ID `narrow-order-reader` in existing `apps/demo/src/demos/examples.ts` and `apps/demo/src/demos/coverage.ts`. Extend `ExampleData` only as needed to request reader presentation. Pass that flag through the existing saved-view mounting seam; `apps/demo/src/SavedViewsWorkspace.tsx` is identified in the agent guide and must be inspected at integration. Do not assume the registry already supports this flag.

Exact initial chart order is stored as `trend, rows, revenue, regions, channels, orders`. Reader fallback order must be **`regions, orders, revenue, channels, trend, rows`**. Both orders deliberately differ. Preserve the six fixture rectangles byte-for-byte through reading and width changes.

The linked dashboard starts with workspace `active=true`: **12 source, 10 selected, revenue 1,900 from 8 valid inputs, mean 237.5**. The notebook instead uses chart-local `where.active=true` on its two charts and has no initial workspace filter. This distinction is essential to the tests.

## 3. M1 — ordered workspace reader, interaction policy, and scope

**User outcome:** open an existing saved analysis at 390px, understand its population, select East, and reach the existing trace browser without authoring controls. This is a releasable feature before full-screen evidence or saved groups exist. Implements NAR-01–04, NAR-07, NAR-10–12, and the first NAR-16 checks.

### Code scope

- Existing `packages/explorEDA/src/components/ExplorEda.tsx`: expose presentation and select the reader beneath the same `DataLayerProvider`; preserve `getSettings`, host slots, callbacks, and readOnly precedence.
- **Proposed new** `packages/explorEDA/src/components/reader/AnalysisReader.tsx`, `packages/explorEDA/src/components/reader/readerOrder.ts`, `packages/explorEDA/src/components/reader/ReaderScope.tsx`, and `packages/explorEDA/src/components/reader/reader.css`: direct document layout, stable fallback ordering, scope projection, and responsive presentation. Keep per-chart subscriptions narrow.
- Existing `packages/explorEDA/src/components/GridChartPanel.tsx` and `packages/explorEDA/src/components/PlotChartPanel.tsx`: add a value-valued internal `edit | read | locked` policy; retain existing chart renderer and semantic title/summary helpers. The memo comparator skips function identities, so navigation callbacks must read current refs or be explicitly compared. A dependency-changing callback alone does not solve stale captures.
- Existing `packages/explorEDA/src/components/charts/InPlace/useTitleEditing.tsx`, `packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx`, `packages/explorEDA/src/components/charts/AxisFieldActions.tsx`, and `packages/explorEDA/src/components/charts/ColorLegend/ChartColorLegend.tsx`: inspect the imported handler seams and gate authoring. Gate settings/context-menu/keyboard paths as well as icons; obey React hook ordering.
- Existing `packages/explorEDA/src/components/charts/ChartTraceControl.tsx` and `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx`: expose a reader-specific visible **Records** action and ordinary target browsing. Keep normal mark selection, Alt-click, and Alt-Enter semantics.
- Existing `packages/explorEDA/src/components/ActiveFilterStatus.tsx` and `packages/explorEDA/src/components/LocalFilterStrip.tsx`: reuse ownership labels and filter controls without exposing chart-local population editing. Inspect the shared manual filter controls before extracting a new widget.

If shared content-based sizing is needed, extract existing `chartHeight`/`facetHeight` logic from `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx` into **Proposed new** `packages/explorEDA/src/components/reader/readerSizing.ts`; do not copy a second sizing algorithm. Keep `packages/explorEDA/src/components/ChartGridLayout.tsx` and its legacy geometry behavior unchanged.

### Behavior to implement

Render the fallback order directly in the DOM. At 390 use one column; at 783 use full-width charts, optionally pairing adjacent compact metrics with sufficient room; at 1280 use a bounded reading document. No masonry, CSS-only reordered focus sequence, or automatic omission of charts.

Derive dashboard eligible IDs from positive entries in the chart’s `liveItems`, whose own dimension is excluded and local population already applied. Intersect with its owner selection for selected IDs. `CrossfilterWrapper.getChartFilteredRowIds()` includes all filters and must not be renamed “eligible” in linked mode. Counts are records unless a plan explicitly names entities. Missing numeric inputs remain candidate records; unavailable summaries never become zero.

Permit existing mark/manual selection, clear-owner selection, and workspace filter controls. Keep authored `where` restrictions visible and immutable in reader mode. Reset returns the analytical interaction state captured on reader entry; it does not erase authored restrictions or change geometry. Titles/source notes wrap, source labels remain readable, and all primary actions have accessible names.

### Tests and exact expectations

**Proposed new:** `packages/explorEDA/src/components/reader/readerOrder.test.ts`, `packages/explorEDA/src/components/reader/AnalysisReader.test.tsx`, and `apps/demo/e2e/narrow-reading.spec.ts`.

- Fallback DOM order equals the six IDs above at every width. Sorting a copy leaves the saved array and six rectangles unchanged; ties use original array index.
- Select East: workspace selected **4**, regions eligible **10**, regions selected **4**; channels eligible **4**; orders **4**; revenue **600**, valid **3**, excluded **1**.
- Add Web: selected keys **O01/O03**, global selected **2**; regions eligible **5**, channels eligible **4**, both selected **2**. Clearing Web returns global **4** while retaining East and `active=true`.
- Local-filter variant: only the revenue card becomes an average with `channel=Web`; after East, it has **2** candidates and average **200**, while global selected remains **4**.
- With keyboard and context-menu input, title F2/Enter, axis editing, role changes, S/configure, delete, duplicate, and creation cannot mutate authored settings. Selection and Records remain operable. `readOnly=true` retains the stronger lock.
- After stabilization, resize/navigation produces **0 additional `onStateChange` events** and no rectangle edits. Analytical selection still reports through the existing callback.
- Supply `data=[]` with declared fields: show zero source/selected records and the appropriate empty measure state, without a fabricated fetch-error message. Test host loading/error boundaries separately.

### Paired docs, example, and release gate

**Proposed new:** `apps/demo/src/docs/pages/reader.mdx`, sections “Read a saved analysis,” “What selected and eligible mean,” and “Reading versus editing.” Register the page in existing `apps/demo/src/docs/catalogue.ts` and coverage targets as appropriate. Update root `README.md` with the scoped reader support statement while retaining desktop authoring guidance.

The runnable `narrow-order-reader` example opens actual `ExplorEda presentation="reader"`, offers a disposable session/reset, and includes East/Web tasks. Its direct example route must work at narrow widths; M1 need not change the shared docs screenshot policy. Ship after the M1 task sequence passes all required widths. **Main risk:** an apparently harmless editing handler bypasses the policy, or incorrect eligibility gives a persuasive but false denominator.

## 4. M2 — complete evidence, focused panel, and reliable return

**User outcome:** follow the selected value to every input, distinguish contributors from exclusions, inspect longer evidence, and return without losing place or selection. Implements NAR-08–09, NAR-13–14, and further NAR-16 acceptance.

### Code scope

- Existing `packages/explorEDA/src/components/PlotChartPanel.tsx`: extend its `expanded ? DialogContent(panel) : panel` path under one `ChartTraceScope`. Reader focus defaults to evidence/data, not Settings.
- Existing `packages/explorEDA/src/components/charts/ChartTraceControl.tsx`, `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx`, and `packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx`: retain logical targets and revision invalidation; adapt presentation without adding a trace registry or duplicating a chart.
- Existing `packages/explorEDA/src/components/charts/MetricCard/MetricCardTraceBody.tsx` and `packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.tsx::AggregateContributorTable`: reuse complete contributor records and its existing **50-row pager**. Extend local search/sort and All/Included/Excluded views.
- Existing `packages/explorEDA/src/components/ChartDataPreview.tsx`: retain its clearly limited preview. Its **first-100** cap, aggregate-group path, and `fill` sizing do not constitute complete evidence.
- **Proposed new:** `packages/explorEDA/src/components/reader/ReaderEvidence.tsx`, `packages/explorEDA/src/components/reader/readerReturn.ts`, and `packages/explorEDA/src/components/reader/ReaderRecordDetails.tsx`: small adaptive surface/return helpers and display-only full-record detail keyed by current `sourceId`. Reuse field formatters and existing UI primitives.

Do not use `entityField` merely to show `order_id`: that changes the measure. Add an optional display-field choice with source-row-index fallback. Exact IDs originate from the current trace/finding plan; a global Rows drawer is not an interchangeable evidence dataset.

### Behavior to implement

Keep compact nonmodal traces where they fit. At 390, use a full-width modal evidence sheet with Back/Close, scope, search, and paging outside the horizontally scrolling table. Use one vertical scroll owner. At wider widths, show the same chart beside or above evidence where legible.

Capture invoker and actual host scroll root before opening. Focus the structured evidence heading; Escape closes the topmost layer. On normal close, restore the root’s offsets, then focus the connected invoker with `preventScroll`; fall back to chart, group, then sheet heading. A deliberate sheet change is an exception: retain the outgoing offset for a later revisit, but focus the new active tab/heading and use its reading position; never jump back to an outgoing origin. Respect nested portals/focus traps and reserve space for sticky controls.

If focus promotion remounts trace-source registrations, carry the logical chart/object intent and re-resolve it afterward. Never trust an old React-generated owner ID after remount. A scope/data revision change closes stale evidence or returns to its object browser with a short announcement; it must not silently replace rows under an old number.

### Tests and exact expectations

**Proposed new:** `packages/explorEDA/src/components/reader/ReaderEvidence.test.tsx`, `packages/explorEDA/src/components/charts/BarChart/GroupedAggregateInspector.reader.test.tsx`; extend the proposed browser suite.

- East sum evidence contains **O01–O04**, with O01/O02/O03 included, O04 missing/excluded, and total **600**. For the separate `averageEvidenceVariant`, change only the revenue card's aggregation to average and give it no local channel restriction: East evidence explains **600 ÷ 3 = 200** while retaining four candidate records. Do not substitute `localFilterVariant`, whose Web restriction produces **O01/O03**, **400 ÷ 2 = 200**. The identical displayed average must not conceal different membership.
- After dashboard East+Web, search evidence for O03: **1 of 2** shown, global selected still **2**. Sorting/paging/search leaves chart filters, `rowsSettings`, findings, geometry, and callbacks unchanged.
- Construct a test-only 101-contributor metric over numeric values **1 through 101**: sum **5,151**, average **51**, included **101**, excluded **0**. All records are reachable as pages **50 / 50 / 1**; page 3 exposes contributor 101. Search for that exact record yields one row and resets/clamps the page without altering the metric.
- Open/close from Records using keyboard and touch. Normal return restores the same focused control and scroll offset, allowing at most **1 CSS pixel** for rounding when document geometry has not changed. Finding-link integration follows in M3.
- Replace data with a reversed new array: close stale evidence; freshly resolved O01 is source index **11**, O03 index **9**. Do not reuse old indices 0/2 under their labels.
- Confirm one rendered chart panel per ID before, during, and after focus. Verify a metric, row target, scatter target, facet target, and title target can re-resolve or show an explicit unavailable state.
- Remove the origin while evidence is open: focus lands on the first connected logical fallback, never the page body or a detached element.

### Paired docs, example, and release gate

Extend `reader.mdx` with “Check exact records,” “Candidates and used inputs,” and “Return from evidence.” Extend the runnable order reader with East-average and 101-contributor test/demo states; the production-facing fixture remains the understandable twelve orders. Preserve the preview’s explicit first-100 label.

Ship when complete record access, local filtering, revision closure, and actual focus return pass. **Main risk:** a preview or changed trace registration silently supplies the wrong rows. Table density is secondary to membership correctness.

## 5. M3 — native notebook reader, sheets, and live narrow docs

**User outcome:** read a two-sheet notebook, distinguish an authored claim from current findings, follow supporting records, and revisit the first sheet without changing its local selection. Implements NAR-06, remaining NAR-10–12, NAR-15, and notebook NAR-16 checks.

### Code scope

- Existing `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx`: add reader presentation; use native prose/block sequence at every width, even when legacy `layout="sections"` is requested. Keep one provider with `localSelections` and existing sheet props. Reader mode suppresses source editing/writeback.
- Existing `packages/explorEDA/src/components/notebook/NotebookProse.tsx`, `packages/explorEDA/src/components/notebook/NotebookFindings.tsx`, and `packages/explorEDA/src/components/notebook/notebook.css`: preserve token updates without replacing focused paragraphs; adapt finding evidence to M2; retain source notes and complete accessible chart names.
- Existing `packages/explorEDA/src/lib/notebook/findings.ts`: reuse evaluator and states. No new finding language or selection graph. Use the provider’s calculation-aware path; `evaluateNotebookFindings` is not a universal runtime evaluator.
- Existing `apps/demo/src/docs/live/LiveExample.tsx`, `apps/demo/src/docs/live/NotebookFindingsExample.tsx`, and `apps/demo/src/docs/live/examples.ts`: add per-example live-reader opt-in, including the data-fetch gate and reset state. Unrelated workspace examples retain screenshots below `LIVE_MIN_WIDTH`.
- **Proposed new:** `apps/demo/src/docs/live/NarrowReadingExample.tsx` for the dedicated reader fixtures; reuse shared fixture exports rather than duplicating data.

Keep SheetTabs’ existing tab/panel relationships and keyboard movement. Close outgoing evidence before sheet content unmounts. Store revisit positions only transiently; tab-arrow navigation keeps focus on the chosen tab. Frozen-block baseline CSS provides opacity and `pointer-events:none`, not keyboard locking: explicitly add inert/locked-handler behavior in reader presentation while keeping diagnostics readable.

### Tests and exact expectations

**Proposed new:** `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.reader.test.tsx`, `packages/explorEDA/src/lib/notebook/findings.reader.test.ts`; extend the browser suite and existing docs checks.

- Compile the supplied native notebook against real baseline parser/factories. Initial Regions: **10/10**, average **237.50**, sum **1,900.00**, share **100.0%**, chartless all **12**; Web-minus-Store difference **−75.00**.
- Select East: **4/10**, average **200.00**, sum **600.00**, share **40.0%**, difference **0.00**. Comparison evidence separates Web **O01/O03** from Store **O02/O04**, with O04 excluded.
- Switch sheets and select Web: channel **5/10**, average **200.00**. Return to Regions: still **4/10**, average **200.00**. Never intersect these into two notebook-selected rows.
- Add workspace Region=West while those owner selections remain: Regions selected **0**, eligible **3**, average **no rows**; Channels selected **2**, eligible **3**; chartless all remains **12**.
- The authored East claim remains supported by **O01–O04 / O01–O10**, independently of live selections. Source note and exact denominator links remain adjacent in source order. This is selection-stable scope, not a historical snapshot: replacing source data recomputes chartless findings. The supplied example’s data is immutable; hosts publishing fixed factual prose own its refresh policy.
- O07 numeric zero displays **0.00**; O08 displays **no valid values**; Wholesale count **0**, numeric **no rows**. Undeclared finding reports **unknown finding**. East-as-part/Web-as-whole rejects the share because **O02/O04** are outside; empty denominator is unavailable, not 0%.
- Reader selection emits analytical callbacks but **0 `onTextChange` calls**. Sheet/scroll/evidence navigation emits neither authoring writes nor analytical callback events by itself.
- Open the mean’s finding-record link with keyboard and touch, then close: preserve the focused link and its paragraph DOM, restore the actual scroll-root offset within **1 CSS pixel** when geometry is unchanged, and retain East selection.
- With outgoing evidence open, switch sheets: focus stays in the new sheet’s tab/heading and never restores the old evidence origin. A frozen chart cannot be activated through Tab/Enter; its diagnostic and last-valid label remain readable.
- At 783/390 viewports, opted-in examples contain real reader controls and pass their tasks. A nonopted workspace example still uses its screenshot; capture mode still works. Do not mistake a screenshot for successful interaction.

### Paired docs, example, and release gate

Update existing `apps/demo/src/docs/pages/notebooks.mdx`: “Read a notebook,” “Sheet selections,” “A claim’s scope,” and finding-record return. Add the supplied two-sheet notebook as the runnable `narrow-notebook-reader` example and a dedicated narrow-live docs specification in `live/examples.ts`; extend reader docs with the host callback policy.

Ship when the entire sheet journey, claim links, failure states, and narrow-live example pass. **Main risk:** a global count or accidental text writeback changes the document’s meaning while the UI appears correct.

## 6. M4 — saved groups and desktop reading preview

**User outcome:** a desktop author can make related charts read together and save that order, while reopening the workspace preserves the original canvas. Implements NAR-05 and completes NAR-16.

### Code scope

- Existing `packages/explorEDA/src/types/SavedDataStructure.ts`, `packages/explorEDA/src/providers/DataLayerProvider.tsx`, and `packages/explorEDA/src/utils/saveDataUtils.ts`: add optional `reading`; update initialization, reset, restore, save, and validation paths together. Preserve stable optional-field/fingerprint shape.
- **Proposed new:** `packages/explorEDA/src/types/ReadingTypes.ts` for the minimal saved type and `packages/explorEDA/src/components/reader/ReadingOrderEditor.tsx` for desktop group/order controls. Extend the proposed `packages/explorEDA/src/components/reader/readerOrder.ts` to resolve groups and diagnostics.
- Existing `packages/explorEDA/src/components/WorkspaceSettingsDrawer.tsx`: inspect its current tab/action seam and add the compact authoring entry. Reuse existing source/settings state; do not add another canvas.
- Existing public exports in `packages/explorEDA/src/components/ExplorEda.tsx`: expose the final type. Inspect Dashboard-text export/import handling before documenting compatibility; JSON round-trip is required, while unsupported group export must be reported explicitly rather than silently promised.

Save exactly `reading: { version: 1, groups: [{ id, title?, chartIds }] }`. Existing Markdown charts may be group members; no new prose format or copied chart settings. Move-up/down and group assignment are keyboard-operable. Preview containers offer 1280/783/390 modes without changing saved coordinates or creating authoring history entries.

### Tests and exact expectations

**Proposed new:** `packages/explorEDA/src/components/reader/ReadingOrderEditor.test.tsx` and `packages/explorEDA/src/utils/saveDataUtils.reading.test.ts`; extend order and browser tests.

- Primary groups yield **regions, orders, revenue, channels, trend, rows**. The authored variant yields **orders, revenue, regions, channels, trend, rows** at all widths.
- Omitted metadata preserves legacy validity and derives fallback without saving it. Save/restore preserves version1 metadata and every original rectangle; repeated save/restore stabilizes apart from `modifiedAt`.
- Duplicate chart references render the chart once and produce an author warning. Missing references keep unavailable-evidence slots. `chartIds: []` groups are omitted; groups containing only missing evidence remain. Unlisted live charts append in fallback order.
- Malformed metadata, unsupported version, empty IDs, and duplicate group IDs fail normal validation. Do not claim an unimplemented tolerant import. Semantically stale chart references are resolved, not treated as malformed JSON.
- One deliberate order edit produces one saved-state/history step; width previews produce **0**. Returning to workspace restores exactly the original six canvas rectangles.

### Paired docs, example, and release gate

Extend `reader.mdx` with “Author reading groups,” “Preview widths,” and JSON compatibility. Extend `narrow-order-reader` with the two supplied group arrangements and desktop preview controls. Document that old package versions may discard unknown reading metadata when saving; do not bump the whole analysis format solely for this optional field.

Ship after round-trip and cross-width acceptance. **Main risk:** explicit provider serialization omits metadata or fallback resolution loses charts. Keep diagnostics concrete and avoid a generic migration framework.

## 7. Cross-width black-box acceptance

Run these against the actual implementation, not the screen mockup. Use light and dark themes, long titles/source notes, keyboard, and real touch input where available; browser touch emulation is additional evidence, not a substitute for all device behavior.

| Width case | Required observable outcome | Distinct check |
| --- | --- | --- |
| 1280 viewport and reader container | Correct document order, visible source/context, working side-by-side focused evidence when it fits. | Existing workspace still restores saved geometry. |
| 1280 viewport, 783 container | Reader follows container dimensions; all scope/actions remain usable. | Docs may be live because viewport exceeds 1024. |
| 783 viewport/container | Full-width sequence; only eligible compact cards pair; complete evidence return. | Legacy grid’s two-column rule is separate. |
| 390 viewport/container | One column, readable titles/notes, reachable Records/Back, no horizontal page overflow. | Table may overflow only within its labeled region. |
| 320 CSS-pixel-equivalent width | Same core reading/evidence tasks under reflow and enlarged text. | Include 1280-at-400%-zoom where supported; 390 alone proves no conformance claim. |

At each size, have the tester identify the source note; report **4 selected / 10 eligible / 12 source** after East; explain why revenue uses three of four rows; open the exact inputs; close and continue reading. Then perform East+Web dashboard counts, local evidence search, and the two-sheet notebook journey. Assert DOM order, active element, current record keys, settings delta, and actual scroll-root offsets as well as screenshots. Verify sticky scope and the virtual keyboard do not conceal the focused action.

## 8. Codex run sheet and release discipline

The following is a **proposed run sheet, not an execution log**. Run from a full checkout after adding the named tests and example routes. Keep the supplied companion folder at an explicitly chosen absolute path; the assignment below names this session’s delivered files. Use repository Node/pnpm requirements and shared test time limits. Run the broad gate once from one worktree.

```bash
# Independent companions: these do not execute the product renderer.
reader_deliverables=/workspace/scratch/5f8853d70574/deliverables
node "$reader_deliverables/fixtures/verify-fixtures.mjs"
node "$reader_deliverables/fixtures/verify-layout.mjs" "$PWD/packages/explorEDA/src/components/chartGridPlacement.ts"

# Targeted product checks, after implementation creates these tests.
pnpm --filter exploreda exec vitest run src/components/reader
pnpm --filter exploreda exec vitest run src/components/charts/BarChart/GroupedAggregateInspector.reader.test.tsx
pnpm --filter exploreda exec vitest run src/components/notebook/ExplorEdaNotebook.reader.test.tsx src/lib/notebook/findings.reader.test.ts
pnpm --filter exploreda exec vitest run src/utils/saveDataUtils.reading.test.ts
pnpm --filter exploreda check-types
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts
pnpm --filter demo docs:check

# Real browser checks: use the repository server and pinned tooling.
pnpm dev:agent
pnpm shot /examples/narrow-order-reader --name narrow-reader
pnpm --filter demo build
pnpm --filter demo docs:verify
# Execute the new e2e/narrow-reading.spec.ts through the checkout's configured
# Playwright runner; confirm its config/route registration before invoking it.
# Add actual keyboard/touch/zoom tasks from section 7; shots alone do not pass.

# Once per completed package milestone, with a milestone-specific summary.
pnpm changeset:add minor "Read saved analyses in an ordered presentation and reach their supporting records."
pnpm check
pnpm dev:agent --stop
```

Do not execute release/version/publish commands as part of this plan. Build library types before demo typechecking if public types change, as the agent guide requires. Keep screenshots under the repository’s `tmp/`; they demonstrate implemented outcomes only after the actual tasks run.

## 9. Access, performed checks, files, and open questions

**Access sufficient.** The full attached prompt and all 28 complete baseline files were read; the complete list is in [report.md, closing handoff](report.md#15-closing-handoff). Eleven exact-ref supplementary files resolve panel policy, provider persistence, crossfilter eligibility, metric planning, docs boundaries, and contributor-table reuse. No moving-main behavior is assumed.

**Performed for this mission:** original pure placement functions executed; independent twelve-order oracle checked fifteen populations, exact memberships, exclusions, arithmetic, comparisons, and reversed-array identity; source/primary-reference review; type-only contract accepted by Node type stripping. These checks do not establish product integration.

**Still proposed/unperformed:** strict TypeScript checking, native notebook compilation, actual shipped reducer/renderer execution on this fixture, package tests, Playwright, real keyboard/touch/screen-reader journeys, and every cross-width acceptance gate above. No feature implementation or repository changes are delivered.

Complete downloads: [report.md](report.md), [implementation-plan.md](implementation-plan.md), [recommendations.md](recommendations.md), [reader-contracts.ts](reader-contracts.ts), [reader-and-evidence.svg](reader-and-evidence.svg), [reader-and-evidence.png](reader-and-evidence.png), [orders.json](fixtures/orders.json), [expected.json](fixtures/expected.json), [notebook.eda.md](fixtures/notebook.eda.md), [six-chart-order.json](fixtures/six-chart-order.json), [verify-fixtures.mjs](fixtures/verify-fixtures.mjs), and [verify-layout.mjs](fixtures/verify-layout.mjs).

Remaining integration questions are bounded: select the existing manual-filter seam after checking its edit capabilities; verify logical target re-resolution for each supported renderer; choose a display-only record-label field; and determine explicit Dashboard-text behavior for reading groups. These choices do not block M1 and do not require a new research program. The complete contributor table and its 50-row paging are already identified, so that is no longer an open architectural question.
