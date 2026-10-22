# Each Covid wave had its own state, until Omicron took all six

**When did each state’s worst weeks come, and how high did they go?** Each row is one week in one of six states, or in the United States as a whole, from March 2020 to March 2023: the seven-day average of new cases per 100,000 people, sampled every seventh day. The first three waves each belonged to a different region. The fourth belonged to everyone.

```eda
eda query=compare
state:cat=compare.State label="State"
code:cat=compare.Code label="Code"
date:date=compare.Date label="Week"
cases:num="compare.Cases per 100k" label="New cases per 100,000 (7-day average)"
field "compare.Cases per 100k" precision=1
wave:cat=wave label="Wave"
```

## Spring 2020 was New York’s wave alone

The first line to leave the floor is New York’s, and for two months it is the only one. New York’s spring 2020 peak was 48.38 new cases per 100,000 a day, and the nation’s was 9.29. The other five states never passed 6.57 that spring.

```eda
line @nb-covid-six-states-1 x=date time.interval=week time.aggregation=average time.measureField=cases time.splitField=state title="Weekly case rate, six states and the United States" y.title="New cases per 100,000 (7-day average)" x.title="Week" {
  band x=2020-03-16..2020-05-31 "Spring 2020"
  band x=2020-10-15..2021-03-15 "Winter wave"
  band x=2021-12-13..2022-02-14 "Omicron"
}
```

## Summer went to the Sun Belt; winter went everywhere

Each cell is a state’s average weekly rate across one wave. Summer 2020 belongs to Florida and Texas: Florida’s summer 2020 weeks averaged 23.79 new cases per 100,000, and New York’s averaged 3.82. The winter wave reached every state, though Vermont’s winter weeks averaged 15.06 against the nation’s 38.03. Delta was Florida’s again, at 39.87 a week against 28.56 nationally.

```eda
heatmap @nb-covid-six-states-2 state columnField=wave aggregation=average measureField=cases showValues=true sortBy=label columnSortBy=data title="Average weekly case rate in each wave, per 100,000"
```

## Omicron ended the geography

Zoom in on the winter of 2021–22 and the six lines rise and fall together. The earlier waves differed in timing by months; here all six states and the nation peaked within two weeks of each other in January 2022. New York’s Omicron peak was 379.44, Texas’s was 236.06, and the nation’s was 238.25. The lowest Omicron peak among the six was higher than any earlier peak anywhere.

```eda
line @nb-covid-six-states-3 x=date time.interval=week time.aggregation=average time.measureField=cases time.splitField=state where.date=2021-11-01..2022-04-30 title="Weekly case rate, November 2021 to April 2022" y.title="New cases per 100,000 (7-day average)" x.title="Week" {
  rule x=2022-01-17 "Peak week for four of six"
}
```

## Takeaway

For 21 months the pandemic was a sequence of regional waves: New York, then the Sun Belt, then California. Omicron was national. A state’s "worst week" means its January 2022 week for all six, so comparisons of peaks are comparisons of Omicron, and the regional story lives in the smaller waves before it.

## Limits

Reported cases depend on testing, which grew through 2020 and shifted to home tests in 2022, so the Omicron spike overstates the gap with earlier waves and later months understate everything. Every seventh day is sampled, so a peak that fell between samples is missed by up to six days. The national line is the population-weighted average of all states, not of these six.
