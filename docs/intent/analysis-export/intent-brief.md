---
title: "Export charts and analyses for sharing"
slug: "analysis-export"
phase: intent
status: current
last_updated: "2026-10-11"
---

# Export charts and analyses for sharing

## My read

An analyst should be able to take one chart out of explorEDA as a PNG and paste it wherever the work is happening. That might be a slide, a written doc, a chat thread, an email, or a ticket. The common case is ongoing work, not a finished publication. The chart supports a discussion, so speed and fidelity matter more than layout control.

"Fidelity" means the image shows what is visible on screen for that chart: title, subtitle, plot, axes, legends, annotations, and the current selection highlight. It uses the current theme, at the on-screen size, at 2x density. Editor UI such as popovers, focus rings, hover tooltips, and header buttons stays out.

Whole-report export (a deck or a PDF) is out of scope. An "export everything" button exists in other tools, and in Byron's experience it was rarely useful. It points to a deeper need: rendering a chart to PNG without a fully initialized client. That need is now its own seed, [headless chart rendering](../headless-chart-rendering/intent-brief.md).

The live workspace's editorial styling remains a separate initiative. Export carries whatever the user authored.

## What matters most

- Copy or download one chart as a PNG that matches the screen.
- Make it fast: one action from the chart, then paste.
- Give every chart family the action. A family that cannot yet capture says so plainly instead of producing a broken image.
- Let embedding apps call the same export from code.

## The intended experience

The analyst finishes a chart and opens the chart's menu, right-clicks the chart, or presses a shortcut. They choose **Copy image** or **Download image**. Copy puts a PNG on the clipboard. Download saves a sensibly named file. They paste it into a slide or a Slack thread, and it looks like the chart they were just looking at.

A host application that embeds explorEDA calls a public function with a chart id. It gets back the same PNG as a Blob, with its pixel size, and builds its own button or batch flow around it.

## Boundaries

### Must be true

- The image shows the chart's visible content in the current theme, with selection emphasis preserved.
- Charts with a bounded extent export at full extent, even when part of it is scrolled out of view. Examples include a row chart with a fixed category count and pivot or summary tables.
- The raw data table exports only its visible rows. An image never carries thousands of rows.
- 3D exports the current camera view. Maps export as drawn.
- Composition shares the same actions, shortcut, and public function. Its artboard path becomes one capture strategy rather than a separate feature.
- The public function requires a mounted chart.

### Must be avoided

- An "advanced mode" for now. That means no filter caption, source line, background option, or options popover.
- Size presets, custom dimensions, or re-layout before capture.
- Slides, PDF, multi-chart, and whole-dashboard output.
- A native browser screenshot passed off as authored output, or temporary editor UI in the image.

## What seems settled

- Single chart; PNG; copy and download; on-screen size at 2x; current theme.
- Entry points: the chart header menu, the chart's right-click menu, and a keyboard shortcut.
- Every family gets the action, with an honest message where capture is not ready.
- A public `exportChartPng` method on the `ExplorEda` ref, returning a Blob and its size.
- Headless rendering is a separate future seed, not part of this release.

## Possibilities, not decisions

- An opt-in caption with filter scope or provenance, if real sharing shows readers losing context.
- Copy and download convenience helpers on the public API.
- Size presets for slides or doc columns.

## Current reality that matters

- Composition copies its artboard as a 2x PNG to the clipboard (PR #214) through `compositionOutput.ts`. Its SVG-only path does not cover ordinary charts.
- Ordinary charts mix SVG, Canvas (scatter, scatter matrix, parallel coordinates), WebGL (3D scatter), and HTML (titles, color legends, tables).
- The 3D renderer does not keep its drawing buffer, so capture must render a frame on demand or read during a frame.
- Maps draw SVG geometry with no tile basemap, so cross-origin tainting does not apply.
- The chart header is a row of icon buttons with single-letter shortcuts (S, V). It has no overflow menu yet.
- Saved annotations draw as plain SVG in `g.eda-annotations` and carry into a rasterized SVG as drawn.

## Next step after confirmation

The [shape brief](shape-brief.md) defines the action. Its first proof passed in Chromium, and the [implementation plan](implementation-plan.md) sequences three stacked PRs.

See the [reference packet](references/README.md).
