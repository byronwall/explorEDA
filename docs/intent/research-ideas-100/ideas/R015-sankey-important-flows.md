# R015 — Keep consequential flows visible when Sankey folds categories

- ID: R015
- Category: Domain analysis
- Priority: 95
- Kind: robustness
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

A rare path can carry a large monetary amount or material quantity even when common paths dominate the row count. In `planSankey`, category ranks are calculated from occurrence counts across all source rows, while node and link weights separately use count or a nonnegative sum. Other nodes already retain their real members, and filters do not change the ranking population. The question is whether this stable presentation choice can obscure the most consequential flow in a weighted analysis, not whether Other membership is missing.

Compare current count ranking with ranking by the chosen full-source flow measure and with a short explicitly retained category set. Count ranking emphasizes typical records; measure ranking emphasizes total amount; manual retention supports a known category of interest. Each has a different analytical purpose. The research should evaluate the remaining Other aggregate, including its source records and internal diversity, rather than merely keeping the largest visual band. Any alternative should preserve category order while peer filters change the visible population.

The first experiment would combine many common low-weight paths with one rare high-weight path and several invalid weights. Ask users to locate the largest source of the total and explain what Other contains under the three policies. Acceptance requires better recognition of consequential amounts, unchanged accounting, and exact recoverable membership. Reject the alternative if it just hides a different important path, causes reordering during filtering, or offers no benefit over the existing trace. Use both count and sum questions so a proposed improvement does not assume every analysis values money over frequency.

A bounded ranking choice would have modest schema and settings cost, but ambiguous labels or multiple interacting top-category controls could outweigh its value. This is a robustness investigation of the existing stage-based flow view; it does not depend on building the separate edge-list seed. Confidence is medium because source behavior is explicit and the counterexample is easy to construct, while user impact has not been measured. The candidate earns its place by examining analytical salience under aggregation, with an acceptable outcome of keeping the current policy and improving its explanation.

## References

- Repository: `packages/explorEDA/src/components/charts/Sankey/sankeyPlan.ts` — `planSankey`, `SankeyNode`, `SankeyLink`. Node ranking counts all-source occurrences; drawn weights and contributor lists are separate.
- Repository: `packages/explorEDA/src/components/charts/Sankey/sankeyPlan.test.ts` — `planSankey`. Existing planner tests cover flow conservation and source contributors.
- Related intent: `docs/intent/current-analysis-trust/intent-brief.md`.
- Related intent: `docs/intent/network-and-edge-flow/intent-brief.md`.
