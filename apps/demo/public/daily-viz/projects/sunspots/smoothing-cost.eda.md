# What an eleven-year smooth removes from a sunspot chart

**Reader question.** How different is annual activity from a centered eleven-observation mean?

**Population.** one year. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
year:num=r.year label="Year"
activity:num=r.activity label="Activity (sunspot number)"
era:cat=r.era label="Era"
smooth11:num=r.smooth11 label="Smooth11 (sunspot number)"
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

**Computed finding.** The largest annual value above its centered mean was 102.26 sunspot-number units. This calculation uses 299 eligible rows after the recorded filter and field-completeness rule.

## 3. Large annual values versus their local reference

This compares an observation with a summary that includes that observation. Their association is partly mathematical and must not be interpreted as independent validation.

```eda
scatter @nb-sunspots-smoothing-cost-chart-3 x=smooth11 y=activity title="Large annual values versus their local reference" x.title="Smooth11 (sunspot number)" y.title="Activity (sunspot number)"
```

## 4. The distribution of departures

Only complete-window years contribute. The edge exclusions are a consequence of the declared smoothing rule, not missing original activity measurements.

```eda
hist @nb-sunspots-smoothing-cost-chart-4 departure bins=24 title="The distribution of departures" x.title="Departure (sunspot number)" y.title="Source rows"
```

**Computed finding.** The largest annual value below its centered mean was -91.19 sunspot-number units. This calculation uses 299 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-sunspots-smoothing-cost-records year,activity,smooth11,departure title="Records behind this comparison"
```

## What the comparison supports

Smoothing trades local peaks for a slower-moving reference. Display the departure and the missing edge estimates so the reader can see the cost of that trade.

## Limits

A centered mean uses future observations and therefore is not a real-time forecast. The first and last five years lack complete windows and remain null rather than using shorter windows.

## Source and preparation

NOAA historical solar series; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [sunspots provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; activity: historical annual sunspot number; smooth11: 11-year mean sunspot number; departure: sunspot-number difference.
