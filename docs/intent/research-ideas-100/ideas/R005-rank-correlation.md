# R005 — Rank correlation as a bounded pair-discovery option

- ID: R005
- Category: Scientific analysis
- Priority: 65
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The delivered scatter matrix already helps choose among field pairs and can show Pearson r, including per-color-group values. `pairedCorrelation` extracts valid pairs and `pearson` computes the coefficient; standalone scatter summaries also report Pearson values. A new correlation matrix would repeat shipped work. The useful research question is narrower: whether a rank-based option changes which monotonic relationships an analyst notices when measurements have nonlinear scales or many repeated ordered values.

Compare an explicitly named Spearman option in existing correlation cells with preserving Pearson and offering a prepared rank-transformed example. SciPy’s primary documentation identifies Spearman as a measure of monotonic relationship and specifies unavailable constant-input behavior; it can serve as a numerical reference. A rank option should define ties and missing pairs, display its method, and lead back to the original measurements in scatter. Adding p-values, significance stars, or a broad association-method chooser is outside this initial decision.

The first experiment would use a strictly monotonic nonlinear relationship, tied ordinal measurements, a constant field, and a strong non-monotonic relationship. Compare coefficients with an independent calculation, then ask analysts which original scatter pairs merit inspection. Acceptance requires more successful discovery on the intended cases, correct tied ranks, and honest unavailable results. Reject the option if it changes rankings without improving analysis, encourages causal interpretation, or duplicates what existing points make obvious. Test small deterministic cases before considering a larger field count.

A method enum and reusable paired-rank calculation are modest additions, but method-specific labels and trace conventions must remain aligned between matrix and standalone summaries. This is a direct follow-up to relationship-discovery, whose intent already makes rank methods conditional on a monotonic nonlinear task. Confidence is medium: the numerical contract is well bounded, while demand and interaction value remain uncertain. The research earns its place by deciding whether one precise method adds analytical reach without creating a general statistics package.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `pearson`, `pairedCorrelation`, `planMatrixLayout`. The delivered matrix computes Pearson correlation over pair-valid numeric values.
- Repository: `packages/explorEDA/src/components/charts/ScatterPlot/pairedSummary.ts` — `pairedStats`. Standalone scatter summaries provide a second existing Pearson consumer.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts` — `computes Pearson r for continuous pairs`. Existing tests establish the current method.
- Related intent: `docs/intent/relationship-discovery/intent-brief.md`.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- External: <https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html>. Accessed 2026-10-20; comparison or numerical reference only.
