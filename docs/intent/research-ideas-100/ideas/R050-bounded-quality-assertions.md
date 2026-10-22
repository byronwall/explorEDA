# R050 — Reuse existing calculations for bounded data-quality assertions

- ID: R050
- Category: Data quality and missingness
- Priority: 78
- Kind: simplification
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Before trusting a chart, an analyst may repeatedly check that amounts are nonnegative, numeric interval starts precede ends, or identifiers are present. The calculator already supports comparisons and logic, keeps row errors, and traces dependencies. Project filters and diagnostics provide further inspection primitives. The research question is whether these existing parts can support a repeatable quality-check workflow with a small recipe or summary, rather than whether explorEDA needs an entirely new rules system.

Compare saved boolean calculated fields plus ordinary filters with a compact assertion result that records the rule, tested population, violation count, and unknown count. A third option is keeping assertions in source preparation and importing their results. Missing inputs must not silently count as passing checks, and a failed calculation is different from a rule evaluating false. Keep each rule explicitly authored and tied to a concrete analytical concern; no inferred schema policy or remote monitoring is required.

The first experiment should express three checks over a tiny fixture: a nonnegative amount, ordered numeric endpoints, and a required identifier. Include a valid zero, missing input, malformed number, and deliberate violation. Reviewers should locate the exact violating records and explain unknown results using both existing primitives and the proposed summary. Acceptance requires a reproducible rule and population with no hidden data edits. Reject a dedicated assertion model if ordinary calculations and filters are equally clear or the proposal expands into ingestion governance.

This simplification candidate respects the missingness intent’s explicit boundary against a general rules engine. It follows current-analysis-trust by asking how far delivered features can go before new machinery is justified. A documented pattern could have no API cost; a small saved assertion type would require validation and a clear relationship to calculation errors. Confidence is medium because the workflow is plausible but unobserved. The desired research output is a measured choice between reuse and a narrowly scoped addition, including an explicit decision to stop if reuse is sufficient.

## References

- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `Calculator`, `validateExpression`. Expressions already support comparisons, logic, and explicit errors.
- Repository: `packages/explorEDA/src/lib/calculations/CalculationState.ts` — `getErrors`, `traceRow`. Per-row failures and dependency inspection are available.
- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `FilterStep`, `AnalysisDiagnostic`. Projects already have filter stages and structured diagnostics.
- Related intent: `docs/intent/missingness-and-expected-records/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
