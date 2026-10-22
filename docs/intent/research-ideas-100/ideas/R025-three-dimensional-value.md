# R025 — Decide the product role of 3D scatter through analytical tasks

- ID: R025
- Category: Scientific analysis
- Priority: 74
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

explorEDA ships a dedicated 3D scatter with numeric or categorical cube axes, source-value readouts, and camera controls. `buildThreeDScatterData` prepares its points separately, and `ThreeDScatterChart` manages a WebGL scene using `OrbitControls`. The full registry also includes the delivered scatter matrix and ordinary scatter’s richer analytical options. A one-person maintainer benefits from knowing where this extra surface materially improves analysis before adding more 3D features or treating every chart as equally prominent.

Compare keeping 3D as a standard discovery option with positioning it as a specialist view for demonstrated three-variable geometry, or reducing its default prominence while preserving existing saved work and explicit registration. Compare those choices with matrix and faceted two-dimensional workflows, not with an artificially weak scatter example. The research should include the user’s need to identify and inspect observations, understand axes, and communicate a result. A visually engaging rotation is insufficient evidence of analytical value, but a real spatial task could justify continued investment.

The first experiment would use one three-variable geometric relationship and one measurement cloud with overlapping points. Ask users to answer a concrete shape or subgroup question, then inspect the records supporting the answer in each view. Acceptance requires a reliable task advantage for at least one case, understandable camera interactions, and source values that remain accessible. Reject expansion if matrix or facets perform equally well, if hidden observations drive wrong conclusions, or if camera handling dominates the task. Do not remove the chart merely because one generic preference test favors two dimensions.

This is a simplification investigation with potentially small documentation outcomes or a larger future product decision. Any removal or registration change would require a separate compatibility review and explicit approval; this candidate authorizes neither. The scientific and comparison intents favor useful questions over chart counts, which provides the rationale. Confidence is medium because the distinct maintenance surface is visible, while user demand and task effectiveness are unknown. The investigation earns its place by testing where to concentrate effort without assuming that sophisticated rendering is inherently useful or inherently unnecessary.

## References

- Repository: `packages/explorEDA/src/components/charts/ThreeDScatter/useThreeDScatterData.ts` — `buildThreeDScatterData`, `planCubeAxis`, `cubePosition`. 3D supports numeric and categorical cube axes with its own data preparation.
- Repository: `packages/explorEDA/src/components/charts/ThreeDScatter/ThreeDScatterChart.tsx` — `ThreeDScatterChart`, `OrbitControls`. The chart has a dedicated WebGL scene and camera interaction.
- Repository: `packages/explorEDA/src/charts/registerAllCharts.ts` — `registerAllCharts`, `threeDScatterDefinition`. 3D is part of the full chart registry.
- Repository: `packages/explorEDA/src/components/charts/ScatterMatrix/matrixPlan.ts` — `planScatterMatrix`. A delivered matrix provides a current comparison alternative.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
- Related intent: `docs/intent/comparison-opportunities/intent-brief.md`.
