# Employment counts and unemployment counts are not a rate

**Reader question.** What do the raw historical count series show without inventing a labor-force denominator?

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

## 1. Unemployment counts across the supplied years

This line is a count series. Calling it an unemployment rate would silently add a denominator the analysis has not verified.

```eda
line @nb-longley-different-denominators-chart-1 x=year y=unemployed title="Unemployment counts across the supplied years" x.title="Year" y.title="Unemployed (source unemployment-count units)"
```

## 2. Armed-forces counts provide different context

The second count has a different population meaning. Its separate panel avoids suggesting that the two series partition a complete labor force.

```eda
line @nb-longley-different-denominators-chart-2 x=year y=armed title="Armed-forces counts provide different context" x.title="Year" y.title="Armed (source armed-forces-count units)"
```

**Computed finding.** The smallest recorded unemployment count was 1,870 source count units. This calculation uses 16 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-longley-different-denominators.json).

## 3. Employment and unemployment can both move

A two-count plot makes the changing scale of the economy relevant. There is no identity requiring the two plotted numbers to sum to a constant.

```eda
scatter @nb-longley-different-denominators-chart-3 x=employment y=unemployed color=era title="Employment and unemployment can both move" x.title="Employment (source employment units)" y.title="Unemployed (source unemployment-count units)"
```

## 4. Population is context, not a rate denominator

Population does not establish who participates in the labor force. This view describes scale without converting the ratio into an official labor statistic.

```eda
scatter @nb-longley-different-denominators-chart-4 x=population y=unemployed title="Population is context, not a rate denominator" x.title="Population (source population units)" y.title="Unemployed (source unemployment-count units)"
```

**Computed finding.** The largest recorded unemployment count was 4,806 source count units. This calculation uses 16 eligible rows after the recorded filter and field-completeness rule. [Calculation and contributing IDs](../../evidence/findings/nb-longley-different-denominators.json).

## 5. Inspect the records behind the comparison

The table exposes the source values or prepared values actually used above. Select a row to inspect the calculation inputs; clear chart selections before comparing a live chart with the fixed prose. Notebook selections are local to their chart, not linked across the page.

```eda
table @nb-longley-different-denominators-records year,employment,unemployed,armed,population title="Records behind this comparison"
```

## What the comparison supports

A dashboard can be useful without manufacturing a familiar metric. Keep the count series separate, name their units, and make the missing denominator an analytical limit.

## Limits

The selected columns do not provide a verified labor-force denominator for constructing a standard unemployment rate. Population is not a substitute. These source counts belong to an old benchmark vintage.

## Source and preparation

Longley historical regression benchmark; distributed by statsmodels; Public domain (dataset-specific distributor statement). Historical source version: statsmodels 0.14.6; original historical series, not a live revision

Data credit and license: [longley provenance](../../datasets.json). The accompanying [field dictionary](../../evidence/fields/longley.json) gives units and missingness for every field. [Preparation source](../../evidence/scripts/prepare.py) records the transformation; [computed evidence](../../evidence/findings/nb-longley-different-denominators.json) records filters, denominators, source-row IDs, and CSV hashes.

**Reading units.** employment: source employment units; unemployed: source unemployment-count units; armed: source armed-forces-count units; population: source population units; year: year.
