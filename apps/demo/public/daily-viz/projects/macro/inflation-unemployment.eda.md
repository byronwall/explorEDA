# One inflation–unemployment scatter hides different decades

**Reader question.** Does the pooled historical association resemble the association within the 1970s?

**Population.** one US calendar quarter. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
year:num=r.year label="Year"
quarter:num=r.quarter label="Quarter"
realgdp:num=r.realgdp label="Realgdp (billions, chained 2005 US$)"
realcons:num=r.realcons label="Realcons (billions, chained 2005 US$)"
realinv:num=r.realinv label="Realinv (billions, chained 2005 US$)"
realgovt:num=r.realgovt label="Realgovt (billions, chained 2005 US$)"
realdpi:num=r.realdpi label="Realdpi (billions, chained 2005 US$)"
cpi:num=r.cpi label="Cpi (CPI index)"
m1:num=r.m1 label="M1 (billions of nominal US dollars)"
tbilrate:num=r.tbilrate label="Tbilrate (%)"
unemp:num=r.unemp label="Unemp (%)"
pop:num=r.pop label="Pop (millions of people)"
infl:num=r.infl label="Infl (%)"
realint:num=r.realint label="Realint (%)"
date:date=r.date label="Calendar date"
decade:cat=r.decade label="Decade"
gdp_growth:num=r.gdp_growth label="Gdp growth (%)"
consumption_share:num=r.consumption_share label="Consumption share (%)"
gdp_change:num=r.gdp_change label="Gdp change (billions, chained 2005 US$)"
unemp_change:num=r.unemp_change label="Unemp change (percentage points)"
```

## 1. Color the pooled relationship by decade

Color preserves the calendar grouping inside the pooled cloud. The first source inflation value is a placeholder, so do not give that point the status of a measured change.

```eda
scatter @nb-macro-inflation-unemployment-chart-1 x=unemp y=infl color=decade opacity=0.6 title="Color the pooled relationship by decade" x.title="Unemp (%)" y.title="Infl (%)"
```

## 2. Inflation retains its time order

A time series reveals sequences that disappear in the scatter. Avoid treating successive quarters as independent draws.

```eda
line @nb-macro-inflation-unemployment-chart-2 x=date y=infl title="Inflation retains its time order" x.title="Calendar date" y.title="Infl (%)"
```

**Computed finding.** The pooled inflation–unemployment correlation, excluding the initial placeholder quarter, was 0.065. This calculation uses 202 eligible rows after the recorded filter and field-completeness rule.

## 3. Unemployment distributions within each decade

Changing group distributions can change a pooled relationship even when no single within-group slope is stable.

```eda
boxplot @nb-macro-inflation-unemployment-chart-3 unemp color=decade title="Unemployment distributions within each decade" y.title="Unemp (%)"
```

## 4. Inflation thresholds by historical span

The cumulative view compares the entire distribution. It does not correct the small and unequal number of quarters in the boundary decades.

```eda
ecdf @nb-macro-inflation-unemployment-chart-4 infl color=decade direction=below title="Inflation thresholds by historical span" x.title="Infl (%)"
```

**Computed finding.** Within the supplied 1970s quarters, the correlation was -0.183. This calculation uses 40 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-macro-inflation-unemployment-records date,infl,unemp,decade title="Records behind this comparison"
```

## What the comparison supports

A colored cloud is a starting point for checking mixtures, not a stable structural curve. Examine the time series and the grouped distributions before naming an economic mechanism.

## Limits

Time ordering, policy regimes, revisions, and omitted factors limit a pooled scatter. The source’s initial inflation placeholder is excluded from the pooled calculation. Correlation is not a policy trade-off or causal estimate.

## Source and preparation

U.S. public statistical sources; curated in statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [macro provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** unemp: unemployment rate, %; infl: source annualized inflation, %.
