# Pooled, inflation and unemployment look unrelated; each decade tells its own story

**Does the pooled historical association resemble the association within the 1970s?** Each row is one US calendar quarter.

```eda
eda query=r
unemp:num=r.unemp label="Unemployment (%)"
infl:num=r.infl label="Inflation (%)"
date:date=r.date label="Date"
decade:cat=r.decade label="Decade"
```

## 1. Color the pooled relationship by decade

Color preserves the calendar grouping inside the pooled cloud. The first source inflation value is a placeholder, so do not give that point the status of a measured change.

```eda
scatter @nb-macro-inflation-unemployment-chart-1 x=unemp y=infl color=decade opacity=0.6 title="Color the pooled relationship by decade" x.title="Unemployment (%)" y.title="Inflation (%)"
```

## 2. Inflation retains its time order

A time series reveals sequences that disappear in the scatter. Avoid treating successive quarters as independent draws.

```eda
line @nb-macro-inflation-unemployment-chart-2 x=date y=infl title="Inflation retains its time order" x.title="Date" y.title="Inflation (%)"
```

**Finding.** The pooled inflation–unemployment correlation, excluding the initial placeholder quarter, was 0.065.

## 3. Unemployment distributions within each decade

Changing group distributions can change a pooled relationship even when no single within-group slope is stable.

```eda
boxplot @nb-macro-inflation-unemployment-chart-3 unemp color=decade title="Unemployment distributions within each decade" y.title="Unemployment (%)"
```

## 4. Inflation thresholds by historical span

The cumulative view compares the entire distribution. It does not correct the small and unequal number of quarters in the boundary decades.

```eda
ecdf @nb-macro-inflation-unemployment-chart-4 infl color=decade direction=below title="Inflation thresholds by historical span" x.title="Inflation (%)"
```

**Finding.** Within the 1970s quarters, the correlation was -0.183.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-macro-inflation-unemployment-records date,infl,unemp,decade title="Records behind this comparison"
```

## Takeaway

A colored cloud is a starting point for checking mixtures, not a stable structural curve. Examine the time series and the grouped distributions before naming an economic mechanism.

## Limits

Time ordering, policy regimes, revisions, and omitted factors limit a pooled scatter. The source’s initial inflation placeholder is excluded from the pooled calculation. Correlation is not a policy trade-off or causal estimate.
