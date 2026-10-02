---
id: eufr3-5ig1
status: in_progress
deps: []
links: []
created: 2026-10-01T21:13:23Z
type: task
priority: 3
assignee: Byron Wall
tags: [ui, feedback-rnd-2]
---
# Follow up on feedback round 2 drawers, details, and placement

Gaps reported after implementing feedback round 2:

1. Placement pushes charts straight down and does not close the gaps it leaves. A chart beside the pushed ones stays put, so a row can end up ragged. Decide whether accept should compact the grid.
2. The calculation list is a five-column table. In the narrow settings panel it scrolls sideways, so the panel opens wide when calculations exist. Consider a stacked row layout for the narrow width.
3. Pressing Escape twice quickly in chart details, first on a confirmation and then on details, needs a third press because the confirmation is still animating out.
4. Rows and workspace settings cover an open field list instead of sitting beside it. Check whether the field list should close or move.
5. Browser checks did not cover many-category charts, all-null fields, or empty filter results inside the details view and Rows drawer. Unit tests cover filter scope and cancellation only.
6. Saved-layout reload after an accepted placement is covered by a unit test on the saved structure, not by a browser reload.

**2026-10-02T03:57:11Z**

Planning pass 2026-10-01: Keep these six recorded follow-ups as one bounded cleanup ticket. Reproduce current behavior before fixing or recording a supported decision for each item. Check changed drawer/details/placement flows in the browser at wide, intermediate, and narrow widths. Do not expand this ticket into a general UI sweep. It is an independent frontier root beside the example-coverage initiative.

## Outcome
Resolve the six feedback follow-ups from round 2. The chart placement behavior and right-edge panel ownership follow the existing UI defaults. Fix the rapid Escape and narrow calculation-list issues. Cover null, many-category, and empty-result cases, then verify the visible journeys and saved placement in the browser.

## Readiness and ownership
- Base: `60edb84` on `codex/example-coverage-tickets`.
- This ticket owns `packages/explorEDA` drawer, details, and placement sources, focused tests, this ticket, and one patch changeset.
- Another worker owns demo coverage/examples and review docs. That worker has exclusive browser access until handoff.
- No code prerequisites. The saved placement and filter scope implementation already exists.
- The shared ticket viewer is available at `http://127.0.0.1:7341`.

## Decisions
- Placement stays push-down. The UI defaults say to move obstructing charts down and show their proposed positions before acceptance. Do not compact unaffected charts.
- The right edge shows one panel at a time. Rows and workspace settings replace the field list, which returns when either closes. This matches the UI defaults; do not move or close the field list as an additional behavior.
- Keep the calculation list content and actions. Stack its rows when the settings panel is narrow.
- Fix rapid Escape at the shared chart-details/nested-confirmation boundary.
- Keep this ticket to these six items. Do not start a general drawer or chart sweep.

## Acceptance
1. Record the push-down placement decision against the UI defaults and retain the existing placement preview/accept/cancel behavior. Browser proof covers placement and reload of the accepted layout.
2. The calculation list has no horizontal overflow in the default narrow settings panel. Browser proof checks narrow and wide panel widths with calculations present.
3. From chart details, Escape closes a delete confirmation; a second Escape during its exit animation closes details. A focused regression test proves both presses.
4. Record the one-panel-at-a-time decision against the UI defaults. Browser proof confirms the field list returns after Rows or settings closes.
5. Check many categories, an all-null field, and an empty filtered result in details and Rows. Add focused tests only if source behavior exposes a real defect. Browser proof reports the scenarios and any failure.
6. Accept a proposed placement, reload the saved analysis in the browser, and confirm the accepted positions persist.

Package checks: focused relevant tests, `pnpm check:ui`, and `pnpm check` after the combined change. Do not close until all required browser criteria pass.

## Provenance
Planning pass 2026-10-01: the six follow-ups after feedback round 2. This is an independent frontier root beside the example-coverage initiative.

