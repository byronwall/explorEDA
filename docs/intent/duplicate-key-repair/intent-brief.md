---
title: "Repair duplicate entity keys without losing original records"
slug: "duplicate-key-repair"
phase: plan
status: current
last_updated: "2026-10-31"
---

# Repair duplicate entity keys without losing original records

An analyst can resolve an ambiguous entity table and reuse the accepted result in relationships and notebooks.
The repair keeps exact original records, complete review evidence, and explicit exclusions.
Legitimate repeated events remain events; uniqueness alone does not justify deleting them.

The [implementation plan](implementation-plan.md) starts with exact/manual repair, full reuse, saving, and notebook evidence.
Ordered selection follows. Composite source identity and relationship endpoints ship together after that.
The [research summary](../../research/duplicate-repair-design-2026-10-31/README.md) records the reasoning and limits.
All original reports and companions remain in the [asset index](assets/pro-results/README.md).

This is an unbuilt feature plan. Build dispositions do not approve implementation.
No generic query-output engine, fuzzy merging, field coalescing, or automatic source deletion is part of this scope.
