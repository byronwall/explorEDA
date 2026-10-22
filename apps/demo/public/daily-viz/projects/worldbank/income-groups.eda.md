# Most of the world's people live in middle-income countries

**How does the world's population divide by region and income group?** Each row is one economy in 2023, with its World Bank region and income classification.

```eda
eda query=latest
year:num=years.year label="Year"
name:cat=country.name label="Country"
region:cat=country.region label="Region"
income:cat=country.income label="Income group"
population:num=years.population label="Population"
pop_east_asia:num=pop_east_asia label="Population in East Asia & Pacific"
pop_middle:num=pop_middle label="Population in middle-income economies"
```

## Region, then income group, then country

The tree nests each economy inside its income group inside its region, sized by its 2023 population. China and India together held 35.4% of the 2023 population of these 217 economies, a third of the area. Middle-income economies held 73.7% of the people.

```eda
hierarchy @nb-worldbank-income-groups-1 title="2023 population by region, income group, and country" {
  levels=country.region,country.income,country.name aggregation=sum measureField=years.population arrangement=treemap
}
```

## Three regions hold two thirds of the people

Each bar is a region's 2023 population. East Asia and the Pacific alone held 29.4% of the world's 8 billion people, and with South Asia and Sub-Saharan Africa the top three regions pass two thirds. North America, with three economies, holds the least.

```eda
group @nb-worldbank-income-groups-population sum(population) by=region
row @nb-worldbank-income-groups-3 region group=nb-worldbank-income-groups-population title="Population by region, 2023" x.title="People"
```

## Counting economies tells a different story

By count, high-income economies are the largest group: 86 of the 217 economies were classed as high income, 39.6% of the list, but together they hold 17.2% of the people. Sub-Saharan Africa has 48 economies, more than any region but Europe and Central Asia, and a sixth of the people.

```eda
pivot @nb-worldbank-income-groups-2 title="Economies by region and income group, 2023" {
  rows=region columns=income
  value count(name) label=Economies
}
```

## Takeaway

"Most countries" and "most people" are different populations. A chart that counts countries describes a world where high-income economies dominate; a chart weighted by population describes one centered on middle-income Asia.

## Limits

Income groups are the World Bank's current classification, applied to every year. Population is the UN estimate for mid-year.
