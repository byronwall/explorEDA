---
title: "Deterministic rendering and data traceability"
slug: "deterministic-rendering-and-data-traceability"
phase: intent
status: current
last_updated: "2026-09-22"
---

# Deterministic rendering and data traceability

## My read

Byron wants to understand how a chart became what he sees. He wants to select a mark, label, tick, legend item, or annotation and follow its inputs back through the chart. The end of a trace can be source rows, a calculation, a filter, a scale, a fixed parameter, or a manual text offset. The trace must distinguish data that sets a value from data that controls its position or appearance.

He also wants chart computation to leave the TSX rendering flow. The same resolved chart description should produce repeatable output and support inspection before SVG, Canvas, or Three.js draws it. Cross-chart filtering makes this more than a drawing cleanup: each chart can show rows excluded by its own filter while other charts remove rows. Facets and full-data scales add other row populations. The system must name these scopes and keep them separate.

The live scatter chart now uses a point plan and one chart-level trace. The trace reaches points, guides, legends, facets, brush objects, and calculated axis badges. The current work completes the visible scatter details before moving to another chart type.

## What matters most

- A selected visible object explains its value, position, and appearance through named inputs.
- Chart computation has a repeatable, non-React boundary before drawing.
- Current filtering, facet, scale, and saved-workspace behavior stays intact during the first slice.
- One working chart path must justify shared contracts before all chart types migrate.

## The experience or behavior you appear to want

A user brushes a chart and sees other views update. They select a point and inspect its source row, calculated x and y values, and why it is selected or dimmed. They can inspect why the axes use their current domains, including rows outside the visible filter. Later, the same path reaches aggregate bars, labels, legends, ticks, and annotations. Fixed text traces to a declared parameter, not to a fabricated row.

## Boundaries

### Must be true

- The trace uses the data that actually drove the rendered object. It does not infer lineage from pixels or the DOM.
- The plan records its revision and does not use a stale selection.
- A chart's own-filter-exempt rows remain distinct from rows that pass every filter.
- The first slice keeps the current React package, Crossfilter, chart settings, and saved data format.

### Must be avoided

- Do not build a general graph engine or visualization language to prove one chart.
- Do not apply the fallback patch as if Pro had validated it in this repository.
- Do not count isolated Node checks or serialized byte size as integrated correctness or memory evidence.
- Do not make every text object editable in the first trace slice.

## What seems settled

The two tracks belong together. A deterministic chart plan is the place where drawing inputs and trace references can meet. The current single-source workspace remains the first target. Pro's architecture comparison favors chart-specific pure planners with a small common contract; that is a promising hypothesis, not an accepted final architecture.

## Possibilities, not decisions

The earlier standalone HTML shows selectable text, scale edits, drag offsets, and multi-source infographics. These are useful product examples. They do not require the first repository slice to copy its engine or interaction model. The standalone HTML was not in the downloaded investigation ZIP, so this review relies on the supplied conversation view for those behaviors.

## Current scope decision

Trace visible scatter objects and the decisions that render them. Show numeric legend stops, facet pages and sizes, hover values, badge positions, and guide choices. Let tick density set the candidate target. Remove labels only when they overlap.

Rows removed by other charts have no scatter object to select. A later source-data view may show filters removing rows in sequence. Do not build that view now. Assume provider updates keep each render coherent until a real failure shows otherwise. Do not require a full visual baseline or performance measurement for this scatter pass.

## Current reality that matters

`DataLayerProvider` prepares columns and owns Crossfilter state. `CrossfilterWrapper` exposes chart row sets and all-filter row IDs. A pure scatter planner resolves points, guides, hover values, and badge positions before Canvas and SVG draw them. A shared numeric legend plan and pure facet layout plans serve the renderer and trace. Named aggregates and pivot cells already keep contributor IDs and exclusion reasons.

## Next step after confirmation

Use the [scatter status](scatter-tracing-status.md) as the handoff. Compare the same plan and trace questions with one grouped bar before defining a common chart contract.
