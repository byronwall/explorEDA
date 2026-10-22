# R003 — Expose fit sensitivity before adding more regression methods

- ID: R003
- Category: Scientific analysis
- Priority: 63
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The current scatter tools already offer linear, polynomial, and LOESS fits. `fitPolynomial` reports adjusted R², while `fitLoess` has a span, a minimum neighbor count, and an interpolated path for larger groups. `fitSummary` labels the LOESS score as pseudo R². These are substantial capabilities. The product question is whether users understand how much their conclusion depends on a flexible setting before the library invests in additional methods, controls, or statistical claims.

Compare a brief sensitivity preview of adjacent degrees or spans with keeping one fit visible and improving the current explanation of its settings. A third, deliberately limited alternative is an optional comparison against the linear fit using the same rows. Avoid an automatic best-model badge: the research concerns whether a conclusion survives reasonable settings, not whether one score is largest. Separate numerical approximation from modeling sensitivity so the LOESS interpolation threshold is not confused with a change in statistical meaning.

The first experiment would prepare a noisy line, a smooth nonlinear response, and a sparse dataset with a few influential observations. Have analysts state a trend using the current controls, then inspect bounded variations without changing rows. Acceptance requires users to identify unstable conclusions and retain a simpler fit when added curvature offers no useful explanation. Record decision accuracy and explanation quality, not preference alone. Reject the preview if it promotes score chasing, creates unreadable overlays, or produces no improvement over current controls and a focused example.

This is a simplification investigation because its successful outcome may be better guidance and a decision to add no methods. A temporary comparison can reuse `planFitMarks`; storing multiple simultaneous fits would enlarge settings and traces and should need stronger evidence. The scientific-analysis seed permits one demonstrated analytical task rather than a catalogue. Confidence is medium: implementation seams are clear, but user difficulty has not been measured. The investigation earns its place by testing whether existing capability is sufficient before increasing maintenance obligations.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` — `fitPolynomial`, `fitLoess`, `LOESS_EXACT_ROWS`, `LOESS_VERTICES`. Polynomial fits expose adjusted R²; large LOESS groups use an interpolated curve.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` — `fitSummary`, `planFitMarks`. Existing labels distinguish LOESS pseudo R² and draw within fitted X ranges.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
