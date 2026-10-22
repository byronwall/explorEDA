# R077 independent evidence review

## Provenance and collection

Baseline and refreshed origin/main are `f4cacdde180e16ad814451a8c064e394535565d6`.
The application sources did not change during this run. Open PRs were checked before submission and integration.
[Source receipts](evidence/source-receipts.json) authenticate27 baseline files, two pinned historical files, and eight supplemental source files.
The packet hash matches Pro's input receipt. The uploaded prompt predates hook formatting; the manifest retains its original byte receipt.

Pro finished after29m4s in the [recorded conversation](https://chatgpt.com/c/6ad9b651-6728-83e9-88d4-6279b7905715).
Four Markdown originals, ZIP, and manifest were collected under Byron's direct standing download approval.
CRC, safe flat paths, no symlinks, exact five-member inventory, UTF8, sizes, hashes, and all five standalone/archive comparisons pass.
The ZIP event wait timed out; the normal download succeeded. Two downloaded decision copies match.
No Library upload or downloaded-program execution occurred.

The unchanged [oracle](evidence/frozen-oracle.json) matches published SHA256
`297cb1920302814f98509b1ad5738915667b76f2091b04a93485a2040e776b15`.
Freeze timing and Pro's117 citation checks remain attributed claims. Hash verification does not prove chronology or product behavior.

## Executed local observations

The [locally authored probe](evidence/local-probe.test.tsx) imports actual mapper, resolver, provider, and evaluator code.
It uses frozen JSON as data. It does not execute Pro's proposed test or shell scripts.
It ran from the temporary package test path, then moved here. Four tests pass; their assertions record current behavior.
They do not assert that the proposed repaired contract passes. [Output](evidence/local-probe.txt) and [results](evidence/local-results.json) retain details.

| Probe                  | Expected identity                                        | Actual observation and control                                                                                                                                                       |
| ---------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| M02 owner mapping      | W: L01/L10/L12                                           | Reversal produces L12/L03/L01 in workspace and local scopes. Chart maps to L10/L05/L02; Rows maps to L10/L08/L04.                                                                    |
| Missing mapping/schema | Diagnose every supported owner                           | Collector finds six chart/Rows sentinels; workspace remains numeric. All-missing chart inclusion matches no rows. Workspace-only absent cohort is not reported by the schema helper. |
| Mounted plain provider | Retain original W or reset deliberately                  | Same supplied settings restore W onto L12/L03/L01 after reversal. Removing savedData clears filters and exposes all12 rows.                                                          |
| Supplemental A01       | Unique typed key denotes L02                             | Generated key records:string:tag:row:9 resolves to L10. Ordinary unique keyed reversal resolves L02.                                                                                 |
| Supplemental F02       | Retained old occurrence must not silently change meaning | Direct positional reference resolves L10 before duplicate-row swap and L09 afterward. No UI lifecycle guard is exercised.                                                            |
| Supplemental A02       | Two distinct expanded outputs have distinct identities   | Real evaluator returns two rows for join a/b with different source pairs and one shared key. No saved selection lifecycle was exercised.                                             |

The four tests group related observations. They do not run all M00–M12 or F01 cases.
The mounted provider uses a legal seeded workspace-ID filter; this is not a browser gesture or a full ExplorEdaProject test.
The no-save control removes savedData during replacement; it demonstrates deliberate reset, not automatic selective predicate retention.

## Current source checks and remaining predictions

`initializeData` writes index IDs after spreading each row. The provider calls setData then restores supplied settings on replacement.
`analysisRowKeys.ts` visits chart filters and Rows filters. It omits workspace and chart-local filters.
`settingsCompatibility.ts` visits chart-local uses but omits workspace predicates. These are distinct omissions.
`sourceRowIdentity.ts` checks a trailing positional pattern before entity-key matching. The A01 probe confirms the consequence.
`evaluateProject.ts` concatenates expansion keys. The A02 probe confirms collision for two distinct typed source pairs.

`ExplorEdaProject` counts unresolved keys from host settings; runtime decoding can introduce a new sentinel elsewhere.
`useAnalysisEvaluation` retains the prior result while pending. The Query panel receives current tables with that evaluation.
These warning, reappearance, and detail-consistency consequences remain source predictions. Existing trace revision checks close stale chart traces.
No pending-worker, full project component, real export, browser, representative author, restore history, or performance proof ran.

## Primary comparator checks

Read three official pages on October 22, 2026:

- [TanStack Table row selection](https://tanstack.com/table/latest/docs/framework/react/guide/row-selection): default IDs use indices; callers can supply row IDs. Selection state can retain IDs absent from a paged row model.
- [AG Grid row replacement](https://www.ag-grid.com/react-data-grid/data-update-row-data/): its documented example loses selection without supplied IDs and preserves shared-row selection with IDs.
- [AG Grid row IDs](https://www.ag-grid.com/react-data-grid/row-ids/): callers must return stable, unique strings.

These support reset and keyed preservation as coherent alternatives. They do not prove explorEDA behavior or demand.
No dependency choice, performance benefit, or copied public API follows from them.

## Historical evidence and limits

Reuse R043's [summary](https://github.com/byronwall/explorEDA/blob/89e85dead29dd61f1b7b79d359f4bad0c38fab4d/docs/research/entity-grain-2026-10-21/README.md)
and [decisions](https://github.com/byronwall/explorEDA/blob/89e85dead29dd61f1b7b79d359f4bad0c38fab4d/docs/research/entity-grain-2026-10-21/decisions.md).
Their relative links resolve at that historical ref, not this branch. They establish partition distinctions, not replacement correctness.
No broader preparation, Mosaic, retention, or bin survey was repeated. Large product changes remain proposed for review.
