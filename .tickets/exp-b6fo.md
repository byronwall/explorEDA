---
id: exp-b6fo
status: closed
deps: [exp-3sen, exp-rjh4, exp-7ci4]
links: []
created: 2026-10-02T03:58:08Z
type: epic
priority: 2
assignee: Byron Wall
tags: [runtime-config, planning]
---
# Runtime configuration story

## Outcome
Developers can see how a single-source workspace's current settings drive its charts, and embedding hosts can read those settings.

## Likely Steps
Deliver a readable package inspector, initial and edited host settings access, and a reviewed add/edit/inspect example journey.

## Ready Gate
Refine child packets against current source and verify the local example and browser proof environment. The epic tracks completion; it is not a prerequisite for its children.

## Provenance
Intent claims c1, feedback-1 through feedback-4, and final-inspection-1 through final-inspection-3; selected shape in https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/intent/runtime-configuration-story/shape-brief.md; milestones M1-M3 in https://github.com/byronwall/explorEDA/blob/362db58082df9c1b57c2305a49823a1dae385081/docs/intent/runtime-configuration-story/implementation-plan.md; repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.

Cut line: no spec editing, comparison UI, agent service, task views, or multiple sources.

## Notes

**2026-10-02T05:03:37Z**

All three children accepted on codex/runtime-configuration. Inspector uses current provider state and shows chart inventory/settings/layout plus expandable references. Public ref.getSettings reads initial and edited SavedDataStructure; savedData is optional; onStateChange stays edit-only. Example add/edit/inspect/integrate/Reset passed by pointer and keyboard at1280/783/390. Final pnpm check passed on Node24.21.0 at85916e9:378 package tests and18 demo tests, all builds/types/UI conventions. Root reviewed source and screenshot evidence. One minor changeset is included. No service, persistence policy, spec editing, comparison, push, PR, or deployment was added. Required acceptance has no remaining failures.
