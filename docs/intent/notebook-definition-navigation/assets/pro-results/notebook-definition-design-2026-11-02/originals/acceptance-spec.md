# Notebook definition navigation: acceptance contract

**Status: proposed acceptance specification. The navigation feature was not implemented, and these browser/component scenarios were not executed during the design run.** The companion [navigation-cases.json](navigation-cases.json) contains 24 deterministic cases. Its JSON syntax, sequential unique case IDs, and fixture arithmetic were checked locally. That structural check is separate from executing the proposed feature.

The baseline is `d3920a285f3755a8324998775deb131747e959f5`. All current-behavior statements below refer to the supplied complete source packet at that baseline. References use repository paths and symbols; numbers are useful baseline coordinates, never an identity promise after editing.

## 1. Shared fixture and identity

Use the six-block notebook with fence IDs `metric`, `revenue`, `gross`, `net`, `unused`, and `composition`. The first sheet is `results`; the second is `definitions`. The first chart is explicit `@net-total`; it uses `net` before the definition appears. The definitions form:

- `revenue:num=Revenue`.
- `calc gross = revenue - Cost`.
- `calc net = gross * 0.5`.
- `calc unused = Cost * 2`.

The first block also declares `finding @west-net sum net chart=@net-total digits=2`. The composition contains explicit `@net-shape`, `@orders`, and `@orders-points`. Its `label value=net-measure` has a revision-scoped occurrence under `@orders`; **do not assert a durable label ID**.

The rows and exact arithmetic are in the JSON companion. They imply these values:

| Quantity | Exact fixture expectation | Scope |
| --- | ---: | --- |
| `gross` | `[60, 120, 90, 100]` | Source row order |
| `net` | `[30, 60, 45, 50]` | Source row order |
| `unused` | `[80, 160, 120, 40]` | Source row order |
| `sum(net)` | `125` | West rows |
| `sum(gross)` | `250` | West rows |
| `sum(net)` | `185` | All rows |
| Prose `{{west-net}}` | `125.00` | Finding's two decimal places |

Use `createNotebookMemory("notebook-nav-six-block")` and the proposed `memory: MutableRefObject<NotebookMemory>` prop. Replace the old `lastValid` API in one coordinated migration. One retained memory belongs to one logical notebook. Put the document key in memory; an omitted memory prop receives a mount-local identity. Reusing memory for a different notebook requires a new factory result and clears its navigation/fallback state.

The identity rules tested here are:

- Every source range belongs to an accepted revision.
- A unique authored fence ID can survive an external block move or source edit.
- An unkeyed block can retain a session ID after a unique exact unchanged-body match or a known editor/writeback edit map.
- An ambiguous match has no relocation. Ordinal guessing is forbidden.
- Duplicate authored IDs disable stable identity for both conflicting blocks. Give them separate revision-scoped occurrences; do not silently append suffixes to authored identity.
- A namespace/name lookup is not historical identity. Unknown external rename makes the previous declaration target missing.
- A known local declaration rename can preserve its occurrence, while references still using the old name remain unresolved until the author changes them. This capability does not implement automatic refactoring.

**Baseline basis:** `lib/notebook/parseNotebook.ts` exposes only block index and file lines; `compileNotebook.ts` uses ordinal last-valid memory and block/ordinal generated chart IDs; `components/notebook/ExplorEdaNotebook.tsx::useNotebookResult` stores strings by index. These are the reasons to add a small explicit/session identity contract before displaying authoritative provenance. All these paths are under `packages/explorEDA/src/`.

## 2. Source navigation and return

