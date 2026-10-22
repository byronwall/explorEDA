# Measles came back in 1989: the average state’s rate more than doubled

**What did the 1989–1991 measles resurgence look like state by state?** Each row is one state in one year from 1975 to 2012 that reported a measles rate, in cases per 100,000 people. By the mid-1980s the disease was nearly gone. Then three years undid a decade of progress, concentrated in a handful of states.

```eda
eda query=reported
state:cat=measles.State label="State"
year:num=measles.Year label="Year"
rate:num=measles.Rate label="Cases per 100,000"
period:cat=period label="Period"
```

## Three years broke the trend

Each dot is one state-year. The 1970s decline reaches a floor around 1983; from 1989 the dots lift off it again, and after 1992 they fall to nearly nothing. From 1983 to 1988 the average state-year had 1.72 cases per 100,000. From 1989 to 1991 it had 4.20. From 1992 to 2012 it had 0.17.

```eda
scatter @nb-measles-resurgence-1 x=year y=rate opacity=0.6 where.year=1975..2000 title="Measles cases per 100,000 by state and year, 1975 to 2000" x.title="Year" y.title="Cases per 100,000" {
  band x=1988.5..1991.5 "Resurgence"
  callout "Idaho, 1991" pick=max
}
```

## The outbreaks were local: five states carried the peak

Each cell is a state’s average rate across one period. The resurgence row is dark in only a few columns. In 1990, California’s rate reached 32.04 cases per 100,000. In 1991, Idaho’s reached 42.16, the highest state-year since 1977. In 1989 Ohio and Illinois led, in 1990 California and Texas, in 1991 Idaho and New Jersey, while most states stayed under one.

```eda
heatmap @nb-measles-resurgence-2 period columnField=state aggregation=average measureField=rate maxCategories=51 maxColumns=51 sortBy=data columnSortBy=label colorDomain.max=10 title="Average measles rate per 100,000 by state and period (color capped at 10)"
```

## A quarter of state-years passed five per 100,000

The cumulative curves compare the resurgence with the years on either side. During 1989–1991, 25.6% of state-years were at or above 5 cases per 100,000. From 1983 to 1988, 8.7% were. From 1992 to 2012, 1.0% were.

```eda
ecdf @nb-measles-resurgence-3 rate color=period direction=above where.period="1983–1988","1989–1991 resurgence","1992–2012" title="Share of state-years at or above each rate, by period" x.title="Cases per 100,000" {
  rule x=5 "5 per 100,000"
}
```

## Takeaway

The resurgence was real but uneven: the typical state doubled from a low base, and California, Texas, Illinois, Ohio, and Idaho had outbreaks ten to twenty times the national floor. Its aftermath is the more striking number: 0.17 per 100,000 across the next two decades, after a second vaccine dose became routine.

## Limits

States that did not report a year are left out of that year, and reporting was thinner in the early 1990s than the 1960s. The CDC moved from weekly provisional counts to annual confirmed cases in 2003, so the 1992–2012 period mixes two definitions. The well-known second-dose recommendation of 1989 is context, not something this table can show.
