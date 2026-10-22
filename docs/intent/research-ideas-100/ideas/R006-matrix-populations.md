# R006 — Comparable populations across correlation matrix cells

- ID: R006
- Category: Scientific analysis
- Priority: 34
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Two coefficients shown beside one another can describe different populations when their fields are missing on different rows. explorEDA intentionally uses pairwise-valid values in `pairedCorrelation`, and the matrix tests explicitly cover reduced counts. That behavior preserves useful data and is not a confirmed defect. The research concerns the interpretation of comparing such cells, especially when missing measurements align with a batch, instrument, or experimental condition that also changes the relationship being studied.

Compare the existing pairwise policy plus better membership comparison with an optional complete-case population across the chosen fields. A third alternative is a temporary intersection for only the two cells being compared, which preserves more observations but is harder to explain. The study should retain original field values and existing scatter inspection. It should not add imputation or treat all missingness as random. The unit of the decision is whether a claimed stronger relationship survives using comparable rows.

The first experiment would construct three fields and two identifiable groups so that pairwise coefficients suggest a different ordering from a common-row calculation. Ask analysts to rank the relationships and explain the population behind each answer. Acceptance requires correct source counts, discoverable membership differences, and a measurable improvement in interpretation. Reject a new population switch if it removes nearly all useful rows, creates a second unexplained set of results, or provides no advantage over the existing counts and trace. The planted fixture must make the distinction observable rather than merely theoretical.

The likely implementation cost is a bounded row-mask choice and clear scope language, with modest persisted-setting impact if the option survives. A general missing-data engine belongs elsewhere. This is a robustness follow-up to relationship-discovery and current-analysis-trust, not another missingness matrix or a replacement for Pearson. Confidence is high in the existence of the population distinction and medium in the need for new UI. Real datasets and current users’ interpretation of reduced counts remain unmeasured; no misleading result has been reproduced in the application.

## References

- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `pairedCorrelation`, `MatrixCell`, `planMatrixLayout`. Cells carry pair-valid counts and calculate each pair separately.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.test.ts` — `uses pairwise-valid rows and reports reduced counts`. Pairwise validity is existing tested behavior.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixTrace.ts` — `resolveMatrixTrace`. Cell and row traces expose population counts and original values.
- Related intent: `docs/intent/relationship-discovery/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
