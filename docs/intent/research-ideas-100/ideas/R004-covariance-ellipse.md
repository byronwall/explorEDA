# R004 — A descriptive covariance ellipse with an explicit reference population

- ID: R004
- Category: Scientific analysis
- Priority: 64
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Scientific users may want to compare the direction and spread of two measurement clouds without reading a covariance table. `pairedStats` already calculates an n−1 covariance matrix for finite pairs, and `planPairedSummary` separates pooled and grouped results. The scientific-multivariate intent explicitly reserves covariance ellipses as a future possibility. The missing decision is the meaning of the overlay and its reference population; the presence of covariance numbers does not establish a statistically appropriate confidence region.

Compare a descriptive ellipse fitted to each currently eligible group with an ellipse fitted to a separately declared reference population. The former follows existing summaries and needs fewer controls. The latter supports comparison but overlaps the low-interest named-baseline seed and requires explicit source-change behavior. Also compare drawing an ellipse with showing only principal spread directions. Keep confidence regions for a mean, prediction regions, and automatic anomaly labels outside this proof, because each would need additional assumptions and different interpretation.

The first experiment would use a hand-calculated rotated cloud, a perfectly collinear cloud, a constant coordinate, and two groups with unequal sizes. Calculate geometry independently and identify which rows supply the center and covariance. Then ask users what the boundary means before and after peer filtering. Acceptance requires correct geometry, intelligible population scope, and deliberate unavailable or degenerate behavior for singular cases. Reject the idea if users consistently infer certainty or error labels from it, or if existing points and summaries communicate the same comparison just as well.

A single descriptive overlay has moderate cost and can reuse the current scatter plan. A persistent reference population would be materially larger and should not be smuggled into this candidate. Any settings addition should state the multiplier or descriptive convention rather than an unexplained percentage. Confidence is medium because the reusable numerical seam is strong but real measurement demand is unproven. This follows an existing seed with a narrower first decision: whether a correctly explained descriptive ellipse improves a concrete comparison enough to justify maintenance.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `pairedStats`, `PairedStats`, `planPairedSummary`. Paired summaries expose an n−1 covariance matrix, finite-pair counts, and pooled/group scope.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` — `groupScatterRows`. The existing grouping seam supplies eligible facet populations.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/population-baselines/intent-brief.md`.
