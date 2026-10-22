# Petal length tells the three irises apart; sepal width cannot

**Which flower measurements tell the three iris species apart?** Each row is one of 150 iris flowers, four measurements each. The dataset is famous because the answer is so lopsided: a single cut on petal length names the species correctly for 95.3% of the flowers, while the best cut on sepal width is right for 59.3%.

```eda
eda query=r
sepal_length:num=r.sepal_length label="Sepal length (cm)"
sepal_width:num=r.sepal_width label="Sepal width (cm)"
petal_length:num=r.petal_length label="Petal length (cm)"
petal_width:num=r.petal_width label="Petal width (cm)"
species:cat=r.species label="Species"
```

## Petals put setosa in its own box

Plot petal width against petal length and setosa sits alone in the bottom left, with clear air around it. Versicolor and virginica touch along a short seam. Mean petal length for setosa was 1.462 cm. Mean petal length for virginica was 5.552 cm, nearly four times as long.

```eda
scatter @nb-iris-measurement-choice-chart-1 x=petal_length y=petal_width color=species title="Petal width against petal length, one point per flower" x.title="Petal length (cm)" y.title="Petal width (cm)" {
  region x=0.8..2.1 y=0..0.7 "Setosa: nothing else here"
}
```

## Sepals smear the same flowers together

Same 150 flowers, now placed by their sepals. Setosa still separates, mostly by being wide, but versicolor and virginica overlap across most of the plot. Versicolor's mean sepal width was 2.77 cm and virginica's was 2.97 cm, two tenths apart on a measurement that spans two centimeters.

```eda
scatter @nb-iris-measurement-choice-chart-2 x=sepal_length y=sepal_width color=species title="Sepal width against sepal length, one point per flower" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

## The petal seam is six millimeters wide

The boxes show where the overlap lives. The longest setosa petal was 1.9 cm and the shortest versicolor petal 3.0 cm, so a gap of more than a centimeter separates them. The shortest virginica petal was 4.5 cm and the longest versicolor petal 5.1 cm; the two dashed lines bracket the only flowers a petal-length rule can get wrong.

```eda
boxplot @nb-iris-measurement-choice-chart-3 petal_length color=species title="Petal length by species" y.title="Petal length (cm)" {
  rule y=4.5 "Shortest virginica petal"
  rule y=5.1 "Longest versicolor petal"
}
```

## Four axes, with the petals first

Each line is one flower. On the two petal axes the species stack in three bands with little crossing; on the two sepal axes the lines braid. The petal-length rule names the species correctly for 95.3% of the flowers. The best sepal-width rule names the species correctly for 59.3% of the flowers.

```eda
parallel @nb-iris-measurement-choice-chart-4 petal_length,petal_width,sepal_length,sepal_width color=species title="Four measurements, one line per flower"
```

## Takeaway

Petal length, or petal width, is nearly enough on its own; sepal width is barely better than guessing. The choice of measurement matters more than the choice of method, which is why this dataset has taught classification for ninety years.

## Limits

Fifty flowers per species from one collection, chosen for a classification exercise. The cuts here are read off this sample and would be tuned to it. Visual separation is not a tested classifier.
