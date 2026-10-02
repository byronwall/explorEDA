---
id: exp-4ak2
status: open
deps: [exp-72ve]
links: []
created: 2026-10-02T04:13:16Z
type: feature
priority: 2
assignee: Byron Wall
external-ref: developer-adoption-page:M3
tags: [adoption-page, landing, chart-docs]
---
# Connect the landing examples to chart and rendering guides

## Outcome
A visitor reaches the chart index and rendering guide from the landing page, then opens a chart guide and its matching example. The primary example remains first.

## Likely Steps
Reuse the current example catalogue and integration sections. Add the missing learning links once the documentation routes exist. Check whether existing task-labelled examples satisfy the planned breadth before adding any preview content. Keep the shipped example, import, restore, and integration flows.

## Ready Gate
The documentation prerequisite must provide real routes and content. Confirm current landing controls, example IDs, static URL behavior, and the runnable browser target before refinement. This open ticket is for review, not implementation authorization.

## Proof and Cut Line
Follow every changed example and documentation link with pointer and keyboard at wide, intermediate, and narrow widths, in light and dark appearance. Refresh the guide URLs. Run focused landing checks and pnpm check:ui; run pnpm check after a broad change. Do not rebuild the hero, invent another renderer, create new charts, or duplicate documentation content.

## Provenance
Developer adoption page: accepted shape and M3, chart breadth and learning path. Baseline d720f1f6b99d0a54564da5486da94208a563c71e. M1 and M2 are delivered with historical PR #27 evidence. Current ExampleSelector supplies task-labelled breadth; chart-index and rendering-guide links are absent.

