# Scatter tracing status

Last checked: 2026-09-22. This records the current checkout and the [scatter work in the earlier Codex task](thread://01a0c1e8-16a5-7e51-8634-6977f37f06b9?hostId=local).

## Verdict

The scatter trace now covers visible points, guides, legends, facet headings, brush objects, and calculated axis badges. It also explains hover text and rendering sizes. Rows removed by another chart have no rendered object to select. Their filter path belongs to a later data-flow view. The current [implementation plan](implementation-plan.md) describes the original milestones; use this document for current status.

## Path and coverage

| Stage | Current path | Trace status |
| --- | --- | --- |
| Source and preparation | `DataLayerProvider` supplies raw rows, prepared columns, live chart items, and Crossfilter row IDs. `ScatterPlot` copies these into a `ScatterSnapshot`. | The snapshot names full-source, chart, filtered, and facet row sets. It records a revision string. |
| Point plan | `planScatter` computes domains, scales, guides, legend data, brush extent, and points. `planScatterPoints` keeps source IDs and computes position, color, radius, opacity, and own-filter state. | Stable point IDs and invalid X/Y or position exclusions exist. The plan separates full-source domain rows from chart rows and all-filter rows. |
| Point rendering | `ScatterPlot` draws planned points on Canvas. `ScatterSvg` draws planned guides and brush objects. | A point trace shows raw and prepared values, calculation steps, conversion errors, scale inputs, pixels, color, fixed styles, hover text, and Canvas pixel scaling. |
| Inspection | The shared `ChartTraceScope` serves the chart, its facets, legend and title. Alt-click selects points, guides, legends, title, facet headings, and brush objects. Normal click actions remain active. | `ChartTracePanel` shows the selected object with `ScatterTraceBody` or a shared body. Find row can reach a point or an invalid-value exclusion in a visible facet. |

Code: [`ScatterPlot.tsx`](../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx), [`scatterPlan.ts`](../../../packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts), [`planScatterPoints.ts`](../../../packages/explorEDA/src/components/charts/ScatterPlot/planScatterPoints.ts), [`scatterTrace.ts`](../../../packages/explorEDA/src/components/charts/ScatterPlot/scatterTrace.ts), [`ChartTraceScope.tsx`](../../../packages/explorEDA/src/components/charts/trace/ChartTraceScope.tsx), and [`ScatterTraceBody.tsx`](../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterTraceBody.tsx). The shared contract is described in the [implementation plan](implementation-plan.md#milestone-3-extract-only-the-shared-contract-both-charts-need--complete).

## Resolved in this pass

- **Numeric legend:** `planNumericalLegend` resolves stop values, labels, colors, and ramp background. `ColorScale` draws this plan. The legend trace shows its width, stop rule, domain, and each stop.
- **Facets:** `planFacetGridLayout` and `planFacetWrapLayout` resolve pages and sizes. The layouts draw from these plans. A facet trace shows its prepared group value, member rows, page, size, and a sample calculation when the heading uses a calculated field.
- **Hover and badges:** The point trace shows the same hover values that the chart displays. The scatter plan positions calculated axis badges. Alt-click on a badge shows its field and position.
- **Guides:** The guide trace reads the shared axis plan. It shows margin inputs, scale bounds, tick density targets, candidates, shown and omitted ticks, label limits, text formatting, and final geometry. Density sets the D3 candidate target. Available space then removes overlapping labels; it does not cap the candidate target.
- **Drawing sizes:** The point trace shows Canvas backing size and pixel ratio. The guide trace shows the planned SVG clip range.

## Deferred decisions

- **Rows removed by other chart filters:** This is acceptable. The row has no scatter glyph to select. A future source-data view may show filters removing rows in sequence, like a Sankey diagram. Do not add per-filter removal traces to scatter now.
- **Revision coherence:** Assume the current provider update prevents mixed inputs during a render. The plan records a revision and rejects stale selections. A stronger atomic check needs a demonstrated failure.
- **Visual and performance baselines:** Do not block this trace work on a full comparison or 10,000-row measurement. Add a baseline if another chart migration needs one.

The remaining limit is scope: this is a scatter-specific trace. Static SVG structure and CSS are drawing rules, not separate selectable data objects. A later chart type can reveal which plan fields need a shared contract.

## Reuse for other chart types

For each chart, record four things: source row sets, planned marks and guides, remaining renderer decisions, and trace targets for visible objects. Keep the common solution small until another chart needs the same fields. The grouped bar proof in the [implementation plan](implementation-plan.md) is the next comparison.

## Checks already present

- [`scatterPlan.test.ts`](../../../packages/explorEDA/src/test/charts/scatterPlan.test.ts) covers row sets, guides, facets, and legend filtering.
- [`scatterTrace.test.ts`](../../../packages/explorEDA/src/test/charts/scatterTrace.test.ts) covers source, calculation, guide, legend, and facet traces.
- [`ChartTraceScope.test.tsx`](../../../packages/explorEDA/src/components/charts/trace/ChartTraceScope.test.tsx) covers one inspector across facets and stale selections.
- [`ScatterSvg.test.tsx`](../../../packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.test.tsx) covers Alt-click and brush behavior.
- [`ColorScale.test.tsx`](../../../packages/explorEDA/src/components/charts/ColorLegend/ColorScale.test.tsx) covers numeric stop rendering.
- [`facetLayout.test.ts`](../../../packages/explorEDA/src/components/charts/FacetRelated/facetLayout.test.ts) covers facet page and size decisions.

`pnpm check` passed after this pass: build, types, UI rules, and 224 tests. The scatter page also passed wide, intermediate, and narrow width checks. The browser showed guide, numeric legend, wrap facet, grid facet, and calculated facet traces.
