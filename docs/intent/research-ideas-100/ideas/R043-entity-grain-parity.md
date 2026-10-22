# R043 — Reconcile entity-aware aggregation across preparation paths

- ID: R043
- Category: Data preparation and relationships
- Priority: 2
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Counting an order once after expanding its items is already supported. Shared `summarizeGroup` uses an optional entity field, while project `aggregateFrame` can derive identity from source references and an `entityFieldId`. Both retain contributor information and protect against conflicting repeated measures, but their identity and missing-key paths are structurally different. The research question is whether equivalent analytical intentions remain equivalent across these entry points. Source differences alone do not establish a defect because their row-grain contracts may legitimately differ.

Compare specifying one common entity-measure contract with documenting separate contracts for source identity and user-selected entity values. Reusing a reduction helper is an implementation option only after that semantic decision. Decide how missing IDs, duplicate source keys, repeated identical measures, conflicting values, and count-without-a-measure should behave. Distinguish a true entity duplicate from multiple independently observed records that happen to share a label. For unavailable totals, determine whether the whole result or only one entity is excluded.

The first experiment should apply equivalent count, sum, and average definitions to a tiny repeated-entity fixture through both paths. Include missing keys, duplicate source identity, one conflicting measure, and a legitimate repeated event. Write expected memberships before comparing outputs. Acceptance requires agreement for equivalent populations, explicit reasons for intentional differences, and discoverable entities behind unavailable results. Reject a forced shared reducer if it collapses source identity into a value-based grouping and thereby destroys legitimate row meaning.

This is a high-value robustness follow-up to current-analysis-trust and reusable-analysis-metrics, not a request to add once-per-entity aggregation again. The smallest result may be a contract table and targeted fixture; a shared helper is worthwhile only if it reduces proven divergence without expanding the public API. Confidence in the investigation is high because both paths are visible and testable. Actual disagreement is not established in this non-runnable packet. The candidate earns its place by protecting totals at the boundary between already delivered preparation and charts.

## References

- Repository: `packages/explorEDA/src/lib/aggregates.ts` — `summarizeGroup`, `AggregateSpec`. Shared summaries exclude missing entity IDs and make conflicting measures unavailable.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `aggregateFrame`. Project aggregates derive entity identity from source references where possible.
- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `AggregateMeasure`. Project measures expose entityFieldId.
- Repository: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — `keeps lookup row counts and totals at their declared grain`. Existing tests establish representative grain-aware results.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
