# A rising GDP level can conceal falling quarterly growth

**What does U.S. GDP look like once you chart its growth rate instead of its level?** Each row is one US calendar quarter.

```eda
eda query=r
realgdp:num=r.realgdp label="Real GDP ($B, 2005)"
date:date=r.date label="Date"
gdp_growth:num=r.gdp_growth label="GDP growth (annualized %)"
gdp_change:num=r.gdp_change label="Change in real GDP ($B, 2005)"
unemp_change:num=r.unemp_change label="Change in unemployment (points)"
```

## 1. GDP in the source’s chained-dollar level

The level retains scale and historical size. A large vertical range can make short contractions visually subtle.

```eda
line @nb-macro-level-versus-growth-chart-1 x=date y=realgdp title="GDP in the source’s chained-dollar level" x.title="Date" y.title="Real GDP ($B, 2005)"
```

## 2. Annualized quarterly growth on a zero reference

Growth is computed from adjacent quarters using a compounded annualization. The zero line separates positive from negative changes without inventing recession classifications.

```eda
line @nb-macro-level-versus-growth-chart-2 x=date y=gdp_growth title="Annualized quarterly growth on a zero reference" x.title="Date" y.title="GDP growth (annualized %)" {
  rule y=0 "No quarterly change"
}
```

**Finding.** The smallest derived annualized quarterly GDP growth rate was -7.95%.

## 3. The distribution of quarterly growth rates

The histogram counts available quarter-to-quarter comparisons. It loses chronology, so a cluster of negative observations cannot be located from this view alone.

```eda
hist @nb-macro-level-versus-growth-chart-3 gdp_growth bins=24 title="The distribution of quarterly growth rates" x.title="GDP growth (annualized %)" y.title="Rows"
```

## 4. GDP change and unemployment change

These are two first differences from the same quarterly sequence. Association is descriptive and does not identify a structural labor-market response.

```eda
scatter @nb-macro-level-versus-growth-chart-4 x=gdp_change y=unemp_change title="GDP change and unemployment change" x.title="Change in real GDP ($B, 2005)" y.title="Change in unemployment (points)"
```

**Finding.** The largest derived annualized quarterly GDP growth rate was 16.69%.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-macro-level-versus-growth-records date,realgdp,gdp_change,gdp_growth,unemp_change title="Records behind this comparison"
```

## Takeaway

Levels answer how large the measured economy was in the source’s chained dollars. Growth rates answer how rapidly it changed between adjacent quarters. Neither should silently replace the other.

## Limits

This is an old source vintage, not current revised GDP. Annualizing a quarterly change is a mathematical convention, not the year-on-year rate. The first quarter has no preceding observation in this file.
