# R049 — Specify deterministic lag and difference preparation

- ID: R049
- Category: Data preparation and relationships
- Priority: 76
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Questions such as change since the previous reading need a predecessor, not just fields from the current row. The calculation registry deliberately operates within one row, and the current project-step union has no general ordered window step. Project evaluation does provide an explicit preparation sequence and source references. A bounded lag or difference investigation could support sensor and repeated-event analysis, provided it defines order and row meaning before adding a convenient formula name.

Compare preparing differences upstream with a project step that names an entity partition, ordering field, tie rule, and measure. A chart-local difference is a third option for a single visual task, but it should not masquerade as a reusable source field. Distinguish elapsed-time neighbors from neighboring calendar buckets; this candidate concerns predecessor relationships between observations. Decide whether filters apply before or after the transform, since removing the middle record changes the predecessor under one policy but not the other.

The first experiment should use two entities with deliberately unsorted timestamps, a tied timestamp, a missing measure, and a filtered-out middle observation. For each output, enumerate its chosen predecessor independently. Acceptance requires deterministic values, a visible ordering rule, and no change when the user merely sorts the displayed table. The filter policy must explain every changed predecessor. Reject an implementation that relies on arrival order, chooses ties silently, or adds more saved state than a simple upstream preparation step warrants.

This new direction narrows the reusable-output and calendar intents without rebuilding their rolling-mean proposal. It would add a distinct query-step contract, inspection needs, and examples, so demand should be demonstrated before introducing generalized window expressions. Keep cumulative statistics and ranking outside the first proof. Confidence is medium because a concrete analytical use exists but no supplied dataset establishes frequency. The research can establish a small, reproducible operation or a clear recommendation to keep ordered preparation outside explorEDA.

## References

- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`. Scalar functions operate within one row.
- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `AnalysisStep`, `AnalysisResultRow`. Project steps and result references define a possible ordered-preparation boundary.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `evaluateAnalysisQuery`, `calculateFrame`. Existing evaluation handles explicit query stages rather than table display order.
- Related intent: `docs/intent/calendar-period-analysis/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
