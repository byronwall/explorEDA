# Measles nearly vanished within a decade of the vaccine

**What happened to measles in the United States after 1963?** Each row is one state in one year, 1928 to 2012, with reported cases per 100,000 people. Before the vaccine, hundreds of cases per 100,000 were an ordinary year. Within seven years of licensing, the typical state-year was under twenty, and by the 2000s it was zero.

```eda
eda query=measles
state:cat=measles.State label="State"
year:num=measles.Year label="Year"
rate:num=measles.Rate label="Cases per 100,000"
calc era = year < 1963 ? "1928–1962, before the vaccine" : year < 1970 ? "1963–1969, after licensing" : "1970–2012"
```

## Every state, every year

Each dot is one state-year. Before 1963, rates of several hundred per 100,000 were ordinary and swung up and down in two- to three-year epidemics. From 1950 to 1962, the average state-year saw 322.7 cases per 100,000. In the 1970s, it was 17.1, and in the 1980s 2.3. After the vaccine was licensed in 1963, the cloud collapses to the floor.

```eda
scatter @nb-measles-vaccine-1 x=year y=rate title="Measles cases per 100,000, by state and year" x.title="Year" y.title="Cases per 100,000" {
  rule x=1963 "Vaccine licensed"
}
```

## The whole country went dark at once

One row per state, one column per year, each cell shaded by that state's rate on a square-root scale so the post-vaccine years still show. The epidemic years before 1963 are vertical stripes: measles swept every state in the same seasons. The 1989 to 1991 resurgence is a faint stripe near the right edge; California's 1990 rate, 32.04 per 100,000, was the highest of that year.

```eda
heatmap @nb-measles-vaccine-3 state columnField=year aggregation=average measureField=rate maxCategories=51 maxColumns=85 sortBy=label columnSortBy=label showValues=false yAxis.tickFontSize=8 title="Measles cases per 100,000 by state and year, 1928–2012" {
  colorDomain.min=0 colorDomain.max=1000 colorDomain.transform=sqrt
}
```

## Before, during, and after

Three eras on one scale. Before 1963, 76.2% of state-years from 1950 on reported more than 100 cases per 100,000. In the 1970s, 1.8% did. From 2000 to 2012, the average state-year reported 0.03 cases per 100,000, and 61.0% of state-years reported none at all.

```eda
boxplot @nb-measles-vaccine-2 rate color=era title="State-year rates by era" y.title="Cases per 100,000"
```

## Takeaway

Within seven years of licensing, measles fell by about 95%, from 323 cases per 100,000 in a typical pre-vaccine state-year to 17 in the 1970s. The decline was not gradual improvement; the scatter shows a cliff, and the heatmap shows it happening in every state in the same few years.

## Limits

Reporting was incomplete before 1950 and changed in 2003, when the CDC began counting confirmed cases yearly instead of provisional cases weekly. Years a state did not report stay blank.
