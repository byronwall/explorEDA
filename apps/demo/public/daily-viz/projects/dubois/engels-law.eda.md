# Du Bois's Atlanta families spent 43% on food at the bottom and 29% at the top

**Did Black families in 1900 Atlanta follow Engel's law, spending a smaller share on food as income rose?** Each row is one spending category in one income class from W. E. B. Du Bois's plate for the 1900 Paris Exposition: seven annual income classes of 150 families, from $100–200 a year to $1,000 and over, each with its families' average income and the share of it that went to rent, food, clothes, direct taxes, and everything else, including savings. Engel's law, stated from Belgian household budgets in 1857, says the food share falls as income rises. Du Bois's families confirm it, and show where the money went instead.

```eda
eda query=shares
class:cat=shares.Class label="Income class ($ a year)"
order:num=shares.Order label="Class order"
income:num="shares.Average income" label="Average income ($ a year)"
category:cat=shares.Category label="Category"
share:num=shares.Share label="Share of spending (%)"
dollars:num=dollars label="Spending ($ a year)"
scale @cats field=shares.Category map=Rent:#2b2b2b,Food:#b5485d,Clothes:#d9a441,"Direct taxes":#8a8a8a,"Other expenses and savings":#c9b79c
group @byclass sum(share) by=class
```

## Food fell from 43% to 29% of spending as income rose

Read the bars from the poorest class on the left to the richest on the right. The $100–200 class spent 43.0% of its income on food; the $1,000-and-over class spent 29.0%. The share of spending on food and income had correlation -0.793 across the seven classes. The two richest classes paid no rent at all: they owned their homes.

```eda
bar @nb-dubois-engels-law-1 class seriesField=category seriesLayout=percent group=byclass colorScale=cats categoryOrder=data title="Shares of spending by income class, 150 Atlanta families, 1900" y.title="Share of spending (%)" x.title="Income class ($ a year)"
```

## What food gave up, savings took

Each line is one category's share across the seven classes, by average income. Food and clothes fall; "other expenses and savings" rises from 9.9% in the poorest class to 50.5% in the richest. Rent peaks at 23.0% in the $300–400 class and then falls to zero. Direct taxes never pass 8.0%.

```eda
scatter @nb-dubois-engels-law-2 x=income y=share color=category colorScale=cats title="Share of spending by category against average income" x.title="Average income ($ a year)" y.title="Share of spending (%)" pointSize=4 {
  connect.groupField=shares.Category connect.orderField=shares.Order connect.labels=end
  callout "Food, poorest class" on="shares.Class":"$100–200",shares.Category:Food offset=20,-30
}
```

## In dollars, food spending still rose fivefold

A falling share of a rising income can still be more money. The poorest class spent $59.8 a year on food and the richest $326.2, 5.5 times as much, while the richest class's income was 8.1 times the poorest's. Spending on other expenses and savings rose from $13.8 a year to $568.1.

```eda
bar @nb-dubois-engels-law-3 class seriesField=category seriesLayout=stacked group=bydollars colorScale=cats categoryOrder=data title="Spending by income class, in dollars a year" y.title="Spending ($ a year)" x.title="Income class ($ a year)"
group @bydollars sum(dollars) by=class
```

## Takeaway

Engel's law held in Atlanta in 1900 exactly as it had in Belgium in 1857: the food share fell by a third from the poorest class to the richest. The difference between the classes was not what they ate but what they could keep. Half of the richest class's income went to savings and other expenses; a tenth of the poorest class's did.

## Limits

Seven class averages read from a hand-drawn plate, not 150 household records, so there is no spread within a class and the correlation is over seven points. The classes are income bands of unequal width, and the top band is open. "Other expenses and savings" is a residual that mixes the two, and the plate does not separate them.
