---
"exploreda": minor
---

`exploreda/chart` now loads each chart type's code the first time a chart of that type draws, so a page downloads only the types it shows. To register types up front instead, import `Chart` from `exploreda/chart-core` and call `registerCharts`. Every chart type has its own `exploreda/charts/<type>` import, and with `chart-core` an unregistered type shows the import to add.
