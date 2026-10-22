# R044 — Preserve the cause of failed calculations through dependency chains

- ID: R044
- Category: Calculations and expressions
- Priority: 25
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A downstream calculated field may be unavailable because an input was genuinely missing or because an upstream expression failed. `CalculationManager` already stores errors separately from values and can trace dependency trees. `Calculator` reports failures such as division by zero and rejects nonfinite results. Project calculations also emit diagnostics. Those safeguards are delivered. The unresolved question is whether the first cause stays clear when several derived fields consume an unavailable upstream result.

Compare retaining the current value-plus-error maps with a small origin reference for downstream failures against relying on the existing dependency trace and improving its explanation. A richer tagged result type is another option, but it would affect many consumers. Define legitimate null results separately from evaluation errors and from temporarily unavailable external lookups. The aim is not to make all missing values exceptional; it is to help someone distinguish a deliberate guarded result from an accidental failure upstream.

The initial experiment should use a three-step chain with one valid null, invalid numeric text, division by zero, and a branch that deliberately avoids an unsafe calculation. Ask a reviewer to identify the initiating problem for every unavailable final value. Acceptance requires locating the first cause without guessing, while valid guards remain successful and existing source rows stay inspectable. Reject richer result objects if current traces already support that task reliably or a concise explanation solves it with substantially less API impact.

This bounded robustness investigation extends current-analysis-trust and the delivered calculation inspection workflow. Reusing error maps is likely cheaper than altering the scalar cell model; any new cause reference must remain valid after formula edits and reruns. Confidence is high in the need to examine the boundary, but the usability gap and exact behavior remain unverified. The investigation earns its place because dependency inspection is a product strength, and preserving cause information makes that strength useful when calculations fail rather than only when they succeed.

## References

- Repository: `packages/explorEDA/src/lib/calculations/CalculationState.ts` — `CalculationManager`, `executeCalculation`, `traceRow`, `getErrors`. The manager caches values and per-row errors and can trace dependencies.
- Repository: `packages/explorEDA/src/lib/calculations/engine/Calculator.ts` — `Calculator`. Evaluation catches failures and rejects nonfinite results.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `calculateFrame`. Project calculations separately produce calculation-error diagnostics.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
