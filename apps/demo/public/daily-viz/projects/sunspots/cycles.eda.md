# The Sun peaks about every eleven years, at anything from 46 to 190

**How much does one solar maximum resemble the next?** Each row is one year of the annual sunspot number, 1700 to 2008, the longest continuous record of the Sun's activity. The rhythm is dependable: a peak roughly every eleven years. The size of the peak is not, and the second half of the twentieth century was the busiest stretch in three centuries.

```eda
eda query=r
year:num=r.year label="Year"
activity:num=r.activity label="Sunspot number"
era:cat=r.era label="Half-century"
```

## Same rhythm, different heights

Twenty-eight rises and falls in 309 years. The tallest, in 1957, reached 190.2, the largest annual sunspot number in the record. The peak of 1816, in the lull astronomers call the Dalton minimum, reached only 45.8, barely above the median year of 40.0. Most years sit below that dashed median; the cycle spends longer climbing out of its minimum than it does at the top.

```eda
line @nb-sunspots-cycles-chart-1 x=year y=activity title="Annual sunspot number, 1700–2008" x.title="Year" y.title="Sunspot number" {
  rule y=median "Median year"
  callout "1957: 190.2" pick=max offset=30,0
  callout "1816: a peak of 45.8" on=r.id:sunspots-r-00117 offset=-60,-50
}
```

## The late twentieth century was the busiest era

Fifty years in each box. The 1950–1999 box sits highest: its years averaged 73.1, against 40.0 for 1800–1849. The quiet years thin out too. In 1800–1849, 38.0% of years had a sunspot number under 20; in 1950–1999, 20.0% did.

```eda
boxplot @nb-sunspots-cycles-chart-2 activity color=era title="Annual sunspot number by half-century" y.title="Sunspot number" {
  rule y=median "Median year, all years"
}
```

## Three years in ten are quiet; one in seven is a big year

Count the years by their activity and the shape is lopsided: a tall stack of quiet years and a long tail of active ones. 29.1% of years had a sunspot number under 20, and 13.9% reached 100 or more. The eight years at 150 or above all belong to four cycles: 1778, 1947, 1957 to 1959, 1979 to 1980, and 1989.

```eda
hist @nb-sunspots-cycles-chart-3 activity bins=38 title="Years by annual sunspot number" x.title="Sunspot number" y.title="Years" {
  rule x=20 "Under 20: a quiet year"
  rule x=100 "100 or more"
}
```

## Takeaway

The solar cycle keeps time but not amplitude: peaks have ranged from 46 to 190, and the three biggest cycles all fell between 1947 and 1991. A forecast of the next maximum's timing is far safer than a forecast of its height.

## Limits

This is the historical annual series, not the recalibrated sunspot number of 2015, which scales values differently. An annual mean flattens the monthly peak, and the first decades rest on sparse eighteenth-century observations.
