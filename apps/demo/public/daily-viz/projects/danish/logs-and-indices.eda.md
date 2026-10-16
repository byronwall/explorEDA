# Logs, levels, and rebased money in a historical Danish series

**Does the relationship between real money and real income persist after taking quarterly log changes?** Each row is one Danish calendar quarter.

```eda
eda query=r
period:cat=r.period label="Period"
lrm:num=r.lrm label="Log real money"
lry:num=r.lry label="Log real income"
quarter:num=r.quarter label="Quarter"
date:date=r.date label="Date"
money_index:num=r.money_index label="Money index (first quarter = 100)"
income_index:num=r.income_index label="Income index (first quarter = 100)"
dmoney:num=r.dmoney label="Money growth (log change)"
dincome:num=r.dincome label="Income growth (log change)"
```

## 1. Rebase both series to the first quarter

Exponentiating each log difference from its initial value yields a comparable starting index. It does not put the two original series into the same currency quantity.

```eda
line @nb-danish-logs-and-indices-chart-1 x=date y=money_index,income_index title="Rebase both series to the first quarter" x.title="Date" y.title="Money index (first quarter = 100) / Income index (first quarter = 100)"
```

## 2. The relationship in logged levels

Trending variables can share a strong levels association. Each point is a quarter in one connected historical sequence.

```eda
scatter @nb-danish-logs-and-indices-chart-2 x=lry y=lrm title="The relationship in logged levels" x.title="Log real income" y.title="Log real money"
```

**Finding.** Logged real money and logged real income had correlation 0.868.

## 3. The relationship in quarterly log changes

Differencing removes the initial level and leaves the first quarter without a valid comparison. The result still needs time-series caution.

```eda
scatter @nb-danish-logs-and-indices-chart-3 x=dincome y=dmoney title="The relationship in quarterly log changes" x.title="Income growth (log change)" y.title="Money growth (log change)"
```

## 4. Quarterly log changes in real money

A distribution view exposes asymmetry and extreme changes. It discards persistence and should be read alongside the time series.

```eda
hist @nb-danish-logs-and-indices-chart-4 dmoney bins=16 title="Quarterly log changes in real money" x.title="Money growth (log change)" y.title="Rows"
```

**Finding.** Their valid quarterly log changes had correlation 0.490.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-danish-logs-and-indices-records period,lrm,lry,money_index,income_index,dmoney,dincome title="Records behind this comparison"
```

## Takeaway

A close relationship in trending levels can look different after differencing. Present the transformation as a different analytical view rather than claiming it reveals the one correct relationship.

## Limits

These are source-defined logged economic series from a historical Danish model dataset. First differences do not remove all confounding or serial dependence. Indices describe changes, not absolute currency levels.
