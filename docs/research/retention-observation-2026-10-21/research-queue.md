# Research choices and continuing queue

Updated 2026-10-21 UTC. Scores are local judgments, not user demand.

| Candidate                                                                                    | Novelty | Product value | Evidence gap | Pro fit | Decision and next action                                                                                     |
| -------------------------------------------------------------------------------------------- | ------- | ------------- | ------------ | ------- | ------------------------------------------------------------------------------------------------------------ |
| Retention observation windows after the delivered chart                                      | 8       | 8             | 9            | 9       | Primary mission. Compare current contract, lesson, upstream table and a small explicit observation boundary. |
| Local selection/export/undo/reopen trust                                                     | 3       | 9             | 8            | 3       | First local proof. Execute one task; another survey cannot accept it.                                        |
| Calendar stepping and rolling summaries                                                      | 5       | 7             | 7            | 6       | Existing intent and PR454 own adjacent time scope. Capture a repeated task before choosing semantics.        |
| Refresh identity and capacity                                                                | 5       | 8             | 8            | 4       | Declare keys, device and workload before measuring.                                                          |
| Reusable result tables                                                                       | 4       | 7             | 7            | 5       | Retain the repeated downstream analysis gate.                                                                |
| More preparation, freshness, missingness, relationships, rates, navigation, units or handoff | 1       | 6             | 2            | 2       | Completed surveys in PR451/452/455–460. Apply proof gates.                                                   |

## Why this mission

The previous queue treated domain views as a future chart family. Current code already registers Funnel, Retention and Timeline. Retention has a synthetic event-log example, source trace, entity selection, blank future cells and partial-period hatching. Do not rebuild these.

planRetention derives its observation end from the maximum readable timestamp in allIds. Cohorts and activity use ids. Summary denominators include reached cohorts, including partial cells. These source facts raise a distinct question: what can an event-only snapshot establish about observation completeness? The answer may support retaining the current contract. No observed recipient demand, telemetry outage or verified defect is supplied.

## Continuing queue

1. Local trust remains first: compare one category across bar, card and exported rows, then undo, redo and reopen. Stop at disagreement.
2. Retention observation: research the boundary after existing behavior. Keep any proof and lesson conditional; no automatic feature approval.
3. Completed topics: observe named tasks and apply existing gates. Avoid another broad survey.
4. Database preparation/freshness: use PR451/452 with SQLite and a declared grain. No adapter or shared transaction without a blocked task.
5. Identity/capacity: declare keys, device, workload and selection.
6. Result reuse: capture repeated export/import, result grain and consumer before adding named tables.
7. Domain views are delivered. Research an observed semantic gap rather than proposing their initial creation.

Previous queue: https://github.com/byronwall/explorEDA/blob/ae2716a2/docs/research/analysis-handoff-2026-10-20/research-queue.md.
