# Local recommendation dispositions

Reviewed against refreshed `origin/main` at `ab4ecd2a`, October 31, 2026.
Build selects the [implementation plan](../../intent/regional-rate-comparisons/implementation-plan.md); it does not approve shipping.
Every recommendation is preserved in the [original report](../../intent/regional-rate-comparisons/assets/pro-results/regional-rates-design-2026-10-31/report.md).

| ID    | Disposition | Local decision                                                                                                     |
| ----- | ----------- | ------------------------------------------------------------------------------------------------------------------ |
| RR-01 | Build       | Native saved comparison; prepared input in M1, events plus exposure in M2.                                         |
| RR-02 | Build       | Small query operation owns arithmetic; map and table consume its result.                                           |
| RR-03 | Build       | Keep value, quantity availability, scope, and role evidence together.                                              |
| RR-04 | Build       | Map plus ranked evidence table; reuse the table shell rather than add a new chart family.                          |
| RR-05 | Build       | Show N, D, and coverage. Put model limitations in relevant trace/help text.                                        |
| RR-06 | Explore     | Prototype count-model intervals; do not promise a release before numerical method validation.                      |
| RR-07 | Build       | Distinguish crude population rates and event intensity; no probability interpretation.                             |
| RR-08 | Build       | Explicit population/window and pinned geometry; no automatic zoom substitution.                                    |
| RR-09 | Build       | One authoritative D per exact grain. Keep duplicates and conflicts inspectable.                                    |
| RR-10 | Build       | Explicit collection coverage and source-read availability; no last-event inference.                                |
| RR-11 | Build       | Pool totals over compatible, declared disjoint regions; reject incomplete requested pools.                         |
| RR-12 | Build       | Numerator-owned subtype predicates in M2; ordinary result filters only select groups.                              |
| RR-13 | Build       | Semantic group selection survives zero event membership; source IDs remain qualified.                              |
| RR-14 | Build       | Quantity-specific reference domains, explicit rebase, zero-only legend, and visible overflow.                      |
| RR-15 | Build       | One query definition; both dependencies survive validation, closure, revisions, and text.                          |
| RR-16 | Build       | Explicit-group finding in M1; opt-in chart-selection narratives in M4.                                             |
| RR-17 | Build       | Reuse existing project callback, worker coordinator, trace context, and ordered folder saver.                      |
| RR-18 | Build       | Supported windows and matched strata in M3, with declared additivity.                                              |
| RR-19 | Build       | Explicit extraction/identical collapse in M3; retain every backing record and reject conflict.                     |
| RR-20 | Explore     | Eligible-entity proportions require a verified subset/identity contract.                                           |
| RR-21 | Defer       | Smoothing, standardization, and boundary crosswalk computation add separate methods.                               |
| RR-22 | Defer       | No universal semantic, quantity, or output platform prerequisite.                                                  |
| RR-23 | Avoid       | No silent zero imputation, denominator duplication, guessed propagation, causal labels, or reliability thresholds. |

Local changes to Pro's proposal: split its large first milestone, resolve host and worker seams, and make disjointness explicit.
Preserve the existing full-filter-array notebook writeback rule and keep unsupported numerical overflow unavailable.
The [evidence record](evidence.md) explains these choices and the limits of the supplied oracle.
