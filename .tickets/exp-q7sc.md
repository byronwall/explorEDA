---
id: exp-q7sc
status: open
deps: []
links: []
created: 2026-10-06T20:00:00Z
type: task
priority: 3
assignee: Byron Wall
tags: [multi-source, performance]
---
# Measure related-table evaluation at the planned scale

The plan's working scale is about ten tables of 10,000 rows. PR #161 reported input delays of 447–1,006 ms on a fixed-seed probe, which is why the worker exists, but the probe script was not carried into the stack.

Add a small fixed-seed probe under `packages/explorEDA/scripts/` that builds the tables, evaluates a lookup chain and a grouped summary, and reports time, output rows, and origin links.
Record main-thread and worker timings in the browser with the shop demo's `createWorker` on and off.
Use the numbers to decide whether `ExplorEdaProject` should default to the worker.
