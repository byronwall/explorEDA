# Notebook definition navigation — milestone implementation plan

**Decision:** ship a compiler-backed definition inspector, source jumps with reliable return, precise reverse consumers, and a searchable notebook outline in four cumulative milestones. Keep React/TypeScript, pnpm, the constrained DSL and one client/server version. This is a proposed implementation plan against `d3920a285f3755a8324998775deb131747e959f5`; none of these feature changes was implemented in the research run.

Each milestone is useful independently and includes its documentation, runnable example and responsive keyboard verification. Accessibility is part of every shipped interaction; M4 is not a deferred accessibility phase. There is no dependency on live-findings research PR507, another unmerged research plan, an external demand study, a graph library, or a new execution engine.

## Integration rules

- Reuse `parseNotebook`, `parseDocument`, `compileDocument`, calculation semantics and typed chart/composition lowerers. Retain parsed source provenance while the compiler resolves names; do not parse formulas or Markdown a second way.
- Record declaration occurrences separately from effective bindings. Actual accepted settings determine what exists, including rejected duplicate calculations, shadowed aliases, ignored settings and partially retained composition parts.
- Separate source metadata from the currently displayed configuration. `ExplorEdaNotebook` permits local chart-setting changes without `onTextChange`; inspect supported live references from accepted DataLayer settings and mark their source origin as runtime-only when no authored occurrence matches. Do not claim the source graph always describes the current plot.
- Use revision-bound ranges and distinct identities for blocks, definitions, references and outputs. Never persist expression UUIDs, positional chart IDs, block ordinals, line numbers, sheet slugs or heading text as durable identity.
- Keep the existing calculation value trace and finding records popover intact. Definitions answer where a formula/configuration was authored and what refers to it; value traces answer how a selected value was computed.

## Runnable example used throughout

Add the proposed directory `apps/demo/src/demos/notebook-navigation/` with `NotebookNavigation.tsx`, `definition-navigation.eda.md` and `rows.json`. Register the example under the proposed id `notebook-definition-navigation`. These paths and the registration id are implementation destinations, not claims about existing files. Discover the actual demo registry/import convention in the checkout and wire the example there; the registry was not in the supplied packet.

Use the delivered six-block notebook unchanged as the initial example: Results contains `metric @net-total sum(net) where.Region=West` and `finding @west-net`; Definitions contains alias `revenue`, calculations `gross`, `net` and `unused`, then composition `@net-shape`. There are two sheets, two chained calculations and a first use before definition. Rows are `(Revenue, Cost, Region) = (100,40,West), (200,80,East), (150,60,West), (120,20,West)`. Gross is `[60,120,90,100]`, net is `[30,60,45,50]`, West sum is `125`, and all-row net sum is `185`.

Add development-only example controls as their milestones ship: source editable/read-only, column/sections layout, controlled host immediate/delayed/ignored sheet acknowledgment, invalid net with/without retained last-valid source, and the named identity mutations from the fixture pack. Keep these controls outside the notebook's product toolbar. The demo must expose all of the relevant behavior without requiring a backend or a new service.

## M1 — Authoritative metadata and output-to-definition peek

**Shipped capability:** a reader opens a chart's Definitions action, sees its actual measure/filter/encoding inputs, and follows a calculation or alias into a source excerpt without losing the reading position. Defines labels become actionable in chartless and mixed blocks. M1 adds no page jump and no misleading complete-consumer count.

### Source changes

Modify existing modules:

