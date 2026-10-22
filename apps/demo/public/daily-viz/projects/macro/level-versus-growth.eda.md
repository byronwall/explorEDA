# GDP grew almost fivefold; 28 quarters still shrank

**How much of fifty years of American growth was actually growth?** Each row is one US quarter from 1959 to 2009, with real GDP in chained 2005 dollars and the annualized rate of change from the quarter before. Charted as a level, the economy looks like a ramp. Charted as a rate, it crosses zero again and again, and each crossing costs jobs.

```eda
eda query=r
realgdp:num=r.realgdp label="Real GDP ($B, 2005)"
date:date=r.date label="Quarter"
gdp_growth:num=r.gdp_growth label="GDP growth (annualized %)"
unemp_change:num=r.unemp_change label="Change in unemployment (points)"
calc sign = gdp_growth == null ? null : gdp_growth < 0 ? "Quarter shrank" : "Quarter grew"
```

## The level climbs through eight recessions

Real GDP began at $2,710 billion in 1959 and stood at $12,990 billion in the third quarter of 2009, almost five times as large. The shaded bands are the eight NBER recessions in the span. On this axis most of them are a flat step; only 2008 and 2009 read as a fall.

```eda
line @nb-macro-level-versus-growth-chart-1 x=date y=realgdp title="Real GDP by quarter, 1959 to 2009" x.title="Quarter" y.title="Real GDP ($B, 2005)" {
  band x=1960-04-01..1961-02-28 "1960"
  band x=1969-12-01..1970-11-30 "1970"
  band x=1973-11-01..1975-03-31 "1973–75"
  band x=1980-01-01..1980-07-31
  band x=1981-07-01..1982-11-30 "1980–82"
  band x=1990-07-01..1991-03-31 "1990–91"
  band x=2001-03-01..2001-11-30 "2001"
  band x=2007-12-01..2009-06-30 "2007–09"
}
```

## The growth rate crossed zero in 28 quarters

Divide each quarter by the one before and the ramp becomes a saw. 28 of the 202 quarters shrank. The deepest was the second quarter of 1980, when annualized GDP growth fell to -7.95%. The fastest was 1978's second quarter, at 16.69%.

```eda
line @nb-macro-level-versus-growth-chart-2 x=date y=gdp_growth title="Annualized quarterly GDP growth, 1959 to 2009" x.title="Quarter" y.title="GDP growth (annualized %)" {
  rule y=0 "No change"
  callout "1980 Q2: −8%" pick=min
  callout "1978 Q2: +17%" pick=max
}
```

## Shrinking quarters add half a point of unemployment

Split the quarters by the sign of growth and the jobs cost appears: the curve for shrinking quarters sits to the right of the curve for growing ones. In quarters when GDP shrank, unemployment rose by 0.51 points on average. In quarters when GDP grew, unemployment changed by -0.06 points on average. The biggest single jump, 1.6 points, came in the first quarter of 1975.

```eda
ecdf @nb-macro-level-versus-growth-chart-3 unemp_change color=sign direction=below title="Share of quarters by change in unemployment, by sign of GDP growth" x.title="Change in unemployment (points)"
```

## Most quarters grew between 1% and 6%

Set time aside and count quarters by their growth rate. The mean annualized growth rate was 3.22%, and the bars cluster around it. 13.9% of quarters shrank, all in the left tail beyond the zero line.

```eda
hist @nb-macro-level-versus-growth-chart-4 gdp_growth bins=30 title="Quarters by annualized GDP growth" x.title="GDP growth (annualized %)" y.title="Quarters" {
  rule x=0 "No change"
  rule x=3.22 "Mean: 3.2%"
}
```

## Takeaway

The American economy grew almost fivefold in fifty years, but one quarter in seven shrank, and those quarters are where unemployment rose. Read a GDP level chart for scale and a growth chart for recessions; neither shows the other.

## Limits

This is the 2009 vintage of the series, before later revisions. Annualizing a one-quarter change is a convention that magnifies noise; the year-on-year rate is smoother. The first quarter has no predecessor and no growth rate.
