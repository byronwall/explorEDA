# How much do extreme flow years move the Nile average?

**How much do the wettest and driest years move the Nile average?** Each row is one annual flow observation at Aswan.

```eda
eda query=r
year:num=r.year label="Year"
volume:num=r.volume label="Annual flow (10⁸ m³)"
rank:num=r.rank label="Percentile rank"
tail:cat=r.tail label="Tail"
```

## 1. Annual flow has a distribution, not one typical value

Start with all years. The bins make the tails visible without classifying any annual measurement as an error.

```eda
hist @nb-nile-tail-sensitivity-chart-1 volume bins=18 title="Annual flow has a distribution, not one typical value" x.title="Annual flow (10⁸ m³)" y.title="Rows"
```

## 2. Locate the tail years in time

Color adds the explicit analytical grouping while leaving chronology intact. It does not label the years using an external flood or drought definition.

```eda
scatter @nb-nile-tail-sensitivity-chart-2 x=year y=volume color=tail title="Locate the tail years in time" x.title="Year" y.title="Annual flow (10⁸ m³)"
```

**Finding.** The mean across every year was 919.35 ×10^8 m³.

## 3. A threshold view of every annual value

The cumulative curve allows direct inspection of tail boundaries. It retains every year, including values the sensitivity calculation does not average.

```eda
ecdf @nb-nile-tail-sensitivity-chart-3 volume direction=below title="A threshold view of every annual value" x.title="Annual flow (10⁸ m³)"
```

## 4. The selected middle versus the two tails

This is a view of subsets chosen by the outcome itself. Their separation is built into the rule and is not an independently discovered relationship.

```eda
boxplot @nb-nile-tail-sensitivity-chart-4 volume color=tail title="The selected middle versus the two tails" y.title="Annual flow (10⁸ m³)"
```

**Finding.** The mean between the declared tail cutoffs was 915.25 ×10^8 m³.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-nile-tail-sensitivity-records year,volume,rank,tail title="Records behind this comparison"
```

## Takeaway

Keep the tail years visible and explain why a robust summary differs from the ordinary mean. Removing an inconvenient extreme without a stated rule would change the population silently.

## Limits

Tail labels use the sample’s linear 10th and 90th percentiles. They are not flood or drought standards. The middle group is a sensitivity comparison, not a corrected replacement dataset.
