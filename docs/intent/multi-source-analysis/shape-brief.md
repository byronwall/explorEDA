---
title: "Multi-source frames and provenance — shape brief"
slug: "multi-source-analysis"
phase: shape
status: current
last_updated: "2026-10-06"
---

# Multi-source frames and provenance — what we are adding

**Outcome:** Users explore related tables and know which entities, joins, and measures each chart represents.

**Primary flow:** Open schema → choose frame → follow or create links → resolve one-to-many meaning → chart → inspect query and rows.

## Feature scope

```text
Multi-source exploration
├── IMPLEMENTATION SCOPE
│   ├── Schema and relationships
│   │   ├── Developer-configured links; drag-and-link field creation
│   │   ├── Matching keys, declared cardinality, observed link consequences
│   │   └── Stable source glyphs and colors with inspectable names
│   ├── Frame-based queries
│   │   ├── Choose customer, order, or item grain and identity fields
│   │   ├── Follow links; aggregate many-side data or change frame explicitly
│   │   └── Named queries with unique glyphs; focused path over full schema
│   ├── Charts with clear backing data
│   │   ├── Query glyph, frame/measure meaning, included/available count
│   │   ├── Chart-specific entity identity and measure aggregation
│   │   └── Query access, backing rows, and contributor inspection
│   ├── Explore and retain cardinality spaces
│   │   ├── Separate tables, nested related rows, aggregates with contributors
│   │   └── Existing saved-view tabs with per-view query/frame bindings
│   ├── Simplified and full flow inspection
│   │   ├── Compact population summary and relevant count changes
│   │   └── Full inputs, filters, joins, calculations, aggregates, exclusions
│   ├── Parameter instances after the first slice
│   │   ├── Start from a known record; dropdowns/pickers for manual values
│   │   └── Automatic updates; intermediate rows for the applied instance
│   └── Restorable state and working examples
│       ├── Existing host persistence and history, extended for query/frame state
│       └── Generated data, query/frame presets, expected rows and totals
└── LATER INTEGRATION
    ├── Agent-suggested links through shared configuration
    └── Remote execution, server persistence, batch instances, query comparison
```

Keep source/query glyphs stable across views and restoration. Header provenance preserves data colors. Hover, keyboard, and touch reach details. Reuse View data and trace controls.

## Reuse of saved views and history

Reuse tab actions. Duplicate retains query/frame bindings and settings; New view starts blank on the active frame. Offer a new view for grain changes. Show query/frame context beside the active view.

Extend timeline checkpoints with view bindings and relationship/query definitions. Reuse read-only preview, restore, and undo/redo. History preserves configuration, not historical source rows. Schema/query inspection uses host side panels.

## Delivery slices

1. **Sources, relationships, and frames:** Configure or create links, validate consequences, choose grain, resolve one-to-many data, and chart with visible provenance. Extend host state output, reload, and history restore.
2. **Query paths and cardinality exploration:** Overlay a selected query on the schema. Add full inspection, nested rows, and aggregate contributors within saved tabs.
3. **Parameter-bound instances:** Start from a record, edit assisted inputs, and update all stages automatically.

The [implementation plan](implementation-plan.md) has four milestones across three slices. Reuse merged PR #148 and one shop fixture. [PR #161](https://github.com/byronwall/explorEDA/pull/161) delivers the shared contract. All three slices passed acceptance.

## Behavior

| Situation | Expected result |
| --- | --- |
| A many-side link expands the current frame | Offer aggregation at current grain or an explicit frame change. Preview count consequences. |
| A unique lookup has multiple matches | Inspect conflicts; repair the link, define an aggregation, or choose an expanded frame. No arbitrary first match. |
| Known entity IDs repeat | Use the chart's declared mark identity and measure rule. Collapse repeated entity marks where appropriate; retain valid item contributions. |
| A parameter changes | Update automatically. Label pending data; publish rows, counts, and charts for the same applied values. |
| Inspection finds no matches | Show the empty stage, bindings, and matching condition. Keep preceding inputs reachable. |
| A checkpoint is previewed or restored | Recover its frame/query definitions with charts and filters. Keep preview read-only; restore becomes a new history step. Recompute from available project sources. |

## Examples

Frames:

- **Order frame:** one record per order; customer attributes plus item totals aggregated by order ID.
- **Item frame:** one record per order item; product attributes and item revenue. A chart counts items or aggregates revenue explicitly.
- **Customer instance:** select a customer and date range; inspect matching orders, items, and category totals.

Summary: “Orders · 47 of 60.” Inspection: “130 item rows from 47 orders.” Name the measure.

## Decisions and boundaries

**Appetite:** Prove a local shop project. Benchmark the ten-table, ten-thousand-rows estimate; measure join expansion separately.

**Key decision:** Replace developer-only query steps with schema-led frame selection and relationship creation. Preserve one frame until users explicitly change its meaning. Keep chart counts compact; expose stage and distinct-entity counts in inspection.

The host owns tabs, persistence, and history; React emits edits. Extend that session. Scope shared field/calculation definitions by compatible sources and frames. Query execution supplies one consistent result; automatic updates must not mix old rows with new labels.

**Boundary:** Agent execution and servers are separate. No universal deduplication or silent selection among ambiguous matches. Closing inspection preserves charts and views.

**First proof:** **Try:** Build an order-frame chart, duplicate it into an item-frame view, then switch, preview, restore, and reload. **Observe:** Query glyphs, rows, counts, filters, and definitions match each selected view or checkpoint. **Decide:** Proceed only if totals remain correct and view/history actions preserve the intended frame. Fix mismatches before parameters.
