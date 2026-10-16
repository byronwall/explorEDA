# A CO₂ trend with the missing weeks left visible

**What does five decades of weekly CO₂ look like when the missing weeks stay missing?** Each row is one weekly date.

```eda
eda query=r
date:date=r.date label="Date"
co2:num=r.co2 label="CO₂ (ppm)"
decade:cat=r.decade label="Decade"
coverage:cat=r.coverage label="Coverage"
```

## 1. Measured weekly concentrations; no imputation

Follow the observations in calendar order. Gaps are not zero concentration, and no connecting value has been inserted to repair them.

```eda
line @nb-co2-trend-and-coverage-chart-1 x=date y=co2 title="Measured weekly concentrations; no imputation" x.title="Date" y.title="CO₂ (ppm)"
```

## 2. Measured and missing weekly slots

The coverage chart uses all dates. It separates a missing measurement from the absence of a row in a newly constructed calendar.

```eda
row @nb-co2-trend-and-coverage-chart-2 coverage title="Measured and missing weekly slots" x.title="Rows"
```

**Finding.** The mean measured concentration in the 1960s was 320.22 ppm.

## 3. The weekly distribution in each decade

Decades make the long-run shift easier to compare, but the first and final decades are partial. Each box uses observed weeks only.

```eda
boxplot @nb-co2-trend-and-coverage-chart-3 co2 color=decade title="The weekly distribution in each decade" y.title="CO₂ (ppm)"
```

## 4. Compare the whole distribution, not just a center

Cumulative distributions retain the tails and overlap. They are descriptive summaries of measured weeks, not estimates weighted by the length of missing intervals.

```eda
ecdf @nb-co2-trend-and-coverage-chart-4 co2 color=decade direction=below title="Compare the whole distribution, not just a center" x.title="CO₂ (ppm)"
```

**Finding.** The mean measured concentration in the 1990s was 360.38 ppm.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-co2-trend-and-coverage-records date,co2,coverage,decade title="Records behind this comparison"
```

## Takeaway

A time series, a coverage count, and distributions by decade answer complementary questions. The rising sequence must be read alongside seasonal movement and the limits of the historical measurement calendar.

## Limits

This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.
