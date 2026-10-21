# R009 — Weighted empirical distributions without replicated source rows

- ID: R009
- Category: Distribution semantics
- Priority: 92
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Some measurement tables contain one row per sampled unit with a frequency or exposure weight. Counting those rows equally can answer a different question from counting the represented population. The current `EcdfCurve` denominator is the number of valid observations, and `buildSteps` accumulates source-row counts at tied values. Composition summaries are intentionally unweighted. This is a new analytical direction for a concrete weighted-distribution task, not a request to relabel existing curves or duplicate rows until their visual size looks correct.

Compare adding one nonnegative weight field to ECDF with using a prepared cumulative table drawn by an existing line or composition path. The native option preserves source inspection naturally but must expose both observation count and total weight. The prepared option keeps the package smaller and can accommodate specialist preparation outside it. Distinguish frequency weights from probability or exposure weights before choosing a denominator. Do not infer effective sample size, confidence intervals, or survey-design correctness from a weighted curve alone.

The first experiment would hand-calculate five observations containing tied values, a zero weight, an invalid weight, and one dominant weight. Check cumulative shares, threshold membership, and each group’s denominator under a peer filter. Then ask an analyst to explain what 50% means in both row-count and weighted views. Acceptance requires exact agreement, preserved source identity, and understandable weight semantics. Reject native support if the motivating work needs complex survey variance estimation or if a prepared table answers the task with little repeated effort. Negative weights should require an explicit rejection rule in the proof.

A narrowly weighted ECDF is a moderate change to planning, settings, traces, and saved validation. Generalizing every reducer or composition summary would multiply maintenance and is outside this candidate. The reusable-metrics and scientific seeds provide context, but neither approves a weighting engine. Confidence is medium: the mathematical difference is clear, while user demand and weight provenance are unknown. The investigation earns a place because it tests a distinct population meaning and can conclude that a documented preparation recipe is the best outcome.

## References

- Repository: `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts` — `EcdfCurve`, `buildSteps`, `shareAt`. ECDF step shares use counts of valid source observations.
- Repository: `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — `SummaryMark`. Composition supplies an existing unweighted summary mark.
- Repository: `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.test.ts` — `splits by color with each group as its own 100%`. Group denominators already have an explicit tested convention.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