- `packages/explorEDA/src/lib/dsl/parse.ts`: retain item/reference intervals in the existing AST, including comma-list items whose decoded `DslItem.text` currently lacks individual spans. Capture ranges before lowerers consume or mutate positional arrays. Keep one-based diagnostic spans and add explicit UTF-16 half-open offsets for text selection.
- `packages/explorEDA/src/lib/dsl/compile.ts`: retain definition records at alias/calculation collection and field resolution sites. Emit attempted references separately, then commit effective occurrences only after setting rollback, chart validation and final `validateSavedData` acceptance. Instrument all standard chart field and filter roles through typed helpers; a regex over property names is insufficient.
- `packages/explorEDA/src/lib/calculations/parser/semantics.ts`: expose optional identifier occurrences from the existing parse result while preserving dependency deduplication, literal handling and branch semantics. Static dependencies include both conditional branches; this does not change evaluation.
- `packages/explorEDA/src/lib/notebook/compileNotebook.ts`: project compiler metadata through the existing block/source map. Store the exact source snapshot used, including a distinct last-valid snippet origin; appended synthetic stand-in lines never become current-file positions.
- `packages/explorEDA/src/components/notebook/ExplorEdaNotebook.tsx`: connect chart Definitions actions and complete Defines summaries, including mixed chart/definition blocks. Resolve current output fields from the accepted live chart settings already used by `NotebookBlockView`.

Add direct modules:

- `lib/notebook/navigation.ts`: public metadata types, canonical identity constructors within a revision, binding/occurrence index, and adjacency helpers. No singleton service or application registry.
- `components/notebook/NotebookDefinitionInspector.tsx`: a compact temporary surface with title/actions first, source state, Uses list and read-only excerpt. Keep chart actions outside plot gestures. Use the existing panel/popover components discovered in the checkout.

The compiler must return enough information to distinguish `current`, `last-valid` and `runtime-only` origins. M1 can show the exact last-valid text used for an effective output, but cannot offer a current-file destination derived from the old ordinal cache. A source edit closes or refreshes the peek against a new accepted revision. Runtime-only setting references can resolve to current definitions while the setting itself has no source location. If a live setting family is not yet indexed, say which references are unavailable; do not show a false empty dependency list.

### Necessary tests and acceptance

Extend `compileNotebook.test.ts` with one table-driven metadata test group: six-block aliases/calculation chain; first-use-before-definition; exact raw versus alias spellings; duplicate calculation exclusion; later-valid alias binding; invalid local filter removing the chart; ignored optional setting producing no effective edge; generated table columns with inferred rather than invented source ranges. Assert edges, origins and ranges, not just visible labels.

Add focused tests in `lib/notebook/navigation.test.ts` for typed standard-chart field adapters and final accepted-settings projection. Include a rolled-back field setting and a built-chart entry absent from final `settings.charts`; neither may appear as an active occurrence. In the canonical projection assert `Revenue → gross`, `Cost → gross` and `gross → net` (provider to consumer); net-total reads measure net and its eligible-population node, whose local-filter input is Region. The authored projection instead retains `Revenue → alias revenue → gross`. Keep those two projections explicit.

Extend `ExplorEdaNotebook.test.tsx` with one interaction flow: open Definitions without changing filters/scroll; follow `net` to `gross` to alias `revenue`; close and restore the invoking action; change a chart field without source writeback and verify that the inspector describes the live field with explicit runtime-only origin. Test mixed and definitions-only blocks in that flow.

Run real pointer/keyboard checks at 1280, 783 and 390px. The wide/intermediate inspector is temporary and does not resize charts. The narrow sheet protects focus and background scrolling; Escape closes it and restores the invoker. Labels and source snippets remain readable with long names. No new action uses Alt-click, plain plot clicks or native `title` tooltips.

**Docs and example:** add “Find a plotted field's definition” to `apps/demo/src/docs/pages/notebooks.mdx`; add the runnable six-block example and a short task: net-total → net → gross → Revenue. Explain authored versus live setting state without exposing implementation terminology in ordinary product copy.

**Main risk:** incomplete extraction presented as complete lineage. Acceptance requires a standard-chart role coverage table tied to the typed adapters and honest unindexed composition state until M3. Do not postpone local filter roles.

## M2 — Keyed source identity, source jumps and reliable return

**Shipped capability:** Go to source reveals and focuses the correct readable declaration across sheets; a separate Edit source action selects its range in the actual textarea when editing is available. Return restores the reader's logical origin. The identity and last-valid fallback migration ship together.

### Source changes

