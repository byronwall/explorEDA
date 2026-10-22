# The Phillips curve held in the 1960s, then broke

**Does higher inflation come with lower unemployment?** Each row is one US quarter from 1959 to 2009, with the unemployment rate and annualized CPI inflation. Pooled over fifty years, the two are unrelated. Inside the 1960s they trace the textbook curve. The 1970s pushed both up at once, and the curve never came back.

```eda
eda query=r
unemp:num=r.unemp label="Unemployment (%)"
infl:num=r.infl label="Inflation (annualized %)"
date:date=r.date label="Quarter"
decade:cat=r.decade label="Decade"
```

## Pooled, fifty years show no trade-off

Every quarter from 1959 to 2009 is one point. The fitted line is almost flat: the pooled correlation between inflation and unemployment was 0.065. Unemployment anywhere from 4% to 10% came with inflation anywhere from 0% to 14%.

```eda
scatter @nb-macro-inflation-unemployment-chart-1 x=unemp y=infl opacity=0.6 regression=linear title="Inflation against unemployment, US quarters 1959 to 2009" x.title="Unemployment (%)" y.title="Inflation (annualized %)"
```

## Inside the 1960s the curve was steep

The same points colored by decade, each with its own fit. In the 1960s the correlation was -0.744: low unemployment went with high inflation, as the curve says. In the 1970s the correlation was -0.183, and in the 1990s it was 0.152, the wrong sign. Each decade's cloud sits in its own corner, which is what flattens the pooled line.

```eda
scatter @nb-macro-inflation-unemployment-chart-2 x=unemp y=infl color=decade opacity=0.7 regression=linear title="Inflation against unemployment, fitted by decade" x.title="Unemployment (%)" y.title="Inflation (annualized %)"
```

## The 1970s raised both at once

Put the quarters back in order. Inflation peaked at 14.62% in the last quarter of 1979, after the 1973 and 1979 oil shocks. Unemployment peaked at 10.7% in the last quarter of 1982, at the bottom of the recession that broke the inflation. 18 quarters had inflation of 5% or more and unemployment of 7% or more, and all but two fell between 1975 and 1983.

```eda
line @nb-macro-inflation-unemployment-chart-3 x=date y=infl,unemp title="Inflation and unemployment by quarter, 1959 to 2009" x.title="Quarter" y.title="Percent" {
  band x=1973-10-01..1982-12-31 "Oil shocks to Volcker disinflation"
  rule y=0 "Zero"
}
```

## Takeaway

The inflation-unemployment trade-off is real inside one decade and absent across five. A fitted line through fifty years of quarters answers no question anyone asks; the decade fits do.

## Limits

Quarters are not independent draws, so a correlation inside a decade is a description, not a test. Inflation here is the annualized change in one quarter's CPI, which is noisier than a year-on-year rate. The first quarter's inflation is a placeholder zero and is left out.
