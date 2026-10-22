# The warmest year off Peru had the narrowest seasonal swing

**Do hot years come with wider swings between their warm and cool months?** Each row is one year of Niño 1+2 sea-surface temperature, 1950 to 2010, summarized by its mean, its warmest month, and its coolest month. The answer is no, and 1997 is the proof: the warmest year in the record swung 3.47 °C between its extremes, less than any other year.

```eda
eda query=annual
year:num=annual.year label="Year"
mean:num=annual.mean label="Mean (°C)"
low:num=annual.low label="Coolest month (°C)"
high:num=annual.high label="Warmest month (°C)"
range:num=annual.range label="Seasonal swing (°C)"
months:num=annual.months label="Months observed"
```

## Each year's swing is about 6 °C, whatever its mean

Three lines on one Celsius scale: each year's warmest month, its mean, and its coolest month. The band between the outer lines is the seasonal swing, and it holds its width while the mean wanders. The average swing was 5.86 °C. The widest was 7.93 °C, in 1998, and the narrowest 3.47 °C, in 1997, the year before.

```eda
line @nb-elnino-annual-range-chart-1 x=year y=low,mean,high title="Warmest month, mean, and coolest month of each year, Niño 1+2" x.title="Year" y.title="Sea-surface temperature (°C)" {
  callout "1997: warmest mean, narrowest swing" on=annual.id:elnino-annual-00048 offset=-200,-30
}
```

## Warmer years swing slightly less, not more

Each point is one year, placed by its mean and its swing. The fit slopes gently down: the correlation between a year's mean and its swing was -0.226. The three warmest years sit at both edges. In 1997 the event arrived in the cool season and erased the trough; in 1998 it peaked in March and collapsed into a cold second half, which stretched the swing to the record.

```eda
scatter @nb-elnino-annual-range-chart-2 x=mean y=range regression=linear title="Each year's mean against its seasonal swing" x.title="Mean (°C)" y.title="Seasonal swing (°C)" {
  callout "1997" on=annual.id:elnino-annual-00048 offset=30,20
  callout "1998" on=annual.id:elnino-annual-00049 offset=30,-10
  callout "1983" on=annual.id:elnino-annual-00034 offset=30,-10
}
```

## A year's mean is set by its cool months

The warmest and coolest months of a year only loosely travel together: their correlation was 0.524. The mean follows the trough more than the peak. Its correlation with the coolest month was 0.901, against 0.780 with the warmest. A hot March is routine; a September that never cools is what makes a hot year.

```eda
scatter @nb-elnino-annual-range-chart-3 x=low y=high regression=linear title="Each year's coolest month against its warmest" x.title="Coolest month (°C)" y.title="Warmest month (°C)" {
  callout "1997" on=annual.id:elnino-annual-00048 offset=-40,20
  callout "1998" on=annual.id:elnino-annual-00049 offset=30,-10
}
```

## Takeaway

Off Peru the seasonal swing is close to a constant, about 6 °C, and El Niño does not widen it. An event that lands in the cool season fills the trough and narrows the year, as in 1997; one that peaks in autumn and then flips cold stretches it, as in 1998. The headline mean is a cool-season story.

## Limits

The outer lines are observed monthly extremes, not an uncertainty band around the mean. Every year has all 12 months, so no year's swing is short a month. One region's annual summary says nothing about where in the Pacific the event sat.
