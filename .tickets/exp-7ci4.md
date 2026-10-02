---
id: exp-7ci4
status: open
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
Intent claims feedback-1 through feedback-6, final-inspection-1, final-inspection-3; selected shape in docs/intent/runtime-configuration-story/shape-brief.md; milestone M3 in docs/intent/runtime-configuration-story/implementation-plan.md. Repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.

## Notes

**2026-10-02T04:39:19Z**

Next packet review: existing hero opens shop-operations; Reset remounts original props and has a regression test. IntegrationGuide currently documents data/savedData/onStateChange and two typed examples. Owned next boundary is demo journey guidance and a direct route to integration, plus a working getSettings ref example. Must preserve primary example action, prepared initial state, add/edit controls and Reset. Acceptance: fresh example add/edit/Chart spec/integration/Reset by pointer and keyboard at 1280/783/390; guide explains initial and later getSettings reads with edit-only callback semantics. Exclude spec editing or extra persistence. Dependencies remain enforced; no demo implementation started.
