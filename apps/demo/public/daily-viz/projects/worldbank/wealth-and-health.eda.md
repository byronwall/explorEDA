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

Plot life expectancy against GDP per person on a log scale and the countries fall along one rising band. Each step up in income adds fewer years than the last: the curve is straight only because the income axis is logarithmic.

```eda
scatter @nb-worldbank-wealth-and-health-2 x=gdp y=life color=region title="Life expectancy and GDP per person, every country-year" x.title="GDP per person (log₁₀ PPP $)" y.title="Life expectancy (years)"
```

**Finding.** In 2023, log GDP per person and life expectancy had correlation 0.861.

## Lifespans rose almost everywhere

The world's average economy gained six years of life expectancy in 23 years. The box plot by region shows the gain was largest where lifespans were shortest: Sub-Saharan Africa gained eleven years, North America under three.

```eda
boxplot @nb-worldbank-wealth-and-health-3 life color=region title="Life expectancy by region, all years" y.title="Life expectancy (years)"
```

**Finding.** The mean economy's life expectancy was 67.6 years in 2000.

**Finding.** By 2023, it was 73.8 years.

## Takeaway

Income and lifespan are tightly linked across countries, but the payoff to income shrinks as countries get richer. Most of the six-year gain since 2000 came in lower-income regions.

## Limits

Each economy counts once, whatever its size, so these averages are not the average person's lifespan. Twenty economies have no 2023 GDP figure and drop out of that year's points.
