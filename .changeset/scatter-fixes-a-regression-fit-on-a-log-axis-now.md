---
"exploreda": patch
---

Scatter fixes: a regression fit on a log axis now leaves out rows at or below zero and still draws its line, density bins and marginal histograms follow a log axis and keep rows past an axis bound out of every bin, a marginal bin selects its half-open range, a brush on one field used for both axes restores correctly, clipped points no longer answer hover or keyboard, and the bubble size legend shortens its labels (200M, 1B) to fit narrow charts.
