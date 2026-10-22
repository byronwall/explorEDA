# Richer countries live longer, with diminishing returns

**How closely does a country's income track how long its people live?** Each row is one economy in one year, 2000 to 2023, joined to its region, its GDP per person, and its life expectancy at birth.

```eda
eda query=years
year:num=years.year label="Year"
name:cat=country.name label="Country"
region:cat=country.region label="Region"
income:cat=country.income label="Income group"
latitude:num=country.latitude label="Latitude"
longitude:num=country.longitude label="Longitude"
population:num=years.population label="Population"
gdp:num=gdp.log10_gdp_pc label="GDP per person (log₁₀ PPP $)"
gdp_dollars:num=gdp.gdp_pc label="GDP per person (PPP $)"
life:num=life.life_expectancy label="Life expectancy (years)"
```

## Where the world's people live

One dot per economy at its capital, sized by population and colored by region. The map shows every year at once; select a year in the next chart to narrow it.

```eda
map @nb-worldbank-wealth-and-health-1 color=region title="Economies at their capitals, sized by population" {
  latitudeField=latitude longitudeField=longitude sizeField=population labelField=name pointOpacity=0.6
}
```

## Income and lifespan rise together

Each dot is one economy in 2023, placed by GDP per person on a log scale and life expectancy. In 2023, log GDP per person and life expectancy had correlation 0.861, and the band of dots is straight only because the income axis is logarithmic: each step up in income adds fewer years than the last. Singapore, the richest at $130,297 per person, does not live longest; San Marino does, at 85.7 years among the economies with a GDP figure.

```eda
scatter @nb-worldbank-wealth-and-health-2 x=gdp y=life color=region title="Life expectancy and GDP per person, 2023" x.title="GDP per person (log₁₀ PPP $)" y.title="Life expectancy (years)" where.year=2023 where.gdp_dollars=0.. {
  callout "Singapore, richest" on=country.name:Singapore,years.year:2023 offset=-40,30
  callout "San Marino, longest-lived" on=country.name:"San Marino",years.year:2023 offset=-120,-20
  callout "Nigeria, shortest-lived" on=country.name:Nigeria,years.year:2023 offset=20,20
}
```

## Lifespans rose almost everywhere

Each box holds a region's economies across all 24 years. The mean economy's life expectancy was 67.6 years in 2000. By 2023, it was 73.8 years. The gain was largest where lifespans were shortest: Sub-Saharan Africa's mean economy went from 53.5 years in 2000 to 64.6 in 2023, while North America's went from 78.0 to 80.8.

```eda
boxplot @nb-worldbank-wealth-and-health-3 life color=region title="Life expectancy by region, 2000 to 2023" y.title="Life expectancy (years)"
```

## Takeaway

Income and lifespan are tightly linked across countries, but the payoff to income shrinks as countries get richer. Most of the six-year gain since 2000 came in lower-income regions.

## Limits

Each economy counts once, whatever its size, so these averages are not the average person's lifespan. Twenty economies have no 2023 GDP figure and drop out of that year's points.
