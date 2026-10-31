# Local duplicate-repair dispositions

Build means include in the implementation plan. It does not authorize implementation.
The [original recommendations](../../intent/duplicate-key-repair/assets/pro-results/duplicate-repair-design-2026-10-31/duplicate-key-repair/recommendations.md)
retain Pro's text. The following decisions control the local plan.

| ID      | Disposition | Local decision and reason                                                                               |
| ------- | ----------- | ------------------------------------------------------------------------------------------------------- |
| DKR-001 | Build       | Complete the relationship, reusable source, notebook, saving, and evidence workflow in M1.              |
| DKR-002 | Build       | Collapse a complete exact class only after explicit Apply; preserve all original copies.                |
| DKR-003 | Build       | Choose whole records with complete group guards; do not synthesize field values.                        |
| DKR-004 | Build       | Separate logical entity, complete record class, and historical occurrence identity.                     |
| DKR-005 | Build       | Retain accepted input snapshots and decisions so refresh cannot erase original evidence.                |
| DKR-006 | Build       | Share one source resolver across source reads, relationship targets, previews, and inspection.          |
| DKR-007 | Build       | Make unavailable distinct from a successful empty result before any reducers run.                       |
| DKR-008 | Build       | Use typed scalar keys first and ordered tuples when composite endpoints arrive.                         |
| DKR-009 | Build       | Require review or explicit exclusion for invalid identities; keep each original occurrence.             |
| DKR-010 | Build       | Add declared ordered selection in M2 with parser, direction, and unresolved ties.                       |
| DKR-011 | Build       | Guard the complete group multiset and require acceptance of changed content.                            |
| DKR-012 | Build       | Extend the actual host callback and saver with one dependent evidence/project write operation.          |
| DKR-013 | Build       | Persist the current format and complete dependency/evidence closure. Defer unrequested legacy adapters. |
| DKR-014 | Build       | Carry current evaluation and original-record access into notebook charts and findings.                  |
| DKR-015 | Build       | Ship composite grain and complete relationship tuples together in M3.                                   |
| DKR-016 | Build       | Preserve events through existing event IDs or expansion, then composite grain.                          |
| DKR-017 | Build       | Full-source repair; count groups, occurrences, referencing rows, and fanout in named units.             |
| DKR-018 | Build       | Reuse worker guards and validate downstream field origins. Block incompatible automatic retargeting.    |
| DKR-019 | Defer       | Field coalescing creates synthetic records and needs its own field-lineage design.                      |
| DKR-020 | Avoid       | Input-order winners and raw deletion conceal a choice or destroy evidence.                              |
| DKR-021 | Avoid       | Fuzzy merging and null-key coalescence do not establish entity identity.                                |
| DKR-022 | Defer       | Generic result graphs, preparation chains, and local winner policies are unnecessary prerequisites.     |
| DKR-023 | Explore     | Automatic refresh acceptance needs explicit changed-winner and evidence behavior after M1.              |
| DKR-024 | Explore     | Measure archive size before designing reference-aware compaction. No automatic pruning.                 |
| DKR-025 | Build       | Mark generated occurrence fields positively; names alone cannot justify dropping user data.             |

Additional local limits: block incompatible relationship chains first; do not build automatic chain cloning in M1.
Keep the write-success barrier direct. Pro's full transaction scaffolding is a sketch, not a required framework.
Do not add v1 migration or mixed-version behavior under the current single-deployed-version rule.
The supplied README's archival advice conflicts with the direct user request; preserve all nine original artifacts.
