---
title: "Change chart settings where the data is — implementation plan"
slug: "dense-chart-interactions"
phase: plan
status: draft
last_updated: "2026-10-13"
---

# Change chart settings where the data is — implementation plan

## Plan at a glance

The plan protects filtering first, then builds one editable chart role and grows it. Milestone 1 confirms that an ordinary click on an unsized scatter point selects it, and fixes it if not, because every later route depends on clicks keeping their meaning. Milestone 2 ships the core value: a visible **Color** label on scatter charts that opens field search directly, applies the chosen field at once, and undoes as one Cmd/Ctrl-Z step. Milestone 3 adds the plot context menu as a second entry into the same editor, plus a **Trace this record** action so trace no longer depends on Alt-click. Milestone 4 tries live preview while browsing fields and keeps it only if it stays fast and leaves no history. Milestone 5 extends the same role editor to X and Y, which proves the pattern rather than a one-off Color control.

Each milestone is one stacked PR with its docs, demo example, and changeset, and each leaves a working product. The existing settings panel stays untouched throughout, so any route can be removed without stranding a task.

The main pushback against the shape is that live preview is less free than it sounds. `getOrCreateScaleForField` adds a color scale to the store for every new field, so browsing ten fields would create ten scales. Preview therefore comes after instant apply works, as its own milestone, with scale cleanup inside the held edit. The second pushback is about Alt-click. Alt-click trace is wired into about a dozen chart types and their help text. Reassigning it is not part of this plan. Milestone 3 only adds the alternative trace route that would make a later reassignment safe.

## Implementation strategy

