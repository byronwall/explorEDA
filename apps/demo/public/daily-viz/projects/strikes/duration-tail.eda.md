# A typical strike and a long strike tell different stories

**Reader question.** How far apart are the mean and median durations in this selected strike sample?

**Population.** one selected manufacturing strike. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
duration:num=r.duration label="Duration (days)"
iprod:num=r.iprod label="Iprod (source units; see dictionary)"
sequence:num=r.sequence label="Sequence"
production_band:cat=r.production_band label="Production band"
log_duration:num=r.log_duration label="Log duration (log10(days))"
```

## 1. Count durations on their original day scale

A day-scale histogram keeps the operational meaning of an extended dispute. Its binning can make the dense short-duration region difficult to inspect.

```eda
hist @nb-strikes-duration-tail-chart-1 duration bins=20 title="Count durations on their original day scale" x.title="Duration (days)" y.title="Source rows"
```

## 2. Read the share ending by a chosen duration

The cumulative view avoids bin choices but still describes only the observed sample. It is not a survival model for censored ongoing strikes.

```eda
ecdf @nb-strikes-duration-tail-chart-2 duration direction=below title="Read the share ending by a chosen duration" x.title="Duration (days)"
```

**Computed finding.** The mean recorded duration was 42.66 days. This calculation uses 62 eligible rows after the recorded filter and field-completeness rule.

## 3. A log transform spreads the shorter durations

The prepared log10 field changes the visual spacing, not the underlying durations. Equal horizontal distances now represent multiplicative ratios.

```eda
hist @nb-strikes-duration-tail-chart-3 log_duration bins=18 title="A log transform spreads the shorter durations" x.title="Log duration (log10(days))" y.title="Source rows"
```

## 4. Keep the longest events attached to source rows

Sequence is only the original record position. It locates records for inspection and must not be presented as chronological trend.

```eda
scatter @nb-strikes-duration-tail-chart-4 x=sequence y=duration title="Keep the longest events attached to source rows" x.title="Sequence" y.title="Duration (days)"
```

**Computed finding.** The median recorded duration was 27.00 days. This calculation uses 62 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-strikes-duration-tail-records sequence,duration,log_duration,iprod title="Records behind this comparison"
```

## What the comparison supports

The long tail makes the average sensitive to a small number of lengthy events. Report both the central summary and the tail rather than trimming inconvenient observations without disclosure.

## Limits

The sample contains selected manufacturing strikes, not all labor disputes. Durations describe completed recorded events and should not be interpreted as a forecast for a current dispute.

## Source and preparation

U.S. Bureau of Labor Statistics; Kennan; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [strikes provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** duration: days; iprod: source industrial-production deviation units; sequence: source row sequence; log_duration: log10(days).
