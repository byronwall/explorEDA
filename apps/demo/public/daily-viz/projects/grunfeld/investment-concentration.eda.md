# A selected corporate panel can be dominated by a few firms

**Reader question.** How concentrated is cumulative recorded investment among the firms in this panel?

**Population.** one firm summary. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=firms
id:cat=firms.id label="Id"
firm:cat=firms.firm label="Firm"
years:num=firms.years label="Years (observed firm-years)"
invest_mean:num=firms.invest_mean label="Invest mean (source 1947-dollar units)"
value_mean:num=firms.value_mean label="Value mean (source 1947-dollar units)"
invest_total:num=firms.invest_total label="Invest total (source 1947-dollar units)"
```

## 1. Mean market value against mean investment

Each point now represents one firm rather than a firm-year. That changes the observational unit and removes the chronological variation inside each company.

```eda
scatter @nb-grunfeld-investment-concentration-chart-1 x=value_mean y=invest_mean title="Mean market value against mean investment" x.title="Value mean (source 1947-dollar units)" y.title="Invest mean (source 1947-dollar units)"
```

## 2. The distribution of cumulative investment by firm

A firm contributes one total across its supplied years. The horizontal measure is a flow accumulated over time, not an asset value measured at one date.

```eda
hist @nb-grunfeld-investment-concentration-chart-2 invest_total bins=8 title="The distribution of cumulative investment by firm" x.title="Invest total (source 1947-dollar units)" y.title="Source rows"
```

**Computed finding.** The largest firm accounts for 41.46% of cumulative panel investment. This calculation uses 11 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-grunfeld-investment-concentration.json).

## 3. Separate scale from observation count

A high total might reflect more years, larger annual amounts, or both. The explicit year count checks which of these explanations is available in this panel.

```eda
scatter @nb-grunfeld-investment-concentration-chart-3 x=years y=invest_total title="Separate scale from observation count" x.title="Years (observed firm-years)" y.title="Invest total (source 1947-dollar units)"
```

## 4. How many firms fall below a cumulative amount?

The cumulative curve gives firms equal weight. It therefore answers a different question from the share of all investment contributed by the largest firms.

```eda
ecdf @nb-grunfeld-investment-concentration-chart-4 invest_total direction=below title="How many firms fall below a cumulative amount?" x.title="Invest total (source 1947-dollar units)"
```

**Computed finding.** The three largest firms together account for 76.43% of cumulative panel investment. This calculation uses 11 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-grunfeld-investment-concentration.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-grunfeld-investment-concentration-records firm,years,invest_mean,value_mean,invest_total title="Records behind this comparison"
```

## What the comparison supports

Changing from firm-years to firm summaries makes concentration visible without giving each large firm more rows. Retain the observation counts to distinguish investment scale from a longer recorded history.

## Limits

The denominator is cumulative investment among the selected panel firms and years, not all corporate investment. Adding market values across years would not represent a stock of wealth, so that quantity is not used.

## Source and preparation

Grunfeld; Kleiber and Zeileis; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [grunfeld provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/grunfeld.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-grunfeld-investment-concentration.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** years: observed firm-years; invest_mean: source 1947-dollar units; no multiplier assumed; value_mean: source 1947-dollar units; no multiplier assumed; invest_total: source 1947-dollar units; no multiplier assumed.
