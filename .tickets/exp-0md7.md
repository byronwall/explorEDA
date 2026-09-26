---
id: exp-0md7
status: closed
deps: []
links: []
created: 2026-09-23T01:59:22Z
type: feature
priority: 2
assignee: Byron Wall
tags: [chart-grid, interaction]
---

# Add a chart from empty grid space

## Outcome and Why

A user hovers in an empty part of the chart grid, sees a small plus after about 500 ms, chooses a chart type, and gets the chart in that area. The toolbar Add chart action currently appends a chart below the existing charts, even when a large free area is visible.

## Ready Gate

The desired interaction, existing chart menu, layout owner, and local proof are known. This ticket has no prerequisite or unresolved product decision. Work in the current checkout and preserve unrelated edits.

## Owned Context and Scope

Own the transient grid control in `packages/explorEDA/src/components/ChartGridLayout.tsx` and the route from `ChartCreationButtons` / `useCreateCharts` to a chosen initial layout. `PlotManager` renders the grid. `useCreateCharts` builds chart defaults and currently always creates at the bottom with a six-by-four layout. The chart registry supplies menu choices. The saved `ChartLayout` has `x`, `y`, `w`, and `h`. The screenshot's red box marks an example empty area; it does not define a fixed control location.

## Decisions and Discretion

Must: Reveal a small, accessible plus after a stable hover of about half a second in empty grid space. Clicking it opens the existing chart choices. Place the selected chart in the indicated free region without covering or moving existing charts. Hide the control when hover leaves, enters a chart, or a drag or resize starts. Keep the toolbar path available for touch, keyboard, and narrow layouts.

Executor may choose: The exact plus position and a grid-aligned fit rule near occupied cells or boundaries. If the default rectangle cannot fit near the target, do not create an overlapping chart.

Do not: Create a separate chart-default path, change the saved-state schema, add a new grid abstraction, or add a native `title` tooltip.

## Behavior and Failure Proof

At 1280 px, hover beside and below a chart. The plus appears after the delay and the menu opens on click. Choosing a type creates that chart in the free area; saving and restoring keeps its position. Moving over a chart or starting a drag removes the plus. A menu dismissal creates nothing. If a target becomes occupied before selection, creation must avoid overlap and must not silently rearrange existing charts.

## Acceptance Checklist

- **Invariant:** Empty-space placement uses current grid settings and occupied rectangles; no chart is lost or moved without a user drag.
- **Fixture:** Keep one focused placement check beside an occupied chart and one tight-space case that would fail on overlap.
- **Observed baseline:** Verify with real pointer input at 1280 px. At 783 px and 390 px, the toolbar Add chart action still works.
- **Invariant:** The plus has an accessible action name. Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

No drag-to-draw sizing, automatic chart rearrangement, or separate touch placement gesture. Source: Byron's 2026-09-22 request and annotated screenshot; chart-grid-direct-manipulation claims `hover`, `menu`, and `place`, shape, and milestone M2. Repository baseline: `593ca2e`, with unrelated worktree edits. This packet stands alone; if another worker edits `ChartGridLayout.tsx` concurrently, coordinate the file change before merging.

## Resolution

Hovering empty grid space for 500 ms shows an "Add chart here" plus. It opens the shared chart menu and places the chart in a grid-aligned free rectangle: 6×4 when it fits, shrinking to 3×3 at the smallest, and never overlapping (PR #32). A spare row under the charts allows adding below them. If the space fills before selection, the chart goes to the bottom instead. The toolbar Add chart is unchanged.
