# Build reusable grouped results

Define a grouped query once, then let other queries read its output. Keep the row grain visible and trace downstream operands to original observations.
Use a compact grouped-result editor over the current evaluator. This adds cross-query reuse beyond existing same-query grouping and multiple views.

The experiment fixture makes the distinction concrete: equal experiment means give **25**; pooled valid measurements give **28**.
Retain matching numeric counts and immediate operands. A union of original records cannot explain their different weights.
Chart selections remain presentation state; they do not silently become producer inputs.

Read the [local implementation plan and dispositions](../../intent/reusable-analysis-outputs/implementation-plan.md), [checked evidence](evidence.md),
and [original reports, fixtures, code companion, and mockups](../../intent/reusable-analysis-outputs/assets/pro-results/reusable-outputs-design-2026-10-30/index.md).
The [Pro conversation](https://chatgpt.com/c/6ae4577a-90a4-83ea-831b-8a38130406d9) finished in35m57s; no follow-up was needed.
Topic score: **18/20**; [candidate scores and run state](run.md).

Four releases are proposed: embedded references and traces; compact authoring and literal inputs; folder save/reopen; project-aware notebooks.
Each includes docs and runnable examples. Build is a planning disposition, not implementation approval.
The folder slice initially requires explicit project-owned sources. It does not require guided promotion or another save system.

Decisive code claims match current main at `5594c956`.
Primary sources support named derived data in [Vega](https://vega.github.io/vega/docs/data/) and recipe-based views in [DuckDB](https://duckdb.org/docs/2.0/sql/statements/create_view).
[Perspective](https://perspective-dev.github.io/guide/explanation/derived_table.html) provides a close reuse precedent and documents reaggregation limits.
These are design references, not new dependencies.

Remaining choices concern measured trace volume and optional predicate capture/dependency cloning.
The original mockup is a design concept, not browser acceptance. No feature, persistence, or performance proof is claimed here.
