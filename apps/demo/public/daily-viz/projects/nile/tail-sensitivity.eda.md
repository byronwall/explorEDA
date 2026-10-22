# Trim the Nile's extreme years and the average moves by 4, because the tails cancel

**How much do the wettest and driest years move the Nile's average?** Each row is one year of flow past Aswan, 1871 to 1970, in hundreds of millions of cubic metres. The question matters because the record holds both a 1,370 flood and a 456 drought. The answer is that each tail pulls the average about 30 its own way, and together they almost cancel: the century average is 919, and the average of the middle eighty percent of years is 915.

```eda
eda query=r
year:num=r.year label="Year"
volume:num=r.volume label="Annual flow (10⁸ m³)"
rank:num=r.rank label="Percentile rank"
tail:cat=r.tail label="Tail"
```

## The wet tail is nineteenth-century, the dry tail twentieth

The two dashed lines mark the cutoffs: the driest tenth of years sit below 725.2 and the wettest tenth above 1160.0. The wettest year on record was 1879, at 1370 (10⁸ m³), and the driest was 1913, at 456. Every year above the top line comes before 1900 except 1964; every year below the bottom line comes after.

```eda
line @nb-nile-tail-sensitivity-chart-1 x=year y=volume title="Annual Nile flow at Aswan, 1871–1970" x.title="Year" y.title="Annual flow (10⁸ m³)" {
  rule y=1160 "Wettest tenth above"
  rule y=725.2 "Driest tenth below"
  callout "1879: 1,370" on=r.id:nile-r-00009 offset=40,0
  callout "1913: 456" on=r.id:nile-r-00043 offset=50,-30
}
```

## Each tail pulls 30; together they pull 4

Three groups, one scale. The 9 wettest years averaged 1233.33 and the 10 driest 670.00, roughly 310 above and 250 below the century mean of 919.35. Drop only the wettest years and the average falls to 888.30; drop only the driest and it rises to 947.06. Drop both and it lands at 915.25, 4 below where it started.

```eda
boxplot @nb-nile-tail-sensitivity-chart-2 volume color=tail title="Annual flow by tail group" y.title="Annual flow (10⁸ m³)" {
  rule y=mean "Century mean"
}
```

## The tails are a timeline, not noise

Color the same years by group and the two tails separate in time. 8 of the 9 wettest years come before 1898, and 10 of the 10 driest come after. A trimmed mean treats these years as outliers; the calendar says they are the ends of a river that changed.

```eda
scatter @nb-nile-tail-sensitivity-chart-3 x=year y=volume color=tail title="Each year's flow, colored by tail group" x.title="Year" y.title="Annual flow (10⁸ m³)" {
  rule x=1898 "1898"
}
```

## The mean sits 26 above the median

Count the years by flow and the stack leans right: a long run of years between 700 and 950 and a stretched wet tail. The median year carried 893.5 against a mean of 919.35, so the wet tail does slightly more pulling than the dry one, even with 1913 in the record.

```eda
hist @nb-nile-tail-sensitivity-chart-4 volume bins=20 title="Years by annual flow" x.title="Annual flow (10⁸ m³)" y.title="Years" {
  rule x=919.35 "Mean, 919"
  rule x=893.5 "Median, 894"
}
```

## Takeaway

The Nile's average is robust to its extremes only because they are balanced: a wet tail before 1898 and a dry one after. Trimming both changes the century figure by 4, but it also throws away the years that carry the record's one real story, the drop at the turn of the century.

## Limits

Tail groups are the sample's own 10th and 90th percentiles, not flood or drought thresholds. Flow is measured at Aswan alone, and the century ends before the High Dam's reservoir changed what "flow past Aswan" means.
