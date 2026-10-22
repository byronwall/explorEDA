# Construction's unemployment rate hit 27% in the recession

**Which industries did the 2008 recession hit hardest?** Each row is one industry in one month, January 2000 to February 2010, with its unemployed count and unemployment rate from the Current Population Survey.

```eda
eda query=industries
industry:cat=industries.Industry label="Industry"
month:date=industries.Month label="Month"
year:num=industries.Year label="Year"
rate:num="industries.Unemployment rate" label="Unemployment rate (%)"
unemployed:num="industries.Unemployed (thousands)" label="Unemployed (thousands)"
```

## Every industry rose; construction rose furthest

One line per industry. All of them climb from 2008, but construction starts high, swings with the seasons every winter, and ends far above the rest. Construction's unemployment rate peaked at 27.1%. Its lowest rate in the decade was 4.4%.

```eda
line @nb-unemployment-recession-1 x=month y=rate color=industry title="Unemployment rate by industry" x.title="Month" y.title="Unemployment rate (%)" {
  time.interval=month time.aggregation=average time.measureField=rate time.splitField=industry
  band x=2007-12-01..2009-06-30 "Recession"
}
```

## The same story, year by year

Each cell is one industry's average rate in one year. Construction's row turns dark first, in 2008, and darkest in 2009; government and education stay the palest rows throughout. Government's unemployment rate never went above 5.1%.

```eda
heatmap @nb-unemployment-recession-2 industry columnField=year aggregation=average measureField=rate sortBy=label title="Average unemployment rate by industry and year" x.title="Year"
```

## Construction's 2009 rate was five times government's

Each bar is an industry's average unemployment rate across 2009, the recession's worst full year, ranked. Construction averaged 19.0% in 2009 and government 3.6%, with all industries together at 9.6%. Three years earlier, in 2006, construction had averaged 6.7%: the recession nearly tripled it.

```eda
group @nb-unemployment-recession-2009 average(rate) by=industry
row @nb-unemployment-recession-3 industry group=nb-unemployment-recession-2009 topN=14 title="Average unemployment rate by industry, 2009" x.title="Unemployment rate (%)" where.year=2009 {
  rule x=9.65 "All industries"
}
```

## Takeaway

Recessions are not shared equally. Building trades, already seasonal, lost work earliest and in the largest share. Government and education, funded on longer cycles, rose least.

## Limits

Rates are not seasonally adjusted, which exaggerates construction's winter swings. Industry is the worker's last job; new entrants without one are not counted in any industry.
