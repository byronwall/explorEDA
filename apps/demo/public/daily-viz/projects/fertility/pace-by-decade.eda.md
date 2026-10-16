# Endpoint declines can arrive at different speeds

**Which complete decades contain the fastest average declines among the selected countries?** Each row is one country and complete named decade.

```eda
eda query=decades
country:cat=decades.country label="Country"
decade:cat=decades.decade label="Decade"
year:num=decades.year label="Year"
start:num=decades.start label="Start (births/woman)"
end:num=decades.end label="End (births/woman)"
change:num=decades.change label="Change (births/woman)"
annual_change:num=decades.annual_change label="Annual change (births/woman/year)"
valid:num=decades.valid label="Years published"
```

## 1. A country-by-decade view of pace

Each cell is already one prepared country-decade observation. The chart’s average therefore returns that cell’s value rather than averaging several undisclosed records.

```eda
heatmap @nb-fertility-pace-by-decade-chart-1 country columnField=decade aggregation=average measureField=annual_change title="A country-by-decade view of pace"
```

## 2. Pace varies within the same decade

The distribution across countries shows what an unweighted decade mean would conceal. Equal country weights are a deliberate analytical choice.

```eda
boxplot @nb-fertility-pace-by-decade-chart-2 annual_change color=decade title="Pace varies within the same decade" y.title="Annual change (births/woman/year)"
```

**Finding.** The selected-country mean pace in the 1960s was -0.050 births per woman per elapsed year.

## 3. Starting fertility and subsequent decade change

A lower starting value leaves a different numerical range for a decline. This plot describes that context without assigning a causal explanation.

```eda
scatter @nb-fertility-pace-by-decade-chart-3 x=start y=change color=decade title="Starting fertility and subsequent decade change" x.title="Start (births/woman)" y.title="Change (births/woman)"
```

## 4. Check the annual observation count

The count verifies whether a named decade has the intended annual support. It does not imply that annual observations are independent.

```eda
scatter @nb-fertility-pace-by-decade-chart-4 x=year y=valid color=country title="Check the annual observation count" x.title="Year" y.title="Years published"
```

**Finding.** The corresponding pace in the 2000s was -0.022 births per woman per elapsed year.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-fertility-pace-by-decade-records country,decade,valid,start,end,change,annual_change title="Records behind this comparison"
```

## Takeaway

Comparing pace retains more timing than one long endpoint difference, but still erases changes within each decade. Keep the elapsed-year denominator visible.

## Limits

A decade’s first and last observations are nine elapsed years apart, not ten. The annualized difference is linear, not a compound growth rate. The incomplete 2010s are deliberately excluded.
