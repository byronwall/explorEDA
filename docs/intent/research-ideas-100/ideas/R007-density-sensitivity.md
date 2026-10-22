# R007 — Density sensitivity before interpreting apparent clusters

- ID: R007
- Category: Scientific analysis
- Priority: 61
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

explorEDA already draws violin densities, matrix density diagonals, composition ridgelines, and two-dimensional contours. Their appearance depends on meaningful choices. `planContours` estimates on a fixed grid and reports thresholds in data units, while `calculateKernelDensity` normalizes a violin curve by its maximum. A narrow peak can therefore look prominent for different reasons in different views. The opportunity is to identify which sensitivity evidence helps an analyst trust a pattern, without alleging that these deliberately different displays should be numerically identical.

Compare a small adjacent-bandwidth preview with a concise estimator readout and an unsmoothed reference such as histogram counts. Also compare a data-unit bandwidth with the current multiplier when the same measurement is shown in several groups. Keep probability density, estimated row density, and peak-normalized shape distinguishable. The research should ask whether an apparent cluster persists through defensible settings, not choose an aesthetically pleasing smooth or silently change the analytical population when a display domain changes.

The first experiment would use two nearby peaks, observations concentrated near a domain boundary, and a long-tailed sample. Prepare expected counts independently, vary bandwidth and visible bounds, and ask users which claimed patterns survive. Acceptance requires identifiable units, an understandable account of normalization, and stable conclusions or explicit recognition of sensitivity. Reject added UI if it merely creates more shapes to choose from, or if a focused example and the existing bandwidth setting resolve the difficulty. Investigate numerical edge effects only when a specific fixture exposes a material discrepancy.

A comparison example and wording changes are inexpensive outcomes; harmonizing estimators across chart families would be a larger maintenance commitment and needs stronger evidence. This follows the scientific and composition seeds while preserving their delivered density features. Confidence is high that parameter sensitivity is relevant, but the most useful product intervention is uncertain. The investigation is independent of a performance benchmark and of adding new distribution methods. Its value is preventing an unsupported analytical conclusion while allowing the current simple density implementations to remain simple.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/contourPlan.ts` — `planContours`, `KDE_GRID`, `ContourLevel`. Contours use a bounded grid, bandwidth scaling, density thresholds, and observed-row coverage.
- Repository: `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts` — `calculateKernelDensity`. Violin density normalizes its sampled curve by its maximum.
- Repository: `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — `densityCurve`, `densityNodes`. Composition resolves density curves and their displayed peak extent.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
