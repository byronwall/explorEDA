# Food took 64% of all income, but more of the typical household's

**Does the food share change when you weight by francs instead of households?** Each row is one income quartile.

```eda
eda query=bands
income_band:cat=bands.income_band label="Income band"
households:num=bands.households label="Households"
income_sum:num=bands.income_sum label="Total income (francs)"
food_sum:num=bands.food_sum label="Total food spending (francs)"
mean_share:num=bands.mean_share label="Mean share (%)"
weighted_share:num=bands.weighted_share label="Weighted share (%)"
order:num=bands.order label="Order"
```

## 1. Two legitimate shares for each income group

Compare an equally weighted household mean with the group’s pooled-franc ratio. Their difference is about weights, not rounding.

```eda
scatter @nb-engel-weighting-chart-1 x=mean_share y=weighted_share color=income_band title="Two legitimate shares for each income group" x.title="Mean share (%)" y.title="Weighted share (%)"
```

## 2. Follow the groups from lower to higher income

The ordered line makes the comparison compact. The horizontal steps are quartile positions, not equal intervals of income.

```eda
line @nb-engel-weighting-chart-2 x=order y=mean_share,weighted_share title="Follow the groups from lower to higher income" x.title="Order" y.title="Mean share (%) / Weighted share (%)"
```

**Finding.** Food expenditure divided by pooled income was 63.53%.

## 3. The denominators behind the ratio

The group totals explain why a pooled ratio cannot be obtained by taking an unweighted mean of the four displayed ratios.

```eda
scatter @nb-engel-weighting-chart-3 x=income_sum y=food_sum color=income_band title="The denominators behind the ratio" x.title="Total income (francs)" y.title="Total food spending (francs)"
```

## 4. How many households contribute to each group?

Nearly equal group sizes are a consequence of the quartile construction. Exact counts remain necessary when reconstructing the household-weighted overall mean.

```eda
scatter @nb-engel-weighting-chart-4 x=order y=households title="How many households contribute to each group?" x.title="Order" y.title="Households"
```

**Finding.** The household-count-weighted mean of the quartile household means was 65.58%.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-engel-weighting-records income_band,households,income_sum,food_sum,mean_share,weighted_share title="Records behind this comparison"
```

## Takeaway

A change of weights is a change of question. State the denominator on the chart and retain group totals so the weighted rate can be reconstructed rather than averaged incorrectly.

## Limits

The grouping is based on sample income quartiles. Income-weighted ratios do not measure a typical household, while equally weighted means do not describe the allocation of all pooled income.