- Extend `parseNotebook.ts` to recognize optional `id=` in EDA fence information while preserving existing fence behavior. Enforce a documented small identifier grammar and uniqueness within the notebook. Two fences with the same authored id are both ineligible for that stable identity; show a diagnostic and do not choose one by order.
- Add `lib/notebook/memory.ts` containing `NotebookMemory` and `createNotebookMemory(documentKey)`. Replace the ordinal `lastValid` API in one migration with `memory?: MutableRefObject<NotebookMemory>`. Retain stable block keys, source snapshots and original declaration ranges together. Do not add an old/new compatibility layer; update all actual call sites after searching the checkout.
- Reuse a unique authored fence id; otherwise preserve a session key only through an acknowledged edit transaction or uniquely matching unchanged block text. Ambiguous duplicated text receives new keys and loses old fallback. Unknown external rename is removal plus addition. A changed `documentKey` resets memory and return history.
- Modify `compileNotebook.ts` and `ExplorEdaNotebook.tsx` together to use keyed fallback. A fallback source is recompiled against current data and definitions; it is not frozen historical values. Use captured snippet-relative ranges for its definition excerpt and a separately resolved current invalid block as the recovery target.
- Add `components/notebook/useNotebookNavigation.ts` to own the temporary inspector selection, pending destination and private return stack. Capture history only when a page/source jump actually succeeds, not when the inspector opens.
- Modify `sheets.ts` to retain internal heading occurrence identity independently of the existing host-facing sheet slug. Preserve `sheet?: string` and `onSheetChange` semantics.
- Extend `NotebookSourceEditor.tsx` with a narrow imperative draft flush and reveal-range contract. Its existing 300ms debounce and unmount flush must not race a jump. Request a source change, await the host's accepted text revision, resolve again, then select the verified range.
- Modify `notebookSections`/`NotebookSections` inside `ExplorEdaNotebook.tsx` to carry source slices and heading targets through prose regrouping. Do not locate a source occurrence by searching concatenated notes text.
- Have `writeBack.ts` return or expose accepted edit descriptors so internal source edits can carry identity through the actual splice. Retain its refusal to write through frozen/invalid blocks.

Controlled sheet navigation is an acknowledged transaction: flush/acknowledge pending source, resolve target, call `onSheetChange` once, wait for the matching controlled prop and mounted destination, then commit history and hand off focus. On a successful jump suppress the overlay's automatic invoker-focus restoration, dismiss it, wait for any focus trap/inertness/scroll lock to release, then scroll and focus the destination. Normal Close/Escape restores the invoker. An ignored request leaves origin/history unchanged and source preview usable. A superseding request cancels the previous one. Return uses the same mechanism. Never force internal sheet state over a controlled prop.

A return anchor stores document/revision, logical sheet/section/output-or-prose target, scroll-container-relative offset and the originating action. Do not retain a detached DOM node as the sole identity. After resize or sections/column change, locate the logical anchor first, restore its visible position, then focus with `preventScroll`. If removed, choose a known surviving parent, then sheet start, and announce that fallback. Never substitute a block that inherited the old ordinal.

### Necessary tests and acceptance

Add `memory.test.ts` covering keyed fallback and navigation identity together: insert/reorder fences; known in-place edit; identical duplicate blocks; duplicate authored ids; external replacement; removed/renamed definition; document switch. The decisive assertion is that old valid source is never assigned to another block.

Extend the notebook integration test with delayed and ignored controlled-sheet acknowledgments, latest-request-wins, pending source draft acknowledgment, and a cross-sheet return after the origin unmounts. Verify no focus or history change before acknowledgment. Assert the selected source text exactly equals `calc net = gross * 0.5` at the accepted revision; invalid net shows the captured last-valid snippet and offers the current invalid block only as its repair location.

At all three widths, check read-only source display and editable source selection, duplicate headings, two notebook instances, and resize while away from the reading origin. At 1280 test sections only when the notebook container itself is at least 960px. Source targets must remain visible below sticky controls.

**Docs and example:** add “Go to source and return”, “Stable block ids” and “Controlled sheets” sections to `notebooks.mdx`; document the one-step `lastValid`→`memory` migration. The same example gains explicit fence ids, invalid-net presets, editing and controlled-host acknowledgment controls.

**Main risk:** guessed identity causes a plausible but wrong jump or fallback. Prefer unavailable source/return with a visible explanation over a guessed neighbor. The API change requires a user-facing changeset and a checkout-wide call-site search.

