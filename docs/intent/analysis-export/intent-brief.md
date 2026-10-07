---
title: "Export charts and analyses for sharing"
slug: "analysis-export"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Export charts and analyses for sharing

## My read

End users should take a useful chart out of explorEDA as an image. Slides and PDF reports are possible later outputs. Export is a separate initiative from editorial styling. The live workspace should feel editorial in its own right; export carries that authored result to another destination.

The exported chart should preserve its intended text, typography, colors, axes, and data scope. Users should not need to repair clipped titles or reconstruct legends after downloading it. The output should represent a deliberate state of the analysis, including the chosen filters and visible features.

The first outcome is a dependable chart image. A whole-dashboard image, a set of chart images, a slide deck, and a paginated report have different layout needs. This request does not select all of them for the first release. Their boundaries should be decided from an actual sharing task rather than hidden behind one general Export button.

The main audience is an analyst sharing scientific or engineering findings. Newspaper graphics and annual or investor-relations reports supply visual direction. They do not imply automatic report writing, a particular document template, or publication-grade export in the first slice.

## What matters most

- Export a readable image of an authored chart.
- Preserve the displayed data scope, labels, and style choices.
- Include essential chart content without temporary editor controls.
- Handle current mixed rendering paths honestly.
- Keep slides and reports available as separate extensions.

## The intended experience

A user finishes a chart and chooses image export. They inspect the proposed output size and see the content that will be included. They download it and place it into a document or presentation. Long text, legends, and selected data remain readable at the chosen size.

A later analysis export could select several charts, arrange them on slides or pages, and include user-authored explanations. A document-level layout should not simply capture whatever happens to fit in the browser viewport.

## Boundaries

Do not equate a browser screenshot with a clean authored export. A PNG is the recommended first proof because the current chart families combine SVG, Canvas, HTML, and WebGL. That recommendation does not settle all output formats.

An SVG option needs a clear policy for raster content. Editable slide objects and slide images are different products. PDF pagination, page sizes, and whole-analysis ordering need their own proof. Do not promise those outputs solely because a chart image succeeds.

Export captures the appearance and data state at the time of export. Later global theme changes affect the live analysis, not an already downloaded static image. The saved interactive analysis remains a separate artifact.

## What seems settled

Image export is explicitly wanted. Slides and PDF reports are possible extensions. Export has a dedicated scope. First-release granularity, formats, dimensions, and document layout remain open. The four first-pass priorities retain their place; creating this intent does not impose a new ordering.

## Possibilities, not decisions

Start with one chart exported as PNG. A size preset or a simple width control could support common destinations. Later options include multiple images, a dashboard composition, slide images, or a paginated report. A selected-state caption could make filtering context understandable where the user needs it.

## Current reality that matters

Current exports cover records and serialized analysis settings. The inspected chart panel has no common image-export action. Ordinary scatter uses Canvas points with SVG guides; other views also use HTML and WebGL. These paths need an output proof before choosing one export mechanism for every family.

## Next step after confirmation

Shape one image export from a styled scatter chart with a title, subtitle, legend, and active selection. Open the downloaded image and check size, fonts, Canvas points, SVG guides, and text bounds. Use that proof to choose a format and scope. Then test a second family before considering slides or PDF reports.

See the [reference packet](references/README.md) and [editorial styling initiative](../editorial-chart-styling/intent-brief.md).
