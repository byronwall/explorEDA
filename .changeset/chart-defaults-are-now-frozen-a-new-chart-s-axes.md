---
"exploreda": minor
---

Chart defaults are now frozen. A new chart's axes, margin, facet, layout, and filters started as objects shared by every chart, so changing one in place changed them all; that code now throws a TypeError, so copy the part first, as in `chart.xAxis = { ...chart.xAxis, grid: true }`. Tables, axes, and labels also format values about 13 times faster, and analysis projects evaluate faster on wide data.
