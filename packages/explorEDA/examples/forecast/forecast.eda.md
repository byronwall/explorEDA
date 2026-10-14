# Did Texas demand run off forecast before the blackouts?

ERCOT, the Texas grid operator, forecasts each hour's electricity demand a day
ahead. In February 2021 a winter storm forced rolling blackouts across the state,
starting at 1:25 a.m. Central on February 15. This notebook compares what the
grid forecast with the demand it served, hour by hour, in January and February 2021.

Source: U.S. Energy Information Administration, ERCOT hourly demand and
day-ahead forecast. Values are megawatt-hours for each hour.

```eda
eda query=demand
time:date=demand.time label=Hour
actual:num=demand.actual label="Actual demand (MWh)"
forecast:num=demand.forecast label="Forecast demand (MWh)"
```

## Two lines that hide the difference

Plotted together, actual demand and the forecast track each other so closely
that it is hard to see when demand ran above the forecast and when it ran below.

```eda
line @demand x=time y=actual,forecast title="Actual and forecast demand" {
  series actual lineColor=#3479a8
  series forecast lineColor=#c77a45
  rule x=2021-02-15T07:25:00Z "Rolling blackouts"
}
```

## Plot the difference instead

Subtracting the forecast from actual demand turns the question into one line.
Above zero, Texas used more electricity than forecast; below zero, less.

```eda
calc delta = actual - forecast   # positive: demand above forecast
line @delta x=time y=delta title="Actual minus forecast" {
  y.title="Above or below forecast (MWh)"
  rule y=0 "On forecast"
  rule x=2021-02-15T07:25:00Z "Rolling blackouts"
}
```

Through January the forecast usually missed by under a thousand megawatt-hours.
As the cold arrived, demand ran well above forecast, by up to about 10,000
megawatt-hours. Then, before the blackouts began, it dropped below forecast. The
deep plunge after February 15 is load that was shed, not demand that went away.

## The nine days before the blackouts

Zooming into the window from February 7 to February 16 shows the change of
direction. The full series above stays as it is.

```eda
line @event x=time y=delta title="February 7 to 16" {
  x.min=2021-02-07T07:25:00Z x.max=2021-02-16T07:25:00Z
  y.title="Above or below forecast (MWh)"
  rule y=0 "On forecast"
  rule x=2021-02-15T07:25:00Z "Rolling blackouts"
}
```

Demand was above forecast from February 9 to 12, then fell below it on February
13 and 14, by up to about 6,000 megawatt-hours, before any load was shed. This
notebook shows when that happened, not why. Prices and customers' responses to
the storm warnings are natural next questions.

## The hours behind the lines

```eda
table @hours time,actual,forecast,delta title="Hourly demand and forecast"
```