- **First proof:** On the demo's scatter example, click the Color label, type part of a field name, press Enter. The points recolor, the filters stay the same, and one Cmd-Z restores the previous colors and removes any new scale.
- **Primary seam:** `useChartEdit` (`charts/InPlace/useChartEdit.ts`). It already applies through `updateChart`, holds host notifications through `holdStateChanges`, and turns a held session into one undo step. Scale creation happens inside the same hold.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/ScatterPlot src/components/charts/InPlace` while editing, and `pnpm --filter demo dev` for real pointer and keyboard checks.
- **Local dependencies:** None beyond the demo's bundled datasets and the in-memory store. No network or provider.
- **Provider/live confirmation:** Not applicable. Use `pnpm shot` at 1280, 783, and 390 px for each PR.
- **Rollout and rollback:** On by default in the library. Each route is a separate component. Removing it leaves the settings-panel route and saved layouts unchanged, because the editor writes only existing `colorField`, `colorScaleId`, `xField`, and `yField` settings.

## Milestone 1: Ordinary scatter point clicks select

Static reading found that unsized scatters skip the `onClick` mark path. `onPlotClick` returns false without a size field, so the click goes through `useBrush` instead. This may already work, but it is the top-priority behavior and has no direct test. Prove it before adding anything else.

- **Change — Reproduce with real input**
  - Add a `ScatterSvg.test.tsx` case that sends pointerdown, pointerup, and click on an unsized point. Expect `onSelectPoint` or the chart filter to change, and expect an empty-space click to clear.
  - Repeat by hand in `pnpm --filter demo dev` with a mouse on an unsized and a sized scatter.
- **Change — Fix only if the test fails**
  - Route a no-drag click on an unsized point through the same `onSelectPoint` path the sized chart uses, without adding any click delay.
  - Keep `brush.wasDrag` handling so a drag still brushes.

### Desired end state

- A plain click on any scatter point selects it immediately, sized or not.
- A plain click on empty plot space clears that chart's filters.
- The new test guards both, and the demo check is recorded in the PR.

## Milestone 2: A visible Color label changes the field in place

This is the core value and the pattern later roles reuse. It deliberately excludes the context menu, preview, and other charts.

- **Change — `ChartRoleControl` for one role**
  - A compact labeled button such as **Color: Region**, or **Color: None**, rendered on the line `ChartColorLegend` uses in `PlotChartPanel`. It still shows when the chart has no color field and no legend.
  - It has a tooltip that names the effect ("Change the field that colors every point in this chart") and an `aria-label` with the current field.
  - Scatter only for now, chosen through the chart definition so other types opt in later.
- **Change — Field editor that opens straight to search**
  - Add the smallest presentation seam to `ComboBox`/`FieldSelector`: start open with the input focused, and list fields with `FieldMetadata` and stable field IDs. Include a **None** option.
  - Above the list, show the scope line **This chart · all points · all facets**. For a field that already has a scale, add **Shared scale: Region (also used by N charts)** from `useScaleUsage`.
  - Open it in a popover beside the label, and inside chart details when the chart is shown there. Escape closes it and returns focus to the label. An outside click closes it without filtering the chart.
- **Change — Apply as one undo step**
  - On choice: `begin()`, call `getOrCreateScaleForField(field)` inside the hold, `apply({ colorField, colorScaleId })`, then `commit()`. The host sees one change, and demo history (`savedViewsHistory.ts` already tracks `colorScales`) records it as one step.
  - A field that already has a scale joins that scale, which is the existing behavior.
- **Change — Docs, example, changeset**
  - Update `scatter.mdx`, `color.mdx`, and `in-place-editing.mdx`. Add a demo example with a filtered scatter and a second chart that shares its color field.
  - Add a `minor` changeset.
- **Tests**
  - Choosing a field changes `colorField` and `colorScaleId` with exactly one host state notification, and filters and linked selection are unchanged.
  - Host undo restores the previous binding and removes a newly created scale.
  - A peer chart on the shared scale keeps its binding.
  - Keyboard completion works: Tab to the label, Enter, type, Enter.

### Desired end state

- On any scatter, the Color label changes the coloring field in two activations plus typing.
- Cmd/Ctrl-Z undoes it in one step, including the scale.
- Filters never change. Screenshots at three widths are in the PR.

## Milestone 3: Right-click the plot to color or trace

This adds a second entry into the same editor and gives trace a route that does not depend on Alt-click.

- **Change — Scatter plot menu**
  - In `onPanelContextMenu`, keep the order that already works: axis and title menus answer first, and Shift-right-click keeps the browser's own menu. Then a right-click on the scatter plot area opens a short menu instead of the image-only menu.
  - The menu holds **Color by…**, which opens the Milestone 2 editor anchored at the pointer. It holds **Trace this record** when a mark is under the pointer, resolved from `data-mark-id` only at that moment. It also keeps the existing image section (`ChartImageMenuSection`).
  - Overlapping points never block **Color by…**, because it acts on the chart.
- **Change — Keyboard parity**
  - The context-menu key and Shift+F10 on a focused chart open the same menu at the panel's corner, matching the current keyboard placement.
- **Change — Docs and changeset**
  - Update `scatter.mdx` and `trace.mdx` to name the new route. Leave the Alt-click wording unchanged, because Alt still traces.
  - Add a `minor` changeset.

### Desired end state

- Right-click a point → **Color by…** → field recolors the chart. **Trace this record** opens the trace for that point.
- Category legend chips still filter. A menu dismissal never filters.
- Native menu access and image export still work.

## Milestone 4: Preview fields while browsing

Previewing fields while browsing the list is worth trying, as long as it costs nothing in history. This milestone keeps preview only if that holds.

- **Change — Preview inside the held edit**
  - Moving the highlight in the list calls `apply()` without `commit()`. Escape calls `cancel()`. Choosing a field calls `commit()`.
  - Track scale IDs created during the session. Before the hold is released, remove every created scale that the final binding does not use, so the host never sees the extras.
  - Debounce previews briefly so fast arrowing does not compute a scale for every row it passes.
- **Change — Docs and changeset**
  - Describe preview in `in-place-editing.mdx`. Add a `patch` changeset.
- **Tests**
  - Browsing several fields then pressing Escape leaves the chart, the scales, and the history exactly as before.
  - Browsing several fields then choosing one leaves one history step and one new scale at most.

### Desired end state

- Arrowing through fields recolors the chart live, and Escape restores it.
- History and the color scale list show only the final choice.
- If preview feels slow on the largest demo dataset, ship without it and record that in the intent docs.

## Milestone 5: Change X and Y the same way

This proves the editable role is a pattern by applying it to the two other most-changed properties.

- **Change — X and Y roles**
  - Axis titles already carry `data-field`. Add **Change field…** to the axis field menu in `AxisFieldActions`, and let Enter on a focused axis title open the role editor. Double-click keeps editing the title text, Cmd-click keeps inspecting, and Alt-click keeps tracing.
  - Reuse `ChartRoleControl`'s editor with role-specific scope text, such as **This chart · X axis**.
  - Changing a field resets that axis's range and log setting in the same undo step. Annotations tied to the old field follow the existing hidden-notice behavior.
- **Change — Docs, example, changeset**
  - Update `scatter.mdx`, `scales-and-axes.mdx`, and `in-place-editing.mdx`. Extend the demo example. Add a `minor` changeset.

### Desired end state

- On a scatter, X, Y, and Color all change through the same editor, each in one undo step.
- Existing axis gestures keep their meaning.
- The role editor is ready for other charts' fields without new infrastructure.

## Cross-cutting verification

- For each PR, run targeted Vitest files, `pnpm --filter exploreda check-types`, and `pnpm check:ui` (no `title` attributes). Run `pnpm check` once before opening the PR.
- For each PR, check in the browser at 1280, 783, and 390 px, including inside chart details. Include `pnpm shot` screenshots in the PR body.
- Check every route against the filtering contract: open, dismiss, choose, and undo all leave filters and linked selection unchanged.

## Open decisions and spikes

- **Where the role label sits.** Decision: legend line, chart header, or a plot corner. Evidence: Milestone 2 screenshots at three widths, with and without a legend and facets. Fallback: the legend line, which already reserves space for color.
- **Whether preview survives.** Decision: keep or drop Milestone 4. Evidence: responsiveness on the largest demo dataset and a clean history after Escape. Fallback: ship instant apply without preview.
- **What a field change does to axis settings.** Decision: reset or keep the axis range and log setting when X or Y changes. Evidence: Milestone 5 trials with annotations and hidden-row notices. Fallback: reset range and transform; leave annotations to the hidden notice.

## Below the cut line

- Reassigning Alt-click to configuration, and the gesture docs across all charts that change requires.
- Role labels on bar, line, histogram, and other chart families.
- Size, measure, aggregation, bins, time grain, sort, and Top N roles.
- Duplicating a shared scale to tune it separately.
- Host opt-in or opt-out for these routes.
- Compact object toolbars, keyboard command search, and edit modes.
- Swap X and Y commands and generic chart conversion.
