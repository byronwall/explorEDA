---
title: "Explore nested categories and their totals"
slug: "hierarchy-analysis"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Explore nested categories and their totals

## My read

explorEDA should gain hierarchical reporting charts: treemap, sunburst, and similar views of a total dividing through nested categories. Analysts use them to answer three questions. Which subcategories exist? How large is each? How does each part compare to its parent and to the whole?

The charts matter as much as the semantics underneath them. Each node is a full category path with a total that adds up to its parent, and every node can be selected and traced back to its rows.

Excel-style pivot subtotals and collapse are not the goal. The Pivot Table remains the place for exact numbers.

## What matters most

- Make parts and the whole readable at a glance and on inspection.
- Keep totals additive and checkable against source rows.
- Handle many small categories without clutter.
- Distinguish missing levels from real named categories.

## The intended experience

Choose two or three category fields and a size. See the hierarchy as a treemap, then switch to an icicle or sunburst without setting it up again. Zoom into a parent so it fills the chart, and step back through breadcrumbs. The zoomed view is saved with the chart and returns the same way after a reload. Hover a node to read its path, value, and share of parent and whole. Click a branch to filter the rest of the workspace, and trace the rows behind it.

Typical data has 2–3 levels with 2–8 categories each. Beyond that, people narrow the data with filters. Small categories appear as unlabeled marks, and slivers below a pixel are not drawn. A catch-all "Other" group was tried and rejected: it filled the chart with gray.

## Boundaries

Do not infer parent relations from equal labels; the same label under two parents is two nodes. Size only by measures that add up (count or sum), never averages. Avoid automatic taxonomy discovery, tree editing, and deep or parent-ID trees in the first pass. How sizes react to filters beyond simple recomputation is not a product priority; reasonable defaults are fine.

## What seems settled

Hierarchical chart types are the desired addition, with treemap and sunburst named directly. Rectangular layouts are preferred over circular or radial ones, so circle packing is out. They appear as one "Hierarchy" entry in the Add Chart menu. Pivot subtotals are out of scope for now. Sankey stays the chart for ordered stages; it does not double as a hierarchy view.

## Current reality that matters

The registry has no hierarchy view. Sankey already takes ordered category fields with count or sum, missing-value handling, a per-stage category cap, and an Other node. Those conventions transfer directly. The Pivot Table groups by full paths and lists each cell's source rows, which makes it a natural check on hierarchy totals. Changing a chart's type resets its settings, which matters if layouts are separate types.

## Expansion trigger

Consider Mekko once treemap and icicle prove readable on real two- and three-level data.

## Next step after confirmation

The [shape brief](shape-brief.md) proposes one Hierarchy chart with treemap, icicle, and sunburst layouts over a shared model. The [implementation plan](implementation-plan.md) starts with a two-level treemap proof on the shop dataset.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
