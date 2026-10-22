# Pooled, iris sepals look unrelated; within each species they grow together

**Does sepal width rise with sepal length?** Each row is one of 150 iris flowers, 50 from each of three species, measured by Edgar Anderson in 1935. Ask the question of all 150 at once and the answer is no. Ask it of any one species and the answer is yes. The pooled correlation was -0.118; within setosa it was 0.743.

```eda
eda query=r
sepal_length:num=r.sepal_length label="Sepal length (cm)"
sepal_width:num=r.sepal_width label="Sepal width (cm)"
species:cat=r.species label="Species"
```

## Pool the species and the line goes flat

One fit through every flower slopes slightly downward. Sepal length and sepal width had correlation -0.118 across all 150 flowers. The cloud in the box is the reason: setosa has the shortest sepals and the widest, so it sits high on the left and drags the line down to the right.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-1 x=sepal_length y=sepal_width regression=linear title="Sepal width against sepal length, all 150 flowers" x.title="Sepal length (cm)" y.title="Sepal width (cm)" {
  region x=4.2..5.9 y=2.2..4.5 "Setosa: short and wide"
}
```

## Within each species, width rises with length

Color the same points by species and fit each one alone: all three lines slope upward. Within setosa, the correlation was 0.743. Within versicolor it was 0.526, and within virginica 0.457. Setosa's mean sepal width was 3.43 cm, against 2.77 cm for versicolor, a gap of two thirds of a centimeter between the species with the shortest sepals and the one next to it.

```eda
scatter @nb-iris-pooled-versus-grouped-chart-2 x=sepal_length y=sepal_width color=species regression=linear title="Sepal width against sepal length, fitted per species" x.title="Sepal length (cm)" y.title="Sepal width (cm)"
```

## Setosa is the shortest species and the widest

The boxes show why the pooled line tilts the wrong way. Setosa's mean sepal length was 5.01 cm and virginica's 6.59 cm, yet setosa has the widest sepals of the three, and alone sits above the dashed line: the mean sepal width of all 150 flowers was 3.06 cm. Between species, longer goes with narrower; within each species, longer goes with wider, and the pooled fit averages the two into nothing.

```eda
boxplot @nb-iris-pooled-versus-grouped-chart-3 sepal_width color=species title="Sepal width by species" y.title="Sepal width (cm)" {
  rule y=3.06 "All flowers: 3.06 cm"
}
```

## Takeaway

Sepal width does rise with sepal length, in every species. The pooled coefficient near zero is not a weaker version of that fact but a different one: it measures the differences between species, which run the other way. Say which population a correlation describes.

## Limits

Fifty flowers per species from one collection, chosen for a classification exercise; equal counts are a design choice, not a prevalence. The fits are descriptive lines, not a model of how a flower grows.
