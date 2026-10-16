# How much do extreme flow years move the Nile average?

**Reader question.** Does the typical flow change when the outer volume tails are examined separately?

**Population.** one annual flow observation at Aswan. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
year:num=r.year label="Year"
volume:num=r.volume label="Volume (10^8 m³)"
era:cat=r.era label="Era"
rank:num=r.rank label="Rank (percentile rank)"
tail:cat=r.tail label="Tail"
centered:num=r.centered label="Centered (10^8 m³)"
```

## 1. Annual flow has a distribution, not one typical value

Start with all years. The bins make the tails visible without classifying any annual measurement as an error.

```eda
hist @nb-nile-tail-sensitivity-chart-1 volume bins=18 title="Annual flow has a distribution, not one typical value" x.title="Volume (10^8 m³)" y.title="Source rows"
```

## 2. Locate the tail years in time

Color adds the explicit analytical grouping while leaving chronology intact. It does not label the years using an external flood or drought definition.

```eda
scatter @nb-nile-tail-sensitivity-chart-2 x=year y=volume color=tail title="Locate the tail years in time" x.title="Year" y.title="Volume (10^8 m³)"
```

**Computed finding.** The mean across every supplied year was 919.35 ×10^8 m³. This calculation uses 100 eligible rows after the recorded filter and field-completeness rule.

## 3. A threshold view of every annual value

The cumulative curve allows direct inspection of tail boundaries. It retains every year, including values the sensitivity calculation does not average.

```eda
ecdf @nb-nile-tail-sensitivity-chart-3 volume direction=below title="A threshold view of every annual value" x.title="Volume (10^8 m³)"
```

## 4. The selected middle versus the two tails

This is a view of subsets chosen by the outcome itself. Their separation is built into the rule and is not an independently discovered relationship.

```eda
boxplot @nb-nile-tail-sensitivity-chart-4 volume color=tail title="The selected middle versus the two tails" y.title="Volume (10^8 m³)"
```

**Computed finding.** The mean between the declared tail cutoffs was 915.25 ×10^8 m³. This calculation uses 81 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-nile-tail-sensitivity-records year,volume,rank,tail title="Records behind this comparison"
```

## What the comparison supports

Keep the tail years visible and explain why a robust summary differs from the ordinary mean. Removing an inconvenient extreme without a stated rule would change the population silently.

## Limits

Tail labels use the supplied sample’s linear 10th and 90th percentiles. They are not flood or drought standards. The middle group is a sensitivity comparison, not a corrected replacement dataset.

## Source and preparation

Historical Aswan observations; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [nile provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; volume: 10^8 cubic metres per year; rank: percentile rank.
