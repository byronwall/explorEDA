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
