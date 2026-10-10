---
id: page-limits-on-time-series-and-calendar-x-axes
label: Limits on time-series and calendar X axes
type: page
status: planned
priority: medium
parent: page-axis-limits-on-more-chart-families
metadata:
  purpose: Date-unit limits and calendar-time drag on date axes.
---
Date axes need limits in date units, entered as dates rather than numbers. Drag should pan in calendar time.

- `numericAxes()` in `Axis/axisBounds.ts` returns `x: false` for time series today.
- `AxisLimitFields` would need a date mode.

