# Compare two warm-water windows on an aligned clock

**Reader question.** How do the supplied 1982–1983 and 1997–1998 windows differ after seasonal centering?

**Population.** one calendar month in either selected two-year window. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=episodes
id:cat=episodes.id label="Id"
year:num=episodes.year label="Year"
month_name:cat=episodes.month_name label="Month name"
sst:num=episodes.sst label="Sst (°C)"
month:num=episodes.month label="Month"
date:date=episodes.date label="Calendar date"
month_label:cat=episodes.month_label label="Month label"
decade:cat=episodes.decade label="Decade"
climatology:num=episodes.climatology label="Climatology (°C)"
anomaly:num=episodes.anomaly label="Anomaly (°C)"
era:cat=episodes.era label="Era"
episode:cat=episodes.episode label="Episode"
episode_month:num=episodes.episode_month label="Episode month (source units; see dictionary)"
```

## 1. An aligned month number, not aligned peaks

Every point keeps its position in the two-year window. Use color to distinguish the windows without shifting either to maximize apparent agreement.

```eda
scatter @nb-elnino-two-warm-windows-chart-1 x=episode_month y=anomaly color=episode title="An aligned month number, not aligned peaks" x.title="Episode month (source units; see dictionary)" y.title="Anomaly (°C)"
```

## 2. The same windows in raw Celsius

Return to raw temperature to see the seasonal cycle that the anomaly view removed. The difference in vertical meaning is the point of the comparison.

```eda
scatter @nb-elnino-two-warm-windows-chart-2 x=episode_month y=sst color=episode title="The same windows in raw Celsius" x.title="Episode month (source units; see dictionary)" y.title="Sst (°C)"
```

**Computed finding.** The largest monthly anomaly in the 1982–1983 window was 4.35 °C. This calculation uses 24 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-two-warm-windows.json).

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

**Computed finding.** The largest monthly anomaly in the 1997–1998 window was 4.07 °C. This calculation uses 24 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-two-warm-windows.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-elnino-two-warm-windows-records episode,episode_month,date,sst,anomaly title="Records behind this comparison"
```

## What the comparison supports

Keep a common clock and baseline rather than shifting the curves until they appear to match. Differences in duration and amplitude should remain visible rather than being normalized away.

## Limits

The two windows are illustrative, predeclared spans, not an automated event sample. Alignment begins in January of each first year and does not align peaks or event onset. No causal attribution follows.

## Source and preparation

NOAA Climate Prediction Center, ERSST v3b; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [elnino provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/elnino.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-elnino-two-warm-windows.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** sst: degrees Celsius, Niño 1+2 region; anomaly: degrees Celsius relative to 1981–2010 month mean; episode_month: month index from January of the first year.
