---
title: "Deterministic rendering and data traceability — implementation plan"
slug: "deterministic-rendering-and-data-traceability"
phase: plan
status: current
last_updated: "2026-09-22"
---

# Deterministic rendering and data traceability — implementation plan

## Plan at a glance

The live scatter chart now draws from a repeatable plan and offers one trace inspector. Its [current status](scatter-tracing-status.md) lists the covered objects and deferred decisions. Use that working chart as the reference for one grouped bar. Compare the two real paths before adding a common chart contract.

## Implementation strategy

- Keep `DataLayerProvider` and `CrossfilterWrapper` as the source of prepared values and row sets.
- Let chart planners resolve values, marks, guide decisions, and trace inputs before drawing.
- Keep shared helpers only where a renderer and trace already use the same rule.
- Use focused tests first, then `pnpm check` and browser checks at 1280, 783, and 390 px.
- Leave saved chart settings and source data formats unchanged.

## Milestone 1: Scatter objects can explain their rendering — complete

The scatter plan retains source IDs, row sets, scales, points, guides, brush geometry, hover values, and calculated badge positions. The numeric legend and facet layouts have pure plans used by rendering and inspection. A guide trace shows density targets, D3 candidates, shown and omitted labels, margins, formatting, and final geometry. Tick density sets the candidate target; available space removes overlapping labels afterward.

**Proof:** Scatter, legend, facet, and guide tests pass. Browser checks show the traces at the required widths. `pnpm check` passed after the broad trace change. See the [status document](scatter-tracing-status.md) for exact coverage.

### Desired end state

A selected visible scatter object explains the values and decisions used to draw it.

## Milestone 2: One grouped bar explains its contributors — next comparison

- Use the current `getAggregateResult` and `calculateGroupedAggregate` path. Do not create another aggregate engine.
- Give one named aggregate bar a stable mark ID. Link its value to contributor rows and numeric exclusions.
- Explain its height from the scale domain and baseline. Name which rows set that domain.
- Keep the present bar drawing path until the new plan matches visible bars and filters.
- Check one positive and one negative value, an invalid input, group order, and an active chart filter.

### Desired end state

One visible bar explains its value and geometry through the same kind of trace used by scatter.

## Milestone 3: Extract only the shared contract both charts need

Compare scatter points with the grouped bar. Share fields only when both paths need them. Likely common fields are mark identity, source row set, control inputs, and final drawing values. Keep legend stops, facet pages, and guide rules as small helpers unless another chart needs a broader scene plan.

### Desired end state

The next chart can reuse a proven trace shape without adopting scatter-only fields.

## Below the cut line

- Rows removed by other charts have no scatter glyph to select. A later source-data view may show each filter removing rows in sequence.
- Assume the provider keeps values and Crossfilter row sets coherent during one render. Add an atomic check if a mixed-render bug appears.
- Do not block chart tracing on a full visual baseline or 10,000-row benchmark. Measure when another migration raises a concrete risk.
- Keep editable trace graphs, multi-source joins, a universal chart grammar, and all-chart migration below the cut line.
