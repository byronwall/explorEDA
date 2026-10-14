# Proof plan: chart color without disrupting exploration

**Proposed local work for Codex; none of these product checks ran in this research session.** Date: 2026-10-12. Baseline: `c534378c052c9fbb2cb076d1df0d21eb0fa0965e`. This plan can reject the favored design. It does not authorize application implementation during the research run.

## Outcome and cut line

An analyst can change a scatter chart’s color encoding close to the data, including when it has no legend, without changing the active cohort or accidentally recoloring a peer chart. The same task is discoverable, keyboard-completable and available without hover or a secondary mouse button. Trace remains reachable without first filtering the target record.

The smallest useful proof covers Points and bubbles, one Color field selector, categorical/numeric/None, one peer chart, and one host-state transaction. Start with the existing bubble path as a positive control, but establish the unsized-point click discrepancy before evaluating the whole proposed flow. **Do not claim preservation merely because a snapshot or simulated click test passes.** [ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423); [ScatterPoints](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx); [useBrush](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useBrush.tsx).

Excluded: palette/category color editing, new generic command framework, arbitrary field shelves/drop zones, all-renderer hit registry, chart conversion, X/Y swap, free facet bindings, rich annotation placement, map engine changes, new dependencies and a general undo system. No change to React, the saved-data model or the shared chart write path.

## Variant comparison

| Variant | Mechanism | Question it answers |
|---|---|---|
| A — baseline | Existing Settings → Data → Color. Preserve the actual starting tab and S shortcut. | What does today’s route cost in the real task? |
| B — materially simpler | Visible Color trigger → same single-field picker. No new point menu or Alt handling. | Is a field control alone sufficient? |
| C — local menu combination | B plus point/empty-plot menu → Color by… (all points). | Does object locality improve task success or context enough to earn event/hit complexity? |
| D — Alt experiment | C plus Alt/Option-click → Color; traces in object menu and header browser. | Does the new shortcut earn relearning and platform costs? |

Run B and C before investing in D. Counterbalance C/D exposure for returning users so familiarity does not decide the answer. Compare a second Alt variant only if necessary: Alt opens the semantic menu rather than Color directly. That offers generality but not the same activation saving. Keeping Alt trace is a real candidate, not a forbidden outcome.

A right-click route has three logical activations; B has two. The current Data route can also have three, not a fabricated six. Search characters, modifier presses, target acquisition, correction actions, tab navigation and explicit acceptance are recorded separately. Do not invent task-time targets from these modeled counts.

## Deterministic fixtures

**Proposed `dense-chart-controls` example:** a scatter chart, a category row chart, a data table and a peer chart sharing a categorical scale. Begin with an active linked filter. Include a version with no color field or legend, a version with bubbles, one with facets and two scales for the same field, and a version with no matching visible rows. Preserve saved layout and chart identity through the task.

Use deterministic synthetic fields: categorical, numeric, boolean/date where supported by the current color policy, a derived numeric field, a derived categorical field, null/empty/nonfinite values, negative and zero sizes, a very long label, and two distinct internal IDs sharing a display label. Add a **500-field stress variant** and a **10,000-point overlap variant**, explicitly proposed workloads rather than established product limits. Include coincident points and marks near the menu edge. A trace candidate has a stable logical identity; replacing data while its menu is open must not silently trace a different record.

