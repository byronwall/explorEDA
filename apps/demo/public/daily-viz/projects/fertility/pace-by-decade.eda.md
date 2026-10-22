# Fertility fell fastest in the 1970s, at a tenth of a birth a year

**Which decade saw fertility fall fastest?** Each row is one of twelve countries in one complete decade, 1960s to 2000s, with the change in its total fertility rate from the decade's first year to its last and that change spread over the nine years between. The 1970s stand out: the fall in that decade was twice the 1960s pace and nearly five times the 2000s.

```eda
eda query=decades
country:cat=decades.country label="Country"
decade:cat=decades.decade label="Decade"
year:num=decades.year label="Decade start"
start:num=decades.start label="Start (births per woman)"
end:num=decades.end label="End (births per woman)"
change:num=decades.change label="Change (births per woman)"
annual_change:num=decades.annual_change label="Change per year (births per woman)"
calc direction = change > 0 ? "Rose" : "Fell"
```

## China's 1970s is the darkest cell

Each cell is one country's yearly pace through one decade: red for a fall, deeper red for a faster one, and blue where the rate rose. China's yearly change through the 1970s was -0.295 births per woman, the run-up to the one-child policy, and no other cell comes close. Mexico and Korea follow in the same column. The 1960s have both the pale cells of countries that had not started falling and Korea's early plunge.

```eda
heatmap @nb-fertility-pace-by-decade-chart-1 country columnField=decade aggregation=average measureField=annual_change sortBy=label title="Change in births per woman per year, by country and decade"
```

## The 1970s box sits lowest

Each box holds twelve countries' yearly pace in one decade. Across the twelve, the average pace was -0.104 births per woman a year in the 1970s. In the 1960s it was -0.050, and by the 2000s it was -0.022. Only the 1970s box lies entirely below zero: every country fell that decade.

```eda
boxplot @nb-fertility-pace-by-decade-chart-2 annual_change color=decade title="Yearly change in births per woman, twelve countries per decade" y.title="Change per year (births per woman)" {
  rule y=0 "No change"
}
```

## Eight country-decades went up, not down

Each bar counts the twelve countries in a decade by whether their rate rose or fell. 8 of the 60 country-decades rose. Nigeria's rate rose through the 1960s and 1970s, before anyone else's had finished falling. The other six are low-fertility countries drifting back up: Japan and the United States once each, and China, France, and Japan again in the 2000s.

```eda
bar @nb-fertility-pace-by-decade-chart-3 decade seriesField=direction seriesLayout=stacked color=direction title="Countries whose rate rose or fell, by decade" y.title="Countries"
```

## Takeaway

The great fertility decline was front-loaded: the 1970s did twice the work of the decade before and five times the work of the 2000s. By the 2000s most of the twelve were near two births per woman, and the rises there are the rebound of countries that had already fallen below replacement.

## Limits

A decade's pace is its last reading minus its first over nine elapsed years, so a reversal inside a decade is averaged away. The 2010s are left out because the export ends in 2011. Twelve countries, each counted once.
