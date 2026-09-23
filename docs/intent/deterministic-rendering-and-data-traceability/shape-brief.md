---
title: "Deterministic rendering and data traceability — shape brief"
slug: "deterministic-rendering-and-data-traceability"
phase: shape
status: current
last_updated: "2026-09-22"
---

# Deterministic rendering and data traceability — shape brief

## Recommendation

The scatter proof now runs in the live chart. Keep its planners specific to the visible scatter flow. Share only the numeric legend and facet layout rules already used by renderers. Inspect one grouped bar next. The [scatter status](scatter-tracing-status.md) records current coverage and deferred work.

## Problem and appetite

- **Problem:** TSX mixes chart data choice, scales, marks, interactions, and drawing. A rendered object often loses its source identity.
- **Outcome:** A visible scatter object has a repeatable plan and a source or setting explanation in the live workspace.
- **Appetite:** Complete visible scatter traces, then compare one grouped bar. Broader migration needs new evidence.
- **Not in this shape:** A general grammar, all eleven chart migrations, multi-source joins, editable trace graphs, or a new renderer.

## Core shape

The current provider supplies prepared fields and chart state. `ScatterPlot` captures row sets and field values for one render. A pure scatter planner resolves points, guides, hover text, and badge positions. Canvas draws points; SVG draws guides and brush objects. Numeric legend and facet layout helpers supply decisions shared by rendering and inspection.

The user selects a visible object by its planned identity. One inspector resolves its source values and control inputs. It rejects a stale plan selection.

## Current fit

- **Reuse:** `CrossfilterWrapper`, `getColumnData`, scatter settings, calculated-field inspection, and aggregate contributor records.
- **Added:** A scatter plan, Canvas and SVG drawing paths, one trace inspector, numeric legend stops, and facet layout plans.
- **Avoid:** A second filter evaluator as the drawing authority.

## How to make this go better

- **Characterize before changing.** Test the real wrapper's own-filter exemption and all-filter IDs. This prevents a clean-looking planner from changing selection behavior.
- **Compare the live chart.** Use a fixed dataset and saved settings to compare point count, order, positions, opacity, domains, and brushing before the new path replaces the old one.
- **Use the recorded revision.** Reject a stale selection. Add a stronger snapshot check only if a mixed-render failure appears.
- **Reuse existing lineage.** Link aggregate bars to existing contributor records. Do not add a second provenance store.
- **Measure when needed.** Use the 10,000-row example if another migration raises a real performance question.

## First proof

- **Question:** Can a live scatter chart draw from a repeatable non-React plan and explain its visible objects?
- **Proof:** Stable point IDs, guide decisions, legend stops, facet sizes, hover values, and one inspector now run in the demo.
- **Observe:** Focused tests and browser checks cover selected objects, active filters, and wide, intermediate, and narrow widths.
- **Still outside scope:** Per-filter lineage for rows removed by another chart, editable parameters, 3D picking, and all-chart migration.

## Rabbit holes and no-gos

- Pro's 2.59 MB serialized plan is not a heap measure or a production budget.
- The prototype's empty-facet and empty-domain policies differ from or are unproved against current behavior. Do not install them by accident.
- A generic scene grammar is premature. It would need table and 3D rules before this first proof needs them.
- Keep Pro's run sheet inert. It creates a branch and pushes; this task stays on `main`.

## Serious alternative

Extract only chart-local calculation helpers, with no common point identity or trace contract. This would reduce TSX code quickly. It would not prove source-to-glyph inspection, which is the distinctive goal. Use this smaller approach only if the live point trace does not justify a shared plan envelope.

## Plan handoff

The scatter trace now covers its visible detail decisions. Next prove aggregate reuse with one grouped bar. Decide the common contract from both real paths.
