# Lincoln’s 2016 ran from −26°F to 98°F

**How much does a Nebraska day swing?** Each row is one day of 2016 in Lincoln, Nebraska: the high, the low, and the mean in degrees Fahrenheit. The year spans 124 degrees between its coldest and hottest readings, and a single day can cover 50 of them.

```eda
eda query=days
date:date=weather.Date label="Date"
high:num="weather.Max temperature" label="High (°F)"
low:num="weather.Min temperature" label="Low (°F)"
mean:num="weather.Mean temperature" label="Mean (°F)"
range:num=range label="Daily range (°F)"
month:cat=month_label label="Month"
freeze:cat=freeze label="Froze"
```

## The hottest day was 98°F, the coldest −26°F

The two lines are each day’s high and low. The hottest day was July 22, with a high of 98°F; the coldest was December 18, when the low reached -26°F, the only reading under −10 all year. The low crossed 32°F on 152 days; the last spring freeze was May 15 and the first autumn freeze October 7.

```eda
line @nb-lincoln-swings-1 x=date y=high,low title="Daily high and low, Lincoln, Nebraska, 2016" x.title="Date" y.title="Temperature (°F)" {
  rule y=32 "Freezing"
  callout "98°F, July 22" on=weather.Date:2016-07-22
  callout "−26°F, December 18" on=weather.Date:2016-12-18
}
```

## The widest swings came in spring and autumn, not summer

Each cell is one day, shaded by the gap between its high and low. The dark cells cluster in February, March, and October, when a warm afternoon follows a frosty dawn. The widest day of the year was 51 degrees, reached twice: February 27 and October 22. The average day spanned 26.0 degrees.

```eda
calendar @nb-lincoln-swings-2 date aggregation=average measureField=range title="Daily temperature range, 2016 (°F)"
```

## October’s typical day swings ten degrees more than July’s

Each box is one month’s daily ranges. Summer is humid and its nights stay warm, so the boxes sit low. October’s days averaged a 32.6-degree range, and July’s a 22.9-degree range. March is nearly as wide as October.

```eda
boxplot @nb-lincoln-swings-3 range color=month title="Daily range by month (°F)" y.title="High minus low (°F)"
```

## One day in eleven swung forty degrees or more

The curve gives the share of days at or below each range. Reading up from 40 degrees, about nine in ten days sit below it. 34 days had a range of 40 degrees or more, and 25 had a range of 10 degrees or less, most of them overcast winter days.

```eda
ecdf @nb-lincoln-swings-4 range direction=below title="Share of days at or below each daily range" x.title="Daily range (°F)" {
  rule x=40 "40 degrees"
}
```

## Takeaway

Lincoln’s extremes are a winter story, −26°F on one December morning, but its volatility is a spring and autumn story: the clear, dry days of March and October swing ten degrees more than July’s. A forecast high in those months says little about the morning.

## Limits

One station, one year. 2016 was a warm year nationally, and a single December cold snap sets the record low here. Weather Underground readings come from a volunteer or airport station and are reported in whole degrees.
