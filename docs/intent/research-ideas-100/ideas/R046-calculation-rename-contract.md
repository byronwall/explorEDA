# R046 — Compare safe calculated-field renames with the current guard

- ID: R046
- Category: Calculations and expressions
- Priority: 52
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A calculated field can become widely used before its author discovers a clearer name. The provider deliberately blocks renaming or deletion for its enumerated chart, filter, and summary references, while `CalculationManager` validates formula dependencies. These guards protect the references they check. A separate `renameSettingsFields` helper already rewrites certain references during single-table project conversion. The research question is whether the protected manual workflow should remain, or whether a precisely bounded rename operation would save enough effort to justify its risks.

Compare keeping semantic names stable and using display labels with an atomic rewrite of all enumerated field references. A guided manual repair sequence is a third option when renames are rare. Distinguish references in formula syntax, chart roles, facets, filters, summaries, and field settings from descriptive text that merely mentions the old name. Reuse existing helpers only after checking their coverage; a general recursive string replacement would be inappropriate because it can change titles, string literals, and unrelated fields.

The initial experiment should rename one derived field used in another formula, a chart, a facet, a workspace filter, and a grouped summary. Include a conflicting target name and a quoted string containing the original text. Acceptance requires every semantic reference to move together, ordinary text to remain unchanged, and failure or cancellation to preserve the previous analysis. Reject automatic rewriting if the complete reference set cannot be enumerated or display labels already solve the observed naming task.

This follow-up supports current-analysis-trust and respects the existing guard as a valid design. A successful rewrite would need one state transition and coherent saved output, but should not introduce version coexistence or a generic migration framework. Maintenance cost is proportional to future field-reference surfaces, so the default should remain conservative unless user effort is clear. Confidence is medium: source provides both protections and a reusable precedent, but demand is unverified. The useful outcome is a decision about editing freedom with a concrete integrity proof.

## References

- Repository: `packages/explorEDA/src/providers/DataLayerProvider.tsx` — `assertUnusedCalculation`, `updateCalculation`, `refreshCalculations`. The provider blocks renaming for enumerated references and refreshes dependent consumers.
- Repository: `packages/explorEDA/src/lib/calculations/CalculationState.ts` — `setCalculations`, `updateCalculation`. Dependency cycles, unknown fields, and collisions are validated.
- Repository: `packages/explorEDA/src/lib/analysis/sources.ts` — `renameSettingsFields`. Project conversion already has a specific reference-rewriting helper.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
