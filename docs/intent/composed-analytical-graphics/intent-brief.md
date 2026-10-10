---
title: "Composed analytical graphics"
slug: "composed-analytical-graphics"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Composed analytical graphics

## My read

Composition mode should produce polished analytical graphics for reports and presentations. Authors can refine and reuse the result, with drilldown and tracing.

Authoring starts from a blank page with user-selected primitives. Titles, subtitles, frames, scales, mark definitions, and annotations form the graphic. A chart template defines one visual unit and generates marks from data. A repeat rule applies that unit to subsets. Authors edit definitions instead of arranging thousands of marks.

Repeated units form comparison panels, stacked rows, or facet grids. Shared elements tie them into one graphic. The inspector explains each unit’s data, filters, calculations, and scales. Authors can position groups and save visual exceptions for individual units.

The editor combines automatic layout with deliberate placement, clear calculation scopes, and saved edits. PNG output with Copy to clipboard is sufficient initially.

## What matters most

- Produce a polished graphic that remains useful after the authoring session.
- Support blank-page composition from user-selected primitives.
- Define mark generation once, then repeat it across data subsets.
- Explain template inputs and repeated subsets through a useful inspector.
- Support shared rules and saved exceptions for individual repeated units.
- Let authors position groups while automatic layout handles repeated content.

## Authoring and viewing

Authors bind data, build one chart unit, and choose a repeat rule. Global text, guides, and annotations complete the graphic.

Authors create calculations after selecting data, filters, or aggregation. A calculated label or line should expose its inputs and scope. The interface should explain the difference between a group value, a composition-wide value, and a value that ignores filters.

Editing and viewing use distinct modes in the current editor. Editing clicks select elements or repeat overrides. Viewing clicks select a repeat across the workspace. Alt-click and Alt-Enter open source tracing.

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

Named composition scales now define domain policy; each chart unit supplies its pixel range. The complete mark list remains open. The new research favors numeric circle positions alongside ordered paths. This supports the existing connected-scatterplot proof. Addressed tile layouts and other additions remain candidates, not agreed release scope.

The 23 published examples broaden the reference set. They do not require 23 replicas or change the blank-page authoring goal. Prepared tables may handle packing, density estimation, rankings, or source-specific calculations. Such preparation must remain explicit.

## Current reality that matters

The requested branch contains the first composition editor slice: blank authoring, strip marks, repeats, calculations, guides, annotations, overrides, tracing, and PNG copying. Its units still use date or category bins. Numeric x/y frames, paths, bands, paired summaries, normalized stacks, and compound frames remain planned.

The earlier implementation report records clipboard readback. It does not prove a successful paste into a report or slide. Keep that first-proof requirement open. Shared value domains currently rescale from filtered glyphs; stable comparison domains need an explicit decision.

Pro classified three examples as “Today” using the research prompt. That label does not establish support in this checkout. Exact palettes, source order, and missing-value treatment need checks. The older email reconstruction remains visual guidance; its inferred values do not establish data accuracy.

## Next step after confirmation

Claude can resume integration from the updated [implementation plan](implementation-plan.md). First close the remaining output proof and audit a small measles strip. Then extend the existing model for the Driving path and numeric points.

The [reference study](reference-study.md) reconciles the new examples with the existing sequence. The full [Pro source package](raw/2026-10-10-pro-graphics/README.md) remains unchanged for inspection. Research recommendations guide proof selection; they do not silently become requirements.
