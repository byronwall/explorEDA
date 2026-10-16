# Compare fertility endpoints only when both are present

**Reader question.** What changed between 1960 and 2011 for the same selected country cohort?

**Population.** one selected country. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=endpoints
id:cat=endpoints.id label="Id"
code:cat=endpoints.code label="Code"
country:cat=endpoints.country label="Country"
start:num=endpoints.start label="Start (births/woman)"
end:num=endpoints.end label="End (births/woman)"
change:num=endpoints.change label="Change (births/woman)"
complete:cat=endpoints.complete label="Complete"
annual_change:num=endpoints.annual_change label="Annual change (births/woman/year)"
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

**Computed finding.** The mean matched-country change was -2.965 births per woman. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 3. Distribution of paired changes

Every complete country contributes once. This differs from a histogram of all country-year rates, which weights longer observed paths more heavily.

```eda
hist @nb-fertility-matched-endpoints-chart-3 change bins=8 title="Distribution of paired changes" x.title="Change (births/woman)" y.title="Source rows"
```

## 4. What share of selected countries changed by this much?

The denominator is the matched selected cohort, not countries worldwide or people. Read a negative change as a decline in the period rate.

```eda
ecdf @nb-fertility-matched-endpoints-chart-4 change direction=below title="What share of selected countries changed by this much?" x.title="Change (births/woman)"
```

**Computed finding.** The largest decline in the selected cohort was -4.911 births per woman. This calculation uses 12 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-fertility-matched-endpoints-records country,start,end,change,complete title="Records behind this comparison"
```

## What the comparison supports

Matching endpoints keeps the country population constant. The comparison still loses the route between the two values, which is why the trajectory notebook remains a necessary companion.

## Limits

The endpoint year is 2011 because the supplied 2012–2013 columns are empty. Endpoint differences hide intervening reversals. Countries have equal weight and no claim is made about the world population.

## Source and preparation

World Bank; UN Population Division and national statistical sources; historical statsmodels snapshot; Creative Commons Attribution 4.0 International. Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [fertility provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** start: births per woman in 1960; end: births per woman in 2011; change: births per woman, 2011 minus 1960.
