# Chemical profiles need separate axes, not one shared unit

**Reader question.** Which measurements dominate a raw numerical view of the wine assays?

**Population.** one Italian wine chemical analysis. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
alcohol:num=r.alcohol label="Alcohol (source units)"
malic_acid:num=r.malic_acid label="Malic acid (source units)"
ash:num=r.ash label="Ash (source units)"
ash_alkalinity:num=r.ash_alkalinity label="Ash alkalinity (source units)"
magnesium:num=r.magnesium label="Magnesium (source units)"
total_phenols:num=r.total_phenols label="Total phenols (source units)"
flavanoids:num=r.flavanoids label="Flavanoids (source units)"
nonflavanoid_phenols:num=r.nonflavanoid_phenols label="Nonflavanoid phenols (source units)"
proanthocyanins:num=r.proanthocyanins label="Proanthocyanins (source units)"
color_intensity:num=r.color_intensity label="Color intensity (source units)"
hue:num=r.hue label="Hue (source units)"
od_ratio:num=r.od_ratio label="Od ratio (source units)"
proline:num=r.proline label="Proline (source units)"
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
scatter @nb-wine-profile-scales-chart-2 x=proline y=alcohol color=cultivar title="Proline and alcohol remain in original units" x.title="Proline (source units)" y.title="Alcohol (source units)"
```

**Computed finding.** The maximum recorded proline value was 1680.0 source units. This calculation uses 178 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-wine-profile-scales.json).

## 3. Hue has its own numerical scale

A field with small numerical values can still separate groups. Magnitude in source units is not a measure of analytical importance.

```eda
boxplot @nb-wine-profile-scales-chart-3 hue color=cultivar title="Hue has its own numerical scale" y.title="Hue (source units)"
```

## 4. Proline has a much larger raw scale

Do not compare box heights across these two charts as if the vertical rulers were identical. Read each field’s label and unit caveat.

```eda
boxplot @nb-wine-profile-scales-chart-4 proline color=cultivar title="Proline has a much larger raw scale" y.title="Proline (source units)"
```

**Computed finding.** The maximum recorded hue value was 1.710 source units. This calculation uses 178 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-wine-profile-scales.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-wine-profile-scales-records cultivar,alcohol,malic_acid,magnesium,hue,proline title="Records behind this comparison"
```

## What the comparison supports

A multivariable view is useful when its axes acknowledge different measurements. Standardizing would answer a relative-position question, but it would erase the original units; this piece keeps the raw values.

## Limits

The assay fields have different source units and scales. Parallel-coordinate axes are separate, so steep segments do not measure chemical relationships directly. No classifier or quality model is evaluated.

## Source and preparation

S. Aeberhard and M. Forina / UCI Machine Learning Repository; scikit-learn distribution; Creative Commons Attribution 4.0 International. Historical source version: scikit-learn 1.8.0; original historical series, not a live revision

Data credit and license: [wine provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/wine.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-wine-profile-scales.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** alcohol: source assay units; publisher does not specify units; malic_acid: source assay units; publisher does not specify units; magnesium: source assay units; publisher does not specify units; hue: source assay units; publisher does not specify units; proline: source assay units; publisher does not specify units.
