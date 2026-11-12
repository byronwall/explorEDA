---
"exploreda": minor
---

Chart defaults are now frozen. A new chart's axes, margin, facet, layout, and filters started as objects shared by every chart, so changing one in place changed them all. That code now throws a TypeError; copy the part first, as in `chart.xAxis = { ...chart.xAxis, grid: true }`.
