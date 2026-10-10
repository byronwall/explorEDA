# Demo datasets

Each dataset tests a different exploration task. Keep this set small. Do not use large random files as the default welcome experience.

## Palmer Penguins

- File: `palmer-penguins.csv`
- Size: 344 rows and 8 fields
- Use: mixed numbers and categories, small groups, and visible relationships
- Source: [palmerpenguins](https://allisonhorst.github.io/palmerpenguins/)
- License: [CC0](https://allisonhorst.github.io/palmerpenguins/LICENSE.html)

## Wine Quality (red)

- File: `wine-quality-red.csv`
- Size: 1,599 rows and 12 fields
- Use: numeric distributions, correlations, outliers, and a discrete quality result
- Source: [UCI Wine Quality](https://archive.ics.uci.edu/dataset/186/wine+quality)
- License: CC BY 4.0
- Citation: Cortez, Cerdeira, Almeida, Matos, and Reis, 2009. DOI: 10.24432/C56S3T.

The source file uses a semicolon delimiter. The current CSV parser detects it automatically.

## Shop Operations

- File: `shop-operations.csv`
- Size: 500 rows and 15 fields
- Use: dates, categories, booleans, nulls, skew, seasonality, and clear outliers
- Generation: fixed seed in `apps/data-samples/sample_data.ts`

The fixture contains these fields:

- order date, region, channel, category, product, and customer segment
- units, unit price, discount, revenue, cost, and margin
- fulfilled, returned, and delivery days

Dates repeat through 2024 for visible seasonality. Units use a right-skewed distribution with two large orders. Discount and delivery days include blank values for null handling.

## Shop Operations: 10,000 rows

- File: `shop-10000.csv`
- Size: 10,000 rows and 16 fields
- Demo: `?example=shop-10000`
- Layout: 15 panels, including one line panel with four regional facets
- Use: formula edits, linked filters, local reset, table export, and shared facet domains

This sample uses the same fixed-seed generator as Shop Operations. It adds the numeric `Order` sequence. The data is synthetic.

Generate the file from the repository root:

```sh
pnpm --filter data-samples exec node --experimental-strip-types sample_data.ts --type shop_operations --size medium --output /tmp/exploreda-10000
cp /tmp/exploreda-10000/shop-operations.csv apps/demo/public/datasets/shop-10000.csv
```

This is a representative workflow fixture, not a maximum-capacity claim.

## January 2013 flights

- Folder: `flights/`, with `manifest.json` for sources, checksums, counts, and key audits
- Tables: `flights.csv` (27,004 flights), `airlines.csv` (16), `planes.csv` (3,322), and `weather.csv` (2,226 origin-hours)
- Demo: `/examples/january-flights`
- Use: related tables, lookups with unmatched keys, delay bands, weather per scheduled hour, and fleet profiles
- Source: [nycflights13](https://nycflights13.tidyverse.org/) 1.0.2, pinned by checksum
- License: CC0. Flights come from the Bureau of Transportation Statistics, aircraft from the FAA, and weather from the Iowa Environmental Mesonet.

Every January record is kept, including flights with no departure or arrival time. `flight_id` comes from the row position in the full package table. `weather_key` joins a flight to its origin's weather in the scheduled hour. The package's airports table is left out because its OpenFlights source has separate terms.

Regenerate the tables, the manifest, and the findings module the analysis quotes:

```sh
node --experimental-strip-types apps/data-samples/prepare/flights.ts
```

The script downloads the package once into `tmp/data-cache`.

## Beijing air quality, 2016

- Folder: `beijing/`, with `manifest.json` for the archive checksum, station files, counts, and audits
- Tables: `station-days.csv` (4,392 rows, 12 stations × 366 days), `stations.csv` (12), and `reference-days.csv` (366)
- Demo: `/examples/beijing-air`
- Use: coverage before comparison, calendar summaries, seasonal fits, densities, and six-pollutant profiles
- Source: [UCI Beijing Multi-Site Air Quality](https://archive.ics.uci.edu/dataset/501/beijing+multi+site+air+quality+data)
- License: CC BY 4.0
- Citation: Chen, S. (2017). DOI: 10.24432/C5RK5G. Air quality from the Beijing Municipal Environmental Monitoring Center.

Each daily mean uses the station's hourly readings and needs at least 20 valid hours of 24; otherwise it is empty. Calendar components are the publisher's labels, not UTC instants. Rain is left out because its interval is not documented. The reference table repeats Aotizhongxin, the first station by name, so each day can be compared with the same date there.

```sh
node --experimental-strip-types apps/data-samples/prepare/beijing.ts
```

## World Development Indicators, 2000–2023

- Folder: `worldbank/`, with `manifest.json` for API URLs, response checksums, the data vintage, counts, and audits
- Tables: `country-years.csv` (5,208 population records for 217 economies), `gdp.csv`, `life-expectancy.csv`, `electricity.csv`, `countries.csv` (217), and `endpoints.csv` (217)
- Demo: `/examples/world-development`
- Use: indicator lookups on a shared country-year key, matched endpoint cohorts, a point map at capitals, and weighted against unweighted totals
- Source: [World Bank World Development Indicators](https://data.worldbank.org/) through the public API, vintage 2026-07-13
- License: CC BY 4.0. Population and life expectancy come from the UN Population Division, GDP per capita (PPP, constant 2021 $) from the International Comparison Program, and electricity access from the World Bank.

Aggregate economies are excluded through country metadata. Indicator tables hold one row per country-year with a published value; a missing row means no value was published. Regions and income groups are current classifications, not historical ones. The endpoint table keeps electricity access in 2000 and 2023 only when both years have a value.

```sh
node --experimental-strip-types apps/data-samples/prepare/worldbank.ts
```

The API is live. The first run caches its responses in `tmp/data-cache/worldbank`; delete them to take a new vintage.

## Earthquakes of magnitude 4.5 or more, 2023

- Folder: `earthquakes/`, with `manifest.json` for the query, retrieval time, checksum, counts, and audits
- Table: `events.csv` (7,643 events, one row per catalogue event)
- Demo: `/examples/earthquakes-2023`
- Use: a point map, daily and weekly counts, hexagon bins, distributions within one magnitude type, and field completeness
- Source: [USGS ANSS ComCat](https://earthquake.usgs.gov/data/comcat/) query `starttime=2023-01-01&endtime=2024-01-01&minmagnitude=4.5&eventtype=earthquake`
- License: public domain (U.S. Geological Survey)

The query's end time is inclusive, so the script keeps only events before 2024-01-01. Depth bands at 70 and 300 km are analyst-defined. `metadata_present` counts how many of eight measurement fields hold a number. The table is a single source on purpose: each row is already one event.

```sh
node --experimental-strip-types apps/data-samples/prepare/earthquakes.ts
```

The catalogue revises events. The first run caches the response in `tmp/data-cache`; delete it to take a new revision.

## Message log

- File: `message-log.csv`
- Size: 10,376 rows and 5 fields
- Demo: `?example=message-log`
- Use: authoring a composition from a blank artboard, such as monthly strips repeated for each correspondent
- Generation: fixed seed in `apps/data-samples/message_log.ts`

Twelve fictional correspondents exchange messages with one mailbox from 2019 through 2024. Each has an active span and a few busy months. The data is synthetic.

```sh
node --experimental-strip-types apps/data-samples/message_log.ts apps/demo/public/datasets/message-log.csv
```

## Driving shifts into reverse

- File: `driving.csv`
- Size: 55 rows and 4 fields
- Demo: `?example=driving-shifts`
- Use: a composition with numeric x and y scales, a path through the years, points, a calculated guide, and callouts anchored to chosen years
- Source: [vega-datasets](https://github.com/vega/vega-datasets) `driving.json`, which recreates Hannah Fairfield's "Driving Shifts Into Reverse" (The New York Times, 2010). Miles are driven per person each year; gas is the inflation-adjusted price of a gallon.
- License: BSD-3-Clause (vega-datasets). The graphic's design belongs to The New York Times; only the figures are reused.

Rows are written in a shuffled order on purpose: the composition orders its path by `Year`, not by file order. `Label side` is the recreation's hint for where each year's label sits; the demo does not use it.

```sh
node --experimental-strip-types apps/data-samples/prepare/driving.ts
```

## Big-tech opening prices

- File: `big-tech-prices.csv`
- Size: 9,030 rows and 5 fields
- Demo: `?example=tech-sparklines`
- Use: a sparkline table composition, one row per company, ordered by each company's first-to-last change with its lowest, highest, and latest prices marked
- Source: [TidyTuesday 2023-02-07](https://github.com/rfordatascience/tidytuesday/tree/master/data/2023/2023-02-07), big tech stock prices from Yahoo Finance via Kaggle. Opening prices from January 2010 to January 2023 for 14 companies.
- License: the TidyTuesday repository is CC0; the underlying prices carry no separate license statement.

Every fifth trading day is kept, plus each company's first and last day, so a first-to-last change matches the daily series. `Observation` numbers the kept rows within each company in date order; the composition spaces points by it, so companies with shorter histories still fill their row, as the source sparklines do. Company names drop their corporate suffixes.

```sh
node --experimental-strip-types apps/data-samples/prepare/big-tech.ts
```

## Forecast fan

- File: `inflation-fan.csv`
- Size: 104 rows and 13 fields
- Demo: `?example=forecast-fan`
- Use: a fan chart composition from supplied intervals, with nested bands, a central path, a shaded projection period, and a horizontal target guide
- Generation: fixed seed in `apps/data-samples/inflation_fan.ts`

Two illustrative measures, quarterly from 2015 Q1 to 2027 Q4. History rows carry a central value only; projection rows add eight percentiles (P10 to P90, around the central path) that widen with the horizon. The intervals are supplied, not modeled, and the figures are synthetic: the editor renders bands, it does not forecast. `Year` is the quarter as a fraction of a year, for a numeric scale.

```sh
node --experimental-strip-types apps/data-samples/inflation_fan.ts apps/demo/public/datasets/inflation-fan.csv
```

## Time-use diary

- File: `time-use.csv`
- Size: 5,742 rows and 6 fields
- Demo: `?example=time-use`
- Use: a grid composition that summarizes minutes per day for 2019 and 2020 cohorts inside each activity, with medians, quartile bands, and a diverging color for the change in median
- Generation: fixed seed in `apps/data-samples/time_use.ts`

Four hundred respondents per year record minutes spent on twelve activities. A respondent who skips an activity that day has no row for it, not a zero. The 2020 shifts follow the familiar pandemic pattern. The figures are synthetic and unweighted; the composition's quartiles are not survey estimates.

```sh
node --experimental-strip-types apps/data-samples/time_use.ts apps/demo/public/datasets/time-use.csv
```

## Deaths and media coverage, 2023

- File: `media-deaths.csv`
- Size: 60 rows and 5 fields
- Demo: `?example=media-deaths`
- Use: a normalized-stack composition, one column per source, with each cause's share of that source's total and an explainable denominator
- Source: Our World in Data, [What Americans die from and the causes of death the US media reports on](https://ourworldindata.org/), analysis package `media-deaths-analysis-data.zip`. Deaths from the CDC; article counts from Media Cloud for The New York Times, The Washington Post, and Fox News.
- License: CC BY (Our World in Data)

Fifteen causes: the CDC's twelve most common leading causes plus drug overdoses and homicides, and terrorism from the Global Terrorism Index. The package's accident count excludes drug overdoses so they are not counted twice, and an article counts only when it mentions a cause several times. Each column's denominator is its source's total over these fifteen causes, not all deaths or all articles.

```sh
node --experimental-strip-types apps/data-samples/prepare/media-deaths.ts
```

## Measles, 1928–2012

- File: `measles.csv`
- Size: 4,335 rows and 6 fields
- Demo: `?example=measles`
- Use: a strip composition with 51 state rows in the publisher's order, a placed multistop color ramp, explicit missing cells, and a fixed vaccine guide
- Source: The Wall Street Journal, [Battling Infectious Diseases in the 20th Century: The Impact of Vaccines](https://graphics.wsj.com/infectious-diseases-and-vaccines/) (Tynan DeBold and Dov Friedman, 2015), `data/datum.json` and the page script's state order. The incidence figures come from Project Tycho and the CDC; the 2003–2012 values are CDC annual confirmed cases, where earlier years are weekly provisional counts.
- License: the figures are public health statistics from Project Tycho (CC BY) and the CDC. The graphic's design belongs to Dow Jones; only the published numbers are reused, with credit.

The file is the complete 51 × 85 grid: 3,841 reported rates per 100,000 people, 493 cells the publisher marked not available, and one cell (Alaska, 2003) the publisher has no record for. `Status` names which. `Order` is the publisher's row index, which sorts states by postal code. The vaccine was introduced in 1963.

```sh
node --experimental-strip-types apps/data-samples/prepare/measles.ts
```

## Causes of death by age

- File: `causes-by-age.csv`
- Size: 909 rows and 3 fields
- Demo: `?example=causes-by-age`
- Use: a stacked-area composition across age, each cause's share of that age's total, with labels where each band is thickest
- Generation: fixed seed in `apps/data-samples/causes_by_age.ts`

Nine causes by single year of age from 0 to 100. Each cause follows a plausible age profile with a little noise. The counts are synthetic and claim nothing about any population; the composition's shares are what the editor computes from them.

```sh
node --experimental-strip-types apps/data-samples/causes_by_age.ts apps/demo/public/datasets/causes-by-age.csv
```

## Consumer confidence, 2018–2022

- File: `consumer-confidence.csv`
- Size: 467 rows and 3 fields
- Demo: `?example=consumer-confidence`
- Use: a small-multiples composition where every panel draws all nine countries and lights up its own, with a shared index scale and a 100 reference line
- Source: OECD consumer confidence indicator, as prepared for the [R Graph Gallery](https://r-graph-gallery.com/) recreation of an Economist-style grid (`dataConsumerConfidence.csv`). Monthly, July 2018 to October 2022.
- License: the gallery's data file carries no separate license statement; the indicator is OECD data.

Written long from the gallery's wide table: one row per country and month, dropping months without a value (China ends in September 2022). `Month` is the first day of the month.

```sh
node --experimental-strip-types apps/data-samples/prepare/consumer-confidence.ts
```

## What makes life meaningful, by party

- File: `pew-meaning.csv`
- Size: 14 rows and 4 fields
- Demo: `?example=pew-meaning`
- Use: a dumbbell composition, one topic per row, with the two parties' shares as colored dots on a shared scale, a connector, and the signed gap beside each row
- Source: Pew Research Center, "What makes life meaningful? Views from 17 advanced economies" (November 2021), chart "Republicans and Democrats in the U.S. differ over some factors that make life meaningful", as transcribed in the R Graph Gallery's dumbbell recreation. Shares of each party's respondents who mentioned the topic.
- License: Pew Research Center data is free to use with attribution.

`Order` is the published chart's row order.

```sh
node --experimental-strip-types apps/data-samples/pew_meaning.ts apps/demo/public/datasets/pew-meaning.csv
```

## Income and life expectancy, 2023

- File: `gapminder-2023.csv`
- Size: 197 rows and 7 fields
- Demo: `?example=income-life`
- Use: an annotated scatter composition on a log income scale, points sized by population and colored by region, with a legend and labels for chosen economies
- Source: the World Development Indicators tables already in `worldbank/`, joined for 2023 by `prepare/gapminder.ts`. See the World Bank entry above for sources, vintage, and license (CC BY 4.0).

One row per economy with a 2023 population, GDP per capita (PPP, constant 2021 $), and life expectancy. Economies missing any of the three are left out.

```sh
node --experimental-strip-types apps/data-samples/prepare/gapminder.ts
```

## Covid case rates by state, weekly

- File: `covid-tiles.csv`
- Size: 8,109 rows and 5 fields
- Demo: `?example=covid-tiles`
- Use: a tile-grid map composition, one small case-rate path per state at its place on a US tile grid, with the latest value labeled
- Source: The New York Times, [coronavirus (Covid-19) data in the United States](https://github.com/nytimes/covid-19-data), `rolling-averages/us-states.csv`: seven-day average new cases per 100,000 people.
- License: Creative Commons Attribution-NonCommercial 4.0, with credit to The New York Times.

Every seventh day from March 2020 to the series' end in March 2023, for the 50 states and D.C. `Tile` is each state's row and column on the common 8 × 11 tile grid, counted from the top left.

```sh
node --experimental-strip-types apps/data-samples/prepare/covid-tiles.ts
```

## Covid case rates, six states and the nation

- File: `covid-compare.csv`
- Size: 1,119 rows and 4 fields
- Demo: `?example=covid-compare`
- Use: a compound-frame composition, one panel per state with the recent window in the main frame, the full history in an inset, and the national series in both for comparison
- Source: The New York Times, [coronavirus (Covid-19) data in the United States](https://github.com/nytimes/covid-19-data), `rolling-averages/us-states.csv` and `rolling-averages/us.csv`: seven-day average new cases per 100,000 people.
- License: Creative Commons Attribution-NonCommercial 4.0, with credit to The New York Times.

Every seventh day from March 2020 to March 2023 for California, Florida, New York, Texas, Vermont, and Washington, plus the United States as code `US`.

```sh
node --experimental-strip-types apps/data-samples/prepare/covid-compare.ts
```

## Presidential margins by state, 1976–2016

- File: `elections.csv`
- Size: 561 rows and 7 fields
- Demo: `?example=elections`
- Use: a strip composition of 51 state rows and 11 election columns, each cell colored by the signed Democratic margin through a diverging ramp, with a ramp legend
- Source: MIT Election Data and Science Lab, [U.S. President 1976–2020](https://doi.org/10.7910/DVN/42MVDX) state returns (the file version retrieved covers 1976–2016).
- License: CC0 1.0 (the lab's public dataverse terms).

`Margin` is the Democratic share of all votes cast minus the Republican share, in percentage points; positive leans Democratic. Minnesota's Democratic-Farmer-Labor line counts as the Democratic ticket; other minor party lines are not folded in.

```sh
node --experimental-strip-types apps/data-samples/prepare/elections.ts
```

## Lincoln, Nebraska weather, 2016

- File: `lincoln-weather.csv`
- Size: 366 rows and 6 fields
- Demo: `?example=lincoln-ridgeline`
- Use: a ridgeline composition, one density of daily mean temperatures per month, overlapping down the page in calendar order
- Source: the [ggridges](https://github.com/wilkelab/ggridges) package's raw `lincoln-weather.csv`, Weather Underground observations for Lincoln, Nebraska, collected by Claus Wilke.
- License: ggridges is GPL-2; the observations are factual weather records, reused with credit.

Daily mean, maximum, and minimum temperatures in degrees Fahrenheit, with the month name and number.

```sh
node --experimental-strip-types apps/data-samples/prepare/lincoln-weather.ts
```
