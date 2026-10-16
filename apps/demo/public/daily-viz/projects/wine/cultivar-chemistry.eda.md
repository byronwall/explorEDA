# Wine chemistry is not a tasting score

**Reader question.** How do recorded flavanoids and color intensity differ across the supplied cultivar groups?

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

## 1. Flavanoids against color intensity

The two assays describe different measurements. Their numerical values cannot be compared as though both had one common physical unit.

```eda
scatter @nb-wine-cultivar-chemistry-chart-1 x=flavanoids y=color_intensity color=cultivar title="Flavanoids against color intensity" x.title="Flavanoids (source units)" y.title="Color intensity (source units)"
```

## 2. Flavanoid distributions by cultivar

Use the same field scale across groups. A difference in group center does not establish a difference in desirability or quality.

```eda
boxplot @nb-wine-cultivar-chemistry-chart-2 flavanoids color=cultivar title="Flavanoid distributions by cultivar" y.title="Flavanoids (source units)"
```

**Computed finding.** Mean flavanoids in Cultivar 1 were 2.982 source assay units. This calculation uses 59 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-wine-cultivar-chemistry.json).

## 3. Total phenols and flavanoids

A second chemical pair checks whether the grouping is visible beyond the first projection. The relationship remains observational.

```eda
scatter @nb-wine-cultivar-chemistry-chart-3 x=total_phenols y=flavanoids color=cultivar title="Total phenols and flavanoids" x.title="Total phenols (source units)" y.title="Flavanoids (source units)"
```

## 4. Color intensity across the same groups

The cumulative view compares all recorded intensities. It avoids inventing an assay threshold that the source did not define.

```eda
ecdf @nb-wine-cultivar-chemistry-chart-4 color_intensity color=cultivar direction=below title="Color intensity across the same groups" x.title="Color intensity (source units)"
```

**Computed finding.** Mean flavanoids in Cultivar 3 were 0.781 source assay units. This calculation uses 48 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-wine-cultivar-chemistry.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-wine-cultivar-chemistry-records cultivar,flavanoids,color_intensity,total_phenols,alcohol title="Records behind this comparison"
```

## What the comparison supports

The group label supplies context for chemical comparisons, not a scale from bad wine to good wine. Avoid reusing the narrative of a quality-score example on a different source population.

## Limits

This is the UCI Wine recognition dataset, not the demo’s Wine Quality ratings. The publisher does not specify units for these assay fields; source units are retained. Cultivar labels are not quality rankings.

## Source and preparation

S. Aeberhard and M. Forina / UCI Machine Learning Repository; scikit-learn distribution; Creative Commons Attribution 4.0 International. Historical source version: scikit-learn 1.8.0; original historical series, not a live revision

Data credit and license: [wine provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/wine.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-wine-cultivar-chemistry.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** alcohol: source assay units; publisher does not specify units; total_phenols: source assay units; publisher does not specify units; flavanoids: source assay units; publisher does not specify units; color_intensity: source assay units; publisher does not specify units.
