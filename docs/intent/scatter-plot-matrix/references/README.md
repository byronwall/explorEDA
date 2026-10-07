# Scatter plot matrix references

[The direct request](user-request.md) defines the required layout. The [complete Pro chart review](../../comparison-opportunities/resources/pro-chart-review/exploreda-chart-interaction-review/review.md) names a scatter plot matrix as a later candidate in section 5. The direct request now supplies a separate scope.

## Current foundation

Source inspected at `a50df9985ed3ff54d0f6ca368c0b369829b8a927`. No matrix implementation or browser acceptance is claimed.

- [Scatter planning](../../../../packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts): source IDs, axes, and current scatter data.
- [Scatter marginals](../../../../packages/explorEDA/src/components/charts/ScatterPlot/marginalPlan.ts): histogram bounds and exact contributors, based on plotted pairs.
- [ECDF settings](../../../../packages/explorEDA/src/components/charts/Ecdf/definition.ts): another possible diagonal display.
- [Chart registry](../../../../packages/explorEDA/src/charts/registerAllCharts.ts): existing view families; no dedicated matrix.

## Related intent

- [Relationship discovery](../../relationship-discovery/intent-brief.md): coefficient summaries and navigation to scatter; a separate workflow.
- [Scientific and multivariate seed](../../scientific-multivariate-analysis/intent-brief.md): the matrix now has this explicit owner.
- [Editorial styling](../../editorial-chart-styling/intent-brief.md): readable typography and authored presentation.
- [Axis domains](../../axis-domain-controls/intent-brief.md): display bounds and reset semantics.

## Product feedback

[Annotated product direction](../../comparison-opportunities/resources/product-feedback-2026-10-06.md) supplies the current audience and priorities. The [full records](../../comparison-opportunities/resources/product-feedback-2026-10-06.json) preserve uncertainty.
