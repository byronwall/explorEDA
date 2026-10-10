# Agent guide

A map of the code and the commands that work, for agents changing this repo. Read it before a broad search; most tasks touch a few known files. Rules live in [AGENTS.md](../AGENTS.md) and [UI defaults](ui-defaults.md).

## Where things live

| Concern                                                   | Start here                                                                                                                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Store: rows, charts, filters, save/restore                | `packages/explorEDA/src/providers/DataLayerProvider.tsx` (zustand). `updateChart(id, partial)` is the one write path for chart settings.                                                                                                                                                                                                                                                                                    |
| Host callback                                             | `onStateChange` in the same file. It fires after every store change that alters `saveToStructure()`, unless an in-place edit holds it (`holdStateChanges`). It is not debounced.                                                                                                                                                                                                                                            |
| Settings types                                            | `src/types/ChartTypes.ts` (`BaseChartSettings`, `AxisSettings`), `src/types/SavedDataStructure.ts`                                                                                                                                                                                                                                                                                                                          |
| Defaults                                                  | `src/utils/defaultSettings.ts`. `DEFAULT_AXIS_SETTINGS` writes `min: 0, max: 100` into every axis. Those keys are a dead placeholder, marked `@deprecated`; axis ranges live in `xAxis.limits` and `yAxis.limits`. Never give `min` or `max` meaning.                                                                                                                                                                       |
| Saved-data validation                                     | `src/utils/saveDataUtils.ts` (`isAxis`, `validateSavedData`). A new setting that fails validation makes restores reject the whole save.                                                                                                                                                                                                                                                                                     |
| Chart registry                                            | `src/charts/registry.ts`, `registerAllCharts.ts`, and one `src/components/charts/<Type>/definition.ts` per type                                                                                                                                                                                                                                                                                                             |
| Chart panel: header, title, actions, details dialog, keys | `src/components/PlotChartPanel.tsx`                                                                                                                                                                                                                                                                                                                                                                                         |
| Grid placement and drag                                   | `src/components/ChartGridLayout.tsx` (react-grid-layout, `draggableHandle=".drag-handle"`)                                                                                                                                                                                                                                                                                                                                  |
| Settings popover and tabs                                 | `src/components/ChartSettingsContent.tsx`, `src/components/settings/*Tab.tsx`. Valid edits apply live; Reset restores the values from when the popover opened.                                                                                                                                                                                                                                                              |
| Axes                                                      | `components/charts/Axis/axisPlan.ts` plans ticks, labels, and guides. `AxisLayer.tsx` draws them (`PlannedAxes`, `PlannedGrid`). `numericScale.ts` makes linear and symlog scales.                                                                                                                                                                                                                                          |
| SVG chart shell                                           | `components/charts/BaseChart.tsx`: plot clip, brush, guide tracing, empty-plot clicks. Scatter draws its own `ScatterPlot/ScatterSvg.tsx`.                                                                                                                                                                                                                                                                                  |
| Domains                                                   | Each renderer builds its own scale: `BarChart/barPlan.ts`, `seriesBarPlan.ts`, `ScatterPlot/scatterAxis.ts`, `LineChart/timeSeriesPlan.ts`, `RowChart.tsx`, `BoxPlot.tsx`. Grep `numericScale(` to find them all.                                                                                                                                                                                                           |
| Tracing (Alt-click)                                       | `components/charts/trace/` (`ChartTraceScope`, `useTraceSource`)                                                                                                                                                                                                                                                                                                                                                            |
| Axis field menu and Command-click inspect                 | `components/charts/AxisFieldActions.tsx`. It acts on elements with `data-field`, and on axis bands when the panel passes `axisItems` (range and title actions).                                                                                                                                                                                                                                                             |
| Dashboard text (DSL)                                      | `src/lib/dsl/compile.ts` (keys such as `x.min`, `y.scale`), `export.ts` (diffs settings into keys generically), `settingKeys.ts`                                                                                                                                                                                                                                                                                            |
| Demo history and undo                                     | `apps/demo/src/savedViewsHistory.ts` (`pushCheckpoint`), `SavedViewsWorkspace.tsx` (`capture`). Every `onStateChange` becomes one undo step.                                                                                                                                                                                                                                                                                |
| How the demo loads the library                            | `apps/demo/exploredaSource.ts`. Dev and demo tests use library source; set `EXPLOREDA_DIST=1` for the build.                                                                                                                                                                                                                                                                                                                |
| In-place editing                                          | `components/charts/InPlace/`. `useChartEdit` applies through `updateChart` and holds `onStateChange` until the edit ends: one edit, one undo step, and Escape reports nothing. `useTitleEditing` handles chart titles; `useAxisEditing` handles axis ranges, axis titles, axis drag, and menu items. `InlineTextEditor` and `AxisLimitFields` are the shared inputs, and `axisDrag.ts` holds the pure pan and stretch math. |
| Axis limits                                               | `components/charts/Axis/axisBounds.ts`: `boundedDomain(auto, axis)` applies `limits` over a renderer's automatic domain; `numericAxes(settings)` says which axes can take limits. Call it wherever a renderer builds a numeric domain, and skip `.nice()` when `hasAxisBounds`.                                                                                                                                             |
| Axis bands                                                | `AxisLayer.tsx` draws an invisible `.eda-axis-edit` group per numeric axis, under the tick labels. It carries `data-axis-edit`, `data-domain`, `data-range`, and `data-scale-type`, which the editors read and invert.                                                                                                                                                                                                      |
| Initiatives                                               | `docs/intent/<slug>/`: `intent-brief.md`, `initiative-map.json`, and when planned, `implementation-plan.md`                                                                                                                                                                                                                                                                                                                 |
| Work items and feedback                                   | Product Grid in `pgm/data`, read and written with the `pgm` CLI through `pnpm -s pgm <command> --json 2>/dev/null`. Start with `node list --roots --compact` or `node list --subtree <id> --with-ancestors`. Commit `pgm/data` changes like any other file.                                                                                                                                                                 |

