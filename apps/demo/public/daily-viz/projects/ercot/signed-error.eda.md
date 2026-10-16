# When two demand lines hide the forecast miss

**Reader question.** How does subtracting the forecast change the reading of the supplied ERCOT hours?

**Population.** one supplied hour. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
date:date=r.date label="UTC supplied hour"
actual:num=r.actual label="Actual (MWh)"
forecast:num=r.forecast label="Forecast (MWh)"
year:num=r.year label="Year"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Month label"
decade:cat=r.decade label="Decade"
hour:num=r.hour label="Hour (UTC clock hour)"
hour_label:cat=r.hour_label label="Hour label"
error:num=r.error label="Error (MWh)"
abs_error:num=r.abs_error label="Abs error (MWh)"
pct_error:num=r.pct_error label="Pct error (%)"
abs_pct_error:num=r.abs_pct_error label="Abs pct error (%)"
direction:cat=r.direction label="Direction"
```

## 1. Actual and forecast, in the same units

Begin with the quantities being compared. Both lines use the same MWh scale; closeness is meaningful, but small differences are difficult to follow against the much larger level.

```eda
line @nb-ercot-signed-error-chart-1 x=date y=actual,forecast title="Actual and forecast, in the same units" x.title="UTC supplied hour" y.title="Actual (MWh) / Forecast (MWh)"
```

## 2. Subtract the forecast; keep a zero reference

A positive value means more electricity was served than forecast; a negative value means less. The reference is a definition, not a target chosen after inspecting the data.

```eda
line @nb-ercot-signed-error-chart-2 x=date y=error title="Subtract the forecast; keep a zero reference" x.title="UTC supplied hour" y.title="Error (MWh)" {
  rule y=0 "Actual equals forecast"
}
```

**Computed finding.** The mean signed error was -1,242.9 MWh per supplied hour. This calculation uses 1,417 eligible rows after the recorded filter and field-completeness rule.

## 3. How often does each size of signed miss occur?

Remove time temporarily to inspect the distribution. Bins summarize frequency, but they cannot tell whether adjacent extreme observations belong to the same episode.

```eda
hist @nb-ercot-signed-error-chart-3 error bins=30 title="How often does each size of signed miss occur?" x.title="Error (MWh)" y.title="Source rows"
```

## 4. Absolute error without bin boundaries

Read the cumulative share below a chosen error threshold. Every valid supplied hour has equal weight, unlike an energy-weighted summary.

```eda
ecdf @nb-ercot-signed-error-chart-4 abs_error direction=below title="Absolute error without bin boundaries" x.title="Abs error (MWh)"
```

**Computed finding.** The mean absolute error was 2,591.7 MWh per supplied hour. This calculation uses 1,417 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-ercot-signed-error-records date,actual,forecast,error,abs_error title="Records behind this comparison"
```

## What the comparison supports

The difference chart changes the task from comparing two vertical positions to reading one signed distance from zero. The histogram then distinguishes typical errors from a few unusually large misses.

## Limits

Actual is electricity served in each supplied hour, not unconstrained demand. These observations alone cannot identify why consumption or supply changed. The UTC snapshot includes partial boundary dates.

## Source and preparation

U.S. Energy Information Administration / ERCOT; U.S. public domain (EIA-authored data). Historical source version: Authorized repository baseline ea8b52ff742f11d1fb89457acabbcd27b0bd04e7

Data credit and license: [ercot provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** actual: MWh for the supplied hour; forecast: MWh for the supplied hour; error: MWh for the supplied hour; abs_error: MWh for the supplied hour.
