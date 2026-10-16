# A small employment benchmark contains several rising trends

**Reader question.** How similar are employment, population, and nominal output after rebasing their starting values?

**Population.** one historical US annual observation. The supplied snapshot is fixed. This article describes the unfiltered data; exploratory chart selections do not update the written findings.

```eda
eda query=r
id:cat=r.id label="Id"
employment:num=r.employment label="Employment (source employment units)"
deflator:num=r.deflator label="Deflator (source GNP deflator index)"
gnp:num=r.gnp label="Gnp (source nominal GNP units)"
unemployed:num=r.unemployed label="Unemployed (source unemployment-count units)"
armed:num=r.armed label="Armed (source armed-forces-count units)"
population:num=r.population label="Population (source population units)"
year:num=r.year label="Year"
employment_change:num=r.employment_change label="Employment change (source employment units per year)"
gnp_change:num=r.gnp_change label="Gnp change (source GNP units per year)"
population_change:num=r.population_change label="Population change (source population units per year)"
era:cat=r.era label="Era"
employment_index:num=r.employment_index label="Employment index (1947 = 100)"
gnp_index:num=r.gnp_index label="Gnp index (1947 = 100)"
population_index:num=r.population_index label="Population index (1947 = 100)"
```

## 1. Give each series the same starting index

A common start is imposed by the transformation. Different subsequent slopes describe proportional movement from that reference.

```eda
line @nb-longley-trending-levels-chart-1 x=year y=employment_index,gnp_index,population_index title="Give each series the same starting index" x.title="Year" y.title="Employment index (1947 = 100) / Gnp index (1947 = 100) / Population index (1947 = 100)"
```

## 2. The strong-looking levels relationship

Both measurements move through the same short historical span. A close cloud alone does not validate a prediction model.

```eda
scatter @nb-longley-trending-levels-chart-2 x=gnp y=employment title="The strong-looking levels relationship" x.title="Gnp (source nominal GNP units)" y.title="Employment (source employment units)"
```

**Computed finding.** Employment and nominal GNP in levels had correlation 0.984. This calculation uses 16 eligible rows after the recorded filter and field-completeness rule.

## 3. Compare changes between adjacent years

The first year has no prior observation and is omitted from the paired-change statistic. Differencing changes the question rather than simply improving the first chart.

```eda
scatter @nb-longley-trending-levels-chart-3 x=gnp_change y=employment_change title="Compare changes between adjacent years" x.title="Gnp change (source GNP units per year)" y.title="Employment change (source employment units per year)"
```

## 4. The distribution of annual employment changes

With a small number of differences, bins are only a rough descriptive device. Use the source table to inspect the individual changes.

```eda
hist @nb-longley-trending-levels-chart-4 employment_change bins=8 title="The distribution of annual employment changes" x.title="Employment change (source employment units per year)" y.title="Source rows"
```

**Computed finding.** Their valid annual changes had correlation 0.892. This calculation uses 15 eligible rows after the recorded filter and field-completeness rule.

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-longley-trending-levels-records year,employment,gnp,population,employment_change,gnp_change title="Records behind this comparison"
```

## What the comparison supports

Indices make proportional movement comparable while hiding original scale. The paired changes offer a different test of whether the levels association is mainly a shared historical trend.

## Limits

This is a small historical regression benchmark, not a current labor-market dataset. GNP is nominal and source units are retained. Similar trends do not establish a stable causal employment model.

## Source and preparation

Longley historical regression benchmark; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [longley provenance](../../datasets.json). The accompanying [field dictionary](fields.json) gives units and missingness for every field. [Preparation source](https://github.com/byronwall/explorEDA/blob/main/docs/research/daily-viz-corpus-2026-10-15/handoff/scripts/prepare.py) records the transformation; the catalogue entry records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** employment: source employment units; gnp: source nominal GNP units; population: source population units; year: year; employment_change: source employment units per year; gnp_change: source GNP units per year.
