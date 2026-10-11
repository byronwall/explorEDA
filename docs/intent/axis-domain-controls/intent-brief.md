---
title: "Set and reset chart domains without filtering rows"
slug: "axis-domain-controls"
phase: intent
status: current
last_updated: "2026-10-10"
---

# Set and reset chart domains without filtering rows

## My read

Analysts should be able to change the part of a numeric chart they see without changing which records count. Most of that has shipped with in-place editing. What remains is small. An axis that is not showing every row should say so where it happens, and a true log scale should be available on the charts where analysts compare across orders of magnitude.

## What seems settled

- **Bounds as a setting.** `xAxis.limits` and `yAxis.limits` work on scatter, bar, histogram, line, row, and box charts. Marks outside are clipped, not filtered, and a blank side follows the data.
- **Exact entry and reset.** The Axes tab and an editor anchored to the axis take a minimum and maximum. Invalid or inverted drafts never apply. A reset control clears both limits.
- **Display zoom.** Dragging along an axis pans it, and dragging an end stretches that bound. Each drag is one undo step.
- **Symlog** on the shared numeric axis, and a positive-only log on ECDF that says when it cannot apply.
- Axes span all rows before filtering, and only edits on that chart change them.
- Limits save and restore with the workspace. All facet panels read one settings object, so they share the same limits.

## What matters most

1. **An axis says when it hides rows.** When a bound clips marks, a small icon sits at that end of the axis. Hovering or focusing it says how many rows fall outside, and a button inside resets that bound to fit the data.
2. **True log where it is useful.** Offer log on scatter (both axes), on the value axis of line charts, and on box plots. Do not offer it on bar, histogram, or row charts, where bars lose their zero baseline.
3. **Log explains what it leaves out.** Zeros and negatives cannot sit on a log axis. They are left out, and a warning icon on that axis says why and how many rows are affected. Log never switches to symlog on its own.

4. **Every chart keeps stable axes.** Aggregate bars, series bars, and the time series value axis still rescale when other charts filter. They should set their domain from all rows, as scatter, box, histogram, row, and count bars already do.

Items 1 and 3 are the same idea: an axis that is not showing every row carries one marker that names the reason, the count, and the fix.

## Boundaries

- **Axes are stable.** A chart's axes always span all rows before any filtering, unless the user changes them on that chart. Brushing or filtering on other charts changes which rows are shown, never the axes or other chart settings. Stability and consistency are a key part of the experience.
- Bounds and log change the view only. Saved selections and brushes stay in data units, and record counts do not change.
- No universal pan/zoom toolkit, wheel zoom, or renderer rewrite.

## Cut from this initiative

- **Dates and times.** Bounds, entry, and drag on date axes move to the [date and time initiative](../date-time-handling/intent-brief.md), which reworks dates across the app.
- **ECDF bounds.** ECDF already has its own log option; add bounds only if an analysis asks for them.
- **Heatmap, map, and calendar limits.** They have no continuous numeric axis to bound.
- **Per-panel free scales.** Wait for an analysis that needs facet panels on separate scales.
- **Axes that follow filtered rows.** Ruled out by the stable-axes boundary, not deferred.
- **Removing the unused `min`/`max` placeholder** that every saved chart carries. That is cleanup, not product work, and it can go in any later PR.

## Expansion trigger

Reopen free facet scales or ECDF bounds when an analysis needs them.

## Next step after confirmation

The [shape brief](shape-brief.md) and [implementation plan](implementation-plan.md) sequence this as five PRs. Axis editing in place and axis drag are delivered; see [UI defaults](../../ui-defaults.md#popovers-and-dialogs). This initiative owns what bounds and scales mean.

See the [reference packet](references/README.md) for historical context.
