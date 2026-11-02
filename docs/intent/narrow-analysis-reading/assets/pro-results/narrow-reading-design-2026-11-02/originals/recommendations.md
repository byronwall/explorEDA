# Recommendations: narrow analytical reading

Build an opt-in ordered analysis reader that reuses explorEDA's existing chart panels, preserves authored chart groups and notebook prose, keeps each population explicit, and opens exact supporting records in a focused evidence view with a reliable return. Keep the workspace as the existing default, leave saved desktop geometry untouched, and make reading an interactive capability distinct from both authoring and the existing locked `readOnly` mode. Ship this in four independently useful milestones without a second chart renderer, new selection graph, recovery engine, or automatic narrative generator.

**Baseline:** `d3920a285f3755a8324998775deb131747e959f5`, supplied complete-file packet. **Mode:** Design. **Date:** 2026-11-02. Dispositions below are proposals. Source inspection and independently executed fixture arithmetic support them; product rendering and browser acceptance remain Codex's work.

Repository shorthand: components are under `packages/explorEDA/src/components/`; notebook UI is in its `notebook/` directory and trace UI in `charts/trace/`. `findings.ts` means `packages/explorEDA/src/lib/notebook/findings.ts`; settings types are under `packages/explorEDA/src/types/`; documentation is under `apps/demo/src/docs/`.

## Decision register

### NAR-01 — Build: an explicit reader presentation

**Reason:** Narrow reading needs a stable explanation and evidence path, beyond geometric reflow.

Add `presentation="reader"` as an opt-in presentation of the existing analysis. Keep the workspace default. Reuse `GridChartPanel`/`PlotChartPanel` and their chart plans; change surrounding order, sizing, headings, and actions. An improved flowing grid remains the compatibility path, while focused evidence is a secondary excursion. Tableau's [Stories](https://help.tableau.com/current/pro/desktop/en-us/story_create.htm) show the useful distinction between authored order and underlying views that remain connected to their originals. **Milestone: M1.**

### NAR-02 — Build: explicit reading interaction gates

**Reason:** Disabling layout manipulation does not establish a reading policy.

Permit supported selection, filter clearing, manual filter controls, tracing, and evidence navigation. Suppress chart creation, deletion, duplication, title/axis editing, configuration, and notebook text writeback. Do not reinterpret `readOnly`: it retains its existing locked meaning. Check every mutation path, including keyboard shortcuts and context menus, rather than only hiding buttons. `ChartGridLayout::isNarrow` disables dragging and resizing; `ExplorEdaProps::readOnly` is a separate embedding contract. **Milestone: M1.**

### NAR-03 — Build: an explicit population contract

**Reason:** A correct number is misleading when its denominator is unclear.

Show source total, chart-eligible population, current selected population, and numeric contributor count where relevant. Derive them from existing selection and metric plans. Name workspace filters, owner selections, and chart-local conditions separately. Eligible rows follow the existing workspace or notebook semantics; a chart's own selection is applied afterward. `NotebookFindings::useFindingResults` and `findings.ts::evaluateFinding` already distinguish these stages. Never substitute drawn-mark count for record count. **Milestone: M1.**

### NAR-04 — Build: deterministic DOM reading order

**Reason:** Visual flow, keyboard order, and assistive reading must agree.

