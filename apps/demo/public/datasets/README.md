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
