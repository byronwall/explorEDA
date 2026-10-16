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

## 1. Actual and forecast, in the same units

Begin with the quantities being compared. Both lines use the same MWh scale; closeness is meaningful, but small differences are difficult to follow against the much larger level.

```eda
line @nb-ercot-signed-error-chart-1 x=date y=actual,forecast title="Actual and forecast, in the same units" x.title="Hour (UTC)" y.title="Actual (MWh) / Forecast (MWh)"
```

## 2. Subtract the forecast and the storm stands alone

A positive value means more electricity was served than forecast; a negative value means less. For six weeks the line hugs zero. Then it climbs as demand outruns the forecast in the cold, and falls off a cliff when generators trip offline and the grid sheds load.

```eda
line @nb-ercot-signed-error-chart-2 x=date y=error title="Served minus forecast, by hour" x.title="Hour (UTC)" y.title="Error (MWh)" {
  rule y=0 "Actual equals forecast"
}
```

**Finding.** The mean signed error was -1,242.9 MWh per hour.

**Finding.** From February 14 to 20, the mean signed error was -11,109 MWh per hour.

**Finding.** Before February 14, the mean signed error was 646 MWh per hour.

Before the storm the forecast ran slightly low, not high. The two-month average is a storm average; read alone, it would suggest a forecast that runs high every day.

## 3. Most misses are small

Set time aside and count hours by the size of their miss. The tall bars sit near zero. The long left tail is almost entirely storm week, though the histogram alone can't show that those hours are neighbors.

```eda
hist @nb-ercot-signed-error-chart-3 error bins=30 title="Hours by size of miss" x.title="Error (MWh)" y.title="Rows"
```

## 4. How big a miss is typical?

The cumulative curve answers threshold questions directly: pick an error size on the x axis and read the share of hours that missed by less.

```eda
ecdf @nb-ercot-signed-error-chart-4 abs_error direction=below title="Share of hours under each miss size" x.title="Absolute error (MWh)"
```

**Finding.** The mean absolute error was 2,591.7 MWh per hour.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-ercot-signed-error-records date,actual,forecast,error,abs_error title="Hourly demand and forecast"
```

## Takeaway

Plotting the difference turns a two-line comparison into one distance from zero, and that is where the storm becomes obvious. Before summarizing a forecast's error, look for an episode like this one; a single week can set the average for two months.

## Limits

Actual is electricity served in each hour, not unconstrained demand. Served demand during the storm reflects rolling outages, not what Texans wanted to use, so the storm-week error mixes forecast error with load shedding. The UTC snapshot includes partial boundary dates.
