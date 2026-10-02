---
title: "Developer adoption page — remaining implementation plan"
slug: "developer-adoption-page"
phase: plan
status: current
last_updated: "2026-10-02"
---

# Developer adoption page — remaining work

## Plan at a glance

The example-first landing and React integration paths are delivered. The remaining outcome connects existing task-labelled examples to chart guidance. The chart index and rendering-guide routes do not exist at baseline `d720f1f6b99d0a54564da5486da94208a563c71e`. Their minimal first slice belongs to the separate chart documentation initiative.

This pass prepares tickets only. Byron will review them and decide when to implement. Historical PR #27 evidence supports completed work; no fresh browser proof ran during this planning pass.

## Implementation strategy

- **First remaining proof:** Follow landing → chart index → scatter or bar guide → matching example, and open the rendering guide.
- **Primary seam:** The demo owns landing navigation and documentation routes. The package owns chart behavior.
- **Reuse:** LandingPage, ExampleSelector, current examples, and the accepted documentation first proof. Confirm whether existing task-labelled breadth already meets M3 before adding previews.
- **Local loop:** `pnpm --filter demo dev` with current fixtures; run focused demo tests and `pnpm check:ui`. Run `pnpm check` after broad changes.
- **Dependency:** Documentation routes and content must exist before landing links ship. No server or external provider is required by this accepted outcome.
- **Checks:** Verify direct guide URLs, refresh, links, pointer and keyboard use, three widths, and light/dark appearance. Recheck current example IDs and hosting paths; old plan candidates are historical.
- **Failure boundary:** Missing routes, wrong example IDs, inaccurate guide claims, and broken refresh prevent completion.
- **Rollback:** Remove new learning links. Existing landing and example paths remain useful while documentation work proceeds.

## Milestone 1: First screen proves the product — delivered

The featured real example, linked interaction, and Reset exist. Merged PR #27 records historical browser evidence. Do not create new implementation tickets for this delivered scope.

### Desired end state

Visitors can identify the component, open its featured example, and reset the workspace.

## Milestone 2: Two use paths — delivered

React integration, CSV import, and saved-analysis restore exist. PR #27 records historical integration and browser checks. Retain these paths.

### Desired end state

Visitors can try their data or inspect the React integration boundary.

## Milestone 3: Chart breadth and learning path — remaining

First provide the chart documentation initiative's accepted index, scatter/bar guides, rendering guide, and real-example links. Then connect the landing to those routes. Do not substitute coverage status for user guidance.

The documentation prerequisite is [exp-72ve](../../../.tickets/exp-72ve.md). The remaining landing outcome is [exp-4ak2](../../../.tickets/exp-4ak2.md), which depends on it. Both stay open for review and later frontier refinement. No epic is needed for this small remainder.

### Desired end state

Visitors reach accurate chart-specific guidance and the shared rendering explanation from existing examples. Changed links and direct refresh work at three widths by pointer and keyboard.

## Below the cut line

A new landing rebuild, full chart gallery, new charts, framework adapters, generated API reference, new chart renderer, and unmeasured performance claims. The rest of the documentation catalogue remains in its own initiative. No implementation, remote issues, push, or deployment occurs in this pass.
