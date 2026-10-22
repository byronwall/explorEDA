# An eleven-year average halves the solar peaks and misplaces the quiet years

**What does a smoothed sunspot curve throw away?** Each row is one year of the annual sunspot number, 1700 to 2008, beside a centered eleven-year mean: the average of that year, the five before it, and the five after. Eleven years is one solar cycle, so the average deliberately removes the cycle. The cost is a curve that never shows a real maximum and puts the quiet years in the wrong place.

```eda
eda query=r
year:num=r.year label="Year"
activity:num=r.activity label="Sunspot number"
smooth11:num=r.smooth11 label="11-year mean"
departure:num=r.departure label="Departure from the 11-year mean"
abs_departure:num=abs_departure label="Absolute departure"
```

## The average cuts every peak in half

The raw series spikes; the smoothed one rolls. The highest annual reading, 190.2 in 1957, becomes a smoothed value of 87.9 at that year, and the smoothed curve never rises above 95.6 anywhere in the record. The average is five years short at each end, so it stops in 2003 while the raw data run to 2008.

```eda
line @nb-sunspots-smoothing-cost-chart-1 x=year y=activity,smooth11 title="Annual sunspot number and its centered 11-year mean" x.title="Year" y.title="Sunspot number" {
  callout "1957: 190.2 measured, 88 smoothed" pick=max offset=-40,-10
}
```

## The quiet year sits under the loudest average

Subtract the average from each year. The largest departure above the average was 102.26, in 1957. The largest below was -91.19, in 1954, a year with a reading of 4.4 whose eleven-year window happens to contain the giant 1957 to 1959 maximum. The average says 1954 was the most active moment in the record; the Sun says it was a minimum.

```eda
line @nb-sunspots-smoothing-cost-chart-2 x=year y=departure title="Annual sunspot number minus its 11-year mean" x.title="Year" y.title="Departure from the 11-year mean" {
  rule y=0 "Equal to the average"
  callout "1957: +102" pick=max offset=30,0
  callout "1954: −91" pick=min offset=30,0
}
```

## A typical year sits 30 away from its average

Count the years by their departure. The stack is centered on zero but wide: the average year sits 30.03 from its eleven-year mean, in one direction or the other, and 17.1% of years sit more than 50 away. For a series whose median year reads 40, that is not a small residual.

```eda
hist @nb-sunspots-smoothing-cost-chart-3 departure bins=30 title="Years by departure from the 11-year mean" x.title="Departure from the 11-year mean" y.title="Years" {
  rule x=0 "Equal to the average"
}
```

## Takeaway

A centered eleven-year mean is the right tool for the slow question, whether the Sun was more active in one century than another, and the wrong one for any question about a maximum or a minimum. It halves the peaks and, in 1954, labels a quiet Sun as the busiest in three centuries.

## Limits

A centered average reads five years into the future, so it is a description, not a forecast. The first and last five years have no complete window and stay blank rather than using a shorter one. The raw series is the historical annual sunspot number, not the 2015 recalibration.
