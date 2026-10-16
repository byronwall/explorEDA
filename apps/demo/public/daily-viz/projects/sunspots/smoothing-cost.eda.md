# What an eleven-year average removes from the sunspot record

**How different is annual activity from a centered eleven-observation mean?** Each row is one year.

```eda
eda query=r
year:num=r.year label="Year"
activity:num=r.activity label="Sunspot number"
smooth11:num=r.smooth11 label="11-year mean (sunspot number)"
departure:num=r.departure label="Departure (sunspot number)"
```

## 1. Raw annual values beside the centered mean

Both series stay on one scale. The smooth is deliberately unavailable where a complete centered window does not exist.

```eda
line @nb-sunspots-smoothing-cost-chart-1 x=year y=activity,smooth11 title="Raw annual values beside the centered mean" x.title="Year" y.title="Activity (sunspot number) / Smooth11 (sunspot number)"
```

## 2. What the smooth leaves out

Subtracting the smooth makes the remaining amplitude visible. It does not create a separately measured physical quantity.

```eda
line @nb-sunspots-smoothing-cost-chart-2 x=year y=departure title="What the smooth leaves out" x.title="Year" y.title="Departure (sunspot number)" {
  rule y=0 "Equals centered mean"
}
```

**Finding.** The largest annual value above its centered mean was 102.26 sunspot-number units.

## 3. Large annual values versus their local reference

This compares an observation with a summary that includes that observation. Their association is partly mathematical and must not be interpreted as independent validation.

```eda
scatter @nb-sunspots-smoothing-cost-chart-3 x=smooth11 y=activity title="Large annual values versus their local reference" x.title="11-year mean (sunspot number)" y.title="Sunspot number"
```

## 4. The distribution of departures

Only complete-window years contribute. The edge exclusions are a consequence of the declared smoothing rule, not missing original activity measurements.

```eda
hist @nb-sunspots-smoothing-cost-chart-4 departure bins=24 title="The distribution of departures" x.title="Departure (sunspot number)" y.title="Rows"
```

**Finding.** The largest annual value below its centered mean was -91.19 sunspot-number units.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-sunspots-smoothing-cost-records year,activity,smooth11,departure title="Records behind this comparison"
```

## Takeaway

Smoothing trades local peaks for a slower-moving reference. Display the departure and the missing edge estimates so the reader can see the cost of that trade.

## Limits

A centered mean uses future observations and therefore is not a real-time forecast. The first and last five years lack complete windows and remain null rather than using shorter windows.
