---
id: exp-cy24
status: closed
deps: []
links: []
created: 2026-10-05T03:50:55Z
type: feature
priority: 2
assignee: saved_views
tags: [saved-views]
---
# Save independent chart and filter views on tabs

## Outcome
Create, rename, duplicate, and switch named views over one source. Each view keeps its chart definitions, layout, chart filters, and local Rows filters. Shared field definitions and colors stay current across views.

## Readiness and ownership
Base: 1bcae7d on `codex/saved-view-tabs`. Owner: saved_views. The package already exposes settings capture and restore; the demo host owns local storage. Reuse the disposable fixed shop/order fixture. No production data.

## Decisions
Must: store source rows once and persist the tabs, active tab, settings, filters, and retained history locally. Show failed saves and allow export of current analysis. Keep Rows and chart filters visibly scoped.
Prefer: one host shell around one active ExplorEda instance, with callbacks capturing edits and explicit restores on tab changes.
Exclude: parameterized navigation, comparison, multi-source, and server storage.

## Acceptance
- Create, rename, duplicate, and switch tabs; each view restores its own charts, layout, and filters.
- Shared field definitions and colors update dependent views.
- Reload restores source rows once, tabs, active tab, settings, and filters.
- A failed local save is visible, and current analysis can be exported.
- Verify meaningful filters and reload in browser at 1280, 783, and 390 px.
- Run focused checks and `pnpm check`.

## Provenance
Shape: `docs/intent/project-task-views/shape-brief.md`; direct authorization dated 2026-10-04. History ticket: exp-o99e. This ticket owns the first saved-tab slice.


## Notes

**2026-10-05T04:27:30Z**

Implementation integrated on codex/saved-view-tabs. Named views, local session restore, shared field settings, per-view charts and filters, save failure notice, and current-analysis export are implemented. Focused demo checks pass (25 tests), including source codec preservation for undefined/NaN and reload restoration. Full pnpm check passed UI, package/demo builds, and types; one unrelated categories test timed out once, then passed alone (14 tests). Browser checks at 1280, 783, and 390 px remain with root.

**2026-10-05T04:28:09Z**

Validation detail: pnpm check completed UI conventions, package/demo builds, and both type checks. The package test suite had one categories test timeout (529/530 passed); that test passed when rerun alone. All 25 demo tests pass after the final extraction, and the demo production build passes.

**2026-10-05T04:36:04Z**

Repair on the same branch: startup now distinguishes no saved session from failed storage reads or invalid saved data. A visible notice preserves the stored value while retrying and offers an explicit clear-and-import path. Added a regression test for unreadable saved JSON, retention during retry, and explicit clearing before a new import.

**2026-10-05T05:23:13Z**

Final review repair: a valid local session now takes precedence over an example URL on refresh, preserving source, active tab, filters, and chart settings. Selecting the back control still exposes the source chooser. Added an actual-routing regression with ?example=shop-operations and a populated two-tab saved session.

**2026-10-05T05:42:43Z**

Combined check at 9cdadbc passed on Node 24: UI rules, both builds and type checks, 531 package tests, and 28 demo tests. Browser on 2f0aea7 confirmed three-tab reload, active tab, independent Web/Store 167/500 filters, local chart deletion, and ArrowLeft/Home/End selection. Final empty-grid browser check and screenshots remain.

**2026-10-05T05:52:01Z**

Accepted saved-tabs outcome at 9cdadbc. Clean-room browser verified blank-tab metric creation (500 rows), switch/reload retention of three tabs and active chart, independent Web/Store filters (167/500), local chart deletion, keyboard arrows/Home/End, and controls at 1280/783/390. Shared palette propagation passed the earlier independent pass; later repairs did not change it. Save/read failure retention and export are covered by focused tests. Browser console reported no warnings or errors. Final screenshots: tmp/saved-views-final-tabs.jpg and tmp/saved-views-final-390.jpg. CSV browser import/export remains unverified after chooser interruption. Root owns final PR publication; history category repair remains in exp-o99e.
