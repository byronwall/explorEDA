# After 1898 the Nile carried 22% less water, and 99 years in 100 fell below the old median

**How different was the Nile before and after 1898?** Each row is one year of flow past Aswan, 1871 to 1970, in hundreds of millions of cubic metres. 1898 is the usual break point in this record: construction of the first Aswan dam began that year, and statisticians have used the series ever since as the textbook case of a level shift. The shift is not subtle. The two eras barely overlap.

```eda
eda query=r
year:num=r.year label="Year"
volume:num=r.volume label="Annual flow (10⁸ m³)"
era:cat=r.era label="Era"
```

## A step down, not a slide

The 27 years before 1898 averaged 1097.67 (10⁸ m³) a year. The 73 years from 1898 on averaged 853.40, a drop of 244, or 22%. The line does not drift down to the new level; it arrives there within two years of the break and stays for seven decades.

```eda
line @nb-nile-before-and-after-chart-1 x=year y=volume title="Annual Nile flow at Aswan, 1871–1970" x.title="Year" y.title="Annual flow (10⁸ m³)" {
  rule x=1898 "1898: the usual break point"
  rule y=1097.67 "Mean before 1898"
  rule y=853.4 "Mean from 1898"
}
```

## The later era's typical year was a dry year before

Two boxes on one scale, with the pre-1898 median drawn across both. The median year before 1898 carried 1140; from 1898 on, 98.6% of years fell below that figure. Run it the other way and 92.6% of pre-1898 years sat above the later era's median of 845.

```eda
boxplot @nb-nile-before-and-after-chart-2 volume color=era title="Annual flow by era" y.title="Annual flow (10⁸ m³)" {
  rule y=1140 "Median before 1898"
}
```

## The whole distribution moved, not just the middle

The cumulative curves barely touch. The driest year before 1898 carried 799, and 34.2% of later years came in below it. The wettest year from 1898 on carried 1170, and 29.6% of earlier years came in above it. A wet year after the break was an ordinary year before it.

```eda
ecdf @nb-nile-before-and-after-chart-3 volume color=era direction=below title="Share of years at or below each annual flow, by era" x.title="Annual flow (10⁸ m³)"
```

## Takeaway

The Nile at Aswan carried about a fifth less water after 1898, and the change was a step: the eras' middle halves do not overlap, and nearly every year in the later era would have been a dry year in the earlier one. Any century-long "average flow" for this river is an average of two different rivers.

## Limits

The break year is a convention from the literature, not an experiment; the dam, instrument changes, and a shift in East African rainfall are all candidates, and the data cannot separate them. Flow is measured at one point on the river, and 27 years is a short "before".
