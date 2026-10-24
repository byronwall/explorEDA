# R038 — Compare reversible category mappings with automatic clustering

- ID: R038
- Category: Data preparation and relationships
- Priority: 73
- Kind: new-direction
- Status: design complete; implementation proposed
- Confidence: high for the boundary; runtime acceptance pending
- Baseline: `95832bd473884aeae23453af0888b4ca5187820d`

## Design decision

Build a row-preserving map query step that creates a reusable categorical field from explicit typed entries.
Keep original values and records. Default unmatched categories to their existing value; canonicalize missing only in the new field.
Ship manual review, exact rows, revision, guarded undo, persistence, and folder/notebook integration as one complete feature.

The October 24 Design study scored 18/20 and compared a dedicated step, formulas, lookup sources, and reviewed suggestions.
Byron supplies demand. The old outside-user and recurring-need gates no longer apply under DIRECTION.md.
Add reviewed trim/lowercase suggestions after manual mapping. Defer shared registries, standalone promotion, formulas, and external lookup maps.
Avoid automatic source corrections, fuzzy merging, join-key coercion, and global category identity changes.

The 28-row fixture has 26 source categories and 23 mapped categories, with 11 mapped and nine changed rows.
Independent arithmetic and existing behavior checks passed. New evaluator, UI, browser, save/reload, and performance acceptance remain proposed.
No application feature was built in this study.

- [Implementation plan](../../category-mappings/implementation-plan.md)
- [Research summary and local dispositions](../../../research/category-mappings-2026-10-24/README.md)
- [Pro conversation](https://chatgpt.com/c/6add0665-5a6c-83e9-b40e-1603bae0989d)

## References

- Repository: `packages/explorEDA/src/lib/categories.ts` — `categoryKey`, `categoryLabel`, `categoryEqual`. Category identity already preserves type distinctions and ambiguous labels.
- Repository: `packages/explorEDA/src/lib/fieldSettings.ts` — `convertFieldValue`. Categorical conversion preserves raw values.
- Repository: `packages/explorEDA/src/lib/calculations/functions/registry.ts` — `calculationFunctions`. The core scalar registry is a possible bounded preparation extension point.
- Related intent: `docs/intent/reusable-analysis-outputs/intent-brief.md`.
- External comparison: https://openrefine.org/docs/technical-reference/clustering-in-depth (accessed 2026-10-20).
