---
title: "Export charts and analyses for sharing — implementation plan"
slug: "analysis-export"
phase: plan
status: current
last_updated: "2026-10-11"
---

# Export charts and analyses for sharing: implementation plan

## Plan at a glance

The [first proof](references/first-proof/README.md) settled the mechanism. A generic panel rasterizer matched the screen within 0.3% for scatter, parallel coordinates, maps, and light and dark themes. It does this by inlining computed styles, swapping canvases for bitmaps, and drawing a `foreignObject` SVG through a `data:` URL. Only WebGL needs its own hook. So the work is one capture core plus thin entry points, in three stacked PRs:

1. **Copy and Download from the chart header** for every non-WebGL family, with explicit omit markers on editor chrome and font embedding. 3D shows the action disabled with a reason. This alone delivers the main job: paste a chart into ongoing work.
2. **Complete coverage:** full extent for bounded charts, a WebGL capture hook, and composition moved onto the shared action.
3. **The other entry points:** right-click menu items and a public method on `ExplorEdaHandle`.

**Pushback on the shape:** expose the public function as `ExplorEdaHandle.exportChartPng(chartId)` rather than a free function. Hosts already hold this ref for `getSettings`. It scopes the lookup to one workspace, which matters when a page mounts two, and it carries the "chart must be mounted" rule by construction.

**Main remaining risk:** Safari and Firefox. They are unverified, and WebKit has tainted `foreignObject` canvases before. Milestone 1 opens with that check because it decides whether a fallback strategy is needed.

## Implementation strategy

- **First proof:** done (Chromium). See the [first-proof results](references/first-proof/README.md).
- **Primary seam:** `captureChart(panel, options) → Promise<{ blob, width, height }>` in a new `components/charts/export/` module. A strategy registry is keyed by chart type: `generic` (default), `composition` (wraps `artboardPng`), and `webgl` (render-then-read). Copy, Download, the context menu, the shortcut, and the handle method all call it.
- **Chrome marker:** `data-export="omit"` on anything that is editor UI. The rasterizer sets those nodes and their descendants to `opacity: 0`, which keeps layout. Composition's `data-overlay` is treated the same way.
- **Fast local loop:** `pnpm --filter exploreda exec vitest run src/components/charts/export` for pure parts (filename, omit selection, strategy choice, font-face rewriting). For pixels, run `pnpm dev:agent` plus a ported proof script, `node scripts/export-proof.mjs`. It captures a fixed set of example panels and fails above a mismatch threshold.
- **Local dependencies:** none beyond the demo server. jsdom has no layout or canvas, so pixel checks live in the Playwright script, not vitest.
- **Rollout and rollback:** additive UI only, with no saved-state change. Each family can be switched to "not capturable" in the registry. Reverting a PR removes its entry points without touching layouts.

## Milestone 1: Copy or download a chart image from its header

This is the core job, shipped for the families the proof covered. It excludes full-extent capture, WebGL, composition, right-click, and the public API.

- **Spike — Safari and Firefox capture**
  - Decision required: whether the generic strategy works in WebKit and Gecko, or needs a fallback there.
  - Evidence to gather: run the proof script under Playwright `webkit` and `firefox` (`pnpm exec playwright install webkit firefox`), and check by hand in Safari.
  - Fallback: if WebKit taints, add a `composite` strategy that serializes each SVG, draws each canvas directly, and draws title and legend text with `fillText`. Use it only where the generic one throws.
- **Change — Capture core** (`components/charts/export/`)
  - Port `rasterize.js` to TypeScript. Encode with a `data:` URL, inline computed styles while skipping custom properties and geometry attributes, convert canvases to images, and copy input values.
  - Embed fonts: collect `@font-face` rules, fetching cross-origin sheets by URL, and inline only the faces the panel uses as data URLs. Cache them per session. If a font cannot be fetched, export anyway with the fallback font.
  - Fill the background with the panel's resolved surface color, so dark exports are opaque.
