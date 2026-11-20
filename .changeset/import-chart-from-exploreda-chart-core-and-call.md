---
"exploreda": minor
---

Import `Chart` from `exploreda/chart-core` and call `registerCharts` with only the chart types a page draws, so the bundle leaves the others out. Every chart type now has its own `exploreda/charts/<type>` import, and an unregistered type shows the import to add.
