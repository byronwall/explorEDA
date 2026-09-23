---
title: "Chart grid direct manipulation — implementation plan"
slug: "chart-grid-direct-manipulation"
phase: plan
status: current
last_updated: "2026-09-22"
---

# Chart grid direct manipulation — implementation plan

## Plan at a glance

Deliver two independent visible improvements. First, enable resize from every side of existing charts. The current `react-grid-layout` instance writes `x`, `y`, `w`, and `h` through `updateChartLayouts`, so the saved-data shape need not change. It is acceptable to remove that historical dependency if a small local grid is simpler. Compare the real drag, resize, collision, persistence, and narrow-layout behavior before choosing. Confirm left and top drags before extending the visual treatment to all edges and corners.

Second, add chart creation from empty grid space. The grid and chart creation paths currently do not exchange an initial position: `useCreateCharts` always appends a six-by-four chart below the others. Extend that path so the existing chart type defaults can receive a selected empty layout. The hover control must derive its target from the current column count, row height, padding, and occupied chart rectangles. It must not appear over charts or interrupt a drag. A chosen chart should occupy the indicated free area without moving existing charts. The toolbar Add chart action remains the fallback where hover is unavailable.

Both changes use local state. No external service, data migration, or new dependency is needed.

## Implementation strategy

- **First proof:** Left-edge resize grows a chart to the left and survives save and restore.
- **Primary seam:** `ChartGridLayout` owns pointer and grid geometry; `useCreateCharts` accepts an optional initial layout for the menu's chosen type.
- **Fast loop:** Focused package test, `pnpm check:ui`, then browser checks at 1280, 783, and 390 pixels.
- **Rollback:** Each behavior can be removed without changing the saved layout schema.

## Milestone 1: Resize from any side

- Expose north, south, east, and west resize edges, with useful corners. Use the installed grid or a small replacement, whichever meets the behavior with less code and complexity.
- Keep handles clear of chart actions and plot marks. Keep the current desktop-only resize rule at narrow widths.
- Verify left, top, right, and bottom drags. Check minimum size, nearby charts, saved layout, and restored layout. Preserve the unchanged opposite edge where space permits.

### Desired end state

A user can resize from the edge they approach. No saved chart moves or changes size merely from loading the page.

## Milestone 2: Add a chart in empty grid space

- Detect a stable hover in empty grid space and reveal a small plus after about 500 ms. Hide it when the pointer leaves, enters a chart, or starts dragging or resizing.
- Use the existing chart registry menu. Pass a grid-aligned target into the normal chart creation path.
- Place the new chart in that empty region when its rectangle fits. Handle a target near charts or grid limits without overlap or unexpected movement of existing charts.
- Keep the toolbar Add chart path unchanged for narrow screens, touch, and keyboard use.

### Desired end state

At a desktop width, a user can hover beside or below an existing chart, choose a type, and see the new chart appear in that free area. Saving and restoring preserves its layout.

## Verification

- Run focused package checks and `pnpm check:ui`. Run `pnpm check` after this broad UI change.
- Use real pointer input at 1280 pixels for edge resize and hover placement. Check 783 and 390 pixels for chart visibility and the toolbar add path.
- Confirm the plus and menu have accessible names and do not create native title tooltips.

## Below the cut line

- Arbitrary pixel placement, drag-to-draw chart size, moving existing charts to make room, and a separate touch placement gesture.
- A new chart menu, layout schema, or generic grid abstraction. A small local replacement for the current grid remains in scope.

## Tickets

- `exp-f9tk` — Resize charts from any edge.
- `exp-0md7` — Add a chart from empty grid space.