Without authored groups, sort a copy of charts by saved `layout.y`, then `layout.x`, then original array index. Render that sequence in the DOM. Do not mutate the saved array or coordinates. The baseline `flowTwoColumns` sorts geometry but fills the shorter column; the phone branch of `ChartGridLayout` uses array index. The reader needs one explicit sequence. W3C [Technique C27](https://www.w3.org/WAI/WCAG22/Techniques/css/C27) supports matching visual and DOM order. **Milestone: M1.**

### NAR-05 — Build: small saved reading groups

**Reason:** Authors should declare related charts without maintaining another canvas.

Add optional `SavedReadingV1` metadata containing ordered `groups: { id; title?; chartIds }[]`. Reference existing chart IDs. Preserve all ungrouped charts in deterministic fallback order, validate references, and surface authoring problems without silently losing analysis content. Do not add per-device rectangles, copied chart settings, or a second prose/claim format. Older saves without the metadata keep working. Update save/restore validation and round-trip tests together. **Milestone: M4.**

### NAR-06 — Build: preserve notebook meaning and scope

**Reason:** Notebook sheets divide reading while chart selections remain local.

Use the notebook's native Markdown, `eda` blocks, headings, and finding definitions as the authored source. Preserve claim/evidence adjacency and sheet membership; never convert them into another narrative document model. `ExplorEdaNotebook` already keeps one provider with `localSelections` across sheets. A region selection of East must remain four records after Web is selected on another sheet. Chartless findings retain their existing all-source semantics, including ignoring workspace filters. **Milestone: M3.**

### NAR-07 — Build: a discoverable header trace route

**Reason:** Touch readers need exact records without an Alt key or precision gesture.

Make the existing header Records/Trace route visible and clearly named in reader mode. Preserve Alt-click and Alt-Enter as shortcuts. Expose `ChartTracePanel`'s browsable trace targets through ordinary buttons and keyboard navigation, with chart and object context in their names. Prefer browsing meaningful targets over asking someone to know a runtime source-row number. Keep the repository prohibition on mark-level Inspect buttons. **Milestone: M1.**

### NAR-08 — Build: focused evidence with complete return

**Reason:** Evidence checking should not lose the reader's place or current selection.

Use the existing expanded-panel path with one chart instance at a time, showing its evidence alongside or below it as space permits. Preserve the existing store; if promotion remounts trace registrations, re-resolve the logical chart/object target. Record origin focus and scroll position; close with Back/Close or Escape, restore focus without an unnecessary jump, and use a valid section fallback if the origin vanished. A deliberate sheet change instead focuses the destination tab/heading and retains the outgoing position only for a later revisit. Power BI's [phone focus mode](https://learn.microsoft.com/en-us/power-bi/explore-reports/mobile/mobile-apps-view-phone-report) provides a useful state-preserving precedent. **Milestone: M2.**

### NAR-09 — Build: candidate, contributor, and comparison evidence

**Reason:** Supporting records include excluded inputs and both sides of a comparison.

For the East fixture, show four candidate records O01–O04, three valid revenue contributors, O04's missing value, and the calculation 600 ÷ 3 = 200. Reuse metric trace bodies and plans. For shares and differences, retain separately labeled operands with their own scope and rows; do not merge them into an ambiguous table. `findings.ts::compareFindings` already preserves operands and rejects a part outside its whole. **Milestone: M2.**

### NAR-10 — Build: existing host state ownership

**Reason:** Reader navigation should not become a saved-layout edit or hidden persistence system.

Use the existing selection store and `onStateChange` contract for meaningful analytical changes. The host chooses whether to persist a reader session; provide a documented disposable-session example. Keep current evidence, focus, scroll, and section navigation ephemeral. Reader mode must not call `onTextChange` to save interactions into notebook source. `savedData` remains a restore input, not a controlled-value loop. The existing `getSettings` boundary remains useful. **Milestones: M1 and M3.**

### NAR-11 — Build: bounded filtering with visible ownership

**Reason:** Selection can aid reading only while its effects remain legible.

Support existing mark selection, clear-owner selection, and equivalent keyboard/touch filter controls. Keep authored chart-local conditions visible and distinguish them from reader selections. A linked dashboard may show a shared selection summary; a notebook must label chart-local scope. Table-local search changes the displayed evidence subset only: searching O03 among two supporting rows shows one of two and leaves the analytical selected count at two. **Milestones: M1–M3.**

### NAR-12 — Build: titles, source notes, and semantic descriptions

**Reason:** Resizing must preserve what a view means and where its data came from.

Retain complete accessible titles, field names, units, source notes, and comparison context. Provide wrapping or an explicit expansion for long visible content. Derive factual scope and measure descriptions from settings and plans; authors supply claims, qualifications, and source interpretation. Never infer a conclusion from pixels. Preserve notebook prose focus behavior from `NotebookProse`; suppressing a repeated visible title must not leave the chart unnamed. **Milestones: M1 and M3.**

### NAR-13 — Build: revision-bound evidence

**Reason:** Rows from an old population must not appear under a new value.

Retain `ChartTraceScope` and `NotebookFindingsProvider` revision checks. On changed inputs, close stale evidence, announce the change briefly, and restore focus to a connected origin or logical fallback. Data replacement invalidates runtime source-row IDs: reversing the fixture moves O01 from index 0 to 11. Business keys remain useful labels but do not imply a new persistent-selection identity system. Opening fresh evidence resolves the current revision. **Milestone: M2.**

### NAR-14 — Build: readable dense-record surfaces

**Reason:** Exact evidence needs usable tables, not shrinking columns until values disappear.

Keep the record identity and principal measure prominent. Extend `AggregateContributorTable` in `charts/BarChart/GroupedAggregateInspector.tsx`, which already pages the complete contributor list in sets of 50. `ChartDataPreview` caps its preview at 100 and cannot serve as complete evidence. Offer columns, sorting, local search, and visible shown/total counts while preserving the existing scope. Use native table semantics where possible, clear sortable-header states, and bounded local overflow. Titles, filters, and pagination must reflow even when the table requires horizontal scrolling. W3C's [table pattern](https://www.w3.org/WAI/ARIA/apg/patterns/table/) distinguishes a semantic table from a keyboard grid. **Milestone: M2.**

### NAR-15 — Build: genuinely interactive narrow examples

**Reason:** A screenshot cannot demonstrate selection, record access, or return behavior.

Add dedicated reader examples that remain live at narrow widths, with deterministic data and explicit tasks. Keep the existing docs screenshot policy for unrelated workspace examples. `LiveExample::useWideViewport` is a viewport fallback, distinct from the grid's container rule and notebook section layout. Update `notebooks.mdx` and the appropriate reader docs alongside each feature milestone; do not postpone example work to the end. **Milestone: M3; earlier milestone examples accompany M1/M2.**

### NAR-16 — Build: exact cross-width and accessibility acceptance

**Reason:** Layout intent needs observable product outcomes.

Test 1280, 783, and 390 CSS pixels with mouse, touch, and keyboard. Assert chart order, unchanged saved geometry, populations, exact record keys, focus/scroll return, and no page overflow. Add 320-equivalent reflow and zoom checks: 390 alone does not establish [WCAG reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html). Preserve compact controls with adequate hit areas and visible focus. Apply the [APG dialog lifecycle](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/) to modal evidence. **Milestones: each increment, completed in M4.**

### NAR-17 — Explore: richer semantic chart navigation

**Reason:** Hierarchical exploration can improve access beyond a summary and flat records.

Study an optional tree of chart, guides, categories, and records after the reader is useful. [Olli](https://vis.csail.mit.edu/pubs/olli/) demonstrates adapter-based keyboard navigation at different information levels. First reuse existing trace targets and semantic plans. Do not introduce Olli, a generic adapter layer, or a replacement renderer as an M1 dependency. Current integration cost and coverage require a separate technical experiment; this mission did not measure them.

### NAR-18 — Explore: a compact comparison strip

**Reason:** A focused view can hide the neighboring value the reader is comparing.

After ordinary authored groups and operand evidence work, test a small strip containing named compared values, units, and population labels. It must use the same derived results and explicitly distinguish mismatched scopes. It should not pin duplicate chart instances or create a new saved comparison engine. Keep ordinary sequential group reading as the first supported route. This exploration is optional and does not delay M1–M4.

### NAR-19 — Defer: portable evidence links and new analytical infrastructure

**Reason:** Cross-session identity and graph/recovery work would expand this bounded feature.

Defer links that promise to reopen exact records after arbitrary data refresh, new selection graphs, automatic empty-selection recovery, and notebook definition-navigation infrastructure. Runtime evidence can use existing revisions and IDs. Hosts may retain sheet location through the current callback, without a guarantee of portable row identity. The prompt's open research proposals are not shipped dependencies; this reader must stand on the supplied baseline.

### NAR-20 — Avoid: parallel rendering, generated claims, and phone authoring

**Reason:** These approaches multiply maintenance or weaken analytical accountability.

Avoid a second chart renderer, pixel-derived narrative, separate mobile chart copies, an independent phone composition canvas, and a full chart-authoring interface on phones. Avoid screenshot-only delivery as the reader contract and mark-level Inspect buttons. Keep React, TypeScript, existing semantic UI tokens, direct modules, and current state ownership. The feature should make the existing analysis understandable and inspectable, while desktop authoring remains the place to construct it.

## Shipping sequence

| Milestone | Independently useful outcome | Principal risk |
| --- | --- | --- |
| M1 | Ordered opt-in reader, explicit interaction policy, scope display, discoverable header tracing; paired docs and six-chart example. | Hidden edit paths or selection semantics accidentally change. |
| M2 | Focused evidence, dense records, candidate/contributor explanations, safe revision handling, and complete return; paired evidence example. | Duplicate chart mounting or stale records break exactness. |
| M3 | Notebook reader, sheets, preserved claims/source notes, scoped findings, and live narrow docs example. | A local selection is presented as global, or navigation rewrites authored text. |
| M4 | Desktop group authoring, saved metadata, cross-width preview, persistence validation, and complete acceptance coverage. | Metadata round-trips alter existing saves or leave charts inaccessible. |

## Access, validation, and unresolved decisions

The full attached mission and all 28 complete baseline files were read. Eleven additional files were retrieved at the exact baseline to resolve panel behavior, provider persistence, eligibility, metric plans, docs boundaries, and contributor-table reuse. Decisive supplied sources include grid placement and tests, `GridChartPanel`, `ExplorEda`, notebook components/CSS/findings, trace control/panel/scope, `SavedDataStructure`, docs examples, notebook documentation, demo registration, and the R063 candidate brief, together with the repository guidance and package files. Product behavior above is source-backed where named; proposed behavior is not presented as shipped.

The independent fixture oracle executed successfully against 12 synthetic orders and checked 15 populations, exact membership, contributor exclusions, totals, averages, shares, differences, and an array-reversal identity case. It does not import explorEDA. A separate script executed the original pure placement functions. The type-only contract was accepted by Node type stripping, and the screen proposal was rendered and visually inspected. No strict TypeScript check, production renderer, notebook compilation, package suite, real touch input, keyboard journey, assistive technology, or width acceptance was executed.

Companion deliverables: [report.md](report.md), [implementation-plan.md](implementation-plan.md), [reader-contracts.ts](reader-contracts.ts), [reader-and-evidence.svg](reader-and-evidence.svg), [reader-and-evidence.png](reader-and-evidence.png), [orders.json](fixtures/orders.json), [expected.json](fixtures/expected.json), [notebook.eda.md](fixtures/notebook.eda.md), [six-chart-order.json](fixtures/six-chart-order.json), [verify-fixtures.mjs](fixtures/verify-fixtures.mjs), and [verify-layout.mjs](fixtures/verify-layout.mjs). The report and plan resolve the exact component contracts and acceptance tasks; all fixture inputs are included rather than described as future work.

Open implementation questions are limited: which shared manual-filter seam can omit authoring actions; whether every supported renderer can re-resolve a logical trace target after focus promotion; which display-only record label to expose; and how Dashboard-text export/import should report unsupported reading-group metadata. The complete contributor table is identified; its key/details/search/sort extensions and paging need implementation checks. Session persistence remains the host's existing choice. These require checkout validation or host choice, not an outside-demand gate or a new research program.
