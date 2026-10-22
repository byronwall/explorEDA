# Vermont kept Covid at a fifth of Florida’s rate for a year, then Omicron erased the gap

**Did the state with the lowest case rates stay lowest?** Each row is one week in Vermont, Florida, or the United States as a whole, from March 2020 to March 2023: the seven-day average of new cases per 100,000 people, sampled every seventh day. Vermont ran the lowest rates of any state through 2020 and most of 2021. Then one variant made the two states look alike.

```eda
eda query=vtfl
state:cat=compare.State label="State"
code:cat=compare.Code label="Code"
date:date=compare.Date label="Week"
cases:num="compare.Cases per 100k" label="New cases per 100,000 (7-day average)"
wave:cat=wave label="Wave"
field "compare.Cases per 100k" precision=1
```

## Through 2020, Vermont’s line barely left the floor

Florida climbed in summer and again in winter; Vermont stayed near zero until November. Vermont’s 2020 weeks averaged 3.71 new cases per 100,000, and Florida’s averaged 19.27. Up to the end of November 2021, Vermont averaged 12.47 a week against Florida’s 26.63.

```eda
line @nb-covid-vermont-florida-1 x=date time.interval=week time.aggregation=average time.measureField=cases time.splitField=state title="Weekly case rate, Vermont, Florida, and the United States" y.title="New cases per 100,000 (7-day average)" x.title="Week" {
  band x=2021-12-13..2022-02-14 "Omicron"
}
```

## Half of Vermont’s pre-Omicron weeks were under 10 per 100,000

The cumulative curves count weeks up to the end of November 2021. Vermont’s curve crosses the 10-per-100,000 line at its midpoint, Florida’s much lower down. Before Omicron, 53.8% of Vermont’s weeks were under 10 new cases per 100,000, and 28.3% of Florida’s were.

```eda
ecdf @nb-covid-vermont-florida-2 cases color=state direction=below where.date=2020-03-01..2021-11-30 title="Share of weeks at or below each rate, March 2020 to November 2021" x.title="New cases per 100,000 (7-day average)" {
  rule x=10 "10 per 100,000"
}
```

## Omicron hit Vermont harder than Florida

Each box is one state’s weeks from December 2021 to March 2022. The state that spent two years lowest peaked highest: Vermont’s Omicron peak was 320.40 new cases per 100,000, and Florida’s was 275.95. Across the whole wave, Vermont’s weeks averaged 86.86 and Florida’s 82.59.

```eda
boxplot @nb-covid-vermont-florida-3 cases color=state where.wave="Omicron 2022" title="Weekly case rates during Omicron, December 2021 to March 2022" y.title="New cases per 100,000 (7-day average)"
```

## Wave by wave, the gap closed and never reopened

Each cell is a state’s average weekly rate across one wave. Vermont trails Florida by a wide margin in every wave of 2020 and 2021, matches it in Omicron, and after Omicron the two are within a few cases: Vermont averaged 17.26 a week, Florida 22.40.

```eda
heatmap @nb-covid-vermont-florida-4 state columnField=wave aggregation=average measureField=cases showValues=true sortBy=label columnSortBy=data title="Average weekly case rate in each wave, per 100,000"
```

## Takeaway

Vermont’s advantage was real for 21 months and then gone in six weeks. Omicron’s transmissibility, and a population with little prior infection, meant the state with the least Covid had the most of it in January 2022. A low rate early is not protection later.

## Limits

Case rates depend on testing, and Vermont tested heavily per person, which makes its early advantage look smaller than it was and its Omicron peak larger. Home tests from 2022 went unreported in both states. The national line averages all states by population, not these two.
