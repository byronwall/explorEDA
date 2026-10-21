# R045 — Clarify or simplify scalar aggregate function names

- ID: R045
- Category: Calculations and expressions
- Priority: 56
- Kind: simplification
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

The formula `count(a, b)` returns the number of supplied arguments, while a grouped count describes records or entities. The active function registry explicitly documents that distinction and describes `sum` and `avg` as within-row operations. Grouped summaries already expose similarly named reductions elsewhere. The possible problem is not missing documentation but whether people notice the scope before forming an incorrect analytical expectation. A simplification investigation can be more useful than adding more expression functions.

Compare retaining current names with stronger contextual labels such as row-wise average against organizing the picker by the task being performed. Another alternative is hiding rarely useful scalar functions from the default picker while keeping existing formulas valid. Renaming the grammar itself should have a much higher evidence threshold because saved formula text is the persistence boundary. Evaluate whether arithmetic examples can explain the same operation more directly, especially when `count` with explicit arguments provides little value.

The first experiment should ask a few reviewers to predict `sum(a,b)`, `avg(a,b)`, and `count(a,b)` on a tiny multirow table before running the formulas. Repeat with current help, revised scope labels, and a smaller task-oriented picker. Acceptance requires correct scope predictions and a clear route to grouped summaries when that is the actual task. Reject renaming or removal if existing help already works, or if the measured improvement is too small to justify migration and documentation costs.

This simplification candidate follows the reusable-analysis-metrics intent’s warning that row expressions and grouped expressions are different. It does not propose a general measure language or claim the existing functions are wrong. The cheapest outcome could be a wording change or a decision to retain the current design; public API changes are unnecessary for the first proof. Confidence is high that the naming collision exists, but confusion is a hypothesis. The investigation earns its place by testing whether fewer choices and clearer scope improve analytical correctness.

## References

- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`, `getFunction`. The active registry defines scalar sum, avg, and count; count counts supplied arguments.
- Repository: `packages/explorEDA/src/lib/aggregates.ts` — `AggregateAggregation`, `calculateGroupedAggregate`. Grouped count, sum, and average already form a separate contract.
- Repository: `packages/explorEDA/src/components/calculations/CalculationEditor.tsx` — `CalculationEditorProvider`. The active editor uses the calculation engine for drafts.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
