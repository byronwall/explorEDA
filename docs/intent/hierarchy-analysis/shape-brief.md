---
title: "Explore nested categories and their totals — shape brief"
slug: "hierarchy-analysis"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Explore nested categories and their totals — what we are adding

**Outcome:** An analyst sees which subcategories exist, how large each one is, and how each part compares to its parent and to the whole, across two or three category levels.

**Primary flow:** Add a Hierarchy chart → choose Region → Category → Product and a size → read the treemap → zoom into North → click a category to filter the other charts → return through the breadcrumbs.

## Feature scope

```text
Hierarchy chart (one chart type, several layouts)
├── PLANNED ADDITIONS
│   ├── Setup
│   │   ├── Levels: 1–3 ordered category fields
│   │   ├── Size: row count, or sum of a nonnegative measure
│   │   └── Color: by top-level branch (default), by level, or one color
│   ├── Layouts — switching keeps levels, size, color, focus, and filters
│   │   ├── Treemap: nested rectangles, parents framed around children
│   │   ├── Icicle: stacked bands by level, each the length of its share
│   │   └── Sunburst: rings by level (last; first to cut)
│   ├── Zoom into a branch
│   │   ├── Double-click a parent (Shift+Enter from the keyboard): it fills the chart
│   │   ├── Breadcrumbs above the plot: All › North › Home, each one a step back
│   │   └── Saved with the chart as a value path, so a reload shows the same view
│   ├── Part-to-whole reading
│   │   ├── Labels: name and value; share of parent when it fits
│   │   ├── Readout: full path, value, % of parent, % of the zoomed branch, % of all
│   │   └── The current root's total is always shown
│   ├── Small categories
│   │   ├── Every child is drawn; no catch-all "Other" box
│   │   └── Small marks unlabeled but hoverable; tiny slivers not drawn
│   └── Selection
│       ├── Click a node: filter to that branch; empty space: clear
│       ├── Shift-click a sibling: add it under the same parent
│       └── Alt-click: trace the rows behind a node
├── EVALUATE BEFORE COMMITTING
│   └── Mekko for exactly two levels
└── LATER POSSIBILITIES
    └── Parent-ID data; deeper trees; pivot subtotals; cross-parent selection; circle packing
```

## Behavior

| Situation | Expected result |
| --- | --- |
| "Lamp" sits under both Home and Office | Two separate nodes. A node is its full path, not its label. |
| A level value is blank | Omitted or shown as `(missing)`, using the same setting Sankey uses. |
| Negative or missing measure | Row is left out; the status line gives the count. |
| Click North › Home | Filters Region = North and Category = Home. |
| Shift-click a node under a different parent | Not added: it would also select unwanted pairs. A brief note explains. |
| Zoom into North | View only: other charts are not filtered. The breadcrumb ends in North with its total. |
| Zoomed branch has no rows after another chart's filter | The chart shows the deepest ancestor that still has rows. The missing crumb stays, marked "no rows", and the view returns when rows come back. |
| Levels are reordered or replaced | The focus keeps only the part of its path whose levels are unchanged. |
| Double-click a leaf | No zoom; a leaf has nothing inside it. |

## Examples

Zoomed into North (illustrative):

```text
All › North                                  North total 52,900
┌──────────────── Home 57% ──────┬──── Office 43% ───┐
│ Desk Lamp 41%  │ Rug 59%       │ Chair  │ Shelf    │
└────────────────┴───────────────┴────────┴──────────┘
Readout: North › Home › Rug · 17,700 · 59% of Home · 33% of North · 13% of all
```

The focus is stored as the values along the levels, in order:

```text
levels: [Region, Category, Product]
focus:  [North]          → North fills the chart
focus:  [North, Home]    → Home under North fills the chart
focus:  []               → the whole
```

It is the same kind of value a filter stores, so it is deterministic, readable in dashboard text, and independent of layout and size. The breadcrumb and dashboard-text formats are illustrative.

## Decisions and boundaries

**Appetite:** Medium. One new chart type with three layouts and zoom over one shared hierarchy model. Sized for 2–3 levels with 2–8 categories each. Larger data is narrowed by filtering and zoom.

**Key decision:** One Hierarchy chart with a layout control, not separate Treemap, Icicle, and Sunburst types. Changing a chart's type resets its settings today, so separate types would drop the levels and focus on every switch. Path identity, missing values, zoom, filters, and tracing are shared; each layout is mostly geometry. Category-path settings follow Sankey's conventions.

**Key decision:** Zoom is a view and a filter is a selection. Keeping them separate lets an analyst zoom into North and still compare its categories in other charts by clicking them.

**Boundary:** Levels come only from the chosen field order; no inferred parent links or tree editing. Selection stays within one parent until [precise composite selection](../precise-composite-selection/intent-brief.md) exists. Pivot subtotals stay out.

**First proof:** **Try:** A two-level treemap: shop data, Region → Category, sum of Revenue, with readouts and click-to-filter. **Observe:** One branch's % of whole matches a pivot of the same fields. Clicking North › Home filters a rows table to exactly those orders. **Decide:** If both hold, add zoom, then three levels and small categories, then icicle, then sunburst. Otherwise fix the shared model before adding anything.

**Settled:** One "Hierarchy" entry in Add Chart. Rectangular layouts first; no circle packing. Zoom ships in the first wave.

**Resolved:** Three levels default to treemap. At narrow widths the leaves go unlabeled, and zoom labels every box.

See the [intent brief](intent-brief.md) and the [implementation plan](implementation-plan.md).
