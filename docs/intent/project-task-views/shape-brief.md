---
title: "Project and task views — shape brief"
slug: "project-task-views"
phase: shape
status: current
last_updated: "2026-09-29"
---

# Project and task views — shape brief

## Recommendation

Shape one single-source project with named task views, overview-to-detail connections, duplication, and reusable filters. Share field definitions and color scales at project scope so changes reach dependent views immediately. Keep multiple sources and lookups in their own [initiative](../multi-source-analysis/shape-brief.md).

The existing chart engine still receives one working row population. The main integration work is definition ownership, view state, and filters that can exist without a chart. This scope can produce a useful view system without selecting a cross-table model.

## Problem and appetite

- **Problem:** One analysis cannot organize separate tasks and reusable filters clearly.
- **Outcome:** Users keep and navigate related analyses over the same source.
- **Appetite:** One project, overview and detail tasks, duplication, and a Filters section.
- **Boundary:** Multiple sources, lookups, and comparison layouts are deferred. Save policy remains open.

## Core shape

The project owns one source and current shared definitions. Views own chart definitions, positions, and local choices. Active views reference current project definitions. Switching preserves each view's work.

A dedicated Filters section shows conditions independently of charts. Users can inspect, edit, clear, save, and reuse field conditions. Chart gestures and independent conditions need clear ownership; the new section must not become a second competing interpretation of chart filters.

Users configure a detail view's parameter and an overview action that supplies its value. Both views operate on the same dataset. Duplication retains another investigation without requiring side-by-side comparison.

Settings snapshots are suitable for retaining and restoring view work. Project and view history have explicit scope. A snapshot representing the whole project includes its shared definitions; a local view restore must not silently reset the project's current definitions.

## Current fit

Reuse chart settings, the saved codec, field definitions, colors, and chart rendering over one dataset. Review existing active-filter labels and controls for reuse. The filter runtime needs independent conditions as well as chart-owned filters. Reading current settings and restoring a checkpoint already exist; continuous callback-to-restore feedback is not needed for history collection.

## How to make this go better

- **Keep the dataset boundary stable.** Use one order table so view navigation can reuse current charts.
- **Separate displayed and available fields.** Conditions should work without a visible chart for their field.
- **Keep one shared definition current.** History checkpoints do not require simultaneous old and new interpretations.
- **Prove user-created navigation.** A developer's predefined links alone do not satisfy runtime creation.
- **Make history scope visible.** A view restore and a project restore should have predictable effects.

## First proof

- **Question:** Can users keep related views and reusable filters over one source without losing work?
- **Proof:** A reviewed overview/detail scenario with duplication, a shared definition, and an independent condition.
- **Observe:** Definitions propagate. Conditions remain visible without a chart. Users create the detail connection and return to their overview.
- **Decision rule:** Keep the shape if task state survives and each definition, filter, and history checkpoint has a clear owner.

## Rabbit holes and no-gos

Do not add cross-table source machinery here. Do not hide independent filters in dummy charts. Do not copy shared definitions between views. Do not infer a save policy from the need to preserve work.

## Plan handoff

Intent and shape only. Review the single-source view pair, filter ownership, and history scope before implementation planning.

## Weakest or least-clear parts

Current chart filters and local Rows filters have different scopes. Reusable conditions need a defined scope in that same runtime. Whole-project and view-local restores must agree on ownership of shared settings. Save behavior remains explicitly undecided.

## Most likely bad outcome

Views preserve their charts but carry copied shared definitions or hidden filters that disagree with the project.
