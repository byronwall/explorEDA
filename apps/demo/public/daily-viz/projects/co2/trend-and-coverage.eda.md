# CO₂ rose 40 ppm in three decades, and each decade's step was bigger

**How fast is carbon dioxide rising at Mauna Loa, and how much of the record is really there?** Each row is one week from March 1958 to December 2001: a concentration where the observatory had a reading, and a blank where it did not. The level climbs every decade, the climb gets steeper, and the blanks turn out to be a 1960s problem.

```eda
eda query=r
date:date=r.date label="Date"
co2:num=r.co2 label="CO₂ (ppm)"
decade:cat=r.decade label="Decade"
coverage:cat=r.coverage label="Coverage"
observed:num=r.observed label="Weeks measured"
month_label:cat=r.month_label label="Month"
year:num=r.year label="Year"
month:num=r.month label="Month number"
calc yearfrac = year + (month - 1) / 12
```

## A sawtooth that only climbs

Each tooth is one year: the Northern Hemisphere's spring peak and its autumn trough, when plants draw carbon down. Underneath the teeth, the level never comes back. The 1960s averaged 320.22 ppm. The 1990s averaged 360.38 ppm. The first week above 350 ppm came in April 1986, and after October 1989 no week fell below it again.

```eda
line @nb-co2-trend-and-coverage-chart-1 x=date y=co2 title="Weekly CO₂ at Mauna Loa, 1958–2001" x.title="Date" y.title="CO₂ (ppm)" {
  rule y=350 "350 ppm"
  band x=1964-01-25..1964-05-23 "18 missing weeks"
  callout "First week above 350 ppm" on=r.id:co2-r-01466 offset=-140,40
}
```

## The holes are early, and there are few

Each cell is one month, shaded by how many of its weeks have a reading. 97.4% of weekly slots have a measurement. The pale cells sit in 1958, when the record was starting, and in 1964, when the observatory lost four months. The 1960s account for 34 of the 59 missing weeks, and every one of the 1990s' 521 slots has a reading.

```eda
heatmap @nb-co2-trend-and-coverage-chart-2 month_label columnField=date columnInterval=year aggregation=sum measureField=observed maxColumns=44 sortBy=label showValues=false title="Weeks with a reading, by month and year" {
  colorDomain.min=0 colorDomain.max=5
}
```

## Each decade's step is larger than the last

The boxes march upward with no decade overlapping the one two before it. The 1970s averaged 330.85 ppm and the 1980s 345.28 ppm, so the decade steps run 10.6, 14.4, and 15.1 ppm. The 1990s' lowest week, 350.7 ppm, sits above the 1970s' highest, 339.9 ppm.

```eda
boxplot @nb-co2-trend-and-coverage-chart-3 co2 color=decade title="Weekly CO₂ by decade" y.title="CO₂ (ppm)" {
  rule y=350 "350 ppm"
}
```

## A straight line misses both ends

Fit one line through every week and the record bends away from it: the 1960s and the 2000s sit above the fit, the 1970s below. The slope is not constant; it is rising. The highest weekly reading, 373.9 ppm, came in May 2001, and the lowest, 313.0 ppm, in November 1958.

```eda
scatter @nb-co2-trend-and-coverage-chart-4 x=yearfrac y=co2 regression=linear opacity=0.3 title="Every measured week against a straight-line fit" x.title="Year" y.title="CO₂ (ppm)"
```

## Takeaway

Mauna Loa CO₂ rose about 40 ppm between the 1960s and the 1990s, and the rise accelerated with every decade. The missing weeks are real but concentrated before 1970; the three decades that carry the trend are almost complete.

## Limits

This is the historical flask series distributed with statsmodels, not NOAA's current in-situ record, and it stops in 2001. One station on a Hawaiian volcano stands in for the global background. The missing weeks are left blank, so decade averages weight the measured weeks only.
