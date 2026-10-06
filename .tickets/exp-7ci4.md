---
id: exp-7ci4
status: closed
deps: [exp-3sen, exp-rjh4]
links: []
created: 2026-10-02T03:58:32Z
type: feature
priority: 2
assignee: Byron Wall
parent: exp-b6fo
tags: [runtime-config]
---
# Demonstrate add, edit, inspect, and integrate on the example

## Outcome
A developer opens the prepared example, adds and edits a chart, inspects its current specification, and reaches the host integration explanation without reading JSON. Reset restores the example.

## Likely Steps
Connect the existing landing and demo flow to the new inspector and host read guidance. Change only copy or navigation needed to make the working journey clear. Reuse the shipped example, Chart details editor, and Reset.

## Ready Gate
Confirm the inspector and host read packets have landed. Review the current example entry, add/edit controls, Reset, and integration guide. Check browser flow by pointer and keyboard at 1280, 783, and 390 pixels.

## Proof and cut line
Complete add/edit/inspect/integrate and Reset from a fresh example. Keep personal-data persistence, spec editing, comparison UI, task views, agents, and multiple sources out of scope.

## Provenance
Intent claims feedback-1 through feedback-6, final-inspection-1, final-inspection-3; selected shape in https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/intent/runtime-configuration-story/shape-brief.md; milestone M3 in https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/intent/runtime-configuration-story/implementation-plan.md. Repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.

## Notes

**2026-10-02T04:39:19Z**

Next packet review: existing hero opens shop-operations; Reset remounts original props and has a regression test. IntegrationGuide currently documents data/savedData/onStateChange and two typed examples. Owned next boundary is demo journey guidance and a direct route to integration, plus a working getSettings ref example. Must preserve primary example action, prepared initial state, add/edit controls and Reset. Acceptance: fresh example add/edit/Chart spec/integration/Reset by pointer and keyboard at 1280/783/390; guide explains initial and later getSettings reads with edit-only callback semantics. Exclude spec editing or extra persistence. Dependencies remain enforced; no demo implementation started.

## Readiness and ownership
Base: `36ed832` with `exp-3sen` and `exp-rjh4` accepted and closed. Dependencies are satisfied. Ticket viewer and demo server are already running at `http://127.0.0.1:7412` and `http://127.0.0.1:5178`. Owner: continuous writer; root owns final acceptance and commits.

Owned boundary: demo landing page, featured example guidance, React integration guide and example source, and focused demo tests. The package inspector, ref API, existing example data, `onStateChange`, and Reset implementation are accepted dependencies.

## Decisions
- Must: keep the order-book example as the primary action and preserve its prepared startup state and Reset flow.
- Must: explain the path from Add chart, to Chart details edits, to Chart spec inspection. Give the example workspace a direct route back to the integration guide.
- Must: show `ExplorEdaHandle.getSettings()` for an initial host read and a later read, while `onStateChange` remains the edit callback.
- Prefer: reuse current page routing, workspace header, CodePanel, and example files. Keep integration content in the current guide.
- Exclude: spec editing, persistent settings changes, agent flows, or changes to package behavior.

## Acceptance
- Existing prepared example and Reset regression test pass.
- Existing demo tests check example guidance and the integration link. Browser proof checks the initial and later read explanation.
- Focused package tests protect initial and edited reads and edit-only callback behavior.
- Browser proof completes Add, Chart details edit, Chart spec inspect, integration guide, and Reset by pointer and keyboard at 1280, 783, and 390 px.
- Keep desktop support claims accurate. Do not claim global mobile support.

## Provenance
Runtime configuration story milestone 3: `https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/intent/runtime-configuration-story/implementation-plan.md`; scope from this ticket and the accepted root dependencies.

**2026-10-02T04:53:59Z**

Implementation checkpoint: demo guidance connects Add chart → Chart details → Chart spec; a native /#integration link returns from the example to the guide. OrdersExplorer.example reads ref.current.getSettings() after mount and on demand; onStateChange remains the edit callback. Focused demo tests pass (19 tests), demo typecheck, UI convention check, demo lint, and git diff --check pass. Browser proof at 1280/783/390 remains pending; leave ticket in progress for root acceptance.

**2026-10-02T04:55:20Z**

Root review: native integration link avoids transition timing state. Removed the new static IntegrationGuide test because it only asserted copied source strings. Existing routing/Reset regression tests remain; focused package tests already prove getSettings behavior. Required browser guide and journey proof remains open. Final full pnpm check is running against combined source.

**2026-10-02T04:56:53Z**

Final combined project gate passed at 0cb8dcb on Node24.21.0: pnpm check includes UI conventions, all builds/types, 378 package tests and 18 demo tests. Static source-only test removal supersedes earlier19-test count. Existing act and chunk-size warnings are non-fatal. Required browser journey at1280/783/390 remains unfinished.

**2026-10-02T05:03:37Z**

Accepted at 85916e9. Independent browser pass at1280/783/390 started fresh from the landing primary action. Prepared shop inventory had7 charts; adding Distribution of Units made8; keyboard-opened Chart details changed title to Units by count edited; Chart spec showed edited title, field and x0/y14/w6/h4. Reset restored7 original entries, titles and bounds. React integration guide link reached /#integration; readable guide and TSX example show initial and on-demand getSettings reads with edit-only callback. Enter placed/opened controls and Escape closed details. Screenshots tmp/journey-1280.png, journey-783.png, journey-390.png show restored7-chart state; earlier browser snapshots and root review saw edited8-chart state. No blocking discovery issues. Final pnpm check passed on Node24.21.0 at85916e9:378 package tests and18 demo tests, builds/types/UI checks. No source changes remain pending.
