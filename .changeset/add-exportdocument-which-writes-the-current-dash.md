---
"exploreda": minor
---

Add `exportDocument`, which writes the current dashboard as dashboard text that rebuilds it. Any chart type and setting can now be written as a flat path such as `xAxis.scaleType=log` or `columns.0.width=140`, with no JSON, and `chart <type>` builds every registered chart type.
