# Compare fertility endpoints only when both are present

**What changed between 1960 and 2011 for the same selected country cohort?** Each row is one selected country.

```eda
eda query=endpoints
country:cat=endpoints.country label="Country"
start:num=endpoints.start label="Start (births/woman)"
end:num=endpoints.end label="End (births/woman)"
change:num=endpoints.change label="Change (births/woman)"
complete:cat=endpoints.complete label="Complete"
```

## 1. Each country’s starting and ending rate

A point keeps the paired readings together. The two axis labels identify the historical endpoints rather than implying a simultaneous relationship.

```eda
scatter @nb-fertility-matched-endpoints-chart-1 x=start y=end color=country title="Each country’s starting and ending rate" x.title="Start (births/woman)" y.title="End (births/woman)"
```

## 2. Change against the starting rate

Change includes the starting value in its subtraction. A relationship with baseline can arise partly from that construction and should not be treated as policy evidence.

```eda
scatter @nb-fertility-matched-endpoints-chart-2 x=start y=change color=country title="Change against the starting rate" x.title="Start (births/woman)" y.title="Change (births/woman)"
```

**Finding.** The mean matched-country change was -2.965 births per woman.

## 3. Distribution of paired changes

Every complete country contributes once. This differs from a histogram of all country-year rates, which weights longer observed paths more heavily.

```eda
hist @nb-fertility-matched-endpoints-chart-3 change bins=8 title="Distribution of paired changes" x.title="Change (births/woman)" y.title="Rows"
```

## 4. What share of selected countries changed by this much?

The denominator is the matched selected cohort, not countries worldwide or people. Read a negative change as a decline in the period rate.

```eda
ecdf @nb-fertility-matched-endpoints-chart-4 change direction=below title="What share of selected countries changed by this much?" x.title="Change (births/woman)"
```

**Finding.** The largest decline in the selected cohort was -4.911 births per woman.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-fertility-matched-endpoints-records country,start,end,change,complete title="Records behind this comparison"
```

## Takeaway

Matching endpoints keeps the country population constant. The comparison still loses the route between the two values, which is why the trajectory notebook remains a necessary companion.

## Limits

The endpoint year is 2011 because the 2012–2013 columns are empty. Endpoint differences hide intervening reversals. Countries have equal weight and no claim is made about the world population.
