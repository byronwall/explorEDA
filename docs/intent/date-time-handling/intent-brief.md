---
title: "Rework how dates and times work across the app"
slug: "date-time-handling"
phase: intent
status: draft
last_updated: "2026-10-10"
---

# Rework how dates and times work across the app

## My read

Byron wants one coherent pass over how explorEDA treats dates and times, rather than patching each chart. He has several ideas that are not yet written down. This seed holds the first concrete piece split out of other work, so it is not lost while the ideas are collected.

## What matters most

- Treat dates as one concern across import, fields, filters, and charts.
- Capture Byron's ideas before choosing a scope.

## The experience or behavior you appear to want

Not yet stated. Byron's ideas will define it.

## Boundaries

### Must be true

- Keep existing date behavior working until a change replaces it on purpose.

### Must be avoided

- Building piecemeal date controls chart by chart before the rework has a direction.

## What seems settled

- Date-axis bounds belong here, not with the retired axis-domain work ([deferred scope](../../application-feature-inventory.md#deferred-scope)). That includes setting a date range on a time-series axis, typing exact dates, and dragging or resetting it.

## Possibilities, not decisions

- A date axis may reuse the numeric axis's drag and reset, with date entry in place of number fields.

## Current reality that matters

- Numeric axis bounds (`xAxis.limits`, `yAxis.limits`) and axis drag work only on numeric axes. A time-series X axis is excluded (`numericAxes` in `components/charts/Axis/axisBounds.ts`).
- The time-series date axis takes its range from the rows other charts leave in, so it moves on every brush. That breaks the stable-axes rule in `docs/ui-defaults.md`. A fix has to keep the "filter the dates in another view" route that the 2,000-period cap relies on.
- A field is typed as a date only when its values have a date shape (#231).
- [Calendar and period analysis](../calendar-period-analysis/intent-brief.md) already covers stepping through periods and rolling measures. The two should be reconciled once this rework has a direction.

## What still needs your input

What are your ideas for dates? A rough list is enough to start.

## Next step after confirmation

Recover intent from Byron's ideas, then reconcile the scope with calendar and period analysis.
