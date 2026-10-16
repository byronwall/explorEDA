# Two interest-rate lines become one historical spread

**How wide was the gap between Danish bond and deposit rates?** Each row is one Danish calendar quarter.

```eda
eda query=r
period:cat=r.period label="Period"
ibo:num=r.ibo label="Bond rate"
ide:num=r.ide label="Deposit rate"
date:date=r.date label="Date"
spread:num=r.spread label="Bond − deposit rate"
era:cat=r.era label="Era"
```

## 1. The two historical rate series

Use one shared fraction scale. Do not format these source fractions as percent values without explicitly multiplying by a hundred.

```eda
line @nb-danish-rate-spread-chart-1 x=date y=ibo,ide title="The two historical rate series" x.title="Date" y.title="Ibo (source rate fractions) / Ide (source rate fractions)"
```

## 2. The spread relative to equality

The zero reference follows from the definition of the subtraction. A positive spread says which source rate is larger, not which asset is preferable.

```eda
line @nb-danish-rate-spread-chart-2 x=date y=spread title="The spread relative to equality" x.title="Date" y.title="Bond − deposit rate" {
  rule y=0 "Equal source rates"
}
```

**Finding.** The smallest recorded bond-minus-deposit spread was 0.0253 in source rate fractions.

## 3. Spread distributions across two historical spans

The broad split is descriptive. It is not evidence that an unmodeled regime change occurred at the boundary.

```eda
boxplot @nb-danish-rate-spread-chart-3 spread color=era title="Spread distributions across two historical spans" y.title="Bond − deposit rate"
```

## 4. The level of the bond rate and the spread

The bond rate appears on both sides of this comparison because it is part of the spread. That arithmetic coupling limits interpretation of a correlation.

```eda
scatter @nb-danish-rate-spread-chart-4 x=ibo y=spread title="The level of the bond rate and the spread" x.title="Bond rate" y.title="Bond − deposit rate"
```

**Finding.** The largest recorded spread was 0.1050 in source rate fractions.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-danish-rate-spread-records period,ibo,ide,spread,era title="Records behind this comparison"
```

## Takeaway

Subtracting the two source fractions makes their difference directly readable. Retain the original lines so a wider spread can be distinguished from movement in both rates together.

## Limits

The displayed rates are historical source fractions, not current quoted products. A spread is not a total investment return, and the observations support no recommendation about present borrowing or investing.
