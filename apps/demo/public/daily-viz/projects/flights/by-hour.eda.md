# Delays snowball through the day

**When in the day do New York flights fall behind?** Each row is one January 2013 departure, grouped by the hour it was scheduled to leave. A late inbound aircraft makes its next flight late too, so delay should pile up as the day goes on.

```eda
eda query=flights
delay:num=flights.dep_delay label="Departure delay (min)"
hour:num=flights.sched_dep_hour label="Scheduled hour"
origin:cat=flights.origin label="Airport"
calc hour_label = hour == 5 ? "05:00" : hour == 6 ? "06:00" : hour == 7 ? "07:00" : hour == 8 ? "08:00" : hour == 9 ? "09:00" : hour == 10 ? "10:00" : hour == 11 ? "11:00" : hour == 12 ? "12:00" : hour == 13 ? "13:00" : hour == 14 ? "14:00" : hour == 15 ? "15:00" : hour == 16 ? "16:00" : hour == 17 ? "17:00" : hour == 18 ? "18:00" : hour == 19 ? "19:00" : hour == 20 ? "20:00" : hour == 21 ? "21:00" : hour == 22 ? "22:00" : "23:00"
field hour_label label="Scheduled hour"
group @by-hour avg(delay) by=hour_label
```

## Morning flights leave close to schedule

Each cell is one airport and scheduled hour, colored by the mean departure delay. Read down a column: the cells darken from early morning to evening at every airport. Red marks the rare hour whose flights left early on average. Flights scheduled at 6:00 left 3.0 minutes late on average. Flights scheduled at 19:00 left 19.1 minutes late on average.

```eda
heatmap @nb-flights-by-hour-1 hour_label columnField=origin aggregation=average measureField=delay sortBy=label title="Mean departure delay by scheduled hour" x.title="Airport"
```

## The average climbs all afternoon and peaks at 19:00

Pooling the three airports, the mean delay stays under seven minutes until noon, then climbs by about two minutes an hour. The 19:00 bank is the worst of the day. The handful of flights scheduled at 23:00 left almost on time, because by then the day's disruptions had either cleared or been cancelled.

```eda
bar @nb-flights-by-hour-2 hour_label group=by-hour categoryOrder=label title="Mean departure delay by scheduled hour, all airports" x.title="Scheduled hour" y.title="Mean departure delay (min)" {
  callout "19:00: the worst hour of the day" category=19:00
}
```

## The spread widens with the mean

The average is not the only thing that grows. The boxes stay near zero all day, but the whiskers and outliers reach further each hour; evening flights are not uniformly late, they are more often very late. 3.3% of 6:00 flights left more than an hour late. 12.9% of 19:00 flights left more than an hour late.

```eda
boxplot @nb-flights-by-hour-3 delay color=hour_label title="Departure delay by scheduled hour" y.title="Departure delay (min)" y.min=-30 y.max=150
```

## The busiest hours are not the latest

Departure banks from 6:00 to 8:00 and from 15:00 to 17:00 move the most flights, but the worst delays come after 18:00, when fewer flights remain to absorb a disruption.

```eda
bar @nb-flights-by-hour-4 hour_label categoryOrder=label title="Flights by scheduled hour" x.title="Scheduled hour" y.title="Flights"
```

## Takeaway

If you can choose, fly early. A 6:00 departure averaged three minutes late in January; a 19:00 departure averaged nineteen. The median barely moves, so the difference is mostly in how often things go badly wrong.

## Limits

Scheduled hour is local time at the airport. One month says nothing about summer thunderstorm season, when evening delays are usually worse.
