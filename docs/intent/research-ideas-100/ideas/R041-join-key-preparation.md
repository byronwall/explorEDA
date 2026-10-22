# R041 — Design explicit join-key preparation without implicit coercion

- ID: R041
- Category: Data preparation and relationships
- Priority: 71
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Two related files can encode the same intended key differently: one may store number 7 and the other text 7, or one may include padding. Current lookups and expansions correctly preserve typed matching and skip missing keys; tests explicitly protect these choices. The unresolved task is reconciling legitimate encoding differences without changing the default equality contract. This differs from category cleanup because a mistaken merge can multiply or attach records across sources.

Compare creating an explicit derived canonical key before the relationship with a relationship-local mapping rule that preserves both original keys. A third alternative is requiring upstream preparation. Derived keys are visible and reusable but add fields; local rules are concise yet risk hiding matching semantics. Evaluate text padding, numeric conversion, and case normalization separately. A composite key should have structural components rather than a separator-concatenated string that can collide. Null values must not acquire a synthetic shared identity by accident.

The first experiment should join two tiny tables containing number/text pairs, leading-zero codes, whitespace, nulls, and deliberately colliding candidate canonical forms. Specify intended matches independently, then compare each preparation route with the current strict baseline. Acceptance requires every new match to be explainable, every collision to be discoverable, and unchanged relationships to retain their original memberships. Reject automatic coercion if it merges distinct codes, treats missing keys as equal, or makes contributors impossible to explain from original values.

This new preparation direction supports current-analysis-trust without treating exact matching as a bug. The cheapest outcome may be a documented recipe using existing calculated steps; a new key type would have larger validation and saved-project consequences. Keep the investigation to one relationship and one explicit convention. Confidence is medium because the conservative baseline is clear but the needed normalization conventions are unknown. Its place in the backlog is justified by a common integration boundary where convenience can otherwise undermine identity correctness.

## References

- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `lookupFrame`, `expandedFrame`. Both relationship operations index typed scalar keys and skip missing keys.
- Repository: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — `keeps null and unlike scalar keys from matching`. Tests explicitly protect null and unlike scalar behavior.
- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `CalculateStep`, `RelationshipDefinition`. Derived fields and relationship definitions are available design boundaries.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
