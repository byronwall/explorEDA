---
title: "Chart grid direct manipulation"
slug: "chart-grid-direct-manipulation"
phase: intent
status: current
last_updated: "2026-09-22"
---

# Chart grid direct manipulation

## My read

People arranging charts should be able to change a chart's size from the side they are already near. They should also be able to start a chart in the empty part of the grid where they want it. The current bottom-right resize corner and toolbar Add chart action make both tasks possible, but require a move away from the intended edge or location.

The screenshot points to a large empty area beside a chart. Its red box and caption illustrate where a small add control could appear after a short hover. They are product guidance, not instructions to reproduce the red markup or place one fixed control at that coordinate.

## What matters most

- Drag any side of a chart to expand or shrink it in that direction.
- Reveal a small plus in empty chart-grid space after about half a second of hover. Clicking it opens chart choices.
- Put the selected chart in the indicated empty area.

## Boundaries

- Keep saved chart positions and sizes. New behavior must use the current grid layout state.
- Keep the existing Add chart action available, including where hover is unavailable.
- Avoid showing the plus over an existing chart or during a chart drag or resize.

## Current reality

`ChartGridLayout` uses `react-grid-layout` with one custom southeast handle. `useCreateCharts` always creates at the bottom of the chart list. `ChartCreationButtons` already lists chart types. The grid uses twelve columns and 100-pixel rows by default, and it stacks charts below 960 pixels.

## What seems settled

The two requested outcomes can ship as separate chart-grid changes. The current toolbar action remains useful.

The `react-grid-layout` dependency is historical. It can be removed if a small local grid is the simpler way to deliver the behavior.

## Detail left to implementation

The exact plus position, fit rule near occupied cells, and handle appearance can follow the current grid geometry. The first release needs one clear result when there is room and must not move existing charts without a user drag.

## Next step after confirmation

Use the current layout and chart menu paths to implement and check each behavior.
