# Pooled, iris sepals look unrelated; within a species they move together

**Does sepal width rise with sepal length?** Each row is one sampled iris flower.

```eda
eda query=r
sepal_length:num=r.sepal_length label="Sepal length (cm)"
sepal_width:num=r.sepal_width label="Sepal width (cm)"
petal_length:num=r.petal_length label="Petal length (cm)"
species:cat=r.species label="Species"
```

## 1. One pooled cloud, no grouping

The fitted line describes every flower together. It mixes between-species differences with within-species variation.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-1 x=sepal_length y=sepal_width regression=linear title="One pooled cloud, no grouping" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

## 2. Show the groups the pooled fit hid

Grouping makes the conditional comparisons explicit. These are descriptive straight fits, not independent tests of a causal model.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-2 x=sepal_length y=sepal_width color=species regression=linear title="Show the groups the pooled fit hid" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

**Finding.** The pooled sepal length–width correlation was -0.118.

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

**Finding.** Within setosa, the correlation was 0.743.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-iris-pooled-versus-grouped-records species,sepal_length,sepal_width,petal_length title="Records behind this comparison"
```

## Takeaway

The pooled cloud combines within-group movement with differences between group centers. Report which population a correlation describes instead of calling one coefficient the relationship.

## Limits

Grouping is descriptive and does not prove a biological mechanism. Correlations use complete numerical pairs. Equal class counts in this teaching dataset should not be mistaken for natural species prevalence.
