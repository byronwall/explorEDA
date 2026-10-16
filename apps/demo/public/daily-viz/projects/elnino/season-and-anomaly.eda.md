# A warm month and an unusually warm month are different questions

**How much of Niño 1+2 temperature is just the calendar?** Each row is one Niño 1+2 calendar month.

```eda
eda query=r
sst:num=r.sst label="Sea-surface temperature (°C)"
month:num=r.month label="Month"
date:date=r.date label="Date"
month_label:cat=r.month_label label="Calendar month"
climatology:num=r.climatology label="Climatology (°C)"
anomaly:num=r.anomaly label="Anomaly (°C)"
```

## 1. The original monthly temperature series

Begin with the recorded Celsius values. Repeated within-year movement can conceal which months were unusual for their season.

```eda
line @nb-elnino-season-and-anomaly-chart-1 x=date y=sst title="The original monthly temperature series" x.title="Date" y.title="Sea-surface temperature (°C)"
```

## 2. The calendar has its own temperature distribution

The monthly boxes establish why one all-year temperature threshold can be misleading. These are distributions over years for each month.

```eda
boxplot @nb-elnino-season-and-anomaly-chart-2 sst color=month_label title="The calendar has its own temperature distribution" y.title="Sea-surface temperature (°C)"
```

**Finding.** The mean February temperature across years was 25.84 °C.

## 3. Anomalies against the same calendar month

Subtracting a month-specific reference removes the average seasonal level. Positive and negative values are deviations from a declared baseline, not from zero Celsius.

```eda
line @nb-elnino-season-and-anomaly-chart-3 x=date y=anomaly title="Anomalies against the same calendar month" x.title="Date" y.title="Anomaly (°C)" {
  rule y=0 "1981–2010 monthly mean"
}
```

## 4. The distribution after seasonal centering

An anomaly histogram summarizes the amplitude distribution but discards the ordering and persistence of warm or cool episodes.

```eda
hist @nb-elnino-season-and-anomaly-chart-4 anomaly bins=30 title="The distribution after seasonal centering" x.title="Anomaly (°C)" y.title="Rows"
```

**Finding.** The mean September temperature across years was 20.58 °C.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-elnino-season-and-anomaly-records date,sst,climatology,anomaly,month_label title="Records behind this comparison"
```

## Takeaway

Raw temperature answers how warm the water was. Anomaly answers how different it was from the selected seasonal reference. A chart title should say which of those questions it answers.

## Limits

These are monthly temperatures for Niño 1+2, not a global ocean average or a Niño 3.4 event classification. The baseline is the 1981–2010 calendar-month mean; no modern data revision is substituted.
