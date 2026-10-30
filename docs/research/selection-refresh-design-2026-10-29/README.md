# Keep selections and findings through refresh

Build explicit keyed refresh across plain workspaces, project views, and live notebooks.
Save logical keys; derive current positions and values. Keep absent members requested and label partial results.
Require repair after an observed duplicate, even when its key later becomes unique.

Topic score: **19/20** — capability 5, Pro advantage 5, buildable result 4, momentum 5.
This Design extends R077's earlier audit with changed measures, repeated refresh, and live notebooks.
Byron supplies demand. The historical outside-demand gate does not apply.

Read the [local implementation plan](../../intent/selection-refresh/implementation-plan.md),
[evidence and SR01–SR16 dispositions](evidence.md), and
[original report/plan index](../../intent/selection-refresh/assets/pro-results/selection-refresh-design-2026-10-29/index.md).
Source: [Pro conversation](https://chatgpt.com/c/6ae3f166-ff88-83ea-b255-40afef7942a8), completed after 36 minutes 46 seconds.
Baseline and integration check: `5594c95690859e8ce456aa3228fa9265ba686d12`.

## What to build

1. Plain keyed workspace: select, refresh, inspect coverage, repair, save, and reopen.
2. Project/folder parity: existing project identity, explicit continuity, typed text, and state above workspace remounts.
3. Live notebooks: Keep, partial findings, current contributors, fresh-session reopening, and Undo against current data.
4. Later, exact expanded parent/child pairs. Never promote a parent selection to every child.

A/C starts at count 2, sum 40, mean 20. Editing A from 10 to 15 gives sum 45, mean 22.5.
Removing C leaves partial A=15. Returning C restores 45.
No resolved members means unavailable; deliberate empty counts zero; clear removes the restriction.
Identity coverage stays separate from numeric exclusions and owner eligibility.

Decisive code findings: provider restore coupling, discarded notebook identity, and the folder workspace remount.
Open [PR #566](https://github.com/byronwall/explorEDA/pull/566) already proposes ordered folder saves.
Reuse that work where sufficient rather than adding another queue.
AG Grid and TanStack primary-source comparisons support the boundary; the evidence review records their limits.

Final API names, status wording, and the suitable notebook history helper have implementation defaults in the plan.
Continuity relies on the author's no-key-reuse promise; the library cannot detect unobserved reuse.
No feature is implemented. Build dispositions define a reviewable plan, not implementation approval.
Original assets are preserved. ZIPs and source packets remain ignored under `tmp/`.
