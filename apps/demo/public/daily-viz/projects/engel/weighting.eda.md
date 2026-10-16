# The average household is not the average franc

**Reader question.** How much does the food-share summary change when income, rather than households, supplies the weights?

**Population.** one income quartile. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=bands
id:cat=bands.id label="Id"
income_band:cat=bands.income_band label="Income band"
households:num=bands.households label="Households (households)"
income_sum:num=bands.income_sum label="Income sum (Belgian francs, 1857)"
food_sum:num=bands.food_sum label="Food sum (Belgian francs, 1857)"
mean_share:num=bands.mean_share label="Mean share (%)"
median_share:num=bands.median_share label="Median share (%)"
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

**Computed finding.** Food expenditure divided by pooled income was 63.53%. This calculation uses 4 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-engel-weighting.json).

## 3. The denominators behind the ratio

The group totals explain why a pooled ratio cannot be obtained by taking an unweighted mean of the four displayed ratios.

```eda
scatter @nb-engel-weighting-chart-3 x=income_sum y=food_sum color=income_band title="The denominators behind the ratio" x.title="Income sum (Belgian francs, 1857)" y.title="Food sum (Belgian francs, 1857)"
```

## 4. How many households contribute to each group?

Nearly equal group sizes are a consequence of the quartile construction. Exact counts remain necessary when reconstructing the household-weighted overall mean.

```eda
scatter @nb-engel-weighting-chart-4 x=order y=households title="How many households contribute to each group?" x.title="Order" y.title="Households (households)"
```

**Computed finding.** The household-count-weighted mean of the quartile household means was 65.58%. This calculation uses 4 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-engel-weighting.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-engel-weighting-records income_band,households,income_sum,food_sum,mean_share,weighted_share title="Records behind this comparison"
```

## What the comparison supports

A change of weights is a change of question. State the denominator on the chart and retain group totals so the weighted rate can be reconstructed rather than averaged incorrectly.

## Limits

The grouping is based on sample income quartiles. Income-weighted ratios do not measure a typical household, while equally weighted means do not describe the allocation of all pooled income.

## Source and preparation

Engel historical Belgian household survey; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [engel provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/engel.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-engel-weighting.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** households: households; income_sum: Belgian francs per year, 1857; food_sum: Belgian francs per year, 1857; mean_share: % unweighted household mean; weighted_share: % income-weighted ratio.
