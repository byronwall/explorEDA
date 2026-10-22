# R098 — Small reproducible cases that preserve analytical failures

- ID: R098
- Category: Testing and reproducibility
- Priority: 97
- Kind: new-direction
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A saved analysis can reproduce a large problem yet still be difficult for one maintainer to understand. Removing rows by hand can accidentally remove the category, filter interaction, duplicate key, or missing-value condition responsible for the disagreement. Existing saved-analysis encoding and ScatterPlan row sets offer a more precise starting point. The proposed question is whether a small local reduction procedure can preserve a named analytical failure while shrinking its source and settings, rather than merely producing a smaller screenshot or reopening the full workspace.

Compare manual fixture reduction with a simple automated search that deletes row groups or unused settings only when an explicit failure predicate remains true. A third alternative is a guided diagnostic export that reports populations and exclusions but leaves reduction to the developer. Define the oracle first: for example, a disagreement between expected contributors and a traced mark. Preserve source identity mappings and necessary category/domain context. Do not assume that removing an apparently irrelevant row leaves inference, normalization, ordering, or derived aggregates unchanged.

The first study should use one controlled population mismatch in an isolated future fixture and record how a maintainer reduces it manually. Run a bounded deletion search against the same semantic predicate, then replay both resulting cases and inspect whether they retain the original cause. Acceptance requires a materially smaller, understandable example, stable identity interpretation, and reduced diagnosis effort. Reject automation if it changes the failure into another one, if oracle construction costs more than the investigation, or if ordinary cases are already easy to minimize by hand.

This medium-confidence new direction uses renderer-independent-replay's existing semantic seams for a concrete debugging task; it does not repeat that intent's proposal for a general replay contract. No reducer or diagnosed product defect exists in this research deliverable. The likely cost is a developer-only utility with bounded search, not a new public schema or service. Current-analysis-trust provides the relevance: a reproducible discrepancy is more useful when its essential records and assumptions are visible. The candidate remains conditional on observing debugging cases large enough to justify it.

## References

- `packages/explorEDA/src/components/charts/ScatterPlot/scatterPlan.ts` — `ScatterSnapshot`, `ScatterPlan`, `rowSets`, `exclusions`. Exposes semantic populations and excluded record reasons without requiring a new scene schema.
- `packages/explorEDA/src/utils/saveDataUtils.ts` — `parseSavedAnalysis`, `stringifySavedAnalysis`. Provides existing complete analysis encoding and validation.
- `packages/explorEDA/src/components/project/sourceRowIdentity.ts` — `sourceRowIdentities`. Derives source identities with explicit handling of unusable keys.
- `packages/explorEDA/src/test/providers/analysisReliability.test.tsx` — `keeps the table, active derived filter, edited formula, CSV, and restored analysis in agreement`. Shows an existing compact cross-layer discrepancy oracle that can inspire a future reduction study.
- `docs/intent/renderer-independent-replay/intent-brief.md` — related intent; status reconciled against implementation in the brief.
- `docs/intent/current-analysis-trust/intent-brief.md` — related intent; status reconciled against implementation in the brief.
