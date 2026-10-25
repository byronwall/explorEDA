# R010 — Reveal pooled-versus-group reversals without causal claims

- ID: R010
- Category: Scientific analysis
- Priority: 93
- Kind: new-direction
- Status: Methods complete; implementation proposed
- Confidence: medium
- Baseline: `95832bd473884aeae23453af0888b4ca5187820d`

## Research brief

Build an explicit grouping comparison inside Scatter Plot. Existing fits and paired summaries already show pooled and color-group statistics.
The new capability adds independent grouping, a common-within relationship, exact within/between contributions, and original-record inspection.

The [Methods summary](../../../research/pooled-group-2026-10-25/README.md) records the decision, sources, and local code corrections.
The [implementation plan](../../pooled-group-relationships/implementation-plan.md) has two complete milestones with exact fixtures, docs, and runnable examples.
It remains a proposal; no product feature has shipped.

Use one pair-valid population and typed groups. Show descriptive coefficients without causal claims or statistical significance labels.
Common-within slope weights groups by within-X variation. Group-mean regression uses valid-pair counts.
Covariance contributions share N−1. Group correlations cannot be averaged into pooled correlation.

The repository's research direction supersedes this brief's former outside-demand and lesson-only gates. Byron is the demand.
Keep automatic group searches, rank methods, equal-weight means, and inferential models outside this initial capability.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/fitPlan.ts` — `groupScatterRows`, `planScatterFits`. Current fits support color groups plus an optional pooled fit.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `planPairedSummary`. Current summaries expose pooled and group statistics.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `pairedCorrelation`. Matrix correlation cells can also report grouped relationships.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/relationship-discovery/intent-brief.md`.
