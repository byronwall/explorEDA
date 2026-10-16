# Big firms and within-firm changes are not the same comparison

**Reader question.** How does investment relate to market value in levels and in annual within-firm changes?

**Population.** one firm-year. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
invest:num=r.invest label="Invest (source 1947-dollar units)"
value:num=r.value label="Value (source 1947-dollar units)"
capital:num=r.capital label="Capital (source 1947-dollar units)"
firm:cat=r.firm label="Firm"
year:num=r.year label="Year"
invest_index:num=r.invest_index label="Invest index (first supplied firm year = 100)"
value_index:num=r.value_index label="Value index (first supplied firm year = 100)"
invest_change:num=r.invest_change label="Invest change (source 1947-dollar units)"
value_change:num=r.value_change label="Value change (source 1947-dollar units)"
capital_change:num=r.capital_change label="Capital change (source 1947-dollar units)"
```

## 1. Firm size in the pooled levels

Each point is a firm-year rather than a distinct firm. Large firms can dominate the visual range without receiving more statistical weight per point.

```eda
scatter @nb-grunfeld-within-firm-chart-1 x=value y=invest color=firm opacity=0.6 title="Firm size in the pooled levels" x.title="Value (source 1947-dollar units)" y.title="Invest (source 1947-dollar units)"
```

## 2. Change within a firm, not between firms

The preparation resets the difference at each firm boundary. No final year from one company is subtracted from the first year of another.

```eda
scatter @nb-grunfeld-within-firm-chart-2 x=value_change y=invest_change color=firm title="Change within a firm, not between firms" x.title="Value change (source 1947-dollar units)" y.title="Invest change (source 1947-dollar units)"
```

**Computed finding.** Across firm-year levels, market value and investment had correlation 0.862. This calculation uses 220 eligible rows after the recorded filter and field-completeness rule.

## 3. Investment changes differ across firms

Group summaries retain the selected firms separately. They do not turn the repeated annual observations into independent experimental units.

```eda
boxplot @nb-grunfeld-within-firm-chart-3 invest_change color=firm title="Investment changes differ across firms" y.title="Invest change (source 1947-dollar units)"
```

## 4. How large are the recorded investment changes?

The cumulative distribution reveals negative and positive changes without bin choices. It weights each eligible firm-year difference equally.

```eda
ecdf @nb-grunfeld-within-firm-chart-4 invest_change direction=below title="How large are the recorded investment changes?" x.title="Invest change (source 1947-dollar units)"
```

**Computed finding.** Across valid within-firm annual changes, the correlation was 0.562. This calculation uses 209 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-grunfeld-within-firm-records firm,year,invest,value,invest_change,value_change title="Records behind this comparison"
```

## What the comparison supports

The pooled levels cloud mixes firm size with time movement. Within-firm differences change the unit of comparison to adjacent observations and should be named as a separate question.

## Limits

These selected historical firms are not a random sample of all businesses. First differences remain observational and can amplify measurement noise. Source monetary units are retained without an unverified multiplier.

## Source and preparation

Grunfeld; Kleiber and Zeileis; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [grunfeld provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** invest: source 1947-dollar units; no multiplier assumed; value: source 1947-dollar units; no multiplier assumed; year: year; invest_change: source 1947-dollar units; no multiplier assumed; value_change: source 1947-dollar units; no multiplier assumed.
