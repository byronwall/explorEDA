# An empty year column is not a fertility collapse

**Reader question.** What happens when a historical export contains year columns with no values?

**Population.** one selected country-year. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
country:cat=r.country label="Country"
code:cat=r.code label="Code"
year:num=r.year label="Year"
fertility:num=r.fertility label="Fertility (births/woman)"
decade:cat=r.decade label="Decade"
year_label:cat=r.year_label label="Year label"
coverage:cat=r.coverage label="Coverage"
observed:num=r.observed label="Observed (1 published; 0 missing)"
```

## 1. Recorded rates stop before the headers do

The axis can contain dates without measured points. Do not connect a null to zero or carry the previous observation forward without declaring an imputation model.

```eda
scatter @nb-fertility-empty-end-years-chart-1 x=year y=fertility color=country title="Recorded rates stop before the headers do" x.title="Year" y.title="Fertility (births/woman)"
```

## 2. Published and missing cells in each year

Count each selected country-year once and split the count by value availability. The missing segment records null source cells; it does not replace the missing rate with zero.

```eda
bar @nb-fertility-empty-end-years-chart-2 year_label seriesField=coverage seriesLayout=stacked color=coverage title="Published and missing cells in each year"
```

**Computed finding.** In the selected 2012 rows, the missing-value share was 100.0%. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 3. Published versus missing source values

Count the two availability categories across the entire fixed country-year grid. This makes the missing-rate denominator explicit without deleting the incomplete rows.

```eda
row @nb-fertility-empty-end-years-chart-3 coverage title="Published versus missing source values" x.title="Source rows"
```

## 4. Coverage by country and supplied year

Each cell has one selected country-year: one means a published rate and zero means a null rate. These are measurement-availability indicators, not imputed fertility values.

```eda
heatmap @nb-fertility-empty-end-years-chart-4 country columnField=year_label aggregation=average measureField=observed title="Coverage by country and supplied year"
```

**Computed finding.** In the selected 2011 rows, the missing-value share was 0.0%. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-fertility-empty-end-years-records country,code,year,fertility,decade title="Records behind this comparison"
```

## What the comparison supports

Data coverage is part of the result. Keeping blank end years prevents a chart from inventing a decline to zero or presenting a carried-forward value as a fresh observation.

## Limits

The supplied export is a historical snapshot. Empty values mean unavailable in this file, not zero births per woman and not necessarily unavailable from later source revisions. The country subset is illustrative.

## Source and preparation

World Bank; UN Population Division and national statistical sources; historical statsmodels snapshot; Creative Commons Attribution 4.0 International. Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [fertility provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; fertility: period total fertility rate, births per woman.
