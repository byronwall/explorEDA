# Niño 1+2 water swings 5.7 °C every year; the El Niños are what's left

**How much of a warm month off Peru is just the calendar?** Each row is one month of sea-surface temperature in the Niño 1+2 region, 1950 to 2010, with its anomaly against the 1981–2010 mean for that calendar month. The seasons move the water by nearly six degrees every year. Subtract them and a few months in 1983 and 1997 stand four degrees above anything the calendar can explain.

```eda
eda query=r
sst:num=r.sst label="Sea-surface temperature (°C)"
month:num=r.month label="Month"
date:date=r.date label="Date"
month_label:cat=r.month_label label="Calendar month"
anomaly:num=r.anomaly label="Anomaly (°C)"
year:num=r.year label="Year"
```

## March is the warm month, September the cool one

Each box holds 61 years of one calendar month. The water off Peru is warmest at the end of the southern summer and coolest at the end of its winter: March months averaged 26.25 °C and September months 20.58 °C, 5.7 °C apart. A 27 °C March is ordinary; a 27 °C December has happened once.

```eda
boxplot @nb-elnino-season-and-anomaly-chart-1 sst color=month_label title="Monthly sea-surface temperature by calendar month, 1950–2010" y.title="Sea-surface temperature (°C)"
```

## The raw line buries the events in the sawtooth

Sixty-one teeth, one a year. The warmest month on record, 29.24 °C in March 1998, is only the tallest tooth in a row of tall teeth, because March is always warm. The 1997 event is easier to spot by its missing trough: the water never cooled that spring.

```eda
line @nb-elnino-season-and-anomaly-chart-2 x=date y=sst title="Monthly sea-surface temperature, Niño 1+2, 1950–2010" x.title="Date" y.title="Sea-surface temperature (°C)" {
  callout "March 1998, 29.24 °C" on=r.id:elnino-r-00579 offset=-220,30
  band x=1997-04-01..1998-08-01 "1997–98 El Niño"
}
```

## Subtract the calendar and the events stand alone

The same months, each minus its calendar-month mean. The line now spends most of its time within a degree of zero and then leaps. The largest anomaly was 4.35 °C, in June 1983, a month whose raw 27.43 °C would not have looked remarkable in March. 3.8% of months ran more than 2 °C warm.

```eda
line @nb-elnino-season-and-anomaly-chart-3 x=date y=anomaly title="Monthly anomaly against the 1981–2010 calendar-month mean" x.title="Date" y.title="Anomaly (°C)" {
  rule y=0 "Calendar-month mean"
  callout "June 1983, +4.35 °C" pick=max offset=50,10
}
```

## Cool months are common, warm months are extreme

Each cell is one month of one year, red when warmer than its calendar mean and blue when cooler. 25.1% of months ran more than 1 °C cool, against 11.6% that ran more than 1 °C warm, so the blue outnumbers the red two to one. The red is deeper: in 1983, 8 months sat more than 2 °C warm, and in 1997, 8 did; the coldest anomaly, -2.69 °C in May 1954, is smaller than a dozen warm ones.

```eda
heatmap @nb-elnino-season-and-anomaly-chart-4 month_label columnField=date columnInterval=year aggregation=average measureField=anomaly maxColumns=61 sortBy=label showValues=false title="Monthly anomaly by month and year (°C)" x.title="Year" {
  colorDomain.min=-4.4 colorDomain.max=4.4
}
```

## Takeaway

Off Peru the calendar moves the water nearly 6 °C a year, more than any El Niño does, so a raw temperature says little until its month's normal is subtracted. The anomaly series is lopsided: mild cool months most of the time, and rare warm months that go far further than the cool ones ever do.

## Limits

Niño 1+2 is one coastal box, not the Niño 3.4 region that defines El Niño events, and a monthly mean hides the week the warming arrived. The baseline is the 1981–2010 calendar-month mean, which runs warmer than the 1950s, so early-decade anomalies lean cool.
