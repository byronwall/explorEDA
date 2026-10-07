---
id: exp-dv02
status: open
deps: []
links: []
created: 2026-10-07T04:30:00Z
type: bug
priority: 3
assignee: Byron Wall
tags: [tests]
---

# Stabilize the LandingPage history-clear routing test under load

## Outcome and Why

`LandingPage routing > returns to the example selector when browser history clears the example` passes alone but timed out once in a full `pnpm --filter demo exec vitest run`. A flaky test hides real regressions.

## Scope

Own `apps/demo/src/LandingPage.test.tsx`. Find the wait that depends on timing (likely the lazy workspace import) and await the rendered state instead of a fixed delay.

## Behavior and Failure Proof

Run the demo suite ten times in a row with no failure of this test.
