# Missing CO2 weeks arrive in runs, not isolated blanks

**Reader question.** How long are the consecutive missing stretches in the supplied weekly calendar?

**Population.** one consecutive missing run. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=gaps
id:cat=gaps.id label="Id"
date:date=gaps.date label="Calendar date"
end_date:date=gaps.end_date label="End date"
length:num=gaps.length label="Length (consecutive missing weekly slots)"
year:num=gaps.year label="Year"
before:num=gaps.before label="Before (ppmv)"
after:num=gaps.after label="After (ppmv)"
```

## 1. Place each missing run in time

Each point represents an entire missing stretch, not one week. Height measures the number of adjacent null rows.

```eda
scatter @nb-co2-missing-runs-chart-1 x=year y=length title="Place each missing run in time" x.title="Year" y.title="Length (consecutive missing weekly slots)"
```

## 2. Short gaps and long gaps are different problems

The histogram counts runs. Its denominator is not the number of missing weeks; one long interruption still contributes only one observation here.

```eda
hist @nb-co2-missing-runs-chart-2 length bins=12 title="Short gaps and long gaps are different problems" x.title="Length (consecutive missing weekly slots)" y.title="Source rows"
```

**Computed finding.** The longest missing run spans 18 supplied weekly slots. This calculation uses 22 eligible rows after the recorded filter and field-completeness rule.

## 3. Concentrations on either side of each gap

These are the nearest supplied observed values on either side. They help bound the contextual question, but drawing a point does not authorize filling the intervening values.

```eda
scatter @nb-co2-missing-runs-chart-3 x=before y=after title="Concentrations on either side of each gap" x.title="Before (ppmv)" y.title="After (ppmv)"
```

## 4. Share of missing runs below each duration

A cumulative curve reveals whether a few long runs dominate the uncertainty in any gap-filling exercise. Every run receives equal weight.

```eda
ecdf @nb-co2-missing-runs-chart-4 length direction=below title="Share of missing runs below each duration" x.title="Length (consecutive missing weekly slots)"
```

**Computed finding.** All missing runs together account for 59 supplied weekly slots. This calculation uses 22 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-co2-missing-runs-records date,end_date,length,before,after title="Records behind this comparison"
```

## What the comparison supports

Treat missingness as a population of intervals rather than a nuisance to erase. The run-length distribution and calendar positions identify where interpolation would make the strongest assumptions.

## Limits

A run means consecutive missing rows in this supplied series. It is not proof that a station stopped operating. Before and after values do not reveal the unmeasured path between them.

## Source and preparation

Keeling and Whorf; Scripps / CDIAC; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [co2 provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** length: consecutive missing weekly slots; before: ppmv; after: ppmv.