| Case | Action | Exact expected outcome |
| --- | --- | --- |
| NAV-01 | Open Definitions on `@net-total`, preview `net`, go to source, return | Preview stays on Results and creates no history. Source opens block `net` on Definitions and creates one return entry. Return restores the chart Definitions action on Results and empties the entry. |
| NAV-02 | Drill through `net → gross → revenue → Revenue` inside the inspector | No sheet movement, document scrolling, or page-history entries. Raw Revenue has field metadata and no notebook declaration. Inspector Back retraces preview targets; Escape restores its original invoker. |
| NAV-03 | Make real page moves to `net`, then `gross` | Return depth is 1, then 2. Two Returns visit `net`, then the original chart. The feature does not write browser history. |
| NAV-04 | Locally rename only the declaration `net` to `net_v2` | Track the edited occurrence as `net_v2` in the accepted revision. Old `net` references remain compiler errors; no implicit consumer rewrites or rebinding. |
| NAV-05 | Delete the origin chart while viewing its definition | Return to the known surviving West summary section on Results, focus its heading, and announce: “The original chart was removed. Returned to West summary in Results.” Never focus whatever acquired its old index. |
| NAV-06 | Externally replace `net` with `retained` without an edit map | The explicit block identity remains; the old declaration target is missing. Show “net is no longer defined.” Offer current block source without guessing a rename. |

A preview captures a **provisional** origin bookmark when invoked. Commit a return entry only after a requested destination exists. The bookmark carries document/revision, logical occurrence, sheet occurrence/current routing slug, focused action, and anchor offset in the correct scroll container. DOM references are an optimization; another sheet unmounts them.

NAV-01 injects an origin viewport-top offset of **144 px** as a deterministic geometry input. Restoring 144 px is a test expectation under unchanged viewport/layout, not a measured result from this design. After a resize, locate the same logical origin and clamp the relative offset to the visible viewport instead of restoring obsolete absolute `scrollY`.

For source read-only notebooks, Go to source reveals a highlighted readable snippet and focuses its labeled heading. For editable notebooks, an additional **Edit source** action opens the actual source textarea and selects the verified range in the accepted revision. Do not place focus on a decorative syntax-highlight copy.

**Baseline basis:** `ExplorEdaNotebook.tsx::NotebookBlockView` provides chart wrappers with `tabIndex=-1`, but its chartless Defines branch has no equivalent identity/focus wrapper. `NotebookColumn` unmounts inactive sheets. `NotebookSourceEditor` has no reveal-range API at baseline; that is an implementation addition.

## 3. Duplicate headings, edits, and last-valid source

| Case | Setup | Exact expected outcome |
| --- | --- | --- |
| NAV-07 | Two same-title `## Net` headings, a second `# Definitions`, and two notebook instances | Internal heading occurrences and notebook namespaces remain distinct. Outline entries say `Net (1)` and `Net (2)`. The second top-level heading routes with current slug `definitions-2`. No bare slug is treated as durable identity. |
| NAV-08 | Move explicit fence `id=net`, then make its body parse-invalid | Last-valid source remains attached to authored block `net`, never its former ordinal. Show the captured old snippet with last-valid provenance. |
| NAV-09 | Move a unique unchanged unkeyed net block | Retain its known session key by exact unique match and recompute the current range. |
| NAV-10 | Ambiguous identical unkeyed blocks, or duplicate authored fence IDs | Reuse no ambiguous historical identity/fallback. Current source remains readable. Navigation identity warnings alone do not suppress otherwise valid DSL output. |
| NAV-11 | Parse-invalid net block with fresh memory | There is no effective net definition or invented dependency edge. Show invalid current text and the unresolved reference; show no historical snippet. |
| NAV-12 | Invalid net body has old valid source; current first data row changes | The old formula recomputes using current data. The West result is **145**, the finding is **145.00**, and all-net is **205**. The inspector must not call the prior 125 value current. |

NAV-12 uses current first row `{Revenue: 140, Cost: 40, Region: "West"}` and leaves the other rows unchanged. Last-valid source remains `calc net = gross * 0.5`. The row values become `[50, 60, 45, 50]`.

The preview distinguishes two valid actions:

- **View last-valid source** shows the captured source that actually defines the rendered result.
- **Edit current source** opens the current invalid body, `calc net = "unterminated`, so the author can repair it.

A synthetic compiled line is never shown as a current-file destination. Keep the old snippet’s own source revision and offsets separate from the current invalid block’s location.

