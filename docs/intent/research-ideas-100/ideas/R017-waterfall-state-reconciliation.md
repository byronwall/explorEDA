# R017 — Waterfall reconciliation when a state is absent or unusable

- ID: R017
- Category: Domain analysis
- Priority: 39
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Waterfall is already a native chart and a composition mark. `planBridge` reduces two states, assigns category changes to steps, and draws independently computed endpoint totals. A category absent from one state is represented by the explicit `EMPTY` value, while invalid numeric contributors remain available in the aggregate evidence. This supports useful appearance and disappearance comparisons. The opportunity is to investigate when a bridge that closes numerically can still imply unwarranted knowledge about an absent or unusable amount.

Compare retaining zero substitution with a trace-level distinction between structural absence and unavailable measure, and with withholding a bridge or showing a reconciliation gap when the input cannot support a complete explanation. These alternatives should be evaluated against the user’s state definition, not imposed uniformly. A missing category may reasonably mean no activity, while a present category with no valid amounts can mean unknown activity. Also establish whether parent grouping and overlapping state predicates alter the interpretation even when the arithmetic remains internally consistent.

The first experiment would hand-calculate a signed two-state fixture with a new category, a vanished category, an invalid-only group, conflicting parent labels, and an entity present in both states. Compare endpoints, step sums, subtotals, and contributor reasons independently. Acceptance requires exact reconciliation and users correctly distinguishing an observed zero from an unsupported amount. Reject extra visual states if they merely repeat information already clear in the current trace or make ordinary appearance/disappearance bridges harder to read. Any suspected defect must be demonstrated before recommending a repair.

Most outcomes could be limited to preparation notices and explanation, with low API impact. New persisted reconciliation policies would cost more and should require a real use case. The current-analysis-trust initiative provides the verification context, and composition already shares the reducer rather than requiring another implementation. Confidence is high that the state distinction is concrete in source, while the right product response is uncertain. The investigation earns its place through a specific accounting invariant and can end by documenting intentional behavior instead of adding options.

## References

- Repository: `packages/explorEDA/src/components/charts/Waterfall/waterfallPlan.ts` — `planBridge`, `orderSteps`, `stackBars`, `EMPTY`. The bridge computes grouped differences, assigns each step a parent, and uses an explicit empty-state value.
- Repository: `packages/explorEDA/src/components/charts/Waterfall/waterfallPlan.test.ts` — `planBridge`. The existing bridge calculation has focused fixture tests.
- Repository: `packages/explorEDA/src/components/charts/Composition/partsMarks.ts` — `waterfallPlan`. Composition already reuses the Waterfall reducers.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- Related intent: `docs/intent/composed-analytical-graphics/intent-brief.md`.
