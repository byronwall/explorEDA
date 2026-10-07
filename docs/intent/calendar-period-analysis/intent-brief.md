---
title: "Step through periods and inspect rolling measures"
slug: "calendar-period-analysis"
phase: intent
status: current
last_updated: "2026-10-06"
---

# Step through periods and inspect rolling measures

## My read

Analysts should move through comparable time periods and understand rolling summaries without external reshaping. Calendar lines, day/week/month reductions, area modes, and date presets already exist. The remaining job is narrower: step a window forward or backward, distinguish rolling from completed periods, and inspect any derived rolling measure.

The desired experience makes the reference date and period boundaries explicit. Existing quick ranges use the latest date in the field, which is useful for a static dataset. That differs from a clock-based live window. Preserve the useful source-anchored behavior. Do not turn every date picker into a scheduler or assume that the user wants local-time aggregation.

Time remains important, but Byron places it in a second pass after editorial styling, direct editing, the scatter matrix, and table usability. Treat time as a cross-cutting improvement to those workflows, not a prerequisite for their first proofs.

## What matters most

- Keep UTC boundaries and reference date clear.
- Distinguish a rolling window from a completed calendar period.
- Explain rolling reducers and missing-period treatment.

## The intended experience

Choose a source-anchored date range, step it one comparable period, and inspect the matching source dates. On a trend view, optionally read a rolling mean or sum beside the underlying buckets. Compare the result with a manual calculation and restore the absolute range or declared relative definition.

## Boundaries

Do not rebuild existing calendar presets or area charts. A rolling mean of period means can be wrong when counts differ. Never silently switch to current time on restore. Prior-period deltas and rate cards depend on clear metric denominators. Keep forecasting and timezone configuration below this scope.

## What seems settled

UTC aggregation and latest-source date presets are current behavior. Stepping, completed-period rules, rolling calculations, and prior-period comparisons are candidates, not selected semantics.

## Current reality that matters

datePresets.ts offers latest 7/30/90/365-day ranges and bounded year, quarter, and month groups. dailyRollup.ts supplies UTC reducers. Line time settings support raw or grouped calendar data but no general rolling-window expression.

## Expansion trigger

Expand when a real analysis repeatedly compares adjacent periods or needs smoothing while retaining exact source inspection.

## Next step after confirmation

Step a one-month range across February and March with a fixed reference date. Check leap-day membership. Then compare one three-period sum with raw contributors before choosing any reusable rolling settings.

See the [reference packet](references/README.md) and [comparison collection](../comparison-opportunities/README.md) for context.
