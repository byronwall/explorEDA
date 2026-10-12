---
title: "Progressive built-in charts"
slug: "progressive-built-in-charts"
phase: intent
status: current
last_updated: "2026-10-12"
---

# Progressive built-in charts

## My read

Users should reach advanced chart behavior through built-in charts when the task has a clear, reusable form. Composition should serve designs whose essential complexity exceeds those charts. It should not become the required route because a small setting is missing.

The review covers every delivered composition example. Each needs a comparison with the closest built-in chart and a clear explanation of the remaining gap. The result must distinguish a small extension from a new chart family or a custom authored graphic. Similar appearance alone is not enough: selection, calculations, source tracing, and saved settings also matter.

Users should be able to start with simple chart settings and reveal more control as their needs grow. Advanced options should build on what users already understand. A useful composition example may remain valuable for teaching even when its analytical task becomes available through a built-in chart.

The current work is research and planning. The Pro review will inform a proposed shape and proof sequence through Software Design Sleuth. It does not authorize application changes or deletion of examples.

## What matters most

- Review every composition example, including its data and interaction needs.
- Explain exactly why composition is required today and whether that requirement should remain.
- Identify small, reusable additions that remove unnecessary authoring work.
- Keep advanced control available without making the first chart difficult to configure.
- Preserve the purpose of truly custom compositions.

## The intended experience

A user adds a chart, selects fields, and gets a useful result. Further settings expose richer behavior in context. The user reaches composition when the design needs custom arrangements or semantics beyond a coherent built-in chart. Choosing an advanced setting should not require learning an artboard and mark system.

## Boundaries

Preserve linked filtering, source records, aggregation meaning, stable scale behavior, facets, saved state, and accessible controls. Separate an analytically equivalent built-in chart from an exact recreation of a publication graphic. Record any loss of presentation or output behavior.

Do not make every example a new chart type. Do not hide substantial rendering or data work behind a proposed toggle. Avoid a general composition compiler unless the review proves that smaller extensions cannot meet the need.

## What seems settled

The desired direction is progressive control in built-in charts. Whether a particular example belongs there remains an evidence-based decision. Existing composition functionality remains available during this review.

The baseline has 29 composition examples. Built-in scatter, line, bar, heatmap, and distribution charts provide comparison points. Documentation and prior plans can lag source, so their delivery claims require checks.

## Possibilities, not decisions

Candidate routes include better settings, named display modes, a few new chart families, and built-in counterparts for selected examples. None is yet a delivery commitment.

## Next step after confirmation

Complete the authorized [Pro review](../../research/composition-builtins-2026-10-12/prompt.md). Reconcile every finding against source, then write the shape and a bounded proof sequence. The [run record](../../research/composition-builtins-2026-10-12/run.md) holds progress and access limits.
