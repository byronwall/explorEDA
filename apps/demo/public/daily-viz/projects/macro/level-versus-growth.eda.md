# A rising GDP level can conceal falling quarterly growth

**Reader question.** What changes when a historical GDP level becomes an annualized quarter-to-quarter growth rate?

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

## 1. GDP in the source’s chained-dollar level

The level retains scale and historical size. A large vertical range can make short contractions visually subtle.

```eda
line @nb-macro-level-versus-growth-chart-1 x=date y=realgdp title="GDP in the source’s chained-dollar level" x.title="Calendar date" y.title="Realgdp (billions, chained 2005 US$)"
```

## 2. Annualized quarterly growth on a zero reference

Growth is computed from adjacent quarters using a compounded annualization. The zero line separates positive from negative changes without inventing recession classifications.

```eda
line @nb-macro-level-versus-growth-chart-2 x=date y=gdp_growth title="Annualized quarterly growth on a zero reference" x.title="Calendar date" y.title="Gdp growth (%)" {
  rule y=0 "No quarterly change"
}
```

**Computed finding.** The smallest derived annualized quarterly GDP growth rate was -7.95%. This calculation uses 202 eligible rows after the recorded filter and field-completeness rule.

## 3. The distribution of quarterly growth rates

The histogram counts available quarter-to-quarter comparisons. It loses chronology, so a cluster of negative observations cannot be located from this view alone.

```eda
hist @nb-macro-level-versus-growth-chart-3 gdp_growth bins=24 title="The distribution of quarterly growth rates" x.title="Gdp growth (%)" y.title="Source rows"
```

## 4. GDP change and unemployment change

These are two first differences from the same quarterly sequence. Association is descriptive and does not identify a structural labor-market response.

```eda
scatter @nb-macro-level-versus-growth-chart-4 x=gdp_change y=unemp_change title="GDP change and unemployment change" x.title="Gdp change (billions, chained 2005 US$)" y.title="Unemp change (percentage points)"
```

**Computed finding.** The largest derived annualized quarterly GDP growth rate was 16.69%. This calculation uses 202 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-macro-level-versus-growth-records date,realgdp,gdp_change,gdp_growth,unemp_change title="Records behind this comparison"
```

## What the comparison supports

Levels answer how large the measured economy was in the source’s chained dollars. Growth rates answer how rapidly it changed between adjacent supplied quarters. Neither should silently replace the other.

## Limits

This is an old source vintage, not current revised GDP. Annualizing a quarterly change is a mathematical convention, not the year-on-year rate. The first supplied quarter has no preceding observation in this file.

## Source and preparation

U.S. public statistical sources; curated in statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [macro provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** realgdp: billions of chained 2005 US dollars (source vintage); gdp_growth: annualized quarter-on-quarter %; gdp_change: billions of chained 2005 US dollars (source vintage); unemp_change: percentage points.
