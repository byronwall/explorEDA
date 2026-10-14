# First proof: generic panel rasterizer (2026-10-11)

**Question:** Can one generic DOM rasterizer reproduce a mixed Canvas, SVG, and HTML chart panel faithfully in the current theme?

**Answer:** Yes in Chromium, with four required adjustments. The generic rasterizer becomes the default strategy. Only WebGL needs a family hook, and composition keeps its existing artboard path.

## Method

`rasterize.js` clones an `.eda-panel` and inlines every element's computed style. It swaps each `<canvas>` for an `<img>` of its bitmap, hides editor chrome, and wraps the clone in an SVG `<foreignObject>`. It loads that SVG as an image and draws it into a canvas at 2x. `run.mjs` and `family.mjs` set up the demo with Playwright, save the panel's element screenshot as ground truth, and save the rasterized PNG. `diff.mjs` counts pixels whose summed RGB difference exceeds 48.

To rerun, copy the files to `tmp/proof/` and start `pnpm dev:agent`. Then run `node tmp/proof/run.mjs <url>` or `node tmp/proof/family.mjs <url> <example> "<panel title>" <name> [--dark] [--plex] [--expand] [--preserve]`.

## Results (Chromium, 1280 px viewport, 2x)

| Case | Mismatch vs screen | Time | Notes |
| --- | --- | --- | --- |
| Dark bubble scatter: subtitle, HTML legend, 8 annotations, brush | 0.24% | ~230 ms | Remaining diff is the omitted filter button plus antialiasing |
| Same chart with a host web font (IBM Plex Sans), fonts embedded | 0.27% | ~240 ms | |
| Same, fonts **not** embedded | 1.88% | ~160 ms | Falls back to Helvetica; the title clips with an ellipsis |
| Light scatter (penguins) | 0.04% | ~230 ms | |
| Parallel coordinates (Canvas 2D) | 0.02% | ~380 ms | |
| Region map / point map (SVG) | 0.02% | ~200 ms | No basemap tiles, so nothing taints |
| Data table, 344 rows | 1.29% | ~450 ms | Visible rows only, as intended. The custom scrollbar thumb is painted |
| Pivot table, expanded to full height | n/a | ~510 ms | Grows from 976 to 1508 px tall. Horizontal overflow stays clipped |
| 3D scatter facets (WebGL), as-is | 1.19% | | **Blank plots**: three.js discards its drawing buffer |
| 3D scatter with `preserveDrawingBuffer` forced | 0.33% | ~250 ms | Plots captured at the current camera |

The SVG payload is 1.6–7 MB per capture. Embedding one Latin font family adds about 240 KB.

## Findings that change the implementation

1. **Use a `data:` URL, not a blob URL.** With a blob URL, `toDataURL` threw "Tainted canvases may not be exported" once the SVG held a `foreignObject`. Composition's blob path works only because its SVG is pure.
2. **Embed fonts.** The library's themes use system fonts, so they pass without embedding. A host font such as the demo's Plex falls back to Helvetica and clips titles unless its `@font-face` files are inlined as data URLs.
3. **Mark chrome explicitly.** Hiding by tag (`button`) removed the color-legend chips, because they are buttons. Hiding the header's actions and status by class works. Brush handles, the "Drag the edges to adjust, Esc to clear" hint, facet expand icons, the facet pager, and the table scrollbar still render. Each needs an explicit omit marker, extending composition's `data-overlay` convention.
4. **WebGL needs a render-then-read hook.** Forcing `preserveDrawingBuffer` proves the pixels are reachable. The shipped approach should render a frame and read it synchronously, without a global buffer setting.

## Browser spike (2026-10-12)

- **Firefox:** the dark scatter and parallel coordinates matched, with fonts embedded.
- **WebKit:** the scatter matched. Parallel coordinates drew no lines until the canvas got a warm-up draw: WebKit decodes images nested in an SVG image only after a first draw. With the warm-up, the export is visually correct.
- **Memory:** a WebKit run of the large dark-scatter case, with two captures and embedded fonts, used enough memory to stall the machine. Run one engine and one case at a time. `pnpm export-proof` does that.
