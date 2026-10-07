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
