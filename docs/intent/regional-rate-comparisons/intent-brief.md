---
title: "Regional rate comparisons"
slug: "regional-rate-comparisons"
phase: plan
status: current
last_updated: "2026-10-31"
---

# Regional comparisons with explicit exposure

Analysts should compare event counts and exposure-normalized rates across regions, then inspect the records behind both inputs.
One saved definition should keep the map, ranked table, and notebook finding aligned after filtering and refresh.

The [implementation plan](implementation-plan.md) proposes prepared regional totals first, then events with separate exposure.
Both workflows keep population, period, geometry version, collection coverage, and source availability explicit.
Covered zero-event regions remain selectable. Unknown collection remains unavailable.
Pooled findings divide total events by total compatible exposure; they do not average regional rates.

The existing map, query model, project callbacks, and worker coordinator provide useful foundations.
The design adds a bounded grouped-rate query operation and preserves input roles through the notebook and folder paths.
It does not require a universal metric language or the pending reusable-output and quantity plans.

The [research summary](../../research/regional-rates-design-2026-10-31/README.md) records the decision and verification limits.
The [asset index](assets/pro-results/README.md) preserves all eight original Pro artifacts.
This is planning for review, not approval to implement, merge, or deploy.
