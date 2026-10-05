---
id: exp-o99e
status: closed
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

**2026-10-05T05:12:13Z**

Final source-review repair: ordinary capture no longer changes the ExplorEda mount key or savedData initialization snapshot, preserving mounted editors and focus. Tab selection, Undo/Redo, preview selection, Return to present, and explicit restore use a new keyed initialization snapshot. Demo tests assert editor draft/focus survives ordinary capture and history actions apply the requested settings. Focused demo tests pass (26/26), with UI and demo type checks passing.

**2026-10-05T05:23:13Z**

Final review repairs: captured settings stay frozen for each keyed workspace instance, so Add to grid and other ordinary edits no longer remount ExplorEda or lose the editor state. Explicit tab changes and history navigation still remount with requested snapshots. Added ArrowLeft/ArrowRight/Home/End tab selection and focus behavior. Full pnpm check passes: 95 package files/530 tests and 7 demo files/28 tests, both builds and type checks, plus UI conventions.

**2026-10-05T05:42:43Z**

Combined check at 9cdadbc passed on Node 24: 531 package tests and 28 demo tests, builds, types, and UI rules. Prior browser evidence covers Undo, preview, Return to present, restore, displaced-present recovery, and edit-after-Undo. Final repaired-build browser check remains. CSV browser upload/export was not completed; focused tests cover fresh baseline categorization, storage failure export, and import.

**2026-10-05T05:52:01Z**

Browser at 9cdadbc passed Undo/Redo (metric removal/restoration and filter counts 500/167), edit after Undo, preview/Return, explicit restore, displaced-present recovery, retained history after reload, and responsive controls. One required category defect remains: Count rows metric addition showed Shared instead of View. saved_views owns a focused repair; ticket stays unfinished. Screenshot: tmp/saved-views-final-history.jpg.

**2026-10-05T06:04:12Z**

Accepted history outcome at 7d79875. Full Node 24 pnpm check passes: UI rules, package/demo builds and types, 531 package tests and 30 demo tests. Final clean-room browser reopened the Shop example: blank-tab Count rows metric showed 500 and View; a second blank-tab Rows search for Web showed 167 rows and Filter. No console warnings/errors. Earlier combined flow at 9cdadbc passed Undo/Redo, edit after Undo, read-only preview, Return to present, explicit restore, displaced-present recovery, reload, and 1280/783/390 controls. Real-library tests cover omitted shared/Rows defaults; focused tests cover Both/Shared labels, retention bound, storage failure, and export. Final screenshots include tmp/saved-views-final-history.jpg and tmp/saved-views-final-metric.jpg. CSV browser import/export remains unverified after chooser interruption; automated checks cover those paths.
