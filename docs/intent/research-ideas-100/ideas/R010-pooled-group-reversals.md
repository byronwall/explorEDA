# R010 — Reveal pooled-versus-group reversals without causal claims

- ID: R010
- Category: Scientific analysis
- Priority: 93
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A pooled relationship may point in a different direction from the relationships within recognizable groups. explorEDA already has the machinery to display both: `planScatterFits` produces group fits and an optional overall fit, while `planPairedSummary` reports pooled and group statistics. The remaining uncertainty is whether an analyst notices and investigates a disagreement, especially in an unfamiliar multivariate dataset. A new fitting method is unnecessary to investigate that interpretation problem.

Compare the current overlaid fits with a compact, explicitly descriptive contrast showing each group’s direction, valid-pair count, and pooled direction. A third alternative is a worked inspection workflow that uses existing color and facet controls without adding UI. Avoid a general reversal detector that searches every possible grouping and announces a cause. A difference in direction should lead the user to inspect composition, ranges, and missingness; it cannot identify which relationship answers the user’s real causal or predictive question.

The first experiment would use one small fixture whose pooled slope reverses the within-group slopes and a control fixture with consistent directions. Include unequal group sizes and a second grouping field that is irrelevant. Ask users to describe the relationship and choose a follow-up inspection before seeing any explanatory label. Acceptance requires more accurate recognition of the disagreement and source-based explanations. Reject a new contrast if the existing colored fits perform equally well, if noisy small groups generate distracting signals, or if users interpret the display as an automatic causal diagnosis.

An explanatory example is inexpensive; a contrast panel needs modest planning and presentation work but should reuse existing outcomes. A persistent search across subgroup combinations would be costly and is outside the scope. This extends scientific-analysis and relationship-discovery through a specific analytical task, without duplicating their delivered matrix or fits. Confidence is medium because the current building blocks are strong but user benefit remains unmeasured. The investigation is valuable even if it concludes that better examples are sufficient and additional automated analysis should be deferred.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` — `groupScatterRows`, `planScatterFits`. Current fits support color groups plus an optional pooled fit.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `planPairedSummary`. Current summaries expose pooled and group statistics.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `pairedCorrelation`. Matrix correlation cells can also report grouped relationships.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/relationship-discovery/intent-brief.md`.
