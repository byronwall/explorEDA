# A CO2 trend with the missing weeks left visible

**Reader question.** What does this historical weekly Mauna Loa snapshot show without filling gaps?

**Population.** one supplied weekly date. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
date:date=r.date label="Calendar date"
co2:num=r.co2 label="Co2 (ppmv)"
year:num=r.year label="Year"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Month label"
decade:cat=r.decade label="Decade"
coverage:cat=r.coverage label="Coverage"
observed:num=r.observed label="Observed (1 measured; 0 missing)"
annual_center:num=r.annual_center label="Annual center (ppmv)"
residual:num=r.residual label="Residual (ppmv)"
```

## 1. Measured weekly concentrations; no imputation

Follow the observations in calendar order. Gaps are not zero concentration, and no connecting value has been inserted to repair them.

```eda
line @nb-co2-trend-and-coverage-chart-1 x=date y=co2 title="Measured weekly concentrations; no imputation" x.title="Calendar date" y.title="Co2 (ppmv)"
```

## 2. Measured and missing weekly slots

The coverage chart uses all supplied dates. It separates a missing measurement from the absence of a row in a newly constructed calendar.

```eda
row @nb-co2-trend-and-coverage-chart-2 coverage title="Measured and missing weekly slots" x.title="Source rows"
```

**Computed finding.** The mean measured concentration in the 1960s was 320.22 ppmv. This calculation uses 488 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-co2-trend-and-coverage.json).

## 3. The weekly distribution in each decade

Decades make the long-run shift easier to compare, but the first and final decades are partial. Each box uses observed weeks only.

```eda
boxplot @nb-co2-trend-and-coverage-chart-3 co2 color=decade title="The weekly distribution in each decade" y.title="Co2 (ppmv)"
```

## 4. Compare the whole distribution, not just a center

Cumulative distributions retain the tails and overlap. They are descriptive summaries of measured weeks, not estimates weighted by the length of missing intervals.

```eda
ecdf @nb-co2-trend-and-coverage-chart-4 co2 color=decade direction=below title="Compare the whole distribution, not just a center" x.title="Co2 (ppmv)"
```

**Computed finding.** The mean measured concentration in the 1990s was 360.38 ppmv. This calculation uses 521 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-co2-trend-and-coverage.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-co2-trend-and-coverage-records date,co2,coverage,decade title="Records behind this comparison"
```

## What the comparison supports

A time series, a coverage count, and distributions by decade answer complementary questions. The rising sequence must be read alongside seasonal movement and the limits of the historical measurement calendar.

## Limits

This is the historical flask-data revision distributed with statsmodels, not the latest NOAA series. Missing weeks stay null. Weekly observations at one station are not global spatial measurements.

## Source and preparation

Keeling and Whorf; Scripps / CDIAC; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [co2 provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/co2.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-co2-trend-and-coverage.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** co2: parts per million by volume (ppmv).
