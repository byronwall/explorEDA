# A pooled iris correlation is not a within-species relationship

**Reader question.** How does sepal length–width association change after retaining the species grouping?

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

## 1. One pooled cloud, no grouping

The fitted line describes every supplied flower together. It mixes between-species differences with within-species variation.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-1 x=sepal_length y=sepal_width regression=linear title="One pooled cloud, no grouping" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

## 2. Show the groups the pooled fit hid

Grouping makes the conditional comparisons explicit. These are descriptive straight fits, not independent tests of a causal model.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-2 x=sepal_length y=sepal_width color=species regression=linear title="Show the groups the pooled fit hid" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

**Computed finding.** The pooled sepal length–width correlation was -0.118. This calculation uses 150 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-iris-pooled-versus-grouped.json).

## 3. Sepal width differs across the groups

Group locations help explain why the pooled cloud can behave differently from each species cloud. A box still loses the paired length measurement.

```eda
boxplot @nb-iris-pooled-versus-grouped-chart-3 sepal_width color=species title="Sepal width differs across the groups" y.title="Sepal width (cm)"
```

## 4. The entire width distribution by species

Cumulative curves expose overlap and tails without relying on a fitted equation. They preserve the equal weighting of flowers.

```eda
ecdf @nb-iris-pooled-versus-grouped-chart-4 sepal_width color=species direction=below title="The entire width distribution by species" x.title="Sepal width (cm)"
```

**Computed finding.** Within setosa, the correlation was 0.743. This calculation uses 50 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-iris-pooled-versus-grouped.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-iris-pooled-versus-grouped-records species,sepal_length,sepal_width,petal_length title="Records behind this comparison"
```

## What the comparison supports

The pooled cloud combines within-group movement with differences between group centers. Report which population a correlation describes instead of calling one coefficient the relationship.

## Limits

Grouping is descriptive and does not prove a biological mechanism. Correlations use complete numerical pairs. Equal class counts in this teaching dataset should not be mistaken for natural species prevalence.

## Source and preparation

R. A. Fisher / UCI Machine Learning Repository; scikit-learn corrected variant; Creative Commons Attribution 4.0 International. Historical source version: scikit-learn 1.8.0; original historical series, not a live revision

Data credit and license: [iris provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/iris.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-iris-pooled-versus-grouped.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** sepal_length: centimetres; sepal_width: centimetres; petal_length: centimetres.
