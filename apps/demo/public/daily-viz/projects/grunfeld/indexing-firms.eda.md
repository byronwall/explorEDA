# Indexing investment changes the ranking question

**How different do historical firm trajectories look after each starts at 100?** Each row is one firm-year.

```eda
eda query=r
invest:num=r.invest label="Investment ($M, 1947)"
value:num=r.value label="Market value ($M, 1947)"
firm:cat=r.firm label="Firm"
year:num=r.year label="Year"
invest_index:num=r.invest_index label="Investment index (first year = 100)"
value_index:num=r.value_index label="Market value index (first year = 100)"
```

## 1. Raw investment over time, with firms identified

This retains monetary scale but compresses smaller firms into the lower part of the chart. The compression reflects genuine size differences.

```eda
scatter @nb-grunfeld-indexing-firms-chart-1 x=year y=invest color=firm title="Raw investment over time, with firms identified" x.title="Year" y.title="Investment ($M, 1947)"
```

## 2. Normalize each firm to its own first year

Every firm starts at the same index by construction. Later vertical separation is proportional to its own starting value, not an absolute-dollar gap.

```eda
scatter @nb-grunfeld-indexing-firms-chart-2 x=year y=invest_index color=firm title="Normalize each firm to its own first year" x.title="Year" y.title="Investment index (first year = 100)"
```

**Finding.** The highest first-year-normalized investment index in the panel was 696.67.

## 3. The distribution of indexed investment by firm

These distributions summarize trajectories but lose their order. A wide box could reflect sustained growth or large reversals.

```eda
boxplot @nb-grunfeld-indexing-firms-chart-3 invest_index color=firm title="The distribution of indexed investment by firm" y.title="Investment index (first year = 100)"
```

## 4. Market-value and investment indices

Both axes use a firm-specific starting reference. That makes proportional movements visible while removing cross-firm level information.

```eda
scatter @nb-grunfeld-indexing-firms-chart-4 x=value_index y=invest_index color=firm title="Market-value and investment indices" x.title="Market value index (first year = 100)" y.title="Investment index (first year = 100)"
```

**Finding.** The median firm-year investment index was 183.91.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-grunfeld-indexing-firms-records firm,year,invest,invest_index,value_index title="Records behind this comparison"
```

## Takeaway

Use indexed traces for proportional movement and raw values for investment scale. A firm leading one comparison need not lead the other.

## Limits

An index erases the absolute investment level and can magnify growth from a small base. The reference is each firm’s first year, not a market benchmark. The selected firms and years limit generalization.
