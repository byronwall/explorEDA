# Costa Rica outlives the United States on a third of the income

**Which economies live longer than their income predicts, and which fall short?** Each row is one of 197 economies in 2023, with GDP per person at purchasing-power parity, life expectancy at birth, population, and the World Bank's region and income group. Income predicts lifespan well across the whole range, and the exceptions are the interesting part: a handful of middle-income economies live like rich ones, and the richest large economy lives like a middle-income one.

```eda
eda query=economies
country:cat=economies.Country label="Economy"
region:cat=economies.Region label="Region"
income:cat=economies.Income label="Income group"
population:num=economies.Population label="Population"
millions:num=millions label="Population (millions)"
gdp:num="economies.GDP per capita" label="GDP per person (PPP $)"
life:num="economies.Life expectancy" label="Life expectancy (years)"
scale @groups field=economies.Income map="Low income":#c23b22,"Lower middle income":#e8a33d,"Upper middle income":#2a9d8f,"High income":#1f6fb2
```

## Each step up in income buys fewer years

On a log income axis the economies lie along one rising band. Doubling income from $2,000 to $4,000 is worth about four years; doubling it again from $40,000 to $80,000 is worth about one. Nigeria sits furthest below the band, at 54.5 years on $7,843 a person; the Solomon Islands sit furthest above it, at 70.5 years on $2,340.

```eda
scatter @nb-gapminder-income-and-years-1 x=gdp y=life color=income sizeField=millions colorScale=groups title="Life expectancy and GDP per person, 197 economies, 2023" x.title="GDP per person (PPP $, log scale)" y.title="Life expectancy (years)" x.scale=log opacity=0.7 {
  callout "Nigeria" on=economies.Country:Nigeria offset=20,30
  callout "Solomon Islands" on="economies.Country":"Solomon Islands" offset=-40,-40
  callout "United States" on="economies.Country":"United States" offset=20,40
  callout "Japan" on=economies.Country:Japan offset=-20,-30
}
```

## The income groups are a decade apart, then less

The median low-income economy's life expectancy was 63.6 years. The median lower-middle-income economy's was 67.5 years, the median upper-middle-income economy's 74.0 years, and the median high-income economy's 81.3 years. The gaps shrink from the bottom up: four years, then six and a half, then seven, on incomes that roughly triple at each step.

```eda
boxplot @nb-gapminder-income-and-years-2 life color=income colorScale=groups title="Life expectancy by World Bank income group, 2023" y.title="Life expectancy (years)"
```

## Reaching 75 is routine for rich economies and a coin flip below them

Read the curves at 75 years. 89.0% of high-income economies reached a life expectancy of 75 years; 41.4% of upper-middle-income economies did, and 6.5% of lower-middle-income economies. No low-income economy did.

```eda
ecdf @nb-gapminder-income-and-years-3 life color=income colorScale=groups direction=below title="Share of economies below each life expectancy, by income group" x.title="Life expectancy (years)" {
  rule x=75 "75 years"
}
```

## The United States is the rich outlier

Among economies with more than $20,000 a person, the United States stands apart: 78.4 years on $74,352 a person. Costa Rica reached 80.8 years on $26,379 and Chile 81.2 years on $29,600. Japan, with $47,387 a person, reached 84.0 years, the longest of any large economy. Below the band sit Guyana, at 70.2 years on $49,312, and Russia, at 73.2 years on $39,881.

```eda
scatter @nb-gapminder-income-and-years-4 x=gdp y=life color=income sizeField=millions colorScale=groups title="Economies above $20,000 a person, 2023" x.title="GDP per person (PPP $, log scale)" y.title="Life expectancy (years)" x.scale=log x.min=20000 y.min=68 opacity=0.7 where.gdp=20000.. {
  callout "United States" on="economies.Country":"United States" offset=30,40
  callout "Costa Rica" on="economies.Country":"Costa Rica" offset=-60,-30
  callout "Japan" on=economies.Country:Japan offset=-20,-30
  callout "Guyana" on=economies.Country:Guyana offset=20,20
}
```

## Takeaway

Income predicts lifespan, and the prediction gets weaker the richer an economy is. Past about $25,000 a person, how a country spends matters more than how much it has: Costa Rica and Chile reach eighty on a third of American income, and the United States reaches 78 on nearly three times theirs.

## Limits

One year, one row per economy, so Tuvalu counts as much as India in every median and share; weighting by people would move the world figure little, because the big economies sit near the band. Twenty economies without a 2023 figure, including Cuba, Venezuela, and Vietnam, are left out. GDP per person is a mean and says nothing about how income is shared.
