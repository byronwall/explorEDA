# R054 — Define lasso selection by reproducible membership

- ID: R054
- Category: Selection and analytical scope
- Priority: 18
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A curved cluster in a scatterplot cannot always be isolated with the existing rectangular brush. `ScatterSvg` routes a two-dimensional brush through source-space bounds and separates plain point selection from Alt-based tracing. Its tests cover ordinary clicks, brushes, and tracing. The precise-composite-selection intent explicitly values lasso and asks for exact membership, including overlaps and boundary points. The research task is to settle what a drawn polygon means across rendering and later data changes before treating another gesture as a feature.

Compare a polygon saved in data coordinates with a source-ID snapshot of the points captured when the gesture finishes. The polygon expresses a reusable region but requires a policy for transformed axes and points on its boundary. Captured IDs express the observed selection but need an honest invalidation rule when row identity changes. A hybrid might retain the polygon as an explanation while filtering the captured IDs, yet that extra state must earn its complexity. Include a non-drag route, such as choosing polygon vertices with clicks or selecting the resulting rows from a list.

The first experiment should manually classify a small fixture containing coincident points, a point on each edge, points just outside, null coordinates, and one point hidden by an axis bound. Compare the two representations after resizing, changing a supported axis scale, and replacing the dataset with reordered rows. Acceptance requires a written boundary rule and identical membership in linked tables and trace inspection for every case. Reject the candidate if membership changes merely because pixels change, or if maintaining stable identity demands a broad data-model redesign before a useful first task exists.

This advances the lasso proof already requested in precise-composite-selection and remains separate from tuple unions. W3C's pointer-gesture guidance is relevant to alternatives for path-based input; it is not evidence that the current app fails an accessibility requirement. API cost is moderate because the predicate must survive validation and reopening, while gesture code is only part of the work. Confidence is high in the semantic need and lower in user demand. The investigation earns priority by allowing an inexpensive rejection of fragile geometry or identity choices before UI implementation.

## References

- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.tsx` — `ScatterSvg`, `onBrushChange`. The current interaction uses a 2D brush and separate point activation.
- `packages/explorEDA/src/components/charts/ScatterPlot/ScatterSvg.test.tsx` — `keeps normal brush clicks and traces points only on Alt-click, not Alt-drag`. Existing tests distinguish brushing and tracing.
- `packages/explorEDA/src/types/FilterTypes.ts` — `Filter`. A polygon is not part of the inspected saved filter union.
- `docs/intent/precise-composite-selection/intent-brief.md` — related intent; status and overlap are discussed above.
- [W3C WAI: Understanding SC 2.5.1 Pointer Gestures](https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html) — primary source accessed 2026-10-20; used only for the comparison described above.
