# The annual mean hides a 6 °C swing inside each year

**Do years with high means also have unusually wide within-year temperature ranges?** Each row is one year.

```eda
eda query=annual
year:num=annual.year label="Year"
mean:num=annual.mean label="Mean (°C)"
low:num=annual.low label="Low (°C)"
high:num=annual.high label="High (°C)"
range:num=annual.range label="Range (°C)"
months:num=annual.months label="Months observed"
```

## 1. Annual mean and observed extremes

Use a shared Celsius axis for the minimum, mean, and maximum. The outer lines summarize observed months rather than a statistical interval.

```eda
line @nb-elnino-annual-range-chart-1 x=year y=low,mean,high title="Annual mean and observed extremes" x.title="Year" y.title="Low (°C) / Mean (°C) / High (°C)"
```

## 2. Mean temperature against seasonal range

The range adds information not encoded by the mean. A year may have a high mean without having the widest spread of monthly values.

```eda
scatter @nb-elnino-annual-range-chart-2 x=mean y=range title="Mean temperature against seasonal range" x.title="Mean (°C)" y.title="Range (°C)"
```

**Finding.** The average within-year observed monthly range was 5.86 °C.

## 3. How unusual is a wide annual range?

This histogram counts years equally. It is not a distribution of monthly temperatures and cannot identify when the extremes occurred.

```eda
hist @nb-elnino-annual-range-chart-3 range bins=15 title="How unusual is a wide annual range?" x.title="Range (°C)" y.title="Rows"
```

## 4. Check the number of observed months

A min–max comparison becomes unreliable when years have different opportunities to record an extreme. The explicit month count checks that denominator.

```eda
scatter @nb-elnino-annual-range-chart-4 x=year y=months title="Check the number of observed months" x.title="Year" y.title="Months observed"
```

**Finding.** The largest within-year observed monthly range was 7.93 °C.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-elnino-annual-range-records year,months,low,mean,high,range title="Records behind this comparison"
```

## Takeaway

An observed-range band is useful only when it is named honestly. Pair it with the annual mean, and resist describing the band as uncertainty about that mean.

## Limits

The lower and upper bounds are observed monthly minima and maxima, not confidence intervals. Annual summaries give months equal weight and erase timing within the year.
