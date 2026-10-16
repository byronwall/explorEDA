# Indexing investment changes the ranking question

**Reader question.** How different do historical firm trajectories look after each starts at 100?

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

## 1. Raw investment over time, with firms identified

This retains monetary scale but compresses smaller firms into the lower part of the chart. The compression reflects genuine size differences.

```eda
scatter @nb-grunfeld-indexing-firms-chart-1 x=year y=invest color=firm title="Raw investment over time, with firms identified" x.title="Year" y.title="Invest (source 1947-dollar units)"
```

## 2. Normalize each firm to its own first year

Every firm starts at the same index by construction. Later vertical separation is proportional to its own starting value, not an absolute-dollar gap.

```eda
scatter @nb-grunfeld-indexing-firms-chart-2 x=year y=invest_index color=firm title="Normalize each firm to its own first year" x.title="Year" y.title="Invest index (first supplied firm year = 100)"
```

**Computed finding.** The highest first-year-normalized investment index in the panel was 696.67. This calculation uses 220 eligible rows after the recorded filter and field-completeness rule.

## 3. The distribution of indexed investment by firm

These distributions summarize trajectories but lose their order. A wide box could reflect sustained growth or large reversals.

```eda
boxplot @nb-grunfeld-indexing-firms-chart-3 invest_index color=firm title="The distribution of indexed investment by firm" y.title="Invest index (first supplied firm year = 100)"
```

## 4. Market-value and investment indices

Both axes use a firm-specific starting reference. That makes proportional movements visible while removing cross-firm level information.

```eda
scatter @nb-grunfeld-indexing-firms-chart-4 x=value_index y=invest_index color=firm title="Market-value and investment indices" x.title="Value index (first supplied firm year = 100)" y.title="Invest index (first supplied firm year = 100)"
```

**Computed finding.** The median firm-year investment index was 183.91. This calculation uses 220 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-grunfeld-indexing-firms-records firm,year,invest,invest_index,value_index title="Records behind this comparison"
```

## What the comparison supports

Use indexed traces for proportional movement and raw values for investment scale. A firm leading one comparison need not lead the other.

## Limits

An index erases the absolute investment level and can magnify growth from a small base. The reference is each firm’s first supplied year, not a market benchmark. The selected firms and years limit generalization.

## Source and preparation

Grunfeld; Kleiber and Zeileis; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [grunfeld provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** invest: source 1947-dollar units; no multiplier assumed; year: year; invest_index: first supplied firm year = 100; value_index: first supplied firm year = 100.
