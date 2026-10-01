---
title: "Composed analytical graphics"
slug: "composed-analytical-graphics"
phase: intent
status: current
last_updated: "2026-09-29"
---

# Composed analytical graphics

## My read

Composition mode should produce polished analytical graphics for reports and presentations. The output is a durable artifact that the author expects to refine and use again. Its interactive form should also support drilldown and tracing.

Authoring starts from a blank page. The user chooses primitives and builds the composition. Titles and subtitles are elements. Frames, scales, mark definitions, and annotations provide the structure for drawing. A chart template defines one visual unit, including instructions that draw rectangles, circles, or other marks from data. A repeat rule applies that unit to data subsets. The author controls the definition that generates those marks, rather than arranging each generated mark separately.

Repeated units can form comparison panels, stacked rows, or facet grids. Shared elements tie them into one graphic. An inspector explains which data, filters, calculations, and scales reach each unit. The author can position groups of elements and make exceptions for an individual repeated unit. Those exceptions combine with the template to produce the final result.

The editor should support careful finishing as well as sound data analysis. It needs useful automatic layout, deliberate placement controls, clear calculation scopes, and saved edits. A successful result belongs in a report or PPTX. PNG output with a Copy to clipboard action is sufficient initially.

## What matters most

- Produce a polished graphic that remains useful after the authoring session.
- Support blank-page composition from user-selected primitives.
- Define mark generation once, then repeat it across data subsets.
- Explain template inputs and repeated subsets through a useful inspector.
- Support shared rules and saved exceptions for individual repeated units.
- Let authors position groups while automatic layout handles repeated content.

## Authoring and viewing

The author adds text, a frame or scales, and mark definitions to a blank page. They bind data and build one chart unit. They then choose a repeat rule and arrange the resulting units. Global text, guides, and annotations complete the graphic.

The author usually creates calculations on the spot, after selecting the relevant data, filters, or aggregation. A calculated label or line should expose its inputs and scope. The interface should explain the difference between a group value, a composition-wide value, and a value that ignores filters.

Editing and viewing likely need distinct modes. During editing, clicking selects an element for changes and possible movement. During viewing, clicking supports interaction, probably drilldown. Alt-click is a proposed shortcut for full tracing. The exact gestures remain provisional.

## What seems settled

Comparison panels, stacked rows, and facet grids are intended arrangements. Repeated charts do not need decorative card containers. Titles, subtitles, marks, and guides can form the visual hierarchy themselves.

Automatic placement is useful for multiples and text. The author must also be able to place groups of elements. An individual repeated unit can have a saved override or nudge. Its final appearance combines the shared template with that override. Editing the template should remain distinct from editing one repeated unit. Start overrides with position and other visual properties. Changes to instance data bindings, calculations, or scale definitions are outside the initial override scope.

Annotations can attach to a data value or mark, a chart frame, or a fixed page position. The author chooses the anchor according to the message. A data-bound annotation can follow its target when filtering or other data changes move it.

## Data behavior and scale

Repeated charts use common scales by default wherever possible, to support direct comparison.

Charts normally update when filters change. The composition also needs calculations or values that ignore those filters. Examples include a fixed threshold or a limit calculated from the complete source. A value shared across panels does not automatically ignore filters; these are separate choices.

The email graphic provides a representative size: about 10,000 source rows, 10–15 repeated chart rows, and 1,000–2,000 generated glyphs. These figures guide the first proof. They do not establish maximum capacity or acceptable redraw time.

## Boundaries

### Must be true

- Save the composition, repeat rules, calculations, placements, and individual overrides together.
- Preserve the connection from generated marks and aggregates to their source records.
- Make group, composition-wide, and filter-independent inputs clear during inspection.
- Keep normal authoring accessible through the interface.
- Provide PNG output suitable for reports and presentations, with Copy to clipboard as the initial action.

### Must be avoided

- Do not require a completed preset as the starting point.
- Do not require individual editing of thousands of generated marks.
- Do not force repeated charts into decorative cards.
- Do not silently turn a shared value into a filter-independent value.
- Keep recurring reports and parameterized dashboards outside this initiative; a separate project handles them.

## Possibilities, not decisions

A frame may establish scale bounds, or scales may be placed explicitly and referenced by chart elements. Rectangles and circles are expected primitives; the complete mark list is open. Annotation anchors include data, frames, and page positions. Their detailed editing controls remain provisional. PNG is the initial output format; other export formats are deferred.

## Current reality that matters

explorEDA has chart settings, workspace layout, facets, filters, and trace inspection for some chart objects. It lacks the blank-page composition editor described here. The older `data-and-glyphs` email reproduction is a visual reference. Its monthly values were reconstructed from an image and cannot establish data accuracy.

## Next step after confirmation

Prove blank-page authoring through a polished repeated graphic, saved overrides, inspection, and report-ready output. The output format, initial override scope, scale default, and supported annotation anchors are now settled enough for planning.

Use the five additional [reference compositions](reference-study.md) to sequence capability growth. Preserve images and available data with provenance in [references](references/README.md).
