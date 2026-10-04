---
id: exp-cs01
status: open
deps: []
links: []
created: 2026-10-03T21:00:00Z
type: feature
priority: 2
assignee: Byron Wall
tags: [color, charts]
---

# Bring every chart's colors under the shared color scales

## Outcome and Why

The color scale editor now offers 25 ramps, 9 categorical sets, steps, spacing, and a color-blind preview, but a few charts still pick colors on their own. Bringing them onto shared scales gives users one place to change every color.

## Remaining work

- Heatmap and calendar heatmap draw with fixed Blues and RdBu ramps. Let them take a numerical scale (palette, steps, spacing, midpoint). The chart polish stack (PR 124) adds theme heat tokens there, so build on top of it.
- Line chart series colors come from a local palette in `LineChart.tsx`. Assign them from the categorical palettes instead.
- Categorical scales store one hex per category, so dark mode reuses light-mode colors. Store the palette id and resolve a dark step at render time where the palette has one.
- Drag to reorder categories in the editor, so a user can choose which category takes which slot without picking hex values.
