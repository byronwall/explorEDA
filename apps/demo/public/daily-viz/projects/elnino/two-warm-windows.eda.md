# 1982–83 peaked higher, but 1997–98 stayed hot four months longer

**Which of the two great El Niños was bigger off Peru?** Each row is one month in one of two 24-month windows, January 1982 to December 1983 and January 1997 to December 1998, with its Niño 1+2 anomaly against the 1981–2010 calendar mean. Lined up month by month, the two events have different shapes: one tall spike, one long plateau.

```eda
eda query=episodes
sst:num=episodes.sst label="Sea-surface temperature (°C)"
date:date=episodes.date label="Date"
anomaly:num=episodes.anomaly label="Anomaly (°C)"
episode:cat=episodes.episode label="Window"
episode_month:num=episodes.episode_month label="Month of window (1 = January of the first year)"
```

## A spike against a plateau

Both paths start near zero in January of their first year. The 1982–83 path climbs slowly for a year and spikes in month 18, June 1983, at 4.35 °C above normal, then falls away within four months. The 1997–98 path reaches 4.07 °C in month 12, December 1997, and had already been above 2 °C for seven months by then.

```eda
scatter @nb-elnino-two-warm-windows-chart-1 x=episode_month y=anomaly color=episode title="Monthly anomaly through each 24-month window" x.title="Month of window (1 = January of the first year)" y.title="Anomaly (°C)" {
  connect.orderField=episode_month connect.groupField=episode
  rule y=0 "Calendar-month mean"
  rule y=2 "2 °C above normal"
  callout "June 1983, +4.35 °C" on=episodes.id:elnino-episodes-00018 offset=40,-10
}
```

## The later event ran warmer for longer

Same 48 months, sorted into two boxes. The 1982–83 window averaged 1.46 °C above normal and the 1997–98 window 2.03 °C. In the 1982–83 window, 41.7% of months ran more than 2 °C warm; in the 1997–98 window, 58.3% did, 14 months against 10.

```eda
boxplot @nb-elnino-two-warm-windows-chart-2 anomaly color=episode title="Monthly anomaly in each window" y.title="Anomaly (°C)" {
  rule y=2 "2 °C above normal"
}
```

## In raw degrees, 1998 holds the record

Put the seasons back and the two windows look alike until the second year. The warmest month was 29.24 °C, in March 1998, when a +2.7 °C anomaly landed on the warmest month of the calendar. June 1983's larger anomaly produced only 27.43 °C, because June is a cooling month.

```eda
scatter @nb-elnino-two-warm-windows-chart-3 x=episode_month y=sst color=episode title="Monthly sea-surface temperature through each window" x.title="Month of window (1 = January of the first year)" y.title="Sea-surface temperature (°C)" {
  connect.orderField=episode_month connect.groupField=episode connect.labels=end
  callout "March 1998, 29.24 °C" on=episodes.id:elnino-episodes-00039 offset=-150,-10
}
```

## Takeaway

By peak anomaly, 1982–83 was the bigger event off Peru, by 0.28 °C. By duration and average warmth, 1997–98 was bigger: four more months above 2 °C and a window mean 0.57 °C higher. Which one was "the strongest El Niño" depends on whether the question is about the hottest month or the hottest year.

## Limits

The windows are two fixed calendar spans, not event onsets, and the anomaly baseline is the same 1981–2010 mean for both. Niño 1+2 is the coastal region; rankings by the central-Pacific Niño 3.4 index differ.
