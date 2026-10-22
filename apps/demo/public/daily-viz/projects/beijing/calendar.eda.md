# Beijing's worst air came in a few winter weeks

**Which days of 2016 did Beijing breathe its worst air?** Each row is one monitoring station on one day: twelve stations, 366 days. A day's PM2.5 is the mean of its hourly readings, and needs 20 valid hours to count. More than a third of station-days broke the national limit, but the year's damage was done in a handful of winter episodes, and one six-day run in December stands above everything else.

```eda
eda query=days
date:date=days.date label="Date"
pm25:num=days.pm25 label="PM2.5 (µg/m³)"
season:cat=days.season label="Season"
month:cat=days.month label="Month"
```

## The calendar shows episodes, not seasons

Each cell is one day, colored by the mean PM2.5 across the stations that reported. Dark days come in runs of three to six, when stagnant air traps pollution over the city, and then a north wind clears it in an afternoon. December's station-days averaged 129.1 µg/m³, against 72.1 µg/m³ for the year. The darkest run, December 16 to 21, is the city's first red alert of that winter: schools closed and half of private cars were kept off the roads.

```eda
calendar @nb-beijing-calendar-1 date aggregation=average title="Daily PM2.5, mean of all stations" {
  measureField=pm25
}
```

## The red alert, day by day

December alone, as the citywide daily mean. The air was clean on December 15 and foul by the 17th. Across the six alert days, station-days averaged 247.6 µg/m³, more than three times the limit, and on December 21 the citywide mean reached 394.9 µg/m³. Two days later it was 30.9 µg/m³.

```eda
line @nb-beijing-calendar-4 x=date time.interval=day time.aggregation=average time.measureField=days.pm25 where.date=2016-12-01..2016-12-31 title="Citywide daily mean PM2.5, December 2016" x.title="Date" y.title="PM2.5 (µg/m³)" {
  band x=2016-12-16..2016-12-21 "Red alert"
  rule y=75 "China's 24-hour limit"
}
```

## A month's mean and its typical day disagree

March's median is no higher than October's, but its mean is far higher: a few extreme days pull it up. December has both the highest median and the longest tail. 36.0% of station-days were above China's 24-hour limit of 75 µg/m³.

```eda
boxplot @nb-beijing-calendar-2 pm25 color=month title="Station-day PM2.5 by month" y.title="PM2.5 (µg/m³)" {
  rule y=75 "China's 24-hour limit"
}
```

## How the year's days spread out

Six station-days in ten sit between 20 and 100 µg/m³. The tail runs past 400: the highest daily mean at any station was 476.3 µg/m³, at Gucheng on December 20.

```eda
hist @nb-beijing-calendar-3 pm25 bins=48 title="Station-days by PM2.5" x.title="PM2.5 (µg/m³)" y.title="Station-days" {
  rule x=75 "China's 24-hour limit"
}
```

## Takeaway

Beijing's 2016 air problem was episodic. More than a third of station-days broke the national limit, but the worst readings came in a few multi-day episodes, most of them in winter, when heating demand and still air coincide, and the December red alert alone carried the year's five worst days.

## Limits

A daily mean hides the hourly peak. Station-days without 20 valid hours are blank, not zero, and they cluster in some stations' outages.
