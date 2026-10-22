# R019 — Stable composition scales when filtered aggregates grow

- ID: R019
- Category: Composed graphics
- Priority: 33
- Kind: follow-up
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Composition already has shared numeric domains and an explicit plan to stabilize its remaining value, length, height, horizon, and density extents through filtering. In `resolveUnit`, those channels have separate calculations such as `sharedMax`, `barAxes`, and `densityMax`. The research should not reopen the settled default of stable scales. It should investigate a narrower edge case: an average or signed sum over a filtered subset can exceed the aggregate computed over all rows, so a stable reference may need an overflow policy.

Compare extents based on unfiltered aggregates with bounds guaranteed to contain every possible subset and with stable extents plus explicit overflow signaling. Guaranteed bounds preserve comparability but can waste resolution; growth on demand changes the visual reference; saturation can conceal meaningful differences unless explained. Vega-Lite’s primary documentation distinguishes shared and independent scale resolution, which is useful comparative vocabulary, but does not settle explorEDA’s filtering policy. Keep the shared-versus-repeat choice separate from which rows establish an extent.

The first experiment would use tiny strip and bar fixtures with positive and negative cancellation and unequal group averages, plus a density example whose normalized peak changes. Enumerate the small fixture’s subsets and record encoded length, color, or height for the same value. Acceptance requires stable encodings, an understandable account of overflow, and useful resolution for ordinary data. Reject a universal bounding strategy if it compresses most marks into an indistinguishable range or changes the measure itself. The result should recommend one minimal refinement to the existing plan, not another broad scale redesign.

This is a high-confidence follow-up because the stable-scale decision is documented and the non-monotone aggregate question is concrete. The implementation impact could be limited to an extent helper and overflow explanation, but a new persisted policy for every mark would be expensive. Existing scale defaults and traces should remain readable. The main uncertainty is which pathological subset behavior occurs in real compositions and whether authors already use fixed limits. Research earns its place by reducing ambiguity before the planned stabilization reaches all channels.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — `resolveUnit`, `sharedMax`, `barAxes`, `densityMax`. The resolver has distinct extent calculations for strip values, bar lengths, and density peaks.
- Repository: `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — `ValueScale`, `ScaleDomain`. Current shared-versus-instance scale scope is separate from filtering policy.
- Repository: `docs/intent/composed-analytical-graphics/implementation-plan.md` — `Milestone 2: Keep scales stable through filtering`. Stable extents and an opt-in rescale mode are already planned.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
- Related intent: `docs/intent/composed-analytical-graphics/implementation-plan.md`.
- External: <https://vega.github.io/vega-lite/docs/resolve.html>. Accessed 2026-10-20; comparison or numerical reference only.
