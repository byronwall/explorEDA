---
id: exp-1iuz
status: closed
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

**2026-10-06T06:15:50Z**

Checkpoint 58ba8aa adds one packaged worker and rejects superseded results. Binding-only updates retain applied labels and rows. Query, definition, or source changes show a pending result. Valid empty results replace prior rows.

The worker receives source tables once per source map. The host caches source serialization, delays normal saves, and flushes on page exit. StrictMode, out-of-order completion, query changes, and immediate reload regressions pass.

All 590 package tests and 47 demo tests pass. Package and demo builds, type checks, and UI checks pass. The final browser timing and acceptance pass remains open.

**2026-10-06T06:25:26Z**

Latest browser timing: minimum values 0, 500, and 900 took about 100, 75, and 82 ms to reach the next frame. Rapid edits finished on minimum 900 with 1,031 rows and matching stage counts. The final result applied about 625 ms after the last input. Observed Long Tasks were 75–93 ms. The pre-worker baseline was 447–1,006 ms. Final acceptance remains open for the chart workload repeat and remaining browser flows.

**2026-10-06T06:45:59Z**

Required browser acceptance failed on Customer orders C1 to C4. The page became blank when the empty result restored a grouped summary. Error: Grouped summary Order amount by customer references missing group field orders.customerId.

Source inspection found the provider detects changed fieldNames props but does not update its declared fields before data restoration. The worker initially mounts an empty schema; populated rows hide this defect until the result is empty. A focused provider correction and real transition regression are required before closure.

**2026-10-06T07:28:27Z**

Accepted at f008df6. C4 gives a valid empty result; C1 returns two rows and amount 50. Invalid drafts retain applied data. Settled minimum 500 gives 5,059 rows; 900 gives 1,031. Chart, bindings, and counts survive reload and both project export/import modes. Worker ordering, declared fields, StrictMode, and page-exit save regressions pass. Timing limits remain recorded in the initiative map.

**2026-10-06T07:34:57Z**

Delivered in PR #161: https://github.com/byronwall/explorEDA/pull/161. Six screenshot attachment URLs were verified.
