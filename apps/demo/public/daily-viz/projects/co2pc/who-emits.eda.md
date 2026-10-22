# Ten countries emit 71% of the world's CO₂; the ten highest per person emit 3%

**Who emits the carbon: the biggest countries, or the people who burn the most each?** Each row is one of 203 economies in 2020, with its tonnes of carbon dioxide per person, its population, and the World Bank's region and income group. Multiplying the two gives each economy's total, and the two rankings that follow, by total and by person, name almost entirely different countries.

```eda
eda query=co2
economy:cat=co2.Economy label="Economy"
region:cat=co2.Region label="Region"
income:cat=income_order label="Income group"
co2:num="co2.CO2 per person" label="CO₂ per person (t)"
population:num=co2.Population label="Population"
millions:num=millions label="Population (millions)"
megatonnes:num=megatonnes label="CO₂ (million tonnes)"
scale @groups field=income_order map="Low income":#c23b22,"Lower-middle income":#e8a33d,"Upper-middle income":#2a9d8f,"High income":#1f6fb2
group @bytons sum(megatonnes) by=economy
group @bypp average(co2) by=economy
```

## Half the world's CO₂ comes from upper-middle-income countries

Each tile is one economy, sized by its total emissions and grouped by income. Upper-middle-income economies, China first among them, emitted 50.5% of the world's CO₂ in 2020 while holding 38.7% of its people. High-income economies emitted 38.3% with 17.5% of people. Lower-middle-income economies emitted 10.6% with 35.3% of people, and low-income economies 0.6% with 8.5%.

```eda
hierarchy @nb-co2pc-who-emits-1 levels=income_order,co2.Economy measureField=megatonnes aggregation=sum title="CO₂ emissions by income group and economy, 2020 (million tonnes)"
```

## The biggest emitters are big countries; the heaviest emitters are small ones

The ten largest emitters produced 71.0% of the world's CO₂, led by China with 34.3% and the United States with 12.8%. The ten highest per-person emitters are Gulf states and islands; Qatar, the highest with a population over a million, emitted 41.3 tonnes a person, 24 times India's 1.68 tonnes. Only Saudi Arabia appears in both lists.

```eda
row @nb-co2pc-who-emits-2 economy group=bytons topN=10 title="The ten largest emitters, 2020 (million tonnes of CO₂)" x.title="CO₂ (million tonnes)"
```

```eda
row @nb-co2pc-who-emits-3 economy group=bypp topN=10 title="The ten highest emitters per person, 2020 (tonnes)" x.title="CO₂ per person (t)"
```

## Above ten tonnes a person: 9% of people, 27% of emissions

The threshold view puts the two rankings together. The 19 economies above 10 tonnes a person held 8.7% of the world's people and emitted 26.5% of its CO₂. The 63 economies below 1 tonne a person held 21.6% of people and emitted 2.3%. The population-weighted average high-income economy emitted 9.77 tonnes a person; the average low-income economy emitted 0.33 tonnes.

```eda
scatter @nb-co2pc-who-emits-4 x=millions y=co2 color=income colorScale=groups sizeField=megatonnes title="CO₂ per person against population, log scales, 2020" x.title="Population (millions, log scale)" y.title="CO₂ per person (t)" x.scale=log y.scale=log opacity=0.7 where.co2=0.01.. {
  rule y=10 "10 tonnes a person"
  rule y=1 "1 tonne a person"
  callout "China" on=co2.Economy:China offset=-30,-40
  callout "United States" on="co2.Economy":"United States" offset=-20,-40
  callout "India" on=co2.Economy:India offset=10,40
  callout "Qatar" on=co2.Economy:Qatar offset=20,-20
}
```

## Takeaway

Where the carbon comes from depends on the question. By country, ten big economies make seven tenths of it and China alone a third. By person, the heaviest emitters are small, rich, and oil-producing, and together they barely register. Cutting the big totals is a problem for a dozen governments; cutting the per-person figure is a problem for the rich everywhere.

## Limits

One year, 2020, when the pandemic cut emissions unevenly. The measure excludes land use change and counts emissions where fuel is burned, not where goods are consumed, so exporters read high and importers low. Totals here are per-person figures multiplied by population and round the same way. Two economies that reported zero, Nauru and Tuvalu, cannot sit on the log scale and are left off the last chart.
