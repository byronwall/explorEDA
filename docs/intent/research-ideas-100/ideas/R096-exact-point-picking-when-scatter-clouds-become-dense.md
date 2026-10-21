# R096 — Exact point picking when scatter clouds become dense

- ID: R096
- Category: Measured performance
- Priority: 59
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Ordinary scatter already paints points on canvas; sized bubbles use SVG circles. The narrower opportunity is hit testing: ScatterPlot calls scatterPointAt during hover and selection, and the source explicitly identifies its linear scan as a possible large-cloud cost. Ordinary points use a nearest-point rule within a fixed distance, while bubbles search in reverse drawing order using their radius. Those existing meanings must survive any optimization. The research should establish a measured lookup bottleneck before adding another index to an already capable renderer.

Compare the current scan with a uniform screen-space grid and a small spatial tree built from the same planned points. Include a no-change result for typical workloads. A grid may be simple for fixed-radius points but needs careful candidate bounds for large bubbles; a tree adds construction and ownership complexity. Preserve distance ties, overlapping bubble order, source IDs, invalid-point exclusions, and clipping behavior. Treat keyboard navigation as a separate interaction contract rather than using this performance study to redesign it.

The first experiment should query identical pointer paths over sparse, overlapping, and mixed-radius plans at several sizes. Compare every returned source ID against the current scan, then measure lookup latency, index construction, retained memory, and rebuilds after resize or changed coordinates. Include clicks and inspection, not hover timing alone. Acceptance requires a material improvement for a named workload with exact agreement and affordable invalidation. Reject indexing when ordinary tasks are fast enough, when rebuilding consumes the gain, or when preserving overlap semantics requires disproportionate special cases.

This medium-confidence follow-up is grounded in an explicit implementation seam and current-analysis-trust, but no pointer benchmark was run. It does not request canvas as a new feature or silently sample the dataset. A successful approach should stay internal to the scatter plan and avoid a mandatory dependency unless that dependency measurably reduces maintenance. The idea earns its place as a bounded capacity investigation with a cheap rejection path: one careful comparison can justify either a small exact lookup improvement or keeping the present understandable scan.

## References

- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterPlot.tsx` — `canvasRef`, `pointAt`, `linear hit testing`. Already draws ordinary scatter on canvas and calls the point lookup during pointer interaction.
- `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts` — `scatterPointAt`, `ScatterPlan`. Uses nearest-point lookup for ordinary marks and reverse-order radius hits for bubbles.
- `packages/explorEDA/src/components/charts/ScatterPlot/bubbles.test.tsx` — `scatterPointAt`, `maps value to area, keeps the full-source scale, and distinguishes zero and excluded sizes`. Already checks overlapping bubble selection and size semantics.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — `bubblePoints`, `keyboardPoints`. Renders bubble circles and provides a separate keyboard path that this investigation need not redesign.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
