# R056 — Compare contributor sets when two views disagree

- ID: R056
- Category: Inspection and provenance
- Priority: 14
- Kind: new-direction
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Two graphics can report different values for legitimate reasons, such as one excluding invalid measures or counting entities rather than rows. The baseline already records contributor arrays in `MetricCardPlan`, offers chart-specific trace bodies, and maps several trace kinds to row IDs through `traceRowIds`. `QueryRowsLink` can open those records in a project's query flow. The missing research decision is whether an analyst benefits from directly comparing two inspected contributor sets, rather than manually alternating traces and inferring the difference from totals.

Compare a temporary two-trace comparison that displays shared, left-only, and right-only records with an ordinary Rows view prefiltered to each set in succession. The comparison should first state whether the chosen traces describe population members, valid contributors, or entities; those sets are not interchangeable. An even smaller alternative is a copyable membership summary containing the measure and exclusions. The study should target explanation of a difference, not introduce a second aggregation engine or assert that differing counts constitute a defect.

Use one bar and one metric card over a small order fixture with duplicate customer IDs, missing amounts, and a local restriction on the bar. Ask an analyst to explain three intentional discrepancies and one seeded mismatch in a proposed fixture. Acceptance requires identifying the precise differing records and whether each difference is expected, using fewer transitions than the existing trace workflow. Reject a persistent comparison panel if the ordinary trace and Rows surfaces explain the cases equally well, or if the proposal confuses rows participating in a group with rows included in its numeric reduction.

This complements current-analysis-trust but owns the analyst's explanation workflow, not reducer parity or a general correctness test suite. A temporary comparison can reuse existing traces and avoid saved-schema changes; broadening `traceRowIds` would need explicit semantics for each supported kind. Confidence is high that record-level evidence exists, while the maintenance cost of a common set contract remains uncertain. The investigation earns its place because a successful result helps diagnose both honest analytical differences and real mistakes without forcing users to inspect implementation details or export unrelated records.

## References

- `packages/explorEDA/src/components/charts/trace/traceRows.ts` — `traceRowIds`. Several trace kinds map to contributor or record IDs.
- `packages/explorEDA/src/components/charts/trace/ChartTracePanel.tsx` — `QueryRowsLink`, `ChartTracePanel`. Traced records already connect to the project query flow.
- `packages/explorEDA/src/components/charts/MetricCard/metricCardPlan.ts` — `MetricCardPlan`, `planMetricCard`. The card plan retains included, excluded, and contributor information.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status and overlap are discussed above.
