---
title: "Multi-source analysis with explicit data frames"
slug: "multi-source-analysis"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Multi-source analysis with explicit data frames

## My read

explorEDA should make sense of data spread across related tables. Users will explore several queries, including joins. The central difficulty is knowing what a chart represents after those operations. Similar chart shapes must not hide different backing populations or repeated entities.

The starting point should feel natural from a schema or entity-relationship view. Users choose a frame: the entity or row meaning around which they explore, such as one customer, one order, or one order item. They then follow relationships and create charts that retain that meaning. When a one-to-many relationship would expand the current frame, the product should help them aggregate related data or deliberately choose a different frame.

Relationships can come from developer configuration or a simple user interface for dragging and linking fields. Client-side validation reveals the observed consequences of a link. Agent-suggested relationships are a near-term direction, using the flat configuration work. Agent integration is separate from this delivery; the definitions should remain usable by it.

Users also need to move between cardinality spaces as an investigation develops. Separate tables, nested related rows, and aggregates with contributor access all have a role. Useful investigations become tabs in the existing saved-view UI. Reuse its new, duplicate, rename, move, and delete actions, plus its history timeline. Keep a query/frame binding with each view so switching between orders and items also switches the correct backing rows.

## What matters most

- Keep each frame's entity identity, row meaning, and measure clear.
- Make query and source provenance visually distinct and easy to inspect.
- Help users handle one-to-many links without accidental double counting.
- Show the query, its backing rows, and its path over the full schema.
- Provide simplified inspection and full flow inspection through every operation.
- Export investigation state from the React component so the host can persist it.

## The intended experience

A user opens a shop example, selects orders as the frame, and follows the customer relationship. A source glyph and color identify customer fields. A distinct query glyph identifies the chart's backing query. Hover reveals names and provenance; keyboard and touch access provide the same information.

The user adds order-item information. The interface shows that several items can match one order and offers aggregation at order grain. Alternatively, the user deliberately switches to order-item grain. Chart-specific identity rules determine whether repeated entities collapse into one mark or contribute several values. Known IDs help detect repetition; duplicate joined rows must not silently inflate order measures.

The user can inspect the query, view backing rows, or see the selected query overlaid on the full schema. They can duplicate an order view before exploring item grain. History previews show the earlier frame and query; restoration recovers those definitions as well as charts and filters. Simplified inspection answers the immediate population question. Full inspection exposes all inputs, conditions, joins, calculations, aggregation, exclusions, and output steps. Inspection stays focused on one query; side-by-side query comparison is not an initial goal.

Later, the user selects a known record to supply a query instance's parameters. Manual entry uses dropdowns and suitable pickers. Valid changes should update results automatically. Intermediate tables, charts, and counts must describe the same applied values.

## Boundaries

A source, relationship, query, frame, and parameter instance have different meanings. Source identity alone cannot identify a joined query's row population. Visual identity must not depend on color alone or alter chart measure colors without an explicit reason.

Automatic deduplication is not universal. A customer mark, an order sum, and an item count require different identity and measure rules. Intentional row expansion is valid when users choose it and can see its effect.

A unique lookup with multiple matches needs an explicit resolution. The recommended route preserves the current frame and offers link repair, aggregation, or a deliberate expanded frame. It must not silently choose the first match.

The component must pass out restorable configuration and investigation state. Local storage is a suitable initial host destination; eventual server persistence does not require a server in this initiative. Computed results may be rebuilt, but restoration must recover the same investigation.

## What seems settled

Multiple sources and relationships are useful as the first delivery. Parameter instances can follow. The broader scope includes separate, nested, and aggregate exploration, with dedicated views. The first experience must support user-created relationships and frame selection rather than only supplied query steps.

Sample data, ready-to-use examples, and expected counts belong in each slice. Roughly ten tables with ten thousand rows each and execution measured in seconds is a working scale hypothesis, not a fixed performance guarantee.

## Current reality that matters

Main now has a host-owned saved-view workspace with tab actions, local storage, undo/redo, and a compact history timeline. History supports read-only previews, restoration, and grouped change summaries. The package provides host side panels and read-only chart display.

The original saved-view baseline used one source population across all tabs. This implementation adds per-view query bindings and project definitions to that session. Shared field definitions stay within the same query scope. Source tables stay outside history checkpoints. Historical source-data versions remain outside this initiative.

The implementation is complete in the supplied worktree. Browser acceptance passed chart flow, read-only inspection, parameter updates, and repair flows. The [implementation plan](implementation-plan.md) and map record the evidence.

## Next step after confirmation

Review [PR #161](https://github.com/byronwall/explorEDA/pull/161). All four milestones are accepted. The initiative map records closure evidence and the scope retained below the cut line.