- **Change — Omit markers.** Add `data-export="omit"` to `.eda-panel-actions`, `.eda-panel-status`, resize handles, scatter brush handles and brush hint text, facet expand buttons and the facet pager, and the data-table scrollbar. Add a vitest test that each marked element exists in rendered panels.
- **Change — Header action.** Add a "More" dropdown to the `PlotChartPanel` header with Copy image and Download image. It is the panel's first overflow menu and follows UI defaults and tooltips. Copy writes a `ClipboardItem` with a pending promise inside the gesture, as `copyArtboardPng` does. On failure it shows a message that offers Download. Download names the file `<slugified-title>-<yyyy-mm-dd>.png`.
- **Change — Shortcut.** E copies the image and Shift+E downloads it. Add both to the panel key handler next to S, D, X, V, and C, and to `KeyboardShortcutsDialog`.
- **Change — Honest disabling.** Families with no working strategy (3D for now) show the items disabled, with the tooltip "Image export isn't available for 3D charts yet."
- **Change — Changeset** (minor): "Copy or download any chart as a PNG from its header menu or with E / Shift+E."

### Desired end state

- From the menu or shortcut, a scatter, line, bar, row, histogram, box, heatmap, ECDF, calendar, map, Sankey, parallel-coordinates, pivot, summary, metric, markdown, or data-table chart copies and downloads a PNG that matches the screen.
- `scripts/export-proof.mjs` passes under 1% mismatch for the proof panels in light and dark.
- Screenshots of the menu at 1280, 783, and 390 px, plus sample exports, are attached to the PR.

## Milestone 2: Every family, at full extent

This milestone closes the gaps the proof found. Each change sits behind the same seam.

- **Change — Full extent.** For charts registered as bounded (row chart, pivot, summary), mount the clone off-screen and release vertical scroll and height limits on the scroll box and its ancestors. Then measure and capture. The data table keeps its viewport. Horizontal overflow stays visible-only.
- **Change — WebGL strategy.** `ThreeDScatterChart` registers a capture hook. It renders one frame and calls `toDataURL` in the same task, so it needs no global `preserveDrawingBuffer`. The generic rasterizer uses the hook's bitmap in place of the canvas. Remove the 3D disable.
- **Change — Composition.** Composition's header gets the shared menu through the `composition` strategy (`artboardPng`). Its separate Copy PNG button in `CompositionInspector` is removed.
- **Change — Changeset** (patch): "Image export now covers 3D charts and compositions and includes every row of bounded charts."

### Desired end state

- A 60-category row chart exports all of its rows. The 3D facet grid exports at its current camera angles. Composition uses the same menu and shortcut.
- The proof script covers the pivot, 3D, and composition panels.

## Milestone 3: Right-click and the host API

These entry points sit on a finished core.

- **Change — Context menu.** Add Copy image and Download image to the chart surface's right-click menu. Merge them into the table and composition menus that already exist rather than adding a second one.
- **Change — Host method.** Add `ExplorEdaHandle.exportChartPng(chartId, { pixelRatio? }) → Promise<{ blob, width, height }>`. It rejects with "Chart is not rendered." when no mounted panel matches within this workspace. Export the result type and document it in the library README and demo docs.
- **Change — Changeset** (minor): "Right-click a chart to copy its image, and call `exportChartPng` on the ExplorEda ref to get a chart PNG from code."

### Desired end state

- Right-click works on every family, and the host method returns the same bytes as Download.
- A vitest test covers the not-rendered rejection and workspace scoping.

## Open decisions and spikes

- **Browser coverage** (Milestone 1 spike): whether WebKit and Gecko need the `composite` fallback. If they fail and the fallback grows, ship Chromium-quality export first and disable Copy where capture throws, with a reason.

## Below the cut line

- Captions, provenance lines, size presets, transparent backgrounds, and any advanced mode.
- Multi-chart, dashboard, slide, and PDF output.
- Off-screen and headless export (see [headless chart rendering](../headless-chart-rendering/intent-brief.md)).
- Horizontal full extent for wide tables.
- Copy and download helpers on the host API.
