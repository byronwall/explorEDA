# One firm made 41% of the panel's investment; three made 76%

**How concentrated was investment among the eleven Grunfeld firms?** Each row is one firm, summarizing its twenty years from 1935 to 1954: total investment, mean investment, and mean market value, in millions of 1947 dollars. Every firm has the same 20 years, so a bigger total is a bigger firm, not a longer record.

```eda
eda query=firms
firm:cat=firms.firm label="Firm"
years:num=firms.years label="Firm-years"
invest_mean:num=firms.invest_mean label="Mean investment ($M, 1947)"
value_mean:num=firms.value_mean label="Mean market value ($M, 1947)"
invest_total:num=firms.invest_total label="Total investment ($M, 1947)"
calc intensity = invest_mean / value_mean * 100
field intensity label="Investment per $100 of market value ($)"
```

## General Motors alone was 41% of the total

Rank the firms by twenty-year total investment. General Motors invested $12,160 million, 41.46% of everything the panel spent. General Motors and US Steel together account for 69.45% of cumulative panel investment, and the three largest firms together account for 76.43%. The bottom five firms are slivers.

```eda
group @totals sum(invest_total) by=firm
row @nb-grunfeld-investment-concentration-chart-1 firm group=totals topN=11 title="Total investment 1935 to 1954, by firm" x.title="Total investment ($M, 1947)" {
  callout "41% of the panel" category="General Motors" offset=-120,60
}
```

## Investment scaled with market value

Each point is one firm, placed by its mean market value and mean investment. General Motors sits alone at the top right, with a mean market value of $4,334 million. The fitted line runs through the other ten, which cluster below $2,000 million in value and $110 million in yearly investment.

```eda
scatter @nb-grunfeld-investment-concentration-chart-2 x=value_mean y=invest_mean regression=linear title="Mean investment against mean market value, one point per firm" x.title="Mean market value ($M, 1947)" y.title="Mean investment ($M, 1947)" {
  callout "General Motors" pick=max
}
```

## Relative to its size, US Steel invested hardest

Divide each firm's mean investment by its mean market value. US Steel invested $20.82 per $100 of market value each year, General Motors $14.03, and General Electric, the third-largest investor in dollars, only $5.27. Union Oil and Atlantic Refining, small in dollars, invested the most for their size.

```eda
group @rate sum(intensity) by=firm
row @nb-grunfeld-investment-concentration-chart-3 firm group=rate topN=11 title="Mean yearly investment per $100 of market value, by firm" x.title="Investment per $100 of market value ($)"
```

## Takeaway

Three of eleven firms made three-quarters of the panel's investment, and General Motors alone made two-fifths. Any pooled statistic on this panel is mostly a statistic about General Motors and US Steel. For how hard a firm invested, scale by its size: on that measure, the oil companies and US Steel lead.

## Limits

Eleven firms chosen for a 1958 textbook, so the denominator is the panel, not American industry. Market value is a mean of twenty year-end figures, and summing it across years would not be a stock of anything, so only investment is totaled.
