# A selected corporate panel can be dominated by a few firms

**How concentrated is cumulative recorded investment among the firms in this panel?** Each row is one firm summary.

```eda
eda query=firms
firm:cat=firms.firm label="Firm"
years:num=firms.years label="Firm-years"
invest_mean:num=firms.invest_mean label="Mean investment ($M, 1947)"
value_mean:num=firms.value_mean label="Mean market value ($M, 1947)"
invest_total:num=firms.invest_total label="Total investment ($M, 1947)"
```

## 1. Mean market value against mean investment

Each point now represents one firm rather than a firm-year. That changes the observational unit and removes the chronological variation inside each company.

```eda
scatter @nb-grunfeld-investment-concentration-chart-1 x=value_mean y=invest_mean title="Mean market value against mean investment" x.title="Mean market value ($M, 1947)" y.title="Mean investment ($M, 1947)"
```

## 2. The distribution of cumulative investment by firm

A firm contributes one total across its years. The horizontal measure is a flow accumulated over time, not an asset value measured at one date.

```eda
hist @nb-grunfeld-investment-concentration-chart-2 invest_total bins=8 title="The distribution of cumulative investment by firm" x.title="Total investment ($M, 1947)" y.title="Rows"
```

**Finding.** The largest firm accounts for 41.46% of cumulative panel investment.

## 3. Separate scale from observation count

A high total might reflect more years, larger annual amounts, or both. The explicit year count checks which of these explanations is available in this panel.

```eda
scatter @nb-grunfeld-investment-concentration-chart-3 x=years y=invest_total title="Separate scale from observation count" x.title="Firm-years" y.title="Total investment ($M, 1947)"
```

## 4. How many firms fall below a cumulative amount?

The cumulative curve gives firms equal weight. It therefore answers a different question from the share of all investment contributed by the largest firms.

```eda
ecdf @nb-grunfeld-investment-concentration-chart-4 invest_total direction=below title="How many firms fall below a cumulative amount?" x.title="Total investment ($M, 1947)"
```

**Finding.** The three largest firms together account for 76.43% of cumulative panel investment.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-grunfeld-investment-concentration-records firm,years,invest_mean,value_mean,invest_total title="Records behind this comparison"
```

## Takeaway

Changing from firm-years to firm summaries makes concentration visible without giving each large firm more rows. Retain the observation counts to distinguish investment scale from a longer recorded history.

## Limits

The denominator is cumulative investment among the selected panel firms and years, not all corporate investment. Adding market values across years would not represent a stock of wealth, so that quantity is not used.
