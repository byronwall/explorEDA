---
id: exp-o99e
status: partially_implemented
deps: []
links: []
created: 2026-10-05T03:50:56Z
type: feature
priority: 2
assignee: saved_views
tags: [saved-views]
---
# Recover saved view edits with Undo and categorized history

## Outcome
Recover completed edits in the saved-tab project with Undo, Redo, and a timeline. Labels identify View, Filter, Both, and Shared changes. A single project-wide timeline is authorized as a reversible proposal.

## Readiness and ownership
Owner: saved_views. Depends on exp-cy24 tab capture and restore. Store project settings checkpoints without source rows. Use the disposable fixed shop/order fixture.

## Decisions
Must: preview is read-only and returns to the saved present; explicit restore retains the displaced present. Editing after Undo remains possible while older snapshots remain available. Bound history and show its retention bound. Measure serialized storage against the fixed fixture.
Prefer: full settings snapshots categorized by comparing consecutive states; one project timeline keeps chart and filter state consistent.
Exclude: source copies per checkpoint, branch graphs, and selective replay.

## Acceptance
- Undo and Redo completed edits; timeline labels View, Filter, Both, or Shared as appropriate.
- Timeline preview does not replace persisted present. Restore keeps the displaced present recoverable.
- After Undo, a new edit is possible and older timeline entries remain accessible.
- Reload restores the current state and retained history; source rows are stored once.
- History has a visible bound. Measure storage bytes for the fixed fixture and report the limit.
- Show failed saves and preserve current analysis for export.
- Verify chart and filter counts after Undo, Redo, preview, restore, edit-after-Undo, and reload at 1280, 783, and 390 px.
- Run focused checks and `pnpm check`.

## Provenance
Shape: `docs/intent/project-task-views/shape-brief.md`; direct authorization dated 2026-10-04. Depends on exp-cy24.


## Notes

**2026-10-05T03:53:26Z**

Execution prerequisite: saved-tab capture and restore code must be integrated and pass focused checks before history starts. Browser acceptance of exp-cy24 remains required for final closure, but does not block implementing history on the same writer branch. Removed full-ticket dependency to reflect this code prerequisite; no acceptance criterion removed. Root owns combined browser acceptance.

**2026-10-05T04:27:30Z**

History integrated on codex/saved-view-tabs. Undo/Redo, read-only preview, explicit restore preserving present, View/Filter/Both/Shared labels, edit-after-Undo, 50-checkpoint bound, source-once storage, and export on quota failure are implemented. Focused demo checks pass (25 tests). Fixed shop-operations fixture: 500 rows, 50 checkpoints, 189295 serialized bytes. Browser proof remains with root; keep unfinished pending combined acceptance.

**2026-10-05T04:28:09Z**

Validation detail: pnpm check completed UI conventions, package/demo builds, and both type checks. The package test suite had one categories test timeout (529/530 passed); that test passed when rerun alone. All 25 demo tests pass after the final extraction, and the demo production build passes.

**2026-10-05T04:36:04Z**

Repair on the same branch: strengthened preview restore coverage by switching to another saved tab during historical preview before restoring; restore opens that selected tab. The demo suite passes 26 tests.
