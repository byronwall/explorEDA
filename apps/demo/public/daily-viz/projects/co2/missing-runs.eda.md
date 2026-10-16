# Missing CO₂ weeks arrive in runs

**How long are the consecutive missing stretches in the weekly calendar?** Each row is one consecutive missing run.

```eda
eda query=gaps
date:date=gaps.date label="Date"
end_date:date=gaps.end_date label="End date"
length:num=gaps.length label="Missing weeks in a row"
year:num=gaps.year label="Year"
before:num=gaps.before label="CO₂ before the gap (ppm)"
after:num=gaps.after label="CO₂ after the gap (ppm)"
```

## 1. Place each missing run in time

Each point represents an entire missing stretch, not one week. Height measures the number of adjacent null rows.

```eda
scatter @nb-co2-missing-runs-chart-1 x=year y=length title="Place each missing run in time" x.title="Year" y.title="Missing weeks in a row"
```

## 2. Short gaps and long gaps are different problems

The histogram counts runs. Its denominator is not the number of missing weeks; one long interruption still contributes only one observation here.

```eda
hist @nb-co2-missing-runs-chart-2 length bins=12 title="Short gaps and long gaps are different problems" x.title="Missing weeks in a row" y.title="Rows"
```

**Finding.** The longest missing run spans 18 weekly slots.

## 3. Concentrations on either side of each gap

These are the nearest observed values on either side. They help bound the contextual question, but drawing a point does not authorize filling the intervening values.

```eda
scatter @nb-co2-missing-runs-chart-3 x=before y=after title="Concentrations on either side of each gap" x.title="CO₂ before the gap (ppm)" y.title="CO₂ after the gap (ppm)"
```

## 4. Share of missing runs below each duration

A cumulative curve reveals whether a few long runs dominate the uncertainty in any gap-filling exercise. Every run receives equal weight.

```eda
ecdf @nb-co2-missing-runs-chart-4 length direction=below title="Share of missing runs below each duration" x.title="Missing weeks in a row"
```

**Finding.** All missing runs together account for 59 weekly slots.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-co2-missing-runs-records date,end_date,length,before,after title="Records behind this comparison"
```

## Takeaway

Treat missingness as a population of intervals rather than a nuisance to erase. The run-length distribution and calendar positions identify where interpolation would make the strongest assumptions.

## Limits

A run means consecutive missing rows in this series. It is not proof that a station stopped operating. Before and after values do not reveal the unmeasured path between them.
