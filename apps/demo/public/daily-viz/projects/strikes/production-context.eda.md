# Production context and strike length: compare, do not explain away

**Reader question.** Do durations differ between negative and nonnegative source production deviations?

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

## 1. Keep the continuous contextual variable

Inspect the actual indicator values before dividing them into two groups. A split can create an apparent discontinuity that the continuous cloud does not support.

```eda
scatter @nb-strikes-production-context-chart-1 x=iprod y=duration title="Keep the continuous contextual variable" x.title="Iprod (source units; see dictionary)" y.title="Duration (days)"
```

## 2. Duration distributions across the declared split

Median and spread make the contrast legible without assuming a normally distributed duration. Outlying events remain part of the sample.

```eda
boxplot @nb-strikes-production-context-chart-2 duration color=production_band title="Duration distributions across the declared split" y.title="Duration (days)"
```

**Computed finding.** Median duration at negative production deviations was 38.00 days. This calculation uses 25 eligible rows after the recorded filter and field-completeness rule.

## 3. How much do the groups overlap?

Cumulative curves show whether the contrast concerns the center, the tails, or both. They are conditional on the selected group sample.

```eda
ecdf @nb-strikes-production-context-chart-3 duration color=production_band direction=below title="How much do the groups overlap?" x.title="Duration (days)"
```

## 4. Count the events supporting each comparison

Unequal counts matter even when both groups occupy equal chart space. Counts do not by themselves quantify statistical uncertainty.

```eda
row @nb-strikes-production-context-chart-4 production_band title="Count the events supporting each comparison" x.title="Source rows"
```

**Computed finding.** Median duration at nonnegative production deviations was 25.00 days. This calculation uses 37 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-strikes-production-context-records sequence,iprod,production_band,duration title="Records behind this comparison"
```

## What the comparison supports

A group mean is only one part of the comparison. The overlap and sample support prevent a descriptive contrast from becoming an unsupported mechanism.

## Limits

The source production variable is contextual, not a randomized exposure. Its zero split is an analyst-defined comparison. The dataset cannot identify whether production conditions caused a strike to last longer.

## Source and preparation

U.S. Bureau of Labor Statistics; Kennan; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [strikes provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** duration: days; iprod: source industrial-production deviation units; sequence: source row sequence.
