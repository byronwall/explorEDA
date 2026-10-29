# R005 — Native rank correlation and original-record discovery

- ID: R005
- Category: Scientific analysis
- Priority: 65
- Kind: follow-up
- Status: design complete; implementation proposed
- Confidence: high in method; interaction and performance unverified
- Baseline: `9d64a021e35d312887b1bc848e307f42b6c3091f`

## Research brief

Build native Spearman in the existing mixed Scatter Matrix, followed by Both mode, compact pair browsing, and original Scatter continuation. Preserve raw points and authored field order. Byron is the demand; DIRECTION.md supersedes the earlier experiment-only and outside-demand gates. See the [implementation plan](../../rank-discovery/implementation-plan.md) and [research decision](../../../research/rank-discovery-2026-10-26/README.md).

Delete invalid pairs before assigning average ranks. Rerank within each color group and Other union. Compute pooled values directly. Keep the matrix's three-pair minimum and existing numeric summary's two-pair contract distinct. Expose unavailable reasons and disjoint exclusion counts. Do not use global field ranks after subsetting. Prepared ranks remain exploratory for a fixed-cohort lesson; Kendall, clustering, and broader shape discovery are deferred.

The Design cycle supplies five milestones: native method, comparison/pairs, original Scatter/time axes, prepared continuation, and measured exact execution. Chronological Scatter is actual new work; current datetime axes use categories. A matrix selection can narrow the destination while leaving the matrix coefficient unchanged. The prepared draft must show that difference and clear only its source selection on explicit final acceptance.

Independent rational checks confirm ties, pair-specific missingness, groups, nonlinear examples, and date anchors. These are fixture checks, not feature acceptance. Each milestone includes docs and a runnable example, state round trips, and interaction proof. Preserve exact results; add indexes or workers only after measurement. No p-values, causal scores, parser expansion, or new service. Pro originals remain ignored; the conversation records the source.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `pearson`, `pairedCorrelation`, `planMatrixLayout`. The delivered matrix computes Pearson correlation over pair-valid numeric values.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `pairedStats`. Standalone scatter summaries provide a second existing Pearson consumer.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts` — `computes Pearson r for continuous pairs`. Existing tests establish the current method.
- Related intent: `docs/intent/relationship-discovery/intent-brief.md`.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- External: <https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html>. Accessed 2026-10-20; comparison or numerical reference only.
- Design conversation: <https://chatgpt.com/c/6adf0075-3e48-83ea-86b8-605d87cfc376>, completed October 26, 2026.
