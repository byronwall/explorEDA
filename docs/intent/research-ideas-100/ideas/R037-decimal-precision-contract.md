# R037 — Choose a precision contract for financial and exact-decimal work

## November 1 Methods result

Build explicit exact-decimal calculations, saved rounding, and exact reconciliation in complete stages.
[Plan](../../decimal-measures/implementation-plan.md), [summary](../../../research/decimal-measures-methods-2026-11-01/README.md),
and [original Pro artifacts](../../decimal-measures/assets/pro-results/decimal-measures-methods-2026-11-01/ASSET_INDEX.md).
R037 scored 17/20. Local review passed 573 assertions and checked decisive code claims.
This is a reviewed proposal, not implementation approval. Current DIRECTION replaces the historical demand gates below.
No next topic is assigned; catalogue rank remains unchanged.

- ID: R037
- Category: Types, quantities, and dates
- Priority: 90
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A currency label and two decimal places can make a value appear exact even when the calculation has no decimal-exactness contract. The repository already formats currencies, reports display rounding, and protects some numeric-text inference boundaries. Arithmetic and grouped reductions still use ordinary numeric values. The research question is not whether every exploratory calculation should become exact; it is whether a demonstrated financial or accounting task needs a stronger guarantee than the existing numerical model provides.

Compare ordinary numbers with an explicit tolerance, scaled integers for a declared smallest currency unit, and exact-decimal preparation outside the workspace. A decimal representation inside explorEDA is a fourth option only if the simpler routes fail. DuckDB documentation usefully distinguishes exact decimal addition and multiplication from division behavior, illustrating why choosing a decimal type does not settle every operation. Define rounding location and treatment of mixed scales before considering a library. Display precision must not substitute for that decision.

The first experiment should use a small ledger with repeated fractional amounts, large-plus-small cancellation, rounding boundaries, and a ratio. Calculate an independent expected result under a written rule, then compare current arithmetic, scaled integers, and prepared totals. Acceptance is meeting the task-specific tolerance or exactness requirement through both row calculations and grouped summaries, with visible rounding semantics. Reject a new representation when ordinary numbers already meet the requirement or a prepared exact measure answers the real question with substantially less maintenance.

This new direction is adjacent to reusable metrics and current-analysis-trust; neither intent approves an exact-decimal engine. Adding a scalar type would reach parsers, formulas, comparisons, serializers, and charts, so the first research result should prefer a narrow contract or explicit limit. Confidence is medium because the numerical boundary is evident but no accounting-grade use case is established. The investigation deserves a place because it can justify either a small robust convention or a well-supported decision to keep exact finance outside the package.

## References

- Repository: `packages/explorEDA/src/lib/valueParsing.ts` — `parseNumber`, `isExactNumberText`. Parsing and inference already define the numeric input boundary.
- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `Calculator`. Arithmetic uses ordinary numeric operations.
- Repository: `packages/explorEDA/src/lib/aggregates.ts` — `summarizeGroup`. Shared reductions sum and average numeric values.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `formatFieldValue`, `displayRoundsValue`. Formatting precision is distinct from raw calculation values.
- Related intent: `docs/intent/reusable-analysis-metrics/intent-brief.md`.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- External comparison: https://duckdb.org/docs/lts/sql/data_types/numeric.html (accessed 2026-10-20).
