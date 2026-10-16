# A Nile flow comparison needs a boundary, not a causal story

**Reader question.** How do the supplied annual flow distributions compare on either side of 1898?

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

## 1. Annual flow across the chosen boundary

The line preserves individual wet and dry years. The marked year defines the comparison; it does not prove why the distribution differs.

```eda
line @nb-nile-before-and-after-chart-1 x=year y=volume title="Annual flow across the chosen boundary" x.title="Year" y.title="Volume (10^8 m³)" {
  rule x=1898 "Comparison boundary"
}
```

## 2. Two eras, the same volume scale

Compare the medians and middle halves while keeping extreme annual volumes visible. Different sample lengths are not automatically comparable precision.

```eda
boxplot @nb-nile-before-and-after-chart-2 volume color=era title="Two eras, the same volume scale" y.title="Volume (10^8 m³)"
```

**Computed finding.** Mean annual volume before 1898 was 1097.67 ×10^8 m³. This calculation uses 27 eligible rows after the recorded filter and field-completeness rule.

## 3. How much do the era distributions overlap?

Cumulative curves make it possible to compare more than their centers. Crossing curves would warn against describing one era as uniformly lower.

```eda
ecdf @nb-nile-before-and-after-chart-3 volume color=era direction=below title="How much do the era distributions overlap?" x.title="Volume (10^8 m³)"
```

## 4. Years contributing to each era

The later era contributes more observations. This count is the denominator for each era summary, not an adjustment for serial correlation.

```eda
row @nb-nile-before-and-after-chart-4 era title="Years contributing to each era" x.title="Source rows"
```

**Computed finding.** Mean annual volume from 1898 onward was 853.40 ×10^8 m³. This calculation uses 73 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-nile-before-and-after-records year,volume,era title="Records behind this comparison"
```

## What the comparison supports

Compare both location and overlap rather than allowing a vertical reference line to imply a causal experiment. The unequal era lengths remain visible in the count chart.

## Limits

The cutoff is an explicit historical comparison, not a randomized intervention. Many environmental and measurement factors could differ across eras. Annual volumes are measured at Aswan, not all reaches of the Nile.

## Source and preparation

Historical Aswan observations; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [nile provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** year: year; volume: 10^8 cubic metres per year.
