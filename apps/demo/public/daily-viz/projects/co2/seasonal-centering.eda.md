# Remove the annual level to see the CO₂ calendar

**Which calendar months sit above or below their own year’s measured-week mean?** Each row is one weekly date.

```eda
eda query=r
date:date=r.date label="Date"
co2:num=r.co2 label="CO₂ (ppm)"
month:num=r.month label="Month"
month_label:cat=r.month_label label="Calendar month"
decade:cat=r.decade label="Decade"
annual_center:num=r.annual_center label="Annual mean (ppm)"
residual:num=r.residual label="Difference from annual mean (ppm)"
```

## 1. The level removed from each observation

The annual center is derived from the same year’s measured weeks. Plotting it against raw concentration shows how much variation remains around that annual reference.

```eda
scatter @nb-co2-seasonal-centering-chart-1 x=annual_center y=co2 opacity=0.35 title="The level removed from each observation" x.title="Annual mean (ppm)" y.title="CO₂ (ppm)"
```

## 2. Weekly deviations from the annual mean

The zero line is different for each underlying year even though the residual axis is shared. Long-run level information has intentionally been removed.

```eda
line @nb-co2-seasonal-centering-chart-2 x=date y=residual title="Weekly deviations from the annual mean" x.title="Date" y.title="Difference from annual mean (ppm)" {
  rule y=0 "Annual measured-week mean"
}
```

**Finding.** The mean centered value for May weeks was 2.76 ppm.

## 3. Centered concentration by calendar month

Order the month labels chronologically. A pooled monthly box summarizes many years and must not be read as one observed calendar year.

```eda
boxplot @nb-co2-seasonal-centering-chart-3 residual color=month_label title="Centered concentration by calendar month" y.title="Difference from annual mean (ppm)"
```

## 4. Calendar pattern within each decade

Cross month with decade to test whether a pooled seasonal pattern is supported across different spans. Blank cells are not zero residuals.

```eda
heatmap @nb-co2-seasonal-centering-chart-4 month_label columnField=decade aggregation=average measureField=residual title="Calendar pattern within each decade"
```

**Finding.** The mean centered value for September weeks was -2.77 ppm.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-co2-seasonal-centering-records date,co2,annual_center,residual,month_label title="Records behind this comparison"
```

## Takeaway

The centered view makes the within-year rhythm easier to compare while explicitly surrendering the long-run concentration level. Keep the raw plot nearby whenever absolute concentration matters.

## Limits

Centering by an available-week annual mean does not remove every within-year trend. Incomplete years and uneven missingness can shift the reference. Residuals are not a fitted seasonal model.