## Execution checkpoint
Owner: library source worker.
Base: `60edb84`; worktree `codex/example-coverage-tickets`.
Initial inspection: `shiftForPlacement` pushes only intersected charts and is used for preview/accept; `PlotChartPanel` ignores Escape while any nested layer remains mounted; calculations use a fixed five-column table inside a 440px settings drawer. Existing UI defaults settle placement and panel ownership.
Available proof: dependencies are installed. Browser is reserved for the coverage worker and root's independent verifier.
This initial checkpoint is superseded by the later library source checkpoint below.

## Notes

**2026-10-02T04:20:42Z**

Library source checkpoint, 2026-10-02

Implemented: Chart details now ignores an alertdialog whose data-state is closed, so the second Escape can close details during the confirmation exit animation. Calculation rows stack with visible labels when the settings drawer is 560px wide or narrower. The change includes one patch changeset.

Proof: `pnpm --filter exploreda exec vitest run src/components/__tests__/PlotChartPanel.test.tsx` passes 13 tests. The new test models a mounted closing alert layer. It fails with the original nested-layer predicate and passes with the closed-layer guard. `git diff --check` passes. Root owns `pnpm check:ui`, combined `pnpm check`, and build coordination.

Review of existing behavior found no source defect to fix for item 5: `DataTableBody` renders an empty-result message; `FieldValues` handles fields with no chartable values and zero filtered rows; category lists already bound long lists. No generic or speculative changes were added. Browser proof is still required for these visible states.

| Criterion | Check or steps | Result | Evidence |
|---|---|---|---|
| 1. Placement policy and saved layout | Existing `shiftForPlacement` moves only obstructed charts; accepted preview and reload still need browser proof. | blocked | Decision recorded from `docs/ui-defaults.md`; browser verifier pending. |
| 2. Narrow calculation list | Container query stacks rows at 560px and below; browser widths still need visual check. | blocked | CSS and data labels changed; browser verifier pending. |
| 3. Rapid Escape | Focused regression test with closing layer fixture; also confirmed it fails with original predicate. | pass | PlotChartPanel test file passes 13/13. |
| 4. Field list ownership | Existing UI defaults say Rows/settings replace the field list; restoration still needs browser proof. | blocked | Decision recorded from `docs/ui-defaults.md`; browser verifier pending. |
| 5. Empty, null, and many-category cases | Source inspection found existing empty and no-values handling; visible details and Rows paths still need browser proof. | blocked | `DataTableBody`, `FieldValues`, and existing category handling inspected. |
| 6. Saved-layout reload | Accept placement and reload in browser. | blocked | Browser verifier pending. |

Next action: root builds the package and coordinates independent browser verification at 1280px, 783px, and 390px. Keep this ticket in progress until all browser criteria pass.

**2026-10-02T05:11:53Z**

Owner checkpoint: source fixes are committed at c0dd3ad with passing focused regression and UI conventions. Independent browser verification has not returned evidence after about 50 minutes. Requested its completed-step checkpoint and exact blocker, then interrupted and resumed the same worker to recover evidence. Browser criteria remain unfinished. Next: review that checkpoint and continue only remaining flows on the isolated :5188 server.

**2026-10-02T05:22:16Z**

Owner checkpoint: independent browser proves rapid Escape, focus return, calculation readability at three widths, Fields return after settings and Rows, placement preview cancellation, and accepted placement. Repeated Vite page reloads from shared watched files interrupted imported fixture proof. Frozen production preview at :5190 now isolates final edge-case and saved-analysis reopen checks. Remaining proof stays open; next action finish static preview checks.

**2026-10-02T05:30:20Z**

Owner combined-check checkpoint: final pnpm check passed on Node 24 after type repair, including UI checks, package/demo builds, both type checks, 375 package tests and 18 demo tests. Coverage accepted at daa5165. The isolated :5190 preview remains unchanged while final drawer browser proof continues. Keep this ticket in progress until edge cases and actual saved-layout reopen pass.
