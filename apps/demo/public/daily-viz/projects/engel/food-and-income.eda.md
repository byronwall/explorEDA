# Food spending can rise while its income share falls

**Reader question.** How do absolute food spending and the food budget share differ across these households?

**Population.** one surveyed working-class household. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
income:num=r.income label="Income (Belgian francs, 1857)"
foodexp:num=r.foodexp label="Foodexp (Belgian francs, 1857)"
food_share:num=r.food_share label="Food share (%)"
income_band:cat=r.income_band label="Income band"
```

## 1. Food expenditure in historical francs

Both axes preserve the recorded monetary scale. More spending does not necessarily mean a larger fraction of the household budget.

```eda
scatter @nb-engel-food-and-income-chart-1 x=income y=foodexp opacity=0.6 title="Food expenditure in historical francs" x.title="Income (Belgian francs, 1857)" y.title="Foodexp (Belgian francs, 1857)"
```

## 2. Replace the amount with its income share

The vertical denominator is the same income shown horizontally. The mathematical coupling should be acknowledged before proposing an economic explanation.

```eda
scatter @nb-engel-food-and-income-chart-2 x=income y=food_share opacity=0.6 title="Replace the amount with its income share" x.title="Income (Belgian francs, 1857)" y.title="Food share (%)"
```

**Computed finding.** Income and food expenditure had correlation 0.911. This calculation uses 235 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-engel-food-and-income.json).

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

**Computed finding.** Income and food share had correlation -0.416. This calculation uses 235 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-engel-food-and-income.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-engel-food-and-income-records income,foodexp,food_share,income_band title="Records behind this comparison"
```

## What the comparison supports

Absolute spending and budget pressure are different measurements. Show the currency amount and the share together instead of declaring one the more truthful picture.

## Limits

The historical sample covers working-class Belgian households, not contemporary consumers. Household composition and other omitted factors may affect both income and food spending. Ratios share a denominator with income.

## Source and preparation

Engel historical Belgian household survey; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [engel provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/engel.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-engel-food-and-income.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** income: Belgian francs per year, 1857; foodexp: Belgian francs per year, 1857; food_share: % household income spent on food.
