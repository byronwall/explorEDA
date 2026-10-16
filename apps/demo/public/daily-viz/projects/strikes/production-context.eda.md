# Strikes ran longer when production was below trend

**Do strikes last longer when industrial production is below trend?** Each row is one selected manufacturing strike.

```eda
eda query=r
duration:num=r.duration label="Duration (days)"
iprod:num=r.iprod label="Industrial production (detrended)"
sequence:num=r.sequence label="Sequence"
production_band:cat=r.production_band label="Production band"
```

## 1. Keep the continuous contextual variable

Inspect the actual indicator values before dividing them into two groups. A split can create an apparent discontinuity that the continuous cloud does not support.

```eda
scatter @nb-strikes-production-context-chart-1 x=iprod y=duration title="Keep the continuous contextual variable" x.title="Industrial production (detrended)" y.title="Duration (days)"
```

## 2. Duration distributions across the declared split

Median and spread make the contrast legible without assuming a normally distributed duration. Outlying events remain part of the sample.

```eda
boxplot @nb-strikes-production-context-chart-2 duration color=production_band title="Duration distributions across the declared split" y.title="Duration (days)"
```

**Finding.** Median duration at negative production deviations was 38.00 days.

## 3. How much do the groups overlap?

Cumulative curves show whether the contrast concerns the center, the tails, or both. They are conditional on the selected group sample.

```eda
ecdf @nb-strikes-production-context-chart-3 duration color=production_band direction=below title="How much do the groups overlap?" x.title="Duration (days)"
```

## 4. Count the events supporting each comparison

Unequal counts matter even when both groups occupy equal chart space. Counts do not by themselves quantify statistical uncertainty.

```eda
row @nb-strikes-production-context-chart-4 production_band title="Count the events supporting each comparison" x.title="Rows"
```

**Finding.** Median duration at nonnegative production deviations was 25.00 days.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-strikes-production-context-records sequence,iprod,production_band,duration title="Records behind this comparison"
```

## Takeaway

A group mean is only one part of the comparison. The overlap and sample support prevent a descriptive contrast from becoming an unsupported mechanism.

## Limits

The source production variable is contextual, not a randomized exposure. Its zero split is an analyst-defined comparison. The dataset cannot identify whether production conditions caused a strike to last longer.
