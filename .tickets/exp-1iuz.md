---
id: exp-1iuz
status: partially_implemented
deps: [exp-596x]
links: []
created: 2026-10-06T02:54:21Z
type: feature
priority: 2
assignee: Codex
tags: [multi-source]
---
# Inspect parameter instances with automatic, consistent updates

## Outcome
Record-seeded and manual bindings update all stages consistently, survive restoration, and operate within measured local limits.

## Decisions
Keep React and TypeScript. Use the existing worktree, saved tabs, and history. Source rows stay outside checkpoints. Never select an arbitrary lookup match or silently change chart grain. Preserve single-source use.

## Work
- Add typed parameter definitions, assisted inputs, per-view bindings, and dependency-limited isolated-stage evaluation.
- Separate draft and applied bindings; atomically publish results and discard stale completions.
- Measure fixed-seed ten-table/10,000-row inputs and fan-out; choose a worker only when input responsiveness requires it.

## Readiness and ownership
Owner: current Codex execution. Base: a2e67c0 plus planning commit. Synthetic shop fixture only. Package builds before demo/browser checks. Separate core writer owns lib/analysis; host/UI writer owns integration.

## Acceptance
Known record, invalid input, no-match, delayed out-of-order completion, view switch, preview, export, and restore all keep bindings/rows/counts aligned. Record timings, result sizes, origin size, and storage size; never silently truncate computed output.
Run focused semantic tests, pnpm check, and browser checks at 1280, 783, and 390 px. Save screenshots under tmp.

## Provenance
Implementation plan milestone m4. User authorized same-worktree implementation, commits, and PRs with images. No deployment or publishing.


## Notes

**2026-10-06T03:32:03Z**

Implementation checkpoint: customer/date inputs, required-value validation, automatic synchronous updates, ready Customer orders tab, and declared output columns for empty results are implemented. Typed evaluator cases pass. Node24 scale/fan-out evidence is recorded in exp-l1vm. Execution is synchronous, so there are no overlapping async completions. Required browser proof: C1/C4 rows/counts/labels stay consistent, invalid inputs retain applied values, restore/reload works, and large fixture responsiveness. No worker boundary added without measured need.

**2026-10-06T04:38:31Z**

Browser checks passed C1, C4, and invalid-date behavior. Invalid drafts retain the applied bindings and matching rows. The generated project displayed all 10,000 output rows and ten source tables. Inspection showed 20 of 10,000 rows. Console checks found no errors. Tool wall times do not isolate input blocking. Actual browser event-delay measurement remains required before the scheduling decision closes.

**2026-10-06T05:51:28Z**

Browser measurements meet the plan's worker condition. Input-to-frame delay was 447–1,006 ms for the ten-table parameter query. Long Tasks matched those delays. Counts remained correct at minimum values 0, 500, and 900. One worker now owns asynchronous evaluation, applied-result labels, stale completion rejection, and repeated source serialization costs. Required acceptance stays open until measured browser input delay improves.