## M3 — Complete reverse consumers, findings and scoped composition

**Shipped capability:** from a definition, readers see direct consumers, reveal transitive consumers with paths, and navigate to a chart or a prose finding that uses it. Composition relationships retain their local namespaces and render only accepted parts.

### Source changes

- Finish findings metadata in `lib/dsl/compile.ts` and `lib/notebook/findings.ts`: metric fields, filters, chart population, compatible metric-comparison operands and duplicate findings follow current accepted semantics. A count finding does not acquire an invented measure-field edge. Represent eligible and selected rows as separate metadata endpoints. The metric card consumes eligible rows; a default bound finding consumes selected rows; `population=eligible` consumes eligible rows. Here Region feeds eligibility, and the endpoints contain the same rows only because no owning selection narrows them. The finding reads net independently of chart aggregation. A chart-binding relation enables navigation but is excluded from value-dependency closure.
- Extend the existing Markdown token pipeline in `NotebookProse.tsx` to retain finding occurrence ranges and safe interactive contexts. Standalone value references receive a definition action. A finding value inside a records link remains plain content within that link; add a separate Definition action in `NotebookFindings.tsx` or reach it through the inspector. Never nest controls.
- Instrument `lib/dsl/composition.ts` beside typed lowering and retained-part validation. This supplemental baseline module was inspected during research. Keep scale, local measure, unit, mark, guide, annotation and inset namespaces scoped to their composition. Local `x=net` means a scale reference when the grammar says so, even when global calculation `net` exists.
- Extend `navigation.ts` with inverse adjacency and visited-set traversal. Containment, ignored references and diagnostic-only occurrences are excluded from active dependency reachability. Preserve role labels and occurrence multiplicity while counting each destination output once.
- Extend `NotebookDefinitionInspector.tsx` with Used by, direct default, and an explicit indirect-consumer disclosure. Each indirect destination shows an intermediate reason path. Keep input traversal in the same temporary inspector and use the M2 jump/return controller for actual movement.

Population dependencies cover workspace filters, chart-local filters and current selections from the same resolved settings. Do not invent dependencies on every field. In the example, changing net-total from sum(net) to sum(gross) changes its West value to 250 while west-net remains 125: the finding still sums net over its unchanged selected population, equal to eligibility in this no-selection example. EC20 additionally narrows the owning selection: the notebook metric remains 250 over eligible rows, while the selected net finding becomes 75. Its consumers must not be reported as value-dependent on chart aggregation.

Effective composition edges come from retained visible consumers and typed local references. Do not pretend that the baseline composition lowerer normalizes notebook aliases; canonical field spelling is authoritative. Expose unreadable/partially retained source separately. A calc in an unused local measure is not automatically a dependency of every visible mark merely because they share a chart container.

### Necessary tests and acceptance

Extend the compiler/navigation test group with exact six-block composition edges, same spelling in local/global namespaces, invalid dropped mark, numeric size constant, local measure order field, repeat/window/filter roles, and final accepted-part filtering. Assert that `unused` has zero active consumers even though it is defined in the same notebook.

Extend the renderer test with standalone `{{west-net}}`, records-link label containing that substitution, code/escaped braces/link destinations, and ordinary external links. Existing finding updates must preserve focused links and surrounding text selection. Verify separate records and definition actions and the chart-measure mutation above: chart 250, finding 125, unchanged shared population. Assert changing the actual population changes the finding appropriately; changing an unrelated chart presentation setting adds no value dependency.

Assert direct/transitive destination sets and reason paths from fixtures, including alias provenance without merging every canonical raw-field reader into an authored alias consumer. Add a small diamond graph case: one output reachable twice appears once, with distinct available paths; cycles/invalid nodes never cause traversal loops. This tests real behavior without building a second parser.

Repeat pointer/keyboard checks at all widths for expanding consumers, following a prose consumer, narrow-sheet dismissal and Return. No inactive or invalid reference is presented as a working output.

**Docs and example:** add “What uses this definition?”, “Findings in prose” and “Composition definitions” to `notebooks.mdx`. The existing example now explains the complete six-block edge set and includes separate finding records/definition actions and scoped composition navigation.

