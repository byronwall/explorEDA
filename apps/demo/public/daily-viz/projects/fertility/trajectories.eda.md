# Eleven of twelve countries converged on two children; Nigeria stayed at six

**How did fertility fall across twelve countries after 1960?** Each row is one country in one year, 1960 to 2011, with the total fertility rate: the births a woman would have at that year's age-specific rates. The twelve are Brazil, China, Egypt, France, Indonesia, India, Japan, Korea, Mexico, Nigeria, South Africa, and the United States. They start almost five births apart and, with one exception, end within two.

```eda
eda query=r
country:cat=r.country label="Country"
code:cat=r.code label="Code"
year:num=r.year label="Year"
fertility:num=r.fertility label="Births per woman"
decade:cat=r.decade label="Decade"
observed:num=r.observed label="Published"
calc level = fertility == null ? null : fertility < 2.1 ? "Below 2.1" : "2.1 or more"
```

## From 5.3 births to 2.4 in fifty years

Each path is one country. Across the twelve, the average rate was 5.3 births per woman in 1960. By 2011 it was 2.4. Korea's path is the steepest: it started above six and ended lowest, at 1.24 births per woman in 2011. Nigeria's path is the one that never bends. It rose to 6.8 in 1980 and was still at 6.0 births per woman in 2011.

```eda
scatter @nb-fertility-trajectories-chart-1 x=year y=fertility color=country title="Total fertility rate by country, 1960 to 2011" x.title="Year" y.title="Births per woman" where.observed=1 {
  connect.orderField=year connect.groupField=country connect.labels=end pointSize=2
  rule y=2.1 "Replacement level"
  callout "Nigeria peaked at 6.8 in 1980" on=r.country:Nigeria,r.year:1980 offset=-30,-28
}
```

## Every row fades except one

Each cell is a country's average rate over a decade. Read left to right, eleven rows pale from dark to light as rates fall. Nigeria's row stays dark across all six columns. Among the other eleven, the 2011 rates ran only from 1.24 in Korea to 2.85 in Egypt.

```eda
heatmap @nb-fertility-trajectories-chart-2 country columnField=decade aggregation=average measureField=fertility sortBy=label title="Average births per woman by country and decade"
```

## Below replacement, one country at a time

Each bar counts country-years in a decade, split at 2.1 births per woman, the rate that holds a population level. In the 1960s, 5.8% of country-years were below 2.1 births per woman, all of them Japan's. By the 2000s, 44.2% were. The 2010s column holds only 2010 and 2011.

```eda
bar @nb-fertility-trajectories-chart-3 decade seriesField=level seriesLayout=stacked color=level title="Country-years above and below replacement level, by decade" y.title="Country-years" where.observed=1
```

## Takeaway

Over half a century, eleven countries that started anywhere from two to seven births per woman converged on two. The exception is the one that matters most for the world's population: Nigeria, the largest of the twelve by births, ended the period where it began.

## Limits

Twelve countries chosen for contrast, not a sample of the world, and each counts once whatever its size. The total fertility rate is a period measure, not the completed family size of any real cohort. Values after 2011 are blank in this export.
