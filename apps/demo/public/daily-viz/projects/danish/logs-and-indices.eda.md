# Logs, levels, and rebased money in a historical Danish series

**Reader question.** Does the relationship between real money and real income persist after taking quarterly log changes?

**Population.** one Danish calendar quarter. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
period:cat=r.period label="Period"
lrm:num=r.lrm label="Lrm (log real money, source definition)"
lry:num=r.lry label="Lry (log real income, source definition)"
lpy:num=r.lpy label="Lpy (log price level)"
ibo:num=r.ibo label="Ibo (source rate fractions)"
ide:num=r.ide label="Ide (source rate fractions)"
year:num=r.year label="Year"
quarter:num=r.quarter label="Quarter"
date:date=r.date label="Calendar date"
money_index:num=r.money_index label="Money index (first quarter = 100)"
income_index:num=r.income_index label="Income index (first quarter = 100)"
dmoney:num=r.dmoney label="Dmoney (quarterly log change)"
dincome:num=r.dincome label="Dincome (quarterly log change)"
spread:num=r.spread label="Spread (source rate fractions)"
era:cat=r.era label="Era"
```

## 1. Rebase both series to the first supplied quarter

Exponentiating each log difference from its initial value yields a comparable starting index. It does not put the two original series into the same currency quantity.

```eda
line @nb-danish-logs-and-indices-chart-1 x=date y=money_index,income_index title="Rebase both series to the first supplied quarter" x.title="Calendar date" y.title="Money index (first quarter = 100) / Income index (first quarter = 100)"
```

## 2. The relationship in logged levels

Trending variables can share a strong levels association. Each point is a quarter in one connected historical sequence.

```eda
scatter @nb-danish-logs-and-indices-chart-2 x=lry y=lrm title="The relationship in logged levels" x.title="Lry (log real income, source definition)" y.title="Lrm (log real money, source definition)"
```

**Computed finding.** Logged real money and logged real income had correlation 0.868. This calculation uses 55 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-danish-logs-and-indices.json).

## 3. The relationship in quarterly log changes

Differencing removes the initial level and leaves the first quarter without a valid comparison. The result still needs time-series caution.

```eda
scatter @nb-danish-logs-and-indices-chart-3 x=dincome y=dmoney title="The relationship in quarterly log changes" x.title="Dincome (quarterly log change)" y.title="Dmoney (quarterly log change)"
```

## 4. Quarterly log changes in real money

A distribution view exposes asymmetry and extreme changes. It discards persistence and should be read alongside the time series.

```eda
hist @nb-danish-logs-and-indices-chart-4 dmoney bins=16 title="Quarterly log changes in real money" x.title="Dmoney (quarterly log change)" y.title="Source rows"
```

**Computed finding.** Their valid quarterly log changes had correlation 0.490. This calculation uses 54 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-danish-logs-and-indices.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-danish-logs-and-indices-records period,lrm,lry,money_index,income_index,dmoney,dincome title="Records behind this comparison"
```

## What the comparison supports

A close relationship in trending levels can look different after differencing. Present the transformation as a different analytical view rather than claiming it reveals the one correct relationship.

## Limits

These are source-defined logged economic series from a historical Danish model dataset. First differences do not remove all confounding or serial dependence. Indices describe changes, not absolute currency levels.

## Source and preparation

Johansen and Juselius; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [danish provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/danish.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-danish-logs-and-indices.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** lrm: log real money, source definition; lry: log real income, source definition; money_index: first quarter = 100; income_index: first quarter = 100; dmoney: quarterly log change; dincome: quarterly log change.
