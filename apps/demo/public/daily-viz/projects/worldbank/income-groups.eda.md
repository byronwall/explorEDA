# Most of the world's people live in middle-income countries

**How does the world's population divide by region and income group?** Each row is one economy in 2023, with its World Bank region and income classification.

```eda
eda query=latest
year:num=years.year label="Year"
name:cat=country.name label="Country"
region:cat=country.region label="Region"
income:cat=country.income label="Income group"
population:num=years.population label="Population"
```

## Region, then income group, then country

The tree nests each economy inside its income group inside its region, sized by its 2023 population. China and India alone fill a third of the area.

```eda
hierarchy @nb-worldbank-income-groups-1 title="2023 population by region, income group, and country" {
  levels=country.region,country.income,country.name aggregation=sum measureField=years.population arrangement=treemap
}
```

**Finding.** China and India together held 35.4% of the 2023 population of these 217 economies.

## Counting economies tells a different story

By count, high-income economies are the largest group: many of them are small. Weighting by people moves the world's center to the middle-income groups.

```eda
pivot @nb-worldbank-income-groups-2 title="Economies by region and income group, 2023" {
  rows=region columns=income
  value count(name) label=Economies
}
```

**Finding.** 86 of the 217 economies were classed as high income, 39.6% of the list.

## Takeaway

"Most countries" and "most people" are different populations. A chart that counts countries describes a world where high-income economies dominate; a chart weighted by population describes one centered on middle-income Asia.

## Limits

Income groups are the World Bank's current classification, applied to every year. Population is the UN estimate for mid-year.
