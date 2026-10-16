# An annual temperature mean does not show the warmest month

**Reader question.** Do years with high means also have unusually wide within-year temperature ranges?

**Population.** one year. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=annual
id:cat=annual.id label="Id"
year:num=annual.year label="Year"
mean:num=annual.mean label="Mean (°C)"
low:num=annual.low label="Low (°C)"
high:num=annual.high label="High (°C)"
range:num=annual.range label="Range (°C)"
months:num=annual.months label="Months (observed months)"
anomaly:num=annual.anomaly label="Anomaly (°C)"
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

**Computed finding.** The average within-year observed monthly range was 5.86 °C. This calculation uses 61 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-annual-range.json).

## 3. How unusual is a wide annual range?

This histogram counts years equally. It is not a distribution of monthly temperatures and cannot identify when the extremes occurred.

```eda
hist @nb-elnino-annual-range-chart-3 range bins=15 title="How unusual is a wide annual range?" x.title="Range (°C)" y.title="Source rows"
```

## 4. Check the number of observed months

A min–max comparison becomes unreliable when years have different opportunities to record an extreme. The explicit month count checks that denominator.

```eda
scatter @nb-elnino-annual-range-chart-4 x=year y=months title="Check the number of observed months" x.title="Year" y.title="Months (observed months)"
```

**Computed finding.** The largest within-year observed monthly range was 7.93 °C. This calculation uses 61 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-annual-range.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-elnino-annual-range-records year,months,low,mean,high,range title="Records behind this comparison"
```

## What the comparison supports

An observed-range band is useful only when it is named honestly. Pair it with the annual mean, and resist describing the band as uncertainty about that mean.

## Limits

The lower and upper bounds are observed monthly minima and maxima, not confidence intervals. Annual summaries give months equal weight and erase timing within the year.

## Source and preparation

NOAA Climate Prediction Center, ERSST v3b; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [elnino provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/elnino.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-elnino-annual-range.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; mean: degrees Celsius; low: degrees Celsius; high: degrees Celsius; range: degrees Celsius; months: observed months.
