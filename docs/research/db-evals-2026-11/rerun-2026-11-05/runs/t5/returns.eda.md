# Why do customers return things in our stores?

Store returns total about $2.72M across 2,910 lines. This notebook splits the money by reason and by item category, then compares returns with store sales.

```eda
eda query=returns-detail
amt:num=store_returns.sr_return_amt
reason:cat=why
cat:cat=cat
group @byReason sum(amt) by=reason
group @byCat sum(amt) by=cat
metric @total sum(amt)
```

## Return amount by reason

```eda
eda query=returns-detail
row reason group=byReason title="Return amount by reason" topN=35
```

Returns with no recorded reason are their own group, "(no reason recorded)".

## Return amount by item category

```eda
eda query=returns-detail
row cat group=byCat title="Return amount by item category"
```

## Return rate by category (returns / sales)

```eda
eda query=cat_rate
cat_returned:num=cat_rate.returned
cat_sales:num=cat_rate.sales
category:cat=cat_rate.category
group @rate sum(cat_returned) by=category denominatorField=cat_sales
row category group=rate share=true valueFormat=percent valueDecimals=1 title="Return amount as share of sales"
```

## Conclusion

- Returns are spread thin. The biggest reason, "reason 31", is 7.0% of returned dollars ($190K). "Gift exchange" is next at 4.1%, then "reason 32", "duplicate purchase", "Did not get it on time", and "Did not like the make" at 3.5% to 3.7% each. No single cause stands out.
- 106 returns (about $48.7K, 1.8%) have no reason recorded. They are the "(no reason recorded)" bar, behind "Show all 35 categories" in the reason chart.
- By category, Women ($301K), Shoes ($296K), Music ($291K) and Home ($284K) cost the most in returned dollars.
- By return rate (returns / store sales), Women (5.7%), Shoes (5.5%) and Home (5.5%) lead. Sports and Men are lowest at 4.8%. All categories sit between 4.7% and 5.7%.
- 77 sales lines have no item category and no returns. They show as "(none)" with a 0% rate.
- Women, Shoes and Home are the first categories to look at. The spread is small, so no category has a clear return problem.
