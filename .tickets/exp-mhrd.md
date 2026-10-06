---
id: exp-mhrd
status: open
deps: []
links: []
created: 2026-10-06T03:10:36Z
type: bug
priority: 3
assignee: Byron Wall
tags: [ui, scatter, responsive]
---
# Keep chart hover values readable at narrow widths

At 390 pixels, the bubble chart header clips its hover summary after the Conversion label begins.
The remaining values cannot be read in the header. The bubble size legend stays clear of the hover and hint labels.

Reproduce with the Bubble scatter example (`/?example=bubble-scatter`). Set the viewport to 390 pixels and hover a bubble.

Keep the chart title readable. Make every hover value available through pointer and keyboard use without covering the plot.
Verify at 1280, 783, and 390 pixels. This is a separate finding from the resolved 10-05 bubble legend issue.
