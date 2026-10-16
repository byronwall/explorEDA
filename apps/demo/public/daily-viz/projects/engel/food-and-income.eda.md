# Food spending can rise while its income share falls

**How do absolute food spending and the food budget share differ across these households?** Each row is one surveyed working-class household.

```eda
eda query=r
income:num=r.income label="Income (francs)"
foodexp:num=r.foodexp label="Food spending (francs)"
food_share:num=r.food_share label="Food share (%)"
income_band:cat=r.income_band label="Income band"
```

## 1. Food expenditure in historical francs

Both axes preserve the recorded monetary scale. More spending does not necessarily mean a larger fraction of the household budget.

```eda
scatter @nb-engel-food-and-income-chart-1 x=income y=foodexp opacity=0.6 title="Food expenditure in historical francs" x.title="Income (francs)" y.title="Food spending (francs)"
```

## 2. Replace the amount with its income share

The vertical denominator is the same income shown horizontally. The mathematical coupling should be acknowledged before proposing an economic explanation.

```eda
scatter @nb-engel-food-and-income-chart-2 x=income y=food_share opacity=0.6 title="Replace the amount with its income share" x.title="Income (francs)" y.title="Food share (%)"
```

**Finding.** Income and food expenditure had correlation 0.911.

## 3. Budget shares across income quartiles

Quartiles improve readability but erase within-group ordering. They are defined from this sample, not external income thresholds.

```eda
boxplot @nb-engel-food-and-income-chart-3 food_share color=income_band title="Budget shares across income quartiles" y.title="Food share (%)"
```

## 4. The observed distribution of food shares

The cumulative curve treats households equally. It answers a household question, not what fraction of all pooled francs was spent on food.

```eda
ecdf @nb-engel-food-and-income-chart-4 food_share direction=below title="The observed distribution of food shares" x.title="Food share (%)"
```

**Finding.** Income and food share had correlation -0.416.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-engel-food-and-income-records income,foodexp,food_share,income_band title="Records behind this comparison"
```

## Takeaway

Absolute spending and budget pressure are different measurements. Show the currency amount and the share together instead of declaring one the more truthful picture.

## Limits

The historical sample covers working-class Belgian households, not contemporary consumers. Household composition and other omitted factors may affect both income and food spending. Ratios share a denominator with income.