**Baseline basis:** `compileNotebook.ts::build` appends stand-ins after the source file; `ownerOf` maps them back to blocks. Fallback replaces source rather than capturing rendered values. `writeBack.ts::declarationFor` accepts only `status === "ok"`, and `writeBackChart` refuses frozen source edits. The design preserves that separation while providing an explicit current-source repair action.

## 4. Draft acknowledgment and controlled sheet hosts

Navigation is a small transaction. The two required acknowledgments are independent: accepted source text, then an accepted sheet change when needed.

1. Flush the currently mounted source editor without unmounting it.
2. If a draft was pending, emit `onTextChange` once and cancel its scheduled debounce.
3. Wait until the requested text appears through props. Recompile and resolve the target against that accepted revision.
4. Request the target sheet once if it differs.
5. Wait until the target sheet prop is active and the target DOM registers.
6. Commit return history and suppress the overlay's normal invoker-focus restoration for this successful jump. Dismiss it, wait for its focus trap, background inertness and scroll lock to release, then reveal and focus the destination. Normal Close/Escape still restores the invoker.

| Case | Host timing | Exact expected outcome |
| --- | --- | --- |
| NAV-13 | Draft at 0 ms; Go to source at 150 ms; requested text accepted at 200 ms | Flush once at 150 ms despite the usual 300 ms debounce. Do not unmount or navigate before acceptance. The inserted comment moves net’s source line by +1; reveal the recalculated range from `r1`. |
| NAV-14 | Requested source text is not accepted, or is replaced with unrelated text | Preserve the draft/editor while waiting. Offer cancellation. If an unrecognized replacement arrives, cancel movement; never use the old offset. No sheet requests or history entry occur before source acknowledgment. |
| NAV-15 | Controlled `sheet="results"`; callback is acknowledged later | Callback receives `definitions` once. Before acknowledgment: zero destination scroll/focus calls and no history. After prop and DOM acknowledgment: focus the target once and add one entry. |
| NAV-16 | Controlled sheet ignores the callback or has no callback | Keep the complete source preview usable. No local override, fake success, timeout-driven movement, or return-history entry. With no callback, disable the page jump while retaining the snippet. |
| NAV-17 | Request net, then gross before the same sheet request is acknowledged | Coalesce the outstanding request for Definitions. The latest target, gross, gets focus once. Net gets no focus. Create one return entry pointing to the original chart. |

The existing callback type does not express explicit rejection. “Declined” therefore means that the host does not supply the requested prop; the UI can remain useful with the snippet and a cancel action. Do not invent a timeout that changes a controlled value locally.

**Baseline basis:** `NotebookSourceEditor.tsx` uses `SETTLE_MS = 300`, protects drafts while typing, and flushes on unmount. `ExplorEdaNotebook.tsx::NotebookColumn` mutates local sheet state only when `sheet` is absent; the renderer test “follows the sheet prop and reports a choice to the host” explicitly proves that a callback by itself does not change the displayed charts.

## 5. Current output versus authored source

**NAV-18 is required because source read-only is not chart-immutable at baseline.** Without `onTextChange`, chart settings may still change on screen.

Change the metric from `sum(net)` to `sum(gross)` while its local filter remains `Region=West`:

| Item | Expected result | Dependency interpretation |
| --- | ---: | --- |
| Current metric | `250` | Measurement reads gross. |
| Authored metric source | `sum(net)` | Saved source still describes net; label the current chart “Changed on this page.” |
| Current `west-net` finding | `125.00` | Finding continues summing net from the chart’s population. |

Resolve current supported chart settings through the same resolver and raw/calculation bindings. Keep authored and current references separate. A chart-bound finding consumes the chart’s **population**, not the chart’s aggregate value. The metric reads `population:net-total:eligible`; the default finding reads `population:net-total:selected`, which has eligible rows as its ancestor. They contain the same rows in this fixture because no owning selection narrows them. A chart→finding navigation relationship identifies the population owner without making the metric measure an input to the finding.

