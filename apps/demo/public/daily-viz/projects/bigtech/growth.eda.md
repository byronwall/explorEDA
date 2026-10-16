# A dollar in Tesla grew seventy-fold; in IBM, it barely moved

**How differently did fourteen big technology stocks grow from 2010 to 2022?** Each row is one company's opening share price on one trading day, sampled every fifth day.

```eda
eda query=prices
company:cat=prices.Company label="Company"
date:date=prices.Date label="Date"
open:num=prices.Open label="Opening price ($)"
```

## Fourteen paths on one dollar axis

On a shared dollar scale, the expensive shares dominate and the cheap ones flatten into the floor. Adobe and Netflix spike in 2021; most of the field looks still.

```eda
line @nb-bigtech-growth-1 x=date y=open color=company title="Opening share price" x.title="Date" y.title="Opening price ($)" {
  time.interval=week time.aggregation=average time.measureField=open time.splitField=company
}
```

## One panel each

Small multiples give each company its own frame, so every path's shape is visible. The 2022 drawdown hits almost every panel at once.

```eda
line @nb-bigtech-growth-2 x=date y=open color=company title="Opening share price, one panel per company" x.title="Date" y.title="Opening price ($)" {
  time.interval=week time.aggregation=average time.measureField=open time.splitField=company facet.enabled=true facet.type=wrap facet.rowVariable=prices.Company facet.columnCount=4
}
```

**Finding.** Netflix's highest opening price in the sample was $690.00.

**Finding.** IBM never opened above $203.56.

## How spread out each company's prices were

```eda
boxplot @nb-bigtech-growth-3 open color=company title="Range of opening prices by company" y.title="Opening price ($)"
```

## Takeaway

From the first trading day of 2010 to the end of 2022, Tesla's opening price rose about 70-fold, Netflix's 36-fold, and NVIDIA's 31-fold, while IBM and Intel ended near where they began. A shared axis hides most of that; small multiples show it.

## Limits

Prices are not adjusted for dividends, so total return is understated for IBM and Intel. Meta's series starts at its 2012 listing and Tesla's at its 2010 listing.
