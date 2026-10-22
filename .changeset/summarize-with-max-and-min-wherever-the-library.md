---
"exploreda": minor
---

Summarize with `max` and `min` wherever the library summarizes: project query `aggregate` measures (`max @peak field`), dashboard-text `group @name max(field) by=…` and `metric max(field)`, heatmap and calendar `aggregation=`, and a line's `time.aggregation`. A line chart without date periods now takes `color=<field>` to draw one line per category value, each in x order, so a numeric x such as a year splits by category.
