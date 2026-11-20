---
title: "Standalone charts: implementation plan"
slug: "standalone-charts"
phase: plan
status: current
last_updated: "2026-11-19"
---

# Standalone charts: implementation plan

## Plan at a glance

1. **M1 — Read-only `<Chart>`.** Every chart type draws from `data` plus a partial `config`, side by side, hover only.
2. **M2 — Scoped CSS.** A host page keeps its own styles with `chart.css` loaded.
3. **M3 — Controlled editing.** `onConfigChange`, the gear popover, `<ChartSettings>`, and `fields`.
4. **M4 — Dashboard text config.** Only if it stays small; otherwise it moves below the cut line.

M1 first because it proves the main bet: the existing data layer can host one chart with no workspace. M2 comes before editing because style clashes block real use of even a read-only chart. Each milestone ships as one PR in a stack.

## Implementation strategy

- **Seam:** `DataLayerProvider` + `ChartRenderer`, as in `packages/explorEDA/src/docsKit/ChartSettingsSurface.tsx`. `<Chart>` builds a `SavedDataStructure` with one chart and passes it as `savedData`.
- **Defaults:** `normalizeChart` in `src/lib/dsl/normalize.ts` fills a partial chart from its type's defaults. Add `id`, `layout`, and `filters: []` before it.
- **New entry:** `src/chart/index.ts`, listed in `entries.json` as `chart`, with an `./chart` export in `package.json`. The entry calls `registerAllCharts()`, as the docs kit does.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/chart` for the smoke test, and `pnpm --filter demo dev` for the proof page. The demo runs the library from source.
- **Proof page:** a docs page `apps/demo/src/docs/pages/standalone-charts.mdx` with a live example of two charts side by side from plain rows.
- **Rollback:** the work is additive. Removing the entry removes the feature; the workspace does not import it.

## Milestone 1: Read-only `<Chart>`

**Changes**

- `src/chart/Chart.tsx`: props `data`, `config`, `title`, `width`, `height`. Measure the parent with a `ResizeObserver` when `width` or `height` is absent; reuse the `useWidth` pattern from the docs kit and extend it to height. Wrap the plot in an element with `eda-workspace` (until M2 replaces it), `data-eda-theme`, and `data-chart-id`.
- `src/chart/config.ts`: `toSavedData(config)` and the `ChartConfig` type, a union of each chart's settings with `id`, `layout`, and `filters` optional.
- Selection off: give `DataLayerProvider` a `selectable={false}` prop that makes `updateChart` drop `filters`. Check `workspaceFilters` writes too. Pass `readOnly` to hide in-place title and axis editing; find the gate in `components/charts/InPlace/useChartEdit.ts` and the title and axis hooks.
- `entries.json`, `package.json` exports, and `scripts/build-types.mjs` if it needs the entry.
- Docs page and live example with a bar chart and a scatter side by side. Add the page to the docs navigation.
- Changeset: `minor`, "Draw one chart from rows and a config with `Chart` from `exploreda/chart`."

**Verification**

- `src/chart/Chart.test.tsx` (jsdom): for each registered type, render `<Chart>` with a minimal valid config over a small fixed dataset and expect no error boundary and a drawn plot. This is the first proof.
- A test that a click on a bar leaves the chart's `filters` empty.
- `pnpm shot` of the docs page at wide, intermediate, and narrow widths.

### Desired end state

- two charts sit side by side on a docs page, built from a dozen plain rows, and every chart type passes the smoke test or appears on a written unsupported list.

## Milestone 2: Scoped CSS

**Changes**

- `src/chart/chart.css`: Tailwind theme and utilities without preflight. Put the theme variables under `.eda-chart`, not `:root`. Import it from the entry, so tsup writes `dist/chart.css`, as it writes `docs-kit.css` today.
- Replace the M1 `eda-workspace` wrapper with `.eda-chart`. Copy the few `.eda-workspace [data-chart-id]` rules the plot needs.
- Portals: tooltips and popovers render to `document.body`, outside the wrapper. Give portal content the `.eda-chart` class, or pass the wrapper as the portal container (`components/ui/popover.tsx` already takes `container`).

**Verification**

- The docs example page loads `chart.css` beside a host button styled by the page. A screenshot shows the host button unchanged and the chart tooltip styled.
- `dist/chart.css` has no `:root` rule and no element-level reset. Check it with `rg` in the M2 PR.

### Desired end state

- a host imports `exploreda/dist/chart.css` and nothing outside the charts changes.

## Milestone 3: Controlled editing

**Changes**

- `Chart`: `onConfigChange` and `fields` props. Pass the provider's `onStateChange`, take `charts[0]`, remove `id`, `layout`, and `filters`, and call `onConfigChange`. The provider's fingerprint check stops the echo loop when the host passes the result back.
- Read-only rule: no `onConfigChange` means no gear and no in-place editing.
- Gear button in the chart's top-right corner opens `ChartSettingsContent` in a popover.
- `<ChartSettings>`: its own provider, same props, renders `ChartSettingsContent`. The host links it to a `<Chart>` through shared state; the two need no shared store.
- `fields`: limit the columns the settings panel offers. Find where `ChartSettingsContent` reads column names, and filter there through a provider prop.
- Docs page: an editable example with a gear, and one with a `<ChartSettings>` beside the chart.

**Verification**

- Test: change a setting in the popover; expect `onConfigChange` once, with the new value and no `filters`.
- Test: with `fields={["Price"]}`, the field picker offers only Price.
- Browser check: edit the bar field in the side panel; the chart redraws.

### Desired end state

- a host can offer runtime editing, keep the config in its own state, or turn editing off by passing no callback.

## Milestone 4: Dashboard text config (conditional)

**Spike:** call `compileDocument(text, { rows: data })` from `src/lib/dsl/compile.ts` on one chart line and take the first chart.

**Decision rule:** ship it if one line compiles to the same chart as its object form and the change stays under about 40 lines with its test. Otherwise, move it below the cut line and record why.

### Desired end state

- `config="scatter x=Price y=Rating"` draws the same chart as the object form. `onConfigChange` still reports objects.

## Retire this initiative

After the last milestone lands, the same agent retires this initiative in a final stack layer:

- Durable docs that receive the lasting facts: `apps/demo/src/docs/pages/standalone-charts.mdx` and the "Draw one chart" section of `packages/explorEDA/README.md`.
- Remove this planning folder and add the closure record to `docs/initiative-history.json`.

## Below the cut line

- A framework-free `render(el, data, config)`.
- Linked filtering between standalone charts (a `<ChartGroup>`).
- Lean imports that register only some chart types.
- Image export from a standalone chart.
- Dark theme switching beyond the existing `theme` setting.

## Open decisions and spikes

- **Unsupported types:** if a chart type needs workspace context that `<Chart>` cannot give (for example Composition or Markdown), M1 lists it as unsupported rather than adding that context.
