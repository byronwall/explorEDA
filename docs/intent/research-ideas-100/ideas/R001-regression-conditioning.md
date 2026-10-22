# R001 — Regression reliability after changing units and coordinate offsets

- ID: R001
- Category: Scientific analysis
- Priority: 4
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An engineer may plot a small response variation against a large timestamp or a measurement with a large reference offset. The existing regression implementation already takes numerical care: `fitLinear` centers its sums, while `fitPolynomial` standardizes X and uses Householder QR. It then expands coefficients back into the original coordinate system for the displayed equation. The opportunity is to investigate agreement between those two representations, rather than assume the existing solver is defective or propose regression as a missing capability.

The research question is when a reliable plotted prediction can coexist with an unreliable reusable equation. Compare retaining the current expanded equation with exposing a centered equation whose reference value is explicit. A third alternative is a bounded conditioning notice that suppresses only an unreliable representation. NIST supplies regression reference datasets and certified outputs that can anchor the numerical comparison. Use cases should distinguish a user reading a trend from a user copying its coefficients into another calculation.

The first experiment would use one tractable certified polynomial case and translated, rescaled copies of a small synthetic measurement set. Compare predicted values, residual sums, expanded coefficients, and predictions reconstructed from the displayed precision. Include repeated X values, nearly constant X, and degree choices near the supported sample limit. Acceptance requires an explicit error envelope tied to the measurement scale and a narrowly targeted remedy. Reject added controls if discrepancies remain immaterial or the remedy blocks ordinary fits without improving decisions. These are proposed checks, not executed product tests.

The likely cost is a compact numerical investigation and potentially clearer equation formatting; replacing the fitting engine is an expensive fallback. Any future API change should preserve the existing fit outcome and unavailable-result conventions. This follows the scientific-analysis seed and trust initiative without reopening delivered fits. Confidence is high that the question is valuable because the code has distinct internal and displayed representations. Confidence in any actual failure is lower: broader reference cases, realistic field magnitudes, and user reliance on copied equations remain unverified.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/regression.ts` — `fitLinear`, `fitPolynomial`, `solveLeastSquares`, `fitEquation`. Linear fitting centers sums; polynomial fitting uses standardized X and Householder QR, then expands reported coefficients.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/regression.test.ts` — `keeps precision with large offsets`, `recovers an exact quadratic and its coefficients in powers of x`. Existing numerical examples already cover basic offset and polynomial cases.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- External: <https://www.nist.gov/itl/sed/statistical-reference-datasets/strd-background-information/linear-regression>. Accessed 2026-10-20; comparison or numerical reference only.

## Research follow-up, October 22, 2026

R001 research is complete for review. See the [local synthesis](../../../research/regression-conditioning-2026-10-22/summary.md) and [eight dispositions](../../../research/regression-conditioning-2026-10-22/decisions.md).
Three locally written source probes reproduce separate linear prediction/metric disagreement and polynomial equation representation loss.
Retain standardized polynomial QR. Investigate centered linear evaluation and a stable trace equation with origin, scale, units, and adequate precision.
Keep valid curves when their expanded representation is unsuitable. No product repair or new public API ships in this study.
The full26-case matrix remains Pro evidence; browser, copy, export, restore, and continuous-range checks remain unrun.
Any visible repair milestone includes `/docs/scatter` and a focused runnable unit/offset example.
R051 is next eligible; reuse prior filter-ownership findings.
