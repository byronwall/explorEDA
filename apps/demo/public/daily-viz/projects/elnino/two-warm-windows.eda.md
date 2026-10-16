# Compare two warm-water windows on an aligned clock

**How do the 1982–1983 and 1997–1998 windows differ after seasonal centering?** Each row is one calendar month in either selected two-year window.

```eda
eda query=episodes
sst:num=episodes.sst label="Sea-surface temperature (°C)"
month:num=episodes.month label="Month"
date:date=episodes.date label="Date"
anomaly:num=episodes.anomaly label="Anomaly (°C)"
episode:cat=episodes.episode label="Episode"
episode_month:num=episodes.episode_month label="Month of episode"
```

## 1. An aligned month number, not aligned peaks

Every point keeps its position in the two-year window. Use color to distinguish the windows without shifting either to maximize apparent agreement.

```eda
scatter @nb-elnino-two-warm-windows-chart-1 x=episode_month y=anomaly color=episode title="An aligned month number, not aligned peaks" x.title="Month of episode" y.title="Anomaly (°C)"
```

## 2. The same windows in raw Celsius

Return to raw temperature to see the seasonal cycle that the anomaly view removed. The difference in vertical meaning is the point of the comparison.

```eda
scatter @nb-elnino-two-warm-windows-chart-2 x=episode_month y=sst color=episode title="The same windows in raw Celsius" x.title="Month of episode" y.title="Sea-surface temperature (°C)"
```

**Finding.** The largest monthly anomaly in the 1982–1983 window was 4.35 °C.

## 3. Compare the full anomaly distribution

A higher maximum does not establish that every month was warmer. The full cumulative distribution exposes the remainder of each window.

```eda
ecdf @nb-elnino-two-warm-windows-chart-3 anomaly color=episode direction=below title="Compare the full anomaly distribution" x.title="Anomaly (°C)"
```

## 4. Centers and spreads across the two windows

Each summary has the same intended window length. It still loses serial ordering, so return to the aligned scatter before describing persistence.

```eda
boxplot @nb-elnino-two-warm-windows-chart-4 anomaly color=episode title="Centers and spreads across the two windows" y.title="Anomaly (°C)"
```

**Finding.** The largest monthly anomaly in the 1997–1998 window was 4.07 °C.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-elnino-two-warm-windows-records episode,episode_month,date,sst,anomaly title="Records behind this comparison"
```

## Takeaway

Keep a common clock and baseline rather than shifting the curves until they appear to match. Differences in duration and amplitude should remain visible rather than being normalized away.

## Limits

The two windows are illustrative, predeclared spans, not an automated event sample. Alignment begins in January of each first year and does not align peaks or event onset. No causal attribution follows.
