# R021 — A gradient along a path that represents source values

- ID: R021
- Category: Composed graphics
- Priority: 100
- Kind: follow-up
- Status: candidate
- Confidence: low
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Composition already colors a path by a numeric field, but `PathMark` explicitly defines that color from the path’s first row and `pathNodes` assigns one stroke to the resulting path. Density marks have their own gradient shading. The composed-graphics intent leaves gradients along paths and areas as conditional future scope. A useful research candidate must therefore establish an analytical need for varying color along one ordered path, rather than describe all gradients or numerical color encoding as missing.

Compare keeping one series color with constant color per source segment and continuous interpolation along a declared ordering variable. A segment could take its starting value, ending value, or a supplied interval value; none should be chosen implicitly. Interpolating by screen distance is another possibility, but it can disagree with elapsed time or another meaningful order. The study should distinguish a new measured quantity from decorative progression and preserve path breaks when source values or ordering information are missing.

The first experiment would use an irregularly sampled trajectory that doubles back in X, changes a third measurement, and contains one missing observation. Ask users to read the third quantity and identify its source records under the three encodings. Acceptance requires clearer analytical information, unambiguous segment provenance, and an explanation of values between samples. Reject the capability if constant color plus points answers equally well, if interpolation implies measurements that were never taken, or if a trace cannot identify the contributing endpoints. Start from one selected reference graphic, not a generalized gradient editor.

The cost is moderate because a single path may become several segments and legends, hit testing, and output must retain their meanings. A generic paint system would be disproportionate. Confidence is low until a concrete reference needs this operation, matching the initiative’s existing below-the-cut-line status. Source feasibility is better established than user demand. The investigation earns a conditional place as an ambitious composition extension with a quick rejection test, while keeping ordinary numeric shading and the current simple path model intact.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — `PathMark`. Numeric path color is defined from the first row of each path.
- Repository: `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — `pathNodes`, `rowShade`, `densityGradient`. Current path planning uses one stroke per path while density has a separate shading mechanism.
- Repository: `packages/explorEDA/src/components/charts/Composition/valueShading.test.ts` — `colors each line and point by its field through a diverging scale`. Numeric line and point shading already has a test.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
- Related intent: `docs/intent/composed-analytical-graphics/implementation-plan.md`.
