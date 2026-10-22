# The median country went from six births to two in fifty years

**How much did each country's fertility fall between 1960 and 2011?** Each row is one of twelve countries with its total fertility rate at both ends of the period and the difference between them. Every one of the twelve fell. The size of the fall depended almost entirely on where a country started.

```eda
eda query=endpoints
country:cat=endpoints.country label="Country"
start:num=endpoints.start label="1960"
end:num=endpoints.end label="2011"
change:num=endpoints.change label="Change (births per woman)"
```

## Twelve lines, all sloping down

Each line joins a country's 1960 rate to its 2011 rate. The median country's rate was 6.01 births per woman in 1960. By 2011 it was 2.14. Nine lines start above five and plunge; the three that start low, in France, Japan, and the United States, barely tilt. One high line stays high: Nigeria's.

```eda
parallel @nb-fertility-matched-endpoints-chart-1 start,end color=country title="Births per woman in 1960 and 2011, one line per country" lineWidth=2 lineOpacity=0.85
```

## Korea fell by almost five births; Nigeria by a third of one

Each bar is a country's change over the period, with the mean marked. The average change was -2.97 births per woman. Korea's change was -4.91 births per woman, the largest fall of the twelve. Nigeria's was -0.34, the smallest.

```eda
group @nb-fertility-matched-endpoints-change sum(change) by=country
row @nb-fertility-matched-endpoints-chart-2 country group=nb-fertility-matched-endpoints-change title="Change in births per woman, 1960 to 2011" x.title="Change (births per woman)" topN=12 {
  rule x=-2.965 "Average change"
}
```

## The higher the start, the bigger the fall

Each dot is one country, placed by its 1960 rate and its change. The fitted line slopes down: the correlation between the 1960 rate and the change was -0.70. The nine countries that started above five births fell by an average of -3.60 births per woman. The three that started below four fell by -1.06. Nigeria sits alone at the top right, high start and no fall.

```eda
scatter @nb-fertility-matched-endpoints-chart-3 x=start y=change regression=linear title="Change against the 1960 rate" x.title="1960 rate (births per woman)" y.title="Change (births per woman)" {
  callout "Nigeria" pick=max
  callout "Korea" pick=min
}
```

## Takeaway

Where fertility was high in 1960 it fell far, and where it was already low it had little room to fall. The one country that broke the pattern, Nigeria, started high and stayed there, so the size of a fall says little about where a country ends up.

## Limits

Two readings per country: the route between them, including reversals, is invisible here. Twelve countries chosen for contrast, each weighted equally. The period ends in 2011 because later years are blank in this export.