**Main risk:** block-level overcounting misrepresents impact. Keep definition-specific occurrences and distinguish rendered output roll-ups from local composition parts. This milestone uses shipped findings, not PR507 selection-bound findings research.

## M4 — Searchable outline, unused/invalid discovery and completion

**Shipped capability:** readers can find any definition or heading without starting from a chart, including unused definitions, shadowed declarations and invalid source. The same temporary surface unifies navigation without a persistent sidebar or all-notebook graph.

### Source changes

Add `components/notebook/NotebookDefinitionOutline.tsx` and connect it through the existing inspector/controller. Offer a labeled search field and sheet/heading grouping; same-title headings remain separate occurrences with useful breadcrumbs. Show declaration state independently of active-consumer count. Zero consumers means “Unused” only when applicable reference families were indexed completely; unresolved or invalid source is not confidently unused.

Keep invalid current source, last-valid source used by the output and runtime-only setting references distinguishable. Removed targets remain explicit rather than disappearing into a wrong destination. The outline includes read-only notebooks, definitions-only and mixed blocks, repeated headings, multiple sheets and current diagnostics. Reuse the same target identities and traversal results; do not maintain a parallel outline graph.

Finish checkout integration: update public exports and every `lastValid` call site discovered by search; confirm controlled host examples; keep the new feature within the existing panel ownership rules. No implementation claim is made about export or registry files absent from the supplied packet.

### Necessary tests and acceptance

Add one outline integration test covering search, duplicate headings, unused definition, shadowed alias, invalid calculation, last-valid source and removed destination. Reuse prior fixtures instead of adding synthetic state that cannot occur through the compiler.

Run the final acceptance matrix across 1280/783/390px, both themes, editable/read-only source, both layouts, controlled/uncontrolled sheets and keyboard/touch/pointer. Verify the first three milestones' behavior after integrating the outline: 28/32px control scale, bounded code overflow, visible focus, Escape precedence, ordinary tab order on desktop, protected focus only for a true narrow modal sheet, and single-panel ownership. Record actual results; screenshots are implementation evidence only after these checks are run.

**Docs and example:** add “Find definitions and headings”, “Unused and invalid definitions”, and a concise navigation FAQ to `notebooks.mdx`. Complete the single runnable example's scenario selector and link it from those sections. Explain source changes and return fallbacks in terms of the reader's task.

**Main risk:** turning temporary navigation into dense permanent chrome. The outline is an alternate view of the same surface; a global graph remains an Explore recommendation, not a delivery prerequisite.

## Proposed worker run sheet

Run commands in the real checkout after implementing the corresponding files. The attached source packet is not a runnable workspace. Test file names below are proposed destinations. Use repository test time limits; do not add ad hoc timeouts. Run broad `pnpm check` once after integration, not concurrently across worktrees.

```bash
# Discover consumers/registries before editing APIs or wiring the example.
rg -n 'lastValid|ExplorEdaNotebook|compileNotebook|notebookSheets' packages apps
rg -n 'Notebook|notebooks|demos' apps/demo/src packages/explorEDA/src/index.ts

# M1/M2: compiler semantics, keyed fallback and navigation state.
pnpm --filter exploreda exec vitest run src/lib/notebook/compileNotebook.test.ts src/lib/notebook/navigation.test.ts src/lib/notebook/memory.test.ts

# M1–M4: rendered behaviors and the existing source-edit/finding regressions.
pnpm --filter exploreda exec vitest run src/components/notebook/ExplorEdaNotebook.test.tsx
pnpm --filter exploreda check-types

# Use the documented demo command for real pointer/keyboard acceptance.
pnpm --filter demo dev

# After broad integration and actual UI checks, run the complete gate once.
pnpm check

# User-facing library/API change: create one appropriate changeset per PR.
pnpm changeset:add minor "Find notebook definitions, inspect their uses, and return to your reading position."
```

Do not run the full check or changeset command merely to make this research plan appear executed. Implementation workers should include actual test results and screenshots in their PR, per `AGENTS.md`. No commit, push, PR, service or hosting action is authorized by this design mission.
