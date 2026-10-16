# An empty 2012 column is not a fertility collapse

**What happens to an average when the last year of an export is blank?** Each row is one selected country-year.

```eda
eda query=r
country:cat=r.country label="Country"
code:cat=r.code label="Code"
year:num=r.year label="Year"
fertility:num=r.fertility label="Fertility (births/woman)"
decade:cat=r.decade label="Decade"
year_label:cat=r.year_label label="Year (as a category)"
coverage:cat=r.coverage label="Coverage"
observed:num=r.observed label="Published (1) or missing (0)"
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

**Finding.** In the selected 2012 rows, the missing-value share was 100.0%.

## 3. Published versus missing source values

Count the two availability categories across the entire fixed country-year grid. This makes the missing-rate denominator explicit without deleting the incomplete rows.

```eda
row @nb-fertility-empty-end-years-chart-3 coverage title="Published versus missing source values" x.title="Rows"
```

## 4. Coverage by country and year

Each cell has one selected country-year: one means a published rate and zero means a null rate. These are measurement-availability indicators, not imputed fertility values.

```eda
heatmap @nb-fertility-empty-end-years-chart-4 country columnField=year_label aggregation=average measureField=observed title="Coverage by country and year"
```

**Finding.** In the selected 2011 rows, the missing-value share was 0.0%.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-fertility-empty-end-years-records country,code,year,fertility,decade title="Records behind this comparison"
```

## Takeaway

Data coverage is part of the result. Keeping blank end years prevents a chart from inventing a decline to zero or presenting a carried-forward value as a fresh observation.

## Limits

The export is a historical snapshot. Empty values mean unavailable in this file, not zero births per woman and not necessarily unavailable from later source revisions. The country subset is illustrative.
