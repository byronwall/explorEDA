# R018 — Quantile and outlier conventions that agree with the question

- ID: R018
- Category: Distribution semantics
- Priority: 29
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A small measurement sample can have a box-plot median between observations while an ECDF level crosses at an observed value. The source makes this distinction visible: `crossing` selects an empirical step, while `getQuartile` and matrix `quantile` interpolate positions in sorted data. Box Plot also offers Tukey, min–max, and standard-deviation whiskers. These are different intended summaries, not proof of disagreement. The research asks how a user should recognize their meaning when comparing views or checking a report against another calculation.

Compare keeping the conventions and naming them where needed with aligning only genuinely equivalent statistics through a shared helper. A method chooser is a more expensive alternative and should not be assumed necessary. The study should distinguish an empirical threshold from an interpolated quantile and a displayed outlier from an invalid observation. It should also examine whether a standard-deviation whisker has an adequately clear meaning beside a quartile box. Preserving useful distinctions is more important than forcing every chart to display the same number.

The first experiment would use samples of two and four observations, tied values, a constant group, and one extreme value. Work out each intended result by hand and compare the three planners on the same population. Ask users to explain any differing median or whisker before changing the presentation. Acceptance requires exact numerical agreement with a named convention and improved interpretation. Reject a new chooser if it increases confusion, or if the apparent discrepancy was actually caused by different source rows and existing scope inspection resolves it.

A shared contract or clearer trace label is inexpensive; supporting many quantile estimators would increase settings, tests, and documentation disproportionately. This is a robustness follow-up to current-analysis-trust and the scientific seed, separate from weighted distributions. Confidence is high because the distinct algorithms are directly visible. The evidence gap is how often users compare these results and which external convention they expect. The investigation earns its place by separating legitimate statistical differences from defects, allowing maintenance to focus on real inconsistency rather than cosmetic numerical uniformity.

## References

- Repository: `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts` — `crossing`, `buildSteps`. ECDF marked levels use observed step crossings.
- Repository: `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.ts` — `getQuartile`, `calculateBoxPlotStats`. Box quartiles interpolate order statistics and offer several whisker rules.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixCells.ts` — `quantile`, `sortedBoxStats`. Matrix boxes have their own interpolated quartile and Tukey-whisker implementation.
- Repository: `packages/explorEDA/src/components/charts/BoxPlot/boxPlotCalculations.test.ts` — `uses observed Tukey whisker endpoints inside the fences`. An existing test establishes whisker endpoints from observations.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
