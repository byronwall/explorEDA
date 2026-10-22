# Consumer confidence fell further in 2022 than in the lockdowns

**How did consumer confidence in nine big economies fall and recover through the pandemic?** Each row is one country in one month, July 2018 to October 2022, on the OECD's consumer confidence index, where 100 is the long-run average and below it households expect to spend less. The lockdown spring of 2020 is the dip everyone remembers. It was shallow and short. The slide that began in early 2022, as prices rose, went deeper in seven of the nine countries and had not stopped when the series ends.

```eda
eda query=cci
country:cat=cci.Country label="Country"
month:date=cci.Month label="Month"
index:num=cci.Index label="Confidence index"
year:num=year label="Year"
```

## The 2020 dip was two points; the 2022 slide was four and still going

Averaged across the nine countries, the index fell from 100.15 in February 2020 to 98.28 in April 2020, then recovered past 100 by February 2021. From January 2022 it fell every month, to 95.90 in September 2022, lower than any month of the pandemic.

```eda
line @nb-confidence-two-dips-1 x=month y=index title="Consumer confidence index, nine countries, monthly" x.title="Month" y.title="Confidence index (100 = long-run average)" y.min=90 y.max=106 {
  time.interval=month time.aggregation=average time.measureField=index time.splitField=cci.Country
  band x=2020-03-01..2020-05-31 "Lockdown spring"
  rule y=100 "Long-run average"
}
```

## Seven of nine countries hit their low in 2022, not 2020

Zoom in on the last fifteen months. The United Kingdom fell furthest, to 91.57 in October 2022, the lowest reading in the data. China, which spent 2019 above 104, fell to 92.01 in July 2022. Only Japan and South Korea touched their lowest point in the lockdown spring, at 95.40 and 96.62, and both were close to it again by the autumn of 2022.

```eda
line @nb-confidence-two-dips-2 x=month y=index title="Consumer confidence index, August 2021 to October 2022" x.title="Month" y.title="Confidence index" y.min=90 y.max=106 where.month=2021-08-01.. {
  time.interval=month time.aggregation=average time.measureField=index time.splitField=cci.Country
  rule y=100 "Long-run average"
  callout "United Kingdom, 91.57" at=2022-10-01,91.57 offset=-120,-10
}
```

## Below average became the rule

Each cell is one country in one month, shaded by the index. In 2019, 39.8% of country-months were below 100. In 2022, 88.8% were. The pandemic shows as a short pale stripe in the spring of 2020; 2022 is a pale block that darkens toward the right edge.

```eda
heatmap @nb-confidence-two-dips-3 country columnField=month columnInterval=month measureField=index aggregation=average sortBy=label maxColumns=52 showValues=false colorDomain.min=92 colorDomain.max=104 title="Consumer confidence index by country and month"
```

## Takeaway

The pandemic was a sharp, short shock to confidence; the inflation of 2022 was a slow, deep one. By the autumn of 2022 households in seven of these nine economies were gloomier than at any point in the lockdowns, and the United States had never regained its February 2020 level.

## Limits

Fifty-two months and nine countries, chosen for a chart rather than a sample. The index is standardised within each country, so a reading of 97 in Japan and 97 in the United States are not the same mood, only the same distance below each country's own average. China's series ends in September 2022.
