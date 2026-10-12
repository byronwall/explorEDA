---
title: "Export charts and analyses for sharing — shape brief"
slug: "analysis-export"
phase: shape
status: current
last_updated: "2026-10-11"
---

# Export charts and analyses for sharing: what we are adding

**Outcome:** Any chart can leave explorEDA as a PNG that matches what is on screen, in one action.

**Primary flow:** Chart → menu, right-click, or shortcut → Copy image / Download image → paste into a slide, doc, or chat.

## Feature scope

```text
Chart image export
├── PLANNED ADDITIONS
│   ├── Actions: Copy image, Download image
│   │   ├── Chart header: new "More" menu (first overflow menu on the panel)
│   │   ├── Right-click on the chart surface: same two items
│   │   └── Shortcut while a chart has focus (letter key, listed in the ? dialog)
│   ├── Image contents: what is visible for that chart
│   │   ├── Title, subtitle, plot, axes, legends, annotations, value labels
│   │   ├── Selection emphasis as shown; current theme and background
│   │   └── Excludes header buttons, popovers, tooltips, focus rings, resize handles
│   ├── Extent rules
│   │   ├── On-screen size at 2x
│   │   ├── Bounded content at full extent (row charts, pivot and summary tables)
│   │   └── Data table: visible rows only
│   ├── Family coverage: every chart type gets the actions
│   │   ├── Canvas and WebGL layers drawn into the image (3D at current camera)
│   │   └── Not-yet-capturable family: actions disabled with a reason tooltip
│   ├── Composition: moves onto the shared actions; its artboard path becomes one capture strategy
│   └── Public API: exportChartPng(chartId) → { blob, width, height } for a mounted chart
└── LATER POSSIBILITIES
    ├── Opt-in filter or provenance caption
    ├── Size presets, copy and download helpers on the API
    └── Headless rendering: separate seed, not this initiative
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Copy image on an https page in a current browser | PNG on the clipboard. A short "Copied" confirmation appears. |
| Clipboard unavailable (http, old browser) | Copy fails with a message that offers Download instead. Download always works. |
| Download image | File named from the chart title and date, such as `price-vs-carat-2026-10-11.png`. |
| Dark theme active | Dark image with an opaque background, matching the screen. |
| Row chart with 60 categories scrolled to the top | All 60 rows appear. The image is taller than the panel. |
| Data table with 10k rows | Only the rows in view, with header and column widths as shown. |
| Brushed selection on a scatter | Selected points emphasized and others dimmed, as on screen. |
| Hover tooltip open at capture time | Not in the image. |
| `exportChartPng` for a chart not mounted | Rejects with "Chart is not rendered." No headless fallback. |

## Decisions and boundaries

**Appetite:** One capability with several entry points and one capture core. No new settings, saved state, or layout changes. Exporting must never change the saved layout.

**Key decision:** All entry points and the public function go through one `captureChart(chartId)` seam that returns a PNG Blob. Each family can register a capture strategy behind it: a generic DOM-panel rasterizer, the composition artboard path, and WebGL frame grabs. Copy, Download, the shortcut, and the API are thin wrappers. Every family is reached through one seam with no per-family UI, and "not capturable yet" becomes one flag rather than scattered checks.

**Key decision:** Capture from the live, mounted chart, not by re-rendering offscreen. Live capture is the only way to guarantee "matches the screen" now. Re-rendering is the headless seed's problem. Full-extent capture of a bounded chart means briefly measuring its natural size, not re-laying it out.

**Boundary:** No advanced mode, captions, size controls, multi-chart output, slides, or PDF. A family whose capture fails a fidelity check ships disabled with a reason tooltip, not degraded.

**First proof:** **Try:** Capture a dark-theme scatter that has a title, subtitle, HTML color legend, an annotation, and a brushed selection. Use a generic panel rasterizer that inlines SVG, swaps each canvas for its bitmap, and keeps HTML text. **Observe:** Compare the PNG against the screen for fonts, text bounds, Canvas point alignment, legend placement, selection dimming, and the absence of controls. **Decide:** If the generic rasterizer matches, it becomes the default strategy and only WebGL and composition need their own. If fonts or HTML layout drift, switch to per-family strategies that compose SVG and Canvas directly and draw legend and title text, and re-scope coverage.

[Intent brief](intent-brief.md)
