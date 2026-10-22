# R020 — Make repaired and contradictory interval bands inspectable

- ID: R020
- Category: Composed graphics
- Priority: 46
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Composition can already draw supplied bands, and its tests explicitly verify that crossed lower and upper bounds are swapped while missing bounds break a run. `bandNodes` uses minimum and maximum for the drawn coordinates and retains source rows. That is a reasonable generic between-series ribbon. If an author calls the same fields lower and upper uncertainty limits, however, swapping may repair geometry without validating the claimed meaning. The research should preserve the implemented behavior while testing whether important input contradictions are discoverable.

Compare the current normalization with a trace notice that counts reversed bounds and with an optional strict supplied-interval contract. The notice keeps generic ribbons flexible. A strict contract can reject reversed limits or inconsistent nested bands, but only when the author explicitly declares that interpretation. Do not infer confidence, prediction, or percentile meaning from a column name. Also compare documenting the interval method in existing text and legends instead of adding a new schema. Composition should continue to draw supplied estimates rather than generate forecasts.

The first experiment would prepare four ordered rows with a reversed bound, a missing bound, two nominally nested intervals that cross, and irregular order spacing. Show each policy and ask analysts which statements the graphic can legitimately support. Acceptance requires preserved gaps, inspectable repaired inputs, and correct distinction between a drawable range and a valid uncertainty statement. Reject strict validation if it guesses statistical intent or prevents legitimate between-series ribbons. Any proposed notice must point to exact source records rather than merely announcing that data may be wrong.

A trace notice is a small addition; a statistical interval model would be a much larger maintenance commitment and remains outside scope. This is a robustness follow-up to composed graphics and the scientific seed, both of which separate supplied intervals from the model that produced them. Confidence is high in the observable normalization behavior and medium in user impact. Real supplied interval data are absent from the packet. The candidate earns its place because a small semantic check can prevent a polished graphic from implying evidence that its renderer cannot verify.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/resolveUnit.ts` — `bandNodes`. Band nodes use minimum/maximum to normalize crossed bounds and break runs at missing inputs.
- Repository: `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — `BandMark`. Bands accept supplied lower and upper fields and an explicit ordering field.
- Repository: `packages/explorEDA/src/components/charts/Composition/bands.test.ts` — `fills between the bounds in year order, swaps crossed bounds, and breaks at a missing one`. The normalization and gap behavior are already tested.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
- Related intent: `docs/intent/scientific-multivariate-analysis/intent-brief.md`.
