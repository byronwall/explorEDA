# A dollar in Tesla grew seventy-fold; in IBM, it barely moved

**How differently did fourteen big technology stocks grow from 2010 to 2022?** Each row is one company's opening share price on one trading day, sampled every fifth day. On one dollar axis the answer is invisible; one panel per company shows seventy-fold growth beside a flat line, and a 2022 drawdown that spared almost no one.

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

## One panel each, and every shape appears

Small multiples give each company its own frame, so every path's shape is visible. Netflix's highest opening price in the sample was $690.00, in November 2021, and IBM never opened above $203.56, a 2013 high it never regained.

```eda
line @nb-bigtech-growth-2 x=date y=open color=company title="Opening share price, one panel per company" x.title="Date" y.title="Opening price ($)" {
  time.interval=week time.aggregation=average time.measureField=open time.splitField=company facet.enabled=true facet.type=wrap facet.rowVariable=prices.Company facet.columnCount=4
}
```

## From the late-2021 peak, Netflix lost three-quarters

Five of the fourteen over the fourteen months from November 2021. Netflix, Microsoft, Adobe, Amazon, Alphabet, and Salesforce all peaked in the same sampled week, November 17, 2021, but the falls that followed were not alike. Netflix's lowest open in the window was $174.00, down from its $690 peak. Tesla's lowest was $117.50, from $387. Microsoft's lowest was $227.62, a third below its peak, and Apple's $127.99.

```eda
scale @companies field=prices.Company map=Adobe:#d62728,Alphabet:#2ca02c,Amazon.com:#ff7f0e,Apple:#9467bd,"Cisco Systems":#7f7f7f,Intel:#17becf,"International Business Machines":#1f77b4,"Meta Platforms":#bcbd22,Microsoft:#8c564b,NVIDIA:#76b900,Netflix:#e50914,Oracle:#e377c2,Salesforce:#00a1e0,Tesla:#cc5500
line @nb-bigtech-growth-3 x=date y=open color=company where.date=2021-11-01..2022-12-31 where.company=Netflix,Tesla,NVIDIA,Microsoft,Apple title="Opening share price, November 2021 to December 2022, five companies" x.title="Date" y.title="Opening price ($)" {
  time.interval=month time.aggregation=average time.measureField=open time.splitField=company
  rule x=2021-11-17 "November 17 peaks"
}
```

## Takeaway

From the first trading day of 2010 to the end of 2022, Tesla's opening price rose about 70-fold, Netflix's 36-fold, and NVIDIA's 31-fold, while IBM and Intel ended near where they began. A shared axis hides most of that; small multiples show it.

## Limits

Prices are not adjusted for dividends, so total return is understated for IBM and Intel. Meta's series starts at its 2012 listing and Tesla's at its 2010 listing.
