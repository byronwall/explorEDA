# Rain and snow nearly doubled the average delay

**How much does the weather at the airport matter?** Each row is one January 2013 departure, joined to the weather observed at its airport in the hour it was scheduled to leave. 52 flights have no matching weather hour and drop out of the weather charts.

```eda
eda query=flights
delay:num=flights.dep_delay label="Departure delay (min)"
origin:cat=flights.origin label="Airport"
precip:num=weather.precip label="Precipitation (in/hour)"
visibility:num=weather.visib label="Visibility (mi)"
wind:num=weather.wind_speed label="Wind speed (mph)"
calc conditions = precip == null ? "No weather record" : precip > 0 ? "Rain or snow" : "Dry"
```

## Wet hours run later

Only about one departure in eighteen was scheduled into an hour with measurable rain or snow, but those flights left much later. In hours with rain or snow, the mean departure delay was 18.4 minutes. In dry hours, the mean departure delay was 9.6 minutes.

```eda
boxplot @nb-flights-weather-1 delay color=conditions title="Departure delay in wet and dry hours" y.title="Departure delay (min)" y.min=-30 y.max=150
```

## Low visibility tells the same story

Visibility is a different measurement of a similar problem. Left of the five-mile line, ground stops and wider spacing slow every departure. With visibility under five miles, the mean departure delay was 15.9 minutes. With visibility of five miles or more, the mean departure delay was 9.4 minutes.

```eda
scatter @nb-flights-weather-2 x=visibility y=delay color=origin title="Visibility and departure delay" x.title="Visibility (mi)" y.title="Departure delay (min)" y.min=-30 y.max=300 {
  rule x=5 "Five miles"
}
```

## Wind on its own does little

Wind speed hardly separates late flights from on-time ones; most of January's windy hours were clear. Wind speed and departure delay had correlation 0.049.

```eda
scatter @nb-flights-weather-3 x=wind y=delay title="Wind speed and departure delay" x.title="Wind speed (mph)" y.title="Departure delay (min)" y.min=-30 y.max=300
```

## Takeaway

Weather at the departure airport explains part of the delay story: wet hours nearly doubled the average. But most delay minutes accrued in dry hours, because most hours were dry. Weather elsewhere in the network, and late inbound aircraft, matter as much as the sky over New York.

## Limits

Weather is matched by scheduled hour at the origin only. Conditions at the destination and along the route are not in the data.
