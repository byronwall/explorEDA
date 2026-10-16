# Petals separate iris species; sepals blur them

**Which flower measurements tell the three iris species apart?** Each row is one sampled iris flower.

```eda
eda query=r
sepal_length:num=r.sepal_length label="Sepal length (cm)"
sepal_width:num=r.sepal_width label="Sepal width (cm)"
petal_length:num=r.petal_length label="Petal length (cm)"
petal_width:num=r.petal_width label="Petal width (cm)"
species:cat=r.species label="Species"
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

**Finding.** Mean petal length for setosa was 1.462 cm.

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

**Finding.** Mean petal length for virginica was 5.552 cm.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-iris-measurement-choice-records species,sepal_length,sepal_width,petal_length,petal_width title="Records behind this comparison"
```

## Takeaway

Choose measurements for the analytical question rather than assuming every two-dimensional projection is equally informative. Keep overlapping observations visible and avoid converting visual clusters into unsupported prediction claims.

## Limits

The classic sample has a deliberately limited species population and is not a survey of all irises. The scikit-learn corrected variant is preserved. Visual separation is not an evaluated classifier accuracy.
