---
title: "Chart annotations and reference marks — shape brief"
slug: "reference-marks"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Chart annotations and reference marks — what we are adding

**Outcome:** Users can explain observations, comparisons, and exceptions directly on a live chart, then save and share that explanation.

**Primary flow:** Choose a subject → add an annotation → edit its content and placement → filter, restore, and export the result.

## Feature scope

```text
Chart annotations
├── PLANNED ADDITIONS — proposed scope for this initiative
│   ├── Explain a subject
│   │   ├── Plain labels and callouts with an optional leader or arrow
│   │   ├── Attach to a record, chart value, category, or plot position
│   │   └── Keep a note fixed or follow a declared calculation
│   ├── Express a comparison
│   │   ├── Horizontal and vertical targets; labeled tolerance bands
│   │   ├── Events, duration ranges, and brackets between two values
│   │   ├── Supplied lower/upper intervals with their meaning shown
│   │   └── Fixed references and explicitly scoped data-derived references
│   ├── Highlight an area or a set of observations
│   │   ├── Rectangles and ellipses attached to chart coordinates
│   │   └── Saved record sets, kept distinct from geometric regions
│   ├── Author and manage annotations
│   │   ├── Add, select, rename, edit, duplicate, hide, and remove
│   │   ├── Text, color, line style, label offset, and range endpoints
│   │   ├── Drag or nudge where useful; equivalent form controls
│   │   └── Annotation list, keyboard access, cancel, and existing undo
│   └── Keep meaning through chart changes
│       ├── Save/restore; filtering, resizing, and axis changes
│       ├── Explicit attachment status and repair when a subject is missing
│       └── Annotation-aware image output without editing controls
├── EVALUATE BEFORE COMMITTING
│   ├── Data, tick, and alignment snapping; automatic label placement
│   ├── Reusable annotation presets and bulk event-table input
│   └── Images/icons and freehand markup with an explicit coordinate frame
└── LATER POSSIBILITIES
    ├── Rich text, complex paths, and cross-chart connectors
    └── Collaborative editing and support for geographic, polar, or 3D views
```

This is broader than time annotations. Start in ordinary scatter and line charts, then extend supported Cartesian charts and composition. A chart exposes only the attachments it can resolve. Supplied interval marks can reuse composition's existing bands; they need no new forecasting method.

## Behavior

| Situation | Expected result |
| --- | --- |
| Move a record callout's label | Change its offset. Keep its record attachment and source values. |
| Filter out that record | Hide its mark and show a filtered status in the annotation list. Restore it when the filter clears. |
| Reorder or replace rows | Resolve a unique source key. Report missing or ambiguous keys; never attach by row position. |
| Filter a fixed target | Keep the target value. A derived reference recalculates only under its declared population and filter policy. |
| Change fields or units | Keep the stored definition and request repair if the attachment becomes incompatible. |
| Move or resize the chart | Project the same attachment through the current scales. Keep label offsets in display pixels. |
| Leave annotation editing | Restore normal selection, empty-space clearing, brushing, and Alt-click tracing. |

## Examples

A scatter callout follows experiment `E-17` while its label sits beside the point. A shaded rectangle means “this region.” A saved highlight means “these experiments.” Filtering can change which points occupy the rectangle; it must not change the saved set's membership.

A line chart can show a release date, a fixed operating limit, and a supplied estimate interval. These objects have separate meanings. A supplied interval does not establish a confidence level or a computed statistical method.

## Decisions and boundaries

**Appetite:** One coherent annotation capability, delivered in useful slices. The first slice does not define the final scope.

**Key decision:** Keep the existing React renderers and reuse the composition work. Own a small saved annotation definition with separate attachment, geometry, content, and style. Adopt fields from the research contract only when a supported behavior needs them. A vendor editor, separate document service, or collaboration engine would add work without proving the current product.

**Boundary:** Composition owns artboard layout. This initiative owns reusable annotation behavior and ordinary-chart integration. Existing composition guides and notes stay useful throughout delivery. Removing an annotation returns the original chart; no global renderer replacement or saved-layout conversion is required.

**First proof:** **Try:** Create a record callout and fixed target in one ordinary scatter chart. Move the label, filter, reorder keyed rows, resize, save, reload, cancel, and undo. **Observe:** The callout follows the same record, the target keeps its value, and the host records one completed edit. **Decide:** Continue to more shapes only if those checks pass. If keys or projection fail, fix that boundary before expanding the drawing tools.

See the [intent](intent-brief.md) and [implementation plan](implementation-plan.md).
