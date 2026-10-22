# R022 — Prove the distinction between composition windows and populations

- ID: R022
- Category: Composed graphics
- Priority: 45
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Composition intentionally separates three concepts: which population a mark or calculation uses, whether a calculation follows filters, and which rows a frame displays. `FrameWindow` hides rows from one frame without redefining the underlying calculation, and `calcRows` chooses repeat or whole-composition scope independently of filtering. Insets and comparison marks already exercise these rules in tests. The research question is whether authors can predict the resulting values reliably, especially when a nearby label summarizes more data than the visible marks.

Compare keeping the current inspector and trace with a compact scope sentence beside the selected element, or with a temporary contributor preview that shows what a window changes. Avoid combining all three choices into one misleading “scope” toggle. The intended improvement should make the current model understandable while retaining its expressive power. A useful simplification might instead remove a redundant authoring control or improve defaults. It should not silently make all shared calculations ignore filters or force every inset to use its visible rows as its denominator.

The first experiment would use two regions, a recent-period main frame, an overview inset, and a whole-graphic calculation that can follow or ignore filters. Ask authors to predict the displayed total and the contributing rows before applying each edit. Acceptance requires correct predictions and successful recovery from mistakes using a small explanation or preview. Reject new UI if it adds vocabulary without reducing errors, or if current inspection already supports reliable understanding. The fixture should also verify that a hidden comparison series can remain in the comparison population deliberately.

This investigation has low-to-moderate cost and may end in documentation or wording rather than a new API. Persisted semantics should remain unchanged unless the proof identifies a concrete inconsistency. It follows the composed-graphics intent, which explicitly requires population, filter policy, and display window to stay separate. Confidence is high that the distinction matters and medium that the current authoring experience needs intervention. No user study was executed here. The candidate earns its place by testing whether advanced composition power remains usable by a single analyst revisiting saved work.

## References

- Repository: `packages/explorEDA/src/components/charts/Composition/compositionTypes.ts` — `FrameWindow`, `MarkPopulation`, `CompositionCalculation`. Display windows, mark population, and calculation filter policy are distinct data contracts.
- Repository: `packages/explorEDA/src/components/charts/Composition/calculations.ts` — `calcRows`, `evaluateCalc`, `describeCalc`. Calculations choose population and filter policy independently.
- Repository: `packages/explorEDA/src/components/charts/Composition/insets.test.ts` — `draws only the window's rows in the main frame and spans the window on its field`, `leaves skipped subsets out of the repeats but keeps their rows for comparison marks`. Existing tests cover window clipping and retained comparison populations.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
