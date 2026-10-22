# February's forecast missed six times January's at every hour of the clock

**Does the forecast have a bad time of day?** Each row is one calendar month and one UTC clock hour, holding the mean signed and absolute error over every day that hour was observed. January has 24 full cells. February's cells each hold 28 hours, including Winter Storm Uri, and March's five cells hold one hour each.

```eda
eda query=clock
month_label:cat=clock.month_label label="Calendar month"
hour:num=clock.hour label="Hour (UTC)"
hour_label:cat=clock.hour_label label="Clock hour"
error:num=clock.error label="Error (MWh)"
abs_error:num=clock.abs_error label="Absolute error (MWh)"
hours:num=clock.hours label="Hours"
```

## February darkens every row

Read across any row: the February cell is darker than the January cell at all 24 hours. In January the clock-hour cells averaged 783 MWh of absolute error. In February the clock-hour cells averaged 4,603 MWh of absolute error. The storm week sits inside every February cell, so no clock hour escapes it.

```eda
heatmap @nb-ercot-clock-coverage-chart-1 hour_label maxCategories=24 columnField=month_label aggregation=average measureField=abs_error title="Mean absolute error by UTC clock hour and month"
```

## January's bad hours are the Texas evening

Plot the same cells by hour and January has a shape of its own: a hump from 00:00 to 04:00 UTC, which is 6 to 10 in the evening in Texas, and a trough in the late Texas night. January's worst clock hour, 04:00 UTC, averaged 1,153 MWh of absolute error. January's best clock hour, 08:00 UTC, averaged 598 MWh. February's best clock hour, 12:00 UTC, still averaged 3,310 MWh.

```eda
scatter @nb-ercot-clock-coverage-chart-2 x=hour y=abs_error color=month_label title="Mean absolute error by UTC clock hour, one point per cell" x.title="Hour (UTC)" y.title="Mean absolute error (MWh)" {
  callout "Feb 19:00 UTC: 5,290 MWh" pick=max offset=-30,20
}
```

## January ran high, February ran low

Signed errors tell the direction. In January the clock-hour cells averaged 209 MWh above forecast. In February the clock-hour cells averaged -2,850 MWh, served demand far below forecast, because the storm week's load shedding sits in every cell.

```eda
scatter @nb-ercot-clock-coverage-chart-3 x=hour y=error color=month_label title="Mean signed error by UTC clock hour, one point per cell" x.title="Hour (UTC)" y.title="Mean error (MWh)" {
  rule y=0 "Served equals forecast"
}
```

## Five cells are one hour each

Each cell's mean rests on a different number of hours. The best-supported month-hour cell contains 31 hours. The least-supported month-hour cell contains 1 hour. The five March cells at the far left are single observations from the morning of March 1, and their small errors say nothing about March.

```eda
scatter @nb-ercot-clock-coverage-chart-4 x=hours y=abs_error color=month_label title="Hours behind each cell and its mean absolute error" x.title="Hours in the cell" y.title="Mean absolute error (MWh)" {
  region x=0..2 y=0..600 "March: one hour per cell"
}
```

## Takeaway

The forecast does have a time of day: in a normal month it misses most in the Texas evening peak and least in the small hours. But February's storm week dwarfs that pattern six times over at every hour, so a clock-hour average of these two months describes the storm, not the clock.

## Limits

These are means over available days for a UTC clock hour; the clock is not local Texas time, and Central Standard Time is six hours behind. February's cells hold 28 hours each, and March's hold one. A mean of cells is not an hour-weighted monthly mean.
