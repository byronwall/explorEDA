# CO₂ breathes: May sits 2.8 ppm above its year, September 2.8 below

**Why does the CO₂ curve wobble, and is the wobble changing?** Each row is one week at Mauna Loa from 1958 to 2001, with its reading expressed as a difference from the mean of its own year. Subtracting the year's level leaves the calendar: a peak every May, a trough every September and October, and a swing that has grown by almost a part per million since the 1960s.

```eda
eda query=r
date:date=r.date label="Date"
co2:num=r.co2 label="CO₂ (ppm)"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Calendar month"
decade:cat=r.decade label="Decade"
residual:num=r.residual label="Difference from year mean (ppm)"
field r.residual precision=2
```

## The peak is May, the trough is September

Every May week in 44 years sits above its year's mean, and every September week sits below it. May weeks averaged 2.76 ppm above their year's mean, and September weeks averaged -2.77 ppm. That is a swing of 5.5 ppm, about four years of the underlying rise, repeated every twelve months as northern forests leaf out and then shed.

```eda
boxplot @nb-co2-seasonal-centering-chart-1 residual color=month_label title="Weekly CO₂ minus the year's mean, by calendar month" y.title="Difference from year mean (ppm)" {
  rule y=0 "The year's mean"
}
```

## The breath has deepened

Each cell is one calendar month in one decade. Read down the May column and the September column: both move away from zero over time. In the 1960s, May weeks averaged 2.69 ppm above their year and September weeks -2.51 ppm, a swing of 5.2. In the 1990s, May averaged 2.95 ppm and September -3.18 ppm, a swing of 6.1.

```eda
heatmap @nb-co2-seasonal-centering-chart-2 month_label columnField=decade aggregation=average measureField=residual sortBy=label columnSortBy=label showValues=true title="Mean difference from the year's mean, by month and decade (ppm)"
```

## One breath, close up

Two years, 1990 and 1991, with no missing weeks. The reading climbs from January to a May peak, falls through the summer, bottoms in September, and climbs again. Across the two years the weekly reading ran from 350.7 ppm, in September 1990, to 360.0 ppm, in May 1991, a span that is mostly season and only partly trend.

```eda
line @nb-co2-seasonal-centering-chart-3 x=date y=co2 where.date=1990-01-01..1991-12-31 title="Weekly CO₂, 1990–1991" x.title="Date" y.title="CO₂ (ppm)" {
  callout "May 1991 peak" pick=max offset=-80,30
  callout "September 1990 trough" pick=min offset=40,-30
}
```

## The rhythm never misses a year

With the level removed, 44 years of weeks look like a metronome. The widest departures are 4.43 ppm above the year's mean, in May 1991, and -4.17 ppm, in September 1982. The typical week sits 1.58 ppm from its year's mean in one direction or the other.

```eda
line @nb-co2-seasonal-centering-chart-4 x=date y=residual title="Weekly CO₂ minus the year's mean, 1958–2001" x.title="Date" y.title="Difference from year mean (ppm)" {
  rule y=0 "The year's mean"
  band x=1990-01-01..1991-12-31 "The two years above"
}
```

## Takeaway

The CO₂ record has two signals: a rise of about 1.3 ppm a year and a seasonal swing of 5 to 6 ppm that repeats without fail. The swing has widened since the 1960s, so a single May-to-September comparison overstates the trend and a single September-to-May one hides it.

## Limits

Each year's mean comes from its measured weeks, so a year with gaps centers on an uneven calendar; 1964 lost four months. The differences are not a fitted seasonal model, and one station's rhythm is not the globe's.
