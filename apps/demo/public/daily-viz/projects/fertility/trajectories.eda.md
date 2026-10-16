# Twelve fertility trajectories, with the empty end years retained

**Reader question.** How do selected historical country paths differ without implying a world average?

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

## 1. Country-year observations with country colors

Unconnected points do not imply interpolation through null end years. Each country receives one point for each available annual value.

```eda
scatter @nb-fertility-trajectories-chart-1 x=year y=fertility color=country title="Country-year observations with country colors" x.title="Year" y.title="Fertility (births/woman)"
```

## 2. Country distributions across decades

These boxes mix countries and years and therefore answer a country-year question. They are not population-weighted distributions of people.

```eda
boxplot @nb-fertility-trajectories-chart-2 fertility color=decade title="Country distributions across decades" y.title="Fertility (births/woman)"
```

**Computed finding.** The unweighted mean across the selected countries in 1960 was 5.342 births per woman. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 3. Published rates across country and decade

The cell is an available-year mean within a country and decade. Different decade coverage must be checked before treating cells as equally supported.

```eda
heatmap @nb-fertility-trajectories-chart-3 country columnField=decade aggregation=average measureField=fertility title="Published rates across country and decade"
```

## 4. Rows retained for each country

The row counts include null-valued year cells. Equal retained counts do not mean equal numbers of measured values.

```eda
row @nb-fertility-trajectories-chart-4 country title="Rows retained for each country" x.title="Source rows"
```

**Computed finding.** The corresponding selected-country mean in 2011 was 2.377 births per woman. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-fertility-trajectories-records country,code,year,fertility title="Records behind this comparison"
```

## What the comparison supports

Keep trajectories separate and make the missing tail explicit. A pooled average would hide country paths and introduce an arbitrary weighting question that this selection cannot resolve globally.

## Limits

The countries are an illustrative fixed set, not a representative sample. Total fertility rate is a period measure, not completed lifetime births for a cohort. The supplied 2012 and 2013 columns contain no published values.

## Source and preparation

World Bank; UN Population Division and national statistical sources; historical statsmodels snapshot; Creative Commons Attribution 4.0 International. Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [fertility provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; fertility: period total fertility rate, births per woman.
