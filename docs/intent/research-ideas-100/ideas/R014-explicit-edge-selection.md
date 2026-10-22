# R014 — Select explicit edges without changing their accounting grain

- ID: R014
- Category: Domain analysis
- Priority: 99
- Kind: follow-up
- Status: candidate
- Confidence: medium
- Baseline: `9b16d78e3ed0742ed4d5858c1939fec9e758b510`

## Research brief

An analyst selecting two entities in an explicit-edge dataset might mean all links touching either entity, or only links between those selected entities. These populations differ even when the same nodes remain highlighted. The current planSankey uses ordered stage identity and complete source paths, so its behavior cannot settle that edge-list question. The network-and-edge-flow intent already proposes a table-first geometry comparison. This follow-up holds geometry fixed and investigates the more specific meaning of a node selection and its displayed totals.

Compare incident-edge selection, retaining records with either endpoint selected, with induced-subgraph selection, retaining records only when both endpoints are selected. Directional incoming or outgoing selection is a third bounded alternative for tasks that require it. Specify whether a node total counts endpoint appearances, original edge records, or summed weights. A self-loop can appear in both directional accounts without becoming two source records; repeated links may remain distinct records even when a view aggregates them. Labels and trace membership must explain those choices explicitly.

Use a hand-audited directed fixture with five nodes, nine edge records, unequal weights, repeated links, a cycle, and a self-loop. Keep the presentation as a table and ask users to predict retained source IDs after single-node and multi-node selections. Compare incoming, outgoing, and distinct-edge totals against separately written expectations. Acceptance requires predictable membership and reconciliation under one named rule, including clearing and restoring the selection. Reject a rule that hides population changes to force agreement, and defer node selection if ordinary endpoint filters answer the representative task adequately.

This is a medium-confidence follow-up to a conditional input-contract seed, not a request to build a graph renderer. Its added decision is the grain and direction of linked selection; the earlier geometry experiment is already documented. A useful result could be a short contract and fixture with no new chart or dependency. Source inspection establishes the current stage-based contract, while demand for arbitrary edge selection remains unmeasured. The investigation earns a later slot when actual linked-entity data makes ambiguous node totals a practical analytical problem.

## References

- `packages/explorEDA/src/components/charts/Sankey/sankeyPlan.ts` — `SankeySnapshot`, `SankeyNode`, `planSankey`. Current Sankey nodes include a stage and complete source paths contribute across successive stages.
- `docs/intent/network-and-edge-flow/intent-brief.md` — `Expansion trigger`. The existing seed requires actual edge data and rejects assumed flow conservation.
- `docs/intent/network-and-edge-flow/intent-brief.md` — related intent; the existing geometry experiment is distinguished above.
