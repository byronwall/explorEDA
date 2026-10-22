# PM2.5 travels with carbon monoxide, not ozone

**Which pollutants rise and fall with Beijing's fine particles?** Each row is one station on one day of 2016, with daily means for six pollutants. The combustion pollutants move together so tightly that one could stand in for another. Ozone runs the other way in winter and, surprisingly, the same way in summer.

```eda
eda query=days
pm25:num=days.pm25 label="PM2.5 (µg/m³)"
pm10:num=days.pm10 label="PM10 (µg/m³)"
so2:num=days.so2 label="SO₂ (µg/m³)"
no2:num=days.no2 label="NO₂ (µg/m³)"
co:num=days.co label="CO (µg/m³)"
o3:num=days.o3 label="Ozone (µg/m³)"
season:cat=days.season label="Season"
```

## Six measurements at a glance

The summary profiles every field at once: its range, typical value, and how many days are blank. Carbon monoxide reads in thousands while the others read in tens, so compare shapes, not heights.

```eda
summary @nb-beijing-pollutants-1 title="Six pollutants, one row per station-day"
```

## Combustion pollutants move together

Coal heating and traffic emit fine particles and carbon monoxide together, so days with one have the other. PM2.5 and carbon monoxide had correlation 0.848, and PM2.5 and nitrogen dioxide 0.764. The fitted line runs through the winter cloud and the summer cloud alike. The axis stops at 6,000 µg/m³ of CO; 22 station-days, all in winter smog, sit beyond it.

```eda
scatter @nb-beijing-pollutants-2 x=co y=pm25 color=season regression=linear x.max=6000 title="Carbon monoxide and PM2.5, by station-day" x.title="CO (µg/m³)" y.title="PM2.5 (µg/m³)"
```

## Ozone runs the other way, except in summer

Ozone forms in sunlight and is highest on clear summer days, exactly when particles are lowest. Across the year, PM2.5 and ozone had correlation -0.221, the opposite sign from carbon monoxide's 0.848. The season legend tells a second story: in winter the correlation was -0.672, but in summer it was 0.462, because a hot, still summer day builds both ozone and haze.

```eda
scatter @nb-beijing-pollutants-3 x=o3 y=pm25 color=season regression=linear title="Ozone and PM2.5, by station-day" x.title="Ozone (µg/m³)" y.title="PM2.5 (µg/m³)"
```

## Every pollutant on one line per day

Parallel axes follow each station-day across all six measurements. Select a band of high PM2.5 and watch which other axes it lands high on: PM10, nitrogen dioxide, and carbon monoxide rise with it, and ozone drops.

```eda
parallel @nb-beijing-pollutants-4 pm25,pm10,no2,co,so2,o3 color=season title="Each station-day across six pollutants"
```

## Takeaway

Particles, carbon monoxide, and nitrogen dioxide share sources and rise together in winter. Ozone is a summer problem with a different cause, and on summer days it rises with the haze rather than against it. A single "air quality" number blends two different seasons of risk.

## Limits

Correlation across station-days mixes differences between stations with changes over time. Daily means smooth over rush-hour peaks.
