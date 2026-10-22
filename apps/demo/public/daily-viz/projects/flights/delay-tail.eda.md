# Most January flights left early; the average says ten minutes late

**How late is a typical flight out of New York?** Each row is one flight that left Newark, JFK, or LaGuardia in January 2013. The 521 flights with no departure time, mostly cancellations, are left out of every delay below.

```eda
eda query=flights
delay:num=flights.dep_delay label="Departure delay (min)"
origin:cat=flights.origin label="Airport"
date:date=flights.flight_date label="Date"
```

## A spike near zero, then a long tail

Most departures cluster within a few minutes of schedule, and many leave early. A thin tail stretches past two hours. The axis stops at three hours; a handful of flights left even later. The median departure delay was -2 minutes. The mean departure delay was 10.0 minutes. The bracket spans the twelve minutes from median to mean; the tail pulls the mean to the right. The median describes the flight you are most likely to be on; the mean is the airlines' total delay divided by flights.

```eda
hist @nb-flights-delay-tail-1 delay bins=200 title="Flights by departure delay" x.title="Departure delay (min)" y.title="Flights" x.min=-30 x.max=180 {
  band x=-2..10 "Median −2 to mean 10" display=bracket
}
```

## Read thresholds straight off the curve

The cumulative curve gives the share of flights that left by any given delay. It climbs almost straight up near zero, then crawls toward 100% across a day: the latest departure in the month left more than 21 hours late. 63.5% of flights left on time or early. 6.9% of flights left more than an hour late.

```eda
ecdf @nb-flights-delay-tail-2 delay direction=below title="Share of flights that left within each delay" x.title="Departure delay (min)"
```

## Newark carried the longest tail

The three airports share a median within three minutes of each other, but Newark's box and whiskers reach further. Newark's mean departure delay was 14.9 minutes. LaGuardia's mean departure delay was 5.6 minutes.

```eda
boxplot @nb-flights-delay-tail-3 delay color=origin title="Departure delay by airport" y.title="Departure delay (min)" y.min=-30 y.max=120
```

## Takeaway

A typical January flight from New York left a couple of minutes early. The ten-minute average is real, but it comes from roughly one flight in fifteen running more than an hour late. Report the median with the tail, not the mean alone.

## Limits

One month of one year at three airports. Cancelled flights have no delay and are excluded rather than counted as infinitely late, which flatters every number here.