NAV-19 checks layout and source-mode distinctions:

- At a notebook container width of 1280 px with `layout="sections"` and no source callback, use the sections layout with its 300 px notes column and 40 px gap.
- With source editing enabled, use the reading column and reveal the actual editable source range.
- Preserve source occurrence identity when a finding after a chart moves into a section’s notes column.
- Do not join prose into strings and later guess token offsets from the displayed text.

**Baseline basis:** `ExplorEdaNotebookProps.onTextChange` documents that absent writeback leaves chart edits on screen. `NotebookBlockView` draws current provider settings. `notebookSections` currently joins string notes and therefore needs to retain source slices for exact occurrence navigation.

## 6. Keyboard, findings, and focus

NAV-20 protects the keyboard contract:

- Enter opens a focused inspector from a Definitions button.
- Space activates an input-definition button without scrolling the document or selecting chart marks.
- Escape closes the preview inspector and restores its original invoker when it exists.
- A separate Edit source flow closes the inspector before focusing the actual document textarea. Escape there closes that source editor and focuses its block's Edit source action; it does not reopen an inspector. The exact case has no pending draft. Pending drafts use NAV-13/NAV-14 before any unmount, preserving edits rather than silently discarding them.
- Focus restoration does not open a hover tooltip.
- Sheet ArrowLeft/ArrowRight/Home/End behavior remains intact.
- Do not intercept Alt+ArrowLeft or add a new global shortcut.
- Preserve plain chart-click selection and Alt-click value tracing.

NAV-21 uses this exact prose:

```markdown
Standalone {{west-net}}. [The value is {{west-net}}](#finding:west-net). Literal `{{west-net}}`, \{{west-net}}, [external](https://example.com/?q={{west-net}}).
```

Expected structure and behavior:

- One standalone definition action.
- One records link, with **zero nested buttons or anchors** inside its label.
- The records link opens records. Its popover header offers a separate definition action.
- Code and escaped braces remain literal.
- The external link destination is not a finding use and retains its external-link behavior.
- Live value updates do not replace the entire prose DOM or destroy the focused records link.

**Baseline basis:** `NotebookProse.tsx` shares markdown-it token rendering, preserves code/escaped braces/link destinations, and currently renders finding values as spans. Its text-token pass can also see link-label text. `NotebookFindings.tsx` already returns focus to the records anchor; the renderer tests verify that finding updates preserve a focused link.

## 7. Exact viewport contracts

These are **proposed design targets**, not measured layouts. Test each with real keyboard and pointer input on the runnable example. Notebook container width, not only viewport width, controls the existing 960 px sections breakpoint.

| Case / width | Reading layout | Inspection surface |
| --- | --- | --- |
| NAV-22 / 1280 px | Sections when container is 1280 px and source editing is absent | Temporary nonmodal right overlay, 360 px initially, wider mode capped at 640 px. Opening it does not resize charts. |
| NAV-23 / 783 px | Reading column | Temporary nonmodal right overlay, 360 px initially. Tabs stay in one horizontally scrollable row. |
| NAV-24 / 390 px | Reading column | Full-width modal sheet, 390 px outer width; trap focus, lock background scroll, keep header actions available. |

Common assertions:

- No horizontal page overflow.
- Source lines can scroll within their own code region.
- One right-edge inspection surface at a time.
- Main controls are 32 px; compact inspector controls are 28 px.
- Opening the inspector does not resize the figure grid.
- Primary actions remain reachable while the body scrolls.
- Close restores focus.
- On mobile, Go to source closes the sheet only after the destination is ready.
- Returning after 1280→390 resize resolves the logical origin, rather than an old absolute scroll position.

Use repository semantic border/focus tokens and accessible action names. No native `title` tooltips. The current `docs/ui-defaults.md` says hover tooltips must not open on focus return; follow that specific focus-return rule.

## 8. Test placement and execution boundary

### Compiler and population companion

