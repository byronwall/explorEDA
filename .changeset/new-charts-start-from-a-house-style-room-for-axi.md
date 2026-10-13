---
"exploreda": minor
---

New charts start from a house style: room for axis titles, four Y ticks, a value-axis grid, compact rows, and 20 histogram bins. Dashboard text now writes one word per setting (such as x.title, x.grid, x.ticks, bins, size.max), leaves out settings that match a chart's defaults, and exportDocument compares charts in normalized form. Use normalizeDashboard to fill a saved dashboard's left-out settings, and exploreda-dsl reference <type> to list every setting a chart type takes.
