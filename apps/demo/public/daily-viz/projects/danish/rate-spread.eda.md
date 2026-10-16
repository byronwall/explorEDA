# Two interest-rate lines become one historical spread

**Reader question.** How large is the recorded bond-rate minus deposit-rate spread?

**Population.** one Danish calendar quarter. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
period:cat=r.period label="Period"
lrm:num=r.lrm label="Lrm (log real money, source definition)"
lry:num=r.lry label="Lry (log real income, source definition)"
lpy:num=r.lpy label="Lpy (log price level)"
ibo:num=r.ibo label="Ibo (source rate fractions)"
ide:num=r.ide label="Ide (source rate fractions)"
year:num=r.year label="Year"
quarter:num=r.quarter label="Quarter"
date:date=r.date label="Calendar date"
money_index:num=r.money_index label="Money index (first quarter = 100)"
income_index:num=r.income_index label="Income index (first quarter = 100)"
dmoney:num=r.dmoney label="Dmoney (quarterly log change)"
dincome:num=r.dincome label="Dincome (quarterly log change)"
spread:num=r.spread label="Spread (source rate fractions)"
era:cat=r.era label="Era"
```

## 1. The two historical rate series

Use one shared fraction scale. Do not format these source fractions as percent values without explicitly multiplying by a hundred.

```eda
line @nb-danish-rate-spread-chart-1 x=date y=ibo,ide title="The two historical rate series" x.title="Calendar date" y.title="Ibo (source rate fractions) / Ide (source rate fractions)"
```

## 2. The spread relative to equality

The zero reference follows from the definition of the subtraction. A positive spread says which source rate is larger, not which asset is preferable.

```eda
line @nb-danish-rate-spread-chart-2 x=date y=spread title="The spread relative to equality" x.title="Calendar date" y.title="Spread (source rate fractions)" {
  rule y=0 "Equal source rates"
}
```

**Computed finding.** The smallest recorded bond-minus-deposit spread was 0.0253 in source rate fractions. This calculation uses 55 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-danish-rate-spread.json).

## 3. Spread distributions across two historical spans

The broad split is descriptive. It is not evidence that an unmodeled regime change occurred at the boundary.

```eda
boxplot @nb-danish-rate-spread-chart-3 spread color=era title="Spread distributions across two historical spans" y.title="Spread (source rate fractions)"
```

## 4. The level of the bond rate and the spread

The bond rate appears on both sides of this comparison because it is part of the spread. That arithmetic coupling limits interpretation of a correlation.

```eda
scatter @nb-danish-rate-spread-chart-4 x=ibo y=spread title="The level of the bond rate and the spread" x.title="Ibo (source rate fractions)" y.title="Spread (source rate fractions)"
```

**Computed finding.** The largest recorded spread was 0.1050 in source rate fractions. This calculation uses 55 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-danish-rate-spread.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-danish-rate-spread-records period,ibo,ide,spread,era title="Records behind this comparison"
```

## What the comparison supports

Subtracting the two source fractions makes their difference directly readable. Retain the original lines so a wider spread can be distinguished from movement in both rates together.

## Limits

The displayed rates are historical source fractions, not current quoted products. A spread is not a total investment return, and the observations support no recommendation about present borrowing or investing.

## Source and preparation

Johansen and Juselius; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [danish provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/danish.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-danish-rate-spread.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** ibo: source bond-rate units (fraction); ide: source deposit-rate units (fraction); spread: difference in source rate fractions.
