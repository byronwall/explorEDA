---
id: exp-m5ec
status: open
deps: []
links: []
created: 2026-10-06T20:00:00Z
type: feature
priority: 3
assignee: Byron Wall
tags: [multi-source, scatter]
---
# Offer a one-row-per-entity query from a scatter that repeats entities

A scatter on an item-level query draws one point per item. When X and Y are order fields, each order appears once per item.
PR #161 collapsed repeated IDs inside the scatter, which then had to disable density, fits, and paired summaries.
That was dropped from the stacked replacement.

Instead, when a scatter's fields all come from a looked-up parent, suggest opening a view on a query whose rows are that parent.
Use the existing Query panel helpers (`sourceView`, `queryForStage`) rather than chart-level identity rules.
Verify with the shop example at 1280, 783, and 390 pixels.
