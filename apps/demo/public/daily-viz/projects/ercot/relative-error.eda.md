# Half of ERCOT's hours missed by under 2.3%; the storm week missed by 18%

**How big is a typical miss once you measure it against the size of the forecast?** Each row is one hour of January and February 2021 on the Texas grid, with the forecast error divided by the forecast. A 2,000 MWh miss is a rounding error at 70,000 MWh and a real problem at 35,000. The percentage view shows that most hours were close, and that Winter Storm Uri was not a few bad hours but a bad week.

```eda
eda query=r
date:date=r.date label="Hour (UTC)"
forecast:num=r.forecast label="Forecast (MWh)"
month:num=r.month label="Month"
abs_pct_error:num=r.abs_pct_error label="Absolute error (% of forecast)"
calc day = extractDateComponent(date, "day")
calc period = month == 1 || (month == 2 && day < 14) ? "Before the storm" : month == 2 && day <= 20 ? "Storm week" : "After the storm"
```

## Most hours missed by a few percent

The tall bars sit left of the median line. The median absolute percentage error was 2.26% of forecast. The 90th percentile of absolute percentage error was 14.23% of forecast. The bars beyond the second line are the long tail, and the worst hour missed by 39.5% of forecast.

```eda
hist @nb-ercot-relative-error-chart-1 abs_pct_error bins=80 title="Hours by absolute error, as a share of the forecast" x.title="Absolute error (% of forecast)" y.title="Hours" {
  rule x=2.26 "Median 2.3%"
  rule x=14.23 "90th percentile 14.2%"
}
```

## The tail is the storm week

Each point is one hour, placed by the size of its forecast. The storm-week hours sit high and to the right: the forecast expected record winter demand, and the grid served far less. During the storm week, the mean absolute percentage error was 17.5% of forecast. 70.2% of storm-week hours missed by more than 10%. 16.7% of hours missed by more than 10%.

```eda
scatter @nb-ercot-relative-error-chart-2 x=forecast y=abs_pct_error color=period opacity=0.5 title="Forecast size and percentage miss, one point per hour" x.title="Forecast (MWh)" y.title="Absolute error (% of forecast)" {
  callout "Feb 16, 06:00 UTC: 39% short" pick=max offset=-40,20
}
```

## The week after the storm was still off

The cumulative curves separate three periods. Before February 14 the curve rises almost straight up; before the storm, the median absolute percentage error was 1.63% of forecast. The storm-week curve barely leaves the floor until 10%. The week after sits between them: after February 20, the median absolute percentage error was 7.73% of forecast, as the forecast kept expecting demand that had not returned.

```eda
ecdf @nb-ercot-relative-error-chart-3 abs_pct_error color=period direction=below title="Share of hours under each percentage miss, by period" x.title="Absolute error (% of forecast)"
```

## Takeaway

Measured against the forecast, the day-ahead model was within a few percent in a typical hour and within 14% in nine hours of ten. The storm week missed by almost a fifth of the forecast, hour after hour, and the forecast took another week to settle. Quote the median for the model and the storm week for the risk.

## Limits

Percentage errors divide by the forecast, not by served demand; the storm-week numbers would be larger against actual. Served demand during the storm reflects rolling outages, not what Texans wanted to use. March contributes five hours.
