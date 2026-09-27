---
title: "Developer adoption page — implementation plan"
slug: "developer-adoption-page"
phase: plan
status: current
last_updated: "2026-09-23"
---

# Landing page rebuild — implementation plan

## Plan at a glance

Build one strong first-visit path with the existing order example. The first proof is that a visitor can understand the product, open the example, change one filter, see linked views and matching rows respond, and reset. Capture that real state for the new hero. Then add the React integration path, chart-docs links, and lower-priority file tools. [Comparison research](comparative-research.md) supports the choice of a concrete question and direct chart learning paths. It does not justify new capabilities or claims.

## Implementation strategy

- **First proof:** A clear hero preview launches the order workspace and names one verified gesture.
- **Primary seam:** `apps/demo/src/LandingPage.tsx` owns presentation; `ExplorEda` owns analysis behavior.
- **Fast local loop:** `pnpm --filter demo dev` with the existing local order data. Use the focused landing test during edits.
- **External dependency:** None for the first proof. The demo CSV and saved settings are local assets.
- **Rollout and rollback:** Keep import and restore in the page. Revert landing presentation without changing the package API or saved data.

## Milestone 1: The first screen proves the product

- **Inspect:** Run the order example. Confirm its control labels, linked effects, row view, reset action, and useful viewport crops.
- **Change:** Rebuild the landing hero around a plain product category, one analytical question, real workspace imagery, and a primary “Explore the example” action.
- **Verify:** Open the page and example at 1280, 783, and 390 px. Check heading order, keyboard access, image text alternative, gesture, result, and reset.

### Desired end state

- A new visitor can identify the React analysis workspace and reach a working linked example without a file.
- The preview and instruction match actual behavior.

## Milestone 2: Two clear routes from proof to use

- **Change:** Add concise “Explore your data” and “Embed in React” paths. Move CSV import and saved-analysis restore after the proof; preserve both flows.
- **Change:** Show the public install, component, and CSS boundary. Link to a complete example with its data and saved settings. Explain `data`, `savedData`, and `onStateChange` using current API behavior.
- **Verify:** Build the displayed snippet. Test import and restore. Check that the short snippet makes no configured-dashboard claim. Run `pnpm check` and `pnpm check:ui`.

### Desired end state

- An analyst can try their own data. A developer can reproduce the integration and see what the host must provide.
- Existing file workflows still work.

## Milestone 3: Chart breadth and learning path

- **Change:** Add a small group of real example previews with task labels. Link to the chart index and rendering guide from the separate docs initiative when those routes exist.
- **Verify:** Open every card and docs link locally. Check wide, intermediate, and narrow layouts and light/dark appearance.

### Desired end state

- Visitors can see the range of analytical tasks and move into a chart-specific guide.

## Below the cut line

- A second interactive hero renderer, a full chart gallery on the home page, framework adapters, unmeasured performance claims, and new charts.
