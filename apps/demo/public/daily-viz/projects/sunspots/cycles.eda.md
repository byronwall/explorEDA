# Sunspot cycles do not all have the same height

**Reader question.** What range of annual activity is visible in this historical sunspot-number revision?

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

## 1. Annual activity in calendar order

Keep the full chronology before imposing any cycle boundaries. The observations do not arrive as identical repetitions of a template.

```eda
line @nb-sunspots-cycles-chart-1 x=year y=activity title="Annual activity in calendar order" x.title="Year" y.title="Activity (sunspot number)"
```

## 2. The distribution of annual activity

Count years by activity rather than smoothing the cycles into a single average. A long upper tail can pull the mean away from a typical year.

```eda
hist @nb-sunspots-cycles-chart-2 activity bins=24 title="The distribution of annual activity" x.title="Activity (sunspot number)" y.title="Source rows"
```

**Computed finding.** The largest supplied annual sunspot number is 190.2. This calculation uses 309 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-sunspots-cycles.json).

## 3. Compare broad historical spans

Half-century labels provide descriptive groups, not scientifically estimated cycle boundaries. The final span is incomplete.

```eda
boxplot @nb-sunspots-cycles-chart-3 activity color=era title="Compare broad historical spans" y.title="Activity (sunspot number)"
```

## 4. Read low-activity thresholds without bins

The curve gives the observed share of years at or below a threshold. It does not estimate the probability for an independent future year.

```eda
ecdf @nb-sunspots-cycles-chart-4 activity direction=below title="Read low-activity thresholds without bins" x.title="Activity (sunspot number)"
```

**Computed finding.** The median supplied annual sunspot number is 40.0. This calculation uses 309 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-sunspots-cycles.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-sunspots-cycles-records year,activity,era title="Records behind this comparison"
```

## What the comparison supports

A repeated rise-and-fall pattern need not repeat at the same amplitude. The time series establishes order, while the distribution separates typical activity from a few large annual values.

## Limits

The historical series is preserved as supplied and is not the current revised international sunspot-number series. Annual averages obscure monthly peaks; this is not a forecast of the next cycle.

## Source and preparation

NOAA historical solar series; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [sunspots provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/sunspots.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-sunspots-cycles.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; activity: historical annual sunspot number.
