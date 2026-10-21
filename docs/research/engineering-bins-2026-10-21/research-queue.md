# Research choices and continuing queue

Updated 2026-10-21 UTC. Scores are local judgments, not evidence of demand.

| Candidate                                         | Novelty | Product value | Evidence gap | Pro fit | Decision and next action                                                            |
| ------------------------------------------------- | ------- | ------------- | ------------ | ------- | ----------------------------------------------------------------------------------- |
| R008: engineering histogram boundaries            | 8       | 8             | 9            | 9       | Selected. Compare current threshold tools, width/origin and explicit edges.         |
| R018: quantile and outlier conventions            | 6       | 7             | 7            | 8       | Next methods candidate. First identify a decision changed by the convention.        |
| R043: entity grain parity                         | 5       | 9             | 8            | 6       | Use preparation PR451 and a declared grain. Run parity proof before another survey. |
| R077: selection identity after source replacement | 5       | 9             | 8            | 4       | Declare source keys and refresh task; perform local proof.                          |
| R073: challenge example conclusions               | 6       | 8             | 7            | 6       | Pick one existing example claim and one counterexample; avoid a corpus expansion.   |
| Local selection/export/undo/reopen trust          | 3       | 9             | 8            | 3       | Remains first local proof. Another survey cannot accept the task.                   |

## Why this mission

PR463 adds a reviewed 100-idea catalogue. This run develops R008 rather than making another broad list.
Current numericBins uses full-source extents and integer-centered bins. ECDF already answers threshold questions.
The product decision is whether repeated engineering comparisons justify a new bin definition at all.
No named analyst task or verified runtime defect is supplied. Keeping the current controls is a valid answer.

Source reading also shows half-open bin membership and inclusive RangeFilter endpoints.
Their effect on exact edge observations needs a distinct proof; it does not establish a runtime defect here.
Do not let that bounded concern justify arbitrary bins by itself.

## Continuing queue

1. Local trust stays first: select one category, compare bar/card/export, then undo, redo and reopen.
2. R008: retain current controls unless a declared threshold task defeats ECDF, filters and upstream categories.
3. R018: compare quantile conventions only for a concrete changed decision.
4. R043/R077: establish grain and identity before local database or refresh proofs.
5. R073: challenge one existing example conclusion before adding more examples.

Preparation, freshness, missingness, relationships, rates, navigation, units, handoff and retention surveys are complete in PR451/452/455–461.
Mosaic research belongs to PR462. PR454 owns time-series axes. Do not duplicate those missions.
R011 overlaps completed retention research and must use PR461's proof gates.

Catalogue: https://github.com/byronwall/explorEDA/blob/codex/research-ideas-100/docs/intent/research-ideas-100/catalogue.md.
Previous queue: https://github.com/byronwall/explorEDA/blob/a915f696/docs/research/retention-observation-2026-10-21/research-queue.md.

## Reviewed outcome

R008 synthesis is complete. Keep current controls; apply [EB01–EB04](decisions.md).
After local trust, the exact-edge proof is the next bounded histogram action. Do not schedule another broad bin survey.
A lesson needs observed confusion. A new mode needs a named recurring task that defeats current comparators.
R018 remains conditional on a changed decision; R043/R077 need local grain/identity proofs; R073 needs one example counterexample.
The [original revised queue](originals/research-queue.md) preserves Pro's detailed gates without replacing this concise queue.
