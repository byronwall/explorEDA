---
id: exp-f9tk
status: open
deps: []
links: []
created: 2026-09-23T01:59:06Z
type: feature
priority: 2
assignee: Byron Wall
tags: [chart-grid, interaction]
---

# Resize charts from any edge

## Outcome and Why

A user can resize a chart by dragging the edge nearest the pointer. The current chart grid exposes only a southeast corner handle, which makes width and height changes awkward when the desired change is on another side.

## Ready Gate

The behavior, existing layout owner, and local proof are known. This ticket has no prerequisite or unresolved product decision. Work in the current checkout and preserve unrelated edits.

## Owned Context and Scope

Own the resize behavior in `packages/explorEDA/src/components/ChartGridLayout.tsx` and its handle styling in `packages/explorEDA/src/index.css`. The grid currently uses `react-grid-layout`; it writes `x`, `y`, `w`, and `h` through `updateChartLayouts`. Saved layouts use the same four fields. Grid resizing is disabled below 960 pixels. Check the current UI defaults before changing controls. This ticket does not own chart creation.

## Decisions and Discretion

Must: Support drag from north, south, east, and west edges. Keep useful corner resize, including the current southeast affordance. Keep chart actions and plot marks usable. Keep saved layouts stable when the page loads.

Executor may choose: Use the existing library or remove it and write a small grid interaction that directly supports the required behavior. Treat the dependency as historical, not required architecture. Choose the path with less code and complexity after checking the real drag, resize, collision, saved-layout, and narrow-layout behavior. If replacing it, keep those behaviors and the current layout data contract; remove the dependency only when no other code uses it. Choose handle markup and visual treatment.

Do not: Add a new layout store, saved-state format, dependency, or narrow-screen resize mode. Do not add native `title` tooltips.

## Behavior and Failure Proof

Drag left and top edges first: each chart changes in the dragged direction, and the opposite edge stays fixed where space permits. Check right and bottom as well. Check minimum size and a neighboring chart. A failed drag must not leave an invalid saved rectangle.

## Acceptance Checklist

- **Invariant:** Each side can resize a chart on a wide grid; ordinary chart clicks, chart movement, and collision behavior still work.
- **Invariant:** Reload or restore retains the changed rectangle; loading existing saved layouts does not alter them.
- **Observed baseline:** At 1280 px, use real pointer input on all four sides and one corner. At 783 px and 390 px, charts remain visible and the existing narrow layout works.
- **Fixture:** Keep one focused check that would fail if a left or top resize did not update the intended grid rectangle. Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

No pixel-based freeform sizing or keyboard grid editor. Source: Byron's 2026-09-22 request and follow-up allowing removal of `react-grid-layout`; chart-grid-direct-manipulation claims `resize` and `grid-choice`, shape, and milestone M1. Repository baseline: `593ca2e`, with unrelated worktree edits. This packet stands alone; if another worker edits `ChartGridLayout.tsx` concurrently, coordinate the file change before merging.
