---
title: "Chart grid direct manipulation — shape brief"
slug: "chart-grid-direct-manipulation"
phase: shape
status: current
last_updated: "2026-09-22"
---

# Chart grid direct manipulation — shape brief

## Recommendation

Keep both changes inside the current chart-grid and chart-creation paths. The grid can use `react-grid-layout` or a small local replacement, whichever makes drag, edge resize, and placement simpler. For creation, track a hovered empty grid position, wait about 500 ms, then show a small labeled plus there. Open the existing chart-type menu and create the chosen chart with a layout anchored to that region. Keep the toolbar Add chart path as the stable route on narrow and touch layouts.

## Problem and appetite

The current controls pull the pointer away from the intended edge or empty area. This is two focused UI changes.

## Core shape

Use the current grid layout as the only source of chart positions. Keep the hover target transient.

## Current fit

- **Reuse:** The `ChartGridLayout` boundary, `ChartCreationButtons`, `useCreateCharts`, the chart registry, and saved `ChartLayout`. The installed grid library is optional.
- **Add:** More resize handles and one transient empty-space add control.
- **Avoid:** A second chart settings factory, a new layout store, or changes to saved-state format.

## How to make this go better

- Prove resizing on a left and top edge first. These reveal whether the grid keeps the opposite edge fixed.
- Use the chart menu's current choices and defaults. Only the initial layout needs a new input.
- Test placement beside and below a chart. Empty pixels alone do not guarantee the default chart rectangle fits.
- Keep the new control transient. The existing toolbar action covers touch and keyboard access.

## First proof

On a desktop grid, drag the left edge of one chart left and save the layout. The chart grows left while its right edge stays fixed; a reload preserves the result. This checks the chosen grid behavior and persistence path before the hover placement work.

## Rabbit holes and no-gos

Do not add freeform pixel positioning, automatic rearrangement, a new responsive layout format, or a full keyboard grid editor. If the chosen default chart cannot fit at the hovered point, use a clear nearby empty fit or keep the menu action from creating an overlapping chart.

## Plan handoff

Prove edge resizing first. Then use an optional initial layout in the current creation path for empty-space placement.
