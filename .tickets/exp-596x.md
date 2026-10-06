---
id: exp-596x
status: partially_implemented
deps: [exp-daa4]
links: []
created: 2026-10-06T02:54:21Z
type: feature
priority: 2
assignee: Codex
tags: [multi-source]
---
# Follow a complete query and inspect related records

## Outcome
Selected-query schema overlay and simplified/full flow explain exact backing rows, nested records, and aggregate contributors.

## Decisions
Keep React and TypeScript. Use the existing worktree, saved tabs, and history. Source rows stay outside checkpoints. Never select an arbitrary lookup match or silently change chart grain. Preserve single-source use.

## Work
- Expose explicit query stages and real renderer filter/calculation/aggregation/exclusion traces.
- Add query overlay, step inspection, related scalar tables, contributors, and explicit new-view actions.
- Persist meaningful inspection selection and invalidate stale traces by applied result revision.

## Readiness and ownership
Owner: current Codex execution. Base: a2e67c0 plus planning commit. Synthetic shop fixture only. Package builds before demo/browser checks. Separate core writer owns lib/analysis; host/UI writer owns integration.

## Acceptance
Check both query paths and every stage against fixture expectations. Reach C1’s two orders and three items totaling 50. Inspect empty stages and exclusions. Restored definitions produce matching flows; temporary inspection leaves layouts unchanged.
Run focused semantic tests, pnpm check, and browser checks at 1280, 783, and 390 px. Save screenshots under tmp.

## Provenance
Implementation plan milestone m3. User authorized same-worktree implementation, commits, and PRs with images. No deployment or publishing.


## Notes

**2026-10-06T03:32:03Z**

Implementation checkpoint: per-stage fields/counts/conditions, query overlay, source/intermediate views, related scalar tables, source contributors, chart-to-query flow, and saved step/record selection are implemented. Missing selected steps remain explicit, and inspection row limits are labeled. Required exact backing-row and restored-flow browser proof remains. Next: independent browser verification after first-slice acceptance.
