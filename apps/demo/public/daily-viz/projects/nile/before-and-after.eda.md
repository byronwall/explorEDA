# The Nile carried 22% less water after 1898

**How different are Nile flows before and after 1898?** Each row is one annual flow observation at Aswan.

```eda
eda query=r
year:num=r.year label="Year"
volume:num=r.volume label="Annual flow (10⁸ m³)"
era:cat=r.era label="Era"
```

## 1. Annual flow across the chosen boundary

The line preserves individual wet and dry years. The marked year defines the comparison; it does not prove why the distribution differs.

```eda
line @nb-nile-before-and-after-chart-1 x=year y=volume title="Annual flow across the chosen boundary" x.title="Year" y.title="Annual flow (10⁸ m³)" {
  rule x=1898 "Comparison boundary"
}
```

## 2. Two eras, the same volume scale

Compare the medians and middle halves while keeping extreme annual volumes visible. Different sample lengths are not automatically comparable precision.

```eda
boxplot @nb-nile-before-and-after-chart-2 volume color=era title="Two eras, the same volume scale" y.title="Annual flow (10⁸ m³)"
```

**Finding.** Mean annual volume before 1898 was 1097.67 ×10^8 m³.

## 3. How much do the era distributions overlap?

Cumulative curves make it possible to compare more than their centers. Crossing curves would warn against describing one era as uniformly lower.

```eda
ecdf @nb-nile-before-and-after-chart-3 volume color=era direction=below title="How much do the era distributions overlap?" x.title="Annual flow (10⁸ m³)"
```

## 4. Years contributing to each era

The later era contributes more observations. This count is the denominator for each era summary, not an adjustment for serial correlation.

```eda
row @nb-nile-before-and-after-chart-4 era title="Years contributing to each era" x.title="Rows"
```

**Finding.** Mean annual volume from 1898 onward was 853.40 ×10^8 m³.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-nile-before-and-after-records year,volume,era title="Records behind this comparison"
```

## Takeaway

Compare both location and overlap rather than allowing a vertical reference line to imply a causal experiment. The unequal era lengths remain visible in the count chart.

## Limits

The cutoff is an explicit historical comparison, not a randomized intervention. Many environmental and measurement factors could differ across eras. Annual volumes are measured at Aswan, not all reaches of the Nile.
