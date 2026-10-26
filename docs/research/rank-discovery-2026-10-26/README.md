# Rank-based pair discovery: decision

Build native Spearman in the existing Scatter Matrix, then add Pearson/Spearman comparison and a compact pair browser.
Continue into original Scatter through a prepared draft that names the destination population.
Chronological dates are explicit implementation work, not existing Scatter behavior.

Topic score: **18/20** — capability 4, Pro advantage 5, buildable 5, momentum 4.
See the [implementation plan](../../intent/rank-discovery/implementation-plan.md), [run record](run.md),
and [Pro conversation](https://chatgpt.com/c/6adf0075-3e48-83ea-86b8-605d87cfc376).
Build below means planned work; it does not approve shipping.

## Findings and current-code review

Baseline/current main: `9d64a021e35d312887b1bc848e307f42b6c3091f`.
Pro finished after 30m43s. Both complete reports were collected and read; no follow-up was needed.
Original reports and ZIP stay under ignored `tmp/pro-rank-discovery-2026-10-26/collected/`.

- `ScatterMatrix/matrixPlan.ts` already supplies mixed cells, pair-valid Pearson, color groups, and self-excluded live populations.
  Extend that chart rather than creating another correlation matrix.
- Average ranks must follow pairwise deletion and group intersection. Whole-column ranks give incorrect answers after subsetting.
  Pooled correlation is a direct calculation, not an average of groups.
- `ScatterPlot/scatterAxis.ts::scatterAxisKind` maps datetime to bands.
  `pairedSummary.ts` uses numeric inputs and accepts two pairs. Keep that contract while adding a separate three-pair comparison.
- `CrossfilterWrapper.getAllData` reads self-excluded groups before source-local restriction.
  This supports a narrow future query for after-clear draft counts; the already restricted matrix live list is insufficient.
- `ChartDraftContext`, placement, and preview already exist. Preview shares the current wrapper and receives matrix peer filters.
  A matrix showing n8 can correctly launch a Scatter showing n3 when the matrix selects three rows.
  Name that change. Do not copy outgoing filters or clear them during preview.
- `holdStateChanges` batches callbacks; it does not roll back mutations.
  `addChart` creates an ID and returns void. The plan uses those actual boundaries.
- Saved validation, DSL roots, no-op host echo, project reopen, history, and image labels ship with each exposed choice.
  Ranks and navigation context stay out of saved state.

The local plan changes two Pro details. It makes indexing/workers conditional on measured need, and leaves the proposed endpoint clamp exploratory.
It uses one transient origin record in existing context rather than requiring a general navigation store.
Time-axis support stays a separate milestone with numeric-only consumer checks.
These choices preserve the feature while avoiding infrastructure before it is needed.

## Local dispositions

| IDs                   | Disposition     | Reason                                                                                           |
| --------------------- | --------------- | ------------------------------------------------------------------------------------------------ |
| RD-01                 | Build           | Native Spearman adds a useful method to an existing raw-data matrix.                             |
| RD-02                 | Build           | Pair deletion, average ties, group reranking, explicit counts/statuses define the statistic.     |
| RD-03                 | Build           | Both mode exposes differences without relying on memory.                                         |
| RD-04                 | Build           | At most 45 unique pairs per facet justify compact navigation without moving fields.              |
| RD-05                 | Build           | Coefficients need paired/live/group denominators distinct from selection and drawing.            |
| RD-06                 | Build           | Prepared continuation must explain peer-filter effects and preserve cancellation/undo.           |
| RD-07                 | Build           | Chronological original Scatter needs explicit time geometry and typed brushes.                   |
| RD-08                 | Build           | Share comparison arithmetic while retaining raw numeric summaries and fits.                      |
| RD-09                 | Build           | Save/text/echo/history/reopen/export are part of the feature.                                    |
| RD-10                 | Build / Explore | Build exact measurement/invalidation; explore indexes/workers only after a measured need.        |
| RD-11                 | Build           | Named controls, trace conventions, focus, and three-width verification complete the interaction. |
| RD-12                 | Explore         | Prepared ranks remain useful for a fixed-cohort teaching example.                                |
| RD-13                 | Defer           | Kendall tau-b needs its own meaning and fixtures; it does not complete this workflow.            |
| RD-14                 | Defer           | General shape discovery is a separate capability.                                                |
| RD-15                 | Defer           | Automatic clustering and group-only continuation add separate scope choices.                     |
| RD-16                 | Avoid           | No significance stars, causal ordering, mixed universal scores, or coercion.                     |
| RD-17                 | Avoid           | Global ranks after subsetting and automatic rank columns can change meaning silently.            |
| RD-18                 | Build           | Each milestone includes numerical, state, docs/example, and interaction proof.                   |
| Local numerical guard | Explore         | A fixed 16-epsilon clamp is an engineering proposal, not a demonstrated error bound.             |

## Evidence and remaining choices

Independent rational arithmetic confirms tied ranks, all three missing-data pair memberships/counts,
pooled/group/Other coefficients, equal-size opposite filters, nonlinear/U-shaped pairs, transforms,
permutation, signed zero, and the date-spacing/Pearson anchor.
These checks validate fixture mathematics, not proposed production code or numerical tolerances.

Existing wrapper, DSL export, and selection-restore tests plus docs checks are recorded in the run record.
No feature, browser, persistence-flow, or performance acceptance is claimed.
Open implementation choices: tiny-cell typography, facet predicate reuse, measured scheduling threshold,
UTC ticks, and a stable numeric algorithm/endpoint policy.
No outside-demand gate or unbuilt research PR blocks M1.

Decisive primary sources checked October 26:

- [R correlation documentation](https://search.r-project.org/R/refmans/stats/html/cor.html): pairwise reranking and common-cohort limitations.
- [SciPy rankdata](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.rankdata.html): average ties.
- [SciPy spearmanr](https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.spearmanr.html): monotonic association and constants.
- [Orange Correlations](https://orangedatamining.com/widget-catalog/unsupervised/correlations/): Pearson/Spearman pair choice and field handoff to Scatter.

No next topic is assigned. Review this plan before implementation.