Reuse existing examples `scatter-trace`, `bubble-scatter`, `palmer-penguins` and `scatter-density` for regression contexts where their settings match the task. Rectangular density, hex and contour are regression exclusions from arbitrary point Color semantics, not secretly added first-slice targets. [apps/demo/src/demos/examples.ts · examples](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/demos/examples.ts#L226-L241); [apps/demo/src/demos/coverage.ts · exampleCoverage](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/apps/demo/src/demos/coverage.ts#L568-L583); [ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36).

## Stage 0 — settle source-level collisions locally

Inspect `ScatterSvg` ordinary-click guards and its caller using real pointerdown/move/up/click sequences. The selected source shows ordinary `onSelectPoint` bypassed on unsized points; confirm whether the rendered application has any additional owner. Keep filtering as the desired contract even if the baseline differs. Do not “fix” it by selecting the chart first or delaying a click to wait for another.

Inspect `onPanelContextMenu` before extending it. Move pointer-origin Shift bypass ahead of axis delegation in the proposed route; maintain keyboard-origin Shift+F10 access. Verify nested axis labels, ticks and bands resolve to the same axis. Preserve title `mousedown(detail===2)` and the grid’s `data-inplace-editor` cancellation. These are collision points, not a mandate to centralize every renderer. [onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620); [useAxisFieldActions](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/AxisFieldActions.tsx#L44-L59); [useTitleEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useTitleEditing.tsx#L26-L41); [ChartGridLayout](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ChartGridLayout.tsx#L44-L59).

## Stage 1 — prove B and the discrete binding transaction

Expose one readable Color trigger. Reuse FieldSelector metadata and color-setting logic, with only the presentation change needed to enter the already-open search. The current ComboBox does not accept controlled open state or a portal container; do not add a second closed selector and call it the intended route. Match labels and stable field IDs, with unique option identities for duplicate aliases. Keep multi-select FieldPicker separate.

Instrument the host callback and save structure in the **local proof**, not production analytics. On menu/picker open, query change and keyboard highlight, expect no mutation. On explicit acceptance, start the existing hold before any shared scale is created, resolve/reuse it, update the chart and release once. On same-field acceptance, avoid a meaningless checkpoint. Clear-color changes only the binding; do not delete a shared scale because one chart stopped using it.

Test errors after scale creation. Restore only the chart binding keys and remove only the newly created scale if it is unreferenced; never restore the entire workspace or remove an existing shared scale. A data replacement or chart deletion closes a stale editor. A host undo should restore the operation as one checkpoint where the host provides history. This is not a claim that the library provides a universal undo stack. [getOrCreateScaleForField](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts#L141-L156); [holdStateChanges](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx#L325-L340); [useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27); [updateChart](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/providers/DataLayerProvider.tsx#L1125-L1140); [ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx).

## Stage 2 — prove C without incidental selection

Open a scoped context menu over an unsized point, bubble, empty plot and overlapping point group. Chart Color never requires record disambiguation. Only record trace asks which logical candidate to use. Show “This chart — all points, all facets” separately from “This record”. After choosing Color, the field search—not an intermediate closed control—takes focus. Close the object menu before opening the picker so focus and Escape have one owner.

Keep an image section at the menu end, and the existing image-only fallback for unhandled targets. Mark new editor-only controls `data-export="omit"`. A menu dismissing outside must consume that dismissal sequence; the next ordinary resting click filters immediately. A menu opening, a field accepting and a dismissal must not clear the existing filter set. [ChartImageMenuSection](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/export/ChartImageMenu.tsx#L47-L62); [ChartColorLegend](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ChartColorLegend.tsx#L30-L45); [onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620).

## Stage 3 — evaluate D and trace replacement

Before remapping, give trace a no-filter menu command and the existing header target browser. Test an exact record, a guide/axis, a category color explanation and omitted-row provenance. Do not replace needed trace detail with a generic table preview. No per-point Inspect buttons are required.

In the experimental variant, Alt/Option-click opens the chart Color picker. Movement cancels this armed gesture and suppresses its trailing click. The change removes the baseline’s possible Alt-brush; plain drag remains the brush route. Test OS interception and modifier combinations on actual supported systems. **Do not ship a scatter-only remap while title, facet and legend still advertise the old convention without a coherent supported-target rule.** A local experimental flag can isolate the study; adding a durable public feature-flag framework is outside scope. [ScatterSvg](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx#L408-L423); [useBrush](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useBrush.tsx); [onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620); [useAxisEditing](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useAxisEditing.tsx#L118-L133); [ColorScale](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ColorLegend/ColorScale.tsx#L25-L40); [MDN](https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/altKey).

## Representative tasks and observations

| Task | Record | Failure to reject or revise |
|---|---|---|
| “Separate the visible relationship by release phase” with no legend | Unaided entry route, first success, activation/typing/correction counts, whether the analyst expects one point or all points. | Full editor required; wrong scope expectation after owner label; no discoverable control. |
| Change color to a numeric derived field while a cohort is filtered | Filter structure, row counts, scale identity, peer binding/palette before/after. | Any unintended selection change or peer recoloring. |
| Browse several field matches, then Escape | Save structure and callback count. | Shared scale or checkpoint created by browsing. |
| Clear color, then host undo | Binding and scale restoration; layout and chart IDs. | Destructive scale cleanup or more than one meaningful checkpoint. |
| Trace one overlapping record without narrowing other views | Trace ID, number of corrections, filter invariants, next ordinary click. | Wrong record, implicit filtering, or inability to find trace after remap. |
| Repeat after using another chart or reopening details | Focus return, current-store values, old query reset, nested Escape. | Stale target, lost focus or a second layer handling the same Escape. |
| Complete using keyboard and touch-visible routes | Independent task completion, meaningful labels, list scroll and viewport reachability. | Hover/right-click/modifier required to finish. |

For directional discovery work, recruit **six representative analysts as a proposed starting cohort**, including unfamiliar and experienced users; add keyboard/assistive-technology and touch sessions deliberately. This number is not a statistical power claim. A proposed gate of **five of six completing the first Color task unaided** can surface gross discovery problems, but does not establish population success rates. Byron should approve or replace this criterion before testing. Do not report it as an industry standard.

### Proposed rejection gates

**Hard safety gates:** zero unintended filter writes during config open/search/cancel/accept; zero wrong-scope peer writes; one logical host checkpoint for an accepted first-scale binding; none for browse/cancel/no-op; no drag followed by an extra click; correct native Shift-right-click and keyboard menu behavior; and no inaccessible required action. These are proposed invariants and per-fixture pass conditions, not measured rates.

**Usability decision:** record success, wrong-scope interpretation, discovery route, corrections, action count and loss of visual context for A/B/C/D. Compare within the same task and device. Do not adopt C merely because it is novel: if B performs equally well with lower confusion and maintenance cost, keep B. Do not adopt D if trace becomes materially harder to find, the shortcut provides little repeat-task benefit, or it only works reliably on the evaluator’s machine. Task times may be measured, but no unmeasured seconds or universal latency threshold is asserted here.

**Technical decision:** measure input-to-render and search work on the named fixtures with the repository’s local tools. Do not call mapped options “virtualized.” Add indexing, virtualization or a dependency only after a reproducible cost establishes need. A graph staying visible in a screenshot does not prove responsiveness.

## Responsive, keyboard and touch matrix

At 1280 px, verify anchor placement against surrounding charts and a right-side panel. At 783 px, check collision fallback and the narrow-flow grid; editing must not rewrite saved layout. At 390 px, check visual viewport/on-screen keyboard, scrollable results and a reachable close action with a retained chart context. Test long headings, empty states and the existing details layout. This is robustness work, not a new promise of full mobile authoring support.

Keyboard checks: Tab to visible Color, Enter/Space, labeled search, arrows, Enter accept, Escape cancel, Shift+F10 and menu key where available, context switching, and focus return after deleting the original target. Text inputs must not activate S/C/E or a future command palette. Verify assistive-technology name, state and announcements rather than inferring them from HTML roles alone. [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/); [W3C WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).

Touch checks: visible action with no hover dependency, option-list scrolling, cancelled contacts, dismissal without a tap-through filter, and adequate target spacing. The proof can test 44 px touch rows as a proposal while retaining the existing denser mouse scale. Do not make long press required. Current ScatterSvg touch-action handling needs a separate scroll/brush check; changing touch-action after a timer is not an adequate input model. [W3C Pointer Events](https://www.w3.org/TR/2026/REC-pointerevents3-20260630/).

Cross-browser checks: Chromium, WebKit/Safari and Firefox where locally available, including macOS Control-click, Command inspection, Firefox Shift-right-click and an Alt-reserving environment if supported by the intended audience. Unavailable combinations stay explicitly untested. Do not infer platform success from jsdom.

## Documentation and demo scope by user-visible slice

- **Color proof:** `apps/demo/src/docs/pages/scatter.mdx`, `color.mdx`, `in-place-editing.mdx` and `chart-settings.mdx`; add `dense-chart-controls` to `apps/demo/src/demos/examples.ts` and `coverage.ts`. Include no-legend, shared-scale and filtered examples. Update the generated descriptions only if saved semantics change; new access alone is not a new saved setting.
- **Shipped Alt remap:** `trace.mdx`, the affected chart pages and status/readout/accessible gesture copy, `AGENTS.md` and `docs/ui-defaults.md`. Update `scatter-trace` alongside the new route. Search for Alt-click/Alt-Enter before finalizing so titles, legends, facets and charts do not contradict one another.
- **Later promotion:** axes add `scales-and-axes.mdx`; metric/bin/split add `bar.mdx`/`line.mdx`; facets add `facets.mdx`; table work adds `data-table.mdx`; Composition work adds `composition.mdx` and its corresponding focused example. Each ships with its feature, not in an unscheduled documentation cleanup.

Exact seams: [ChartSettingsContent](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ChartSettingsContent.tsx#L22-L37), [ScatterPlotSettingsPanel](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlotSettingsPanel.tsx#L21-L36), [FieldSelector](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldSelector.tsx#L18-L33), [ComboBox](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/ComboBox.tsx), [FieldMetadata](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/FieldMetadata.tsx#L107-L122), [getOrCreateScaleForField](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/hooks/useColorScales.ts#L141-L156), [useChartEdit](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/InPlace/useChartEdit.ts#L12-L27), [onPanelContextMenu](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/PlotChartPanel.tsx#L605-L620), [ChartImageMenuSection](https://github.com/byronwall/explorEDA/blob/c534378c052c9fbb2cb076d1df0d21eb0fa0965e/packages/explorEDA/src/components/charts/export/ChartImageMenu.tsx#L47-L62). Read the remaining imported color-domain/gallery/button internals, field-settings validation and affected renderer code before expanding beyond this proof.

## Codex local run sheet — NOT EXECUTED HERE

These are supplied baseline commands and proposed targeted checks, to run from a real checkout. Add new test files only as part of Codex’s implementation, not this research archive.

```bash
# Start the demo from source in a separate terminal for real-input checks.
pnpm --filter demo dev

# Existing UI and type checks.
pnpm check:ui
pnpm --filter exploreda check-types

# Focused regression tests after implementation; reading these tests is not running them.
pnpm --filter exploreda exec vitest run \
  src/components/charts/InPlace/titleEditing.test.tsx \
  src/components/charts/InPlace/axisEditing.test.tsx \
  src/components/charts/ScatterPlot/ScatterSvg.test.tsx \
  src/components/charts/DataTable/__tests__/DataTableContextMenu.test.tsx

# Documentation and example consistency.
pnpm --filter demo docs:check
pnpm --filter demo exec vitest run src/demos/coverage.test.ts src/dashboardText.test.ts

# Broad check once, from one worktree; do not imply this research ran it.
pnpm check

# Existing regression example screenshots at the repo's configured widths.
# For the new example, use its actual route after Codex has registered it.
pnpm shot /examples/bubble-scatter --name dense-chart-bubble-regression
```

## Try → Observe → Decide

**Try:** B and C on one filtered scatter plus a shared-scale peer, then D only with replacement trace access. **Observe:** no-legend discovery, scope interpretation, exact filter invariants, keyboard completion, callback grouping, target/focus safety and retained visual context. **Decide:** keep the smallest route that meets the tasks; discard menu or Alt complexity that cannot outperform the simpler visible selector. Only then promote another setting family.
