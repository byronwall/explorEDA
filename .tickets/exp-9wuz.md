---
id: exp-9wuz
status: closed
deps: []
links: []
created: 2026-09-23T02:08:25Z
type: feature
priority: 1
assignee: Byron Wall
external-ref: deterministic-rendering-and-data-traceability:M2
tags: [chart-trace, bar-chart]
---

# Trace one grouped aggregate bar from contributors to pixels

## Outcome and Why

A user selects one visible grouped aggregate bar and sees why it has that value, height, position, and color. This is the next chart comparison after scatter. It tests which trace fields both charts actually need.

## Ready Gate

The grouped aggregate result, bar renderer, scatter reference, decisions, and local proof are available. No product decision or prerequisite blocks this packet. Work in the saved project checkout and preserve current edits.

## Owned Context and Scope

Own the grouped aggregate path in `packages/explorEDA/src/components/charts/BarChart/BarChart.tsx` and its inspection path in `GroupedAggregateInspector.tsx`. `DataLayerProvider.getAggregateResult` supplies the current aggregate result. `packages/explorEDA/src/lib/aggregates.ts` already records each group's stable row ID, source contributors, raw and prepared inputs, inclusion, and numeric exclusion reason. `BarChart` currently computes the band position, width, Y domain, zero baseline, height, fill, and visibility inside TSX. Clicking an aggregate bar opens the existing contributor inspector. Scatter has a pure plan and a live trace inspector, but its point fields are chart-specific.

## Decisions and Discretion

Must: Give a visible aggregate bar a stable mark ID linked to its aggregate row. Resolve its value and drawing inputs in a repeatable bar-specific plan that both drawing and inspection use. Show contributing source IDs, excluded numeric inputs and reasons, aggregation rule, group order, Y domain and the rows that set it, zero baseline, final bar geometry, and fill source. Keep the current aggregate result and Crossfilter row scope authoritative. Preserve saved settings, group order, normal bar actions, and the current scatter path.

Executor may choose: The smallest plan shape and whether to extend the existing aggregate inspector or use the scatter inspector pattern. Keep the selected visible bar clear in the UI.

Do not: Add another aggregate engine, infer lineage from SVG pixels, create a universal chart grammar, or migrate count and numeric-bin bars in this packet. Keep the present drawing path until plan and visible bar values match.

## Behavior and Failure Proof

Use a controlled grouped result with positive and negative values, one invalid numeric input, and a deliberate group order. Select a bar and confirm the trace matches its contributors and rendered geometry. Apply an active chart filter and confirm the result and trace use the same current row scope. A group with no finite result has no visible bar to select; its exclusion remains available through the existing aggregate result inspection. A selection that no longer names a visible bar after a filter change must not show an old trace.

## Acceptance Checklist

- **Fixture:** A focused test proves contributor and exclusion details, domain setters, baseline, and positive and negative bar geometry from controlled rows.
- **Invariant:** The selected bar's trace values and pixels come from the plan used to draw it. Group order and current filter behavior stay intact.
- **Observed baseline:** Compare one positive and one negative bar before and after an active chart filter in the live demo. Check 1280, 783, and 390 px widths with real pointer and keyboard input.
- **Invariant:** Run `pnpm check:ui` and `pnpm check`.

## Cut Line and Provenance

Leave a shared chart contract until both scatter and bar paths have passed. Leave other chart types, source-data filter-flow views, atomic snapshot enforcement, broad visual and 10,000-row benchmarks, editable trace graphs, and multi-source joins below this packet. Source: deterministic-rendering-and-data-traceability claims `GOAL-1` to `GOAL-3`, selected shape, and milestone M2. Repository baseline: `bd0d355` on `main`. The scatter status document records the current comparison path and accepted gaps.

## Notes

**2026-09-23T02:45:08Z**

Implemented aggregate bar plan and trace with stable mark IDs, shared SVG geometry, contributors, exclusions, domain setters, baseline, order, and fill source. Fixed grouped chart Select scope to use the aggregate measure. Focused tests, pnpm check:ui, pnpm check, and git diff --check pass (216 library tests, 11 demo tests). Browser proof used positive and negative bars, invalid numeric input, pointer and keyboard, active chart filter, stale bar removal, and 1280/783/390 px widths. Existing unrelated docs edits preserved.
