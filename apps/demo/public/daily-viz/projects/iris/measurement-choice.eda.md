# Petals and sepals do not separate iris groups equally

**Reader question.** Which pairs of measured dimensions make the supplied species groups easier to distinguish?

**Population.** one sampled iris flower. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
sepal_length:num=r.sepal_length label="Sepal length (cm)"
sepal_width:num=r.sepal_width label="Sepal width (cm)"
petal_length:num=r.petal_length label="Petal length (cm)"
petal_width:num=r.petal_width label="Petal width (cm)"
species:cat=r.species label="Species"
petal_ratio:num=r.petal_ratio label="Petal ratio (length / width, dimensionless)"
```

## 1. Petal length against petal width

Each point is one flower. Consistent species colors support comparison, but points with the same measurements can overlap.

```eda
scatter @nb-iris-measurement-choice-chart-1 x=petal_length y=petal_width color=species title="Petal length against petal width" x.title="Petal length (cm)" y.title="Petal width (cm)"
```

## 2. Replace petals with sepals

This changes the projection while retaining the population. Any apparent loss of separation comes from the selected measurements, not a different sample.

```eda
scatter @nb-iris-measurement-choice-chart-2 x=sepal_length y=sepal_width color=species title="Replace petals with sepals" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

**Computed finding.** Mean petal length for setosa was 1.462 cm. This calculation uses 50 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-iris-measurement-choice.json).

## 3. Petal-length distributions by species

A one-dimensional summary sacrifices the joint relationship but makes the distribution centers and overlap easy to compare.

```eda
boxplot @nb-iris-measurement-choice-chart-3 petal_length color=species title="Petal-length distributions by species" y.title="Petal length (cm)"
```

## 4. Follow each flower through all four dimensions

Each polyline is one complete flower. Axes have their own scales, so a line’s angle is not a physical geometric angle of the specimen.

```eda
parallel @nb-iris-measurement-choice-chart-4 sepal_length,sepal_width,petal_length,petal_width color=species title="Follow each flower through all four dimensions"
```

**Computed finding.** Mean petal length for virginica was 5.552 cm. This calculation uses 50 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-iris-measurement-choice.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-iris-measurement-choice-records species,sepal_length,sepal_width,petal_length,petal_width title="Records behind this comparison"
```

## What the comparison supports

Choose measurements for the analytical question rather than assuming every two-dimensional projection is equally informative. Keep overlapping observations visible and avoid converting visual clusters into unsupported prediction claims.

## Limits

The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.

## Source and preparation

R. A. Fisher / UCI Machine Learning Repository; scikit-learn corrected variant; Creative Commons Attribution 4.0 International. Historical source version: scikit-learn 1.8.0; original historical series, not a live revision

Data credit and license: [iris provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/iris.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-iris-measurement-choice.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** sepal_length: centimetres; sepal_width: centimetres; petal_length: centimetres; petal_width: centimetres.
