# Warm water and unusual warmth are different questions

**Reader question.** How does a Niño 1+2 sea-surface temperature differ from its calendar-month baseline?

**Population.** one Niño 1+2 calendar month. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
year:num=r.year label="Year"
month_name:cat=r.month_name label="Month name"
sst:num=r.sst label="Sst (°C)"
month:num=r.month label="Month"
date:date=r.date label="Calendar date"
month_label:cat=r.month_label label="Month label"
decade:cat=r.decade label="Decade"
climatology:num=r.climatology label="Climatology (°C)"
anomaly:num=r.anomaly label="Anomaly (°C)"
era:cat=r.era label="Era"
```

## 1. The original monthly temperature series

Begin with the recorded Celsius values. Repeated within-year movement can conceal which months were unusual for their season.

```eda
line @nb-elnino-season-and-anomaly-chart-1 x=date y=sst title="The original monthly temperature series" x.title="Calendar date" y.title="Sst (°C)"
```

## 2. The calendar has its own temperature distribution

The monthly boxes establish why one all-year temperature threshold can be misleading. These are distributions over years for each month.

```eda
boxplot @nb-elnino-season-and-anomaly-chart-2 sst color=month_label title="The calendar has its own temperature distribution" y.title="Sst (°C)"
```

**Computed finding.** The mean February temperature across supplied years was 25.84 °C. This calculation uses 61 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-season-and-anomaly.json).

## 3. Anomalies against the same calendar month

Subtracting a month-specific reference removes the average seasonal level. Positive and negative values are deviations from a declared baseline, not from zero Celsius.

```eda
line @nb-elnino-season-and-anomaly-chart-3 x=date y=anomaly title="Anomalies against the same calendar month" x.title="Calendar date" y.title="Anomaly (°C)" {
  rule y=0 "1981–2010 monthly mean"
}
```

## 4. The distribution after seasonal centering

An anomaly histogram summarizes the amplitude distribution but discards the ordering and persistence of warm or cool episodes.

```eda
hist @nb-elnino-season-and-anomaly-chart-4 anomaly bins=30 title="The distribution after seasonal centering" x.title="Anomaly (°C)" y.title="Source rows"
```

**Computed finding.** The mean September temperature across supplied years was 20.58 °C. This calculation uses 61 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-elnino-season-and-anomaly.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-elnino-season-and-anomaly-records date,sst,climatology,anomaly,month_label title="Records behind this comparison"
```

## What the comparison supports

Raw temperature answers how warm the water was. Anomaly answers how different it was from the selected seasonal reference. A chart title should say which of those questions it answers.

## Limits

These are monthly temperatures for Niño 1+2, not a global ocean average or a Niño 3.4 event classification. The baseline is the supplied 1981–2010 calendar-month mean; no modern data revision is substituted.

## Source and preparation

NOAA Climate Prediction Center, ERSST v3b; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [elnino provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/elnino.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-elnino-season-and-anomaly.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** sst: degrees Celsius, Niño 1+2 region; climatology: degrees Celsius; 1981–2010 calendar-month mean; anomaly: degrees Celsius relative to 1981–2010 month mean.
