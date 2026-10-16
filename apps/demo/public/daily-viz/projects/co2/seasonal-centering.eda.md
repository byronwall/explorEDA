# Remove the annual level to see the CO2 calendar

**Reader question.** Which calendar months sit above or below their own year’s measured-week mean?

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

## 1. The level removed from each observation

The annual center is derived from the same year’s measured weeks. Plotting it against raw concentration shows how much variation remains around that annual reference.

```eda
scatter @nb-co2-seasonal-centering-chart-1 x=annual_center y=co2 opacity=0.35 title="The level removed from each observation" x.title="Annual center (ppmv)" y.title="Co2 (ppmv)"
```

## 2. Weekly deviations from the annual mean

The zero line is different for each underlying year even though the residual axis is shared. Long-run level information has intentionally been removed.

```eda
line @nb-co2-seasonal-centering-chart-2 x=date y=residual title="Weekly deviations from the annual mean" x.title="Calendar date" y.title="Residual (ppmv)" {
  rule y=0 "Annual measured-week mean"
}
```

**Computed finding.** The mean centered value for May weeks was 2.76 ppmv. This calculation uses 187 eligible rows after the recorded filter and field-completeness rule.

## 3. Centered concentration by calendar month

Order the month labels chronologically. A pooled monthly box summarizes many years and must not be read as one observed calendar year.

```eda
boxplot @nb-co2-seasonal-centering-chart-3 residual color=month_label title="Centered concentration by calendar month" y.title="Residual (ppmv)"
```

## 4. Calendar pattern within each decade

Cross month with decade to test whether a pooled seasonal pattern is supported across different spans. Blank cells are not zero residuals.

```eda
heatmap @nb-co2-seasonal-centering-chart-4 month_label columnField=decade aggregation=average measureField=residual title="Calendar pattern within each decade"
```

**Computed finding.** The mean centered value for September weeks was -2.77 ppmv. This calculation uses 184 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-co2-seasonal-centering-records date,co2,annual_center,residual,month_label title="Records behind this comparison"
```

## What the comparison supports

The centered view makes the within-year rhythm easier to compare while explicitly surrendering the long-run concentration level. Keep the raw plot nearby whenever absolute concentration matters.

## Limits

Centering by an available-week annual mean does not remove every within-year trend. Incomplete years and uneven missingness can shift the reference. Residuals are not a fitted seasonal model.

## Source and preparation

Keeling and Whorf; Scripps / CDIAC; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [co2 provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** co2: parts per million by volume (ppmv); annual_center: ppmv; residual: ppmv relative to annual available-week mean.
