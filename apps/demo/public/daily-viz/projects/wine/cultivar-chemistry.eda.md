# Flavanoids pull three wine cultivars apart

**How different is the chemistry of wines from three grape cultivars?** Each row is one Italian wine chemical analysis.

```eda
eda query=r
alcohol:num=r.alcohol label="Alcohol (% vol)"
total_phenols:num=r.total_phenols label="Total phenols"
flavanoids:num=r.flavanoids label="Flavanoids"
color_intensity:num=r.color_intensity label="Color intensity"
cultivar:cat=r.cultivar label="Cultivar"
```

## 1. Flavanoids against color intensity

The two assays describe different measurements. Their numerical values cannot be compared as though both had one common physical unit.

```eda
scatter @nb-wine-cultivar-chemistry-chart-1 x=flavanoids y=color_intensity color=cultivar title="Flavanoids against color intensity" x.title="Flavanoids" y.title="Color intensity"
```

## 2. Flavanoid distributions by cultivar

Use the same field scale across groups. A difference in group center does not establish a difference in desirability or quality.

```eda
boxplot @nb-wine-cultivar-chemistry-chart-2 flavanoids color=cultivar title="Flavanoid distributions by cultivar" y.title="Flavanoids"
```

**Finding.** Mean flavanoids in Cultivar 1 were 2.982 source assay units.

## 3. Total phenols and flavanoids

A second chemical pair checks whether the grouping is visible beyond the first projection. The relationship remains observational.

```eda
scatter @nb-wine-cultivar-chemistry-chart-3 x=total_phenols y=flavanoids color=cultivar title="Total phenols and flavanoids" x.title="Total phenols" y.title="Flavanoids"
```

## 4. Color intensity across the same groups

The cumulative view compares all recorded intensities. It avoids inventing an assay threshold that the source did not define.

```eda
ecdf @nb-wine-cultivar-chemistry-chart-4 color_intensity color=cultivar direction=below title="Color intensity across the same groups" x.title="Color intensity"
```

**Finding.** Mean flavanoids in Cultivar 3 were 0.781 source assay units.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-wine-cultivar-chemistry-records cultivar,flavanoids,color_intensity,total_phenols,alcohol title="Records behind this comparison"
```

## Takeaway

The group label supplies context for chemical comparisons, not a scale from bad wine to good wine. Avoid reusing the narrative of a quality-score example on a different source population.

## Limits

This is the UCI Wine recognition dataset, not the demo’s Wine Quality ratings. The publisher does not specify units for these assay fields; source units are retained. Cultivar labels are not quality rankings.
