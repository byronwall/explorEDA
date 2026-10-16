# Sunspot peaks range from under 50 to 190

**How much does the height of the solar cycle vary from one peak to the next?** Each row is one year.

```eda
eda query=r
year:num=r.year label="Year"
activity:num=r.activity label="Sunspot number"
era:cat=r.era label="Era"
```

## 1. Annual activity in calendar order

Keep the full chronology before imposing any cycle boundaries. The observations do not arrive as identical repetitions of a template.

```eda
line @nb-sunspots-cycles-chart-1 x=year y=activity title="Annual activity in calendar order" x.title="Year" y.title="Sunspot number"
```

## 2. The distribution of annual activity

Count years by activity rather than smoothing the cycles into a single average. A long upper tail can pull the mean away from a typical year.

```eda
hist @nb-sunspots-cycles-chart-2 activity bins=24 title="The distribution of annual activity" x.title="Sunspot number" y.title="Rows"
```

**Finding.** The largest annual sunspot number is 190.2.

## 3. Compare broad historical spans

Half-century labels provide descriptive groups, not scientifically estimated cycle boundaries. The final span is incomplete.

```eda
boxplot @nb-sunspots-cycles-chart-3 activity color=era title="Compare broad historical spans" y.title="Sunspot number"
```

## 4. Read low-activity thresholds without bins

The curve gives the observed share of years at or below a threshold. It does not estimate the probability for an independent future year.

```eda
ecdf @nb-sunspots-cycles-chart-4 activity direction=below title="Read low-activity thresholds without bins" x.title="Sunspot number"
```

**Finding.** The median annual sunspot number is 40.0.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-sunspots-cycles-records year,activity,era title="Records behind this comparison"
```

## Takeaway

A repeated rise-and-fall pattern need not repeat at the same amplitude. The time series establishes order, while the distribution separates typical activity from a few large annual values.

## Limits

The historical series is preserved as and is not the current revised international sunspot-number series. Annual averages obscure monthly peaks; this is not a forecast of the next cycle.
