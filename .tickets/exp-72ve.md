---
id: exp-72ve
status: open
deps: []
links: []
created: 2026-10-02T04:13:16Z
type: feature
priority: 2
assignee: Byron Wall
external-ref: chart-and-rendering-docs:M1
tags: [adoption-page, chart-docs]
---
# Provide the chart index and first guides for the landing learning path

## Outcome
A visitor opens a chart index, scatter and bar guides, and a current rendering-system guide. Each chart guide launches an existing matching example.

## Likely Steps
Resume the chart documentation initiative's first milestone. Use the existing demo and public package boundary. Explain suitable fields, computations, selection, row scope, settings, and current limits. Keep scatter and bar trace claims distinct from unsupported all-chart tracing.

## Ready Gate
Confirm current routes, matching example IDs, public package mounting, and static-host URL behavior before refinement. Use the current docs-system research if available; do not make a framework choice in this coarse ticket. No runtime server or package rewrite is required by the accepted scope.

## Proof and Cut Line
Open the index, both guides, and rendering guide directly and after refresh. Reach real examples by pointer and keyboard at wide, intermediate, and narrow widths. Verify guide claims against runtime. Run focused demo checks and pnpm check:ui; run pnpm check after a broad change. Remaining catalogue pages belong to the documentation initiative. No new chart API, exhaustive gallery, generated reference, or chart behavior changes.

## Provenance
Chart and rendering documentation: first proof and M1. Developer adoption page: M3 prerequisite. Baseline d720f1f6b99d0a54564da5486da94208a563c71e. Existing landing example and integration paths are delivered. Documentation routes are absent. This ticket supplies only the prerequisite slice, not the full documentation initiative.

