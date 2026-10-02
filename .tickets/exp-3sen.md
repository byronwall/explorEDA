---
id: exp-3sen
status: open
deps: []
links: []
created: 2026-10-02T03:58:32Z
type: feature
priority: 1
assignee: Byron Wall
parent: exp-b6fo
tags: [runtime-config]
---
# Inspect every current chart and its referenced definitions

## Outcome
A package user sees every current chart's name, type, saved grid position, size, and readable settings. Selecting a chart shows its fields, grouping, colors, scales, filters, layout, and applicable chart-specific settings. Referenced calculations and named color scales expand to their current definitions. Missing references remain understandable. The screen reads the same state as charts and existing Chart details controls.

## Likely Steps
Add a package-level read-only chart spec screen using the current chart, layout, calculation, and color-scale state. Reuse labels and chart names where correct, while checking all supported chart types. Keep Chart details as the edit path.

## Ready Gate
Confirm the current settings shape for each chart type, the inspector entry, reference rules, and a runnable example with add/edit/move proof. Check package tests and browser at 1280, 783, and 390 pixels, including keyboard access.

## Proof and cut line
Add and edit a chart, move or resize it, then confirm inventory and details follow. Expand a referenced definition. Do not add spec editing, a second saved format, or change comparison.

## Provenance
Intent claims c1, feedback-4, feedback-7, final-inspection-1; selected shape in docs/intent/runtime-configuration-story/shape-brief.md; milestone M1 in docs/intent/runtime-configuration-story/implementation-plan.md. Repository baseline 22a9bd3694cf208c63911291a5926c3c5a367be0.