`edge-cases.json` adds 20 compiler/state cases with 24 concrete source variants. These include alias replacement and raw-name collisions, exact bracket references, cycles, duplicate calculation/chart/finding names, count populations, failed filters versus ignored settings, three fallback timing situations, composition scopes and partial retention, inferred table inputs, and empty source rows. Their provider/edge arrays are exact required assertions for the named local projection; `expected-graph.json` is the exhaustive main-fixture graph. Baseline `lastValidByZeroBasedBlockIndex` inputs in those cases translate to keyed fence IDs for the proposed M2 API; they do not authorize preserving ordinal fallback.

EC20 uses `filter Revenue=100..150`, local `Region=West` and owning `select.Cost=40..60`. Eligible IDs are `[0,2,3]`, selected IDs `[0,2]`, and selected-plus-finding-local IDs `[0]`. The notebook metric sums gross over eligible rows and stays **250**; selected net is **75**, eligible net **125**, finding-local net **30**, and unbound net **185**. This protects against applying chart selection to the metric incorrectly or treating its aggregate value as the finding's input.

### Replay the checks performed during design

Use the Python checker for the acceptance oracle and the Node companion against a checkout at the named baseline for original parser/lowerer checks. The Node script deliberately does not claim to run the full compiler, calculation engine or renderer.

```bash
# Artifact arithmetic, graph queries, source ranges, JSON IDs and visual dimensions.
python3 verify-fixtures.py

# Node 24, existing checkout at the pinned baseline; no package install required
# for the specific pure parser/lowerer modules loaded by this companion.
node replay-source-checks.mjs /absolute/path/to/explorEDA

# Full-feature test commands are proposed in implementation-plan.md.
```

The graph oracle is denormalized for review. Project compiler ids to its symbolic namespace/name/block identities, specialize composition part kinds, and inline normalized occurrence spans before comparing. Compare `canonicalCalculationReads` independently from the authored alias routes. No companion introduces another DSL parser.

Treat the 24 cases as data variants, not an instruction to create 24 small tests that mirror implementation. A compact suite can cover them in these meaningful groups:

1. **Compiler/navigation identity:** named/unkeyed/ambiguous blocks, duplicates, rename/delete, source revisions and stand-ins. Extend `lib/notebook/compileNotebook.test.ts`; add a direct `lib/notebook/navigation.test.ts` only for the new index/identity module.
2. **Navigate and return:** extend `components/notebook/ExplorEdaNotebook.test.tsx` with preview versus page movement, cross-sheet return and deleted origin.
3. **Controlled transaction:** parameterize delayed/ignored/missing callback, latest target, and pending source acknowledgments in the same renderer test file.
4. **Prose structure:** test standalone versus nested finding actions using shared Markdown token output; preserve the existing focused-link update assertion.
5. **Current chart state:** one integration test changes metric measurement to gross and proves that finding measurement stays net while both share the same population.
6. **Real responsive flow:** a browser sequence on the six-block demo at 1280, 783, and 390 px checks geometry, focus, modal behavior, scroll restoration, and actual pointer actions. jsdom width mocks are not proof of browser layout.

The runnable demo belongs with the same milestone as its behavior. Extend `apps/demo/src/docs/pages/notebooks.mdx` with “Find a definition,” “See where it is used,” and “Return to reading,” then the sheets/source-edit section when those cases ship. Preserve the existing source editing and findings examples; this capability does not depend on research PR507 or replace value tracing.

### Checks completed for this companion

- JSON parsed successfully.
- Case IDs are exactly `NAV-01` through `NAV-24`, with no duplicates.
- West net/gross arithmetic matches the four supplied rows.
- The JSON and prose explicitly distinguish proposed UI acceptance from executed checks.

### Checks still proposed

- The new compiler/navigation implementation and its tests.
- Component behavior for all 24 cases.
- Browser layout, keyboard, pointer, focus, and return behavior at all three widths.
- Full checkout type checking and `pnpm check` at the implementation handoff.

No production source, commits, hosting, or services were created by this companion.

