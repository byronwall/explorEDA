# A large forecast miss is not always a large percentage miss

**Reader question.** Which hours look different when forecast error is divided by the forecast level?

**Population.** one supplied hour. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
date:date=r.date label="UTC supplied hour"
actual:num=r.actual label="Actual (MWh)"
forecast:num=r.forecast label="Forecast (MWh)"
year:num=r.year label="Year"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Month label"
decade:cat=r.decade label="Decade"
hour:num=r.hour label="Hour (UTC clock hour)"
hour_label:cat=r.hour_label label="Hour label"
error:num=r.error label="Error (MWh)"
abs_error:num=r.abs_error label="Abs error (MWh)"
pct_error:num=r.pct_error label="Pct error (%)"
abs_pct_error:num=r.abs_pct_error label="Abs pct error (%)"
direction:cat=r.direction label="Direction"
```

## 1. Does absolute miss grow with the forecast?

Each point is one supplied hour. A large forecast and a large absolute miss can coexist without implying that the forecast caused the error.

```eda
scatter @nb-ercot-relative-error-chart-1 x=forecast y=abs_error opacity=0.4 title="Does absolute miss grow with the forecast?" x.title="Forecast (MWh)" y.title="Abs error (MWh)"
```

## 2. The same denominator made explicit

Keep forecast on the horizontal axis and replace the vertical measure with an absolute percentage. The denominator is now visible instead of being hidden inside the metric.

```eda
scatter @nb-ercot-relative-error-chart-2 x=forecast y=abs_pct_error opacity=0.4 title="The same denominator made explicit" x.title="Forecast (MWh)" y.title="Abs pct error (%)"
```

**Computed finding.** The median absolute percentage error was 2.26% of forecast. This calculation uses 1,417 eligible rows after the recorded filter and field-completeness rule.

## 3. Percentage-error distributions by UTC month

Compare distributions, not just their means. The small March boundary slice is not a third complete month and must not be treated as an equally supported estimate.

```eda
boxplot @nb-ercot-relative-error-chart-3 abs_pct_error color=month_label title="Percentage-error distributions by UTC month" y.title="Abs pct error (%)"
```

## 4. What share stays below a percentage threshold?

A cumulative curve avoids arbitrary histogram bins. Its percentage denominator is the number of valid hourly percentage errors, not the sum of forecast MWh.

```eda
ecdf @nb-ercot-relative-error-chart-4 abs_pct_error direction=below title="What share stays below a percentage threshold?" x.title="Abs pct error (%)"
```

**Computed finding.** The 90th percentile of absolute percentage error was 14.23% of forecast. This calculation uses 1,417 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-ercot-relative-error-records date,forecast,error,abs_error,pct_error,abs_pct_error title="Records behind this comparison"
```

## What the comparison supports

Absolute errors retain the grid-scale quantity. Relative errors describe that miss against the size of the forecast. Keep both rather than allowing the percentage plot to erase the operational magnitude.

## Limits

Percentage errors divide by the positive forecast, not actual demand. Changing that denominator changes the statistic. Both summaries describe this historical snapshot and are not forecast-model rankings.

## Source and preparation

U.S. Energy Information Administration / ERCOT; U.S. public domain (EIA-authored data). Historical source version: Authorized repository baseline ea8b52ff742f11d1fb89457acabbcd27b0bd04e7

Data credit and license: [ercot provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** forecast: MWh for the supplied hour; error: MWh for the supplied hour; abs_error: MWh for the supplied hour; pct_error: % of positive forecast; abs_pct_error: % of positive forecast.
