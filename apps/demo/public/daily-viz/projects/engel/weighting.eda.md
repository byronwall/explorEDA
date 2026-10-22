# Food took 64% of all income, but more of the typical household's

**What share of income went to food: 64% or 66%?** Each row is one income quartile of the 235 Belgian households in the 1857 Engel survey, with the quartile's total income, total food spending, and mean household food share. Pool every franc and food took 63.53% of income. Average the households and the mean food share was 65.58%. The two-point gap is the richest quartile's weight.

```eda
eda query=bands
income_band:cat=bands.income_band label="Income quartile"
households:num=bands.households label="Households"
income_sum:num=bands.income_sum label="Total income (francs)"
food_sum:num=bands.food_sum label="Total food spending (francs)"
mean_share:num=bands.mean_share label="Mean household share (%)"
weighted_share:num=bands.weighted_share label="Pooled share (%)"
order:num=bands.order label="Quartile (1 = poorest)"
```

## Inside a quartile, weighting barely matters

Two shares per quartile: the mean of its households' shares, and its pooled food francs over its pooled income francs. The lines almost coincide. In the poorest quartile the mean household share was 69.73%; in the richest it was 60.11%, and the richest quartile's pooled share was 58.85%. The gap opens only at the top, where incomes spread out.

```eda
line @nb-engel-weighting-chart-1 x=order y=mean_share,weighted_share title="Food share by income quartile, two ways of averaging" x.title="Income quartile (1 = poorest)" x.ticks=4 y.title="Food share of income (%)" {
  rule y=63.53 "All households pooled"
}
```

## The richest quarter held 42% of the francs

The pooled share is an income-weighted average, and here is the weighting. The richest quartile earned 42.12% of all income in the survey but spent 39.02% of all food francs. Pooling the whole survey hands that quartile, with the lowest food share, three times the weight of the poorest.

```eda
group @income sum(income_sum) by=income_band
row @nb-engel-weighting-chart-2 income_band group=income title="Total income by quartile, 235 households" x.title="Total income (francs)" {
  callout "42% of all income" category="Q4 highest income" offset=-110,44
}
```

## The four rows that make the argument

Every number above comes from these four rows. Divide each quartile's food total by its income total to recover its pooled share; divide the grand totals to get 63.53%.

```eda
table @nb-engel-weighting-chart-3 income_band,households,income_sum,food_sum,mean_share,weighted_share title="Income quartiles of the 1857 Engel survey"
```

## Takeaway

Food took 64% of the survey's income and 66% of a typical household's: the difference is whether a rich household counts once or by its francs. Report the one that matches the question, and say which it is.

## Limits

Four summary rows of a 235-household survey. Quartiles are cut on this sample's incomes, with 58 or 59 households each. No prices, household sizes, or non-food categories are recorded.
