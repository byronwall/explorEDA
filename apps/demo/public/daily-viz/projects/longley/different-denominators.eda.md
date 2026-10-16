# Unemployment swung 2.6-fold, with no labor force to divide by

**What can raw employment and unemployment counts tell you without a labor-force total?** Each row is one historical US annual observation.

```eda
eda query=r
employment:num=r.employment label="Employed (thousands)"
unemployed:num=r.unemployed label="Unemployed (thousands)"
armed:num=r.armed label="Armed forces (thousands)"
population:num=r.population label="Population 14+ (thousands)"
year:num=r.year label="Year"
era:cat=r.era label="Era"
```

## 1. Unemployment counts across the years

This line is a count series. Calling it an unemployment rate would silently add a denominator the analysis has not verified.

```eda
line @nb-longley-different-denominators-chart-1 x=year y=unemployed title="Unemployment counts across the years" x.title="Year" y.title="Unemployed (thousands)"
```

## 2. Armed-forces counts provide different context

The second count has a different population meaning. Its separate panel avoids suggesting that the two series partition a complete labor force.

```eda
line @nb-longley-different-denominators-chart-2 x=year y=armed title="Armed-forces counts provide different context" x.title="Year" y.title="Armed forces (thousands)"
```

**Finding.** The smallest recorded unemployment count was 1,870 source count units.

## 3. Employment and unemployment can both move

A two-count plot makes the changing scale of the economy relevant. There is no identity requiring the two plotted numbers to sum to a constant.

```eda
scatter @nb-longley-different-denominators-chart-3 x=employment y=unemployed color=era title="Employment and unemployment can both move" x.title="Employed (thousands)" y.title="Unemployed (thousands)"
```

## 4. Population is context, not a rate denominator

Population does not establish who participates in the labor force. This view describes scale without converting the ratio into an official labor statistic.

```eda
scatter @nb-longley-different-denominators-chart-4 x=population y=unemployed title="Population is context, not a rate denominator" x.title="Population 14+ (thousands)" y.title="Unemployed (thousands)"
```

**Finding.** The largest recorded unemployment count was 4,806 source count units.

## 5. The rows behind the charts

Sort a column or select rows to check any value above. Selections in a notebook stay with their own chart.

```eda
table @nb-longley-different-denominators-records year,employment,unemployed,armed,population title="Records behind this comparison"
```

## Takeaway

A dashboard can be useful without manufacturing a familiar metric. Keep the count series separate, name their units, and make the missing denominator an analytical limit.

## Limits

The selected columns do not provide a verified labor-force denominator for constructing a standard unemployment rate. Population is not a substitute. These source counts belong to an old benchmark vintage.
