# One storm week broke the ERCOT forecast

**How far off was the day-ahead demand forecast, and in which direction?** Each row is one hour of January and February 2021 on the Texas grid. Most hours are unremarkable. One week is not: Winter Storm Uri reached Texas on February 14, and the grid served far less electricity than the forecast expected.

```eda
eda query=r
date:date=r.date label="Hour (UTC)"
actual:num=r.actual label="Actual (MWh)"
forecast:num=r.forecast label="Forecast (MWh)"
hour:num=r.hour label="Hour (UTC)"
error:num=r.error label="Error (MWh)"
abs_error:num=r.abs_error label="Absolute error (MWh)"
direction:cat=r.direction label="Direction"
```

## Two lines that agree until the storm

Both lines share one scale, so closeness is meaningful. For six weeks they ride together through the daily cycle. Inside the shaded week the forecast climbs toward 77,000 MWh as the cold arrives, and the served line falls away beneath it when generators trip offline.

```eda
line @nb-ercot-signed-error-chart-1 x=date y=actual,forecast title="Electricity served and day-ahead forecast, by hour" x.title="Hour (UTC)" y.title="Electricity (MWh)" {
  band x=2021-02-14..2021-02-20 "Winter Storm Uri"
}
```

## Subtract the forecast and the storm stands alone

A positive value means more electricity was served than forecast; a negative value means less. The line hugs zero, climbs as demand outruns the forecast in the cold, then falls off a cliff when the grid sheds load. The largest miss in one hour was 28,885 MWh. From February 14 to 20, the mean signed error was -11,109 MWh per hour. Before February 14, the mean signed error was 646 MWh per hour.

```eda
line @nb-ercot-signed-error-chart-2 x=date y=error title="Served minus forecast, by hour" x.title="Hour (UTC)" y.title="Error (MWh)" {
  rule y=0 "Actual equals forecast"
  band x=2021-02-14..2021-02-20 "Winter Storm Uri"
  callout "Feb 16, 06:00 UTC: 28,885 MWh short" pick=min offset=40,-10
}
```

## One week sets the two-month average

Before the storm the forecast ran slightly low, not high. The mean signed error was -1,242.9 MWh per hour. Read alone, that two-month figure would suggest a forecast that runs high every day; it is a storm average. Set time aside and the histogram shows the same thing: tall bars near zero and a long left tail that is almost entirely storm week.

```eda
hist @nb-ercot-signed-error-chart-3 error bins=30 title="Hours by size of miss" x.title="Error (MWh)" y.title="Hours" {
  rule x=0 "Zero"
}
```

## A typical hour missed by under a thousand

The cumulative curve answers threshold questions directly: pick a miss size and read the share of hours that missed by less. The median absolute error was 915 MWh per hour, and 70.9% of hours missed by less than 2,000 MWh. The mean absolute error was 2,591.7 MWh per hour. That is nearly three times the median, because the storm-week hours sit at the far end of the curve.

```eda
ecdf @nb-ercot-signed-error-chart-4 abs_error direction=below title="Share of hours under each miss size" x.title="Absolute error (MWh)"
```

## The storm week, hour by hour

The table holds the 168 storm-week hours, sorted so the largest shortfalls come first. The worst stretch runs through the early hours of February 16, when the forecast expected more than 70,000 MWh and the grid served about 44,000.

```eda
table @nb-ercot-signed-error-records date,actual,forecast,error,abs_error title="Storm-week hours, largest shortfall first" where.date=2021-02-14..2021-02-20 sortBy=r.error sortDirection=asc
```

## Takeaway

Plotting the difference turns a two-line comparison into one distance from zero, and that is where the storm becomes obvious. A forecast that was good for six weeks reads as badly biased once one week is averaged in.

## Limits

Actual is electricity served in each hour, not unconstrained demand. Served demand during the storm reflects rolling outages, not what Texans wanted to use, so the storm-week error mixes forecast error with load shedding. The UTC snapshot includes partial boundary dates.
