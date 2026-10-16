# One wine assay reads in the thousands; another under two

**Why can't thirteen wine assays share one axis?** Each row is one Italian wine chemical analysis.

```eda
eda query=r
alcohol:num=r.alcohol label="Alcohol (% vol)"
malic_acid:num=r.malic_acid label="Malic acid (g/L)"
magnesium:num=r.magnesium label="Magnesium (mg/L)"
flavanoids:num=r.flavanoids label="Flavanoids"
color_intensity:num=r.color_intensity label="Color intensity"
hue:num=r.hue label="Hue"
proline:num=r.proline label="Proline (mg/L)"
cultivar:cat=r.cultivar label="Cultivar"
```

## 1. One wine across selected assay axes

Separate axes stop the numerically largest field from compressing every other measure. The display does not make unlike units additive.

```eda
parallel @nb-wine-profile-scales-chart-1 alcohol,malic_acid,magnesium,flavanoids,color_intensity,proline color=cultivar title="One wine across selected assay axes"
```

## 2. Proline and alcohol remain in original units

A conventional paired plot restores explicit two-axis interpretation. It helps test an impression formed in the denser profile view.

```eda
scatter @nb-wine-profile-scales-chart-2 x=proline y=alcohol color=cultivar title="Proline and alcohol remain in original units" x.title="Proline (mg/L)" y.title="Alcohol (% vol)"
```

**Finding.** The maximum recorded proline value was 1680.0 source units.

## 3. Hue has its own numerical scale

A field with small numerical values can still separate groups. Magnitude in source units is not a measure of analytical importance.

```eda
boxplot @nb-wine-profile-scales-chart-3 hue color=cultivar title="Hue has its own numerical scale" y.title="Hue"
```

## 4. Proline has a much larger raw scale

Do not compare box heights across these two charts as if the vertical rulers were identical. Read each field’s label and unit caveat.

```eda
boxplot @nb-wine-profile-scales-chart-4 proline color=cultivar title="Proline has a much larger raw scale" y.title="Proline (mg/L)"
```

**Finding.** The maximum recorded hue value was 1.710 source units.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-wine-profile-scales-records cultivar,alcohol,malic_acid,magnesium,hue,proline title="Records behind this comparison"
```

## Takeaway

A multivariable view is useful when its axes acknowledge different measurements. Standardizing would answer a relative-position question, but it would erase the original units; this piece keeps the raw values.

## Limits

The assay fields have different source units and scales. Parallel-coordinate axes are separate, so steep segments do not measure chemical relationships directly. No classifier or quality model is evaluated.
