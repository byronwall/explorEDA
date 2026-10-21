# R040 — Expose relationship expansion before it changes analytical grain

- ID: R040
- Category: Data preparation and relationships
- Priority: 24
- Kind: robustness
- Status: candidate
- Confidence: high
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

Expanding orders into their items creates a useful item-level table, but summing the repeated order total can answer a different question. The repository already supports expansions, declared relationship cardinality, optional unmatched parents, and stage input/output counts. The evaluator’s tests explicitly check grain-aware totals. The research opportunity is whether authors can predict that changed row meaning before using the result, particularly when one parent has many more matches than the others.

Compare improving the existing stage explanation after expansion with a compact preflight summary showing parent count, matched-parent count, output count, and maximum fanout. A third approach is a small before/after sample with repeated fields highlighted. Cardinality labels alone may not explain skew. The summary should distinguish a declared relationship from observed multiplicities and state whether unmatched parents produce one retained row or no row. It should not introduce a general query optimizer or an approval barrier for ordinary analysis.

The first experiment should use orders, items, and adjustments with one skewed parent, one unmatched parent, and a deliberate many-to-many route. Ask reviewers to predict output grain and parent-measure totals before inspecting results. Acceptance requires correct predictions and exact agreement between stated and actual row counts on the tiny fixture. Reject a separate preflight panel if existing stage inspection already teaches the same meaning. Reject any estimate that appears exact or hides a rare large fanout behind its average.

This robustness investigation belongs beside current-analysis-trust and preserves the delivered relationship engine. Computing exact counts may be cheap for small resident tables but should be measured before adding work to every edit; an on-demand explanation could be enough. Public API changes should be limited to diagnostic metadata if needed. Confidence is high because grain changes are directly visible in `expandedFrame`, while actual misunderstanding remains untested. The value is preventing a correct expansion from producing an incorrectly interpreted aggregate.

## References

- Repository: `packages/explorEDA/src/types/AnalysisProject.ts` — `RelationshipDefinition`, `ExpandStep`, `AnalysisStage`. Relationships declare cardinality and stages report input and output counts.
- Repository: `packages/explorEDA/src/lib/analysis/evaluateProject.ts` — `expandedFrame`. Expansion emits matched rows and optionally keeps unmatched parents.
- Repository: `packages/explorEDA/src/test/lib/analysis/evaluateProject.test.ts` — `keeps lookup row counts and totals at their declared grain`. Existing tests cover multi-source grain and totals.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
