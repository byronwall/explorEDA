# Why do customers return things in our stores?

This notebook reads the store sales and store returns tables from the retail
warehouse. It asks which return reasons and which product categories cost the
most, and how big returns are next to sales in each category.

## Return amount by reason

```eda
eda query=return-lines
group @byReason sum(returns.sr_return_amt) by=returns.reason
row returns.reason group=byReason title="Return amount by reason" {
  x.title="Returned amount ($)"
}
```

The warehouse names only 22 of the 76 reason codes. The other 54 appear as
"reason 23" to "reason 75". They are grouped here as "Unlabelled reason code".
Returns with no reason code at all form their own group, "No reason recorded".

## Return amount by category

```eda
group @byCat sum(returns.sr_return_amt) by=returns.category
row returns.category group=byCat title="Return amount by item category" {
  x.title="Returned amount ($)"
}
```

## Return rate by category

Rate is returned amount divided by sales amount (extended sales price) for the
same category.

```eda
field cat.return_rate format=percent precision=1
group @rate avg(cat.return_rate) by=returns.category
row returns.category group=rate title="Return rate by category (returned / sales)" {
  x.title="Return rate"
}
pivot @rates rows=returns.category title="Sales, returns and rate" {
  value avg(cat.sales) label="Sales ($)"
  value avg(cat.returned) label="Returned ($)"
  value avg(cat.return_rate) label="Return rate"
}
```

## Conclusion

Customers returned about $2.67M in the period. The reason field does not
explain most of it. About 70% of the returned amount ($1.88M) carries one of 54
reason codes that have no name in the reason table. Another 94 returns ($40.5K,
1.5%) have no reason code. The named reasons are small and close together. The
largest are "Not the product that was ordred" ($64K), "Not working any more"
($53K) and "Did not get it on time" ($41K).

By category, Children ($327K) and Shoes ($300K) cost the most, and Home ($225K)
costs the least. Rates fit this order. Children returns 6.2% of sales, Shoes 5.5%
and Sports 5.4%. Home returns 4.2% and Music 4.5%. The 7 returns with no item
category (about $8K) show as "Unknown".

Next step: fix the reason table so the 54 coded reasons get names. Until then,
reason-based cost cannot be trusted. Also note that 103 return lines have no
amount and add nothing to the totals.
