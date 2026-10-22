# Anything that rose in the 1950s correlates with anything else that rose

**Does employment track output, or do both just track time?** Each row is one year from 1947 to 1962 in the Longley benchmark, with employment, nominal GNP, population, and the GNP price deflator. Every series rises. In levels they all correlate near 0.98. The honest test is the year-on-year changes, and there the link between employment and output survives, though weaker.

```eda
eda query=r
employment:num=r.employment label="Employed (thousands)"
gnp:num=r.gnp label="GNP ($M, nominal)"
deflator:num=r.deflator label="GNP deflator (1954 = 100)"
year:num=r.year label="Year"
employment_change:num=r.employment_change label="Change in employed (thousands)"
gnp_change:num=r.gnp_change label="Change in GNP ($M)"
employment_index:num=r.employment_index label="Employed (1947 = 100)"
gnp_index:num=r.gnp_index label="GNP (1947 = 100)"
population_index:num=r.population_index label="Population (1947 = 100)"
```

## Three series, three slopes, one direction

Indexed to 1947, nominal GNP reached 236.84 by 1962, population reached 120.88, and employment reached 116.96. The slopes differ by a factor of seven, but none of the three lines ever turns down for long, and that shared direction is all a levels correlation needs.

```eda
line @nb-longley-trending-levels-chart-1 x=year y=employment_index,gnp_index,population_index title="Employment, GNP, and population, indexed to 1947" x.title="Year" y.title="Index (1947 = 100)" {
  rule y=100 "1947 level"
}
```

## In levels, employment and GNP correlate at 0.98

Each point is one year. The points lie close to the fitted line: employment and nominal GNP in levels had correlation 0.984. The price level does almost as well: employment and the GNP deflator had correlation 0.971, and nobody argues that prices create jobs. Sixteen years of growth will line up almost anything.

```eda
scatter @nb-longley-trending-levels-chart-2 x=gnp y=employment regression=linear title="Employment against nominal GNP, one point per year" x.title="GNP ($M, nominal)" y.title="Employed (thousands)" {
  callout "1962" pick=max
}
```

## In changes, the link survives at 0.89

Take each year's change from the year before. The trend is gone, and what remains is whether a good year for output was a good year for jobs. It was: the annual changes had correlation 0.892. Employment fell in 4 of the fifteen years, and GNP fell in 2 of them, both years when employment also fell.

```eda
scatter @nb-longley-trending-levels-chart-3 x=gnp_change y=employment_change regression=linear title="Annual change in employment against annual change in GNP" x.title="Change in GNP ($M)" y.title="Change in employed (thousands)" {
  rule x=0
  rule y=0 "No change in either"
}
```

## Takeaway

Employment and output moved together in postwar America, and the changes say so at 0.89. The levels correlation of 0.98 says less than it looks: the deflator scores 0.97 by the same test. Difference first, then correlate.

## Limits

Sixteen annual rows, so the changes correlation rests on fifteen pairs. GNP is nominal, which folds inflation into the output series. The Longley data was built to stress regression software, not to describe the economy.
