# R008 — Histogram boundaries that match an engineering decision

- ID: R008
- Category: Distribution semantics
- Priority: 51
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A technician comparing measurements with specification thresholds may need counts within intervals chosen by the domain, not by a desired number of bars. `numericBins` already uses full-source extents, treats integer values specially, and works with range snapping so selection respects bin edges. Those are delivered safeguards. The remaining question is whether a fixed width, origin, or short edge list helps an actual engineering decision that existing range filters, annotations, or the ECDF threshold view cannot answer as clearly.

Compare the current count-based control with width plus origin and with an explicit ordered edge list. Width plus origin is simpler and supports repeated measurements on one scale. Explicit edges allow unequal specification bands but complicate whether height represents count or density. A fourth outcome is to keep histogram controls unchanged and guide threshold tasks to ECDF or a filtered count. The research must state endpoint inclusion, the final closed edge, underflow and overflow, and whether future source replacement retains the chosen boundaries.

The first experiment would use measurements around two specification limits, including values exactly on each edge, repeated values, and one extreme observation. Ask analysts to reproduce the same interval counts after filtering and source replacement. Acceptance requires exact membership, an understandable denominator, and a clear reduction in setup effort or errors. Reject the extension if users solve the task equally well with current filters or if supporting arbitrary edges demands a large special-purpose editor. Compare the smallest viable control before assuming all three options should ship.

This is a follow-up to the distribution refinements mentioned in population-baselines, which explicitly do not depend on named baselines. That initiative’s low priority for saved comparisons should not be used to infer demand for custom bins. A fixed-width option would have modest settings and validation cost; arbitrary edges require more extensive persistence and trace decisions. Confidence is medium because the task is plausible but unobserved in real use. A successful research run may simply document the existing ECDF route and reject another histogram control.

## References

- Repository: `packages/explorEDA/src/components/charts/BarChart/bins.ts` — `numericBins`, `snapRangeToBins`, `binInRange`. Bins use source extents, special integer spacing, and explicit selection snapping.
- Repository: `packages/explorEDA/src/components/charts/BarChart/bins.test.ts` — `numericBins`. The current binning contract has focused tests.
- Repository: `packages/explorEDA/src/components/charts/Ecdf/ecdfPlan.ts` — `shareAt`, `thresholdFilter`. ECDF already offers threshold-oriented analysis without bin choices.
- Related intent: `docs/intent/population-baselines/intent-brief.md`.
