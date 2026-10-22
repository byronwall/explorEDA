# Research choices and continuing queue

Updated 2026-10-20. Scores are local judgments, not demand evidence.

| Candidate                                                                           | Novelty | Product value | Evidence gap | Pro fit | Decision and next action                                                           |
| ----------------------------------------------------------------------------------- | ------- | ------------- | ------------ | ------- | ---------------------------------------------------------------------------------- |
| Portable analytical handoff after existing exports                                  | 8       | 8             | 8            | 9       | Synthesis complete. Current exports first; named-task guide comparison only.       |
| Local selection/export/undo/reopen trust                                            | 3       | 9             | 8            | 3       | First local proof. Execute one task; another survey cannot accept it.              |
| Refresh identity and capacity                                                       | 5       | 8             | 8            | 4       | Declare keys, device and workload before measurement.                              |
| Reusable result tables                                                              | 4       | 7             | 7            | 5       | Still gated on repeated downstream analysis. Handoff research cannot approve this. |
| Event-log funnel/retention                                                          | 7       | 6             | 8            | 6       | No named event-log task. Capture one before researching a chart family.            |
| More preparation, freshness, missingness, relationships, rates, navigation or units | 1       | 6             | 2            | 2       | Completed in PRs 451/452/455–459. Use existing proof gates.                        |

## Why this mission

Current exports have different contracts. Table CSV uses selected fields and matching rows. Analysis JSON stores rows and settings. Project export stores source tables, definitions and views. View export selects dependencies. Images preserve the drawn result. The quantity review exposed the distinction between scalar CSV and contextual analysis files.

The new decision is whether these paths already meet a recipient's needs. Compare explaining a finding, reopening an analysis, and reusing rows. These are synthetic recipient jobs, not observed demand. Avoid reopening the deferred result-table pipeline.

## Continuing queue

1. **Local trust remains first:** compare one category across bar, card and exported rows, then undo, redo and reopen. Stop at disagreement.
2. **Handoff:** synthesis complete. Observe a named task with ordinary explanation. Trial the proposed guide only for observed confusion after local trust. A note remains deferred.
3. **Completed topics:** observe named tasks and apply existing gates. Do not generate another broad survey.
4. **Database preparation/freshness:** use PR451/452 with SQLite and a declared grain. No adapter or shared transaction without a blocked task.
5. **Identity/capacity:** declare keys, device, workload and selection.
6. **Result reuse:** capture repeated export/import, result grain and downstream consumer before adding named tables.
7. **Domain views:** identify an event log and a blocked question first.

Previous queue: https://github.com/byronwall/explorEDA/blob/350df70b/docs/research/quantity-semantics-2026-10-20/research-queue.md.

## Review outcome

[Five dispositions](decisions.md) keep existing exports and reject a larger bundle for this mission.
The [original queue](https://chatgpt.com/c/6ad7bc52-215c-83e9-baa5-50baceffb947) adds bounded parameter-option and binding closure probes.
They remain unrun. Local trust stays first; completed topics need task evidence, not more surveys.
Record exchange does not satisfy the separate demand gate for analytical result tables.
