---
id: exp-3ndw
status: open
deps: []
links: []
created: 2026-09-28T02:45:00Z
type: feature
priority: 3
assignee: Byron Wall
tags: [charts, beeswarm, scatter, planning]
---

# Plan where beeswarm layout belongs after its removal from box plots

## Outcome and Why

Box plots no longer offer a beeswarm overlay (issue #47). The overlay was noisy, and a violin shows distribution shape better. Beeswarm is still useful whenever a user needs to see individual rows on a categorical axis, especially with tracing. This ticket decides where it belongs and how it avoids the old overlay's problems.

## Owned Context and Scope

- The layout survives as `calculateBeeSwarmPositions` in `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts`. `scripts/benchmark-beeswarm.mts` and `docs/beeswarm-performance.md` measure it.
- It samples at most 300 points per group (`MAX_BEE_SWARM_POINTS_PER_GROUP`), so rows go missing without warning apart from a small note. It also sorts values and returns `[x, value]` pairs without row ids, so a traced row can't be matched to its dot.
- Issue #43 asks for categorical X or Y in the scatter plot, with jitter inside each band. That is the most likely first home.

## Proposed Plan

1. Move the layout into a chart-neutral module, such as `components/charts/layout/beeswarm.ts`. Return `{ rowId, offset }` per input row, so dots stay traceable and filterable.
2. Replace sampling with an exact layout that scales. Sweep sorted screen positions and check collisions only against a window of recent points. If a band overflows, compress spacing or reduce the radius rather than drop rows. Count every row.
3. Use it first in the scatter plot when one axis is categorical (#43). Offer "Jitter" (random, fast) and "Beeswarm" (packed, no overlap) as the within-band layout. Default to beeswarm below a row threshold and jitter above it, and state the choice in the settings tooltip.
4. Consider a strip-plot mode for a categorical axis against a numeric one, which covers the old box plot use without the box.
5. Rerun `scripts/benchmark-beeswarm.mts` against the new module with the same fixture and record the results in `docs/beeswarm-performance.md`.

## Open Questions

- Is the scatter plot the only home, or should strip plots be a separate chart type?
- What row limit should switch from beeswarm to jitter?
- Should trace highlight use the packed position or snap to the band center?

## Acceptance Checklist

- Every row in a band is placed. Nothing is silently sampled.
- A traced row highlights its own dot.
- Layout of the `correlated_medium.csv` fixture stays under the current 30 ms median.
- Run `pnpm check:ui` and `pnpm check`.
