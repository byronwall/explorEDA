---
id: exp-dv01
status: open
deps: []
links: [docs/intent/demo-overhaul/implementation-plan.md]
created: 2026-10-07T04:30:00Z
type: feature
priority: 2
assignee: Byron Wall
tags: [projects, performance]
---

# Keep one analysis worker across project tab switches

## Outcome and Why

Switching tabs in a large project analysis no longer re-sends the source tables and re-evaluates from scratch. The January flights analysis (27,004 rows, three lookups) takes about 1.1 s per tab switch today, because `SavedViewsWorkspace` remounts `ExplorEdaProject` per view and `useAnalysisEvaluation` creates a new worker on each mount.

## Scope

Own `packages/explorEDA/src/lib/analysis/useAnalysisEvaluation.ts` and the `createWorker` wiring in `apps/demo/src/SavedViewsWorkspace.tsx`. Reuse one worker and its received tables while the project and tables are unchanged; cache the last evaluation per query and bindings.

## Behavior and Failure Proof

Open `/examples/january-flights`, switch through every tab, and confirm each result appears without a new `sources` message. Changing the project definitions still re-evaluates. Pending results for an older request are still dropped.
