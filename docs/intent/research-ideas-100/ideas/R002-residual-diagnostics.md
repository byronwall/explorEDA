# R002 — Residual diagnostics that preserve the fitted population

- ID: R002
- Category: Scientific analysis
- Priority: 62
- Kind: follow-up
- Status: design reviewed; implementation proposed
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Design review, October 24, 2026

Build fit-attached residual inspection with a held reference, local selection, exact records, and explicit recomputation.
The [review summary](../../../research/regression-diagnostics-2026-10-24/README.md) records source checks and dispositions.
The [implementation plan](../../regression-diagnostics/implementation-plan.md) ships residual-versus-fitted and residual-versus-X together.
It then adds comparisons, diagnostic views, and saved recipes with docs/examples in each milestone.
No feature has shipped. DIRECTION.md supersedes the older demand and rejection gates below.

## Original research brief

An analyst can already fit a scatter relationship, inspect its equation, and trace its contributing rows. `planScatterFits` carries exact source IDs, and `fitInputKey` deliberately keeps the chart’s own brush from refitting the model. Those foundations make a focused diagnostic plausible. The remaining question is whether a residual view helps identify structure that the fitted curve and its summary score obscure. NIST’s residual-analysis guidance provides a primary reference for choosing a useful diagnostic rather than treating a fit score as a complete assessment.

Compare a temporary residual-versus-fitted inspection attached to the current fit with a prepared table containing source identity, fitted value, and residual. The first can stay small and disappear with the fit. The second supports existing charts but introduces a reusable analytical output and its refresh rules. Neither should automatically refit when a user selects a suspicious residual. The study must name the fitted population, the inspected population, and the consequence of a peer chart changing the source scope.

The first experiment would use three hand-understood fixtures: a line with symmetric deviations, a curved response fitted by a line, and a response whose spread increases with its fitted value. Ask users to locate the planted mismatch using the existing view and each proposed diagnostic. Acceptance requires improved identification, residuals that reconstruct observed minus predicted values, and exact source membership after filtering. Reject the extension if existing inspection performs equally well or if even the temporary version demands a broad modeling pipeline. No inferential test or automatic model recommendation is required.

A temporary diagnostic has a moderate rendering and trace cost but little permanent schema impact. Persisting residual output has a larger maintenance cost and overlaps the reusable-analysis-outputs seed; that branch should remain conditional. The scientific-multivariate initiative already names residual views as future work, so this is a precise scope decision rather than a new claim of discovery. Confidence is high in the opportunity and medium in the best interaction. Real engineering examples and the frequency of diagnostic use are still evidence gaps.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` — `planScatterFits`, `ScatterFit`, `fitInputKey`. Fit plans retain source IDs and intentionally exclude the chart's own brush from refitting.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` — `FitMeasures`, `RegressionFit`. Fit outcomes provide prediction functions and residual summary measures.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts` — `keeps coefficients when this chart brushes and refits after other filters`. Own-versus-peer filter behavior is already tested.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
- External: <https://www.itl.nist.gov/div898/handbook/pri/section2/pri24.htm>. Accessed 2026-10-20; comparison or numerical reference only.
