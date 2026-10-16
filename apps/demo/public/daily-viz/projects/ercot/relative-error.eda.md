# Half of ERCOT hours missed by less than 2.3%

**Which hours look worse when the miss is measured as a share of the forecast?** Each row is one hour.

```eda
eda query=r
date:date=r.date label="Hour (UTC)"
forecast:num=r.forecast label="Forecast (MWh)"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Calendar month"
error:num=r.error label="Error (MWh)"
abs_error:num=r.abs_error label="Absolute error (MWh)"
pct_error:num=r.pct_error label="Error (% of forecast)"
abs_pct_error:num=r.abs_pct_error label="Absolute error (% of forecast)"
direction:cat=r.direction label="Direction"
```

## 1. Does absolute miss grow with the forecast?

Each point is one hour. A large forecast and a large absolute miss can coexist without implying that the forecast caused the error.

```eda
scatter @nb-ercot-relative-error-chart-1 x=forecast y=abs_error opacity=0.4 title="Does absolute miss grow with the forecast?" x.title="Forecast (MWh)" y.title="Absolute error (MWh)"
```

## 2. The same denominator made explicit

Keep forecast on the horizontal axis and replace the vertical measure with an absolute percentage. The denominator is now visible instead of being hidden inside the metric.

```eda
scatter @nb-ercot-relative-error-chart-2 x=forecast y=abs_pct_error opacity=0.4 title="The same denominator made explicit" x.title="Forecast (MWh)" y.title="Absolute error (% of forecast)"
```

**Finding.** The median absolute percentage error was 2.26% of forecast.

## 3. Percentage-error distributions by UTC month

Compare distributions, not just their means. The small March boundary slice is not a third complete month and must not be treated as an equally supported estimate.

```eda
boxplot @nb-ercot-relative-error-chart-3 abs_pct_error color=month_label title="Percentage-error distributions by UTC month" y.title="Absolute error (% of forecast)"
```

## 4. What share stays below a percentage threshold?

A cumulative curve avoids arbitrary histogram bins. Its percentage denominator is the number of valid hourly percentage errors, not the sum of forecast MWh.

```eda
ecdf @nb-ercot-relative-error-chart-4 abs_pct_error direction=below title="What share stays below a percentage threshold?" x.title="Absolute error (% of forecast)"
```

**Finding.** The 90th percentile of absolute percentage error was 14.23% of forecast.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-ercot-relative-error-records date,forecast,error,abs_error,pct_error,abs_pct_error title="Records behind this comparison"
```

## Takeaway

Absolute errors retain the grid-scale quantity. Relative errors describe that miss against the size of the forecast. Keep both rather than allowing the percentage plot to erase the operational magnitude.

## Limits

Percentage errors divide by the positive forecast, not actual demand. Changing that denominator changes the statistic. Both summaries describe this historical snapshot and are not forecast-model rankings.