## Commands

```bash
pnpm --filter exploreda exec vitest run src/components/charts/BarChart
```

```bash
pnpm --filter exploreda check-types
```

```bash
pnpm --filter demo dev --port 5291 --strictPort
```

```bash
pnpm check
```

`pnpm check` takes about a minute. It builds the package, so run it once before a PR, from one worktree at a time.

```bash
pnpm -s pgm node list --roots --compact --json 2>/dev/null
```

```bash
pnpm changeset:add minor "What users can now do."
```

Format only the files you changed: `npx prettier --write <files>`. Formatting a whole folder rewrites unrelated files. ESLint's `curly` warnings already exist across the codebase, and `pnpm check` does not run ESLint.

## Traps

- **Worktrees under `.claude/worktrees/` are git-ignored** through `.git/info/exclude`.
  - Tailwind v4 skips git-ignored files when it detects sources, so `packages/explorEDA/src/index.css` names its folder with `@source "./"`. Without it, the demo dev server drops utilities that only the library uses, such as `grid-cols-3`, and screenshots mislead.
  - The dev server only ever adds Tailwind classes. After changing `@source` or the files Tailwind scans, restart it before you judge the styles.
  - Editor diagnostics there do not resolve the `@/` alias. Trust `check-types`.
- **zsh expands unquoted globs.** Write `grep -rn x src --include='*.tsx'`, quoted, or use `rg`.
- **Skip raw research when searching docs.** `docs/intent/*/raw/` holds large HTML: `rg pattern docs --glob '!**/raw/**'`.
- **A chart title is the grid's drag handle.** A press there starts a react-grid-layout drag, and the grid's placeholder receives the release. `click` and `dblclick` therefore never reach the title. Act on `mousedown` (`event.detail === 2` for a double press, as `useTitleEditing` does) or `mouseup` capture, as Alt-click title tracing does, and stop the press if it must not drag. Mark inputs inside a handle with `data-inplace-editor`, which the grid's `draggableCancel` skips.
- **Chart details is a modal Radix dialog.** A popover portaled to `<body>` loses focus to the dialog's focus trap, so pass `container={panel.closest("[role='dialog']")}` to `PopoverContent`, as the axis range popover does. The details Escape handler (`hasNestedLayer` in `PlotChartPanel.tsx`) yields to layers outside the dialog, to `[data-inplace-editor]`, and to popover content inside it.
- **`onStateChange` is not coalesced** unless something holds it. A settings input that calls `updateChart` on each keystroke records one demo undo step per keystroke. For a continuous edit, wrap it in `useChartEdit` (or `holdStateChanges`) so it is one step.
- **Axis labels and tick labels take the pointer** (`pointerEvents="auto"` with `data-field`), so they sit above anything drawn under them in `PlannedAxes`, such as the axis bands. Map a label back to its band, as `axisEditTarget` in `useAxisEditing.tsx` does.

## Tests

- Vitest with Testing Library and jsdom. Call `registerAllCharts()` in `beforeAll` before rendering charts.
- Stub `ResizeObserver`. For pointer gestures, set `window.PointerEvent = MouseEvent` as `ScatterSvg.test.tsx` does.
- jsdom has no layout: `getBoundingClientRect()` returns zeros, so pass `clientX` and `clientY` values relative to 0.
- Render `PlotChartPanel` inside `DataLayerProvider` with `charts={[...]}` and read settings back through `useDataLayer`. See `components/__tests__/PlotChartPanel.test.tsx`.

## Browser checks and screenshots

- AGENTS.md requires real input at 1280, 783, and 390 px.
- For PR screenshots, use a standalone Playwright script in your scratch directory (`npm i playwright` there; Chromium is already cached). Use `deviceScaleFactor: 2` and `locator.screenshot()` on the panel, saved under `tmp/`.
- The built-in browser pane scales its screenshot frame and can show a frame from before the last action. Read state with `javascript_tool` or `read_page`, not from the image.
