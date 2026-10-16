# A small employment benchmark contains several rising trends

**How similar are employment, population, and nominal output after rebasing their starting values?** Each row is one historical US annual observation.

```eda
eda query=r
employment:num=r.employment label="Employed (thousands)"
gnp:num=r.gnp label="GNP ($M, nominal)"
population:num=r.population label="Population 14+ (thousands)"
year:num=r.year label="Year"
employment_change:num=r.employment_change label="Change in employed (thousands/year)"
gnp_change:num=r.gnp_change label="Change in GNP ($M/year)"
employment_index:num=r.employment_index label="Employment index (1947 = 100)"
gnp_index:num=r.gnp_index label="GNP index (1947 = 100)"
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
scatter @nb-longley-trending-levels-chart-2 x=gnp y=employment title="The strong-looking levels relationship" x.title="GNP ($M, nominal)" y.title="Employed (thousands)"
```

**Finding.** Employment and nominal GNP in levels had correlation 0.984.

## 3. Compare changes between adjacent years

The first year has no prior observation and is omitted from the paired-change statistic. Differencing changes the question rather than simply improving the first chart.

```eda
scatter @nb-longley-trending-levels-chart-3 x=gnp_change y=employment_change title="Compare changes between adjacent years" x.title="Change in GNP ($M/year)" y.title="Change in employed (thousands/year)"
```

## 4. The distribution of annual employment changes

With a small number of differences, bins are only a rough descriptive device. Use the source table to inspect the individual changes.

```eda
hist @nb-longley-trending-levels-chart-4 employment_change bins=8 title="The distribution of annual employment changes" x.title="Change in employed (thousands/year)" y.title="Rows"
```

**Finding.** Their valid annual changes had correlation 0.892.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-longley-trending-levels-records year,employment,gnp,population,employment_change,gnp_change title="Records behind this comparison"
```

## Takeaway

Indices make proportional movement comparable while hiding original scale. The paired changes offer a different test of whether the levels association is mainly a shared historical trend.

## Limits

This is a small historical regression benchmark, not a current labor-market dataset. GNP is nominal and source units are retained. Similar trends do not establish a stable causal employment model.
