# Twelve fertility trajectories, with the empty end years retained

**How do selected historical country paths differ without implying a world average?** Each row is one selected country-year.

```eda
eda query=r
country:cat=r.country label="Country"
code:cat=r.code label="Code"
year:num=r.year label="Year"
fertility:num=r.fertility label="Fertility (births/woman)"
decade:cat=r.decade label="Decade"
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

**Finding.** The unweighted mean across the selected countries in 1960 was 5.342 births per woman.

## 3. Published rates across country and decade

The cell is an available-year mean within a country and decade. Different decade coverage must be checked before treating cells as equally supported.

```eda
heatmap @nb-fertility-trajectories-chart-3 country columnField=decade aggregation=average measureField=fertility title="Published rates across country and decade"
```

## 4. Rows retained for each country

The row counts include null-valued year cells. Equal retained counts do not mean equal numbers of measured values.

```eda
row @nb-fertility-trajectories-chart-4 country title="Rows retained for each country" x.title="Rows"
```

**Finding.** The corresponding selected-country mean in 2011 was 2.377 births per woman.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-fertility-trajectories-records country,code,year,fertility title="Records behind this comparison"
```

## Takeaway

Keep trajectories separate and make the missing tail explicit. A pooled average would hide country paths and introduce an arbitrary weighting question that this selection cannot resolve globally.

## Limits

The countries are an illustrative fixed set, not a representative sample. Total fertility rate is a period measure, not completed lifetime births for a cohort. The 2012 and 2013 columns contain no published values.
