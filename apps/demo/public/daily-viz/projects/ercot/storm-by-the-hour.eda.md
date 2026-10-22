**How did the day-ahead forecast fail, hour by hour, when Winter Storm Uri hit Texas?** Each row is one hour of January and February 2021 on the ERCOT grid, with the electricity served and the forecast made the day before. For six weeks the two lines are hard to tell apart. Then, from February 14, generators froze, the grid shed load for days, and the forecast and the reality came apart by tens of thousands of megawatt-hours. Three sheets: the two months, the storm week on its own, and the same hours sorted by the clock.

```eda
eda query=r
date:date=r.date label="Hour (UTC)"
actual:num=r.actual label="Served (MWh)"
forecast:num=r.forecast label="Forecast (MWh)"
hour:num=r.hour label="Hour (UTC)"
hour_label:cat=r.hour_label label="Clock hour"
error:num=r.error label="Served minus forecast (MWh)" precision=0
abs_error:num=r.abs_error label="Absolute error (MWh)"
abs_pct_error:num=r.abs_pct_error label="Absolute error (% of forecast)"
calc week = extractDateComponent(date, "month") == 2 && extractDateComponent(date, "day") >= 14 && extractDateComponent(date, "day") <= 20 ? "Storm week" : "Other weeks"
```

# Two months

## Six quiet weeks, then a week apart

Served and forecast electricity on one scale. Before February 14 the lines overlap; the forecast's mean absolute miss was 2.65% of the forecast. Inside the shaded week the forecast climbs toward 77,000 MWh while the grid serves 45,000.

```eda
line @nb-ercot-storm-by-the-hour-1 x=date y=actual,forecast title="Electricity served and forecast, by hour, January and February 2021" y.title="Electricity (MWh)" {
  band x=2021-02-14..2021-02-21 "Winter Storm Uri"
}
```

## The difference puts the storm on its own axis

Subtract the forecast and the six quiet weeks flatten onto zero. Before the storm the grid ran a little above forecast, by 646 MWh an hour on average; during the storm week it ran 11,109 MWh an hour below it, and after the storm it was still 2,918 MWh below.

```eda
line @nb-ercot-storm-by-the-hour-2 x=date y=error title="Served minus forecast, by hour" y.title="Served minus forecast (MWh)" {
  rule y=0 "On forecast"
  band x=2021-02-14..2021-02-21 "Winter Storm Uri"
}
```

## Before the storm, half the hours were within 2%

Set time aside and count the quiet weeks' hours by how far they missed. 51.4% of the hours before February 14 missed by 2% of the forecast or less, and nine in ten by under 6%.

```eda
ecdf @nb-ercot-storm-by-the-hour-3 abs_pct_error where.week="Other weeks" direction=below title="Share of hours outside the storm week under each miss, as % of forecast" x.title="Absolute error (% of forecast)" {
  rule x=2 "2% of forecast"
}
```

# The storm week

## Demand rose, then the grid fell

The forecast expected the cold to push demand to a record: it peaked at 76,783 MWh for the hour of 21:00 UTC on February 15. The grid never got there. Served load peaked at 69,215 MWh fifteen hours earlier, then dropped as plants tripped offline and ERCOT ordered rolling outages.

```eda
line @nb-ercot-storm-by-the-hour-4 x=date y=actual,forecast where.date=2021-02-13..2021-02-22 title="Electricity served and forecast, February 13 to 21, 2021" y.title="Electricity (MWh)" {
  callout "Forecast peak: 76,783 MWh" at=2021-02-15T21:00:00Z,76783 offset=36,-26
  callout "Served peak: 69,215 MWh" at=2021-02-15T06:00:00Z,69215 offset=-170,-38
}
```

## The worst hour missed by 28,885 MWh

At 06:00 UTC on February 16 the forecast said 73,149 MWh and the grid served 44,264, a miss of 28,885 MWh, two fifths of the forecast. For 71 of the week's 168 hours the grid ran more than 10,000 MWh below forecast. The mean absolute miss for the week was 17.52% of the forecast.

```eda
line @nb-ercot-storm-by-the-hour-5 x=date y=error where.date=2021-02-13..2021-02-22 title="Served minus forecast, February 13 to 21, 2021" y.title="Served minus forecast (MWh)" {
  rule y=0 "On forecast"
  callout "Feb 16, 06:00 UTC: 28,885 MWh under forecast" pick=min offset=120,-10
}
```

# By clock hour

## Outside the storm, the clock barely matters

Each cell is a clock hour, averaged over the hours in its column. In the other weeks the signed miss stays within a few hundred megawatt-hours all day, slightly over forecast at night and slightly under in the afternoon. In the storm week every hour is thousands below, and the evening is worst.

```eda
heatmap @nb-ercot-storm-by-the-hour-6 hour_label maxCategories=24 columnField=week aggregation=average measureField=error title="Mean served minus forecast, by clock hour: the storm week against the other weeks"
```

## The storm's evenings missed most

Inside the storm week, the 19:00 UTC hour ran 14,006 MWh below forecast on average, the deepest of any clock hour. That is early afternoon in Texas, when the forecast expected heating demand to peak and the grid had the least generation to offer.

```eda
group @stormHours avg(error) by=hour_label
row @nb-ercot-storm-by-the-hour-7 hour_label group=stormHours topN=24 where.week="Storm week" title="Mean served minus forecast by clock hour, storm week only" x.title="Mean served minus forecast (MWh)"
```

## Takeaway

A forecast can be excellent and useless in the same two months. Before Uri, ERCOT's day-ahead forecast missed by under 3%; during the storm the miss was not a forecasting error but a supply failure, with the grid serving tens of thousands of megawatt-hours less than Texans needed. Any summary of forecast accuracy for early 2021 is really a summary of one week.

## Limits

Served electricity is not demand: during the outages it measures what the grid could deliver, not what was wanted, so the storm-week error mixes forecast error with load shedding. Hours are UTC; the snapshot starts and ends mid-day, and the first and last days are partial.
