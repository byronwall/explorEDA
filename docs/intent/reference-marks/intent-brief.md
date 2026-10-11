---
title: "Chart annotations and reference marks"
slug: "reference-marks"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Chart annotations and reference marks

## My read

Users need to explain what matters in a chart while they explore data and prepare a graphic for others. They should attach a note to an observation, show a target, mark a range, or highlight a meaningful group. The explanation should remain understandable when they filter, resize, edit, save, or reopen the chart.

This initiative now covers a broad annotation capability. It grows from the earlier “Targets, events, and supplied intervals” seed. Time events remain one use case. Labels, callouts, arrows, reference lines, bands, ranges, regions, and saved highlights belong in the proposed scope. The work includes creating and editing these objects, not only drawing them from configuration.

The central distinction is what an annotation refers to. A note can follow one record, identify a fixed chart value, describe a selected group, or occupy a visual position. These may look alike initially. Their behavior under filtering and data changes must remain distinct. Moving the text of a record callout must not change the record or its measurements.

The audience is the person using the analysis workspace. Developers supply the capability through the existing React library. Engineering and scientific analysis, exploratory comparison, and editorial explanation are useful contexts. None limits annotations to a particular dataset or chart theme.

## What matters most

- Make useful annotations easy to create, find, edit, and remove while the data stays visible.
- Preserve the subject, units, population, and meaning through chart and data changes.
- Save authored content and placement with the chart. Keep temporary editing state separate.
- Use normal selection and tracing outside annotation editing. Provide keyboard and form alternatives to dragging.

## The intended experience

A user selects an experiment in a scatter plot and adds a callout. They move its label, add a tolerance band, and highlight a set of experiments. The annotation list explains each attachment. A filter hides one experiment without deleting its note. Clearing the filter restores it.

The user saves the workspace and returns later. Text, attachment, placement, and style remain intact. A missing record requires repair; the note never moves silently to a different experiment. A shared image contains the authored explanation without selection handles.

## Boundaries

Fixed values, source-wide calculations, and calculations over filtered rows need explicit meanings. Supplied lower and upper bounds do not imply a computed confidence interval. Highlighting records does not alter the data or silently create workspace filters.

Composition retains artboard layout and repeated-chart authoring. This work should reuse its annotation and guide behavior where useful. It should not force users to build a composition to annotate an ordinary chart.

The library survey is research input. Its full renderer-neutral schema, collaboration design, migration framework, asset service, and vendor adapters are not requirements. No new server or paid chart dependency is proposed.

## What seems settled

Byron explicitly wants this initiative to grow beyond the original narrow annotation seed. All research files and the source material used for this update belong inside this initiative folder. Implementation has not started through this request.

The proposed complete scope includes authoring and durable attachments. A small first proof must test those foundations; a target line alone would not do so.

## Possibilities, not decisions

Images, freehand drawing, advanced snapping, automatic label placement, rich text, and bulk annotation input remain candidates. Their place depends on actual authoring needs. Collaborative editing and additional coordinate systems are later possibilities.

## Current reality that matters

Composition already supports page, frame, and selected-glyph notes, guide lines, supplied bands, movement, and PNG output. Ordinary chart settings have titles and notes but no shared annotation collection. Scatter uses its own SVG shell.

Current internal row IDs come from array positions. They cannot safely identify a record after replacement data is reordered. A record attachment needs an explicit unique source key. Existing edit transactions can group one gesture into one host undo step.

## Next step after confirmation

Use the [shape brief](shape-brief.md) as the scope review. The [implementation plan](implementation-plan.md) starts with a record callout and fixed target, then expands the annotation forms and chart coverage. See the [local source packet](references/README.md) for the complete research and original files.
