# Food took 70% of a poor household's income and 62% of a rich one's

**Do richer households spend more on food, or less?** Each row is one of 235 working-class Belgian households from an 1857 survey, with its yearly income and food spending in francs. Both answers are true, and that is Engel's law: richer households spent more francs on food and a smaller share of their income on it.

```eda
eda query=r
income:num=r.income label="Income (francs)"
foodexp:num=r.foodexp label="Food spending (francs)"
food_share:num=r.food_share label="Food share of income (%)"
income_band:cat=r.income_band label="Income quartile"
```

## Every extra franc of income bought more food

Each point is one household. The cloud follows the fitted line closely: income and food spending had correlation 0.911. The median household spent 583 francs on food in a year; the biggest food budget was 2,033 francs. The axis stops at 3,000 francs of income, which puts 1 household, the richest at 4,958 francs, off the right edge.

```eda
scatter @nb-engel-food-and-income-chart-1 x=income y=foodexp opacity=0.6 regression=linear x.max=3000 title="Food spending against income, 235 Belgian households, 1857" x.title="Income (francs)" y.title="Food spending (francs)"
```

## The share of income fell as income rose

Replace the francs with the fraction of income they represent. The line tilts the other way: income and food share had correlation -0.416. Food was the dominant expense for nearly everyone: 94.5% of households spent more than half their income on it. The same household sits above the right edge here too.

```eda
scatter @nb-engel-food-and-income-chart-2 x=income y=food_share opacity=0.6 regression=linear x.max=3000 title="Food share of income against income, 235 Belgian households, 1857" x.title="Income (francs)" y.title="Food share of income (%)" {
  rule y=50 "Half of income"
}
```

## From the poorest quarter to the richest, eight points

Split the households into income quartiles and compare the boxes. The median food share in the poorest quartile was 69.58%; in the richest quartile it was 61.83%. The two middle quartiles sit between them in order. The richest box is also the tallest: income freed from food went to different things in different households.

```eda
boxplot @nb-engel-food-and-income-chart-3 food_share color=income_band title="Food share of income by income quartile" y.title="Food share of income (%)"
```

## Takeaway

In 1857 Belgium, a household that earned twice as much spent more on food but not twice as much, so its food share fell from about seven-tenths of income toward six-tenths. Both readings are right; the share is the one that says what the extra income was for.

## Limits

Working-class households in one Belgian survey, with no record of household size or prices. The share divides food spending by the same income that sits on the horizontal axis, which pulls the second correlation negative on its own.
