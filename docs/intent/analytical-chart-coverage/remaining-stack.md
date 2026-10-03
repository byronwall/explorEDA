# Remaining analytical chart stack

Byron approved this sequence after Metric Card PR #114. Each branch starts from the previous branch. Work stays in this thread without subagents.

| Step | Addition | Branch | PR | Status |
| --- | --- | --- | --- | --- |
| 1 | Metric card | `codex/metric-card` | #114 | In review |
| 2 | Calendar time series | `codex/calendar-time-series` | | In progress |
| 3 | Grouped bars | | | Pending |
| 4 | Stacked and 100% bars | | | Pending |
| 5 | Area and stacked area | | | Pending |
| 6 | Bubble scatter | | | Pending |
| 7 | Binned scatter density | | | Pending |
| 8 | Point map | | | Pending |
| 9 | Region map | | | Pending |
| 10 | Histogram, Distribution, and Other discovery | | | Pending |

Each PR needs a worked example, exact source tracing, linked selection where meaningful, keyboard controls, saved settings, and a changeset. Check the browser at 1280, 783, and 390 px. Run `pnpm check` on Node 24. Upload screenshots of the chart, trace inspector, and configuration menu with `gh --attach`.

Correlation matrices, waterfall, hierarchy charts, missingness views, and domain charts remain outside this stack.
