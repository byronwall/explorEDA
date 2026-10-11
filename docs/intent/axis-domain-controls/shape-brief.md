---
title: "Set and reset chart domains without filtering rows — shape brief"
slug: "axis-domain-controls"
phase: shape
status: current
last_updated: "2026-10-10"
---

# Set and reset chart domains — what we are adding

**Outcome:** Every numeric axis is stable, says when it is not showing every row, and offers a true log scale where analysts compare across orders of magnitude.

**Primary flow:** Set a bound or pick Log → a small marker appears at the affected end of the axis → open it to read why and how many → reset that bound or change the scale.

## Feature scope

```text
Axis domain controls
├── PLANNED ADDITIONS
│   ├── Hidden-rows marker on an axis
│   │   ├── Icon at the clipped end (min or max side), one per side
│   │   ├── Opens on hover or focus: reason and count, in the chart's own unit
│   │   ├── "Reset" clears that side's bound only
│   │   └── Scatter, bar, histogram, row, line, and box charts
│   ├── Stable axes on every chart that honors limits
│   │   └── Aggregate bars, series bars, row charts, and line values join
│   │       scatter, box, histogram, and count bars in using all rows
│   └── True log scale
│       ├── Scatter (both axes), line value axis, box plots
│       ├── Not on bar, histogram, row, area, or stacked charts
│       ├── Zeros and negatives: the same marker, as a warning, with a count
│       └── Bounds and drag work in log space; bounds must be above zero
└── LATER POSSIBILITIES
    ├── "Use symlog instead" inside the log warning
    └── Free scales per facet panel; ECDF bounds
```

## Behavior

| Situation | Expected result |
| --- | --- |
| Scatter x maximum set below the largest value | Icon at the right end of the x axis: "38 rows are beyond 500." Reset clears the maximum only. |
| Bound hides nothing | No marker. |
| Bar or line chart bound cuts a bar or point | Marker counts what the chart draws: "2 bars reach past 1,000," "3 periods are above 1,000." |
| Brushing another chart | Rows shown change; axes, markers' positions, and bounds do not. Counts update to the rows now shown. |
| Log on, field has zeros or negatives (scatter) | Those points are not drawn. A warning marker at the low end: "12 rows are zero or negative and cannot sit on a log scale." |
| Log on a box plot with nonpositive values | Statistics still use every value. Parts at or below zero are clipped at the floor, and the warning counts the rows. |
| Typing a minimum of 0 or less under log | Marked invalid and not applied, like an inverted range. |
| A saved chart already carries `scaleType: "log"` on an eligible axis | It now draws as log. On an ineligible chart it keeps drawing linear. |

## Decisions and boundaries

**Appetite:** Small. Five separable PRs on existing seams: the axis plan, `PlannedAxes`, `numericScale`, the axis drag transforms, and the Axes tab. No new chart types or renderer rewrites.

**Key decision — stable axes come first in meaning, not just in docs.** The code check found that aggregate bars, series bars, row charts, and the line chart's value axis set their domain from rows other charts leave in. They rescale on every brush, which breaks the rule you set. Fixing that belongs here because this initiative owns what an axis domain means. The time-series date axis has the same problem and moves to the [date and time initiative](../date-time-handling/intent-brief.md). Heatmap and map color domains also follow filters; they are not axes, so they are noted there and left alone.

**Key decision — one marker for every reason.** A bound and a log scale hide rows for different reasons, but the user needs the same three facts: where, how many, and the fix. One marker type with a reason keeps the two consistent and halves the UI work. It opens a small nonmodal popover rather than a tooltip, because it holds a button.

**Boundary:** Bounds and log never change record counts, saved selections, or brushes. Log never switches to symlog on its own. Box statistics are never recomputed without nonpositive values.

**First proof:** **Try:** the marker on scatter alone, with an x maximum set on the shop demo. **Observe:** whether the icon is noticed at the axis end, its count matches the rows beyond the bound, and Reset restores the axis. **Decide:** if it reads clearly at 1280 and 390 px, extend it to the other charts; if it is missed or crowds the ticks, move it beside the axis title before going further.

**Settled — averages grow to fit.** When a filter pushes an aggregate past the all-rows domain, the axis grows to fit until the filter clears. It never shrinks below the all-rows domain, so it stays still in the common case and never hides an aggregate.

See the [intent brief](intent-brief.md) and [implementation plan](implementation-plan.md).
