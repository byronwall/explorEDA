# R038 — Compare reversible category mappings with automatic clustering

- ID: R038
- Category: Data preparation and relationships
- Priority: 73
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst can split one real category across values such as North, north, and North followed by a space. The current `categoryKey` correctly preserves raw scalar identity, and `categoryLabel` disambiguates numeric-looking or special text. Categorical conversion also keeps raw values. The opportunity is an explicit preparation step that combines known aliases without weakening those safeguards. A chart-level rename would change appearance while leaving the underlying category memberships separate.

Compare a user-authored mapping table that produces a new category field with suggested clusters that the author must review. A minimal trim-and-case function is another candidate when a source has a documented convention. OpenRefine describes clustering as syntactic grouping and warns that it cannot establish semantic equivalence; that distinction should shape the experiment. Preserve original values, typed keys, and a clear unmatched-value rule. Similar-looking customer names or codes must not be merged merely because a string algorithm finds them close.

The first experiment should contain case, spacing, punctuation, and Unicode variants alongside legitimate near matches and the distinct values number 1 and text 1. Reviewers should clean the intended aliases using each approach, then verify exact row memberships and counts before and after grouping. Accept only explicit, reversible mappings whose effect can be traced to original labels. Reject automatic merging if it mistakes syntactic similarity for identity, or if cluster review takes longer than a small mapping table.

This is a new preparation direction, loosely adjacent to the unprioritized reusable-output intent. The initial result may be a documented mapping recipe rather than a new editor. A persistent mapping would need a compact saved contract and predictable behavior for unseen values; fuzzy clustering brings a much larger maintenance surface. Confidence is medium until a real messy category field demonstrates recurring need. The investigation earns its place because it can improve analytical grouping while protecting the product’s existing exact category semantics.

## References

- Repository: `packages/explorEDA/src/lib/categories.ts` — `categoryKey`, `categoryLabel`, `categoryEqual`. Category identity already preserves type distinctions and ambiguous labels.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `convertFieldValue`. Categorical conversion preserves raw values.
- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`. The core scalar registry is a possible bounded preparation extension point.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
- External comparison: https://openrefine.org/docs/technical-reference/clustering-in-depth (accessed 2026-10-20).
