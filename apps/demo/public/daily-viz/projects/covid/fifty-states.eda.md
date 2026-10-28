# The winter wave started in North Dakota; Omicron needed one month for all 51

**Which states peaked first in each Covid wave?** Each row is one week in one of the 50 states or the District of Columbia, March 2020 to March 2023: the seven-day average of new cases per 100,000 people, sampled every seventh day. Read each wave’s row to see which states darken first.

```eda
eda query=tiles
state:cat=tiles.State label="State"
code:cat=tiles.Code label="Code"
date:date=tiles.Date label="Week"
cases:num="tiles.Cases per 100k" label="New cases per 100,000 (7-day average)"
wave:cat=wave label="Wave"
field "tiles.Cases per 100k" precision=1
```

## Three years, 51 states, one dark row

Each column is a state and each row a wave; a cell is the state’s average weekly rate across that wave. The spring 2020 row is dark only in the Northeast, the winter row darkest in the Plains, the Delta row in the South and Alaska. The Omicron row is dark from coast to coast. Across every state and week, the average rate was 27.90 new cases per 100,000; the highest week anywhere was 456.73.

```eda
calc ym = formatDate(date, "%Y-%m")
field ym label="Month"
heatmap @nb-covid-fifty-states-1 wave columnField=code aggregation=average measureField=cases maxCategories=51 maxColumns=51 sortBy=data columnSortBy=label title="Average weekly case rate by state and wave, per 100,000"
```

## Each state's worst week, wave by wave

The same grid with each cell's highest week instead of its average, so a short spike counts in full. The median state's peak was 7.41 new cases per 100,000 in spring 2020, 86.48 in the winter wave, 61.55 in Delta, and 255.99 in Omicron. Omicron is the darkest cell in every column: all 51 had their worst week of the three years in it. Before Omicron the darkest cells scatter. North Dakota's winter peak, 177.02, was more than twice its Delta peak of 82.0, and Alaska's Delta peak of 179.44 was the highest of that wave.

```eda
heatmap @nb-covid-fifty-states-peak wave columnField=code aggregation=max measureField=cases maxCategories=51 maxColumns=51 sortBy=data columnSortBy=label colorDomain.transform=sqrt title="Highest weekly case rate by state and wave, per 100,000"
```

## The winter wave began in the Dakotas, ten weeks before the coasts

Each row is a month from October 2020 to March 2021. The Dakotas, Iowa, and Wisconsin are dark in November, when most of the map is still pale; the coasts darken in January. North Dakota’s peak week was 177.02 new cases per 100,000, in the week of November 9, when the median state was at 30.47. Hawaii’s winter peak was 13.82, a thirteenth of North Dakota’s.

```eda
heatmap @nb-covid-fifty-states-2 ym columnField=code aggregation=average measureField=cases maxCategories=51 maxColumns=51 sortBy=label columnSortBy=label where.date=2020-10-05..2021-03-29 title="Average weekly case rate by state and month, October 2020 to March 2021"
```

## Delta peaked over sixteen weeks; Omicron over four

Each dot is one state in one week. Delta’s dots spread across the autumn: Arkansas and Missouri peaked in early August 2021 and Connecticut, New Jersey, and Rhode Island not until the last week of November; Alaska’s Delta peak was 179.44 and Maryland’s was 20.30. Omicron’s dots rise as one column: every state peaked between January 3 and January 31, 2022. Rhode Island’s Omicron peak was 456.73 and Maine’s was 79.50, the lowest of the 51.

```eda
scatter @nb-covid-fifty-states-3 x=date y=cases opacity=0.5 x.ticks=5 where.date=2021-07-05..2022-03-28 title="Every state’s weekly case rate, July 2021 to March 2022" y.title="Cases per 100,000, 7-day avg" x.title="Week" {
  band x=2021-08-09..2021-11-29 "Delta peaks"
  band x=2022-01-03..2022-01-31 "Omicron peaks"
  callout "Rhode Island, 456.7" pick=max
}
```

## Takeaway

Before Omicron, a wave was a region: it took two to four months to travel from the first state to peak to the last. Omicron compressed that to four weeks, and every state’s highest week of the pandemic fell in January 2022. Rhode Island’s three-year average was 37.88 a week, Maine’s was 19.60, and the two share a border.

## Limits

Rates depend on each state’s testing, which differed widely and shrank after home tests arrived in 2022. Every seventh day is sampled, so a peak between samples is dated up to six days late. Averaging a month or a wave hides a short spike inside it, which is why one grid shows each wave's highest week and the winter wave section looks at single months.
