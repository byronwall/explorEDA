# Build explicit expected-record reconciliation

Design score: **17/20** (capability 5, Pro advantage 4, buildable 4, momentum 4).

Build a grouped comparison of explicit expected and actual tables. Keep typed composite keys, exact evidence, and required-key coverage. Ship the core inspector, saved project analysis, notebook findings, then bounded schedules.

Read the [implementation plan](../../intent/missingness-and-expected-records/expected-records-implementation-plan.md), [original asset index](../../intent/missingness-and-expected-records/assets/pro-results/expected-records-design-2026-10-31/index.md), and [local evidence](evidence.md). [Pro conversation](https://chatgpt.com/c/6ae554c9-6f0c-83ea-a8dd-351611d0c2b1) completed in 22m29s. Follow-ups: 0/1.

The main fixture has five required keys, four matched and one absent: 80% coverage. Duplicate expected declarations and repeated actual records remain separate flags. Zero and null measurements can still satisfy presence. Missing input cannot establish absence.

Local review confirms the need for a two-input operator. It also resolves Pro's notebook question: reuse existing `eda query=`. Snapshots have no partial marker; treat a selected snapshot as its declared population and propagate explicit incomplete-read state where known. Do not infer it from row limits.

ER01–ER11 are Build plans, ER12–ER14 Explore, ER15–ER16 Defer, and ER17–ER18 Avoid. Build is a review disposition, not approval to implement. The plan includes local corrections and docs/examples in each milestone.

Primary-source checks support compound-key pairing and visible membership, but do not prescribe our denominator or null policy: [pandas merge](https://pandas.pydata.org/docs/reference/api/pandas.merge.html), [Power Query](https://learn.microsoft.com/en-us/power-query/merge-queries-overview), and [tidyr complete](https://tidyr.tidyverse.org/reference/complete.html). The originals contain the full source comparison.

Open questions: choose the measured schedule cap and resolve exact inspector controls during implementation. No outside-demand gate applies. Current checks cover independent fixture arithmetic and existing code; feature, browser, performance, and persistence acceptance remain future work.
